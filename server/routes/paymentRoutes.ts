import { Router, Request, Response } from 'express';
import { query, queryOne } from '../db/database.js';
import { requireAuth, requireRole, AuthenticatedRequest } from '../middleware/auth.js';
import { PaymentService } from '../services/paymentService.js';
import { AuditService } from '../services/auditService.js';

export const paymentRouter = Router();

/**
 * POST /api/payments/create-intent
 * Customer requests escrow payment intent for an existing booking.
 * Amount is calculated authoritatively on the server in integer paise and rupees.
 * Never trusts any amount supplied by the client.
 */
paymentRouter.post('/create-intent', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { bookingId, method = 'upi', idempotencyKey } = req.body;
    const headerIdempotencyKey = (req.headers['idempotency-key'] as string) || idempotencyKey;

    if (!bookingId) {
      res.status(400).json({
        success: false,
        error: { code: 'MISSING_BOOKING_ID', message: 'bookingId is required' },
      });
      return;
    }

    const result = await PaymentService.createIntent({
      bookingId,
      customerId: req.user!.id,
      userRole: req.user!.role,
      method,
      idempotencyKey: headerIdempotencyKey,
    });

    res.status(result.statusCode).json(result.data);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'INTENT_CREATION_FAILED', message: error.message },
    });
  }
});

/**
 * POST /api/payments/confirm
 * Confirms payment capture and advances booking to 'paid'.
 * Idempotent: repeated confirmation calls return the captured payment without duplicate records or duplicate rewards.
 */
paymentRouter.post('/confirm', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { paymentId, transactionRef, providerPaymentId, signature, idempotencyKey } = req.body;
    const headerIdempotencyKey = (req.headers['idempotency-key'] as string) || idempotencyKey;

    if (!paymentId || !transactionRef) {
      res.status(400).json({
        success: false,
        error: { code: 'MISSING_FIELDS', message: 'paymentId and transactionRef are required' },
      });
      return;
    }

    const result = await PaymentService.confirmPayment({
      paymentId,
      transactionRef,
      providerPaymentId,
      customerId: req.user!.id,
      userRole: req.user!.role,
      signature,
      idempotencyKey: headerIdempotencyKey,
    });

    res.status(result.statusCode).json(result.data);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'PAYMENT_CONFIRMATION_FAILED', message: error.message },
    });
  }
});

/**
 * POST /api/payments/fail
 * Explicitly records a payment failure (e.g. gateway failure or user cancellation).
 */
paymentRouter.post('/fail', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { paymentId, reason = 'Payment was declined or cancelled' } = req.body;

    if (!paymentId) {
      res.status(400).json({
        success: false,
        error: { code: 'MISSING_PAYMENT_ID', message: 'paymentId is required' },
      });
      return;
    }

    const result = await PaymentService.failPayment(paymentId, req.user!.id, req.user!.role, reason);
    res.status(result.statusCode).json(result.data);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'PAYMENT_FAILURE_HANDLING_FAILED', message: error.message },
    });
  }
});

/**
 * POST /api/payments/webhook
 * Provider-agnostic inbound webhook endpoint (designed for Razorpay, Cashfree, or simulation webhooks).
 * Validates HMAC signature, checks event deduplication, and securely transitions payment & booking states.
 */
paymentRouter.post('/webhook', async (req: Request, res: Response) => {
  try {
    const eventId = (req.headers['x-razorpay-event-id'] ||
      req.headers['x-webhook-event-id'] ||
      req.body?.event_id ||
      req.body?.id) as string;

    const signature = (req.headers['x-razorpay-signature'] ||
      req.headers['x-cashfree-signature'] ||
      req.headers['x-webhook-signature']) as string;

    const eventType = (req.body?.event || req.body?.event_type || 'payment.captured') as string;
    const provider = (req.headers['x-payment-provider'] || req.body?.provider || 'razorpay') as string;

    const rawBody = req.rawBody?.toString('utf8') || (typeof req.body === 'string' ? req.body : JSON.stringify(req.body));

    const result = await PaymentService.processWebhook({
      provider,
      eventId,
      eventType,
      payload: req.body,
      signature,
      rawBody,
    });

    res.status(result.statusCode).json(result.data);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'WEBHOOK_FAILED', message: error.message },
    });
  }
});

/**
 * POST /api/payments/refund
 * Authorizes a full or partial refund. Admin or Support role required.
 * Server validates refundable balance and prevents amount tampering.
 */
paymentRouter.post(
  '/refund',
  requireAuth,
  requireRole(['admin', 'support']),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { bookingId, paymentId, amount, reason = 'Customer refund authorized' } = req.body;

      if (!bookingId && !paymentId) {
        res.status(400).json({
          success: false,
          error: { code: 'MISSING_FIELDS', message: 'bookingId or paymentId is required' },
        });
        return;
      }

      const result = await PaymentService.processRefund({
        bookingId,
        paymentId,
        amountRupees: amount !== undefined ? Number(amount) : undefined,
        reason,
        initiatedByUserId: req.user!.id,
        userRole: req.user!.role,
      });

      res.status(result.statusCode).json(result.data);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: { code: 'REFUND_PROCESSING_FAILED', message: error.message },
      });
    }
  }
);

/**
 * GET /api/payments/:id
 * Fetches payment details and refund history (IDOR protected: owner or admin/support only).
 */
paymentRouter.get('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const payment = await queryOne<any>('SELECT * FROM payments WHERE id = ?', [req.params.id]);
  if (!payment) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Payment record not found' } });
    return;
  }

  if (payment.customer_id !== req.user!.id && req.user!.role !== 'admin' && req.user!.role !== 'support') {
    res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Unauthorized access to payment details' } });
    return;
  }

  const refunds = await query<any>('SELECT * FROM refunds WHERE payment_id = ? ORDER BY created_at DESC', [payment.id]);
  res.json({
    success: true,
    payment,
    refunds,
  });
});

/**
 * GET /api/payments/booking/:bookingId
 * Fetches all payment attempts and status for a specific booking.
 */
paymentRouter.get('/booking/:bookingId', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const booking = await queryOne<any>('SELECT * FROM bookings WHERE id = ?', [req.params.bookingId]);
  if (!booking) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Booking not found' } });
    return;
  }

  if (booking.customer_id !== req.user!.id && req.user!.role !== 'admin' && req.user!.role !== 'support') {
    res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Unauthorized access' } });
    return;
  }

  const payments = await query<any>('SELECT * FROM payments WHERE booking_id = ? ORDER BY created_at DESC', [req.params.bookingId]);
  const refunds = await query<any>('SELECT * FROM refunds WHERE booking_id = ? ORDER BY created_at DESC', [req.params.bookingId]);

  res.json({
    success: true,
    bookingId: req.params.bookingId,
    payments,
    refunds,
  });
});

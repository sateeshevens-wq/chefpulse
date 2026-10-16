import crypto from 'crypto';
import { query, queryOne, run } from '../db/database.js';
import { config } from '../config.js';
import { MoneyService } from './moneyService.js';
import { BookingStateMachine } from './bookingStateMachine.js';
import { AuditService } from './auditService.js';
import { RewardService } from './rewardService.js';
import { RazorpayProvider } from './paymentProviders/razorpayProvider.js';
import { config as appConfig } from '../config.js';
import {
  createPaymentIntentPostgres,
  confirmPaymentPostgres,
  failPaymentPostgres,
  prepareRefundPostgres,
  finalizeRefundPostgres,
  failRefundPostgres,
  claimWebhookEventPostgres,
  markWebhookEventPostgres,
} from '../db/postgres/repositories/paymentRepository.js';

export type PaymentStatus =
  | 'created'
  | 'pending'
  | 'authorized'
  | 'captured'
  | 'failed'
  | 'cancelled'
  | 'refunded'
  | 'partially_refunded';

export interface CreateIntentParams {
  bookingId: string;
  customerId: string;
  userRole: string;
  method?: string;
  idempotencyKey?: string;
}

export interface ConfirmPaymentParams {
  paymentId: string;
  transactionRef: string;
  customerId: string;
  userRole: string;
  providerPaymentId?: string;
  signature?: string;
  idempotencyKey?: string;
}

export interface RefundParams {
  bookingId?: string;
  paymentId?: string;
  amountRupees?: number;
  reason: string;
  initiatedByUserId: string;
  userRole: string;
}

export interface WebhookEventPayload {
  provider: 'razorpay' | 'cashfree' | 'simulation' | string;
  eventId: string;
  eventType: string;
  payload: any;
  signature?: string;
  rawBody?: string;
}

export class PaymentService {
  /**
   * Helper: Hash string or payload for idempotency verification.
   */
  private static hashPayload(payload: any): string {
    return crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
  }

  /**
   * Check idempotency cache.
   */
  private static async checkIdempotency(
    idempotencyKey: string | undefined,
    scope: string,
    userId: string,
    payload: any
  ): Promise<{ cached: boolean; statusCode?: number; response?: any }> {
    if (!idempotencyKey) return { cached: false };

    const record = await queryOne<any>(
      `SELECT * FROM payment_idempotency WHERE idempotency_key = ? AND scope = ? AND user_id = ?`,
      [idempotencyKey, scope, userId]
    );

    if (record) {
      const currentHash = this.hashPayload(payload);
      if (record.request_hash !== currentHash) {
        throw new Error('IDEMPOTENCY_KEY_REUSE_PAYLOAD_MISMATCH: The idempotency key was previously used with different parameters.');
      }
      return {
        cached: true,
        statusCode: record.status_code,
        response: typeof record.response_json === 'string' ? JSON.parse(record.response_json) : record.response_json,
      };
    }

    return { cached: false };
  }

  /**
   * Store idempotency record.
   */
  private static async saveIdempotency(
    idempotencyKey: string | undefined,
    scope: string,
    userId: string,
    payload: any,
    statusCode: number,
    response: any
  ): Promise<void> {
    if (!idempotencyKey) return;

    const id = `idem-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    const hash = this.hashPayload(payload);
    try {
      await run(
        `INSERT INTO payment_idempotency (id, idempotency_key, scope, user_id, request_hash, response_json, status_code, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
        [id, idempotencyKey, scope, userId, hash, JSON.stringify(response), statusCode]
      );
    } catch {
      // Ignore conflict if raced
    }
  }

  /**
   * Verify signature for webhook or direct callback.
   */
  public static verifySignature(rawBody: string, signature: string, secret = config.paymentWebhookSecret): boolean {
    if (!secret || !signature) return false;
    try {
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(rawBody)
        .digest('hex');
      return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
    } catch {
      return false;
    }
  }

  /**
   * 1. CREATE PAYMENT INTENT
   * Authoritatively computes payment amount from booking and creates server-controlled intent.
   */
  public static async createIntent(params: CreateIntentParams): Promise<{ statusCode: number; data: any }> {
    const { bookingId, customerId, userRole, method = 'upi', idempotencyKey } = params;

    // Check Idempotency
    const idemCheck = await this.checkIdempotency(idempotencyKey, 'create_intent', customerId, { bookingId, method });
    if (idemCheck.cached) {
      return { statusCode: idemCheck.statusCode!, data: idemCheck.response };
    }

    // Guard: Production must fail safely if no real provider is configured
    if (config.env === 'production' && !config.allowSimulation && config.paymentProvider === 'simulation') {
      throw new Error('PRODUCTION_GATEWAY_NOT_CONFIGURED: Production environment requires a live payment gateway (Razorpay/Cashfree). Simulation mode is disallowed.');
    }

    const booking = await queryOne<any>('SELECT * FROM bookings WHERE id = ?', [bookingId]);
    if (!booking) {
      const err = { code: 'NOT_FOUND', message: 'Booking not found.' };
      return { statusCode: 404, data: { success: false, error: err } };
    }

    // Ownership check (IDOR protection)
    if (booking.customer_id !== customerId && userRole !== 'admin') {
      const err = { code: 'FORBIDDEN', message: 'You do not own this booking.' };
      return { statusCode: 403, data: { success: false, error: err } };
    }

    // Booking must be in payable state
    if (booking.status !== 'requested' && booking.status !== 'pending_payment') {
      const err = {
        code: 'INVALID_STATE',
        message: `Cannot initiate payment for booking in '${booking.status}' status.`,
      };
      return { statusCode: 400, data: { success: false, error: err } };
    }

    // Calculate Authoritative Amount in Integer Minor Units (Paise)
    const amountRupees = booking.total_amount;
    const amountPaise = MoneyService.toPaise(amountRupees);

    if (appConfig.databaseDriver === 'postgres') {
      let providerOrderId: string | null = null;
      if (appConfig.paymentProvider === 'razorpay') {
        if (!RazorpayProvider.isConfigured()) throw new Error('RAZORPAY_NOT_CONFIGURED: Live payment is unavailable until Razorpay server credentials are configured.');
        const order = await RazorpayProvider.createOrder(amountPaise, `TXN-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`);
        providerOrderId = order.id;
      } else {
        providerOrderId = `order_${appConfig.paymentProvider}_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
      }
      const payment = await createPaymentIntentPostgres({
        bookingId, customerId, method: method as any, provider: appConfig.paymentProvider,
        providerOrderId, idempotencyKey,
      });
      const response = {
        success: true,
        payment: {
          id: payment.id, bookingId, amount: payment.amount, amountPaise: payment.amount_paise,
          currency: payment.currency, provider: payment.provider, providerOrderId: payment.provider_order_id,
          transactionRef: payment.transaction_ref,
          providerKeyId: appConfig.paymentProvider === 'razorpay' ? RazorpayProvider.getPublicKeyId() : undefined,
          status: payment.status, escrowStatus: payment.escrow_status,
        },
      };
      await this.saveIdempotency(idempotencyKey, 'create_intent', customerId, { bookingId, method }, 200, response);
      return { statusCode: 200, data: response };
    }

    // Check if an active/pending payment intent already exists for this booking
    let payment = await queryOne<any>(
      `SELECT * FROM payments WHERE booking_id = ? AND status IN ('created', 'pending') ORDER BY created_at DESC LIMIT 1`,
      [bookingId]
    );

    const paymentId = payment ? payment.id : `pay-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const transactionRef = payment ? payment.transaction_ref : `TXN-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    let providerOrderId = payment?.provider_order_id || null;

    if (!payment && config.paymentProvider === 'razorpay') {
      if (!RazorpayProvider.isConfigured()) {
        throw new Error('RAZORPAY_NOT_CONFIGURED: Live payment is unavailable until Razorpay server credentials are configured.');
      }
      const order = await RazorpayProvider.createOrder(amountPaise, transactionRef);
      providerOrderId = order.id;
    } else if (!payment) {
      providerOrderId = `order_${config.paymentProvider}_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    }

    if (!payment) {
      await run(
        `INSERT INTO payments (
          id, booking_id, customer_id, amount, amount_paise, currency, method, provider,
          provider_order_id, transaction_ref, status, escrow_status, idempotency_key, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, 'INR', ?, ?, ?, ?, 'pending', 'held', ?, datetime('now'), datetime('now'))`,
        [
          paymentId,
          bookingId,
          customerId,
          amountRupees,
          amountPaise,
          method,
          config.paymentProvider,
          providerOrderId,
          transactionRef,
          idempotencyKey || null,
        ]
      );
    }

    // Transition booking state to pending_payment if in requested
    if (booking.status === 'requested') {
      await BookingStateMachine.transition(bookingId, 'pending_payment', {
        id: customerId,
        role: userRole as any,
      });
    }

    await AuditService.log({
      eventType: 'payment_intent_created',
      userId: customerId,
      userRole,
      targetType: 'payment',
      targetId: paymentId,
      details: {
        bookingId,
        amountRupees,
        amountPaise,
        transactionRef,
        providerOrderId,
        provider: config.paymentProvider,
      },
    });

    const response = {
      success: true,
      payment: {
        id: paymentId,
        bookingId,
        amount: amountRupees,
        amountPaise,
        currency: 'INR',
        provider: config.paymentProvider,
        providerOrderId,
        transactionRef,
        providerKeyId: config.paymentProvider === 'razorpay' ? RazorpayProvider.getPublicKeyId() : undefined,
        status: 'pending',
        escrowStatus: 'held',
      },
    };

    await this.saveIdempotency(idempotencyKey, 'create_intent', customerId, { bookingId, method }, 200, response);
    return { statusCode: 200, data: response };
  }

  /**
   * 2. CONFIRM PAYMENT (Idempotent, Server-Authoritative)
   * Client or Webhook confirms payment capture.
   */
  public static async confirmPayment(params: ConfirmPaymentParams): Promise<{ statusCode: number; data: any }> {
    const { paymentId, transactionRef, customerId, userRole, signature, idempotencyKey, providerPaymentId } = params;

    // Check Idempotency Cache
    const idemCheck = await this.checkIdempotency(idempotencyKey, 'confirm_payment', customerId, { paymentId, transactionRef, providerPaymentId });
    if (idemCheck.cached) {
      return { statusCode: idemCheck.statusCode!, data: idemCheck.response };
    }

    await AuditService.log({
      eventType: 'payment_confirmation_attempted',
      userId: customerId,
      userRole,
      targetType: 'payment',
      targetId: paymentId,
      details: { transactionRef },
    });

    const payment = await queryOne<any>('SELECT * FROM payments WHERE id = ?', [paymentId]);
    if (!payment) {
      return {
        statusCode: 404,
        data: { success: false, error: { code: 'PAYMENT_NOT_FOUND', message: 'Payment record not found.' } },
      };
    }

    // Validate the server-issued local transaction reference when supplied.
    if (transactionRef && payment.transaction_ref !== transactionRef) {
      return {
        statusCode: 400,
        data: { success: false, error: { code: 'INVALID_TRANSACTION_REF', message: 'Transaction reference mismatch.' } },
      };
    }

    // Ownership / Authorization Check (IDOR protection)
    if (payment.customer_id !== customerId && userRole !== 'admin') {
      return {
        statusCode: 403,
        data: { success: false, error: { code: 'FORBIDDEN', message: 'Unauthorized payment confirmation.' } },
      };
    }

    // Live Razorpay checkout: verify the checkout signature against the trusted order id
    // stored in our database, then ask Razorpay for the payment status before capturing locally.
    if (config.paymentProvider === 'razorpay' && providerPaymentId && signature) {
      const providerOrderId = payment.provider_order_id;
      if (!providerOrderId || !RazorpayProvider.verifyCheckoutSignature(providerOrderId, providerPaymentId, signature)) {
        await AuditService.log({
          eventType: 'invalid_payment_signature',
          userId: customerId,
          userRole,
          targetType: 'payment',
          targetId: paymentId,
          details: { providerPaymentId, transactionRef },
        });

        await run(`UPDATE payments SET status = 'failed', failure_reason = 'Invalid signature', updated_at = datetime('now') WHERE id = ?`, [paymentId]);

        await AuditService.log({
          eventType: 'payment_failed',
          userId: customerId,
          userRole,
          targetType: 'payment',
          targetId: paymentId,
          details: { reason: 'Invalid provider signature' },
        });

        return {
          statusCode: 400,
          data: { success: false, error: { code: 'INVALID_SIGNATURE', message: 'Payment verification signature invalid.' } },
        };
      }
    }

    if (config.paymentProvider === 'razorpay') {
      if (!providerPaymentId) {
        return { statusCode: 400, data: { success: false, error: { code: 'PROVIDER_CONFIRMATION_REQUIRED', message: 'Live payment confirmation requires the Razorpay payment id.' } } };
      }
      if (userRole !== 'system') {
        if (!signature) {
          return { statusCode: 400, data: { success: false, error: { code: 'PROVIDER_SIGNATURE_REQUIRED', message: 'Razorpay payment signature is required.' } } };
        }
        if (!payment.provider_order_id || !RazorpayProvider.verifyCheckoutSignature(payment.provider_order_id, providerPaymentId, signature)) {
          return { statusCode: 400, data: { success: false, error: { code: 'INVALID_SIGNATURE', message: 'Payment verification signature invalid.' } } };
        }
      }
      const providerPayment = await RazorpayProvider.fetchPayment(providerPaymentId);
      if (providerPayment.order_id && payment.provider_order_id !== providerPayment.order_id) {
        return { statusCode: 400, data: { success: false, error: { code: 'PROVIDER_ORDER_MISMATCH', message: 'Payment does not belong to this ChefPulse order.' } } };
      }
      if (providerPayment.amount !== payment.amount_paise || providerPayment.currency !== 'INR') {
        return { statusCode: 400, data: { success: false, error: { code: 'PROVIDER_AMOUNT_MISMATCH', message: 'Provider payment amount does not match the server-authoritative booking amount.' } } };
      }
      if (providerPayment.status !== 'captured' && providerPayment.captured !== true) {
        return { statusCode: 400, data: { success: false, error: { code: 'PAYMENT_NOT_CAPTURED', message: `Razorpay payment is '${providerPayment.status}', not captured.` } } };
      }
    }

    if (appConfig.databaseDriver === 'postgres') {
      if (config.paymentProvider === 'razorpay' && !providerPaymentId) {
        return { statusCode: 400, data: { success: false, error: { code: 'PROVIDER_CONFIRMATION_REQUIRED', message: 'Live payment confirmation requires the Razorpay payment id.' } } };
      }

      const result = await confirmPaymentPostgres({
        paymentId, transactionRef, customerId, userRole,
        providerPaymentId: providerPaymentId || payment.provider_payment_id || transactionRef,
      });
      if (result.kind === 'not_found') return { statusCode: 404, data: { success: false, error: { code: 'PAYMENT_NOT_FOUND', message: 'Payment record not found.' } } };
      if (result.kind === 'forbidden') return { statusCode: 403, data: { success: false, error: { code: 'FORBIDDEN', message: 'Unauthorized payment confirmation.' } } };
      if (result.kind === 'invalid_ref') return { statusCode: 400, data: { success: false, error: { code: 'INVALID_TRANSACTION_REF', message: 'Transaction reference mismatch.' } } };
      if (result.kind === 'invalid_state') return { statusCode: 400, data: { success: false, error: { code: 'INVALID_PAYMENT_STATE', message: `Cannot confirm payment in '${payment.status}' state.` } } };

      const booking = await queryOne<any>('SELECT * FROM bookings WHERE id = ?', [payment.booking_id]);
      const isDuplicate = payment.status === 'captured';
      const response = { success: true, booking, paymentStatus: 'captured', isDuplicate };
      if (!isDuplicate) {
        try {
          await RewardService.creditPoints(payment.customer_id, 50, 'earn', `Booking #${booking?.booking_number || payment.booking_id} payment captured`, payment.booking_id);
        } catch (rewardErr: any) {
          console.warn('[PaymentService] Reward credit warning:', rewardErr.message);
        }
      }
      await this.saveIdempotency(idempotencyKey, 'confirm_payment', customerId, { paymentId, transactionRef, providerPaymentId }, 200, response);
      return { statusCode: 200, data: response };
    }

    // IDEMPOTENCY CHECK: If payment is ALREADY captured, do NOT re-execute rewards or re-transition booking!
    if (payment.status === 'captured') {
      await AuditService.log({
        eventType: 'duplicate_payment_event',
        userId: customerId,
        userRole,
        targetType: 'payment',
        targetId: paymentId,
        details: { message: 'Payment is already captured. Returning idempotent success.', transactionRef },
      });

      const currentBooking = await queryOne<any>('SELECT * FROM bookings WHERE id = ?', [payment.booking_id]);
      const duplicateResponse = {
        success: true,
        booking: currentBooking,
        paymentStatus: 'captured',
        isDuplicate: true,
      };

      await this.saveIdempotency(idempotencyKey, 'confirm_payment', customerId, { paymentId, transactionRef, providerPaymentId }, 200, duplicateResponse);
      return { statusCode: 200, data: duplicateResponse };
    }

    if (payment.status === 'failed' || payment.status === 'cancelled') {
      return {
        statusCode: 400,
        data: {
          success: false,
          error: { code: 'INVALID_PAYMENT_STATE', message: `Cannot confirm payment in '${payment.status}' state.` },
        },
      };
    }

    // ATOMIC PAYMENT CAPTURE
    await run(
      `UPDATE payments
       SET status = 'captured', escrow_status = 'held', provider_payment_id = ?, updated_at = datetime('now')
       WHERE id = ?`,
      [providerPaymentId || payment.provider_payment_id || null, paymentId]
    );

    // Advance Booking State Machine: pending_payment -> paid
    const transitionResult = await BookingStateMachine.transition(payment.booking_id, 'paid', {
      id: customerId,
      role: 'system', // Authorized system transition
    });

    // Award Rewards: Exactly ONCE upon legitimate payment confirmation
    // Reward rule: 50 points base per paid booking
    try {
      await RewardService.creditPoints(
        payment.customer_id,
        50,
        'earn',
        `Booking #${transitionResult.booking.booking_number} payment captured`,
        payment.booking_id
      );
    } catch (rewardErr: any) {
      console.warn('[PaymentService] Reward credit warning:', rewardErr.message);
    }

    await AuditService.log({
      eventType: 'payment_captured',
      userId: customerId,
      userRole,
      targetType: 'payment',
      targetId: paymentId,
      details: {
        bookingId: payment.booking_id,
        amount: payment.amount,
        amountPaise: payment.amount_paise,
        transactionRef,
      },
    });

    const response = {
      success: true,
      booking: transitionResult.booking,
      paymentStatus: 'captured',
    };

    await this.saveIdempotency(idempotencyKey, 'confirm_payment', customerId, { paymentId, transactionRef, providerPaymentId }, 200, response);
    return { statusCode: 200, data: response };
  }

  /**
   * 3. FAIL PAYMENT (Server-Authoritative Failure Handling)
   */
  public static async failPayment(
    paymentId: string,
    customerId: string,
    userRole: string,
    reason = 'Payment gateway transaction failure'
  ): Promise<{ statusCode: number; data: any }> {
    const payment = await queryOne<any>('SELECT * FROM payments WHERE id = ?', [paymentId]);
    if (!payment) {
      return {
        statusCode: 404,
        data: { success: false, error: { code: 'PAYMENT_NOT_FOUND', message: 'Payment record not found.' } },
      };
    }

    if (appConfig.databaseDriver === 'postgres') {
      if (payment.status === 'captured') {
        return { statusCode: 400, data: { success: false, error: { code: 'ALREADY_CAPTURED', message: 'Captured payments cannot be marked as failed.' } } };
      }
      const result = await failPaymentPostgres({ paymentId, customerId, userRole, reason });
      if (result.kind === 'forbidden') return { statusCode: 403, data: { success: false, error: { code: 'FORBIDDEN', message: 'Unauthorized access.' } } };
      await AuditService.log({ eventType: 'payment_failed', userId: customerId, userRole, targetType: 'payment', targetId: paymentId, details: { bookingId: payment.booking_id, reason } });
      return { statusCode: 200, data: { success: true, paymentId, status: 'failed', reason } };
    }

    if (payment.customer_id !== customerId && userRole !== 'admin') {
      return {
        statusCode: 403,
        data: { success: false, error: { code: 'FORBIDDEN', message: 'Unauthorized access.' } },
      };
    }

    if (payment.status === 'captured') {
      return {
        statusCode: 400,
        data: { success: false, error: { code: 'ALREADY_CAPTURED', message: 'Captured payments cannot be marked as failed.' } },
      };
    }

    await run(
      `UPDATE payments
       SET status = 'failed', failure_reason = ?, updated_at = datetime('now')
       WHERE id = ?`,
      [reason, paymentId]
    );

    await AuditService.log({
      eventType: 'payment_failed',
      userId: customerId,
      userRole,
      targetType: 'payment',
      targetId: paymentId,
      details: { bookingId: payment.booking_id, reason },
    });

    return {
      statusCode: 200,
      data: {
        success: true,
        paymentId,
        status: 'failed',
        reason,
      },
    };
  }

  /**
   * 4. PROCESS REFUND (Server-Authoritative, Admin/Support Only)
   */
  public static async processRefund(params: RefundParams): Promise<{ statusCode: number; data: any }> {
    const { bookingId, paymentId, amountRupees, reason, initiatedByUserId, userRole } = params;

    // Authorization Guard: Only Admin or Support can authorize refunds
    if (userRole !== 'admin' && userRole !== 'support') {
      return {
        statusCode: 403,
        data: { success: false, error: { code: 'FORBIDDEN', message: 'Only administrators or support specialists can authorize refunds.' } },
      };
    }

    if (appConfig.databaseDriver === 'postgres') {
      let targetPayment: any = null;
      if (paymentId) targetPayment = await queryOne<any>('SELECT * FROM payments WHERE id = ?', [paymentId]);
      else if (bookingId) targetPayment = await queryOne<any>(`SELECT * FROM payments WHERE booking_id = ? AND status IN ('captured','partially_refunded') ORDER BY created_at DESC LIMIT 1`, [bookingId]);
      if (!targetPayment) return { statusCode: 404, data: { success: false, error: { code: 'NO_CAPTURED_PAYMENT', message: 'No captured payment record found to refund.' } } };

      const paymentTotalPaise = Number(targetPayment.amount_paise || MoneyService.toPaise(targetPayment.amount));
      const requestedPaise = amountRupees !== undefined && amountRupees !== null ? MoneyService.toPaise(Number(amountRupees)) : paymentTotalPaise;
      if (requestedPaise <= 0) return { statusCode: 400, data: { success: false, error: { code: 'INVALID_AMOUNT', message: 'Refund amount must be strictly greater than 0.' } } };

      const prepared = await prepareRefundPostgres({ paymentId: targetPayment.id, bookingId: targetPayment.booking_id, amountPaise: requestedPaise, reason: reason || 'Customer refund requested', initiatedByUserId });
      if (prepared.kind === 'invalid_state') return { statusCode: 400, data: { success: false, error: { code: 'INVALID_PAYMENT_STATUS', message: `Cannot refund payment in '${targetPayment.status}' status.` } } };
      if (prepared.kind === 'already_refunded') return { statusCode: 400, data: { success: false, error: { code: 'ALREADY_FULLY_REFUNDED', message: 'This payment has already been completely refunded.' } } };
      if (prepared.kind === 'exceeds_balance') return { statusCode: 400, data: { success: false, error: { code: 'REFUND_AMOUNT_EXCEEDED', message: 'Refund amount exceeds the remaining refundable balance.' } } };
      if (!prepared.refund) throw new Error('REFUND_PREPARATION_FAILED');

      let providerRefundId = `pr_ref_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
      try {
        if (config.paymentProvider === 'razorpay') {
          const providerPaymentId = targetPayment.provider_payment_id || null;
          if (!providerPaymentId) throw new Error('RAZORPAY_PAYMENT_ID_MISSING: Cannot issue a live refund without the captured provider payment id.');
          const refund = await RazorpayProvider.refundPayment(providerPaymentId, requestedPaise, prepared.refund.refund_ref);
          providerRefundId = refund.id;
        }
        const finalized = await finalizeRefundPostgres({ refundId: prepared.refund.id, paymentId: targetPayment.id, providerRefundId });
        const full = finalized.payment.status === 'refunded';
        const response = { success: true, refund: { id: finalized.refund.id, refundRef: finalized.refund.refund_ref, providerRefundId, amount: Number(finalized.refund.amount), amountPaise: Number(finalized.refund.amount_paise), status: finalized.refund.status, isFullRefund: full } };
        await AuditService.log({ eventType: 'refund_completed', userId: initiatedByUserId, userRole, targetType: 'refund', targetId: finalized.refund.id, details: { paymentId: targetPayment.id, bookingId: targetPayment.booking_id, amountPaise: requestedPaise, providerRefundId } });
        return { statusCode: 200, data: response };
      } catch (providerError: any) {
        await failRefundPostgres(prepared.refund.id, providerError.message || 'Provider refund failed');
        throw providerError;
      }
    }

    let payment: any = null;
    if (paymentId) {
      payment = await queryOne<any>('SELECT * FROM payments WHERE id = ?', [paymentId]);
    } else if (bookingId) {
      payment = await queryOne<any>('SELECT * FROM payments WHERE booking_id = ? AND status = "captured" ORDER BY created_at DESC LIMIT 1', [bookingId]);
    }

    if (!payment) {
      return {
        statusCode: 404,
        data: { success: false, error: { code: 'NO_CAPTURED_PAYMENT', message: 'No captured payment record found to refund.' } },
      };
    }

    if (payment.status !== 'captured' && payment.status !== 'partially_refunded') {
      return {
        statusCode: 400,
        data: { success: false, error: { code: 'INVALID_PAYMENT_STATUS', message: `Cannot refund payment in '${payment.status}' status.` } },
      };
    }

    await AuditService.log({
      eventType: 'refund_requested',
      userId: initiatedByUserId,
      userRole,
      targetType: 'payment',
      targetId: payment.id,
      details: { bookingId: payment.booking_id, amountRupees, reason },
    });

    // Calculate already refunded amounts from previous refunds
    const existingRefunds = await query<any>('SELECT * FROM refunds WHERE payment_id = ? AND status = "processed"', [payment.id]);
    const alreadyRefundedPaise = existingRefunds.reduce((sum, r) => sum + (r.amount_paise || MoneyService.toPaise(r.amount)), 0);
    const paymentTotalPaise = payment.amount_paise || MoneyService.toPaise(payment.amount);
    const remainingRefundablePaise = paymentTotalPaise - alreadyRefundedPaise;

    if (remainingRefundablePaise <= 0) {
      await AuditService.log({
        eventType: 'refund_failed',
        userId: initiatedByUserId,
        userRole,
        targetType: 'payment',
        targetId: payment.id,
        details: { reason: 'Payment has already been fully refunded' },
      });
      return {
        statusCode: 400,
        data: { success: false, error: { code: 'ALREADY_FULLY_REFUNDED', message: 'This payment has already been completely refunded.' } },
      };
    }

    // Determine target refund amount
    let refundPaise: number;
    if (amountRupees !== undefined && amountRupees !== null) {
      if (amountRupees <= 0) {
        return {
          statusCode: 400,
          data: { success: false, error: { code: 'INVALID_AMOUNT', message: 'Refund amount must be strictly greater than 0.' } },
        };
      }
      refundPaise = MoneyService.toPaise(amountRupees);
    } else {
      refundPaise = remainingRefundablePaise;
    }

    // Tampering Guard: Requested refund cannot exceed remaining refundable amount!
    if (refundPaise > remainingRefundablePaise) {
      await AuditService.log({
        eventType: 'refund_failed',
        userId: initiatedByUserId,
        userRole,
        targetType: 'payment',
        targetId: payment.id,
        details: {
          reason: 'Refund amount exceeds remaining refundable balance',
          requestedPaise: refundPaise,
          remainingPaise: remainingRefundablePaise,
        },
      });
      return {
        statusCode: 400,
        data: {
          success: false,
          error: {
            code: 'REFUND_AMOUNT_EXCEEDED',
            message: `Refund amount of ₹${MoneyService.fromPaise(refundPaise)} exceeds refundable balance of ₹${MoneyService.fromPaise(remainingRefundablePaise)}.`,
          },
        },
      };
    }

    const actualRefundRupees = MoneyService.fromPaise(refundPaise);
    const refundId = `ref-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    const refundRef = `REF-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    let providerRefundId = `pr_ref_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;

    if (config.paymentProvider === 'razorpay') {
      if (!payment.transaction_ref || payment.transaction_ref.startsWith('TXN-')) {
        // Razorpay payment ids are kept separately in transaction_ref only after capture confirmation.
      }
      const providerPaymentId = payment.provider_payment_id || null;
      if (!providerPaymentId) {
        throw new Error('RAZORPAY_PAYMENT_ID_MISSING: Cannot issue a live refund without the captured provider payment id.');
      }
      const refund = await RazorpayProvider.refundPayment(providerPaymentId, refundPaise, refundRef);
      providerRefundId = refund.id;
    }

    // Record Refund
    await run(
      `INSERT INTO refunds (
        id, payment_id, booking_id, amount, amount_paise, reason, initiated_by_user_id, status, refund_ref, provider_refund_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'processed', ?, ?, datetime('now'), datetime('now'))`,
      [
        refundId,
        payment.id,
        payment.booking_id,
        actualRefundRupees,
        refundPaise,
        reason || 'Customer refund requested',
        initiatedByUserId,
        refundRef,
        providerRefundId,
      ]
    );

    // Update Payment Escrow Status and Status
    const newTotalRefundedPaise = alreadyRefundedPaise + refundPaise;
    const isFullRefund = newTotalRefundedPaise >= paymentTotalPaise;
    const nextPaymentStatus = isFullRefund ? 'refunded' : 'partially_refunded';
    const nextEscrowStatus = isFullRefund ? 'refunded_to_customer' : 'held';

    await run(
      `UPDATE payments
       SET status = ?, escrow_status = ?, updated_at = datetime('now')
       WHERE id = ?`,
      [nextPaymentStatus, nextEscrowStatus, payment.id]
    );

    // Update Booking State Machine: transition to 'refunded' if full refund
    if (isFullRefund) {
      try {
        await BookingStateMachine.transition(
          payment.booking_id,
          'refunded',
          { id: initiatedByUserId, role: userRole as any },
          { reason, payload: { refundRef } }
        );
      } catch (smErr: any) {
        console.warn('[PaymentService] State machine transition warning during refund:', smErr.message);
      }
    }

    await AuditService.log({
      eventType: 'refund_completed',
      userId: initiatedByUserId,
      userRole,
      targetType: 'refund',
      targetId: refundId,
      details: {
        paymentId: payment.id,
        bookingId: payment.booking_id,
        amountRupees: actualRefundRupees,
        amountPaise: refundPaise,
        isFullRefund,
        refundRef,
        providerRefundId,
      },
    });

    return {
      statusCode: 200,
      data: {
        success: true,
        refund: {
          id: refundId,
          refundRef,
          providerRefundId,
          amount: actualRefundRupees,
          amountPaise: refundPaise,
          status: 'processed',
          isFullRefund,
        },
      },
    };
  }

  /**
   * 5. PROVIDER-AGNOSTIC WEBHOOK HANDLER
   * Handles inbound events from Razorpay / Cashfree / Simulation.
   * Enforces signature verification, idempotency by eventId, and server-side state consistency.
   */
  public static async processWebhook(payload: WebhookEventPayload): Promise<{ statusCode: number; data: any }> {
    const { provider, eventId, eventType, payload: body, signature, rawBody } = payload;

    if (!eventId || !eventType) {
      return {
        statusCode: 400,
        data: { success: false, error: { code: 'MISSING_EVENT_METADATA', message: 'eventId and eventType are required.' } },
      };
    }

    // Signature verification (if webhook secret configured and signature supplied)
    if (config.paymentWebhookSecret && signature && rawBody) {
      const isValid = this.verifySignature(rawBody, signature, config.paymentWebhookSecret);
      if (!isValid) {
        await AuditService.log({
          eventType: 'invalid_payment_signature',
          userId: 'system',
          userRole: 'system',
          targetType: 'webhook',
          targetId: eventId,
          details: { provider, eventType },
        });

        return {
          statusCode: 401,
          data: { success: false, error: { code: 'INVALID_WEBHOOK_SIGNATURE', message: 'Webhook signature verification failed.' } },
        };
      }
    }

    if (appConfig.databaseDriver === 'postgres') {
      const claim = await claimWebhookEventPostgres({ provider, eventId, eventType, payload: body, signature });
      if (!claim.inserted) {
        return { statusCode: 200, data: { success: true, message: 'Duplicate webhook event ignored.', eventId, status: 'duplicate' } };
      }
      try {
        if (eventType === 'payment.captured' || eventType === 'order.paid') {
          const entity = body?.payload?.payment?.entity || body?.payload?.order?.entity || body;
          const orderId = entity?.order_id || entity?.provider_order_id || body?.order_id || body?.provider_order_id;
          const transactionRef = entity?.payment_id || entity?.transaction_ref || body?.payment_id;
          const providerPaymentId = entity?.id || body?.payment_id;
          const payment = await queryOne<any>(`SELECT * FROM payments WHERE provider_order_id = ? OR transaction_ref = ? OR id = ?`, [orderId, transactionRef, body?.payment_id]);
          if (payment) await this.confirmPayment({ paymentId: payment.id, transactionRef: payment.transaction_ref, providerPaymentId, customerId: payment.customer_id, userRole: 'system' });
        } else if (eventType === 'payment.failed') {
          const entity = body?.payload?.payment?.entity || body;
          const orderId = entity?.order_id || entity?.provider_order_id;
          const payment = await queryOne<any>(`SELECT * FROM payments WHERE provider_order_id = ? OR id = ?`, [orderId, body?.payment_id]);
          if (payment) await this.failPayment(payment.id, payment.customer_id, 'system', entity?.error_description || body?.error_description || 'Provider payment failure');
        }
        await markWebhookEventPostgres(claim.recordId, 'processed');
        return { statusCode: 200, data: { success: true, eventId, status: 'processed' } };
      } catch (err: any) {
        await markWebhookEventPostgres(claim.recordId, 'failed', err.message);
        return { statusCode: 500, data: { success: false, error: { code: 'WEBHOOK_PROCESSING_FAILED', message: err.message } } };
      }
    }

    // Deduplication check: Has this event already been received or processed?
    const existingEvent = await queryOne<any>('SELECT * FROM webhook_events WHERE provider_event_id = ?', [eventId]);
    if (existingEvent) {
      await AuditService.log({
        eventType: 'duplicate_payment_event',
        userId: 'system',
        userRole: 'system',
        targetType: 'webhook',
        targetId: eventId,
        details: { provider, eventType, originalProcessedAt: existingEvent.processed_at },
      });

      return {
        statusCode: 200,
        data: {
          success: true,
          message: 'Duplicate webhook event ignored. Event was previously processed.',
          eventId,
          status: 'duplicate',
        },
      };
    }

    // Record Event in Webhook Event Log
    const webhookRecordId = `wh-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    await run(
      `INSERT INTO webhook_events (
        id, provider, provider_event_id, event_type, payload_json, signature, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'received', datetime('now'))`,
      [
        webhookRecordId,
        provider,
        eventId,
        eventType,
        typeof body === 'string' ? body : JSON.stringify(body),
        signature || null,
      ]
    );

    try {
      // Process Event according to type
      if (eventType === 'payment.captured' || eventType === 'order.paid') {
        const entity = body?.payload?.payment?.entity || body?.payload?.order?.entity || body;
        const orderId = entity?.order_id || entity?.provider_order_id || body?.order_id || body?.provider_order_id;
        const transactionRef = entity?.payment_id || entity?.transaction_ref || body?.payment_id;
        const providerPaymentId = entity?.id || body?.payment_id;

        const payment = await queryOne<any>(
          `SELECT * FROM payments WHERE provider_order_id = ? OR transaction_ref = ? OR id = ?`,
          [orderId, transactionRef, body?.payment_id]
        );

        if (payment) {
          await this.confirmPayment({
            paymentId: payment.id,
            transactionRef: payment.transaction_ref,
            providerPaymentId,
            customerId: payment.customer_id,
            userRole: 'system',
          });
        }
      } else if (eventType === 'payment.failed') {
        const entity = body?.payload?.payment?.entity || body;
        const orderId = entity?.order_id || entity?.provider_order_id;
        const payment = await queryOne<any>(
          `SELECT * FROM payments WHERE provider_order_id = ? OR id = ?`,
          [orderId, body?.payment_id]
        );

        if (payment) {
          await this.failPayment(payment.id, payment.customer_id, 'system', entity?.error_description || body?.error_description || 'Provider payment failure');
        }
      }

      // Mark Event as processed
      await run(`UPDATE webhook_events SET status = 'processed', processed_at = datetime('now') WHERE id = ?`, [webhookRecordId]);

      return {
        statusCode: 200,
        data: { success: true, eventId, status: 'processed' },
      };
    } catch (err: any) {
      await run(`UPDATE webhook_events SET status = 'failed', error_message = ? WHERE id = ?`, [err.message, webhookRecordId]);
      return {
        statusCode: 500,
        data: { success: false, error: { code: 'WEBHOOK_PROCESSING_FAILED', message: err.message } },
      };
    }
  }
}

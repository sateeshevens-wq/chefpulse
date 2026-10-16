import crypto from 'crypto';
import { withPostgresTransaction, lockBookingAggregate } from '../transaction.js';

function id(prefix: string): string {
  return `${prefix}-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
}

function ref(prefix: string): string {
  return `${prefix}-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
}

export async function createPaymentIntentPostgres(params: {
  bookingId: string;
  customerId: string;
  method: 'upi' | 'card' | 'netbanking' | 'wallet';
  provider: string;
  providerOrderId: string | null;
  idempotencyKey?: string;
}): Promise<any> {
  return withPostgresTransaction(async (client) => {
    await lockBookingAggregate(client, params.bookingId);

    const bookingResult = await client.query(
      `SELECT * FROM bookings WHERE id = $1 FOR UPDATE`,
      [params.bookingId]
    );
    const booking = bookingResult.rows[0];
    if (!booking) throw new Error('BOOKING_NOT_FOUND');
    if (booking.customer_id !== params.customerId) throw new Error('FORBIDDEN');
    if (!['requested', 'pending_payment'].includes(booking.status)) throw new Error('BOOKING_NOT_PAYABLE');

    if (params.idempotencyKey) {
      const idem = await client.query(
        `SELECT * FROM payments WHERE customer_id=$1 AND idempotency_key=$2 LIMIT 1 FOR UPDATE`,
        [params.customerId, params.idempotencyKey]
      );
      if (idem.rowCount) return idem.rows[0];
    }

    const existing = await client.query(
      `SELECT * FROM payments WHERE booking_id = $1 AND status IN ('created','pending') ORDER BY created_at DESC LIMIT 1 FOR UPDATE`,
      [params.bookingId]
    );
    if (existing.rowCount) return existing.rows[0];

    const paymentId = id('pay');
    const transactionRef = ref('TXN');
    const result = await client.query(
      `INSERT INTO payments
       (id, booking_id, customer_id, amount_paise, currency, method, provider, provider_order_id,
        transaction_ref, status, escrow_status, idempotency_key)
       VALUES ($1,$2,$3,$4,'INR',$5,$6,$7,$8,'pending','held',$9)
       RETURNING *`,
      [paymentId, params.bookingId, params.customerId, booking.total_amount_paise, params.method,
       params.provider, params.providerOrderId, transactionRef, params.idempotencyKey ?? null]
    );

    if (booking.status === 'requested') {
      await client.query(
        `UPDATE bookings SET status='pending_payment', updated_at=NOW() WHERE id=$1`,
        [params.bookingId]
      );
      await client.query(
        `INSERT INTO booking_status_history
         (id, booking_id, from_status, to_status, changed_by_user_id, changed_by_role, reason)
         VALUES ($1,$2,'requested','pending_payment',$3,'system','Payment intent created')`,
        [id('hist'), params.bookingId, params.customerId]
      );
    }

    return result.rows[0];
  });
}

export async function confirmPaymentPostgres(params: {
  paymentId: string;
  transactionRef: string;
  customerId: string;
  userRole: string;
  providerPaymentId: string;
}): Promise<{ kind: 'ok' | 'not_found' | 'forbidden' | 'invalid_ref' | 'invalid_state'; payment?: any }> {
  return withPostgresTransaction(async (client) => {
    const paymentResult = await client.query(`SELECT * FROM payments WHERE id=$1 FOR UPDATE`, [params.paymentId]);
    const payment = paymentResult.rows[0];
    if (!payment) return { kind: 'not_found' };
    await lockBookingAggregate(client, payment.booking_id);

    const lockedPayment = (await client.query(`SELECT * FROM payments WHERE id=$1 FOR UPDATE`, [params.paymentId])).rows[0];
    if (lockedPayment.customer_id !== params.customerId && params.userRole !== 'admin' && params.userRole !== 'system') return { kind: 'forbidden' };
    if (lockedPayment.transaction_ref !== params.transactionRef) return { kind: 'invalid_ref' };

    if (lockedPayment.status === 'captured') return { kind: 'ok', payment: lockedPayment };
    if (!['pending', 'authorized', 'created'].includes(lockedPayment.status)) return { kind: 'invalid_state' };

    const updatedPayment = (await client.query(
      `UPDATE payments
       SET status='captured', provider_payment_id=$1, updated_at=NOW()
       WHERE id=$2
       RETURNING *`,
      [params.providerPaymentId, params.paymentId]
    )).rows[0];

    const booking = (await client.query(`SELECT * FROM bookings WHERE id=$1 FOR UPDATE`, [payment.booking_id])).rows[0];
    if (booking && booking.status === 'pending_payment') {
      await client.query(
        `UPDATE bookings SET status='paid', payment_status='paid', updated_at=NOW() WHERE id=$1`,
        [payment.booking_id]
      );
      await client.query(
        `INSERT INTO booking_status_history
         (id, booking_id, from_status, to_status, changed_by_user_id, changed_by_role, reason)
         VALUES ($1,$2,'pending_payment','paid',$3,$4,'Payment captured')`,
        [id('hist'), payment.booking_id, params.customerId, params.userRole]
      );
    }

    return { kind: 'ok', payment: updatedPayment };
  });
}

export async function failPaymentPostgres(params: {
  paymentId: string;
  customerId: string;
  userRole: string;
  reason: string;
}): Promise<{ kind: 'ok' | 'not_found' | 'forbidden'; payment?: any }> {
  return withPostgresTransaction(async (client) => {
    const result = await client.query(`SELECT * FROM payments WHERE id=$1 FOR UPDATE`, [params.paymentId]);
    const payment = result.rows[0];
    if (!payment) return { kind: 'not_found' };
    if (payment.customer_id !== params.customerId && params.userRole !== 'admin' && params.userRole !== 'system') return { kind: 'forbidden' };
    const updated = (await client.query(
      `UPDATE payments SET status='failed', failure_reason=$1, updated_at=NOW() WHERE id=$2 RETURNING *`,
      [params.reason, params.paymentId]
    )).rows[0];
    return { kind: 'ok', payment: updated };
  });
}

export async function prepareRefundPostgres(params: {
  paymentId: string;
  bookingId: string;
  amountPaise: number;
  reason: string;
  initiatedByUserId: string;
}): Promise<{ kind: 'ok' | 'not_found' | 'invalid_state' | 'already_refunded' | 'exceeds_balance'; refund?: any; payment?: any }> {
  return withPostgresTransaction(async (client) => {
    const payment = (await client.query(`SELECT * FROM payments WHERE id=$1 FOR UPDATE`, [params.paymentId])).rows[0];
    if (!payment) return { kind: 'not_found' };
    await lockBookingAggregate(client, payment.booking_id);
    const locked = (await client.query(`SELECT * FROM payments WHERE id=$1 FOR UPDATE`, [params.paymentId])).rows[0];
    if (!['captured','partially_refunded'].includes(locked.status)) return { kind: 'invalid_state' };

    const refunded = await client.query(
      `SELECT COALESCE(SUM(amount_paise),0)::BIGINT AS total FROM refunds WHERE payment_id=$1 AND status IN ('pending','processed')`,
      [params.paymentId]
    );
    const already = Number(refunded.rows[0]?.total || 0);
    const total = Number(locked.amount_paise);
    const remaining = total - already;
    if (remaining <= 0) return { kind: 'already_refunded' };
    if (params.amountPaise > remaining) return { kind: 'exceeds_balance' };

    const refund = (await client.query(
      `INSERT INTO refunds
       (id,payment_id,booking_id,amount,amount_paise,reason,initiated_by_user_id,status,refund_ref,created_at,updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'pending',$8,NOW(),NOW()) RETURNING *`,
      [id('ref'), params.paymentId, payment.booking_id, params.amountPaise / 100, params.amountPaise,
       params.reason, params.initiatedByUserId, ref('REF')]
    )).rows[0];
    return { kind: 'ok', refund, payment: locked };
  });
}

export async function finalizeRefundPostgres(params: {
  refundId: string;
  paymentId: string;
  providerRefundId: string;
}): Promise<any> {
  return withPostgresTransaction(async (client) => {
    const refund = (await client.query(`SELECT * FROM refunds WHERE id=$1 FOR UPDATE`, [params.refundId])).rows[0];
    if (!refund) throw new Error('REFUND_NOT_FOUND');
    await lockBookingAggregate(client, refund.booking_id);
    const payment = (await client.query(`SELECT * FROM payments WHERE id=$1 FOR UPDATE`, [params.paymentId])).rows[0];
    if (!payment) throw new Error('PAYMENT_NOT_FOUND');

    if (refund.status === 'processed') return { refund, payment };

    const updatedRefund = (await client.query(
      `UPDATE refunds SET status='processed', provider_refund_id=$1, updated_at=NOW() WHERE id=$2 RETURNING *`,
      [params.providerRefundId, params.refundId]
    )).rows[0];
    const totals = await client.query(
      `SELECT COALESCE(SUM(amount_paise),0)::BIGINT AS total FROM refunds WHERE payment_id=$1 AND status='processed'`,
      [params.paymentId]
    );
    const refunded = Number(totals.rows[0].total);
    const full = refunded >= Number(payment.amount_paise);
    const updatedPayment = (await client.query(
      `UPDATE payments SET status=$1, escrow_status=$2, updated_at=NOW() WHERE id=$3 RETURNING *`,
      [full ? 'refunded' : 'partially_refunded', full ? 'refunded_to_customer' : 'held', params.paymentId]
    )).rows[0];

    if (full) {
      const booking = (await client.query(`SELECT * FROM bookings WHERE id=$1 FOR UPDATE`, [refund.booking_id])).rows[0];
      if (booking && ['paid','accepted','cancelled','refund_pending'].includes(booking.status)) {
        await client.query(`UPDATE bookings SET status='refunded', payment_status='refunded', updated_at=NOW() WHERE id=$1`, [refund.booking_id]);
        await client.query(
          `INSERT INTO booking_status_history
           (id,booking_id,from_status,to_status,changed_by_user_id,changed_by_role,reason)
           VALUES ($1,$2,$3,'refunded',$4,'system','Refund completed')`,
          [id('hist'), refund.booking_id, booking.status, refund.initiated_by_user_id]
        );
      }
    }
    return { refund: updatedRefund, payment: updatedPayment };
  });
}

export async function failRefundPostgres(refundId: string, errorMessage: string): Promise<void> {
  return withPostgresTransaction(async (client) => {
    await client.query(`UPDATE refunds SET status='failed', reason=reason || ' | Provider error: ' || $1, updated_at=NOW() WHERE id=$2 AND status='pending'`, [errorMessage, refundId]);
  });
}

export async function claimWebhookEventPostgres(params: {
  provider: string;
  eventId: string;
  eventType: string;
  payload: unknown;
  signature?: string;
}): Promise<{ inserted: boolean; recordId: string }> {
  return withPostgresTransaction(async (client) => {
    const existing = await client.query(`SELECT id, status FROM webhook_events WHERE provider_event_id=$1 FOR UPDATE`, [params.eventId]);
    if (existing.rowCount) {
      const row = existing.rows[0];
      if (row.status === 'failed') {
        await client.query(
          `UPDATE webhook_events SET status='received', error_message=NULL, processed_at=NULL, payload_json=$1::jsonb, signature=$2 WHERE id=$3`,
          [JSON.stringify(params.payload), params.signature || null, row.id]
        );
        return { inserted: true, recordId: row.id };
      }
      return { inserted: false, recordId: row.id };
    }
    const recordId = id('wh');
    await client.query(
      `INSERT INTO webhook_events (id,provider,provider_event_id,event_type,payload_json,signature,status,created_at)
       VALUES ($1,$2,$3,$4,$5::jsonb,$6,'received',NOW())`,
      [recordId, params.provider, params.eventId, params.eventType, JSON.stringify(params.payload), params.signature || null]
    );
    return { inserted: true, recordId };
  });
}

export async function markWebhookEventPostgres(recordId: string, status: 'processed' | 'failed', errorMessage?: string): Promise<void> {
  return withPostgresTransaction(async (client) => {
    await client.query(
      `UPDATE webhook_events SET status=$1, processed_at=CASE WHEN $1='processed' THEN NOW() ELSE processed_at END, error_message=$2 WHERE id=$3`,
      [status, errorMessage || null, recordId]
    );
  });
}

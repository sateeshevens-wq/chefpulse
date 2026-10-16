import { withPostgresTransaction, lockBookingAggregate } from '../transaction.js';

export async function listPendingRefundsPostgres(limit = 100): Promise<any[]> {
  const result = await withPostgresTransaction(async (client) => {
    return client.query(
      `SELECT r.*, p.provider_payment_id, p.amount_paise AS payment_amount_paise
       FROM refunds r
       JOIN payments p ON p.id = r.payment_id
       WHERE r.status = 'pending'
       ORDER BY r.created_at ASC
       LIMIT $1`,
      [limit]
    );
  });
  return result.rows;
}

export async function reconcileRefundPostgres(params: { refundId: string; providerRefundId: string }): Promise<any> {
  return withPostgresTransaction(async (client) => {
    const refund = (await client.query(`SELECT * FROM refunds WHERE id=$1 FOR UPDATE`, [params.refundId])).rows[0];
    if (!refund) throw new Error('REFUND_NOT_FOUND');
    if (refund.status === 'processed') return refund;
    await lockBookingAggregate(client, refund.booking_id);
    const updated = (await client.query(
      `UPDATE refunds SET status='processed', provider_refund_id=$1, updated_at=NOW() WHERE id=$2 RETURNING *`,
      [params.providerRefundId, params.refundId]
    )).rows[0];
    const payment = (await client.query(`SELECT * FROM payments WHERE id=$1 FOR UPDATE`, [refund.payment_id])).rows[0];
    const totals = await client.query(`SELECT COALESCE(SUM(amount_paise),0)::BIGINT AS total FROM refunds WHERE payment_id=$1 AND status='processed'`, [refund.payment_id]);
    const full = Number(totals.rows[0].total) >= Number(payment.amount_paise);
    await client.query(`UPDATE payments SET status=$1, escrow_status=$2, updated_at=NOW() WHERE id=$3`, [full ? 'refunded' : 'partially_refunded', full ? 'refunded_to_customer' : 'held', refund.payment_id]);
    if (full) {
      const booking = (await client.query(`SELECT * FROM bookings WHERE id=$1 FOR UPDATE`, [refund.booking_id])).rows[0];
      if (booking && booking.status !== 'refunded') {
        await client.query(`UPDATE bookings SET status='refunded', payment_status='refunded', updated_at=NOW() WHERE id=$1`, [refund.booking_id]);
        await client.query(`INSERT INTO booking_status_history (id,booking_id,from_status,to_status,changed_by_user_id,changed_by_role,reason) VALUES ($1,$2,$3,'refunded',$4,'system','Refund reconciled from provider')`, [`hist-${Date.now()}-${Math.random().toString(16).slice(2)}`, refund.booking_id, booking.status, refund.initiated_by_user_id]);
      }
    }
    return updated;
  });
}

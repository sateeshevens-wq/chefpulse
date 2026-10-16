import crypto from 'crypto';
import pg from 'pg';
import { withPostgresTransaction, lockChefSchedule } from '../transaction.js';

export interface CreateBookingInput {
  bookingId: string;
  bookingNumber: string;
  type: 'sos_quick_fix' | 'scheduled_prep' | 'b2b_gig_shift';
  customerId: string;
  chefId: string;
  serviceAddress: string;
  area: string;
  lat: number;
  lng: number;
  scheduledTime: string;
  serviceDurationMinutes: number;
  guestCount: number;
  cuisines: unknown;
  dishesRequested: string;
  specialInstructions: string;
  subtotalPaise: number;
  surgeAmountPaise: number;
  platformFeePaise: number;
  gstAmountPaise: number;
  totalAmountPaise: number;
  etaMinutes: number;
  actorRole: string;
}

/**
 * PostgreSQL-only transactional booking creation.
 * The caller must already have authoritative pricing and authentication context.
 */
export async function createBookingPostgres(input: CreateBookingInput): Promise<any> {
  return withPostgresTransaction(async (client) => {
    await lockChefSchedule(client, input.chefId, input.scheduledTime);

    const chef = await client.query(
      `SELECT id FROM chef_profiles WHERE id = $1 FOR UPDATE`,
      [input.chefId]
    );
    if (chef.rowCount !== 1) throw new Error('CHEF_NOT_FOUND');

    const conflict = await client.query(
      `SELECT id FROM bookings
       WHERE chef_id = $1
         AND status NOT IN ('rejected','cancelled','refunded')
         AND scheduled_time < ($2::timestamptz + ($3::integer * INTERVAL '1 minute'))
         AND (scheduled_time + (service_duration_minutes * INTERVAL '1 minute')) > $2::timestamptz
       LIMIT 1
       FOR UPDATE`,
      [input.chefId, input.scheduledTime, input.serviceDurationMinutes]
    );
    if (conflict.rowCount) throw new Error('CHEF_SLOT_UNAVAILABLE');

    const otpCode = Math.floor(1000 + crypto.randomInt(9000)).toString();
    const insert = await client.query(
      `INSERT INTO bookings (
        id, booking_number, type, customer_id, chef_id, service_address, area,
        lat, lng, scheduled_time, service_duration_minutes, guest_count, cuisines, dishes_requested,
        special_instructions, subtotal_paise, surge_amount_paise, platform_fee_paise,
        gst_amount_paise, total_amount_paise, status, payment_status, otp_code, eta_minutes
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13::jsonb,$14,$15,$16,$17,$18,$19,$20,'requested','pending',$21,$22)
      RETURNING *`,
      [
        input.bookingId, input.bookingNumber, input.type, input.customerId, input.chefId,
        input.serviceAddress, input.area, input.lat, input.lng, input.scheduledTime,
        input.serviceDurationMinutes, input.guestCount, JSON.stringify(input.cuisines ?? []), input.dishesRequested,
        input.specialInstructions, input.subtotalPaise, input.surgeAmountPaise,
        input.platformFeePaise, input.gstAmountPaise, input.totalAmountPaise,
        otpCode, input.etaMinutes,
      ]
    );

    await client.query(
      `INSERT INTO booking_status_history
       (id, booking_id, from_status, to_status, changed_by_user_id, changed_by_role, reason)
       VALUES ($1,$2,NULL,'requested',$3,$4,'Customer initiated booking')`,
      [`hist-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`, input.bookingId, input.customerId, input.actorRole]
    );

    return insert.rows[0];
  });
}

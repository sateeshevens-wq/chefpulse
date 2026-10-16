import { queryOne, run } from '../db/database.js';
import { config } from '../config.js';
import { withPostgresTransaction, lockBookingAggregate } from '../db/postgres/transaction.js';
import { AuditService } from './auditService.js';
import crypto from 'crypto';

export type BookingStatus =
  | 'requested'
  | 'pending_payment'
  | 'paid'
  | 'accepted'
  | 'rejected'
  | 'chef_en_route'
  | 'chef_arrived'
  | 'otp_verified'
  | 'service_started'
  | 'completed'
  | 'cancelled'
  | 'refund_pending'
  | 'refunded'
  | 'disputed';

export interface TransitionRule {
  allowedRoles: ('customer' | 'chef' | 'admin' | 'support' | 'system')[];
  validate?: (booking: any, actor: { id: string; role: string; chefProfileId?: string }, payload?: any) => boolean;
}

// Matrix of allowed state transitions and their authorization rules
export const TRANSITION_MATRIX: Record<BookingStatus, Partial<Record<BookingStatus, TransitionRule>>> = {
  requested: {
    accepted: {
      allowedRoles: ['chef', 'admin'],
      validate: (booking, actor) => booking.type === 'sos_quick_fix' && (actor.role === 'admin' || booking.chef_id === actor.chefProfileId),
    },
    pending_payment: {
      allowedRoles: ['customer', 'admin', 'system'],
      validate: (booking, actor) => actor.role === 'admin' || booking.customer_id === actor.id,
    },
    cancelled: {
      allowedRoles: ['customer', 'admin'],
      validate: (booking, actor) => actor.role === 'admin' || booking.customer_id === actor.id,
    },
  },
  pending_payment: {
    paid: {
      // STRICT: Customer CANNOT directly mark as paid. Must go through verified payment route / system / admin!
      allowedRoles: ['system', 'admin'],
    },
    cancelled: {
      allowedRoles: ['customer', 'admin'],
      validate: (booking, actor) => actor.role === 'admin' || booking.customer_id === actor.id,
    },
  },
  paid: {
    accepted: {
      allowedRoles: ['chef', 'admin'],
      validate: (booking, actor) => actor.role === 'admin' || booking.chef_id === actor.chefProfileId,
    },
    rejected: {
      allowedRoles: ['chef', 'admin'],
      validate: (booking, actor) => actor.role === 'admin' || booking.chef_id === actor.chefProfileId,
    },
    cancelled: {
      allowedRoles: ['customer', 'admin'],
      validate: (booking, actor) => actor.role === 'admin' || booking.customer_id === actor.id,
    },
    disputed: {
      allowedRoles: ['customer', 'chef', 'admin', 'support'],
    },
    refund_pending: {
      allowedRoles: ['system', 'admin', 'support'],
    },
    refunded: {
      allowedRoles: ['system', 'admin', 'support'],
    },
  },
  accepted: {
    chef_en_route: {
      allowedRoles: ['chef', 'admin'],
      validate: (booking, actor) => actor.role === 'admin' || booking.chef_id === actor.chefProfileId,
    },
    cancelled: {
      allowedRoles: ['customer', 'admin'],
      validate: (booking, actor) => actor.role === 'admin' || booking.customer_id === actor.id,
    },
    disputed: {
      allowedRoles: ['customer', 'chef', 'admin', 'support'],
    },
    refund_pending: {
      allowedRoles: ['system', 'admin', 'support'],
    },
    refunded: {
      allowedRoles: ['system', 'admin', 'support'],
    },
  },
  rejected: {
    refund_pending: {
      allowedRoles: ['system', 'admin'],
    },
    refunded: {
      allowedRoles: ['system', 'admin'],
    },
  },
  chef_en_route: {
    chef_arrived: {
      allowedRoles: ['chef', 'admin'],
      validate: (booking, actor) => actor.role === 'admin' || booking.chef_id === actor.chefProfileId,
    },
    disputed: {
      allowedRoles: ['customer', 'chef', 'admin', 'support'],
    },
  },
  chef_arrived: {
    otp_verified: {
      allowedRoles: ['chef', 'admin'],
      validate: (booking, actor, payload) => {
        if (actor.role === 'admin') return true;
        if (booking.chef_id !== actor.chefProfileId) return false;
        // Verify OTP strictly server-side
        return payload?.otp && payload.otp.trim() === booking.otp_code;
      },
    },
    disputed: {
      allowedRoles: ['customer', 'chef', 'admin', 'support'],
    },
  },
  otp_verified: {
    service_started: {
      allowedRoles: ['chef', 'admin'],
      validate: (booking, actor) => actor.role === 'admin' || booking.chef_id === actor.chefProfileId,
    },
    disputed: {
      allowedRoles: ['customer', 'chef', 'admin', 'support'],
    },
  },
  service_started: {
    completed: {
      // Completed only by the assigned chef via slide-to-complete or admin
      allowedRoles: ['chef', 'admin'],
      validate: (booking, actor) => actor.role === 'admin' || booking.chef_id === actor.chefProfileId,
    },
    disputed: {
      allowedRoles: ['customer', 'chef', 'admin', 'support'],
    },
  },
  completed: {
    disputed: {
      allowedRoles: ['customer', 'admin', 'support'],
      validate: (booking, actor) => actor.role === 'admin' || actor.role === 'support' || booking.customer_id === actor.id,
    },
  },
  cancelled: {
    refund_pending: {
      allowedRoles: ['system', 'admin', 'support'],
    },
    refunded: {
      allowedRoles: ['system', 'admin', 'support'],
    },
  },
  disputed: {
    refund_pending: {
      allowedRoles: ['admin', 'support'],
    },
    refunded: {
      allowedRoles: ['admin', 'support'],
    },
    completed: {
      allowedRoles: ['admin', 'support'],
    },
    cancelled: {
      allowedRoles: ['admin', 'support'],
    },
  },
  refund_pending: {
    refunded: {
      allowedRoles: ['system', 'admin', 'support'],
    },
  },
  refunded: {},
};

export class BookingStateMachine {
  /**
   * Authoritatively transitions a booking status.
   * Validates state transition rules, actor ownership, and role authorization.
   */
  static async transition(
    bookingId: string,
    targetStatus: BookingStatus,
    actor: {
      id: string;
      role: 'customer' | 'chef' | 'admin' | 'support' | 'system';
      chefProfileId?: string;
    },
    options?: {
      reason?: string;
      payload?: any;
    }
  ): Promise<{ success: boolean; booking?: any; error?: string }> {
    if (config.databaseDriver === 'postgres') {
      const result = await withPostgresTransaction(async (client) => {
        await lockBookingAggregate(client, bookingId);
        const bookingResult = await client.query('SELECT * FROM bookings WHERE id = $1 FOR UPDATE', [bookingId]);
        const booking = bookingResult.rows[0];
        if (!booking) return { success: false, error: 'Booking not found' };
        const currentStatus = booking.status as BookingStatus;
        const allowedTransitions = TRANSITION_MATRIX[currentStatus];
        if (!allowedTransitions || !allowedTransitions[targetStatus]) return { success: false, error: `Illegal state transition from '${currentStatus}' to '${targetStatus}'.` };
        const rule = allowedTransitions[targetStatus]!;
        if (!rule.allowedRoles.includes(actor.role)) return { success: false, error: `Role '${actor.role}' is not authorized to transition booking from '${currentStatus}' to '${targetStatus}'.` };
        if (rule.validate && !rule.validate(booking, actor, options?.payload)) return { success: false, error: `Validation failed for transition to '${targetStatus}'. Check ownership or credentials.` };
        let paymentStatus = booking.payment_status;
        if (targetStatus === 'paid') paymentStatus = 'paid';
        else if (targetStatus === 'refunded') paymentStatus = 'refunded';
        else if (targetStatus === 'disputed') paymentStatus = 'disputed';
        await client.query(`UPDATE bookings SET status=$1, payment_status=$2, updated_at=NOW() WHERE id=$3`, [targetStatus, paymentStatus, bookingId]);
        await client.query(`INSERT INTO booking_status_history (id, booking_id, from_status, to_status, changed_by_user_id, changed_by_role, reason) VALUES ($1,$2,$3,$4,$5,$6,$7)`, [
          `hist-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`, bookingId, currentStatus, targetStatus, actor.id, actor.role, options?.reason || null
        ]);
        const updated = await client.query('SELECT * FROM bookings WHERE id=$1', [bookingId]);
        return { success: true, booking: updated.rows[0] };
      });
      if (result.success) {
        await AuditService.log({ eventType: 'booking_status_changed', userId: actor.id, userRole: actor.role, targetType: 'booking', targetId: bookingId, details: { fromStatus: result.booking?.status, toStatus: targetStatus, reason: options?.reason } });
      }
      return result;
    }

    const booking = await queryOne<any>('SELECT * FROM bookings WHERE id = ?', [bookingId]);
    if (!booking) {
      return { success: false, error: 'Booking not found' };
    }

    const currentStatus = booking.status as BookingStatus;

    // Check if transition is defined in matrix
    const allowedTransitions = TRANSITION_MATRIX[currentStatus];
    if (!allowedTransitions || !allowedTransitions[targetStatus]) {
      return {
        success: false,
        error: `Illegal state transition from '${currentStatus}' to '${targetStatus}'.`,
      };
    }

    const rule = allowedTransitions[targetStatus]!;

    // Check role authorization
    if (!rule.allowedRoles.includes(actor.role)) {
      return {
        success: false,
        error: `Role '${actor.role}' is not authorized to transition booking from '${currentStatus}' to '${targetStatus}'.`,
      };
    }

    // Check custom validation (e.g. ownership, OTP matching)
    if (rule.validate && !rule.validate(booking, actor, options?.payload)) {
      return {
        success: false,
        error: `Validation failed for transition to '${targetStatus}'. Check ownership or credentials.`,
      };
    }

    // If transitioning to paid, update payment_status
    let paymentStatus = booking.payment_status;
    if (targetStatus === 'paid') {
      paymentStatus = 'paid';
    } else if (targetStatus === 'refunded') {
      paymentStatus = 'refunded';
    } else if (targetStatus === 'disputed') {
      paymentStatus = 'disputed';
    }

    // Execute state update
    await run(
      `UPDATE bookings
       SET status = ?, payment_status = ?, updated_at = datetime('now')
       WHERE id = ?`,
      [targetStatus, paymentStatus, bookingId]
    );

    // Record in booking status history
    const historyId = `hist-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    await run(
      `INSERT INTO booking_status_history (id, booking_id, from_status, to_status, changed_by_user_id, changed_by_role, reason, timestamp)
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      [
        historyId,
        bookingId,
        currentStatus,
        targetStatus,
        actor.id,
        actor.role,
        options?.reason || null,
      ]
    );

    // Log to immutable audit log
    await AuditService.log({
      eventType: 'booking_status_changed',
      userId: actor.id,
      userRole: actor.role,
      targetType: 'booking',
      targetId: bookingId,
      details: {
        fromStatus: currentStatus,
        toStatus: targetStatus,
        reason: options?.reason,
      },
    });

    const updatedBooking = await queryOne<any>('SELECT * FROM bookings WHERE id = ?', [bookingId]);
    return { success: true, booking: updatedBooking };
  }
}

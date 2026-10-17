import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { queryOne } from '../db/database.js';
import { AuditService } from '../services/auditService.js';
import { connectCustomerAndChef } from '../services/exotelService.js';

export const communicationRouter = Router();

/**
 * POST /api/communications/bookings/:id/call
 * Securely bridges the booking's customer and chef through Exotel.
 * Phone numbers and Exotel credentials never reach the mobile client.
 */
communicationRouter.post('/bookings/:id/call', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const bookingId = String(req.params.id || '');
    const booking = await queryOne<any>(
      `SELECT b.id, b.booking_number, b.customer_id, cp.user_id AS chef_user_id,
              customer.phone AS customer_phone, chef.phone AS chef_phone
       FROM bookings b
       JOIN users customer ON customer.id = b.customer_id
       JOIN chef_profiles cp ON cp.id = b.chef_id
       JOIN users chef ON chef.id = cp.user_id
       WHERE b.id = ?`,
      [bookingId]
    );

    if (!booking) {
      res.status(404).json({ success: false, error: { code: 'BOOKING_NOT_FOUND', message: 'Booking not found.' } });
      return;
    }

    const isParticipant = req.user!.id === booking.customer_id || req.user!.id === booking.chef_user_id;
    const isStaff = req.user!.role === 'admin' || req.user!.role === 'support';
    if (!isParticipant && !isStaff) {
      await AuditService.log({
        eventType: 'idor_access_attempt',
        userId: req.user!.id,
        userRole: req.user!.role,
        targetType: 'booking_call',
        targetId: bookingId,
        details: { bookingId },
      });
      res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'You are not a participant in this booking.' } });
      return;
    }

    if (!booking.customer_phone || !booking.chef_phone) {
      res.status(409).json({ success: false, error: { code: 'PHONE_UNAVAILABLE', message: 'A participant phone number is unavailable for this booking.' } });
      return;
    }

    const call = await connectCustomerAndChef(
      String(booking.customer_phone),
      String(booking.chef_phone),
      `booking:${booking.booking_number || booking.id}`
    );

    await AuditService.log({
      eventType: 'booking_call_requested',
      userId: req.user!.id,
      userRole: req.user!.role,
      targetType: 'booking',
      targetId: bookingId,
      details: { bookingNumber: booking.booking_number, exotelCallSid: call.sid },
    });

    res.status(202).json({ success: true, call: { sid: call.sid, status: call.status || 'in-progress' } });
  } catch (error: any) {
    res.status(502).json({ success: false, error: { code: 'CALL_FAILED', message: error?.message || 'Unable to start the call.' } });
  }
});

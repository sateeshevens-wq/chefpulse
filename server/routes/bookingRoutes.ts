import { Router, Response } from 'express';
import crypto from 'crypto';
import { query, queryOne, run } from '../db/database.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { bookingRateLimiter } from '../middleware/rateLimiter.js';
import { PricingService, SurgeType } from '../services/pricingService.js';
import { BookingStateMachine, BookingStatus } from '../services/bookingStateMachine.js';
import { AuditService } from '../services/auditService.js';
import { config } from '../config.js';
import { createBookingPostgres } from '../db/postgres/repositories/bookingRepository.js';
import { MoneyService } from '../services/moneyService.js';

export const bookingRouter = Router();

bookingRouter.use(bookingRateLimiter);

/**
 * POST /api/bookings
 * Creates a new booking.
 * Enforces server-side price calculation and ownership.
 */
bookingRouter.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      chefId,
      type = 'sos_quick_fix',
      scheduledTime = 'Immediate',
      dishesRequested,
      specialInstructions,
      serviceAddress,
      area,
      lat,
      lng,
      surgeCondition = 'normal',
      guestCount = 2,
    } = req.body;

    if (!chefId || !dishesRequested) {
      res.status(400).json({
        success: false,
        error: { code: 'MISSING_FIELDS', message: 'chefId and dishesRequested are required.' },
      });
      return;
    }

    // 1. Fetch Chef from Database
    const chef = await queryOne<any>(
      `SELECT cp.*, u.name as chef_name, u.avatar as chef_avatar
       FROM chef_profiles cp
       JOIN users u ON cp.user_id = u.id
       WHERE cp.id = ?`,
      [chefId]
    );

    if (!chef) {
      res.status(404).json({
        success: false,
        error: { code: 'CHEF_NOT_FOUND', message: 'Selected chef does not exist.' },
      });
      return;
    }

    // SOS requests require a chef who is genuinely online and available.
    // Scheduled prep may be accepted by an offline chef only if the requested slot is free.
    if (type === 'sos_quick_fix' && (!chef.is_online || chef.status !== 'available')) {
      res.status(409).json({
        success: false,
        error: { code: 'CHEF_UNAVAILABLE', message: 'This chef is no longer available for an immediate booking. Please choose another available chef.' },
      });
      return;
    }

    // 2. Authoritative Price Calculation - NEVER trust client price
    const pricing = PricingService.calculateBookingPrice(
      {
        sos_rate: chef.sos_rate,
        day_prep_rate: chef.day_prep_rate,
        shift_rate: chef.shift_rate,
      },
      type,
      surgeCondition as SurgeType
    );

    // PostgreSQL path: booking creation is performed inside a transaction with a chef-schedule lock.
    if (config.databaseDriver === 'postgres') {
      const effectiveScheduledTime = scheduledTime === 'Immediate' ? new Date().toISOString() : new Date(scheduledTime).toISOString();
      const serviceDurationMinutes = type === 'sos_quick_fix' ? 60 : type === 'scheduled_prep' ? 240 : 480;
      const postgresBooking = await createBookingPostgres({
        bookingId: `book-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
        bookingNumber: `BK-${Date.now().toString().slice(-6)}`,
        type,
        customerId: req.user!.id,
        chefId,
        serviceAddress: serviceAddress || 'Customer Address',
        area: area || 'Bengaluru Central',
        lat: lat || 12.9716,
        lng: lng || 77.5946,
        scheduledTime: effectiveScheduledTime,
        serviceDurationMinutes,
        guestCount,
        cuisines: chef.specialties,
        dishesRequested,
        specialInstructions: specialInstructions || '',
        subtotalPaise: MoneyService.toPaise(pricing.subtotal),
        surgeAmountPaise: MoneyService.toPaise(pricing.surgeAmount),
        platformFeePaise: MoneyService.toPaise(pricing.platformFee),
        gstAmountPaise: MoneyService.toPaise(pricing.gstAmount),
        totalAmountPaise: MoneyService.toPaise(pricing.totalAmount),
        etaMinutes: Math.round((chef.distance_km || 1.5) * 7 + 6),
        actorRole: req.user!.role,
      });
      await AuditService.log({
        eventType: 'booking_created', userId: req.user!.id, userRole: req.user!.role,
        targetType: 'booking', targetId: postgresBooking.id,
        details: { bookingNumber: postgresBooking.booking_number, chefId, type, totalAmount: pricing.totalAmount },
      });
      res.status(201).json({ success: true, booking: postgresBooking });
      return;
    }

    // 3. Generate Cryptographic Arrival OTP
    const otpCode = Math.floor(1000 + crypto.randomInt(9000)).toString();

    // 4. Create Booking in Persistent Database
    const bookingId = `book-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    const bookingNumber = `BK-${Date.now().toString().slice(-6)}`;
    const customerId = req.user!.id;

    await run(
      `INSERT INTO bookings (
        id, booking_number, type, customer_id, chef_id, service_address, area,
        lat, lng, scheduled_time, guest_count, cuisines, dishes_requested,
        special_instructions, subtotal, surge_amount, platform_fee, gst_amount,
        total_amount, status, payment_status, otp_code, eta_minutes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'requested', 'pending', ?, ?, datetime('now'), datetime('now'))`,
      [
        bookingId,
        bookingNumber,
        type,
        customerId,
        chefId,
        serviceAddress || 'Customer Address',
        area || 'Bengaluru Central',
        lat || 12.9716,
        lng || 77.5946,
        scheduledTime,
        guestCount,
        chef.specialties,
        dishesRequested,
        specialInstructions || '',
        pricing.subtotal,
        pricing.surgeAmount,
        pricing.platformFee,
        pricing.gstAmount,
        pricing.totalAmount,
        otpCode,
        Math.round((chef.distance_km || 1.5) * 7 + 6),
      ]
    );

    // 5. Initial Status History Entry
    const historyId = `hist-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    await run(
      `INSERT INTO booking_status_history (id, booking_id, from_status, to_status, changed_by_user_id, changed_by_role, reason, timestamp)
       VALUES (?, ?, NULL, 'requested', ?, ?, 'Customer initiated booking', datetime('now'))`,
      [historyId, bookingId, customerId, req.user!.role]
    );

    // 6. Audit Log
    await AuditService.log({
      eventType: 'booking_created',
      userId: customerId,
      userRole: req.user!.role,
      targetType: 'booking',
      targetId: bookingId,
      details: {
        bookingNumber,
        chefId,
        type,
        totalAmount: pricing.totalAmount,
        subtotal: pricing.subtotal,
      },
    });

    const newBooking = await queryOne('SELECT * FROM bookings WHERE id = ?', [bookingId]);
    res.status(201).json({ success: true, booking: newBooking });
  } catch (error: any) {
    const message = String(error?.message || '');
    if (message === 'CHEF_SLOT_UNAVAILABLE') {
      res.status(409).json({
        success: false,
        error: { code: 'CHEF_SLOT_UNAVAILABLE', message: 'That chef is already booked for part of this time window. Please choose another slot or chef.' },
      });
      return;
    }
    if (message === 'CHEF_NOT_FOUND') {
      res.status(404).json({
        success: false,
        error: { code: 'CHEF_NOT_FOUND', message: 'Selected chef does not exist.' },
      });
      return;
    }
    res.status(500).json({
      success: false,
      error: { code: 'BOOKING_CREATION_FAILED', message: 'We could not create the booking. Please try again.' },
    });
  }
});

/**
 * GET /api/bookings
 * Lists bookings authorized for the caller.
 */
bookingRouter.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  let bookings: any[] = [];

  if (user.role === 'customer') {
    bookings = await query(
      `SELECT b.*, u.name as chef_name, u.avatar as chef_avatar, u.phone as chef_phone
       FROM bookings b
       JOIN chef_profiles cp ON b.chef_id = cp.id
       JOIN users u ON cp.user_id = u.id
       WHERE b.customer_id = ?
       ORDER BY b.created_at DESC`,
      [user.id]
    );
  } else if (user.role === 'chef') {
    const chefProfile = await queryOne<any>('SELECT id FROM chef_profiles WHERE user_id = ?', [user.id]);
    if (chefProfile) {
      bookings = await query(
        `SELECT b.*, u.name as customer_name, u.phone as customer_phone
         FROM bookings b
         JOIN users u ON b.customer_id = u.id
         WHERE b.chef_id = ?
         ORDER BY b.created_at DESC`,
        [chefProfile.id]
      );
    }
  } else if (user.role === 'admin' || user.role === 'support') {
    bookings = await query('SELECT * FROM bookings ORDER BY created_at DESC LIMIT 100');
  }

  res.json({ success: true, bookings });
});

/**
 * GET /api/bookings/:id
 * IDOR Protected: Only the booking's customer, assigned chef, or admin/support may view.
 */
bookingRouter.get('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const bookingId = req.params.id;
  const booking = await queryOne<any>('SELECT * FROM bookings WHERE id = ?', [bookingId]);

  if (!booking) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Booking not found' } });
    return;
  }

  const user = req.user!;
  const isCustomer = user.role === 'customer' && booking.customer_id === user.id;

  let isChef = false;
  if (user.role === 'chef') {
    const chefProfile = await queryOne<any>('SELECT id FROM chef_profiles WHERE user_id = ?', [user.id]);
    isChef = Boolean(chefProfile && booking.chef_id === chefProfile.id);
  }

  const isStaff = user.role === 'admin' || user.role === 'support';

  // Strict IDOR Protection
  if (!isCustomer && !isChef && !isStaff) {
    await AuditService.log({
      eventType: 'idor_access_attempt',
      userId: user.id,
      userRole: user.role,
      targetType: 'booking',
      targetId: bookingId,
      details: { attemptedBy: user.id, ownerCustomer: booking.customer_id },
    });

    res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'Unauthorized. You do not own or manage this booking.' },
    });
    return;
  }

  const history = await query(
    'SELECT * FROM booking_status_history WHERE booking_id = ? ORDER BY timestamp ASC',
    [bookingId]
  );

  res.json({ success: true, booking, history });
});

/**
 * POST /api/bookings/:id/status
 * State Machine Transition Endpoint.
 * Validates transition legality, ownership, and role authorization.
 */
bookingRouter.post('/:id/status', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const bookingId = req.params.id;
  const { targetStatus, reason, payload } = req.body;

  if (!targetStatus) {
    res.status(400).json({ success: false, error: { code: 'MISSING_STATUS', message: 'targetStatus required' } });
    return;
  }

  let chefProfileId: string | undefined;
  if (req.user!.role === 'chef') {
    const profile = await queryOne<any>('SELECT id FROM chef_profiles WHERE user_id = ?', [req.user!.id]);
    chefProfileId = profile?.id;
  }

  const result = await BookingStateMachine.transition(
    bookingId,
    targetStatus as BookingStatus,
    {
      id: req.user!.id,
      role: req.user!.role,
      chefProfileId,
    },
    { reason, payload }
  );

  if (!result.success) {
    res.status(400).json({
      success: false,
      error: { code: 'INVALID_TRANSITION', message: result.error },
    });
    return;
  }

  res.json({ success: true, booking: result.booking });
});

/**
 * POST /api/bookings/:id/verify-otp
 * Chef verifies the customer's 4-digit arrival OTP on doorstep.
 */
bookingRouter.post('/:id/verify-otp', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const bookingId = req.params.id;
  const { otp } = req.body;

  if (!otp) {
    res.status(400).json({ success: false, error: { code: 'MISSING_OTP', message: '4-digit OTP is required.' } });
    return;
  }

  let chefProfileId: string | undefined;
  if (req.user!.role === 'chef') {
    const profile = await queryOne<any>('SELECT id FROM chef_profiles WHERE user_id = ?', [req.user!.id]);
    chefProfileId = profile?.id;
  }

  const result = await BookingStateMachine.transition(
    bookingId,
    'otp_verified',
    {
      id: req.user!.id,
      role: req.user!.role,
      chefProfileId,
    },
    { payload: { otp } }
  );

  if (!result.success) {
    res.status(400).json({
      success: false,
      error: { code: 'OTP_VERIFICATION_FAILED', message: result.error || 'Incorrect OTP code.' },
    });
    return;
  }

  res.json({ success: true, booking: result.booking });
});

/**
 * POST /api/bookings/:id/cancel
 * Cancels booking.
 */
bookingRouter.post('/:id/cancel', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const bookingId = req.params.id;
  const { reason = 'Cancelled by customer' } = req.body;

  const result = await BookingStateMachine.transition(
    bookingId,
    'cancelled',
    {
      id: req.user!.id,
      role: req.user!.role,
    },
    { reason }
  );

  if (!result.success) {
    res.status(400).json({ success: false, error: { code: 'CANCEL_FAILED', message: result.error } });
    return;
  }

  res.json({ success: true, booking: result.booking });
});

/**
 * POST /api/bookings/:id/dispute
 * Raises dispute or SOS on a booking.
 */
bookingRouter.post('/:id/dispute', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const bookingId = req.params.id;
  const { reason = 'Dispute raised by customer/chef' } = req.body;

  const result = await BookingStateMachine.transition(
    bookingId,
    'disputed',
    {
      id: req.user!.id,
      role: req.user!.role,
    },
    { reason }
  );

  if (!result.success) {
    res.status(400).json({ success: false, error: { code: 'DISPUTE_FAILED', message: result.error } });
    return;
  }

  await AuditService.log({
    eventType: 'sos_event',
    userId: req.user!.id,
    userRole: req.user!.role,
    targetType: 'booking',
    targetId: bookingId,
    details: { reason },
  });

  res.json({ success: true, booking: result.booking });
});

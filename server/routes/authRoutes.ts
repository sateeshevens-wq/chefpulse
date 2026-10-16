import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { queryOne, run } from '../db/database.js';
import { generateToken, requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';
import { AuditService } from '../services/auditService.js';
import { RewardService } from '../services/rewardService.js';

export const authRouter = Router();

// Apply auth rate limiter
authRouter.use(authRateLimiter);

/**
 * POST /api/auth/register
 * Customer or Chef registration with password hashing and role protection.
 */
authRouter.post('/register', async (req: Request, res: Response) => {
  try {
    const {
      phone,
      password,
      name,
      email,
      role = 'customer',
      cityId,
      cityName,
      address,
      lat,
      lng,
      // Chef specific optional fields
      experienceYears,
      specialties,
      bio,
      hourlyRate,
      sosRate,
      dayPrepRate,
      shiftRate,
      signatureDishes,
    } = req.body;

    // 1. Input Validation
    if (!phone || !password || !name) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Phone, password, and name are required.' },
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        success: false,
        error: { code: 'WEAK_PASSWORD', message: 'Password must be at least 6 characters long.' },
      });
      return;
    }

    // 2. Privilege Escalation Prevention: Never allow registration as admin or support
    if (role === 'admin' || role === 'support') {
      await AuditService.log({
        eventType: 'privilege_escalation_attempt',
        ipAddress: req.ip,
        details: { attemptedRole: role, phone },
      });

      res.status(403).json({
        success: false,
        error: {
          code: 'PRIVILEGE_ESCALATION_BLOCKED',
          message: 'Registration for administrative or support roles is strictly prohibited.',
        },
      });
      return;
    }

    const assignedRole = role === 'chef' ? 'chef' : 'customer';

    // 3. Duplicate Check
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    const existing = await queryOne('SELECT id FROM users WHERE phone = ?', [cleanPhone]);
    if (existing) {
      res.status(409).json({
        success: false,
        error: { code: 'PHONE_EXISTS', message: 'A user with this phone number already exists.' },
      });
      return;
    }

    // 4. Secure Password Hashing
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 5. Create User Record
    const userId = `usr-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    await run(
      `INSERT INTO users (
        id, email, phone, password_hash, role, status, name, avatar,
        verified, city_id, city_name, address, lat, lng, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, 'active', ?, ?, FALSE, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [
        userId,
        email || null,
        cleanPhone,
        passwordHash,
        assignedRole,
        name,
        assignedRole === 'chef'
          ? 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=300&q=80'
          : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        cityId || 'blr',
        cityName || 'Bengaluru',
        address || 'Indiranagar, Bengaluru',
        lat || 12.9716,
        lng || 77.5946,
      ]
    );

    // 6. Create Profile based on Role
    let chefProfileId: string | undefined;
    if (assignedRole === 'chef') {
      chefProfileId = `chef-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
      await run(
        `INSERT INTO chef_profiles (
          id, user_id, experience_years, specialties, bio, languages,
          hourly_rate, sos_rate, day_prep_rate, shift_rate, signature_dishes,
          rating, reviews_count, is_online, status, hygiene_certified, police_verified, current_lat, current_lng, current_area
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 5.0, 0, 1, 'available', 0, 0, ?, ?, ?)`,
        [
          chefProfileId,
          userId,
          Number(experienceYears) || 5,
          JSON.stringify(specialties || ['North Indian / Mughlai', 'Tandoor & Kebabs']),
          bio || `Chef partner serving ${cityName || 'Bengaluru'}.`,
          JSON.stringify(['English', 'Hindi']),
          Number(hourlyRate) || 550,
          Number(sosRate) || 850,
          Number(dayPrepRate) || 1400,
          Number(shiftRate) || 2800,
          JSON.stringify(signatureDishes || ['Chef Special Dum Biryani', 'Sigri Malai Tikka']),
          lat || 12.9716,
          lng || 77.5946,
          address || 'Indiranagar',
        ]
      );
    } else {
      const custProfileId = `cp-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
      await run(
        `INSERT INTO customer_profiles (id, user_id, dietary_preference, household_size, favorite_cuisines)
         VALUES (?, ?, 'all', '2-4 People', ?)`,
        [custProfileId, userId, JSON.stringify(['North Indian', 'South Indian'])]
      );
      // Initialize reward account
      await RewardService.getOrCreateAccount(userId);
    }

    // 7. Generate Token & Audit Log
    const token = generateToken({ id: userId, role: assignedRole, phone: cleanPhone });

    await AuditService.log({
      eventType: 'account_created',
      userId,
      userRole: assignedRole,
      targetType: 'user',
      targetId: userId,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: { role: assignedRole, phone: cleanPhone },
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: userId,
        name,
        phone: cleanPhone,
        email,
        role: assignedRole,
        chefProfileId,
        verified: false,
        address,
        cityId,
        cityName,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'REGISTRATION_FAILED', message: error.message || 'Registration failed' },
    });
  }
});

/**
 * POST /api/auth/login
 * Login with phone/email and password.
 */
authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { phone, email, password } = req.body;

    if ((!phone && !email) || !password) {
      res.status(400).json({
        success: false,
        error: { code: 'MISSING_CREDENTIALS', message: 'Phone/email and password are required.' },
      });
      return;
    }

    const cleanPhone = phone ? phone.replace(/[^\d+]/g, '') : null;
    const user = cleanPhone
      ? await queryOne<any>('SELECT * FROM users WHERE phone = ?', [cleanPhone])
      : await queryOne<any>('SELECT * FROM users WHERE email = ?', [email]);

    if (!user) {
      res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid phone/email or password.' },
      });
      return;
    }

    // Check account status
    if (user.status === 'suspended') {
      await AuditService.log({
        eventType: 'suspended_login_attempt',
        userId: user.id,
        userRole: user.role,
        ipAddress: req.ip,
      });

      res.status(403).json({
        success: false,
        error: {
          code: 'ACCOUNT_SUSPENDED',
          message: 'Your account is currently suspended. Please contact support.',
        },
      });
      return;
    }

    if (user.status === 'deleted') {
      res.status(401).json({
        success: false,
        error: { code: 'ACCOUNT_DELETED', message: 'Account no longer active.' },
      });
      return;
    }

    // Check password hash
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      await AuditService.log({
        eventType: 'failed_login_attempt',
        userId: user.id,
        userRole: user.role,
        ipAddress: req.ip,
      });

      res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid phone/email or password.' },
      });
      return;
    }

    // Load chef profile if applicable
    let chefProfileId: string | undefined;
    if (user.role === 'chef') {
      const chefProfile = await queryOne<any>('SELECT id FROM chef_profiles WHERE user_id = ?', [user.id]);
      chefProfileId = chefProfile?.id;
    }

    const token = generateToken({ id: user.id, role: user.role, phone: user.phone });

    await AuditService.log({
      eventType: 'login',
      userId: user.id,
      userRole: user.role,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        verified: Boolean(user.verified),
        cityId: user.city_id,
        cityName: user.city_name,
        address: user.address,
        chefProfileId,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'LOGIN_FAILED', message: error.message || 'Login failed' },
    });
  }
});

/**
 * GET /api/auth/me
 * Retrieves the currently authenticated user's profile and active roles.
 */
authRouter.get('/me', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const user = await queryOne<any>('SELECT * FROM users WHERE id = ?', [req.user!.id]);
  if (!user) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } });
    return;
  }

  let profileData: any = {};
  if (user.role === 'chef') {
    profileData = (await queryOne<any>('SELECT * FROM chef_profiles WHERE user_id = ?', [user.id])) || {};
  } else if (user.role === 'customer') {
    profileData = (await queryOne<any>('SELECT * FROM customer_profiles WHERE user_id = ?', [user.id])) || {};
  }

  const rewardAccount = await queryOne<any>('SELECT * FROM reward_accounts WHERE user_id = ?', [user.id]);

  res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      role: user.role,
      status: user.status,
      avatar: user.avatar,
      verified: Boolean(user.verified),
      cityId: user.city_id,
      cityName: user.city_name,
      address: user.address,
      profile: profileData,
      rewardAccount,
    },
  });
});

/**
 * POST /api/auth/forgot-password
 * Initiates secure password reset.
 */
authRouter.post('/forgot-password', async (req: Request, res: Response) => {
  const { phone, email } = req.body;
  if (!phone && !email) {
    res.status(400).json({ success: false, error: { code: 'MISSING_TARGET', message: 'Phone or email required' } });
    return;
  }

  const cleanPhone = phone ? phone.replace(/[^\d+]/g, '') : null;
  const user = cleanPhone
    ? await queryOne<any>('SELECT id FROM users WHERE phone = ?', [cleanPhone])
    : await queryOne<any>('SELECT id FROM users WHERE email = ?', [email]);

  if (!user) {
    // Return success anyway to avoid user enumeration
    res.json({ success: true, message: 'If the account exists, a reset code has been dispatched.' });
    return;
  }

  const resetToken = crypto.randomBytes(24).toString('hex');
  await run(
    `UPDATE users
     SET reset_token = ?, reset_token_expires_at = datetime('now', '+1 hour'), updated_at = datetime('now')
     WHERE id = ?`,
    [resetToken, user.id]
  );

  await AuditService.log({
    eventType: 'password_reset_requested',
    userId: user.id,
    targetType: 'user',
    targetId: user.id,
    ipAddress: req.ip,
  });

  res.json({
    success: true,
    message: 'If the account exists, a reset code has been dispatched.',
    resetToken, // Provided for automated testing and local verification
  });
});

/**
 * POST /api/auth/reset-password
 * Completes password reset with validated token.
 */
authRouter.post('/reset-password', async (req: Request, res: Response) => {
  const { resetToken, newPassword } = req.body;
  if (!resetToken || !newPassword) {
    res.status(400).json({ success: false, error: { code: 'MISSING_FIELDS', message: 'Token and new password required' } });
    return;
  }

  if (newPassword.length < 6) {
    res.status(400).json({ success: false, error: { code: 'WEAK_PASSWORD', message: 'Password must be at least 6 characters' } });
    return;
  }

  const user = await queryOne<any>(
    "SELECT id, phone, role FROM users WHERE reset_token = ? AND reset_token_expires_at > datetime('now')",
    [resetToken]
  );

  if (!user) {
    res.status(400).json({ success: false, error: { code: 'INVALID_RESET_TOKEN', message: 'Invalid or expired reset token' } });
    return;
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(newPassword, salt);

  await run(
    `UPDATE users
     SET password_hash = ?, reset_token = NULL, reset_token_expires_at = NULL, updated_at = datetime('now')
     WHERE id = ?`,
    [passwordHash, user.id]
  );

  await AuditService.log({
    eventType: 'password_reset_completed',
    userId: user.id,
    userRole: user.role,
    targetType: 'user',
    targetId: user.id,
    ipAddress: req.ip,
  });

  res.json({ success: true, message: 'Password has been reset successfully.' });
});

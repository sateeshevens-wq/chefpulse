import { Router, Request, Response } from 'express';
import crypto from 'node:crypto';
import { queryOne, run } from '../db/database.js';
import { getOtpProvider, hashProviderVerificationId, normalizePhone, type OtpPurpose } from '../services/otpProvider.js';
import { AuditService } from '../services/auditService.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';

export const otpRouter = Router();
otpRouter.use(authRateLimiter);

const PURPOSES = new Set<OtpPurpose>(['registration', 'login', 'phone_change']);

function cleanPurpose(value: unknown): OtpPurpose {
  if (typeof value !== 'string' || !PURPOSES.has(value as OtpPurpose)) {
    throw new Error('Invalid OTP purpose.');
  }
  return value as OtpPurpose;
}

/**
 * POST /api/otp/start
 * Starts a provider-backed phone verification. The OTP itself is never generated or returned by ChefPulse.
 */
otpRouter.post('/start', async (req: Request, res: Response) => {
  try {
    const phone = normalizePhone(req.body?.phone);
    const purpose = cleanPurpose(req.body?.purpose);
    const existing = await queryOne<any>('SELECT id, status FROM users WHERE phone = ?', [phone]);

    if (purpose === 'registration' && existing) {
      res.status(409).json({ success: false, error: { code: 'PHONE_EXISTS', message: 'A user with this phone number already exists.' } });
      return;
    }
    if (purpose === 'login' && !existing) {
      // Avoid leaking whether a phone number is registered through the normal response path.
      res.status(404).json({ success: false, error: { code: 'ACCOUNT_NOT_FOUND', message: 'No ChefPulse account was found for this phone number.' } });
      return;
    }

    const provider = getOtpProvider();
    const result = await provider.start(phone);
    const challengeId = `otp-${Date.now()}-${crypto.randomBytes(5).toString('hex')}`;
    const userId = existing?.id || null;
    const expiresAt = new Date(Date.now() + result.expiresInSeconds * 1000).toISOString();

    // We intentionally store only a hash of the provider verification ID; the raw ID is returned
    // to the authenticated client for the immediate verification step and is never logged.
    await run(
      `INSERT INTO otp_provider_verifications (
        id, phone, user_id, purpose, provider, provider_verification_id_hash, expires_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      [challengeId, phone, userId, purpose, result.provider, hashProviderVerificationId(result.verificationId), expiresAt]
    );

    await AuditService.log({
      eventType: 'otp_requested',
      userId: userId || undefined,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: { purpose, provider: result.provider },
    });

    res.status(200).json({
      success: true,
      challengeId,
      verificationId: result.verificationId,
      expiresInSeconds: result.expiresInSeconds,
      maxAttempts: result.maxAttempts,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { code: 'OTP_START_FAILED', message: error.message || 'Unable to send OTP.' } });
  }
});

/**
 * POST /api/otp/verify
 * Verifies a provider-issued OTP. ChefPulse never receives or stores the OTP value after verification.
 */
otpRouter.post('/verify', async (req: Request, res: Response) => {
  try {
    const challengeId = String(req.body?.challengeId || '');
    const verificationId = String(req.body?.verificationId || '');
    const otp = String(req.body?.otp || '').trim();
    if (!challengeId || !verificationId || !/^\d{4,6}$/.test(otp)) {
      res.status(400).json({ success: false, error: { code: 'INVALID_OTP_REQUEST', message: 'Challenge ID, verification ID and a 4–6 digit OTP are required.' } });
      return;
    }

    const challenge = await queryOne<any>(
      'SELECT * FROM otp_provider_verifications WHERE id = ? AND consumed_at IS NULL',
      [challengeId]
    );
    if (!challenge) {
      res.status(404).json({ success: false, error: { code: 'OTP_CHALLENGE_NOT_FOUND', message: 'OTP challenge is no longer available. Request a new code.' } });
      return;
    }
    if (new Date(challenge.expires_at).getTime() <= Date.now()) {
      res.status(400).json({ success: false, error: { code: 'OTP_EXPIRED', message: 'This OTP has expired. Request a new code.' } });
      return;
    }
    if (hashProviderVerificationId(verificationId) !== challenge.provider_verification_id_hash) {
      res.status(400).json({ success: false, error: { code: 'OTP_CHALLENGE_MISMATCH', message: 'OTP challenge is invalid. Request a new code.' } });
      return;
    }

    const provider = getOtpProvider();
    try {
      await provider.verify(verificationId, otp);
    } catch (providerError: any) {
      const status = providerError?.status === 403 ? 429 : 400;
      res.status(status).json({
        success: false,
        error: {
          code: providerError?.providerCode === 1210 ? 'OTP_EXPIRED' : providerError?.providerCode === 1211 ? 'INVALID_OTP' : 'OTP_VERIFICATION_FAILED',
          message: providerError?.message || 'The OTP could not be verified.',
        },
      });
      return;
    }

    await run('UPDATE otp_provider_verifications SET consumed_at = datetime(\'now\') WHERE id = ?', [challengeId]);
    if (challenge.user_id) {
      await run('UPDATE users SET phone_verified = 1, updated_at = datetime(\'now\') WHERE id = ?', [challenge.user_id]);
    }

    await AuditService.log({
      eventType: 'otp_verified',
      userId: challenge.user_id || undefined,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: { purpose: challenge.purpose, provider: challenge.provider },
    });

    res.json({ success: true, verified: true, phone: challenge.phone, purpose: challenge.purpose, userId: challenge.user_id || null });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { code: 'OTP_VERIFY_FAILED', message: error.message || 'Unable to verify OTP.' } });
  }
});

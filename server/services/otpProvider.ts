import crypto from 'node:crypto';
import { config } from '../config.js';

export type OtpPurpose = 'registration' | 'login' | 'phone_change';

export interface OtpStartResult {
  provider: string;
  verificationId: string;
  expiresInSeconds: number;
  maxAttempts: number;
}

export interface OtpVerifyResult {
  verified: boolean;
  provider: string;
  verificationId: string;
}

interface OtpProvider {
  start(phone: string): Promise<OtpStartResult>;
  verify(verificationId: string, otp: string): Promise<OtpVerifyResult>;
}

function basicAuth(appId: string, appSecret: string): string {
  return Buffer.from(`${appId}:${appSecret}`, 'utf8').toString('base64');
}

class ExoVerifyProvider implements OtpProvider {
  private readonly baseUrl = 'https://exoverify.exotel.com/v2/accounts';

  private requireConfig() {
    if (!config.exotelAccountSid || !config.exotelVerifyAppId || !config.exotelVerifyAppSecret) {
      throw new Error('OTP provider is not configured. Set EXOTEL_ACCOUNT_SID, EXOTEL_VERIFY_APP_ID and EXOTEL_VERIFY_APP_SECRET.');
    }
  }

  private headers() {
    this.requireConfig();
    return {
      Authorization: `Basic ${basicAuth(config.exotelVerifyAppId, config.exotelVerifyAppSecret)}`,
      'Content-Type': 'application/json',
    };
  }

  async start(phone: string): Promise<OtpStartResult> {
    const response = await fetch(`${this.baseUrl}/${encodeURIComponent(config.exotelAccountSid)}/verifications/sms`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({
        application_id: config.exotelVerifyAppId,
        phone_number: phone,
      }),
    });

    const body = await response.json().catch(() => ({}));
    if (!response.ok || !body.verification_id) {
      const providerMessage = body?.message || body?.error || `ExoVerify returned HTTP ${response.status}`;
      throw new Error(`OTP delivery failed: ${providerMessage}`);
    }

    return {
      provider: 'exoverify',
      verificationId: String(body.verification_id),
      expiresInSeconds: Number(body.expiration_in_seconds) || 60,
      maxAttempts: Number(body.max_attempts) || 10,
    };
  }

  async verify(verificationId: string, otp: string): Promise<OtpVerifyResult> {
    const response = await fetch(`${this.baseUrl}/${encodeURIComponent(config.exotelAccountSid)}/verifications/sms/${encodeURIComponent(verificationId)}`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({ OTP: otp }),
    });

    const body = await response.json().catch(() => ({}));
    if (!response.ok || body?.status !== 'success') {
      const code = body?.code ? ` (${body.code})` : '';
      const providerMessage = body?.message || body?.error || `ExoVerify returned HTTP ${response.status}`;
      const error = new Error(`OTP verification failed${code}: ${providerMessage}`) as Error & { status?: number; providerCode?: string | number };
      error.status = response.status;
      error.providerCode = body?.code;
      throw error;
    }

    return { verified: true, provider: 'exoverify', verificationId };
  }
}

class UnconfiguredOtpProvider implements OtpProvider {
  async start(): Promise<OtpStartResult> {
    throw new Error('OTP provider is not configured. Production OTP cannot use a simulated provider.');
  }

  async verify(): Promise<OtpVerifyResult> {
    throw new Error('OTP provider is not configured. Production OTP cannot use a simulated provider.');
  }
}

export function getOtpProvider(): OtpProvider {
  if (config.otpProvider === 'exoverify') return new ExoVerifyProvider();
  return new UnconfiguredOtpProvider();
}

export function normalizePhone(phone: string): string {
  const trimmed = String(phone || '').trim();
  if (!/^\+\d{10,15}$/.test(trimmed)) {
    throw new Error('Phone number must use international format, for example +919876543210.');
  }
  return trimmed;
}

export function hashProviderVerificationId(verificationId: string): string {
  return crypto.createHash('sha256').update(verificationId).digest('hex');
}

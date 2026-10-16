import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  jwtSecret: process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? '' : 'chefpulse-dev-jwt-secret-key-local-only-9845012345'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  dbPath: process.env.DATABASE_PATH || path.resolve(process.cwd(), 'data', 'chefpulse.db'),
  databaseDriver: (process.env.DATABASE_DRIVER || 'sqlite') as 'sqlite' | 'postgres',
  databaseUrl: process.env.DATABASE_URL || '',
  platformFee: 49, // Fixed INR platform fee
  gstRate: 0.18, // 18% GST on services in India
  corsOrigin: process.env.CORS_ORIGIN || (process.env.NODE_ENV === 'production' ? '' : '*'),
  trustProxy: process.env.TRUST_PROXY === 'true' || process.env.NODE_ENV === 'production',
  requestTimeoutMs: Number(process.env.REQUEST_TIMEOUT_MS || 30000),
  shutdownTimeoutMs: Number(process.env.SHUTDOWN_TIMEOUT_MS || 10000),
  // Payment Provider Configuration
  paymentProvider: process.env.PAYMENT_PROVIDER || (process.env.NODE_ENV === 'production' ? 'razorpay' : 'simulation'), // 'simulation' | 'razorpay' | 'cashfree'
  allowSimulation: process.env.ALLOW_PAYMENT_SIMULATION === 'true' && process.env.NODE_ENV !== 'production',
  groceryWebhookSecret: process.env.GROCERY_WEBHOOK_SECRET || '',
  paymentWebhookSecret: process.env.PAYMENT_WEBHOOK_SECRET || (process.env.NODE_ENV === 'production' ? '' : 'chefpulse_whsec_dev_secret_local_2026'),
  razorpayKeyId: process.env.RAZORPAY_KEY_ID || '',
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || '',
  paymentIdempotencyTtlSeconds: 86400,
  // OTP delivery is provider-backed in production. Never silently fall back to a simulated OTP.
  otpProvider: (process.env.OTP_PROVIDER || 'none') as 'none' | 'exoverify',
  exotelAccountSid: process.env.EXOTEL_ACCOUNT_SID || '',
  exotelVerifyAppId: process.env.EXOTEL_VERIFY_APP_ID || '',
  exotelVerifyAppSecret: process.env.EXOTEL_VERIFY_APP_SECRET || '',
};

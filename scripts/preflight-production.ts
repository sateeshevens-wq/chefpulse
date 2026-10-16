import process from 'node:process';
import dotenv from 'dotenv';

dotenv.config();

const required = [
  'DATABASE_URL',
  'JWT_SECRET',
  'CORS_ORIGIN',
  'RAZORPAY_KEY_ID',
  'RAZORPAY_KEY_SECRET',
  'PAYMENT_WEBHOOK_SECRET',
];

const otpProvider = process.env.OTP_PROVIDER || 'none';
if (otpProvider === 'exoverify') {
  required.push('EXOTEL_ACCOUNT_SID', 'EXOTEL_VERIFY_APP_ID', 'EXOTEL_VERIFY_APP_SECRET');
}

const missing = required.filter((name) => !process.env[name]?.trim());
const failures: string[] = [];

if (process.env.NODE_ENV !== 'production') failures.push('NODE_ENV must be production.');
if (process.env.DATABASE_DRIVER !== 'postgres') failures.push('DATABASE_DRIVER must be postgres.');
if (process.env.PAYMENT_PROVIDER !== 'razorpay') failures.push('PAYMENT_PROVIDER must be razorpay.');
if (process.env.ALLOW_PAYMENT_SIMULATION === 'true') failures.push('ALLOW_PAYMENT_SIMULATION must not be true in production.');
if (process.env.CORS_ORIGIN === '*' || !process.env.CORS_ORIGIN?.startsWith('https://')) failures.push('CORS_ORIGIN must be a specific HTTPS origin.');
if (process.env.DATABASE_SSL === 'false') failures.push('DATABASE_SSL must not be false for production.');
if ((process.env.JWT_SECRET || '').length < 32) failures.push('JWT_SECRET must be at least 32 characters.');

if (missing.length || failures.length) {
  console.error('ChefPulse production preflight FAILED.');
  if (missing.length) console.error(`Missing variables: ${missing.join(', ')}`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

if (otpProvider === 'none') console.log('OTP provider: none (Exotel onboarding/configuration is not required for this release).');
console.log('ChefPulse production preflight PASSED.');
console.log('Required production secrets/configuration are present; secret values are never printed.');

# ChefPulse — Exotel OTP setup

ChefPulse now has a provider-backed OTP adapter for Exotel ExoVerify.

## What is implemented

- `POST /api/otp/start` starts an ExoVerify SMS verification.
- `POST /api/otp/verify` validates the OTP with ExoVerify.
- ChefPulse never generates, returns, logs, or stores the OTP itself.
- Only a SHA-256 hash of the ExoVerify verification ID is stored with the challenge record.
- Provider credentials are server-side environment variables only.
- OTP challenges are one-time and expire according to the provider response.
- Provider errors are mapped to safe application errors.

ExoVerify's current API uses an SMS OTP application ID/secret, sends the OTP from its Start Verification API, and validates the entered OTP through its Verify OTP API. The current documented defaults are 60-second expiry and 10 attempts. See Exotel's developer documentation before production enablement.

## Exotel dashboard

1. Open **ExoVerify → Applications**.
2. Create an **SMS OTP application**.
3. Copy the Application ID and Application Secret into your deployment secret manager.
4. Copy the Exotel Account SID from API Settings.
5. Set:

```text
OTP_PROVIDER=exoverify
EXOTEL_ACCOUNT_SID=<your account sid>
EXOTEL_VERIFY_APP_ID=<your ExoVerify app id>
EXOTEL_VERIFY_APP_SECRET=<your ExoVerify app secret>
```

Never put `EXOTEL_VERIFY_APP_SECRET` in frontend code, Vite `VITE_*` variables, Git, screenshots, or chat.

## Production database

Apply the V11 schema addition before enabling the routes in production. The Supabase schema file contains the same `otp_provider_verifications` table and indexes.

## Current limitation

This milestone adds the production provider adapter and secure OTP API routes. The existing customer UI still uses the application's existing password authentication flow; the next milestone should wire the sign-in/sign-up UI to these OTP endpoints and make phone verification mandatory for the chosen production account flow.

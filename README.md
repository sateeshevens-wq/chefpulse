<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/6562084f-6fdb-4885-b9fe-67ad1b3596eb

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## V5 production status

V5 adds the real Razorpay server integration foundation and removes the fake customer-facing payment-success flow. Production still requires managed PostgreSQL migration, real Razorpay credentials, CI/staging tests, and native mobile payment validation before public launch.

## V6 database status

V6 adds a PostgreSQL production schema and migration tooling. The application intentionally remains on SQLite/sql.js until its synchronous database access layer is migrated to an asynchronous PostgreSQL repository/transaction layer. See `CHEFPULSE_V6_DATABASE_PLAN.md`.

## V7 database status

V7 adds the first transactional PostgreSQL repository layer: pooled connections, transaction boundaries, advisory locks, booking creation, and payment-intent persistence. The application is **not yet switched to PostgreSQL**; the legacy synchronous SQLite access layer remains active until the remaining repositories and state/payment workflows are migrated. Setting `DATABASE_DRIVER=postgres` on this version intentionally fails fast to prevent an accidental partial cutover.

## V8 database runtime
V8 adds the PostgreSQL runtime path behind `DATABASE_DRIVER=postgres` and `DATABASE_URL`. The default remains SQLite for local development. PostgreSQL booking/payment-critical paths use transactional locking; production cutover still requires a managed PostgreSQL instance, real secrets, staging verification, and operational monitoring.

## V9 payment and staging hardening
V9 makes PostgreSQL payment confirmation, payment failure, refunds, and webhook claiming transaction-aware. Refunds use a two-phase database record (`pending` -> `processed`/`failed`) around the external provider call so the local ledger does not report a completed refund before the provider succeeds. Webhook event insertion is unique and atomic to prevent duplicate processing races. `npm run db:postgres:verify` validates the required schema, row accessibility, and paise/rupee consistency against a real PostgreSQL database.

V9 is still a staging-readiness release, not a claim of live production connectivity. A managed PostgreSQL instance, real Razorpay credentials, real OTP provider credentials, TLS, monitoring, backups, and end-to-end staging tests are required before public launch.

## V11 launch-candidate hardening

V11 converts the project from a demo-first client into a launch-candidate codebase:
- customer home no longer starts with a fake logged-in customer;
- chef discovery is backend-driven;
- sign-in/sign-up now uses server authentication with a user-supplied password rather than hidden demo credentials or a fake OTP screen;
- production startup requires PostgreSQL, explicit CORS, a unique JWT secret, and real Razorpay configuration;
- production never seeds demo accounts or sample bookings;
- new accounts and chefs are not automatically government-verified;
- cancellation calls the backend;
- Capacitor 8 configuration is included for the Android/iOS release path.

### Mobile release path

1. Set `VITE_API_BASE_URL` to the production HTTPS API origin.
2. Run `npm install`.
3. Run `npm run build:web`.
4. Run `npx cap add android` and `npx cap add ios` once on the release workstation.
5. Run `npm run mobile:release`.
6. Open Android Studio with `npm run mobile:android` and create a signed Android App Bundle.
7. Open Xcode with `npm run mobile:ios`, configure signing/capabilities, archive, and submit to App Store Connect.

The final Android/iOS signing step must be performed on the appropriate release machines; no fake or development signing keys are included in this repository.

## V11 — Exotel ExoVerify OTP foundation

V11 adds a provider-backed OTP layer using Exotel ExoVerify. ChefPulse does not generate or store OTP values. The server stores only a hash of the provider verification ID and delegates OTP delivery/validation to ExoVerify. The customer UI still requires a follow-up wiring pass before OTP becomes the sole sign-in/registration method.

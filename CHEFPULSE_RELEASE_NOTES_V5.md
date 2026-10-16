# ChefPulse V5 — Live Payment Foundation + Production Database Migration Kit

## What changed

### 1. Real Razorpay payment flow foundation
- Added a server-side Razorpay provider using the official Orders, payment-status, and refund APIs.
- Server creates the Razorpay order from the server-authoritative booking amount in paise.
- Checkout receives only the public Razorpay key id; the secret stays on the server.
- Checkout signature is verified against the trusted server-side order id.
- Server fetches the provider payment and verifies amount/currency/captured status before marking ChefPulse payment captured.
- Razorpay refunds are issued by the server before a refund is recorded as processed.
- Provider payment ids are now persisted with payment records.
- Production startup fails closed when live Razorpay credentials are missing or payment simulation is enabled.

### 2. Payment UI cleanup
- Removed the previous simulated UPI/card timer and fake success experience from the main payment modal.
- The customer now sees a simple total and is taken to secure gateway checkout.
- The UI no longer claims that a payment succeeded before the server verifies it.

### 3. Webhook hardening
- Raw webhook request bytes are preserved before JSON parsing so HMAC validation can use the actual payload.
- Razorpay webhook payloads are parsed using provider entity fields.
- Webhook processing remains idempotent through the existing webhook event table.

### 4. PostgreSQL migration kit
- Added `server/db/postgres/schema.sql` as the starting production relational schema.
- Added a migration/rollout guide in `server/db/postgres/README.md`.
- Added `provider_payment_id` to the SQLite development schema and migration path.

## Important truth

The running server still uses synchronous sql.js/SQLite. PostgreSQL is **not yet wired into the runtime** because the current data-access layer is synchronous while a production PostgreSQL driver is asynchronous. The next database phase must migrate the repository layer and transactions together; pretending a Postgres connection exists now would be unsafe.

The live Razorpay code is implemented, but it still requires a real Razorpay account and server secrets supplied through the deployment platform. No credentials are included in this project.

## Validation status

This environment does not contain `node_modules`, so the full TypeScript build/test suite could not be executed here. The project should be installed and validated in CI/staging before release.

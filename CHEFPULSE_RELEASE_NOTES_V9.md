# ChefPulse V9 — Payment & PostgreSQL Staging Hardening

## Included
- PostgreSQL transaction-safe payment confirmation.
- PostgreSQL transaction-safe payment failure handling.
- Two-phase refund persistence around the external payment-provider call.
- Refund balance checked while the payment row is locked, preventing concurrent over-refunds.
- Atomic webhook-event claiming with the existing unique provider event id.
- PostgreSQL webhook processing now uses the transactional payment paths.
- Fixed payment detail/booking payment routes to await async database reads.
- Added `scripts/check-postgres-migration.ts` and `npm run db:postgres:verify`.
- Added structural migration checks for required tables and rupee/paise consistency.
- Fixed asynchronous idempotency helpers in `PaymentService`.

## Safety model
1. Lock payment/booking aggregate.
2. Validate the authoritative payment/refund balance.
3. Persist local intent before calling an external refund provider.
4. Finalize the local ledger only after provider success.
5. Mark provider failures explicitly instead of reporting success.
6. Treat duplicate webhook event ids as already claimed.

## Validation performed
- All TypeScript source files successfully transpile with the installed TypeScript compiler.
- Full type-check/test suite was not executed because project dependencies are not installed in this environment.
- No live PostgreSQL or Razorpay credentials were supplied, so no live provider/database claim is made.

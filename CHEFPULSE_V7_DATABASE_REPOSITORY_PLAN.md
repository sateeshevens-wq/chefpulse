# ChefPulse V7 — PostgreSQL Transactional Repository Foundation

## What changed

V7 begins the **actual repository-layer migration** without pretending the whole application has already switched databases.

### Added
- `server/db/postgres/client.ts`
  - Managed PostgreSQL pool using `pg`.
  - Explicit `DATABASE_DRIVER=postgres` + `DATABASE_URL` gate.
  - SSL and pool tuning from environment variables.
- `server/db/postgres/transaction.ts`
  - Transaction helper with commit/rollback/release handling.
  - Transaction-scoped PostgreSQL advisory locks for booking aggregates and chef schedules.
- `server/db/postgres/repositories/bookingRepository.ts`
  - Transactional booking creation.
  - Locks the chef schedule and chef row before checking slot conflicts.
  - Uses PostgreSQL `$1..$n` parameters and integer paise columns.
  - Records initial booking status history in the same transaction.
- `server/db/postgres/repositories/paymentRepository.ts`
  - Transactional payment-intent creation.
  - Locks the booking before checking/creating a payment intent.
  - Derives the amount from the database booking, never from client input.
- `tests/postgres.repository.test.ts`
  - Verifies the repository foundation fails closed when PostgreSQL is not explicitly configured.

## Safety decision

The legacy application still contains synchronous SQLite database calls throughout the server. V7 therefore **does not enable PostgreSQL automatically**. If `DATABASE_DRIVER=postgres` is set on the current runtime, the legacy SQLite initializer fails fast instead of silently continuing on SQLite.

This is intentional: a partial cutover is more dangerous than a blocked startup.

## Next cutover work

1. Migrate authentication/profile repositories to async PostgreSQL APIs.
2. Migrate chef, notification, rewards, verification, admin and audit repositories.
3. Replace all SQLite-specific SQL with PostgreSQL SQL and parameter syntax.
4. Move booking state transitions into PostgreSQL transactions with row/advisory locks.
5. Move payment confirmation/refund/webhook processing into PostgreSQL transactions with idempotency constraints.
6. Add overlap-aware booking locks based on service duration, not only exact timestamps.
7. Add PostgreSQL integration tests against a disposable/staging database.
8. Run SQLite → PostgreSQL migration and reconciliation in staging.
9. Perform controlled production cutover only after all server DB access is PostgreSQL-native.

## Migration hardening added in V7

The SQLite data migration was also hardened for the real legacy data shape: the current SQLite snapshot contains bookings whose `scheduled_time` is the literal value `Immediate`. PostgreSQL stores `scheduled_time` as `timestamptz`, so V7 maps those legacy immediate bookings to their original `created_at` timestamp instead of generating invalid timestamps.

The V6 exact-time unique index was removed from the PostgreSQL schema. It could incorrectly reject legitimate variable-duration/immediate bookings and could cause historical migration conflicts. V7 instead uses transaction-scoped advisory locking around the chef schedule; duration-aware overlap protection will be added before production cutover.

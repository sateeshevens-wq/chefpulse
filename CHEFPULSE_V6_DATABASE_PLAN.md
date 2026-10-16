# ChefPulse V6 — Production Database Migration Foundation

## What changed

V6 adds a PostgreSQL production schema, explicit schema versioning, a safe migration runner, and a connectivity check. The existing application still uses `sql.js`/SQLite so that V6 does not silently switch a live deployment to an untested database adapter.

The existing source architecture uses synchronous database helpers throughout the server. PostgreSQL uses asynchronous I/O, so a real cutover must migrate the repository/service layer rather than merely changing `DATABASE_URL`.

## Why we are not pretending the cutover is complete

Changing the driver alone would create partial failures and race conditions. The correct production sequence is:

1. Provision managed PostgreSQL.
2. Apply `server/db/postgres/schema.sql`.
3. Migrate repository/service calls to async transactions.
4. Add transaction-level booking/payment locks.
5. Run staging tests against PostgreSQL.
6. Perform a controlled data migration from SQLite.
7. Run shadow/read validation.
8. Switch production traffic.
9. Keep the SQLite backup read-only for rollback/audit.

## New commands

```bash
npm run db:postgres:check
npm run db:postgres:migrate
```

Both commands require an explicit `DATABASE_URL`. They never invent credentials.

## Money model

The PostgreSQL schema stores booking and payment money in integer paise. This avoids floating-point money arithmetic at the production persistence boundary.

## Concurrency protection

V6 adds a PostgreSQL unique partial index preventing duplicate active bookings for the same chef at the exact same scheduled slot. V7 should add transaction/advisory locking and time-window overlap protection for services with durations.

## Required production secrets

Set these in the deployment platform's secret manager, never in source control:

- `DATABASE_URL`
- `DATABASE_SSL`
- `JWT_SECRET`
- `PAYMENT_WEBHOOK_SECRET`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- real OTP provider credentials

## Current launch status

**Database:** migration foundation ready; application cutover not yet claimed.

**Payments:** Razorpay server integration foundation ready; live credentials and staging verification still required.

**Mobile:** existing PWA/Android wrapper remains; native iOS/Android production QA is still a later release gate.

## Data migration command

After the PostgreSQL schema is provisioned and staging has been backed up:

```bash
npm run db:postgres:migrate-data
```

The script reads `DATABASE_PATH`, converts JSON/text fields and boolean flags, converts money to paise, and inserts rows in foreign-key order. It uses `ON CONFLICT DO NOTHING` so it is safe to stop and inspect before retrying, but production use should still begin with a database backup and a dry-run copy.

# ChefPulse V16 — Production Deployment Runbook

## Goal
Move ChefPulse from a tested release artifact to a controlled production environment without putting database passwords or payment/OTP secrets into the app bundle or repository.

## Environments
- `local`: SQLite or disposable Postgres.
- `staging`: separate managed Postgres project and separate provider credentials.
- `production`: dedicated managed Postgres project and production provider credentials.

Do not use the production database for development or staging.

## Required production secrets
Configure these only in the deployment platform's secret manager:
- `DATABASE_URL`
- `JWT_SECRET`
- `CORS_ORIGIN`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `PAYMENT_WEBHOOK_SECRET`
- `EXOTEL_ACCOUNT_SID`
- `EXOTEL_VERIFY_APP_ID`
- `EXOTEL_VERIFY_APP_SECRET`

Run `npm run ops:preflight` (or `bun run ops:preflight`) before releasing the server. It validates configuration without printing secret values.

## Database release
ChefPulse now contains a versioned Supabase migration baseline under `supabase/migrations/`.

For a **new** staging/production Supabase project:
1. Link the target project with the Supabase CLI.
2. Review `supabase migration list`.
3. Apply with `supabase db push`.
4. Verify tables and indexes.
5. Run the application's Postgres verification script.

For an **existing** database already created from `server/db/postgres/schema.sql`, do not blindly push the initial migration. First reconcile migration history/state using `supabase db pull` or a controlled migration repair process. Supabase recommends that production schema changes be version-controlled migrations rather than direct dashboard edits.

## Release order
1. Deploy/validate staging database.
2. Run application tests against staging.
3. Verify payment webhook signature handling using provider test events.
4. Verify notification delivery and token cleanup.
5. Run production preflight.
6. Apply database migrations through the protected production workflow.
7. Deploy backend.
8. Check `/api/health/live` and `/api/health/ready`.
9. Perform a small controlled booking/payment test.
10. Monitor errors, latency, payment webhooks and notifications.

## Rollback
Application rollback should be a previously tested application artifact. Database rollback is **not** a blind reverse migration: take a backup before destructive changes and create explicit forward-fix migrations when possible.

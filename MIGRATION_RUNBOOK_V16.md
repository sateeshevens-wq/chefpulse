# ChefPulse V16 — Database Migration Runbook

1. Create a migration file under `supabase/migrations/`.
2. Never edit the production database directly to make a permanent schema change.
3. Apply the migration to local/staging first.
4. Run the backend tests and Postgres verification.
5. Review query/index impact and locking risk.
6. Take/confirm a backup before production.
7. Apply production migrations through the protected GitHub Actions workflow.
8. Confirm `/api/health/ready` and application smoke tests.
9. Monitor database errors/latency after release.

For an already-existing Supabase database whose migration history was created outside the new baseline, reconcile the remote state before using `supabase db push`; do not force a baseline migration over an existing schema.

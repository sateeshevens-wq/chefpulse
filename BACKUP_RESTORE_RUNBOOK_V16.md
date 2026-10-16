# ChefPulse V16 — Backup & Restore Runbook

## Backup policy
Managed Supabase Postgres provides daily backups; paid plans can add Point-in-Time Recovery for tighter recovery objectives. ChefPulse also includes a scheduled GitHub Actions backup workflow as an additional operational safeguard.

The workflow intentionally keeps artifacts for only 3 days. Do not treat GitHub artifacts as the sole long-term backup location.

## Before a risky migration
1. Confirm a recent managed backup exists.
2. Run the backup workflow manually.
3. Confirm the artifact completed.
4. Record the release/migration identifier.

## Restore
A restore must be performed in a controlled environment first. Never restore over production simply because an application test failed.

1. Create/choose an isolated recovery database.
2. Restore schema/data using the managed backup or approved dump.
3. Run ChefPulse Postgres verification.
4. Compare critical counts and payment/refund records.
5. Only after validation, execute the approved production recovery procedure.

Never commit SQL dumps containing customer, chef, address, payment, or other production data to Git.

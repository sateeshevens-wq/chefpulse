# ChefPulse production PostgreSQL migration

ChefPulse V5 keeps SQLite/sql.js for local development, but production marketplace traffic should use managed PostgreSQL before launch. The current application database helpers are synchronous, so this folder is deliberately a **migration artifact**, not a fake claim that PostgreSQL is already wired into the running server.

## Recommended deployment shape

- Managed PostgreSQL with automated backups and point-in-time recovery.
- TLS-only database connections.
- One application database role with only the permissions it needs.
- Separate migration role for schema changes.
- Connection pooling at the application boundary.
- Daily backup verification and a tested restore procedure.

## Before switching traffic

1. Provision the database and obtain a `DATABASE_URL` from the deployment platform's secret store.
2. Apply `schema.sql` after reviewing the generated PostgreSQL syntax against the selected Postgres version.
3. Add the async Postgres repository/transaction layer and migrate route/service calls from the synchronous sql.js helpers.
4. Import production data through a one-time, audited migration; never copy the local demo database into production.
5. Run booking-race, payment-webhook, refund, auth, and IDOR tests against PostgreSQL.
6. Run a staging soak test before changing DNS/traffic.

## Marketplace concurrency requirement

The final Postgres implementation must perform booking assignment and payment state transitions inside database transactions. A successful response from a payment provider must never be treated as proof that a local row was safely updated until the database transaction succeeds.

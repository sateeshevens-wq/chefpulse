# ChefPulse V6 Release Notes

## Production Database Foundation

- Added PostgreSQL production schema under `server/db/postgres/schema.sql`.
- Added schema version tracking.
- Added PostgreSQL migration command.
- Added PostgreSQL connectivity check command.
- Added production-safe environment variables for PostgreSQL.
- Added integer-paise payment persistence in the PostgreSQL schema.
- Added provider payment IDs and webhook/idempotency tables.
- Added active chef booking slot protection.
- Preserved SQLite as the current application driver rather than making an untested runtime cutover.

## Important

V6 is a database migration foundation, not a claim that ChefPulse is already running on PostgreSQL. The application repository layer still needs an asynchronous PostgreSQL implementation and transaction migration before `DATABASE_DRIVER=postgres` can be enabled for production traffic.

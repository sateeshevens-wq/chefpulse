# ChefPulse V7 Release Notes

## Focus
Transactional PostgreSQL repository foundation and safer database cutover.

## Included
- PostgreSQL connection pool with explicit driver/URL gating.
- Transaction helper with rollback/release safety.
- Transaction-scoped advisory locks for booking aggregates and chef schedules.
- Transactional PostgreSQL booking creation repository.
- Transactional PostgreSQL payment-intent repository.
- PostgreSQL parameterized SQL (`$1`, `$2`, ...).
- Fail-fast protection against accidentally running the incomplete PostgreSQL cutover.
- SQLite → PostgreSQL migration handling for legacy `scheduled_time=Immediate` values.
- Removed the V6 exact-time unique booking index in favor of transaction locking, avoiding false conflicts for immediate/variable-duration services.
- PostgreSQL repository smoke tests that run without requiring a live database and verify the default fail-closed behavior.

## Honest production status
V7 is **not a production PostgreSQL cutover**.

The current application still has synchronous SQLite database access in authentication, chef, booking state, notifications, rewards, verification, admin, audit and other server code. Those paths must be migrated to async PostgreSQL repositories before `DATABASE_DRIVER=postgres` can safely be enabled.

The current runtime intentionally throws a clear startup error if `DATABASE_DRIVER=postgres` is set, preventing a partial/unsafe deployment.

## Validation
- `package.json` JSON parse: passed.
- Global TypeScript parser invocation reached dependency/type-resolution errors because project `node_modules` are not installed in this environment; no full test suite was claimed as passing.
- No real PostgreSQL connection was attempted because no database credentials were provided.

## Next milestone
V8 will continue the repository migration across the remaining server domains, then add transaction-level booking/payment state transitions and PostgreSQL integration tests against a real staging database.

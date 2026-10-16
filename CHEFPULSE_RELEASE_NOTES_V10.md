# ChefPulse Professional V10

## Production-hardening release

V10 focuses on the remaining concurrency and payment-recovery risks before a live staging cutover.

### Included
- PostgreSQL `transaction()` now binds all database helper calls to the same `PoolClient` using AsyncLocalStorage, so nested `query/queryOne/run` calls cannot silently escape the transaction.
- Chef booking conflicts now use service windows rather than exact timestamps. Default durations are 60 minutes for SOS, 240 minutes for scheduled prep, and 480 minutes for B2B shifts.
- PostgreSQL schema adds `service_duration_minutes` and a safe index/constraint migration.
- Payment intent idempotency remains protected by a database unique index and transactional repository path.
- Razorpay refund recovery added through provider refund listing and `db:postgres:reconcile-refunds`.
- Async database reads in auth routes were corrected.

### Honest status
V10 is production-hardened code, not proof of a live production environment. Live PostgreSQL, Razorpay, OTP, TLS, monitoring, backups, and staging credentials must still be configured and exercised outside this chat.

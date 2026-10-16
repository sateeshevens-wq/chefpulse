# ChefPulse V8 — PostgreSQL runtime cutover

V8 moves the server database abstraction to an async relational interface that supports the existing SQLite development database and a production PostgreSQL runtime selected explicitly with `DATABASE_DRIVER=postgres`.

## Runtime changes
- PostgreSQL schema is initialized at startup when the PostgreSQL driver is selected.
- Existing server routes/services now use async database access.
- PostgreSQL booking creation uses a transaction-scoped chef schedule lock.
- PostgreSQL booking state transitions lock the booking aggregate inside a transaction.
- PostgreSQL payment intent creation locks the booking and derives the amount from the server-side booking.
- Legacy rupee money columns remain synchronized with integer paise columns during the migration window.
- Production startup fails closed when PostgreSQL/payment secrets are missing.

## Not claimed
- No live production PostgreSQL database was provisioned from this package.
- No Razorpay credentials were supplied or tested here.
- Full dependency/test execution remains environment-dependent because the working package does not include `node_modules`.

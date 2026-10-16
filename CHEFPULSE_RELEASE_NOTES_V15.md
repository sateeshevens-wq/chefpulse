# ChefPulse V15 — Production Operations Hardening

## What changed

- Added request IDs (`X-Request-ID`) for support/debug traceability.
- Added structured request timing/status logs without logging authorization headers, payment secrets, or OTP values.
- Added `/api/health/live` for process liveness.
- Added `/api/health/ready` for database-backed readiness checks.
- Upgraded `/api/health` to report database health and return HTTP 503 when unavailable.
- Added production security headers including HSTS, Referrer-Policy, and Permissions-Policy.
- Disabled Express `X-Powered-By`.
- Added trusted-proxy configuration for correct client IP handling behind a reverse proxy/load balancer.
- Added `Idempotency-Key` and `X-Request-ID` to CORS allowed headers.
- Added rate-limit response headers and safer Retry-After handling.
- Fixed graceful shutdown so PostgreSQL connections close cleanly and shutdown cannot hang indefinitely.
- Added configurable request and shutdown timeouts.

## Production truth

This release improves operational readiness but does not mean ChefPulse is deployed to production. A real production deployment still requires managed PostgreSQL, HTTPS, real Razorpay credentials/webhook configuration, Firebase server credentials, Exotel approval/credentials when OTP is enabled, secret management, monitoring, backups, and final Android/iOS release testing.

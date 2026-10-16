# ChefPulse V17 — Staging & Production Release Runbook

## Objective
Move from a release artifact to a repeatable staging release and a protected production release without putting secrets in the repository or mobile bundle.

## Environment model
- Local: SQLite or disposable PostgreSQL.
- Staging: separate Supabase/PostgreSQL project and non-production Razorpay/notification credentials.
- Production: dedicated Supabase/PostgreSQL project and production credentials.

GitHub Actions environments should hold environment-specific secrets. Production should require reviewer approval and use a single concurrency group so two production releases cannot run at once. GitHub supports environment protection, required reviewers, deployment history, and concurrency controls. See the official GitHub deployment documentation.

## Staging release
1. Configure the GitHub `staging` environment with `DATABASE_URL`, `JWT_SECRET`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `PAYMENT_WEBHOOK_SECRET`, and `CORS_ORIGIN`. Keep `OTP_PROVIDER=none` until Exotel onboarding is approved; switch to `exoverify` only when its three server-side credentials are available.
2. Push to `develop` or manually run `ChefPulse Staging Release Gate` with `STAGING`.
3. CI installs the locked dependencies, runs type checking/tests, builds the web app, runs production-style configuration preflight, and builds the container image.
4. Deploy that exact image to the chosen hosting platform.
5. Set `SMOKE_BASE_URL` to the staging API and run `bun run ops:smoke`.
6. Verify `/api/health/live` and `/api/health/ready`.
7. Run a controlled staging booking/payment test with provider test credentials.

## Production release
1. Confirm the staging release is healthy.
2. Ensure production GitHub environment protection is enabled.
3. Take/verify a current database backup.
4. Manually trigger `ChefPulse Production Database Release` and type `DEPLOY`.
5. Approve the protected production environment when GitHub requests review.
6. Run the versioned Supabase migrations.
7. Deploy the same tested application image/artifact through the selected hosting provider.
8. Run `bun run ops:smoke` against the production API.
9. Monitor health, request errors, payment webhooks, refunds, and notification delivery.
10. Perform only a small controlled production transaction after the above checks pass.

## Rollback
- Application: roll back to the last known-good immutable image/artifact.
- Database: do not blindly reverse migrations. Prefer a forward-fix migration; restore from backup only under a controlled incident procedure.
- Payment: reconcile provider state before changing local payment records during an incident.

## Secrets
Never commit database passwords, Supabase service-role keys, Razorpay secrets, Exotel secrets, JWT secrets, or Firebase server credentials. Mobile bundles must contain only public client configuration.

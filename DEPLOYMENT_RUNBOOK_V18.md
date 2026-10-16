# ChefPulse V18 — Actual Staging Deployment Runbook

## Goal
Move from V17 release automation to a real staging environment: a dedicated Supabase staging project, a real HTTPS-hosted ChefPulse instance, migrations, and live smoke verification.

## Architecture
- Supabase staging project: database only for staging/test data.
- HTTPS web/API host: Docker deployment of the ChefPulse server.
- GitHub Actions: validates code, migrates Supabase, triggers hosting deployment, and runs smoke tests.
- Razorpay: TEST credentials only.
- OTP: `none` until Exotel onboarding is approved; never simulate OTP in production-like flows.

## One-time external setup
1. Create a separate Supabase project for staging. Do not reuse production.
2. In Supabase, obtain the staging project ref and database connection string.
3. Create a GitHub `staging` environment.
4. Add encrypted secrets: `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_REF`, `DATABASE_URL`, `JWT_SECRET`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `PAYMENT_WEBHOOK_SECRET`, `STAGING_DEPLOY_HOOK_URL`.
5. Add variables: `CORS_ORIGIN`, `STAGING_BASE_URL`, and optionally `OTP_PROVIDER` (`none` until Exotel is ready).
6. Configure the hosting provider to deploy this repository's `Dockerfile`. Render can consume `render.yaml`; other Docker hosts can use the same image.
7. Configure the host's environment variables from `.env.staging.example`.

## Database procedure
The staging workflow runs `supabase db push --dry-run`, then `supabase db push --yes`, then verifies required application tables. If an existing staging database was changed manually, reconcile it before pushing migrations. Supabase recommends separate staging/production projects and version-controlled migrations through CI/CD.

## Hosting procedure
The workflow triggers the configured `STAGING_DEPLOY_HOOK_URL`, waits for `/api/health/live`, then runs `/api/health/live`, `/api/health/ready`, `/api/health`, and `/api/chefs` against the public staging URL.

## Release gate
A V18 staging release is accepted only when:
- CI passes.
- Production-mode configuration preflight passes.
- Supabase migration dry-run passes.
- Migrations apply successfully.
- Required schema tables exist.
- The hosted service becomes live over HTTPS.
- Database readiness returns HTTP 200.
- Public chef discovery returns HTTP 200.
- No payment simulation is enabled.
- No production credentials are used in staging.

## Important limitation
The repository can fully automate V18, but the first live deployment still requires the owner to create/connect the external Supabase staging project and hosting account and place their secrets in GitHub/hosting secret stores. Secrets must never be pasted into chat or committed to Git.

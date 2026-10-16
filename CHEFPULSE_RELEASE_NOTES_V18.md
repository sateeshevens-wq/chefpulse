# ChefPulse V18 — Actual Staging Deployment

## Completed in source
- Added staging environment template.
- Added staging PostgreSQL schema verification.
- Added expanded live staging smoke tests.
- Added Render-compatible Docker hosting manifest.
- Reworked staging GitHub workflow to migrate a real Supabase staging project, trigger the real host deployment, wait for rollout, and smoke-test the live URL.
- Added V18 deployment runbook and release gate.

## External activation required
- Supabase staging project and credentials.
- HTTPS hosting account/deploy hook.
- Razorpay TEST credentials.
- GitHub staging environment secrets/variables.

## Not falsely claimed
No live third-party account was accessed or changed by this build because no external credentials were supplied. V18 is deployment-ready and its first real run is performed by the configured GitHub/hosting environment.

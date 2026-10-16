# ChefPulse V17 — Staging & Production Release Gate

## Added
- Containerized production runtime with health check.
- `.dockerignore` to reduce build context and prevent accidental secret inclusion.
- Staging GitHub Actions release gate with locked dependency install, tests, web build, configuration preflight, and container build.
- Production workflow concurrency protection and explicit production preflight before database migration.
- Deployment smoke test for liveness/readiness endpoints.
- V17 staging/production deployment runbook.

## Safety
- No deployment provider was assumed or silently configured.
- No production credentials were used.
- No real database was modified.
- Production remains gated behind the repository's configured GitHub environment protections.

## Validation
- Package metadata and workflow syntax were inspected locally.
- Full dependency-backed test/build execution requires installing the project's dependencies in CI or a release workstation.

# ChefPulse V13 — Production Marketplace Hardening

## What changed

- Chef discovery now supports backend search, specialty, minimum rating, and available-only filters.
- Customer discovery only treats chefs as immediately bookable when they are both online and `available`.
- SOS booking creation now rejects a chef who went offline/busy after the customer selected them.
- PostgreSQL schedule conflicts continue to be protected transactionally; conflict errors now return a user-safe HTTP 409 instead of a generic 500.
- Scheduled meal-prep booking dates now default to tomorrow rather than a stale hard-coded date.
- Scheduled meal-prep slots are converted to real ISO timestamps before being sent to the backend.
- Customer copy no longer claims that all directory chefs are government/background verified; it uses neutral availability/rating language until real verification providers are connected.
- Booking failure messaging is now user-focused and does not expose raw server errors.

## Verification

- TypeScript transpilation check passed for all V13-modified TypeScript/TSX files with 0 diagnostics.
- Full npm runtime tests were not run because dependencies are not installed in this environment.
- Production build/APK/iOS compilation still requires the project dependencies and platform SDKs.

## External production dependencies still pending

- Live Exotel credentials/onboarding for phone OTP.
- Live Razorpay production credentials/webhook configuration.
- Production managed PostgreSQL/Supabase runtime configuration.
- Real chef verification providers and operational KYC process.
- Android/iOS store signing and release builds.

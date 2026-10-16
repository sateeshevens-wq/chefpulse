# ChefPulse Launch Readiness

This release removes customer-facing demo authentication, fake default customer sessions, client-side demo chef directories, and production payment simulation defaults.

## What is now enforced in code
- Production requires PostgreSQL, a unique JWT secret, explicit CORS, a real payment provider, and a webhook secret.
- Production does not seed demo customers, chefs, bookings, or admin accounts.
- Customer/chef sign-up and login use server-side password authentication; the UI no longer auto-fills or silently uses `Password123!`.
- Newly registered users are not marked government-verified automatically.
- Newly registered chefs are not marked police/FSSAI verified automatically.
- Customer home loads chefs from the backend instead of shipping a fake chef directory.
- Mobile home navigation no longer pretends Catering is the Bookings screen or B2B is the Account screen.
- Customer-facing verification simulator callbacks are disabled in production builds.
- Cancellation now calls the server instead of only changing local UI state.

## Still required before public launch
1. Provision managed PostgreSQL and run `npm run db:postgres:migrate`.
2. Configure live Razorpay credentials and webhook signing secret.
3. Connect a real OTP/SMS provider if OTP login is required by the final product policy.
4. Deploy the Express API behind HTTPS and a stable domain.
5. Configure production push notifications (FCM/APNs) and email/SMS delivery.
6. Replace remaining verification simulation/admin demo screens with approved provider integrations and real document workflows.
7. Create the first real admin with `npm run admin:create` using secret-manager environment variables.
8. Build/sign the Android App Bundle with current Android tooling and verify against the current Google Play target API requirement.
9. Add a real iOS native wrapper (Capacitor or equivalent), configure signing in Xcode, and submit through App Store Connect.
10. Complete legal, privacy, refund/cancellation, safety, chef agreement, support, GST/business and app-store materials.

## Validation performed in this environment
- TypeScript/TSX transpilation across `src`, `server`, `scripts`, and `tests`: **0 diagnostics**.
- Full dependency-backed Vite build and automated test suite were **not run** because `node_modules` could not be installed within the available execution window.
- No live PostgreSQL, Razorpay, SMS, FCM/APNs, government verification, Android signing, or iOS/Xcode validation was performed here.

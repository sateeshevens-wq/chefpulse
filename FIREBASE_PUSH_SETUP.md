# ChefPulse Firebase Push Setup

ChefPulse now has an opt-in FCM/Web Push foundation.

## Frontend environment

Create these Vite variables in the deployment environment:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_VAPID_KEY`

The Firebase web app configuration values are client configuration. Do not put Firebase service-account credentials here.

## User flow

Push permission is not requested automatically. Call `enablePushNotifications()` from an explicit user action such as `Enable notifications` in account/settings or after a user has completed a booking.

The browser registers `/firebase-messaging-sw.js`, obtains an FCM token using the VAPID public key, and sends the token to the authenticated ChefPulse API.

## Backend sending

Token registration is ready, but actual server-to-device delivery still requires a secure Firebase Admin/server credential on the backend. Do not put that credential in the frontend or commit it to the repository.

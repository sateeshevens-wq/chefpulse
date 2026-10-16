# ChefPulse Firebase Free Foundation

Firebase is used as the notification foundation. This project does not request
notification permission automatically and does not store service-account keys
in the app.

## Get the web configuration

In Firebase Console:
1. Open the ChefPulse project.
2. Open Project settings (gear icon).
3. Under **Your apps**, add a **Web** app if one does not already exist.
4. Use the app nickname `ChefPulse Web`.
5. Firebase will show a configuration object containing `apiKey`, `authDomain`,
   `projectId`, `storageBucket`, `messagingSenderId`, and `appId`.
6. Put those values into the local/server build environment using the matching
   `VITE_FIREBASE_*` names in `.env.example`.

These browser Firebase configuration values are client configuration. Never put
Firebase Admin SDK service-account JSON, private keys, or other server secrets
into the browser bundle or source repository.

## Push notifications

The app currently prepares Firebase messaging without automatically asking the
user for notification permission. The final Android/iOS push implementation will
be completed with native Firebase/Capacitor messaging and platform credentials.
Do not claim push delivery is live until that integration is tested on real devices.

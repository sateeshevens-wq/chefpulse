/* ChefPulse Firebase Messaging service worker. */
/* Values are replaced at deployment/build time when VITE_FIREBASE_* variables are configured. */
importScripts('https://www.gstatic.com/firebasejs/12.4.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.4.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: '__VITE_FIREBASE_API_KEY__',
  authDomain: '__VITE_FIREBASE_AUTH_DOMAIN__',
  projectId: '__VITE_FIREBASE_PROJECT_ID__',
  storageBucket: '__VITE_FIREBASE_STORAGE_BUCKET__',
  messagingSenderId: '__VITE_FIREBASE_MESSAGING_SENDER_ID__',
  appId: '__VITE_FIREBASE_APP_ID__'
};

const configured = Object.values(firebaseConfig).every((value) => value && !value.startsWith('__VITE_'));

if (configured) {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();
  messaging.onBackgroundMessage((payload) => {
    const notification = payload?.notification || {};
    const title = notification.title || 'ChefPulse';
    const options = {
      body: notification.body || 'You have a new ChefPulse update.',
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      data: payload?.data || {}
    };
    self.registration.showNotification(title, options);
  });
}

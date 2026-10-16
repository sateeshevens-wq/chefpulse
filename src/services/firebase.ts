/**
 * Firebase Cloud Messaging client foundation.
 *
 * Firebase web configuration is public client configuration. Never put service-account
 * credentials or private keys in Vite variables.
 *
 * Push permission is deliberately opt-in: the app should ask at a useful moment,
 * not immediately on first launch.
 */
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getMessaging, getToken, isSupported, onMessage, type Messaging } from 'firebase/messaging';
import { api } from './api';

const env = (import.meta as any).env || {};

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || '',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: env.VITE_FIREBASE_APP_ID || '',
};

const vapidKey = env.VITE_FIREBASE_VAPID_KEY || '';

export function isFirebaseConfigured(): boolean {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.messagingSenderId &&
    firebaseConfig.appId
  );
}

export function getFirebaseApp(): FirebaseApp | null {
  if (!isFirebaseConfigured()) return null;
  return getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
}

export async function getFirebaseMessaging(): Promise<Messaging | null> {
  const app = getFirebaseApp();
  if (!app) return null;

  try {
    if (!(await isSupported())) return null;
    return getMessaging(app);
  } catch {
    return null;
  }
}

/**
 * Ask for browser notifications only when the user explicitly enables them.
 * Returns null when the browser/provider is unavailable or permission is denied.
 */
export async function enablePushNotifications(): Promise<string | null> {
  if (!isFirebaseConfigured() || !vapidKey || typeof window === 'undefined' || !('Notification' in window)) {
    return null;
  }

  const messaging = await getFirebaseMessaging();
  if (!messaging) return null;

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return null;

  const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
  const token = await getToken(messaging, { vapidKey, serviceWorkerRegistration: registration });
  if (!token) return null;

  const result = await api.registerPushToken({ token, platform: 'web' });
  return result.success ? token : null;
}

/** Foreground messages are surfaced to the app UI; the backend remains authoritative. */
export async function subscribeToForegroundPush(
  handler: (payload: any) => void
): Promise<(() => void) | null> {
  const messaging = await getFirebaseMessaging();
  if (!messaging) return null;
  return onMessage(messaging, handler);
}

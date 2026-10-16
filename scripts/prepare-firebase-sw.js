import fs from 'fs';
import path from 'path';

const root = process.cwd();
const source = path.join(root, 'public', 'firebase-messaging-sw.js');
if (!fs.existsSync(source)) process.exit(0);

const env = process.env;
let content = fs.readFileSync(source, 'utf8');
const keys = [
  'API_KEY', 'AUTH_DOMAIN', 'PROJECT_ID', 'STORAGE_BUCKET',
  'MESSAGING_SENDER_ID', 'APP_ID'
];
for (const key of keys) {
  const value = env[`VITE_FIREBASE_${key}`] || '';
  content = content.replaceAll(`__VITE_FIREBASE_${key}__`, value.replace(/\\/g, '\\\\').replace(/'/g, "\\'"));
}
fs.writeFileSync(source, content);
console.log('[Firebase] Messaging service worker prepared.');

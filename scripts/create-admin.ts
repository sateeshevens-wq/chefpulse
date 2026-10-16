import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { initDatabase, queryOne, run } from '../server/db/database.js';

const email = process.env.ADMIN_EMAIL?.trim();
const phone = process.env.ADMIN_PHONE?.trim();
const password = process.env.ADMIN_PASSWORD;
const name = process.env.ADMIN_NAME?.trim() || 'ChefPulse Admin';

if (!email || !phone || !password || password.length < 12) {
  throw new Error('ADMIN_EMAIL, ADMIN_PHONE and ADMIN_PASSWORD (minimum 12 characters) are required.');
}

await initDatabase();
const existing = await queryOne('SELECT id FROM users WHERE email = ? OR phone = ?', [email, phone]);
if (existing) throw new Error('An account with this email or phone already exists.');

const id = `usr-admin-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
const hash = await bcrypt.hash(password, 12);
await run(
  `INSERT INTO users (
    id, email, phone, password_hash, role, status, name, avatar,
    verified, city_id, city_name, address, lat, lng, created_at, updated_at
  ) VALUES (?, ?, ?, ?, 'admin', 'active', ?, NULL, TRUE, 'blr', 'Bengaluru', 'ChefPulse', 12.9716, 77.5946, datetime('now'), datetime('now'))`,
  [id, email, phone, hash, name]
);

console.log(`Created admin account ${email}. Keep the password in your secret manager.`);

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import crypto from 'node:crypto';
import dotenv from 'dotenv';
import initSqlJs from 'sql.js';
import { Client } from 'pg';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL is required.');
const sqlitePath = process.env.DATABASE_PATH || path.resolve(process.cwd(), 'data', 'chefpulse.db');
if (!fs.existsSync(sqlitePath)) throw new Error(`SQLite database not found: ${sqlitePath}`);

const SQL = await initSqlJs();
const sqlite = new SQL.Database(fs.readFileSync(sqlitePath));
const ssl = process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== 'false' };
const client = new Client({ connectionString: databaseUrl, ssl });

function rows(table: string): any[] {
  const result = sqlite.exec(`SELECT * FROM "${table}"`);
  if (!result.length) return [];
  const columns = result[0].columns;
  return result[0].values.map(values => Object.fromEntries(columns.map((c, i) => [c, values[i]])));
}
function paise(value: any): number { return Math.round(Number(value || 0) * 100); }
function jsonValue(value: any): any {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value !== 'string') return value;
  try { return JSON.parse(value); } catch { return value; }
}
function bool(value: any): boolean { return Number(value) === 1; }
function iso(value: any): any {
  if (!value) return null;
  const text = String(value);
  const normalized = text.includes('T') ? text : text.replace(' ', 'T');
  const withZone = /Z$|[+-]\d{2}:?\d{2}$/.test(normalized) ? normalized : `${normalized}Z`;
  const parsed = new Date(withZone);
  if (Number.isNaN(parsed.getTime())) throw new Error(`Invalid timestamp: ${text}`);
  return parsed;
}
function bookingScheduledTime(value: any, createdAt: any): any {
  const text = String(value ?? '').trim();
  if (!text || text.toLowerCase() === 'immediate') return iso(createdAt) ?? new Date();
  return iso(value);
}
async function insert(table: string, columns: string[], values: any[]): Promise<void> {
  const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
  await client.query(`INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`, values);
}

await client.connect();
try {
  await client.query('BEGIN');

  for (const r of rows('users')) await insert('users', ['id','email','phone','password_hash','role','status','suspension_reason','name','avatar','verified','email_verified','phone_verified','city_id','city_name','address','lat','lng','reset_token','reset_token_expires_at','created_at','updated_at'], [r.id,r.email,r.phone,r.password_hash,r.role,r.status,r.suspension_reason,r.name,r.avatar,bool(r.verified),bool(r.email_verified),bool(r.phone_verified),r.city_id,r.city_name,r.address,r.lat,r.lng,r.reset_token,iso(r.reset_token_expires_at),iso(r.created_at),iso(r.updated_at)]);
  for (const r of rows('customer_profiles')) await insert('customer_profiles', ['id','user_id','dietary_preference','household_size','favorite_cuisines','created_at','updated_at'], [r.id,r.user_id,r.dietary_preference,r.household_size,jsonValue(r.favorite_cuisines),iso(r.created_at),iso(r.updated_at)]);
  for (const r of rows('chef_profiles')) await insert('chef_profiles', ['id','user_id','experience_years','specialties','bio','languages','hourly_rate','sos_rate','day_prep_rate','shift_rate','signature_dishes','gallery_images','rating','reviews_count','is_online','status','distance_km','current_lat','current_lng','current_area','hygiene_certified','police_verified','created_at','updated_at'], [r.id,r.user_id,r.experience_years,jsonValue(r.specialties),r.bio,jsonValue(r.languages),r.hourly_rate,r.sos_rate,r.day_prep_rate,r.shift_rate,jsonValue(r.signature_dishes),jsonValue(r.gallery_images),r.rating,r.reviews_count,bool(r.is_online),r.status,r.distance_km,r.current_lat,r.current_lng,r.current_area,bool(r.hygiene_certified),bool(r.police_verified),iso(r.created_at),iso(r.updated_at)]);
  for (const r of rows('addresses')) await insert('addresses', ['id','user_id','label','address_line','city_id','city_name','area','lat','lng','is_default','created_at','updated_at'], [r.id,r.user_id,r.label,r.address_line,r.city_id,r.city_name,r.area,r.lat,r.lng,bool(r.is_default),iso(r.created_at),iso(r.updated_at)]);
  for (const r of rows('chef_availabilities')) await insert('chef_availabilities', ['id','chef_id','day_of_week','start_time','end_time','is_available','created_at','updated_at'], [r.id,r.chef_id,r.day_of_week,r.start_time,r.end_time,bool(r.is_available),iso(r.created_at),iso(r.updated_at)]);

  for (const r of rows('bookings')) await insert('bookings', ['id','booking_number','type','customer_id','chef_id','service_address','area','lat','lng','scheduled_time','guest_count','cuisines','dishes_requested','special_instructions','subtotal_paise','surge_amount_paise','platform_fee_paise','gst_amount_paise','total_amount_paise','status','payment_status','otp_code','eta_minutes','created_at','updated_at'], [r.id,r.booking_number,r.type,r.customer_id,r.chef_id,r.service_address,r.area,r.lat,r.lng,bookingScheduledTime(r.scheduled_time, r.created_at),r.guest_count,jsonValue(r.cuisines),r.dishes_requested,r.special_instructions,paise(r.subtotal),paise(r.surge_amount),paise(r.platform_fee),paise(r.gst_amount),paise(r.total_amount),r.status,r.payment_status,r.otp_code,r.eta_minutes,iso(r.created_at),iso(r.updated_at)]);
  for (const r of rows('booking_status_history')) await insert('booking_status_history', ['id','booking_id','from_status','to_status','changed_by_user_id','changed_by_role','reason','timestamp'], [r.id,r.booking_id,r.from_status,r.to_status,r.changed_by_user_id,r.changed_by_role,r.reason,iso(r.timestamp)]);

  for (const r of rows('payments')) await insert('payments', ['id','booking_id','customer_id','amount_paise','currency','method','provider','provider_order_id','provider_payment_id','transaction_ref','status','escrow_status','idempotency_key','failure_reason','created_at','updated_at'], [r.id,r.booking_id,r.customer_id,Number(r.amount_paise ?? paise(r.amount)),r.currency,r.method,r.provider,r.provider_order_id,r.provider_payment_id,r.transaction_ref,r.status,r.escrow_status,r.idempotency_key,r.failure_reason,iso(r.created_at),iso(r.updated_at)]);
  for (const r of rows('refunds')) await insert('refunds', ['id','payment_id','booking_id','amount_paise','reason','initiated_by_user_id','status','refund_ref','provider_refund_id','created_at','updated_at'], [r.id,r.payment_id,r.booking_id,Number(r.amount_paise ?? paise(r.amount)),r.reason,r.initiated_by_user_id,r.status,r.refund_ref,r.provider_refund_id,iso(r.created_at),iso(r.updated_at)]);
  for (const r of rows('payment_idempotency')) await insert('payment_idempotency', ['id','idempotency_key','scope','user_id','request_hash','response_json','status_code','created_at'], [r.id,r.idempotency_key,r.scope,r.user_id,r.request_hash,jsonValue(r.response_json),r.status_code,iso(r.created_at)]);
  for (const r of rows('webhook_events')) await insert('webhook_events', ['id','provider','provider_event_id','event_type','payload_json','signature','status','processed_at','error_message','created_at'], [r.id,r.provider,r.provider_event_id,r.event_type,jsonValue(r.payload_json),r.signature,r.status,iso(r.processed_at),r.error_message,iso(r.created_at)]);

  for (const r of rows('notifications')) await insert('notifications', ['id','user_id','title','message','type','read','metadata','created_at'], [r.id,r.user_id,r.title,r.message,r.type,bool(r.read),jsonValue(r.metadata),iso(r.created_at)]);
  for (const r of rows('reviews')) await insert('reviews', ['id','booking_id','chef_id','customer_id','customer_name','rating','taste_score','hygiene_score','punctuality_score','comment','service_type','dishes_ordered','verified_booking','helpful_count','created_at'], [r.id,r.booking_id,r.chef_id,r.customer_id,r.customer_name,r.rating,r.taste_score,r.hygiene_score,r.punctuality_score,r.comment,r.service_type,r.dishes_ordered,bool(r.verified_booking),r.helpful_count,iso(r.created_at)]);
  for (const r of rows('reward_accounts')) await insert('reward_accounts', ['id','user_id','total_points','points_spent','current_tier','catering_discount_percentage','completed_bookings_count','created_at','updated_at'], [r.id,r.user_id,r.total_points,r.points_spent,r.current_tier,r.catering_discount_percentage,r.completed_bookings_count,iso(r.created_at),iso(r.updated_at)]);
  for (const r of rows('reward_transactions')) await insert('reward_transactions', ['id','reward_account_id','user_id','booking_id','points','type','description','created_at'], [r.id,r.reward_account_id,r.user_id,r.booking_id,r.points,r.type,r.description,iso(r.created_at)]);
  for (const r of rows('verifications')) await insert('verifications', ['id','chef_id','user_id','verification_type','reference_id','status','score','details_json','verified_at','created_at','updated_at'], [r.id,r.chef_id,r.user_id,r.verification_type,r.reference_id,r.status,r.score,jsonValue(r.details_json),iso(r.verified_at),iso(r.created_at),iso(r.updated_at)]);
  for (const r of rows('audit_logs')) await insert('audit_logs', ['id','event_type','user_id','user_role','target_type','target_id','ip_address','user_agent','details_json','created_at'], [r.id,r.event_type,r.user_id,r.user_role,r.target_type,r.target_id,r.ip_address,r.user_agent,jsonValue(r.details_json),iso(r.created_at)]);
  for (const r of rows('otp_challenges')) await insert('otp_challenges', ['id','phone','user_id','purpose','code_hash','expires_at','attempts','consumed_at','created_at'], [r.id,r.phone,r.user_id,r.purpose,r.code_hash,iso(r.expires_at),r.attempts,iso(r.consumed_at),iso(r.created_at)]);

  await client.query('COMMIT');
  console.log('SQLite -> PostgreSQL migration completed. Existing rows were inserted with ON CONFLICT DO NOTHING.');
  console.log('Legacy bookings with scheduled_time=Immediate were mapped to their created_at timestamp because PostgreSQL scheduled_time is a timestamptz.');
} catch (error) {
  await client.query('ROLLBACK').catch(() => undefined);
  throw error;
} finally {
  sqlite.close();
  await client.end();
}

console.log(`Migration source: ${sqlitePath}`);
console.log(`Migration id: ${crypto.randomUUID()}`);

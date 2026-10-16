-- ChefPulse Relational Database Schema (SQLite 3.x)
-- Enforces primary keys, foreign keys, status checks, timestamps, and indexes.

PRAGMA foreign_keys = ON;

-- 1. Users Model
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  phone TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('customer', 'chef', 'admin', 'support')),
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'suspended', 'deleted')),
  suspension_reason TEXT,
  name TEXT NOT NULL,
  avatar TEXT,
  verified INTEGER NOT NULL DEFAULT 0,
  email_verified INTEGER NOT NULL DEFAULT 0,
  phone_verified INTEGER NOT NULL DEFAULT 0,
  city_id TEXT,
  city_name TEXT,
  address TEXT,
  lat REAL,
  lng REAL,
  reset_token TEXT,
  reset_token_expires_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- 2. Customer Profile
CREATE TABLE IF NOT EXISTS customer_profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  dietary_preference TEXT DEFAULT 'all' CHECK(dietary_preference IN ('all', 'veg', 'non_veg', 'jain', 'vegan')),
  household_size TEXT DEFAULT '2-4 People',
  favorite_cuisines TEXT, -- JSON array string
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Chef Profile
CREATE TABLE IF NOT EXISTS chef_profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  experience_years INTEGER NOT NULL DEFAULT 3,
  specialties TEXT NOT NULL, -- JSON array of specialties
  bio TEXT,
  languages TEXT, -- JSON array
  hourly_rate INTEGER NOT NULL DEFAULT 500,
  sos_rate INTEGER NOT NULL DEFAULT 850,
  day_prep_rate INTEGER NOT NULL DEFAULT 1400,
  shift_rate INTEGER NOT NULL DEFAULT 2800,
  signature_dishes TEXT, -- JSON array
  gallery_images TEXT, -- JSON array
  rating REAL NOT NULL DEFAULT 5.0,
  reviews_count INTEGER NOT NULL DEFAULT 0,
  is_online INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'available' CHECK(status IN ('available', 'busy', 'en_route', 'offline')),
  distance_km REAL DEFAULT 1.5,
  current_lat REAL,
  current_lng REAL,
  current_area TEXT,
  hygiene_certified INTEGER NOT NULL DEFAULT 1,
  police_verified INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_chef_status ON chef_profiles(status);
CREATE INDEX IF NOT EXISTS idx_chef_online ON chef_profiles(is_online);

-- 4. Address Model
CREATE TABLE IF NOT EXISTS addresses (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  label TEXT NOT NULL DEFAULT 'Home',
  address_line TEXT NOT NULL,
  city_id TEXT NOT NULL,
  city_name TEXT NOT NULL,
  area TEXT NOT NULL,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  is_default INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_addresses_user ON addresses(user_id);

-- 5. Chef Availability Model
CREATE TABLE IF NOT EXISTS chef_availabilities (
  id TEXT PRIMARY KEY,
  chef_id TEXT NOT NULL,
  day_of_week INTEGER NOT NULL CHECK(day_of_week BETWEEN 0 AND 6),
  start_time TEXT NOT NULL, -- "09:00"
  end_time TEXT NOT NULL,   -- "21:00"
  is_available INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (chef_id) REFERENCES chef_profiles(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_availability_chef ON chef_availabilities(chef_id);

-- 6. Booking Model
CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  booking_number TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('sos_quick_fix', 'scheduled_prep', 'b2b_gig_shift')),
  customer_id TEXT NOT NULL,
  chef_id TEXT NOT NULL,
  service_address TEXT NOT NULL,
  area TEXT NOT NULL,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  scheduled_time TEXT NOT NULL,
  guest_count INTEGER DEFAULT 2,
  cuisines TEXT, -- JSON array
  dishes_requested TEXT NOT NULL,
  special_instructions TEXT,
  subtotal REAL NOT NULL CHECK(subtotal >= 0),
  surge_amount REAL NOT NULL DEFAULT 0 CHECK(surge_amount >= 0),
  platform_fee REAL NOT NULL DEFAULT 49 CHECK(platform_fee >= 0),
  gst_amount REAL NOT NULL DEFAULT 0 CHECK(gst_amount >= 0),
  total_amount REAL NOT NULL CHECK(total_amount >= 0),
  status TEXT NOT NULL DEFAULT 'requested' CHECK(status IN (
    'requested',
    'pending_payment',
    'paid',
    'accepted',
    'rejected',
    'chef_en_route',
    'chef_arrived',
    'otp_verified',
    'service_started',
    'completed',
    'cancelled',
    'refund_pending',
    'refunded',
    'disputed'
  )),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK(payment_status IN ('pending', 'paid', 'refunded', 'disputed')),
  otp_code TEXT NOT NULL,
  eta_minutes INTEGER DEFAULT 15,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (customer_id) REFERENCES users(id),
  FOREIGN KEY (chef_id) REFERENCES chef_profiles(id)
);

CREATE INDEX IF NOT EXISTS idx_bookings_customer ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_chef ON bookings(chef_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_created ON bookings(created_at);

-- 7. Booking Status History
CREATE TABLE IF NOT EXISTS booking_status_history (
  id TEXT PRIMARY KEY,
  booking_id TEXT NOT NULL,
  from_status TEXT,
  to_status TEXT NOT NULL,
  changed_by_user_id TEXT NOT NULL,
  changed_by_role TEXT NOT NULL,
  reason TEXT,
  timestamp TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (changed_by_user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_status_history_booking ON booking_status_history(booking_id);

-- 8. Payment Model (Hardened with integer minor units / paise and provider order linkage)
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  booking_id TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  amount REAL NOT NULL CHECK(amount >= 0),
  amount_paise INTEGER NOT NULL CHECK(amount_paise >= 0),
  currency TEXT NOT NULL DEFAULT 'INR',
  method TEXT NOT NULL DEFAULT 'upi' CHECK(method IN ('upi', 'card', 'netbanking', 'wallet')),
  provider TEXT NOT NULL DEFAULT 'escrow_simulation',
  provider_order_id TEXT,
  provider_payment_id TEXT,
  transaction_ref TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'created' CHECK(status IN ('created', 'pending', 'authorized', 'captured', 'failed', 'cancelled', 'refunded', 'partially_refunded')),
  escrow_status TEXT NOT NULL DEFAULT 'held' CHECK(escrow_status IN ('held', 'released_to_chef', 'refunded_to_customer')),
  idempotency_key TEXT,
  failure_reason TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_payments_booking ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_customer ON payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_provider_order ON payments(provider_order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- 9. Refund Model (Hardened with integer minor units / paise and provider refund linkage)
CREATE TABLE IF NOT EXISTS refunds (
  id TEXT PRIMARY KEY,
  payment_id TEXT NOT NULL,
  booking_id TEXT NOT NULL,
  amount REAL NOT NULL CHECK(amount > 0),
  amount_paise INTEGER NOT NULL CHECK(amount_paise > 0),
  reason TEXT NOT NULL,
  initiated_by_user_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'processed', 'failed')),
  refund_ref TEXT UNIQUE NOT NULL,
  provider_refund_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (initiated_by_user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_refunds_booking ON refunds(booking_id);
CREATE INDEX IF NOT EXISTS idx_refunds_payment ON refunds(payment_id);

-- 9B. Payment Idempotency Keys (Deduplication for create-intent, confirmation, refund)
CREATE TABLE IF NOT EXISTS payment_idempotency (
  id TEXT PRIMARY KEY,
  idempotency_key TEXT NOT NULL,
  scope TEXT NOT NULL,
  user_id TEXT NOT NULL,
  request_hash TEXT NOT NULL,
  response_json TEXT NOT NULL,
  status_code INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_idempotency_lookup ON payment_idempotency(idempotency_key, scope, user_id);

-- 9C. Provider-Agnostic Webhook Events (Deduplication & Audit for Razorpay/Cashfree)
CREATE TABLE IF NOT EXISTS webhook_events (
  id TEXT PRIMARY KEY,
  provider TEXT NOT NULL,
  provider_event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  signature TEXT,
  status TEXT NOT NULL DEFAULT 'received' CHECK(status IN ('received', 'processed', 'duplicate', 'failed')),
  processed_at TEXT,
  error_message TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_provider ON webhook_events(provider, event_type);

-- 10. Notification Model
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'system' CHECK(type IN ('booking', 'chef', 'b2b', 'system', 'emergency')),
  read INTEGER NOT NULL DEFAULT 0,
  metadata TEXT, -- JSON payload
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- Push device registrations (FCM/Web Push)
CREATE TABLE IF NOT EXISTS push_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  platform TEXT NOT NULL CHECK(platform IN ('web','android','ios')),
  device_id TEXT,
  active INTEGER NOT NULL DEFAULT 1,
  last_seen_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_push_tokens_user_active ON push_tokens(user_id, active);

-- 11. Review Model
CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  booking_id TEXT NOT NULL,
  chef_id TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
  taste_score REAL DEFAULT 5.0,
  hygiene_score REAL DEFAULT 5.0,
  punctuality_score REAL DEFAULT 5.0,
  comment TEXT,
  service_type TEXT NOT NULL,
  dishes_ordered TEXT,
  verified_booking INTEGER NOT NULL DEFAULT 1,
  helpful_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (chef_id) REFERENCES chef_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_reviews_chef ON reviews(chef_id);
CREATE INDEX IF NOT EXISTS idx_reviews_booking ON reviews(booking_id);

-- 12. Reward Account Model
CREATE TABLE IF NOT EXISTS reward_accounts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  total_points INTEGER NOT NULL DEFAULT 0 CHECK(total_points >= 0),
  points_spent INTEGER NOT NULL DEFAULT 0 CHECK(points_spent >= 0),
  current_tier TEXT NOT NULL DEFAULT 'Bronze Epicure' CHECK(current_tier IN ('Bronze Epicure', 'Silver Gourmet', 'Gold Connoisseur', 'Platinum Grand Cru')),
  catering_discount_percentage REAL NOT NULL DEFAULT 5.0,
  completed_bookings_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_reward_user ON reward_accounts(user_id);

-- 13. Reward Transaction Model
CREATE TABLE IF NOT EXISTS reward_transactions (
  id TEXT PRIMARY KEY,
  reward_account_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  booking_id TEXT,
  points INTEGER NOT NULL, -- positive for credit, negative for debit
  type TEXT NOT NULL CHECK(type IN ('earn', 'redeem', 'adjustment', 'dispute_credit')),
  description TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (reward_account_id) REFERENCES reward_accounts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_reward_tx_account ON reward_transactions(reward_account_id);

-- 14. Verification Model
CREATE TABLE IF NOT EXISTS verifications (
  id TEXT PRIMARY KEY,
  chef_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  verification_type TEXT NOT NULL CHECK(verification_type IN ('aadhaar', 'fssai', 'police', 'hygiene', 'overall')),
  reference_id TEXT,
  status TEXT NOT NULL DEFAULT 'unverified' CHECK(status IN ('unverified', 'pending', 'verified', 'flagged', 'rejected')),
  score REAL DEFAULT 0,
  details_json TEXT, -- Masked Aadhaar, FSSAI license, CCTNS report details
  verified_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (chef_id) REFERENCES chef_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_verifications_chef ON verifications(chef_id);
CREATE INDEX IF NOT EXISTS idx_verifications_type ON verifications(verification_type);

-- 15. Audit Log Model (STRICTLY IMMUTABLE - No Update, No Delete)
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  user_id TEXT,
  user_role TEXT,
  target_type TEXT,
  target_id TEXT,
  ip_address TEXT,
  user_agent TEXT,
  details_json TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_audit_event ON audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at);

-- 16. Schema migration ledger (V6)
CREATE TABLE IF NOT EXISTS schema_migrations (
  version INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  applied_at TEXT NOT NULL DEFAULT (datetime('now'))
);
INSERT OR IGNORE INTO schema_migrations(version, name) VALUES (1, 'baseline');

-- Provider-backed OTP verification records. The OTP itself is never stored by ChefPulse.
CREATE TABLE IF NOT EXISTS otp_provider_verifications (
  id TEXT PRIMARY KEY,
  phone TEXT NOT NULL,
  user_id TEXT,
  purpose TEXT NOT NULL CHECK(purpose IN ('registration','login','phone_change')),
  provider TEXT NOT NULL,
  provider_verification_id_hash TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  consumed_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_otp_provider_phone ON otp_provider_verifications(phone, purpose, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_otp_provider_active ON otp_provider_verifications(phone, purpose, consumed_at, expires_at);

-- V19: Grocery fulfillment orders and separate ingredient payments.
CREATE TABLE IF NOT EXISTS grocery_orders (
  id TEXT PRIMARY KEY,
  booking_id TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  partner TEXT NOT NULL CHECK(partner IN ('zepto','blinkit','bigbasket')),
  address TEXT NOT NULL,
  area TEXT NOT NULL,
  items_json TEXT NOT NULL,
  total_paise INTEGER NOT NULL CHECK(total_paise > 0),
  status TEXT NOT NULL DEFAULT 'created' CHECK(status IN ('created','payment_pending','paid','out_for_delivery','delivered_to_customer','cancelled')),
  delivered_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_grocery_orders_booking ON grocery_orders(booking_id);
CREATE INDEX IF NOT EXISTS idx_grocery_orders_customer ON grocery_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_grocery_orders_status ON grocery_orders(status);

CREATE TABLE IF NOT EXISTS grocery_order_payments (
  id TEXT PRIMARY KEY,
  grocery_order_id TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  amount_paise INTEGER NOT NULL CHECK(amount_paise > 0),
  currency TEXT NOT NULL DEFAULT 'INR',
  provider TEXT NOT NULL,
  provider_order_id TEXT,
  provider_payment_id TEXT,
  transaction_ref TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'created' CHECK(status IN ('created','pending','captured','failed','cancelled','refunded')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (grocery_order_id) REFERENCES grocery_orders(id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_grocery_payments_order ON grocery_order_payments(grocery_order_id);
CREATE INDEX IF NOT EXISTS idx_grocery_payments_customer ON grocery_order_payments(customer_id);

-- ChefPulse PostgreSQL production schema
-- V6 migration foundation. Application cutover happens after repository migration.

BEGIN;

CREATE TABLE IF NOT EXISTS schema_migrations (
  version INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  phone TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('customer','chef','admin','support')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended','deleted')),
  suspension_reason TEXT,
  name TEXT NOT NULL,
  avatar TEXT,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
  city_id TEXT,
  city_name TEXT,
  address TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  reset_token TEXT,
  reset_token_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

CREATE TABLE IF NOT EXISTS customer_profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  dietary_preference TEXT DEFAULT 'all' CHECK (dietary_preference IN ('all','veg','non_veg','jain','vegan')),
  household_size TEXT DEFAULT '2-4 People',
  favorite_cuisines JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chef_profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  experience_years INTEGER NOT NULL DEFAULT 3,
  specialties JSONB NOT NULL DEFAULT '[]'::jsonb,
  bio TEXT,
  languages JSONB,
  hourly_rate INTEGER NOT NULL DEFAULT 500,
  sos_rate INTEGER NOT NULL DEFAULT 850,
  day_prep_rate INTEGER NOT NULL DEFAULT 1400,
  shift_rate INTEGER NOT NULL DEFAULT 2800,
  signature_dishes JSONB,
  gallery_images JSONB,
  rating DOUBLE PRECISION NOT NULL DEFAULT 5.0,
  reviews_count INTEGER NOT NULL DEFAULT 0,
  is_online BOOLEAN NOT NULL DEFAULT TRUE,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available','busy','en_route','offline')),
  distance_km DOUBLE PRECISION DEFAULT 1.5,
  current_lat DOUBLE PRECISION,
  current_lng DOUBLE PRECISION,
  current_area TEXT,
  hygiene_certified BOOLEAN NOT NULL DEFAULT FALSE,
  police_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_chef_status ON chef_profiles(status);
CREATE INDEX IF NOT EXISTS idx_chef_online ON chef_profiles(is_online);

CREATE TABLE IF NOT EXISTS addresses (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label TEXT NOT NULL DEFAULT 'Home',
  address_line TEXT NOT NULL,
  city_id TEXT NOT NULL,
  city_name TEXT NOT NULL,
  area TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_addresses_user ON addresses(user_id);

CREATE TABLE IF NOT EXISTS chef_availabilities (
  id TEXT PRIMARY KEY,
  chef_id TEXT NOT NULL REFERENCES chef_profiles(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_availability_chef ON chef_availabilities(chef_id);

CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  booking_number TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('sos_quick_fix','scheduled_prep','b2b_gig_shift')),
  customer_id TEXT NOT NULL REFERENCES users(id),
  chef_id TEXT NOT NULL REFERENCES chef_profiles(id),
  service_address TEXT NOT NULL,
  area TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  scheduled_time TIMESTAMPTZ NOT NULL,
  service_duration_minutes INTEGER NOT NULL DEFAULT 60 CHECK (service_duration_minutes > 0 AND service_duration_minutes <= 1440),
  guest_count INTEGER DEFAULT 2,
  cuisines JSONB,
  dishes_requested TEXT NOT NULL,
  special_instructions TEXT,
  subtotal_paise INTEGER NOT NULL DEFAULT 0 CHECK (subtotal_paise >= 0),
  surge_amount_paise INTEGER NOT NULL DEFAULT 0 CHECK (surge_amount_paise >= 0),
  platform_fee_paise INTEGER NOT NULL DEFAULT 4900 CHECK (platform_fee_paise >= 0),
  gst_amount_paise INTEGER NOT NULL DEFAULT 0 CHECK (gst_amount_paise >= 0),
  total_amount_paise INTEGER NOT NULL DEFAULT 0 CHECK (total_amount_paise >= 0),
  subtotal DOUBLE PRECISION NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
  surge_amount DOUBLE PRECISION NOT NULL DEFAULT 0 CHECK (surge_amount >= 0),
  platform_fee DOUBLE PRECISION NOT NULL DEFAULT 49 CHECK (platform_fee >= 0),
  gst_amount DOUBLE PRECISION NOT NULL DEFAULT 0 CHECK (gst_amount >= 0),
  total_amount DOUBLE PRECISION NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
  status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested','pending_payment','paid','accepted','rejected','chef_en_route','chef_arrived','otp_verified','service_started','completed','cancelled','refund_pending','refunded','disputed')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending','paid','refunded','disputed')),
  otp_code TEXT NOT NULL,
  eta_minutes INTEGER DEFAULT 15,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_bookings_customer ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_chef ON bookings(chef_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_scheduled ON bookings(chef_id, scheduled_time);

-- V10: service windows prevent overlapping chef bookings instead of only exact timestamp collisions.
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS service_duration_minutes INTEGER NOT NULL DEFAULT 60;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'bookings_service_duration_positive') THEN
    ALTER TABLE bookings ADD CONSTRAINT bookings_service_duration_positive CHECK (service_duration_minutes > 0 AND service_duration_minutes <= 1440);
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS idx_bookings_chef_window ON bookings(chef_id, scheduled_time, service_duration_minutes);

-- Concurrency is protected in application transactions with a transaction-scoped advisory lock
-- on the chef schedule. Do not use a unique timestamp index here: immediate bookings and
-- variable-duration services cannot be represented safely by a single exact-time key.
DROP INDEX IF EXISTS ux_active_chef_booking_slot;

CREATE TABLE IF NOT EXISTS booking_status_history (
  id TEXT PRIMARY KEY,
  booking_id TEXT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  from_status TEXT,
  to_status TEXT NOT NULL,
  changed_by_user_id TEXT NOT NULL REFERENCES users(id),
  changed_by_role TEXT NOT NULL,
  reason TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_status_history_booking ON booking_status_history(booking_id, timestamp);

CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  booking_id TEXT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  customer_id TEXT NOT NULL REFERENCES users(id),
  amount_paise INTEGER NOT NULL CHECK (amount_paise >= 0),
  amount DOUBLE PRECISION NOT NULL DEFAULT 0 CHECK (amount >= 0),
  currency TEXT NOT NULL DEFAULT 'INR',
  method TEXT NOT NULL DEFAULT 'upi' CHECK (method IN ('upi','card','netbanking','wallet')),
  provider TEXT NOT NULL,
  provider_order_id TEXT,
  provider_payment_id TEXT,
  transaction_ref TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'created' CHECK (status IN ('created','pending','authorized','captured','failed','cancelled','refunded','partially_refunded')),
  escrow_status TEXT NOT NULL DEFAULT 'held' CHECK (escrow_status IN ('held','released_to_chef','refunded_to_customer')),
  idempotency_key TEXT,
  failure_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_payments_booking ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_provider_order ON payments(provider_order_id);
CREATE INDEX IF NOT EXISTS idx_payments_provider_payment ON payments(provider_payment_id);
CREATE UNIQUE INDEX IF NOT EXISTS ux_payment_idempotency ON payments(customer_id, idempotency_key) WHERE idempotency_key IS NOT NULL;

CREATE TABLE IF NOT EXISTS refunds (
  id TEXT PRIMARY KEY,
  payment_id TEXT NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  booking_id TEXT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  amount_paise INTEGER NOT NULL CHECK (amount_paise > 0),
  amount DOUBLE PRECISION NOT NULL DEFAULT 0 CHECK (amount > 0),
  reason TEXT NOT NULL,
  initiated_by_user_id TEXT NOT NULL REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processed','failed')),
  refund_ref TEXT UNIQUE NOT NULL,
  provider_refund_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_refunds_payment ON refunds(payment_id);
CREATE UNIQUE INDEX IF NOT EXISTS ux_refunds_provider_refund ON refunds(provider_refund_id) WHERE provider_refund_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS payment_idempotency (
  id TEXT PRIMARY KEY,
  idempotency_key TEXT NOT NULL,
  scope TEXT NOT NULL,
  user_id TEXT NOT NULL,
  request_hash TEXT NOT NULL,
  response_json JSONB NOT NULL,
  status_code INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(idempotency_key, scope, user_id)
);

CREATE TABLE IF NOT EXISTS webhook_events (
  id TEXT PRIMARY KEY,
  provider TEXT NOT NULL,
  provider_event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  payload_json JSONB NOT NULL,
  signature TEXT,
  status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received','processed','duplicate','failed')),
  processed_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_webhook_events_provider ON webhook_events(provider, event_type);

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'system' CHECK (type IN ('booking','chef','b2b','system','emergency')),
  read BOOLEAN NOT NULL DEFAULT FALSE,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  booking_id TEXT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  chef_id TEXT NOT NULL REFERENCES chef_profiles(id) ON DELETE CASCADE,
  customer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  taste_score DOUBLE PRECISION DEFAULT 5.0,
  hygiene_score DOUBLE PRECISION DEFAULT 5.0,
  punctuality_score DOUBLE PRECISION DEFAULT 5.0,
  comment TEXT,
  service_type TEXT NOT NULL,
  dishes_ordered TEXT,
  verified_booking BOOLEAN NOT NULL DEFAULT TRUE,
  helpful_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_reviews_chef ON reviews(chef_id);

CREATE TABLE IF NOT EXISTS reward_accounts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  total_points INTEGER NOT NULL DEFAULT 0 CHECK (total_points >= 0),
  points_spent INTEGER NOT NULL DEFAULT 0 CHECK (points_spent >= 0),
  current_tier TEXT NOT NULL DEFAULT 'Bronze Epicure',
  catering_discount_percentage DOUBLE PRECISION NOT NULL DEFAULT 5.0,
  completed_bookings_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reward_transactions (
  id TEXT PRIMARY KEY,
  reward_account_id TEXT NOT NULL REFERENCES reward_accounts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  booking_id TEXT,
  points INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('earn','redeem','adjustment','dispute_credit')),
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_reward_tx_account ON reward_transactions(reward_account_id, created_at DESC);

CREATE TABLE IF NOT EXISTS verifications (
  id TEXT PRIMARY KEY,
  chef_id TEXT NOT NULL REFERENCES chef_profiles(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  verification_type TEXT NOT NULL CHECK (verification_type IN ('aadhaar','fssai','police','hygiene','overall')),
  reference_id TEXT,
  status TEXT NOT NULL DEFAULT 'unverified' CHECK (status IN ('unverified','pending','verified','flagged','rejected')),
  score DOUBLE PRECISION DEFAULT 0,
  details_json JSONB,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_verifications_chef ON verifications(chef_id);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  user_id TEXT,
  user_role TEXT,
  target_type TEXT,
  target_id TEXT,
  ip_address INET,
  user_agent TEXT,
  details_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_event ON audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at DESC);

-- OTP challenges were added in V4.
CREATE TABLE IF NOT EXISTS otp_challenges (
  id TEXT PRIMARY KEY,
  phone TEXT NOT NULL,
  user_id TEXT,
  purpose TEXT NOT NULL CHECK (purpose IN ('registration','login','phone_change')),
  code_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  consumed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_otp_phone_purpose ON otp_challenges(phone, purpose, created_at DESC);


-- Compatibility synchronization for legacy rupee columns while the application finishes
-- moving to integer minor-unit fields. New writes may provide either representation.
CREATE OR REPLACE FUNCTION chefpulse_sync_money_columns() RETURNS trigger AS $$
BEGIN
  IF TG_TABLE_NAME = 'bookings' THEN
    IF NEW.subtotal_paise = 0 AND NEW.subtotal <> 0 THEN NEW.subtotal_paise := ROUND(NEW.subtotal * 100)::INTEGER; END IF;
    IF NEW.surge_amount_paise = 0 AND NEW.surge_amount <> 0 THEN NEW.surge_amount_paise := ROUND(NEW.surge_amount * 100)::INTEGER; END IF;
    IF NEW.platform_fee_paise = 4900 AND NEW.platform_fee <> 49 THEN NEW.platform_fee_paise := ROUND(NEW.platform_fee * 100)::INTEGER; END IF;
    IF NEW.gst_amount_paise = 0 AND NEW.gst_amount <> 0 THEN NEW.gst_amount_paise := ROUND(NEW.gst_amount * 100)::INTEGER; END IF;
    IF NEW.total_amount_paise = 0 AND NEW.total_amount <> 0 THEN NEW.total_amount_paise := ROUND(NEW.total_amount * 100)::INTEGER; END IF;
    NEW.subtotal := NEW.subtotal_paise / 100.0;
    NEW.surge_amount := NEW.surge_amount_paise / 100.0;
    NEW.platform_fee := NEW.platform_fee_paise / 100.0;
    NEW.gst_amount := NEW.gst_amount_paise / 100.0;
    NEW.total_amount := NEW.total_amount_paise / 100.0;
  ELSIF TG_TABLE_NAME = 'payments' THEN
    IF NEW.amount_paise = 0 AND NEW.amount <> 0 THEN NEW.amount_paise := ROUND(NEW.amount * 100)::INTEGER; END IF;
    NEW.amount := NEW.amount_paise / 100.0;
  ELSIF TG_TABLE_NAME = 'refunds' THEN
    IF NEW.amount_paise = 0 AND NEW.amount <> 0 THEN NEW.amount_paise := ROUND(NEW.amount * 100)::INTEGER; END IF;
    NEW.amount := NEW.amount_paise / 100.0;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_booking_money ON bookings;
CREATE TRIGGER trg_sync_booking_money BEFORE INSERT OR UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION chefpulse_sync_money_columns();
DROP TRIGGER IF EXISTS trg_sync_payment_money ON payments;
CREATE TRIGGER trg_sync_payment_money BEFORE INSERT OR UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION chefpulse_sync_money_columns();
DROP TRIGGER IF EXISTS trg_sync_refund_money ON refunds;
CREATE TRIGGER trg_sync_refund_money BEFORE INSERT OR UPDATE ON refunds FOR EACH ROW EXECUTE FUNCTION chefpulse_sync_money_columns();

INSERT INTO schema_migrations(version, name) VALUES (1, 'v6-production-postgres-foundation') ON CONFLICT (version) DO NOTHING;
INSERT INTO schema_migrations(version, name) VALUES (2, 'v8-postgres-runtime-cutover') ON CONFLICT (version) DO NOTHING;

COMMIT;

-- V11: provider-backed OTP verification records. OTP values are never stored by ChefPulse.
CREATE TABLE IF NOT EXISTS otp_provider_verifications (
  id TEXT PRIMARY KEY,
  phone TEXT NOT NULL,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  purpose TEXT NOT NULL CHECK (purpose IN ('registration','login','phone_change')),
  provider TEXT NOT NULL,
  provider_verification_id_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_otp_provider_phone ON otp_provider_verifications(phone, purpose, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_otp_provider_active ON otp_provider_verifications(phone, purpose, consumed_at, expires_at);
INSERT INTO schema_migrations(version, name) VALUES (3, 'v11-provider-backed-otp-verification') ON CONFLICT (version) DO NOTHING;

-- V19 grocery fulfillment tables are also delivered as a separate migration:
-- supabase/migrations/20261015000001_v19_grocery_fulfillment.sql

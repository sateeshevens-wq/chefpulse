-- ChefPulse V19: separate grocery fulfilment and ingredient payment lifecycle.
CREATE TABLE IF NOT EXISTS grocery_orders (
  id TEXT PRIMARY KEY,
  booking_id TEXT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  customer_id TEXT NOT NULL REFERENCES users(id),
  partner TEXT NOT NULL CHECK(partner IN ('zepto','blinkit','bigbasket')),
  address TEXT NOT NULL,
  area TEXT NOT NULL,
  items_json JSONB NOT NULL,
  total_paise INTEGER NOT NULL CHECK(total_paise > 0),
  status TEXT NOT NULL DEFAULT 'created' CHECK(status IN ('created','payment_pending','paid','out_for_delivery','delivered_to_customer','cancelled')),
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_grocery_orders_booking ON grocery_orders(booking_id);
CREATE INDEX IF NOT EXISTS idx_grocery_orders_customer ON grocery_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_grocery_orders_status ON grocery_orders(status);

CREATE TABLE IF NOT EXISTS grocery_order_payments (
  id TEXT PRIMARY KEY,
  grocery_order_id TEXT NOT NULL REFERENCES grocery_orders(id) ON DELETE CASCADE,
  customer_id TEXT NOT NULL REFERENCES users(id),
  amount_paise INTEGER NOT NULL CHECK(amount_paise > 0),
  currency TEXT NOT NULL DEFAULT 'INR',
  provider TEXT NOT NULL,
  provider_order_id TEXT,
  provider_payment_id TEXT,
  transaction_ref TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'created' CHECK(status IN ('created','pending','captured','failed','cancelled','refunded')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_grocery_payments_order ON grocery_order_payments(grocery_order_id);
CREATE INDEX IF NOT EXISTS idx_grocery_payments_customer ON grocery_order_payments(customer_id);

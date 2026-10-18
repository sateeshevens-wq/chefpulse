-- ChefPulse core Supabase migration
-- Adds the three mobile-facing core entities without replacing the existing
-- production-oriented schema already present in this repository.

BEGIN;

-- Existing public.users is retained for compatibility. The requested avatar_url
-- field is added to the existing users record instead of replacing legacy columns.
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;

CREATE TABLE IF NOT EXISTS public.chefs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  rating NUMERIC(3,2) NOT NULL DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  hourly_rate NUMERIC(10,2) NOT NULL CHECK (hourly_rate >= 0),
  is_online BOOLEAN NOT NULL DEFAULT FALSE,
  background_verified BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_chefs_online ON public.chefs(is_online);
CREATE INDEX IF NOT EXISTS idx_chefs_rating ON public.chefs(rating DESC);

CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  chef_id TEXT NOT NULL REFERENCES public.chefs(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending','confirmed','in_progress','completed','cancelled')
  ),
  grocery_total NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (grocery_total >= 0),
  delivery_fee NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (delivery_fee >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user_created
  ON public.orders(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_chef_created
  ON public.orders(chef_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status
  ON public.orders(status);

-- Orders are private to the authenticated user who owns them. The mobile app
-- sends the Supabase Auth user UUID as the text user_id value.
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their own orders" ON public.orders;
CREATE POLICY "Users can read their own orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (user_id = auth.uid()::TEXT);

DROP POLICY IF EXISTS "Users can create their own orders" ON public.orders;
CREATE POLICY "Users can create their own orders"
  ON public.orders FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid()::TEXT);

-- Chef discovery is intentionally readable by authenticated clients. Writes to
-- chef records should be performed by trusted backend/admin tooling.
ALTER TABLE public.chefs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read chefs" ON public.chefs;
CREATE POLICY "Authenticated users can read chefs"
  ON public.chefs FOR SELECT
  TO authenticated
  USING (TRUE);

COMMIT;

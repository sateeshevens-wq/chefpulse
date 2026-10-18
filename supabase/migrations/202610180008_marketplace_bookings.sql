-- Marketplace booking, location discovery, realtime tracking, and paid B2B listings.

BEGIN;

ALTER TABLE public.chefs
  ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

CREATE INDEX IF NOT EXISTS idx_chefs_location
  ON public.chefs(latitude, longitude)
  WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.bookings (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  chef_id TEXT NOT NULL REFERENCES public.chefs(id) ON DELETE RESTRICT,
  service_type TEXT NOT NULL DEFAULT 'home_chef' CHECK (service_type IN ('home_chef', 'catering')),
  status TEXT NOT NULL DEFAULT 'pending_payment' CHECK (
    status IN ('pending_payment', 'pending', 'accepted', 'declined', 'in_progress', 'completed', 'cancelled')
  ),
  amount NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (amount >= 0),
  platform_fee NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (platform_fee >= 0),
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bookings_user_created
  ON public.bookings(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_chef_status_created
  ON public.bookings(chef_id, status, created_at DESC);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their own bookings" ON public.bookings;
CREATE POLICY "Users can read their own bookings"
  ON public.bookings FOR SELECT TO authenticated
  USING (user_id = auth.uid()::TEXT);

DROP POLICY IF EXISTS "Users can create their own bookings" ON public.bookings;
CREATE POLICY "Users can create their own bookings"
  ON public.bookings FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid()::TEXT);

DROP POLICY IF EXISTS "Chefs can read assigned bookings" ON public.bookings;
CREATE POLICY "Chefs can read assigned bookings"
  ON public.bookings FOR SELECT TO authenticated
  USING (chef_id = auth.uid()::TEXT);

DROP POLICY IF EXISTS "Chefs can update assigned bookings" ON public.bookings;
CREATE POLICY "Chefs can update assigned bookings"
  ON public.bookings FOR UPDATE TO authenticated
  USING (chef_id = auth.uid()::TEXT)
  WITH CHECK (chef_id = auth.uid()::TEXT);

ALTER TABLE public.b2b_job_postings
  ADD COLUMN IF NOT EXISTS business_user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS listing_fee NUMERIC(12,2) NOT NULL DEFAULT 100 CHECK (listing_fee >= 0),
  ADD COLUMN IF NOT EXISTS payment_method TEXT NOT NULL DEFAULT 'upi',
  ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'initiated';

CREATE INDEX IF NOT EXISTS idx_b2b_job_postings_business_user
  ON public.b2b_job_postings(business_user_id, created_at DESC);

DROP POLICY IF EXISTS "Authenticated users can create B2B jobs" ON public.b2b_job_postings;
CREATE POLICY "Authenticated users can create B2B jobs"
  ON public.b2b_job_postings FOR INSERT TO authenticated
  WITH CHECK (business_user_id = auth.uid()::TEXT AND listing_fee = 100 AND payment_method = 'upi');

ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;

CREATE OR REPLACE FUNCTION public.set_booking_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS bookings_set_updated_at ON public.bookings;
CREATE TRIGGER bookings_set_updated_at
BEFORE UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.set_booking_updated_at();

NOTIFY pgrst, 'reload schema';

COMMIT;

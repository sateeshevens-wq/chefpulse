-- ChefPulse final revenue model.
-- Home Chef uses a fixed ₹49 platform fee; Catering uses 10% of the quoted amount.
-- B2B job postings are separate from customer orders.

BEGIN;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS service_type TEXT;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS platform_fee NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (platform_fee >= 0);

UPDATE public.orders
SET service_type = 'home_chef'
WHERE service_type IS NULL;

ALTER TABLE public.orders
  ALTER COLUMN service_type SET DEFAULT 'home_chef',
  ALTER COLUMN service_type SET NOT NULL;

ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_service_type_check;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_service_type_check
  CHECK (service_type IN ('home_chef', 'catering'));

CREATE INDEX IF NOT EXISTS idx_orders_service_type
  ON public.orders(service_type);

CREATE TABLE IF NOT EXISTS public.b2b_job_postings (
  id TEXT PRIMARY KEY,
  business_name TEXT NOT NULL,
  job_title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_b2b_job_postings_status_created
  ON public.b2b_job_postings(status, created_at DESC);

ALTER TABLE public.b2b_job_postings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read open B2B jobs" ON public.b2b_job_postings;
CREATE POLICY "Authenticated users can read open B2B jobs"
  ON public.b2b_job_postings FOR SELECT
  TO authenticated
  USING (status = 'open');

DROP POLICY IF EXISTS "Authenticated users can create B2B jobs" ON public.b2b_job_postings;
CREATE POLICY "Authenticated users can create B2B jobs"
  ON public.b2b_job_postings FOR INSERT
  TO authenticated
  WITH CHECK (TRUE);

COMMIT;

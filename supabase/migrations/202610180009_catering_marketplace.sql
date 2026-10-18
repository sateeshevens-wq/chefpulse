-- Catering marketplace: customer requests, caterer proposals, realtime status, and reviews.

BEGIN;

ALTER TABLE public.chefs
  ADD COLUMN IF NOT EXISTS is_caterer BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS region TEXT;

CREATE INDEX IF NOT EXISTS idx_chefs_caterer_region_online
  ON public.chefs(region, is_caterer, is_online)
  WHERE is_caterer = TRUE;

CREATE TABLE IF NOT EXISTS public.catering_requests (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  guest_count INTEGER NOT NULL CHECK (guest_count > 0),
  event_date TIMESTAMPTZ NOT NULL,
  occasion TEXT NOT NULL,
  menu_preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
  region TEXT,
  caterer_id TEXT REFERENCES public.chefs(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','proposal_received','booked','en_route','setting_up','completed','cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.catering_proposals (
  id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL REFERENCES public.catering_requests(id) ON DELETE CASCADE,
  caterer_id TEXT NOT NULL REFERENCES public.chefs(id) ON DELETE CASCADE,
  itemized_costs JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
  advance_deposit_amount NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (advance_deposit_amount >= 0 AND advance_deposit_amount <= total_amount),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined','paid','expired')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.catering_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catering_proposals ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_catering_requests_customer_created ON public.catering_requests(customer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_catering_requests_region_status ON public.catering_requests(region, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_catering_proposals_request_status ON public.catering_proposals(request_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_catering_proposals_caterer_status ON public.catering_proposals(caterer_id, status, created_at DESC);

DROP POLICY IF EXISTS "Customers can read own catering requests" ON public.catering_requests;
CREATE POLICY "Customers can read own catering requests" ON public.catering_requests FOR SELECT TO authenticated USING (customer_id = auth.uid()::TEXT);

DROP POLICY IF EXISTS "Customers can create own catering requests" ON public.catering_requests;
CREATE POLICY "Customers can create own catering requests" ON public.catering_requests FOR INSERT TO authenticated WITH CHECK (customer_id = auth.uid()::TEXT);

DROP POLICY IF EXISTS "Caterers can read regional catering requests" ON public.catering_requests;
CREATE POLICY "Caterers can read regional catering requests" ON public.catering_requests FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.chefs c WHERE c.user_id = auth.uid()::TEXT AND c.is_caterer = TRUE AND c.region = catering_requests.region));

DROP POLICY IF EXISTS "Caterers can update assigned catering requests" ON public.catering_requests;
CREATE POLICY "Caterers can update assigned catering requests" ON public.catering_requests FOR UPDATE TO authenticated
USING (caterer_id IN (SELECT c.id FROM public.chefs c WHERE c.user_id = auth.uid()::TEXT AND c.is_caterer = TRUE))
WITH CHECK (caterer_id IN (SELECT c.id FROM public.chefs c WHERE c.user_id = auth.uid()::TEXT AND c.is_caterer = TRUE));

DROP POLICY IF EXISTS "Customers can read own catering proposals" ON public.catering_proposals;
CREATE POLICY "Customers can read own catering proposals" ON public.catering_proposals FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.catering_requests r WHERE r.id = catering_proposals.request_id AND r.customer_id = auth.uid()::TEXT));

DROP POLICY IF EXISTS "Caterers can read own catering proposals" ON public.catering_proposals;
CREATE POLICY "Caterers can read own catering proposals" ON public.catering_proposals FOR SELECT TO authenticated
USING (caterer_id IN (SELECT c.id FROM public.chefs c WHERE c.user_id = auth.uid()::TEXT AND c.is_caterer = TRUE));

DROP POLICY IF EXISTS "Caterers can create catering proposals" ON public.catering_proposals;
CREATE POLICY "Caterers can create catering proposals" ON public.catering_proposals FOR INSERT TO authenticated
WITH CHECK (caterer_id IN (SELECT c.id FROM public.chefs c WHERE c.user_id = auth.uid()::TEXT AND c.is_caterer = TRUE));

DROP POLICY IF EXISTS "Caterers can update own catering proposals" ON public.catering_proposals;
CREATE POLICY "Caterers can update own catering proposals" ON public.catering_proposals FOR UPDATE TO authenticated
USING (caterer_id IN (SELECT c.id FROM public.chefs c WHERE c.user_id = auth.uid()::TEXT AND c.is_caterer = TRUE))
WITH CHECK (caterer_id IN (SELECT c.id FROM public.chefs c WHERE c.user_id = auth.uid()::TEXT AND c.is_caterer = TRUE));

CREATE OR REPLACE FUNCTION public.set_catering_updated_at() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$;
DROP TRIGGER IF EXISTS catering_requests_set_updated_at ON public.catering_requests;
CREATE TRIGGER catering_requests_set_updated_at BEFORE UPDATE ON public.catering_requests FOR EACH ROW EXECUTE FUNCTION public.set_catering_updated_at();
DROP TRIGGER IF EXISTS catering_proposals_set_updated_at ON public.catering_proposals;
CREATE TRIGGER catering_proposals_set_updated_at BEFORE UPDATE ON public.catering_proposals FOR EACH ROW EXECUTE FUNCTION public.set_catering_updated_at();

ALTER PUBLICATION supabase_realtime ADD TABLE public.catering_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.catering_proposals;

NOTIFY pgrst, 'reload schema';
COMMIT;

BEGIN;

ALTER TABLE public.catering_requests
  ADD COLUMN IF NOT EXISTS event_type TEXT,
  ADD COLUMN IF NOT EXISTS food_preference TEXT,
  ADD COLUMN IF NOT EXISTS service_required TEXT,
  ADD COLUMN IF NOT EXISTS venue_area TEXT,
  ADD COLUMN IF NOT EXISTS service_time TIME,
  ADD COLUMN IF NOT EXISTS budget_per_guest TEXT,
  ADD COLUMN IF NOT EXISTS additional_requirements TEXT;

ALTER TABLE public.catering_requests
  ALTER COLUMN occasion DROP NOT NULL;

UPDATE public.catering_requests
SET event_type = COALESCE(event_type, occasion, 'Other')
WHERE event_type IS NULL;

UPDATE public.catering_requests
SET status = 'pending_quote'
WHERE status = 'pending';

ALTER TABLE public.catering_requests
  ALTER COLUMN status SET DEFAULT 'pending_quote';

ALTER TABLE public.catering_requests
  DROP CONSTRAINT IF EXISTS catering_requests_status_check;

ALTER TABLE public.catering_requests
  ADD CONSTRAINT catering_requests_status_check
  CHECK (status IN ('pending_quote','proposal_received','deposit_paid','booked','en_route','setting_up','completed','cancelled'));

ALTER TABLE public.catering_requests
  DROP CONSTRAINT IF EXISTS catering_requests_event_type_check;
ALTER TABLE public.catering_requests
  ADD CONSTRAINT catering_requests_event_type_check
  CHECK (event_type IS NULL OR event_type IN ('Birthday','Wedding/Engagement','Corporate','Family','Other'));

ALTER TABLE public.catering_requests
  DROP CONSTRAINT IF EXISTS catering_requests_food_preference_check;
ALTER TABLE public.catering_requests
  ADD CONSTRAINT catering_requests_food_preference_check
  CHECK (food_preference IS NULL OR food_preference IN ('Veg','Non-veg','Both','Other'));

ALTER TABLE public.catering_requests
  DROP CONSTRAINT IF EXISTS catering_requests_service_required_check;
ALTER TABLE public.catering_requests
  ADD CONSTRAINT catering_requests_service_required_check
  CHECK (service_required IS NULL OR service_required IN ('Delivery only','Delivery & buffet setup','Full catering with staff','Custom'));

ALTER TABLE public.catering_requests
  DROP CONSTRAINT IF EXISTS catering_requests_budget_per_guest_check;
ALTER TABLE public.catering_requests
  ADD CONSTRAINT catering_requests_budget_per_guest_check
  CHECK (budget_per_guest IS NULL OR budget_per_guest IN ('Below ₹500','₹500–₹800','₹800–₹1200','Flexible'));

CREATE INDEX IF NOT EXISTS idx_catering_requests_matching
  ON public.catering_requests(region, event_date, guest_count, status);

NOTIFY pgrst, 'reload schema';
COMMIT;

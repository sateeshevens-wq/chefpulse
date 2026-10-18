-- Add the live booking workflow status used by the customer and chef apps.

BEGIN;

ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_status_check CHECK (
    status IN ('pending','accepted','confirmed','in_progress','completed','cancelled')
  );

COMMIT;

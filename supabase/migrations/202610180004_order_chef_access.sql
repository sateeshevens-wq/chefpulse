-- Allow customers to read their own orders and chefs to receive/update their jobs.

BEGIN;

DROP POLICY IF EXISTS "Chefs can read assigned orders" ON public.orders;
CREATE POLICY "Chefs can read assigned orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (chef_id = auth.uid()::TEXT);

DROP POLICY IF EXISTS "Chefs can update assigned orders" ON public.orders;
CREATE POLICY "Chefs can update assigned orders"
  ON public.orders FOR UPDATE
  TO authenticated
  USING (chef_id = auth.uid()::TEXT)
  WITH CHECK (chef_id = auth.uid()::TEXT);

COMMIT;

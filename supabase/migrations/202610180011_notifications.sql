BEGIN;

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS expo_push_token TEXT;

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can update their own push token" ON public.users;
CREATE POLICY "Users can update their own push token"
  ON public.users FOR UPDATE TO authenticated
  USING (id = auth.uid()::TEXT)
  WITH CHECK (id = auth.uid()::TEXT);

CREATE INDEX IF NOT EXISTS idx_users_expo_push_token
  ON public.users(expo_push_token)
  WHERE expo_push_token IS NOT NULL;

NOTIFY pgrst, 'reload schema';
COMMIT;

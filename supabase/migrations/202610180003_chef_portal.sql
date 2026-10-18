-- Chef Portal ownership and authenticated self-management.
-- Each new chef record is linked to the Supabase Auth-backed public.users row.

BEGIN;

ALTER TABLE public.chefs
  ADD COLUMN IF NOT EXISTS user_id TEXT;

CREATE INDEX IF NOT EXISTS idx_chefs_user_id ON public.chefs(user_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'chefs_user_id_fkey'
      AND conrelid = 'public.chefs'::regclass
  ) THEN
    ALTER TABLE public.chefs
      ADD CONSTRAINT chefs_user_id_fkey
      FOREIGN KEY (user_id)
      REFERENCES public.users(id)
      ON DELETE CASCADE;
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'chefs_user_id_key'
      AND conrelid = 'public.chefs'::regclass
  ) THEN
    ALTER TABLE public.chefs
      ADD CONSTRAINT chefs_user_id_key UNIQUE (user_id);
  END IF;
END;
$$;

DROP POLICY IF EXISTS "Authenticated users can register themselves as chefs" ON public.chefs;
CREATE POLICY "Authenticated users can register themselves as chefs"
  ON public.chefs FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid()::TEXT);

DROP POLICY IF EXISTS "Chefs can update their own profile" ON public.chefs;
CREATE POLICY "Chefs can update their own profile"
  ON public.chefs FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid()::TEXT)
  WITH CHECK (user_id = auth.uid()::TEXT);

COMMIT;

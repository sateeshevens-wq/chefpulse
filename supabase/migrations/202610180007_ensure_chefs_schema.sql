-- Ensure the mobile-facing chefs table exists in the hosted Supabase database.
-- This migration is idempotent so it is safe when an earlier migration was skipped.

BEGIN;

CREATE TABLE IF NOT EXISTS public.chefs (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  bio TEXT NOT NULL DEFAULT '',
  rating NUMERIC(3,2) NOT NULL DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  hourly_rate NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (hourly_rate >= 0),
  is_online BOOLEAN NOT NULL DEFAULT FALSE,
  background_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.chefs ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE public.chefs ADD COLUMN IF NOT EXISTS bio TEXT NOT NULL DEFAULT '';
ALTER TABLE public.chefs ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_chefs_online ON public.chefs(is_online);
CREATE INDEX IF NOT EXISTS idx_chefs_rating ON public.chefs(rating DESC);
CREATE INDEX IF NOT EXISTS idx_chefs_user_id ON public.chefs(user_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'chefs_user_id_fkey' AND conrelid = 'public.chefs'::regclass
  ) THEN
    ALTER TABLE public.chefs
      ADD CONSTRAINT chefs_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'chefs_user_id_key' AND conrelid = 'public.chefs'::regclass
  ) THEN
    ALTER TABLE public.chefs ADD CONSTRAINT chefs_user_id_key UNIQUE (user_id);
  END IF;
END;
$$;

ALTER TABLE public.chefs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read chefs" ON public.chefs;
CREATE POLICY "Authenticated users can read chefs"
  ON public.chefs FOR SELECT TO authenticated USING (TRUE);

DROP POLICY IF EXISTS "Authenticated users can register themselves as chefs" ON public.chefs;
CREATE POLICY "Authenticated users can register themselves as chefs"
  ON public.chefs FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid()::TEXT);

DROP POLICY IF EXISTS "Chefs can update their own profile" ON public.chefs;
CREATE POLICY "Chefs can update their own profile"
  ON public.chefs FOR UPDATE TO authenticated
  USING (user_id = auth.uid()::TEXT)
  WITH CHECK (user_id = auth.uid()::TEXT);

-- Tell PostgREST to reload its schema cache immediately after migration.
NOTIFY pgrst, 'reload schema';

COMMIT;

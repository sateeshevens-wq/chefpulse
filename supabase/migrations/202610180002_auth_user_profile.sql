-- Keep the application users record synchronized with Supabase Auth.
-- Passwords remain managed exclusively by Supabase Auth; the legacy
-- password_hash column receives a non-secret marker for compatibility.

BEGIN;

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    phone,
    password_hash,
    role,
    status,
    name,
    avatar_url,
    verified,
    email_verified,
    phone_verified
  )
  VALUES (
    NEW.id::TEXT,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    'supabase_auth',
    'customer',
    'active',
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'name', ''), 'ChefPulse User'),
    NULL,
    FALSE,
    COALESCE(NEW.email_confirmed_at IS NOT NULL, FALSE),
    FALSE
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    name = EXCLUDED.name,
    avatar_url = EXCLUDED.avatar_url;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_auth_user();

COMMIT;

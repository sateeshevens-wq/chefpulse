-- ChefPulse authentication is email-only.
-- Supabase Auth remains the sole password/authentication authority.
-- Phone/SMS metadata is intentionally ignored by the public users sync trigger.

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
    '',
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
    phone = '',
    name = EXCLUDED.name,
    avatar_url = EXCLUDED.avatar_url,
    phone_verified = FALSE;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_auth_user();

COMMIT;

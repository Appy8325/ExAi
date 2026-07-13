-- Supabase Auth is authoritative for credentials. Mirror each auth user into
-- the application identity table in the same transaction.
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, email_verified_at)
  VALUES (
    NEW.id,
    lower(NEW.email),
    coalesce(NEW.raw_user_meta_data ->> 'full_name', ''),
    NEW.email_confirmed_at
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

CREATE OR REPLACE FUNCTION public.handle_auth_user_email_confirmed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.users
  SET email_verified_at = NEW.email_confirmed_at
  WHERE id = NEW.id
    AND NEW.email_confirmed_at IS NOT NULL;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_email_confirmed
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW
  WHEN (NEW.email_confirmed_at IS DISTINCT FROM OLD.email_confirmed_at)
  EXECUTE FUNCTION public.handle_auth_user_email_confirmed();

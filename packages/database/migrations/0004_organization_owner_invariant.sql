CREATE OR REPLACE FUNCTION public.prevent_last_organization_owner_removal()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF OLD.role <> 'owner' OR OLD.status <> 'active' THEN
    IF TG_OP = 'DELETE' THEN
      RETURN OLD;
    END IF;
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' AND NEW.role = 'owner' AND NEW.status = 'active' THEN
    RETURN NEW;
  END IF;

  -- Serializes owner changes for one organization so concurrent mutations
  -- cannot each observe the other owner and leave none behind.
  PERFORM 1 FROM public.organizations WHERE id = OLD.organization_id FOR UPDATE;

  IF NOT EXISTS (
    SELECT 1
    FROM public.organization_memberships
    WHERE organization_id = OLD.organization_id
      AND id <> OLD.id
      AND role = 'owner'
      AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'An active organization must retain an active owner';
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER organization_memberships_preserve_active_owner
  BEFORE UPDATE OR DELETE ON public.organization_memberships
  FOR EACH ROW EXECUTE FUNCTION public.prevent_last_organization_owner_removal();

CREATE TABLE relationship_enrichments (
  id uuid PRIMARY KEY DEFAULT concourse.uuid_generate_v7(),
  relationship_id uuid NOT NULL REFERENCES exhibitor_relationships(id) ON DELETE CASCADE,
  field_name text NOT NULL,
  change_type text NOT NULL CHECK (change_type IN ('added', 'updated', 'shared', 'profile_completed')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX relationship_enrichments_relationship_created_idx ON relationship_enrichments(relationship_id, created_at DESC);
GRANT SELECT ON relationship_enrichments TO app_tenant;
GRANT ALL PRIVILEGES ON relationship_enrichments TO app_platform;
ALTER TABLE relationship_enrichments ENABLE ROW LEVEL SECURITY;
ALTER TABLE relationship_enrichments FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON relationship_enrichments USING (relationship_id IN (SELECT id FROM exhibitor_relationships));

CREATE OR REPLACE FUNCTION concourse.record_profile_enrichments(target_user_id uuid, old_profile attendee_profiles, new_profile attendee_profiles, is_initial boolean DEFAULT false) RETURNS void LANGUAGE plpgsql AS $$
DECLARE
  field text;
  old_value text;
  new_value text;
  complete_now boolean := new_profile.company IS NOT NULL AND new_profile.job_title IS NOT NULL AND new_profile.industry IS NOT NULL;
  complete_before boolean := NOT is_initial AND old_profile.company IS NOT NULL AND old_profile.job_title IS NOT NULL AND old_profile.industry IS NOT NULL;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM attendee_profile_consents WHERE user_id = target_user_id AND share_profile_with_exhibitors) THEN RETURN; END IF;
  FOREACH field IN ARRAY ARRAY['company','job_title','industry','company_size','linkedin_url'] LOOP
    old_value := CASE field WHEN 'company' THEN old_profile.company WHEN 'job_title' THEN old_profile.job_title WHEN 'industry' THEN old_profile.industry WHEN 'company_size' THEN old_profile.company_size WHEN 'linkedin_url' THEN old_profile.linkedin_url END;
    new_value := CASE field WHEN 'company' THEN new_profile.company WHEN 'job_title' THEN new_profile.job_title WHEN 'industry' THEN new_profile.industry WHEN 'company_size' THEN new_profile.company_size WHEN 'linkedin_url' THEN new_profile.linkedin_url END;
    IF is_initial THEN
      IF new_value IS NOT NULL THEN INSERT INTO relationship_enrichments(relationship_id, field_name, change_type) SELECT id, field, 'shared' FROM exhibitor_relationships WHERE attendee_user_id = target_user_id AND status = 'active'; END IF;
    ELSIF old_value IS DISTINCT FROM new_value THEN
      INSERT INTO relationship_enrichments(relationship_id, field_name, change_type) SELECT id, field, CASE WHEN new_value IS NULL THEN 'updated' WHEN old_value IS NULL THEN 'added' ELSE 'updated' END FROM exhibitor_relationships WHERE attendee_user_id = target_user_id AND status = 'active';
    END IF;
  END LOOP;
  IF complete_now AND NOT complete_before THEN INSERT INTO relationship_enrichments(relationship_id, field_name, change_type) SELECT id, 'profile', 'profile_completed' FROM exhibitor_relationships WHERE attendee_user_id = target_user_id AND status = 'active'; END IF;
END;
$$;

CREATE OR REPLACE FUNCTION concourse.after_attendee_profile_change() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN PERFORM concourse.record_profile_enrichments(NEW.user_id, NEW, NEW, true); ELSE PERFORM concourse.record_profile_enrichments(NEW.user_id, OLD, NEW, false); END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER attendee_profile_enrichment AFTER INSERT OR UPDATE ON attendee_profiles FOR EACH ROW EXECUTE FUNCTION concourse.after_attendee_profile_change();

CREATE OR REPLACE FUNCTION concourse.after_attendee_profile_consent_change() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE profile attendee_profiles;
BEGIN
  IF NEW.share_profile_with_exhibitors AND (TG_OP = 'INSERT' OR NOT OLD.share_profile_with_exhibitors) THEN
    SELECT * INTO profile FROM attendee_profiles WHERE user_id = NEW.user_id;
    IF FOUND THEN PERFORM concourse.record_profile_enrichments(NEW.user_id, profile, profile, true); END IF;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER attendee_profile_consent_enrichment AFTER INSERT OR UPDATE ON attendee_profile_consents FOR EACH ROW EXECUTE FUNCTION concourse.after_attendee_profile_consent_change();

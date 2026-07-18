ALTER TABLE event_exhibitors
  ADD COLUMN primary_color text NOT NULL DEFAULT '#2563eb',
  ADD COLUMN banner_url text,
  ADD COLUMN published_at timestamptz,
  ADD CONSTRAINT event_exhibitors_primary_color_check CHECK (primary_color ~ '^#[0-9a-fA-F]{6}$');

ALTER TABLE lead_forms DROP CONSTRAINT lead_forms_status_check;
DROP INDEX lead_forms_exhibitor_name_key;
ALTER TABLE lead_forms
  ADD COLUMN consent_text text,
  ADD COLUMN version integer NOT NULL DEFAULT 1,
  ADD COLUMN published_at timestamptz,
  ALTER COLUMN status SET DEFAULT 'draft';
UPDATE lead_forms SET status = 'published', published_at = COALESCE(updated_at, created_at) WHERE status = 'active';
ALTER TABLE lead_forms ADD CONSTRAINT lead_forms_status_check CHECK (status IN ('draft','published','archived'));
CREATE UNIQUE INDEX lead_forms_exhibitor_name_version_key ON lead_forms(event_exhibitor_id, name, version);

CREATE TABLE files (
  id uuid PRIMARY KEY DEFAULT concourse.uuid_generate_v7(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  uploaded_by_user_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  owner_type text,
  owner_id uuid,
  purpose text NOT NULL,
  storage_key text NOT NULL,
  content_type text NOT NULL,
  byte_size bigint NOT NULL,
  checksum_sha256 text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT files_byte_size_check CHECK (byte_size > 0),
  CONSTRAINT files_status_check CHECK (status IN ('pending','scanning','clean','infected','failed')),
  CONSTRAINT files_owner_type_check CHECK (owner_type IS NULL OR owner_type IN ('product','floor_plan','user_avatar','organization_logo','event_exhibitor_logo','event_branding','kb_document','lead_note_voice','export','help_article','legal_document'))
);
CREATE UNIQUE INDEX files_storage_key_key ON files(storage_key);
CREATE INDEX files_organization_id_idx ON files(organization_id);
CREATE INDEX files_owner_idx ON files(owner_type, owner_id);

CREATE TABLE kb_sources (
  id uuid PRIMARY KEY DEFAULT concourse.uuid_generate_v7(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  event_exhibitor_id uuid NOT NULL REFERENCES event_exhibitors(id) ON DELETE CASCADE,
  organizer_organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  owner_organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  kind text NOT NULL,
  source_type text NOT NULL,
  title text NOT NULL,
  source_url text,
  file_id uuid REFERENCES files(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending',
  last_ingested_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT kb_sources_kind_check CHECK (kind IN ('uploaded_document','external_url')),
  CONSTRAINT kb_sources_source_type_check CHECK (source_type IN ('pdf','brochure','presentation','website','faq','pricing')),
  CONSTRAINT kb_sources_status_check CHECK (status IN ('pending','processing','indexed','failed','quarantined')),
  CONSTRAINT kb_sources_backing_check CHECK ((kind = 'uploaded_document' AND file_id IS NOT NULL AND source_url IS NULL) OR (kind = 'external_url' AND source_url IS NOT NULL AND file_id IS NULL))
);
CREATE INDEX kb_sources_event_id_idx ON kb_sources(event_id);
CREATE INDEX kb_sources_event_exhibitor_id_idx ON kb_sources(event_exhibitor_id);
CREATE INDEX kb_sources_organizer_organization_id_idx ON kb_sources(organizer_organization_id);
CREATE INDEX kb_sources_owner_organization_id_idx ON kb_sources(owner_organization_id);

CREATE TABLE booth_qr_credentials (
  id uuid PRIMARY KEY DEFAULT concourse.uuid_generate_v7(),
  event_exhibitor_id uuid NOT NULL REFERENCES event_exhibitors(id) ON DELETE CASCADE,
  public_token text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz
);
CREATE UNIQUE INDEX booth_qr_credentials_public_token_key ON booth_qr_credentials(public_token);
CREATE UNIQUE INDEX booth_qr_credentials_active_booth_key ON booth_qr_credentials(event_exhibitor_id) WHERE active;

GRANT SELECT, INSERT, UPDATE, DELETE ON files, kb_sources, booth_qr_credentials TO app_tenant;
GRANT ALL PRIVILEGES ON files, kb_sources, booth_qr_credentials TO app_platform;

ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE files FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON files
  USING (organization_id = current_setting('app.current_org_id', true)::uuid OR uploaded_by_user_id = current_setting('app.current_user_id', true)::uuid)
  WITH CHECK (organization_id = current_setting('app.current_org_id', true)::uuid OR uploaded_by_user_id = current_setting('app.current_user_id', true)::uuid);

ALTER TABLE kb_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE kb_sources FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON kb_sources
  USING (organizer_organization_id = current_setting('app.current_org_id', true)::uuid OR owner_organization_id = current_setting('app.current_org_id', true)::uuid)
  WITH CHECK (organizer_organization_id = current_setting('app.current_org_id', true)::uuid OR owner_organization_id = current_setting('app.current_org_id', true)::uuid);

ALTER TABLE booth_qr_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE booth_qr_credentials FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON booth_qr_credentials
  USING (event_exhibitor_id IN (SELECT id FROM event_exhibitors WHERE organization_id = current_setting('app.current_org_id', true)::uuid))
  WITH CHECK (event_exhibitor_id IN (SELECT id FROM event_exhibitors WHERE organization_id = current_setting('app.current_org_id', true)::uuid));

CREATE FUNCTION concourse.prevent_published_lead_form_field_mutation() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE form_id uuid := COALESCE(NEW.lead_form_id, OLD.lead_form_id);
BEGIN
  IF EXISTS (SELECT 1 FROM lead_forms WHERE id = form_id AND status = 'published') THEN
    RAISE EXCEPTION 'published lead form fields are immutable';
  END IF;
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER lead_form_fields_published_immutable
  BEFORE INSERT OR UPDATE OR DELETE ON lead_form_fields
  FOR EACH ROW EXECUTE FUNCTION concourse.prevent_published_lead_form_field_mutation();

DO $$
BEGIN
  IF to_regclass('storage.buckets') IS NOT NULL THEN
    EXECUTE $storage$INSERT INTO storage.buckets (id, name, public) VALUES ('uploads', 'uploads', false) ON CONFLICT (id) DO NOTHING$storage$;
  END IF;
END
$$;

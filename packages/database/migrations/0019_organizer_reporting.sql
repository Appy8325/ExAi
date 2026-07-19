CREATE TABLE organizer_reports (
  id uuid PRIMARY KEY DEFAULT concourse.uuid_generate_v7(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  organizer_organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  generated_by_user_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  idempotency_key text NOT NULL,
  status text NOT NULL DEFAULT 'processing',
  content text,
  metrics_snapshot jsonb NOT NULL DEFAULT '{}',
  model text,
  error_message text,
  generated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT organizer_reports_status_check CHECK (status IN ('processing','complete','failed')),
  CONSTRAINT organizer_reports_event_idempotency_key UNIQUE (event_id,idempotency_key)
);
CREATE INDEX organizer_reports_event_generated_idx ON organizer_reports(event_id,generated_at DESC);
GRANT SELECT,INSERT,UPDATE ON organizer_reports TO app_tenant;
GRANT ALL PRIVILEGES ON organizer_reports TO app_platform;
ALTER TABLE organizer_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizer_reports FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON organizer_reports
  USING (organizer_organization_id=current_setting('app.current_org_id',true)::uuid)
  WITH CHECK (organizer_organization_id=current_setting('app.current_org_id',true)::uuid);

CREATE TABLE exhibitor_dashboard_visits (
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  event_exhibitor_id uuid NOT NULL REFERENCES event_exhibitors(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  last_visited_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (organization_id, event_exhibitor_id, user_id)
);
CREATE INDEX exhibitor_dashboard_visits_exhibitor_user_idx ON exhibitor_dashboard_visits(event_exhibitor_id, user_id);
GRANT SELECT, INSERT, UPDATE ON exhibitor_dashboard_visits TO app_tenant;
GRANT ALL PRIVILEGES ON exhibitor_dashboard_visits TO app_platform;
ALTER TABLE exhibitor_dashboard_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE exhibitor_dashboard_visits FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON exhibitor_dashboard_visits
  USING (organization_id = current_setting('app.current_org_id', true)::uuid AND user_id = current_setting('app.current_user_id', true)::uuid)
  WITH CHECK (organization_id = current_setting('app.current_org_id', true)::uuid AND user_id = current_setting('app.current_user_id', true)::uuid);

CREATE TABLE lead_intelligence (
  id uuid PRIMARY KEY DEFAULT concourse.uuid_generate_v7(),
  lead_submission_id uuid NOT NULL REFERENCES lead_submissions(id) ON DELETE CASCADE,
  event_exhibitor_id uuid NOT NULL REFERENCES event_exhibitors(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'processing',
  lead_score integer,
  buying_intent text,
  summary text,
  topics_discussed jsonb NOT NULL DEFAULT '[]',
  follow_up_recommendation text,
  suggested_email text,
  evidence_ids jsonb NOT NULL DEFAULT '[]',
  confidence integer,
  model text,
  prompt_id text NOT NULL DEFAULT 'lead.intelligence.v1',
  error_message text,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT lead_intelligence_status_check CHECK (status IN ('processing','complete','failed','not_available')),
  CONSTRAINT lead_intelligence_score_check CHECK (lead_score IS NULL OR lead_score BETWEEN 0 AND 100),
  CONSTRAINT lead_intelligence_intent_check CHECK (buying_intent IS NULL OR buying_intent IN ('high','evaluating','browsing','not_relevant')),
  CONSTRAINT lead_intelligence_confidence_check CHECK (confidence IS NULL OR confidence BETWEEN 0 AND 100)
);
CREATE UNIQUE INDEX lead_intelligence_submission_key ON lead_intelligence(lead_submission_id);
CREATE INDEX lead_intelligence_exhibitor_status_idx ON lead_intelligence(event_exhibitor_id, status);

GRANT SELECT, INSERT, UPDATE ON lead_intelligence TO app_tenant;
GRANT ALL PRIVILEGES ON lead_intelligence TO app_platform;

ALTER TABLE lead_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_intelligence FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON lead_intelligence
  USING (event_exhibitor_id IN (SELECT id FROM event_exhibitors WHERE organization_id = current_setting('app.current_org_id', true)::uuid))
  WITH CHECK (event_exhibitor_id IN (SELECT id FROM event_exhibitors WHERE organization_id = current_setting('app.current_org_id', true)::uuid));

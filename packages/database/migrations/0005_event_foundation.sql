CREATE TABLE "events" (
  "id" uuid PRIMARY KEY DEFAULT concourse.uuid_generate_v7(),
  "organization_id" uuid NOT NULL REFERENCES "organizations" ("id") ON DELETE CASCADE,
  "name" text NOT NULL,
  "slug" text NOT NULL,
  "timezone" text NOT NULL,
  "start_at" timestamptz NOT NULL,
  "end_at" timestamptz NOT NULL,
  "status" text NOT NULL DEFAULT 'draft',
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "events_status_check" CHECK ("status" IN ('draft','published','live','completed','archived')),
  CONSTRAINT "events_date_range_check" CHECK ("end_at" > "start_at")
);

CREATE UNIQUE INDEX "events_organization_slug_key" ON "events" ("organization_id", "slug");
CREATE INDEX "events_organization_status_idx" ON "events" ("organization_id", "status");

ALTER TABLE "auth_tokens"
  ADD CONSTRAINT "auth_tokens_event_id_events_id_fk"
  FOREIGN KEY ("event_id") REFERENCES "events" ("id") ON DELETE CASCADE;

GRANT SELECT, INSERT, UPDATE ON "events" TO app_tenant;
GRANT ALL PRIVILEGES ON "events" TO app_platform;

ALTER TABLE "events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "events" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "events"
  USING ("organization_id" = current_setting('app.current_org_id', true)::uuid)
  WITH CHECK ("organization_id" = current_setting('app.current_org_id', true)::uuid);

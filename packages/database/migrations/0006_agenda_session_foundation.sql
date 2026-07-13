CREATE TABLE "agenda_sessions" (
  "id" uuid PRIMARY KEY DEFAULT concourse.uuid_generate_v7(),
  "event_id" uuid NOT NULL REFERENCES "events" ("id") ON DELETE CASCADE,
  "title" text NOT NULL,
  "slug" text NOT NULL,
  "description" text,
  "start_at" timestamptz NOT NULL,
  "end_at" timestamptz NOT NULL,
  "timezone" text NOT NULL,
  "room" text,
  "capacity" integer,
  "status" text NOT NULL DEFAULT 'draft',
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "agenda_sessions_status_check" CHECK ("status" IN ('draft','published','archived')),
  CONSTRAINT "agenda_sessions_date_range_check" CHECK ("end_at" > "start_at"),
  CONSTRAINT "agenda_sessions_capacity_check" CHECK ("capacity" IS NULL OR "capacity" >= 0)
);

CREATE UNIQUE INDEX "agenda_sessions_event_slug_key" ON "agenda_sessions" ("event_id", "slug");
CREATE INDEX "agenda_sessions_event_start_at_idx" ON "agenda_sessions" ("event_id", "start_at");

GRANT SELECT, INSERT, UPDATE ON "agenda_sessions" TO app_tenant;
GRANT ALL PRIVILEGES ON "agenda_sessions" TO app_platform;

ALTER TABLE "agenda_sessions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "agenda_sessions" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "agenda_sessions"
  USING ("event_id" IN (SELECT id FROM "events" WHERE "organization_id" = current_setting('app.current_org_id', true)::uuid))
  WITH CHECK ("event_id" IN (SELECT id FROM "events" WHERE "organization_id" = current_setting('app.current_org_id', true)::uuid));

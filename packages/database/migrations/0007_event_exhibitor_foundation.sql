CREATE TABLE "event_exhibitors" (
  "id" uuid PRIMARY KEY DEFAULT concourse.uuid_generate_v7(),
  "organization_id" uuid NOT NULL REFERENCES "organizations" ("id") ON DELETE CASCADE,
  "event_id" uuid NOT NULL REFERENCES "events" ("id") ON DELETE CASCADE,
  "organizer_organization_id" uuid NOT NULL REFERENCES "organizations" ("id") ON DELETE CASCADE,
  "booth_name" text NOT NULL,
  "booth_number" text,
  "logo_url" text,
  "description" text,
  "website" text,
  "contact_email" text,
  "contact_phone" text,
  "social_links" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "status" text NOT NULL DEFAULT 'accepted',
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "event_exhibitors_status_check" CHECK ("status" IN ('invited','accepted','profile_complete','ready','withdrawn','archived'))
);

CREATE UNIQUE INDEX "event_exhibitors_event_organization_key" ON "event_exhibitors" ("event_id", "organization_id");
CREATE UNIQUE INDEX "event_exhibitors_event_booth_number_key" ON "event_exhibitors" ("event_id", "booth_number") WHERE "booth_number" IS NOT NULL;
CREATE INDEX "event_exhibitors_event_id_idx" ON "event_exhibitors" ("event_id");
CREATE INDEX "event_exhibitors_organization_id_idx" ON "event_exhibitors" ("organization_id");
CREATE INDEX "event_exhibitors_organizer_organization_id_idx" ON "event_exhibitors" ("organizer_organization_id");

GRANT SELECT, INSERT, UPDATE ON "event_exhibitors" TO app_tenant;
GRANT ALL PRIVILEGES ON "event_exhibitors" TO app_platform;

ALTER TABLE "event_exhibitors" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "event_exhibitors" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "event_exhibitors"
  USING (
    "organization_id" = current_setting('app.current_org_id', true)::uuid
    OR "organizer_organization_id" = current_setting('app.current_org_id', true)::uuid
  )
  WITH CHECK (
    "organization_id" = current_setting('app.current_org_id', true)::uuid
    OR "organizer_organization_id" = current_setting('app.current_org_id', true)::uuid
  );

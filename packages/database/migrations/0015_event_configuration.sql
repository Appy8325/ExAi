ALTER TABLE "events"
  ADD COLUMN "privacy_policy_url" text,
  ADD COLUMN "logo_url" text,
  ADD COLUMN "primary_color" text NOT NULL DEFAULT '#4f46e5',
  ADD CONSTRAINT "events_primary_color_check"
    CHECK ("primary_color" ~ '^#[0-9a-fA-F]{6}$');

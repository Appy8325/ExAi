-- Identity & Tenancy domain (docs/16-database-schema.md §3): the two
-- Postgres roles that carry all traffic (§2.3), the eight tables, and
-- the RLS policy for each — verbatim from §3.1-§3.8 and the flat
-- reference in §11.
--
-- This file was hand-authored to stand in for `drizzle-kit generate`
-- (unavailable in the authoring sandbox — no Node/pnpm/Docker). It must
-- be reconciled against `pnpm --filter database generate` the first
-- time that command runs in an environment with tooling, so drizzle-kit's
-- snapshot/journal metadata (packages/database/migrations/meta/) starts
-- from a state that matches what's actually applied.

-- ── 1. Roles (§2.3) ─────────────────────────────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'app_tenant') THEN
    CREATE ROLE app_tenant NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'app_platform') THEN
    CREATE ROLE app_platform NOLOGIN BYPASSRLS;
  END IF;
END
$$;

GRANT USAGE ON SCHEMA public TO app_tenant, app_platform;

-- Shared FTS helper (§2.7 — every "tsvector GENERATED ALWAYS AS
-- (to_tsvector('english', ...)) STORED" column in the schema uses this).
-- Plain to_tsvector(regconfig, text) is STABLE, not IMMUTABLE, so
-- Postgres rejects it directly inside a generated-column expression;
-- this wrapper is IMMUTABLE by construction (fixed config, no catalog
-- lookups beyond what to_tsvector itself already resolves once).
CREATE OR REPLACE FUNCTION concourse.immutable_to_tsvector(config regconfig, input text)
RETURNS tsvector
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
AS $$
  SELECT to_tsvector(config, coalesce(input, ''));
$$;

-- ── 2. Tables (§3.1-§3.8) ───────────────────────────────────────────

CREATE TABLE "organizations" (
  "id" uuid PRIMARY KEY DEFAULT concourse.uuid_generate_v7(),
  "kind" text NOT NULL,
  "slug" text NOT NULL,
  "name" text NOT NULL,
  "logo_file_id" uuid,
  "website_url" text,
  "billing_email" text,
  "verified_domains" text[] NOT NULL DEFAULT '{}'::text[],
  "search_vector" tsvector GENERATED ALWAYS AS (concourse.immutable_to_tsvector('english', "name")) STORED,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "organizations_kind_check" CHECK ("kind" IN ('organizer','exhibitor')),
  CONSTRAINT "organizations_slug_format_check" CHECK ("slug" ~ '^[a-z0-9-]{3,63}$')
);
CREATE UNIQUE INDEX "organizations_slug_key" ON "organizations" ("slug");
CREATE INDEX "organizations_search_vector_idx" ON "organizations" USING gin ("search_vector");

CREATE TABLE "users" (
  "id" uuid PRIMARY KEY DEFAULT concourse.uuid_generate_v7(),
  "email" text NOT NULL,
  "email_verified_at" timestamptz,
  "password_hash" text,
  "full_name" text NOT NULL,
  "avatar_file_id" uuid,
  "locale" text NOT NULL DEFAULT 'en',
  "is_platform_admin" boolean NOT NULL DEFAULT false,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX "users_email_key" ON "users" ("email");

CREATE TABLE "organization_memberships" (
  "id" uuid PRIMARY KEY DEFAULT concourse.uuid_generate_v7(),
  "organization_id" uuid NOT NULL REFERENCES "organizations" ("id") ON DELETE CASCADE,
  "user_id" uuid NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE,
  "role" text NOT NULL,
  "status" text NOT NULL DEFAULT 'active',
  "invited_by_user_id" uuid REFERENCES "users" ("id") ON DELETE SET NULL,
  "joined_at" timestamptz NOT NULL DEFAULT now(),
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "organization_memberships_role_check" CHECK ("role" IN ('owner','admin','member')),
  CONSTRAINT "organization_memberships_status_check" CHECK ("status" IN ('pending','active'))
);
CREATE UNIQUE INDEX "organization_memberships_org_user_key" ON "organization_memberships" ("organization_id", "user_id");
CREATE INDEX "organization_memberships_user_id_idx" ON "organization_memberships" ("user_id");
CREATE INDEX "organization_memberships_org_status_idx" ON "organization_memberships" ("organization_id", "status");

CREATE TABLE "auth_sessions" (
  "id" uuid PRIMARY KEY DEFAULT concourse.uuid_generate_v7(),
  "user_id" uuid NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE,
  "device_label" text,
  "ip_address" inet,
  "user_agent" text,
  "last_seen_at" timestamptz NOT NULL DEFAULT now(),
  "revoked_at" timestamptz,
  "revoked_reason" text,
  "session_kind" text NOT NULL DEFAULT 'standard',
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "auth_sessions_revoked_reason_check" CHECK (
    "revoked_reason" IS NULL OR "revoked_reason" IN (
      'user_logout','password_changed','admin_revoked','suspected_hijack','membership_removed'
    )
  ),
  CONSTRAINT "auth_sessions_session_kind_check" CHECK ("session_kind" IN ('standard','attendee','kiosk_attendee'))
);
CREATE INDEX "auth_sessions_user_id_revoked_at_idx" ON "auth_sessions" ("user_id", "revoked_at");
CREATE INDEX "auth_sessions_session_kind_idx" ON "auth_sessions" ("session_kind");

CREATE TABLE "api_keys" (
  "id" uuid PRIMARY KEY DEFAULT concourse.uuid_generate_v7(),
  "organization_id" uuid NOT NULL REFERENCES "organizations" ("id") ON DELETE CASCADE,
  "name" text NOT NULL,
  "key_prefix" text NOT NULL,
  "secret_hash" text NOT NULL,
  "scopes" text[] NOT NULL DEFAULT '{}'::text[],
  "rate_limit_per_minute" integer,
  "last_used_at" timestamptz,
  "revoked_at" timestamptz,
  "created_by_user_id" uuid REFERENCES "users" ("id") ON DELETE SET NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX "api_keys_key_prefix_key" ON "api_keys" ("key_prefix");

CREATE TABLE "oauth_identities" (
  "id" uuid PRIMARY KEY DEFAULT concourse.uuid_generate_v7(),
  "user_id" uuid NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE,
  "provider" text NOT NULL,
  "provider_user_id" text NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "oauth_identities_provider_check" CHECK ("provider" IN ('google','microsoft','linkedin'))
);
CREATE UNIQUE INDEX "oauth_identities_provider_provider_user_id_key" ON "oauth_identities" ("provider", "provider_user_id");
CREATE UNIQUE INDEX "oauth_identities_user_id_provider_key" ON "oauth_identities" ("user_id", "provider");
CREATE INDEX "oauth_identities_user_id_idx" ON "oauth_identities" ("user_id");

CREATE TABLE "webauthn_credentials" (
  "id" uuid PRIMARY KEY DEFAULT concourse.uuid_generate_v7(),
  "user_id" uuid NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE,
  "credential_id" text NOT NULL,
  "public_key" bytea NOT NULL,
  "sign_count" bigint NOT NULL DEFAULT 0,
  "last_used_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX "webauthn_credentials_credential_id_key" ON "webauthn_credentials" ("credential_id");
CREATE INDEX "webauthn_credentials_user_id_idx" ON "webauthn_credentials" ("user_id");

CREATE TABLE "auth_tokens" (
  "id" uuid PRIMARY KEY DEFAULT concourse.uuid_generate_v7(),
  "kind" text NOT NULL,
  "token_hash" text NOT NULL,
  "user_id" uuid REFERENCES "users" ("id") ON DELETE CASCADE,
  "organization_id" uuid REFERENCES "organizations" ("id") ON DELETE CASCADE,
  "event_id" uuid,
  "payload" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "expires_at" timestamptz NOT NULL,
  "used_at" timestamptz,
  "revoked_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "auth_tokens_kind_check" CHECK ("kind" IN ('invite','magic_link','verify_email','reset_password'))
);
CREATE UNIQUE INDEX "auth_tokens_token_hash_key" ON "auth_tokens" ("token_hash");
CREATE INDEX "auth_tokens_user_id_kind_idx" ON "auth_tokens" ("user_id", "kind");
CREATE INDEX "auth_tokens_kind_expires_at_idx" ON "auth_tokens" ("kind", "expires_at");

-- ── 3. Grants (§2.3 — table-level access; RLS restricts rows) ───────

GRANT SELECT, INSERT, UPDATE, DELETE ON
  "organizations", "users", "organization_memberships", "auth_sessions",
  "api_keys", "oauth_identities", "webauthn_credentials", "auth_tokens"
TO app_tenant;

GRANT ALL PRIVILEGES ON
  "organizations", "users", "organization_memberships", "auth_sessions",
  "api_keys", "oauth_identities", "webauthn_credentials", "auth_tokens"
TO app_platform;

-- ── 4. Row-Level Security (§3.1-§3.8, §11) ───────────────────────────
-- FORCE ROW LEVEL SECURITY so even the table owner is subject to
-- policy; app_platform bypasses via its BYPASSRLS role attribute, never
-- via a policy exception.

ALTER TABLE "organizations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "organizations" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "organizations"
  USING ("id" = current_setting('app.current_org_id', true)::uuid)
  WITH CHECK ("id" = current_setting('app.current_org_id', true)::uuid);

ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "users" FORCE ROW LEVEL SECURITY;
CREATE POLICY self_access ON "users"
  USING ("id" = current_setting('app.current_user_id', true)::uuid)
  WITH CHECK ("id" = current_setting('app.current_user_id', true)::uuid);

ALTER TABLE "organization_memberships" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "organization_memberships" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "organization_memberships"
  USING ("organization_id" = current_setting('app.current_org_id', true)::uuid)
  WITH CHECK ("organization_id" = current_setting('app.current_org_id', true)::uuid);

ALTER TABLE "auth_sessions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "auth_sessions" FORCE ROW LEVEL SECURITY;
CREATE POLICY self_access ON "auth_sessions"
  USING ("user_id" = current_setting('app.current_user_id', true)::uuid)
  WITH CHECK ("user_id" = current_setting('app.current_user_id', true)::uuid);

ALTER TABLE "api_keys" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "api_keys" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "api_keys"
  USING ("organization_id" = current_setting('app.current_org_id', true)::uuid)
  WITH CHECK ("organization_id" = current_setting('app.current_org_id', true)::uuid);

ALTER TABLE "oauth_identities" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "oauth_identities" FORCE ROW LEVEL SECURITY;
CREATE POLICY self_access ON "oauth_identities"
  USING ("user_id" = current_setting('app.current_user_id', true)::uuid)
  WITH CHECK ("user_id" = current_setting('app.current_user_id', true)::uuid);

ALTER TABLE "webauthn_credentials" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "webauthn_credentials" FORCE ROW LEVEL SECURITY;
CREATE POLICY self_access ON "webauthn_credentials"
  USING ("user_id" = current_setting('app.current_user_id', true)::uuid)
  WITH CHECK ("user_id" = current_setting('app.current_user_id', true)::uuid);

-- auth_tokens: RLS enabled with no policy at all for app_tenant (deny
-- by default — every lookup happens by token_hash inside /v1/auth/*
-- request handlers using app_platform, never a generic client role
-- read), per §3.8/§11.
ALTER TABLE "auth_tokens" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "auth_tokens" FORCE ROW LEVEL SECURITY;

import { sql } from 'drizzle-orm';
import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  bigint,
  jsonb,
  customType,
  uniqueIndex,
  index,
  check,
} from 'drizzle-orm/pg-core';

// docs/16-database-schema.md §2.1: every PK defaults to the RFC 9562
// UUIDv7 generator installed by migration 0001_uuid_v7.sql — id
// generation is single-sourced in the database, never in TypeScript.
const uuidv7 = sql`concourse.uuid_generate_v7()`;

// No native drizzle-orm pg-core builder for these three Postgres types.
const inet = customType<{ data: string }>({ dataType: () => 'inet' });
const bytea = customType<{ data: Buffer }>({ dataType: () => 'bytea' });
const tsvector = customType<{ data: string }>({ dataType: () => 'tsvector' });

// docs/16-database-schema.md §3.1. `logo_file_id` has no FK constraint
// yet — `files` (§8.1) is a Milestone 1 deliverable; the constraint is
// added by the migration that creates `files`, per normal phased
// migration sequencing, not an architecture deviation.
export const organizations = pgTable(
  'organizations',
  {
    id: uuid('id').primaryKey().default(uuidv7),
    kind: text('kind').notNull(),
    slug: text('slug').notNull(),
    name: text('name').notNull(),
    logoFileId: uuid('logo_file_id'),
    websiteUrl: text('website_url'),
    billingEmail: text('billing_email'),
    verifiedDomains: text('verified_domains').array().notNull().default(sql`'{}'::text[]`),
    // to_tsvector(regconfig, text) is STABLE, not IMMUTABLE, so Postgres
    // rejects it directly in a generated-column expression; the
    // migration installs an IMMUTABLE wrapper, concourse.immutable_to_tsvector,
    // shared by every FTS column this schema defines (§2.7).
    searchVector: tsvector('search_vector').notNull().generatedAlwaysAs(
      sql`concourse.immutable_to_tsvector('english', "name")`,
    ),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    slugUnique: uniqueIndex('organizations_slug_key').on(table.slug),
    kindCheck: check('organizations_kind_check', sql`${table.kind} IN ('organizer','exhibitor')`),
    slugFormatCheck: check(
      'organizations_slug_format_check',
      sql`${table.slug} ~ '^[a-z0-9-]{3,63}$'`,
    ),
    searchVectorIdx: index('organizations_search_vector_idx').using('gin', table.searchVector),
  }),
);

// docs/16-database-schema.md §3.2. `password_hash` and, via
// webauthn_credentials below, WebAuthn storage are inert per
// docs/19-authentication-strategy.md §3/§7 (Amendment A5) — Supabase
// Auth's own `auth` schema is now authoritative; both columns/tables are
// kept exactly as specified pending the future schema-cleanup revision
// docs/19-authentication-strategy.md tracks in 44-future-expansion-plan.md.
export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().default(uuidv7),
    email: text('email').notNull(),
    emailVerifiedAt: timestamp('email_verified_at', { withTimezone: true }),
    passwordHash: text('password_hash'),
    fullName: text('full_name').notNull(),
    avatarFileId: uuid('avatar_file_id'),
    locale: text('locale').notNull().default('en'),
    isPlatformAdmin: boolean('is_platform_admin').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    emailUnique: uniqueIndex('users_email_key').on(table.email),
  }),
);

// docs/16-database-schema.md §3.3.
export const organizationMemberships = pgTable(
  'organization_memberships',
  {
    id: uuid('id').primaryKey().default(uuidv7),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role: text('role').notNull(),
    status: text('status').notNull().default('active'),
    invitedByUserId: uuid('invited_by_user_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    joinedAt: timestamp('joined_at', { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    orgUserUnique: uniqueIndex('organization_memberships_org_user_key').on(
      table.organizationId,
      table.userId,
    ),
    userIdx: index('organization_memberships_user_id_idx').on(table.userId),
    orgStatusIdx: index('organization_memberships_org_status_idx').on(
      table.organizationId,
      table.status,
    ),
    roleCheck: check(
      'organization_memberships_role_check',
      sql`${table.role} IN ('owner','admin','member')`,
    ),
    statusCheck: check(
      'organization_memberships_status_check',
      sql`${table.status} IN ('pending','active')`,
    ),
  }),
);

// docs/16-database-schema.md §3.4. Mirrored from Supabase's session
// lifecycle per docs/20-session-strategy.md §3 (Amendment A5) — the
// mirroring write path itself is deliverable 3 (auth wiring), not this
// schema ticket.
export const authSessions = pgTable(
  'auth_sessions',
  {
    id: uuid('id').primaryKey().default(uuidv7),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    deviceLabel: text('device_label'),
    ipAddress: inet('ip_address'),
    userAgent: text('user_agent'),
    lastSeenAt: timestamp('last_seen_at', { withTimezone: true }).notNull().defaultNow(),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
    revokedReason: text('revoked_reason'),
    sessionKind: text('session_kind').notNull().default('standard'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userRevokedIdx: index('auth_sessions_user_id_revoked_at_idx').on(
      table.userId,
      table.revokedAt,
    ),
    sessionKindIdx: index('auth_sessions_session_kind_idx').on(table.sessionKind),
    revokedReasonCheck: check(
      'auth_sessions_revoked_reason_check',
      sql`${table.revokedReason} IS NULL OR ${table.revokedReason} IN ('user_logout','password_changed','admin_revoked','suspected_hijack','membership_removed')`,
    ),
    sessionKindCheck: check(
      'auth_sessions_session_kind_check',
      sql`${table.sessionKind} IN ('standard','attendee','kiosk_attendee')`,
    ),
  }),
);

// docs/16-database-schema.md §3.5.
export const apiKeys = pgTable(
  'api_keys',
  {
    id: uuid('id').primaryKey().default(uuidv7),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    keyPrefix: text('key_prefix').notNull(),
    secretHash: text('secret_hash').notNull(),
    scopes: text('scopes').array().notNull().default(sql`'{}'::text[]`),
    rateLimitPerMinute: integer('rate_limit_per_minute'),
    lastUsedAt: timestamp('last_used_at', { withTimezone: true }),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
    createdByUserId: uuid('created_by_user_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    keyPrefixUnique: uniqueIndex('api_keys_key_prefix_key').on(table.keyPrefix),
  }),
);

// docs/16-database-schema.md §3.6.
export const oauthIdentities = pgTable(
  'oauth_identities',
  {
    id: uuid('id').primaryKey().default(uuidv7),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    provider: text('provider').notNull(),
    providerUserId: text('provider_user_id').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    providerSubjectUnique: uniqueIndex('oauth_identities_provider_provider_user_id_key').on(
      table.provider,
      table.providerUserId,
    ),
    userProviderUnique: uniqueIndex('oauth_identities_user_id_provider_key').on(
      table.userId,
      table.provider,
    ),
    userIdx: index('oauth_identities_user_id_idx').on(table.userId),
    providerCheck: check(
      'oauth_identities_provider_check',
      sql`${table.provider} IN ('google','microsoft','linkedin')`,
    ),
  }),
);

// docs/16-database-schema.md §3.7. Inert per Amendment A5 — see the
// note on `users` above; kept exactly as specified.
export const webauthnCredentials = pgTable(
  'webauthn_credentials',
  {
    id: uuid('id').primaryKey().default(uuidv7),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    credentialId: text('credential_id').notNull(),
    publicKey: bytea('public_key').notNull(),
    signCount: bigint('sign_count', { mode: 'number' }).notNull().default(0),
    lastUsedAt: timestamp('last_used_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    credentialIdUnique: uniqueIndex('webauthn_credentials_credential_id_key').on(
      table.credentialId,
    ),
    userIdx: index('webauthn_credentials_user_id_idx').on(table.userId),
  }),
);

// docs/16-database-schema.md §3.8. `event_id` has no FK constraint yet
// — `events` (§4.1) is a Milestone 1 deliverable; added by the
// migration that creates `events`, same phased sequencing as
// `organizations.logo_file_id` above. The "at least one of
// user_id/organization_id/event_id is non-null" invariant is
// application-enforced per the doc, not a DB CHECK.
export const authTokens = pgTable(
  'auth_tokens',
  {
    id: uuid('id').primaryKey().default(uuidv7),
    kind: text('kind').notNull(),
    tokenHash: text('token_hash').notNull(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
    organizationId: uuid('organization_id').references(() => organizations.id, {
      onDelete: 'cascade',
    }),
    eventId: uuid('event_id'),
    payload: jsonb('payload').notNull().default({}),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    usedAt: timestamp('used_at', { withTimezone: true }),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    tokenHashUnique: uniqueIndex('auth_tokens_token_hash_key').on(table.tokenHash),
    userKindIdx: index('auth_tokens_user_id_kind_idx').on(table.userId, table.kind),
    kindExpiresIdx: index('auth_tokens_kind_expires_at_idx').on(table.kind, table.expiresAt),
    kindCheck: check(
      'auth_tokens_kind_check',
      sql`${table.kind} IN ('invite','magic_link','verify_email','reset_password')`,
    ),
  }),
);

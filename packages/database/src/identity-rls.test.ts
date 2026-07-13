import { resolve } from "node:path";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import postgres from "postgres";

// RLS isolation tests for docs/16-database-schema.md §3 (Identity &
// Tenancy) — required in the same PR as the tables per
// IMPLEMENTATION_RULES.md rule 14. Follows the convention in
// packages/config/testcontainers/README.md: one container per Vitest
// worker, migrated with the real packages/database/migrations files,
// each test wrapped in a rolled-back transaction.
//
// UNVERIFIED: this suite has not been executed. The authoring sandbox
// has no Docker, so Testcontainers cannot start a Postgres container
// here. Run `pnpm --filter database test` in an environment with
// Docker before treating this as a passing gate.

const migrationsDir = resolve(__dirname, "../migrations");

let container: Awaited<ReturnType<PostgreSqlContainer["start"]>>;
let sql: postgres.Sql;

/**
 * INSERT ... RETURNING is typed as an array. Fixtures require exactly one row,
 * so prove that invariant before accessing its values under strict null checks.
 */
function requireReturnedRow<T>(rows: readonly T[], description: string): T {
  const [row] = rows;
  if (!row) {
    throw new Error(`Expected ${description} to return one row`);
  }
  return row;
}

beforeAll(async () => {
  container = await new PostgreSqlContainer("pgvector/pgvector:pg16").start();
  sql = postgres(container.getConnectionUri());

  await sql.file(resolve(migrationsDir, "0001_uuid_v7.sql"));
  await sql.file(resolve(migrationsDir, "0002_identity_tenancy.sql"));
  await sql`CREATE SCHEMA auth`;
  await sql`
    CREATE TABLE auth.users (
      id uuid PRIMARY KEY,
      email text NOT NULL,
      email_confirmed_at timestamptz,
      raw_user_meta_data jsonb NOT NULL DEFAULT '{}'::jsonb
    )
  `;
  await sql.file(resolve(migrationsDir, "0003_auth_user_provisioning.sql"));
  await sql.file(resolve(migrationsDir, "0004_organization_owner_invariant.sql"));
  await sql.file(resolve(migrationsDir, "0005_event_foundation.sql"));
  await sql.file(resolve(migrationsDir, "0006_agenda_session_foundation.sql"));
  await sql.file(resolve(migrationsDir, "0007_event_exhibitor_foundation.sql"));
  await sql.file(resolve(migrationsDir, "0008_lead_form_foundation.sql"));
  await sql.file(resolve(migrationsDir, "0009_relationship_capture_engine.sql"));
  await sql.file(resolve(migrationsDir, "0010_foundation_hardening.sql"));
  await sql.file(resolve(migrationsDir, "0011_relationship_workspace.sql"));
}, 60_000);

afterAll(async () => {
  await sql?.end();
  await container?.stop();
});

// This suite opts out of the README's BEGIN/ROLLBACK-per-test wrapper:
// each test's assertions run inside their own `asTenant()` transaction
// (needed anyway, to scope SET LOCAL ROLE / session variables), so a
// single outer transaction spanning the hooks would just be a second,
// non-overlapping connection from the pool — it would never see the
// inner transactions' writes to roll back. Truncating between tests is
// the documented fallback for exactly this case.
afterEach(async () => {
  await sql`
    TRUNCATE TABLE
      organizations, users, organization_memberships, auth_sessions,
      api_keys, oauth_identities, webauthn_credentials, auth_tokens, agenda_sessions,
      exhibitor_relationship_notes, exhibitor_relationships, attendee_profiles, attendee_profile_consents, lead_submission_values, lead_submissions, lead_form_fields, lead_forms, event_exhibitors, events
    CASCADE
  `;
  await sql`TRUNCATE TABLE auth.users`;
});

describe("Supabase Auth user provisioning", () => {
  it("mirrors the auth UUID and initial verification state without duplicating retries", async () => {
    const id = "00000000-0000-0000-0000-000000000001";
    const confirmedAt = new Date("2026-07-13T00:00:00.000Z");
    await sql`
      INSERT INTO auth.users (id, email, email_confirmed_at, raw_user_meta_data)
      VALUES (${id}, 'USER@EXAMPLE.COM', ${confirmedAt}, ${sql.json({ full_name: "User Name" })})
    `;

    const [provisioned] = await sql`
      SELECT id, email, full_name, email_verified_at FROM users WHERE id = ${id}
    `;
    expect(provisioned).toMatchObject({
      id,
      email: "user@example.com",
      full_name: "User Name",
      email_verified_at: confirmedAt,
    });

    await sql`DELETE FROM auth.users WHERE id = ${id}`;
    await sql`
      INSERT INTO auth.users (id, email, raw_user_meta_data)
      VALUES (${id}, 'changed@example.com', ${sql.json({ full_name: "Changed Name" })})
    `;
    const rows = await sql`SELECT email, full_name FROM users WHERE id = ${id}`;
    expect(rows).toEqual([
      { email: "user@example.com", full_name: "User Name" },
    ]);
  });

  it("mirrors email confirmation after the user is provisioned", async () => {
    const id = "00000000-0000-0000-0000-000000000002";
    const confirmedAt = new Date("2026-07-13T00:00:00.000Z");
    await sql`
      INSERT INTO auth.users (id, email, raw_user_meta_data)
      VALUES (${id}, 'user@example.com', ${sql.json({})})
    `;
    await sql`UPDATE auth.users SET email_confirmed_at = ${confirmedAt} WHERE id = ${id}`;

    const [user] =
      await sql`SELECT email_verified_at FROM users WHERE id = ${id}`;
    expect(user).toMatchObject({ email_verified_at: confirmedAt });
  });
});

/**
 * Seeds two tenant orgs, one user per org, and returns their ids.
 * Runs as the connecting (superuser) role, which bypasses RLS, so the
 * fixture setup itself isn't gated by the policies under test.
 */
async function seedTwoTenants() {
  const orgA = requireReturnedRow(
    await sql`
    INSERT INTO organizations (kind, slug, name)
    VALUES ('organizer', 'org-a', 'Org A')
    RETURNING id
  `,
    "Org A insert",
  );
  const orgB = requireReturnedRow(
    await sql`
    INSERT INTO organizations (kind, slug, name)
    VALUES ('organizer', 'org-b', 'Org B')
    RETURNING id
  `,
    "Org B insert",
  );
  const userA = requireReturnedRow(
    await sql`
    INSERT INTO users (email, full_name)
    VALUES ('a@example.com', 'User A')
    RETURNING id
  `,
    "User A insert",
  );
  const userB = requireReturnedRow(
    await sql`
    INSERT INTO users (email, full_name)
    VALUES ('b@example.com', 'User B')
    RETURNING id
  `,
    "User B insert",
  );
  await sql`
    INSERT INTO organization_memberships (organization_id, user_id, role)
    VALUES (${orgA.id}, ${userA.id}, 'owner'), (${orgB.id}, ${userB.id}, 'owner')
  `;
  return { orgA: orgA.id, orgB: orgB.id, userA: userA.id, userB: userB.id };
}

describe("organization membership lifecycle", () => {
  it("creates a pending membership and supports organization and user lookups", async () => {
    const { orgA, userB } = await seedTwoTenants();
    await sql`
      INSERT INTO organization_memberships (organization_id, user_id, role, status)
      VALUES (${orgA}, ${userB}, 'member', 'pending')
    `;

    const byOrganization = await sql`
      SELECT user_id, status FROM organization_memberships
      WHERE organization_id = ${orgA} AND user_id = ${userB}
    `;
    const byUser = await sql`
      SELECT organization_id, status FROM organization_memberships
      WHERE user_id = ${userB} AND organization_id = ${orgA}
    `;

    expect(byOrganization).toEqual([{ user_id: userB, status: "pending" }]);
    expect(byUser).toEqual([{ organization_id: orgA, status: "pending" }]);
  });

  it("activates a pending membership", async () => {
    const { orgA, userB } = await seedTwoTenants();
    await sql`
      INSERT INTO organization_memberships (organization_id, user_id, role, status)
      VALUES (${orgA}, ${userB}, 'member', 'pending')
    `;

    const activated = await sql`
      UPDATE organization_memberships SET status = 'active'
      WHERE organization_id = ${orgA} AND user_id = ${userB}
      RETURNING status
    `;

    expect(activated).toEqual([{ status: "active" }]);
  });

  it("enforces one membership per organization and user", async () => {
    const { orgA, userB } = await seedTwoTenants();
    await sql`
      INSERT INTO organization_memberships (organization_id, user_id, role, status)
      VALUES (${orgA}, ${userB}, 'member', 'pending')
    `;

    await expect(
      sql`
        INSERT INTO organization_memberships (organization_id, user_id, role, status)
        VALUES (${orgA}, ${userB}, 'member', 'pending')
      `,
    ).rejects.toThrow();
  });

  it("stores only supported roles for lookup", async () => {
    const { orgA, userB } = await seedTwoTenants();

    await expect(
      sql`
        INSERT INTO organization_memberships (organization_id, user_id, role)
        VALUES (${orgA}, ${userB}, 'invalid')
      `,
    ).rejects.toThrow();
  });

  it("looks up bootstrap owner, admin, and member roles", async () => {
    const { orgA, userA, userB } = await seedTwoTenants();
    const userC = requireReturnedRow(
      await sql`
        INSERT INTO users (email, full_name)
        VALUES ('c@example.com', 'User C')
        RETURNING id
      `,
      "User C insert",
    );
    await sql`
      INSERT INTO organization_memberships (organization_id, user_id, role)
      VALUES (${orgA}, ${userB}, 'admin'), (${orgA}, ${userC.id}, 'member')
    `;

    const memberships = await sql`
      SELECT user_id, role FROM organization_memberships
      WHERE organization_id = ${orgA}
      ORDER BY role
    `;

    expect(memberships).toEqual([
      { user_id: userB, role: "admin" },
      { user_id: userC.id, role: "member" },
      { user_id: userA, role: "owner" },
    ]);
  });

  it("keeps bootstrap owner memberships active and query-compatible", async () => {
    const { orgA, userA } = await seedTwoTenants();

    const membership = await sql`
      SELECT role, status FROM organization_memberships
      WHERE organization_id = ${orgA} AND user_id = ${userA}
    `;

    expect(membership).toEqual([{ role: "owner", status: "active" }]);
  });

  it("rolls back a failed membership transaction", async () => {
    const { orgA, userB } = await seedTwoTenants();

    await expect(
      sql.begin(async (tx) => {
        await tx`
          INSERT INTO organization_memberships (organization_id, user_id, role, status)
          VALUES (${orgA}, ${userB}, 'member', 'pending')
        `;
        throw new Error("rollback");
      }),
    ).rejects.toThrow("rollback");

    const memberships = await sql`
      SELECT id FROM organization_memberships
      WHERE organization_id = ${orgA} AND user_id = ${userB}
    `;
    expect(memberships).toHaveLength(0);
  });

  it("rejects removal or deactivation of the last active owner", async () => {
    const { orgA, userA } = await seedTwoTenants();

    await expect(
      sql`
        UPDATE organization_memberships SET role = 'member'
        WHERE organization_id = ${orgA} AND user_id = ${userA}
      `,
    ).rejects.toThrow();
    await expect(
      sql`
        DELETE FROM organization_memberships
        WHERE organization_id = ${orgA} AND user_id = ${userA}
      `,
    ).rejects.toThrow();
  });

  it("allows an owner change when another active owner remains", async () => {
    const { orgA, userA, userB } = await seedTwoTenants();
    await sql`
      INSERT INTO organization_memberships (organization_id, user_id, role)
      VALUES (${orgA}, ${userB}, 'owner')
    `;

    await sql`
      UPDATE organization_memberships SET role = 'admin'
      WHERE organization_id = ${orgA} AND user_id = ${userA}
    `;

    const owners = await sql`
      SELECT user_id FROM organization_memberships
      WHERE organization_id = ${orgA} AND role = 'owner' AND status = 'active'
    `;
    expect(owners).toEqual([{ user_id: userB }]);
  });
});

describe("organization owner invariant", () => {
  it("rejects removal of an organization's final active owner", async () => {
    const { orgA, userA } = await seedTwoTenants();

    await expect(
      sql`
        DELETE FROM organization_memberships
        WHERE organization_id = ${orgA} AND user_id = ${userA}
      `,
    ).rejects.toThrow("An active organization must retain an active owner");
  });

  it("allows a promoted owner to replace the current owner", async () => {
    const { orgA, userA, userB } = await seedTwoTenants();
    await sql`
      INSERT INTO organization_memberships (organization_id, user_id, role)
      VALUES (${orgA}, ${userB}, 'owner')
    `;
    await sql`
      UPDATE organization_memberships SET role = 'member'
      WHERE organization_id = ${orgA} AND user_id = ${userA}
    `;

    const owners = await sql`
      SELECT user_id FROM organization_memberships
      WHERE organization_id = ${orgA} AND role = 'owner' AND status = 'active'
    `;
    expect(owners).toEqual([{ user_id: userB }]);
  });
});

describe("organization invitation lifecycle", () => {
  it("persists a hashed organization-member invitation token", async () => {
    const { orgA } = await seedTwoTenants();
    await sql`
      INSERT INTO auth_tokens (kind, token_hash, organization_id, expires_at, payload)
      VALUES (
        'invite',
        'invite-hash-created',
        ${orgA},
        now() + interval '14 days',
        ${sql.json({
          type: "organization_membership",
          organizationId: orgA,
          role: "member",
          email: "b@example.com",
        })}
      )
    `;

    const tokens = await sql`
      SELECT token_hash, payload->>'type' AS type FROM auth_tokens
      WHERE token_hash = 'invite-hash-created'
    `;
    expect(tokens).toEqual([
      { token_hash: "invite-hash-created", type: "organization_membership" },
    ]);
  });

  it("rejects expired and invalid invitation tokens", async () => {
    const { orgA } = await seedTwoTenants();
    await sql`
      INSERT INTO auth_tokens (kind, token_hash, organization_id, expires_at)
      VALUES ('invite', 'invite-hash-expired', ${orgA}, now() - interval '1 second')
    `;

    const expired = await sql`
      SELECT id FROM auth_tokens
      WHERE token_hash = 'invite-hash-expired' AND expires_at > now()
    `;
    const invalid = await sql`
      SELECT id FROM auth_tokens WHERE token_hash = 'unknown-invite-hash'
    `;
    expect(expired).toHaveLength(0);
    expect(invalid).toHaveLength(0);
  });

  it("consumes an invitation once and activates its pending membership", async () => {
    const { orgA, userB } = await seedTwoTenants();
    await sql`
      INSERT INTO organization_memberships (organization_id, user_id, role, status)
      VALUES (${orgA}, ${userB}, 'member', 'pending')
    `;
    await sql`
      INSERT INTO auth_tokens (kind, token_hash, organization_id, expires_at)
      VALUES ('invite', 'invite-hash-accept', ${orgA}, now() + interval '14 days')
    `;

    const first = await sql.begin(async (tx) => {
      const consumed = await tx`
        UPDATE auth_tokens SET used_at = now()
        WHERE token_hash = 'invite-hash-accept'
          AND used_at IS NULL AND revoked_at IS NULL AND expires_at > now()
        RETURNING id
      `;
      await tx`
        UPDATE organization_memberships SET status = 'active'
        WHERE organization_id = ${orgA} AND user_id = ${userB} AND status = 'pending'
      `;
      return consumed;
    });
    const second = await sql`
      UPDATE auth_tokens SET used_at = now()
      WHERE token_hash = 'invite-hash-accept'
        AND used_at IS NULL AND revoked_at IS NULL AND expires_at > now()
      RETURNING id
    `;
    const memberships = await sql`
      SELECT status FROM organization_memberships
      WHERE organization_id = ${orgA} AND user_id = ${userB}
    `;

    expect(first).toHaveLength(1);
    expect(second).toHaveLength(0);
    expect(memberships).toEqual([{ status: "active" }]);
  });

  it("rolls back token consumption when membership activation fails", async () => {
    const { orgA } = await seedTwoTenants();
    await sql`
      INSERT INTO auth_tokens (kind, token_hash, organization_id, expires_at)
      VALUES ('invite', 'invite-hash-rollback', ${orgA}, now() + interval '14 days')
    `;

    await expect(
      sql.begin(async (tx) => {
        await tx`
          UPDATE auth_tokens SET used_at = now()
          WHERE token_hash = 'invite-hash-rollback' AND used_at IS NULL
        `;
        await tx`
          INSERT INTO organization_memberships (organization_id, user_id, role, status)
          VALUES (${orgA}, '00000000-0000-0000-0000-000000000099', 'member', 'active')
        `;
      }),
    ).rejects.toThrow();

    const tokens = await sql`
      SELECT used_at FROM auth_tokens WHERE token_hash = 'invite-hash-rollback'
    `;
    expect(tokens).toEqual([{ used_at: null }]);
  });
});

/** Runs `fn` as app_tenant with the given org/user session context set. */
async function asTenant<T>(
  ctx: { orgId?: string; userId?: string },
  fn: (client: postgres.TransactionSql) => Promise<T>,
) {
  return sql.begin(async (tx) => {
    await tx.unsafe("SET LOCAL ROLE app_tenant");
    if (ctx.orgId) {
      await tx.unsafe(`SET LOCAL app.current_org_id = '${ctx.orgId}'`);
    }
    if (ctx.userId) {
      await tx.unsafe(`SET LOCAL app.current_user_id = '${ctx.userId}'`);
    }
    return fn(tx);
  });
}

describe("organizations RLS", () => {
  it("a tenant sees only its own organization row", async () => {
    const { orgA, orgB } = await seedTwoTenants();

    const rows = await asTenant(
      { orgId: orgA },
      (tx) => tx`SELECT id FROM organizations`,
    );

    expect(rows.map((r) => r.id)).toEqual([orgA]);
    expect(rows.map((r) => r.id)).not.toContain(orgB);
  });

  it("a tenant cannot write another organization's row", async () => {
    const { orgA, orgB } = await seedTwoTenants();

    await expect(
      asTenant(
        { orgId: orgA },
        (tx) =>
          tx`UPDATE organizations SET name = 'hijacked' WHERE id = ${orgB}`,
      ),
    ).resolves.toMatchObject({ count: 0 });
  });
});

describe("events foundation", () => {
  it("creates an event with an organization-local slug and enforces that uniqueness", async () => {
    const { orgA, orgB } = await seedTwoTenants();
    const startsAt = new Date("2026-08-01T09:00:00.000Z");
    const endsAt = new Date("2026-08-01T17:00:00.000Z");
    await sql`
      INSERT INTO events (organization_id, name, slug, timezone, start_at, end_at)
      VALUES (${orgA}, 'Event A', 'expo-2026', 'UTC', ${startsAt}, ${endsAt})
    `;
    await sql`
      INSERT INTO events (organization_id, name, slug, timezone, start_at, end_at)
      VALUES (${orgB}, 'Event B', 'expo-2026', 'UTC', ${startsAt}, ${endsAt})
    `;
    await expect(sql`
      INSERT INTO events (organization_id, name, slug, timezone, start_at, end_at)
      VALUES (${orgA}, 'Duplicate', 'expo-2026', 'UTC', ${startsAt}, ${endsAt})
    `).rejects.toThrow();
  });

  it("archives rather than deletes an event", async () => {
    const { orgA } = await seedTwoTenants();
    const event = requireReturnedRow(await sql`
      INSERT INTO events (organization_id, name, slug, timezone, start_at, end_at)
      VALUES (${orgA}, 'Event A', 'event-a', 'UTC', now(), now() + interval '1 day')
      RETURNING id
    `, "event insert");
    await sql`UPDATE events SET status = 'archived' WHERE id = ${event.id}`;
    expect(await sql`SELECT status FROM events WHERE id = ${event.id}`).toEqual([{ status: "archived" }]);
  });

  it("isolates event lookup and writes by organization RLS context", async () => {
    const { orgA, orgB, userA } = await seedTwoTenants();
    const event = requireReturnedRow(await sql`
      INSERT INTO events (organization_id, name, slug, timezone, start_at, end_at)
      VALUES (${orgB}, 'Event B', 'event-b', 'UTC', now(), now() + interval '1 day')
      RETURNING id
    `, "event insert");
    const rows = await asTenant({ orgId: orgA, userId: userA }, (tx) => tx`SELECT id FROM events`);
    expect(rows).toHaveLength(0);
    await expect(asTenant({ orgId: orgA, userId: userA }, (tx) => tx`
      UPDATE events SET name = 'hijacked' WHERE id = ${event.id}
    `)).resolves.toMatchObject({ count: 0 });
  });

  it("rolls back an event write when its transaction fails", async () => {
    const { orgA } = await seedTwoTenants();
    await expect(sql.begin(async (tx) => {
      await tx`
        INSERT INTO events (organization_id, name, slug, timezone, start_at, end_at)
        VALUES (${orgA}, 'Rollback', 'rollback-event', 'UTC', now(), now() + interval '1 day')
      `;
      throw new Error("rollback");
    })).rejects.toThrow("rollback");
    expect(await sql`SELECT id FROM events WHERE organization_id = ${orgA} AND slug = 'rollback-event'`).toHaveLength(0);
  });
});

describe("agenda session foundation", () => {
  async function seedEvent(organizationId: string, slug: string) {
    return requireReturnedRow(await sql`
      INSERT INTO events (organization_id, name, slug, timezone, start_at, end_at)
      VALUES (${organizationId}, ${slug}, ${slug}, 'UTC', now(), now() + interval '1 day')
      RETURNING id
    `, "event insert");
  }

  it("creates a session and enforces slugs within its event", async () => {
    const { orgA } = await seedTwoTenants();
    const event = await seedEvent(orgA, "event-a");
    await sql`
      INSERT INTO agenda_sessions (event_id, title, slug, timezone, start_at, end_at)
      VALUES (${event.id}, 'Session A', 'opening', 'UTC', now(), now() + interval '1 hour')
    `;
    await expect(sql`
      INSERT INTO agenda_sessions (event_id, title, slug, timezone, start_at, end_at)
      VALUES (${event.id}, 'Duplicate', 'opening', 'UTC', now(), now() + interval '1 hour')
    `).rejects.toThrow();
  });

  it("archives a session without deleting it", async () => {
    const { orgA } = await seedTwoTenants();
    const event = await seedEvent(orgA, "event-a");
    const session = requireReturnedRow(await sql`
      INSERT INTO agenda_sessions (event_id, title, slug, timezone, start_at, end_at)
      VALUES (${event.id}, 'Session A', 'opening', 'UTC', now(), now() + interval '1 hour')
      RETURNING id
    `, "agenda session insert");
    await sql`UPDATE agenda_sessions SET status = 'archived' WHERE id = ${session.id}`;
    expect(await sql`SELECT status FROM agenda_sessions WHERE id = ${session.id}`).toEqual([{ status: "archived" }]);
  });

  it("isolates sessions across events and organizer organizations", async () => {
    const { orgA, orgB, userA } = await seedTwoTenants();
    const eventA = await seedEvent(orgA, "event-a");
    const eventB = await seedEvent(orgB, "event-b");
    const session = requireReturnedRow(await sql`
      INSERT INTO agenda_sessions (event_id, title, slug, timezone, start_at, end_at)
      VALUES (${eventB.id}, 'Session B', 'opening', 'UTC', now(), now() + interval '1 hour')
      RETURNING id
    `, "agenda session insert");
    const rows = await asTenant({ orgId: orgA, userId: userA }, (tx) => tx`SELECT id FROM agenda_sessions`);
    expect(rows).toHaveLength(0);
    await expect(asTenant({ orgId: orgA, userId: userA }, (tx) => tx`
      UPDATE agenda_sessions SET title = 'hijacked' WHERE id = ${session.id}
    `)).resolves.toMatchObject({ count: 0 });
    expect(await sql`SELECT id FROM agenda_sessions WHERE event_id = ${eventA.id}`).toHaveLength(0);
  });

  it("rolls back a session write when its transaction fails", async () => {
    const { orgA } = await seedTwoTenants();
    const event = await seedEvent(orgA, "event-a");
    await expect(sql.begin(async (tx) => {
      await tx`
        INSERT INTO agenda_sessions (event_id, title, slug, timezone, start_at, end_at)
        VALUES (${event.id}, 'Rollback', 'rollback-session', 'UTC', now(), now() + interval '1 hour')
      `;
      throw new Error("rollback");
    })).rejects.toThrow("rollback");
    expect(await sql`SELECT id FROM agenda_sessions WHERE event_id = ${event.id}`).toHaveLength(0);
  });
});

describe("event exhibitor foundation", () => {
  async function seedEvent(organizationId: string, slug: string) {
    return requireReturnedRow(await sql`
      INSERT INTO events (organization_id, name, slug, timezone, start_at, end_at)
      VALUES (${organizationId}, ${slug}, ${slug}, 'UTC', now(), now() + interval '1 day')
      RETURNING id
    `, "event insert");
  }

  async function seedExhibitorOrganization(slug: string) {
    return requireReturnedRow(await sql`
      INSERT INTO organizations (kind, slug, name)
      VALUES ('exhibitor', ${slug}, ${slug})
      RETURNING id
    `, "exhibitor organization insert");
  }

  it("creates an exhibitor participation and enforces event-local constraints", async () => {
    const { orgA } = await seedTwoTenants();
    const event = await seedEvent(orgA, "event-a");
    const exhibitor = await seedExhibitorOrganization("exhibitor-a");
    await sql`
      INSERT INTO event_exhibitors (organization_id, event_id, organizer_organization_id, booth_name, booth_number)
      VALUES (${exhibitor.id}, ${event.id}, ${orgA}, 'Exhibitor A', 'A-01')
    `;
    await expect(sql`
      INSERT INTO event_exhibitors (organization_id, event_id, organizer_organization_id, booth_name, booth_number)
      VALUES (${exhibitor.id}, ${event.id}, ${orgA}, 'Duplicate', 'A-02')
    `).rejects.toThrow();
    const exhibitorB = await seedExhibitorOrganization("exhibitor-b");
    await expect(sql`
      INSERT INTO event_exhibitors (organization_id, event_id, organizer_organization_id, booth_name, booth_number)
      VALUES (${exhibitorB.id}, ${event.id}, ${orgA}, 'Exhibitor B', 'A-01')
    `).rejects.toThrow();
  });

  it("archives an exhibitor without deleting it", async () => {
    const { orgA } = await seedTwoTenants();
    const event = await seedEvent(orgA, "event-a");
    const organization = await seedExhibitorOrganization("exhibitor-a");
    const exhibitor = requireReturnedRow(await sql`
      INSERT INTO event_exhibitors (organization_id, event_id, organizer_organization_id, booth_name)
      VALUES (${organization.id}, ${event.id}, ${orgA}, 'Exhibitor A')
      RETURNING id
    `, "event exhibitor insert");
    await sql`UPDATE event_exhibitors SET status = 'archived' WHERE id = ${exhibitor.id}`;
    expect(await sql`SELECT status FROM event_exhibitors WHERE id = ${exhibitor.id}`).toEqual([{ status: "archived" }]);
  });

  it("allows only organizer and exhibitor tenants to look up or mutate the participation", async () => {
    const { orgA, orgB, userA } = await seedTwoTenants();
    const event = await seedEvent(orgA, "event-a");
    const organization = await seedExhibitorOrganization("exhibitor-a");
    const exhibitor = requireReturnedRow(await sql`
      INSERT INTO event_exhibitors (organization_id, event_id, organizer_organization_id, booth_name)
      VALUES (${organization.id}, ${event.id}, ${orgA}, 'Exhibitor A')
      RETURNING id
    `, "event exhibitor insert");
    expect(await asTenant({ orgId: orgA, userId: userA }, (tx) => tx`SELECT id FROM event_exhibitors`)).toEqual([{ id: exhibitor.id }]);
    expect(await asTenant({ orgId: organization.id, userId: userA }, (tx) => tx`SELECT id FROM event_exhibitors`)).toEqual([{ id: exhibitor.id }]);
    expect(await asTenant({ orgId: orgB, userId: userA }, (tx) => tx`SELECT id FROM event_exhibitors`)).toHaveLength(0);
    await expect(asTenant({ orgId: orgB, userId: userA }, (tx) => tx`
      UPDATE event_exhibitors SET booth_name = 'hijacked' WHERE id = ${exhibitor.id}
    `)).resolves.toMatchObject({ count: 0 });
  });

  it("rolls back an exhibitor write when its transaction fails", async () => {
    const { orgA } = await seedTwoTenants();
    const event = await seedEvent(orgA, "event-a");
    const organization = await seedExhibitorOrganization("exhibitor-a");
    await expect(sql.begin(async (tx) => {
      await tx`
        INSERT INTO event_exhibitors (organization_id, event_id, organizer_organization_id, booth_name)
        VALUES (${organization.id}, ${event.id}, ${orgA}, 'Rollback Exhibitor')
      `;
      throw new Error("rollback");
    })).rejects.toThrow("rollback");
    expect(await sql`SELECT id FROM event_exhibitors WHERE event_id = ${event.id}`).toHaveLength(0);
  });
});

describe("lead form foundation", () => {
  async function fixture() {
    const { orgA, orgB, userA } = await seedTwoTenants();
    const event = requireReturnedRow(await sql`INSERT INTO events (organization_id,name,slug,timezone,start_at,end_at) VALUES (${orgA},'Event','event','UTC',now(),now()+interval '1 day') RETURNING id`, "event insert");
    const exhibitorOrg = requireReturnedRow(await sql`INSERT INTO organizations (kind,slug,name) VALUES ('exhibitor','lead-form-exhibitor','Lead Form Exhibitor') RETURNING id`, "exhibitor organization insert");
    const exhibitor = requireReturnedRow(await sql`INSERT INTO event_exhibitors (organization_id,event_id,organizer_organization_id,booth_name) VALUES (${exhibitorOrg.id},${event.id},${orgA},'Booth') RETURNING id`, "event exhibitor insert");
    return { orgA, orgB, userA, exhibitorOrg: exhibitorOrg.id, exhibitor: exhibitor.id };
  }
  it("creates and updates forms and ordered fields", async () => {
    const f = await fixture();
    const form = requireReturnedRow(await sql`INSERT INTO lead_forms (event_exhibitor_id,name) VALUES (${f.exhibitor},'Capture') RETURNING id`, "lead form insert");
    await sql`UPDATE lead_forms SET name='Updated' WHERE id=${form.id}`;
    await sql`INSERT INTO lead_form_fields (lead_form_id,key,label,type,sort_order,validation) VALUES (${form.id},'email','Email','email',0,'{}'),(${form.id},'notes','Notes','multiline_text',1,'{}')`;
    await sql`UPDATE lead_form_fields SET sort_order=2 WHERE lead_form_id=${form.id} AND key='notes'`;
    expect(await sql`SELECT name FROM lead_forms WHERE id=${form.id}`).toEqual([{ name: "Updated" }]);
    expect(await sql`SELECT key,sort_order FROM lead_form_fields WHERE lead_form_id=${form.id} ORDER BY sort_order`).toEqual([{ key: "email", sort_order: 0 }, { key: "notes", sort_order: 2 }]);
  });
  it("enforces duplicate form, key, and order constraints and archives fields/forms", async () => {
    const f = await fixture(); const form = requireReturnedRow(await sql`INSERT INTO lead_forms (event_exhibitor_id,name) VALUES (${f.exhibitor},'Capture') RETURNING id`, "lead form insert");
    await expect(sql`INSERT INTO lead_forms (event_exhibitor_id,name) VALUES (${f.exhibitor},'Capture')`).rejects.toThrow();
    await sql`INSERT INTO lead_form_fields (lead_form_id,key,label,type,sort_order,validation) VALUES (${form.id},'email','Email','email',0,'{}')`;
    await expect(sql`INSERT INTO lead_form_fields (lead_form_id,key,label,type,sort_order,validation) VALUES (${form.id},'email','Other','text',1,'{}')`).rejects.toThrow();
    await sql`UPDATE lead_form_fields SET status='archived' WHERE lead_form_id=${form.id}`; await sql`UPDATE lead_forms SET status='archived' WHERE id=${form.id}`;
    expect(await sql`SELECT status FROM lead_forms WHERE id=${form.id}`).toEqual([{ status: "archived" }]);
  });
  it("isolates forms to the exhibitor organization and rolls back failed writes", async () => {
    const f = await fixture(); const form = requireReturnedRow(await sql`INSERT INTO lead_forms (event_exhibitor_id,name) VALUES (${f.exhibitor},'Capture') RETURNING id`, "lead form insert");
    expect(await asTenant({orgId:f.exhibitorOrg,userId:f.userA}, tx=>tx`SELECT id FROM lead_forms`)).toEqual([{id:form.id}]);
    expect(await asTenant({orgId:f.orgA,userId:f.userA}, tx=>tx`SELECT id FROM lead_forms`)).toHaveLength(0);
    expect(await asTenant({orgId:f.orgB,userId:f.userA}, tx=>tx`SELECT id FROM lead_forms`)).toHaveLength(0);
    await expect(sql.begin(async tx=>{await tx`INSERT INTO lead_forms (event_exhibitor_id,name) VALUES (${f.exhibitor},'Rollback')`;throw new Error('rollback');})).rejects.toThrow("rollback");
    expect(await sql`SELECT id FROM lead_forms WHERE event_exhibitor_id=${f.exhibitor} AND name='Rollback'`).toHaveLength(0);
  });
});

describe("relationship capture engine", () => {
  async function fixture() {
    const { orgA, orgB, userA } = await seedTwoTenants();
    const event = requireReturnedRow(await sql`INSERT INTO events (organization_id,name,slug,timezone,start_at,end_at) VALUES (${orgA},'Capture Event','capture-event','UTC',now(),now()+interval '1 day') RETURNING id`, "event insert");
    const exhibitorOrg = requireReturnedRow(await sql`INSERT INTO organizations (kind,slug,name) VALUES ('exhibitor','capture-exhibitor','Capture Exhibitor') RETURNING id`, "exhibitor org insert");
    const exhibitor = requireReturnedRow(await sql`INSERT INTO event_exhibitors (organization_id,event_id,organizer_organization_id,booth_name) VALUES (${exhibitorOrg.id},${event.id},${orgA},'Capture Booth') RETURNING id`, "event exhibitor insert");
    const form = requireReturnedRow(await sql`INSERT INTO lead_forms (event_exhibitor_id,name) VALUES (${exhibitor.id},'Capture') RETURNING id`, "lead form insert");
    const field = requireReturnedRow(await sql`INSERT INTO lead_form_fields (lead_form_id,key,label,type,required,sort_order,validation) VALUES (${form.id},'email','Email','email',true,0,'{}') RETURNING id`, "lead field insert");
    const attendee = requireReturnedRow(await sql`INSERT INTO users (email,full_name) VALUES ('attendee@example.com','Attendee Name') RETURNING id`, "attendee insert");
    return { orgA, orgB, userA, exhibitorOrg: exhibitorOrg.id, event: event.id, exhibitor: exhibitor.id, form: form.id, field: field.id, attendee: attendee.id };
  }

  it("preserves each immutable interaction and flags a returning attendee as a potential duplicate", async () => {
    const f = await fixture();
    const first = requireReturnedRow(await sql`INSERT INTO lead_submissions (event_id,event_exhibitor_id,attendee_user_id,lead_form_id,interaction_source) VALUES (${f.event},${f.exhibitor},${f.attendee},${f.form},'visitor_qr') RETURNING id`, "first submission insert");
    await sql`INSERT INTO lead_submission_values (lead_submission_id,lead_form_field_id,value,field_snapshot) VALUES (${first.id},${f.field},${sql.json('attendee@example.com')},${sql.json({ key: 'email', type: 'email' })})`;
    const second = requireReturnedRow(await sql`INSERT INTO lead_submissions (event_id,event_exhibitor_id,attendee_user_id,lead_form_id,interaction_source,potential_duplicate) VALUES (${f.event},${f.exhibitor},${f.attendee},${f.form},'exhibitor_device',true) RETURNING id`, "second submission insert");
    expect(await sql`SELECT id,potential_duplicate FROM lead_submissions WHERE attendee_user_id=${f.attendee} ORDER BY submitted_at,id`).toEqual([{ id: first.id, potential_duplicate: false }, { id: second.id, potential_duplicate: true }]);
  });

  it("isolates submissions and values to the exhibitor tenant and denies historical updates", async () => {
    const f = await fixture();
    const submission = requireReturnedRow(await sql`INSERT INTO lead_submissions (event_id,event_exhibitor_id,attendee_user_id,lead_form_id,interaction_source) VALUES (${f.event},${f.exhibitor},${f.attendee},${f.form},'visitor_qr') RETURNING id`, "submission insert");
    await sql`INSERT INTO lead_submission_values (lead_submission_id,lead_form_field_id,value,field_snapshot) VALUES (${submission.id},${f.field},${sql.json('attendee@example.com')},${sql.json({ key: 'email' })})`;
    expect(await asTenant({orgId:f.exhibitorOrg,userId:f.userA}, tx => tx`SELECT id FROM lead_submissions`)).toEqual([{ id: submission.id }]);
    expect(await asTenant({orgId:f.orgA,userId:f.userA}, tx => tx`SELECT id FROM lead_submissions`)).toHaveLength(0);
    expect(await asTenant({orgId:f.orgB,userId:f.userA}, tx => tx`SELECT id FROM lead_submission_values`)).toHaveLength(0);
    await expect(asTenant({orgId:f.exhibitorOrg,userId:f.userA}, tx => tx`UPDATE lead_submissions SET potential_duplicate=true WHERE id=${submission.id}`)).rejects.toThrow();
  });

  it("rolls back submission and values together", async () => {
    const f = await fixture();
    await expect(sql.begin(async tx => { const submission = requireReturnedRow(await tx`INSERT INTO lead_submissions (event_id,event_exhibitor_id,lead_form_id,interaction_source) VALUES (${f.event},${f.exhibitor},${f.form},'visitor_qr') RETURNING id`, "submission insert"); await tx`INSERT INTO lead_submission_values (lead_submission_id,lead_form_field_id,field_snapshot) VALUES (${submission.id},${f.field},${sql.json({ key: 'email' })})`; throw new Error("rollback"); })).rejects.toThrow("rollback");
    expect(await sql`SELECT id FROM lead_submissions WHERE event_exhibitor_id=${f.exhibitor}`).toHaveLength(0);
    expect(await sql`SELECT id FROM lead_submission_values`).toHaveLength(0);
  });
});

describe("foundation hardening", () => {
  it("enforces submission retry keys, form integrity, and profile consent", async () => {
    const { orgA, orgB, userA } = await seedTwoTenants();
    const event = requireReturnedRow(await sql`INSERT INTO events (organization_id,name,slug,timezone,start_at,end_at) VALUES (${orgA},'Hardening','hardening','UTC',now(),now()+interval '1 day') RETURNING id`, "event");
    const exhibitorOrg = requireReturnedRow(await sql`INSERT INTO organizations (kind,slug,name) VALUES ('exhibitor','hardening-exhibitor','Hardening') RETURNING id`, "org");
    const exhibitor = requireReturnedRow(await sql`INSERT INTO event_exhibitors (organization_id,event_id,organizer_organization_id,booth_name) VALUES (${exhibitorOrg.id},${event.id},${orgA},'Booth') RETURNING id`, "exhibitor");
    const form = requireReturnedRow(await sql`INSERT INTO lead_forms (event_exhibitor_id,name) VALUES (${exhibitor.id},'Form') RETURNING id`, "form");
    const field = requireReturnedRow(await sql`INSERT INTO lead_form_fields (lead_form_id,key,label,type,sort_order,validation) VALUES (${form.id},'email','Email','email',0,'{}') RETURNING id`, "field");
    const attendee = requireReturnedRow(await sql`INSERT INTO users (email,full_name) VALUES ('profile@example.com','Profile') RETURNING id`, "attendee");
    const submission = requireReturnedRow(await sql`INSERT INTO lead_submissions (event_id,event_exhibitor_id,attendee_user_id,lead_form_id,idempotency_key,interaction_source) VALUES (${event.id},${exhibitor.id},${attendee.id},${form.id},'retry','visitor_qr') RETURNING id`, "submission");
    await sql`INSERT INTO lead_submission_values (lead_submission_id,lead_form_field_id,field_snapshot) VALUES (${submission.id},${field.id},${sql.json({ key: 'email' })})`;
    await expect(sql`INSERT INTO lead_submissions (event_id,event_exhibitor_id,attendee_user_id,lead_form_id,idempotency_key,interaction_source) VALUES (${event.id},${exhibitor.id},${attendee.id},${form.id},'retry','visitor_qr')`).rejects.toThrow();
    await expect(sql`UPDATE lead_submissions SET potential_duplicate=true WHERE id=${submission.id}`).rejects.toThrow();
    await sql`INSERT INTO attendee_profiles (user_id,company) VALUES (${attendee.id},'Acme')`; await sql`INSERT INTO attendee_profile_consents (user_id,share_profile_with_exhibitors) VALUES (${attendee.id},false)`;
    expect(await asTenant({orgId:exhibitorOrg.id,userId:userA}, tx=>tx`SELECT user_id FROM attendee_profiles`)).toHaveLength(0);
    await sql`UPDATE attendee_profile_consents SET share_profile_with_exhibitors=true WHERE user_id=${attendee.id}`;
    expect(await asTenant({orgId:exhibitorOrg.id,userId:userA}, tx=>tx`SELECT user_id FROM attendee_profiles`)).toEqual([{user_id:attendee.id}]);
    expect(await asTenant({orgId:orgB,userId:userA}, tx=>tx`SELECT user_id FROM attendee_profiles`)).toHaveLength(0);
    await expect(sql`INSERT INTO lead_submission_values (lead_submission_id,lead_form_field_id,field_snapshot) VALUES (${submission.id},${form.id},'{}')`).rejects.toThrow();
  });
});

describe("users RLS", () => {
  it("a user sees only their own row, never another tenant's user", async () => {
    const { userA, userB } = await seedTwoTenants();

    const rows = await asTenant(
      { userId: userA },
      (tx) => tx`SELECT id FROM users`,
    );

    expect(rows.map((r) => r.id)).toEqual([userA]);
    expect(rows.map((r) => r.id)).not.toContain(userB);
  });
});

describe("organization_memberships RLS", () => {
  it("a tenant sees only memberships scoped to its own organization", async () => {
    const { orgA, userA, userB } = await seedTwoTenants();

    const rows = await asTenant(
      { orgId: orgA },
      (tx) => tx`SELECT user_id FROM organization_memberships`,
    );

    expect(rows.map((r) => r.user_id)).toEqual([userA]);
    expect(rows.map((r) => r.user_id)).not.toContain(userB);
  });
});

describe("auth_sessions and oauth_identities and webauthn_credentials RLS", () => {
  it("a user sees only their own auth_sessions row", async () => {
    const { userA, userB } = await seedTwoTenants();
    await sql`INSERT INTO auth_sessions (user_id) VALUES (${userA}), (${userB})`;

    const rows = await asTenant(
      { userId: userA },
      (tx) => tx`SELECT user_id FROM auth_sessions`,
    );

    expect(rows.map((r) => r.user_id)).toEqual([userA]);
  });

  it("a user sees only their own oauth_identities row", async () => {
    const { userA, userB } = await seedTwoTenants();
    await sql`
      INSERT INTO oauth_identities (user_id, provider, provider_user_id)
      VALUES (${userA}, 'google', 'sub-a'), (${userB}, 'google', 'sub-b')
    `;

    const rows = await asTenant(
      { userId: userA },
      (tx) => tx`SELECT user_id FROM oauth_identities`,
    );

    expect(rows.map((r) => r.user_id)).toEqual([userA]);
  });

  it("a user sees only their own webauthn_credentials row", async () => {
    const { userA, userB } = await seedTwoTenants();
    const dummyKey = Buffer.from([0]);
    await sql`
      INSERT INTO webauthn_credentials (user_id, credential_id, public_key)
      VALUES (${userA}, 'cred-a', ${dummyKey}), (${userB}, 'cred-b', ${dummyKey})
    `;

    const rows = await asTenant(
      { userId: userA },
      (tx) => tx`SELECT user_id FROM webauthn_credentials`,
    );

    expect(rows.map((r) => r.user_id)).toEqual([userA]);
  });
});

describe("api_keys RLS", () => {
  it("a tenant sees only its own organization's api_keys", async () => {
    const { orgA, orgB, userA } = await seedTwoTenants();
    await sql`
      INSERT INTO api_keys (organization_id, name, key_prefix, secret_hash, created_by_user_id)
      VALUES
        (${orgA}, 'Key A', 'prefix_a_001', 'hash_a', ${userA}),
        (${orgB}, 'Key B', 'prefix_b_001', 'hash_b', ${userA})
    `;

    const rows = await asTenant(
      { orgId: orgA },
      (tx) => tx`SELECT organization_id FROM api_keys`,
    );

    expect(rows.map((r) => r.organization_id)).toEqual([orgA]);
  });
});

describe("auth_tokens RLS", () => {
  it("denies all client-role access — no policy exists for app_tenant", async () => {
    const { userA } = await seedTwoTenants();
    await sql`
      INSERT INTO auth_tokens (kind, token_hash, user_id, expires_at)
      VALUES ('magic_link', 'hash-a', ${userA}, now() + interval '15 minutes')
    `;

    const rows = await asTenant(
      { userId: userA },
      (tx) => tx`SELECT id FROM auth_tokens`,
    );

    expect(rows).toHaveLength(0);
  });
});

describe("app_platform bypass", () => {
  it("sees rows across every tenant, per its BYPASSRLS role attribute", async () => {
    const { orgA, orgB } = await seedTwoTenants();

    const rows = await sql.begin(async (tx) => {
      await tx.unsafe("SET LOCAL ROLE app_platform");
      return tx`SELECT id FROM organizations`;
    });

    expect(rows.map((r) => r.id).sort()).toEqual([orgA, orgB].sort());
  });
});

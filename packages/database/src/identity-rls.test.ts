import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import postgres from 'postgres';

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

const migrationsDir = resolve(dirname(fileURLToPath(import.meta.url)), '../migrations');

let container: Awaited<ReturnType<PostgreSqlContainer['start']>>;
let sql: postgres.Sql;

beforeAll(async () => {
  container = await new PostgreSqlContainer('pgvector/pgvector:pg16').start();
  sql = postgres(container.getConnectionUri());

  await sql.file(resolve(migrationsDir, '0001_uuid_v7.sql'));
  await sql.file(resolve(migrationsDir, '0002_identity_tenancy.sql'));
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
      api_keys, oauth_identities, webauthn_credentials, auth_tokens
    CASCADE
  `;
});

/**
 * Seeds two tenant orgs, one user per org, and returns their ids.
 * Runs as the connecting (superuser) role, which bypasses RLS, so the
 * fixture setup itself isn't gated by the policies under test.
 */
async function seedTwoTenants() {
  const [orgA] = await sql`
    INSERT INTO organizations (kind, slug, name)
    VALUES ('organizer', 'org-a', 'Org A')
    RETURNING id
  `;
  const [orgB] = await sql`
    INSERT INTO organizations (kind, slug, name)
    VALUES ('organizer', 'org-b', 'Org B')
    RETURNING id
  `;
  const [userA] = await sql`
    INSERT INTO users (email, full_name)
    VALUES ('a@example.com', 'User A')
    RETURNING id
  `;
  const [userB] = await sql`
    INSERT INTO users (email, full_name)
    VALUES ('b@example.com', 'User B')
    RETURNING id
  `;
  await sql`
    INSERT INTO organization_memberships (organization_id, user_id, role)
    VALUES (${orgA.id}, ${userA.id}, 'owner'), (${orgB.id}, ${userB.id}, 'owner')
  `;
  return { orgA: orgA.id, orgB: orgB.id, userA: userA.id, userB: userB.id };
}

/** Runs `fn` as app_tenant with the given org/user session context set. */
async function asTenant<T>(
  ctx: { orgId?: string; userId?: string },
  fn: (client: postgres.TransactionSql) => Promise<T>,
) {
  return sql.begin(async (tx) => {
    await tx.unsafe('SET LOCAL ROLE app_tenant');
    if (ctx.orgId) {
      await tx.unsafe(`SET LOCAL app.current_org_id = '${ctx.orgId}'`);
    }
    if (ctx.userId) {
      await tx.unsafe(`SET LOCAL app.current_user_id = '${ctx.userId}'`);
    }
    return fn(tx);
  });
}

describe('organizations RLS', () => {
  it('a tenant sees only its own organization row', async () => {
    const { orgA, orgB } = await seedTwoTenants();

    const rows = await asTenant({ orgId: orgA }, (tx) => tx`SELECT id FROM organizations`);

    expect(rows.map((r) => r.id)).toEqual([orgA]);
    expect(rows.map((r) => r.id)).not.toContain(orgB);
  });

  it('a tenant cannot write another organization\'s row', async () => {
    const { orgA, orgB } = await seedTwoTenants();

    await expect(
      asTenant({ orgId: orgA }, (tx) =>
        tx`UPDATE organizations SET name = 'hijacked' WHERE id = ${orgB}`,
      ),
    ).resolves.toMatchObject({ count: 0 });
  });
});

describe('users RLS', () => {
  it('a user sees only their own row, never another tenant\'s user', async () => {
    const { userA, userB } = await seedTwoTenants();

    const rows = await asTenant({ userId: userA }, (tx) => tx`SELECT id FROM users`);

    expect(rows.map((r) => r.id)).toEqual([userA]);
    expect(rows.map((r) => r.id)).not.toContain(userB);
  });
});

describe('organization_memberships RLS', () => {
  it('a tenant sees only memberships scoped to its own organization', async () => {
    const { orgA, userA, userB } = await seedTwoTenants();

    const rows = await asTenant(
      { orgId: orgA },
      (tx) => tx`SELECT user_id FROM organization_memberships`,
    );

    expect(rows.map((r) => r.user_id)).toEqual([userA]);
    expect(rows.map((r) => r.user_id)).not.toContain(userB);
  });
});

describe('auth_sessions and oauth_identities and webauthn_credentials RLS', () => {
  it('a user sees only their own auth_sessions row', async () => {
    const { userA, userB } = await seedTwoTenants();
    await sql`INSERT INTO auth_sessions (user_id) VALUES (${userA}), (${userB})`;

    const rows = await asTenant({ userId: userA }, (tx) => tx`SELECT user_id FROM auth_sessions`);

    expect(rows.map((r) => r.user_id)).toEqual([userA]);
  });

  it('a user sees only their own oauth_identities row', async () => {
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

  it('a user sees only their own webauthn_credentials row', async () => {
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

describe('api_keys RLS', () => {
  it('a tenant sees only its own organization\'s api_keys', async () => {
    const { orgA, orgB, userA } = await seedTwoTenants();
    await sql`
      INSERT INTO api_keys (organization_id, name, key_prefix, secret_hash, created_by_user_id)
      VALUES
        (${orgA}, 'Key A', 'prefix_a_001', 'hash_a', ${userA}),
        (${orgB}, 'Key B', 'prefix_b_001', 'hash_b', ${userA})
    `;

    const rows = await asTenant({ orgId: orgA }, (tx) => tx`SELECT organization_id FROM api_keys`);

    expect(rows.map((r) => r.organization_id)).toEqual([orgA]);
  });
});

describe('auth_tokens RLS', () => {
  it('denies all client-role access — no policy exists for app_tenant', async () => {
    const { userA } = await seedTwoTenants();
    await sql`
      INSERT INTO auth_tokens (kind, token_hash, user_id, expires_at)
      VALUES ('magic_link', 'hash-a', ${userA}, now() + interval '15 minutes')
    `;

    const rows = await asTenant({ userId: userA }, (tx) => tx`SELECT id FROM auth_tokens`);

    expect(rows).toHaveLength(0);
  });
});

describe('app_platform bypass', () => {
  it('sees rows across every tenant, per its BYPASSRLS role attribute', async () => {
    const { orgA, orgB } = await seedTwoTenants();

    const rows = await sql.begin(async (tx) => {
      await tx.unsafe('SET LOCAL ROLE app_platform');
      return tx`SELECT id FROM organizations`;
    });

    expect(rows.map((r) => r.id).sort()).toEqual([orgA, orgB].sort());
  });
});

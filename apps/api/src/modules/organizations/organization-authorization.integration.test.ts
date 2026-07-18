import { resolve } from "node:path";
import type { ExecutionContext } from "@nestjs/common";
import { ForbiddenException } from "@nestjs/common";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const database = vi.hoisted(() => ({
  db: undefined as unknown,
  setRlsContext: vi.fn(),
}));

vi.mock("@concourse/database", () => database);

import {
  requestContextStorage,
  type RequestContext,
} from "../../common/request-context";

import { MembershipsRepository } from "./memberships.repository";
import { OrganizationAuthorizationGuard } from "./organization-authorization.guard";
import { PermissionResolutionService } from "./permission-resolution.service";
import { RoleResolutionService } from "./role-resolution.service";

const migrationsDir = resolve(__dirname, "../../../../../packages/database/migrations");

let container: Awaited<ReturnType<PostgreSqlContainer["start"]>>;
let sql: postgres.Sql;

beforeAll(async () => {
  container = await new PostgreSqlContainer("pgvector/pgvector:pg16").start();
  sql = postgres(container.getConnectionUri());
  await sql.file(resolve(migrationsDir, "0001_uuid_v7.sql"));
  await sql.file(resolve(migrationsDir, "0002_identity_tenancy.sql"));
  database.db = drizzle(sql);
}, 180_000);

afterEach(async () => {
  database.setRlsContext.mockClear();
  await sql`
    TRUNCATE TABLE
      organization_memberships, organizations, users,
      auth_sessions, api_keys, oauth_identities, webauthn_credentials, auth_tokens
  `;
});

afterAll(async () => {
  await sql?.end();
  await container?.stop();
});

function executionContext(organizationId: string): ExecutionContext {
  return {
    getClass: () => class {},
    getHandler: () => () => undefined,
    switchToHttp: () => ({ getRequest: () => ({ params: { organizationId } }) }),
  } as unknown as ExecutionContext;
}

function context(orgId: string, userId: string): RequestContext {
  return {
    requestId: "request-id",
    traceId: "trace-id",
    principal: { kind: "session", userId },
    orgId,
  };
}

function guard(permission: string) {
  const memberships = new MembershipsRepository();
  const roles = new RoleResolutionService(memberships);
  return new OrganizationAuthorizationGuard(
    { getAllAndOverride: () => [permission] } as never,
    new PermissionResolutionService(roles),
  );
}

async function seed(role: "owner" | "admin" | "member", status = "active") {
  const [organization] = await sql`
    INSERT INTO organizations (kind, slug, name)
    VALUES ('organizer', 'authorization-org', 'Authorization Org')
    RETURNING id
  `;
  const [user] = await sql`
    INSERT INTO users (email, full_name)
    VALUES ('user@example.com', 'User')
    RETURNING id
  `;
  if (!organization || !user) {
    throw new Error("Authorization test fixtures were not created.");
  }
  await sql`
    INSERT INTO organization_memberships (organization_id, user_id, role, status)
    VALUES (${organization.id}, ${user.id}, ${role}, ${status})
  `;
  return { organizationId: organization.id, userId: user.id };
}

describe("organization authorization integration", () => {
  it.each([
    ["owner", "organizations:update"],
    ["admin", "memberships:invite"],
    ["member", "organizations:read"],
  ] as const)("authorizes an active %s", async (role, permission) => {
    const { organizationId, userId } = await seed(role);

    await expect(
      requestContextStorage.run(context(organizationId, userId), () =>
        guard(permission).canActivate(executionContext(organizationId)),
      ),
    ).resolves.toBe(true);
    expect(database.setRlsContext).toHaveBeenCalledWith(
      expect.anything(),
      organizationId,
      userId,
    );
  });

  it("denies pending and missing memberships", async () => {
    const { organizationId, userId } = await seed("member", "pending");
    const [nonMember] = await sql`
      INSERT INTO users (email, full_name)
      VALUES ('non-member@example.com', 'Non Member')
      RETURNING id
    `;
    if (!nonMember) {
      throw new Error("Non-member fixture was not created.");
    }
    const authorizationGuard = guard("organizations:read");

    await expect(
      requestContextStorage.run(context(organizationId, userId), () =>
        authorizationGuard.canActivate(executionContext(organizationId)),
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(
      requestContextStorage.run(context(organizationId, nonMember.id), () =>
        authorizationGuard.canActivate(executionContext(organizationId)),
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("denies missing permission and cross-organization access", async () => {
    const { organizationId, userId } = await seed("member");
    const [otherOrganization] = await sql`
      INSERT INTO organizations (kind, slug, name)
      VALUES ('organizer', 'other-authorization-org', 'Other Authorization Org')
      RETURNING id
    `;
    if (!otherOrganization) {
      throw new Error("Second organization fixture was not created.");
    }

    await expect(
      requestContextStorage.run(context(organizationId, userId), () =>
        guard("organizations:update").canActivate(executionContext(organizationId)),
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(
      requestContextStorage.run(context(organizationId, userId), () =>
        guard("organizations:read").canActivate(executionContext(otherOrganization.id)),
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});

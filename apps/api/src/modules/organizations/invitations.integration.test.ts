import { resolve } from "node:path";
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const database = vi.hoisted(() => ({
  db: undefined as unknown,
  setRlsContext: vi.fn(),
}));

vi.mock("@concourse/database", () => database);

import { hashInvitationToken, InvitationsService } from "./invitations.service";

const migrationsDir = resolve(
  __dirname,
  "../../../../../packages/database/migrations",
);

let container: Awaited<ReturnType<PostgreSqlContainer["start"]>>;
let sql: postgres.Sql;

beforeAll(async () => {
  container = await new PostgreSqlContainer("pgvector/pgvector:pg16")
    .withStartupTimeout(300_000)
    .start();
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
  await sql.file(
    resolve(migrationsDir, "0004_organization_owner_invariant.sql"),
  );
  await sql.file(resolve(migrationsDir, "0005_event_foundation.sql"));
  await sql.file(resolve(migrationsDir, "0006_agenda_session_foundation.sql"));
  await sql.file(resolve(migrationsDir, "0007_event_exhibitor_foundation.sql"));
  await sql.file(resolve(migrationsDir, "0008_lead_form_foundation.sql"));
  await sql.file(resolve(migrationsDir, "0016_exhibitor_workflow.sql"));
  database.db = drizzle(sql);
}, 360_000);

afterEach(async () => {
  await sql`
    TRUNCATE TABLE
      event_exhibitors, events, auth_tokens, organization_memberships,
      organizations, users, auth_sessions, api_keys, oauth_identities,
      webauthn_credentials CASCADE
  `;
});

afterAll(async () => {
  await sql?.end();
  await container?.stop();
});

async function seedInvitationTarget() {
  const [organization] = await sql`
    INSERT INTO organizations (kind, slug, name)
    VALUES ('organizer', 'invitation-org', 'Invitation Org')
    RETURNING id
  `;
  const [owner] = await sql`
    INSERT INTO users (email, full_name)
    VALUES ('owner@example.com', 'Owner')
    RETURNING id
  `;
  const [recipient] = await sql`
    INSERT INTO users (email, full_name)
    VALUES ('recipient@example.com', 'Recipient')
    RETURNING id
  `;
  if (!organization || !owner || !recipient) {
    throw new Error("Invitation test fixtures were not created.");
  }
  await sql`
    INSERT INTO organization_memberships (organization_id, user_id, role)
    VALUES (${organization.id}, ${owner.id}, 'owner')
  `;
  return {
    organizationId: organization.id,
    ownerId: owner.id,
    recipientId: recipient.id,
  };
}

describe("organization invitation acceptance integration", () => {
  it("transitions the pending membership to active and replays safely", async () => {
    const { organizationId, ownerId, recipientId } =
      await seedInvitationTarget();
    const service = new InvitationsService();
    const invitation = await service.createOrganizationInvitation({
      organizationId,
      email: "recipient@example.com",
      invitedByUserId: ownerId,
    });

    const pending = await sql`
      SELECT status FROM organization_memberships
      WHERE organization_id = ${organizationId} AND user_id = ${recipientId}
    `;
    expect(pending).toEqual([{ status: "pending" }]);

    await expect(
      service.accept({ token: invitation.token, userId: recipientId }),
    ).resolves.toMatchObject({
      status: "accepted",
    });
    await expect(
      service.accept({ token: invitation.token, userId: recipientId }),
    ).resolves.toMatchObject({
      status: "accepted",
    });

    const membership = await sql`
      SELECT status FROM organization_memberships
      WHERE organization_id = ${organizationId} AND user_id = ${recipientId}
    `;
    expect(membership).toEqual([{ status: "active" }]);
  });

  it("creates the membership when the invitee signs up after invitation", async () => {
    const { organizationId, ownerId, recipientId } =
      await seedInvitationTarget();
    const service = new InvitationsService();
    const invitation = await service.createOrganizationInvitation({
      organizationId,
      email: "recipient@example.com",
      invitedByUserId: ownerId,
    });
    await sql`
      DELETE FROM organization_memberships
      WHERE organization_id = ${organizationId} AND user_id = ${recipientId}
    `;

    await expect(
      service.accept({ token: invitation.token, userId: recipientId }),
    ).resolves.toMatchObject({
      status: "accepted",
    });

    const [token] = await sql`
      SELECT used_at FROM auth_tokens
      WHERE token_hash = ${hashInvitationToken(invitation.token)}
    `;
    expect(token?.used_at).not.toBeNull();
    const memberships = await sql`
      SELECT status FROM organization_memberships
      WHERE organization_id = ${organizationId} AND user_id = ${recipientId}
    `;
    expect(memberships).toEqual([{ status: "active" }]);
  });

  it("accepts concurrent claims once without duplicating the membership", async () => {
    const { organizationId, ownerId, recipientId } =
      await seedInvitationTarget();
    const service = new InvitationsService();
    const invitation = await service.createOrganizationInvitation({
      organizationId,
      email: "recipient@example.com",
      invitedByUserId: ownerId,
    });

    await expect(
      Promise.all([
        service.accept({ token: invitation.token, userId: recipientId }),
        service.accept({ token: invitation.token, userId: recipientId }),
      ]),
    ).resolves.toHaveLength(2);

    const memberships = await sql`
      SELECT status FROM organization_memberships
      WHERE organization_id = ${organizationId} AND user_id = ${recipientId}
    `;
    expect(memberships).toEqual([{ status: "active" }]);
  });
});

describe("event exhibitor invitation acceptance integration", () => {
  it("creates one exhibitor organization and event participation and replays safely", async () => {
    const { organizationId, ownerId, recipientId } =
      await seedInvitationTarget();
    const [event] = await sql`
      INSERT INTO events (organization_id, name, slug, timezone, start_at, end_at)
      VALUES (${organizationId}, 'Invitation Expo', 'invitation-expo', 'UTC', now(), now() + interval '1 day')
      RETURNING id
    `;
    if (!event) throw new Error("Event fixture was not created.");
    const service = new InvitationsService();
    const invitation = await service.createEventExhibitorInvitation({
      organizationId,
      eventId: event.id,
      email: "recipient@example.com",
      companyName: "Recipient Labs",
      invitedByUserId: ownerId,
    });

    const accepted = await service.accept({
      token: invitation.token,
      userId: recipientId,
    });
    await expect(
      service.accept({ token: invitation.token, userId: recipientId }),
    ).resolves.toEqual(accepted);

    expect(accepted).toMatchObject({
      status: "accepted",
      type: "event_exhibitor_claim",
    });
    if (accepted.type !== "event_exhibitor_claim") {
      throw new Error("Event exhibitor invitation returned the wrong result.");
    }
    const organizationsCreated = await sql`
      SELECT organization.kind, membership.role, membership.status
      FROM organizations organization
      JOIN organization_memberships membership ON membership.organization_id = organization.id
      WHERE membership.user_id = ${recipientId} AND organization.kind = 'exhibitor'
    `;
    expect(organizationsCreated).toEqual([
      { kind: "exhibitor", role: "owner", status: "active" },
    ]);
    const participations = await sql`
      SELECT status FROM event_exhibitors
      WHERE event_id = ${event.id} AND organization_id = ${accepted.organizationId}
    `;
    expect(participations).toEqual([{ status: "accepted" }]);
  });
});

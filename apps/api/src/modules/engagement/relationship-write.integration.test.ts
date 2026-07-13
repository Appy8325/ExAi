import { resolve } from "node:path";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const database = vi.hoisted(() => ({ db: undefined as unknown, setRlsContext: vi.fn() }));
vi.mock("@concourse/database", () => database);

import { LeadSubmissionsRepository } from "./lead-submissions.repository";
import { RelationshipNotesRepository } from "./relationship-notes.repository";

const migrationsDir = resolve(__dirname, "../../../../../packages/database/migrations");
const migrations = [
  "0001_uuid_v7.sql", "0002_identity_tenancy.sql", "0003_auth_user_provisioning.sql",
  "0004_organization_owner_invariant.sql", "0005_event_foundation.sql", "0006_agenda_session_foundation.sql",
  "0007_event_exhibitor_foundation.sql", "0008_lead_form_foundation.sql", "0009_relationship_capture_engine.sql",
  "0010_foundation_hardening.sql", "0011_relationship_workspace.sql",
];

let container: Awaited<ReturnType<PostgreSqlContainer["start"]>>;
let sql: postgres.Sql;
let client: ReturnType<typeof drizzle>;

function row<T>(rows: readonly T[], description: string): T {
  const result = rows[0];
  if (!result) throw new Error(`Expected ${description} to return one row`);
  return result;
}

async function asTenant<T>(orgId: string, fn: (tx: postgres.TransactionSql) => Promise<T>) {
  return sql.begin(async (tx) => {
    await tx.unsafe("SET LOCAL ROLE app_tenant");
    await tx.unsafe(`SET LOCAL app.current_org_id = '${orgId}'`);
    return fn(tx);
  });
}

beforeAll(async () => {
  container = await new PostgreSqlContainer("pgvector/pgvector:pg16").start();
  sql = postgres(container.getConnectionUri());
  await sql.file(resolve(migrationsDir, migrations[0]!));
  await sql.file(resolve(migrationsDir, migrations[1]!));
  await sql`CREATE SCHEMA auth`;
  await sql`CREATE TABLE auth.users (id uuid PRIMARY KEY, email text NOT NULL, email_confirmed_at timestamptz, raw_user_meta_data jsonb NOT NULL DEFAULT '{}'::jsonb)`;
  for (const migration of migrations.slice(2)) await sql.file(resolve(migrationsDir, migration));
  client = drizzle(sql);
  database.db = client;
}, 60_000);

afterEach(async () => {
  await sql`TRUNCATE TABLE exhibitor_relationship_notes, exhibitor_relationships, lead_submission_values, lead_submissions, lead_form_fields, lead_forms, event_exhibitors, events, attendee_profiles, attendee_profile_consents, organizations, users CASCADE`;
});

afterAll(async () => {
  await sql?.end();
  await container?.stop();
});

async function fixture() {
  const organizer = row(await sql`INSERT INTO organizations(kind, slug, name) VALUES ('organizer', 'rw-organizer', 'Organizer') RETURNING id`, "organizer");
  const exhibitorOrganization = row(await sql`INSERT INTO organizations(kind, slug, name) VALUES ('exhibitor', 'rw-exhibitor', 'Exhibitor') RETURNING id`, "exhibitor organization");
  const otherOrganization = row(await sql`INSERT INTO organizations(kind, slug, name) VALUES ('exhibitor', 'rw-other', 'Other') RETURNING id`, "other organization");
  const actor = row(await sql`INSERT INTO users(email, full_name) VALUES ('actor@example.com', 'Actor') RETURNING id`, "actor");
  const attendee = row(await sql`INSERT INTO users(email, full_name) VALUES ('attendee@example.com', 'Attendee') RETURNING id`, "attendee");
  const event = row(await sql`INSERT INTO events(organization_id, name, slug, timezone, start_at, end_at) VALUES (${organizer.id}, 'Event', 'event', 'UTC', now(), now() + interval '1 day') RETURNING id`, "event");
  const exhibitor = row(await sql`INSERT INTO event_exhibitors(organization_id, event_id, organizer_organization_id, booth_name) VALUES (${exhibitorOrganization.id}, ${event.id}, ${organizer.id}, 'Booth') RETURNING id`, "exhibitor");
  const form = row(await sql`INSERT INTO lead_forms(event_exhibitor_id, name) VALUES (${exhibitor.id}, 'Form') RETURNING id`, "form");
  await sql`INSERT INTO lead_form_fields(lead_form_id, key, label, type, sort_order, validation) VALUES (${form.id}, 'email', 'Email', 'email', 0, '{}')`;
  return { actor: actor.id, attendee: attendee.id, event: event.id, exhibitor: exhibitor.id, form: form.id, organizationId: exhibitorOrganization.id, otherOrganizationId: otherOrganization.id };
}

describe("relationship write repositories", () => {
  it("creates and reuses one relationship, updates its timestamps and count, and ignores an idempotent retry", async () => {
    const f = await fixture();
    const submissions = new LeadSubmissionsRepository(client as never);
    const input = { organizationId: f.organizationId, actorUserId: f.actor, eventId: f.event, eventExhibitorId: f.exhibitor, attendeeUserId: f.attendee, leadFormId: f.form, interactionSource: "visitor_qr" as const, responses: { email: "attendee@example.com" } };

    const first = await submissions.create({ ...input, idempotencyKey: "first" });
    const before = row(await sql`SELECT id, first_interaction_at, latest_interaction_at, interaction_count FROM exhibitor_relationships`, "relationship after first submission");
    const retry = await submissions.create({ ...input, idempotencyKey: "first" });
    const second = await submissions.create({ ...input, idempotencyKey: "second" });
    const relationship = row(await sql`SELECT id, first_interaction_at, latest_interaction_at, interaction_count, has_potential_duplicate FROM exhibitor_relationships`, "relationship after second submission");

    expect(retry.id).toBe(first.id);
    expect(second.id).not.toBe(first.id);
    expect(relationship.id).toBe(before.id);
    expect(relationship.interaction_count).toBe(2);
    expect(relationship.first_interaction_at).toEqual(before.first_interaction_at);
    expect(new Date(relationship.latest_interaction_at).getTime()).toBeGreaterThanOrEqual(new Date(before.latest_interaction_at).getTime());
    expect(relationship.has_potential_duplicate).toBe(true);
    expect(await sql`SELECT id FROM lead_submissions WHERE relationship_id = ${relationship.id}`).toHaveLength(2);
  });

  it("rolls back a failed submission before it can create a relationship", async () => {
    const f = await fixture();
    const submissions = new LeadSubmissionsRepository(client as never);

    await expect(submissions.create({ organizationId: f.organizationId, actorUserId: f.actor, eventId: f.event, eventExhibitorId: f.exhibitor, attendeeUserId: f.attendee, leadFormId: "00000000-0000-0000-0000-000000000001", idempotencyKey: "invalid", interactionSource: "visitor_qr", responses: { email: "attendee@example.com" } })).rejects.toThrow("Lead form not found");

    expect(await sql`SELECT id FROM exhibitor_relationships`).toHaveLength(0);
    expect(await sql`SELECT id FROM lead_submissions`).toHaveLength(0);
  });

  it("creates, updates, and archives exhibitor-private notes without partial writes", async () => {
    const f = await fixture();
    const relationship = row(await sql`INSERT INTO exhibitor_relationships(event_exhibitor_id, attendee_user_id) VALUES (${f.exhibitor}, ${f.attendee}) RETURNING id`, "relationship");
    const notes = new RelationshipNotesRepository(client as never);

    const note = await notes.create({ organizationId: f.organizationId, actorUserId: f.actor, relationshipId: relationship.id, body: "Initial note" });
    const updated = await notes.update({ organizationId: f.organizationId, actorUserId: f.actor, noteId: note!.id, body: "Updated note" });
    const archived = await notes.archive({ organizationId: f.organizationId, actorUserId: f.actor, noteId: note!.id });

    expect(updated).toMatchObject({ id: note!.id, body: "Updated note", status: "active" });
    expect(archived).toMatchObject({ id: note!.id, status: "archived" });
    expect(await sql`SELECT id FROM exhibitor_relationship_notes WHERE status = 'active'`).toHaveLength(0);
    await expect(notes.create({ organizationId: f.organizationId, actorUserId: f.actor, relationshipId: "00000000-0000-0000-0000-000000000001", body: "Cannot persist" })).rejects.toThrow();
    expect(await sql`SELECT id FROM exhibitor_relationship_notes WHERE body = 'Cannot persist'`).toHaveLength(0);
  });

  it("enforces relationship-note RLS between exhibitor organizations", async () => {
    const f = await fixture();
    const relationship = row(await sql`INSERT INTO exhibitor_relationships(event_exhibitor_id, attendee_user_id) VALUES (${f.exhibitor}, ${f.attendee}) RETURNING id`, "relationship");
    const note = row(await sql`INSERT INTO exhibitor_relationship_notes(relationship_id, body, created_by_user_id) VALUES (${relationship.id}, 'Private', ${f.actor}) RETURNING id`, "note");

    expect(await asTenant(f.organizationId, (tx) => tx`SELECT id FROM exhibitor_relationship_notes`)).toEqual([{ id: note.id }]);
    expect(await asTenant(f.otherOrganizationId, (tx) => tx`SELECT id FROM exhibitor_relationship_notes`)).toHaveLength(0);
    await expect(asTenant(f.otherOrganizationId, (tx) => tx`UPDATE exhibitor_relationship_notes SET body = 'hijacked' WHERE id = ${note.id}`)).resolves.toMatchObject({ count: 0 });
  });
});

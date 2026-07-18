import { resolve } from "node:path";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { sql as drizzleSql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const database = vi.hoisted(() => ({ db: undefined as unknown, setRlsContext: vi.fn() }));
vi.mock("@concourse/database", () => database);

import { LeadSubmissionsRepository } from "./lead-submissions.repository";
import { RelationshipNotesRepository } from "./relationship-notes.repository";
import { RelationshipWorkspaceRepository } from "./relationship-workspace.repository";
import { ExhibitorDashboardRepository } from "./exhibitor-dashboard.repository";
import { PlatformEnrollmentService } from "./platform-enrollment.service";
import { LeadSubmissionsService } from "./lead-submissions.service";

database.setRlsContext.mockImplementation(async (tx: { execute(query: ReturnType<typeof drizzleSql>): Promise<unknown> }, organizationId: string, actorUserId?: string) => {
  await tx.execute(drizzleSql`SELECT set_config('app.current_org_id', ${organizationId}, true)`);
  if (actorUserId) await tx.execute(drizzleSql`SELECT set_config('app.current_user_id', ${actorUserId}, true)`);
});

const migrationsDir = resolve(__dirname, "../../../../../packages/database/migrations");
const migrations = [
  "0001_uuid_v7.sql", "0002_identity_tenancy.sql", "0003_auth_user_provisioning.sql",
  "0004_organization_owner_invariant.sql", "0005_event_foundation.sql", "0006_agenda_session_foundation.sql",
  "0007_event_exhibitor_foundation.sql", "0008_lead_form_foundation.sql", "0009_relationship_capture_engine.sql",
  "0010_foundation_hardening.sql", "0011_relationship_workspace.sql", "0012_exhibitor_dashboard.sql", "0013_progressive_enrichment.sql", "0014_public_enrollment.sql",
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
}, 180_000);

afterEach(async () => {
  await sql`TRUNCATE TABLE public_enrollments, relationship_enrichments, exhibitor_dashboard_visits, exhibitor_relationship_notes, exhibitor_relationships, lead_submission_values, lead_submissions, lead_form_fields, lead_forms, event_exhibitors, events, attendee_profiles, attendee_profile_consents, organizations, users CASCADE`;
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

  it("returns a consent-filtered workspace projection with ordered immutable interactions and active notes", async () => {
    const f = await fixture();
    const submissions = new LeadSubmissionsRepository(client as never);
    const input = { organizationId: f.organizationId, actorUserId: f.actor, eventId: f.event, eventExhibitorId: f.exhibitor, attendeeUserId: f.attendee, leadFormId: f.form, interactionSource: "visitor_qr" as const, responses: { email: "attendee@example.com" } };
    const first = await submissions.create({ ...input, idempotencyKey: "workspace-first" });
    const second = await submissions.create({ ...input, idempotencyKey: "workspace-second" });
    const relationship = row(await sql`SELECT id FROM exhibitor_relationships WHERE event_exhibitor_id = ${f.exhibitor} AND attendee_user_id = ${f.attendee}`, "relationship");
    const notes = new RelationshipNotesRepository(client as never);
    await notes.create({ organizationId: f.organizationId, actorUserId: f.actor, relationshipId: relationship.id, body: "Visible" });
    const archived = await notes.create({ organizationId: f.organizationId, actorUserId: f.actor, relationshipId: relationship.id, body: "Archived" });
    await notes.archive({ organizationId: f.organizationId, actorUserId: f.actor, noteId: archived!.id });
    await sql`INSERT INTO attendee_profiles(user_id, company, job_title, industry, linkedin_url) VALUES (${f.attendee}, 'Acme', 'Buyer', 'Events', 'https://linkedin.example/attendee')`;
    await sql`INSERT INTO attendee_profile_consents(user_id, share_profile_with_exhibitors) VALUES (${f.attendee}, false)`;
    const workspace = new RelationshipWorkspaceRepository(client as never);

    expect(await workspace.find({ organizationId: f.organizationId, actorUserId: f.actor, relationshipId: relationship.id })).toMatchObject({ attendee: { consentStatus: "not_shared", name: null, contact: { email: null }, profileCompleteness: 0 }, relationship: { interactionCount: 2, hasPotentialDuplicate: true }, timeline: [{ id: first.id }, { id: second.id }], notes: [{ body: "Visible" }], summary: { interactionCount: 2, noteCount: 1, profileCompleteness: 0 } });
    await sql`UPDATE attendee_profile_consents SET share_profile_with_exhibitors = true WHERE user_id = ${f.attendee}`;
    expect(await workspace.find({ organizationId: f.organizationId, actorUserId: f.actor, relationshipId: relationship.id })).toMatchObject({ attendee: { consentStatus: "shared", name: "Attendee", company: "Acme", title: "Buyer", industry: "Events", contact: { email: "attendee@example.com", linkedInUrl: "https://linkedin.example/attendee" }, profileCompleteness: 100 }, timeline: [{ values: [{ value: "attendee@example.com", field: { key: "email" } }] }, { values: [{ value: "attendee@example.com", field: { key: "email" } }] }] });
  });

  it("returns one exhibitor-scoped dashboard projection and records the visit boundary", async () => {
    const f = await fixture();
    const submissions = new LeadSubmissionsRepository(client as never);
    await submissions.create({ organizationId: f.organizationId, actorUserId: f.actor, eventId: f.event, eventExhibitorId: f.exhibitor, attendeeUserId: f.attendee, leadFormId: f.form, idempotencyKey: "dashboard", interactionSource: "visitor_qr", responses: { email: "attendee@example.com" } });
    const dashboard = new ExhibitorDashboardRepository(client as never);
    const first = await dashboard.find({ organizationId: f.organizationId, actorUserId: f.actor, eventExhibitorId: f.exhibitor });
    const second = await dashboard.find({ organizationId: f.organizationId, actorUserId: f.actor, eventExhibitorId: f.exhibitor });

    expect(first).toMatchObject({ sinceLastVisited: { since: null, newRelationships: 1 }, pipeline: { new: 1, active: 1, returning: 0, needsFollowUp: 1 }, performance: { qrScans: 1, relationshipsCreated: 1 } });
    expect(second?.sinceLastVisited.since).toBeTruthy();
    expect(second?.sinceLastVisited.newRelationships).toBe(0);
    await expect(dashboard.find({ organizationId: f.otherOrganizationId, actorUserId: f.actor, eventExhibitorId: f.exhibitor })).resolves.toBeUndefined();
  });

  it("records consented profile enrichment per active relationship, feeds only the authorized exhibitor, and rolls back with the profile write", async () => {
    const f = await fixture();
    const submissions = new LeadSubmissionsRepository(client as never);
    await submissions.create({ organizationId: f.organizationId, actorUserId: f.actor, eventId: f.event, eventExhibitorId: f.exhibitor, attendeeUserId: f.attendee, leadFormId: f.form, idempotencyKey: "enrichment", interactionSource: "visitor_qr", responses: { email: "attendee@example.com" } });
    const otherExhibitor = row(await sql`INSERT INTO event_exhibitors(organization_id, event_id, organizer_organization_id, booth_name) VALUES (${f.otherOrganizationId}, ${f.event}, (SELECT organization_id FROM events WHERE id = ${f.event}), 'Other booth') RETURNING id`, "other exhibitor");
    await sql`INSERT INTO exhibitor_relationships(event_exhibitor_id, attendee_user_id) VALUES (${otherExhibitor.id}, ${f.attendee})`;
    await sql`INSERT INTO attendee_profiles(user_id, company, job_title) VALUES (${f.attendee}, 'Acme', 'Buyer')`;
    await sql`UPDATE attendee_profiles SET industry = 'Events' WHERE user_id = ${f.attendee}`;
    expect(await sql`SELECT id FROM relationship_enrichments`).toHaveLength(0);
    await sql`INSERT INTO attendee_profile_consents(user_id, share_profile_with_exhibitors) VALUES (${f.attendee}, true)`;
    expect(await sql`SELECT id FROM relationship_enrichments`).toHaveLength(8);
    expect(await asTenant(f.organizationId, tx => tx`SELECT id FROM relationship_enrichments`)).toHaveLength(4);
    expect(await asTenant(f.otherOrganizationId, tx => tx`SELECT id FROM relationship_enrichments`)).toHaveLength(4);
    const dashboard = new ExhibitorDashboardRepository(client as never);
    await dashboard.find({ organizationId: f.organizationId, actorUserId: f.actor, eventExhibitorId: f.exhibitor });
    await sql`UPDATE attendee_profiles SET company_size = '51-200' WHERE user_id = ${f.attendee}`;
    const feed = await dashboard.find({ organizationId: f.organizationId, actorUserId: f.actor, eventExhibitorId: f.exhibitor });
    expect(feed?.intelligenceFeed.profilesEnriched).toBe(1);
    expect(feed?.intelligenceFeed.items[0]).toMatchObject({ label: "Company Size added" });
    const count = await sql`SELECT id FROM relationship_enrichments`;
    await expect(sql.begin(async tx => { await tx`UPDATE attendee_profiles SET company = 'Rolled back' WHERE user_id = ${f.attendee}`; throw new Error("rollback"); })).rejects.toThrow("rollback");
    expect(await sql`SELECT id FROM relationship_enrichments`).toHaveLength(count.length);
  });

  it("enrolls authenticated attendees through the real relationship engine without cross-booth access", async () => {
    const f = await fixture();
    const auth = { sendMagicLink: vi.fn(), identity: vi.fn().mockResolvedValue({ id: f.attendee, email: "attendee@example.com" }) };
    const service = new PlatformEnrollmentService(client as never, auth as never, new LeadSubmissionsService(new LeadSubmissionsRepository(client as never)));
    await expect(service.enroll(f.exhibitor, "attendee@example.com")).resolves.toEqual({ accepted: true });
    const first = await service.complete("valid");
    expect(first).toBeTruthy();
    await service.enroll(f.exhibitor, "attendee@example.com");
    const second = await service.complete("valid");
    expect(second?.id).toBe(first?.id);
    expect(await sql`SELECT id FROM exhibitor_relationships`).toHaveLength(1);
    auth.identity.mockResolvedValue(undefined);
    await expect(service.complete("expired")).rejects.toThrow("Authentication required");
    await expect(service.enroll("00000000-0000-0000-0000-000000000001", "new@example.com")).rejects.toThrow("Booth not found");
  });

  it("enrolls a newly provisioned Supabase identity into only its selected event exhibitor", async () => {
    const f = await fixture();
    const fresh = row(await sql`INSERT INTO auth.users(id,email,email_confirmed_at) VALUES (concourse.uuid_generate_v7(),'new@example.com',now()) RETURNING id`, "new auth user");
    expect(await sql`SELECT id FROM users WHERE id=${fresh.id}`).toHaveLength(1);
    const auth = { sendMagicLink: vi.fn(), identity: vi.fn().mockResolvedValue({ id: fresh.id, email: "new@example.com" }) };
    const service = new PlatformEnrollmentService(client as never, auth as never, new LeadSubmissionsService(new LeadSubmissionsRepository(client as never)));
    await service.enroll(f.exhibitor, "new@example.com");
    await service.complete("new-user-token");
    const secondEvent = row(await sql`INSERT INTO events(organization_id,name,slug,timezone,start_at,end_at) VALUES ((SELECT organization_id FROM events WHERE id=${f.event}),'Event B','event-b','UTC',now(),now()+interval '1 day') RETURNING id`, "second event");
    const other = row(await sql`INSERT INTO event_exhibitors(organization_id,event_id,organizer_organization_id,booth_name) VALUES (${f.otherOrganizationId},${secondEvent.id},(SELECT organization_id FROM events WHERE id=${f.event}),'Other booth') RETURNING id`, "other exhibitor");
    expect(await sql`SELECT id FROM exhibitor_relationships WHERE attendee_user_id=${fresh.id}`).toHaveLength(1);
    await service.enroll(other.id, "new@example.com");
    await service.complete("new-user-token");
    expect(await sql`SELECT id FROM exhibitor_relationships WHERE attendee_user_id=${fresh.id}`).toHaveLength(2);
    expect(await asTenant(f.organizationId, tx => tx`SELECT id FROM exhibitor_relationships WHERE attendee_user_id=${fresh.id}`)).toHaveLength(1);
    expect(await asTenant(f.otherOrganizationId, tx => tx`SELECT id FROM exhibitor_relationships WHERE attendee_user_id=${fresh.id}`)).toHaveLength(1);
  });
});

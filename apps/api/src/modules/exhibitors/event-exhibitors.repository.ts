import { ConflictException, Injectable } from "@nestjs/common";
import { db, setRlsContext } from "@concourse/database";
import { eventExhibitors, events, organizations } from "@concourse/database/schema";
import { and, eq, ne } from "drizzle-orm";

export interface CreateEventExhibitorRecord {
  organizationId: string;
  organizerOrganizationId: string;
  actorUserId: string;
  eventId: string;
  boothName: string;
  boothNumber?: string;
  logoUrl?: string;
  description?: string;
  website?: string;
  contactEmail?: string;
  contactPhone?: string;
  socialLinks: Record<string, string>;
}

export interface UpdateEventExhibitorRecord {
  exhibitorId: string;
  eventId: string;
  scopeOrganizationId: string;
  actorUserId: string;
  boothName?: string;
  boothNumber?: string | null;
  logoUrl?: string | null;
  description?: string | null;
  website?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  socialLinks?: Record<string, string>;
}

@Injectable()
export class EventExhibitorsRepository {
  async list(eventId: string, scopeOrganizationId: string, actorUserId: string) {
    return db.transaction(async (tx) => {
      await setRlsContext(tx, scopeOrganizationId, actorUserId);
      return tx.select().from(eventExhibitors).where(and(eq(eventExhibitors.eventId, eventId), eq(eventExhibitors.organizerOrganizationId, scopeOrganizationId), ne(eventExhibitors.status, "archived")));
    });
  }

  async create(input: CreateEventExhibitorRecord) {
    try {
      return await db.transaction(async (tx) => {
        await setRlsContext(tx, input.organizerOrganizationId, input.actorUserId);
        await requireOrganizerEvent(tx, input.eventId, input.organizerOrganizationId);
        await setRlsContext(tx, input.organizationId, input.actorUserId);
        await requireExhibitorOrganization(tx, input.organizationId);
        const [exhibitor] = await tx.insert(eventExhibitors).values(withoutCreateContext(input)).returning();
        if (!exhibitor) throw new Error("Event exhibitor insert returned no row.");
        return exhibitor;
      });
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException("Exhibitor participation or booth number already exists for this event.");
      }
      throw error;
    }
  }

  async findById(exhibitorId: string, scopeOrganizationId: string, actorUserId: string) {
    return db.transaction(async (tx) => {
      await setRlsContext(tx, scopeOrganizationId, actorUserId);
      const [exhibitor] = await tx.select().from(eventExhibitors).where(eq(eventExhibitors.id, exhibitorId));
      return exhibitor;
    });
  }

  async update(input: UpdateEventExhibitorRecord) {
    return db.transaction(async (tx) => {
      await setRlsContext(tx, input.scopeOrganizationId, input.actorUserId);
      const [exhibitor] = await tx.update(eventExhibitors).set({
        ...withoutUpdateContext(input),
        updatedAt: new Date(),
      }).where(
        and(
          eq(eventExhibitors.id, input.exhibitorId),
          eq(eventExhibitors.eventId, input.eventId),
          ne(eventExhibitors.status, "archived"),
        ),
      ).returning();
      return exhibitor;
    });
  }

  async archive(exhibitorId: string, eventId: string, scopeOrganizationId: string, actorUserId: string) {
    return db.transaction(async (tx) => {
      await setRlsContext(tx, scopeOrganizationId, actorUserId);
      const [exhibitor] = await tx.update(eventExhibitors).set({ status: "archived", updatedAt: new Date() }).where(
        and(
          eq(eventExhibitors.id, exhibitorId),
          eq(eventExhibitors.eventId, eventId),
          ne(eventExhibitors.status, "archived"),
        ),
      ).returning();
      return exhibitor;
    });
  }
}

async function requireOrganizerEvent(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  eventId: string,
  organizationId: string,
) {
  const [event] = await tx.select({ id: events.id }).from(events).where(
    and(eq(events.id, eventId), eq(events.organizationId, organizationId)),
  );
  if (!event) throw new Error("Event not found in organizer organization scope.");
}

async function requireExhibitorOrganization(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  organizationId: string,
) {
  const [organization] = await tx.select({ kind: organizations.kind }).from(organizations).where(
    eq(organizations.id, organizationId),
  );
  if (!organization || organization.kind !== "exhibitor") {
    throw new Error("An event exhibitor must belong to an exhibitor organization.");
  }
}

function withoutCreateContext(input: CreateEventExhibitorRecord) {
  const { actorUserId: _actorUserId, ...values } = input;
  return values;
}

function withoutUpdateContext(input: UpdateEventExhibitorRecord) {
  const { exhibitorId: _exhibitorId, eventId: _eventId, scopeOrganizationId: _scopeOrganizationId, actorUserId: _actorUserId, ...values } = input;
  return values;
}

function isUniqueViolation(error: unknown): error is { code: string } {
  return typeof error === "object" && error !== null && "code" in error && error.code === "23505";
}

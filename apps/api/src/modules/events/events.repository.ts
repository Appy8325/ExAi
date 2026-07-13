import { BadRequestException, ConflictException, Injectable } from "@nestjs/common";
import { db, setRlsContext } from "@concourse/database";
import { events, organizations } from "@concourse/database/schema";
import { and, eq, ne } from "drizzle-orm";

export interface CreateEventRecord {
  organizationId: string;
  actorUserId: string;
  name: string;
  slug: string;
  timezone: string;
  startAt: Date;
  endAt: Date;
}

export interface UpdateEventRecord {
  organizationId: string;
  actorUserId: string;
  eventId: string;
  name?: string;
  slug?: string;
  timezone?: string;
  startAt?: Date;
  endAt?: Date;
}

@Injectable()
export class EventsRepository {
  async create(input: CreateEventRecord) {
    try {
      return await db.transaction(async (tx) => {
        await setRlsContext(tx, input.organizationId, input.actorUserId);
        await this.requireOrganizerOrganization(tx, input.organizationId);
        const [event] = await tx.insert(events).values(input).returning();
        if (!event) throw new Error("Event insert returned no row.");
        return event;
      });
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException("Event slug is already in use for this organization.");
      }
      throw error;
    }
  }

  async findById(organizationId: string, eventId: string, actorUserId: string) {
    return db.transaction(async (tx) => {
      await setRlsContext(tx, organizationId, actorUserId);
      const [event] = await tx.select().from(events).where(
        and(eq(events.id, eventId), eq(events.organizationId, organizationId)),
      );
      return event;
    });
  }

  async update(input: UpdateEventRecord) {
    return db.transaction(async (tx) => {
      await setRlsContext(tx, input.organizationId, input.actorUserId);
      const values = withoutIdentity(input);
      const conditions = [
        eq(events.id, input.eventId),
        eq(events.organizationId, input.organizationId),
        ne(events.status, "archived"),
      ];
      if (input.slug) conditions.push(eq(events.status, "draft"));
      const [event] = await tx.update(events).set({ ...values, updatedAt: new Date() }).where(
        and(...conditions),
      ).returning();
      return event;
    });
  }

  async archive(organizationId: string, eventId: string, actorUserId: string) {
    return db.transaction(async (tx) => {
      await setRlsContext(tx, organizationId, actorUserId);
      const [event] = await tx.update(events).set({ status: "archived", updatedAt: new Date() }).where(
        and(
          eq(events.id, eventId),
          eq(events.organizationId, organizationId),
          ne(events.status, "archived"),
        ),
      ).returning();
      return event;
    });
  }

  private async requireOrganizerOrganization(
    tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
    organizationId: string,
  ) {
    const [organization] = await tx.select({ kind: organizations.kind }).from(organizations).where(
      eq(organizations.id, organizationId),
    );
    if (!organization || organization.kind !== "organizer") {
      throw new BadRequestException("Events must belong to an organizer organization.");
    }
  }
}

function withoutIdentity(input: UpdateEventRecord) {
  const { organizationId: _organizationId, actorUserId: _actorUserId, eventId: _eventId, ...values } = input;
  return values;
}

function isUniqueViolation(error: unknown): error is { code: string } {
  return typeof error === "object" && error !== null && "code" in error && error.code === "23505";
}

import { ConflictException, Injectable } from "@nestjs/common";
import { db, setRlsContext } from "@concourse/database";
import { agendaSessions, events } from "@concourse/database/schema";
import { and, eq, ne } from "drizzle-orm";

export interface CreateAgendaSessionRecord {
  organizationId: string;
  actorUserId: string;
  eventId: string;
  title: string;
  slug: string;
  description?: string;
  startAt: Date;
  endAt: Date;
  timezone: string;
  room?: string;
  capacity?: number;
}

export interface UpdateAgendaSessionRecord extends Omit<CreateAgendaSessionRecord, "eventId" | "title" | "slug" | "description" | "startAt" | "endAt" | "timezone" | "room" | "capacity"> {
  eventId: string;
  sessionId: string;
  title?: string;
  slug?: string;
  description?: string | null;
  startAt?: Date;
  endAt?: Date;
  timezone?: string;
  room?: string | null;
  capacity?: number | null;
}

@Injectable()
export class AgendaSessionsRepository {
  async create(input: CreateAgendaSessionRecord) {
    try {
      return await db.transaction(async (tx) => {
        await setRlsContext(tx, input.organizationId, input.actorUserId);
        await requireEvent(tx, input.eventId, input.organizationId);
        const [session] = await tx.insert(agendaSessions).values(withoutContext(input)).returning();
        if (!session) throw new Error("Agenda session insert returned no row.");
        return session;
      });
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException("Session slug is already in use for this event.");
      }
      throw error;
    }
  }

  async findById(organizationId: string, eventId: string, sessionId: string, actorUserId: string) {
    return db.transaction(async (tx) => {
      await setRlsContext(tx, organizationId, actorUserId);
      const [session] = await tx.select().from(agendaSessions).where(
        and(
          eq(agendaSessions.id, sessionId),
          eq(agendaSessions.eventId, eventId),
        ),
      );
      return session;
    });
  }

  async update(input: UpdateAgendaSessionRecord) {
    return db.transaction(async (tx) => {
      await setRlsContext(tx, input.organizationId, input.actorUserId);
      const values = withoutUpdateIdentity(input);
      const conditions = [
        eq(agendaSessions.id, input.sessionId),
        ne(agendaSessions.status, "archived"),
        eq(agendaSessions.eventId, input.eventId),
      ];
      if (input.slug) conditions.push(eq(agendaSessions.status, "draft"));
      const [session] = await tx.update(agendaSessions).set({ ...values, updatedAt: new Date() }).where(
        and(...conditions),
      ).returning();
      return session;
    });
  }

  async archive(organizationId: string, eventId: string, sessionId: string, actorUserId: string) {
    return db.transaction(async (tx) => {
      await setRlsContext(tx, organizationId, actorUserId);
      const [session] = await tx.update(agendaSessions).set({ status: "archived", updatedAt: new Date() }).where(
        and(
          eq(agendaSessions.id, sessionId),
          eq(agendaSessions.eventId, eventId),
          ne(agendaSessions.status, "archived"),
        ),
      ).returning();
      return session;
    });
  }
}

async function requireEvent(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  eventId: string,
  organizationId: string,
) {
  const [event] = await tx.select({ id: events.id }).from(events).where(
    and(eq(events.id, eventId), eq(events.organizationId, organizationId)),
  );
  if (!event) throw new Error("Event not found in organization scope.");
}

function withoutContext<T extends { organizationId: string; actorUserId: string; sessionId?: string }>(input: T) {
  const { organizationId: _organizationId, actorUserId: _actorUserId, sessionId: _sessionId, ...values } = input;
  return values;
}

function withoutUpdateIdentity(input: UpdateAgendaSessionRecord) {
  const { organizationId: _organizationId, actorUserId: _actorUserId, sessionId: _sessionId, eventId: _eventId, ...values } = input;
  return values;
}

function isUniqueViolation(error: unknown): error is { code: string } {
  return typeof error === "object" && error !== null && "code" in error && error.code === "23505";
}

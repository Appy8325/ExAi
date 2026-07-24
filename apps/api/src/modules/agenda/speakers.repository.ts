import { ConflictException, Injectable } from "@nestjs/common";
import { db, setRlsContext } from "@concourse/database";
import { speakers, events } from "@concourse/database/schema";
import { and, eq, sql } from "drizzle-orm";

export interface CreateSpeakerRecord {
  organizationId: string;
  actorUserId: string;
  eventId: string;
  name: string;
  bio?: string;
  photoUrl?: string;
  company?: string;
  title?: string;
  socialLinks?: Array<{ platform: string; url: string }>;
  sortOrder?: number;
}

export interface UpdateSpeakerRecord {
  organizationId: string;
  actorUserId: string;
  eventId: string;
  speakerId: string;
  name?: string;
  bio?: string | null;
  photoUrl?: string | null;
  company?: string | null;
  title?: string | null;
  socialLinks?: Array<{ platform: string; url: string }> | null;
  sortOrder?: number | null;
}

@Injectable()
export class SpeakersRepository {
  async create(input: CreateSpeakerRecord) {
    try {
      return await db.transaction(async (tx) => {
        await setRlsContext(tx, input.organizationId, input.actorUserId);
        await requireEvent(tx, input.eventId, input.organizationId);
        const [speaker] = await tx.insert(speakers).values(withoutContext(input)).returning();
        if (!speaker) throw new Error("Speaker insert returned no row.");
        return speaker;
      });
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException("A speaker with this name already exists for this event.");
      }
      throw error;
    }
  }

  async findById(organizationId: string, eventId: string, speakerId: string, actorUserId: string) {
    return db.transaction(async (tx) => {
      await setRlsContext(tx, organizationId, actorUserId);
      const [speaker] = await tx.select().from(speakers).where(
        and(
          eq(speakers.id, speakerId),
          eq(speakers.eventId, eventId),
        ),
      );
      return speaker;
    });
  }

  async listByEvent(organizationId: string, eventId: string, actorUserId: string) {
    return db.transaction(async (tx) => {
      await setRlsContext(tx, organizationId, actorUserId);
      return tx.select().from(speakers).where(
        eq(speakers.eventId, eventId),
      ).orderBy(sql`COALESCE(${speakers.sortOrder}, 999)`, speakers.name);
    });
  }

  async update(input: UpdateSpeakerRecord) {
    try {
      return await db.transaction(async (tx) => {
        await setRlsContext(tx, input.organizationId, input.actorUserId);
        const values = withoutUpdateIdentity(input);
        const [speaker] = await tx.update(speakers).set({ ...values, updatedAt: new Date() }).where(
          and(
            eq(speakers.id, input.speakerId),
            eq(speakers.eventId, input.eventId),
          ),
        ).returning();
        return speaker;
      });
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException("A speaker with this name already exists for this event.");
      }
      throw error;
    }
  }

  async delete(organizationId: string, eventId: string, speakerId: string, actorUserId: string) {
    return db.transaction(async (tx) => {
      await setRlsContext(tx, organizationId, actorUserId);
      const [speaker] = await tx.delete(speakers).where(
        and(
          eq(speakers.id, speakerId),
          eq(speakers.eventId, eventId),
        ),
      ).returning();
      return speaker;
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

function withoutContext<T extends { organizationId: string; actorUserId: string }>(input: T) {
  const { organizationId: _organizationId, actorUserId: _actorUserId, ...values } = input;
  return values;
}

function withoutUpdateIdentity(input: UpdateSpeakerRecord) {
  const { organizationId: _organizationId, actorUserId: _actorUserId, speakerId: _speakerId, eventId: _eventId, ...values } = input;
  return values;
}

function isUniqueViolation(error: unknown): error is { code: string } {
  return typeof error === "object" && error !== null && "code" in error && error.code === "23505";
}

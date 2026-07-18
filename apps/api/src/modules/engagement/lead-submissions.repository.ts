import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { and, asc, eq, sql } from "drizzle-orm";
import { setRlsContext } from "@concourse/database";
import { DATABASE_CLIENT, type DatabaseClient } from "../../common/database-client";
import { eventExhibitors, exhibitorRelationships, leadFormFields, leadForms, leadSubmissionValues, leadSubmissions, users } from "@concourse/database/schema";
import { profilePrefill, validateSubmission } from "./lead-submissions.validation";

export type CreateLeadSubmissionInput = { organizationId: string; actorUserId: string; eventId: string; eventExhibitorId: string; attendeeUserId?: string; leadFormId: string; idempotencyKey: string; interactionSource: "visitor_qr" | "exhibitor_device"; responses: Record<string, unknown> };

@Injectable()
export class LeadSubmissionsRepository {
  constructor(@Inject(DATABASE_CLIENT) private readonly database: DatabaseClient) {}
  create(input: CreateLeadSubmissionInput) {
    return this.database.transaction(async (tx) => {
      await setRlsContext(tx, input.organizationId, input.actorUserId);
      const [form] = await tx.select({ id: leadForms.id, eventId: eventExhibitors.eventId }).from(leadForms).innerJoin(eventExhibitors, eq(leadForms.eventExhibitorId, eventExhibitors.id)).where(and(eq(leadForms.id, input.leadFormId), eq(leadForms.eventExhibitorId, input.eventExhibitorId), eq(leadForms.status, "published"), eq(eventExhibitors.eventId, input.eventId)));
      if (!form) throw new NotFoundException("Lead form not found in event exhibitor scope.");
      const fields = await tx.select().from(leadFormFields).where(and(eq(leadFormFields.leadFormId, input.leadFormId), eq(leadFormFields.status, "active"))).orderBy(asc(leadFormFields.sortOrder));
      validateSubmission(fields, input.responses);
      let relationshipId: string | undefined;
      if (input.attendeeUserId) {
        const [relationship] = await tx.insert(exhibitorRelationships).values({ eventExhibitorId: input.eventExhibitorId, attendeeUserId: input.attendeeUserId }).onConflictDoNothing({ target: [exhibitorRelationships.eventExhibitorId, exhibitorRelationships.attendeeUserId] }).returning();
        relationshipId = relationship?.id ?? (await tx.select({ id: exhibitorRelationships.id }).from(exhibitorRelationships).where(and(eq(exhibitorRelationships.eventExhibitorId, input.eventExhibitorId), eq(exhibitorRelationships.attendeeUserId, input.attendeeUserId))))[0]?.id;
      }
      const duplicate = input.attendeeUserId ? await tx.select({ id: leadSubmissions.id }).from(leadSubmissions).where(and(eq(leadSubmissions.eventExhibitorId, input.eventExhibitorId), eq(leadSubmissions.attendeeUserId, input.attendeeUserId))).limit(1) : [];
const [created] = await tx.insert(leadSubmissions).values({ eventId: input.eventId, eventExhibitorId: input.eventExhibitorId, attendeeUserId: input.attendeeUserId, relationshipId, leadFormId: input.leadFormId, idempotencyKey: input.idempotencyKey, interactionSource: input.interactionSource, potentialDuplicate: duplicate.length > 0 }).onConflictDoNothing({ target: [leadSubmissions.eventExhibitorId, leadSubmissions.idempotencyKey] }).returning();
      if (!created) {
        const [existing] = await tx.select().from(leadSubmissions).where(and(eq(leadSubmissions.eventExhibitorId, input.eventExhibitorId), eq(leadSubmissions.idempotencyKey, input.idempotencyKey)));
        if (!existing) throw new Error("Idempotent submission insert did not return a row.");
        return existing;
      }
      const submission = created;
      await tx.insert(leadSubmissionValues).values(fields.map((field) => ({ leadSubmissionId: submission.id, leadFormFieldId: field.id, value: input.responses[field.key] ?? null, fieldSnapshot: { id: field.id, key: field.key, label: field.label, type: field.type, required: field.required, validation: field.validation } })));
      if (relationshipId) await tx.update(exhibitorRelationships).set({ interactionCount: sql`${exhibitorRelationships.interactionCount} + 1`, latestInteractionAt: submission.submittedAt, hasPotentialDuplicate: sql`${exhibitorRelationships.hasPotentialDuplicate} OR ${submission.potentialDuplicate}`, updatedAt: submission.submittedAt }).where(eq(exhibitorRelationships.id, relationshipId));
      return submission;
    });
  }

  ensureRelationship(input: { organizationId: string; actorUserId: string; eventExhibitorId: string; attendeeUserId: string }) {
    return this.database.transaction(async tx => {
      await setRlsContext(tx, input.organizationId, input.actorUserId);
      const [created] = await tx.insert(exhibitorRelationships).values({ eventExhibitorId: input.eventExhibitorId, attendeeUserId: input.attendeeUserId }).onConflictDoNothing({ target: [exhibitorRelationships.eventExhibitorId, exhibitorRelationships.attendeeUserId] }).returning();
      return created ?? (await tx.select({ id: exhibitorRelationships.id }).from(exhibitorRelationships).where(and(eq(exhibitorRelationships.eventExhibitorId, input.eventExhibitorId), eq(exhibitorRelationships.attendeeUserId, input.attendeeUserId))))[0];
    });
  }

  prefill(input: Pick<CreateLeadSubmissionInput, "organizationId" | "actorUserId" | "leadFormId" | "attendeeUserId">) {
    const attendeeUserId = input.attendeeUserId;
    if (!attendeeUserId) return Promise.resolve({});
    return this.database.transaction(async (tx) => {
      await setRlsContext(tx, input.organizationId, input.actorUserId);
      const [profile] = await tx.select({ email: users.email, fullName: users.fullName }).from(users).where(eq(users.id, attendeeUserId));
      if (!profile) return {};
      const fields = await tx.select({ key: leadFormFields.key, type: leadFormFields.type }).from(leadFormFields).where(and(eq(leadFormFields.leadFormId, input.leadFormId), eq(leadFormFields.status, "active")));
      return profilePrefill(fields, profile);
    });
  }
}

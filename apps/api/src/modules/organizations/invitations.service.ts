import { createHash, randomBytes } from "node:crypto";
import { BadRequestException, Injectable } from "@nestjs/common";
import { and, desc, eq, gt, isNull, sql } from "drizzle-orm";
import { db, setRlsContext } from "@concourse/database";
import {
  authTokens,
  eventExhibitors,
  events,
  organizationMemberships,
  organizations,
  users,
} from "@concourse/database/schema";

import { organizationSlug } from "./organizations.service";

const INVITATION_TTL_MS = 14 * 24 * 60 * 60 * 1000;

export type DeferredInvitationType =
  "event_staff" | "event_exhibitor_claim" | "exhibitor_staff";

export type InvitationPayload =
  | {
      type: "organization_membership";
      organizationId: string;
      role: "admin" | "member";
      email: string;
      invitedByUserId?: string;
    }
  | {
      type: "event_exhibitor_claim";
      eventId: string;
      email: string;
      companyName: string;
      invitedByUserId?: string;
      exhibitorOrganizationId?: string;
      eventExhibitorId?: string;
    }
  | {
      type: Exclude<DeferredInvitationType, "event_exhibitor_claim">;
      eventId?: string;
      eventExhibitorId?: string;
      role?: "admin" | "staff" | "rep";
      email?: string;
    };

export interface CreateOrganizationInvitationInput {
  organizationId: string;
  email: string;
  role?: "admin" | "member";
  invitedByUserId?: string;
  invitedUserId?: string;
  expiresAt?: Date;
}

export interface CreateEventExhibitorInvitationInput {
  organizationId: string;
  eventId: string;
  email: string;
  companyName: string;
  invitedByUserId: string;
  expiresAt?: Date;
}

export function hashInvitationToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function normalizeInvitationEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isInvitationPayload(
  value: unknown,
): value is InvitationPayload {
  if (!value || typeof value !== "object" || !("type" in value)) {
    return false;
  }
  const payload = value as Record<string, unknown>;
  if (payload.type === "organization_membership") {
    return (
      typeof payload.organizationId === "string" &&
      (payload.role === "admin" || payload.role === "member") &&
      typeof payload.email === "string"
    );
  }
  if (payload.type === "event_exhibitor_claim") {
    return (
      typeof payload.eventId === "string" &&
      typeof payload.email === "string" &&
      typeof payload.companyName === "string"
    );
  }
  return payload.type === "event_staff" || payload.type === "exhibitor_staff";
}

@Injectable()
export class InvitationsService {
  async createOrganizationInvitation(input: CreateOrganizationInvitationInput) {
    const email = normalizeInvitationEmail(input.email);
    const role = input.role ?? "member";
    const expiresAt =
      input.expiresAt ?? new Date(Date.now() + INVITATION_TTL_MS);
    if (!email || !email.includes("@")) {
      throw new BadRequestException("Invitation email is invalid.");
    }
    if (!(role === "admin" || role === "member")) {
      throw new BadRequestException("Invitation role is invalid.");
    }
    if (expiresAt <= new Date()) {
      throw new BadRequestException(
        "Invitation expiration must be in the future.",
      );
    }

    const token = randomBytes(32).toString("base64url");
    return db.transaction(async (tx) => {
      await setRlsContext(tx, input.organizationId, input.invitedByUserId);

      const [recipient] = await tx
        .select()
        .from(users)
        .where(
          input.invitedUserId
            ? eq(users.id, input.invitedUserId)
            : eq(users.email, email),
        );
      if (recipient && normalizeInvitationEmail(recipient.email) !== email) {
        throw new BadRequestException(
          "Invitation recipient does not match this email.",
        );
      }

      if (recipient) {
        const [createdMembership] = await tx
          .insert(organizationMemberships)
          .values({
            organizationId: input.organizationId,
            userId: recipient.id,
            role,
            status: "pending",
            invitedByUserId: input.invitedByUserId,
          })
          .onConflictDoNothing({
            target: [
              organizationMemberships.organizationId,
              organizationMemberships.userId,
            ],
          })
          .returning();

        if (!createdMembership) {
          const [membership] = await tx
            .select()
            .from(organizationMemberships)
            .where(
              and(
                eq(
                  organizationMemberships.organizationId,
                  input.organizationId,
                ),
                eq(organizationMemberships.userId, recipient.id),
              ),
            );
          if (
            !membership ||
            membership.status !== "pending" ||
            membership.role !== role
          ) {
            throw new BadRequestException(
              "Invitation recipient already has an incompatible membership.",
            );
          }
        }
      }

      await tx.insert(authTokens).values({
        kind: "invite",
        tokenHash: hashInvitationToken(token),
        organizationId: input.organizationId,
        userId: recipient?.id,
        expiresAt,
        payload: {
          type: "organization_membership",
          organizationId: input.organizationId,
          role,
          email,
          invitedByUserId: input.invitedByUserId,
        },
      });
      return { token, expiresAt };
    });
  }

  async createEventExhibitorInvitation(
    input: CreateEventExhibitorInvitationInput,
  ) {
    const email = normalizeInvitationEmail(input.email);
    const companyName = input.companyName.trim();
    const expiresAt =
      input.expiresAt ?? new Date(Date.now() + INVITATION_TTL_MS);
    if (!email || !email.includes("@")) {
      throw new BadRequestException("Invitation email is invalid.");
    }
    if (!companyName) {
      throw new BadRequestException("Company name is required.");
    }
    if (expiresAt <= new Date()) {
      throw new BadRequestException(
        "Invitation expiration must be in the future.",
      );
    }

    const token = randomBytes(32).toString("base64url");
    return db.transaction(async (tx) => {
      await setRlsContext(tx, input.organizationId, input.invitedByUserId);
      const [event] = await tx
        .select({ id: events.id })
        .from(events)
        .where(
          and(
            eq(events.id, input.eventId),
            eq(events.organizationId, input.organizationId),
          ),
        );
      if (!event) throw new BadRequestException("Event was not found.");

      await tx.insert(authTokens).values({
        kind: "invite",
        tokenHash: hashInvitationToken(token),
        organizationId: input.organizationId,
        eventId: input.eventId,
        expiresAt,
        payload: {
          type: "event_exhibitor_claim",
          eventId: input.eventId,
          email,
          companyName,
          invitedByUserId: input.invitedByUserId,
        },
      });
      return { token, expiresAt };
    });
  }

  async listEventExhibitorInvitations(
    organizationId: string,
    eventId: string,
    actorUserId: string,
  ) {
    return db.transaction(async (tx) => {
      await setRlsContext(tx, organizationId, actorUserId);
      const invitations = await tx
        .select()
        .from(authTokens)
        .where(
          and(
            eq(authTokens.organizationId, organizationId),
            eq(authTokens.eventId, eventId),
            eq(authTokens.kind, "invite"),
          ),
        )
        .orderBy(desc(authTokens.createdAt));
      return invitations.flatMap((invitation) => {
        const payload = invitation.payload;
        if (
          !isInvitationPayload(payload) ||
          payload.type !== "event_exhibitor_claim"
        ) {
          return [];
        }
        return [
          {
            id: invitation.id,
            email: payload.email,
            companyName: payload.companyName,
            expiresAt: invitation.expiresAt,
            status: invitation.revokedAt
              ? "revoked"
              : invitation.usedAt
                ? "accepted"
                : invitation.expiresAt <= new Date()
                  ? "expired"
                  : "sent",
          },
        ];
      });
    });
  }

  async lookup(token: string) {
    const [invitation] = await db
      .select()
      .from(authTokens)
      .where(eq(authTokens.tokenHash, hashInvitationToken(token)));
    if (!invitation) {
      throw new BadRequestException("Invitation is invalid or expired.");
    }
    const payload = this.validateInvitation(invitation);
    if (invitation.usedAt) {
      throw new BadRequestException("Invitation is invalid or expired.");
    }
    return payload;
  }

  async accept(input: { token: string; userId: string }) {
    const tokenHash = hashInvitationToken(input.token);
    return db.transaction(async (tx) => {
      const [invitation] = await tx
        .select()
        .from(authTokens)
        .where(
          and(
            eq(authTokens.tokenHash, tokenHash),
            eq(authTokens.kind, "invite"),
          ),
        );
      if (!invitation) {
        throw new BadRequestException("Invitation is invalid or expired.");
      }
      const payload = this.validateInvitation(invitation);

      if (
        payload.type !== "organization_membership" &&
        payload.type !== "event_exhibitor_claim"
      ) {
        return { status: "not_supported" as const, type: payload.type };
      }

      const [user] = await tx
        .select()
        .from(users)
        .where(eq(users.id, input.userId));
      if (!user || normalizeInvitationEmail(user.email) !== payload.email) {
        throw new BadRequestException("Invitation is not valid for this user.");
      }

      if (invitation.usedAt) {
        return acceptedInvitation(tx, payload, input.userId);
      }

      const [consumed] = await tx
        .update(authTokens)
        .set({ usedAt: new Date() })
        .where(
          and(
            eq(authTokens.id, invitation.id),
            isNull(authTokens.usedAt),
            isNull(authTokens.revokedAt),
            gt(authTokens.expiresAt, new Date()),
          ),
        )
        .returning();
      if (!consumed) {
        const [current] = await tx
          .select()
          .from(authTokens)
          .where(eq(authTokens.id, invitation.id));
        if (current?.usedAt) {
          return acceptedInvitation(
            tx,
            this.validateInvitation(current),
            input.userId,
          );
        }
        throw new BadRequestException("Invitation is invalid or expired.");
      }

      if (payload.type === "event_exhibitor_claim") {
        const accepted = await acceptEventExhibitor(
          tx,
          invitation,
          payload,
          input.userId,
        );
        await tx
          .update(authTokens)
          .set({
            payload: {
              ...payload,
              exhibitorOrganizationId: accepted.organizationId,
              eventExhibitorId: accepted.eventExhibitorId,
            },
          })
          .where(eq(authTokens.id, invitation.id));
        return accepted;
      }

      await setRlsContext(tx, payload.organizationId, input.userId);
      const [membership] = await tx
        .insert(organizationMemberships)
        .values({
          organizationId: payload.organizationId,
          userId: input.userId,
          role: payload.role,
          status: "active",
          invitedByUserId: payload.invitedByUserId,
        })
        .onConflictDoUpdate({
          target: [
            organizationMemberships.organizationId,
            organizationMemberships.userId,
          ],
          set: { status: "active", role: payload.role, updatedAt: new Date() },
        })
        .returning();
      if (!membership)
        throw new BadRequestException("Invitation acceptance is incomplete.");
      return { status: "accepted" as const, membership };
    });
  }

  private validateInvitation(
    invitation: typeof authTokens.$inferSelect | undefined,
  ) {
    if (
      !invitation ||
      invitation.kind !== "invite" ||
      invitation.revokedAt ||
      invitation.expiresAt <= new Date() ||
      !isInvitationPayload(invitation.payload)
    ) {
      throw new BadRequestException("Invitation is invalid or expired.");
    }
    return invitation.payload;
  }
}

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
type EventClaim = Extract<InvitationPayload, { type: "event_exhibitor_claim" }>;

async function acceptedInvitation(
  tx: Transaction,
  payload: InvitationPayload,
  userId: string,
) {
  if (payload.type === "organization_membership") {
    await setRlsContext(tx, payload.organizationId, userId);
    const [membership] = await tx
      .select()
      .from(organizationMemberships)
      .where(
        and(
          eq(organizationMemberships.organizationId, payload.organizationId),
          eq(organizationMemberships.userId, userId),
        ),
      );
    if (!membership || membership.status !== "active") {
      throw new BadRequestException("Invitation acceptance is incomplete.");
    }
    return { status: "accepted" as const, type: payload.type, membership };
  }
  if (
    payload.type !== "event_exhibitor_claim" ||
    !payload.exhibitorOrganizationId ||
    !payload.eventExhibitorId
  ) {
    throw new BadRequestException("Invitation acceptance is incomplete.");
  }
  await setRlsContext(tx, payload.exhibitorOrganizationId, userId);
  const [membership] = await tx
    .select({ id: organizationMemberships.id })
    .from(organizationMemberships)
    .where(
      and(
        eq(
          organizationMemberships.organizationId,
          payload.exhibitorOrganizationId,
        ),
        eq(organizationMemberships.userId, userId),
        eq(organizationMemberships.status, "active"),
      ),
    );
  const [participation] = await tx
    .select({ id: eventExhibitors.id })
    .from(eventExhibitors)
    .where(
      and(
        eq(eventExhibitors.id, payload.eventExhibitorId),
        eq(eventExhibitors.organizationId, payload.exhibitorOrganizationId),
      ),
    );
  if (!membership || !participation) {
    throw new BadRequestException("Invitation acceptance is incomplete.");
  }
  return eventClaimResult(
    payload.exhibitorOrganizationId,
    payload.eventExhibitorId,
  );
}

async function acceptEventExhibitor(
  tx: Transaction,
  invitation: typeof authTokens.$inferSelect,
  payload: EventClaim,
  userId: string,
) {
  const [existingOrganization] = await tx
    .select({ id: organizations.id })
    .from(organizations)
    .innerJoin(
      organizationMemberships,
      eq(organizationMemberships.organizationId, organizations.id),
    )
    .where(
      and(
        eq(organizations.kind, "exhibitor"),
        eq(organizationMemberships.userId, userId),
        eq(organizationMemberships.status, "active"),
        sql`lower(${organizations.name}) = ${payload.companyName.toLowerCase()}`,
      ),
    )
    .limit(1);

  let organizationId = existingOrganization?.id;
  if (!organizationId) {
    const [generated] = await tx.execute<{ id: string }>(
      sql`SELECT concourse.uuid_generate_v7() AS id`,
    );
    if (!generated)
      throw new Error("Organization ID generation returned no row.");
    organizationId = generated.id;
    const candidate = organizationSlug(payload.companyName);
    const baseSlug =
      candidate.length >= 3 ? candidate : `exhibitor-${candidate || "company"}`;
    const [conflict] = await tx
      .select({ id: organizations.id })
      .from(organizations)
      .where(eq(organizations.slug, baseSlug));
    const suffix = invitation.id.replaceAll("-", "").slice(-8);
    const slug = conflict
      ? `${baseSlug.slice(0, 54).replace(/-+$/, "")}-${suffix}`
      : baseSlug;

    await setRlsContext(tx, organizationId, userId);
    await tx.insert(organizations).values({
      id: organizationId,
      kind: "exhibitor",
      name: payload.companyName,
      slug,
    });
    await tx.insert(organizationMemberships).values({
      organizationId,
      userId,
      role: "owner",
      status: "active",
      invitedByUserId: payload.invitedByUserId,
    });
  } else {
    await setRlsContext(tx, organizationId, userId);
  }

  const [created] = await tx
    .insert(eventExhibitors)
    .values({
      organizationId,
      organizerOrganizationId: invitation.organizationId!,
      eventId: payload.eventId,
      boothName: payload.companyName,
      contactEmail: payload.email,
      status: "accepted",
    })
    .onConflictDoNothing({
      target: [eventExhibitors.eventId, eventExhibitors.organizationId],
    })
    .returning({ id: eventExhibitors.id });
  const [existing] = created
    ? [created]
    : await tx
        .select({ id: eventExhibitors.id })
        .from(eventExhibitors)
        .where(
          and(
            eq(eventExhibitors.eventId, payload.eventId),
            eq(eventExhibitors.organizationId, organizationId),
          ),
        );
  if (!existing)
    throw new Error("Event participation creation returned no row.");
  return eventClaimResult(organizationId, existing.id);
}

function eventClaimResult(organizationId: string, eventExhibitorId: string) {
  return {
    status: "accepted" as const,
    type: "event_exhibitor_claim" as const,
    organizationId,
    eventExhibitorId,
    redirectTo: `/exhibit/${organizationId}/settings?eeId=${eventExhibitorId}`,
  };
}

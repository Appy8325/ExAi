import { createHash, randomBytes } from "node:crypto";
import { BadRequestException, Injectable } from "@nestjs/common";
import { and, desc, eq, gt, isNull } from "drizzle-orm";
import { db, setRlsContext } from "@concourse/database";
import {
  authTokens,
  events,
  organizationMemberships,
  users,
} from "@concourse/database/schema";

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

      if (payload.type !== "organization_membership") {
        return { status: "not_supported" as const, type: payload.type };
      }

      await setRlsContext(tx, payload.organizationId, input.userId);

      const acceptedMembership = async () => {
        const [membership] = await tx
          .select()
          .from(organizationMemberships)
          .where(
            and(
              eq(
                organizationMemberships.organizationId,
                payload.organizationId,
              ),
              eq(organizationMemberships.userId, input.userId),
            ),
          );
        if (!membership || membership.status !== "active") {
          throw new BadRequestException("Invitation acceptance is incomplete.");
        }
        return { status: "accepted" as const, membership };
      };

      const [user] = await tx
        .select()
        .from(users)
        .where(eq(users.id, input.userId));
      if (!user || normalizeInvitationEmail(user.email) !== payload.email) {
        throw new BadRequestException("Invitation is not valid for this user.");
      }

      if (invitation.usedAt) {
        return acceptedMembership();
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
          return acceptedMembership();
        }
        throw new BadRequestException("Invitation is invalid or expired.");
      }

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

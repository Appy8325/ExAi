import { createHash, randomBytes } from "node:crypto";
import { BadRequestException, Injectable } from "@nestjs/common";
import { and, eq, gt, isNull } from "drizzle-orm";
import { db, setRlsContext } from "@concourse/database";
import {
  authTokens,
  organizationMemberships,
  users,
} from "@concourse/database/schema";

const INVITATION_TTL_MS = 14 * 24 * 60 * 60 * 1000;

export type DeferredInvitationType =
  | "event_staff"
  | "event_exhibitor_claim"
  | "exhibitor_staff";

export type InvitationPayload =
  | {
      type: "organization_membership";
      organizationId: string;
      role: "admin" | "member";
      email: string;
      invitedByUserId?: string;
    }
  | {
      type: DeferredInvitationType;
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

export function hashInvitationToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function normalizeInvitationEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isInvitationPayload(value: unknown): value is InvitationPayload {
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
  return (
    payload.type === "event_staff" ||
    payload.type === "event_exhibitor_claim" ||
    payload.type === "exhibitor_staff"
  );
}

@Injectable()
export class InvitationsService {
  async createOrganizationInvitation(input: CreateOrganizationInvitationInput) {
    const email = normalizeInvitationEmail(input.email);
    const role = input.role ?? "member";
    const expiresAt = input.expiresAt ?? new Date(Date.now() + INVITATION_TTL_MS);
    if (!email || !email.includes("@")) {
      throw new BadRequestException("Invitation email is invalid.");
    }
    if (!(role === "admin" || role === "member")) {
      throw new BadRequestException("Invitation role is invalid.");
    }
    if (expiresAt <= new Date()) {
      throw new BadRequestException("Invitation expiration must be in the future.");
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
      if (!recipient || normalizeInvitationEmail(recipient.email) !== email) {
        throw new BadRequestException(
          "Invitation recipient must be an existing user with this email.",
        );
      }

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
              eq(organizationMemberships.organizationId, input.organizationId),
              eq(organizationMemberships.userId, recipient.id),
            ),
          );
        if (!membership || membership.status !== "pending" || membership.role !== role) {
          throw new BadRequestException(
            "Invitation recipient already has an incompatible membership.",
          );
        }
      }

      await tx.insert(authTokens).values({
        kind: "invite",
        tokenHash: hashInvitationToken(token),
        organizationId: input.organizationId,
        userId: recipient.id,
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
        .where(and(eq(authTokens.tokenHash, tokenHash), eq(authTokens.kind, "invite")));
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
              eq(organizationMemberships.organizationId, payload.organizationId),
              eq(organizationMemberships.userId, input.userId),
            ),
          );
        if (!membership || membership.status !== "active") {
          throw new BadRequestException("Invitation acceptance is incomplete.");
        }
        return { status: "accepted" as const, membership };
      };

      const [user] = await tx.select().from(users).where(eq(users.id, input.userId));
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

      const [activated] = await tx
        .update(organizationMemberships)
        .set({ status: "active", updatedAt: new Date() })
        .where(
          and(
            eq(organizationMemberships.organizationId, payload.organizationId),
            eq(organizationMemberships.userId, input.userId),
            eq(organizationMemberships.status, "pending"),
          ),
        )
        .returning();
      if (activated) {
        return { status: "accepted" as const, membership: activated };
      }
      return acceptedMembership();
    });
  }

  private validateInvitation(invitation: typeof authTokens.$inferSelect | undefined) {
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

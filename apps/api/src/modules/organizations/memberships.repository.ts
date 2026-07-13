import { Injectable } from "@nestjs/common";
import { and, eq } from "drizzle-orm";
import { db, setRlsContext } from "@concourse/database";
import { organizationMemberships } from "@concourse/database/schema";

export type MembershipStatus = "pending" | "active";

export interface CreateMembershipRecord {
  organizationId: string;
  userId: string;
  role: "admin" | "member";
  status: MembershipStatus;
  invitedByUserId?: string;
  actorUserId?: string;
}

@Injectable()
export class MembershipsRepository {
  async create(input: CreateMembershipRecord) {
    return db.transaction(async (tx) => {
      await setRlsContext(
        tx,
        input.organizationId,
        input.actorUserId ?? input.userId,
      );
      const {
        organizationId,
        userId,
        role,
        status,
        invitedByUserId,
      } = input;
      const [created] = await tx
        .insert(organizationMemberships)
        .values({ organizationId, userId, role, status, invitedByUserId })
        .onConflictDoNothing({
          target: [
            organizationMemberships.organizationId,
            organizationMemberships.userId,
          ],
        })
        .returning();

      if (created) {
        return created;
      }

      const [existing] = await tx
        .select()
        .from(organizationMemberships)
        .where(
          and(
            eq(organizationMemberships.organizationId, input.organizationId),
            eq(organizationMemberships.userId, input.userId),
          ),
        );
      if (!existing) {
        throw new Error("Membership insert did not return a row.");
      }
      return existing;
    });
  }

  findByOrganizationId(organizationId: string) {
    return db
      .select()
      .from(organizationMemberships)
      .where(eq(organizationMemberships.organizationId, organizationId));
  }

  findByUserId(userId: string) {
    return db
      .select()
      .from(organizationMemberships)
      .where(eq(organizationMemberships.userId, userId));
  }

  async findByOrganizationAndUser(organizationId: string, userId: string) {
    return db.transaction(async (tx) => {
      await setRlsContext(tx, organizationId, userId);
      const [membership] = await tx
        .select()
        .from(organizationMemberships)
        .where(
          and(
            eq(organizationMemberships.organizationId, organizationId),
            eq(organizationMemberships.userId, userId),
          ),
        );
      return membership;
    });
  }

  async activate(organizationId: string, userId: string, actorUserId = userId) {
    return db.transaction(async (tx) => {
      await setRlsContext(tx, organizationId, actorUserId);
      const [membership] = await tx
        .update(organizationMemberships)
        .set({ status: "active", updatedAt: new Date() })
        .where(
          and(
            eq(organizationMemberships.organizationId, organizationId),
            eq(organizationMemberships.userId, userId),
          ),
        )
        .returning();
      return membership;
    });
  }
}

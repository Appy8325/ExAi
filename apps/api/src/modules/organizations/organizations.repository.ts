import { ConflictException, Injectable } from "@nestjs/common";
import { db, setRlsContext } from "@concourse/database";
import { sql } from "drizzle-orm";
import {
  organizationMemberships,
  organizations,
} from "@concourse/database/schema";

import type { OrganizationKind } from "./organizations.service";

interface CreateOrganizationRecord {
  ownerUserId: string;
  name: string;
  kind: OrganizationKind;
  slug: string;
}

@Injectable()
export class OrganizationsRepository {
  async create(input: CreateOrganizationRecord) {
    try {
      return await db.transaction(async (tx) => {
        const [generatedId] = await tx.execute<{ id: string }>(
          sql`SELECT concourse.uuid_generate_v7() AS id`,
        );
        if (!generatedId) {
          throw new Error("Organization ID generation returned no row.");
        }
        await setRlsContext(tx, generatedId.id, input.ownerUserId);

        const [organization] = await tx
          .insert(organizations)
          .values({
            id: generatedId.id,
            name: input.name,
            kind: input.kind,
            slug: input.slug,
          })
          .returning();

        if (!organization) {
          throw new Error("Organization insert returned no row.");
        }

        await tx.insert(organizationMemberships).values({
          organizationId: organization.id,
          userId: input.ownerUserId,
          role: "owner",
          status: "active",
        });

        return organization;
      });
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException("Organization slug is already in use.");
      }
      throw error;
    }
  }
}

function isUniqueViolation(error: unknown): error is { code: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23505"
  );
}

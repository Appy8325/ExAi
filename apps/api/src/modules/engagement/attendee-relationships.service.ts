import { Inject, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { sql } from "drizzle-orm";
import { DATABASE_CLIENT, type DatabaseClient } from "../../common/database-client";
import type { SupabaseAuthService } from "../auth/supabase-auth.service";

@Injectable()
export class AttendeeRelationshipsService {
  constructor(
    @Inject(DATABASE_CLIENT) private readonly database: DatabaseClient,
    private readonly auth: SupabaseAuthService,
  ) {}

  private async attendeeId(accessToken: string) {
    const identity = await this.auth.identity(accessToken);
    if (!identity) throw new UnauthorizedException("Authentication required.");
    return identity.id;
  }

  async listSaved(eventId: string, accessToken: string) {
    const attendeeUserId = await this.attendeeId(accessToken);
    const rows = await this.database.execute(
      sql`
        SELECT r.id AS relationship_id, r.status, r.created_at,
          booth.id AS exhibitor_id, organization.name AS company_name,
          booth.booth_name, booth.booth_number, booth.logo_url, booth.description
        FROM exhibitor_relationships r
        JOIN event_exhibitors booth ON booth.id = r.event_exhibitor_id
        JOIN organizations organization ON organization.id = booth.organization_id
        WHERE r.attendee_user_id = ${attendeeUserId}
          AND booth.event_id = ${eventId}
          AND r.status = 'active'
          AND booth.status NOT IN ('archived','withdrawn')
        ORDER BY r.created_at DESC
      `,
    );
    return (rows as unknown as any[]).map((r) => ({
      relationshipId: r.relationship_id,
      status: r.status,
      createdAt: r.created_at,
      exhibitor: {
        id: r.exhibitor_id,
        companyName: r.company_name,
        boothName: r.booth_name,
        boothNumber: r.booth_number,
        logoUrl: r.logo_url,
        description: r.description,
      },
    }));
  }

  async save(exhibitorId: string, accessToken: string) {
    const attendeeUserId = await this.attendeeId(accessToken);
    const booth = await this.database.execute(
      sql<{ organization_id: string; event_id: string }>`
        SELECT organization_id, event_id FROM event_exhibitors
        WHERE id = ${exhibitorId} AND status NOT IN ('archived','withdrawn') LIMIT 1
      `,
    );
    const found = (booth as unknown as { organization_id: string; event_id: string }[])[0];
    if (!found) throw new NotFoundException("Exhibitor not found.");
    const existing = await this.database.execute(
      sql<{ id: string }>`
        SELECT id FROM exhibitor_relationships
        WHERE event_exhibitor_id = ${exhibitorId} AND attendee_user_id = ${attendeeUserId} LIMIT 1
      `,
    );
    const rel = (existing as unknown as { id: string }[])[0];
    if (rel) {
      await this.database.execute(
        sql`UPDATE exhibitor_relationships SET status = 'active', updated_at = now() WHERE id = ${rel.id}`,
      );
      return { relationshipId: rel.id, saved: true };
    }
    await this.database.execute(
      sql`
        INSERT INTO exhibitor_relationships (event_exhibitor_id, attendee_user_id, status)
        VALUES (${exhibitorId}, ${attendeeUserId}, 'active')
        ON CONFLICT (event_exhibitor_id, attendee_user_id)
        DO UPDATE SET status = 'active', updated_at = now()
      `,
    );
    const created = await this.database.execute(
      sql<{ id: string }>`
        SELECT id FROM exhibitor_relationships
        WHERE event_exhibitor_id = ${exhibitorId} AND attendee_user_id = ${attendeeUserId} LIMIT 1
      `,
    );
    const relId = (created as unknown as { id: string }[])[0]?.id;
    return { relationshipId: relId, saved: true };
  }

  async unsave(exhibitorId: string, accessToken: string) {
    const attendeeUserId = await this.attendeeId(accessToken);
    await this.database.execute(
      sql`
        UPDATE exhibitor_relationships SET status = 'archived', updated_at = now()
        WHERE event_exhibitor_id = ${exhibitorId} AND attendee_user_id = ${attendeeUserId}
      `,
    );
    return { saved: false };
  }
}

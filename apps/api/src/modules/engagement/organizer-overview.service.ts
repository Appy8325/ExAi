import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { sql } from "drizzle-orm";

import {
  DATABASE_CLIENT,
  type DatabaseClient,
} from "../../common/database-client";
import { SupabaseAuthService } from "../auth/supabase-auth.service";

export type OrganizerOverview = {
  organizationId: string;
  organizationName: string;
  totals: {
    events: number;
    exhibitors: number;
    attendees: number;
    relationships: number;
  };
  events: Array<{
    id: string;
    name: string;
    slug: string;
    startAt: string;
    endAt: string;
    timezone: string;
    status: string;
    privacyPolicyUrl: string | null;
    logoUrl: string | null;
    primaryColor: string;
    exhibitors: number;
    attendees: number;
    relationships: number;
  }>;
};

@Injectable()
export class OrganizerOverviewService {
  constructor(
    @Inject(DATABASE_CLIENT) private readonly database: DatabaseClient,
    private readonly auth: SupabaseAuthService,
  ) {}

  async find(accessToken: string): Promise<OrganizerOverview> {
    const user = await this.auth.identity(accessToken);
    if (!user) throw new UnauthorizedException("Authentication required.");
    const rows = await this.database.execute(sql<{
      overview: OrganizerOverview;
    }>`
      WITH organizer AS (
        SELECT organization.id, organization.name
        FROM organization_memberships membership
        JOIN organizations organization ON organization.id = membership.organization_id
        WHERE membership.user_id = ${user.id} AND membership.status = 'active' AND organization.kind = 'organizer'
        ORDER BY membership.created_at
        LIMIT 1
      )
      SELECT jsonb_build_object(
        'organizationId', organizer.id,
        'organizationName', organizer.name,
        'totals', jsonb_build_object(
          'events', (SELECT count(*)::int FROM events event WHERE event.organization_id = organizer.id AND event.status <> 'archived'),
          'exhibitors', (SELECT count(*)::int FROM event_exhibitors booth WHERE booth.organizer_organization_id = organizer.id AND booth.status NOT IN ('archived', 'withdrawn')),
          'attendees', (SELECT count(DISTINCT relationship.attendee_user_id)::int FROM exhibitor_relationships relationship JOIN event_exhibitors booth ON booth.id = relationship.event_exhibitor_id WHERE booth.organizer_organization_id = organizer.id),
          'relationships', (SELECT count(*)::int FROM exhibitor_relationships relationship JOIN event_exhibitors booth ON booth.id = relationship.event_exhibitor_id WHERE booth.organizer_organization_id = organizer.id)
        ),
        'events', COALESCE((
          SELECT jsonb_agg(jsonb_build_object(
            'id', event.id, 'name', event.name, 'slug', event.slug, 'startAt', event.start_at,
            'endAt', event.end_at, 'timezone', event.timezone, 'status', event.status,
            'privacyPolicyUrl', event.privacy_policy_url, 'logoUrl', event.logo_url,
            'primaryColor', event.primary_color,
            'exhibitors', (SELECT count(*)::int FROM event_exhibitors booth WHERE booth.event_id = event.id AND booth.status NOT IN ('archived', 'withdrawn')),
            'attendees', (SELECT count(DISTINCT relationship.attendee_user_id)::int FROM exhibitor_relationships relationship JOIN event_exhibitors booth ON booth.id = relationship.event_exhibitor_id WHERE booth.event_id = event.id),
            'relationships', (SELECT count(*)::int FROM exhibitor_relationships relationship JOIN event_exhibitors booth ON booth.id = relationship.event_exhibitor_id WHERE booth.event_id = event.id)
          ) ORDER BY event.start_at DESC)
          FROM events event WHERE event.organization_id = organizer.id AND event.status <> 'archived'
        ), '[]'::jsonb)
      ) AS overview
      FROM organizer
    `);
    const overview = (
      rows as unknown as Array<{ overview: OrganizerOverview }>
    )[0]?.overview;
    if (!overview)
      throw new NotFoundException("Organizer organization not found.");
    return overview;
  }
}

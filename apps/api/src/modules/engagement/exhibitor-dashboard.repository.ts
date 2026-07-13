import { Inject, Injectable } from "@nestjs/common";
import { sql } from "drizzle-orm";
import { setRlsContext } from "@concourse/database";
import type { ExhibitorDashboard } from "@concourse/api-contract/src/exhibitor-dashboard";
import { DATABASE_CLIENT, type DatabaseClient } from "../../common/database-client";

type Row = { dashboard: ExhibitorDashboard };

@Injectable()
export class ExhibitorDashboardRepository {
  constructor(@Inject(DATABASE_CLIENT) private readonly database: DatabaseClient) {}

  async find(input: { organizationId: string; actorUserId: string; eventExhibitorId: string }): Promise<ExhibitorDashboard | undefined> {
    return this.database.transaction(async tx => {
      await setRlsContext(tx, input.organizationId, input.actorUserId);
      const rows = await tx.execute(sql<Row>`
        WITH previous AS (
          SELECT last_visited_at FROM exhibitor_dashboard_visits
          WHERE organization_id = ${input.organizationId} AND event_exhibitor_id = ${input.eventExhibitorId} AND user_id = ${input.actorUserId}
        ), recorded AS (
          INSERT INTO exhibitor_dashboard_visits(organization_id, event_exhibitor_id, user_id)
          SELECT ${input.organizationId}, exhibitor.id, ${input.actorUserId} FROM event_exhibitors exhibitor WHERE exhibitor.id = ${input.eventExhibitorId} AND exhibitor.organization_id = ${input.organizationId}
          ON CONFLICT (organization_id, event_exhibitor_id, user_id) DO UPDATE SET last_visited_at = now()
          RETURNING last_visited_at
        ), boundary AS (SELECT COALESCE((SELECT last_visited_at FROM previous), '-infinity'::timestamptz) AS at)
        SELECT jsonb_build_object(
          'intelligenceFeed', jsonb_build_object(
            'profilesEnriched', (SELECT count(DISTINCT enrichment.relationship_id)::int FROM relationship_enrichments enrichment JOIN exhibitor_relationships relationship ON relationship.id = enrichment.relationship_id, boundary WHERE relationship.event_exhibitor_id = ${input.eventExhibitorId} AND enrichment.created_at > boundary.at AND concourse.exhibitor_can_read_attendee_profile(relationship.attendee_user_id)),
            'completeProfiles', (SELECT count(DISTINCT enrichment.relationship_id)::int FROM relationship_enrichments enrichment JOIN exhibitor_relationships relationship ON relationship.id = enrichment.relationship_id, boundary WHERE relationship.event_exhibitor_id = ${input.eventExhibitorId} AND enrichment.change_type = 'profile_completed' AND enrichment.created_at > boundary.at AND concourse.exhibitor_can_read_attendee_profile(relationship.attendee_user_id)),
            'items', COALESCE((SELECT jsonb_agg(jsonb_build_object('id', enrichment.id, 'at', enrichment.created_at, 'relationshipId', relationship.id, 'label', CASE enrichment.change_type WHEN 'profile_completed' THEN 'Profile completed' WHEN 'added' THEN initcap(replace(enrichment.field_name, '_', ' ')) || ' added' WHEN 'shared' THEN initcap(replace(enrichment.field_name, '_', ' ')) || ' shared' ELSE initcap(replace(enrichment.field_name, '_', ' ')) || ' updated' END) ORDER BY enrichment.created_at DESC, enrichment.id DESC) FROM (SELECT * FROM relationship_enrichments ORDER BY created_at DESC, id DESC LIMIT 20) enrichment JOIN exhibitor_relationships relationship ON relationship.id = enrichment.relationship_id WHERE relationship.event_exhibitor_id = ${input.eventExhibitorId} AND concourse.exhibitor_can_read_attendee_profile(relationship.attendee_user_id)), '[]'::jsonb)
          ),
          'sinceLastVisited', jsonb_build_object(
            'since', (SELECT last_visited_at FROM previous),
            'newRelationships', (SELECT count(*)::int FROM exhibitor_relationships r, boundary WHERE r.event_exhibitor_id = ${input.eventExhibitorId} AND r.created_at > boundary.at),
            'profilesEnriched', (SELECT count(*)::int FROM exhibitor_relationships r JOIN attendee_profiles p ON p.user_id = r.attendee_user_id, boundary WHERE r.event_exhibitor_id = ${input.eventExhibitorId} AND p.updated_at > boundary.at),
            'returningVisitors', (SELECT count(*)::int FROM lead_submissions s, boundary WHERE s.event_exhibitor_id = ${input.eventExhibitorId} AND s.potential_duplicate AND s.submitted_at > boundary.at),
            'notesAdded', (SELECT count(*)::int FROM exhibitor_relationship_notes n JOIN exhibitor_relationships r ON r.id = n.relationship_id, boundary WHERE r.event_exhibitor_id = ${input.eventExhibitorId} AND n.created_at > boundary.at),
            'completeProfiles', (SELECT count(*)::int FROM exhibitor_relationships r JOIN attendee_profiles p ON p.user_id = r.attendee_user_id JOIN attendee_profile_consents c ON c.user_id = r.attendee_user_id, boundary WHERE r.event_exhibitor_id = ${input.eventExhibitorId} AND c.share_profile_with_exhibitors AND p.company IS NOT NULL AND p.job_title IS NOT NULL AND p.industry IS NOT NULL AND p.updated_at > boundary.at)
          ),
          'pipeline', jsonb_build_object(
            'new', (SELECT count(*)::int FROM exhibitor_relationships WHERE event_exhibitor_id = ${input.eventExhibitorId} AND status = 'active' AND interaction_count = 1),
            'active', (SELECT count(*)::int FROM exhibitor_relationships WHERE event_exhibitor_id = ${input.eventExhibitorId} AND status = 'active'),
            'returning', (SELECT count(*)::int FROM exhibitor_relationships WHERE event_exhibitor_id = ${input.eventExhibitorId} AND status = 'active' AND interaction_count > 1),
            'needsFollowUp', (SELECT count(*)::int FROM exhibitor_relationships r WHERE r.event_exhibitor_id = ${input.eventExhibitorId} AND r.status = 'active' AND NOT EXISTS (SELECT 1 FROM exhibitor_relationship_notes n WHERE n.relationship_id = r.id AND n.status = 'active'))
          ),
          'recentActivity', COALESCE((SELECT jsonb_agg(item ORDER BY (item->>'at') DESC, item->>'id' DESC) FROM (
            SELECT jsonb_build_object('id', s.id, 'at', s.submitted_at, 'type', 'submission', 'relationshipId', s.relationship_id, 'label', CASE WHEN s.interaction_source = 'visitor_qr' THEN 'Visitor scanned Booth QR' ELSE 'Exhibitor-assisted submission' END) item FROM lead_submissions s WHERE s.event_exhibitor_id = ${input.eventExhibitorId}
            UNION ALL SELECT jsonb_build_object('id', n.id, 'at', n.created_at, 'type', 'note', 'relationshipId', n.relationship_id, 'label', 'Note added') item FROM exhibitor_relationship_notes n JOIN exhibitor_relationships r ON r.id = n.relationship_id WHERE r.event_exhibitor_id = ${input.eventExhibitorId}
            UNION ALL SELECT jsonb_build_object('id', p.user_id, 'at', p.updated_at, 'type', 'profile', 'relationshipId', r.id, 'label', 'Attendee profile enriched') item FROM attendee_profiles p JOIN exhibitor_relationships r ON r.attendee_user_id = p.user_id JOIN attendee_profile_consents c ON c.user_id = p.user_id WHERE r.event_exhibitor_id = ${input.eventExhibitorId} AND c.share_profile_with_exhibitors
          ) activity LIMIT 20), '[]'::jsonb),
          'attention', COALESCE((SELECT jsonb_agg(jsonb_build_object('relationshipId', r.id, 'attendeeName', CASE WHEN concourse.exhibitor_can_read_attendee_profile(r.attendee_user_id) THEN u.full_name END, 'reasons', array_remove(ARRAY[CASE WHEN NOT EXISTS (SELECT 1 FROM exhibitor_relationship_notes n WHERE n.relationship_id = r.id AND n.status = 'active') THEN 'Missing note' END, CASE WHEN NOT concourse.exhibitor_can_read_attendee_profile(r.attendee_user_id) OR p.company IS NULL OR p.job_title IS NULL OR p.industry IS NULL THEN 'Incomplete profile' END, CASE WHEN r.interaction_count > 1 AND NOT EXISTS (SELECT 1 FROM exhibitor_relationship_notes n WHERE n.relationship_id = r.id AND n.status = 'active') THEN 'Returning visitor without follow-up' END, CASE WHEN r.has_potential_duplicate THEN 'Potential duplicate' END], NULL)) ORDER BY r.latest_interaction_at DESC) FROM (SELECT * FROM exhibitor_relationships WHERE event_exhibitor_id = ${input.eventExhibitorId} AND status = 'active' ORDER BY latest_interaction_at DESC LIMIT 20) r LEFT JOIN users u ON u.id = r.attendee_user_id LEFT JOIN attendee_profiles p ON p.user_id = r.attendee_user_id), '[]'::jsonb),
          'performance', jsonb_build_object(
            'qrScans', (SELECT count(*)::int FROM lead_submissions WHERE event_exhibitor_id = ${input.eventExhibitorId} AND interaction_source = 'visitor_qr'),
            'relationshipsCreated', (SELECT count(*)::int FROM exhibitor_relationships WHERE event_exhibitor_id = ${input.eventExhibitorId}),
            'returningVisitors', (SELECT count(*)::int FROM exhibitor_relationships WHERE event_exhibitor_id = ${input.eventExhibitorId} AND interaction_count > 1),
            'profileCompletion', COALESCE((SELECT round(avg(20 * ((u.full_name IS NOT NULL)::int + (u.email IS NOT NULL)::int + (p.company IS NOT NULL)::int + (p.job_title IS NOT NULL)::int + (p.industry IS NOT NULL)::int)))::int FROM exhibitor_relationships r JOIN users u ON u.id = r.attendee_user_id LEFT JOIN attendee_profiles p ON p.user_id = r.attendee_user_id WHERE r.event_exhibitor_id = ${input.eventExhibitorId} AND concourse.exhibitor_can_read_attendee_profile(r.attendee_user_id)), 0),
            'formCompletionRate', COALESCE((SELECT round(100 * avg(CASE WHEN f.fields = 0 THEN 1::numeric ELSE s_values.values::numeric / f.fields END))::int FROM lead_submissions s CROSS JOIN LATERAL (SELECT count(*)::int fields FROM lead_form_fields WHERE lead_form_id = s.lead_form_id AND status = 'active') f CROSS JOIN LATERAL (SELECT count(*)::int values FROM lead_submission_values WHERE lead_submission_id = s.id) s_values WHERE s.event_exhibitor_id = ${input.eventExhibitorId}), 0)
          )
        ) AS dashboard FROM recorded
      `);
      return (rows as unknown as Row[])[0]?.dashboard;
    });
  }
}

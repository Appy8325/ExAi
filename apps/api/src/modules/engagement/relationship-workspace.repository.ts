import { Inject, Injectable } from "@nestjs/common";
import { sql } from "drizzle-orm";
import { setRlsContext } from "@concourse/database";
import {
  DATABASE_CLIENT,
  type DatabaseClient,
} from "../../common/database-client";
import type { RelationshipWorkspace } from "@concourse/api-contract/src/relationship-workspace";

type WorkspaceRow = { workspace: RelationshipWorkspace };

@Injectable()
export class RelationshipWorkspaceRepository {
  constructor(
    @Inject(DATABASE_CLIENT) private readonly database: DatabaseClient,
  ) {}

  async find(input: {
    organizationId: string;
    actorUserId: string;
    relationshipId: string;
  }) {
    return this.database.transaction(async (tx) => {
      await setRlsContext(tx, input.organizationId, input.actorUserId);
      const rows = await tx.execute(sql<WorkspaceRow>`
        SELECT jsonb_build_object(
          'attendee', jsonb_build_object(
            'id', relationship.attendee_user_id,
            'name', CASE WHEN consent.is_shared THEN attendee.full_name END,
            'company', CASE WHEN consent.is_shared THEN profile.company END,
            'title', CASE WHEN consent.is_shared THEN profile.job_title END,
            'industry', CASE WHEN consent.is_shared THEN profile.industry END,
            'contact', jsonb_build_object(
              'email', CASE WHEN consent.is_shared THEN attendee.email END,
              'linkedInUrl', CASE WHEN consent.is_shared THEN profile.linkedin_url END
            ),
            'profileCompleteness', CASE WHEN consent.is_shared THEN
              20 * ((attendee.full_name IS NOT NULL)::int + (attendee.email IS NOT NULL)::int + (profile.company IS NOT NULL)::int + (profile.job_title IS NOT NULL)::int + (profile.industry IS NOT NULL)::int)
              ELSE 0 END,
            'consentStatus', CASE WHEN consent.is_shared THEN 'shared' ELSE 'not_shared' END
          ),
          'relationship', jsonb_build_object(
            'id', relationship.id, 'eventExhibitorId', relationship.event_exhibitor_id,
            'status', relationship.status, 'firstInteractionAt', relationship.first_interaction_at,
            'latestInteractionAt', relationship.latest_interaction_at, 'interactionCount', relationship.interaction_count,
            'hasPotentialDuplicate', relationship.has_potential_duplicate, 'updatedAt', relationship.updated_at
          ),
          'timeline', COALESCE((
            SELECT jsonb_agg(jsonb_build_object(
              'id', submission.id, 'submittedAt', submission.submitted_at,
              'interactionSource', submission.interaction_source, 'potentialDuplicate', submission.potential_duplicate,
              'form', jsonb_build_object('id', form.id, 'name', form.name, 'description', form.description),
              'values', COALESCE((
                SELECT jsonb_agg(jsonb_build_object('fieldId', value.lead_form_field_id, 'value', value.value, 'field', value.field_snapshot) ORDER BY value.created_at, value.id)
                FROM lead_submission_values value WHERE value.lead_submission_id = submission.id
              ), '[]'::jsonb)
            ) ORDER BY submission.submitted_at, submission.id)
            FROM lead_submissions submission
            JOIN lead_forms form ON form.id = submission.lead_form_id
            WHERE submission.relationship_id = relationship.id
          ), '[]'::jsonb),
          'notes', COALESCE((
            SELECT jsonb_agg(jsonb_build_object(
              'id', note.id, 'body', note.body, 'createdByUserId', note.created_by_user_id,
              'createdAt', note.created_at, 'updatedAt', note.updated_at
            ) ORDER BY note.created_at, note.id)
            FROM exhibitor_relationship_notes note
            WHERE note.relationship_id = relationship.id AND note.status = 'active'
          ), '[]'::jsonb),
          'intelligence', (
            SELECT jsonb_build_object(
              'status', intelligence.status, 'leadScore', intelligence.lead_score,
              'buyingIntent', intelligence.buying_intent, 'summary', intelligence.summary,
              'topicsDiscussed', intelligence.topics_discussed,
              'followUpRecommendation', intelligence.follow_up_recommendation,
              'suggestedEmail', intelligence.suggested_email,
              'confidence', intelligence.confidence, 'completedAt', intelligence.completed_at
            )
            FROM lead_intelligence intelligence
            JOIN lead_submissions submission ON submission.id = intelligence.lead_submission_id
            WHERE submission.relationship_id = relationship.id
            ORDER BY intelligence.created_at DESC LIMIT 1
          ),
          'summary', jsonb_build_object(
            'interactionCount', relationship.interaction_count, 'lastActivityAt', relationship.latest_interaction_at,
            'noteCount', (SELECT count(*)::int FROM exhibitor_relationship_notes note WHERE note.relationship_id = relationship.id AND note.status = 'active'),
            'profileCompleteness', CASE WHEN consent.is_shared THEN
              20 * ((attendee.full_name IS NOT NULL)::int + (attendee.email IS NOT NULL)::int + (profile.company IS NOT NULL)::int + (profile.job_title IS NOT NULL)::int + (profile.industry IS NOT NULL)::int)
              ELSE 0 END
          )
        ) AS workspace
        FROM exhibitor_relationships relationship
        CROSS JOIN LATERAL (SELECT concourse.exhibitor_can_read_attendee_profile(relationship.attendee_user_id) AS is_shared) consent
        LEFT JOIN users attendee ON attendee.id = relationship.attendee_user_id
        LEFT JOIN attendee_profiles profile ON profile.user_id = relationship.attendee_user_id
        WHERE relationship.id = ${input.relationshipId}
      `);
      return rows[0]?.workspace;
    });
  }
}

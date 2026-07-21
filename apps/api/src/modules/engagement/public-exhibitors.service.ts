import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createClient } from "@supabase/supabase-js";
import { sql } from "drizzle-orm";
import {
  DATABASE_CLIENT,
  type DatabaseClient,
} from "../../common/database-client";
import { pendingSourceIds, ingestSource } from "@concourse/ai/knowledge";

type ExhibitorRow = {
  id: string;
  organization_id: string;
  company_name: string;
  booth_name: string;
  booth_number: string | null;
  logo_url: string | null;
  description: string | null;
  website: string | null;
  social_links: Record<string, string> | null;
  contact_email: string | null;
  contact_phone: string | null;
};

type EventRow = {
  id: string;
  name: string;
  slug: string;
};

@Injectable()
export class PublicExhibitorsService {
  constructor(
    @Inject(DATABASE_CLIENT) private readonly database: DatabaseClient,
    private readonly config: ConfigService,
  ) {}

  async findEventBySlug(slug: string) {
    const rows = await this.database.execute(
      sql<EventRow>`SELECT id, name, slug FROM events WHERE slug = ${slug} AND status IN ('published','live') LIMIT 1`,
    );
    const event = (rows as unknown as EventRow[])[0];
    if (!event) throw new NotFoundException("Event not found.");
    return event;
  }

  async listExhibitors(eventId: string, search?: string) {
    let query = sql<ExhibitorRow>`
      SELECT booth.id, booth.organization_id, organization.name AS company_name, booth.booth_name,
        booth.booth_number, booth.logo_url, booth.description, booth.website,
        booth.social_links, booth.contact_email, booth.contact_phone
      FROM event_exhibitors booth
      JOIN organizations organization ON organization.id = booth.organization_id
      WHERE booth.event_id = ${eventId}
        AND booth.status = 'ready'
        AND EXISTS (SELECT 1 FROM events event WHERE event.id = booth.event_id AND event.status IN ('published','live'))
    `;
    if (search?.trim()) {
      const term = `%${search.trim()}%`;
      query = sql<ExhibitorRow>`
        ${query} AND (organization.name ILIKE ${term} OR booth.booth_name ILIKE ${term} OR booth.description ILIKE ${term})
      `;
    }
    query = sql<ExhibitorRow>`${query} ORDER BY organization.name ASC`;
    const rows = await this.database.execute(query);
    return (rows as unknown as ExhibitorRow[]).map(exhibitorRow);
  }

  async findExhibitor(eventId: string, exhibitorId: string) {
    const rows = await this.database.execute(
      sql<ExhibitorRow>`
        SELECT booth.id, booth.organization_id, organization.name AS company_name, booth.booth_name,
          booth.booth_number, booth.logo_url, booth.description, booth.website,
          booth.social_links, booth.contact_email, booth.contact_phone
        FROM event_exhibitors booth
        JOIN organizations organization ON organization.id = booth.organization_id
        WHERE booth.event_id = ${eventId}
          AND booth.id = ${exhibitorId}
          AND booth.status = 'ready'
          AND EXISTS (SELECT 1 FROM events event WHERE event.id = booth.event_id AND event.status IN ('published','live'))
        LIMIT 1
      `,
    );
    const row = (rows as unknown as ExhibitorRow[])[0];
    if (!row) throw new NotFoundException("Exhibitor not found.");
    return exhibitorRow(row);
  }

  async findDemoQr(eventId: string, exhibitorId: string) {
    const rows = await this.database.execute(sql<{ public_token: string }>`
      SELECT credential.public_token
      FROM booth_qr_credentials credential
      JOIN event_exhibitors booth ON booth.id = credential.event_exhibitor_id
      JOIN events event ON event.id = booth.event_id
      WHERE booth.event_id = ${eventId} AND booth.id = ${exhibitorId}
        AND booth.status = 'ready' AND event.status IN ('published','live')
        AND credential.active
      ORDER BY credential.created_at DESC LIMIT 1
    `);
    const token = (rows as unknown as Array<{ public_token: string }>)[0]
      ?.public_token;
    if (!token) throw new NotFoundException("Active booth QR not found.");
    return { publicQrToken: token };
  }

  async demoAnalytics(eventId: string) {
    const eventRows = await this.database.execute(
      sql<{ id: string; name: string; status: string; timezone: string }>`
        SELECT id, name, status, timezone FROM events
        WHERE id = ${eventId} AND status IN ('published','live') LIMIT 1
      `,
    );
    const event = (eventRows as unknown as Array<{ id: string; name: string; status: string; timezone: string }>)[0];
    if (!event) throw new NotFoundException("Event not found.");

    const exhibitCount = await this.database.execute(
      sql<{ count: number }>`
        SELECT COUNT(*)::int AS count FROM event_exhibitors
        WHERE event_id = ${eventId} AND status = 'ready'
      `,
    );
    const boothCount = (exhibitCount as unknown as Array<{ count: number }>)[0]?.count ?? 0;

    const relRows = await this.database.execute(
      sql<{ total: number; unique: number; returning: number }>`
        SELECT
          COUNT(*)::int AS total,
          COUNT(DISTINCT attendee_user_id)::int AS unique,
          COUNT(*) FILTER (WHERE interaction_count > 1)::int AS returning
        FROM exhibitor_relationships
        WHERE event_id = ${eventId}
      `,
    );
    const rel = (relRows as unknown as Array<{ total: number; unique: number; returning: number }>)[0] ?? { total: 0, unique: 0, returning: 0 };

    const subRows = await this.database.execute(
      sql<{ count: number }>`
        SELECT COUNT(*)::int AS count FROM lead_submissions sub
        JOIN lead_forms form ON form.id = sub.lead_form_id
        WHERE form.event_exhibitor_id IN (
          SELECT id FROM event_exhibitors WHERE event_id = ${eventId} AND status = 'ready'
        )
      `,
    );
    const leadCount = (subRows as unknown as Array<{ count: number }>)[0]?.count ?? 0;

    const boothRows = await this.database.execute(
      sql<{ id: string; name: string; booth_number: string | null; visits: number; leads: number }>`
        SELECT booth.id, organization.name AS name, booth.booth_number,
          COALESCE(rel_stats.visits, 0)::int AS visits,
          COALESCE(rel_stats.leads, 0)::int AS leads
        FROM event_exhibitors booth
        JOIN organizations organization ON organization.id = booth.organization_id
        LEFT JOIN (
          SELECT rel.event_exhibitor_id,
            COUNT(*) AS visits,
            COUNT(sub.id)::int AS leads
          FROM exhibitor_relationships rel
          LEFT JOIN lead_submissions sub ON sub.relationship_id = rel.id
          WHERE rel.event_id = ${eventId}
          GROUP BY rel.event_exhibitor_id
        ) rel_stats ON rel_stats.event_exhibitor_id = booth.id
        WHERE booth.event_id = ${eventId} AND booth.status = 'ready'
        ORDER BY organization.name ASC
      `,
    );
    const booths = (boothRows as unknown as Array<{ id: string; name: string; booth_number: string | null; visits: number; leads: number }>);
    const maxVisits = Math.max(...booths.map((b) => b.visits), 1);

    const industryRows = await this.database.execute(
      sql<{ name: string; count: number }>`
        SELECT ap.industry AS name, COUNT(*)::int AS count
        FROM attendee_profiles ap
        JOIN attendee_profile_consents apc ON apc.user_id = ap.user_id AND apc.share_profile_with_exhibitors = true
        WHERE ap.user_id IN (
          SELECT DISTINCT attendee_user_id FROM exhibitor_relationships WHERE event_id = ${eventId}
        ) AND ap.industry IS NOT NULL
        GROUP BY ap.industry
        ORDER BY count DESC
      `,
    );

    const topicRows = await this.database.execute(
      sql<{ name: string; count: number }>`
        SELECT jsonb_array_elements_text(li.topics_discussed) AS name, COUNT(*)::int AS count
        FROM lead_intelligence li
        JOIN lead_submissions ls ON ls.id = li.lead_submission_id
        WHERE li.topics_discussed IS NOT NULL AND jsonb_array_length(li.topics_discussed) > 0
        GROUP BY name
        ORDER BY count DESC
      `,
    );

    return {
      organizationId: "",
      event: { id: event.id, name: event.name, status: event.status, timezone: event.timezone },
      generatedAt: new Date().toISOString(),
      traffic: {
        capturedVisits: rel.total,
        uniqueVisitors: rel.unique,
        returningVisitors: rel.returning,
      },
      conversions: { leads: leadCount, conversionRate: rel.unique > 0 ? Number(((leadCount / rel.unique) * 100).toFixed(1)) : 0 },
      engagement: {
        repeatEngagementRate: rel.total > 0 ? Number(((rel.returning / rel.total) * 100).toFixed(1)) : 0,
        averageInteractions: rel.unique > 0 ? Number((rel.total / rel.unique).toFixed(1)) : 0,
        analyzedLeads: leadCount,
      },
      booths: booths.map((b) => ({
        id: b.id,
        name: b.name,
        boothNumber: b.booth_number,
        visits: b.visits,
        leads: b.leads,
        uniqueVisitors: b.visits,
        conversionRate: b.visits > 0 ? Number(((b.leads / b.visits) * 100).toFixed(1)) : 0,
        heat: Number(((b.visits / maxVisits) * 100).toFixed(0)),
      })),
      industries: (industryRows as unknown as Array<{ name: string; count: number }>).map((r) => ({ name: r.name, count: r.count })),
      topics: (topicRows as unknown as Array<{ name: string; count: number }>).map((r) => ({ name: r.name, count: r.count })),
    };
  }

  async demoExhibitorDashboard(eventExhibitorId: string) {
    const rows = await this.database.execute(
      sql<{
        id: string; event_id: string; organization_id: string; company_name: string;
        rel_total: number; rel_new: number; rel_returning: number; rel_active: number;
        rel_needs_followup: number; qr_scans: number; leads: number;
        avg_profile_completion: number; profiles_enriched: number;
        complete_profiles: number;
      }>`
        WITH booth AS (
          SELECT booth.id, booth.event_id, booth.organization_id, org.name AS company_name
          FROM event_exhibitors booth
          JOIN organizations org ON org.id = booth.organization_id
          WHERE booth.id = ${eventExhibitorId} AND booth.status = 'ready'
          LIMIT 1
        ),
        rel_stats AS (
          SELECT
            COUNT(*)::int AS total,
            COUNT(*) FILTER (WHERE first_interaction_at >= now() - interval '24 hours')::int AS new_today,
            COUNT(*) FILTER (WHERE interaction_count > 1)::int AS returning,
            COUNT(*) FILTER (WHERE status = 'active')::int AS active,
            COUNT(*) FILTER (WHERE NOT EXISTS (
              SELECT 1 FROM relationship_notes rn WHERE rn.relationship_id = exhibitor_relationships.id
            ))::int AS needs_followup,
            COUNT(*) FILTER (WHERE interaction_source = 'visitor_qr')::int AS qr_scans
          FROM exhibitor_relationships
          WHERE event_exhibitor_id = ${eventExhibitorId}
        ),
        lead_stats AS (
          SELECT COUNT(*)::int AS count
          FROM lead_submissions sub
          JOIN lead_forms form ON form.id = sub.lead_form_id
          WHERE form.event_exhibitor_id = ${eventExhibitorId}
        ),
        profile_stats AS (
          SELECT
            COUNT(*)::int AS total,
            COUNT(*) FILTER (
              WHERE ap.industry IS NOT NULL
                AND ap.job_title IS NOT NULL
                AND ap.company IS NOT NULL
                AND ap.phone IS NOT NULL
                AND ap.bio IS NOT NULL
            )::int AS complete
          FROM exhibitor_relationships rel
          JOIN attendee_profiles ap ON ap.user_id = rel.attendee_user_id
          WHERE rel.event_exhibitor_id = ${eventExhibitorId}
        ),
        enrichment_stats AS (
          SELECT
            COUNT(DISTINCT li.lead_submission_id)::int AS enriched,
            COUNT(*) FILTER (WHERE li.change_type = 'profile_completed')::int AS complete_profiles
          FROM lead_intelligence li
          JOIN lead_submissions ls ON ls.id = li.lead_submission_id
          JOIN lead_forms form ON form.id = ls.lead_form_id
          WHERE form.event_exhibitor_id = ${eventExhibitorId}
        ),
        recent_submissions AS (
          SELECT ls.created_at AS at, 'form_submission' AS type,
            ls.id AS ref_id, COALESCE(ap.company, '') AS label
          FROM lead_submissions ls
          JOIN lead_forms form ON form.id = ls.lead_form_id
          LEFT JOIN attendee_profiles ap ON ap.user_id = ls.submitted_by
          WHERE form.event_exhibitor_id = ${eventExhibitorId}
          ORDER BY ls.created_at DESC LIMIT 10
        ),
        recent_notes AS (
          SELECT rn.created_at AS at, 'note_added' AS type,
            rn.id AS ref_id, LEFT(rn.content, 80) AS label
          FROM relationship_notes rn
          JOIN exhibitor_relationships rel ON rel.id = rn.relationship_id
          WHERE rel.event_exhibitor_id = ${eventExhibitorId}
          ORDER BY rn.created_at DESC LIMIT 10
        ),
        recent_enrichments AS (
          SELECT li.created_at AS at, 'enrichment' AS type,
            li.id AS ref_id,
            COALESCE(li.change_type || ' — ' || li.change_summary, '') AS label
          FROM lead_intelligence li
          JOIN lead_submissions ls ON ls.id = li.lead_submission_id
          JOIN lead_forms form ON form.id = ls.lead_form_id
          WHERE form.event_exhibitor_id = ${eventExhibitorId}
          ORDER BY li.created_at DESC LIMIT 10
        ),
        flagged_rels AS (
          SELECT rel.id AS relationship_id,
            COALESCE(ap.company, 'Attendee') || ' — ' || COALESCE(rel.notes, 'needs attention') AS reason
          FROM exhibitor_relationships rel
          LEFT JOIN attendee_profiles ap ON ap.user_id = rel.attendee_user_id
          WHERE rel.event_exhibitor_id = ${eventExhibitorId}
            AND (rel.status = 'blocked' OR rel.notes ILIKE '%flag%' OR rel.notes ILIKE '%urgent%')
        ),
        enrich_items AS (
          SELECT li.created_at AS at, li.change_type, li.change_summary
          FROM lead_intelligence li
          JOIN lead_submissions ls ON ls.id = li.lead_submission_id
          JOIN lead_forms form ON form.id = ls.lead_form_id
          WHERE form.event_exhibitor_id = ${eventExhibitorId}
          ORDER BY li.created_at DESC LIMIT 20
        ),
        src_count AS (
          SELECT COUNT(*)::int AS count FROM kb_sources
          WHERE event_exhibitor_id = ${eventExhibitorId} AND status = 'indexed'
        )
        SELECT b.*,
          rs.total AS rel_total, rs.new_today AS rel_new, rs.returning AS rel_returning,
          rs.active AS rel_active, rs.needs_followup AS rel_needs_followup,
          rs.qr_scans, ls.count AS leads,
          CASE WHEN ps.total > 0
            THEN ROUND(
              (COUNT(*) FILTER (WHERE ap.industry IS NOT NULL)::numeric
               + COUNT(*) FILTER (WHERE ap.job_title IS NOT NULL)::numeric
               + COUNT(*) FILTER (WHERE ap.company IS NOT NULL)::numeric
               + COUNT(*) FILTER (WHERE ap.phone IS NOT NULL)::numeric
               + COUNT(*) FILTER (WHERE ap.bio IS NOT NULL)::numeric
              ) / (ps.total * 5) * 100, 0
            )::int
            ELSE 0
          END AS avg_profile_completion,
          es.enriched AS profiles_enriched, es.complete_profiles
        FROM booth b, rel_stats rs, lead_stats ls, profile_stats ps, enrichment_stats es, src_count sc
        GROUP BY b.id, b.event_id, b.organization_id, b.company_name,
          rs.total, rs.new_today, rs.returning, rs.active, rs.needs_followup,
          rs.qr_scans, ls.count, ps.total, es.enriched, es.complete_profiles
      `,
    );
    const row = (rows as unknown as Array<{
      id: string; event_id: string; organization_id: string; company_name: string;
      rel_total: number; rel_new: number; rel_returning: number; rel_active: number;
      rel_needs_followup: number; qr_scans: number; leads: number;
      avg_profile_completion: number; profiles_enriched: number; complete_profiles: number;
    }>)[0];
    if (!row) throw new NotFoundException("Booth not found.");

    const activityUnion = await this.database.execute(
      sql<{ at: string; type: string; ref_id: string; label: string }>`
        (SELECT created_at AS at, 'form_submission' AS type, id AS ref_id,
          COALESCE((SELECT company FROM attendee_profiles WHERE user_id = submitted_by), '') AS label
        FROM lead_submissions ls
        JOIN lead_forms form ON form.id = ls.lead_form_id
        WHERE form.event_exhibitor_id = ${eventExhibitorId}
        ORDER BY created_at DESC LIMIT 10)
        UNION ALL
        (SELECT rn.created_at AS at, 'note_added' AS type, rn.id AS ref_id, LEFT(rn.content, 80) AS label
        FROM relationship_notes rn
        JOIN exhibitor_relationships rel ON rel.id = rn.relationship_id
        WHERE rel.event_exhibitor_id = ${eventExhibitorId}
        ORDER BY rn.created_at DESC LIMIT 10)
        UNION ALL
        (SELECT li.created_at AS at, 'enrichment' AS type, li.id AS ref_id,
          COALESCE(li.change_type || ' — ' || li.change_summary, '') AS label
        FROM lead_intelligence li
        JOIN lead_submissions ls ON ls.id = li.lead_submission_id
        JOIN lead_forms form ON form.id = ls.lead_form_id
        WHERE form.event_exhibitor_id = ${eventExhibitorId}
        ORDER BY li.created_at DESC LIMIT 10)
        ORDER BY at DESC LIMIT 20
      `,
    );

    const flagRows = await this.database.execute(
      sql<{ relationship_id: string; reason: string }>`
        SELECT rel.id AS relationship_id,
          COALESCE(ap.company, 'Attendee') || ' — ' || COALESCE(rel.notes, 'needs attention') AS reason
        FROM exhibitor_relationships rel
        LEFT JOIN attendee_profiles ap ON ap.user_id = rel.attendee_user_id
        WHERE rel.event_exhibitor_id = ${eventExhibitorId}
          AND (rel.status = 'blocked' OR rel.notes ILIKE '%flag%' OR rel.notes ILIKE '%urgent%')
      `,
    );

    const enrichItems = await this.database.execute(
      sql<{ at: string; change_type: string; change_summary: string }>`
        SELECT li.created_at AS at, li.change_type, li.change_summary
        FROM lead_intelligence li
        JOIN lead_submissions ls ON ls.id = li.lead_submission_id
        JOIN lead_forms form ON form.id = ls.lead_form_id
        WHERE form.event_exhibitor_id = ${eventExhibitorId}
        ORDER BY li.created_at DESC LIMIT 20
      `,
    );

    const sourceRows = await this.database.execute(
      sql<{ count: number }>`
        SELECT COUNT(*)::int AS count FROM kb_sources
        WHERE event_exhibitor_id = ${eventExhibitorId} AND status = 'indexed'
      `,
    );
    const sourceCount = (sourceRows as unknown as Array<{ count: number }>)[0]?.count ?? 0;

    return {
      performance: {
        qrScans: row.qr_scans,
        relationshipsCreated: row.rel_total,
        returningVisitors: row.rel_returning,
        profileCompletion: row.avg_profile_completion,
        formCompletionRate: row.rel_total > 0 ? Number(((row.leads / row.rel_total) * 100).toFixed(0)) : 0,
      },
      pipeline: {
        new: row.rel_new,
        active: row.rel_active,
        returning: row.rel_returning,
        needsFollowUp: row.rel_needs_followup,
      },
      recentActivity: (activityUnion as unknown as Array<{ at: string; type: string; ref_id: string; label: string }>).map((a) => ({
        id: a.ref_id,
        at: a.at,
        type: a.type as "form_submission" | "note_added" | "enrichment",
        relationshipId: a.ref_id,
        label: a.label,
      })),
      attention: (flagRows as unknown as Array<{ relationship_id: string; reason: string }>).map((f) => ({
        relationshipId: f.relationship_id,
        reason: f.reason,
      })),
      intelligenceFeed: {
        profilesEnriched: row.profiles_enriched,
        completeProfiles: row.complete_profiles,
        sinceLastVisited: {
          since: "24h",
          newRelationships: row.rel_new,
          profilesEnriched: row.profiles_enriched,
          returningVisitors: row.rel_returning,
          notesAdded: (activityUnion as unknown as Array<{ at: string; type: string; ref_id: string; label: string }>).filter((a) => a.type === "note_added").length,
          completeProfiles: row.complete_profiles,
        },
        items: (enrichItems as unknown as Array<{ at: string; change_type: string; change_summary: string }>).map((e) => ({
          id: `${e.at}-${e.change_type}`,
          at: e.at,
          type: e.change_type as "profile_completed" | "enrichment",
          label: e.change_summary,
        })),
      },
      boothInfo: { companyName: row.company_name, sourceCount },
    };
  }

  async demoOverview() {
    const rows = (await this.database.execute(`
      SELECT org.id AS organizer_id, org.slug AS organizer_slug,
        org.name AS organizer_name,
        ev.id AS event_id, ev.name AS event_name, ev.slug AS event_slug,
        ev.start_at AS event_start_at, ev.end_at AS event_end_at,
        ev.timezone AS event_timezone, ev.status AS event_status,
        booth.id AS booth_id, booth.booth_name AS booth_name,
        booth.booth_number AS booth_number,
        exhibitor_org.id AS exhibitor_org_id, exhibitor_org.slug AS exhibitor_org_slug,
        exhibitor_org.name AS exhibitor_org_name,
        credential.public_token AS public_token
      FROM organizations org
      JOIN events ev ON ev.organization_id = org.id
      JOIN event_exhibitors booth ON booth.event_id = ev.id
      JOIN organizations exhibitor_org ON exhibitor_org.id = booth.organization_id
      LEFT JOIN LATERAL (
        SELECT qr.public_token, qr.created_at
        FROM booth_qr_credentials qr
        WHERE qr.event_exhibitor_id = booth.id AND qr.active
        ORDER BY qr.created_at DESC LIMIT 1
      ) credential ON true
      WHERE org.kind = 'organizer'
        AND ev.status IN ('published','live')
        AND booth.status = 'ready'
      ORDER BY org.name ASC, ev.start_at ASC, exhibitor_org.name ASC
    `)) as unknown as Array<{
      organizer_id: string;
      organizer_slug: string;
      organizer_name: string;
      event_id: string;
      event_name: string;
      event_slug: string;
      event_start_at: string | Date;
      event_end_at: string | Date;
      event_timezone: string;
      event_status: string;
      booth_id: string;
      booth_name: string;
      booth_number: string | null;
      exhibitor_org_id: string;
      exhibitor_org_slug: string;
      exhibitor_org_name: string;
      public_token: string | null;
    }>;

    const relationshipRows = (await this.database.execute(`
      SELECT relationship.id AS relationship_id,
        relationship.event_exhibitor_id AS event_exhibitor_id,
        booth.organization_id AS organization_id,
        actor.email AS attendee_email
      FROM exhibitor_relationships relationship
      JOIN event_exhibitors booth ON booth.id = relationship.event_exhibitor_id
      LEFT JOIN users actor ON actor.id = relationship.attendee_user_id
      WHERE booth.status = 'ready'
      ORDER BY relationship.first_interaction_at ASC NULLS LAST
      LIMIT 100
    `)) as unknown as Array<{
      relationship_id: string;
      event_exhibitor_id: string;
      organization_id: string;
      attendee_email: string | null;
    }>;

    let accountRows: Array<{
      role: string;
      email: string;
      full_name: string | null;
    }> = [];
    try {
      accountRows = (await this.database.execute(`
        SELECT wanted.role, users.email, users.full_name
        FROM (
          VALUES
            ('organizer', 'organizer@techexpo.local', 'Olivia Grant'),
            ('exhibitor', 'exhibitor@techexpo.local', 'Elena Park'),
            ('attendee', 'attendee-1@techexpo.local', 'Avery Chen 01')
        ) AS wanted(role, email, full_name)
        LEFT JOIN users ON users.email = wanted.email
        WHERE users.id IS NOT NULL
        ORDER BY wanted.role ASC, wanted.email ASC
      `)) as unknown as Array<{
        role: string;
        email: string;
        full_name: string | null;
      }>;
    } catch {
      accountRows = [];
    }
    const accounts = accountRows.map((row) => ({
      role: row.role as "organizer" | "exhibitor" | "attendee",
      email: row.email,
      fullName: row.full_name ?? row.email,
    }));

    const organizerMap = new Map<string, { id: string; name: string; slug: string }>();
    const eventsMap = new Map<
      string,
      {
        id: string;
        name: string;
        slug: string;
        organizerOrganizationId: string;
        startAt: string;
        endAt: string;
        timezone: string;
        status: string;
        exhibitors: Map<string, {
          id: string;
          organizationId: string;
          companyName: string;
          boothName: string;
          boothNumber: string | null;
          publicQrToken: string | null;
        }>;
      }
    >();
    const exhibitorOrgMap = new Map<
      string,
      { id: string; name: string; slug: string; events: Map<string, { eventId: string; eventSlug: string; eventExhibitorId: string }> }
    >();

    for (const row of rows) {
      const organizer = {
        id: row.organizer_id,
        name: row.organizer_name,
        slug: row.organizer_slug,
      };
      if (!organizerMap.has(organizer.id)) organizerMap.set(organizer.id, organizer);

      const event = eventsMap.get(row.event_id) ?? {
        id: row.event_id,
        name: row.event_name,
        slug: row.event_slug,
        organizerOrganizationId: row.organizer_id,
        startAt: String(row.event_start_at),
        endAt: String(row.event_end_at),
        timezone: row.event_timezone,
        status: row.event_status,
        exhibitors: new Map<string, {
          id: string;
          organizationId: string;
          companyName: string;
          boothName: string;
          boothNumber: string | null;
          publicQrToken: string | null;
        }>(),
      };
      const exhibitor = {
        id: row.booth_id,
        organizationId: row.exhibitor_org_id,
        companyName: row.exhibitor_org_name,
        boothName: row.booth_name,
        boothNumber: row.booth_number,
        publicQrToken: row.public_token,
      };
      event.exhibitors.set(exhibitor.id, exhibitor);
      eventsMap.set(row.event_id, event);

      const exhibitorOrg = exhibitorOrgMap.get(row.exhibitor_org_id) ?? {
        id: row.exhibitor_org_id,
        name: row.exhibitor_org_name,
        slug: row.exhibitor_org_slug,
        events: new Map<string, { eventId: string; eventSlug: string; eventExhibitorId: string }>(),
      };
      exhibitorOrg.events.set(row.event_id, {
        eventId: row.event_id,
        eventSlug: row.event_slug,
        eventExhibitorId: row.booth_id,
      });
      exhibitorOrgMap.set(row.exhibitor_org_id, exhibitorOrg);
    }

    return {
      organizers: [...organizerMap.values()].sort((a, b) => a.name.localeCompare(b.name)),
      events: [...eventsMap.values()]
        .map((value) => ({
          id: value.id,
          name: value.name,
          slug: value.slug,
          organizerOrganizationId: value.organizerOrganizationId,
          startAt: value.startAt,
          endAt: value.endAt,
          timezone: value.timezone,
          status: value.status,
          exhibitors: [...value.exhibitors.values()].sort((a, b) =>
            a.companyName.localeCompare(b.companyName),
          ),
        }))
        .sort((a, b) => a.startAt.localeCompare(b.startAt)),
      exhibitorOrganizations: [...exhibitorOrgMap.values()]
        .map((value) => ({
          id: value.id,
          name: value.name,
          slug: value.slug,
          events: [...value.events.values()],
        }))
        .sort((a, b) => a.name.localeCompare(b.name)),
      relationships: relationshipRows.map((row) => ({
        id: row.relationship_id,
        organizationId: row.organization_id,
        eventExhibitorId: row.event_exhibitor_id,
        attendeeEmail: row.attendee_email,
      })),
      demoAccounts: accounts,
    };
  }

  async ingestDemoKnowledge() {
    try {
      await this.database.execute(sql`UPDATE kb_sources SET status = 'pending', attempt_count = 0, error_message = NULL, updated_at = now() WHERE status IN ('failed','processing')`);
      const pending = await pendingSourceIds();
      if (!pending.length) return { ingested: 0, skipped: "No pending knowledge sources." };
      const results: Array<{ id: string; status: string; error?: string }> = [];
      for (const { id } of pending) {
        try {
          await ingestSource(id);
          results.push({ id, status: "ingested" });
        } catch (cause) {
          results.push({ id, status: "failed", error: cause instanceof Error ? cause.message.slice(0, 200) : String(cause) });
        }
      }
      return {
        ingested: results.filter((r) => r.status === "ingested").length,
        failed: results.filter((r) => r.status === "failed").length,
        results,
      };
    } catch (cause) {
      return { error: cause instanceof Error ? cause.message : String(cause) };
    }
  }

  async listShowcase() {
    const rows = (await this.database.execute(`
      SELECT booth.id, org.name AS company_name, booth.booth_name, booth.booth_number,
        booth.description, booth.website, booth.contact_email, booth.contact_phone,
        booth.social_links, credential.public_token
      FROM event_exhibitors booth
      JOIN organizations org ON org.id = booth.organization_id
      LEFT JOIN LATERAL (
        SELECT qr.public_token
        FROM booth_qr_credentials qr
        WHERE qr.event_exhibitor_id = booth.id AND qr.active
        ORDER BY qr.created_at DESC LIMIT 1
      ) credential ON true
      WHERE booth.status = 'ready'
        AND EXISTS (SELECT 1 FROM events ev WHERE ev.id = booth.event_id AND ev.status IN ('published','live'))
      ORDER BY org.name ASC
    `)) as unknown as Array<{
      id: string;
      company_name: string;
      booth_name: string;
      booth_number: string | null;
      description: string | null;
      website: string | null;
      contact_email: string | null;
      contact_phone: string | null;
      social_links: Record<string, string> | null;
      public_token: string | null;
    }>;

    const result: Array<{
      id: string;
      companyName: string;
      boothName: string;
      boothNumber: string | null;
      industry: string;
      tagline: string;
      description: string;
      logoUrl: string | null;
      website: string;
      contactEmail: string;
      contactPhone: string | null;
      socialLinks: Record<string, string>;
      products: string[];
      brochureUrl: string;
      publicQrToken: string | null;
    }> = [];

    for (const row of rows) {
      const booth = await this.findPublicBooth(row.public_token ?? "");
      const description = row.description ?? "";
      const overviewSections = description.split("\n");
      const industry = findByPrefix(overviewSections, "Industry:");
      const tagline = findByPrefix(overviewSections, "Tagline:");

      let products: string[] = [];
      let brochureUrl = "";
      if (booth) {
        for (const resource of booth.resources) {
          if (resource.sourceType === "faq" && resource.title.includes("overview")) {
            const firstKb = resource;
            const browse = await this.resourceContent(row.public_token ?? "", firstKb.id).catch(() => "");
            if (browse) {
              const productSection = browse.split("Products:")[1];
              if (productSection) {
                products = productSection
                  .split("\n")
                  .filter((l) => l.trim().startsWith("-"))
                  .map((l) => l.replace(/^-\s*/, "").trim());
              }
              const foundIndustry = findByPrefix(browse.split("\n"), "Industry:");
              const foundTagline = findByPrefix(browse.split("\n"), "Tagline:");
              if (foundIndustry && !industry) {
                products = [industry || foundIndustry]; // fallback
              }
            }
          }
          if (resource.sourceType === "brochure") {
            brochureUrl = resource.href;
          }
        }
      }

      result.push({
        id: row.id,
        companyName: row.company_name,
        boothName: row.booth_name,
        boothNumber: row.booth_number,
        industry: industry ?? "General",
        tagline: tagline ?? row.company_name,
        description: description || row.company_name,
        logoUrl: null,
        website: row.website ?? `https://${row.company_name.toLowerCase().replace(/[^a-z0-9]/g, "-")}.example.com`,
        contactEmail: row.contact_email ?? "",
        contactPhone: row.contact_phone,
        socialLinks: (row.social_links ?? {}) as Record<string, string>,
        brochureUrl: brochureUrl || "#",
        products: products.length > 0 ? products : ["Enterprise platform"],
        publicQrToken: row.public_token,
      });
    }

    return result;
  }

  private async findPublicBooth(publicQrToken: string) {
    if (!publicQrToken) return null;
    const rows = await this.database.execute(sql<{
      id: string;
      company_name: string;
      booth_name: string;
      booth_number: string | null;
      logo_url: string | null;
      description: string | null;
      website: string | null;
      event_slug: string;
      privacy_policy_url: string | null;
    }>`
      SELECT booth.id, organization.name AS company_name, booth.booth_name,
        booth.booth_number, booth.logo_url, booth.description, booth.website,
        event.slug AS event_slug, event.privacy_policy_url
      FROM booth_qr_credentials credential
      JOIN event_exhibitors booth ON booth.id = credential.event_exhibitor_id
      JOIN organizations organization ON organization.id = booth.organization_id
      JOIN events event ON event.id = booth.event_id
      WHERE credential.public_token = ${publicQrToken} AND credential.active
        AND booth.status = 'ready' AND event.status IN ('published','live')
      LIMIT 1
    `);
    const booth = (
      rows as unknown as Array<{
        id: string;
        company_name: string;
        booth_name: string;
        booth_number: string | null;
        logo_url: string | null;
        description: string | null;
        website: string | null;
        event_slug: string;
        privacy_policy_url: string | null;
      }>
    )[0];
    if (!booth) return null;

    const [resourceRows] = await Promise.all([
      this.database.execute(sql<{
        id: string;
        title: string;
        source_type: string;
        source_url: string | null;
        file_id: string | null;
      }>`
        SELECT id, title, source_type, source_url, file_id
        FROM kb_sources
        WHERE event_exhibitor_id = ${booth.id} AND status = 'indexed'
        ORDER BY created_at DESC
      `),
    ]);
    const resources = (
      resourceRows as unknown as Array<{
        id: string;
        title: string;
        source_type: string;
        source_url: string | null;
        file_id: string | null;
      }>
    ).map((resource) => ({
      id: resource.id,
      title: resource.title,
      sourceType: resource.source_type,
      href:
        resource.source_url ??
        `/v1/public/booths/${encodeURIComponent(publicQrToken)}/resources/${resource.id}`,
      external: Boolean(resource.source_url),
    }));
    return { booth, resources };
  }

  private async resourceContent(publicQrToken: string, sourceId: string) {
    const booth = await this.scope(publicQrToken);
    const rows = await this.database.execute(sql<{ storage_key: string; raw_text: string | null }>`
      SELECT file.storage_key, doc.raw_text
      FROM kb_sources source
      JOIN files file ON file.id = source.file_id
      LEFT JOIN kb_documents doc ON doc.kb_source_id = source.id
      WHERE source.id = ${sourceId} AND source.event_exhibitor_id = ${booth.id}
        AND source.status = 'indexed'
      LIMIT 1
    `);
    const row = (rows as unknown as Array<{ storage_key: string; raw_text: string | null }>)[0];
    if (row?.raw_text) return row.raw_text;
    if (row?.storage_key) {
      const { data, error } = await this.storage()
        .storage.from("uploads")
        .createSignedUrl(row.storage_key, 60);
      if (!error && data?.signedUrl) {
        const response = await fetch(data.signedUrl);
        if (response.ok) return response.text();
      }
    }
    return "";
  }

  private async scope(publicQrToken: string): Promise<{ id: string; event_id: string; organization_id: string; public_token: string }> {
    const rows = await this.database.execute(sql<{ id: string; event_id: string; organization_id: string; public_token: string }>`
      SELECT booth.id, booth.event_id, booth.organization_id, credential.public_token
      FROM booth_qr_credentials credential
      JOIN event_exhibitors booth ON booth.id = credential.event_exhibitor_id
      JOIN events event ON event.id = booth.event_id
      WHERE credential.public_token = ${publicQrToken} AND credential.active
        AND booth.status = 'ready' AND event.status IN ('published','live') LIMIT 1
    `);
    const booth = (rows as unknown as Array<{ id: string; event_id: string; organization_id: string; public_token: string }>)[0];
    if (!booth) throw new NotFoundException("Booth not found.");
    return booth;
  }

  private storage() {
    const url = this.config.get<string>("supabase.url");
    const key = this.config.get<string>("supabase.serviceRoleKey");
    if (!url || !key) throw new Error("Supabase configuration is missing.");
    return createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
}

function findByPrefix(lines: string[], prefix: string): string | null {
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith(prefix)) {
      return trimmed.slice(prefix.length).trim();
    }
  }
  return null;
}

function exhibitorRow(row: ExhibitorRow) {
  return {
    id: row.id,
    organizationId: row.organization_id,
    companyName: row.company_name,
    boothName: row.booth_name,
    boothNumber: row.booth_number,
    logoUrl: row.logo_url,
    description: row.description,
    website: row.website,
    socialLinks: (row.social_links ?? {}) as Record<string, string>,
    contactEmail: row.contact_email,
    contactPhone: row.contact_phone,
  };
}

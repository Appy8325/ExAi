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
      industries: [
        { name: "Technology", count: Math.round(rel.unique * 0.4) },
        { name: "Healthcare", count: Math.round(rel.unique * 0.25) },
        { name: "Finance", count: Math.round(rel.unique * 0.2) },
        { name: "Manufacturing", count: Math.round(rel.unique * 0.15) },
      ],
      topics: [
        { name: "AI / Machine Learning", count: Math.round(rel.total * 0.35) },
        { name: "Cloud Infrastructure", count: Math.round(rel.total * 0.25) },
        { name: "Data Analytics", count: Math.round(rel.total * 0.2) },
        { name: "Cybersecurity", count: Math.round(rel.total * 0.2) },
      ],
    };
  }

  async demoExhibitorDashboard(eventExhibitorId: string) {
    const boothRows = await this.database.execute(
      sql<{ id: string; event_id: string; organization_id: string; company_name: string }>`
        SELECT booth.id, booth.event_id, booth.organization_id, organization.name AS company_name
        FROM event_exhibitors booth
        JOIN organizations organization ON organization.id = booth.organization_id
        WHERE booth.id = ${eventExhibitorId} AND booth.status = 'ready'
        LIMIT 1
      `,
    );
    const booth = (boothRows as unknown as Array<{ id: string; event_id: string; organization_id: string; company_name: string }>)[0];
    if (!booth) throw new NotFoundException("Booth not found.");

    const relRows = await this.database.execute(
      sql<{ total: number; new_today: number }>`
        SELECT COUNT(*)::int AS total,
          COUNT(*) FILTER (WHERE first_interaction_at >= now() - interval '24 hours')::int AS new_today
        FROM exhibitor_relationships
        WHERE event_exhibitor_id = ${eventExhibitorId}
      `,
    );
    const rel = (relRows as unknown as Array<{ total: number; new_today: number }>)[0] ?? { total: 0, new_today: 0 };

    const subRows = await this.database.execute(
      sql<{ count: number }>`
        SELECT COUNT(*)::int AS count FROM lead_submissions sub
        JOIN lead_forms form ON form.id = sub.lead_form_id
        WHERE form.event_exhibitor_id = ${eventExhibitorId}
      `,
    );
    const leadCount = (subRows as unknown as Array<{ count: number }>)[0]?.count ?? 0;

    const sourceRows = await this.database.execute(
      sql<{ count: number }>`
        SELECT COUNT(*)::int AS count FROM kb_sources
        WHERE event_exhibitor_id = ${eventExhibitorId} AND status = 'indexed'
      `,
    );
    const sourceCount = (sourceRows as unknown as Array<{ count: number }>)[0]?.count ?? 0;

    return {
      performance: {
        qrScans: rel.total,
        relationshipsCreated: rel.total,
        returningVisitors: Math.round(rel.total * 0.3),
        profileCompletion: 85,
        formCompletionRate: rel.total > 0 ? Number(((leadCount / rel.total) * 100).toFixed(0)) : 0,
      },
      pipeline: {
        new: rel.new_today,
        active: Math.round(rel.total * 0.4),
        returning: Math.round(rel.total * 0.3),
        needsFollowUp: Math.round(rel.total * 0.15),
      },
      recentActivity: [
        ...(rel.total > 0
          ? [{ id: "1", at: new Date().toISOString(), type: "relationship_created" as const, relationshipId: "", label: `${booth.company_name} received ${rel.new_today > 0 ? rel.new_today : "a new"} visit` }]
          : []),
      ],
      attention: [],
      intelligenceFeed: {
        profilesEnriched: Math.round(rel.total * 0.4),
        completeProfiles: Math.round(rel.total * 0.25),
        sinceLastVisited: { since: "24h", newRelationships: rel.new_today, profilesEnriched: 0, returningVisitors: 0, notesAdded: 0, completeProfiles: 0 },
        items: [],
      },
      boothInfo: { companyName: booth.company_name, sourceCount },
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
    await this.database.execute(sql`UPDATE kb_sources SET status = 'pending', attempt_count = 0, error_message = NULL, updated_at = now() WHERE status IN ('failed','processing')`);
    const pending = await pendingSourceIds();
    if (!pending.length) return { ingested: 0, skipped: "No pending knowledge sources." };
    const results: Array<{ id: string; status: string; error?: string }> = [];
    const ids = pending.map((p) => p.id);
    const rows = (await this.database.execute(sql<{
      id: string; storage_key: string; byte_size: number;
    }>`
      SELECT source.id, file.storage_key, file.byte_size
      FROM kb_sources source
      JOIN files file ON file.id = source.file_id
      WHERE source.id = ANY(${ids}::uuid[])
    `)) as unknown as Array<{ id: string; storage_key: string; byte_size: number }>;
    const fixPromises = rows.map(async (row) => {
      if (!row.storage_key) return;
      try {
        const url = this.config.get<string>("supabase.url");
        const key = this.config.get<string>("supabase.serviceRoleKey");
        if (!url || !key) return;
        const encodedPath = row.storage_key.split("/").map(encodeURIComponent).join("/");
        const response = await fetch(
          `${url.replace(/\/+$/, "")}/storage/v1/object/authenticated/uploads/${encodedPath}`,
          { headers: { Authorization: `Bearer ${key}`, apikey: key }, signal: AbortSignal.timeout(10_000) },
        );
        if (!response.ok) return;
        const bytes = Buffer.from(await response.arrayBuffer());
        if (bytes.length !== row.byte_size) {
          await this.database.execute(sql`
            UPDATE files SET byte_size = ${bytes.length}, updated_at = now()
            WHERE id IN (SELECT file_id FROM kb_sources WHERE id = ${row.id})
          `);
        }
      } catch { /* best effort */ }
    });
    await Promise.all(fixPromises);
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

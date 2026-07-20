import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { sql } from "drizzle-orm";
import {
  DATABASE_CLIENT,
  type DatabaseClient,
} from "../../common/database-client";

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

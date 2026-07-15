import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { sql } from "drizzle-orm";
import { DATABASE_CLIENT, type DatabaseClient } from "../../common/database-client";

type ExhibitorRow = {
  id: string;
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
  constructor(@Inject(DATABASE_CLIENT) private readonly database: DatabaseClient) {}

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
      SELECT booth.id, organization.name AS company_name, booth.booth_name,
        booth.booth_number, booth.logo_url, booth.description, booth.website,
        booth.social_links, booth.contact_email, booth.contact_phone
      FROM event_exhibitors booth
      JOIN organizations organization ON organization.id = booth.organization_id
      WHERE booth.event_id = ${eventId}
        AND booth.status NOT IN ('archived','withdrawn')
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
        SELECT booth.id, organization.name AS company_name, booth.booth_name,
          booth.booth_number, booth.logo_url, booth.description, booth.website,
          booth.social_links, booth.contact_email, booth.contact_phone
        FROM event_exhibitors booth
        JOIN organizations organization ON organization.id = booth.organization_id
        WHERE booth.event_id = ${eventId}
          AND booth.id = ${exhibitorId}
          AND booth.status NOT IN ('archived','withdrawn')
        LIMIT 1
      `,
    );
    const row = (rows as unknown as ExhibitorRow[])[0];
    if (!row) throw new NotFoundException("Exhibitor not found.");
    return exhibitorRow(row);
  }
}

function exhibitorRow(row: ExhibitorRow) {
  return {
    id: row.id,
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

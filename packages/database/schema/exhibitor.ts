import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { events } from "./events-floor";
import { organizations } from "./identity";

const uuidv7 = sql`concourse.uuid_generate_v7()`;

export const eventExhibitors = pgTable(
  "event_exhibitors",
  {
    id: uuid("id").primaryKey().default(uuidv7),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    organizerOrganizationId: uuid("organizer_organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    boothName: text("booth_name").notNull(),
    boothNumber: text("booth_number"),
    logoUrl: text("logo_url"),
    description: text("description"),
    website: text("website"),
    contactEmail: text("contact_email"),
    contactPhone: text("contact_phone"),
    socialLinks: jsonb("social_links")
      .notNull()
      .default(sql`'{}'::jsonb`),
    primaryColor: text("primary_color").notNull().default("#2563eb"),
    bannerUrl: text("banner_url"),
    status: text("status").notNull().default("accepted"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    eventOrganizationUnique: uniqueIndex(
      "event_exhibitors_event_organization_key",
    ).on(table.eventId, table.organizationId),
    eventBoothNumberUnique: uniqueIndex(
      "event_exhibitors_event_booth_number_key",
    )
      .on(table.eventId, table.boothNumber)
      .where(sql`${table.boothNumber} IS NOT NULL`),
    eventIdx: index("event_exhibitors_event_id_idx").on(table.eventId),
    organizationIdx: index("event_exhibitors_organization_id_idx").on(
      table.organizationId,
    ),
    organizerIdx: index("event_exhibitors_organizer_organization_id_idx").on(
      table.organizerOrganizationId,
    ),
    statusCheck: check(
      "event_exhibitors_status_check",
      sql`${table.status} IN ('invited','accepted','profile_complete','ready','withdrawn','archived')`,
    ),
  }),
);

export const boothQrCredentials = pgTable(
  "booth_qr_credentials",
  {
    id: uuid("id").primaryKey().default(uuidv7),
    eventExhibitorId: uuid("event_exhibitor_id")
      .notNull()
      .references(() => eventExhibitors.id, { onDelete: "cascade" }),
    publicToken: text("public_token").notNull(),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
  },
  (table) => ({
    tokenUnique: uniqueIndex("booth_qr_credentials_public_token_key").on(
      table.publicToken,
    ),
    activeBoothUnique: uniqueIndex("booth_qr_credentials_active_booth_key")
      .on(table.eventExhibitorId)
      .where(sql`${table.active}`),
  }),
);

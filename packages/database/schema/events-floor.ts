import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { organizations } from "./identity";

const uuidv7 = sql`concourse.uuid_generate_v7()`;

export const events = pgTable(
  "events",
  {
    id: uuid("id").primaryKey().default(uuidv7),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    timezone: text("timezone").notNull(),
    startAt: timestamp("start_at", { withTimezone: true }).notNull(),
    endAt: timestamp("end_at", { withTimezone: true }).notNull(),
    privacyPolicyUrl: text("privacy_policy_url"),
    logoUrl: text("logo_url"),
    primaryColor: text("primary_color").notNull().default("#4f46e5"),
    status: text("status").notNull().default("draft"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    organizationSlugUnique: uniqueIndex("events_organization_slug_key").on(
      table.organizationId,
      table.slug,
    ),
    organizationStatusIdx: index("events_organization_status_idx").on(
      table.organizationId,
      table.status,
    ),
    statusCheck: check(
      "events_status_check",
      sql`${table.status} IN ('draft','published','live','completed','archived')`,
    ),
    dateRangeCheck: check(
      "events_date_range_check",
      sql`${table.endAt} > ${table.startAt}`,
    ),
    primaryColorCheck: check(
      "events_primary_color_check",
      sql`${table.primaryColor} ~ '^#[0-9a-fA-F]{6}$'`,
    ),
  }),
);

export const agendaSessions = pgTable(
  "agenda_sessions",
  {
    id: uuid("id").primaryKey().default(uuidv7),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    startAt: timestamp("start_at", { withTimezone: true }).notNull(),
    endAt: timestamp("end_at", { withTimezone: true }).notNull(),
    timezone: text("timezone").notNull(),
    room: text("room"),
    capacity: integer("capacity"),
    status: text("status").notNull().default("draft"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    eventSlugUnique: uniqueIndex("agenda_sessions_event_slug_key").on(
      table.eventId,
      table.slug,
    ),
    eventStartIdx: index("agenda_sessions_event_start_at_idx").on(
      table.eventId,
      table.startAt,
    ),
    statusCheck: check(
      "agenda_sessions_status_check",
      sql`${table.status} IN ('draft','published','archived')`,
    ),
    dateRangeCheck: check(
      "agenda_sessions_date_range_check",
      sql`${table.endAt} > ${table.startAt}`,
    ),
    capacityCheck: check(
      "agenda_sessions_capacity_check",
      sql`${table.capacity} IS NULL OR ${table.capacity} >= 0`,
    ),
  }),
);

export const speakers = pgTable(
  "speakers",
  {
    id: uuid("id").primaryKey().default(uuidv7),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    bio: text("bio"),
    photoUrl: text("photo_url"),
    company: text("company"),
    title: text("title"),
    socialLinks: jsonb("social_links").default([]),
    sortOrder: integer("sort_order"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    eventNameUnique: uniqueIndex("speakers_event_name_key").on(
      table.eventId,
      table.name,
    ),
    eventIdx: index("speakers_event_idx").on(table.eventId),
  }),
);

export const sessionSpeakers = pgTable(
  "session_speakers",
  {
    sessionId: uuid("session_id")
      .notNull()
      .references(() => agendaSessions.id, { onDelete: "cascade" }),
    speakerId: uuid("speaker_id")
      .notNull()
      .references(() => speakers.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.sessionId, table.speakerId] }),
  }),
);

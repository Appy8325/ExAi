import { sql } from "drizzle-orm";
import {
  check,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { events } from "./events-floor";
import { eventExhibitors } from "./exhibitor";
import { organizations } from "./identity";
import { files } from "./platform";

const uuidv7 = sql`concourse.uuid_generate_v7()`;

export const kbSources = pgTable(
  "kb_sources",
  {
    id: uuid("id").primaryKey().default(uuidv7),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    eventExhibitorId: uuid("event_exhibitor_id")
      .notNull()
      .references(() => eventExhibitors.id, { onDelete: "cascade" }),
    organizerOrganizationId: uuid("organizer_organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    ownerOrganizationId: uuid("owner_organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    kind: text("kind").notNull(),
    sourceType: text("source_type").notNull(),
    title: text("title").notNull(),
    sourceUrl: text("source_url"),
    fileId: uuid("file_id").references(() => files.id, {
      onDelete: "set null",
    }),
    status: text("status").notNull().default("pending"),
    lastIngestedAt: timestamp("last_ingested_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    eventIdx: index("kb_sources_event_id_idx").on(table.eventId),
    boothIdx: index("kb_sources_event_exhibitor_id_idx").on(
      table.eventExhibitorId,
    ),
    organizerIdx: index("kb_sources_organizer_organization_id_idx").on(
      table.organizerOrganizationId,
    ),
    ownerIdx: index("kb_sources_owner_organization_id_idx").on(
      table.ownerOrganizationId,
    ),
    kindCheck: check(
      "kb_sources_kind_check",
      sql`${table.kind} IN ('uploaded_document','external_url')`,
    ),
    typeCheck: check(
      "kb_sources_source_type_check",
      sql`${table.sourceType} IN ('pdf','brochure','presentation','website','faq','pricing')`,
    ),
    statusCheck: check(
      "kb_sources_status_check",
      sql`${table.status} IN ('pending','processing','indexed','failed','quarantined')`,
    ),
  }),
);

// Full schema per docs/16-database-schema.md / docs/21-ai-architecture.md
// (kb_chunks with vector(1024) embeddings, ai_conversations, ai_messages,
// ai_usage_events, ...), implemented in a later milestone. Minimal
// placeholder table demonstrating the pattern only — pgvector columns
// land with the real KB ingestion milestone, not here.
export const kbChunks = pgTable("kb_chunks", {
  id: uuid("id").primaryKey().defaultRandom(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

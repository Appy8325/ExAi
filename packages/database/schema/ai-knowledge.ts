import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  vector,
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
    errorMessage: text("error_message"),
    attemptCount: integer("attempt_count").notNull().default(0),
    contentHash: text("content_hash"),
    processingStartedAt: timestamp("processing_started_at", {
      withTimezone: true,
    }),
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
export const kbDocuments = pgTable(
  "kb_documents",
  {
    id: uuid("id").primaryKey().default(uuidv7),
    kbSourceId: uuid("kb_source_id").notNull().references(() => kbSources.id, { onDelete: "cascade" }),
    eventId: uuid("event_id").notNull(),
    organizerOrganizationId: uuid("organizer_organization_id").notNull(),
    ownerOrganizationId: uuid("owner_organization_id").notNull(),
    title: text("title").notNull(),
    rawText: text("raw_text"),
    status: text("status").notNull().default("pending"),
    quarantineReason: text("quarantine_reason"),
    indexedAt: timestamp("indexed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    sourceIdx: index("kb_documents_source_id_idx").on(table.kbSourceId),
    eventStatusIdx: index("kb_documents_event_status_idx").on(table.eventId, table.status),
    statusCheck: check("kb_documents_status_check", sql`${table.status} IN ('pending','processing','indexed','quarantined','failed')`),
  }),
);

export const kbChunks = pgTable(
  "kb_chunks",
  {
    id: uuid("id").primaryKey().default(uuidv7),
    kbDocumentId: uuid("kb_document_id").notNull().references(() => kbDocuments.id, { onDelete: "cascade" }),
    eventId: uuid("event_id").notNull(),
    organizerOrganizationId: uuid("organizer_organization_id").notNull(),
    ownerOrganizationId: uuid("owner_organization_id").notNull(),
    chunkIndex: integer("chunk_index").notNull(),
    content: text("content").notNull(),
    embedding: vector("embedding", { dimensions: 1024 }).notNull(),
    tokenCount: integer("token_count").notNull(),
    visibility: text("visibility").notNull().default("public"),
    metadata: jsonb("metadata").notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    documentChunkUnique: uniqueIndex("kb_chunks_document_chunk_key").on(table.kbDocumentId, table.chunkIndex),
    eventVisibilityIdx: index("kb_chunks_event_visibility_idx").on(table.eventId, table.visibility),
    visibilityCheck: check("kb_chunks_visibility_check", sql`${table.visibility} IN ('public','exhibitor_internal','organizer_internal')`),
  }),
);

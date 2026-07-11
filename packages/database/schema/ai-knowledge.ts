import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';

// Full schema per docs/16-database-schema.md / docs/21-ai-architecture.md
// (kb_chunks with vector(1024) embeddings, ai_conversations, ai_messages,
// ai_usage_events, ...), implemented in a later milestone. Minimal
// placeholder table demonstrating the pattern only — pgvector columns
// land with the real KB ingestion milestone, not here.
export const kbChunks = pgTable('kb_chunks', {
  id: uuid('id').primaryKey().defaultRandom(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

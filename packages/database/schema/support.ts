import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';

// Full schema per docs/16-database-schema.md / docs/30-help-center-and-
// support.md (help_categories, help_articles, legal_documents,
// legal_acceptances, ...), implemented in a later milestone. Minimal
// placeholder table demonstrating the pattern only.
export const helpArticles = pgTable('help_articles', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

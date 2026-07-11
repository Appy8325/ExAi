import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';

// Full schema per docs/16-database-schema.md (subscriptions,
// entitlements, background_jobs, dead_letter_jobs, ...), implemented in
// a later milestone. Minimal placeholder table demonstrating the pattern
// only.
export const entitlements = pgTable('entitlements', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull(),
  key: text('key').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

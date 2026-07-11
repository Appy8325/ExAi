import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';

// Full schema per docs/16-database-schema.md (exhibitor-owned tables:
// event_product_listings, exhibitor_staff, ...), implemented in a later
// milestone. Minimal placeholder table demonstrating the pattern only.
export const exhibitorProfiles = pgTable('exhibitor_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull(),
  headline: text('headline'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

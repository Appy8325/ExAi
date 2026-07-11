import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';

// Full schema per docs/16-database-schema.md (leads, meetings,
// booth_visits, lead_notes, ...), implemented in a later milestone.
// Minimal placeholder table demonstrating the pattern only.
export const boothVisits = pgTable('booth_visits', {
  id: uuid('id').primaryKey().defaultRandom(),
  boothId: uuid('booth_id').notNull(),
  note: text('note'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

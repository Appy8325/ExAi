import { sql } from "drizzle-orm";
import {
  bigint,
  check,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { organizations, users } from "./identity";

const uuidv7 = sql`concourse.uuid_generate_v7()`;

export const files = pgTable(
  "files",
  {
    id: uuid("id").primaryKey().default(uuidv7),
    organizationId: uuid("organization_id").references(() => organizations.id, {
      onDelete: "cascade",
    }),
    uploadedByUserId: uuid("uploaded_by_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    ownerType: text("owner_type"),
    ownerId: uuid("owner_id"),
    purpose: text("purpose").notNull(),
    storageKey: text("storage_key").notNull(),
    contentType: text("content_type").notNull(),
    byteSize: bigint("byte_size", { mode: "number" }).notNull(),
    checksumSha256: text("checksum_sha256"),
    status: text("status").notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    storageKeyUnique: uniqueIndex("files_storage_key_key").on(table.storageKey),
    organizationIdx: index("files_organization_id_idx").on(
      table.organizationId,
    ),
    ownerIdx: index("files_owner_idx").on(table.ownerType, table.ownerId),
    statusCheck: check(
      "files_status_check",
      sql`${table.status} IN ('pending','scanning','clean','infected','failed')`,
    ),
  }),
);

// Full schema per docs/16-database-schema.md (subscriptions,
// entitlements, background_jobs, dead_letter_jobs, ...), implemented in
// a later milestone. Minimal placeholder table demonstrating the pattern
// only.
export const entitlements = pgTable("entitlements", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull(),
  key: text("key").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

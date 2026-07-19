import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { eventExhibitors } from "./exhibitor";
import { events } from "./events-floor";
import { organizations, users } from "./identity";
const uuidv7 = sql`concourse.uuid_generate_v7()`;
export const leadForms = pgTable(
  "lead_forms",
  {
    id: uuid("id").primaryKey().default(uuidv7),
    eventExhibitorId: uuid("event_exhibitor_id")
      .notNull()
      .references(() => eventExhibitors.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    consentText: text("consent_text"),
    version: integer("version").notNull().default(1),
    isDefault: boolean("is_default").notNull().default(false),
    status: text("status").notNull().default("draft"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    nameUnique: uniqueIndex("lead_forms_exhibitor_name_version_key").on(
      t.eventExhibitorId,
      t.name,
      t.version,
    ),
    exhibitorIdx: index("lead_forms_event_exhibitor_id_idx").on(
      t.eventExhibitorId,
    ),
    statusCheck: check(
      "lead_forms_status_check",
      sql`${t.status} IN ('draft','published','archived')`,
    ),
  }),
);
export const leadFormFields = pgTable(
  "lead_form_fields",
  {
    id: uuid("id").primaryKey().default(uuidv7),
    leadFormId: uuid("lead_form_id")
      .notNull()
      .references(() => leadForms.id, { onDelete: "cascade" }),
    key: text("key").notNull(),
    label: text("label").notNull(),
    type: text("type").notNull(),
    required: boolean("required").notNull().default(false),
    placeholder: text("placeholder"),
    defaultValue: jsonb("default_value"),
    validation: jsonb("validation")
      .notNull()
      .default(sql`'{}'::jsonb`),
    sortOrder: integer("sort_order").notNull(),
    helpText: text("help_text"),
    visibilityCondition: jsonb("visibility_condition"),
    status: text("status").notNull().default("active"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    keyUnique: uniqueIndex("lead_form_fields_form_key_key").on(
      t.leadFormId,
      t.key,
    ),
    orderUnique: uniqueIndex("lead_form_fields_form_order_key").on(
      t.leadFormId,
      t.sortOrder,
    ),
    formIdx: index("lead_form_fields_lead_form_id_idx").on(t.leadFormId),
    statusCheck: check(
      "lead_form_fields_status_check",
      sql`${t.status} IN ('active','archived')`,
    ),
  }),
);
export const leadSubmissions = pgTable(
  "lead_submissions",
  {
    id: uuid("id").primaryKey().default(uuidv7),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    eventExhibitorId: uuid("event_exhibitor_id")
      .notNull()
      .references(() => eventExhibitors.id, { onDelete: "cascade" }),
    attendeeUserId: uuid("attendee_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    relationshipId: uuid("relationship_id").references(
      () => exhibitorRelationships.id,
      { onDelete: "restrict" },
    ),
    leadFormId: uuid("lead_form_id")
      .notNull()
      .references(() => leadForms.id, { onDelete: "restrict" }),
    idempotencyKey: text("idempotency_key")
      .notNull()
      .default(sql`concourse.uuid_generate_v7()::text`),
    interactionSource: text("interaction_source").notNull(),
    potentialDuplicate: boolean("potential_duplicate").notNull().default(false),
    submittedAt: timestamp("submitted_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    relationshipIdx: index("lead_submissions_relationship_submitted_at_idx").on(
      t.relationshipId,
      t.submittedAt,
    ),
    idempotencyUnique: uniqueIndex(
      "lead_submissions_exhibitor_idempotency_key",
    ).on(t.eventExhibitorId, t.idempotencyKey),
    exhibitorSubmittedIdx: index(
      "lead_submissions_exhibitor_submitted_at_idx",
    ).on(t.eventExhibitorId, t.submittedAt),
    duplicateIdx: index("lead_submissions_exhibitor_attendee_idx").on(
      t.eventExhibitorId,
      t.attendeeUserId,
    ),
    sourceCheck: check(
      "lead_submissions_interaction_source_check",
      sql`${t.interactionSource} IN ('visitor_qr','exhibitor_device')`,
    ),
  }),
);
export const leadSubmissionValues = pgTable(
  "lead_submission_values",
  {
    id: uuid("id").primaryKey().default(uuidv7),
    leadSubmissionId: uuid("lead_submission_id")
      .notNull()
      .references(() => leadSubmissions.id, { onDelete: "cascade" }),
    leadFormFieldId: uuid("lead_form_field_id")
      .notNull()
      .references(() => leadFormFields.id, { onDelete: "restrict" }),
    value: jsonb("value"),
    fieldSnapshot: jsonb("field_snapshot").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    submissionFieldUnique: uniqueIndex(
      "lead_submission_values_submission_field_key",
    ).on(t.leadSubmissionId, t.leadFormFieldId),
    submissionIdx: index("lead_submission_values_submission_id_idx").on(
      t.leadSubmissionId,
    ),
  }),
);
export const leadIntelligence = pgTable(
  "lead_intelligence",
  {
    id: uuid("id").primaryKey().default(uuidv7),
    leadSubmissionId: uuid("lead_submission_id")
      .notNull()
      .references(() => leadSubmissions.id, { onDelete: "cascade" }),
    eventExhibitorId: uuid("event_exhibitor_id")
      .notNull()
      .references(() => eventExhibitors.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("processing"),
    leadScore: integer("lead_score"),
    buyingIntent: text("buying_intent"),
    summary: text("summary"),
    topicsDiscussed: jsonb("topics_discussed").notNull().default([]),
    followUpRecommendation: text("follow_up_recommendation"),
    suggestedEmail: text("suggested_email"),
    evidenceIds: jsonb("evidence_ids").notNull().default([]),
    confidence: integer("confidence"),
    model: text("model"),
    promptId: text("prompt_id").notNull().default("lead.intelligence.v1"),
    errorMessage: text("error_message"),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    submissionUnique: uniqueIndex("lead_intelligence_submission_key").on(
      t.leadSubmissionId,
    ),
    exhibitorStatusIdx: index("lead_intelligence_exhibitor_status_idx").on(
      t.eventExhibitorId,
      t.status,
    ),
    statusCheck: check(
      "lead_intelligence_status_check",
      sql`${t.status} IN ('processing','complete','failed','not_available')`,
    ),
    scoreCheck: check(
      "lead_intelligence_score_check",
      sql`${t.leadScore} IS NULL OR ${t.leadScore} BETWEEN 0 AND 100`,
    ),
    intentCheck: check(
      "lead_intelligence_intent_check",
      sql`${t.buyingIntent} IS NULL OR ${t.buyingIntent} IN ('high','evaluating','browsing','not_relevant')`,
    ),
    confidenceCheck: check(
      "lead_intelligence_confidence_check",
      sql`${t.confidence} IS NULL OR ${t.confidence} BETWEEN 0 AND 100`,
    ),
  }),
);
export const organizerReports = pgTable(
  "organizer_reports",
  {
    id: uuid("id").primaryKey().default(uuidv7),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    organizerOrganizationId: uuid("organizer_organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    generatedByUserId: uuid("generated_by_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    idempotencyKey: text("idempotency_key").notNull(),
    status: text("status").notNull().default("processing"),
    content: text("content"),
    metricsSnapshot: jsonb("metrics_snapshot").notNull().default({}),
    model: text("model"),
    errorMessage: text("error_message"),
    generatedAt: timestamp("generated_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    idempotencyUnique: uniqueIndex(
      "organizer_reports_event_idempotency_key",
    ).on(t.eventId, t.idempotencyKey),
    eventGeneratedIdx: index("organizer_reports_event_generated_idx").on(
      t.eventId,
      t.generatedAt,
    ),
    statusCheck: check(
      "organizer_reports_status_check",
      sql`${t.status} IN ('processing','complete','failed')`,
    ),
  }),
);
export const exhibitorRelationships = pgTable(
  "exhibitor_relationships",
  {
    id: uuid("id").primaryKey().default(uuidv7),
    eventExhibitorId: uuid("event_exhibitor_id")
      .notNull()
      .references(() => eventExhibitors.id, { onDelete: "cascade" }),
    attendeeUserId: uuid("attendee_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("active"),
    firstInteractionAt: timestamp("first_interaction_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
    latestInteractionAt: timestamp("latest_interaction_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
    interactionCount: integer("interaction_count").notNull().default(0),
    hasPotentialDuplicate: boolean("has_potential_duplicate")
      .notNull()
      .default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    attendeeUnique: uniqueIndex(
      "exhibitor_relationships_exhibitor_attendee_key",
    ).on(t.eventExhibitorId, t.attendeeUserId),
    exhibitorIdx: index("exhibitor_relationships_exhibitor_updated_idx").on(
      t.eventExhibitorId,
      t.updatedAt,
    ),
    statusCheck: check(
      "exhibitor_relationships_status_check",
      sql`${t.status} IN ('active','archived')`,
    ),
  }),
);
export const exhibitorRelationshipNotes = pgTable(
  "exhibitor_relationship_notes",
  {
    id: uuid("id").primaryKey().default(uuidv7),
    relationshipId: uuid("relationship_id")
      .notNull()
      .references(() => exhibitorRelationships.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    status: text("status").notNull().default("active"),
    createdByUserId: uuid("created_by_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    relationshipIdx: index("exhibitor_relationship_notes_relationship_idx").on(
      t.relationshipId,
      t.createdAt,
    ),
    statusCheck: check(
      "exhibitor_relationship_notes_status_check",
      sql`${t.status} IN ('active','archived')`,
    ),
  }),
);

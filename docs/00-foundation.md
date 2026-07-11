# 00 — Blueprint Foundation (Canonical Decision Record)

> **Status:** Locked. **Blueprint frozen as Version 1.0 (2026-07-11, §14 Amendment A4).** Every other
> document in `/docs` MUST conform to the names, decisions, and conventions in this file. If a
> document needs to deviate, the deviation is proposed here first. This file is the single source
> of truth for cross-cutting decisions; other documents go deep on their own area and reference
> this file rather than restating it. Engineering-facing summaries: [BLUEPRINT_V1.md](BLUEPRINT_V1.md),
> [ENGINEERING_GUIDE.md](ENGINEERING_GUIDE.md), [IMPLEMENTATION_RULES.md](IMPLEMENTATION_RULES.md),
> [IMPLEMENTATION_PHASES.md](IMPLEMENTATION_PHASES.md).

---

## 1. Product Identity

- **Working name:** **Concourse** (codename; trademark/domain search pending — treat every use as replaceable via find-and-replace).
- **One-liner:** The AI-native trade show platform that turns every exhibitor visit into intelligence — for organizers, exhibitors, and attendees.
- **Category:** B2B SaaS, event technology (expo/trade-show operations + engagement + lead intelligence).
- **Positioning:** Where incumbents (Cvent, Swapcard, Bizzabo, Map Your Show) treat the expo floor as a badge-scan logistics problem, Concourse treats it as an intelligence problem: every interaction feeds a per-event knowledge graph that gives exhibitors qualified pipeline, attendees a personal guide, and organizers proof of event ROI.
- **Product principles (bind all UX and engineering decisions):**
  1. **Fast is the feature.** Sub-second perceived interactions; the floor has no patience for spinners.
  2. **Intelligence over records.** Never show raw data where we can show meaning.
  3. **One source of truth.** Every fact lives in exactly one place; everything else derives.
  4. **Works in a concrete hall.** Offline-tolerant by design; connectivity is an enhancement.
  5. **Earn enterprise trust.** Tenancy, permissions, and audit are foundations, not add-ons.
- **North-star metric:** **Qualified Connections per Event** — mutual, acted-upon exhibitor↔attendee connections (lead qualified by exhibitor AND attendee engagement reciprocated).

## 2. Locked Strategic Decisions (from the founder)

| # | Decision | Choice |
|---|----------|--------|
| D1 | Relationship to Snapsight | **Fully standalone.** No Snapsight dependency. Content-source integrations are designed generically (see Knowledge Base architecture) so any external content system could plug in later. Do not reference Snapsight in any other document. |
| D2 | Tech stack | **TypeScript monorepo** (registry in §6). |
| D3 | Mobile strategy | **PWA-first with a future-native architecture**: one responsive web codebase, installable PWA, offline-capable lead capture; the API and a shared typed client are designed so React Native apps can be added without API changes (see Future Expansion). |
| D4 | Business model | **Organizer license + exhibitor upsell.** Organizers pay per-event/annual SaaS licenses; exhibitors get a free baseline and buy premium tiers; attendees are always free. |
| D5 | Scale targets | Thousands of exhibitors and hundreds of thousands of attendees per event; multiple simultaneous events; long-term enterprise foundation, not an MVP. |

## 3. Personas (canonical names — use exactly these everywhere)

| Persona | Name | Role | Surface |
|---|---|---|---|
| Organizer admin | **Priya Sharma** | Event Director at a mid-market trade show producer | Organizer Console |
| Organizer staff | **Marcus Webb** | Event Operations Manager | Organizer Console |
| Exhibitor admin | **Elena Rodriguez** | Marketing Director at an exhibiting company | Exhibitor Portal |
| Exhibitor rep | **Jamal Carter** | Booth Sales Rep | Exhibitor Portal (mobile/PWA) |
| Attendee | **Sofia Lindqvist** | Procurement lead / buyer attending the show | Attendee App (mobile/PWA) |
| Internal | **Alex Kim** | Concourse Platform Admin | Platform Admin |

## 4. Business Model & Tier Names (canonical)

**Organizer plans** (per-event or annual license, billed via Stripe):
- `launch` — single event, core features, community support.
- `professional` — multi-event, analytics suite, matchmaking, priority support.
- `enterprise` — SSO/SAML, public API, custom domains, data residency options, SLA, dedicated support.

**Exhibitor tiers** (per event, upsold inside the Exhibitor Portal):
- `essentials` — free with booth: profile, product listings, basic lead capture, 3 staff seats.
- `growth` — paid: unlimited seats, Lead Intelligence (scoring + AI summaries), meeting scheduling, exports/CRM sync.
- `intelligence` — paid: everything in growth + Smart Matchmaking priority, Follow-up Studio, competitive benchmarks, real-time booth analytics.

**Attendees:** always free.

Entitlements are resolved through a `plans → subscriptions → entitlements` billing abstraction (see Database Schema and Permission Model) — features check entitlement keys, never plan names.

## 5. Platform Surfaces & URL Skeleton (canonical routes)

Single Next.js app, path-scoped surfaces. Tenant resolution is **path-based by slug** (custom domains are an `enterprise` feature in Future Expansion).

| Surface | Base path | Audience |
|---|---|---|
| Marketing site | `/` — public pages (home, pricing, about, contact, help center, legal); see §14 Amendments A1 | Public |
| Organizer Console | `/org/[orgSlug]/…` and `/org/[orgSlug]/events/[eventSlug]/…` | Priya, Marcus |
| Exhibitor Portal | `/exhibit/[orgSlug]/events/[eventSlug]/…` | Elena, Jamal |
| Attendee App | `/e/[eventSlug]/…` | Sofia |
| Platform Admin | `/admin/…` | Alex (internal only) |
| Auth | `/auth/…` (login, signup, invite, magic-link claim) | All |
| Public API | `api.concourse.app/v1/…` | Enterprise integrations |

Marketing site is the same Next.js app, rendered fully static/RSC at the edge (no auth, no tenant context) — routes: `/`, `/pricing`, `/about`, `/contact`, `/help` (public Help Center entry), `/legal/privacy`, `/legal/terms`. Full page-by-page architecture in [46-marketing-site.md](46-marketing-site.md); it consumes the plan/tier data already canonical in §4 rather than restating pricing numbers.

## 6. Technology Stack Registry (canonical versions & choices)

**Monorepo:** pnpm 9 workspaces + Turborepo 2 (remote caching in CI).

| Layer | Choice | Notes |
|---|---|---|
| Web app | **Next.js 15** (App Router, React 19, RSC-first) | Single app, all surfaces; PWA via service worker + web app manifest |
| Styling / UI | **Tailwind CSS 4 + Radix UI primitives** | Owned component library in `packages/ui` (shadcn-style: vendored, not dependency) |
| API service | **NestJS 11 on Fastify** | REST, OpenAPI 3.1 generated from decorators; source of truth for the API contract |
| Worker service | Node 22 + **BullMQ 5** consumers | Same NestJS module system, separate deployable |
| Database | **Supabase-managed PostgreSQL 15 + pgvector** (HNSW indexes) | Managed HA/backups via Supabase; §14 Amendment A5 supersedes the prior "RDS Multi-AZ" choice |
| ORM / migrations | **Drizzle ORM + drizzle-kit** | SQL-first; RLS-compatible; schema in `packages/database`; runs against the Supabase Postgres connection string unchanged |
| Auth | **Supabase Auth** (managed): email/password, magic links (attendees), OAuth (Google, Microsoft, LinkedIn), phone/passwordless where needed, native SAML/OIDC SSO (enterprise, milestone M4) | Supersedes the prior in-house NestJS auth module and WorkOS; JWT access/refresh tokens issued by Supabase, verified in `apps/api` middleware — supersedes the opaque-Redis-session model in doc 20 (§14 Amendment A5; docs 19–20 flagged pending detailed revision) |
| Realtime | **Supabase Realtime** (Postgres logical replication + broadcast/presence channels) | Supersedes the prior Socket.IO 4 gateway; rooms-per-event/booth pattern in doc 18 §7 is preserved, channel mechanism changes (§14 Amendment A5) |
| File storage | **Supabase Storage**, presigned uploads | Supersedes the prior S3 + CloudFront choice; tenant-prefixed keys and validation rules in doc 26 unchanged in spirit, mechanism updated (§14 Amendment A5) |
| Cache / queues / rate limits | **Redis 7** (managed) | BullMQ, pub/sub, rate limits — sessions no longer live here (Supabase Auth owns session tokens) |
| Validation | **Zod 3** shared schemas in `packages/shared` | One schema → API validation + client types + forms |
| AI — generation | **Claude API**: `claude-fable-5` (reasoning, generation), `claude-haiku-4-5` (classification, extraction) | Model routing in AI service module |
| AI — embeddings | **Voyage AI `voyage-3.5`** (1024-dim) + `rerank-2.5` | Stored in pgvector |
| Billing | **Stripe Billing** | Organizer subscriptions + exhibitor one-time/recurring upsells |
| Email | **AWS SES + React Email** templates | Via notification service only (single choke point); unaffected by the Supabase adoption |
| Push | Web Push (VAPID) | PWA notifications |
| Web hosting | **Vercel** | Preview deploys per PR |
| API/worker hosting | **AWS ECS Fargate** | us-east-1 primary; EU region in Future Expansion; Supabase project region pinned to match |
| IaC | **Terraform** | `infra/` directory |
| CI/CD | **GitHub Actions** + Turborepo affected-graph | Trunk-based, feature flags |
| Errors | **Sentry** (web + api + worker) | |
| Observability | **OpenTelemetry** → **Grafana Cloud** (Loki/Tempo/Mimir); logs via **pino** | |
| Product analytics | **PostHog** (also feature flags) | Event taxonomy in doc 32 |
| E2E / unit tests | **Playwright / Vitest**, Testcontainers for integration | Doc 42 |

## 7. Canonical Domain Model (entity registry)

Table names are `snake_case` plural. Every tenant-owned table carries `organization_id` (see §8). The Database Schema doc (16) owns column-level detail; these names and one-liners are canonical.

**Identity & tenancy**
- `organizations` — the tenant. `kind: organizer | exhibitor`. Exhibitor companies are global entities that participate in many events.
- `users` — global identity (one human, one row, across all orgs/events).
- `organization_memberships` — user↔organization with org role (`owner | admin | member`); `status: pending | active` (a `pending` row is an org-join request awaiting approval, doc 19 §5.2).
- `auth_sessions` — device sessions (opaque token, Redis-backed; table for audit/device list). `session_kind: standard | attendee | kiosk_attendee` governs absolute vs. sliding expiry (doc 20).
- `api_keys` — scoped keys for the public API (enterprise).
- `oauth_identities` — linked Google/Microsoft/LinkedIn sign-in identities per user (doc 19).
- `webauthn_credentials` — registered passkeys per user (doc 19).
- `auth_tokens` — single polymorphic table backing every single-use token (`invite | magic_link | verify_email | reset_password`, doc 19).

**Events & floor**
- `events` — a trade show edition, owned by an organizer org. Status: `draft | published | live | completed | archived`.
- `venues`, `floor_plans`, `booths` — physical layout; booths assignable to exhibitors.
- `event_staff` — organizer-side user assignments to an event (role: `admin | staff`).

**Exhibitor participation**
- `event_exhibitors` — exhibitor org ↔ event participation record (tier, booth, status). The pivot around which the exhibitor experience hangs.
- `exhibitor_staff` — user assignments to an `event_exhibitor` (role: `admin | rep`).
- `products` — exhibitor org's catalog (org-scoped, reusable across events).
- `event_product_listings` — which products an exhibitor shows at a given event.

**Attendees & engagement**
- `registrations` — user↔event attendee record; carries `badge_code` (QR). Status: `registered | checked_in | cancelled`.
- `attendee_interests` — declared + inferred interest tags per registration.
- `agenda_sessions` — conference talks/workshops within an event (note: never just “sessions” — avoids collision with auth sessions).
- `session_checkins` — attendance at agenda sessions.
- `booth_visits` — an attendee's presence at a booth (badge scan, QR self-scan, or dwell). Raw signal.
- `leads` — exhibitor-owned enriched record derived from a visit/interaction. Pipeline: `captured | qualified | contacted | meeting_booked | closed | disqualified`.
- `lead_notes` — rep notes (text/voice-transcribed) attached to leads.
- `meetings` — scheduled exhibitor↔attendee meetings (slots, location, status).
- `match_recommendations` — Smart Matchmaking output (attendee↔exhibitor scored pairs, with reasons).

**AI & knowledge**
- `kb_sources` — registered content sources per event (exhibitor profiles, products, agenda, uploaded docs, external URLs).
- `kb_documents` — normalized documents extracted from sources.
- `kb_chunks` — chunked, embedded content (pgvector column) with tenant/visibility metadata.
- `ai_conversations`, `ai_messages` — Expo Copilot and other assistant threads.
- `ai_usage_events` — per-call AI metering (feature, model, tokens, cost); doc 21 §6.1.

**Support & content**
- `help_categories`, `help_articles` — Help Center content (versioned, org-agnostic; public + in-app). No separate support-ticket entity in Phase 1 — escalation beyond self-serve routes through `notifications`/email to Alex, consistent with the "no bespoke incident entity" discipline in [05-organizer-journey.md](05-organizer-journey.md) O-8. Architecture in [30-help-center-and-support.md](30-help-center-and-support.md).

**Legal & compliance**
- `legal_documents` — versioned legal content records (`document_type: privacy | terms`, `version`, `effective_date`, `status: draft | published | superseded`); body text is counsel-authored and stored outside the database (see `files`/S3). No separate `contact_submissions` entity — the public contact form routes through `notifications`/email like Help Center escalation, same discipline as above. Architecture in [46-marketing-site.md](46-marketing-site.md).
- `legal_acceptances` — user↔`legal_documents` consent record captured at signup and other consent moments (which version was shown, when, in what context).

**Platform**
- `files` — uploaded asset registry (S3 keys, ownership, scan status).
- `notifications`, `notification_preferences` — see doc 33.
- `push_subscriptions` — Web Push (VAPID) subscriptions per user (doc 33).
- `plans`, `subscriptions`, `entitlements` — billing abstraction (Stripe-synced).
- `webhook_endpoints`, `webhook_deliveries` — outbound webhooks (enterprise).
- `audit_logs` — immutable admin/security-relevant actions.
- `domain_events` — transactional outbox (see Event Pipeline, doc 25).
- `background_jobs`, `dead_letter_jobs` — persisted BullMQ job records and terminal-failure projection (doc 27).

**Integrations**
- `crm_connections`, `crm_field_mappings`, `crm_sync_logs` — per-exhibitor CRM sync (Salesforce/HubSpot) connections, field mappings, and sync history (doc 35).
- `firmographic_enrichment_caches` — global domain-keyed firmographic lookup cache, 90-day TTL (doc 35).
- `wallet_pass_registrations` — Apple/Google Wallet device registrations against an issued badge pass (doc 35).

**Analytics rollups**
- `event_qce_summaries`, `event_exhibitor_metrics`, `booth_traffic_metrics`, `event_interest_coverages` — pre-computed organizer-facing aggregates (QCE, per-exhibitor traffic/pipeline, per-booth traffic, category interest-vs-supply); see doc 16 §10 and doc 32.

## 8. Multi-tenancy & Permission Vocabulary

- **Tenant = `organization`.** Two kinds: `organizer` and `exhibitor`. Both are first-class tenants; an exhibitor org's data (catalog, leads) belongs to the exhibitor, not the organizer.
- **Isolation:** shared Postgres schema, `organization_id` on every tenant-owned row, **Postgres Row-Level Security** enforced via per-request session variables (`app.current_org_id`, `app.current_user_id`), set through request-scoped context (AsyncLocalStorage). RLS is defense-in-depth behind application-level scoping — both are mandatory.
- **Cross-tenant surfaces** (e.g., attendee sees exhibitor profiles; organizer sees aggregate exhibitor stats) go through explicitly modeled read paths, never raw table access. RAG retrieval is entitlement- and tenant-filtered at query time (doc 23).
- **Roles (canonical strings):**
  - Platform: `platform:admin`
  - Organization: `org:owner`, `org:admin`, `org:member`
  - Event (organizer side): `event:admin`, `event:staff`
  - Exhibitor (per event_exhibitor): `exhibitor:admin`, `exhibitor:rep`
  - Attendee: `attendee` (per registration)
- **Permission strings:** `resource:action` (e.g., `leads:export`, `booths:assign`). Role→permission matrix lives in doc 28. Entitlement keys gate paid features (e.g., `entitlement:lead_intelligence`) and compose with permissions.

## 9. API Conventions (canonical)

- **Style:** REST, OpenAPI 3.1 contract generated from NestJS; versioned base path `/v1`. A generated typed TS client lives in `packages/api-client` (used by web today, native apps later — this is the D3 native-readiness seam).
- **Resource naming:** plural kebab-case (`/v1/events/{eventId}/event-exhibitors`). IDs are UUIDv7 (time-ordered).
- **Pagination:** cursor-based (`?cursor=…&limit=…`), response envelope `{ data, pagination: { nextCursor, hasMore } }`.
- **Errors:** RFC 9457 `application/problem+json` with stable machine-readable `code` (registry in doc 41).
- **Writes:** idempotency via `Idempotency-Key` header on POST.
- **Rate limits:** per-session and per-API-key token buckets in Redis; headers `RateLimit-*`.
- **Realtime:** Socket.IO namespaces per surface, rooms per event/booth; server pushes are cache-invalidation hints + payloads for live dashboards.
- **Webhooks:** signed (HMAC), at-least-once, with delivery log and retries (enterprise).

## 10. AI Feature Set (canonical names)

| Feature | Persona | What it is |
|---|---|---|
| **Expo Copilot** | Sofia | Conversational, RAG-grounded event guide: “who should I visit for industrial IoT sensors?” → cited, bookable answers |
| **Smart Matchmaking** | Sofia + Elena | Scored attendee↔exhibitor recommendations from interests, behavior, and embeddings; reasons always shown |
| **Lead Intelligence** | Jamal, Elena | Lead scoring + AI-written interaction summaries + firmographic enrichment (growth tier+) |
| **Follow-up Studio** | Elena | AI-drafted, personalized post-event follow-up sequences grounded in what actually happened at the booth (intelligence tier) |
| **Organizer Pulse** | Priya | Natural-language analytics + AI event insights (“which categories are under-served on the floor?”) |

Model routing, prompt architecture, safety (incl. prompt-injection defenses for exhibitor-supplied content), cost controls, and evals: docs 21–23. All AI features are additive layers over deterministic features — the platform is fully usable with AI off.

## 11. Naming Conventions (summary — doc 37 is exhaustive)

- **DB:** `snake_case`, plural tables, `*_id` FKs, `created_at`/`updated_at` timestamptz on every table.
- **TypeScript:** `camelCase` values/functions, `PascalCase` types/components, no `I` prefix on interfaces.
- **Files:** `kebab-case.ts(x)`; React components `PascalCase.tsx` inside `kebab-case` feature folders.
- **API routes:** plural kebab-case; **domain events:** `noun.verb_past` (`lead.captured`, `booth_visit.recorded`); **queues:** `kebab-case` (`kb-ingest`, `notification-dispatch`); **env vars:** `SCREAMING_SNAKE` with service prefix (`API_DATABASE_URL`); **feature flags:** `kebab-case` scoped (`ai-followup-studio`); **analytics events:** `surface.object_action` (`attendee.booth_saved`).
- **Git:** trunk-based, branches `feat|fix|chore/<scope>-<desc>`, Conventional Commits.

## 12. Glossary (canonical vocabulary — use these words, not synonyms)

| Term | Meaning |
|---|---|
| **Event** | One edition of a trade show (e.g., “TechExpo 2027”). Never “show” or “conference” in code/UI copy. |
| **Agenda session** | A talk/workshop in the event agenda. Never bare “session” (reserved: auth). |
| **Booth visit** | Raw signal that an attendee was at a booth (scan or dwell). |
| **Lead** | Exhibitor-owned, enriched record derived from interactions with one attendee. A visit is not a lead until captured/derived. |
| **Registration** | An attendee's relationship to one event (holds the badge). |
| **Badge code** | The QR payload on an attendee badge; opaque, rotatable, never contains PII. |
| **Exhibitor** | The company (organization of kind `exhibitor`); “event exhibitor” = its participation in one event. |
| **Entitlement** | A purchasable capability key resolved from subscriptions; the only way code checks paid features. |
| **Surface** | One of the five tenant/user-facing surfaces: Organizer Console, Exhibitor Portal, Attendee App, Platform Admin, or the public Marketing site (§5). Auth (`/auth/…`) and the Public API are cross-cutting entry points that span or sit outside these surfaces — never a sixth "Surface" in their own right. |

## 13. Document Map

`/docs` is the complete registry below (`00`–`46` plus `README.md`). This table is canonical — a document's filename and scope come from here, not from inference off other docs' citations. Cross-reference other docs with relative markdown links. No document may contain “TBD” — every open question is resolved with a justified decision or explicitly assigned to [44-future-expansion-plan.md](44-future-expansion-plan.md). Status `Locked` = written and binding; `Planned` = scope fixed here, not yet written.

| # | File | Scope | Status |
|---|---|---|---|
| 00 | [00-foundation.md](00-foundation.md) | This document — canonical decision record | Locked |
| 01 | [01-product-vision.md](01-product-vision.md) | Problem, differentiators, north-star metric, non-goals | Locked |
| 02 | [02-business-goals.md](02-business-goals.md) | Revenue model, segments, GTM, KPI tree, competitive positioning, risks | Locked |
| 03 | [03-user-personas.md](03-user-personas.md) | The six canonical personas + anti-personas | Locked |
| 04 | [04-user-journey.md](04-user-journey.md) | Cross-persona lifecycle, handoffs, journey design principles | Locked |
| 05 | [05-organizer-journey.md](05-organizer-journey.md) | Priya/Marcus step-by-step flows, O-1…O-10 | Locked |
| 06 | [06-exhibitor-journey.md](06-exhibitor-journey.md) | Elena/Jamal step-by-step flows, incl. offline capture mechanics referenced by JP-2 | Locked |
| 07 | [07-attendee-journey.md](07-attendee-journey.md) | Sofia step-by-step flows, consent moments, low-connectivity behavior | Locked |
| 08 | [08-feature-matrix.md](08-feature-matrix.md) | Canonical feature inventory, milestones M0–M5, entitlement registry | Locked |
| 09 | [09-functional-requirements.md](09-functional-requirements.md) | Testable functional requirements (FR-\* ids) behind every feature-matrix row | Locked |
| 10 | [10-non-functional-requirements.md](10-non-functional-requirements.md) | Performance/scale budgets, availability, i18n readiness, AI cost budgets | Locked |
| 11 | [11-information-architecture.md](11-information-architecture.md) | Surface→entity mapping, context nesting, canonical route map, search architecture | Locked |
| 12 | [12-navigation-structure.md](12-navigation-structure.md) | Nav trees, switchers, breadcrumbs, command palette, deep-linking | Locked |
| 13 | [13-application-layout.md](13-application-layout.md) | Shell components per surface, breakpoints, page/state pattern taxonomy | Locked |
| 14 | [14-page-inventory.md](14-page-inventory.md) | Every route in doc 11 specified once: components, data, access, states | Locked |
| 15 | [15-component-inventory.md](15-component-inventory.md) | The concrete component list and where each is used (APIs live in doc 40) | Locked |
| 16 | [16-database-schema.md](16-database-schema.md) | Column-level schema for every entity in §7, indexes, RLS policies | Locked |
| 17 | [17-offline-sync-architecture.md](17-offline-sync-architecture.md) | Service worker, IndexedDB schema, background sync, conflict resolution (implements P4/JP-2) | Locked |
| 18 | [18-api-architecture.md](18-api-architecture.md) | REST service topology, contract pipeline, conventions, realtime, public API, webhooks | Locked |
| 19 | [19-authentication-strategy.md](19-authentication-strategy.md) | Credential/OAuth/passkey/magic-link/SSO flows, invite tokens | Locked |
| 20 | [20-session-strategy.md](20-session-strategy.md) | Session/token mechanics, device management, revocation, offline replay window | Locked |
| 21 | [21-ai-architecture.md](21-ai-architecture.md) | AI service boundary, model routing, per-feature specs, evals, cost, guardrails | Locked |
| 22 | [22-rag-architecture.md](22-rag-architecture.md) | Retrieval pipeline: chunking, embedding, vector retrieval, reranking, citation assembly | Locked |
| 23 | [23-knowledge-base-architecture.md](23-knowledge-base-architecture.md) | KB source/document/chunk lifecycle, ingestion pipeline, quarantine/moderation | Locked |
| 24 | [24-matchmaking-and-scoring.md](24-matchmaking-and-scoring.md) | Deterministic Smart Matchmaking scoring model, weights, golden-set tuning | Locked |
| 25 | [25-event-pipeline.md](25-event-pipeline.md) | Transactional outbox, domain event catalog, fan-out to workers/webhooks/analytics | Locked |
| 26 | [26-file-storage.md](26-file-storage.md) | S3/CloudFront layout, presigned upload flow, AV scanning, retention | Locked |
| 27 | [27-background-jobs-architecture.md](27-background-jobs-architecture.md) | Worker deployable, BullMQ queue catalog, retry/backoff, scheduling | Locked |
| 28 | [28-permission-model.md](28-permission-model.md) | Role→permission matrix, entitlement check semantics, cross-tenant read paths | Locked |
| 29 | [29-audit-logging-architecture.md](29-audit-logging-architecture.md) | What is logged, immutability, retention, platform vs. org-facing viewers | Locked |
| 30 | [30-help-center-and-support.md](30-help-center-and-support.md) | Help Center content model, in-app contextual help, support escalation path | Locked |
| 31 | [31-observability.md](31-observability.md) | OTel spans/metrics, logging, dashboards, alerting, on-call | Locked |
| 32 | [32-analytics-architecture.md](32-analytics-architecture.md) | Event taxonomy, metric catalog, organizer/exhibitor reports and exports | Locked |
| 33 | [33-notification-system.md](33-notification-system.md) | Notification model, channels (email/push/in-app), preferences, templates | Locked |
| 34 | [34-feature-flags-and-experimentation.md](34-feature-flags-and-experimentation.md) | Flag naming/lifecycle, per-tenant rollout, kill-switch patterns, PostHog integration | Locked |
| 35 | [35-integrations-and-connectors.md](35-integrations-and-connectors.md) | CRM sync, registration import, enrichment providers, connector framework | Locked |
| 36 | [36-billing-and-payments-architecture.md](36-billing-and-payments-architecture.md) | Stripe Billing integration: checkout, webhooks, proration, dunning, tier changes | Locked |
| 37 | [37-monorepo-and-folder-structure.md](37-monorepo-and-folder-structure.md) | Concrete repo tree, package boundaries, build/dependency graph | Locked |
| 38 | [38-data-retention-privacy-compliance.md](38-data-retention-privacy-compliance.md) | Retention schedules, DSAR/erasure mechanics, consent architecture, GDPR posture | Locked |
| 39 | [39-design-system.md](39-design-system.md) | Marquee design tokens, theming, accessibility, voice & tone, iconography | Locked |
| 40 | [40-ui-component-library.md](40-ui-component-library.md) | Component APIs, engineering conventions, versioning policy | Locked |
| 41 | [41-error-code-registry.md](41-error-code-registry.md) | Machine-readable error code catalog with HTTP status mapping | Locked |
| 42 | [42-testing-strategy.md](42-testing-strategy.md) | Unit/integration/E2E strategy, fixtures, CI gates, a11y test gates | Locked |
| 43 | [43-security-architecture.md](43-security-architecture.md) | Threat model, encryption, secrets management, supply chain, compliance posture | Locked |
| 44 | [44-future-expansion-plan.md](44-future-expansion-plan.md) | Every explicitly deferred item, consolidated with revisit criteria | Locked |
| 45 | [45-implementation-roadmap.md](45-implementation-roadmap.md) | Milestone sequencing, staffing shape, dependency ordering | Locked |
| 46 | [46-marketing-site.md](46-marketing-site.md) | Public marketing site: landing, pricing, about, contact, help center entry, legal | Locked |
| — | `README.md` | Documentation index | Locked |

Two topics are **deliberately distributed rather than owned by a single doc**, consistent with how this registry already treats Billing-adjacent settings and Account pages: **Admin Panel** (routes in doc 11 §4.8, features in doc 08 §4.19, audit viewer in doc 29, AI ops console in doc 21) and **User Profiles / Settings** (identity model in doc 19, every settings/account route specified once in doc 14). Reports are owned by doc 32 (Analytics) as a report is a persisted view over the same metric catalog, not a separate system.

## 14. Amendments Log

Deviations from a prior locked decision are recorded here, never edited into history silently — the rest of this document always reflects the *current* decision; this log explains *why it changed*.

| # | Date | Change | Reason |
|---|---|---|---|
| A1 | 2026-07-09 | Marketing site moved from “reserved, out of Phase-1 scope” (§5) to in-scope; added entities `help_categories`/`help_articles` (§7); added doc 46. | Founder decision on blueprint continuation: the platform needs a public-facing marketing surface (landing, pricing, about, contact, help center, legal) from day one to look and function like a released commercial product, not just an authenticated app shell. |
| A2 | 2026-07-09 | Added entities `legal_documents`/`legal_acceptances` (§7, new "Legal & compliance" grouping). | Writing doc 46 (Marketing Site) surfaced a real requirement — versioned legal content plus acceptance tracking for signup consent flows — with no existing entity to hold it. Registered here per the same discipline A1 established: a new document's data needs get added to the canonical registry when the document is written, not left implicit. |
| A3 | 2026-07-11 | Registered 16 additional tables/columns into §7 and [16-database-schema.md](16-database-schema.md) that were introduced piecemeal across docs 17/19/20/21/27/32/33/35 and self-flagged as pending registration (`oauth_identities`, `webauthn_credentials`, `auth_tokens`, `organizations.verified_domains`, `organization_memberships.status`, `auth_sessions.session_kind`, `booth_visits.consent_contact_sharing`, `background_jobs`, `dead_letter_jobs`, `push_subscriptions`, new "Integrations" grouping — `crm_connections`/`crm_field_mappings`/`crm_sync_logs`/`firmographic_enrichment_caches`/`wallet_pass_registrations` — and the analytics rollups `event_qce_summaries`/`event_exhibitor_metrics`/`booth_traffic_metrics`/`event_interest_coverages`); reconciled `event_exhibitors.status` and `auth_sessions.revoked_reason` enum conflicts between [16-database-schema.md](16-database-schema.md) and [25-event-pipeline.md](25-event-pipeline.md)/[20-session-strategy.md](20-session-strategy.md); fixed the Surface glossary definition (§12) and doc 22's registry description (§13). | Pre-v1.0-freeze consistency review found these as critical blockers to backend implementation. |
| A4 | 2026-07-11 | **Blueprint frozen as Version 1.0.** External/engineering-facing summary documents ([BLUEPRINT_V1.md](BLUEPRINT_V1.md), [ENGINEERING_GUIDE.md](ENGINEERING_GUIDE.md), [IMPLEMENTATION_RULES.md](IMPLEMENTATION_RULES.md), [IMPLEMENTATION_PHASES.md](IMPLEMENTATION_PHASES.md)) use the product name **ExAi**. The **`Concourse`** codename remains in place through the body of docs 00–46 and README exactly as §1 always anticipated ("treat every use as replaceable via find-and-replace") — a dedicated repo-wide rename pass is tracked as a non-blocking Milestone-0 chore in [IMPLEMENTATION_PHASES.md](IMPLEMENTATION_PHASES.md) rather than performed here, to avoid a 48-document mechanical rewrite at freeze time. | Founder decision: the blueprint is feature-complete and ready for engineering; ExAi is the product's real name going forward. |
| A5 | 2026-07-11 | **Adopted Supabase as the managed platform for Database, Auth, Storage, and Realtime** (§6), superseding the prior AWS RDS + in-house NestJS auth module + WorkOS + S3/CloudFront + Socket.IO choices. This is a genuine architecture change made during Milestone 0 engineering setup, not a documentation cleanup — it directly supersedes the detailed designs in [19-authentication-strategy.md](19-authentication-strategy.md) (credential/OAuth/passkey/magic-link flows now run through Supabase Auth), [20-session-strategy.md](20-session-strategy.md) (opaque Redis-backed sessions replaced by Supabase JWT access/refresh tokens — the attendee 8-hour-session-plus-badge-rescan mechanic in §5.4 of that document must be re-derived against Supabase's token model), [26-file-storage.md](26-file-storage.md) (presigned-upload mechanics move from S3 to Supabase Storage's own API), and the Realtime section of [18-api-architecture.md](18-api-architecture.md) §7 (Socket.IO gateway replaced by Supabase Realtime channels; the rooms-per-event/booth *pattern* is preserved, only the transport changes). **These four documents are flagged at their top as "pending detailed revision to reflect Supabase adoption" and must be substantively rewritten — not just reference-patched — before Milestone M0's identity/auth deliverables, or any later milestone that touches sessions/storage/realtime, is implemented.** Milestone 0's own scope for this session is limited to repository/tooling scaffolding (per the founder's explicit instruction not to build authentication in this pass), so this amendment records the decision and its blast radius without performing that detailed rewrite now. | Founder decision during Milestone 0 kickoff, made explicitly and with the scope of the change (full platform, not database-hosting-only) confirmed twice before any config was written. |

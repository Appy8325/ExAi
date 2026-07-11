# Implementation Phases — ExAi

This document sequences engineering into the six milestones already canonical in [08-feature-matrix.md](08-feature-matrix.md) §2 and [45-implementation-roadmap.md](45-implementation-roadmap.md) — it does not invent a new milestone scheme, it operationalizes the existing one into buildable phases with explicit dependencies, deliverables, and done-criteria. Each phase's exit criterion is restated verbatim from [08-feature-matrix.md](08-feature-matrix.md) §2, per that document's own instruction not to re-derive it.

Follow [IMPLEMENTATION_RULES.md](IMPLEMENTATION_RULES.md) rule 11 and 16 for every phase below: build one milestone at a time, stop after it, do not pull work forward.

---

## Milestone 0 — Platform Foundation

**Goal:** Stand up the repository, the core identity/tenancy/entitlement substrate, and the platform-admin baseline that every later milestone depends on. Exit criterion ([08-feature-matrix.md](08-feature-matrix.md) §2): *"Users, organizations, auth, RLS tenancy, entitlement resolution, transactional email, Platform Admin provisioning all working in staging."*

**Dependencies:** None — this is the first milestone. Prerequisite reading: [00-foundation.md](00-foundation.md) (full), [37-monorepo-and-folder-structure.md](37-monorepo-and-folder-structure.md), [16-database-schema.md](16-database-schema.md) §§1–3, [19-authentication-strategy.md](19-authentication-strategy.md), [20-session-strategy.md](20-session-strategy.md), [28-permission-model.md](28-permission-model.md).

**Deliverables:**
1. Monorepo scaffold matching [37-monorepo-and-folder-structure.md](37-monorepo-and-folder-structure.md) exactly (`apps/web`, `apps/api`, `apps/worker`, all `packages/*`, `infra/`, CI pipeline skeleton).
2. Identity & tenancy schema: `organizations`, `users`, `organization_memberships`, `auth_sessions`, `api_keys`, `oauth_identities`, `webauthn_credentials`, `auth_tokens` — with RLS policies and isolation tests, per [16-database-schema.md](16-database-schema.md) §3.
3. Authentication (features A1–A9 in [08-feature-matrix.md](08-feature-matrix.md) §4.1): email/password, OAuth, magic-link, passkeys, org creation, member invites, session/device management, account settings.
4. Entitlement resolution service (`plans → subscriptions → entitlements`, [00-foundation.md](00-foundation.md) §4, feature Q1/Q2) with manual (Platform Admin) provisioning.
5. Transactional email via the notification service's email channel only ([33-notification-system.md](33-notification-system.md)), covering the account-lifecycle templates needed by items 3–4.
6. Platform Admin baseline: tenant/user directory, manual entitlement provisioning UI (features S1, Q2 in [08-feature-matrix.md](08-feature-matrix.md) §4.19).
7. Audit logging baseline (`audit_logs` table + write path, [29-audit-logging-architecture.md](29-audit-logging-architecture.md)) — every privileged action from item 3–6 writes here from day one.
8. Observability baseline: OTel, Sentry, structured logging wired per [31-observability.md](31-observability.md), even before there's much to observe.
9. (Tracked, non-blocking, per [00-foundation.md](00-foundation.md) §14 Amendment A4): the `Concourse` → `ExAi` repo-wide rename pass.

**Definition of Done:** All 9 deliverables pass their RLS isolation, contract, and unit tests in CI; a staging deploy demonstrates: a user signs up, creates an organization, invites a member, that member accepts, an entitlement is manually granted and correctly gates a stub feature, an audit log entry exists for every one of those actions, and Alex (platform admin) can see the tenant in Platform Admin. No UI polish beyond what's needed to demonstrate the flow — this milestone is about correctness of the substrate, not the finished Organizer Console.

**Suggested Git Commit Message:**
```
feat(m0): platform foundation — identity, tenancy, entitlements, audit

Implements 16-database-schema.md §3 (identity & tenancy), 19/20 (auth &
session strategy), 28-permission-model.md (entitlement resolution),
29-audit-logging-architecture.md (audit write path), and the
37-monorepo-and-folder-structure.md repo scaffold. Exit criterion per
08-feature-matrix.md §2 (M0).
```

---

## Milestone 1 — Event Setup & Exhibitor Onboarding

**Goal:** An organizer can build a real event and get exhibitors onboarded onto it. Exit criterion: *"An organizer publishes a real event: floor plan drawn, booths assigned, exhibitors invited and onboarded, catalog visible on a public event page."*

**Dependencies:** Milestone 0 complete (identity, tenancy, entitlements, audit). Reading: [05-organizer-journey.md](05-organizer-journey.md), [06-exhibitor-journey.md](06-exhibitor-journey.md), [11-information-architecture.md](11-information-architecture.md), [16-database-schema.md](16-database-schema.md) §4–5.

**Deliverables:**
1. Event lifecycle: `events`, `event_staff`, status machine `draft → published → live → completed → archived` (features B1–B5 in [08-feature-matrix.md](08-feature-matrix.md) §4.2).
2. Floor & booths: `venues`, `floor_plans`, `booths`, upload/calibration/drawing flows (features C1–C3 in §4.3).
3. Exhibitor onboarding: bulk invitations, claim flow, `event_exhibitors`/`exhibitor_staff` participation model, event-facing profile (features D1–D7 in §4.4).
4. Catalog: `products`, `event_product_listings`, media upload (features E1–E3 in §4.5).
5. Marketing site (doc 46) landing/pricing/about/contact/help-entry/legal pages, static/RSC, per [13-application-layout.md](13-application-layout.md) `MarketingShell`.
6. File storage service ([26-file-storage.md](26-file-storage.md)) backing items 2 and 4's uploads.
7. Background jobs baseline ([27-background-jobs-architecture.md](27-background-jobs-architecture.md)) for async imports (CSV exhibitor invites) and AV scanning.

**Definition of Done:** All deliverables pass their tests per [42-testing-strategy.md](42-testing-strategy.md); a staging demo shows Priya creating an event, drawing a floor plan, inviting an exhibitor by CSV, Elena accepting and completing her profile and catalog, and the event's public page (once published) correctly showing the exhibitor and catalog to an anonymous visitor.

**Suggested Git Commit Message:**
```
feat(m1): event setup and exhibitor onboarding

Implements 05-organizer-journey.md (O-1..O-4), 06-exhibitor-journey.md
(EX-1..EX-4), 16-database-schema.md §4-5 (events/floor/exhibitors/
catalog), 26-file-storage.md, and 46-marketing-site.md. Exit criterion
per 08-feature-matrix.md §2 (M1).
```

---

## Milestone 2 — Live Floor Operations

**Goal:** A real event can run end-to-end on show days. This is the **first revenue-capable milestone.** Exit criterion: *"A real event runs end-to-end: registration, badges, gate check-in, offline lead capture, agenda, notifications, basic dashboards."*

**Dependencies:** Milestone 1 complete. Reading: [07-attendee-journey.md](07-attendee-journey.md), [17-offline-sync-architecture.md](17-offline-sync-architecture.md), [09-functional-requirements.md](09-functional-requirements.md), [25-event-pipeline.md](25-event-pipeline.md).

**Deliverables:**
1. Attendee registration & badging: frictionless magic-link registration (Work Email + Job Title + optional Goal), `registrations`/`attendee_interests`, rotating `badge_code`, the 8-hour attendee session with QR-scan re-recognition (features F1–F6 in [08-feature-matrix.md](08-feature-matrix.md) §4.6; [20-session-strategy.md](20-session-strategy.md)).
2. Check-in: offline-tolerant gate scanning (feature F4).
3. Offline-first lead capture: badge scan → `booth_visits` → `leads`, full IndexedDB queue and sync per [17-offline-sync-architecture.md](17-offline-sync-architecture.md) (features H1–H9 in §4.8).
4. Agenda: `agenda_sessions`/`session_checkins`, personal schedule (features G1–G4 in §4.7).
5. Domain event pipeline (`domain_events` outbox, per [25-event-pipeline.md](25-event-pipeline.md)) wired to the notification and analytics consumers built in this milestone.
6. Notifications: transactional + broadcast announcements, in-app inbox, Web Push (features P1–P5 in §4.16).
7. Basic dashboards: organizer event dashboard, exhibitor booth dashboard (features O1–O2 in §4.15).
8. Help Center baseline ([30-help-center-and-support.md](30-help-center-and-support.md)): in-app contextual help, public `/help`.

**Definition of Done:** A staging demo runs a full simulated show day: Sofia registers via magic link, receives her badge, checks in (including with connectivity artificially dropped), Jamal captures a lead offline and it syncs on reconnect, Sofia bookmarks an agenda session and checks in to it, and both Priya and Elena see live basic dashboards. This is the milestone where a design-partner event could plausibly run.

**Suggested Git Commit Message:**
```
feat(m2): live floor operations — registration, badges, offline capture

Implements 07-attendee-journey.md, 17-offline-sync-architecture.md
(full offline capture loop), 09-functional-requirements.md state
machines (registration/lead pipeline), 25-event-pipeline.md,
33-notification-system.md, 30-help-center-and-support.md, and basic
dashboards (32-analytics-architecture.md O1/O2). First revenue-capable
milestone per 08-feature-matrix.md §2 (M2).
```

---

## Milestone 3 — Intelligence Layer

**Goal:** The AI features that differentiate the platform go live at a production event. Exit criterion: *"KB ingestion, Expo Copilot, Smart Matchmaking, Lead Intelligence, and meetings live at a production event."*

**Dependencies:** Milestone 2 complete (the floor-operations data — booth visits, leads, agenda — is what the intelligence layer is built on). Reading: [21-ai-architecture.md](21-ai-architecture.md), [22-rag-architecture.md](22-rag-architecture.md), [23-knowledge-base-architecture.md](23-knowledge-base-architecture.md), [24-matchmaking-and-scoring.md](24-matchmaking-and-scoring.md).

**Deliverables:**
1. The single `AiModule` service boundary (`packages/ai`), model routing, budget/guardrail/telemetry gateway per [21-ai-architecture.md](21-ai-architecture.md) §1–§2.
2. Knowledge base ingestion pipeline: `kb_sources → kb_documents → kb_chunks`, the `kb-ingest` queue, quarantine/moderation workflow (feature K1, K5; [23-knowledge-base-architecture.md](23-knowledge-base-architecture.md)).
3. RAG retrieval service (embedding, pure-vector search, reranking, citation assembly per [22-rag-architecture.md](22-rag-architecture.md)).
4. Expo Copilot (feature K2–K4, K6) — attendee-facing, cited, streaming.
5. Smart Matchmaking: deterministic scoring pipeline + AI-written reasons per [24-matchmaking-and-scoring.md](24-matchmaking-and-scoring.md) (features J1–J5).
6. Lead Intelligence: scoring, AI summaries, enrichment (features L1–L4).
7. Meetings: availability, booking, lifecycle (features I1–I5).
8. Full AI eval suite (per [21-ai-architecture.md](21-ai-architecture.md) §5) and the adversarial injection suite passing in CI before any of the above is enabled by default.

**Definition of Done:** Every AI feature above passes its eval gate; a staging demo shows Sofia asking Expo Copilot a grounded, cited question, receiving Smart Matchmaking recommendations with reasons, Jamal seeing a scored, summarized lead, and a meeting being booked end-to-end. Every feature's deterministic fallback (search/browse, category filter, raw timeline, plain scheduling) is verified working with the AI flag off.

**Suggested Git Commit Message:**
```
feat(m3): intelligence layer — RAG, Expo Copilot, matchmaking, lead
intelligence, meetings

Implements 21-ai-architecture.md (AI service boundary), 22-rag-
architecture.md, 23-knowledge-base-architecture.md, 24-matchmaking-
and-scoring.md, and meetings (09-functional-requirements.md). Every
feature ships with its deterministic fallback and passing eval gate.
Exit criterion per 08-feature-matrix.md §2 (M3).
```

---

## Milestone 4 — Monetization & Enterprise

**Goal:** Self-serve revenue and enterprise-readiness features go live. Exit criterion: *"Self-serve Stripe billing, exhibitor tier upsell, Follow-up Studio, Organizer Pulse, SSO (SAML/OIDC), Public API + webhooks."*

**Dependencies:** Milestone 3 complete. Reading: [36-billing-and-payments-architecture.md](36-billing-and-payments-architecture.md), [34-feature-flags-and-experimentation.md](34-feature-flags-and-experimentation.md), [35-integrations-and-connectors.md](35-integrations-and-connectors.md), [18-api-architecture.md](18-api-architecture.md) §8–9.

**Deliverables:**
1. Stripe Billing integration: organizer subscription checkout, exhibitor tier upsell checkout, webhook handler, proration, dunning, billing portal (features Q3–Q6; [36-billing-and-payments-architecture.md](36-billing-and-payments-architecture.md)).
2. Follow-up Studio: AI-drafted, human-approved sequences (features in [08-feature-matrix.md](08-feature-matrix.md) §4.13).
3. Organizer Pulse: NL analytics over the curated metric catalog (features N1–N3, §4.14).
4. Enterprise SSO via Supabase Auth's native SAML/OIDC support (feature A8).
5. Public API v1 + API key management + outbound webhooks (features R1–R5; [18-api-architecture.md](18-api-architecture.md) §8–9).
6. CRM sync connectors (Salesforce, HubSpot first; [35-integrations-and-connectors.md](35-integrations-and-connectors.md)).
7. Feature flag / kill-switch system fully wired for every AI feature ([34-feature-flags-and-experimentation.md](34-feature-flags-and-experimentation.md)).

**Definition of Done:** An organizer can self-serve upgrade their plan and an exhibitor can self-serve upgrade their tier via Stripe Checkout with correct entitlement resolution on webhook receipt; Elena receives an AI-drafted follow-up sequence she can edit and approve; Priya asks Organizer Pulse a natural-language question and gets a grounded answer; an enterprise organizer can configure SSO; a public API key can list events and receive a webhook delivery.

**Suggested Git Commit Message:**
```
feat(m4): monetization and enterprise — billing, follow-up studio,
organizer pulse, SSO, public API

Implements 36-billing-and-payments-architecture.md, Follow-up Studio
and Organizer Pulse (21-ai-architecture.md §3.4/§3.5), enterprise SSO
(19-authentication-strategy.md), 18-api-architecture.md §8-9 (public
API + webhooks), and 35-integrations-and-connectors.md (CRM sync).
Exit criterion per 08-feature-matrix.md §2 (M4).
```

---

## Milestone 5 — Scale & Real-Time Analytics

**Goal:** The platform is verified against its locked scale targets and ships its most advanced analytics. Exit criterion: *"Real-time booth analytics, competitive benchmarks, portfolio analytics; platform verified against foundation D5 scale targets."*

**Dependencies:** Milestone 4 complete. Reading: [10-non-functional-requirements.md](10-non-functional-requirements.md), [32-analytics-architecture.md](32-analytics-architecture.md), [31-observability.md](31-observability.md), [43-security-architecture.md](43-security-architecture.md) §10.

**Deliverables:**
1. Real-time booth analytics (feature O4), competitive benchmarks (O5), portfolio analytics (O6), post-event report generation (O7) — [32-analytics-architecture.md](32-analytics-architecture.md).
2. Load/scale verification against [00-foundation.md](00-foundation.md) decision D5 and the concrete numeric targets in [10-non-functional-requirements.md](10-non-functional-requirements.md).
3. Full observability maturity: every metric/dashboard/alert in [31-observability.md](31-observability.md) live, on-call rotation operational.
4. SOC 2 Type I readiness work begins per the compliance roadmap in [43-security-architecture.md](43-security-architecture.md) §10 (Type I lands this milestone or shortly after, ahead of Type II in the following year).

**Definition of Done:** A load test demonstrates the platform meets its stated peak scan-rate, concurrent-connection, and attendee-volume targets for a single event; real-time booth analytics update within the latency budget [10-non-functional-requirements.md](10-non-functional-requirements.md) specifies; portfolio/benchmark views are correct across a multi-event organizer's data; on-call has a working runbook.

**Suggested Git Commit Message:**
```
feat(m5): scale verification and real-time analytics

Implements 32-analytics-architecture.md O4-O7 (real-time booth
analytics, benchmarks, portfolio analytics, post-event reports),
verifies platform against 00-foundation.md decision D5 and
10-non-functional-requirements.md scale budgets, and completes
31-observability.md's dashboard/alert catalog. Exit criterion per
08-feature-matrix.md §2 (M5).
```

---

## Explicitly out of scope for this document

Per the instructions this blueprint was prepared under: **no application code, no project initialization, no UI, and no authentication implementation are performed by producing this document.** Everything above is a plan to be executed starting with Milestone 0, not work already done.

## Related Documents

- [IMPLEMENTATION_RULES.md](IMPLEMENTATION_RULES.md) — the permanent rules every milestone above must follow
- [ENGINEERING_GUIDE.md](ENGINEERING_GUIDE.md) — how to approach each milestone's implementation
- [BLUEPRINT_V1.md](BLUEPRINT_V1.md) — frozen-state summary
- [08-feature-matrix.md](08-feature-matrix.md) §2 — the canonical milestone definitions this document operationalizes
- [45-implementation-roadmap.md](45-implementation-roadmap.md) — staffing shape, GTM alignment, and risk detail behind this sequencing

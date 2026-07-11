# Feature Matrix

This document is the canonical inventory of every Phase-1 feature: what it is, who it serves, where it lives, how it is gated commercially, when it ships, and how hard we commit to it. It is the bridge between the product decisions in [00-foundation.md](00-foundation.md) and the buildable specifications in [09-functional-requirements.md](09-functional-requirements.md). Detailed sequencing, staffing, and dates belong to [45-implementation-roadmap.md](45-implementation-roadmap.md); enforcement mechanics for gates belong to [28-permission-model.md](28-permission-model.md); storage of plans/subscriptions/entitlements belongs to [16-database-schema.md](16-database-schema.md). Anything explicitly deferred is listed in §6 and expanded in [44-future-expansion-plan.md](44-future-expansion-plan.md).

## 1. How to Read This Matrix

**Surfaces** (canonical, foundation §5): `OC` = Organizer Console, `EP` = Exhibitor Portal, `AA` = Attendee App, `PA` = Platform Admin, `API` = Public API, `Auth` = auth surface, `Worker` = background pipeline (no UI).

**Personas** (foundation §3): Priya (organizer admin), Marcus (organizer staff), Elena (exhibitor admin), Jamal (exhibitor rep), Sofia (attendee), Alex (platform admin).

**Gating columns.** Cells contain entitlement keys, never plan names — code checks keys only (foundation §4). `—` means available to every plan/tier with no entitlement check. `n/a` means the column does not apply (e.g., no exhibitor involvement). The key→plan/tier grant mapping is the registry in §3.

**Priority semantics:**

| Priority | Meaning |
|---|---|
| P0 | Milestone-blocking. The milestone does not ship without it. |
| P1 | Committed within the milestone; may slip exactly one milestone with explicit sign-off recorded in [45-implementation-roadmap.md](45-implementation-roadmap.md). |
| P2 | Opportunistic. Built when capacity allows; never blocks a milestone. |

## 2. Milestone Definitions (M0–M5)

These milestone identifiers are canonical across all requirement documents. [45-implementation-roadmap.md](45-implementation-roadmap.md) owns calendar dates and dependency ordering; the definitions here own *scope membership*.

| Milestone | Theme | Exit criterion (demonstrable) |
|---|---|---|
| **M0** | Platform foundation | Users, organizations, auth, RLS tenancy, entitlement resolution, transactional email, Platform Admin provisioning all working in staging. |
| **M1** | Event setup & exhibitor onboarding | An organizer publishes a real event: floor plan drawn, booths assigned, exhibitors invited and onboarded, catalog visible on a public event page. |
| **M2** | Live floor operations | A real event runs end-to-end: registration, badges, gate check-in, offline lead capture, agenda, notifications, basic dashboards. This is the first revenue-capable milestone. |
| **M3** | Intelligence layer | KB ingestion, Expo Copilot, Smart Matchmaking, Lead Intelligence, and meetings live at a production event. |
| **M4** | Monetization & enterprise | Self-serve Stripe billing, exhibitor tier upsell, Follow-up Studio, Organizer Pulse, SSO (SAML/OIDC), Public API + webhooks. |
| **M5** | Scale & real-time analytics | Real-time booth analytics, competitive benchmarks, portfolio analytics; platform verified against foundation D5 scale targets per [10-non-functional-requirements.md](10-non-functional-requirements.md). |

## 3. Entitlement Key Registry

The single list of purchasable-capability keys. Grants are resolved via `plans → subscriptions → entitlements` (foundation §4); [16-database-schema.md](16-database-schema.md) owns the tables, [28-permission-model.md](28-permission-model.md) owns the check semantics and how keys compose with `resource:action` permissions. `boolean` keys are present/absent; `limit` keys carry a numeric value (`-1` = unlimited).

**Organizer-plan keys** (granted by the organizer org's subscription):

| Key | Type | launch | professional | enterprise | Notes |
|---|---|---|---|---|---|
| `entitlement:events_limit` | limit | 1 | -1 | -1 | Max concurrently active (non-archived) events. Also gates event cloning. |
| `entitlement:analytics_suite` | boolean | — | ✓ | ✓ | Funnels, segments, scheduled exports, portfolio analytics, post-event report. |
| `entitlement:matchmaking` | boolean | — | ✓ | ✓ | Enables Smart Matchmaking event-wide (both attendee and exhibitor sides). |
| `entitlement:organizer_pulse` | boolean | — | ✓ | ✓ | NL analytics + AI insights for organizers. |
| `entitlement:expo_copilot` | boolean | ✓ | ✓ | ✓ | On all plans — it is the flagship attendee differentiator; spend is capped by `ai_budget_daily_usd`, not by plan. |
| `entitlement:ai_budget_daily_usd` | limit | 150 | 600 | 2000 | Default per-event daily AI spend ceiling (USD); platform-admin adjustable. Budgets and degradation ladder in [10-non-functional-requirements.md](10-non-functional-requirements.md) §11. |
| `entitlement:sso_saml` | boolean | — | — | ✓ | Supabase Auth native SAML/OIDC SSO. |
| `entitlement:public_api` | boolean | — | — | ✓ | Public REST API + API keys. |
| `entitlement:webhooks` | boolean | — | — | ✓ | Outbound signed webhooks. |
| `entitlement:audit_log_access` | boolean | — | — | ✓ | Org-facing audit log viewer/export. |
| `entitlement:custom_domains` | boolean | — | — | ✓ | Key reserved now; delivery in [44-future-expansion-plan.md](44-future-expansion-plan.md). |
| `entitlement:data_residency` | boolean | — | — | ✓ | Key reserved now; delivery in [44-future-expansion-plan.md](44-future-expansion-plan.md). |

**Exhibitor-tier keys** (granted per `event_exhibitors` record):

| Key | Type | essentials | growth | intelligence | Notes |
|---|---|---|---|---|---|
| `entitlement:staff_seats` | limit | 3 | -1 | -1 | Active `exhibitor_staff` seats per event exhibitor. |
| `entitlement:lead_intelligence` | boolean | — | ✓ | ✓ | Scoring, AI summaries, enrichment, voice notes, hot-lead alerts. |
| `entitlement:meeting_scheduling` | boolean | — | ✓ | ✓ | Exhibitor-side meeting slots and booking. |
| `entitlement:lead_export` | boolean | — | ✓ | ✓ | CSV/XLSX exports. Essentials sees leads in-portal only (the primary upsell lever). |
| `entitlement:crm_sync` | boolean | — | ✓ | ✓ | CRM connectors. |
| `entitlement:followup_studio` | boolean | — | — | ✓ | Follow-up Studio. |
| `entitlement:matchmaking_priority` | boolean | — | — | ✓ | Priority placement in Smart Matchmaking (capped — see FR-MATCH-005 in [09-functional-requirements.md](09-functional-requirements.md)). |
| `entitlement:competitive_benchmarks` | boolean | — | — | ✓ | Category percentile benchmarks. |
| `entitlement:booth_analytics_realtime` | boolean | — | — | ✓ | Live booth analytics stream. |

Attendees are always free (foundation D4); no attendee-facing feature carries an entitlement check on the attendee side.

## 4. Feature Matrix

Split by module for readability; the columns are identical throughout: **ID | Feature | Description | Personas | Surface | Organizer gate | Exhibitor gate | Milestone | Priority**.

### 4.1 Identity & Organizations

| ID | Feature | Description | Personas | Surface | Organizer gate | Exhibitor gate | MS | Pri |
|---|---|---|---|---|---|---|---|---|
| A1 | Email/password auth | Supabase Auth-managed credentials, verification, reset | All | Auth | — | — | M0 | P0 |
| A2 | OAuth sign-in | Google, Microsoft, LinkedIn | All | Auth | — | — | M0 | P0 |
| A3 | Magic-link sign-in | Passwordless default for attendees | Sofia | Auth | — | n/a | M0 | P0 |
| A4 | WebAuthn passkeys | Passkey registration and sign-in | All | Auth | — | — | M1 | P1 |
| A5 | Organization creation | Organizer and exhibitor org kinds, profiles | Priya, Elena | OC, EP | — | — | M0 | P0 |
| A6 | Org member invites | Email invites with expiry; roles owner/admin/member | Priya, Elena | OC, EP | — | — | M0 | P0 |
| A7 | Device/session management | List and revoke `auth_sessions` | All | All | — | — | M1 | P1 |
| A8 | SAML/OIDC SSO | Supabase Auth native enterprise SSO | Priya | Auth, OC | `entitlement:sso_saml` | n/a | M4 | P1 |
| A9 | Profile & account settings | Name, avatar, email change with re-verification | All | All | — | — | M0 | P0 |
| A10 | Account deletion & DSAR export | Self-service erasure and data export | All | All | — | — | M2 | P0 |

### 4.2 Event Setup

| ID | Feature | Description | Personas | Surface | Organizer gate | Exhibitor gate | MS | Pri |
|---|---|---|---|---|---|---|---|---|
| B1 | Event CRUD & lifecycle | draft→published→live→completed→archived | Priya | OC | `entitlement:events_limit` | n/a | M1 | P0 |
| B2 | Event branding & public page | Logo, colors, hero, public event landing at `/e/[eventSlug]` | Priya | OC, AA | — | n/a | M1 | P0 |
| B3 | Event staff assignment | `event:admin` / `event:staff` roles | Priya, Marcus | OC | — | n/a | M1 | P0 |
| B4 | Event configuration | Timezone, dates, venue linkage, feature toggles | Priya | OC | — | n/a | M1 | P0 |
| B5 | Event cloning | Copy structure from a prior edition | Priya | OC | `entitlement:events_limit` | n/a | M4 | P2 |

### 4.3 Floor & Booths

| ID | Feature | Description | Personas | Surface | Organizer gate | Exhibitor gate | MS | Pri |
|---|---|---|---|---|---|---|---|---|
| C1 | Floor plan management | Upload SVG/image underlay per hall | Marcus | OC | — | n/a | M1 | P0 |
| C2 | Booth inventory editor | Draw/place booths, numbering, size class | Marcus | OC | — | n/a | M1 | P0 |
| C3 | Booth assignment | Assign booths to event exhibitors | Marcus | OC | — | — | M1 | P0 |
| C4 | Interactive floor map | Pan/zoom map with booth details | Sofia | AA | — | — | M2 | P0 |
| C5 | Booth locator | Directory→map deep links, section-level location | Sofia | AA | — | — | M2 | P1 |

### 4.4 Exhibitor Onboarding

| ID | Feature | Description | Personas | Surface | Organizer gate | Exhibitor gate | MS | Pri |
|---|---|---|---|---|---|---|---|---|
| D1 | Bulk exhibitor invitations | CSV import + email invites with expiry | Marcus | OC | — | n/a | M1 | P0 |
| D2 | Invite claim flow | Create or join exhibitor org from invite | Elena | Auth, EP | — | — | M1 | P0 |
| D3 | Participation management | `event_exhibitors` tier/status/booth admin | Marcus, Elena | OC, EP | — | — | M1 | P0 |
| D4 | Event exhibitor profile | Logo, description, categories, links | Elena | EP | — | — | M1 | P0 |
| D5 | Exhibitor staff seats | Invite reps, roles admin/rep, seat limits | Elena | EP | — | `entitlement:staff_seats` | M1 | P0 |
| D6 | Readiness checklist | Profile-completeness score, organizer rollup | Elena, Marcus | EP, OC | — | — | M2 | P1 |
| D7 | Profile moderation | Organizer review/approve exhibitor content | Marcus | OC | — | — | M1 | P1 |

### 4.5 Catalog

| ID | Feature | Description | Personas | Surface | Organizer gate | Exhibitor gate | MS | Pri |
|---|---|---|---|---|---|---|---|---|
| E1 | Product catalog | Org-scoped `products` CRUD, reusable across events | Elena | EP | — | — | M1 | P0 |
| E2 | Event product listings | Select which products show at an event | Elena | EP | — | — | M1 | P0 |
| E3 | Product media | Images and PDFs via presigned S3 upload | Elena | EP | — | — | M1 | P0 |
| E4 | Attendee directory | Exhibitor + product browse, search, category filters | Sofia | AA | — | — | M2 | P0 |
| E5 | Bookmarks | Save booths/products to personal list | Sofia | AA | — | — | M2 | P1 |

### 4.6 Registration & Badging

| ID | Feature | Description | Personas | Surface | Organizer gate | Exhibitor gate | MS | Pri |
|---|---|---|---|---|---|---|---|---|
| F1 | Registration flow | Free registration with qualification questions | Sofia | AA | — | n/a | M2 | P0 |
| F2 | Registration form builder | Custom fields + consent capture configuration | Marcus | OC | — | n/a | M2 | P0 |
| F3 | Digital badge | Rotating QR `badge_code`, no PII in payload | Sofia | AA | — | n/a | M2 | P0 |
| F4 | Check-in scanning mode | Staff gate scanning, offline-tolerant | Marcus | OC | — | n/a | M2 | P0 |
| F5 | Walk-up registration | On-site register + immediate badge | Sofia, Marcus | AA, OC | — | n/a | M2 | P1 |
| F6 | Print-friendly badge | PDF badge render for on-site printing | Marcus | OC | — | n/a | M2 | P1 |
| F7 | Registration approval rules | Gated/qualified registration review queue | Marcus | OC | — | n/a | M3 | P1 |
| F8 | Capacity caps & waitlist | Event-level caps with automatic promotion | Marcus | OC | — | n/a | M3 | P2 |
| F9 | Wallet passes | Apple/Google Wallet badge passes | Sofia | AA | — | n/a | M3 | P2 |

### 4.7 Agenda

| ID | Feature | Description | Personas | Surface | Organizer gate | Exhibitor gate | MS | Pri |
|---|---|---|---|---|---|---|---|---|
| G1 | Agenda session management | Tracks, rooms, speakers, times, capacity | Marcus | OC | — | n/a | M2 | P0 |
| G2 | Personal schedule | Browse agenda, save agenda sessions | Sofia | AA | — | n/a | M2 | P0 |
| G3 | Session check-ins | Door QR scans into `session_checkins` | Marcus, Sofia | OC, AA | — | n/a | M2 | P1 |
| G4 | Speaker profiles | Speaker bios and photos on agenda | Marcus, Sofia | OC, AA | — | n/a | M2 | P1 |
| G5 | Conflict & capacity warnings | Overlap and near-full indicators | Sofia | AA | — | n/a | M2 | P2 |

### 4.8 Lead Capture

| ID | Feature | Description | Personas | Surface | Organizer gate | Exhibitor gate | MS | Pri |
|---|---|---|---|---|---|---|---|---|
| H1 | Badge-scan lead capture | Camera QR scan → lead, sub-second confirm | Jamal | EP | — | — | M2 | P0 |
| H2 | Offline capture & sync | Full capture offline, background sync queue | Jamal | EP | — | — | M2 | P0 |
| H3 | Re-scan handling | Same badge re-scan appends to existing lead | Jamal | EP | — | — | M2 | P0 |
| H4 | Consent enforcement | Capture blocked without attendee consent record | Sofia | EP | — | — | M2 | P0 |
| H5 | Custom qualifier questions | Per-exhibitor qualifiers on capture screen | Elena, Jamal | EP | — | — | M2 | P1 |
| H6 | Lead notes (text) | Notes attached to leads | Jamal | EP | — | — | M2 | P0 |
| H7 | Voice notes + transcription | Recorded notes transcribed to text | Jamal | EP | — | `entitlement:lead_intelligence` | M3 | P1 |
| H8 | Pipeline & assignment | Stage flow (foundation §7) + rep assignment | Elena, Jamal | EP | — | — | M2 | P0 |
| H9 | Attendee self-scan | Booth QR poster → attendee shares contact | Sofia | AA | — | — | M2 | P1 |
| H10 | Duplicate lead merge | Manual merge + system-suggested duplicates | Elena | EP | — | — | M3 | P1 |
| H11 | Lead export | CSV/XLSX export, async for large sets | Elena | EP | — | `entitlement:lead_export` | M2 | P0 |
| H12 | CRM sync | Connector framework; Salesforce + HubSpot first | Elena | EP | — | `entitlement:crm_sync` | M4 | P1 |
| H13 | My connections | Attendee view of exhibitors holding their lead | Sofia | AA | — | — | M2 | P1 |

### 4.9 Meetings

| ID | Feature | Description | Personas | Surface | Organizer gate | Exhibitor gate | MS | Pri |
|---|---|---|---|---|---|---|---|---|
| I1 | Availability configuration | Slots, staff calendars, locations | Elena | EP | — | `entitlement:meeting_scheduling` | M3 | P0 |
| I2 | Attendee booking | Request/book meetings with exhibitors | Sofia | AA | — | `entitlement:meeting_scheduling`* | M3 | P0 |
| I3 | Meeting lifecycle | requested→confirmed→completed / declined / no_show | Elena, Jamal, Sofia | EP, AA | — | `entitlement:meeting_scheduling` | M3 | P0 |
| I4 | Calendar invites & reminders | .ics attachments, push/email reminders | All | EP, AA | — | `entitlement:meeting_scheduling` | M3 | P1 |
| I5 | Outcome capture | Meeting outcome updates lead stage | Jamal | EP | — | `entitlement:meeting_scheduling` | M3 | P1 |

\* The entitlement is held by the exhibitor; attendees book free wherever the exhibitor has the key.

### 4.10 Smart Matchmaking

| ID | Feature | Description | Personas | Surface | Organizer gate | Exhibitor gate | MS | Pri |
|---|---|---|---|---|---|---|---|---|
| J1 | Interest capture | Declared at registration + inferred from behavior | Sofia | AA | — | n/a | M3 | P0 |
| J2 | Attendee recommendations | Scored exhibitor matches, reasons always shown | Sofia | AA | `entitlement:matchmaking` | — | M3 | P0 |
| J3 | Exhibitor prospect list | Recommended attendees for outreach | Elena | EP | `entitlement:matchmaking` | — | M3 | P1 |
| J4 | Priority placement | Boosted ranking for intelligence tier, capped | Elena | AA, EP | `entitlement:matchmaking` | `entitlement:matchmaking_priority` | M3 | P1 |
| J5 | Recommendation feedback | Save/dismiss loops feed scoring | Sofia | AA | `entitlement:matchmaking` | — | M3 | P1 |

### 4.11 Expo Copilot & Knowledge Base

| ID | Feature | Description | Personas | Surface | Organizer gate | Exhibitor gate | MS | Pri |
|---|---|---|---|---|---|---|---|---|
| K1 | KB ingestion pipeline | `kb_sources` → `kb_documents` → `kb_chunks` embedding | All (infra) | Worker | `entitlement:expo_copilot` | — | M3 | P0 |
| K2 | Copilot conversations | RAG-grounded, cited, streaming event guide | Sofia | AA | `entitlement:expo_copilot` | — | M3 | P0 |
| K3 | Actionable answers | Save booth / open booking directly from answers | Sofia | AA | `entitlement:expo_copilot` | — | M3 | P1 |
| K4 | Organizer KB sources | Upload docs/URLs into the event KB | Marcus | OC | `entitlement:expo_copilot` | n/a | M3 | P1 |
| K5 | Exhibitor auto-ingestion | Profiles, listings, uploaded docs auto-indexed | Elena | Worker | `entitlement:expo_copilot` | — | M3 | P0 |
| K6 | Answer feedback | Thumbs + report; feeds AI evals | Sofia | AA | `entitlement:expo_copilot` | n/a | M3 | P1 |

### 4.12 Lead Intelligence

| ID | Feature | Description | Personas | Surface | Organizer gate | Exhibitor gate | MS | Pri |
|---|---|---|---|---|---|---|---|---|
| L1 | Lead scoring | 0–100 score with reason codes | Jamal, Elena | EP | — | `entitlement:lead_intelligence` | M3 | P0 |
| L2 | AI interaction summaries | Per-lead narrative from visits/notes/meetings | Jamal, Elena | EP | — | `entitlement:lead_intelligence` | M3 | P0 |
| L3 | Firmographic enrichment | Company data via pluggable enrichment provider | Elena | EP | — | `entitlement:lead_intelligence` | M3 | P1 |
| L4 | Hot-lead alerts | Push alert when score crosses threshold | Jamal | EP | — | `entitlement:lead_intelligence` | M3 | P1 |

### 4.13 Follow-up Studio

| ID | Feature | Description | Personas | Surface | Organizer gate | Exhibitor gate | MS | Pri |
|---|---|---|---|---|---|---|---|---|
| M1 | AI-drafted sequences | Follow-ups grounded in actual booth interactions | Elena | EP | — | `entitlement:followup_studio` | M4 | P1 |
| M2 | Review & approval | Human edits/approves every message before send | Elena | EP | — | `entitlement:followup_studio` | M4 | P1 |
| M3 | Platform sending | Send via SES with per-exhibitor identity; delivery/open tracking | Elena | EP | — | `entitlement:followup_studio` | M4 | P1 |
| M4 | Export to CRM | Push drafted sequences to connected CRM instead | Elena | EP | — | `entitlement:followup_studio` + `entitlement:crm_sync` | M4 | P2 |

### 4.14 Organizer Pulse

| ID | Feature | Description | Personas | Surface | Organizer gate | Exhibitor gate | MS | Pri |
|---|---|---|---|---|---|---|---|---|
| N1 | NL analytics Q&A | Natural-language questions over event metrics | Priya | OC | `entitlement:organizer_pulse` | n/a | M4 | P1 |
| N2 | Live-day digest | Daily AI insight summary during live events | Priya, Marcus | OC | `entitlement:organizer_pulse` | n/a | M4 | P1 |
| N3 | Category gap insights | Under-served floor categories vs. attendee demand | Priya | OC | `entitlement:organizer_pulse` | n/a | M4 | P2 |

### 4.15 Analytics

| ID | Feature | Description | Personas | Surface | Organizer gate | Exhibitor gate | MS | Pri |
|---|---|---|---|---|---|---|---|---|
| O1 | Organizer event dashboard | Registrations, check-ins, scans, top booths | Priya, Marcus | OC | — | n/a | M2 | P0 |
| O2 | Exhibitor booth dashboard | Visits, leads, staff activity (near-real-time) | Elena | EP | — | — | M2 | P1 |
| O3 | Analytics suite | Funnels, segments, scheduled exports | Priya | OC | `entitlement:analytics_suite` | n/a | M3 | P1 |
| O4 | Real-time booth analytics | Live visit stream, dwell, peak-hour view | Elena | EP | — | `entitlement:booth_analytics_realtime` | M5 | P1 |
| O5 | Competitive benchmarks | Category percentile comparisons, anonymized | Elena | EP | — | `entitlement:competitive_benchmarks` | M5 | P2 |
| O6 | Portfolio analytics | Cross-event trends for organizer orgs | Priya | OC | `entitlement:analytics_suite` | n/a | M5 | P2 |
| O7 | Post-event report | Auto-generated organizer wrap-up report | Priya | OC | `entitlement:analytics_suite` | n/a | M4 | P2 |

### 4.16 Notifications

| ID | Feature | Description | Personas | Surface | Organizer gate | Exhibitor gate | MS | Pri |
|---|---|---|---|---|---|---|---|---|
| P1 | Transactional email | Invites, confirmations, meeting notices (SES) | All | Worker | — | — | M0 | P0 |
| P2 | Web push | VAPID push for PWA surfaces | Sofia, Jamal | AA, EP | — | — | M2 | P1 |
| P3 | In-app notification center | Unified feed per surface | All | All | — | — | M2 | P1 |
| P4 | Preferences & unsubscribe | Per-category opt-outs, one-click unsubscribe | All | All | — | — | M2 | P0 |
| P5 | Broadcast announcements | Organizer → attendee segment announcements | Marcus, Sofia | OC, AA | — | n/a | M2 | P1 |

### 4.17 Billing & Entitlements

| ID | Feature | Description | Personas | Surface | Organizer gate | Exhibitor gate | MS | Pri |
|---|---|---|---|---|---|---|---|---|
| Q1 | Entitlement resolution | `plans → subscriptions → entitlements` service + cache | All (infra) | API | — | — | M0 | P0 |
| Q2 | Manual provisioning | Platform admin grants plans/tiers/overrides | Alex | PA | — | — | M0 | P0 |
| Q3 | Organizer self-serve billing | Stripe subscriptions for organizer plans | Priya | OC | — | n/a | M4 | P1 |
| Q4 | Exhibitor tier purchase | In-portal Stripe Checkout upsell | Elena | EP | — | — | M4 | P0 |
| Q5 | Downgrade & expiry handling | Grace period, read-only fallback, seat reduction | All | API | — | — | M4 | P0 |
| Q6 | Billing portal & dunning | Invoices, payment methods, Stripe smart retries | Priya, Elena | OC, EP | — | — | M4 | P1 |

### 4.18 Public API & Webhooks

| ID | Feature | Description | Personas | Surface | Organizer gate | Exhibitor gate | MS | Pri |
|---|---|---|---|---|---|---|---|---|
| R1 | Public REST API v1 | Scoped read/write access per foundation §9 | Priya (integrations) | API | `entitlement:public_api` | n/a | M4 | P1 |
| R2 | API key management | Create, scope, rotate, revoke `api_keys` | Priya | OC | `entitlement:public_api` | n/a | M4 | P1 |
| R3 | Outbound webhooks | Signed, at-least-once domain event delivery | Priya (integrations) | API | `entitlement:webhooks` | n/a | M4 | P1 |
| R4 | Delivery log & redelivery | Inspect `webhook_deliveries`, manual replay | Priya | OC | `entitlement:webhooks` | n/a | M4 | P1 |
| R5 | Developer docs portal | Published OpenAPI 3.1 reference | Integrations | API | — | n/a | M4 | P2 |

Public API keys are issued to organizer orgs on the `enterprise` plan. Exhibitor programmatic access goes through CRM sync (H12); a scoped exhibitor API is in [44-future-expansion-plan.md](44-future-expansion-plan.md) — one seam (`api_keys` already org-generic) keeps that door open without building it now.

### 4.19 Platform Admin

| ID | Feature | Description | Personas | Surface | Organizer gate | Exhibitor gate | MS | Pri |
|---|---|---|---|---|---|---|---|---|
| S1 | Tenant & user directory | Search orgs/users/events, status views | Alex | PA | n/a | n/a | M0 | P0 |
| S2 | Read-only impersonation | Audited "view as" without write ability | Alex | PA | n/a | n/a | M2 | P1 |
| S3 | AI cost console | Per-event spend, ceilings, kill switches | Alex | PA | n/a | n/a | M3 | P0 |
| S4 | Platform audit log viewer | Query `audit_logs` across tenants | Alex | PA | n/a | n/a | M1 | P1 |
| S5 | Org-facing audit access | Enterprise orgs view their own audit trail | Priya | OC | `entitlement:audit_log_access` | n/a | M4 | P2 |
| S6 | Moderation queue | Reported content + AI-flagged items | Alex | PA | n/a | n/a | M3 | P2 |
| S7 | Retention & archival execution | Scheduled PII purge, event archival jobs | Alex | PA, Worker | n/a | n/a | M4 | P1 |

## 5. Gating Interaction Rules

1. **Organizer gate AND exhibitor gate both apply.** Example: exhibitor prospect recommendations (J3) require the organizer's `entitlement:matchmaking` and are visible to all exhibitor tiers; priority boost (J4) additionally requires the exhibitor's `entitlement:matchmaking_priority`.
2. **Gates fail closed but visible.** A user who lacks an entitlement sees the feature surface with an upgrade prompt (exhibitors) or a plan-contact prompt (organizers), never a 404. Exact behavior: FR-BILL-005/006 in [09-functional-requirements.md](09-functional-requirements.md).
3. **AI features degrade to deterministic equivalents** when budget-capped or killed (foundation §10); the deterministic feature is never entitlement-gated more strictly than its AI layer.

## 6. Explicitly Deferred (Phase-1 non-features)

Owned in detail by [44-future-expansion-plan.md](44-future-expansion-plan.md). Listed here so nobody re-litigates scope mid-build: paid ticketing/payments for attendees, native React Native apps (D3 seam is prepared), custom domains, EU data residency delivery, badge-printer hardware integrations (PDF badge F6 is the Phase-1 answer), indoor turn-by-turn navigation, multi-language UI content (i18n readiness is in scope — see [10-non-functional-requirements.md](10-non-functional-requirements.md) §9), exhibitor-scoped public API, white-labeling, sponsorship/ad inventory.

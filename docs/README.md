# Concourse — Blueprint Documentation Index

This directory is the complete Phase-1 architecture blueprint for **Concourse**, the AI-native trade show intelligence platform. It is documentation only — no production code lives here.

## How to use this blueprint

1. **Read [00-foundation.md](00-foundation.md) first, always.** It is the single locked source of truth for product identity, personas, the business model, canonical routes, the technology stack, the full entity registry, tenancy and permission vocabulary, API conventions, the AI feature set, naming conventions, the glossary, the complete document registry (§13), and the amendments log (§14) recording every deviation from an earlier locked decision.
2. Every other document goes deep on one area and defers to `00-foundation.md` rather than restating its decisions. If a document appears to contradict the foundation, the foundation wins — file it as an inconsistency (see "Known gaps" below) rather than trusting the contradicting document.
3. Cross-references between documents are relative markdown links in the form `[NN-file.md](NN-file.md)` — click through rather than guessing scope from a filename.
4. No document may contain the literal placeholder "TBD." Every open question is either resolved with a stated, justified decision or explicitly assigned to [44-future-expansion-plan.md](44-future-expansion-plan.md) with a revisit criterion.

## Status legend

- **Locked** — written and binding. Every other document must conform to it; changes are recorded in [00-foundation.md](00-foundation.md) §14's Amendments Log, not made silently.
- **Planned** — scope is fixed in the §13 registry but the document has not been written yet.

As of this index, **every registry entry (00–46 plus this README) is Locked** — Phase 1 of the blueprint is complete.

## Documents by section

### Foundation & Strategy
| Doc | Title | Scope |
|---|---|---|
| 00 | [Foundation](00-foundation.md) | Canonical decision record — product identity, personas, business model, routes, tech stack, entity registry, tenancy/permission vocabulary, API conventions, AI feature set, naming conventions, glossary, document registry, amendments log |
| 01 | [Product Vision](01-product-vision.md) | Problem, differentiators, north-star metric, non-goals |
| 02 | [Business Goals](02-business-goals.md) | Revenue model, segments, GTM phases, KPI tree, competitive positioning, risks |
| 03 | [User Personas](03-user-personas.md) | The six canonical personas plus anti-personas |

### Journeys
| Doc | Title | Scope |
|---|---|---|
| 04 | [User Journey](04-user-journey.md) | Cross-persona lifecycle, handoffs, journey design principles (JP-1…JP-8) |
| 05 | [Organizer Journey](05-organizer-journey.md) | Priya/Marcus step-by-step flows, O-1…O-10 |
| 06 | [Exhibitor Journey](06-exhibitor-journey.md) | Elena/Jamal step-by-step flows, offline capture mechanics (JP-2) |
| 07 | [Attendee Journey](07-attendee-journey.md) | Sofia step-by-step flows, consent moments (JP-6), low-connectivity behavior |

### Requirements
| Doc | Title | Scope |
|---|---|---|
| 08 | [Feature Matrix](08-feature-matrix.md) | Canonical feature inventory, milestones M0–M5, entitlement key registry |
| 09 | [Functional Requirements](09-functional-requirements.md) | Testable FR-* requirements behind every feature-matrix row |
| 10 | [Non-Functional Requirements](10-non-functional-requirements.md) | Performance/scale budgets, availability, i18n readiness, AI cost budgets |

### Frontend Architecture
| Doc | Title | Scope |
|---|---|---|
| 11 | [Information Architecture](11-information-architecture.md) | Surface→entity mapping, context nesting, canonical route map, search architecture |
| 12 | [Navigation Structure](12-navigation-structure.md) | Nav trees, switchers, breadcrumbs, command palette, deep-linking |
| 13 | [Application Layout](13-application-layout.md) | Shell components per surface, breakpoints, page/state taxonomy |
| 14 | [Page Inventory](14-page-inventory.md) | Every route specified once: components, data, access, states |
| 15 | [Component Inventory](15-component-inventory.md) | The concrete component list and where each is used |

### Data & Backend Architecture
| Doc | Title | Scope |
|---|---|---|
| 16 | [Database Schema](16-database-schema.md) | Column-level schema for every entity, indexes, RLS policies |
| 17 | [Offline & Sync Architecture](17-offline-sync-architecture.md) | Service worker, IndexedDB schema, background sync, conflict resolution |
| 18 | [API Architecture](18-api-architecture.md) | REST service topology, contract pipeline, conventions, realtime, public API, webhooks |
| 19 | [Authentication Strategy](19-authentication-strategy.md) | Credential/OAuth/passkey/magic-link/SSO flows, invite tokens |
| 20 | [Session Strategy](20-session-strategy.md) | Session/token mechanics, device management, revocation, offline replay window |
| 25 | [Event Pipeline](25-event-pipeline.md) | Transactional outbox, domain event catalog, fan-out to workers/webhooks/analytics |
| 26 | [File Storage](26-file-storage.md) | Supabase Storage layout, presigned upload flow, AV scanning, retention |
| 27 | [Background Jobs Architecture](27-background-jobs-architecture.md) | Worker deployable, BullMQ queue catalog, retry/backoff, scheduling |
| 37 | [Monorepo & Folder Structure](37-monorepo-and-folder-structure.md) | Concrete repo tree, package boundaries, build/dependency graph |

### AI & Intelligence
| Doc | Title | Scope |
|---|---|---|
| 21 | [AI Architecture](21-ai-architecture.md) | AI service boundary, model routing, per-feature specs, evals, cost, guardrails |
| 22 | [RAG Architecture](22-rag-architecture.md) | Retrieval pipeline: chunking, embedding, hybrid search, reranking, citation assembly |
| 23 | [Knowledge Base Architecture](23-knowledge-base-architecture.md) | KB source/document/chunk lifecycle, ingestion pipeline, quarantine/moderation |
| 24 | [Matchmaking & Scoring](24-matchmaking-and-scoring.md) | Deterministic Smart Matchmaking scoring model, weights, golden-set tuning |

### Platform Services
| Doc | Title | Scope |
|---|---|---|
| 28 | [Permission Model](28-permission-model.md) | Role→permission matrix, entitlement check semantics, cross-tenant read paths |
| 29 | [Audit Logging Architecture](29-audit-logging-architecture.md) | What is logged, immutability, retention, platform vs. org-facing viewers |
| 30 | [Help Center & Support](30-help-center-and-support.md) | Help Center content model, in-app contextual help, support escalation path |
| 31 | [Observability](31-observability.md) | OTel spans/metrics, logging, dashboards, alerting, on-call |
| 32 | [Analytics Architecture](32-analytics-architecture.md) | Event taxonomy, metric catalog, organizer/exhibitor reports and exports |
| 33 | [Notification System](33-notification-system.md) | Notification model, channels (email/push/in-app), preferences, templates |
| 34 | [Feature Flags & Experimentation](34-feature-flags-and-experimentation.md) | Flag naming/lifecycle, per-tenant rollout, kill-switch patterns, PostHog integration |
| 35 | [Integrations & Connectors](35-integrations-and-connectors.md) | CRM sync, registration import, enrichment providers, connector framework |
| 36 | [Billing & Payments Architecture](36-billing-and-payments-architecture.md) | Stripe Billing integration: checkout, webhooks, proration, dunning, tier changes |
| 38 | [Data Retention, Privacy & Compliance](38-data-retention-privacy-compliance.md) | Retention schedules, DSAR/erasure mechanics, consent architecture, GDPR posture |

### Design & Components
| Doc | Title | Scope |
|---|---|---|
| 39 | [Design System](39-design-system.md) | Marquee design tokens, theming, accessibility, voice & tone, iconography |
| 40 | [UI Component Library](40-ui-component-library.md) | Component APIs, engineering conventions, versioning policy |

### Quality & Security
| Doc | Title | Scope |
|---|---|---|
| 41 | [Error Code Registry](41-error-code-registry.md) | Machine-readable error code catalog with HTTP status mapping |
| 42 | [Testing Strategy](42-testing-strategy.md) | Unit/integration/E2E strategy, fixtures, CI gates, a11y test gates |
| 43 | [Security Architecture](43-security-architecture.md) | Threat model, encryption, secrets management, supply chain, compliance posture |

### Planning
| Doc | Title | Scope |
|---|---|---|
| 44 | [Future Expansion Plan](44-future-expansion-plan.md) | Every explicitly deferred item, consolidated with revisit criteria |
| 45 | [Implementation Roadmap](45-implementation-roadmap.md) | Milestone sequencing, staffing shape, dependency ordering |

### Marketing
| Doc | Title | Scope |
|---|---|---|
| 46 | [Marketing Site](46-marketing-site.md) | Public marketing site: landing, pricing, about, contact, help center entry, legal |

## Distributed topics

Two areas are deliberately covered across several documents rather than owned by a single one (see [00-foundation.md](00-foundation.md) §13):

- **Admin Panel** — routes in [11-information-architecture.md](11-information-architecture.md) §4.8, features in [08-feature-matrix.md](08-feature-matrix.md) §4.19, audit viewer in [29-audit-logging-architecture.md](29-audit-logging-architecture.md), AI ops console in [21-ai-architecture.md](21-ai-architecture.md).
- **User Profiles / Settings** — identity model in [19-authentication-strategy.md](19-authentication-strategy.md), every settings/account route specified once in [14-page-inventory.md](14-page-inventory.md).

Reports are owned by [32-analytics-architecture.md](32-analytics-architecture.md), since a report is a persisted view over the same metric catalog rather than a separate system.

## Known gaps

None as of this writing — every registry entry in [00-foundation.md](00-foundation.md) §13 (00 through 46, plus this README) has a corresponding file on disk. This section exists so a future author has a place to flag a gap rather than assuming completeness; if you find a registry entry with no file, or a file that has drifted from the registry's stated scope, record it here and in the Amendments Log ([00-foundation.md](00-foundation.md) §14) rather than silently patching it.

# Blueprint V1.0 — ExAi

| | |
|---|---|
| **Blueprint Version** | 1.0 (reconciled against `00-foundation.md` §14 Amendment A5 — see note below) |
| **Date** | 2026-07-11 |
| **Product Name** | **ExAi** |
| **Architecture Status** | **Frozen** |
| **Next Phase** | Engineering |

> **Architecture-drift reconciliation note.** Shortly after this freeze, the founder adopted **Supabase** as the managed platform for Database, Auth, Storage, and Realtime (`00-foundation.md` §14 Amendment A5), superseding the AWS RDS, in-house NestJS auth module, WorkOS, S3+CloudFront, and Socket.IO choices this document originally summarized. `19-authentication-strategy.md`, `20-session-strategy.md`, `26-file-storage.md`, and `18-api-architecture.md` §7 have since been fully rewritten against Supabase, every business rule and permission model preserved unchanged; every other document referencing the old stack has been swept and corrected. This document (and the table below) reflects that reconciled, single-architecture state — there is no longer a "pending revision" gap anywhere in `/docs`.

> **Naming note.** Every document in `/docs` (00–46) was authored under the internal architecture codename **`Concourse`**, which `00-foundation.md` §1 always flagged as "replaceable via find-and-replace." As of this freeze, **ExAi** is the product's real name. The codename is left in place through the body of the 47 architecture documents rather than mechanically rewritten at freeze time (see `00-foundation.md` §14, Amendment A4) — a repo-wide rename is tracked as a non-blocking Milestone-0 chore in [IMPLEMENTATION_PHASES.md](IMPLEMENTATION_PHASES.md). Every reference below to "the architecture" or a numbered doc means the Concourse-codenamed blueprint; it is ExAi's architecture.

This document is the one-page executive summary of the frozen blueprint. It does not restate architecture — it points at the 47 documents (00 through 46, plus `README.md`) in `/docs` that constitute the actual, binding design. If anything here ever disagrees with a numbered document, **the numbered document wins**; file the discrepancy as a bug against this summary, not against the architecture.

---

## 1. Approved Technology Stack

Canonical source: [00-foundation.md](00-foundation.md) §6.

| Layer | Choice |
|---|---|
| Monorepo | pnpm 9 workspaces + Turborepo 2 |
| Web app | Next.js 15 (App Router, React 19, RSC-first), installable PWA |
| Styling / UI | Tailwind CSS 4 + Radix UI primitives (vendored component library, not a dependency) |
| API service | NestJS 11 on Fastify; OpenAPI 3.1 generated from code |
| Worker service | Node 22 + BullMQ 5 |
| Database | **Supabase-managed PostgreSQL 15 + pgvector** (HNSW indexes), Drizzle ORM |
| Cache / queues / rate limits | Redis 7 (BullMQ, rate-limit buckets, Attendee Continuity Token store — no longer holds user sessions) |
| Realtime | **Supabase Realtime** (Broadcast/Presence channels, RLS-authorized) |
| Validation | Zod 3, shared across API and client |
| AI — generation/classification | Claude API (`claude-fable-5`, `claude-haiku-4-5`) |
| AI — embeddings/rerank | Voyage AI (`voyage-3.5`, `rerank-2.5`) |
| Auth | **Supabase Auth** — email/password, OAuth (Google/Microsoft/LinkedIn), magic links (attendees), WebAuthn/passkeys, native SAML/OIDC SSO (enterprise, M4); JWT access/refresh sessions, with a Custom Access Token Hook enforcing the attendee 8-hour hard session cap |
| Billing | Stripe Billing |
| Email | AWS SES + React Email, via the notification service only |
| File storage | **Supabase Storage** (RLS-gated private buckets, signed URLs, built-in CDN); AV scanning via self-hosted ClamAV in the worker fleet |
| Hosting | Vercel (web), AWS ECS Fargate (API/worker), Supabase-managed infrastructure (Database/Auth/Storage/Realtime) |
| IaC / CI | Terraform; GitHub Actions + Turborepo affected-graph |
| Observability | Sentry, OpenTelemetry → Grafana Cloud, PostHog |
| Testing | Playwright, Vitest, Testcontainers |

## 2. Current Modules

The full, current module list is [08-feature-matrix.md](08-feature-matrix.md) (feature-level) and [37-monorepo-and-folder-structure.md](37-monorepo-and-folder-structure.md) (package-level). Top-level domains:

| Domain | Owning docs |
|---|---|
| Identity, tenancy, auth, sessions | 16, 19, 20, 28 |
| Event setup, floor & booths, exhibitor onboarding | 05, 06, 11 §2, 16 |
| Registration, badging, agenda | 07, 09, 16 |
| Lead capture, offline sync, meetings | 06, 17, 25 |
| Smart Matchmaking, Expo Copilot, Lead Intelligence, Follow-up Studio, Organizer Pulse (the AI layer) | 21, 22, 23, 24 |
| Analytics, reporting, notifications | 32, 33 |
| Billing, entitlements, integrations | 28, 34, 35, 36 |
| Platform services (files, jobs, audit, help center, observability) | 26, 27, 29, 30, 31 |
| Frontend architecture (IA, nav, layout, pages, components, design system) | 11, 12, 13, 14, 15, 39, 40 |
| Quality & security (errors, testing, security, privacy) | 38, 41, 42, 43 |
| Marketing site | 46 |
| Planning | 44, 45 |

## 3. User Roles

Canonical source: [00-foundation.md](00-foundation.md) §3, §8; full matrix in [28-permission-model.md](28-permission-model.md).

| Persona | Role string(s) | Surface |
|---|---|---|
| Priya Sharma (organizer admin) | `org:owner` / `org:admin`, `event:admin` | Organizer Console |
| Marcus Webb (organizer staff) | `org:member`, `event:staff` | Organizer Console |
| Elena Rodriguez (exhibitor admin) | `org:owner` / `org:admin`, `exhibitor:admin` | Exhibitor Portal |
| Jamal Carter (exhibitor rep) | `exhibitor:rep` | Exhibitor Portal (mobile/PWA) |
| Sofia Lindqvist (attendee) | `attendee` (per registration) | Attendee App (mobile/PWA) |
| Alex Kim (platform admin, internal) | `platform:admin` | Platform Admin |

Permissions are `resource:action` strings; paid features are gated by entitlement keys, never plan names ([00-foundation.md](00-foundation.md) §4, §8).

## 4. AI Architecture Summary

Canonical source: [21-ai-architecture.md](21-ai-architecture.md), [22-rag-architecture.md](22-rag-architecture.md), [23-knowledge-base-architecture.md](23-knowledge-base-architecture.md), [24-matchmaking-and-scoring.md](24-matchmaking-and-scoring.md).

- **One service boundary.** All model calls run through a single `AiModule` in `packages/ai`; no other package may call a model provider directly (enforced by lint rule, not convention).
- **Five canonical AI features**, each with a deterministic fallback so the platform is fully usable with AI off: **Expo Copilot** (RAG-grounded attendee guide), **Smart Matchmaking** (deterministic scoring + AI-written reasons), **Lead Intelligence** (deterministic scoring + AI summaries), **Follow-up Studio** (AI-drafted, human-approved outreach), **Organizer Pulse** (NL analytics over a curated metric catalog, never raw SQL).
- **Model routing:** `claude-haiku-4-5` by default; `claude-fable-5` only for long-form prose or multi-step reasoning shown to users.
- **Retrieval:** pure-vector (Voyage `voyage-3.5` + `rerank-2.5`), tenant- and entitlement-filtered at query time, citation-mandatory for Copilot.
- **Guardrails:** prompt injection from exhibitor-supplied content is the top-ranked threat; defenses are layered (tenant isolation before the model, structural delimiting with nonces, ingestion-time screening, capability minimization, adversarial eval suite).
- **Cost controls:** per-event and per-exhibitor budgets, Redis-enforced pre-flight checks, automatic degradation to deterministic fallback at 100% of budget.

## 5. Database Version

- **Engine:** Supabase-managed PostgreSQL 15 + pgvector (`00-foundation.md` §14 Amendment A5 supersedes the original AWS RDS 16 choice; the schema itself is engine-version-portable and unaffected).
- **Schema document:** [16-database-schema.md](16-database-schema.md), version **1.1** — the original schema plus the Amendment-A3 consolidation pass that registered 16 additional tables/columns and reconciled two enum conflicts (`event_exhibitors.status`, `auth_sessions.revoked_reason`). Amendment A5 did not change the schema itself, only how it's hosted and how `auth_sessions`/`password_hash`/`webauthn_credentials` are populated (now mirrored from or superseded by Supabase Auth's own `auth` schema — see [19](19-authentication-strategy.md)/[20](20-session-strategy.md)).
- **Tenancy model:** shared schema, Postgres Row-Level Security on every tenant-owned table, `organization_id`-scoped, enforced behind application-level scoping as defense-in-depth ([00-foundation.md](00-foundation.md) §8) — with one named exception: Supabase Storage's `storage.objects` table, where RLS is the *primary* control, not merely a backstop ([26-file-storage.md](26-file-storage.md) §12).
- **Migrations:** Drizzle ORM + drizzle-kit, SQL-first, schema lives in `packages/database`, run against the Supabase Postgres connection string.

## 6. Folder Structure Version

- **Document:** [37-monorepo-and-folder-structure.md](37-monorepo-and-folder-structure.md), version **1.0**.
- **Shape:** pnpm/Turborepo monorepo — `apps/web`, `apps/api`, `apps/worker`; `packages/ui`, `packages/database`, `packages/shared`, `packages/ai`, `packages/api-client`, `packages/api-contract`, plus supporting packages; `infra/`, `evals/`, `docs/`.
- **Enforcement:** dependency-graph rules (e.g. no package but `packages/ai` may import a model-provider SDK) are enforced by lint rule and Turborepo task graph, not convention alone.

## 7. Next Phase: Engineering

The blueprint is frozen. Engineering work proceeds per:

- [ENGINEERING_GUIDE.md](ENGINEERING_GUIDE.md) — how to approach this repository, read order, philosophy, standards, workflow.
- [IMPLEMENTATION_RULES.md](IMPLEMENTATION_RULES.md) — permanent, non-negotiable engineering rules.
- [IMPLEMENTATION_PHASES.md](IMPLEMENTATION_PHASES.md) — milestone-by-milestone build plan.

No application code, project scaffolding, UI, or authentication implementation is part of this blueprint. Those begin in Milestone 0 per [IMPLEMENTATION_PHASES.md](IMPLEMENTATION_PHASES.md), under the rules in [IMPLEMENTATION_RULES.md](IMPLEMENTATION_RULES.md).

# CODEBASE_AUDIT

**Date:** July 22, 2026
**Auditor:** Principal Engineer
**Scope:** Full monorepo — apps/api, apps/web, apps/worker, packages/*

---

## 1. MONOREPO STRUCTURE

### Workspace Layout
```
apps/
  web/       Next.js 15 (React 19, App Router) → Vercel
  api/       NestJS 11 (Fastify adapter) → Railway/Render
  worker/    BullMQ queue consumers → Railway/Render

packages/
  shared/       Zod schemas, constants, i18n (zero internal deps)
  ui/           Marquee design system (Radix-based components)
  api-client/   Typed fetch client (OpenAPI codegen — not yet wired)
  api-contract/ Zod schemas + OpenAPI 3.1 artifact
  database/     Drizzle ORM schema, migrations, seed data
  ai/           AI gateway, generation, embedding, guardrails
  config/       Shared ESLint/TS/Prettier/Vitest configurations
  flags/        PostHog feature flag boundary
  notifications/ Email templates, AWS SES, web-push
```

**Build tooling:** Turborepo 2.x with `pnpm@9.15.0`. `turbo.json` caches `.next/**` and `dist/**`.

---

## 2. FRONTEND (apps/web)

### Routes
- **55+ pages** across 6 route groups: `(marketing)`, `(auth)`, `(attendee)`, `(portal)`, `(console)`, `(admin)`
- Plus `/demo/*` (20 pages), `/hackathon/*` (2 pages), and auth route handlers
- **40 components** are `"use client"` — significant JS bundle contribution

### Critical Frontend Issues

| Issue | Severity | Location |
|-------|----------|----------|
| **Vercel OIDC token committed** | CRITICAL | `apps/web/.env.local` lines 5-6 |
| **Demo admin unprotected** | HIGH | `/demo/admin` — no auth, anyone controls simulation |
| **No error boundary** | MEDIUM | Zero `error.tsx` files anywhere |
| **Demo pages mixed with production** | MEDIUM | `/hackathon` is live but shares PERSPECTIVES nav with demo |
| **Silent error swallowing** | MEDIUM | `lib/organizer.ts`, `lib/exhibitor.ts` return `undefined` on failure |
| **Inconsistent API patterns** | MEDIUM | Mix of raw `fetch()` and typed api-client |
| **Polling every 5-8s** | LOW | 4 components re-fetch on intervals: `LiveMetricsBar`, `RecentActivityFeed`, `LiveDemoStats`, `SimulationStatusBadge` |
| **Duplicate DemoPageHeader** | LOW | Two implementations: `shell.tsx` and `demo-page-header.tsx` |
| **Missing loading.tsx** | LOW | 4 portal/console routes lack skeletons |

### Patterns (Good)
- Route groups with layout composition
- `"use client"` correctly applied for interactivity
- `server-only` directive on server-side utilities
- Supabase SSR properly implemented (server client, browser client, middleware)
- Suspense for route params (Next.js 15 Promise pattern)

### Patterns (Bad)
- Global error handling absent — no `global-error.tsx`
- API client bypassed in many places (raw fetch instead)
- Loading states missing for several routes

---

## 3. API BACKEND (apps/api)

### Architecture
- NestJS 11 with Fastify (not Express)
- 20 modules, most are stubs (see Module Status table)
- `DATABASE_CLIENT` injection token prevents direct `db` imports
- Request context via `AsyncLocalStorage` (populated only by guards)

### Module Status

| Module | Status | Controllers | Production |
|--------|--------|-------------|-------------|
| `engagement` | **FULL** | 14 | Yes |
| `auth` | **PARTIAL** | 1 | No (stubs, Supabase is auth authority) |
| `events` | **PARTIAL** | 1 | No (empty) |
| `ai` | **WIRING ONLY** | 0 | Imports from `@concourse/ai` |
| `health` | **FULL** | 1 | Yes |
| `knowledge-base` | **STUB** | 0 | Milestone 0 scaffolding |
| `billing` | **STUB** | 0 | No Stripe integration |
| `notifications` | **STUB** | 0 | No dispatch |
| `search` | **STUB** | 0 | — |
| `files` | **STUB** | 0 | — |
| `webhooks` | **STUB** | 0 | — |
| `api-keys` | **STUB** | 0 | — |
| `admin` | **STUB** | 0 | — |
| `users` | **STUB** | 0 | — |
| `products` | **STUB** | 0 | — |
| `floor` | **STUB** | 0 | — |
| `matchmaking` | **STUB** | 0 | All weights = 0 |
| `registrations` | **STUB** | 0 | — |
| `agenda` | **PARTIAL** | 0 | Has service, no controller |

### Auth Patterns (Inconsistent — 3 approaches)
1. **Guards** — `SupabaseRequestContextGuard` + `OrganizationAuthorizationGuard` (proper)
2. **Manual header parsing** — Some handlers read Authorization directly (inconsistent)
3. **No auth** — Public endpoints intentionally open

### Critical API Issues

| Issue | Severity | Location |
|-------|----------|----------|
| **Public demo endpoints expose PII** | HIGH | `demoExhibitorVisitors()` returns names/companies publicly |
| **ProblemDetailsFilter unimplemented** | HIGH | `src/common/problem-details.filter.ts` — stub throws no mapped errors |
| **No validation pipes** | HIGH | No global `ValidationPipe`, no DTO validation |
| **Demo auto-starts in non-production** | MEDIUM | `demo-simulation.service.ts:98-106` |
| **Demo endpoints publicly accessible** | MEDIUM | All `/v1/public/demo/*` have zero auth |
| **auth_tokens table has no RLS** | MEDIUM | Only `app_platform` role can access |
| **attendee PII publicly exposed** | MEDIUM | `GET /v1/public/demo/exhibitor/:id/visitors` |
| **AsyncLocalStorage unpopulated** | MEDIUM | Nothing sets context (comment: "no Fastify onRequest hook wired") |
| **Raw SQL template strings** | LOW | `public-exhibitors.service.ts:575,620` — not parameterized |

### API Response Patterns
- **No standard response envelope** — controllers return raw objects
- **No RFC 9457 problem details** — exception filter is a stub
- **Global guards not applied** — guards are per-controller only
- **No global validation** — each handler validates independently

---

## 4. DATABASE (packages/database)

### Schema Quality: HIGH
- Consistent `snake_case` naming throughout
- Comprehensive RLS with `app_tenant` and `app_platform` roles
- UUIDv7 for time-ordered IDs (`concourse.uuid_generate_v7()`)
- GIN indexes for full-text search, HNSW for vector embeddings
- Immutable triggers on `lead_submissions` + `lead_submission_values`
- Consent-based profile sharing via `attendee_profile_consents`

### Table Count: 25+ tables
Well-structured: `organizations`, `users`, `organization_memberships`, `auth_sessions`, `api_keys`, `events`, `event_exhibitors`, `lead_forms`, `lead_submissions`, `lead_intelligence`, `exhibitor_relationships`, `exhibitor_relationship_notes`, `kb_sources`, `kb_documents`, `kb_chunks`, etc.

### Missing Indexes (Production Risk)

| Table | Missing Index | Hot Path |
|-------|---------------|----------|
| `exhibitor_relationships` | `attendee_user_id` | "Get all relationships for attendee X" |
| `exhibitor_relationship_notes` | `created_by_user_id` | "All notes by user X" |
| `lead_submissions` | `event_id` | Event-level aggregation across exhibitors |
| `kb_sources` | `status` | Processing queue queries |

### Database Issues

| Issue | Severity | Location |
|-------|----------|----------|
| **Connection pool max=10** | MEDIUM | `packages/database/src/client.ts:18` — may be low for production |
| **`prepare: false`** | LOW | Query plan cache disabled (security vs performance) |
| **Inconsistent ID gen** | LOW | `entitlements` uses `defaultRandom()` instead of `uuidv7` |
| **No down migrations** | LOW | All 19 migrations are forward-only |
| **N+1 in enrichment** | MEDIUM | `record_profile_enrichments()` does N subqueries for N relationships |
| **public_enrollments no RLS** | LOW | Only `app_platform` accesses — acceptable |

### Migration Inventory: 19 migrations (0001–0019)
All tracked in `_journal.json`. No down migrations. All breakpoints set.

---

## 5. AI MODULE (packages/ai)

### Services
| Service | Status | Production |
|---------|--------|------------|
| `AiGenerationService` | Working | Conditional (no budget enforcement) |
| `AiEmbeddingService` | Working | Conditional |
| `AiGuardrailService` | Partial | Conditional |
| `AiBudgetService` | **STUB** | No spend controls |
| `AiGatewayService` | **STUB** | All calls bypass gateway |
| `AiClassificationService` | **STUB** | Not wired |
| `RetrievalService` | Partial | Functional basic vector search |
| `PromptRegistry` | **STUB** | No prompt versioning |

### AI Security Issues

| Issue | Severity | Location |
|-------|----------|----------|
| **ClamAV malware scan waived** | CRITICAL | `upload-security.ts:83` — restore before production |
| **API keys read at runtime** | MEDIUM | No startup validation |
| **No budget enforcement** | HIGH | `AiBudgetService` is stub — no AI spend controls |
| **Gateway bypassed** | MEDIUM | All AI calls directly to provider services |
| **Env var mismatch** | LOW | `.env.example` has `ANTHROPIC_API_KEY` and `VOYAGE_API_KEY` but code uses `NVIDIA_API_KEY` |

### Knowledge Base Ingestion
- PDF, PPTX, TXT extraction working
- URL scraping with SSRF protection
- 1600-char chunks, 200-char overlap
- HNSW vector index on `kb_chunks.embedding`
- **ClamAV disabled for MVP** — re-enable before production

---

## 6. WORKER (apps/worker)

### Queue Consumers
10 consumers defined in `src/queues/`. Only 2 are implemented:
- `kb-ingest.consumer.ts` — functional (polls every 5s)
- `ai-batch.consumer.ts` — likely functional (not audited in depth)

8 are stubs throwing `"not implemented"`:
- `exports`, `file-av-scan`, `imports`, `lead-voice-transcription`, `notification-dispatch`, `webhook-deliver`, `analytics-ingest`

### Outbox Relay
`src/outbox-relay/outbox-relay.ts` is a stub — `writeOutboxEvent()` throws "not implemented" in `packages/database/src/outbox.ts`.

---

## 7. CONFIGURATION ISSUES

### TypeScript: API moduleResolution Break
- `apps/api/tsconfig.json` extends `node.json` which sets `"moduleResolution": "Node10"` and `"module": "CommonJS"`
- **This breaks with pnpm isolated symlinks** — `@supabase/supabase-js` and `rxjs` type declarations not found
- **This is why `pnpm build` fails on API** — pre-existing, not caused by our changes
- Fix: Change to `"moduleResolution": "Bundler"` or `"NodeNext"`

### ESLint
- 3 configs: `base.js`, `next.js`, `nestjs.js` — well-structured
- SDK containment rules: AI SDK restricted to `packages/ai`, AWS SDK to `packages/notifications`

### Build
- `turbo.json` caches `.next/**` and `dist/**` — correct
- `vercel.json` root: `buildCommand: "pnpm --filter web... build"` — deploys web only

---

## 8. DEPENDENCY GRAPH

### Clean Architecture
- `packages/shared` has zero internal dependencies — excellent
- SDK containment: AI SDK → `packages/ai`, AWS SDK → `packages/notifications`
- Database client injected via token, not imported directly

### Concerns
- `apps/api` imports from `apps/api/dist` via serverless handler — circular potential
- `apps/web` imports from `apps/api/dist` via `lib/api/serverless-handler.ts`
- `apps/web` depends on `@supabase/ssr` which resolves `@supabase/supabase-js` transitively

---

## 9. TESTING

### Coverage
- `packages/shared/src/constants/organization-roles.test.ts` — 3 tests for role constants
- `packages/database/src/identity-rls.test.ts` — RLS policy tests (marked UNVERIFIED — no Docker in sandbox)
- No test files found for: api, web, worker, ai, ui, notifications, flags

### Test Infrastructure
- Vitest configured in `packages/config/vitest/base.ts`
- `passWithNoTests: true` — tolerant of empty packages
- Testcontainers configuration exists (`packages/config/testcontainers/`) but not usable in sandbox

### CI
- `ci.yml` runs lint, typecheck, test, build Docker
- No E2E in CI yet (Playwright exists in `apps/web/e2e/` but not run in CI)

---

## 10. SECURITY AUDIT

| Finding | Severity | Location |
|---------|----------|----------|
| **Vercel OIDC token in .env.local** | CRITICAL | `apps/web/.env.local:5-6` |
| **ClamAV disabled for MVP** | CRITICAL | `packages/ai/src/knowledge/upload-security.ts:83` |
| **Demo admin unprotected** | HIGH | `/demo/admin` — simulation controls exposed |
| **Public demo PII exposure** | HIGH | `demoExhibitorVisitors()` — names/companies public |
| **attendee_profile without guard** | MEDIUM | Exhibitor can read profiles via `exhibitor_can_read_attendee_profile()` function |
| **No auth on /v1/public/demo/\*** | MEDIUM | All demo simulation endpoints open |
| **IP logging in auth_sessions** | LOW | `inet` column for `ip_address` — legal concern |
| **No rate limiting** | MEDIUM | No rate limiting on public endpoints |
| **API keys hashed** | GOOD | `api_keys.secret_hash` — not stored in plaintext |
| **Password hash inert** | GOOD | Per Amendment A5 — Supabase Auth authoritative |
| **RLS on all tenant tables** | GOOD | Comprehensive tenant isolation |

---

## 11. PERFORMANCE AUDIT

| Area | Finding | Severity |
|------|---------|----------|
| **Bundle size** | 40 client components — high JS payload | MEDIUM |
| **Polling** | 4 components re-fetch every 5-8s | MEDIUM |
| **Analytics queries** | Complex multi-CTE SQL on every request, no caching | HIGH |
| **Dashboard queries** | Single large SQL query per request, no caching | HIGH |
| **DB connection pool** | max=10 — may bottleneck under load | MEDIUM |
| **No CDN config** | No explicit Cache-Control headers from API | LOW |
| **Demo analytics store** | In-memory, resets on restart | N/A (demo only) |

---

## 12. NAMING & QUALITY

### Inconsistent Patterns
1. `DemoPageHeader` — two implementations in different files
2. Auth — three different auth patterns (guards, manual, none)
3. Error handling — 4 different patterns (silent undefined, inline messages, EmptyState, DemoUnavailable)
4. API calls — mix of typed client and raw fetch
5. Loading states — skeleton files missing for 4 routes
6. API response — no standard envelope, no RFC 9457 formatting

### File Path Inconsistency
- Database schema files use snake_case: `event_exhibitors`, `exhibitor_relationships`
- Frontend files use kebab-case for dirs: `event-exhibitors`, `relationship-workspace`
- Frontend files use camelCase for files: `analyticsTracker.tsx`, `liveMetrics.tsx`

---

## 13. DEAD CODE & UNFINISHED FEATURES

### Unused But Present
- `packages/api-contract/openapi/concourse.v1.json` — empty `{}` — codegen not wired
- `packages/shared/src/types/index.ts` — empty `{}` — unpopulated
- `packages/api-contract/src/validation-pipe.ts` — empty `{}`
- `apps/api/src/common/problem-details.filter.ts` — explicit stub with no-op implementation

### Stubs (by design — future milestones)
- 12 of 20 API modules are stubs
- `AiBudgetService` — stub (no spend controls)
- `AiGatewayService` — stub (no orchestration)
- `PromptRegistry` — stub (no prompt versioning)
- All 8 worker queue consumers not implemented
- Outbox pattern not implemented
- Matchmaking not implemented (weights all 0)
- Billing not implemented (Stripe not wired)
- Webhooks not implemented

---

## SUMMARY SCORES

| Category | Score | Notes |
|----------|-------|-------|
| Architecture | 8/10 | Clean layered design, good package boundaries |
| Frontend quality | 6/10 | No error boundaries, mixed API patterns, demo/prod bleed |
| API quality | 5/10 | No validation, no error standardization, inconsistent auth |
| Database design | 8.5/10 | Excellent RLS, consistent naming, good indexes |
| AI module | 5/10 | Generation works, budget/gateway stubs, ClamAV waived |
| Testing | 2/10 | Minimal tests, no E2E in CI |
| Security | 5/10 | PII exposure, no rate limiting, demo admin open |
| Performance | 6/10 | No analytics caching, DB pool size, 40 client components |
| DevEx | 7/10 | Good config packages, broken API build blocks dev |

**Overall: 5.8/10** — Production-viable with critical fixes needed.
# ExAi Project Context

**Snapshot date:** 2026-07-13  
**Architecture:** Blueprint v1.0, frozen 2026-07-11  
**Engineering stage:** Milestone 0 — Platform Foundation (in progress)

This file is an implementation handoff, not a replacement for the frozen blueprint. When it conflicts with a numbered architecture document, follow the authority rules in [docs/00-foundation.md](docs/00-foundation.md) and report the discrepancy.

## Project vision

ExAi is an AI-native trade show intelligence platform. It is intended to make every event interaction useful to all three participant groups:

- **Organizers** configure events and receive event-level operational and intelligence reporting.
- **Exhibitors** publish company knowledge, products, and use cases, then receive qualified lead intelligence.
- **Attendees** discover relevant exhibitors through a fast, QR-led experience and receive personalized fit guidance and an event memory/report.

The business goal is a commercial, multi-tenant SaaS platform rather than a one-off event app. The system must preserve tenant isolation, work under event-floor conditions, provide deterministic behavior when AI is unavailable, and support enterprise controls as later milestones are delivered.

## Product overview

The planned product has four main surfaces:

1. **Marketing site** — public product, pricing, about, contact, help, and legal pages.
2. **Organizer Console** — event configuration, floor/booth setup, exhibitor onboarding, analytics, and administration.
3. **Exhibitor Portal** — company/catalog onboarding, event participation, lead workflows, and intelligence.
4. **Attendee App** — mobile/PWA event experience, including QR-led booth discovery, matchmaking, and post-event memory.

An internal **Platform Admin** surface is also part of the architecture. Full page, role, and feature inventories live in [docs/11-information-architecture.md](docs/11-information-architecture.md), [docs/14-page-inventory.md](docs/14-page-inventory.md), and [docs/08-feature-matrix.md](docs/08-feature-matrix.md).

## Approved technology stack

| Layer                | Repository decision                                                                         |
| -------------------- | ------------------------------------------------------------------------------------------- |
| Monorepo             | pnpm 9 workspaces + Turborepo 2                                                             |
| Web                  | Next.js 15 App Router, React 19, TypeScript, PWA-first                                      |
| UI                   | Tailwind CSS 4, Radix primitives, repository-owned `@concourse/ui`                          |
| API                  | NestJS 11 on Fastify, OpenAPI 3.1                                                           |
| Worker               | Node.js + BullMQ 5 + Redis 7                                                                |
| Database             | Supabase-managed PostgreSQL 15 + pgvector, Drizzle ORM                                      |
| Auth                 | Supabase Auth through `@supabase/ssr` and `@supabase/supabase-js`                           |
| Storage / realtime   | Supabase Storage and Supabase Realtime                                                      |
| AI                   | Provider access centralized in `packages/ai`; Anthropic and Voyage are the frozen providers |
| Billing / email      | Stripe Billing; AWS SES + React Email through notifications                                 |
| Testing              | Vitest, Testcontainers, Playwright                                                          |
| Hosting / operations | Vercel for web; ECS Fargate for API/worker; Terraform; Sentry, OTel/Grafana, PostHog        |

The binding stack is [docs/00-foundation.md](docs/00-foundation.md) §6 and §14, summarized in [docs/BLUEPRINT_V1.md](docs/BLUEPRINT_V1.md).

## Monorepo architecture

```text
apps/
  web/       Next.js web/PWA surfaces and web-side Supabase session infrastructure
  api/       NestJS/Fastify API modular-monolith shell
  worker/    BullMQ consumers, scheduled jobs, and outbox-relay shell
packages/
  ai/        The only allowed model-provider boundary
  api-client/ Generated/typed client boundary used by the web app
  api-contract/ OpenAPI contract artifacts and contract types
  config/    Shared ESLint, TypeScript, Vitest, and Testcontainers conventions
  database/  Drizzle schema, migrations, database client, seed, and RLS tests
  flags/     Feature-flag abstractions
  notifications/ Email, push, and notification abstractions
  shared/    Shared Zod schemas, types, errors, constants, and utilities
  ui/        Shared UI components, design tokens, CSS, and self-hosted fonts
infra/       Terraform environment and module scaffolding
evals/       AI and retrieval evaluation fixtures
supabase/    Local Supabase configuration and Supabase-owned project assets
docs/        Frozen architecture and engineering process documents
```

Internal packages use `workspace:*` and are not published to npm. Package boundaries and permitted dependency edges are binding in [docs/37-monorepo-and-folder-structure.md](docs/37-monorepo-and-folder-structure.md).

## Current milestone and completed work

**Current milestone:** M0 — Platform Foundation. **Completed engineering milestones:** none; M0 has not met its exit criteria.

Work present in the current checkout:

- Blueprint v1.0 and its engineering guides are complete and frozen.
- The monorepo scaffold and deployable/package shells exist.
- The M0 identity and tenancy schema, UUIDv7 migration, RLS policies, and RLS isolation tests exist.
- Repository stabilization changes address React typings, TypeScript config inheritance, CommonJS ESLint config handling, type-only imports, BullMQ/ioredis alignment, and packages without tests.
- The required self-hosted Inter Variable and JetBrains Mono WOFF2 assets exist under `packages/ui/src/fonts/`.
- Web-side Supabase auth foundation exists: browser/server clients, cookie refresh middleware, session helpers, and protected-route infrastructure.
- `.gitignore`, `.env.example`, and `pnpm-lock.yaml` exist in the working tree.

This does **not** mean M0 authentication is complete. Login/signup/recovery UI, user provisioning triggers, organization membership, roles, permissions, entitlements, audit logging, transactional email, Platform Admin, and observability remain incomplete or pending.

## Current validation status

Verified on 2026-07-13 in this checkout:

| Command                   | Result                                                                                                    |
| ------------------------- | --------------------------------------------------------------------------------------------------------- |
| `pnpm typecheck`          | **Pass** — 19/19 Turbo tasks                                                                              |
| `pnpm test`               | **Pass** — 20/20 Turbo tasks; database RLS suite 10/10                                                    |
| `pnpm --filter web build` | **Pass** — production build and middleware emitted                                                        |
| `pnpm lint`               | **Fail** — ESLint scans generated `.js`/`.d.ts` files emitted inside `apps/api/src` and `apps/worker/src` |

Known validation warnings:

- Next.js reports that its ESLint plugin is not detected.
- Several intentionally scaffolded AI methods and the database seed log produce lint warnings.
- Vitest reports its Vite CJS API deprecation and Turbo reports missing output declarations for test tasks.

The local Supabase stack has not been verified by this handoff ticket. The working tree is dirty and most stabilization/auth changes are not committed.

## Repository conventions

- TypeScript everywhere; strict type safety is not bypassed.
- Files use `kebab-case`; values/functions use `camelCase`; types/components use `PascalCase`.
- Database names are `snake_case`, tenant-owned tables require RLS, and each new RLS table requires an isolation test in the same change.
- API errors use `application/problem+json`; clients branch on registered error codes, not prose.
- Shared validation belongs in `packages/shared`; model-provider SDKs belong only in `packages/ai`.
- UI uses semantic design tokens and self-hosted fonts; external font CDNs are not part of the architecture.
- Work one small ticket at a time and stop at its boundary.
- Use trunk-based branches and Conventional Commits as specified in [docs/ENGINEERING_GUIDE.md](docs/ENGINEERING_GUIDE.md) §6.

## Build and development commands

```bash
corepack enable
pnpm install

pnpm supabase:start
docker compose up -d
pnpm dev

pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm --filter web build

pnpm db:migrate
pnpm db:seed
```

Copy `.env.example` to the deployable-specific local environment files described in [README.md](README.md). Never commit real secrets.

## Known technical debt and repository risks

1. Root lint is red because TypeScript build output exists inside API/worker source trees and is included by ESLint.
2. `.npmrc` and `.github/workflows/ci.yml` are still absent even though the frozen folder specification expects them. `.nvmrc` remains optional because `package.json#engines` is binding.
3. `apps/api/src/modules/auth/auth.module.ts` contains stale comments that still describe the Supabase auth documents as pending revision.
4. `README.md` still says no authentication exists, while the web auth foundation is now present; the full auth feature remains incomplete.
5. The Git worktree is dirty. Branch `master` is at `fb962107...`; the tag `m0-validation-complete` points to that original import commit and does not represent the current validation state.
6. The Concourse-to-ExAi repository-wide rename is an explicit, non-blocking M0 chore and has not been completed.
7. Supabase local-stack startup and the complete M0 staging flow have not been verified.

## Roadmap through Milestone 1

### Finish Milestone 0 — Platform Foundation

- Close repository bootstrap gaps and restore a green lint gate.
- Complete and validate Supabase authentication, including identity provisioning and the account lifecycle defined by the blueprint.
- Implement entitlement resolution and manual provisioning.
- Implement account-lifecycle transactional email.
- Implement the Platform Admin baseline.
- Implement synchronous audit logging for privileged actions.
- Wire the observability baseline.
- Complete the tracked Concourse-to-ExAi rename when approved.
- Demonstrate the complete M0 staging flow and satisfy all tests/CI gates.

### Milestone 1 — Event Setup & Exhibitor Onboarding

Only after M0 is complete:

- Event lifecycle and event staffing.
- Venues, floor plans, and booths.
- Exhibitor invitations, claim flow, staffing, and event profile.
- Product catalog and event listings.
- Public marketing/event surfaces defined for M1.
- File-storage service for floor-plan and catalog uploads.
- Background-job baseline for imports and antivirus scanning.

The exact deliverables and exit criteria are binding in [docs/IMPLEMENTATION_PHASES.md](docs/IMPLEMENTATION_PHASES.md).

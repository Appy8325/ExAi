# Start Here — ExAi

Use this file as the five-minute entry point for a human engineer or AI assistant. It summarizes where to look and how to work; it does not replace the frozen blueprint.

## 1. What ExAi is

ExAi is an AI-native, multi-tenant trade show intelligence platform for:

- **Organizers** — configure and operate events, onboard exhibitors, and understand event performance.
- **Exhibitors** — publish company/product knowledge and receive qualified lead intelligence.
- **Attendees** — use a fast mobile/PWA and QR-led journey to discover relevant exhibitors and receive personalized event guidance and memory.

The business goal is a production SaaS platform that makes event interactions useful to all three groups while preserving tenant isolation, event-floor reliability, and deterministic operation when AI is unavailable.

**Current stage:** Milestone 0 — Platform Foundation. Blueprint v1.0 is frozen; no engineering milestone is complete yet.

## 2. Repository overview

| Path                                  | Purpose                                                               |
| ------------------------------------- | --------------------------------------------------------------------- |
| `apps/web`                            | Next.js web/PWA surfaces and web-side Supabase session infrastructure |
| `apps/api`                            | NestJS/Fastify modular API shell                                      |
| `apps/worker`                         | BullMQ worker and scheduled-job shell                                 |
| `packages/database`                   | Drizzle schema, migrations, database client, and RLS tests            |
| `packages/shared`                     | Shared Zod schemas, types, errors, constants, and utilities           |
| `packages/ui`                         | Shared UI, tokens, CSS, and self-hosted fonts                         |
| `packages/ai`                         | Exclusive model-provider boundary                                     |
| `packages/api-client`, `api-contract` | Typed web/API boundary and OpenAPI contract                           |
| `packages/config`                     | Shared ESLint, TypeScript, Vitest, and test conventions               |
| `packages/notifications`, `flags`     | Notification and feature-flag abstractions                            |
| `supabase`, `docker-compose.yml`      | Local managed-platform and Redis setup                                |
| `infra`                               | Terraform scaffolding                                                 |
| `evals`                               | AI/retrieval evaluation fixtures                                      |
| `docs`                                | Frozen architecture and engineering process                           |

For package boundaries and the full tree, use [docs/37-monorepo-and-folder-structure.md](docs/37-monorepo-and-folder-structure.md).

## 3. Read these documents first

1. **[START_HERE.md](START_HERE.md)** — this orientation.
2. **[PROJECT_CONTEXT.md](PROJECT_CONTEXT.md)** — product, stack, package responsibilities, validation, debt, and near-term roadmap.
3. **[AI_HANDOFF.md](AI_HANDOFF.md)** — ticket and AI working rules.
4. **[docs/PROJECT_STATE.md](docs/PROJECT_STATE.md)** — factual point-in-time checkout status.
5. **[DECISIONS_LOG.md](DECISIONS_LOG.md)** — major accepted decisions and their status.
6. **[docs/00-foundation.md](docs/00-foundation.md)** — canonical authority and amendment log.
7. **[docs/BLUEPRINT_V1.md](docs/BLUEPRINT_V1.md)** — frozen architecture summary.
8. **[docs/IMPLEMENTATION_RULES.md](docs/IMPLEMENTATION_RULES.md)** and **[docs/IMPLEMENTATION_PHASES.md](docs/IMPLEMENTATION_PHASES.md)** — permanent rules and milestone plan.
9. Only the numbered blueprint documents that own the assigned ticket.

## 4. Development workflow

```text
Ticket -> Implementation -> Validation -> Architecture review -> Commit -> Stop
```

- Keep every ticket small, focused, and independently reviewable.
- Identify the current milestone and exact blueprint owner before editing.
- Confirm dependencies instead of assuming earlier work is complete.
- Make the minimum correct change; preserve unrelated work.
- Run targeted checks while iterating and the required repository gates before completion.
- Explain architectural decisions, changed files, validation, and remaining work.
- Commit only when authorized, using Conventional Commits.
- Stop after the assigned ticket.

## 5. Repository rules

- Follow the frozen blueprint; `docs/00-foundation.md` wins when documents disagree.
- Do not invent architecture, names, routes, roles, permissions, entitlements, error codes, queues, or events.
- Preserve the pnpm/Turborepo structure and package dependency boundaries.
- Never bypass lint, strict TypeScript, tests, RLS, accessibility, or security gates.
- Every tenant-owned table requires RLS and a same-change isolation test.
- Only `packages/ai` may import model-provider SDKs.
- Keep self-hosted fonts under `packages/ui/src/fonts`; do not replace them with hosted services without an approved amendment.
- Do not add future-milestone behavior, placeholder tests, dead code, unresolved TODOs, or unrelated refactors.
- Inspect the dirty working tree before editing; existing changes are part of the current project state.
- Never commit secrets or local environment files.

## 6. Validation commands

Run from the repository root:

```bash
pnpm install
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Useful targeted checks:

```bash
pnpm --filter web build
pnpm --filter @concourse/database typecheck
pnpm --filter @concourse/database test
pnpm supabase:start
docker compose up -d
```

Never claim a command passed unless it ran in the active checkout. Record commands not run and pre-existing failures explicitly.

## 7. Current status

- **Current milestone:** M0 — Platform Foundation, in progress.
- **Last completed engineering milestone:** None.
- **Architecture milestone:** Blueprint v1.0 frozen on 2026-07-11.
- **Branch:** `master`.
- **HEAD:** `fb962107f8d7abed3d7f764c3a9692a14ea9d63c`.
- **Working tree:** Dirty; stabilization, documentation reconciliation, font assets, root control files, and web auth-foundation changes are uncommitted.
- **Validation:** `pnpm typecheck`, `pnpm test` (including 10 RLS tests), and `pnpm --filter web build` pass. `pnpm lint` fails because generated `.js`/`.d.ts` files under API/worker source directories are linted.
- **Highest-priority next engineering ticket:** Fix the root lint failure by correcting generated-output placement or lint inclusion at the proper configuration level. The formal ticket ID is **Unknown**.
- **After validation is green:** Continue the remaining M0 authentication work; do not start M1.

The tag `m0-validation-complete` points to the original import commit and must not be treated as evidence that M0 or validation is complete.

## 8. Common mistakes to avoid

- Do not implement M1 or later work while M0 remains open.
- Do not redesign the architecture inside an implementation ticket.
- Do not suppress TypeScript or ESLint errors with `any`, blanket rule disables, or skipped checks.
- Do not lint or commit generated build output as source.
- Do not confuse the web auth foundation with completed authentication flows.
- Do not replace Supabase with the superseded auth/database/storage/realtime stack.
- Do not replace self-hosted fonts with a CDN or `next/font` without approval.
- Do not assume a Git tag, README sentence, or chat transcript is more current than the working tree and [docs/PROJECT_STATE.md](docs/PROJECT_STATE.md).
- Do not perform unrelated cleanup while fixing one validation failure.

## 9. Definition of Done

A ticket is complete only when:

1. Its stated scope is satisfied.
2. The implementation matches the relevant blueprint owners.
3. Required validation passes, or remaining pre-existing failures are evidenced and documented.
4. Files changed and architectural decisions are explained.
5. Remaining work and limitations are identified.
6. No unrelated changes, secrets, generated artifacts, or architecture drift are introduced.
7. Documentation reflects factual behavior when the ticket changes it.
8. The engineer or assistant stops after the assigned ticket.

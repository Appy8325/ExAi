# ExAi Decisions Log

This is a concise index of major decisions already present in the repository. It does not replace [docs/00-foundation.md](docs/00-foundation.md) §14 or the numbered owner documents.

## D-001 — Freeze Blueprint v1.0 and use ExAi as the product name

- **Decision:** Freeze the architecture as v1.0. Use **ExAi** externally while retaining the replaceable `Concourse` codename in much of the blueprint and package scope until a dedicated rename pass.
- **Reason:** Move from architecture authoring to controlled engineering without a risky 48-document mechanical rewrite.
- **Date:** 2026-07-11.
- **Status:** Accepted. Blueprint frozen; repository-wide rename remains a non-blocking M0 chore.
- **Source:** [docs/00-foundation.md](docs/00-foundation.md) §14 Amendment A4.

## D-002 — Use a pnpm/Turborepo TypeScript monorepo

- **Decision:** Use pnpm 9 workspaces and Turborepo 2 with `apps/web`, `apps/api`, `apps/worker`, and internal `packages/*` resolved through `workspace:*`.
- **Reason:** Keep deployables and shared concerns in one repository while enforcing explicit package boundaries and a build graph. Internal packages are not published to npm.
- **Date:** Known by Blueprint v1.0 freeze, 2026-07-11.
- **Status:** Accepted and implemented at scaffold level.
- **Source:** [docs/00-foundation.md](docs/00-foundation.md) §6; [docs/37-monorepo-and-folder-structure.md](docs/37-monorepo-and-folder-structure.md).

## D-003 — Adopt Supabase for Database, Auth, Storage, and Realtime

- **Decision:** Use Supabase-managed PostgreSQL 15 + pgvector, Supabase Auth, Supabase Storage, and Supabase Realtime. Supersede AWS RDS, the in-house NestJS auth design, WorkOS, S3/CloudFront, and Socket.IO for those concerns.
- **Reason:** Consolidate managed platform capabilities while preserving the existing business rules, tenant model, and application boundaries.
- **Date:** 2026-07-11.
- **Status:** Accepted and fully reconciled in the architecture; implementation is partial.
- **Source:** [docs/00-foundation.md](docs/00-foundation.md) §14 Amendments A5-A6.

## D-004 — Use Supabase SSR authentication architecture in the web app

- **Decision:** Use `@supabase/ssr` browser and request-scoped server clients, cookie-backed sessions, middleware refresh, and server-verified user/session helpers. Supabase issues JWT access/refresh sessions; application business authorization remains separate.
- **Reason:** Match the reconciled Supabase auth/session blueprint and support Next.js App Router server/client boundaries without a parallel custom session system.
- **Date:** Architecture accepted 2026-07-11; implementation date is not committed in Git.
- **Status:** Foundation implemented in the working tree. Login/signup/recovery, provisioning, membership, roles, and permissions remain incomplete.
- **Source:** [docs/19-authentication-strategy.md](docs/19-authentication-strategy.md), [docs/20-session-strategy.md](docs/20-session-strategy.md), `apps/web/src/lib/supabase/`.

## D-005 — Require PostgreSQL RLS for tenant isolation

- **Decision:** Every tenant-owned table must have RLS from its first migration and an isolation test in the same change. Application scoping is an additional layer, not a substitute.
- **Reason:** Tenant isolation is a foundational security invariant.
- **Date:** Known by Blueprint v1.0 freeze, 2026-07-11.
- **Status:** Accepted. The current identity/tenancy RLS suite passes 10 tests in this checkout.
- **Source:** [docs/00-foundation.md](docs/00-foundation.md) §8; [docs/IMPLEMENTATION_RULES.md](docs/IMPLEMENTATION_RULES.md) rules 6 and 14.

## D-006 — Self-host Inter Variable and JetBrains Mono

- **Decision:** Store Inter Variable Latin/Latin Extended and JetBrains Mono WOFF2 assets in `packages/ui/src/fonts/`. Do not use a font CDN; the UI fallback stack remains local/system based.
- **Reason:** External font CDNs conflict with the platform's performance and privacy posture.
- **Date:** Known by Blueprint v1.0 freeze, 2026-07-11.
- **Status:** Accepted; the three font assets exist in the current working tree but are not committed.
- **Source:** [docs/39-design-system.md](docs/39-design-system.md) §5.1.

## D-007 — Pin workspace package management to pnpm 9.15.0

- **Decision:** Use `pnpm@9.15.0`, lock workspace dependencies in `pnpm-lock.yaml`, and use `workspace:*` for internal packages.
- **Reason:** Reproducible dependency resolution and strict declaration of package boundaries.
- **Date:** Known by Blueprint v1.0 freeze, 2026-07-11.
- **Status:** Accepted. The current shell reports pnpm 9.15.0; a lockfile exists but is uncommitted.
- **Source:** Root `package.json`; [docs/37-monorepo-and-folder-structure.md](docs/37-monorepo-and-folder-structure.md).

## D-008 — Use Docker-backed local infrastructure

- **Decision:** Use Docker Compose for Redis and the Supabase CLI's Docker-backed local stack for PostgreSQL/Auth/Storage/Realtime/Studio.
- **Reason:** Provide local infrastructure that matches repository service boundaries without embedding those services in application packages.
- **Date:** Known by Blueprint v1.0 freeze, 2026-07-11.
- **Status:** Accepted. Docker 29.6.1 is available and Testcontainers passes; Supabase local-stack startup was not verified by this handoff ticket.
- **WSL note:** No repository document establishes a WSL-specific architecture requirement or records the host's WSL setup. Treat WSL as local machine setup, not an invented project decision.
- **Source:** [README.md](README.md), `docker-compose.yml`, `supabase/config.toml`.

## D-009 — Stabilize validation without weakening rules

- **Decision:** Resolve validation failures at their root: add missing type packages, preserve CommonJS only where ESLint runtime config requires it, fix shared TypeScript inheritance, align BullMQ/ioredis versions, permit empty Vitest packages without placeholder tests, and keep self-hosted assets.
- **Reason:** Establish reproducible M0 validation without suppressing TypeScript/ESLint errors, fabricating tests, or changing runtime architecture.
- **Date:** Unknown; changes exist only in the uncommitted working tree.
- **Status:** Partially complete. Typecheck, tests, and web build pass; root lint still fails on generated output under API/worker source trees.
- **Source:** Current Git diff and [docs/PROJECT_STATE.md](docs/PROJECT_STATE.md).

## D-010 — Keep AI behind one provider boundary and require deterministic fallbacks

- **Decision:** Only `packages/ai` may import model-provider SDKs. Every AI feature must have a working deterministic fallback.
- **Reason:** Prevent provider coupling and ensure core event workflows remain usable when AI is disabled, unavailable, or over budget.
- **Date:** Known by Blueprint v1.0 freeze, 2026-07-11.
- **Status:** Accepted; AI feature implementation is planned for a later milestone.
- **Source:** [docs/21-ai-architecture.md](docs/21-ai-architecture.md); [docs/IMPLEMENTATION_RULES.md](docs/IMPLEMENTATION_RULES.md) rule 9.

## D-011 — Use small, milestone-scoped tickets and Conventional Commits

- **Decision:** Build one milestone/deliverable at a time, use trunk-based branches and Conventional Commits, validate before completion, and stop at the assigned boundary.
- **Reason:** Limit architecture drift, simplify review, and make AI-assisted work recoverable.
- **Date:** 2026-07-11.
- **Status:** Accepted and binding.
- **Source:** [docs/ENGINEERING_GUIDE.md](docs/ENGINEERING_GUIDE.md) §§6 and 9; [docs/IMPLEMENTATION_RULES.md](docs/IMPLEMENTATION_RULES.md).

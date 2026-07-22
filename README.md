# Concourse (product name: ExAi)

AI-native trade show intelligence platform. This repository is currently in **Milestone 0 — Platform Foundation** (repository, tooling, and dev-environment scaffolding only; no business features, authentication, or dashboards yet).

## Start here

- **[docs/BLUEPRINT_V1.md](docs/BLUEPRINT_V1.md)** — one-page frozen-architecture summary.
- **[docs/ENGINEERING_GUIDE.md](docs/ENGINEERING_GUIDE.md)** — how to work in this repository.
- **[docs/IMPLEMENTATION_RULES.md](docs/IMPLEMENTATION_RULES.md)** — permanent engineering rules.
- **[docs/IMPLEMENTATION_PHASES.md](docs/IMPLEMENTATION_PHASES.md)** — the milestone plan (M0–M5).
- **[docs/00-foundation.md](docs/00-foundation.md)** — the canonical, frozen architecture (read this before changing anything).
- **[docs/README.md](docs/README.md)** — full index of all 47 architecture documents.

## Quickstart (local development)

Requires Node 22, pnpm 9, and Docker.

```bash
corepack enable
pnpm install

# Start the Supabase local stack (Postgres+pgvector, Auth, Storage, Realtime, Studio)
pnpm supabase:start

# Start Redis (BullMQ, pub/sub, rate limits — not provided by Supabase)
docker compose up -d

cp .env.example apps/web/.env.local
cp .env.example apps/api/.env
cp .env.example apps/worker/.env
# then fill in the Supabase local keys `supabase start` prints to stdout

pnpm dev
```

## Repository shape

See [docs/37-monorepo-and-folder-structure.md](docs/37-monorepo-and-folder-structure.md) for the authoritative, annotated tree. Summary:

```
apps/            web (Next.js 15) · api (NestJS 11) · worker (Node 22 + BullMQ 5)
packages/        ui · database · shared · ai · api-contract · api-client ·
                 notifications · flags · config
infra/           Terraform IaC
evals/           AI/retrieval eval fixtures
docs/            the architecture blueprint (source of truth)
```

## Architecture status

**Frozen at Version 1.0** (`docs/00-foundation.md` §14, Amendment A4). Do not modify any numbered document in `docs/00`–`docs/46` without following the amendment process in `docs/ENGINEERING_GUIDE.md` §8.

> **Note:** `docs/00-foundation.md` §14 Amendments A5–A6 adopt Supabase as the managed platform for Database, Auth, Storage, and Realtime. The detailed, operative designs are in `docs/19-authentication-strategy.md`, `docs/20-session-strategy.md`, `docs/26-file-storage.md`, and `docs/18-api-architecture.md` §7.

## Built with Codex

ExAi was developed with the assistance of [Codex](https://openai.com/codex), an AI engineering tool used to accelerate and streamline the software development process. Codex contributed to several key areas of the project:

- **Architecture and design**: Codex helped architect the application structure, making decisions around monorepo organization, service boundaries, and technology stack selection.
- **Frontend and backend development**: Codex assisted with building and refactoring features across the Next.js frontend and NestJS backend, including component design, API routes, and data models.
- **Technology integration**: Codex provided guidance and implementation support for Next.js, NestJS, Supabase, and TypeScript throughout the stack.
- **Debugging and deployment**: Codex helped diagnose and resolve deployment configurations, monorepo tooling issues, and environment-specific bugs.
- **Code review and technical debt**: Codex reviewed architectural decisions and identified opportunities to reduce technical debt and improve maintainability.
- **Documentation and planning**: Codex generated engineering documentation, implementation roadmaps, and architecture decision records to support the development process.
- **UX and production readiness**: Codex audited navigation flows, user experience patterns, and production readiness to ensure the platform meets quality standards.
- **Iterative development**: Codex accelerated the iteration cycle through AI-assisted engineering, enabling faster prototyping and refinement of features.

This collaboration allowed the development team to focus on high-level design decisions while leveraging AI assistance for implementation details, code quality, and documentation.

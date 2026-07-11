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

> **Note:** `docs/00-foundation.md` §14 Amendment A5 adopted Supabase as the managed platform for Database, Auth, Storage, and Realtime. This supersedes the detailed designs in `docs/19-authentication-strategy.md`, `docs/20-session-strategy.md`, `docs/26-file-storage.md`, and the Realtime section of `docs/18-api-architecture.md` §7 — those four documents are flagged pending a detailed revision and must not be implemented literally until that revision lands.

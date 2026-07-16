# ExAi (Concourse) — Deployment Guide

**Recommended stack (Phase 5+):** Vercel + Supabase Cloud + Railway OR Render.
AWS / ECS / Terraform infrastructure is preserved under `infra/` as an
optional enterprise deployment path. See [`infra/README.md`](infra/README.md)
before running it.

> **One-shot step-by-step runbook** (copy-pasteable commands):
> [`DEPLOY_RUNBOOK.md`](DEPLOY_RUNBOOK.md)
>
> **Day-2 operations runbook** (logs, rollback, scaling, health):
> [`ops/README.md`](ops/README.md)

---

## Architecture Overview (recommended)

```
                              ┌────────────────────────────────────────────┐
                              │                  Vercel                   │
                              │         apps/web (Next.js 15)              │
                              │              https://exai.app             │
                              └─────────────────────┬──────────────────────┘
                                                    │ NEXT_PUBLIC_API_BASE_URL
                    ┌───────────────────────────────┴───────────────────────────┐
                    │                                                              │
        ┌───────────▼─────────────┐                                  ┌───────────▼─────────────┐
        │   Railway OR Render     │                                  │   Railway OR Render     │
        │  apps/api (NestJS 11 /  │                                  │  apps/worker (Node 22 / │
        │   Fastify 5)            │                                  │   BullMQ 5)             │
        │  https://api.exai.app   │                                  │   (no public URL)       │
        └───────────┬─────────────┘                                  └───────────┬─────────────┘
                    │                                                              │
                    │ API_DATABASE_URL                                              │ WORKER_DATABASE_URL
                    │ API_SUPABASE_URL                                              │ WORKER_REDIS_URL (managed Redis add-on)
                    │ API_SUPABASE_SERVICE_ROLE_KEY                                 │
                    │ API_SUPABASE_JWT_SECRET                                       │
                    │ ANTHROPIC_API_KEY, VOYAGE_API_KEY, POSTHOG_API_KEY            │ same AI keys + POSTHOG_API_KEY
                    └────────────────────────┬─────────────────────────────────────┘
                                             │
                                  ┌──────────▼──────────┐
                                  │     Supabase        │
                                  │     Cloud           │
                                  │     Postgres 15     │
                                  │     + pgvector      │
                                  │     Auth (GoTrue)   │
                                  │     Storage         │
                                  │     Realtime        │
                                  └─────────────────────┘
```

---

## Why this stack

| Decision | Reason |
|---|---|
| **Vercel** for Web | First-class Next.js 15 hosting, preview deploys on PR, edge CDN, env var per-branch, `vercel.json` already shipped. |
| **Supabase Cloud** for DB / Auth / Storage / Realtime | Postgres + pgvector + GoTrue auth managed by Supabase; the API already speaks `@supabase/supabase-js`. The `supabase/production-config.toml` and `packages/database` migrations are already wired. |
| **Railway OR Render** for API + Worker | Dockerfile-based deploys; longest possible Redis managed-add-on story for the BullMQ worker; Redis available as a managed add-on; env vars via dashboard; health-check path is `/healthz` (already exposed). |
| **No AWS, no Terraform, no ECS** | Removed from prerequisites to reduce time-to-deploy for a startup / hackathon launch. All infra artifacts under `infra/` are kept intact, so an enterprise/AWS migration path remains possible later. |

---

## Prerequisites

| Requirement | Used for | Notes |
|---|---|---|
| Node.js | build (>= 22) | `nvm install 22` or `fnm install 22` |
| pnpm | build (9.15.0) | `corepack enable && corepack prepare pnpm@9.15.0 --activate` |
| Supabase CLI | project link + migrations | `npm install -g supabase` |
| Vercel CLI | web deploy | `npm install -g vercel` |
| Railway CLI | api/worker deploy | `npm install -g @railway/cli` |
| **or** Render CLI/Render dashboard | api/worker deploy | Render deploys via dashboard or GitHub connection — no CLI strictly required. |
| GitHub CLI | repo ops | `npm install -g gh` |

> AWS CLI, Terraform, Docker are **no longer required** for the recommended
> deploy path. Docker is still useful locally for `docker build` smoke tests
> if you do not trust the cloud build, but Railway and Render both build
> from the GitHub source tree by default.

---

## 1. GitHub Repository Setup

Same as before. `gh repo create`, branch protection on `master`, OIDC for
CI/CD if you want auto-deploys. Add `VERCEL_TOKEN` secrets and the new
`RAILWAY_TOKEN` (if using Railway CI).

---

## 2. Supabase Cloud

Sign in to [supabase.com](https://supabase.com), create the **ExAi** org,
then create project **`exai-production`** in `us-east-1` (or closest to
the API region). Capture the four dashboard values:

| Source | Saved as |
|---|---|
| Project URL (`https://<ref>.supabase.co`) | `SUPABASE_URL` |
| `anon public` key | `SUPABASE_ANON_KEY` |
| `service_role` secret key | `SUPABASE_SERVICE_ROLE_KEY` |
| JWT Secret (Advanced) | `SUPABASE_JWT_SECRET` |

Then:

```bash
supabase link --project-ref <ref>
supabase push                       # applies supabase/production-config.toml
```

Run migrations and seed from the repo root (Next.js-style with the env
var in scope):

```bash
API_DATABASE_URL="postgresql://postgres:<PASSWORD>@db.<ref>.supabase.co:6543/postgres?pgbouncer=true" \
  pnpm db:migrate

API_DATABASE_URL="postgresql://postgres:<PASSWORD>@db.<ref>.supabase.co:6543/postgres?pgbouncer=true" \
  pnpm db:seed
```

---

## 3. Environment Variables

The list is the same as `.env.production.example`, but now each variable
is split between three destinations:

| Var | Where (recommended stack) |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Vercel Project → Settings → Environment Variables |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Vercel (public to client) |
| `NEXT_PUBLIC_API_BASE_URL` | Vercel |
| `API_DATABASE_URL` | Railway / Render → API service env |
| `API_SUPABASE_URL` | Railway / Render → API service env |
| `API_SUPABASE_SERVICE_ROLE_KEY` | Railway / Render → API service env (secret) |
| `API_SUPABASE_JWT_SECRET` | Railway / Render → API service env (secret) |
| `API_CORS_ORIGIN` | Railway / Render → API service env |
| `API_PUBLIC_WEB_ORIGIN` | Railway / Render → API service env |
| `API_PORT` | Railway / Render → API service env (`= 3001`) |
| `WORKER_DATABASE_URL` | Railway / Render → Worker service env |
| `WORKER_REDIS_URL` | Railway / Render → Worker service env (from managed Redis add-on) |
| `ANTHROPIC_API_KEY` | API **and** Worker |
| `VOYAGE_API_KEY` | API **and** Worker |
| `POSTHOG_API_KEY` | API **and** Worker |
| VAPID / AWS SES | API service env |

All values live in your team password manager; populate via the dashboard
or `railway variables` / Render dashboard once the services exist.

---

## 4. Deploy API (Railway OR Render)

`apps/api/Dockerfile` already exists and starts `node apps/api/dist/main.js`
on port `3001`.

### Option A — Railway

```bash
# One-time
railway login
railway init                    # creates a Railway project
railway add                     # creates an API service tied to repo root
                               # pick the workspace directory apps/api if prompted

# Set env
railway variables set \
  API_DATABASE_URL="postgresql://postgres:<PWD>@db.<ref>.supabase.co:6543/postgres?pgbouncer=true" \
  API_SUPABASE_URL="https://<ref>.supabase.co" \
  API_SUPABASE_SERVICE_ROLE_KEY="<service_role>" \
  API_SUPABASE_JWT_SECRET="<jwt_secret>" \
  API_CORS_ORIGIN="https://exai.app" \
  API_PUBLIC_WEB_ORIGIN="https://exai.app" \
  API_PORT="3001" \
  ANTHROPIC_API_KEY="<key>" \
  VOYAGE_API_KEY="<key>" \
  POSTHOG_API_KEY="<key>"

# Build & deploy
railway up

# Public URL
railway domain
# → api.exai.app (CNAME it from your DNS; Railway provides a CNAME target)
```

Railway auto-detects `Dockerfile` and uses `apps/api/Dockerfile` when the
service is rooted correctly. If pinned to monorepo root, set the service's
**Root Directory** to `apps/api` so the Dockerfile is found.

### Option B — Render

1. Render Dashboard → **New** → **Web Service** → Connect GitHub repo.
2. Configure:
   - **Root Directory:** `apps/api`
   - **Runtime:** Docker
   - **Docker Command:** *(leave empty; Dockerfile CMD is used)*
   - **Port:** `3001`
3. Health check path: `/healthz`
4. Add environment variables (same list as above).
5. Deploy.

Render auto-deploys on pushes to `master` once a service exists.

---

## 5. Deploy Worker (Railway OR Render, same platform as the API)

Workers are background processes; pick **Worker** runtime.

### Railway

```bash
railway add                   # Worker service, root dir apps/worker
railway variables set \
  WORKER_DATABASE_URL="postgresql://postgres:<PWD>@db.<ref>.supabase.co:6543/postgres?pgbouncer=true" \
  WORKER_REDIS_URL="$REDIS_URL_FROM_RAILWAY_REDIS_ADDON" \
  ANTHROPIC_API_KEY="<key>" \
  VOYAGE_API_KEY="<key>" \
  POSTHOG_API_KEY="<key>"
railway up
```

**Managed Redis on Railway:** in the same project, **+ New** → **Database**
→ **Redis**. Copy the `REDIS_URL` it provides.

### Render

1. Render Dashboard → **New** → **Worker Service** → Connect GitHub.
2. Configure:
   - **Root Directory:** `apps/worker`
   - **Runtime:** Docker
3. Add env vars above.
4. Add a **Redis** instance (Render → **New** → **Key Value Store** →
   the connection string is the `WORKER_REDIS_URL`).
5. Deploy.

The Worker image doesn't expose ports; it's a long-running container that
is replaced on each new deploy.

---

## 6. Deploy Web to Vercel

`apps/web/vercel.json` is already aligned with the build (pnpm + Next.js).

```bash
cd apps/web
vercel link --yes         # creates a Vercel project from this directory
vercel env add NEXT_PUBLIC_SUPABASE_URL              # production
vercel env add NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY  # production
vercel env add NEXT_PUBLIC_API_BASE_URL              # production (https://api.exai.app)
vercel deploy --prod
vercel domains add exai.app
```

DNS: point `exai.app` (and `www.exai.app`) to the CNAME target Vercel
prints.

Auto-deploy is wired through `.github/workflows/deploy-web.yml`. For
GitHub-hosted preview deploys, configure PR previews in Vercel project
settings.

---

## 7. Verify Production

Run the verification script:

```bash
# bash required (uses bashisms)
bash scripts/verify-production.sh https://api.exai.app https://exai.app
```

Expected:

```
✓ Health endpoint (/healthz)
✓ CORS preflight
✓ Web Availability
✓ DNS resolution
✓ TLS
```

End-to-end QA Checklist:

```text
☐ https://exai.app loads, no console errors
☐ https://api.exai.app/healthz returns 200 { status: "ok" }
☐ CORS preflight from https://exai.app succeeds
☐ Supabase magic-link sign-up / sign-in flow
☐ Browser sign-in → /auth/callback → cookie session set
☐ Protected routes redirect when unauthenticated
☐ Session persists across refresh
☐ Worker connects to Redis (visible in logs)
☐ TLS is valid (padlock green, no browser warnings)
☐ DNS for exai.app and api.exai.app resolves
```

---

## 8. Legacy / Future: AWS Enterprise Deployment

> **Do not run the AWS path for the startup launch.** It is preserved
> here for reference only and lives under `infra/` and the
> `.github/workflows/deploy-{api,worker}.yml` files which are marked
> `[LEGACY]` but still functional.

If/when an enterprise tier needs AWS, see:
- `infra/README.md` — Terraform root, modules, what they provision.
- The legacy GitHub Actions workflows (`deploy-api.yml`, `deploy-worker.yml`)
  push images to ECR and update ECS Fargate services.
- `apps/api/Dockerfile`, `apps/worker/Dockerfile` already target
  production hardware.

The recommended path in this doc (Vercel + Railway/Render + Supabase) does
not run anywhere near `infra/` or those legacy workflows.

---

## 9. Related Documents

| Document | Location |
|---|---|
| Step-by-step runbook | [`DEPLOY_RUNBOOK.md`](DEPLOY_RUNBOOK.md) |
| Day-2 operations | [`ops/README.md`](ops/README.md) |
| Architecture blueprint | `docs/BLUEPRINT_V1.md` |
| Engineering guide | `docs/ENGINEERING_GUIDE.md` |
| Environment variables | `.env.production.example` |
| Dockerfiles | `apps/api/Dockerfile`, `apps/worker/Dockerfile` |
| Legacy AWS infra | `infra/` (see `infra/README.md`) |
| CI/CD workflows | `.github/workflows/` |
| Deployment orchestrator script | `scripts/deploy.sh` (still AWS-focused; prefer the runbook) |
| Production verification | `scripts/verify-production.sh` |
| Vercel config | `apps/web/vercel.json` |
| Supabase config | `supabase/production-config.toml` |

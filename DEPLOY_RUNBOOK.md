# ExAi (Concourse) — One-Shot Deployment Runbook (Phase 5+ stack)

**Stack:** Vercel (Web) + Supabase Cloud (DB/Auth/Storage/Realtime) +
**Railway OR Render** (API + Worker). AWS / Terraform / ECS removed
from the recommended path. See [`infra/README.md`](infra/README.md) if
you need the legacy AWS path.

Every command below is copy-pastable. Where a `ⓘ` is shown, replace
with a real value from a dashboard.

---

## Step 0 — Verify prerequisites

You no longer need AWS CLI, Terraform, or Docker installed locally —
Vercel, Railway, and Render all build from the GitHub source tree.

```bash
node --version       # >= 22
pnpm --version       # 9.15.x
gh --version
supabase --version
vercel --version
railway --version    # if using Railway; otherwise skip
```

If using Render, no CLI is required — Render deploys via the dashboard
or a GitHub connection. You can skip `railway --version`.

---

## Step 1 — GitHub repository

```bash
# Replace GH_ORG with your GitHub org/user.
gh repo create GH_ORG/concourse --public --push --source=. --remote=origin
# or:
#   git remote add origin git@github.com:GH_ORG/concourse.git
#   git push -u origin master

git checkout -b develop
git push -u origin develop
```

In GitHub UI → Settings → Branches → add rule for `master`:

- Require PR before merging
- Require approvals (≥ 1)
- Require status checks (CI must pass)
- Require branches up to date before merging

### GitHub Secrets / Variables for CI/CD

```bash
gh secret set VERCEL_TOKEN    --repo GH_ORG/concourse --body '<token>'
gh secret set VERCEL_ORG_ID   --repo GH_ORG/concourse --body '<org_id>'
gh secret set VERCEL_PROJECT_ID --repo GH_ORG/concourse --body '<project_id>'

# For Railway CI workflows (if added; see .github/workflows/)
gh secret set RAILWAY_TOKEN   --repo GH_ORG/concourse --body '<railway_token>'
gh secret set RAILWAY_API_SERVICE_ID     --repo GH_ORG/concourse --body '<id>'
gh secret set RAILWAY_WORKER_SERVICE_ID  --repo GH_ORG/concourse --body '<id>'

gh variable set NEXT_PUBLIC_SUPABASE_URL            --repo GH_ORG/concourse --body 'https://<ref>.supabase.co'
gh variable set NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY --repo GH_ORG/concourse --body '<anon-key>'
gh variable set NEXT_PUBLIC_API_BASE_URL             --repo GH_ORG/concourse --body 'https://api.exai.app'
```

```bash
# Skip these if you only deploy manually from your machine.
# AWS_* secrets can be added (or removed) — they will be unused by the
# new workflows but may still be referenced by the legacy ones.
gh secret delete AWS_ROLE_ARN --repo GH_ORG/concourse 2>/dev/null || true
```

---

## Step 2 — Supabase Cloud

### 2a. Create Supabase project

In [supabase.com](https://supabase.com) dashboard:

1. Create org "ExAi" (one-time).
2. Create project **`exai-production`** in region `us-east-1` (close to the API region).
3. Set a strong DB password; store it in your password manager.

Capture:

| Dashboard | Saved as |
|---|---|
| Project URL (`https://<ref>.supabase.co`) | `SUPABASE_URL` |
| `anon public` key | `SUPABASE_ANON_KEY` |
| `service_role` secret key | `SUPABASE_SERVICE_ROLE_KEY` |
| JWT Secret (Advanced) | `SUPABASE_JWT_SECRET` |

### 2b. Link repo to project

```bash
supabase link --project-ref <ref>
```

### 2c. Push production configuration

```bash
# Applies supabase/production-config.toml:
#   auth.site_url, redirect_urls, jwt_expiry
#   storage.file_size_limit = 50MiB, realtime, pooler
supabase push
```

### 2d. Run migrations + seed

```bash
API_DATABASE_URL="postgresql://postgres:<PASSWORD>@db.<ref>.supabase.co:6543/postgres?pgbouncer=true" \
  pnpm install --frozen-lockfile
API_DATABASE_URL="$API_DATABASE_URL" pnpm db:migrate
API_DATABASE_URL="$API_DATABASE_URL" pnpm db:seed
```

### 2e. Database backup (recommended before production deploy)

Supabase Dashboard → Database → Backups → enable **Daily** backups
(or do it manually now). The first Drizzle migration is
a one-shot change; preserving a restore point is cheap insurance.

---

## Step 3 — Configure environment variables

Every variable below is stored on the platform that owns the
component. Save them in your team password manager (1Password / Vault)
too.

### Web (Vercel) — set after `vercel link`

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<ref>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `<anon-key>` |
| `NEXT_PUBLIC_API_BASE_URL` | `https://api.exai.app` |

### API + Worker (Railway OR Render)

| Name | Value (sample) |
|---|---|
| `API_DATABASE_URL` | `postgresql://postgres:<PWD>@db.<ref>.supabase.co:6543/postgres?pgbouncer=true` |
| `API_SUPABASE_URL` | `<SUPABASE_URL>` |
| `API_SUPABASE_SERVICE_ROLE_KEY` | `<SUPABASE_SERVICE_ROLE_KEY>` |
| `API_SUPABASE_JWT_SECRET` | `<SUPABASE_JWT_SECRET>` |
| `API_CORS_ORIGIN` | `https://exai.app` |
| `API_PUBLIC_WEB_ORIGIN` | `https://exai.app` |
| `API_PORT` | `3001` |
| `WORKER_DATABASE_URL` | (same pooler string as data API) |
| `WORKER_REDIS_URL` | (from Railway/Render managed Redis) |
| `ANTHROPIC_API_KEY` | (API *and* Worker) |
| `VOYAGE_API_KEY` | (API *and* Worker) |
| `POSTHOG_API_KEY` | (API *and* Worker) |
| `VAPID_*` / `AWS_*` | API only |

---

## Step 4 — Deploy API

### Option A — Railway

```bash
railway login
railway init

# Create the API service
railway add --service api

# Or, in interactive CLI prompts, pick "Empty Service" and set
# Root Directory to apps/api

# Set env (one-shot)
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

# Build + deploy
railway up

# Public URL (then CNAME this to api.exai.app)
railway domain
```

Railway auto-detects the Dockerfile when the service root is `apps/api`.

Health-check path on Railway: in service settings → **Health Check**
→ set **HTTP path** to `/healthz`, **Port** to `3001`.

### Option B — Render

1. Dashboard → **New** → **Web Service** → Connect GitHub repo.
2. Settings:
   - **Root Directory:** `apps/api`
   - **Runtime:** Docker
   - **Port:** `3001`
   - **Health Check Path:** `/healthz`
3. Add environment variables (table above).
4. Click **Create Web Service**.

Render auto-deploys on push to `master`. For preview deploys per PR,
enable **Preview Pull Requests**.

### Verify

```bash
# Once Railway/Render assigns a default URL, or after CNAME
curl -v https://api.exai.app/healthz
# Expected: HTTP 200 { status: "ok" }
```

---

## Step 5 — Deploy Worker

The Worker is a long-running process; on Railway pick **Worker**
service type, on Render pick **Worker Service**.

### Railway

```bash
railway add --service worker         # Worker type
                                  # Root Directory: apps/worker
# Connected to the same project as the API.

# Add a managed Redis to the project
railway add --plugin redis          # creates a Redis add-on; copy the REDIS_URL

# Set worker env
railway variables --service worker set \
  WORKER_DATABASE_URL="postgresql://postgres:<PWD>@db.<ref>.supabase.co:6543/postgres?pgbouncer=true" \
  WORKER_REDIS_URL="<value from railway redis add-on>" \
  ANTHROPIC_API_KEY="<key>" \
  VOYAGE_API_KEY="<key>" \
  POSTHOG_API_KEY="<key>"

railway up
```

### Render

1. Dashboard → **New** → **Worker Service** → connect repo.
2. Settings:
   - **Root Directory:** `apps/worker`
   - **Runtime:** Docker
3. Add env vars (table above).
4. Provision a Redis:
   - Dashboard → **New** → **Key Value Store** → pick region close to API.
   - Copy the connection string into `WORKER_REDIS_URL`.

### Verify

```bash
# On the railway/render service page, open the live logs.
# Expect: "[worker] starting — Milestone ..." within seconds, repeated if it's
# the in-process Redis warning (production uses the managed Redis).
```

---

## Step 6 — Deploy Web (Vercel)

### 6a. One-time

```bash
cd apps/web
vercel link --yes     # creates a project from apps/web/ + Vercel detects Next.js
```

### 6b. Set environment variables (Production environment)

```bash
cd apps/web

npx vercel env add NEXT_PUBLIC_SUPABASE_URL              production
# Paste: https://<ref>.supabase.co

npx vercel env add NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY  production
# Paste: <anon-key>

npx vercel env add NEXT_PUBLIC_API_BASE_URL              production
# Paste: https://api.exai.app
```

Or set them in the Vercel Dashboard → Project → Settings →
Environment Variables.

### 6c. Deploy

```bash
vercel deploy --prod

# Capture the URL, e.g. https://exai-app.vercel.app (temporary)
```

### 6d. Custom domain

```bash
vercel domains add exai.app
# Follow the DNS prompts at your registrar; copy the CNAME target from Vercel.
```

After DNS resolves, the `--prod` deploy on the custom domain will
respond from the Vercel edge.

---

## Step 7 — Verify production (mandatory)

```bash
# bash required (the script is bash, not pure sh)
bash scripts/verify-production.sh https://api.exai.app https://exai.app
```

### Manual QA

```text
☐ https://exai.app loads (homepage returns 200)
☐ No console errors in browser dev tools
☐ No 404 / 401 / 500 in the network tab
☐ https://api.exai.app/healthz → 200 { status: "ok" }
☐ https://api.exai.app/readyz  → 200 { status: "ok" }
☐ CORS preflight from https://exai.app returns 200/204
☐ Supabase magic-link sign-up submits an email
☐ Browser sign-in → /auth/callback → cookie session set
☐ Session persists across refresh
☐ Protected routes redirect when unauthenticated
☐ Worker connects to Redis (visible in logs)
☐ TLS is valid
☐ DNS for exai.app and api.exai.app resolves
```

---

## Step 8 — Activate CI/CD auto-deploy

Once Steps 1-7 work, the GitHub Actions workflows will auto-deploy on
push to `master`. The active workflows are:

| Workflow | Trigger | Action |
|---|---|---|
| `ci.yml` | push to any branch / PR to `master` | lint, typecheck, test, build Docker for portability |
| `deploy-web.yml` | push to `master` (apps/web/** + packages/**) | build, deploy to Vercel |
| `deploy-api-railway.yml` *(if enabled)* | push to `master` (apps/api/** + packages/**) | trigger Railway API service rebuild |
| `deploy-worker-railway.yml` *(if enabled)* | push to `master` (apps/worker/** + packages/**) | trigger Railway Worker service rebuild |

> For Render, no GitHub Action is needed — Render deploys automatically
> on push through its GitHub integration. The CI workflow's lint/test
> jobs already gate the deploy.

The legacy AWS workflows (`deploy-api.yml`, `deploy-worker.yml`) are
**marked `[LEGACY]`** but still exist on disk and remain functional.
They will only run if they are triggered explicitly (push to `master`
events will be picked up). If you want them to **never** run:

```bash
# Move the legacy workflows into a tagged directory so GitHub ignores them.
mkdir -p .github/workflows/_legacy
git mv .github/workflows/deploy-api.yml    .github/workflows/_legacy/deploy-api.legacy.yml
git mv .github/workflows/deploy-worker.yml .github/workflows/_legacy/deploy-worker.legacy.yml
git commit -m "chore(ci): retire legacy AWS deploy workflows"
git push
```

Then add `RAILWAY_TOKEN` + `RAILWAY_*_SERVICE_ID` GitHub Secrets if
you want CI to handle the API/Worker deploys (otherwise Render's
GitHub integration does it for free).

---

## Rollback quick-ref

```bash
# API (Railway)
railway rollback                       # roll back to previous deploy

# Worker (Railway)
railway rollback --service worker

# Web (Vercel)
cd apps/web
vercel rollback                        # rolls back to previous deployment

# Database (Supabase)
# Dashboard → Database → Backups → Restore
# (Drizzle down migrations: pnpm db:migrate:down if a down method exists)
```

---

## Monitoring for the stack

| Concern | Where to look |
|---|---|
| API logs | Railway/Render project → API service → Logs |
| Worker logs | Railway/Render project → Worker service → Logs |
| Redis | Railway manage-dashboard → add-on page; Render → Key Value Store → Logs |
| Web | Vercel Dashboard → Analytics → Logs |
| Database | Supabase Dashboard → Reports → Database |
| Auth | Supabase Dashboard → Auth → Users |

---

## Related documents

| Document | Location |
|---|---|
| Architecture overview | `DEPLOYMENT.md` |
| Day-2 operations | `ops/README.md` |
| Environment variables | `.env.production.example` |
| Vercel config | `apps/web/vercel.json` |
| Supabase config | `supabase/production-config.toml` |
| Legacy AWS infra (do NOT delete without sign-off) | `infra/README.md` |
| Legacy AWS workflows (do NOT delete without sign-off) | `.github/workflows/*.legacy.yml` (after the move in Step 8) |

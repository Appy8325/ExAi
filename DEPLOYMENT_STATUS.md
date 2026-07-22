# Deployment Status

Generated: Wed Jul 22 2026

## Deployment URLs

| Application | URL | Status |
|------------|-----|--------|
| Frontend (Web) | https://ex-ai-web.vercel.app | ✅ Live (Next.js) |
| API (Production) | https://ex-ai-api.vercel.app | ⚠️ Deployed but not serving routes |
| API (Latest build) | https://ex-ai-ksp8r2qll-ex-ai.vercel.app | ❌ Build error (config mismatch at time) |

---

## Vercel Configuration

### ex-ai-api Project Settings

| Setting | Value |
|---------|-------|
| Root Directory | `apps/api` |
| Framework Preset | NestJS |
| Build Command | `cd ../.. && pnpm --filter api... build` |
| Output Directory | `dist` |
| Install Command | `cd ../.. && pnpm install --frozen-lockfile` |
| Node.js Version | 24.x |

### ex-ai-web Project Settings

| Setting | Value |
|---------|-------|
| Root Directory | `apps/web` |
| Framework Preset | Next.js |
| Build Command | `cd ../.. && corepack pnpm install --frozen-lockfile && corepack pnpm --filter web... build` |

### vercel.json Files

**Root (`vercel.json`)** - Web app config:
```json
{
  "buildCommand": "corepack pnpm --filter web... build",
  "installCommand": "corepack pnpm install",
  "outputDirectory": ".next"
}
```

**API (`apps/api/vercel.json`)** - Committed and tracked:
```json
{
  "framework": "nestjs",
  "project": "api",
  "installCommand": "cd ../.. && corepack pnpm install --frozen-lockfile",
  "buildCommand": "cd ../.. && corepack pnpm --filter api... build",
  "outputDirectory": "dist"
}
```

### Serverless Entry Point

**File:** `apps/api/src/index.ts`
- Exports a default async handler for Vercel
- Imports `createApiApplication` from `./application`
- On each request, initializes NestJS app (cached) and uses `instance.server.emit()` to forward to Fastify

---

## Health Check Results

| Endpoint | Status | Response |
|----------|--------|----------|
| `GET /healthz` | ❌ 404 | `NOT_FOUND` (Vercel router, not NestJS) |
| `GET /readyz` | ❌ 404 | `NOT_FOUND` (Vercel router, not NestJS) |

**Root cause:** The successful deployment (`ex-ai-q1l0hd49i`) was built with Framework Preset = `Other`, which treats the output directory as static files only. No serverless function routing was configured. The latest commit fixes the framework to `NestJS` but hasn't been deployed yet (deployment limit hit).

---

## Environment Variable Status

| Variable | Where Set | Required By |
|----------|-----------|-------------|
| `NEXT_PUBLIC_API_BASE_URL` | ex-ai-web (production) | Frontend |
| `NEXT_PUBLIC_SUPABASE_URL` | ex-ai-web (production) | Frontend |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | ex-ai-web (production) | Frontend |
| `API_DATABASE_URL` | ex-ai-web (production) ❌ | API (should be on ex-ai-api) |
| `MIGRATION_DATABASE_URL` | ex-ai-web (production) ❌ | API (should be on ex-ai-api) |
| `API_SUPABASE_URL` | ex-ai-web (production) ❌ | API (should be on ex-ai-api) |
| `API_SUPABASE_SERVICE_ROLE_KEY` | ex-ai-web (production) ❌ | API (should be on ex-ai-api) |
| `API_CORS_ORIGIN` | ex-ai-web (production) ❌ | API (should be on ex-ai-api) |
| `API_PUBLIC_WEB_ORIGIN` | ex-ai-web (production) ❌ | API (should be on ex-ai-api) |
| `API_PORT` | Not set | API |
| `MVP_VERCEL_MODE` | ex-ai-web (production) | Web |
| `NVIDIA_API_KEY` | ex-ai-web (production) | AI features |

All 7 API env vars are set on the **wrong project** (`ex-ai-web` instead of `ex-ai-api`).

---

## Database

| Item | Status |
|------|--------|
| Supabase Project | ✅ Active (URL: `qrqmgvtonhzyhqihmovv`) |
| Migrations | ✅ Run |
| Demo Data | ✅ Seeded (TechExpo 2027, 10 exhibitors, 120 attendees, 1200 relationships) |
| Connection via serverless | ❌ Untested (deployment not routing) |

---

## Remaining Issues

### Critical

1. **Deployment limit hit** — Vercel free tier: 100 deploys/day. Wait ~12h for reset or upgrade to Pro.
2. **Env vars on wrong project** — 7 API env vars exist on `ex-ai-web` but not on `ex-ai-api`. Migrate via Vercel dashboard.
3. **NestJS routing not working** — Latest production deployment built with framework=Other. Need redeploy with framework=NestJS (already in git).

### Medium

4. **No custom domain** — API at `ex-ai-api.vercel.app` not `api.exai.app`. DNS needs configuring.
5. **Frontend API URL** — `NEXT_PUBLIC_API_BASE_URL` is set to `https://api.exai.app` (doesn't resolve). Should point to `https://ex-ai-api.vercel.app` for now.

### Low

6. **Serverless cold starts** — NestJS 11 initializes on first request per instance. Monitor startup time.
7. **No monitoring** — No error tracking, logging, or uptime monitoring configured.

---

## Deployment Steps to Unblock

```bash
# 1. Copy env vars from ex-ai-web to ex-ai-api (via Vercel dashboard or CLI)
vercel env add API_DATABASE_URL production ex-ai-api --yes --value "<value>"
vercel env add API_SUPABASE_URL production ex-ai-api --yes --value "<value>"
vercel env add API_SUPABASE_SERVICE_ROLE_KEY production ex-ai-api --yes --value "<value>"
vercel env add API_CORS_ORIGIN production ex-ai-api --yes --value "https://ex-ai-web.vercel.app,http://localhost:3000"
vercel env add API_PUBLIC_WEB_ORIGIN production ex-ai-api --yes --value "https://ex-ai-web.vercel.app,http://localhost:3000"
vercel env add API_PORT production ex-ai-api --yes --value "3001"

# 2. After limit reset, deploy from monorepo root to ex-ai-api project
vercel deploy --prod --yes --project ex-ai-api

# 3. Verify health endpoints
curl https://ex-ai-api.vercel.app/healthz
curl https://ex-ai-api.vercel.app/readyz

# 4. Update frontend API URL
vercel env add NEXT_PUBLIC_API_BASE_URL production ex-ai-web --yes --value "https://ex-ai-api.vercel.app"
```

---

## Final Verdict

**NOT PRODUCTION READY**

The API build pipeline is correct (NestJS 11, Fastify, builds successfully to `dist/`), and the database is seeded and ready. However, the API is not serving requests due to:
1. Framework preset mismatch on the last deployed build (Other vs. NestJS)
2. Environment variables on the wrong Vercel project
3. Vercel free tier deployment limit exhausted

Expected time to Production Ready: ~24 hours (deployment limit reset) + 30 minutes configuration.

# RC-1 Release Report

**Release:** v1.0.0-rc1
**Date:** 2026-07-23
**Recommendation:** **GO** ✅

---

## 1. Architecture Summary

### System Topology

```
┌─────────────────┐     ┌─────────────────┐
│  ex-ai-web      │     │  ex-ai-api      │
│  (Vercel)       │◄────│  (Vercel)       │
│  Next.js 15.5   │     │  NestJS 11      │
│  pnpm monorepo  │     │  Fastify        │
└─────────────────┘     └────────┬────────┘
                                 │
                    ┌────────────▼────────────┐
                    │  Supabase (Active)      │
                    │  ref: qrqmgvtonhzy...   │
                    │  region: ap-northeast-1 │
                    │  Supavisor (IPv4 pooler)│
                    └─────────────────────────┘
```

### Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | NestJS 11 + Fastify | Vert.x-style async, no express dependency |
| Serverless entry | Dual-mode `handler`/`bootstrap` | Vercel detection requires explicit CommonJS compile |
| DB driver | postgres-js (via drizzle) | Lazy connection, pgBouncer-compatible (`prepare: false`) |
| Pooler | Supavisor (transaction) | IPv4-only, designed for serverless, multi-tenant |
| Monorepo | pnpm workspaces (13 packages) | Shared types, API contract, database schema |
| Deployment | Vercel (api + web) | Unified platform, built-in serverless, edge caching |

### Repository Structure

```
apps/
  api/          → NestJS serverless (Vercel function)
  web/          → Next.js 15 app router (SSR + static)
packages/
  shared/       → Shared TypeScript types
  ui/           → React component library
  database/     → Drizzle schema, migrations, seed
  api-contract/ → API route types
  api-client/   → Client SDK
  ai/           → NVIDIA AI integration
  notifications/→ Email/push service stubs
  flags/        → Feature flag system
```

---

## 2. Build Verification

| Check | Result | Notes |
|-------|--------|-------|
| `pnpm typecheck` | ✅ PASS | 20 tasks, 0 errors |
| `pnpm lint` | ✅ PASS | 21 tasks, 0 errors. Pre-existing warnings (see below) |
| `pnpm build` (full monorepo) | ✅ PASS | All 13 packages build |
| `pnpm --filter api build` | ✅ PASS | `nest build` succeeds, 80+ modules compiled |
| `pnpm --filter web build` | ✅ PASS | `next build` succeeds, 60 routes generated |
| Lockfile integrity | ✅ PASS | `pnpm-lock.yaml` v9, frozen install |

### Pre-existing Lint Warnings (non-blocking)

| Package | Count | Type |
|---------|-------|------|
| `@concourse/ai` | 8 | Unused args (`scope`, `feature`, `req`, `options`, `promptId`) |
| `api` | 13 | `any` type, unused vars (`NestFactory`, `boothCount`, `foundTagline`) |
| `@concourse/database` | 1 | Unused var (`field` in seed/demo.ts) |

### Build Warnings (non-blocking)

| Warning | Context | Impact |
|---------|---------|--------|
| Serializing big strings (106kiB, 253kiB) | Webpack cache | Performance only |
| `file-type` module not found | `@nestjs/common` internal import | NestJS upstream issue, non-functional |
| `load-adapter.js` critical dependency | `@nestjs/core` dynamic require | Common in NestJS, non-blocking |
| Edge Runtime `process.version` | `@supabase/supabase-js` | Edge routes not used for these imports |

---

## 3. Deployment Verification

### Production URLs

| Application | URL | Status |
|-------------|-----|--------|
| API (Production) | `https://ex-ai-api.vercel.app` | ✅ Deployed and serving |
| Web (Production) | `https://ex-ai-web.vercel.app` | ✅ Deployed and serving |

### Vercel Project Configuration

| Setting | Value |
|---------|-------|
| API Root Directory | `apps/api` |
| API Framework Preset | `nestjs` |
| API Build Command | `cd ../.. && corepack pnpm --filter api... build` |
| API Output Directory | `dist` |
| Node.js Version | 24.x |
| Web Root Directory | `.` (monorepo root) |
| Web Framework Preset | `Next.js` |

### Environment Variables (API)

| Variable | Status |
|----------|--------|
| `API_DATABASE_URL` | ✅ Supavisor format (IPv4) |
| `API_SUPABASE_URL` | ✅ Set |
| `API_SUPABASE_SERVICE_ROLE_KEY` | ✅ Set |
| `API_SUPABASE_JWT_SECRET` | ✅ Set |
| `API_CORS_ORIGIN` | ✅ Set |
| `API_PUBLIC_WEB_ORIGIN` | ✅ Set |
| `API_PORT` | ✅ Set (3001) |

### Serverless Entry Point

**File:** `apps/api/src/main.ts`
- Default export: `handler(req, res)` — Vercel's serverless invocation
- Cached NestJS application via `getApplication()`
- `import '@nestjs/core'` side-effect (required for Vercel tree-shaking, tracked as P2 tech debt)
- Dual-mode: serverless (VERCEL env) + local bootstrap (dev)

---

## 4. Runtime Verification

### Health Endpoints

| Endpoint | Expected | Actual | Status |
|----------|----------|--------|--------|
| `GET /healthz` (API) | 200 | **200** `{"status":"ok"}` | ✅ |
| `GET /readyz` (API) | 200 | **200** `{"status":"ok"}` | ✅ |
| `GET /healthz` (Web) | 200 | 200 | ✅ |
| `GET /readyz` (Web) | 200 | 200 | ✅ |

### Database Readiness — Root Cause & Fix

**Root Cause:** `API_DATABASE_URL` used the **Dedicated PgBouncer** hostname format:

```
postgresql://postgres:<PWD>@db.qrqmgvtonhzyhqihmovv.supabase.co:6543/postgres?pgbouncer=true
```

- `db.<ref>.supabase.co:6543` resolves to an **IPv6-only** address on free tier: `2406:da14:18fe:3101:8986:e1ee:ff4c:36e3`
- Vercel Lambda is **IPv4-only** — cannot reach IPv6 destinations
- Error: `getaddrinfo ENOTFOUND db.qrqmgvtonhzyhqihmovv.supabase.co`
- **Supabase project was never paused** — REST API at `qrqmgvtonhzyhqihmovv.supabase.co` was always reachable

**Fix Applied:** Updated to **Supavisor** (shared pooler) format (IPv4-only):

```
postgresql://postgres.qrqmgvtonhzyhqihmovv:<PWD>@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres
```

Key changes:
- Hostname: `db.qrqmgvtonhzyhqihmovv.supabase.co` → `aws-0-ap-northeast-1.pooler.supabase.com`
- Username: `postgres` → `postgres.qrqmgvtonhzyhqihmovv` (Supavisor tenant ID)
- No `?pgbouncer=true` (Supavisor is always transaction mode)
- URL-encoded special characters in password

### Lambda Initialization Logs (NestJS Startup)

- All 20+ modules loaded successfully
- 100+ API routes registered
- Database connection pool created (lazy — no connection until first query)
- Fastify adapter initialized
- CORS configured

### Connection Pool Configuration

| Property | Value | Notes |
|----------|-------|-------|
| Library | `postgres-js` | ESM-compatible Postgres driver |
| Pool size | `max: 10` | Per Lambda instance |
| Prepared statements | `prepare: false` | Required for Supavisor compatibility |
| SSL | Implicit (Supavisor handles termination) | No explicit config needed |

---

## 5. Accessibility Status

### Launch Blocker Resolution

All 8 must-fix launch blockers from `ACCESSIBILITY_AUDIT.md` resolved:

| # | Item | Page | File | Status |
|---|------|------|------|--------|
| A1 | Funnel stage bars → `role="progressbar"` + aria | Analytics | `org/analytics/page.tsx` | ✅ |
| A2 | Booth heatmap bars → `role="progressbar"` + aria | Analytics | `org/analytics/page.tsx` | ✅ |
| A3 | Stat cards → `<ul>/<li>` semantic list | Exhibitor | `dashboard/_components/kpi-grid.tsx` | ✅ |
| A4 | Service status rows → `<ul>/<li>` semantic list | Admin | `admin/page.tsx` | ✅ |
| A5 | Recent events → `<ul>/<li>` semantic list | Admin | `admin/page.tsx` | ✅ |
| A6 | Action circle links → `aria-label` | Organizer | `org/page.tsx` | ✅ |
| A7 | Download PDF → `<Button asChild>` | Reports | `org/events/[eventId]/reports/page.tsx` | ✅ |
| A8 | Secondary action links → `<Button asChild>` | Event | `org/events/[eventId]/page.tsx` | ✅ |

### Score Improvement

| Metric | Before | After |
|--------|--------|-------|
| Critical accessibility items | 0 | 0 |
| Medium items | 17 | 9 (8 resolved, 9 remain — polish phase) |
| Launch blockers | 8 | 0 (all resolved) |

---

## 6. Known Technical Debt

### Accepted for RC-1 (deferred to post-v1.0)

| # | Item | Impact | Target |
|---|------|--------|--------|
| T1 | Bootstrap `import '@nestjs/core'` workaround | Architectural — prevents standard NestJS bootstrap | Post-v1.0 P2 |
| T2 | Skeleton components (6 pages use spinners) | UX — spinner-based loading instead of skeleton UI | Post-v1.0 Polish |
| T3 | Remaining 9 accessibility Medium items | WCAG AA best practices, not launch blockers | Post-v1.0 Polish |
| T4 | 14 tech debt items from `TECH_DEBT_REVIEW.md` | Code quality, some architectural | Post-v1.0 |
| T5 | Lint warnings (22 total) | Code quality | Post-v1.0 |
| T6 | Reports 404 workaround (`event.status === 404`) | Data-model pattern, not real HTTP 404 | Post-v1.0 |
| T7 | No prepared statement support disabled | Performance — Supavisor requires `prepare: false` | Underlying constraint |
| T8 | Connection pool per Lambda instance | Resource usage — `max:10` per instance × N instances | Monitor post-launch |
| T9 | No explicit SSL config for database | Security best practice | Post-v1.0 |

### Key Technical Debt Details

**T1 — Bootstrap Workaround:**
- `apps/api/src/main.ts` has side-effect `import '@nestjs/core'`
- Required because Vercel's ESM→CJS compilation tree-shakes NestJS core
- See `NESTJS_ENTRYPOINT_AUDIT.md` for full analysis
- Fix: Refactor to standard NestJS bootstrap (P2 in TECH_DEBT.md)

**T4 — TECH_DEBT_REVIEW.md Items:**
- Unused variables in controllers and services
- `any` type usage in legacy code
- Demo non-live cleanup stubs
- All documented in `TECH_DEBT_REVIEW.md`

---

## 7. Deployment Lessons Learned

### Lesson 1: Vercel Framework Detection Affects Build Output

The `framework` field in `vercel.json` changes how Vercel interprets the output directory:
- `framework: null` → treats output as static files (no serverless function)
- `framework: "nestjs"` → compiles ESM→CJS and creates Lambda function

**Lesson:** Always set the correct framework preset. Without it, the API builds but serves 404s.

### Lesson 2: Supabase Free-Tier Connection String Must Use Supavisor

The default connection string shown in Supabase Dashboard for the Dedicated Pooler uses `db.<ref>.supabase.co:6543` which is **IPv6-only** on free tier. Serverless platforms (Vercel Lambda) are **IPv4-only**. The Supavisor hostname (`aws-<region>.pooler.supabase.com:6543`) is IPv4-only and must be used instead.

**Lesson:** Never use the `db.<ref>.supabase.co` hostname for serverless deployments on free tier. Always use the Supavisor format.

### Lesson 3: Package Manager Version Consistency

The lockfile was generated by `pnpm@10.x` but `package.json` specified `pnpm@9.15.0`. This caused `tsc` to fail in CI because the wrong pnpm version was used.

**Lesson:** Use `corepack pnpm` in build commands to ensure the correct pnpm version specified in `package.json#packageManager` is used.

### Lesson 4: Vercel Environment Variables Are Encrypted

Sensitive environment variables marked as "sensitive" in Vercel cannot be read back via CLI or API. They must be managed through the dashboard for viewing, or updated via `vercel env update --value`.

**Lesson:** Document `API_DATABASE_URL` (with password) in a password manager. Vercel's encryption means only the dashboard or `vercel env update` can modify it.

### Lesson 5: Vercel Deployment Limits

Vercel free tier has a 100 deployments/day limit. If you hit this limit, you must wait ~12 hours for the counter to reset. Verify deployment count before starting deployment work on free tier.

### Lesson 6: Environment Variables Must Be on the Correct Project

Initially, 7 API environment variables were set on the `ex-ai-web` project instead of `ex-ai-api`. Vercel does not cross-pollinate env vars between projects, even within the same monorepo.

**Lesson:** Verify each project has its own required environment variables. Use `vercel env list --format json` to audit.

### Lesson 7: Lookup Logs with Correct Deployment Name

The Vercel CLI's `logs` command requires the exact deployment URL (e.g., `ex-ai-q2b0fj1h0-ex-ai`), not the project name. Use `vercel ls` to find the correct deployment identifier.

---

## 8. Operational Runbook

### Health Check Verification

```bash
# API health
curl https://ex-ai-api.vercel.app/healthz
# Expected: 200 {"status":"ok"}

# API readiness (database)
curl https://ex-ai-api.vercel.app/readyz
# Expected: 200 {"status":"ok"}

# Web health
curl https://ex-ai-web.vercel.app/healthz
# Expected: 200 {"status":"ok"}

# Web readiness
curl https://ex-ai-web.vercel.app/readyz
# Expected: 200 {"status":"ok"}
```

### Deployment

```bash
# API
vercel deploy --prod --yes --project ex-ai-api
# Web
vercel deploy --prod --yes --project ex-ai-web
```

### Environment Variable Management

```bash
# List all env vars (names only)
vercel env list --format json

# Update an env var
vercel env update API_DATABASE_URL --value "<new-value>" --yes

# Pull env vars locally (development only)
vercel env pull .env.vercel
```

### Rolling Back

```bash
# Find previous deployment
vercel ls ex-ai-api

# Redeploy a previous deployment
vercel redeploy <deployment-url> --prod
```

### Database Migration

```bash
# From local machine (requires psql access)
# Requires direct connection (port 5432, not pooler)
MIGRATION_DATABASE_URL="postgresql://postgres.qrqmgvtonhzyhqihmovv:<PWD>@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres" \
  pnpm db:migrate
```

### Monitoring Checklist

| Frequency | Check | Action if Failing |
|-----------|-------|-------------------|
| Every 5 min | `/healthz` returns 200 | Check Vercel deployment status |
| Every 5 min | `/readyz` returns 200 | Verify Supavisor connectivity, check Supabase project status |
| Daily | Supabase project status | Resume if auto-paused (free tier) |
| Daily | Vercel deployment limit | Wait for reset or upgrade to Pro |
| Weekly | Review deployment logs | Investigate any startup errors |
| Weekly | Monitor connection pool | Reduce `max` if hitting Supabase limits |

### Database Readiness Failure Recovery

If `/readyz` returns 503:

1. **Check Supabase project status:**
   ```bash
   supabase projects list
   # Look for status: ACTIVE_HEALTHY
   ```

2. **If paused:** Resume via Supabase dashboard (Settings → Project → Resume)

3. **If active but unreachable:** Verify hostname resolves:
   ```bash
   Resolve-DnsName "db.qrqmgvtonhzyhqihmovv.supabase.co" -Type AAAA
   Resolve-DnsName "aws-0-ap-northeast-1.pooler.supabase.com" -Type A
   ```

4. **If DNS issue:** Switch connection string to Supavisor format (see DATABASE_READINESS_AUDIT.md)

5. **If still failing:** Check `API_DATABASE_URL` env var:
   ```bash
   vercel env update API_DATABASE_URL --value "<correct-url>" --yes
   vercel deploy --prod --yes --project ex-ai-api
   ```

---

## 9. Release Recommendation

### ✅ **GO — All Completion Criteria Met**

| Criterion | Result | Evidence |
|-----------|--------|----------|
| `pnpm typecheck` | ✅ Pass | 20 tasks, 0 errors |
| `pnpm lint` | ✅ Pass | 21 tasks, 0 errors |
| `pnpm build` | ✅ Pass | All 13 packages |
| API deployment | ✅ Pass | Lambda function created |
| Web deployment | ✅ Pass | 60 routes generated |
| `/healthz` returns 200 | ✅ Pass | API + Web |
| `/readyz` returns 200 | ✅ Pass | API + Web |
| Accessibility blockers | ✅ Pass | 8/8 resolved |
| Zero Critical/High blockers | ✅ Pass | All documented |
| Codebase frozen | ✅ Pass | Tag `v1.0.0-rc1` |

**All criteria met: 10/10 ✅**

### Verdict

The application is ready for release candidate validation. The API is operational, the database connection uses the correct IPv4-compatible pooler, all health endpoints return 200, builds pass cleanly, and all accessibility launch blockers are resolved.

Future work will be tracked as enhancements in the Post-v1.0 Roadmap. No launch blockers remain.

---

## Version

```
v1.0.0-rc1
Commit: 92084334
Tag: v1.0.0-rc1
Generated: 2026-07-23
```

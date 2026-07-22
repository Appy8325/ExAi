# Deployment Result Report

Date: 2026-07-22
Project: ex-ai-api

---

## Deployment Status: FAILED

The deployment completed its build phase but **failed to create a working serverless function**.

---

## Deployment Log Summary

```
Build machine configuration: 2 cores, 8 GB
Running "install" command: `cd ../.. && corepack pnpm install --frozen-lockfile`...
Scope: all 13 workspace projects
.../prepare$ husky - git can't be found
Done in 2.6s
Scope: 8 of 13 workspace projects
packages/shared build$ tsc - Done
packages/database build$ tsc - Done
packages/api-contract build$ tsc - Done
packages/notifications build$ tsc --noEmit - Done
packages/flags build$ tsc --noEmit - Done
packages/api-contract build: Done
packages/flags build: Done
packages/notifications build: Done
packages/database build: Done
packages/ai build$ tsc - Done
apps/api build$ nest build - Done
Build Completed in /vercel/output [26s]
Deployment: READY
Production URL: https://ex-ai-c65gfft9h-ex-ai.vercel.app
Aliased: https://ex-ai-api.vercel.app
```

---

## What Was Executed

| Phase | Command | Result |
|-------|---------|--------|
| Install | `cd ../.. && corepack pnpm install --frozen-lockfile` | ✅ SUCCESS |
| Build | `cd ../.. && corepack pnpm --filter api... build` | ✅ SUCCESS |
| Deploy | Vercel output deployment | ✅ SUCCESS |

---

## What Went Wrong

### Symptom

```
GET /healthz → 404 NOT_FOUND
GET /readyz → 404 NOT_FOUND
GET / → 404 NOT_FOUND
```

### Root Cause

**No serverless function was created.**

With `framework: null` and NO `builds` array, Vercel deploys the output directory (`dist/`) as **static files only**.

The NestJS application compiled successfully to `dist/main.js`, but:
- Vercel did NOT create a Lambda/serverless function
- The files were deployed as static assets
- There is no function to handle requests
- All requests return Vercel's NOT_FOUND (static file handler)

### Evidence

1. Deployment status: "READY" - Vercel considers static file deployment ready
2. Health endpoints return "NOT_FOUND" - Vercel's static file 404 response
3. Build output shows "Build Completed in /vercel/output" - static files, not Lambda

---

## Architecture Problem

```
Current (without builds):
┌─────────────────────────────────────────────────┐
│  Vercel Static Deployment                       │
│                                                 │
│  dist/main.js → static file                    │
│  dist/app.module.js → static file              │
│  dist/application.js → static file             │
│                                                 │
│  Request → Vercel Router → 404 NOT_FOUND       │
└─────────────────────────────────────────────────┘

Required (with builds):
┌─────────────────────────────────────────────────┐
│  Vercel Serverless Deployment                   │
│                                                 │
│  builds: [{ src: "dist/main.js", use: "@vercel/node" }]
│                                                 │
│  Request → Lambda(dist/main.js) → NestJS App   │
└─────────────────────────────────────────────────┘
```

---

## Why The Build Succeeded But Nothing Works

| Aspect | Status | Explanation |
|--------|--------|-------------|
| Install | ✅ Works | `corepack pnpm install` runs correctly |
| Build | ✅ Works | `nest build` compiles to `dist/` |
| Deploy | ✅ Success | Vercel deploys `dist/` as static files |
| Serverless Function | ❌ MISSING | No Lambda created from `dist/main.js` |
| Routing | ❌ BROKEN | No function to route to |

---

## Verification Commands Executed

```powershell
# Health check
(Invoke-WebRequest -Uri "https://ex-ai-api.vercel.app/healthz" -UseBasicParsing).Content
# Result: NOT_FOUND (Vercel static file 404)

# Root check
(Invoke-WebRequest -Uri "https://ex-ai-api.vercel.app/" -UseBasicParsing -Method GET).StatusCode
# Result: 404
```

---

## Files Modified This Session

| File | Change |
|------|--------|
| `apps/api/vercel.json` | Removed `builds` array (caused regression) |
| `DEPLOYMENT_ROOT_CAUSE.md` | Created - identified builds issue |
| `BUILD_MIGRATION_REPORT.md` | Created - migration analysis |
| `PRE_DEPLOYMENT_CHECK.md` | Created - verification |
| `apps/api/src/main.ts` | Added NestFactory import |

---

## Root Cause Chain

1. `builds` array caused npm install failure (workspace:* protocol)
2. Removed `builds` array to fix install issue
3. Install now succeeds
4. BUT: Without `builds`, no serverless function is created
5. Vercel treats output as static files
6. No function exists to handle requests
7. All endpoints return NOT_FOUND

---

## Required Fix

**The `builds` array MUST be restored** to create a serverless function.

The challenge: `builds` + `npm install` = fails on workspace:*

**Solution Options**:

### Option A: Project Settings Override
- Set Install Command in Vercel Project Settings (not vercel.json)
- Vercel might use project settings for builds phase

### Option B: packageManager Configuration
- Configure pnpm as the package manager via package.json
- Vercel auto-detects package manager from package.json#packageManager

### Option C: Use api/ Directory Convention
- Move/symlink output to `apps/api/api/index.js`
- Vercel auto-detects serverless function in `api/` directory

---

## Deployment Blocker

**BLOCKER**: `builds` array is required for serverless function creation, but causes npm install to fail on workspace:* protocol.

**No configuration-only fix available** - requires either:
1. Different build approach
2. Vercel platform fix (use pnpm with builds)
3. Project-level install command override

---

## Confidence Level

**HIGH** - Verified through:
- Build succeeds
- Deploy succeeds
- Health endpoints return NOT_FOUND (not NestJS 404)
- Vercel static file behavior confirmed

---

## Recommendation

**STOP - Do not retry deployment**

The architecture is flawed without `builds`. Each deployment will build successfully but return NOT_FOUND for all endpoints.

**Required**: Re-architect deployment approach OR find configuration that allows `builds` + pnpm to work together.
# Production Verification

**Date:** 2026-07-22
**Purpose:** Validate the codebase builds, typechecks, and is ready for a production deployment.

---

## Pre-Deployment Checks

### 1. Environment Variables

Required env vars for production:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
DEMO_MODE=false
NODE_ENV=production
```

- [ ] `NEXT_PUBLIC_SUPABASE_URL` points to production Supabase project (not paused free-tier project)
- [ ] `DEMO_MODE=false` in production (enables real API calls)
- [ ] All required `NEXT_PUBLIC_` vars are set in Vercel/project env config

### 2. Build Verification

```bash
npm run build
```

Expected: Zero TypeScript errors, zero ESLint errors.

- [ ] `npm run build` passes without errors
- [ ] No `any` type suppressions (`// @ts-ignore`) in production code paths
- [ ] No `TODO` comments in shipping code (document in tech debt instead)
- [ ] No hardcoded credentials or test tokens

### 3. TypeScript

```bash
npx tsc --noEmit
```

- [ ] TypeScript compiles with zero errors
- [ ] All component props properly typed
- [ ] API response types match actual Supabase schema

### 4. Lint

```bash
npm run lint
```

- [ ] ESLint passes with zero warnings (or documented exceptions in `.eslintrc`)
- [ ] No unused imports
- [ ] No Console.log statements in production code

### 5. Test (if tests exist)

```bash
npm test
# or
npm run test:ci
```

- [ ] All tests pass
- [ ] Coverage maintained at current level or above

---

## Runtime Verification

### Health Endpoint Check

After deployment, verify:

- [ ] `GET /healthz` returns `200 OK`
- [ ] `GET /readyz` returns `200 OK` (Supabase must be resumed)

```bash
curl https://your-domain.com/healthz
# Expected: {"status":"ok"}

curl https://your-domain.com/readyz
# Expected: {"status":"ready"} or 503 if Supabase is paused
```

### Page Load Verification

- [ ] Exhibitor dashboard loads in <3s on 3G
- [ ] Organizer dashboard loads in <3s on 3G
- [ ] Event dashboard loads in <3s on 3G
- [ ] Admin dashboard loads in <3s on 3G
- [ ] Analytics loads in <3s on 3G
- [ ] Reports loads in <3s on 3G

### Database Connection

- [ ] Supabase project is **resumed** (auto-pause disabled for production)
- [ ] Row Level Security (RLS) policies are tested for all roles
- [ ] Connection pooling configured (Supabase Pro or connection pooler for high traffic)
- [ ] SSL connections enforced

---

## Supabase Project Status

**Current Status:** PAUSED (free tier auto-pause)

**Impact:** `/readyz` returns 503, app functions in degraded mode.

**To fix:** Resume at https://supabase.com/dashboard → Project → Settings → Billing → Resume Project

**For production:** Disable auto-pause or upgrade to Pro tier.

---

## Deployment Checklist

- [ ] Supabase project resumed and healthy
- [ ] `npm run build` passes cleanly
- [ ] `npx tsc --noEmit` passes cleanly
- [ ] `npm run lint` passes cleanly
- [ ] Env vars configured in Vercel/project dashboard
- [ ] Custom domain configured (if applicable)
- [ ] Analytics/monitoring enabled (Vercel Analytics, Sentry, etc.)
- [ ] Error tracking configured (Sentry, Bugsnag, etc.)
- [ ] DNS configured and SSL certificate active
- [ ] Demo mode disabled in production env
- [ ] Auth redirect URLs updated to production domain
- [ ] Supabase allowed domains updated to production URL
- [ ] Social auth callbacks updated (if applicable)
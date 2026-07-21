# EXHIBITOR_PIPELINE_ROOT_CAUSE

## Root Cause

**The production API backend is NOT deployed.**

### Pipeline Trace

```
Browser (Vercel deployed frontend)
  ↓ calls https://api.exai.app/v1/public/demo
  ↓ DNS resolution FAILED - api.exai.app doesn't exist
  ↓ connection fails immediately
  ↓ Promise.all([...]).catch(() => null)
  ↓ Both overview and dashboard become null
  ↓ <DemoUnavailable /> renders
```

### Step-by-Step Failure Analysis

| Step | Status | Notes |
|------|--------|-------|
| 1. Browser loads /demo/exhibitor/... | PASS | Frontend deployed to Vercel |
| 2. getApiBaseUrl() returns | PASS | Uses NEXT_PUBLIC_API_BASE_URL = "https://api.exai.app" |
| 3. Fetch to api.exai.app | FAIL | DNS lookup fails - no such domain exists |
| 4. API call catches error | PASS | .catch(() => null) returns null |
| 5. Both overview and dashboard are null | PASS | null check triggers DemoUnavailable |

### Why Local Works

Local environment:
- `pnpm dev` starts API at localhost:3001
- `NEXT_PUBLIC_API_BASE_URL` falls back to localhost origin
- API connects to local Supabase (seeded with demo data)
- Returns valid JSON from demoOverview() and demoExhibitorDashboard()

### Why Production Fails

Production environment:
- Frontend deployed to Vercel (ex-ai-web.vercel.app)
- `NEXT_PUBLIC_API_BASE_URL=https://api.exai.app` (Vercel env var)
- DNS lookup for api.exai.app fails - domain not registered
- API server doesn't exist anywhere
- Fetch fails silently, DemoUnavailable renders

### Files Involved

1. `apps/web/src/lib/api/config.ts` - Determines API URL
2. `apps/web/src/app/demo/exhibitor/[eventExhibitorId]/page.tsx` - Shows DemoUnavailable on null
3. `apps/api/src/modules/engagement/public-demo.controller.ts` - API endpoint (not deployed)
4. `apps/api/src/modules/engagement/public-exhibitors.service.ts` - Returns demo data
5. `packages/database/seed/demo.ts` - Seeds demo data (not run in production)

### What Needs to Happen

For the demo to work in production:

1. **Deploy API backend** to Railway or Render
   - Set environment variables (API_DATABASE_URL, API_SUPABASE_URL, etc.)
   - Health check at /healthz

2. **Configure DNS** for api.exai.app
   - CNAME to Railway/Render deployment URL

3. **Seed production database**
   - Run `API_DATABASE_URL="..." pnpm db:seed:demo`
   - Creates TechExpo 2027, 10 exhibitors, 120 attendees, relationships

4. **Verify**
   - curl https://api.exai.app/healthz returns 200
   - curl https://api.exai.app/v1/public/demo returns exhibitor data

### Verification Commands

```bash
# Should return 200 if API is deployed
curl https://api.exai.app/healthz

# Should return JSON with exhibitors if seeded
curl https://api.exai.app/v1/public/demo
```

### Status: Deployment Infrastructure Required

This is NOT a code bug. The code works correctly in local environment.
The production deployment is incomplete - the backend API was never deployed.

### Files Changed During Investigation

- `packages/database/seed/demo.ts` - Fixed interval expression bugs
- `packages/database/seed/demo_seed.json` - Regenerated with 10 exhibitors
- No changes to API or frontend code - they work correctly

### Next Steps

1. Deploy API to Railway/Render using DEPLOY_RUNBOOK.md instructions
2. Run database migrations and demo seed against production
3. Verify api.exai.app is accessible
4. Redeploy frontend if needed to pick up new environment
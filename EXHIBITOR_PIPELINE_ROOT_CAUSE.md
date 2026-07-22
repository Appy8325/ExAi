# EXHIBITOR_PIPELINE_ROOT_CAUSE

## Root Cause

**The production API backend is NOT deployed.**

### Pipeline Trace

```
Browser (Vercel deployed frontend at https://ex-ai-web.vercel.app)
  ↓ calls https://api.exai.app/v1/public/demo
  ↓ DNS resolution FAILED - api.exai.app doesn't exist
  ↓ connection fails immediately
  ↓ Promise.all([...]).catch(() => null)
  ↓ Both overview and dashboard become null
  ↓ <DemoUnavailable /> renders
```

## Deployment Steps Required

### Step 1: Deploy API to Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project (in repo root)
railway init

# Add API service
railway add --service api

# Set environment variables
railway variables set \
  API_DATABASE_URL="postgresql://postgres:<PASSWORD>@db.<REF>.supabase.co:6543/postgres?pgbouncer=true" \
  API_SUPABASE_URL="https://<REF>.supabase.co" \
  API_SUPABASE_SERVICE_ROLE_KEY="<SERVICE_ROLE_KEY>" \
  API_CORS_ORIGIN="https://ex-ai-web.vercel.app" \
  API_PUBLIC_WEB_ORIGIN="https://ex-ai-web.vercel.app" \
  DEMO_SIMULATION_AUTO_START="true"

# Deploy
railway up
```

### Step 2: Get API URL and Configure DNS

```bash
railway domain
# Returns: api.exai.app or a random URL like xxx.up.railway.app

# If using custom domain api.exai.app:
# Add CNAME record in DNS provider pointing to the railway.app URL
```

### Step 3: Seed Production Database

```bash
# Get the database URL from Supabase dashboard
export API_DATABASE_URL="postgresql://postgres:<PASSWORD>@db.<REF>.supabase.co:6543/postgres"

# Run demo seed
pnpm db:seed:demo
```

### Step 4: Verify

```bash
curl https://api.exai.app/healthz
# Expected: {"status":"ok"}

curl https://api.exai.app/v1/public/demo
# Expected: JSON with exhibitorOrganizations array
```

## Alternative: Deploy to Render

1. Go to render.com and connect your GitHub repo
2. Create a Web Service for `apps/api`
3. Set build command: `pnpm install && pnpm --filter api... build`
4. Set start command: `node apps/api/dist/main.js`
5. Add environment variables from Step 1
6. Deploy

## Verification Commands

```bash
# Should return 200 if API is deployed
curl https://api.exai.app/healthz

# Should return JSON with exhibitors if seeded
curl https://api.exai.app/v1/public/demo
```

## Current Status

| Component | URL | Status |
|-----------|-----|--------|
| Frontend (Vercel) | https://ex-ai-web.vercel.app | DEPLOYED |
| API Backend | https://api.exai.app | NOT DEPLOYED |
| Production DB | Supabase Cloud | NOT SEEDED |

## What Works

- Local demo works perfectly (database seeded, simulation running)
- API code is correct and complete
- Frontend code is correct and deployed

## What Doesn't Work in Production

- `api.exai.app` - DNS lookup fails
- Demo data not seeded in production Supabase

## Files Involved

- `apps/api/` - NestJS API (needs deployment)
- `apps/web/` - Next.js frontend (deployed to Vercel)
- `packages/database/seed/demo.ts` - Seeds demo data (needs to run against production)
# Environment Audit

Date: 2026-07-22
Project: ex-ai-api

## API Project Environment Variables

| Variable | Status | Value Source | Notes |
|----------|--------|-------------|-------|
| `API_DATABASE_URL` | ✅ Set (Production) | Constructed from Supabase project `qrqmgvtonhzyhqihmovv` | Pooled connection with pgbouncer |
| `MIGRATION_DATABASE_URL` | ✅ Set (Production) | Non-pooled connection for migrations | Port 5432 (direct) |
| `API_SUPABASE_URL` | ✅ Set (Production) | `https://qrqmgvtonhzyhqihmovv.supabase.co` | |
| `API_SUPABASE_SERVICE_ROLE_KEY` | ❌ MISSING | Should come from Supabase dashboard | Required for admin operations |
| `API_SUPABASE_JWT_SECRET` | ❌ MISSING | Should come from Supabase dashboard | Required for JWT verification |
| `API_CORS_ORIGIN` | ✅ Set (Production) | `https://ex-ai-web.vercel.app,http://localhost:3000` | |
| `API_PUBLIC_WEB_ORIGIN` | ✅ Set (Production) | `https://ex-ai-web.vercel.app,http://localhost:3000` | |
| `API_PORT` | ✅ Set (Production) | `3001` | |

## Web Project Environment Variables

| Variable | Status | Notes |
|----------|--------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Set (Encrypted) | Same Supabase project |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | ✅ Set (Encrypted) | Anon key |
| `NEXT_PUBLIC_API_BASE_URL` | ✅ Set (Encrypted) | Points to `https://api.exai.app` (DNS not configured) |

## Issues Found

### Critical
1. **`API_SUPABASE_SERVICE_ROLE_KEY` missing from API project**
   - This is required for Supabase admin operations (auth, storage, etc.)
   - Value is stored encrypted in Vercel for web project, cannot be retrieved via CLI
   - Must be obtained from Supabase dashboard → Project Settings → API → service_role secret

2. **`API_SUPABASE_JWT_SECRET` missing from API project**
   - Required for verifying Supabase-issued JWTs
   - Value is stored encrypted in Vercel for web project
   - Must be obtained from Supabase dashboard → Project Settings → API → JWT secret

### Medium
3. **`NEXT_PUBLIC_API_BASE_URL` points to unconfigured DNS**
   - Currently: `https://api.exai.app`
   - Should be: `https://ex-ai-api.vercel.app` (until custom domain is configured)

## Supabase Project Reference

- Project ID: `qrqmgvtonhzyhqihmovv`
- Region: Unknown (from supabase config)
- Database password (known): `Apoorv@8325`
- Connection strings (constructed):
  - Pooled: `postgresql://postgres:Apoorv@8325@db.qrqmgvtonhzyhqihmovv.supabase.co:6543/postgres?pgbouncer=true`
  - Direct: `postgresql://postgres:Apoorv@8325@db.qrqmgvtonhzyhqihmovv.supabase.co:5432/postgres`

## Action Required

Add the following environment variables to the **ex-ai-api** project via Vercel dashboard:

1. `API_SUPABASE_SERVICE_ROLE_KEY` - Get from Supabase dashboard
2. `API_SUPABASE_JWT_SECRET` - Get from Supabase dashboard

Or use the Vercel CLI to copy them from the web project settings.
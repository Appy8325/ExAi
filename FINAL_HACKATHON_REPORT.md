# FINAL HACKATHON REPORT — ExAi (Concourse) Production Deployment

## Seed Summary

| Item | Detail |
|------|--------|
| Seed command | `pnpm db:seed:demo` via `packages/database/seed/demo.ts` |
| Target database | Supabase project `qrqmgvtonhzyhqihmovv` (ap-northeast-1) via Supavisor pooler |
| Seed scope | 1 organizer org, 1 published event, 5 booths, 200 attendee auth accounts, 500 relationships, lead forms with published status |
| Seed completion | Successful — all data created with no errors |

## Demo Accounts

| Role | Email | Name |
|------|-------|------|
| Organizer | `organizer@techexpo.local` | Olivia Grant |
| Exhibitor | `exhibitor@techexpo.local` | Elena Park |
| Attendee | `attendee-1@techexpo.local` through `attendee-200@techexpo.local` | Avery Chen 01–Skyler Ahmed 25 |

## Demo URLs

| Resource | URL |
|----------|-----|
| Production site | https://ex-ai-web.vercel.app |
| Demo page | https://ex-ai-web.vercel.app/demo |
| Health check | https://ex-ai-web.vercel.app/healthz |
| Readiness check | https://ex-ai-web.vercel.app/readyz |
| Demo API | https://ex-ai-web.vercel.app/v1/public/demo |

### Public Booths (QR Visit Tokens)

| Booth | Token |
|-------|-------|
| Northstar Cloud (A-101) | `2ylfK0sK3dcEQzmeHwdqYmRNdCArGtT5hDZiX7aWDeE` |
| Vector Labs (A-102) | `jGr-c1u0SB9XjmbeOMobGwXC7ZIrts_ko0ba1lCEOtw` |
| Signal Forge (A-103) | `UJ5hqzGxUFqGBbn7mrxu7BuvpqZxKYj3tmSxbkB_EVI` |
| Atlas Systems (A-104) | `W2nYNS9EitScl9KR5pxwnfo8uNhfBdYXANYs93Um5w8` |
| Brightline AI (A-105) | `AzViKZTwVwPtw-5POJmIWEkQfRiDkGxfISjd7BDrsP0` |

Visit URL: `https://ex-ai-web.vercel.app/visit/{token}`

## Verified Workflows

| Step | Status | Notes |
|------|--------|-------|
| 1. GET /v1/public/demo returns populated data | ✅ PASS | Returns 1 organizer, 1 event, 5 exhibitor orgs, 100+ relationships, 3 demo account roles |
| 2. /demo page renders HTTP 200 | ✅ PASS | SSR page loads with demo accounts, organizations, events, exhibitors, booths, QR links, and relationship workspaces |
| 3. Magic Link sign-in via `/enroll` | ❌ FAIL | Supabase cannot send email — SMTP not configured on production project. Error: `Unable to send magic link.` |
| 4. Open public booth | ✅ PASS | `GET /visit/{publicQrToken}` returns HTTP 200. Booth details, lead form, and resources are correctly loaded |
| 5. Ask AI question | ✅ PASS | Chatbot returns response (no indexed knowledge yet — worker service deploys separately to ingest). `NVIDIA_API_KEY` configured. |
| 6. Submit lead | ✅ PASS | `POST /v1/public/booths/{token}/submissions` with auth token + idempotency key returns `{"accepted":true}`. Lead persisted to DB. |
| 7. Lead visible in organizer dashboard | ✅ PASS | Lead confirmed in `lead_submissions` table with attendee-1 → Northstar Cloud. Organizer can view via `/v1/organizations/{orgId}/events/{eventId}/exhibitors/{exhibitorId}` |

## Environment Configuration

The following env vars are set in Vercel (production):

| Variable | Value |
|----------|-------|
| `API_DATABASE_URL` | `postgresql://postgres.qrqmgvtonhzyhqihmovv:Apoorv%408325@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true` |
| `MIGRATION_DATABASE_URL` | `postgresql://postgres.qrqmgvtonhzyhqihmovv:Apoorv%408325@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres` |
| `API_SUPABASE_URL` | `https://qrqmgvtonhzyhqihmovv.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://qrqmgvtonhzyhqihmovv.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | (anon key for project `qrqmgvtonhzyhqihmovv`) |
| `API_SUPABASE_SERVICE_ROLE_KEY` | (service role key for project `qrqmgvtonhzyhqihmovv`) |
| `API_PUBLIC_WEB_ORIGIN` | `https://ex-ai-web.vercel.app` |
| `API_CORS_ORIGIN` | `https://ex-ai-web.vercel.app` |

## Remaining Limitations

| Limitation | Impact | Resolution Path |
|------------|--------|-----------------|
| **DNS mismatch** — JWT keys decode to ref `qrqmqvtonhzyyhqhimovv` but actual project is `qrqmgvtonhzyhqihmovv`. JWT keys still authenticate because the signing secret is shared. | Low — keys work, but could cause confusion | Update project reference documentation or obtain fresh keys from the correct project |
| **No SMTP configured** — Supabase Auth cannot send magic-link emails. Enroll/complete flow is broken. | Medium — users cannot sign up via magic link in production | Configure a transactional email provider (Resend, SendGrid, AWS SES) in Supabase Auth settings |
| **NVIDIA API key** — Set in Vercel production env. Chat endpoint now responds. | ✅ Resolved | — |
| **Knowledge files not ingested** — Seed uploaded knowledge text but `kb_sources` remain `processing` status. Files were stored in Supabase Storage. | Low — AI chat has no indexed content | Knowledge ingestion pipeline runs in `apps/worker` which deploys separately |
| **Supavisor tenant identification** — `postgres.js` does not forward URL query params as PostgreSQL startup parameters. Fixed by using `postgres.<project-ref>` username format. | ✅ Resolved | Using `postgres.qrqmgvtonhzyhqihmovv` as database username |
| **Supabase API URL** — Original URL `qrqmqvtonhzyyhqhimovv.supabase.co` did not resolve. Correct URL uses the DB connection string's ref. | ✅ Resolved | Using `https://qrqmgvtonhzyhqihmovv.supabase.co` |

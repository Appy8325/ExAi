# ExAi deployment guide

This guide deploys the working demo as three services:

- `apps/web`: Next.js on Vercel
- `apps/api`: NestJS Docker image on any container host
- Supabase: Postgres, Auth, Storage, and Realtime

The current demo does not enqueue background jobs, so `apps/worker` is optional until a queue producer is enabled.

## 1. Prerequisites

- Node.js 22
- pnpm 9.15.0
- Docker Desktop for local Supabase and container verification
- A Supabase project
- A Vercel project
- A container host for the API (Railway, Render, Fly.io, or ECS)

```bash
pnpm install --frozen-lockfile
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

## 2. Local setup

```bash
pnpm supabase:start
pnpm tsx scripts/with-local-supabase.ts pnpm db:migrate
pnpm db:seed
docker compose up -d redis
pnpm dev
```

The seed is idempotent. It creates TechExpo 2027, five exhibitors, attendee relationships, QR assets, and local app environment files. Supabase's local mail inbox is at `http://localhost:54324`.

## 3. Supabase production

1. Create a project in the same region as the API.
2. In Authentication URL Configuration set:
   - Site URL: the final web origin, such as `https://exai.example.com`
   - Redirect URL: `https://exai.example.com/auth/callback`
3. Configure production SMTP. AWS SES can be used here; Supabase sends the Magic Links.
4. Copy the project URL, publishable key, service-role key, JWT secret, transaction-pooler URL, and direct/session-pooler URL.
5. Apply migrations with the direct or session-pooler URL, never the port-6543 transaction pooler:

```bash
MIGRATION_DATABASE_URL='postgresql://...' pnpm db:migrate
```

6. Seed the hosted demo using inboxes that can receive Magic Links:

```bash
API_DATABASE_URL='postgresql://...:6543/postgres' \
API_SUPABASE_URL='https://PROJECT.supabase.co' \
API_SUPABASE_SERVICE_ROLE_KEY='...' \
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY='...' \
DEMO_ORGANIZER_EMAIL='organizer@your-domain.example' \
DEMO_EXHIBITOR_EMAIL='exhibitor@your-domain.example' \
pnpm db:seed
```

The runtime client disables prepared statements, which is required for Supabase transaction-pooler connections on port 6543.

## 4. Deploy the API

Build from the repository root:

```bash
docker build -f apps/api/Dockerfile -t exai-api .
```

Set these variables on the container host:

```text
NODE_ENV=production
API_DATABASE_URL=<Supabase transaction-pooler URL>
API_SUPABASE_URL=<project URL>
API_SUPABASE_SERVICE_ROLE_KEY=<service-role key>
API_CORS_ORIGIN=https://exai.example.com
API_PUBLIC_WEB_ORIGIN=https://exai.example.com
API_PORT=3001
```

Expose port 3001. Configure `/healthz` as liveness and `/readyz` as readiness. Readiness returns 503 when Postgres is unavailable.

## 5. Deploy the web app to Vercel

Create a Vercel project for this repository with `apps/web` as the root directory. The checked-in `apps/web/vercel.json` installs the monorepo from the repository root and builds the `web` workspace.

Set for Production and Preview:

```text
NEXT_PUBLIC_SUPABASE_URL=<project URL>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable key>
NEXT_PUBLIC_API_BASE_URL=https://api.exai.example.com
```

Deploy, then update Supabase's Site URL and callback allow-list if Vercel assigned a different final hostname.

## 6. Integration status

The complete variable inventory is in `.env.example`. Never put server secrets in `NEXT_PUBLIC_*` variables. The release status is:

- Supabase Auth and Postgres: required and verified locally.
- PostHog: the server feature-flag adapter performs real grouped evaluation, but no demo route mounts it yet.
- AWS SES: configure it as Supabase's production SMTP provider; the application does not call SES directly.
- Anthropic, OpenAI, NVIDIA Build, Voyage, Stripe, Sentry, and VAPID: reserved configuration only; their application modules are not part of the verified demo path.

The hackathon demo uses deterministic database-derived insights and does not require an AI key to remain usable.

## 7. Production verification

```bash
curl -f https://api.exai.example.com/healthz
curl -f https://api.exai.example.com/readyz
bash scripts/verify-production.sh https://api.exai.example.com https://exai.example.com
```

Then verify in a browser:

1. `/demo` loads and resolves the seeded event.
2. `/e/techexpo-2027` lists live exhibitors without authentication.
3. A booth QR page sends a Magic Link.
4. `/auth/callback` creates the cookie session and completes booth enrollment.
5. The attendee profile saves.
6. The exhibitor dashboard, attendees, relationship notes, and insights load for the seeded exhibitor account.
7. The organizer dashboard, events, analytics, exhibitor list, and reports load for the seeded organizer account.
8. Protected organizer/exhibitor routes redirect signed-out users to `/auth`.
9. Browser network logs contain no 404 or 500 responses.

## 8. Required secret handling

- Store API and worker secrets only in the hosting platform's encrypted environment store.
- Keep the Supabase service-role key out of Vercel and all browser bundles.
- Use separate Preview and Production Supabase projects where possible.
- Rotate a key immediately if it appears in logs, screenshots, commits, or support tickets.

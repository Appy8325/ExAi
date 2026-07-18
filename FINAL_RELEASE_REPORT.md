# ExAi final release report

**Release date:** 2026-07-18  
**Release scope:** cloud-deployable hackathon demo  
**Status:** release candidate verified locally and in Linux containers; not deployed to hosted cloud accounts

## Executive summary

The primary demo path is deployable from a fresh frozen install and runs against real Supabase Auth/Postgres data. The attendee public directory and booth enrollment flow, exhibitor dashboard/relationships/notes/insights, and organizer overview/events/analytics/reports use live API and database results. Public and protected route behavior, production builds, migrations, seed data, and the API container runtime were verified.

This repository is not represented as a fully hosted production deployment. No Vercel credentials or project link and no cloud-host API credentials were available in the execution environment. Several broader roadmap packages remain scaffolds and are not mounted by the verified demo: AI model providers, billing, error reporting, push, and worker queue consumers. Those gaps are listed explicitly below.

## Completed work

### Build and deployment

- Added the current Supabase CLI and `tsx` to the frozen workspace toolchain.
- Corrected Turbo task outputs for packages whose build scripts intentionally perform `tsc --noEmit`.
- Fixed Next.js ESLint flat-config detection and replaced raw remote logo images with `next/image`.
- Made API and worker local start scripts load app-local `.env` files before imports execute.
- Added production environment validation for API CORS, Supabase, web origin, and port settings.
- Fixed both Dockerfiles so internal workspace build dependencies are installed in Linux builds.
- Excluded nested `node_modules`, `.next`, `.turbo`, `dist`, coverage, and logs from Docker context. The context dropped from approximately 302 MB to 52 KB.
- Built `exai-api:release` and `exai-worker:release` successfully from the frozen lockfile.
- Ran the API image as a container and verified liveness, database readiness, and seeded event access.

### Supabase, database, and auth

- Updated local and production Supabase configuration to the installed CLI schema.
- Configured the Postgres client with prepared statements disabled for transaction-pooler compatibility.
- Added a separate `MIGRATION_DATABASE_URL` path for direct/session-pooler migrations.
- Replaced the no-op seed entry point with an idempotent hosted/local demo seed.
- Seeded TechExpo 2027, 5 exhibitors, 200 attendees, and 500 exhibitor relationships.
- Corrected Magic Link redirects to the configured public web origin.
- Completed enrollment for both PKCE code and token-hash callback paths.
- Corrected enrollment, booth, event, organization, and exhibitor identifiers across API contracts.
- Made `/readyz` execute a real database probe and return 503 on database failure.

### API and web demo

- Added an authenticated organizer overview endpoint backed by live aggregate queries.
- Replaced organizer dashboard, events, analytics, exhibitor, and report mock data with live API results.
- Replaced attendee and exhibitor fake AI animations/cards with deterministic database-derived insight summaries.
- Removed dead or unsupported navigation from the surfaced role journeys; direct unsupported settings/team/document pages now state their real read-only or empty status.
- Corrected middleware so public event, exhibitor, and booth pages are accessible while saved/organizer/exhibitor/account pages remain protected.
- Corrected the `/demo` organization link and booth identifier.
- Implemented real PostHog feature-flag evaluation, payload/variant access, grouped context, and outage-safe defaults.

### Documentation and configuration

- Rebuilt `.env.example` as a complete inventory with required core values separated from reserved integrations.
- Replaced `DEPLOYMENT.md` with tested local, Supabase, API-container, Vercel, secret-handling, and browser-verification steps.
- Added this report with verified status and unresolved boundaries.

## Files changed

The release changes span 64 tracked files plus new tests/services and this report. The main groups are:

- Root/tooling: `.dockerignore`, `.env.example`, `package.json`, `pnpm-lock.yaml`, `turbo.json`, `DEPLOYMENT.md`.
- Container targets: `apps/api/Dockerfile`, `apps/worker/Dockerfile`, API/worker package scripts and worker bootstrap validation.
- API bootstrap/health/auth: `apps/api/src/main.ts`, Supabase config/auth service, health controller/module.
- API engagement: enrollment controllers/service/repository, public exhibitor service, organizer overview controller/service, and their tests.
- Web auth/routing/demo: middleware, callback route, demo page, attendee directory/profile/booth pages.
- Web role surfaces: organizer console pages/navigation and exhibitor dashboard/relationship/insight/settings/team/document surfaces.
- Shared clients/data: public exhibitor API client, Postgres/Drizzle config, demo seed, and seed entry point.
- Supabase: `supabase/config.toml` and `supabase/production-config.toml`.
- Feature flags: `packages/flags/src/feature-flag.service.ts` and its test.

Use `git diff --stat` and `git status --short` for the exact working-tree inventory. No commit, push, Vercel deployment, or hosted Supabase migration was performed.

## Verification results

| Check | Result |
|---|---|
| `pnpm install --frozen-lockfile` | Pass |
| `pnpm typecheck` | Pass: 19/19 Turbo tasks |
| `pnpm lint` | Pass: 20/20 Turbo tasks; 31 non-failing warnings remain in dormant AI and legacy lead-form scaffolds |
| `pnpm test` | Pass: 21/21 Turbo tasks; 111 tests across database/RLS, API, web, flags, and shared packages |
| `pnpm build` | Pass: 11/11 build tasks; clean Next.js production build |
| Supabase CLI configuration | Pass with CLI 2.109.1 |
| Drizzle migrations | Pass against local Supabase Postgres |
| Demo seed | Pass: 5 booths, 200 attendees, 500 relationships |
| API Docker build | Pass |
| Worker Docker build | Pass |
| API Docker runtime | Pass: `/healthz`, `/readyz`, seeded event |
| Production web HTTP | Pass: `/`, `/demo`, event directory, and booth visit return 200 |
| Protection behavior | Pass: organizer/saved pages redirect to auth; organizer API returns 401 without a bearer token |
| Authenticated demo flows | Pass locally: organizer overview, exhibitor dashboard, relationship workspace, note create/update/archive, enrollment completion, attendee profile update |

## Deployment status

- **Web/Vercel:** production Next.js build verified. Not deployed because no Vercel project link or credentials were available.
- **API:** Linux image built and runtime-smoked. Not pushed to a registry or deployed because no container-host target/credentials were available.
- **Supabase:** local Auth/Postgres/Storage/Realtime stack parsed and ran; migrations and seed passed. A project link exists, but no Supabase access token was available, so hosted migrations/configuration were not changed.
- **Worker:** Linux image built. It is optional for this demo because no verified demo route enqueues a job; no queue consumers are registered.

## Required cloud configuration and secrets

### Required for the verified demo

- Web: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_API_BASE_URL`.
- API: `API_DATABASE_URL`, `API_SUPABASE_URL`, `API_SUPABASE_SERVICE_ROLE_KEY`, `API_CORS_ORIGIN`, `API_PUBLIC_WEB_ORIGIN`; `API_PORT` is optional and defaults to 3001.
- Migrations: `MIGRATION_DATABASE_URL` using the direct connection or session pooler.
- Hosted seed: `DEMO_ORGANIZER_EMAIL` and `DEMO_EXHIBITOR_EMAIL` using real inboxes that can receive Magic Links.
- Worker, only if deployed: `WORKER_REDIS_URL`; `WORKER_DATABASE_URL` is reserved for future consumers.

`API_SUPABASE_JWT_SECRET` is inventoried for future local JWT verification but is not consumed by the current API, which validates bearer tokens through Supabase Auth.

### Required Supabase settings

- Site URL set to the deployed web origin.
- Redirect allow-list includes `<web-origin>/auth/callback`.
- Production SMTP configured; AWS SES can be the SMTP provider.
- Runtime database URL uses the transaction pooler; migration URL uses direct/session mode.
- Service-role key remains API-only and must never be exposed to Vercel/browser code.
- Storage buckets and Realtime need no demo-specific setup because the verified demo does not use them.

### Reserved integration keys

The example environment also inventories `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `NVIDIA_API_KEY`, `NVIDIA_BASE_URL`, `VOYAGE_API_KEY`, `POSTHOG_API_KEY`, `POSTHOG_HOST`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `SENTRY_DSN`, `SENTRY_AUTH_TOKEN`, AWS credentials, and VAPID keys.

These are not release prerequisites for the verified deterministic demo. Do not provision or claim them as active until the owning module is mounted and tested.

## Remaining blockers and TODOs

1. Supply cloud account access and final domains, then perform the Vercel, API-host, and hosted Supabase deployment in `DEPLOYMENT.md`.
2. Configure hosted SMTP and run an actual delivered Magic Link through the final domain.
3. Replace or remove the unmounted `packages/ai` Milestone 3 methods that still throw `not implemented`; OpenAI, Anthropic, NVIDIA Build, and Voyage are not end-to-end verified.
4. Implement and register worker queue producers/consumers before treating the worker as functional infrastructure.
5. Mount and verify PostHog in the API/worker lifecycle if remote flags are enabled.
6. Implement Stripe billing/webhooks, Sentry capture, direct SES notification sending, and VAPID push before enabling those roadmap features.
7. Replace the placeholder `openapi:emit` script with real schema generation if the API client is to become generated rather than hand-maintained.
8. Resolve the remaining lint warnings in dormant AI services and legacy lead-form code.
9. Add hosted browser automation for final-domain Magic Link delivery and all three authenticated role journeys.

## Release decision

The core hackathon demo is a deployable release candidate and has passed every requested repository gate plus local Supabase and Linux-container runtime verification. It is **not yet a cloud-hosted release** until credentials, hosted SMTP, final domains, hosted migrations/seed, and post-deploy authenticated browser checks are completed. Broader AI/billing/observability/worker roadmap scaffolds must not be described as shipped functionality.

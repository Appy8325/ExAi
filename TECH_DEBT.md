# TECH_DEBT

**Date:** July 22, 2026
**Priority:** Ordered by severity and ROI

---

## CRITICAL (Fix Before Production)

### TD-01: Vercel OIDC Token in `.env.local`
**File:** `apps/web/.env.local` lines 5-6
```env
VERCEL_OIDC_TOKEN="eyJ..."
```
**Impact:** Production access token committed to version control. Immediately rotate and remove.
**Fix:** Remove from `.env.local`, store in Vercel environment variables only.

### TD-02: API TypeScript Build Broken
**File:** `apps/api/tsconfig.json` line 9
```json
"moduleResolution": "Node10"
```
**Impact:** `pnpm build` fails on API package because `Node10` resolution cannot resolve pnpm's isolated symlinks. Blocks CI/CD.
**Fix:**
```json
"moduleResolution": "Bundler"
// or
"moduleResolution": "NodeNext"
```
This is why `turbo run build` fails and web can't deploy.

### TD-03: ClamAV Malware Scanning Disabled
**File:** `packages/ai/src/knowledge/upload-security.ts` line 83
**Impact:** File uploads not scanned for malware. Production security waiver only applies to demonstrations.
**Fix:** Re-enable ClamAV integration, run `docker pull clamav/clamav` in worker container, set `CLAMAV_HOST`/`CLAMAV_PORT`.

---

## HIGH PRIORITY

### TD-04: No Validation Pipes on API
**Files:** All API controllers
**Impact:** No DTO validation on requests. Malformed inputs cause runtime errors or data corruption.
**Fix:** Add `class-validator` DTOs and apply `ValidationPipe` globally in `main.ts`:
```typescript
app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
```

### TD-05: ProblemDetailsFilter Unimplemented
**File:** `apps/api/src/common/problem-details.filter.ts` lines 5-17
**Impact:** Errors return NestJS default format, not RFC 9457 `application/problem+json`. API consumers can't programmatically handle errors.
**Fix:** Map exceptions to RFC 9457 format:
```typescript
catch(exception: HttpException) {
  const body = { type: 'about:blank', title: exception.message, status: exception.getStatus() };
  reply.status(exception.getStatus()).send(body);
}
```

### TD-06: Demo Endpoints Expose PII Publicly
**Files:** `public-exhibitors.controller.ts` lines 9-12, `public-demo.controller.ts`
**Impact:** `GET /v1/public/demo/exhibitor/:id/visitors` returns attendee names, companies, job titles without authentication.
**Fix:** Gate demo endpoints behind `DEMO_MODE=true` env check, or add API key auth, or move to separate middleware that only loads in non-production.

### TD-07: Demo Admin Simulation Controls Unprotected
**File:** `apps/web/src/app/demo/admin/page.tsx`
**Impact:** Anyone can start/stop/reset the demo simulation at `/demo/admin`.
**Fix:** Either (a) add auth gate to the page, (b) remove the admin page entirely and control via backend env, or (c) restrict to `localhost` via middleware.

### TD-08: Demo Auto-Start in Non-Production
**File:** `demo-simulation.service.ts` lines 98-106
```typescript
if (autoStart === "true" || (autoStart === undefined && process.env.NODE_ENV !== "production")) {
  this.startSimulation();
}
```
**Impact:** Simulation auto-starts whenever API starts without `NODE_ENV=production`. Could corrupt demo data if started in staging.
**Fix:** Require explicit `DEMO_SIMULATION_AUTO_START=true` — remove the implicit auto-start branch.

### TD-09: Analytics No Caching — On-Read Computation
**Files:**
- `organizer-reporting.service.ts` lines 65-110 (complex multi-CTE SQL on every request)
- `exhibitor-dashboard.repository.ts` lines 16-60 (full dashboard SQL per request)
**Impact:** Every analytics request executes expensive multi-CTE queries. Under load, this will cause latency spikes and DB overload.
**Fix:** Pre-compute and cache analytics on a schedule (e.g., every 5 minutes via worker job). Store in `organizer_reports` and `event_exhibitors` tables with `updated_at`.

### TD-10: Attendee Relationships Missing Index
**File:** `packages/database/schema/engagement.ts`
**Impact:** No index on `exhibitor_relationships.attendee_user_id`. "Get all relationships for attendee X" queries scan full table.
**Fix:**
```sql
CREATE INDEX exhibitor_relationship_notes_attendee_user_id_idx ON exhibitor_relationships(attendee_user_id);
```

---

## MEDIUM PRIORITY

### TD-11: Connection Pool Max=10
**File:** `packages/database/src/client.ts` line 18
```typescript
const queryClient = postgres(connectionString, { max: 10, prepare: false });
```
**Impact:** Under production load, 10 connections may bottleneck. Each API pod gets 10 connections; Railway/Render may run multiple replicas.
**Fix:** Increase to 20-30 and configure `pgbouncer` connection pooler correctly (already in connection string).

### TD-12: 40 Client Components — Bundle Size
**File:** `apps/web/src/` (grep for `"use client"` returns ~40 files)
**Impact:** Large JS bundle, slower initial load, worse Core Web Vitals.
**Fix:** Audit each `"use client"` — convert ones that only use event handlers to server components with inline handlers. Use `React.lazy()` for heavy components like `CommandPalette`.

### TD-13: Polling Every 5-8 Seconds
**Files:** `live-metrics.tsx`, `live-demo-stats.tsx`, `shell.tsx`
**Impact:** Unnecessary re-renders, server load, and bandwidth. 4 components polling at 5s, 6s, 8s intervals.
**Fix:** Replace with **SWR** or **React Query** with `refreshInterval` or use **Supabase Realtime** subscriptions for live updates.

### TD-14: Inconsistent Auth Patterns in API
**Files:** `engagement/` module — 3 different approaches
**Impact:** Maintenance burden, security inconsistency, confusion.
**Fix:** Standardize on guard-based auth only. Extract `getTokenFromHeader()` helper, apply `SupabaseRequestContextGuard` globally.

### TD-15: Silent Error Swallowing in lib/
**Files:** `lib/organizer.ts`, `lib/exhibitor.ts`
```typescript
} catch {
  return undefined;  // silently fails
}
```
**Impact:** Debugging production issues is harder. Errors vanish without logging.
**Fix:** Log errors with `console.error` (or a logger) and return `undefined` — preserve debuggability.

### TD-16: No Global Error Boundary
**Files:** No `error.tsx` or `global-error.tsx` in any route segment
**Impact:** Unhandled React errors show blank page or crash the entire app.
**Fix:** Add `app/global-error.tsx` with graceful fallback UI:
```tsx
"use client";
export default function GlobalError({ error, reset }) {
  return (
    <html><body>
      <h1>Something went wrong</h1>
      <button onClick={reset}>Try again</button>
    </body></html>
  );
}
```

### TD-17: Missing Loading.tsx for 4 Routes
**Files:** `(attendee)/e/[eventSlug]`, `(portal)/exhibit/page.tsx`, etc.
**Impact:** Layout shift, poor perceived performance.
**Fix:** Add `loading.tsx` to each route using `Skeleton` and `SkeletonCard` from `@concourse/ui`.

### TD-18: No Rate Limiting on Public Endpoints
**Files:** `public-enrollment.controller.ts`, `public-booth.controller.ts`
**Impact:** DoS risk on enrollment and booth endpoints.
**Fix:** Add `@nestjs/throttler` with global rate limits:
```typescript
app.useGlobalGuards(new ThrottlerModule.register([
  { ttl: 60000, limit: 60 },  // 60 req/min globally
]));
```

### TD-19: N+1 in Profile Enrichment
**File:** `record_profile_enrichments()` in database trigger/migration
**Impact:** On every attendee profile update, N subqueries for N relationships.
**Fix:** Batch query all affected relationship IDs, then batch update.

### TD-20: AsyncLocalStorage Not Wired
**File:** `request-context.ts` line 9
**Impact:** Request context only populated by guards. If any code path skips guards, context is empty.
**Fix:** Add Fastify `onRequest` hook in `application.ts`:
```typescript
fastify.addHook('onRequest', async (request) => {
  // set context here
});
```

### TD-21: Demo Mixed With Production Routes
**Files:** `/hackathon` listed in PERSPECTIVES nav alongside demo routes
**Impact:** Live event data (production) shares UI patterns with simulated data.
**Fix:** Rename `/hackathon` to `/e/techexpo-2027` and merge with the `(attendee)` route group. Remove from demo nav.

### TD-22: API Response No Standard Envelope
**Files:** All controllers
**Impact:** Clients must handle different response shapes. No way to add pagination metadata, request IDs, etc.
**Fix:** Implement a response interceptor that wraps all responses:
```typescript
{
  data: <actual_data>,
  meta: { requestId, timestamp, ...pagination }
}
```

---

## LOW PRIORITY

### TD-23: Duplicate DemoPageHeader Component
**Files:** `shell.tsx` vs `demo-page-header.tsx`
**Fix:** Remove one, keep the other. Prefer `demo-page-header.tsx` if it has more features.

### TD-24: Raw SQL Template Strings in Two Places
**Files:** `public-exhibitors.service.ts:575,620`
**Fix:** Convert to parameterized `sql` tagged template — already done correctly elsewhere.

### TD-25: entitlements Uses `defaultRandom()` Not uuidv7
**File:** `platform.ts` line 60
**Fix:** Change to `uuidv7()` for consistency.

### TD-26: OpenAPI Spec Empty
**File:** `packages/api-contract/openapi/concourse.v1.json`
**Fix:** Run OpenAPI spec generation from NestJS routes, or maintain spec manually. Without this, the api-client codegen is dead.

### TD-27: packages/shared/src/types/index.ts Empty
**File:** `packages/shared/src/types/index.ts`
**Fix:** Populate with shared domain types. This is where cross-cutting types like `UserId`, `OrgId`, `EventId` should live.

### TD-28: No E2E Tests in CI
**Files:** `apps/web/e2e/` (Playwright tests exist but not run in CI)
**Fix:** Add `pnpm e2e` to `ci.yml`:
```yaml
- run: pnpm --filter web e2e
```

### TD-29: Worker Queue Consumers Not Implemented
**Files:** 8 of 10 queue consumers throw `"not implemented"`
**Impact:** File AV scanning, webhook delivery, notification dispatch, etc. won't work.
**Fix:** Implement consumers before those features are needed. These are not blocking for MVP.

### TD-30: No Database Down Migrations
**Files:** All 19 migrations are forward-only
**Fix:** Add `down` methods to all migrations before production launch. Without rollback capability, schema changes are dangerous.

### TD-31: DB Connection Pool `prepare: false`
**File:** `packages/database/src/client.ts` line 20
**Impact:** Every query plan is recalculated. Slight performance hit per query.
**Fix:** Enable prepared statements in production if SQL injection risk is acceptable:
```typescript
prepare: process.env.NODE_ENV === 'production',
```

### TD-32: Env Var Mismatch (AI)
**File:** `.env.example` has `ANTHROPIC_API_KEY`, `VOYAGE_API_KEY` but code uses `NVIDIA_API_KEY`
**Fix:** Either remove unused env vars from example, or implement AI provider abstraction that supports multiple providers.

---

## DEAD CODE (Remove)

### DC-01: packages/api-contract/openapi/concourse.v1.json is `{}`
**File:** `packages/api-contract/openapi/concourse.v1.json`
Remove this file or populate it — empty OpenAPI spec is misleading.

### DC-02: packages/shared/src/types/index.ts is `export {}`
**File:** `packages/shared/src/types/index.ts`
Either populate it or remove the export.

### DC-03: packages/api-contract/src/validation-pipe.ts is `{}`
**File:** `packages/api-contract/src/validation-pipe.ts`
Same — populate or remove.

### DC-04: AgendaModule Has Service But No Controller
**Files:** `agenda/` module files
Either implement the controller or move the service logic to the modules that need it.

### DC-05: Marketing Nav in Two Places
**Files:** `app/(marketing)/_components/marketing-nav.tsx` and `GlobalNav` used in marketing layout
Deduplicate — keep one source of truth for marketing navigation.

---

## QUICK WINS (Under 1hr Each)

1. **TD-16** — Add `app/global-error.tsx` (30 min)
2. **TD-15** — Add error logging to `lib/organizer.ts` and `lib/exhibitor.ts` (15 min)
3. **TD-17** — Add missing `loading.tsx` files (30 min per route, batch them)
4. **TD-02** — Fix API tsconfig `moduleResolution` (5 min)
5. **TD-01** — Remove OIDC token from `.env.local` (5 min)
6. **DC-05** — Deduplicate marketing nav (30 min)
7. **DC-01/02/03** — Remove or populate empty placeholder files (15 min)
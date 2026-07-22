# ARCHITECTURE_RECOMMENDATIONS

**Date:** July 22, 2026

---

## 1. MONOREPO ORGANIZATION — KEEP AS-IS

The pnpm + Turborepo monorepo is the right choice. The package boundary between `packages/shared` (zero deps), `packages/ui`, `packages/ai`, `packages/database`, and the apps is clean. The SDK containment rules (AI SDK to `packages/ai`, AWS SDK to `packages/notifications`) prevent dependency sprawl.

**Keep:**
- `packages/shared` with zero internal deps — excellent isolation
- SDK boundaries enforced in ESLint
- Turborepo for build orchestration
- Shared `packages/config` for lint/ts/prettier

**Change:**
- API tsconfig `moduleResolution` (see TD-02 in TECH_DEBT.md)

---

## 2. FRONTEND ARCHITECTURE

### Keep: Next.js App Router with Route Groups

Route groups `(marketing)`, `(auth)`, `(attendee)`, `(portal)`, `(console)` provide clean layout composition without URL impact. This is the correct pattern.

### Change: Reduce Client Components

**Problem:** 40 `"use client"` components ship JavaScript to the browser that could be server-rendered.

**Recommendation:**
```tsx
// BEFORE (client component for click handler)
"use client";
import { useState } from "react";
export function BoothCard({ booth }) {
  const [saved, setSaved] = useState(false);
  return <button onClick={() => setSaved(!saved)}>{saved ? "Saved" : "Save"}</button>;
}

// AFTER (server component with inline handler)
export function BoothCard({ booth }: { booth: Booth }) {
  return (
    <button
      onClick={async () => {
        "use server";
        await saveBooth(booth.id);
      }}
    >
      Save
    </button>
  );
}
```
Audit each client component — if it only has click handlers, migrate to server component + inline `onClick={async () => { "use server"; ... }}`.

### Change: Replace Polling with Supabase Realtime

**Problem:** 4 components poll every 5-8 seconds, causing unnecessary renders and server load.

**Recommendation:** Use Supabase Realtime subscriptions:
```typescript
// BEFORE
useEffect(() => {
  const interval = setInterval(() => fetchMetrics(), 5000);
  return () => clearInterval(interval);
}, []);

// AFTER
useEffect(() => {
  const channel = supabase
    .channel('live-metrics')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'exhibitor_dashboard_visits' }, handleChange)
    .subscribe();
  return () => { supabase.removeChannel(channel); };
}, []);
```
This eliminates polling entirely and delivers updates within ~100ms of DB change.

### Keep: Supabase SSR Pattern

The `createBrowserClient` / `createServerClient` / `updateSession` in middleware pattern is correct. Keep it.

### Change: Standardize API Client Usage

**Problem:** Mix of raw `fetch()` and typed api-client throughout.

**Recommendation:** Enforce api-client usage via ESLint:
```javascript
// eslint rule: no-raw-fetch
// Disallow: fetch(url)
// Allow: getExhibitorOverview(client, id)
```
Over time, migrate all raw `fetch` calls to typed client functions.

### Change: Remove Demo/Production Route Mixing

`/hackathon` is a production route but appears in PERSPECTIVES navigation alongside `/demo` routes. Clean separation:
- Move `/hackathon` → `/e/techexpo-2027` (existing exhibitor directory infrastructure)
- Remove `/hackathon` from demo navigation

---

## 3. API ARCHITECTURE

### Keep: NestJS + Fastify

Fastify is faster than Express and the `@nestjs/platform-fastify` adapter is production-ready. Keep it.

### Keep: Fastify onRequest Hook (Wire It Up)

The `AsyncLocalStorage` for request context exists but is never populated. Wire it:

```typescript
// application.ts
import { onRequest } from './common/request-context';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new FastifyAdapter());
  app.registerFastifyPlugin(onRequest); // sets AsyncLocalStorage context
  await app.listen(+process.env.API_PORT || 3001, '0.0.0.0');
}
```

### Change: Global Validation Pipe

**Add to `main.ts`:**
```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
  }),
);
```

Create DTOs in `apps/api/src/common/dto/` with `class-validator` decorators.

### Change: ProblemDetailsFilter Implementation

Implement RFC 9457 in `apps/api/src/common/problem-details.filter.ts`. Every error response should be:
```json
{
  "type": "https://exai.app/problems/validation-error",
  "title": "Bad Request",
  "status": 400,
  "detail": "The request body contains invalid fields.",
  "instance": "/v1/organizer/events",
  "errors": [{ "field": "name", "message": "must not be empty" }]
}
```

### Change: Standard Response Envelope

Add a response interceptor that wraps all responses:
```typescript
@Injectable()
export class ResponseEnvelopeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => ({
        data,
        meta: {
          requestId: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
        },
      })),
    );
  }
}
app.useGlobalInterceptors(new ResponseEnvelopeInterceptor());
```

### Change: Standardize Auth — Guards Only

Remove all manual header parsing. Every controller should use `@UseGuards(SupabaseRequestContextGuard)`. Create an `OrganizationAuthorizationGuard` that checks org membership.

### Change: Global Rate Limiting

```typescript
app.use(
  await ThrottlerModule.register([
    { ttl: 60000, limit: 60 },   // 60 req/min per IP globally
    { ttl: 3600000, limit: 1000 }, // 1000 req/hr per IP
  ]),
);
```

### Change: Move Demo Endpoints to Separate Module

Demo endpoints should be in a `DemoModule` that's only loaded in non-production environments:
```typescript
// app.module.ts
if (process.env.NODE_ENV !== 'production') {
  moduleRefs.push(DemoModule);
}
```
This prevents demo code from being deployed to production at all.

---

## 4. DATABASE ARCHITECTURE

### Keep: Drizzle ORM with Raw SQL

Drizzle with raw `sql` template tags is the right balance of type safety and flexibility. Keep it.

### Keep: RLS with Tenant Isolation

Excellent design. Keep the `app_tenant` / `app_platform` role separation.

### Change: Add Missing Indexes

```sql
-- For "all relationships for attendee X" queries
CREATE INDEX exhibitor_relationships_attendee_user_id_idx
  ON exhibitor_relationships(attendee_user_id);

-- For "all notes by user X" queries
CREATE INDEX exhibitor_relationship_notes_created_by_user_id_idx
  ON exhibitor_relationship_notes(created_by_user_id);

-- For "all submissions for event" queries
CREATE INDEX lead_submissions_event_id_submitted_at_idx
  ON lead_submissions(event_id, submitted_at DESC);

-- For KB processing queue
CREATE INDEX kb_sources_status_idx ON kb_sources(status) WHERE status = 'pending';
```

### Change: Increase Connection Pool

```typescript
// packages/database/src/client.ts
const queryClient = postgres(connectionString, {
  max: 30,           // was 10
  idleTimeout: 20,   // seconds before idle connection closed
  connectTimeout: 10,
});
```

### Change: Add Materialized View for Organizer Analytics

Instead of computing analytics on every request, pre-compute:
```sql
CREATE MATERIALIZED VIEW organizer_event_metrics AS
SELECT
  event_id,
  COUNT(DISTINCT attendee_user_id) AS unique_visitors,
  COUNT(*) AS total_visits,
  COUNT(DISTINCT relationship_id) AS total_leads,
  AVG(interaction_count) AS avg_interactions
FROM exhibitor_relationships
GROUP BY event_id;

CREATE UNIQUE INDEX ON organizer_event_metrics(event_id);
```
Refresh every 5 minutes via worker job.

### Change: Connection Pooler Configuration

Ensure `pgbouncer` is configured correctly for the pooled connection string:
```
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 20
```

---

## 5. AI ARCHITECTURE

### Keep: Provider Isolation in packages/ai

AI logic in `packages/ai` with no transitive dependencies on API or web is correct.

### Change: Implement AI Gateway

The `AiGatewayService` should be the **only** path for AI calls:
```
Controller → AiGatewayService → AiBudgetService → AiGuardrailService → Provider
                                                              ↓
                                              AiGenerationService / AiEmbeddingService
```
Without this, there's no budget control, no unified error handling, no observability.

### Change: Implement AI Budget Service

Before production launch with paid customers, implement `AiBudgetService`:
```typescript
interface BudgetLimit {
  organizationId: string;
  monthlyAiSpendLimit: number;  // USD
  monthlyCompletionTokens: number;
  monthlyEmbeddingTokens: number;
}
async reserveBudget(orgId: string, tokens: number): Promise<boolean> {
  // Deduct from org's budget, reject if exceeded
}
async recordUsage(orgId: string, tokens: number, cost: number): void {
  // Record actual usage
}
```
This prevents runaway AI costs from a single bad prompt or infinite loop.

### Change: ClamAV — Re-enable Before Production

```typescript
// In kb-ingest.consumer.ts or file-av-scan.consumer.ts
const result = await scanFile(buffer);
if (result.containsVirus) {
  await kbSources.update(id, { status: 'quarantined', quarantineReason: result.virusName });
  return;
}
```
Set `CLAMAV_HOST` and `CLAMAV_PORT` in production. Re-enable the check in `packages/ai/src/knowledge/upload-security.ts`.

### Change: Move to Multi-Provider Gateway

Abstract provider behind interface:
```typescript
interface AIProvider {
  complete(prompt: string, model: string): Promise<Completion>;
  embed(text: string): Promise<number[]>;
}
class NvidiaProvider implements AIProvider { ... }
class AnthropicProvider implements AIProvider { ... }
class VoyageProvider implements AIProvider { ... }
```
Use `NVIDIA_API_KEY` for embeddings (best quality for similarity), Anthropic for completions (better reasoning for lead intelligence).

---

## 6. CACHING STRATEGY

### Recommended Caching Layers

| Layer | What | TTL | Implementation |
|-------|------|-----|----------------|
| CDN | Static assets, images | 1 year | Vercel Edge |
| Next.js ISR | Marketing pages | 1 hour | `revalidate` |
| Redis | Analytics results | 5 min | `BullMQ` or `ioredis` |
| Supabase Realtime | Live data (polling replacement) | Push | Subscription |
| HTTP `Cache-Control` | API responses | 60s | Middleware |

### Redis for Analytics Cache

```typescript
// analytics.service.ts
async getOrganizerAnalytics(eventId: string): Promise<Analytics> {
  const cacheKey = `analytics:org:${eventId}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const analytics = await computeAnalytics(eventId);
  await redis.setex(cacheKey, 300, JSON.stringify(analytics)); // 5 min TTL
  return analytics;
}
```

---

## 7. ERROR HANDLING HIERARCHY

```
┌─────────────────────────────────────────┐
│  Global Error Boundary (app/error.tsx) │  ← Catches React errors
├─────────────────────────────────────────┤
│  ProblemDetailsFilter (API)             │  ← Catches HTTP errors
├─────────────────────────────────────────┤
│  ThrottlerGuard                         │  ← Rate limit exceeded
├─────────────────────────────────────────┤
│  SupabaseRequestContextGuard            │  ← Auth failures
├─────────────────────────────────────────┤
│  ValidationPipe                         │  ← DTO validation errors
└─────────────────────────────────────────┘
```

Implement in order. Currently only the bottom two exist as stubs.

---

## 8. RELIABILITY PATTERNS

### Circuit Breaker for AI Calls

```typescript
// ai-generation.service.ts
private circuitBreaker = new CircuitBreaker(callAi, {
  timeout: 10000,
  errorThresholdPercentage: 50,
  resetTimeout: 30000,
});

async complete(prompt: string): Promise<string> {
  return this.circuitBreaker.fire(prompt).catch(() => {
    return "AI service temporarily unavailable. Please try again.";
  });
}
```

### Retry with Exponential Backoff

For transient failures (network, DB connection):
```typescript
async withRetry<T>(fn: () => Promise<T>, maxAttempts = 3): Promise<T> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === maxAttempts - 1) throw err;
      await sleep(Math.pow(2, i) * 100);
    }
  }
  throw new Error('unreachable');
}
```

### Health Checks with Deep Checks

```typescript
// health.controller.ts
@Get('readyz')
async readyz() {
  const checks = await Promise.allSettled([
    this.db.execute(sql`SELECT 1`),      // DB connectivity
    redis.ping(),                          // Redis (if added)
    this.aiService.healthCheck(),          // AI provider
  ]);
  const failures = checks.filter(c => c.status === 'rejected');
  if (failures.length > 0) {
    return { status: 'degraded', failures: failures.map(f => f.reason) };
  }
  return { status: 'ok' };
}
```

---

## 9. OBSERVABILITY

### Structured Logging

Replace `console.log` with structured logger:
```typescript
import pino from 'pino';
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

logger.info({ event: 'lead_submission', eventExhibitorId, attendeeEmail }, 'New lead');
logger.error({ event: 'ai_guardrail_reject', submissionId, error }, 'Guardrail failed');
```

### Metrics to Capture

| Metric | Source | Dashboard |
|--------|--------|-----------|
| API latency p50/p95/p99 | Fastify | Grafana |
| AI spend (per org, daily) | `AiBudgetService` | Grafana |
| Lead conversion rate | DB query | Supabase |
| Active concurrent sessions | DB query | Grafana |
| Queue depth (worker) | BullMQ | Grafana |
| Error rate by endpoint | ProblemDetailsFilter | Grafana |

### Distributed Tracing

Add OpenTelemetry:
```typescript
// main.ts
import { NodeSDK } from '@opentelemetry/sdk-node';
const sdk = new NodeSDK({ traceExporter: new ConsoleExporter() });
sdk.start();
```

---

## 10. SECURITY HARDENING

### Content Security Policy

```typescript
// next.config.ts
headers: [
  {
    source: '/(.*)',
    headers: [
      { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-inline'; img-src 'self' data: https://*.supabase.co; connect-src 'self' https://*.supabase.co https://api.exai.app;" },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    ],
  },
],
```

### Input Sanitization

- All user-provided text displayed in React should be sanitized (prevent XSS)
- Use React's default escaping — avoid `dangerouslySetInnerHTML` unless absolutely necessary
- URL validation already exists for exhibitor websites — extend to all URL fields

### Dependency Audit

```bash
pnpm audit
# Fix critical: pnpm audit fix
```
Run in CI to catch vulnerable dependencies before they reach production.

---

## 11. PACKAGE CONTRACT (API Versioning)

The OpenAPI spec is empty. Without it, the api-client cannot generate typed clients and the API has no contract.

**Recommendation:** Implement API versioning via URL prefix (`/v1/`, `/v2/`) and maintain the OpenAPI spec as the source of truth.

```yaml
# Concourse API v1
openapi: 3.1.0
info:
  title: Concourse API
  version: 1.0.0
paths:
  /v1/organizer/overview:
    get:
      summary: Get organizer overview
      responses:
        '200':
          description: Success
```

Generate client from spec:
```bash
npx @openapitools/openapi-generator-cli generate \
  -i packages/api-contract/openapi/concourse.v1.json \
  -g typescript-fetch \
  -o packages/api-client/src/generated
```

---

## 12. FRONTEND STATE MANAGEMENT

Currently no formal state management library. Data fetched per-page with `useEffect` or server components.

**Recommendation:** Adopt **TanStack Query** (React Query) for client-side data fetching:
- Caching, background refetch, optimistic updates built-in
- Replaces polling with `refetchInterval`
- `useQuery` / `useMutation` hooks for all API calls
- Works alongside server components (server = RSC, client = TanStack Query)

Keep `AuthSessionProvider` as React Context for auth state. TanStack Query for all API data.
# PRODUCTION_READINESS_CHECKLIST

**Date:** July 22, 2026
**Purpose:** Pre-launch gate for first paying customer

---

## HOW TO USE THIS CHECKLIST

Each item is marked:
- **[DONE]** — Implemented and verified
- **[TODO]** — Not yet implemented
- **[N/A]** — Not applicable to current phase

This checklist should be 100% complete before the first production deployment.

---

## 1. SECURITY

### Authentication & Authorization

- [TODO] **[DONE in DB]** Role-based access control enforced in UI — Owner/Admin/Member roles already in `organization_memberships.role` and `ORGANIZATION_ROLES` in `packages/shared`
- [TODO] **[DONE in DB]** Last-owner protection trigger — `organization_owner_invariant` prevents removing the last owner
- [TODO] **[TODO]** Session revocation UI — `auth_sessions.revoke` endpoint exists but no UI. Required for enterprise security.
- [TODO] **[TODO]** Session expiry enforcement — Supabase handles this, verify JWT expiry settings
- [TODO] **[TODO]** Organization invitation flow UI — `POST /v1/organizer/invitations/accept` exists, needs UI for sending invitations

### Data Protection

- [TODO] **[TODO]** ClamAV re-enabled — Currently waived (`TODO(security)` in `upload-security.ts:83`). Re-enable before file upload goes live.
- [TODO] **[TODO]** PII audit — All `attendee_profiles` shared only with consent (`attendee_profile_consents`). Verify `concourse.exhibitor_can_read_attendee_profile()` is called correctly.
- [TODO] **[TODO]** No PII in logs — Audit `console.log` calls for email, names, phone numbers. Replace with structured logging.
- [TODO] **[TODO]** API rate limiting — `@nestjs/throttler` available but not installed globally. Install before public launch.
- [TODO] **[TODO]** CSP headers — Not configured in `next.config.ts`. Add Content-Security-Policy before production.
- [TODO] **[TODO]** Vulnerability scan — Run `pnpm audit` and fix all critical/high vulnerabilities
- [TODO] **[TODO]** Dependency review — No `npm audit` in CI yet. Add to `ci.yml`.

### Secrets Management

- [TODO] **[DONE]** Vercel OIDC token removed from `.env.local` — Rotate immediately if not already done
- [TODO] **[TODO]** All secrets in environment variables — No hardcoded secrets in code (verified: none found)
- [TODO] **[TODO]** Supabase service role key protected — Never exposed to browser, only in API env
- [TODO] **[TODO]** NVIDIA_API_KEY validation at startup — Currently throws at runtime. Add startup check:
```typescript
// main.ts
if (!process.env.NVIDIA_API_KEY) {
  throw new Error('NVIDIA_API_KEY is required');
}
```

---

## 2. API RELIABILITY

### Error Handling

- [TODO] **[TODO]** `ValidationPipe` globally — No DTO validation currently. Add before launch.
- [TODO] **[TODO]** `ProblemDetailsFilter` implemented — Currently stub. Implement RFC 9457 before launch.
- [TODO] **[TODO]** Standard response envelope — All responses should have `{ data, meta: { requestId, timestamp } }`
- [TODO] **[TODO]** No unhandled promise rejections — Audit for `catch {}` blocks that swallow errors silently
- [TODO] **[TODO]** Global error boundary in Next.js — No `error.tsx` files exist. Add `app/global-error.tsx`

### Request Validation

- [TODO] **[TODO]** All POST/PATCH endpoints have DTOs — Currently none have class-validator DTOs
- [TODO] **[TODO]** Idempotency on POST endpoints — `lead_submissions.idempotency_key` exists but not enforced. Add unique constraint + conflict handling.

### Availability

- [TODO] **[TODO]** Health checks return 200/503 — `/healthz` returns 200 always, `/readyz` checks DB. Verify in production.
- [TODO] **[TODO]** Graceful shutdown — NestJS `app.enableShutdownHooks()` not called in `main.ts`. Add:
```typescript
app.enableShutdownHooks();
```
- [TODO] **[TODO]** Circuit breaker for AI calls — No circuit breaker. Add before AI calls go to production:
```typescript
new CircuitBreaker(callAi, { timeout: 10000, errorThresholdPercentage: 50 });
```
- [TODO] **[TODO]** Retry logic for transient failures — No retry implemented anywhere. Add for DB connection failures.

---

## 3. DATA INTEGRITY

### Database

- [TODO] **[TODO]** All tables have RLS — Verified: yes, all tenant tables have RLS. Confirm `auth_tokens` and `public_enrollments` are intentional exceptions.
- [TODO] **[DONE]** Immutable lead submissions — Trigger prevents UPDATE/DELETE on `lead_submissions` and `lead_submission_values`
- [TODO] **[TODO]** Down migrations exist — All 19 migrations forward-only. Add `down` methods before production.
- [TODO] **[TODO]** Backup restore tested — Supabase provides daily backups. Test a restore in staging.
- [TODO] **[TODO]** Connection pool tuned — `max=10` is low. Increase to 30 and verify pgbouncer settings.

### Analytics & Reporting

- [TODO] **[TODO]** Analytics caching — On-read computation on every request (complex multi-CTE SQL). Add Redis cache with 5-min TTL before production.
- [TODO] **[TODO]** Missing database indexes — 4 missing indexes identified (TD-10 through TD-13 in TECH_DEBT.md). Add before load testing.

### Lead Data

- [TODO] **[TODO]** Lead deduplication — No deduplication on `attendee_user_id` per exhibitor. Add unique constraint.
- [TODO] **[TODO]** AI output validation — `lead_intelligence` records with null fields if AI fails. Add fallback that computes deterministic scores.
- [TODO] **[TODO]** Profile consent enforced — `attendee_profile_consents.share_profile_with_exhibitors` checked via `exhibitor_can_read_attendee_profile()`. Verify this function is called in all relevant queries.

---

## 4. PERFORMANCE

### API Performance

- [TODO] **[TODO]** Analytics caching — Pre-compute and store results rather than computing on every request
- [TODO] **[TODO]** DB query optimization — Run `EXPLAIN ANALYZE` on the top 5 queries by frequency. Address sequential scans.
- [TODO] **[TODO]** Connection pool sizing — 10 is low for production. With 3 API pods × 10 = 30 connections. Add pgbouncer between.

### Frontend Performance

- [TODO] **[TODO]** Client components audit — 40 client components. Audit each — convert to server + inline handlers where possible.
- [TODO] **[TODO]** Remove polling — 4 components poll every 5-8s. Replace with Supabase Realtime subscriptions.
- [TODO] **[TODO]** Bundle size budget — Set a JS bundle size budget in next.config and CI gate. Current baseline needs to be established first.
- [TODO] **[TODO]** Image optimization — Verify `next/image` used everywhere. AVIF/WebP configured in next.config.ts.

### Caching

- [TODO] **[TODO]** API response caching — No `Cache-Control` headers on public endpoints. Add for `/v1/public/events/:eventId/exhibitors`.
- [TODO] **[TODO]** ISR for marketing pages — `(marketing)` route group should use `revalidate: 3600`.
- [TODO] **[TODO]** Redis for session/analytics — Add Redis for analytics cache and potentially session store.

---

## 5. COMPLIANCE

### Data Privacy

- [TODO] **[TODO]** GDPR — No cookie consent banner. Add before EU users can sign up.
- [TODO] **[TODO]** Data export — Users can request their data (right to portability). Implement `/v1/attendee/profile/export`.
- [TODO] **[TODO]** Data deletion — "Delete account" flow. Supabase Auth handles auth deletion; app data must be manually deleted.
- [TODO] **[TODO]** Privacy policy URL — `events.privacy_policy_url` exists, populate for all events.

### Accessibility

- [TODO] **[TODO]** Skip link — `SkipLink` component exists but check all pages have it
- [TODO] **[TODO]** Keyboard navigation — Focus management on modals, dropdowns. Verify Radix components handle this.
- [TODO] **[TODO]** Color contrast — UI uses brand colors, verify WCAG AA compliance (4.5:1 for text)
- [TODO] **[TODO]** Screen reader testing — Test with VoiceOver/NVDA on key flows

### Legal

- [TODO] **[TODO]** Terms of Service page — Not found in codebase. Add before launch.
- [TODO] **[TODO]** Privacy Policy page — Not found in codebase. Add before launch.
- [TODO] **[TODO]** Cookie consent — Not implemented. Required for GDPR.

---

## 6. MONITORING & OBSERVABILITY

### Logging

- [TODO] **[TODO]** Structured logging — No `console.log` should remain in production paths. Audit and replace with `pino` logger.
- [TODO] **[TODO]** Request ID propagation — Every API request should have a `X-Request-ID` header
- [TODO] **[TODO]** Error tracking — No Sentry or error tracking tool configured. Add before production.

### Metrics

- [TODO] **[TODO]** AI spend tracking — `AiBudgetService` is stub. Track AI costs per org before paid launch.
- [TODO] **[TODO]** API latency histogram — Capture p50/p95/p99 latency for all endpoints
- [TODO] **[TODO]** Business metrics — Lead conversion rate, exhibitor activation rate, DAU/MAU

### Alerting

- [TODO] **[TODO]** Health check alert — Alert when `/readyz` returns non-200
- [TODO] **[TODO]** Error rate alert — Alert when error rate > 1% in 5 minutes
- [TODO] **[TODO]** AI budget alert — Alert when org is at 80% of monthly AI budget
- [TODO] **[TODO]** Disk usage alert — Supabase handles this, verify backup retention

---

## 7. DEPLOYMENT & OPERATIONS

### Infrastructure

- [TODO] **[TODO]** Docker build verified — `apps/api/Dockerfile` and `apps/worker/Dockerfile` build successfully
- [TODO] **[TODO]** Database migrations on deploy — Migrations run before API starts:
```dockerfile
CMD ["sh", "-c", "pnpm db:migrate && node dist/main.js"]
```
- [TODO] **[TODO]** Health check path set — Railway/Render health check set to `/healthz` on port 3001
- [TODO] **[TODO]** Environment parity — `.env.production.example` matches actual production env vars
- [TODO] **[TODO]** Rollback procedure documented — Extend DEPLOY_RUNBOOK.md with rollback steps per service

### CI/CD

- [TODO] **[TODO]** CI passes — `ci.yml` runs lint, typecheck, test. Currently failing due to API build. Fix `moduleResolution` first.
- [TODO] **[TODO]** No test in CI — `pnpm test` runs unit tests but覆盖率 is minimal. Add E2E tests to CI.
- [TODO] **[TODO]** Build cache — Turborepo cache working in CI. Verify `TURBO_TOKEN` and `TURBO_TEAM` set.
- [TODO] **[TODO]** Dependency audit in CI — Add `pnpm audit` to `ci.yml`

### Configuration

- [TODO] **[TODO]** Feature flags — PostHog `flags` package exists but not audited for production-ready values
- [TODO] **[TODO]** Feature flag for AI features — All AI features should be gated behind a PostHog flag
- [TODO] **[TODO]** Demo mode gating — Demo endpoints currently open. Gate behind `DEMO_MODE_ENABLED=false` in production.

---

## 8. CUSTOMER-FACING

### Onboarding

- [TODO] **[TODO]** Exhibitor onboarding checklist — No guided setup for new exhibitors. Add 5-step onboarding wizard.
- [TODO] **[TODO]** Organizer getting started — `/org` dashboard should show first-event setup guide if no events exist
- [TODO] **[TODO]** QR code delivery — Exhibitors need their QR codes before the event. Add download/email QR in `/exhibit/[org]/qr`.

### Documentation

- [TODO] **[TODO]** API documentation — OpenAPI spec is empty `{}`. Generate and publish via Swagger UI at `/api/docs`.
- [TODO] **[TODO]** Help center — `help_articles` table exists but no UI. Build `/help`.
- [TODO] **[TODO]** Changelog — No `/changelog` page. Add before launch.
- [TODO] **[TODO]** Status page — No status page (`status.exai.app`). Consider using Statuspage.io.

### Support

- [TODO] **[TODO]** Support contact — No `/contact` page. Add before launch.
- [TODO] **[TODO]** In-app feedback — No "Report issue" or NPS survey. Add before first paid customer.
- [TODO] **[TODO]** Email support — Transactional emails exist (one template). Verify AWS SES is configured and sending.

---

## 9. PAYMENTS

### Billing (Not implemented — Stripe stub)

- [TODO] **[TODO]** Stripe integration — Not wired. Before first payment, implement:
  - Stripe customer creation on org signup
  - Subscription management (create, upgrade, downgrade, cancel)
  - Webhook handler for `invoice.paid`, `customer.subscription.updated/deleted`
  - Usage-based billing for AI calls (via `ai_usage_events` table)
- [TODO] **[TODO]** Free tier limits — Define limits for free tier. Enforce via PostHog flags + DB checks.
- [TODO] **[TODO]** Plan-gated features — UI should show upgrade prompts for features not in current plan.

---

## 10. RELIABILITY

### Chaos Engineering

- [TODO] **[TODO]** Kill the API pod — Does the service recover? Test in staging.
- [TODO] **[TODO]** Kill the DB connection — Does the API handle connection failures gracefully?
- [TODO] **[TODO]** AI provider downtime — If NVIDIA API is unavailable, does the app degrade gracefully?

### Backups

- [TODO] **[TODO]** Supabase daily backup verified — Check retention and test restore
- [TODO] **[TODO]** Worker state recovery — BullMQ jobs persist to Redis. If worker restarts, jobs resume. Verify this works.

### Chaos

- [TODO] **[TODO]** Demo simulation data isolation — Demo data (techexpo.local) must never touch production data. Verify `DEMO_SIMULATION_AUTO_START=false` in production.

---

## SIGN-OFF GATE

Before marking this checklist complete, verify:

```
[ ] pnpm build passes (API tsconfig fix required)
[ ] pnpm test passes (add more tests)
[ ] pnpm audit --fix shows no critical vulnerabilities
[ ] /healthz returns 200 from production API URL
[ ] /readyz returns 200 from production API URL
[ ] Database migrations run successfully on fresh DB
[ ] No console errors in browser on demo pages
[ ] No PII in Git history (git-secrets scan)
[ ] All secrets are in environment variables, none in code
[ ] ClamAV is scanning files (not waived)
[ ] Rate limiting is configured
[ ] Global error boundary exists
[ ] ProblemDetailsFilter is RFC 9457 compliant
[ ] Analytics queries use cache
[ ] 40 client components reduced (target: <30)
[ ] Polling replaced with Realtime subscriptions
[ ] Demo endpoints gated in production
[ ] Stripe integration wired (if accepting payments)
[ ] GDPR consent banner added
[ ] Terms/Privacy policy pages exist
[ ] API docs published
[ ] Rollback procedure documented and tested
[ ] Staging environment mirrors production config
```
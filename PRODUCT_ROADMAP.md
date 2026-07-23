# ExAi RC3 Product Roadmap

**Status:** Phase -1 proposal — approval required before implementation

This replaces the prior execution roadmap as the product-facing source of truth for RC3. Existing engineering hardening remains prerequisite work where it is required for a phase to be safe.

## Current

1. Phase -1: product information architecture — this document set; no implementation.
2. Phase 0: isolated temporary email/password authentication and redirect to `/organizer`.
3. Phase 1: organization workspace — dashboard, navigation, and organization context.
4. Phase 2: event management — event list and create/edit/archive/duplicate flows, then event dashboard.
5. Phase 3: exhibitor management — event exhibitor list and exhibitor workspace.
6. Phase 4: users placeholder.
7. Phase 5: settings placeholders.
8. Phase 6: organization and event analytics dashboards.

## Next

- Complete data-backed versions of the current workspace collections and their operations.
- Import exhibitors, attendees, and sessions after the corresponding core management flows are stable.
- Replace temporary authentication with the existing production authentication boundary.

## Future

- User invitations, roles, permissions, and audit log.
- Full settings sections: branding, registration, badge design, email, venue, QR, AI, integrations, and security.
- Public registration, email automation, integrations, and AI copilot.

## Post-v1

- Multi-organization switching.
- Billing and subscription management.
- Marketplace and partner ecosystem.

## Delivery rule

Each phase begins with `PHASE_X_IMPLEMENTATION_PLAN.md`, ends with `PHASE_X_COMPLETION_REPORT.md`, and stops for approval. A phase is not complete until its validation, documentation, typecheck, lint, and build are complete.

---

# Historical roadmap below is retained as engineering context only; RC3's active product roadmap is the section above.

**Date:** July 22, 2026
**Horizon:** 0-3 months (MVP), 3-6 months (Growth), 6-12 months (Scale)

---

## PHASE 0: FOUNDATION FIRST (Week 1-2)

Before any feature work, fix the production blockers.

### P0 — Production Blockers

| # | Task | Effort | Owner | Blocks |
|---|------|--------|-------|--------|
| F-01 | Fix API tsconfig `moduleResolution` (Node10→Bundler) | 5 min | Backend | `pnpm build` works |
| F-02 | Remove Vercel OIDC token from `.env.local`, rotate key | 10 min | DevOps | Security incident |
| F-03 | Implement `ValidationPipe` globally (class-validator DTOs) | 2-4h | Backend | Data integrity |
| F-04 | Implement `ProblemDetailsFilter` (RFC 9457) | 2-3h | Backend | API consumers |
| F-05 | Add global error boundary `global-error.tsx` | 1h | Frontend | UX crash handling |
| F-06 | Gate demo endpoints behind auth or env | 2h | Backend | PII exposure |
| F-07 | Fix demo admin unprotected (add middleware gate) | 1h | Frontend | Simulation control |
| F-08 | Add missing `loading.tsx` for portal/console routes | 2h | Frontend | Perceived performance |
| F-09 | Add error logging to `lib/organizer.ts` and `lib/exhibitor.ts` | 15 min | Frontend | Debugging |

**Exit criteria:** `pnpm build` succeeds, no console errors on demo pages, no PII exposure.

---

## PHASE 1: MVP STABILITY (Week 3-6)

Stabilize the demo as a reliable, shareable product.

### P1 — Analytics & Reporting

| # | Task | Impact | Notes |
|---|------|--------|-------|
| A-01 | Add Redis caching to analytics queries | Reduces DB load 90% | Cache `organizerAnalytics()` for 5 min |
| A-02 | Pre-compute dashboard metrics on schedule | Faster dashboard load | Worker job every 5 min |
| A-03 | Add event-level aggregation index on `lead_submissions` | Faster report generation | `event_id + submitted_at` composite |
| A-04 | Replace polling with Supabase Realtime subscriptions | Remove 4 polling components | Live data without HTTP ping |
| A-05 | Add analytics retention policy | DB size control | Archive data older than 90 days |

### P1 — Lead Intelligence

| # | Task | Impact | Notes |
|---|------|--------|-------|
| L-01 | Production-ready lead scoring with fallback | Reliable scores when AI unavailable | Deterministic fallback already exists, needs hardening |
| L-02 | Add lead deduplication by email | Prevent duplicate leads | `attendee_user_id` uniqueness per exhibitor |
| L-03 | Lead export to CSV | Offline access | `/v1/organizer/events/:eventId/leads.csv` |

### P1 — Exhibitor Workspace

| # | Task | Impact | Notes |
|---|------|--------|-------|
| E-01 | Booth QR code generation via API (not just demo) | Exhibitors can regenerate QR | Currently only via seed |
| E-02 | Relationship notes with `@mention` support | Team collaboration | Parse `@username` in notes |
| E-03 | Exhibitor onboarding checklist | Reduce time-to-first-value | 5-step guided setup |

### P1 — Documentation

| # | Task | Impact | Notes |
|---|------|--------|-------|
| D-01 | API documentation (Swagger/OpenAPI) | Developer adoption | Populate the empty `concourse.v1.json` |
| D-02 | Environment variable reference | Dev onboarding | All vars in `.env.production.example` should be documented |
| D-03 | Runbook for production deployment | Operational readiness | Extend DEPLOY_RUNBOOK.md |

---

## PHASE 2: PAYING CUSTOMER READINESS (Month 2)

Make the product suitable for the first paying customer.

### P2 — Authentication & Authorization

| # | Task | Impact | Notes |
|---|------|--------|-------|
| Auth-01 | Invite flow — email-based org invitations | Multi-tenant onboarding | Invitation tokens already exist |
| Auth-02 | Role-based access control (RBAC) in UI | Prevent unauthorized actions | Owner/admin/member/member in DB already |
| Auth-03 | Session management UI (active sessions, revoke) | Security for enterprise | `auth_sessions` table ready |
| Auth-04 | SSO/SAML for enterprise (Okta, Google Workspace) | Enterprise deal blocker | Supabase supports this via OAuth providers |
| Auth-05 | Audit log — who did what when | Compliance | New `audit_events` table needed |

### P2 — Billing

| # | Task | Impact | Notes |
|---|------|--------|-------|
| B-01 | Stripe integration — subscription tiers | Revenue | Currently stub (Tier 1/Starter/Pro/Enterprise) |
| B-02 | Usage-based pricing for AI calls | Predictable costs | AI budget tracking needed first |
| B-03 | Invoice generation | Finance ops | Stripe Invoicing API |
| B-04 | Plan enforcement (feature gates) | Business model | PostHog flags already in place |

### P2 — Notifications

| # | Task | Impact | Notes |
|---|------|--------|-------|
| N-01 | Email delivery (AWS SES) | User communication | Templates defined, dispatch stub |
| N-02 | Push notifications | Re-engagement | Web-push infrastructure ready |
| N-03 | Notification preferences UI | Reduce unsubscribes | Per-category opt-in/out |
| N-04 | Notification digest (daily/weekly) | Reduce email fatigue | Worker job |

### P2 — Knowledge Base

| # | Task | Impact | Notes |
|---|------|--------|-------|
| KB-01 | ClamAV re-enablement | Security | Currently waived for MVP |
| KB-02 | PDF text extraction (current: 3 types only) | Broader KB support | Add DOCX, HTML, Markdown |
| KB-03 | Exhibitor KB content approval workflow | Quality control | Draft/Review/Published states |

### P2 — Data

| # | Task | Impact | Notes |
|---|------|--------|-------|
| DB-01 | Database backup strategy (Supabase already has daily) | Disaster recovery | Verify RPO/RTO |
| DB-02 | Add down migrations | Safe schema changes | All 19 migrations forward-only |
| DB-03 | Connection pool tuning (max=10 → 30) | Production load | With pgbouncer config |
| DB-04 | Read replica query routing | Scale reads | Supabase read replicas |

---

## PHASE 3: AI DIFFERENTIATION (Month 2-3)

Make AI the core differentiator.

### P3 — AI Gateway (Milestone 3)

| # | Task | Impact | Notes |
|---|------|--------|-------|
| AI-01 | Implement `AiBudgetService` (spend limits per org) | Cost control | Currently stub — no spend limits |
| AI-02 | Implement `AiGatewayService` (orchestrator) | Unified AI ops | Currently stub — all calls bypass it |
| AI-03 | Prompt versioning (`PromptRegistry`) | Safe prompt changes | Currently stub |
| AI-04 | AI usage analytics (per-org, per-feature) | Visibility | New `ai_usage_events` table |
| AI-05 | Multi-provider support (Anthropic, VoyageAI, Groq) | Vendor diversity | Currently NVIDIA only |

### P3 — Matchmaking

| # | Task | Impact | Notes |
|---|------|--------|-------|
| M-01 | Implement embedding similarity (currently 0) | Core AI feature | Use existing `nvidia/nv-embedqa-e5-v5` |
| M-02 | Implement category overlap scoring | Interest matching | From attendee profile + exhibitor category |
| M-03 | Implement behavioral signal scoring | Activity-based matching | Booth visits, form submissions, etc. |
| M-04 | Weight tuning (`tune-weights.ts`) | Accuracy improvement | Currently stub |
| M-05 | Matchmaking UI in attendee experience | User value | "Recommended for you" section |

### P3 — Advanced Lead Intelligence

| # | Task | Impact | Notes |
|---|------|--------|-------|
| LI-01 | Voice transcription (lead_voice_transcription.consumer) | Unattended leads | Currently stub |
| LI-02 | Multi-turn conversation analysis | Better intent signal | `ai_conversations` table stub exists |
| LI-03 | Competitor mention detection | Sales intelligence | Guardrail + extraction |
| LI-04 | Lead scoring model A/B testing | Accuracy improvement | Compare ML model vs rule-based |

---

## PHASE 4: GROWTH (Month 3-6)

Scale the product for more users and events.

### G — Scale

| # | Task | Impact | Notes |
|---|------|--------|-------|
| S-01 | Multi-region deployment | Latency | Vercel Edge for web, region-locked Supabase |
| S-02 | API rate limiting per plan | Prevent abuse | `@nestjs/throttler` already available |
| S-03 | Webhook delivery system (stub) | Integrations | Currently stub — needed for CRM integrations |
| S-04 | API key management UI | Self-service developer access | `api_keys` table exists |
| S-05 | Event discovery / search | Network effects | Full-text search on `events`, `event_exhibitors` |

### G — Attendee Experience

| # | Task | Impact | Notes |
|---|------|--------|-------|
| At-01 | Attendee networking / "people you may want to meet" | Engagement | Matchmaking for attendees |
| At-02 | Session agenda with reminders | Attendance | `agenda_sessions` table exists |
| At-03 | In-app messaging | Direct attendee communication | New `messages` table, real-time |
| At-04 | Attendee feedback surveys | Post-event NPS | New `survey_responses` table |

### G — Analytics

| # | Task | Impact | Notes |
|---|------|--------|-------|
| An-01 | BI tool integration (Metabase, Grafana) | Executive reporting | Read replica + query API |
| An-02 | Custom dashboards | Flexibility | Drag-drop dashboard builder |
| An-03 | Benchmarking (compare to industry peers) | Value prop | Anonymized benchmark data |

---

## UNFINISHED FEATURES — PRODUCTION READINESS

These features are referenced in code but not implemented. Each must be either built or formally scoped as "not in MVP."

| Feature | Current State | Recommendation |
|---------|-------------|-----------------|
| AI Budget Service | Stub — no spend controls | **Build before paid customers** |
| AI Gateway | Stub — bypassed by all calls | **Build before multi-provider AI** |
| Matchmaking | All weights = 0 | **Not MVP — defer to Phase 3** |
| Webhooks | Stub — not implemented | **Build when CRM integration needed** |
| Notification dispatch | Stub — emails not sent | **Build before launch** |
| File AV scanning | Stub — ClamAV waived | **Build before file uploads go live** |
| Outbox pattern | Stub — `writeOutboxEvent` throws | **Build before transactional outbox needed** |
| API key management UI | Table exists, no UI | **Not MVP — API access is manual** |
| Agenda/Schedule | `agenda_sessions` table + service, no controller | **Build if event sessions are a priority** |
| Billing/Stripe | Stub — no integration | **Build before first payment** |
| SSO/SAML | Supabase supports it | **Not MVP — build when enterprise deal requires** |
| Audit log | Not implemented | **Build before enterprise — SOC2** |
| Export consumer | Stub | **Not MVP** |
| File AV scan consumer | Stub | **Not MVP** |
| Lead voice transcription | Stub | **Not MVP** |

---

## RELEASE PLAN

### Release 0.1 — Demo Stability (Week 2)
- All P0 blockers fixed
- Demo works reliably with computed AI insights
- No PII exposure

### Release 0.5 — Alpha (Month 1)
- Analytics caching implemented
- Lead scoring production-ready
- Basic email notifications working
- ClamAV re-enabled

### Release 1.0 — Paid Launch (Month 2)
- Stripe integration
- RBAC in UI
- Audit log
- Environment-specific demo gating
- No stub features marketed

### Release 1.x — Growth (Month 3+)
- AI gateway and budget enforcement
- Matchmaking
- Webhooks
- Advanced lead intelligence

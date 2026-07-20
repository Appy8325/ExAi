# Demo Persona Refactor Report

## Objective
Replace the feature-first demo navigation with three read-only persona journeys: **Organizer**, **Exhibitor**, **Attendee**. Fix the AI assistant to produce meaningful answers using published booth content as a fallback when no retrieval context exists.

## Changes

### Backend — AI Assistant Fix

**File:** `apps/api/src/modules/engagement/platform-enrollment.service.ts`

- **Root cause:** The `chat()` method returned a hard "I do not have enough published company information" message when `RetrievalService.search()` returned zero chunks. The error surfaced to the attendee as "The AI assistant could not answer right now."
- **Fix:** When no retrieval chunks are found, the method now fetches the booth's published content (description, website, resource titles) via `findPublicBooth()` and passes that as fallback evidence to the NVIDIA generation call. The generation itself is wrapped in a `.catch()` so any NVIDIA failure returns a graceful message instead of an unhandled error.
- **Behavior:** If published content exists → AI answers using it. If no published content at all → returns the original "not enough information" message. NVIDIA failure → returns "I could not produce an answer right now. Please review the published resources instead."

### Backend — New Public Demo API Endpoints

**File:** `apps/api/src/modules/engagement/public-exhibitors.service.ts`
**File:** `apps/api/src/modules/engagement/public-demo.controller.ts`
| Endpoint | Purpose |
|---|---|
| `GET /v1/public/demo/analytics/:eventId` | Returns `PublicDemoAnalytics` (traffic, conversions, booth heatmap, industries/topics) queried from live demo DB tables — no auth required |
| `GET /v1/public/demo/exhibitor/:eventExhibitorId/dashboard` | Returns `PublicDemoExhibitorDashboard` (performance KPIs, pipeline, recent activity) — no auth required |

These endpoints provide realistic computed data (real counts for relationships, submissions, etc.) to power the read-only demo pages.

### Frontend — Demo Page Restructure

**Old flat structure (deleted):**
```
/demo/                         → feature-first RoleBoard
/demo/event/[slug]             → flat event page
/demo/exhibitor/[id]           → flat booth detail
/demo/demo-sign-in-form.tsx    → Magic Link sign-in
/demo/copy-button.tsx          → utility
```

**New persona-based structure:**
```
/demo/                                                    Landing — three persona cards
/demo/organizer/                                          Organizer dashboard (events, metric cards)
/demo/organizer/analytics/                                Booth heatmap, engagement, industries/topics
/demo/organizer/reports/                                  Executive AI report with metric snapshot
/demo/organizer/event/[slug]/                             Event overview with exhibitor directory
/demo/exhibitor/                                          Exhibitor organization list
/demo/exhibitor/[eventExhibitorId]/                       Exhibitor workspace dashboard (KPIs, pipeline, AI insights)
/demo/exhibitor/[eventExhibitorId]/booth/                 Booth profile, lead form preview, resources
/demo/exhibitor/[eventExhibitorId]/documents/             Knowledge sources list
/demo/exhibitor/[eventExhibitorId]/analytics/             Booth performance analytics & pipeline bars
/demo/exhibitor/[eventExhibitorId]/ai-insights/           AI intelligence, lead scoring, recommendation
/demo/exhibitor/[eventExhibitorId]/qr/                    QR code display
/demo/attendee/                                           Attendee journey landing — links to public routes
```

### Frontend — API Client Additions

**File:** `packages/api-client/src/public-exhibitors.ts`
- Added `PublicDemoAnalytics` type
- Added `PublicDemoExhibitorDashboard` type
- Added `getPublicDemoAnalytics()` client function
- Added `getPublicDemoExhibitorDashboard()` client function

These are automatically exported via the existing barrel file.

### Key Design Decisions

1. **No auth required anywhere under `/demo`** — Middleware already excludes `/demo` from protected route matching.
2. **Attendee journey delegates to existing public routes** (`/e/[slug]`, `/visit/[qrToken]`) with a demo landing page explaining the experience. The existing attendee pages already require no auth.
3. **Read-only throughout** — No form actions, no mutation buttons, no edit capabilities. All pages display server-fetched data.
4. **Sidebar navigation for exhibitor workspace** — A left sidebar with sub-pages (Booth, Documents, Analytics, AI Insights, QR) mimics the real exhibitor portal structure.

### Route Verification

All 16 demo routes appear in the production build output:

| Route | Type | Size |
|---|---|---|
| `/demo` | Dynamic | 204 B |
| `/demo/attendee` | Dynamic | 204 B |
| `/demo/exhibitor` | Dynamic | 204 B |
| `/demo/exhibitor/[eventExhibitorId]` | Dynamic | 204 B |
| `/demo/exhibitor/[eventExhibitorId]/ai-insights` | Dynamic | 200 B |
| `/demo/exhibitor/[eventExhibitorId]/analytics` | Dynamic | 200 B |
| `/demo/exhibitor/[eventExhibitorId]/booth` | Dynamic | 204 B |
| `/demo/exhibitor/[eventExhibitorId]/documents` | Dynamic | 204 B |
| `/demo/exhibitor/[eventExhibitorId]/qr` | Dynamic | 204 B |
| `/demo/organizer` | Dynamic | 200 B |
| `/demo/organizer/analytics` | Dynamic | 200 B |
| `/demo/organizer/event/[slug]` | Dynamic | 200 B |
| `/demo/organizer/reports` | Dynamic | 200 B |

All pages are `export const dynamic = "force-dynamic"` to ensure fresh data on every request.

## Commit

```
feat(demo): reorganize showcase by user personas and fix demo AI
```

# Analytics Audit

## Overview

Audit of every analytics page, KPI, chart, and metric. Classification:

- **LIVE** — Reads from production database, updates as users interact
- **SIMULATED** — Reads from seeded demo data or `DemoAnalyticsStore`, updates in real-time via polling
- **STATIC** — Hardcoded values or placeholder text, does not change
- **BROKEN** — Attempts to load data but fails or returns empty/defaults

---

## 1. Production: Organizer Analytics (`/org/analytics`)

**Data source:** `loadOrganizerAnalytics()` → `GET /v1/organizer/events/:eventId/analytics` → `OrganizerReportingService.analytics()`

All metrics query live production tables: `exhibitor_relationships`, `lead_submissions`, `attendee_profiles`, `lead_intelligence`.

| Metric | Type | Notes |
|--------|------|-------|
| Captured visits (`traffic.capturedVisits`) | **LIVE** | Sum of `interaction_count` from relationships |
| Unique attendees (`traffic.uniqueVisitors`) | **LIVE** | `COUNT(DISTINCT attendee_user_id)` |
| Leads (`conversions.leads`) | **LIVE** | `COUNT(*)` from `lead_submissions` |
| Conversion rate (`conversions.conversionRate`) | **LIVE** | Computed: `leads / capturedVisits * 100` |
| Returning attendees (`traffic.returningVisitors`) | **LIVE** | Visitors with `interaction_count > 1` |
| Repeat engagement rate (`engagement.repeatEngagementRate`) | **LIVE** | `returning / unique * 100` |
| Average interactions (`engagement.averageInteractions`) | **LIVE** | `capturedVisits / uniqueVisitors` |
| AI-analyzed leads (`engagement.analyzedLeads`) | **LIVE** | `COUNT(*)` from `lead_intelligence` where `status='complete'` |
| Booth visits | **LIVE** | Per-booth relationship counts |
| Booth leads | **LIVE** | Per-booth submission counts |
| Booth heat % | **LIVE** | Normalized against max visits booth |
| Popular industries | **LIVE** | `GROUP BY industry` from consented profiles |
| Popular topics | **LIVE** | `jsonb_array_elements(topics_discussed)` from `lead_intelligence` |

**Booth heatmap bar charts:** LIVE — computed from `booth.heat %`, updates as visits arrive.

---

## 2. Production: Organizer Reports (`/org/events/[eventId]/reports`)

**Data source:** `loadOrganizerReport()` + `loadOrganizerAnalytics()`

| Metric | Type | Notes |
|--------|------|-------|
| Captured visits, Unique attendees, Leads, Conversion | **LIVE** | Same as organizer analytics |
| Executive AI Report content | **LIVE** | Generated via `AiGenerationService` with `organizer.executive_report.v1` prompt; cites `[metric.path]` from snapshot |

---

## 3. Production: Exhibitor Dashboard (`/exhibit/:orgId/dashboard/:exhibitorId`)

**Data source:** `ExhibitorDashboardRepository.find()` — complex SQL joining relationships, profiles, submissions, enrichments.

| Metric | Type | Notes |
|--------|------|-------|
| Today's Visitors (`pipeline.new`) | **LIVE** | Relationships with `interaction_count = 1` today |
| QR Scans (`perf.qrScans`) | **LIVE** | `COUNT(*)` where `interaction_source = 'visitor_qr'` |
| Relationships Created (`perf.relationshipsCreated`) | **LIVE** | `COUNT(*)` all relationships |
| Returning Visitors (`perf.returningVisitors`) | **LIVE** | `interaction_count > 1` |
| Profile Completion % (`perf.profileCompletion`) | **LIVE** | Avg of 5 field flags (name, email, company, title, industry) |
| Lead Quality % | **LIVE** | Computed: `active / (new+active+returning+needsFollowUp) * 100` |
| Engagement Score | **LIVE** | Computed: `min(100, (qrScans + relationshipsCreated*2 + returningVisitors*3) / 5)` |
| Pipeline: New / Active / Returning / Follow-up | **LIVE** | Counted from relationship status and note existence |
| Recent Activity feed | **LIVE** | UNION of submissions, notes, profile enrichments |
| AI Insights cards | **LIVE** | From `intelligenceFeed` and `attention` arrays |
| Intelligence Feed items | **LIVE** | `relationship_enrichments` with change type labels |
| Attention alerts | **LIVE** | Relationships flagged for: missing note, incomplete profile, returning without follow-up, duplicate |

---

## 4. Production: Exhibitor AI Insights (`/exhibit/:orgId/ai-insights`)

**Data source:** Same `ExhibitorDashboard` as above.

| Metric | Type | Notes |
|--------|------|-------|
| Profiles Enriched | **LIVE** | Count of `relationship_enrichments` since last visit |
| Complete Profiles | **LIVE** | Count where `change_type = 'profile_completed'` |
| Enrichment Events | **LIVE** | Count of `intelligenceFeed.items` |
| Top Opportunity | **LIVE** | First `attendeeName` from `attention` array |
| Buying Intent Signals (Returning) | **LIVE** | `pipeline.returning` count |
| Recommended Follow-ups | **LIVE** | `pipeline.needsFollowUp` count |
| Profile Readiness | **LIVE** | `performance.profileCompletion` % |

---

## 5. Demo: Organizer Dashboard (`/demo/organizer`)

**Data sources:**
- Overview: `getPublicDemoOverview()` → `PublicExhibitorsService.demoOverview()`
- Analytics: `getPublicDemoAnalytics()` → `PublicExhibitorsService.demoAnalytics()` (live database queries on seeded data)
- Live metrics bar: polls `/v1/public/demo/live` every 5s → `DemoAnalyticsStore`

| Metric | Type | Notes |
|--------|------|-------|
| Live events count | **LIVE** | `overview.events.length` |
| Booths monitored | **LIVE** | Sum of exhibitors across events |
| Captured visits | **SIMULATED** | From `demoAnalytics().traffic.capturedVisits` (DB query on seeded data) |
| Conversion % | **SIMULATED** | Computed from seeded DB data |
| Insight card (dynamic text) | **STATIC** | Uses conditional strings with hardcoded thresholds — see Issues |

**LiveMetricsBar** components:
- Visits, AI chats, active booths, leads — **SIMULATED** (from `DemoAnalyticsStore`, updates every 5s)
- Average dwell, AI engagement rate — **SIMULATED** (computed in `DemoAnalyticsStore`)

---

## 6. Demo: Organizer Analytics (`/demo/organizer/analytics`)

| Metric | Type | Notes |
|--------|------|-------|
| Captured visits, Unique, Leads, Conversion | **SIMULATED** | `getPublicDemoAnalytics()` — seeded DB data |
| Pipeline distribution bars (New/Unique/Leads) | **SIMULATED** | Same source; bar widths computed client-side |
| Returning attendees | **SIMULATED** | From `demoAnalytics()` |
| Repeat engagement rate | **SIMULATED** | From `demoAnalytics()` |
| Average interactions | **SIMULATED** | From `demoAnalytics()` |
| AI-analyzed leads | **SIMULATED** | From `demoAnalytics()` |
| Popular industries | **SIMULATED** | From `demoAnalytics().industries` |
| Popular topics | **SIMULATED** | From `demoAnalytics().topics` |

---

## 7. Demo: Organizer Heatmaps (`/demo/organizer/heatmaps`)

| Metric | Type | Notes |
|--------|------|-------|
| Booth heat score | **SIMULATED** | `booth.heat` from `demoAnalytics()` |
| Visits, Leads, Conversion per booth | **SIMULATED** | From `demoAnalytics().booths` |
| Spatial floor map | **STATIC** | Placeholder with "Coming in Milestone 4" badge |

---

## 8. Demo: Organizer AI Insights (`/demo/organizer/ai-insights`)

| Metric | Type | Notes |
|--------|------|-------|
| AI-analyzed leads card | **SIMULATED** | `analytics?.engagement.analyzedLeads` |
| Returning attendees card | **SIMULATED** | `analytics?.traffic.returningVisitors` |
| Avg interactions/visitor card | **SIMULATED** | `analytics?.engagement.averageInteractions` |
| Repeats % card | **SIMULATED** | `analytics?.engagement.repeatEngagementRate` |
| Executive summary | **STATIC** | Placeholder: "AI Insights — In Active Development" |
| "What to focus on" recommendations | **STATIC** | Hardcoded strings with conditional values inserted — see Issues |

---

## 9. Demo: Organizer Reports (`/demo/organizer/reports`)

| Metric | Type | Notes |
|--------|------|-------|
| Captured visits, Unique, Leads, Conversion | **SIMULATED** | From `getPublicDemoAnalytics()` |
| Executive AI Report | **STATIC** | Placeholder: "AI Report Generation — In Active Development" |

---

## 10. Demo: Exhibitor Dashboard (`/demo/exhibitor/:id`)

**Data sources:**
- `getPublicDemoExhibitorDashboard()` → `PublicExhibitorsService.demoExhibitorDashboard()` (seeded DB)
- `LiveMetricsBar` polls every 5s

| Metric | Type | Notes |
|--------|------|-------|
| New visitors | **SIMULATED** | `pipeline.new` from dashboard |
| QR scans | **SIMULATED** | `perf.qrScans` |
| Relationships | **SIMULATED** | `perf.relationshipsCreated` |
| Returning | **SIMULATED** | `perf.returningVisitors` |
| Profile completion % | **SIMULATED** | `perf.profileCompletion` |
| Lead quality % | **SIMULATED** | Client-computed: `active / totalPipeline * 100` |
| Engagement score | **SIMULATED** | Client-computed formula using `profileCompletion`, `formCompletionRate`, `relationshipsCreated`, `returningVisitors` |
| Source count | **SIMULATED** | `dashboard.boothInfo.sourceCount` from KB sources query |
| Pipeline: New/Active/Returning/Follow-up | **SIMULATED** | From `pipeline` object |
| Needs Attention list | **SIMULATED** | From `attention` array |
| AI intelligence feed items | **SIMULATED** | From `intelligenceFeed.items` |

---

## 11. Demo: Exhibitor Analytics (`/demo/exhibitor/:id/analytics`)

| Metric | Type | Notes |
|--------|------|-------|
| QR scans, Relationships, Returning | **SIMULATED** | From `getPublicDemoExhibitorDashboard()` |
| Form completion % | **SIMULATED** | `perf.formCompletionRate` |
| Pipeline distribution bars | **SIMULATED** | Client-side computed widths from pipeline |
| Profile completion rate | **SIMULATED** | `perf.profileCompletion` |
| Lead form completion % | **SIMULATED** | `perf.formCompletionRate` |
| Returning visitor rate | **SIMULATED** | Client-computed: `returningVisitors / relationshipsCreated * 100` |
| Total interactions | **SIMULATED** | Client-computed: `qrScans + relationshipsCreated` |

---

## 12. Demo: Exhibitor AI Insights (`/demo/exhibitor/:id/ai-insights`)

| Metric | Type | Notes |
|--------|------|-------|
| Profiles enriched | **SIMULATED** | `intelligenceFeed.profilesEnriched` |
| Complete profiles | **SIMULATED** | `intelligenceFeed.completeProfiles` |
| Active leads | **SIMULATED** | `pipeline.active` |
| Follow-up | **SIMULATED** | `pipeline.needsFollowUp` |
| Since you last visited (4 stats) | **SIMULATED** | `sinceLastVisited` object with hardcoded "24h" — see Issues |
| "Attendee intelligence" text block | **STATIC** | Generic placeholder text, no dynamic values |
| "Lead scoring" grid | **SIMULATED** | Values from `pipeline.active/returning/needsFollowUp` |

---

## Issues Requiring Fixes

### I1 — Demo AI Insights: Executive Summary is Static Placeholder

**File:** `apps/web/src/app/demo/organizer/ai-insights/page.tsx`

The "Executive summary" card (lines 91–105) shows a static "AI Insights — In Active Development" message. It should render real NVIDIA AI-generated content using the analytics snapshot, the same way the production `/org/events/:eventId/reports` page does (calling `generateOrganizerReport()`).

**Action:** Connect to AI report generation endpoint, or fall back to showing a computed text summary from the available metrics.

---

### I2 — Demo AI Insights: "What to Focus On" Recommendations are Static Strings with Hardcoded Thresholds

**File:** `apps/web/src/app/demo/organizer/ai-insights/page.tsx` (lines 117–139)

The three recommendations use hardcoded conditional logic:
```tsx
body={topTopic ? `"${topTopic}" is the most discussed...` : "Once attendees ask questions..."}
```
```tsx
body={topIndustry ? `${topIndustry} attendees...` : "Industry data populates..."}
```
```tsx
body={`${analytics?.engagement.analyzedLeads ?? 0} leads were AI-scored...`}
```

These are not "broken" but they are STATIC in behavior — the structure is fixed copy with values substituted. As the simulation runs, `topTopic` and `topIndustry` DO update from live data (they come from `analytics.topics[0]` and `analytics.industries[0]`), so the content does change when data exists. However, the copy is generic/boilerplate.

**Action:** Replace with richer, more specific AI-generated recommendations. Consider connecting to the `generateOrganizerReport()` flow for proper AI insight generation.

---

### I3 — Demo Organizer Dashboard: Insight Card with Hardcoded Threshold

**File:** `apps/web/src/app/demo/organizer/page.tsx` (lines 74–86)

```tsx
{analytics.traffic.capturedVisits > 0 && (
  <Card>
    <p><strong>Insight:</strong> {analytics.traffic.capturedVisits} total visits... 
    {analytics.traffic.returningVisitors > 0 ? `${analytics.traffic.returningVisitors} returning...` : "Attendees are beginning..."}</p>
  </Card>
)}
```

This uses hardcoded thresholds (`> 0`) to switch between two static strings. While the values update live from analytics, the conditional logic is simplistic and the copy is generic.

**Action:** Replace with AI-generated insight or more nuanced computed recommendation.

---

### I4 — Demo Exhibitor AI Insights: "Since Last Visited" Uses Hardcoded "24h" String

**File:** `apps/api/src/modules/engagement/public-exhibitors.service.ts` (line 480)

```ts
sinceLastVisited: {
  since: "24h",  // ← hardcoded string
  ...
}
```

The production `ExhibitorDashboardRepository` correctly computes `since` as `last_visited_at` from `exhibitor_dashboard_visits`. The demo version hardcodes "24h".

**Action:** Either remove the demo endpoint's `sinceLastVisited.since` (it's not critical), or compute a real elapsed-time string from a stored timestamp.

---

### I5 — Demo Reports: Executive AI Report is Static Placeholder

**File:** `apps/web/src/app/demo/organizer/reports/page.tsx` (lines 85–99)

Shows "AI Report Generation — In Active Development" with no connection to the report generation flow.

**Action:** Either connect to the report generation API, or remove the section and rely on the analytics metrics shown above it.

---

### I6 — Spatial Floor Map is Unimplemented

**File:** `apps/web/src/app/demo/organizer/heatmaps/page.tsx` (lines 125–150)

A placeholder SVG with "Coming in Milestone 4" badge. Not currently broken — it's labeled as coming feature — but no metric depends on it.

---

## Summary Table

| Page | Status | Primary Issue |
|------|--------|---------------|
| `/org/analytics` | **LIVE** — all metrics | None |
| `/org/events/:id/reports` | **LIVE** — metrics + AI report | None |
| `/exhibit/:orgId/dashboard/:id` | **LIVE** — all metrics | None |
| `/exhibit/:orgId/ai-insights` | **LIVE** — all metrics | None |
| `/demo/organizer` | **SIMULATED** | I3: Insight card static threshold |
| `/demo/organizer/analytics` | **SIMULATED** | None |
| `/demo/organizer/heatmaps` | **SIMULATED** (spatial map is STATIC placeholder) | I6 |
| `/demo/organizer/ai-insights` | **SIMULATED** (exec summary + recommendations are STATIC) | I1, I2 |
| `/demo/organizer/reports` | **SIMULATED** (AI report is STATIC placeholder) | I5 |
| `/demo/exhibitor/:id` | **SIMULATED** | None |
| `/demo/exhibitor/:id/analytics` | **SIMULATED** | None |
| `/demo/exhibitor/:id/ai-insights` | **SIMULATED** (sinceLastVisited.since is hardcoded) | I4 |

---

## Recommendations

1. **Connect demo AI Insights executive summary** to AI generation (issues I1, I5)
2. **Replace static recommendation strings** with computed or AI-generated alternatives (issues I2, I3)
3. **Fix `sinceLastVisited.since`** hardcoded string in demo exhibitor service (issue I4)
4. **All other demo metrics are already properly connected** to either seeded database queries or `DemoAnalyticsStore` polling — they will visibly change as the simulation progresses

The demo analytics pipeline is well-structured: data flows from `PublicExhibitorsService.demoAnalytics()` and `demoExhibitorDashboard()` which query real seeded data, plus `DemoAnalyticsStore` for in-memory real-time tracking. Pages that show the `LiveMetricsBar` component poll `/v1/public/demo/live` every 5 seconds and will update in real-time as events are tracked.
# Analytics — Architecture Review

**Date:** 2026-07-22
**Author:** EPIC 3 Implementation
**Status:** Draft — awaiting UX Review

---

## 1. What "Analytics" Is Supposed to Be

The user's specification is unambiguous:

> Analytics is not another dashboard. Its purpose is to answer:
> - What happened?
> - Why did it happen?
> - Where should the user investigate?

The four analytical capabilities needed are:
- **Trends** — time-based patterns across events
- **Funnels** — where drop-off occurs in the attendee journey
- **Comparisons** — performance across events, booths, segments
- **Segmentation / Drill-down** — break down metrics by industry, topic, booth

This is fundamentally different from a dashboard, which answers "is my thing healthy right now?"

---

## 2. Current Implementation: A Dashboard Masquerading as Analytics

The existing `/org/analytics` page is a **reporting dashboard**, not an analytical workspace. It reproduces the same 4 KPIs from the Event Dashboard rather than extending into analytical territory.

### KPI Duplication (Critical)

| KPI | `/org/events/[eventId]` | `/org/analytics` |
|-----|-----------------------|-----------------|
| Captured Visits | ✅ | ✅ (same metric) |
| Unique Attendees | ✅ | ✅ (same metric) |
| Leads | ✅ | ✅ (same metric) |
| Conversion | ✅ | ✅ (same metric) |

The only substantive difference is `/org/analytics` adds a **Booth Heatmap** and **Demographics Breakdown** — both reporting, not analysis.

### What Analytics Currently Has (but shouldn't need to duplicate)

| Feature | Problem |
|---------|---------|
| Event selector | Correct — but only switches between single-event snapshots |
| 4 KPIs (captured visits / unique / leads / conversion) | **DUPLICATED** — should link to Event Dashboard instead |
| Booth heatmap | Fine as reporting — but not analytical |
| Demographics (industries/topics) | Fine as segmentation — but only for one event |
| Engagement stats | **DUPLICATED** — also shown in Event Dashboard |

### What Analytics Is Missing Entirely

| Missing Capability | Description |
|-------------------|-------------|
| **Trends** | Time-series data — how did this event's traffic compare to last event? |
| **Funnel view** | Demo version has "Pipeline distribution" (new → unique → leads) — production doesn't |
| **Multi-event comparison** | Compare performance across all events in a time range |
| **Period selector** | No ability to filter by date range |
| **Segmentation drill-down** | Break down by industry or topic within a funnel |
| **Drop-off analysis** | Where in the funnel are attendees leaving? |

### Demo vs Production Gap

The demo at `/demo/organizer/analytics` has a **Pipeline Distribution** section (funnel: new → unique → leads) that the production page replaces with a Booth Heatmap. The demo's funnel approach is closer to what Analytics should be.

---

## 3. Data Layer Assessment

### Current Data: Event Snapshot Only

The existing `OrganizerAnalytics` type is a single-event snapshot at query time:

```typescript
{
  event: { id, name, status, timezone };  // single event
  generatedAt: string;                       // point-in-time
  traffic: { capturedVisits, uniqueVisitors, returningVisitors };
  conversions: { leads, conversionRate };
  engagement: { repeatEngagementRate, averageInteractions, analyzedLeads };
  booths: [{ id, name, visits, leads, heat }];  // single event
  industries: [{ name, count }];                  // single event
  topics: [{ name, count }];                      // single event
}
```

**This data shape cannot support:**
- Trends (no historical series)
- Multi-event comparison (one event per query)
- Funnel analysis across events (no time-range aggregation)
- Period-over-period analysis (no period dimension)

### Required Data Layer Changes

#### Option A: Expand existing endpoint (minimal change)
- Add `?from=&to=` date range params to `getOrganizerAnalytics`
- Return aggregated data across events in the range
- Problem: doesn't support time-series or drill-down

#### Option B: New dedicated Analytics endpoints (recommended)
- `GET /v1/analytics/trends?from=&to=&eventId=` — time-series metrics
- `GET /v1/analytics/funnel?eventId=` — stage-by-stage conversion
- `GET /v1/analytics/comparison?from=&to=` — multi-event comparison
- `GET /v1/analytics/segments?eventId=&dimension=industry|topic` — segmentation

#### Option C: Event time-series stored as analytics snapshots
- Store `OrganizerAnalytics` snapshots daily in `analytics_snapshots` table
- Query historical snapshots for trends and comparisons
- Problem: requires data pipeline, not quick to implement

---

## 4. Technical Assessment

### API Client

Current: `getOrganizerAnalytics(client, eventId)` — single event snapshot.

New needed:
- `getAnalyticsTrends(client, { from, to, eventId? })` — time-series
- `getAnalyticsFunnel(client, eventId)` — funnel stages
- `getAnalyticsComparison(client, { from, to })` — multi-event

### Required API Module

The analytics capabilities require a new `AnalyticsModule` in `apps/api/src/modules/analytics/`. This would be a new module distinct from `OrganizerReportingService`.

### UI Components Needed

Current `KPICard` + `Card` approach is appropriate for reporting dashboards. Analytics needs:
- **SparklineChart** — inline trend lines (no chart library dependency if possible)
- **FunnelChart** — new component: stages with drop-off visualization
- **ComparisonTable** — new component: event-over-event metrics
- **PeriodSelector** — date range filter

Without a charting library, these can be implemented as styled divs (progress-bar style charts are sufficient for the data volume).

---

## 5. Key Findings

### Finding 1: The current Analytics page is not Analytics

It is a single-event reporting view with KPI duplication. This is a fundamental misalignment with the user's specification.

### Finding 2: KPI duplication is a waste of the Analytics route

The Organizer and Event Dashboards already show the 4 KPIs. Analytics should not repeat them — it should contextualize them through trends and comparisons.

### Finding 3: The funnel is missing in production

The demo has it; production replaced it with a heatmap. The funnel (pipeline distribution: new → unique → leads) is the most analytical thing in the demo and should be in production.

### Finding 4: Time dimension is entirely absent

No date range filtering, no trends, no historical comparison. This is the single largest gap.

### Finding 5: The backend can support a funnel with minimal changes

The existing `OrganizerAnalytics` data has all the inputs for a funnel (capturedVisits, uniqueVisitors, leads). The funnel just isn't rendered. Backend changes needed: none for basic funnel. Time-series requires Option B or C above.

---

## 6. Recommended Architecture

### Page Name

`/org/analytics` remains in place but is **redesigned** — not a new route.

### New Page Hierarchy (conceptual)

```
/org/analytics
├── Period Selector (this week / this month / last 30 days / custom)
├── Event Filter (all events vs. specific event)
│
├── [ONLY when single event selected]
│   ├── Funnel Chart (new → unique → leads with drop-off %)
│   └── Booth Comparison (per-booth performance)
│
├── [ONLY when multiple events / all selected]
│   ├── Event Comparison Table (events side-by-side)
│   └── Trend Sparklines (per-metric across events)
│
├── Trends Section (time-series line indicators)
│   └── Traffic trend · Lead trend · Conversion trend
│
├── Segment Breakdown (industry / topic — collapsible)
│   └── Filter funnel by segment (drill-down)
│
└── Insight Callouts (AI-generated — "Why did X happen?")
    └── Only when AI can explain with data
```

### Phase 1: Basic Funnel + De-duplication (achievable today)
- Remove duplicate KPIs from `/org/analytics`
- Add Pipeline Distribution funnel (use demo's `Bar` pattern)
- Show trends via sparklines (requires backend support or Option C)

### Phase 2: Multi-event comparison (requires Option B)
- New `AnalyticsModule` with trends and comparison endpoints
- Period selector
- Event comparison table

### Phase 3: AI insights (future)
- "Why did conversion drop 15% this week?"
- Requires `AiGenerationService` integration with analytics data

---

## 7. Open Questions

1. **Does the user want `/org/analytics` redesigned in-place, or a separate `/org/insights` route?**
2. **Is there an appetite for a charting library dependency, or should charts be implemented as styled divs?**
3. **Is the funnel more important than multi-event trends for Phase 1?**

---

## 8. Files Reviewed

| File | Purpose |
|------|---------|
| `apps/web/src/app/(console)/org/analytics/page.tsx` | Production analytics — KPI duplication, no funnel |
| `apps/web/src/app/demo/organizer/analytics/page.tsx` | Demo analytics — has funnel (Pipeline Distribution) |
| `apps/web/src/lib/organizer.ts` | API client for analytics |
| `packages/api-client/src/public-exhibitors.ts` | `OrganizerAnalytics` type definition |
| `apps/api/src/modules/engagement/organizer-reporting.service.ts` | Analytics query — single event snapshot only |
# Analytics — Implementation Plan

**Date:** 2026-07-22
**Scope:** Phase 1 — Analytics redesign without backend changes
**Target:** 6.5/10 → 7.5/10

---

## What We're Building

A genuinely analytical page that answers "what happened?" and "where is drop-off?" — not a dashboard.

**Key principle:** Analytics should tell you something you don't already know from the Event Dashboard. If it's the same numbers, it's in the wrong place.

---

## Changes to `/org/analytics/page.tsx`

### 1. Remove: 4 Duplicate KPI Cards

**Current:**
```tsx
<section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
  <KPICard label="Captured visits" value={...} />
  <KPICard label="Unique attendees" value={...} />
  <KPICard label="Leads" value={...} />
  <KPICard label="Conversion" value={...} />
</section>
```

**Remove entirely.** These numbers appear in the Event Dashboard. Analytics should not repeat them.

**Replace with:** Nothing at the top. The first thing visible should be the Pipeline Distribution funnel — the most analytical thing on the page.

**Exception:** If there are **prior-event comparison metrics** available (e.g., "↓ 12% vs last event"), those can replace the KPIs. But that requires backend data not currently available. **Do not fabricate comparison numbers.**

---

### 2. Add: Pipeline Distribution Funnel (from demo)

This component exists in the demo (`/demo/organizer/analytics`) but was removed from production. Restore it.

**Implementation:** Use the demo's `Bar` component pattern. It renders three stages:
- **New** = `analytics.traffic.capturedVisits` (total interactions)
- **Unique** = `analytics.traffic.uniqueVisitors` (distinct attendees)
- **Leads** = `analytics.conversions.leads` (converted)

Each bar shows:
- Label (stage name)
- Count (the raw number)
- Percentage of max (visual bar width)
- Drop-off from previous stage (calculated: `(current / previous) * 100`)

**Example output:**
```
New       ████████████████████████████  847   (100%)
Unique    ████████████████████████     624   (74% of New)
Leads     ██████████                   147   (17% of New)
```

Drop-off indicators are the primary analytical output — they answer "where is drop-off happening?"

**Layout:** Single `Card` in the left column of the 2-column grid (replacing the left column's current content).

---

### 3. Restructure: Two-Column Grid

**Current 2-column grid:**
```
┌────────────────────┬──────────────┐
│ Booth Heatmap      │ Engagement   │
│ (2fr)              │ (1fr)        │
└────────────────────┴──────────────┘
```

**New 2-column grid:**
```
┌────────────────────┬──────────────┐
│ Pipeline Distribution│ Engagement │
│ (2fr)               │ (1fr)       │
└────────────────────┴──────────────┘
```

The Booth Heatmap moves below (still unique to Analytics). Engagement stats stay (but verify they don't duplicate Event Dashboard).

---

### 4. Move: Demographics Out of Collapsible

**Current:** Demographics (industries, topics) are inside a `<details>` collapsible at the bottom.

**New:** Demographics become a visible, primary section above the fold (or near top), not hidden. They are the most genuinely analytical content (segmentation) and should be visible.

**Layout:**
```
┌─────────────────────────────────────────┐
│ Popular Industries  │  Popular Topics   │
│ ▸ Technology  234   │  ▸ AI Ethics 89   │
│ ▸ Healthcare  189   │  ▸ Pricing  67    │
└─────────────────────────────────────────┘
```

---

### 5. Add: Event Context Line

Below the PageHeader, add a single line of context:

```tsx
<p className="text-body-sm text-muted">
  Showing funnel data for {event.name} · {startDate} to {endDate}
</p>
```

This answers "what time period / event is this data for?" without needing a date-range picker (which requires backend support).

---

### 6. Keep: Booth Heatmap

The heatmap is legitimately unique to Analytics. Keep it below the funnel/engagement grid, but note it still references the same data as Event Dashboard's exhibitor list. It's acceptable here because it's a visualization (heatmap) not just raw numbers.

---

### 7. Keep: Executive Report Link

The "Executive report" link pointing to `/org/events/${eventId}/reports` is appropriate. It's a different view (AI-generated narrative) of the same data — useful analytical output.

---

### 8. Keep: Event Selector Tabs

The event selector tabs at the top are appropriate. Analytics should support multi-event views.

---

## Component Inventory

| Component | Action | Notes |
|-----------|--------|-------|
| `PageHeader` | Keep | "Live analytics" title |
| 4× `KPICard` | Remove | Duplicate of Event Dashboard |
| Event selector tabs | Keep | Appropriate for context switching |
| `Card` (Pipeline Distribution) | Add | From demo, adapted |
| `Card` (Engagement) | Keep | Verify stats not duplicated elsewhere |
| Demographics section | Move out of collapsible | Primary analytical content |
| Booth Heatmap | Keep | Unique visualization |
| Executive report link | Keep | AI-generated analytical output |

---

## New Subcomponents to Add

### `FunnelBar` — stage in the pipeline distribution

```tsx
function FunnelBar({
  label: string;
  value: number;
  previousValue: number | null;  // null for first stage
  maxValue: number;
}) {
  // Renders label, value, bar, and drop-off %
}
```

### `SegmentGrid` — replaces the demographics collapsible

```tsx
function SegmentGrid({
  industries: Array<{ name: string; count: number }>;
  topics: Array<{ name: string; count: number }>;
}) {
  // Renders two-column grid of breakdown items
  // No collapsible — always visible
}
```

---

## Files to Modify

| File | Change |
|------|--------|
| `apps/web/src/app/(console)/org/analytics/page.tsx` | Full redesign: remove KPIs, add funnel, restructure, move demographics |

**No new files required for Phase 1.**

---

## Phase 1 Scope Boundaries

**Included:**
- Remove duplicate KPIs
- Restore Pipeline Distribution funnel
- Event context line
- Move demographics out of collapsible
- Keep booth heatmap, engagement, executive report link
- Event selector tabs

**Excluded (Phase 2):**
- Multi-event comparison table
- Period selector (date range filtering)
- Trend sparklines
- Drill-down into demographics (click industry → see booths)
- AI-generated "Why did X happen?" insights

**Excluded permanently from this page:**
- Any KPI that appears in Event Dashboard
- Any metric that requires fabricating trends from single-event data

---

## Backend Dependencies

**None for Phase 1.** All required data (`capturedVisits`, `uniqueVisitors`, `leads`, `industries`, `topics`, `booths`) is already in `loadOrganizerAnalytics(eventId)`.

---

## Quality Gate

After implementation, verify:
- [ ] Zero KPIs on this page appear in `/org/events/[eventId]` (Event Dashboard)
- [ ] Pipeline Distribution shows all three stages with drop-off %
- [ ] Demographics section is visible without clicking
- [ ] Event context line explains which event/time period
- [ ] Page can answer: "Where is drop-off happening?" (funnel)
- [ ] Page can answer: "What industries are my attendees from?" (demographics)
- [ ] Page cannot answer (not in scope): "How does this compare to last month?" (needs backend)
- [ ] No fabricated trend indicators
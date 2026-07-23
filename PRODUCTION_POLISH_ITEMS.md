# Production Polish Items

**Date:** 2026-07-22
**Source:** CROSS_PRODUCT_CONSISTENCY_REVIEW.md, ACCESSIBILITY_AUDIT.md, STATE_COVERAGE_AUDIT.md

---

## How to Use This Document

Each item has been extracted from the three audit documents and consolidated into a single, prioritized implementation list. Items are grouped by effort and ordered by priority within each group.

---

## Priority 1 — Must Fix Before Launch

### Accessibility (from ACCESSIBILITY_AUDIT.md)

**A1 — Analytics: Funnel Stage Progress Bars (Critical WCAG AA)**
- **File:** `apps/web/src/app/(console)/org/analytics/page.tsx` line ~207
- **Change:** Add `role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`${label}: ${value}`}` to each funnel bar div
- **Effort:** <30 min

**A2 — Analytics: Booth Heatmap Bars (Critical WCAG AA)**
- **File:** `apps/web/src/app/(console)/org/analytics/page.tsx` line ~112
- **Change:** Same as A1 for booth engagement bars
- **Effort:** <30 min

**A3 — Exhibitor: Relationship Pipeline Stat Cards (Semantic HTML)**
- **File:** `apps/web/src/app/(portal)/exhibit/[organizationId]/dashboard/[eventExhibitorId]/dashboard-screen.tsx` line ~98
- **Change:** Wrap in `<ul role="list">`, each card in `<li>`
- **Effort:** <30 min

**A4 — Admin: Service Status Rows (Semantic HTML)**
- **File:** `apps/web/src/app/(admin)/admin/page.tsx` line ~199
- **Change:** Wrap in `<ul role="list">`, each service row in `<li>`
- **Effort:** <30 min

**A5 — Admin: Recent Operational Events (Semantic HTML)**
- **File:** `apps/web/src/app/(admin)/admin/page.tsx` line ~272
- **Change:** Wrap in `<ul role="list">`, each event in `<li>`
- **Effort:** <30 min

**A6 — Organizer: Action Circle Links (Missing aria-label)**
- **File:** `apps/web/src/app/(console)/org/page.tsx` line ~254
- **Change:** Add `aria-label={`Action ${i+1}: ${action.label}`}` to numbered action `<Link>` elements
- **Effort:** <30 min

**A7 — Reports: Download PDF (Button Semantics)**
- **File:** `apps/web/src/app/(console)/org/events/[eventId]/reports/page.tsx` line ~72
- **Change:** Convert raw `<a>` to `<Button variant="secondary" asChild><Link href={...}></Link></Button>`
- **Effort:** <30 min

**A8 — Event: Secondary Action Links (Button Semantics)**
- **File:** `apps/web/src/app/(console)/org/events/[eventId]/page.tsx` lines ~321-340
- **Change:** "Event settings", "View report", "Public event" → `<Button variant="secondary" asChild><Link>...</Link></Button>`
- **Effort:** <30 min

### State Coverage (from STATE_COVERAGE_AUDIT.md)

**S1 — All Pages: Add Skeleton Components**
- **Files:** All 6 reference implementations (see below)
- **Change:** Replace spinner-only loading with skeleton matching each page's layout
  - Exhibitor: skeleton for stat cards + relationship list + attention items
  - Organizer: skeleton for action items + events list + attention items
  - Event: skeleton for event header + stats + activity
  - Admin: skeleton for health bar + service status grid + recent events
  - Analytics: skeleton for funnel + heatmap + demographics charts
  - Reports: skeleton for report preview cards
- **Effort:** 2-3h total (shared skeleton patterns across pages)

**S2 — Event + Analytics: Add 404 NotFound Guard**
- **Files:**
  - `apps/web/src/app/(console)/org/events/[eventId]/page.tsx` (Event Dashboard)
  - `apps/web/src/app/(console)/org/analytics/page.tsx`
- **Change:** Add `if (!event) return <NotFound />` after event data fetch
- **Effort:** <30 min

**S3 — Organizer: Health Status Data-Driven**
- **File:** `apps/web/src/app/(console)/org/page.tsx` line ~293
- **Change:** Derive from `allHealthy` boolean instead of hardcoded "Success" string
- **Effort:** <30 min

---

## Priority 2 — Polish Phase

### Accessibility (B1-B7 from ACCESSIBILITY_AUDIT.md)

**B1 — Organizer: Health Dot aria-label**
- **File:** `apps/web/src/app/(console)/org/page.tsx` line ~354
- **Change:** `role="img" aria-label="Health: ${healthLabel[health]}"` on health dot div
- **Effort:** <15 min

**B2 — Exhibitor: Attention Count aria-label**
- **File:** dashboard-screen.tsx line ~120
- **Change:** `aria-label={`${dashboard.attention.length} relationship${...} require attention`}`
- **Effort:** <15 min

**B3 — Exhibitor: Details/Summary Expanded State**
- **File:** dashboard-screen.tsx line ~173
- **Change:** JS toggle for `aria-expanded` on `<summary>`, `aria-controls` + matching id on content div
- **Effort:** 1h (requires state management)

**B4 — Organizer: Success Icon aria-label**
- **File:** `apps/web/src/app/(console)/org/page.tsx` line ~293
- **Change:** `aria-label="All clear"` on the success SVG or sr-only text
- **Effort:** <15 min

**B5 — Event: Event Activity Stats (Definition List)**
- **File:** `apps/web/src/app/(console)/org/events/[eventId]/page.tsx` line ~292
- **Change:** Wrap stats in `<dl>`, labels in `<dt>`, values in `<dd>`
- **Effort:** <30 min

**B6 — Exhibitor: Open Link aria-label**
- **File:** dashboard-screen.tsx line ~133
- **Change:** `aria-label={`Open relationship with ${item.attendeeName ?? 'attendee'}`}`
- **Effort:** <15 min

**B7 — Analytics: Booth List Semantic HTML**
- **File:** `apps/web/src/app/(console)/org/analytics/page.tsx` line ~99
- **Change:** `<ul role="list">` + `<li>` for booth engagement entries
- **Effort:** <15 min

### State Coverage (from STATE_COVERAGE_AUDIT.md)

**S4 — Distinguish Offline vs API Error**
- **Files:** All pages with error states
- **Change:** `error.message.includes('fetch') || error.message.includes('network')` → "You appear to be offline" message
- **Effort:** 1h total

**S5 — Exhibitor: Attention Empty Message**
- **File:** dashboard-screen.tsx line ~120
- **Change:** `{dashboard.attention.length === 0 && <p>No items require attention</p>}`
- **Effort:** <15 min

**S6 — Admin: Service Status Severity Colors**
- **File:** `apps/web/src/app/(admin)/admin/page.tsx` line ~241
- **Change:** `status === 'down' ? 'text-red-500' : status === 'degraded' ? 'text-yellow-500' : 'text-green-500'`
- **Effort:** <15 min

**S7 — Add Action Completion Toasts**
- **Files:** Event (publish), Reports (generate), Exhibitor (publish)
- **Change:** Add `import { toast } from 'sonner'` + `toast.success('Event published successfully')` after action completes
- **Effort:** 2h total

---

## Priority 3 — Post-Launch

### Accessibility (C1-C3 from ACCESSIBILITY_AUDIT.md)

**C1 — Reports: header role="banner"**
- **File:** reports/page.tsx line ~38
- **Change:** `<header role="banner">` to clarify page-level header
- **Effort:** <15 min

**C2 — Design: Color Contrast Audit**
- Verify actual hex values in `packages/ui/src/styles/theme.css` against WCAG contrast requirements
- **Effort:** Design team task

**C3 — Testing: Screen Reader Testing**
- VoiceOver (macOS/iOS), NVDA (Windows), JAWS (Windows)
- **Effort:** QA task

### State Coverage (from STATE_COVERAGE_AUDIT.md)

**S8 — Analytics: Stale Data Warning**
- **File:** analytics/page.tsx
- **Change:** Add `lastUpdated` timestamp + "Data may be outdated" warning if >24h old
- **Effort:** 1h

**S9 — Organizer: Permission Denied State**
- **File:** org/page.tsx
- **Change:** `if (org && !hasAccess) return <PermissionDenied />`
- **Effort:** 1h

**S10 — Reports: Fix 404 Workaround**
- **File:** reports/page.tsx line ~91
- **Change:** Real API 404 response instead of `event.status === 404` data-model workaround
- **Effort:** API change

---

## Implementation Notes

### Skeleton Component Usage
```tsx
import { Skeleton } from '@ui/components/skeleton';

return (
  <div className="space-y-section">
    <Skeleton className="h-32 w-full" />
    <Skeleton className="h-64 w-full" />
    <div className="grid grid-cols-3 gap-4">
      <Skeleton className="h-24" />
      <Skeleton className="h-24" />
      <Skeleton className="h-24" />
    </div>
  </div>
);
```

### Button asChild Pattern
```tsx
import { Button } from '@ui/components/button';
import Link from 'next/link';

<Button variant="secondary" asChild>
  <Link href="/path">Label</Link>
</Button>
```

### Progress Bar Pattern
```tsx
<div
  role="progressbar"
  aria-valuenow={pct}
  aria-valuemin={0}
  aria-valuemax={100}
  aria-label={`${label}: ${value}`}
  className="h-3 overflow-hidden rounded-full bg-brand"
  style={{ width: `${pct}%` }}
/>
```
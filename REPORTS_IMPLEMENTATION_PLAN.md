# Reports — Implementation Plan

**Date:** 2026-07-22
**Scope:** Phase 1 — Demo fix + production polish
**Target:** ~7.5/10 → ~8.0/10

---

## What We're Building

Reports is an AI-generated narrative page — not a dashboard. The implementation plan focuses on:
1. Eliminating demo KPI duplication
2. Adding event context to production
3. Removing redundant elements from production

The generating state feedback requires backend support (`status: 'processing'`) and is documented as a Phase 2 requirement.

---

## Change 1: Demo — Remove KPI Duplication

**File:** `/apps/web/src/app/demo/organizer/reports/page.tsx`

**Current (problematic):**
```tsx
<section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
  <MetricCard label="Captured visits" value={...} />  // KPI duplication
  <MetricCard label="Unique attendees" value={...} />
  <MetricCard label="Leads" value={...} />
  <MetricCard label="Conversion" value={...} />
</section>
```

**New:** Remove this section entirely.

The demo should show only:
- DemoPageHeader
- AI report content (from `computeOrganizerReport`)

---

## Change 2: Production — Remove Redundant Eyebrow

**File:** `/apps/web/src/app/(console)/org/events/[eventId]/reports/page.tsx`

**Current:**
```tsx
<header className="flex flex-wrap items-end justify-between gap-4">
  <div>
    <p className="text-body font-medium uppercase tracking-[0.2em] text-muted">
      Executive reporting
    </p>
    <h1 className="mt-1 text-2xl font-semibold text-primary">
      {event.name}
    </h1>
    <p className="mt-1 text-body text-secondary">
      AI-generated executive summary with event outcomes, trends, and recommended actions.
    </p>
  </div>
  ...
</header>
```

**New:**
```tsx
<header className="flex flex-wrap items-end justify-between gap-4">
  <div>
    <h1 className="text-2xl font-semibold text-primary">
      {event.name}
    </h1>
    <p className="mt-1 text-body text-secondary">
      AI-generated executive summary with event outcomes, trends, and recommended actions.
    </p>
  </div>
  ...
</header>
```

The eyebrow "Executive reporting" is redundant — the h1 + description already convey the purpose.

---

## Change 3: Production — Add Event Context Line

Below the header, add:

```tsx
<p className="text-body-sm text-muted">
  Showing report for {event.name}
  {event.status !== "past" ? ` · ${event.status}` : ""}
</p>
```

This parallels what Analytics now has: "Showing funnel data for {event.name}".

Note: The page is within the Event layout (PageTabs), so it already has event context via the tabs. But the explicit context line is helpful for users who arrive directly via URL.

---

## Change 4: Production — Remove Unused Imports

The current `Button` import is used. The `Card` import is used. No change needed.

---

## Files to Modify

| File | Change |
|------|--------|
| `apps/web/src/app/demo/organizer/reports/page.tsx` | Remove 4 MetricCards + associated `MetricCard` import |
| `apps/web/src/app/(console)/org/events/[eventId]/reports/page.tsx` | Remove eyebrow, add event context line |

---

## Phase 2: Generating State Feedback (Requires Backend)

The current server action `generateEventReport` is async — the button won't show any state until the AI generation completes (10-30 seconds).

**Backend change needed:**
- API should return `status: 'processing'` immediately when POST to `/report` is received
- Then return the full report when generation completes (or fail with error)
- Frontend can then show "Generating report — this may take up to 30 seconds..." status

**Without this backend change, any frontend loading state would be based on a timer guesswork.**

---

## Quality Gate

After implementation, verify:
- [ ] Demo has zero MetricCards / KPI cards
- [ ] Demo shows only: header + event name + AI report + timestamp
- [ ] Production h1 is event name (no eyebrow above it)
- [ ] Production has event context line below header
- [ ] "View in Live Analytics" link retained
- [ ] PDF download link retained (only when complete)
- [ ] Failed state retained with retry message
- [ ] No KPI cards anywhere on either page
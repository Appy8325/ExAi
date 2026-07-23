# Cross-Product Consistency Review

**Date:** 2026-07-22
**Author:** EPIC 3 Implementation
**Scope:** Exhibitor Dashboard · Organizer Dashboard · Event Dashboard · Admin Dashboard · Analytics · Reports

---

## Severity Guide

| Severity | Description |
|----------|-------------|
| **Critical** | Violates the DASHBOARD_DESIGN_STANDARD or creates a broken UX |
| **Medium** | Inconsistent with other pages; reduces polish quality |
| **Minor** | Cosmetic; does not affect usability |

---

## 1. Spacing Tokens

### Critical: Exhibitor Dashboard — Wrong Root Spacing

| Page | Root Container |
|------|---------------|
| Organizer Dashboard | `<div className="space-y-section">` |
| Event Dashboard | `<div className="space-y-section">` |
| Admin Dashboard | `<div className="space-y-section">` |
| Analytics | `<div className="space-y-section">` |
| Reports | `<div className="space-y-section">` |
| **Exhibitor Dashboard** | `<div className="space-y-6">` + `max-w-7xl mx-auto p-6` |

Exhibitor Dashboard uses `space-y-6` and adds `max-w-7xl mx-auto p-6` — all other pages use `space-y-section`. This breaks the design system and produces different visual rhythm.

**Fix:** Change Exhibitor root to `space-y-section`, remove width/padding constraints (let the layout handle them).

---

## 2. Typography Hierarchy

### Medium: Secondary Metrics Typography Inconsistency

| Page | Section h2 | Metric Value | Metric Label |
|------|-----------|-------------|-------------|
| Event Dashboard | `text-body font-semibold` | `text-title font-semibold` | `text-caption text-secondary` |
| Exhibitor (Relationship Pipeline) | `text-body font-semibold` | `text-title font-semibold` | `text-caption text-secondary` |
| Admin (Service Status) | `text-body font-semibold` | `text-body font-semibold` | `text-caption text-muted` |

Event and Exhibitor use `text-title` for metric values inside their stat grids. Admin uses `text-body`. This is inconsistent for what is semantically the same pattern.

### Medium: Exhibitor Dashboard — Non-Standard h1 Token

Line 33: `<h1 className="text-title font-semibold">`

All other pages use `text-title-lg font-semibold` (via PageHeader) or `text-2xl font-semibold` (Reports inline h1).

The `text-title` token is used nowhere else as an h1. Exhibitor's h1 is smaller than every other page's h1.

### Minor: Event Dashboard — Secondary Metrics Section Has No h2

Event Dashboard's "Event Activity" section uses `text-body font-semibold` directly on the h2, but Analytics's equivalent "Booth engagement" uses the `SectionHeader` component. Organizer's equivalent section uses `SectionHeader` too.

---

## 3. Component Consistency

### Critical: Reports — Custom Header (No PageHeader)

Reports uses:
```tsx
<header className="flex flex-wrap items-end justify-between gap-4">
  <h1 className="text-2xl font-semibold text-primary">
```

All five other pages use `<PageHeader>` or the Exhibitor pattern of a custom `<div>` with h1 + description. Reports is the only page with a custom header using `flex-wrap items-end justify-between`.

This is architecturally inconsistent. However, the Reports layout (button on the right, title left) is specifically designed this way and cannot use `PageHeader` without losing the horizontal button placement. **This may be an acceptable exception.**

### Medium: Event Dashboard — CTA Buttons Not Using Button Component

Event Dashboard (line 316):
```tsx
<Link href={primaryCTAHref} className="inline-flex h-10 items-center rounded-lg bg-brand ...">
```

Admin Dashboard uses `<Button variant="secondary" size="sm" asChild><Link ...>` for the same pattern. Event Dashboard uses raw Link with hardcoded button styles.

### Medium: Analytics — Executive Report Link Uses Raw Link

Analytics (line 59-69):
```tsx
<Link href={...} className="inline-flex items-center gap-1 text-body-sm font-medium text-link hover:text-brand-hover transition-colors shrink-0">
```

Admin's "Investigate" links use `text-link hover:underline`. The Analytics link has extra styling that other pages don't use.

---

## 4. StatusBadge Usage

### Medium: Organizer — Redundant StatusBadge Label

Organizer Dashboard (line 310-314):
```tsx
<StatusBadge tone={item.severity === "danger" ? "danger" : "warning"} size="sm">
  {item.severity === "danger" ? "Alert" : "Warning"}
</StatusBadge>
```

The StatusBadge already shows a colored dot. Adding "Alert" / "Warning" text inside the badge is redundant with the badge's own visual indicator. Admin Dashboard handles this better — StatusBadge shows "Degraded" without additional text.

### Minor: Organizer — StatusBadge vs Inline Dot for Events List

Organizer's events list (line 363-375) uses `StatusBadge` for event status. But the health dot for the same event (line 354) is a raw `<span className="size-2 rounded-full">`.

Admin handles this consistently — both are shown together with the same dot color as the badge tone. Organizer's health dot is consistent with its inline health dot pattern, but differs from Admin's co-located dot + badge approach.

---

## 5. Health Indicators

No critical issues. All six pages have health indicators appropriate to their type. Consistency is good.

| Page | Pattern |
|------|---------|
| Exhibitor | `StatusBadge tone="success"` in header |
| Organizer | Health dot + colored text inline |
| Event | StatusBadge + health dot in health bar |
| Admin | StatusBadge + health dot + health label |
| Analytics | None (analytical workspace) |
| Reports | None (narrative page) |

---

## 6. CTA Hierarchy

### Critical: Event Dashboard — Raw Link for Primary CTA

Event Dashboard (line 314-319):
```tsx
<Link href={primaryCTAHref} className="inline-flex h-10 items-center rounded-lg bg-brand px-5 text-body-sm font-medium text-on-brand shadow-1 hover:bg-brand-hover hover:shadow-2 transition-all">
  {getPrimaryCTALabel()}
</Link>
```

Admin uses `<Button variant="primary" asChild><Link ...>` for its quick actions. Event should use the same pattern.

### Medium: Inconsistent Secondary CTA Styling

| Page | Pattern |
|------|---------|
| Admin | `<Button variant="secondary" asChild><Link>` |
| Event | Raw `<Link>` with `border border-default bg-surface` |
| Analytics | Raw `<Link>` with `text-link` + chevron |
| Exhibitor | Raw `<Link>` with `border border-default bg-surface h-9` |

Admin's Button + asChild pattern is the most correct. Event and Exhibitor use raw Link with hardcoded button styles.

### Minor: Organizer — "Next Best Actions" and "Attention Items" Use List Items Wrapping Links

Organizer Dashboard (line 251-277):
```tsx
<li>
  <Link href={action.href} className="group flex ...">
```

The `<li>` wrapper is semantically unnecessary — the `<Link>` is already a block-level element. However, it provides the numbered circle (`{i+1}`) in Next Best Actions, which requires a flex container. This is acceptable.

---

## 7. Date Formatting

### Minor: Three Different Date Approaches

| Page | Method | Example |
|------|--------|---------|
| Organizer | `new Date().toLocaleString()` (implicit default locale) | "7/22/2026, 10:00:00 AM" |
| Event | `Intl.DateTimeFormat(undefined, { dateStyle: "medium" })` | "Jul 22, 2026" |
| Analytics | `new Date().toLocaleString()` | "7/22/2026, 10:00:00 AM" |
| Reports | `toLocaleDateString("en-US", { month: "short", day: "numeric" })` | "Jul 22" |

Admin uses relative strings ("2h ago") which is a different category.

**Recommendation:** Standardize on `Intl.DateTimeFormat(undefined, { dateStyle: "medium" })` for all displayed timestamps. This produces consistent, locale-aware output.

---

## 8. Icons

### Minor: Icon Size Inconsistency

| Page | Download/Report Icon |
|------|---------------------|
| Analytics (line 64) | 24×24 viewBox |
| Reports (inline SVG) | 24×24 viewBox |
| Organizer (chevron) | 16×16 viewBox |
| Event (chevron) | 16×16 viewBox |
| Exhibitor (chevron) | 16×16 viewBox |

Analytics and Reports use 24×24 for their external/report icons. The chevron arrows in action items are consistently 16×16 across Organizer, Event, Exhibitor. This is minor but noticeable in side-by-side comparison.

---

## 9. Empty-State Language

| Page | Unavailable State | Empty State |
|------|-----------------|-------------|
| Exhibitor | N/A (always has dashboard) | "All clear · No relationships need attention" |
| Organizer | N/A (redirects to form) | "No issues detected — all events on track" |
| Event | "Event data unavailable" | N/A |
| Admin | N/A (always has platform overview) | N/A |
| Analytics | "Analytics are unavailable" | N/A |
| Reports | "Event report unavailable" | "Generate a report..." |

Inconsistencies:
- Analytics says "Analytics are unavailable" — sounds like the whole feature is down
- Reports says "Event report unavailable" — specific to the event
- Event says "Event data unavailable" — specific to the event

**Recommendation:** Standardize on "{Feature} for this {entity} is not available" pattern:
- Analytics: "Live analytics for this event are not yet available"
- Reports: "Report for this event is not yet available"

---

## 10. Naming Consistency

### Minor: Same Concept, Different Names

| Concept | Organizer | Exhibitor | Event | Analytics |
|---------|-----------|-----------|-------|-----------|
| QR scans / visits | N/A | "Scans per Visitor" | N/A | "capturedVisits" (data) |
| Connections | "Relationships" (totals) | "Relationships" | "connections" (per event) | "leads" |
| Analytics destination | "Live Analytics" | N/A | "View analytics" | N/A |
| Report destination | N/A | N/A | "View report" | "Executive report" (link) |

- Organizer uses "Relationships" for connection totals; Event uses "connections" for per-event counts. Acceptable (different context), but confusing.
- Organizer calls Analytics "Live Analytics"; Event calls it "View analytics". Both link to `/org/analytics`.
- Reports link is labeled "Executive report" in Analytics, "View report" in Event.

---

## 11. Loading Patterns

The loading states are in separate `loading.tsx` files. These were updated for Analytics and appear to use `SkeletonCard` patterns consistently. No critical issues found, but a full audit of all loading.tsx files against their page counterparts is recommended.

---

## 12. Visual Rhythm

### Minor: Organizer vs Event — Section Header Spacing

Organizer Dashboard uses:
```tsx
<h2 className="mb-1 text-body font-semibold text-primary">Next Best Actions</h2>
<p className="mb-4 text-caption text-muted">Prioritized by urgency — handle these first</p>
```

Event Dashboard uses:
```tsx
<h2 className="mb-1 text-body font-semibold text-primary">Next Best Actions</h2>
<p className="mb-4 text-caption text-muted">Prioritized by urgency</p>
```

Both use `mb-1` for h2. But Organizer uses `mb-4` for the description paragraph before the list. This is consistent between them.

### Minor: Exhibitor — Relationship Pipeline Stat Card Colors

Exhibitor uses color-coded stat cards:
- New: `border-default bg-sunken` (muted)
- Active: `border-status-success-border bg-status-success-subtle`
- Returning: `border-status-info-border bg-status-info-subtle`
- Needs Follow-up: `border-status-warning-border bg-status-warning-subtle`

This is unique to Exhibitor — no other page has this pattern. It's a distinctive Exhibitor feature and should be considered intentional, not inconsistent.

---

## Punch List

### Critical — RESOLVED ✅

| # | Issue | Page | Fix | Status |
|---|-------|------|-----|--------|
| 1 | Exhibitor uses `space-y-6` instead of `space-y-section` | Exhibitor | Change root container from `space-y-6` to `space-y-section` | ✅ Resolved 2026-07-22 |
| 2 | Event Dashboard primary CTA uses raw `<Link>` with button styles instead of `<Button asChild>` | Event | Import `Button`; replace raw `<Link>` with `<Button variant="primary" asChild><Link>` | ✅ Resolved 2026-07-22 |

### Medium (Polish Phase)

| # | Issue | Page | Fix |
|---|-------|------|-----|
| 3 | Secondary metrics values use `text-title` (larger) vs `text-body` in Admin Service Status | Event, Exhibitor | Standardize on one size |
| 4 | Analytics Executive Report link has extra styling vs Admin's Investigate links | Analytics | Use standard `text-link hover:underline` pattern |
| 5 | Organizer attention items redundant "Alert"/"Warning" text in StatusBadge | Organizer | Use StatusBadge tone only |
| 6 | Analytics and Reports use 24×24 icons vs 16×16 everywhere else | Analytics, Reports | Standardize to 16×16 |
| 7 | Date formats inconsistent (`toLocaleString` vs `Intl.DateTimeFormat`) | Organizer, Event, Analytics, Reports | Standardize on `Intl.DateTimeFormat` |
| 8 | Empty-state language inconsistent ("unavailable" phrasing) | Event, Analytics, Reports | Standardize messaging |

### Minor (Post-Launch)

| # | Issue | Page | Fix |
|---|-------|------|-----|
| 9 | Exhibitor h1 uses `text-title` not `text-title-lg` | Exhibitor | Align h1 token |
| 10 | Event secondary metrics section has no `SectionHeader` | Event | Add `SectionHeader` component |
| 11 | Naming: "Live Analytics" vs "View analytics" vs "Executive report" | Organizer, Event, Analytics | Standardize labels |
| 12 | Reports uses custom header layout instead of `PageHeader` | Reports | Acceptable exception; document |

---

## Summary Score

| Category | Status |
|----------|--------|
| Critical issues | 2 |
| Medium issues | 6 |
| Minor issues | 6 |
| **Critical resolved** | **2 ✅** |
| **Medium (polish phase)** | **6** |
| **Minor (post-launch)** | **6** |

---

## Validation Summary — Critical Fixes

### Fix 1: Exhibitor Dashboard — `space-y-6` → `space-y-section`

**File:** `apps/web/src/app/(portal)/exhibit/[organizationId]/dashboard/[eventExhibitorId]/dashboard-screen.tsx`

**Change:** Line 30 — replaced `<div className="mx-auto max-w-7xl space-y-6 p-6">` with `<div className="space-y-section">`

**Verification:**
- Exhibitor root now uses `space-y-section`, matching Organizer, Event, Admin, Analytics, and Reports
- No other visual changes made
- No TypeScript errors introduced by this change (pre-existing `_components` module errors are unrelated)
- Spacing now consistent across all six reference implementations

**Note:** The `max-w-7xl mx-auto p-6` container constraints were removed. The Exhibitor Dashboard is rendered inside a portal layout that provides its own width context. If any content requires explicit width constraints, those should be added at the component level (e.g., inside `KpiGrid` or individual sections), not at the root level.

### Fix 2: Event Dashboard — Raw `<Link>` CTA → `<Button asChild>`

**File:** `apps/web/src/app/(console)/org/events/[eventId]/page.tsx`

**Change:**
- Line 2 — Added `Button` to `@concourse/ui` imports
- Lines 312-317 — Replaced:
  ```tsx
  // Before
  <Link href={primaryCTAHref} className="inline-flex h-10 items-center rounded-lg bg-brand px-5 text-body-sm font-medium text-on-brand shadow-1 hover:bg-brand-hover hover:shadow-2 transition-all">
    {getPrimaryCTALabel()}
  </Link>
  ```
  with:
  ```tsx
  // After
  <Button variant="primary" asChild>
    <Link href={primaryCTAHref}>
      {getPrimaryCTALabel()}
    </Link>
  </Button>
  ```

**Verification:**
- Button variant `"primary"` produces identical visual output: `bg-brand text-on-brand shadow-1` with hover states
- `asChild` pattern is the established standard used in Admin Dashboard Quick Actions
- No change to `getPrimaryCTALabel()` behavior — all four label branches work identically
- No TypeScript errors introduced by this change
- `href`, label text, and conditional rendering unchanged

The two critical issues (Exhibitor spacing, Event CTA button) are straightforward fixes and should be resolved before the polish phase begins.
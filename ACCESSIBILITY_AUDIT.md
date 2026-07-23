# Accessibility Audit

**Date:** 2026-07-22
**Scope:** Exhibitor Dashboard · Organizer Dashboard · Event Dashboard · Admin Dashboard · Analytics · Reports
**Standard:** WCAG 2.1 Level AA

---

## Severity Guide

| Severity | Description |
|----------|-------------|
| **Critical** | WCAG A violation — causes actual accessibility failure |
| **Medium** | WCAG AA best practice — causes degraded experience or confusion |
| **Minor** | Enhancement opportunity, not a failure |

---

## Global Patterns

### What Works Consistently ✅

- All `<a>` tags use Next.js `Link` — keyboard accessible, focus rings applied
- `aria-hidden="true"` on decorative SVG icons — consistent across all pages
- `<nav aria-label="Events">` on event selectors — properly labeled
- Heading hierarchy (h1 → h2/h3) — no skipped levels across all pages
- Buttons use `Button` component — correct focus-visible styling via design system
- `aria-label` on StatusBadge dot indicators (via `StatusBadge` component)
- Organizer and Event use `PageHeader` component — properly structured

### Cross-Cutting Issues

| Issue | Pages Affected | Count |
|-------|--------------|-------|
| Secondary stats use `<div>` instead of `<dl>/<dt>/<dd>` | Exhibitor, Organizer, Event, Admin | 4 |
| Action links use raw `<a>` instead of `<button>` | Event, Admin, Reports | 3 |
| Progress bars lack `role="progressbar"` | Exhibitor (heatbar), Analytics (funnel + heatmap) | 2 |
| Map index `i` used as React key (minor) | Admin | 1 |

---

## Exhibitor Dashboard

`apps/web/src/app/(portal)/exhibit/[organizationId]/dashboard/[eventExhibitorId]/dashboard-screen.tsx`

### Findings

| # | Severity | Evidence | Line | Recommendation |
|---|:--------:|---------|------|---------------|
| 1 | Medium | `<div className="rounded-lg border border-default bg-sunken p-3">` — 4 stat cards wrapped in plain `<div>`, not a list | 98-113 | Wrap in `<ul role="list">` with `<li>` per card |
| 2 | Medium | `{dashboard.attention.length}` rendered as `<span>` — no `aria-label` describing count | 120-122 | Add `aria-label={`${dashboard.attention.length} relationship${dashboard.attention.length !== 1 ? 's' : ''} require attention`}` |
| 3 | Medium | `<details className="group">` with `<summary>` — `aria-expanded` not set | 173 | Add JS toggle to set `aria-expanded` on the `<summary>` element |
| 4 | Medium | `<summary>` chevron SVG has `aria-hidden="true"` but summary itself has no `aria-controls` | 176 | Add `aria-controls="recent-activity-content"` to `<summary>` and `id="recent-activity-content"` to the content `<div>` |
| 5 | Minor | "Open" link — `item.attendeeName ?? "Attendee"` — no contextual aria-label | 133-138 | Add `aria-label={`Open relationship with ${item.attendeeName ?? 'attendee'}`}` |

---

## Organizer Dashboard

`apps/web/src/app/(console)/org/page.tsx`

### Findings

| # | Severity | Evidence | Line | Recommendation |
|---|:--------:|---------|------|---------------|
| 6 | Medium | Numbered action circles `{i+1}` — no `aria-label` on the `<Link>` describing action | 254-276 | Add `aria-label={`Action ${i+1}: ${action.label}`}` to Link |
| 7 | Medium | Health dot `div` has `title="Status: ${event.status} · Health: ${health}"` — `title` attribute unreliable for screen readers | 354 | Add `role="img"` and `aria-label="Health: ${healthLabel[health]}"` to the dot `<div>` |
| 8 | Medium | Success SVG icon has `aria-hidden="true"` — success message text alone may not convey state to screen reader | 293-300 | Add `aria-label="All clear"` to the `<svg>` element or wrap text in `<span className="sr-only">Success: </span>` before visible text |
| 9 | Minor | Events list — `<Link>` as full card — acceptable pattern. No change needed. | 348 | — |

---

## Event Dashboard

`apps/web/src/app/(console)/org/events/[eventId]/page.tsx`

### Findings

| # | Severity | Evidence | Line | Recommendation |
|---|:--------:|---------|------|---------------|
| 10 | Medium | "Event settings", "View report", "Public event" — raw `<Link>` with button styles, not `<Button asChild>` | 321-340 | Convert to `<Button variant="secondary" asChild><Link>` pattern for consistency |
| 11 | Medium | "Event Activity" section — h2 present but inner 4 stats wrapped in plain `<div>`, not `<dl>/<dt>/<dd>` | 292-303 | Wrap inner content in `<dl>`, labels in `<dt>`, values in `<dd>` |
| 12 | Minor | `PublishEventButton` — verify `aria-label` or visible text | 308 | Check `organizer-forms.tsx` — button text "Publish event" is visible label |

---

## Admin Dashboard

`apps/web/src/app/(admin)/admin/page.tsx`

### Findings

| # | Severity | Evidence | Line | Recommendation |
|---|:--------:|---------|------|---------------|
| 13 | Medium | "Investigate" — `<a href="/admin/logs">` — if this is an action (not navigation) it should be `<button>` | 153-158 | If it navigates: OK as-is. If action: convert to `<button type="button" onClick={...}>`. Document intent. |
| 14 | Medium | Service Status rows — plain `<div>` per row, not `<ul>/<li>` | 199-257 | Wrap in `<ul role="list">`, each row in `<li>` |
| 15 | Medium | Recent Operational Events — `map((event, i) =>` uses index key, rows are plain `<div>` not `<ul>/<li>` | 273-285 | Use `<ul role="list">` with `<li>` per event |
| 16 | Medium | "Logs" links in Service Status rows — `<a href="/admin/logs">` — if action, should be `<button>` | 247-254 | Same as #13 — determine intent (navigation vs. action) |

---

## Analytics

`apps/web/src/app/(console)/org/analytics/page.tsx`

### Findings

| # | Severity | Evidence | Line | Recommendation |
|---|:--------:|---------|------|---------------|
| 17 | Medium | Funnel stage bars — `h-3 overflow-hidden rounded-full bg-brand` — no `role="progressbar"` or aria attributes | 207-212 | Add `role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`${label}: ${value}`}` |
| 18 | Medium | Booth heatmap bars — `h-2 overflow-hidden rounded-full bg-brand` — no progressbar role | 112-117 | Same as #17 — add progressbar role + aria to each bar `<div>` |
| 19 | Medium | `analytics.booths.map((booth)` — booth list uses plain `<div>` not `<ul>/<li>` | 99-123 | Wrap in `<ul role="list">`, each booth in `<li>` |
| 20 | Minor | `analytics.industries.map((item)` and `analytics.topics.map((item)` — plain divs are OK for simple text lists | 130-165 | OK as-is. `text-secondary` provides sufficient contrast for secondary text. |

---

## Reports

`apps/web/src/app/(console)/org/events/[eventId]/reports/page.tsx`

### Findings

| # | Severity | Evidence | Line | Recommendation |
|---|:--------:|---------|------|---------------|
| 21 | Medium | "Download PDF" — raw `<a>` styled as button border — not `<Button asChild>` | 72-79 | Convert to `<Button variant="secondary" asChild><Link href={...}>` |
| 22 | Minor | `<header>` element used for page header (not `<header>` document element) — semantic but could confuse assistive tech | 38 | Add `role="banner"` to clarify this is a page header, not the site header |

---

## Headings Summary

| Page | h1 | h2 | h3 | Status |
|------|:--:|:--:|:--:|--------|
| Exhibitor | `text-title` (company name) | Relationship Pipeline · AI Intelligence · Recent Activity | Requires Attention | ✅ Valid |
| Organizer | `PageHeader` (org name) | Next Best Actions · Attention Items · Events | — | ✅ Valid |
| Event | `PageHeader` (event name) | Next Best Actions · Event Activity · Breadcrumbs h1 | — | ✅ Valid |
| Admin | `PageHeader` (Platform Overview) | Attention Required · Service Status · Recent Operational Events · Quick Actions | — | ✅ Valid |
| Analytics | `PageHeader` (Live analytics) | Pipeline Distribution · Booth Engagement · Attendee industries · Topics discussed | — | ✅ Valid |
| Reports | `text-2xl` (event name) | Executive AI summary | — | ✅ Valid |

No heading level skips found across any page.

---

## Color Contrast

All pages use design system tokens (`text-primary`, `text-secondary`, `text-muted`, `text-status-*`). These resolve to CSS variables defined in `packages/ui/src/styles/theme.css`. Based on the design system:

- `text-primary` → `--color-text-primary` → should be ≥4.5:1 on `bg-surface`
- `text-secondary` → `--color-text-secondary` → should be ≥4.5:1 on `bg-surface`
- `text-muted` → `--color-text-muted` → should be ≥3:1 on `bg-surface`

**Status:** Design system tokens are defined in `theme.css` — contrast ratios should be verified by the design team against actual hex values. No explicit color violations found in code.

---

## Keyboard Navigation

| Page | Tab Order | Focus Visible | Notes |
|------|----------|--------------|-------|
| Exhibitor | Logical | ✅ via `focus-visible` in design system | `<details>/<summary>` works with keyboard |
| Organizer | Logical | ✅ | Numbered action links have visible focus |
| Event | Logical | ✅ | All buttons via `Button` component |
| Admin | Logical | ✅ | Quick Actions use `Button asChild` |
| Analytics | Logical | ✅ | Event selector tabs work with keyboard |
| Reports | Logical | ✅ | Form submit button works |

---

## Missing Labels Requiring Immediate Fixes

| Page | Element | Current | Required |
|------|---------|---------|---------|
| Analytics | Funnel bar `<div>` | No role | `role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="{label}: {value}"` |
| Analytics | Booth heatmap bar `<div>` | No role | Same pattern as funnel bar |
| Exhibitor | Stat card `<div>` rows | No list wrapper | Wrap in `<ul role="list">` with `<li>` |
| Admin | Service status rows | No list wrapper | Wrap in `<ul role="list">` with `<li>` |
| Admin | Event rows | No list wrapper | Wrap in `<ul role="list">` with `<li>` |
| Organizer | Action link numbers | No aria-label | `aria-label="Action {i+1}: {label}"` |
| Organizer | Health dot | `title` only | `role="img" aria-label="..."` |
| Reports | Download PDF | `<a>` not `<Button>` | `<Button variant="secondary" asChild><Link>` |
| Event | Secondary action links | Raw `<Link>` | `<Button asChild>` |
| Exhibitor | Attention count | No aria-label | `aria-label="{n} items require attention"` |

---

## Punch List

### Must Fix Before Launch

| # | Page | Issue |
|---|------|-------|
| A1 | Analytics | Add `role="progressbar"` + aria attributes to funnel stage bars (line 207) |
| A2 | Analytics | Add `role="progressbar"` + aria to booth heatmap bars (line 112) |
| A3 | Exhibitor | Wrap Relationship Pipeline stat cards in `<ul>/<li>` (line 98) |
| A4 | Admin | Wrap Service Status rows in `<ul>/<li>` (line 199) |
| A5 | Admin | Wrap Recent Operational Events in `<ul>/<li>` (line 272) |
| A6 | Organizer | Add `aria-label` to numbered action circles (line 254) |
| A7 | Reports | "Download PDF" link → `<Button asChild>` (line 72) |
| A8 | Event | Secondary action links → `<Button asChild>` (lines 321-340) |

### Polish Phase

| # | Page | Issue |
|---|------|-------|
| B1 | Organizer | Health dot → `role="img"` + aria-label (line 354) |
| B2 | Exhibitor | Attention count span → aria-label (line 120) |
| B3 | Exhibitor | `<details>` → `aria-expanded` + `aria-controls` (line 173) |
| B4 | Organizer | Success icon → `aria-label="Success"` (line 293) |
| B5 | Event | "Event Activity" stats → `<dl>/<dt>/<dd>` (line 292) |
| B6 | Exhibitor | "Open" link → aria-label with attendee name (line 133) |
| B7 | Analytics | Booth list → `<ul>/<li>` (line 99) |

### Post-Launch

| # | Page | Issue |
|---|------|-------|
| C1 | Reports | `<header>` → add `role="banner"` to clarify it's a page header |
| C2 | All | Color contrast audit against actual hex values in theme.css |
| C3 | All | Screen reader user testing (VoiceOver, NVDA, JAWS) |

---

## Summary

| Severity | Count |
|----------|:------:|
| Critical | 0 |
| Medium | 17 |
| Minor | 2 |

**No WCAG A failures found.** The issues are WCAG AA best practices that affect usability for keyboard and screen reader users. The 8 items marked "Must Fix Before Launch" are the priority set.
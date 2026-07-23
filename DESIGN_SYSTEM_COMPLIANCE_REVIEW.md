# Design System Compliance Review

**Date:** 2026-07-22
**Reference:** DASHBOARD_DESIGN_STANDARD.md v1.1
**Scope:** Exhibitor · Organizer · Event · Admin · Analytics · Reports

---

## Compliance Rating Scale

| Rating | Description |
|--------|-------------|
| ✅ Compliant | Uses correct token/component |
| ⚠️ Minor Deviation | Token exists but not used; visual difference negligible |
| 🔴 Non-Compliant | Design system token/component available but not used |

---

## Exhibitor Dashboard

`apps/web/src/app/(portal)/exhibit/[organizationId]/dashboard/[eventExhibitorId]/dashboard-screen.tsx`

| Element | Standard Says | Actual | Status | Note |
|---------|--------------|--------|--------|------|
| Section spacing | `space-y-section` | `space-y-6` | 🔴 | CRITICAL #1 in CROSS_PRODUCT_CONSISTENCY_REVIEW.md — already identified |
| Page layout | `space-y-section` between sections | Mix of `space-y-6` and implicit | 🔴 | |
| Card variant | `<Card variant="default">` | `<div className="rounded-lg border border-default bg-sunken p-3">` | 🔴 | Not using Card component |
| Card header | `<CardHeader>` | Inline div with `text-sm font-medium text-primary` | 🔴 | Not using CardHeader |
| Section header | `<SectionHeader>` | Inline divs | ⚠️ | SectionHeader not used; inline styling |
| Button | `<Button>` | `<Link>` with className | ⚠️ | Some actions use Link, not Button asChild |
| Stat value | `text-3xl font-semibold text-primary` | Hardcoded classes | ⚠️ | No `StatCard` component used |
| Badge | `<Badge>` | Inline span | ⚠️ | StatusBadge not used for status |
| Empty state | `<EmptyState>` | Inline conditional rendering | ⚠️ | Not using EmptyState component |
| Skeleton | `<Skeleton>` | Spinner | 🔴 | Not using Skeleton |
| PageHeader | `<PageHeader>` | Not used (uses text div) | ⚠️ | Uses custom layout |

**Compliance Score: ~5.5/10**

---

## Organizer Dashboard

`apps/web/src/app/(console)/org/page.tsx`

| Element | Standard Says | Actual | Status | Note |
|---------|--------------|--------|--------|------|
| Page wrapper | `PageHeader` + `space-y-section` sections | `PageHeader` + section divs | ✅ | PageHeader used correctly |
| Section spacing | `space-y-section` | `space-y-section` | ✅ | |
| Card | `<Card>` | `<Card>` | ✅ | |
| Button | `<Button>` | `<Button>` | ✅ | |
| Button asChild | Actions as links | `<Button asChild><Link>` | ✅ | |
| Empty state | `<EmptyState>` | Inline div with icon + text | ⚠️ | Not using EmptyState component |
| Skeleton | `<Skeleton>` | Spinner | 🔴 | Not using Skeleton |
| Stat cards | `text-3xl font-semibold` | Hardcoded classes | ⚠️ | No StatCard component |
| Badge | `<Badge>` | `<Badge>` used in StatusBadge | ✅ | |
| SectionHeader | `<SectionHeader>` | `<SectionHeader>` | ✅ | |

**Compliance Score: ~7.5/10**

---

## Event Dashboard

`apps/web/src/app/(console)/org/events/[eventId]/page.tsx`

| Element | Standard Says | Actual | Status | Note |
|---------|--------------|--------|--------|------|
| Page wrapper | `PageHeader` | `PageHeader` | ✅ | |
| Section spacing | `space-y-section` | `space-y-6` | 🔴 | CRITICAL #2 in CROSS_PRODUCT_CONSISTENCY_REVIEW — Link vs Button |
| Button | `<Button>` | `<Link>` with className | 🔴 | "Event settings", "View report", "Public event" are raw Links |
| Button asChild | Actions as links | Not used for secondary actions | 🔴 | |
| SectionHeader | `<SectionHeader>` | `<SectionHeader>` | ✅ | |
| Card | `<Card>` | `<Card>` | ✅ | |
| Empty state | `<EmptyState>` | Inline divs | ⚠️ | Not using EmptyState component |
| Skeleton | `<Skeleton>` | Spinner | 🔴 | Not using Skeleton |
| Badge | `<Badge>` | `<Badge>` | ✅ | |
| PageHeader eyebrow | `eyebrow` prop | No eyebrow (correct for this page type) | ✅ | Reports/Analytics exception noted |

**Compliance Score: ~6.0/10**

---

## Admin Dashboard

`apps/web/src/app/(admin)/admin/page.tsx`

| Element | Standard Says | Actual | Status | Note |
|---------|--------------|--------|--------|------|
| Page wrapper | `PageHeader` | `PageHeader` | ✅ | |
| Section spacing | `space-y-section` | `space-y-6` | 🔴 | |
| SectionHeader | `<SectionHeader>` | Inline divs | 🔴 | Not using SectionHeader |
| Card | `<Card>` | `<Card>` | ✅ | |
| Button | `<Button>` | `<Button>` | ✅ | |
| Button asChild | Quick actions | `<Button asChild><Link>` | ✅ | |
| Badge | `<Badge>` | `<Badge>` | ✅ | |
| Health bar | `SpaceYSection` pattern | Inline component | ⚠️ | HealthBar is custom component |
| Service status | Semantic list | Plain divs | 🔴 | Not using `space-y-section`, no `<ul>` |
| Empty state | `<EmptyState>` | Inline divs | ⚠️ | Not using EmptyState |
| Skeleton | `<Skeleton>` | Spinner | 🔴 | Not using Skeleton |

**Compliance Score: ~5.5/10**

---

## Analytics

`apps/web/src/app/(console)/org/analytics/page.tsx`

| Element | Standard Says | Actual | Status | Note |
|---------|--------------|--------|--------|------|
| Page wrapper | `PageHeader` | `PageHeader` | ✅ | |
| Section spacing | `space-y-section` | `space-y-section` | ✅ | |
| SectionHeader | `<SectionHeader>` | `<SectionHeader>` | ✅ | |
| Card | `<Card>` | `<Card>` | ✅ | |
| Button | `<Button>` | `<Button>` | ✅ | |
| Chart containers | Design system colors | `bg-brand` bars | ⚠️ | Chart colors from design system; bar colors hardcoded |
| Skeleton | `<Skeleton>` | Spinner | 🔴 | Not using Skeleton |
| Funnel visualization | Pipeline funnel | Custom div implementation | ⚠️ | Not a chart library component |
| Empty state | `<EmptyState>` | Inline divs | ⚠️ | Not using EmptyState |
| Tabs | `<Tabs>` | `Button` variant | ⚠️ | Event selector uses Button, not Tabs component |

**Compliance Score: ~7.0/10**

---

## Reports

`apps/web/src/app/(console)/org/events/[eventId]/reports/page.tsx`

| Element | Standard Says | Actual | Status | Note |
|---------|--------------|--------|--------|------|
| Page wrapper | Custom (no PageHeader) | Custom header div | ✅ | Correct per design standard |
| Section spacing | `space-y-section` | `space-y-6` | 🔴 | |
| SectionHeader | `<SectionHeader>` | Not used | ⚠️ | No section headers in Reports |
| Card | `<Card>` | `<Card>` | ✅ | |
| Button asChild | Secondary actions | Not used for "Download PDF" | 🔴 | Raw `<a>` tag |
| Badge | `<Badge>` | `<Badge>` | ✅ | |
| Empty state | `<EmptyState>` | Inline divs | ⚠️ | Not using EmptyState |
| Skeleton | `<Skeleton>` | Spinner | 🔴 | Not using Skeleton |
| Report preview | Card with header + content | Custom layout in Card | ✅ | Reusing Card component |

**Compliance Score: ~6.0/10**

---

## Token Usage Audit

### Frequently Misused Tokens

| Token | Should Be Used For | Found Misused In |
|-------|-------------------|-----------------|
| `space-y-section` | Page sections with card groups | Exhibitor, Event, Admin, Reports use `space-y-6` |
| `<SectionHeader>` | Section titles + descriptions | Admin uses inline divs |
| `<Card>` + `<CardHeader>` | Any card container | Exhibitor uses plain divs |
| `<EmptyState>` | Zero-record messages | All pages use inline divs |
| `<Skeleton>` | Loading placeholders | All pages use spinners |
| `<Button asChild>` | Links styled as buttons | Event, Reports use raw `<Link>` |

### Correctly Used Tokens

| Token | Pages Using Correctly |
|-------|----------------------|
| `PageHeader` | Organizer, Event, Admin, Analytics |
| `<Card>` | Organizer, Event, Admin, Analytics, Reports |
| `<Badge>` / `<StatusBadge>` | All pages |
| `<Button>` | All pages (primary actions) |
| `space-y-section` | Organizer, Analytics |
| `<SectionHeader>` | Organizer, Analytics |
| `<Button asChild>` | Organizer (actions), Admin (quick actions) |

---

## Summary by Page

| Page | Score | Top Deviation |
|------|:-----:|--------------|
| Organizer | 7.5/10 | Skeleton, EmptyState component |
| Analytics | 7.0/10 | Skeleton, EmptyState, Tabs |
| Reports | 6.0/10 | space-y-6, Button asChild, Skeleton |
| Event | 6.0/10 | space-y-6, raw Link buttons, Skeleton |
| Exhibitor | 5.5/10 | Plain divs instead of Card, space-y-6, Skeleton |
| Admin | 5.5/10 | SectionHeader, space-y-6, Skeleton |

**Overall: ~6.3/10**

---

## Priority Fixes for RC-1

1. **Exhibitor:** Replace plain stat card divs with `<Card>` + `<CardHeader>` pattern
2. **Event + Reports:** Replace raw `<Link>` buttons with `<Button asChild>` for secondary actions
3. **All pages:** Replace spinners with `<Skeleton>` components
4. **Admin:** Replace section inline divs with `<SectionHeader>`
5. **All pages:** Replace `space-y-6` with `space-y-section` between page sections
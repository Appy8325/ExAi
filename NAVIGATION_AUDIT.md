# ExAi Navigation Audit

**Date:** 2026-07-21
**Status:** CRITICAL - Multiple navigation systems rendering simultaneously

---

## Executive Summary

The application currently has **8+ navigation systems** rendering simultaneously in various contexts:

| Category | Components | Status |
|----------|-----------|--------|
| Global Headers | `GlobalNav`, `DemoTopBar` | DUPLICATE - Both render perspective pills |
| Workspace Sidebars | `ConsoleNav`, `Sidebar` (exhibitor) | SEPARATE - Different implementations |
| Mobile Menus | `GlobalNav` mobile dropdown, `MarketingNav` mobile | DUPLICATE |
| Perspective Switch | `GlobalNav` (desktop pills), `DemoTopBar` pills, `WorkspaceSwitcher` dropdown | TRIplicated |
| Breadcrumbs | `UnifiedBreadcrumbs` | OK - Single implementation |
| Bottom Nav | Attendee bottom tabs | OK - Context-specific |

---

## Component Inventory

### 1. GlobalNav
**File:** `apps/web/src/components/navigation/global-nav.tsx`

| Property | Value |
|----------|-------|
| Routes | All (used in marketing, console, portal, admin, hackathon) |
| Variants | `marketing`, `console`, `compact` |
| Contains | Logo, Perspective pills (desktop), Demo Admin link, Sign in button, Mobile drawer |

**Issues:**
- Desktop perspective pills duplicate `DemoTopBar` pills
- "Demo Admin" link exposed publicly
- Mobile drawer duplicates `MarketingNav` mobile menu
- Contains both global navigation AND perspective switching (violates single responsibility)

**Should remain:** YES (as the single global header)

---

### 2. DemoTopBar
**File:** `apps/web/src/components/demo/shell.tsx`

| Property | Value |
|----------|-------|
| Routes | `/demo/*`, `/demo/organizer/*`, `/demo/exhibitor/*` |
| Contains | Logo, Perspective pills (Org/Exh/Att), WorkspaceSwitcher, Back to homepage, SimulationStatusBadge |

**Issues:**
- **COMPLETE DUPLICATE** of GlobalNav functionality on demo routes
- Perspective pills identical to GlobalNav desktop pills
- Contains DemoSideNav (sidebar) and DemoMobileNav
- Has its own mobile nav logic separate from GlobalNav

**Should remain:** NO - Delete entirely

---

### 3. MarketingNav
**File:** `apps/web/src/app/(marketing)/_components/marketing-nav.tsx`

| Property | Value |
|----------|-------|
| Routes | All marketing routes (inside `(marketing)` route group) |
| Contains | Logo slot, Desktop nav links (Attendee/Demo/Sign in), Try demo CTA, Mobile menu |

**Issues:**
- Duplicates GlobalNav mobile menu
- Logo is passed as a prop (smells like workaround)
- Sign in link duplicates GlobalNav "Sign in" button

**Should remain:** NO - Marketing layout should use only GlobalNav

---

### 4. ConsoleNav
**File:** `apps/web/src/app/(console)/console-nav.tsx`

| Property | Value |
|----------|-------|
| Routes | `/org/*` (Organizer workspace) |
| Contains | Logo, Nav items (Dashboard/Events/Users/Analytics/Settings), Experience links, User menu |

**Issues:**
- Partially duplicates GlobalNav (has Experience ExAi, Attendee links)
- No AI Insights or Reports (inconsistent with spec)

**Should remain:** YES (as organizer sidebar) - but needs cleanup

---

### 5. Sidebar (Exhibitor)
**File:** `apps/web/src/app/(portal)/exhibit/[organizationId]/_components/sidebar.tsx`

| Property | Value |
|----------|-------|
| Routes | `/exhibit/[organizationId]/*` (Exhibitor workspace) |
| Contains | Logo, Nav items (Dashboard/Attendees/AI Insights/Knowledge/Lead form/QR/Settings), Experience links, User menu |

**Issues:**
- Partially duplicates GlobalNav (has Experience ExAi, Attendee links)
- Uses different nav items than ConsoleNav (inconsistent)

**Should remain:** YES (as exhibitor sidebar) - but needs cleanup

---

### 6. WorkspaceSwitcher
**File:** `apps/web/src/components/navigation/workspace-switcher.tsx`

| Property | Value |
|----------|-------|
| Routes | Used in DemoTopBar |
| Contains | Dropdown button, Perspective options, Back to homepage, Demo admin |

**Issues:**
- Only used by DemoTopBar (which should be deleted)
- Contains "Demo admin" link publicly exposed

**Should remain:** NO - Delete (redundant with GlobalNav)

---

### 7. UnifiedBreadcrumbs
**File:** `apps/web/src/components/navigation/unified-breadcrumbs.tsx`

| Property | Value |
|----------|-------|
| Routes | Console, Exhibitor, Attendee, Demo routes |
| Contains | Breadcrumb trail based on pathname |

**Issues:**
- Hardcoded breadcrumb paths (not dynamic)
- Doesn't use standard "Experience > Organizer > Events" format

**Should remain:** YES - Refactor to use standard format

---

### 8. Attendee Bottom Nav
**File:** `apps/web/src/app/(attendee)/layout.tsx`

| Property | Value |
|----------|-------|
| Routes | `/e/*`, `/visit/*`, `/account/*` |
| Contains | Bottom tabs (Browse, Saved, Profile) |

**Issues:**
- Only shows on non-visit pages, hidden during booth visits
- Has custom back navigation for visit pages

**Should remain:** YES (mobile-specific)

---

### 9. DemoSideNav
**File:** `apps/web/src/components/demo/shell.tsx`

| Property | Value |
|----------|-------|
| Routes | `/demo/organizer/*`, `/demo/exhibitor/*` |
| Contains | Section title, Nav items |

**Issues:**
- Part of DemoTopBar system (should be deleted)

**Should remain:** NO - Delete entirely

---

### 10. DemoMobileNav
**File:** `apps/web/src/components/demo/shell.tsx`

| Property | Value |
|----------|-------|
| Routes | `/demo/*` (horizontal scrollable nav) |
| Contains | Section links |

**Issues:**
- Part of DemoTopBar system (should be deleted)

**Should remain:** NO - Delete entirely

---

### 11. EventNav
**File:** `apps/web/src/app/(console)/org/events/[eventId]/event-nav.tsx`

| Property | Value |
|----------|-------|
| Routes | `/org/events/[eventId]/*` |
| Contains | Tabs (Overview/Exhibitors/Reports/Settings) |

**Should remain:** YES (context-specific sub-navigation)

---

## Route Group Analysis

| Route Group | Global Nav | Sidebar | Breadcrumbs | Issues |
|-------------|-----------|---------|-------------|--------|
| `(root)` | None | None | None | OK |
| `(marketing)` | GlobalNav | MarketingNav | None | DUPLICATE: MarketingNav |
| `(console)` | GlobalNav | ConsoleNav | UnifiedBreadcrumbs | OK (needs cleanup) |
| `(portal)` | GlobalNav | None (portal), Sidebar (exhibit) | None | DUPLICATE: GlobalNav variant |
| `(attendee)` | GlobalNav | BottomNav | None | OK |
| `(admin)` | GlobalNav | Inline sidebar | None | OK |
| `(auth)` | AuthShell | None | None | OK |
| `/demo` | DemoTopBar | DemoSideNav | UnifiedBreadcrumbs | FULL DUPLICATE |
| `/demo/organizer` | DemoTopBar | DemoSideNav | UnifiedBreadcrumbs | FULL DUPLICATE |
| `/demo/exhibitor` | DemoTopBar | DemoSideNav | UnifiedBreadcrumbs | FULL DUPLICATE |
| `/hackathon` | GlobalNav | None | None | OK |

---

## Duplicate Summary

### 1. Perspective Switching (3 implementations)
- **GlobalNav** desktop pills: Experience, Organizer, Exhibitor, Attendee
- **DemoTopBar** pills: Org, Exh, Att
- **WorkspaceSwitcher** dropdown: All perspectives

**Solution:** Keep GlobalNav only. Delete DemoTopBar and WorkspaceSwitcher.

### 2. Mobile Menus (2 implementations)
- **GlobalNav** mobile drawer
- **MarketingNav** mobile menu

**Solution:** Keep GlobalNav mobile drawer only. Delete MarketingNav mobile section.

### 3. Demo Navigation (Complete duplicate of main nav)
- DemoTopBar + DemoSideNav + DemoMobileNav = 100% duplicate of GlobalNav + ConsoleNav

**Solution:** Replace demo layouts to use GlobalNav + ConsoleNav/Sidebar

---

## Problems to Fix

1. **GlobalNav exposes "Demo Admin" publicly** - Must hide behind feature flag or auth
2. **Demo routes use separate DemoTopBar** - Should use GlobalNav
3. **MarketingNav duplicates GlobalNav** - Should be removed
4. **WorkspaceSwitcher is unused dead code** - Should be deleted
5. **Multiple sidebar implementations** - ConsoleNav and Sidebar should share code
6. **Inconsistent breadcrumb format** - Should use "Experience > Organizer > Events"
7. **Demo admin link in multiple places** - Should be consolidated and hidden

---

## Recommended Architecture

```
GlobalNav (ONE header everywhere)
├── Logo: ExAi
├── Desktop: Perspective pills (Experience/Organizer/Exhibitor/Attendee)
├── Desktop: Sign in button
├── Mobile: Hamburger → Drawer with all links
└── Hidden: Demo admin (feature flag)

ConsoleNav (Organizer sidebar)
├── Dashboard, Events, Users, Analytics, AI Insights, Reports, Settings
└── Bottom: Experience ExAi link, Sign out

Sidebar (Exhibitor sidebar)
├── Dashboard, Visitors, Analytics, AI Assistant, Products, Knowledge, Settings
└── Bottom: Experience ExAi link, Sign out

UnifiedBreadcrumbs
└── "Experience > Organizer > Events" format
```
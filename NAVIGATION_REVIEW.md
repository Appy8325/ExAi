# Navigation Architecture Review - ExAi

**Date:** July 21, 2026
**Status:** Implemented
**Sprint:** Navigation Architecture

---

## Objective

A first-time user should always know:
- Where am I?
- What can I do here?
- What should I do next?
- How do I go back?
- How do I switch perspectives?

Navigation should feel like one coherent application, not multiple disconnected demos.

---

## Current Navigation Map

### Route Structure

```
/ (marketing homepage)
├── /hackathon (Attendee landing)
│   └── /hackathon/expo (Expo floor)
├── /demo (Demo hub)
│   ├── /demo/organizer (Organizer workspace)
│   │   ├── /demo/organizer/events
│   │   ├── /demo/organizer/analytics
│   │   ├── /demo/organizer/heatmaps
│   │   ├── /demo/organizer/ai-insights
│   │   └── /demo/organizer/reports
│   ├── /demo/exhibitor (Exhibitor picker)
│   │   └── /demo/exhibitor/[eventExhibitorId]
│   │       ├── /demo/exhibitor/[eventExhibitorId]/products
│   │       ├── /demo/exhibitor/[eventExhibitorId]/visitors
│   │       ├── /demo/exhibitor/[eventExhibitorId]/analytics
│   │       ├── /demo/exhibitor/[eventExhibitorId]/ai-insights
│   │       ├── /demo/exhibitor/[eventExhibitorId]/qr
│   │       └── /demo/exhibitor/[eventExhibitorId]/preview
│   └── /demo/admin (Admin panel)
├── /org (Organizer console)
│   ├── /org/analytics
│   ├── /org/settings
│   ├── /org/users
│   └── /org/events
│       └── /org/events/[eventId]
│           ├── /org/events/[eventId]/documents
│           ├── /org/events/[eventId]/exhibitors
│           ├── /org/events/[eventId]/exhibitors/[exhibitorId]
│           ├── /org/events/[eventId]/reports
│           └── /org/events/[eventId]/settings
├── /exhibit/[organizationId] (Exhibitor portal)
│   ├── /exhibit/[organizationId]/attendees
│   ├── /exhibit/[organizationId]/ai-insights
│   ├── /exhibit/[organizationId]/dashboard
│   ├── /exhibit/[organizationId]/dashboard/[eventExhibitorId]
│   ├── /exhibit/[organizationId]/documents
│   ├── /exhibit/[organizationId]/forms
│   ├── /exhibit/[organizationId]/qr
│   ├── /exhibit/[organizationId]/relationships
│   ├── /exhibit/[organizationId]/relationships/[relationshipId]
│   ├── /exhibit/[organizationId]/settings
│   └── /exhibit/[organizationId]/team
├── /e/[eventSlug] (Attendee event)
│   ├── /e/[eventSlug]/exhibitors
│   ├── /e/[eventSlug]/exhibitors/[exhibitorId]
│   ├── /e/[eventSlug]/exhibitors/[exhibitorId]/insights
│   └── /e/[eventSlug]/saved
└── /visit/[publicQrToken] (Booth visit via QR)
```

### Navigation Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `ConsoleNav` | `(console)/console-nav.tsx` | Organizer sidebar |
| `Sidebar` | `(portal)/exhibit/[organizationId]/_components/sidebar.tsx` | Exhibitor sidebar |
| `DemoTopBar` | `components/demo/shell.tsx` | Demo mode header with persona switcher |
| `DemoSideNav` | `components/demo/shell.tsx` | Demo mode sidebar |
| `DemoMobileNav` | `components/demo/shell.tsx` | Demo mode mobile tabs |
| `EventNav` | `(console)/org/events/[eventId]/event-nav.tsx` | Event sub-navigation |
| `AttendeeLayout` | `(attendee)/layout.tsx` | Bottom tab bar for attendee |

### Breadcrumb Components

| Component | Location | Coverage |
|-----------|----------|----------|
| `Breadcrumbs` | `packages/ui` | Basic UI component |
| `UnifiedBreadcrumbs` | `components/navigation/unified-breadcrumbs.tsx` | NEW: Unified across all routes |

---

## Issues Identified

### Before Implementation

1. **Inconsistent Breadcrumbs** - Only one page (`/org/events/[eventId]`) used breadcrumbs
2. **No Global Search** - Users had no quick navigation shortcut
3. **No Back Button Pattern** - Ad-hoc back links instead of consistent system
4. **Demo Parity** - Demo navigation was completely separate from production
5. **No Clear Next Actions** - Pages didn't consistently indicate what to do next
6. **Duplicated Sidebar Logic** - `SIDEBAR` arrays duplicated across demo pages
7. **Complex Active State Logic** - Exhibitor sidebar mixed pathname + query param handling

### Flow Diagrams

#### Organizer Flow (Before)
```
/org → Dashboard (no breadcrumbs)
/org/events → Events List (no breadcrumbs)
/org/events/[id] → Event Detail (breadcrumbs only here)
```

#### Exhibitor Flow (Before)
```
/exhibit/[orgId] → Dashboard (no breadcrumbs)
/exhibit/[orgId]/attendees → Attendees (no breadcrumbs)
/exhibit/[orgId]/dashboard → Dashboard (no breadcrumbs)
```

#### Demo Flow (Before)
```
/demo → Demo Hub (no breadcrumbs)
/demo/organizer → Dashboard (DemoTopBar only)
/demo/exhibitor → Picker (DemoTopBar only)
```

---

## Proposed Information Architecture

### Unified Hierarchy

```
Home
└── Experience ExAi
    ├── Organizer
    │   ├── Dashboard
    │   ├── Events
    │   ├── Analytics
    │   ├── AI Insights
    │   ├── Reports
    │   └── Heatmaps
    ├── Exhibitor
    │   ├── Dashboard
    │   ├── Products
    │   ├── Visitors
    │   ├── Analytics
    │   ├── AI Insights
    │   └── QR
    └── Attendee (Hackathon)
        ├── Browse
        ├── Saved
        └── Profile
```

### Production Hierarchy

```
Organizer Console
├── Dashboard
├── Events
│   ├── Overview
│   ├── Exhibitors
│   ├── Reports
│   └── Settings
├── Users
├── Analytics
└── Settings

Exhibitor Portal
├── Dashboard
├── Attendees
├── AI Insights
├── Knowledge
├── Lead Form
├── Booth QR
└── Booth Settings
```

---

## Implemented Improvements

### 1. Unified Breadcrumb System

**File:** `components/navigation/unified-breadcrumbs.tsx`

- Single component works across all routes (console, portal, attendee, demo)
- Pattern-based matching handles dynamic routes
- Breadcrumb config for each section:
  - `/org/*` - Organizer console breadcrumbs
  - `/exhibit/*` - Exhibitor portal breadcrumbs
  - `/e/*` - Attendee breadcrumbs
  - `/demo/*` - Demo breadcrumbs

**Example Output:**
```
Home > Experience ExAi > Organizer > Dashboard
Home > Experience ExAi > Exhibitor > Booth
```

### 2. Global Command Palette

**File:** `components/navigation/command-palette.tsx`

- Opens with `Ctrl+K` / `Cmd+K`
- Quick navigation to:
  - Home (`/`)
  - Experience ExAi (`/demo`)
  - Organizer Workspace (`/demo/organizer`)
  - Exhibitor Workspace (`/demo/exhibitor`)
  - Attendee Experience (`/hackathon`)
  - Admin Panel (`/demo/admin`)
  - Sign In (`/auth`)
- Keyboard navigation (arrows, enter, escape)
- Grouped by category

### 3. Consistent Layout Integration

Updated layouts to include breadcrumbs and command palette:

| Layout | Breadcrumbs | Command Palette |
|--------|-------------|-----------------|
| `(console)/layout.tsx` | ✅ | ✅ |
| `(portal)/exhibit/[organizationId]/layout.tsx` | ✅ | ✅ |
| `demo/organizer/layout.tsx` | ✅ | ✅ |
| `demo/exhibitor/page.tsx` | ✅ | ✅ |
| `demo/exhibitor/[eventExhibitorId]/page.tsx` | ✅ | ✅ |

### 4. Back Button Component

**File:** `components/navigation/back-button.tsx`

- `BackButton` - Context-aware back navigation
- Uses browser history when available
- Falls back to provided `href`
- `NextAction` - Clear primary action CTA for each page

---

## Confusing Journeys (Before/After)

### Journey 1: Demo Organizer → Exhibitor

**Before:** Click "Switch perspective" → `/demo` → Click "Exhibitor" card → `/demo/exhibitor`

**After:** Same path, but now with breadcrumbs showing:
`Experience ExAi > Exhibitor`

### Journey 2: Event Detail → Exhibitor Detail

**Before:** No breadcrumbs to show context

**After:**
`Dashboard > Events > TechExpo 2027 > Exhibitors > Brightline AI`

### Journey 3: Booth Visit Return

**Before:** No way to navigate back to event context

**After:** Breadcrumbs always show location: `Events > TechExpo 2027 > Exhibitors > Brightline AI`

---

## Dead Ends (Identified & Resolved)

1. **`/demo/exhibitor/[id]/booth`** - Pointed to `/visit/[token]` but had no breadcrumb back context
   - **Fix:** Added breadcrumb support in exhibitor detail page

2. **`/exhibit/[orgId]/dashboard/[eeId]`** - Nested booth dashboard with no clear navigation path
   - **Fix:** Breadcrumbs show `Dashboard > Booth` with context

---

## Remaining Recommendations

### High Priority

1. **Attendee Breadcrumb Integration** - The `(attendee)/layout.tsx` currently only shows bottom tab bar. Consider adding breadcrumbs for deep navigation (`/e/[slug]/exhibitors/[id]/insights`).

2. **Next Action Consistency** - Not all pages have clear "next action" CTAs. Audit:
   - Organizer event detail → should say "View Exhibitors" or "Generate Report"
   - Exhibitor dashboard → should say "View Visitors" or "Open Booth Preview"

3. **Persona Context Preservation** - When switching between demo personas, preserve the current event/organization context where possible.

### Medium Priority

1. **Mobile Command Palette** - The command palette works on mobile but may need touch-optimized keyboard navigation.

2. **Breadcrumb Ellipsis** - For very deep hierarchies (4+ levels), consider adding ellipsis for truncation.

3. **Demo → Production Transition** - When a user signs in from demo, preserve their demo context (which event/organization they were viewing).

### Low Priority

1. **Search Integration** - The command palette only navigates to pages. Future: integrate search for exhibitors, products, reports.

2. **Recent Pages** - Track and display recently visited pages for quick re-access.

---

## Files Changed

### New Files

- `apps/web/src/components/navigation/unified-breadcrumbs.tsx` - Unified breadcrumb system
- `apps/web/src/components/navigation/command-palette.tsx` - Global search (Ctrl+K)
- `apps/web/src/components/navigation/back-button.tsx` - Back/Next action components
- `apps/web/src/components/navigation/index.ts` - Barrel exports

### Modified Files

- `apps/web/src/app/(console)/layout.tsx` - Added breadcrumbs + command palette
- `apps/web/src/app/(portal)/exhibit/[organizationId]/layout.tsx` - Added breadcrumbs + command palette
- `apps/web/src/app/demo/organizer/layout.tsx` - Added breadcrumbs + command palette header
- `apps/web/src/app/demo/exhibitor/page.tsx` - Added breadcrumbs + command palette
- `apps/web/src/app/demo/exhibitor/[eventExhibitorId]/page.tsx` - Added DemoTopBar + breadcrumbs + command palette
- `packages/ui/src/index.ts` - Re-exports for navigation components (existing)

---

## Testing Checklist

- [ ] `/org` - Dashboard breadcrumb shows "Dashboard"
- [ ] `/org/events` - Breadcrumb shows "Dashboard > Events"
- [ ] `/org/events/[id]` - Breadcrumb shows "Dashboard > Events > Event Name"
- [ ] `/exhibit/[orgId]` - Breadcrumb shows "Dashboard"
- [ ] `/exhibit/[orgId]/attendees` - Breadcrumb shows "Dashboard > Attendees"
- [ ] `/demo/organizer` - Breadcrumb shows "Experience ExAi > Organizer > Dashboard"
- [ ] `/demo/exhibitor` - Breadcrumb shows "Experience ExAi > Exhibitor"
- [ ] `Ctrl+K` - Opens command palette from any page
- [ ] Arrow keys navigate command palette items
- [ ] Enter selects command palette item
- [ ] Escape closes command palette
- [ ] Mobile navigation remains functional

---

## Commit

```
feat(navigation): redesign navigation architecture and user flow

- Implement unified breadcrumb system across all routes (console, portal, attendee, demo)
- Add global command palette with Ctrl+K keyboard shortcut for quick navigation
- Add consistent breadcrumbs and command palette to all layout sections
- Add BackButton and NextAction components for clear navigation patterns
- Update console, portal, and demo layouts to include navigation improvements
```

---

*Generated by opencode on July 21, 2026*
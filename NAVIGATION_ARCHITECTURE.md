# Navigation Architecture — ExAi

**Date:** July 22, 2026
**Status:** Proposed Redesign

---

## Current Problems

1. **Three navigation systems compete** — GlobalNav (top), ConsoleNav sidebar (left), breadcrumbs (inline) all answer "Where am I?"
2. **Four active-state indicators** — left-border, bottom-border, background-fill, text-only
3. **Dead links** — 6 navigation links point to non-existent pages
4. **Hidden pages** — 5 pages unreachable from any navigation
5. **Different shells** — attendee experience has 3 different navigation shells
6. **No back navigation** — 5 different implementations of "go back"

---

## Design Philosophy

### ONE Navigation Philosophy

```
Global Navigation (top)
        ↓
Workspace Navigation (left)
        ↓
Page Content + Breadcrumb
```

**Only one navigation level visible at a time.** When a user is in a workspace, they see the workspace sidebar. When browsing content, they see breadcrumbs. Never both at full strength simultaneously.

### Principles

1. **Where am I?** — One clear indicator, never duplicated
2. **What can I do?** — Primary actions visible; secondary in menus
3. **How do I go back?** — Consistent back pattern, never hidden

### Navigation Must Never

- Show the same information in two places simultaneously
- Use different active-state indicators at different levels
- Link to pages that don't exist
- Hide pages that do exist
- Change visual language between sections of the same product

---

## Proposed Structure

### Level 1: Global Navigation (Top)

**Purpose:** Switch between major product perspectives (not pages within a perspective)

**Visibility:** Always visible on all pages

**Contents:**
- Logo (links to `/` for marketing, `/demo` for authenticated)
- Perspective switcher: Experience | Organizer | Exhibitor | Attendee
- User actions: Sign in / User menu

**Behavior:**
- Clicking a perspective navigates to that perspective's home
- Active perspective highlighted (single style, consistent)
- User menu opens dropdown for profile, settings, sign out

**NOT in Global Navigation:**
- Breadcrumbs (moved to page level)
- Workspace switcher (each perspective has ONE active workspace)
- Secondary nav links

### Level 2: Workspace Navigation (Left Sidebar)

**Purpose:** Navigate within the current perspective/workspace

**Visibility:** Visible only in authenticated workspaces (Organizer, Exhibitor)

**Contents per perspective:**

**Organizer (`/org/*`):**
- Dashboard
- Events
- Analytics
- Reports
- Settings

**Exhibitor (`/exhibit/[orgId]/*`):**
- Dashboard
- Visitors
- AI Insights
- Products
- Team
- Settings

**Attendee (`/e/*`):**
- No sidebar (mobile-first, bottom tabs sufficient)

**Behavior:**
- Collapsed by default on tablet, visible on desktop
- Active item highlighted with consistent indicator (left border, 2px brand color)
- Section groupings with subtle headers (not visual separators)
- Secondary links at bottom (Help, Documentation)

### Level 3: Page Context (Breadcrumbs)

**Purpose:** Orient user within the workspace hierarchy

**Visibility:** Visible at top of content area on all pages

**Format:**
```
Perspective > Section > Page
```

**Examples:**
- `Organizer > Events > TechExpo 2027`
- `Exhibitor > Visitors > Sarah Chen`
- `Attendee > Browse > TechExpo 2027`

**NOT in Breadcrumbs:**
- Page titles (already visible in h1)
- Action links
- Filters or controls

### Level 4: Action Navigation (Within Page)

**Purpose:** Navigate between related views of the same entity

**Visibility:** Horizontal tabs, only when a page has sub-views

**Format:**
```
Overview | Exhibitors | Reports | Settings
```

**Behavior:**
- Used only for **same-level sibling pages** (e.g., event tabs)
- NOT used for parent-child relationships (those use breadcrumbs)
- Sticky when scrolling, but only within the content area

### Level 5: Inline Navigation (Back)

**Purpose:** Return to previous context

**Visibility:** Contextual, only when deeper in hierarchy

**Format:** `← Back to [Previous Page Name]`

**Behavior:**
- Appears only when user has navigated into a sub-page
- Points to parent page, not arbitrary previous URL
- NOT shown on top-level pages of a perspective

---

## Unified Active-State Indicator

**All navigation levels use the same active indicator:**

```
Background: bg-brand-subtle (light purple tint)
Text: text-brand (purple)
Left border: 2px solid border-brand (2px left border)
```

**No other active states allowed.** This means:
- ConsoleNav: remove `border-l-2 border-brand`, use background instead
- EventNav tabs: remove `border-b-2 border-brand`, use background instead
- GlobalNav perspectives: current behavior is correct, keep it

---

## Component Specifications

### GlobalNav

**File:** `apps/web/src/components/navigation/global-nav.tsx`

**Variants:**
- `marketing` — For public marketing pages, no user menu
- `authenticated` — For workspace pages, shows user menu

**States:**
- Default: transparent background, visible on scroll
- Scrolled: `bg-canvas/85 backdrop-blur-xl border-b border-default/50`

**Responsive:**
- Desktop: perspective switcher + user menu
- Mobile: hamburger menu with slide-out drawer

### WorkspaceNav (Sidebar)

**File:** `apps/web/src/components/navigation/workspace-nav.tsx`

**New name:** `WorkspaceNav` (replaces `ConsoleNav`, `sidebar`)

**Structure:**
```tsx
interface NavItem {
  id: string;
  label: string;
  href: string;
  icon?: ReactNode;
  badge?: string | number; // Optional count
}

interface NavSection {
  title?: string;
  items: NavItem[];
}
```

**States:**
- Collapsed: icon only with tooltip
- Expanded: icon + label
- Active item: background + left border

**Responsive:**
- Desktop (≥1024px): always visible, 240px width
- Tablet (768-1023px): collapsed to icons only, expandable
- Mobile (<768px): hidden, accessible via hamburger

### Breadcrumbs

**File:** `apps/web/src/components/navigation/breadcrumbs.tsx`

**Consolidate:** Merge `UnifiedBreadcrumbs` with inline breadcrumb logic

**Format:** `Perspective > Section > Page`

**Behavior:**
- Clickable links for parent levels
- Current page is plain text (not a link)
- Truncate middle items on overflow with `…`

### PageTabs

**New component:** `apps/web/src/components/navigation/page-tabs.tsx`

**Replace:** EventNav, any horizontal tab navigation

**Structure:**
```tsx
interface Tab {
  id: string;
  label: string;
  href: string;
  count?: number;
}
```

**Behavior:**
- Sticky below breadcrumbs when scrolling
- Active tab: background + bottom border (same style as active nav items)
- Badge counts for notification states

### BackLink

**New component:** `apps/web/src/components/navigation/back-link.tsx`

**Format:** `← Back to [label]`

**Props:**
```tsx
interface BackLinkProps {
  label: string;        // e.g., "Events" or "Sarah Chen"
  href?: string;        // Optional override, defaults to parent
}
```

---

## Page Structure Templates

### Authenticated Page (Organizer/Exhibitor)

```
┌─────────────────────────────────────────────────────────────┐
│ GlobalNav                                                   │
├──────────────┬──────────────────────────────────────────────┤
│              │ Breadcrumbs: Organizer > Events > TechExpo   │
│  Workspace   ├──────────────────────────────────────────────┤
│  Nav         │                                              │
│              │ PageTabs: Overview | Exhibitors | Reports     │
│  - Dashboard │──────────────────────────────────────────────│
│  - Events    │                                              │
│  - Analytics │              Page Content                    │
│  - Reports   │                                              │
│  - Settings  │                                              │
│              │                                              │
└──────────────┴──────────────────────────────────────────────┘
```

### Public Page (Attendee Directory)

```
┌─────────────────────────────────────────────────────────────┐
│ GlobalNav (compact)                                          │
├─────────────────────────────────────────────────────────────┤
│ Breadcrumbs: Attendee > TechExpo 2027                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                    Page Content                             │
│                    (no sidebar)                             │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ Bottom Tabs: Browse | Saved | Profile                        │
└─────────────────────────────────────────────────────────────┘
```

### Booth Experience (Unique Context)

```
┌─────────────────────────────────────────────────────────────┐
│ Minimal header: ← Back to Exhibition                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                    Booth Experience                          │
│                    (standalone context)                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Navigation by Route

### Marketing Routes (`/`)

| Route | GlobalNav | Sidebar | Breadcrumbs | PageTabs |
|-------|-----------|---------|-------------|----------|
| `/` | marketing | none | none | none |
| `/demo` | authenticated | none | none | none |

### Organizer Routes (`/org/*`)

| Route | GlobalNav | Sidebar | Breadcrumbs | PageTabs |
|-------|-----------|---------|-------------|----------|
| `/org` | authenticated | Dashboard active | Organizer > Dashboard | none |
| `/org/events` | authenticated | Events active | Organizer > Events | none |
| `/org/events/[id]` | authenticated | Events active | Organizer > Events > [Event] | Overview Exhibitors Reports Settings |
| `/org/analytics` | authenticated | Analytics active | Organizer > Analytics | none |
| `/org/settings` | authenticated | Settings active | Organizer > Settings | none |

### Exhibitor Routes (`/exhibit/[orgId]/*`)

| Route | GlobalNav | Sidebar | Breadcrumbs | PageTabs |
|-------|-----------|---------|-------------|----------|
| `/exhibit/[orgId]/dashboard/[eeId]` | authenticated | Dashboard active | Exhibitor > [Booth] | none |
| `/exhibit/[orgId]/attendees` | authenticated | Visitors active | Exhibitor > Visitors | none |
| `/exhibit/[orgId]/relationships/[id]` | authenticated | Visitors active | Exhibitor > Visitors > [Name] | none |
| `/exhibit/[orgId]/ai-insights` | authenticated | AI Insights active | Exhibitor > AI Insights | none |
| `/exhibit/[orgId]/settings` | authenticated | Settings active | Exhibitor > Settings | none |

### Attendee Routes (`/e/*`)

| Route | GlobalNav | Sidebar | Breadcrumbs | PageTabs |
|-------|-----------|---------|-------------|----------|
| `/e/[event]` | compact | none | Attendee > [Event] | Browse Saved Profile |
| `/e/[event]/saved` | compact | none | Attendee > [Event] > Saved | Browse Saved Profile |
| `/e/[event]/exhibitors/[id]` | compact | none | Attendee > [Event] > [Exhibitor] | Browse Saved Profile |
| `/visit/[token]` | minimal | none | none | none |

### Demo Routes (`/demo/*`)

| Route | GlobalNav | Sidebar | Breadcrumbs | PageTabs |
|-------|-----------|---------|-------------|----------|
| `/demo` | authenticated | none | Experience | none |
| `/demo/organizer/*` | authenticated | same as org | Experience > Organizer > [Page] | same as org |
| `/demo/exhibitor/*` | authenticated | same as exhibitor | Experience > Exhibitor > [Page] | same as exhibitor |

---

## Component Migration

### Replace
- `ConsoleNav` → `WorkspaceNav` (new, unified)
- `sidebar.tsx` (exhibitor) → `WorkspaceNav` (same component, different config)
- `EventNav` → `PageTabs` (new component)
- Inline breadcrumbs → `Breadcrumbs` (new component)
- Inline back links → `BackLink` (new component)

### Update
- `GlobalNav` — consolidate variants, ensure consistent behavior
- `unified-breadcrumbs.tsx` — simplify to generic breadcrumb component

### Delete
- `workspace-switcher.tsx` — unnecessary complexity
- `back-button.tsx` — replaced by `BackLink`

---

## Implementation Notes

### Sidebar Width
- Collapsed: 64px (icon only)
- Expanded: 240px (icon + label)
- Store preference in localStorage

### Mobile Behavior
- Sidebar becomes slide-out drawer triggered by hamburger
- Bottom tabs replace sidebar for attendee experience
- `visit/*` keeps minimal header (already correct)

### Keyboard Navigation
- `Ctrl+K` opens command palette (already implemented)
- `Esc` closes modals/drawers
- Arrow keys navigate within sidebar/tabs

### Animation
- Sidebar expand/collapse: 200ms ease-out
- Tab underline transition: 150ms ease
- Page transitions: fade 100ms
- No animation for decoration

---

## Verification Checklist

After implementation, verify:

- [ ] No page has more than one "where am I" indicator
- [ ] All active states use the same visual treatment (background + left border)
- [ ] All navigation links point to existing pages
- [ ] All existing pages are reachable from navigation
- [ ] Back navigation is consistent and always available
- [ ] Breadcrumbs match actual navigation hierarchy
- [ ] Mobile experience is complete (no dead interactions)
- [ ] Keyboard navigation works throughout
- [ ] Focus states are visible on all interactive elements
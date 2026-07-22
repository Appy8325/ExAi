# UX Audit — ExAi

**Date:** July 22, 2026
**Status:** Draft
**Scope:** All user-facing screens across Marketing, Organizer Console, Exhibitor Portal, and Attendee Experience

---

## Executive Summary

ExAi suffers from **accidental design** — features were built to work, not to create a coherent experience. Every screen has good intentions, but the cumulative effect is cognitive overload, navigation confusion, and visual inconsistency. Users must re-orient themselves on every page. The product feels like multiple products merged together rather than one intentional system.

### Critical Findings

| Issue | Severity | Occurrences |
|-------|----------|-------------|
| Navigation duplication (3-4 elements per page telling user where they are) | Critical | 40+ pages |
| Multiple active-state indicators per page | Critical | All console/portal pages |
| Inconsistent content width containers | High | 15+ pages |
| Mixed form patterns (PageHeader vs text-title vs inline) | High | 20+ pages |
| KPI/Metric component fragmentation (KPICard vs MetricCard) | High | 8+ pages |
| Dead navigation links (links to non-existent pages) | High | 6+ links |
| Cognitive overload on dashboards (7+ competing elements) | High | All dashboards |
| Inconsistent empty states (4+ different styles) | Medium | 10+ pages |
| Auth-gated silent failures | Medium | 5+ features |
| Broken navigation hierarchy (missing parent links) | Medium | 4+ pages |

---

## Section 1: Marketing & Landing

### Routes Audited
- `/` — Landing page
- `/demo` — Demo hub

### User Goal
First-time visitors need to understand what ExAi is and enter the product demo. Returning users need to sign in.

### Findings

#### 1.1 Landing Page (`/`)

| Aspect | Finding |
|--------|---------|
| **Elements competing for attention** | 5 elements in hero (badge, H1, subheadline, 2 CTAs, SVG visual), persona section, live stats, how-it-works, CTA repeat |
| **Cognitive load** | Two equally-prominent CTAs ("Try live demo" vs "Sign in"); 4 sections before first fold |
| **Primary action** | "Try live demo" — but visually similar to secondary |
| **Distraction** | Live metrics widget polls every 6s and shows "Simulation stopped" on failure with no explanation |

**Inconsistencies:**
- Persona cards: "Organizer" → `/demo/organizer`, "Exhibitor" → `/demo`, "Attendee" → `/demo` (broken links)
- Hero SVG labels use hardcoded `fontSize="12"` instead of design tokens
- CTASection repeats the hero CTA verbatim (redundant)
- "View attendee demo" links to `/demo` but `/demo/attendee` exists

#### 1.2 Demo Hub (`/demo`)

| Aspect | Finding |
|--------|---------|
| **User goal** | Select a demo perspective (Organizer, Exhibitor, Attendee) |
| **Elements** | 3 large cards with icons, titles, descriptions, CTA buttons |
| **Cognitive load** | Low — single decision |
| **Inconsistency** | Cards use different visual treatments; "Organizer" card is larger/higher contrast than others |

---

## Section 2: Organizer Console

### Routes Audited
- `/org` — Dashboard
- `/org/events` — Events list
- `/org/events/[eventId]` — Event overview
- `/org/events/[eventId]/exhibitors` — Exhibitor management
- `/org/events/[eventId]/reports` — Reports
- `/org/events/[eventId]/settings` — Event settings
- `/org/analytics` — Analytics
- `/org/users` — Team management
- `/org/settings` — Org settings

### Navigation Architecture (Current — Problematic)

```
GlobalNav (top) ← "Experience ExAi | Organizer | Exhibitor | Attendee | Sign in"
    ↓
ConsoleNav sidebar (left, 240px) ← "Dashboard | Events | Analytics | AI Insights | Reports | Settings"
    ↓
Content area
    ├── UnifiedBreadcrumbs (top) ← "Organizer > Dashboard"
    └── Page content
        └── EventNav tabs (within event pages) ← "Overview | Exhibitors | Reports | Settings"
```

**4 navigation layers** answering the same question ("Where am I?") simultaneously.

### Per-Page Findings

#### 2.1 Dashboard (`/org`)

| Element | Issue |
|---------|-------|
| 4 KPI cards | Visual weight similar — no hierarchy indicating which matters most |
| Events section | Name + status + exhibitor count — but status capitalization inconsistent (Draft vs live) |
| "View all" link | Competes with individual event clicks |
| Breadcrumb + sidebar | Both show "Dashboard" — duplication |

**Primary action:** Click an event. But 4 KPI cards distract from this goal.

#### 2.2 Events List (`/org/events`)

| Element | Issue |
|---------|-------|
| CreateEventForm | Always visible, takes prime real estate even after events exist |
| Event cards | Status capitalization inconsistency; mixed `capitalize` vs `Intl.DateTimeFormat` |
| Form header | Uses `text-title` instead of `PageHeader` component |

**Primary action:** Create event or manage existing. Form placement dominates.

#### 2.3 Event Overview (`/org/events/[eventId]`)

| Element | Issue |
|---------|-------|
| 3 KPI cards + 4 action buttons | 7 elements in first viewport |
| PublishEventButton | Conditionally renders different states — confusing |
| Breadcrumb + sidebar + EventNav tabs | **3 active indicators** for same location |
| Active-state inconsistency | ConsoleNav: left-border indicator; EventNav: bottom-border indicator |

#### 2.4 Exhibitors (`/org/events/[eventId]/exhibitors`)

| Element | Issue |
|---------|-------|
| InviteExhibitorForm + table | Two data groupings competing |
| Raw `<select>` for role | Not design-system component |
| Different patterns | Invitations use plain `div`; accepted exhibitors use `Table` |

#### 2.5 Analytics (`/org/analytics`)

| Element | Issue |
|---------|-------|
| Event filter pills | Prominent but visually compete with content |
| 4 KPI cards + heatmap + engagement + 2 breakdowns | 9 metrics on one page |
| "Executive report" link | Different visual style than primary actions |

**Cognitive overload:** No progressive disclosure. Everything visible at once.

#### 2.6 Reports (`/org/events/[eventId]/reports`)

| Element | Issue |
|---------|-------|
| MetricCard vs KPICard | Uses `MetricCard` while other pages use `KPICard` — different visual treatment |
| Empty state | Large but not actionable |
| Metric cards vs AI report | Relationship implied but not explained |

#### 2.7 Settings Pages

| Page | Issue |
|------|-------|
| Event settings | Native `<input type="color">` bypasses design system; slug field monospace |
| Org settings | Display-only with no actions — unclear purpose |
| `/org/events/[eventId]/documents` | **Dead link** — no navigation to this page; placeholder content |

### Cross-Cutting Issues (Organizer Console)

1. **Dead nav links:** `/org/ai-insights` and `/org/reports` linked in ConsoleNav but no pages exist
2. **Active state inconsistency:** ConsoleNav uses left-border; EventNav uses bottom-border; GlobalNav uses background-fill
3. **Content width inconsistency:** Some pages `max-w-7xl`, others `max-w-(--mq-content-max-narrow)`
4. **Mixed form headers:** `PageHeader` component vs. `text-title` styled divs

---

## Section 3: Exhibitor Portal

### Routes Audited
- `/exhibit` — Workspace selector
- `/exhibit/[orgId]/dashboard/[eeId]` — Dashboard
- `/exhibit/[orgId]/attendees` — Visitors list
- `/exhibit/[orgId]/relationships/[relId]` — Relationship workspace
- `/exhibit/[orgId]/settings` — Booth settings
- `/exhibit/[orgId]/qr` — QR codes
- `/exhibit/[orgId]/forms` — Lead form editor
- `/exhibit/[orgId]/documents` — Knowledge sources
- `/exhibit/[orgId]/ai-insights` — AI insights
- `/exhibit/[orgId]/team` — Team (empty)

### Navigation Architecture (Current — Problematic)

```
GlobalNav (top) ← Perspective switcher
    ↓
Sidebar (left, desktop only) ← Dashboard | Visitors | Analytics | AI Assistant | Products | Knowledge | Settings
    ↓
Content area + UnifiedBreadcrumbs
```

**Issues:**
- Sidebar links to Analytics, AI Assistant, Products, Knowledge — **none of these pages exist** (404)
- Pages exist for QR, Forms, Documents, Team — **not in sidebar** (must use Quick Actions or direct URL)
- "Visitors" in sidebar vs "Attendees" in page content — naming split
- Exhibitor badge in layout header duplicates "Exhibitor" in GlobalNav

### Per-Page Findings

#### 3.1 Dashboard (`/exhibit/[orgId]/dashboard/[eeId]`) — HIGHEST COGNITIVE LOAD

| Element | Count | Issue |
|---------|-------|-------|
| KPI cards | 7 | Shown simultaneously with no hierarchy |
| Quick Actions | 5 | Buttons that duplicate sidebar navigation |
| Relationship Pipeline | 4 columns | Color-coded but colors differ from attendee list |
| Recent Activity | Feed | Long list without prioritization |
| AI Insights panel | Summary | Duplicates the `/ai-insights` page |
| Requires Attention | List | Only actionable items buried in middle |

**"Live" badge** suggests real-time data but data is server-rendered with `cache: "no-store"` — no actual live updating.

**Scoring fragmentation:** Three different `computeScore()` functions across three views produce incompatible scores.

#### 3.2 Attendees (`/exhibit/[orgId]/attendees`)

| Element | Issue |
|---------|-------|
| Score visualization | 1.5px × 48px progress bar — too small |
| Sidebar "Visitors" vs page "Attendees" | Naming confusion |
| Status color mismatch | Dashboard: returning=purple; Attendee list: returning=info(blue) |

#### 3.3 Relationship Workspace (`/exhibit/[orgId]/relationships/[relId]`)

| Element | Issue |
|---------|-------|
| 4 metric boxes + AI panel + timeline + notes | Multiple interaction zones |
| Notes panel | Separate component, 22rem wide — feels detached |
| AI Lead Intelligence | Rich content in `<details>` — users may not discover |

**Score function** produces different result than attendee list for same person.

#### 3.4 Other Portal Pages

| Page | Issues |
|------|--------|
| Settings | `max-w-(--mq-content-max-narrow)` vs dashboard `max-w-7xl`; breadcrumb shows event name differently |
| QR | "Test QR" label confusing; only accessible via Quick Actions |
| Forms | `max-w-(--mq-content-max-narrow)`; field editor `key` field confusing |
| Documents | `status.replaceAll("_", " ")` produces inconsistent capitalization |
| Team | **Completely empty** — only shows current user's email |
| AI Insights | Content duplicates dashboard AI panel — where is the source of truth? |

### Cross-Cutting Issues (Exhibitor Portal)

1. **4 dead sidebar links** → Analytics, AI Assistant, Products, Knowledge (404)
2. **5 pages unreachable from sidebar** → QR, Forms, Documents, Team, Relationships
3. **Score system fragmentation** — 3 incompatible algorithms
4. **Status color inconsistency** across 3+ pages
5. **Content width inconsistency** — 3 different max-width values
6. **"Live" badge** misrepresents data freshness
7. **Quick Actions** duplicates sidebar navigation

---

## Section 4: Attendee Experience

### Routes Audited
- `/hackathon` — Event landing
- `/hackathon/expo` — Expo floor
- `/e/[eventSlug]` — Exhibitor directory
- `/e/[eventSlug]/saved` — Saved exhibitors
- `/e/[eventSlug]/exhibitors/[id]` — Exhibitor profile
- `/e/[eventSlug]/exhibitors/[id]/insights` — Booth briefing
- `/visit/[publicQrToken]` — Booth experience (AI chat + lead)
- `/account/profile` — Profile management

### Navigation Architecture (Current — Fragmented)

Three completely different navigation shells within attendee experience:

| Route | Top Nav | Bottom Tabs | Custom Header |
|-------|---------|-------------|---------------|
| `/hackathon*` | GlobalNav | None | Banner |
| `/e/*` | GlobalNav (compact) | Browse/Saved/Profile | None |
| `/visit/*` | **Minimal back+home only** | None | Different shell |

The `isVisitPage` conditional in layout swaps nav shells — creates jarring transitions.

### Per-Page Findings

#### 4.1 Hackathon Landing (`/hackathon`)

| Element | Issue |
|---------|-------|
| 5+ focal points in hero | QR, headline, CTA, journey steps (emoji icons), stats |
| Emoji icons mixed with SVG | Visual inconsistency |
| "Live" metrics labeled "(Demo)" | Contradictory |

#### 4.2 Expo Floor (`/hackathon/expo`)

| Element | Issue |
|---------|-------|
| QR for "Event Entrance" on expo page | User scans and ends up on landing — not expo |
| "Visit Booth" AND "AI Chat at Booth" | Two buttons, same destination |

**Gradient color maps** differ between `landing-client.tsx` and `showcase-client.tsx` for identical industries.

#### 4.3 Exhibitor Directory (`/e/[eventSlug]`)

| Element | Issue |
|---------|-------|
| Featured + All sections | Two layouts simultaneously |
| Card shows logo/name/booth only | No industry or description for quick assessment |
| Search uses `@concourse/ui` Input | Native input on hackathon pages — inconsistent |

#### 4.4 Exhibitor Profile (`/e/[eventSlug]/exhibitors/[id]`)

| Element | Issue |
|---------|-------|
| Heart icon save + "Connect" button | Same action, two controls |
| "Ask AI" vs "View booth briefing" | Conditional logic hidden from user |
| Heart → silent failure without auth | No feedback on auth error |

#### 4.5 Booth Experience (`/visit/[publicQrToken]`) — MOST COMPLEX FLOW

| Element | Issue |
|---------|-------|
| 6-step flow with no step indicator | Landing → Email → MagicLinkSent → Profile → Form → Success |
| Magic link flow | User context-switches to email app with no progress indication |
| AI Chat always visible | Two parallel interaction zones (chat + multi-step form) |
| Custom minimal header | Different shell from entire rest of app |
| No bottom tab bar | Sub-page behavior but looks like different product |

#### 4.6 Profile (`/account/profile`)

| Element | Issue |
|---------|-------|
| Unauthenticated → sign-in prompt | Only page with explicit auth handling |
| Profile fields duplicated in booth experience | User enters same data twice |

### Cross-Cutting Issues (Attendee)

1. **3 navigation shells** — jarring transitions between sections
2. **5 different back-navigation implementations**
3. **4 different empty state styles**
4. **3 different search implementations**
5. **3 different card hover effects**
6. **Silent auth failures** on save/connect
7. **Hardcoded `COMPANY_QUESTIONS`** for only 10 companies
8. **Gradient maps** — different colors for same industries in different files

---

## Section 5: Demo System

### Routes Audited
- `/demo` — Demo hub
- `/demo/organizer/*` — Organizer demo
- `/demo/exhibitor/*` — Exhibitor demo
- `/demo/attendee` — Attendee demo
- `/demo/admin` — Admin simulation

### Issues

1. **Shell duplication** — Demo pages use `DemoPageHeader`, `SimulationStatusBadge`, `LiveMetricsBar` which replicate console/portal layouts but with demo-specific chrome
2. **DemoTopBar/DemoSideNav removed** but shell.tsx still references these concepts
3. **Breadcrumb format inconsistency** — Demo uses "Experience > Organizer > Events" format
4. **Demo exhibitor sidebar** created but not integrated consistently

---

## Section 6: Component Inconsistencies

### Buttons
- `Button` component with `variant` prop
- Inline styled buttons with `className` combinations
- Form submit buttons with `bg-brand` directly
- Various sizes: `h-9`, `h-10`, `h-12`

### Cards
- `@concourse/ui` `Card` with various `className` overrides
- Custom card components with different shadow/border treatments
- `border-dashed` empty states vs `border-solid`
- 4+ different card hover effects

### Typography
- `text-title` vs `text-title-sm` vs `text-xl`
- `text-caption` vs `text-body-sm`
- Hardcoded values mixed with design tokens
- Heading hierarchy inconsistent across pages

### Spacing
- `p-4`, `p-6`, `p-8`, `px-4`, `py-2`, etc.
- No consistent scale adherence
- Inconsistent gutters between sections

### Borders
- Heavy `border border-default` everywhere
- Some pages use `border-0` to remove
- Radius inconsistent: `rounded-lg`, `rounded-md`, `rounded-xl`

### Colors
- Semantic tokens (`text-secondary`, `bg-surface`) mixed with raw colors (`text-gray-500`, `bg-white`)
- Inconsistent accent colors across components

---

## Section 7: Accessibility Issues

1. **Focus states** — Not consistently applied; some interactive elements lack focus rings
2. **Keyboard navigation** — Command palette works, but page-level keyboard shortcuts inconsistent
3. **ARIA labels** — Some buttons/icons lack labels; some have incorrect roles
4. **Color contrast** — Status colors may not meet WCAG AA in all combinations
5. **Touch targets** — Mobile hamburger menu buttons may be too small (36×36px)

---

## Section 8: Performance Issues

1. **Live metrics polling** — Every 6 seconds on marketing page; no request cancellation
2. **Large bundle** — No code splitting visible; entire app in initial load
3. **No loading skeletons** — Some pages have inline skeletons, others have separate `loading.tsx`
4. **Font loading** — No font-display strategy visible

---

## Section 9: Recommendations Summary

### Critical (Must Fix)
1. Remove duplicate navigation elements — only one "where am I" indicator per page
2. Fix dead navigation links (4 exhibitor sidebar links, 2 console nav links)
3. Unify active-state indicator across all navigation levels
4. Fix silent auth failures with user feedback

### High Priority
5. Reduce dashboard cognitive load with progressive disclosure
6. Unify content width containers (single max-width value)
7. Unify KPI/metric components (single component family)
8. Fix inconsistent empty states (single component)
9. Remove dead pages or implement placeholder content
10. Fix persona card links on landing page

### Medium Priority
11. Unify card hover effects
12. Fix gradient color maps for industries
13. Remove emoji from professional contexts
14. Add step indicators to multi-step flows
15. Implement consistent loading states
16. Add legal/privacy links to footer
17. Fix "Sign in" button appearing twice in different styles

### Lower Priority
18. Add tooltips to perspective names in GlobalNav
19. Differentiate two CTAs on hero (visual hierarchy)
20. Remove or contextualize live stats widget
21. Add social links to footer (trust signal)
22. Improve error messages with actionable guidance

---

## Appendix: Files Affected

### Navigation Components
- `apps/web/src/components/navigation/global-nav.tsx`
- `apps/web/src/components/navigation/command-palette.tsx`
- `apps/web/src/components/navigation/unified-breadcrumbs.tsx`
- `apps/web/src/app/(console)/console-nav.tsx`
- `apps/web/src/app/(portal)/exhibit/[organizationId]/_components/sidebar.tsx`

### Layouts Requiring Updates
- `apps/web/src/app/(marketing)/layout.tsx`
- `apps/web/src/app/(console)/layout.tsx`
- `apps/web/src/app/(portal)/layout.tsx`
- `apps/web/src/app/(portal)/exhibit/[organizationId]/layout.tsx`
- `apps/web/src/app/(attendee)/layout.tsx`
- `apps/web/src/app/demo/organizer/layout.tsx`
- `apps/web/src/app/demo/exhibitor/[eventExhibitorId]/layout.tsx`

### Pages Requiring Content Width Unification
- All `max-w-7xl` pages
- All `max-w-(--mq-content-max-narrow)` pages
- All inline-styled pages

### Components Needing Unification
- KPICard / MetricCard
- PageHeader / text-title
- StatusBadge / Badge
- EmptyState variants
- Loading skeleton patterns
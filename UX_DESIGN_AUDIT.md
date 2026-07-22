# UX_DESIGN_AUDIT

**Date:** July 22, 2026
**Auditor:** Principal Engineer + Staff Designer
**Reference:** Vercel, Stripe, Linear, Notion, Attio

---

## 0. METHODOLOGY

Every screen was audited against three standards:
1. **Does it follow the design system?** (tokens, components, spacing)
2. **Does it follow interaction conventions?** (what you'd expect from Linear/Stripe/Notion)
3. **Is the cognitive load appropriate?** (can a new user understand it in 3 seconds)

---

## 1. NAVIGATION AUDIT

### 1.1 Global Navigation

**Component:** `GlobalNav` (`src/components/navigation/global-nav.tsx`)

| Element | Finding | Severity |
|---------|---------|----------|
| Header | Sticky, good. Uses perspective switcher (Experience/Organizer/Exhibitor/Attendee) | GOOD |
| Logo | Links to `/` — consistent | GOOD |
| Perspective switcher | 4 tabs — clear separation | GOOD |
| Mobile hamburger | Hamburger + drawer — standard pattern | GOOD |
| Search | Command palette via Ctrl+K — well-placed | GOOD |
| User menu | Avatar dropdown with sign-out — standard | GOOD |
| **Missing** | No wayfinding indicator on active section | MEDIUM |

**Compared to Linear:** Linear has a persistent left sidebar with pinned sections + collapsible sidebar. Vercel has a top nav with command palette. ExAi's hybrid (top nav + perspective tabs) is functional but could be cleaner.

**Compared to Stripe:** Stripe uses a left sidebar on dashboard pages, top nav on marketing. ExAi should consider: marketing pages = top nav, dashboard pages = left sidebar.

### 1.2 Breadcrumbs

**Component:** `UnifiedBreadcrumbs` (`src/components/navigation/unified-breadcrumbs.tsx`)

Covers: `/org/*`, `/exhibit/*`, `/e/*`, `/demo/*`

**Coverage Gaps:**
| Route | Missing Breadcrumbs? |
|-------|----------------------|
| `/admin` | YES — no breadcrumbs |
| `/auth/*` | YES — no breadcrumbs |
| `/hackathon` | YES — no breadcrumbs |
| `/exhibit` (root) | YES — no breadcrumbs |
| Portal sub-pages | PARTIAL — some have, some don't |
| `/e/[eventSlug]/exhibitors/[id]/insights` | YES — no breadcrumbs |

**Verdict:** Breadcrumbs are a significant wayfinding tool. Every authenticated page should have them. Attendee pages are missing them too.

### 1.3 Command Palette

**Component:** `CommandPalette` (`src/components/navigation/command-palette.tsx`)

| Aspect | Finding |
|--------|---------|
| Trigger | Ctrl+K — follows VS Code convention |
| UI | Uses `@concourse/ui` Dialog — consistent |
| Content | Hardcoded NAVIGATION_ITEMS (7 items) — not dynamic |
| Search | Filters static list — no page/content search |

**Critical Gap:** The command palette only searches hardcoded routes. It cannot find exhibitors, attendees, or events. Compare to Linear's command palette which searches everything in the workspace.

**Recommendation:** Either (a) disable the command palette until it can search real data, or (b) implement fuzzy search across exhibitors/events/reports.

### 1.4 Sidebar Navigation (Portal/Console)

| Route Group | Sidebar | Findings |
|-------------|---------|----------|
| `(portal)` `/exhibit` | `Sidebar` via Suspense | Consistent with console pattern |
| `(console)` `/org` | `ConsoleNav` via Suspense | Consistent |
| `(admin)` `/admin` | Hardcoded links in layout | Functional but low design quality |

---

## 2. INFORMATION HIERARCHY AUDIT

### 2.1 Page Headers

**Pattern used:** `PageHeader` from `@concourse/ui`
- `parent` (breadcrumb link)
- `title`
- `description`
- `actions` (CTAs)

**Findings:**
| Page | Has PageHeader | Actions Right-Positioned |
|------|---------------|--------------------------|
| `/org/events` | ✓ | ✓ |
| `/org/events/[eventId]` | ✓ | ✓ (Publish + Settings) |
| `/exhibit/[orgId]/settings` | ✓ | ✗ (inline submit) |
| `/e/[eventSlug]` | ✗ (custom) | N/A |
| `/hackathon` | ✗ (custom hero) | N/A |

**Issue:** Not all pages use the `PageHeader` component consistently. The attendee directory (`/e/[eventSlug]`) has a custom header that doesn't match the design system pattern.

**Verdict:** Standardize on `PageHeader` for all pages. Don't invent custom headers.

### 2.2 Card Hierarchy

Cards are used extensively. The `Card` component has 4 variants:
- `default` — standard surface
- `elevated` — with shadow
- `outline` — border-only
- `interactive` — hover state (for clickable cards)

**Findings:**
| Usage | Correct Variant? | Notes |
|-------|-----------------|-------|
| Analytics metric cards | `elevated` | GOOD — distinct from background |
| Exhibitor directory cards | `interactive` | GOOD — clearly clickable |
| Lead form containers | `default` | GOOD |
| Empty state containers | `outline` | GOOD — subtle |
| **Demo admin cards** | None (raw divs) | BAD — breaks design system |

**Critical:** Demo admin (`app/demo/admin/page.tsx`) uses raw `<div>` with hardcoded backgrounds instead of `Card` component. This is a design system violation.

### 2.3 Data Density

| Section | Density | Verdict |
|---------|---------|---------|
| Organizer dashboard `/org` | Comfortable — KPI cards + event list | GOOD |
| Exhibitor workspace `/exhibit` | Comfortable — clear sections | GOOD |
| Attendee directory `/e/[slug]` | Dense — search + filter + list | ACCEPTABLE |
| Demo analytics | Very dense — LiveMetricsBar + charts + activity | TOO DENSE — needs whitespace |
| Reports page | Low density — lots of whitespace | GOOD |

**Issue:** The demo analytics page feels crowded. The `LiveMetricsBar` + `InsightCard` + chart + activity feed all competing for attention without clear visual separation.

---

## 3. SPACING & LAYOUT AUDIT

### 3.1 Spacing Scale

Design tokens define: `--mq-space-gutter`, `--mq-space-section`, `--mq-space-section-sm`, `--mq-space-section-lg`

**Findings:**
| Page | Spacing Consistency |
|------|---------------------|
| Marketing `/` | GOOD — follows section spacing |
| Organizer `/org` | GOOD — 1.5rem gaps |
| Demo `/demo/admin` | BAD — inconsistent padding (some 16px, some 24px, some raw) |
| Reports | GOOD |

**Issue:** Demo admin uses inline `className="p-4"` and `className="p-6"` arbitrarily. Should use design system spacing tokens.

### 3.2 Content Width

| Page | Max-width | Pattern |
|------|-----------|---------|
| Marketing | 80rem (content-max) | GOOD |
| Attendee directory | 40rem (attendee-content-max) | GOOD — narrow for reading |
| Organizer dashboard | Full-width or 64rem | ACCEPTABLE |
| Exhibitor workspace | Full-width | GOOD |

**Good pattern:** `attendee-content-max` (40rem) for the attendee directory. This prevents line lengths from becoming unreadable. Follow this for all list/detail views.

### 3.3 Grid System

12-column grid with 1.5rem gap. Not visibly broken — appears functional.

---

## 4. TYPOGRAPHY AUDIT

### 4.1 Font

**Font:** Inter (via `next/font/google`) with `variable: --font-inter`

| Usage | Correct? |
|-------|----------|
| Body text | `font-sans` → Inter ✓ |
| Code/mono | `font-mono` → JetBrains Mono ✓ |
| No system font fallbacks | ISSUE — fallback is `system-ui, sans-serif` which is standard |

### 4.2 Type Scale

```
Display: 2.25rem / 2.5rem (36px/40px)
Title-lg: 1.5rem / 2rem (24px/32px)
Title:    1.25rem / 1.75rem (20px/28px)
Body-lg:  1rem / 1.5rem (16px/24px)
Body:     0.875rem / 1.25rem (14px/20px)
Caption: 0.75rem / 1rem (12px/16px)
```

**Findings:**
| Issue | Location | Severity |
|-------|----------|----------|
| Title size used for section headers that should be body-lg | `/org/settings` | LOW |
| Display size used for KPI values — too large | `/org` dashboard | LOW |
| Type scale not consistently applied in demo pages | Multiple | MEDIUM |

### 4.3 Text Overflow

No consistent handling of text truncation found. Long company names, event names, and user names will overflow their containers. No `truncate` utility applied.

---

## 5. COLOR AUDIT

### 5.1 Design Token Usage

**Semantic color system** defined in `packages/ui/src/styles/semantic.css`:
- Backgrounds: `canvas`, `surface`, `raised`, `sunken`, `overlay`
- Text: `primary`, `secondary`, `muted`, `disabled`, `on-brand`, `inverse`
- Borders: `default`, `strong`
- Brand: `brand` (indigo-600), `brand-hover`, `brand-subtle`
- Status: `success`, `warning`, `danger`, `info`, `ai`

**CRITICAL VIOLATIONS:**
1. **Demo admin** (`app/demo/admin/page.tsx`) uses raw hex: `#0a0a0f`, `#e0e0e0`, `#333`, `#222`, `#111`, `#888`, `#666`, `#555`
2. **Demo admin** uses Tailwind colors directly: `bg-emerald-600`, `text-red-400`, `bg-red-950`, `bg-slate-800`
3. **Hackathon page** uses `text-brand` but also raw indigo classes in some places

**This is not a minor issue.** The demo admin is a dark-themed page that completely bypasses the design token system. If the theme changes, this page breaks.

### 5.2 Status Colors

| Status | Token | Usage |
|--------|-------|-------|
| Success | `--mq-color-success` | Lead captured, connection made |
| Warning | `--mq-color-warning` | Needs follow-up, incomplete |
| Danger | `--mq-color-danger` | Critical, error states |
| Info | `--mq-color-info` | Informational, new items |
| AI | `--mq-color-ai` (violet) | AI-generated content |

**Usage:** Status badges use these consistently. Good pattern.

### 5.3 Dark Mode

Dark mode is defined in semantic.css with dark-specific values. Checked: dark mode appears functional for most pages. **Unchecked:** Demo admin (likely broken because it uses raw hex values).

---

## 6. BUTTON AUDIT

### 6.1 Button Component

**File:** `packages/ui/src/components/button/button.tsx`

Variants: `primary`, `secondary`, `ghost`, `danger`
Sizes: `sm`, `md`

| Usage | Correct? |
|-------|----------|
| Primary actions | `variant="primary"` ✓ |
| Secondary actions | `variant="secondary"` ✓ |
| Destructive actions | `variant="danger"` ✓ |
| Tertiary/links | `variant="ghost"` ✓ |
| Icon-only buttons | Missing `aria-label` in some places |

### 6.2 Button Placement

| Page | Issue |
|------|-------|
| `/org/events/[eventId]` | Publish button and Settings button — both in `actions` slot. Clear. |
| `/exhibit/[orgId]/settings` | Save button is inline at bottom — no sticky footer for forms |
| Attendee exhibitor profile | "Save" button is a toggle — unclear state change |

### 6.3 CTAs (Call to Action)

| Page | CTA | Finding |
|------|-----|---------|
| `/org` | "Create Event" | Primary button in header actions — GOOD |
| `/exhibit` | "Create Event" | No CTA visible on landing — BAD |
| `/auth` | "Sign in" | Magic link form — no primary button styling issue |

**Critical:** The exhibitor workspace (`/exhibit`) has no clear primary action for first-time users. They land on an empty state with no guidance.

---

## 7. CARD AUDIT

### 7.1 Card Variants

See Section 2.2 above. The 4-variant system (default/elevated/outline/interactive) is well-designed and should be used consistently.

### 7.2 Card Content Patterns

| Pattern | Example | Quality |
|---------|---------|---------|
| Metric card | KPI value + label + trend | GOOD — clear |
| Event card | Title + date + exhibitor count | GOOD — scannable |
| Exhibitor card | Logo + name + tagline | GOOD — visual |
| Lead card | Name + company + intent badge | GOOD — priority visible |
| Report card | Title + generated date + status | GOOD |

### 7.2 Cards Missing from System

| Card Type | Found | Should Use |
|-----------|-------|------------|
| `PremiumCard` | YES — in foundation | Special tier with icon + action slot |
| `MetricCard` | YES — in foundation | Label + value + detail + trend |
| `InsightCard` | YES — in demo/live-metrics | Custom — only used in demo |
| `LiveBadge` | YES — in foundation | Pulsing live indicator |
| `CelebrationEffect` | YES — in foundation | Confetti animation |

---

## 8. INPUT AUDIT

### 8.1 Form Components

**Input:** `<input>` wrapped in `Field` component with `label`, `helper`, `error`
**Textarea:** Same pattern
**Select:** Not audited — may not have a custom Select component

### 8.2 Form Patterns Found

| Page | Pattern | Quality |
|------|---------|---------|
| `/auth` | Single email input + submit | GOOD — minimal friction |
| `CreateEventForm` | Multi-field form inline | OK — but no field grouping |
| `InviteExhibitorForm` | Email + role | GOOD — focused |
| Attendee profile | Full profile form | GOOD — with consent checkbox |

### 8.3 Validation UX

**No inline validation found.** Forms submit and then show errors. Compare to Stripe: inline validation on blur is far superior.

**Missing:**
- Required field indicators (asterisk or label)
- Character count for text inputs
- Clear error messages on fields

---

## 9. TABLE AUDIT

### 9.1 Table Component

**From `foundation.tsx`:** `Table`, `TableHeader`, `TableRow`, `TableHead`, `TableCell`, `TableBody`

**Findings:**
| Page | Usage | Quality |
|------|-------|---------|
| `/org/events` | Event list — NOT using Table component | BAD — custom list with div |
| `/org/events/[eventId]/exhibitors` | Exhibitor table — using Table ✓ | GOOD |
| `/org/users` | User list — using Table ✓ | GOOD |
| Demo visitor table | Using Table ✓ | GOOD |

### 9.2 Table Features

| Feature | Status |
|---------|---------|
| Sortable columns | NOT FOUND |
| Row selection | NOT FOUND |
| Pagination | NOT FOUND (all data loaded at once) |
| Inline actions | YES — e.g., remove, edit |
| Empty state | YES — via `EmptyState` |

**Performance Risk:** All tables load all data at once. For events with 100+ exhibitors, this will be slow.

---

## 10. LOADING STATES AUDIT

### 10.1 Skeleton Components

`packages/ui` provides: `Skeleton`, `SkeletonCard`, `SkeletonTable`

**Usage found:** 25 `loading.tsx` files throughout the app

### 10.2 Coverage

| Route Group | loading.tsx Coverage |
|-------------|---------------------|
| `(console)` `/org` | 100% (all sub-routes have loading) |
| `(attendee)` `/e` | PARTIAL — `/e/[eventSlug]` has loading, but `/e/[eventSlug]/exhibitors/[id]/insights` missing |
| `(portal)` `/exhibit` | LOW — only relationship detail has loading |
| `demo/*` | GOOD — most routes have loading |
| `auth/*` | NONE — uses inline skeleton fallbacks instead |

### 10.3 Quality

**Good:** Skeleton components match the layout of the content they replace.
**Bad:** Some routes have no loading.tsx and no Suspense — the page will flash empty content during navigation.

---

## 11. EMPTY STATES AUDIT

### 11.1 Component

`EmptyState` component from `foundation.tsx`: title + description + action + icon slots.

### 11.2 Empty States Found

| Page | Empty State | Quality |
|------|-------------|---------|
| `/org` (no events) | Shows `CreateEventForm` | GOOD — actionable |
| `/org/events/[eventId]/documents` | "No event documents" | MEDIUM — no action |
| `/e/[eventSlug]/saved` | "No saved exhibitors" + browse CTA | GOOD |
| `/exhibit` (no exhibitors) | NOT VISIBLE — redirect happens |

### 11.3 Missing Empty States

| Page | Issue |
|------|-------|
| `/org/events/[eventId]/exhibitors/[id]` | No content visible — may be broken |
| `/exhibit/[orgId]/attendees` | Page exists but content unknown |
| `/exhibit/[orgId]/documents` | Unknown |
| `/exhibit/[orgId]/forms` | Unknown |

---

## 12. ERROR STATES AUDIT

### 12.1 No Error Boundaries

**CRITICAL:** Zero `error.tsx` files in the entire app. Any unhandled error shows the Next.js default or a blank page.

### 12.2 Inline Error Display

Errors are shown in various ways:
- Inline text with `text-status-danger-text` class
- `DemoUnavailable` component for API failures
- `EmptyState` with error description

**Inconsistency:** Error display varies by page. No standard error component.

### 12.3 Best Practice (Stripe)

Stripe shows errors inline under the relevant field, with red border + icon + message. ExAi should adopt this pattern.

---

## 13. ACCESSIBILITY AUDIT

### 13.1 Skip Link

`SkipLink` component exists and is rendered in root layout. ✓

### 13.2 ARIA Labels

| Component | ARIA | Quality |
|-----------|------|---------|
| GlobalNav | `aria-label="Global navigation"`, `aria-expanded`, `aria-current` | GOOD |
| CommandPalette | `role="listbox"`, `role="option"`, `aria-selected` | GOOD |
| UserMenu | `aria-expanded`, `aria-haspopup="menu"`, `role="menu"` | GOOD |
| Icon buttons | Some have `aria-label`, some don't | INCONSISTENT |

### 13.3 Color Contrast

Light mode: OK. Dark mode: OK (using OKLCH-tuned palettes with perceptual steps).

### 13.4 Focus Management

`focus-visible` with indigo ring throughout. ✓

### 13.5 Reduced Motion

`prefers-reduced-motion` support exists in `foundation.css`. ✓

### 13.6 Keyboard Navigation

| Element | Keyboard Support |
|---------|------------------|
| Command palette | Full — arrow keys + enter + escape |
| User menu | Full — arrow keys + enter |
| Modal dialogs | Full — Radix handles |
| Drawers | Full — Radix handles |

---

## 14. CONSISTENCY AUDIT

### 14.1 Inconsistent Patterns

| Pattern | Appearances | Consistency |
|---------|-------------|-------------|
| `DemoUnavailable` vs `EmptyState` for errors | Multiple | BAD — different components for same purpose |
| Raw hex colors in demo admin | 1 page | BAD — bypasses token system |
| `Field` wrapper vs inline labels | Mixed | MEDIUM — should standardize |
| Inline submit vs footer sticky submit | Mixed | MEDIUM — forms should have sticky footer |

### 14.2 Consistent Patterns (Good)

| Pattern | Consistent? |
|---------|--------------|
| Card variants (default/elevated/outline/interactive) | ✓ |
| Button variants (primary/secondary/ghost/danger) | ✓ |
| Status colors (success/warning/danger/info/ai) | ✓ |
| Breadcrumbs component | ✓ |
| Skeleton components | ✓ |

---

## 15. COGNITIVE LOAD AUDIT

### 15.1 High-Cognitive-Load Pages

| Page | Issue | Severity |
|------|-------|----------|
| `/demo/organizer/analytics` | LiveMetricsBar + chart + breakdown cards + activity — all visible at once | HIGH |
| `/demo/admin` | Simulation controls + event chart + activity feed + metrics — too much | HIGH |
| `/org/events/[eventId]` | Mixed: KPIs + action buttons + exhibitor list + event info — no clear priority | MEDIUM |

### 15.2 Low-Cognitive-Load Pages (Good)

| Page | Why It's Clear |
|------|---------------|
| `/auth` | Single input, one action |
| `/org` | KPI cards + list — two sections |
| `/e/[eventSlug]/saved` | Filter + list — simple |

### 15.3 Progressive Disclosure

**Missing:** No use of progressive disclosure. Every page shows everything at once.

**Recommendation:** Use accordions, tabs, or "show more" patterns for complex pages. The demo analytics page should collapse the activity feed by default.

---

## 16. COMPARATIVE ANALYSIS

### 16.1 vs Linear

| Aspect | Linear | ExAi |
|--------|--------|------|
| Navigation | Left sidebar + command palette | Top nav + tabs |
| Data density | Compact | Comfortable |
| Empty states | Actionable + illustration | Text-only |
| Error handling | Inline + toast | Inconsistent |
| Loading | Skeleton inline | loading.tsx files |
| **Winner** | Linear (better density + consistency) | — |

### 16.2 vs Stripe

| Aspect | Stripe | ExAi |
|--------|--------|------|
| Navigation | Left sidebar on dashboard | Top nav + perspective tabs |
| Forms | Inline validation | No validation |
| Error handling | Field-level errors | Page-level errors |
| Empty states | Illustration + action | Text only |
| **Winner** | Stripe (better form UX) | — |

### 16.3 vs Notion

| Aspect | Notion | ExAi |
|--------|--------|------|
| Onboarding | First-time getting started checklist | Nothing |
| Empty states | Templates available | No templates |
| Navigation | Left sidebar + breadcrumbs | Top nav + breadcrumbs (some) |
| **Winner** | Notion (better onboarding) | — |

### 16.4 vs Attio

| Aspect | Attio | ExAi |
|--------|-------|------|
| Lead cards | Buying intent badge + company + last activity | Intent badge + name + company |
| Pipeline view | Kanban board | List view only |
| Filtering | Faceted search | Simple text search |
| **Winner** | Attio (better lead management UX) | — |

---

## 17. PRIORITY FINDINGS

### MUST FIX (before any demo to investors/customers)

1. **Zero error boundaries** — Any crash = blank page. Add `app/global-error.tsx` immediately.
2. **Demo admin bypasses design system** — Raw hex colors + Tailwind classes throughout. Replace with `Card` + semantic tokens.
3. **Demo admin exposed publicly** — `/demo/admin` has no auth. Anyone can control the simulation. Remove from production or add auth.
4. **Hardcoded event slug** — `redirect("/e/techexpo-2027")` breaks if slug doesn't exist. Add 404 handling.

### SHOULD FIX (before production launch)

5. Missing breadcrumbs on 5+ routes — Add `UnifiedBreadcrumbs` everywhere
6. Inline form validation missing — Add `ValidationPipe` and field-level errors
7. Table loading all data at once — Add pagination or virtual scrolling
8. No sticky form footer on long forms — Add `position: sticky; bottom: 0` for submit buttons
9. No first-time user onboarding — Add getting-started checklist to `/org` empty state
10. Command palette searches static list only — Either disable or implement real search

### NICE TO HAVE (post-launch)

11. Empty state illustrations — Add SVG illustrations (like Linear/Notion)
12. Progressive disclosure on analytics pages — Collapse secondary content
13. Type scale polish — Review KPI value sizing (36px display may be too large)
14. Mobile responsive polish — Test on actual iOS/Android devices
15. Dark mode for demo admin — Currently likely broken

---

## SCORECARD

| Dimension | Score | Notes |
|-----------|-------|-------|
| Navigation | 7/10 | Good top nav, breadcrumbs missing on 40% of pages |
| Typography | 7/10 | Good scale, some inconsistent sizing |
| Colors | 6/10 | Token system good, demo admin bypasses it |
| Components | 8/10 | Strong foundation, inconsistent usage |
| Spacing | 7/10 | Generally good, demo pages inconsistent |
| Loading states | 7/10 | 25 loading.tsx files, 5 routes missing |
| Empty states | 6/10 | Some good, some missing |
| Error handling | 3/10 | No error boundaries, inconsistent display |
| Accessibility | 7/10 | Good ARIA, keyboard nav solid, focus management |
| Consistency | 5/10 | Multiple broken patterns |
| Cognitive load | 5/10 | Analytics pages too dense |
| Comparison | 6/10 | Linear/Stripe/Notion ahead on form UX + onboarding |

**Overall: 6/10** — A solid foundation with a well-designed component library, undermined by inconsistent implementation, missing error boundaries, and a demo admin that bypasses the entire design system.
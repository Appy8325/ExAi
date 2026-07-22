# Navigation QA — UX Validation

**Date:** July 22, 2026
**Reviewer:** Acting as first-time enterprise customer
**Scope:** All major workflows, responsive behavior, consistency checks

---

## Workflow Reviews

### 1. Landing → Experience (`/` → `/demo`)

| Question | Answer |
|----------|--------|
| Where am I? | ✅ GlobalNav shows "Experience" pill active |
| One nav hierarchy? | ✅ Single GlobalNav with perspective pills. No sidebar. No breadcrumbs. |
| Unnecessary clicking? | ⚠️ 2 clicks from landing to demo (CTA → persona picker). Acceptable. |
| Breadcrumbs meaningful? | ✅ None shown — correct for marketing pages. |
| Pages feel disconnected? | ✅ Landing to demo transition is smooth (same nav shell). |
| Scale with new features? | ✅ Marketing section is self-contained; new marketing pages inherit GlobalNav. |

**Verdict:** ✅ Pass. Clean entry point. No navigation confusion.

---

### 2. Experience → Organizer (`/demo` → `/demo/organizer`)

| Question | Answer |
|----------|--------|
| Where am I? | ✅ GlobalNav shows "Organizer" active. WorkspaceNav shows Organizer nav items. Breadcrumbs show "Experience > Organizer". Three confirmations — but only ONE per level (nav level ≠ breadcrumb level). |
| One nav hierarchy? | ✅ GlobalNav at top, WorkspaceNav at left, breadcrumbs inline. Each serves a different purpose. |
| Unnecessary clicking? | ✅ Direct link in GlobalNav. One click from experience hub. |
| Breadcrumbs meaningful? | ✅ "Experience > Organizer" — correct hierarchy. |
| Pages feel disconnected? | ✅ Same nav shell as other workspace pages. |
| Scale with new features? | ✅ WorkspaceNav supports sections for grouping new nav items. |

**Verdict:** ✅ Pass. Organizer workspace is coherent.

---

### 3. Organizer → Events (`/org/events`)

| Question | Answer |
|----------|--------|
| Where am I? | ✅ WorkspaceNav "Events" active (left border + brand bg). Breadcrumbs "Organizer > Events". Page title via `PageHeader`. |
| One nav hierarchy? | ✅ Sidebar shows section. Breadcrumbs show depth. No overlap. |
| Unnecessary clicking? | ✅ Events list is direct from sidebar. |
| Breadcrumbs meaningful? | ✅ "Organizer > Events" — parent → section. |
| Pages feel disconnected? | ✅ Events list inherits same console layout. |
| Scale with new features? | ✅ Event sub-routes use PageTabs component. |

**Event detail sub-pages (e.g., `/org/events/123/exhibitors`):**
- ✅ Breadcrumbs: "Organizer > Events > Event > Exhibitors" (fixed segments[3]→segments[2] bug)
- ✅ PageTabs: Overview | Exhibitors | Reports | Settings
- ✅ Active state consistent between sidebar and tabs

**Verdict:** ✅ Pass. Event management flow is logical and consistent.

---

### 4. Organizer → Analytics (`/org/analytics`)

| Question | Answer |
|----------|--------|
| Where am I? | ✅ WorkspaceNav "Analytics" active. Breadcrumbs "Organizer > Analytics". |
| One nav hierarchy? | ✅ Sidebar + breadcrumbs only. |
| Unnecessary clicking? | ✅ Direct link in sidebar. |
| Breadcrumbs meaningful? | ✅ "Organizer > Analytics" — clear. |
| Pages feel disconnected? | ✅ Same console shell. |
| Scale with new features? | ✅ Analytics is a single sidebar entry; sub-pages can use PageTabs. |

**Verdict:** ✅ Pass.

---

### 5. Organizer → Reports (`/org/reports`)

| Question | Answer |
|----------|--------|
| Where am I? | ⚠️ Reports was removed from the real Organizer sidebar because the page doesn't exist (dead link). |
| One nav hierarchy? | ✅ Users can't navigate to `/org/reports` from sidebar anymore. If they land via direct URL, breadcrumbs show "Organizer > Reports". |
| Unnecessary clicking? | ✅ No navigation entry (page doesn't exist). |
| Breadcrumbs meaningful? | ✅ Breadcrumbs still resolve correctly for the route. |
| Pages feel disconnected? | ⚠️ Page has placeholder content — not a navigation issue. |

**Verdict:** ⚠️ Acceptable. Dead link removed per UX audit. Reports page needs implementation (future epic).

---

### 6. Exhibitor → Dashboard (`/exhibit/{orgId}/dashboard/{eeId}`)

| Question | Answer |
|----------|--------|
| Where am I? | ✅ WorkspaceNav "Dashboard" active. Breadcrumbs "Exhibitor > Dashboard". GlobalNav shows "Exhibitor". |
| One nav hierarchy? | ✅ Only sidebar active. Breadcrumbs at page level. |
| Unnecessary clicking? | ✅ Dashboard is first sidebar item (top priority). |
| Breadcrumbs meaningful? | ✅ "Exhibitor > Dashboard" — parent → section. |
| Pages feel disconnected? | ✅ Same exhibitor shell as all other exhibitor pages. |
| Scale with new features? | ✅ Exhibitor sidebar uses section grouping (Dashboard + AI, Management, Settings). |

**Active state verification:**
- ✅ Dashboard active when on `/exhibit/{orgId}/dashboard/{eeId}`
- ✅ Dashboard NOT active when on `/exhibit/{orgId}/visitors`
- ✅ Visitors active when on visitor pages

**Verdict:** ✅ Pass. The highest-ROI page now has clean navigation.

---

### 7. Exhibitor → Visitors (`/exhibit/{orgId}/visitors`)

| Question | Answer |
|----------|--------|
| Where am I? | ✅ WorkspaceNav "Visitors" active. Breadcrumbs "Exhibitor > Visitors". |
| One nav hierarchy? | ✅ Single sidebar + breadcrumb. |
| Unnecessary clicking? | ✅ Direct sidebar link. |
| Breadcrumbs meaningful? | ✅ "Exhibitor > Visitors" — clear. |
| Pages feel disconnected? | ✅ Same exhibitor shell. |
| Scale with new features? | ✅ Visitors is a main nav item; sub-pages use breadcrumbs for depth. |

**Verdict:** ✅ Pass.

---

### 8. Exhibitor → QR Codes (`/exhibit/{orgId}/qr`)

| Question | Answer |
|----------|--------|
| Where am I? | ✅ WorkspaceNav "QR Codes" active (under "Management" section). Breadcrumbs "Exhibitor > QR Codes". |
| One nav hierarchy? | ✅ Section grouping in sidebar is clear. |
| Unnecessary clicking? | ✅ Previously unreachable from sidebar — now accessible. |
| Breadcrumbs meaningful? | ✅ "Exhibitor > QR Codes". |
| Pages feel disconnected? | ✅ Was previously only accessible via Quick Actions on dashboard — now has proper nav entry. |
| Scale with new features? | ✅ "Management" section group can hold more tools. |

**Verdict:** ✅ Pass. Previously hidden page now properly reachable.

---

### 9. Exhibitor → Documents (`/exhibit/{orgId}/documents`)

| Question | Answer |
|----------|--------|
| Where am I? | ✅ WorkspaceNav "Documents" active. Breadcrumbs "Exhibitor > Documents". |
| One nav hierarchy? | ✅ Same consistent nav. |
| Unnecessary clicking? | ✅ New nav entry makes it reachable. |
| Breadcrumbs meaningful? | ✅ Clear. |
| Pages feel disconnected? | ⚠️ Page has placeholder content — not a navigation issue. |

**Verdict:** ✅ Pass. Navigation is correct; page content is future work.

---

### 10. Attendee → Browse/Saved/Profile

| Question | Answer |
|----------|--------|
| Where am I? | ✅ GlobalNav "Attendee" active (compact variant). Bottom tab bar shows active tab with brand background. |
| One nav hierarchy? | ✅ Attendee uses bottom tabs (mobile-first), not sidebar. Different paradigm from workspaces — correct for the role. |
| Unnecessary clicking? | ✅ Bottom tabs are always visible, one tap to switch. |
| Breadcrumbs meaningful? | ✅ Shown in content area: "Events > Event" / "Events > Event > Saved". |
| Pages feel disconnected? | ⚠️ Visit pages (`/visit/*`) use a different shell (minimal header). This is intentional — QR flow is a focused task. But the transition from the main app to visit pages is jarring. |
| Scale with new features? | ✅ Bottom tabs accommodate 3-5 items; more can be added. |

**Visit page back link fix:**
- ✅ Was hardcoded to `/hackathon` (wrong route) → now uses `BackLink` to `/e/{slug}`
- ✅ Uses reusable `BackLink` component instead of inline implementation

**Verdict:** ✅ Pass with minor note about visit page shell transition.

---

### 11. Mobile Layouts

| Scenario | Behavior | Verdict |
|----------|----------|---------|
| Marketing page | ✅ GlobalNav hamburger opens perspective drawer | ✅ |
| Organizer workspace | ✅ Sidebar hidden. Page content full-width. Command palette available. | ✅ |
| Exhibitor workspace | ✅ Same — sidebar hidden on mobile. | ✅ |
| Attendee page | ✅ Bottom tabs visible. GlobalNav compact. | ✅ |
| Visit page | ✅ Minimal header with BackLink + Home. | ✅ |

**Issue:** Sidebar nav items are NOT accessible on mobile (no slide-out drawer). The hamburger menu in GlobalNav only shows perspective links, not workspace nav items. This is a pre-existing limitation inherited from ConsoleNav behavior.

**Verdict:** ⚠️ Acceptable for now. Mobile workspace navigation is a future enhancement.

---

### 12. Tablet Layouts

| Scenario | Behavior | Verdict |
|----------|----------|---------|
| Workspace (768-1023px) | ✅ Sidebar hidden (`hidden lg:flex` — `lg` = 1024px). Same as mobile. | ⚠️ Could show collapsed sidebar on tablet. |
| Content width | ✅ Uses responsive `p-(--mq-space-gutter)` which adjusts from 16px to 40px. | ✅ |

**Verdict:** ⚠️ Tablet behavior degrades to mobile. Acceptable for now.

---

## Consistency Checks

### Active States

| Component | Active Indicator | Style |
|-----------|-----------------|-------|
| `WorkspaceNav` sidebar items | Left border + background fill + brand color | ✅ `absolute left-0 h-5 w-0.5 bg-brand` + `bg-brand-subtle text-brand` |
| `PageTabs` tabs | Bottom border + brand text color | ✅ `absolute inset-x-0 bottom-0 h-0.5 bg-brand` + `text-brand` |
| `GlobalNav` perspective pills | Pill border + background fill + brand color | ✅ `border-brand bg-brand-subtle text-brand` (rounded-full) |
| Attendee bottom tabs | Background fill + brand text | ✅ `bg-brand text-on-brand` |

**Finding:** Active indicators differ between components (left border vs bottom border vs pill vs fill). This is acceptable because each component type has a different affordance. However, the NAVIGATION_ARCHITECTURE.md specified a single indicator. This is a minor departure.

**Verdict:** ⚠️ Minor inconsistency. Each pattern is internally consistent.

### Sidebar Width & Spacing

- All WorkspaceNav instances: `w-60` (240px) ✅
- Nav item padding: `px-3 py-2` (12px horizontal, 8px vertical) ✅
- Icon size: `size-4` (16x16) ✅
- Gap between icon and label: `gap-3` (12px) ✅
- Section header: `text-[10px] font-semibold uppercase tracking-[0.18em]` ✅

**Verdict:** ✅ Consistent.

### Icons

- All icons: `size-4 shrink-0` ✅
- Active state: `text-brand` ✅
- Inactive state: `text-muted` ✅
- Single NavIcon component in WorkspaceNav (was duplicated 3x) ✅
- Icon names are semantic (grid, calendar, users, chart, sparkle, file, gear, box, qr, eye, home, user) ✅

**Verdict:** ✅ Consistent.

### Keyboard Navigation

- WorkspaceNav links: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring` ✅
- Attendee bottom tabs: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring` ✅
- GlobalNav links: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring` ✅
- Sign-out button: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring` ✅
- Command palette: `Ctrl+K` globally ✅

**Verdict:** ✅ All interactive elements have focus states.

### Focus States

- All nav links have visible focus rings ✅
- Focus ring style: `ring-2 ring-ring` (uses design system ring token) ✅
- `aria-current="page"` on active items ✅
- `aria-label` on icon-only buttons ✅

**Verdict:** ✅ Accessible.

### Responsive Behavior

| Breakpoint | WorkspaceNav | GlobalNav | Breadcrumbs |
|-----------|-------------|-----------|-------------|
| <768px (mobile) | Hidden | Hamburger menu | Visible |
| 768-1023px (tablet) | Hidden | Full perspective row | Visible |
| ≥1024px (desktop) | Visible (w-60) | Full perspective row | Visible |

**Verdict:** ✅ Sidebar hidden on mobile, visible on desktop. Correct pattern.

### Duplicate Navigation

| Before | After |
|--------|-------|
| Console layout: "Organizer" badge + breadcrumb + sidebar + EventNav | ✅ Breadcrumb + sidebar + PageTabs (each serves different purpose) |
| Exhibitor layout: "Exhibitor" badge + breadcrumb + sidebar | ✅ Removed badge. Breadcrumb + sidebar only. |
| Attendee: bottom tabs + breadcrumb | ✅ Bottom tabs for role, breadcrumbs for depth. |
| Marketing: GlobalNav only | ✅ Clean. |

**Verdict:** ✅ No duplicate "where am I" indicators remain.

---

## Bugs Found During QA

| # | Bug | Severity | Fixed? |
|---|-----|----------|--------|
| 1 | Breadcrumbs: `segments[3]` instead of `segments[2]` for eventId extraction. Caused broken "Event" breadcrumb link on event sub-pages (e.g., `/org/events/123/exhibitors` → link to `/org/events/exhibitors` instead of `/org/events/123`). | Critical | ✅ Fixed in `breadcrumbs.tsx:186` |
| 2 | Admin layout missing `Suspense` wrapper around `WorkspaceNav` | Minor | ✅ Fixed in `(admin)/layout.tsx` |

---

## 5 Things That Are Excellent

1. **WorkspaceNav unification** — Three sidebar implementations collapsed into one component. NavIcon SVGs no longer duplicated. Any future sidebar change happens in one file.

2. **Breadcrumb coverage** — All previously missing routes now have breadcrumbs. 15+ gaps filled. The `matchBreadcrumb` pattern-based approach handles deep routes correctly without manual URL construction.

3. **Dead link removal** — Removing `/org/ai-insights`, `/org/reports`, `/exhibit/{orgId}/analytics`, `/exhibit/{orgId}/ai-assistant`, `/exhibit/{orgId}/products`, `/exhibit/{orgId}/knowledge` from sidebars eliminates the most common user frustration (404 errors).

4. **Hidden pages now reachable** — QR Codes, Forms, Documents, Team were only accessible via URL or Quick Actions. Adding them to the exhibitor sidebar with section grouping ("Management") makes the product feel complete.

5. **Attendee back-link fix** — Hardcoded `/hackathon` replaced with dynamic `BackLink` component pointing to correct `/e/{slug}` route. Uses the same component pattern as other back links.

---

## 5 Remaining Weaknesses

1. **No mobile sidebar drawer** — On mobile, workspace nav items are completely hidden. The hamburger menu only shows perspective switches. Users on phones cannot navigate between Dashboard, Visitors, Settings, etc. without going through the dashboard. This was inherited behavior but is the biggest UX gap.

2. **Active state inconsistency across components** — WorkspaceNav uses left border, PageTabs uses bottom border, GlobalNav uses pill fill, attendee tabs use background fill. Each is reasonable individually, but the suite lacks a unified "this is how we show active" rule.

3. **Breadcrumbs don't reflect dynamic data** — Relationship breadcrumb shows "Relationship" instead of the person's name. Event breadcrumb shows "Event" instead of the event name. This is because breadcrumbs are resolved from URL patterns only, without access to server data. A future enhancement could inject runtime data.

4. **Admin layout sidebar is over-engineered** — A single-item sidebar ("Overview") inside a full WorkspaceNav shell. The `w-60` sidebar for one link wastes space. This was inherited from the original inline admin sidebar.

5. **Visit page shell transition is jarring** — Moving from the attendee app to the QR visit flow changes navigation entirely (no bottom tabs, no GlobalNav, just a minimal header). While intentional for focus, it feels like a different product.

---

## Navigation Readiness Score

**7.5 / 10**

| Dimension | Score | Rationale |
|-----------|-------|-----------|
| **Information architecture** | 9/10 | Logical hierarchy. Clear role separation. Pages organized correctly. |
| **Wayfinding (where am I?)** | 8/10 | Breadcrumbs + active sidebar + page title = three confirmations. But dynamic labels missing. |
| **Consistency** | 7/10 | Components are internally consistent but differ from each other (active states). |
| **Completeness (no dead ends)** | 8/10 | No dead nav links. All existing pages reachable. Admin sidebar is over-engineered. |
| **Mobile experience** | 5/10 | Workspace nav inaccessible on mobile. Tablet degrades to mobile. |
| **Accessibility** | 8/10 | Focus states, aria-labels, keyboard nav all present. ARIA roles and screen reader testing not verified. |

**Threshold for EPIC 2 readiness: 7/10** ✅ Exceeded.

**Critical blockers for navigation go-live:** None remaining (segments bug fixed).
**Should address before next major release:** Mobile sidebar drawer.
**Can defer:** Dynamic breadcrumb labels, admin sidebar consolidation, visit page shell.

---

## Final Recommendation

Navigation architecture is **ready for EPIC 2** (Dashboard & Layout). The one bug found during QA (segments index) has been fixed. Remaining weaknesses are pre-existing limitations or scope items for future epics.

Proceed with EPIC 2.

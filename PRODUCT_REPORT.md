# Product Redesign — Persona-Driven Demo

> **Commit:** `feat(product): redesign demo around personas`
>
> The `/demo` surface now feels like a real enterprise SaaS product tour. Entry is a single, polished persona picker. Organizer and Exhibitor both have full read-only workspaces with side navigation. Attendee just launches the live `/hackathon` experience — no awkward attendee clone of the demo.

---

## What changed

### 1. New entry: `/demo` persona picker

Single screen titled **"Experience ExAi"** with subhead **"Choose your perspective"**:

- **Organizer** — Read-only dashboard. Analytics. Heatmaps. AI Insights. Reports.
- **Exhibitor** — Dashboard. Products. Visitors. Analytics. QR. Booth Preview.
- **Attendee** — Live launch to `/hackathon`.

Each tile shows capability bullets, live counts from the seeded overview, and a primary CTA.

The Attendee tile deliberately does *not* spin up a separate attendee demo — it simply opens `/hackathon`, the production experience. No duplicated UI.

### 2. Shared demo chrome (enterprise SaaS feel)

New `apps/web/src/components/demo/shell.tsx` ships:

- `DemoTopBar` — sticky app bar with logo, persona switcher, "Read-only demo" pill, and breadcrumb back to perspective picker.
- `DemoSideNav` — persistent left navigation titled with the workspace name, used inside both Organizer and Exhibitor workspaces.
- `DemoMobileNav` — horizontally-scrolling pills for screens smaller than the side-nav breakpoint.
- `DemoPageHeader` — eyebrow / title / description / pill badge, used on every page.
- `DemoUnavailable` — uniform error state.

Persona nav highlights the active section. Both personas share the same "Read-only demo" affordance.

### 3. Organizer workspace (`/demo/organizer*`)

New `layout.tsx` with side nav: **Dashboard, Events, Analytics, Heatmaps, AI Insights, Reports**.

| Route | What it shows |
| --- | --- |
| `/demo/organizer` | Portfolio KPI dashboard, quick-link tiles, featured event card, Portfolio list. |
| `/demo/organizer/events` | All events with per-event KPI tiles and actions (Analytics, Heatmap, Public event page). |
| `/demo/organizer/event/[slug]` | Event detail with booth list and deep links into Analytics / Heatmaps / AI Insights / Reports. |
| `/demo/organizer/analytics` | Live traffic, conversion, pipeline distribution bars, engagement stats, popular industries/topics. |
| `/demo/organizer/heatmaps` | Visual heatmap card: hottest booth is 100%, gradient bars per booth with per-booth conversion rate. |
| `/demo/organizer/ai-insights` | AI-themed KPI tiles + AI executive summary + "What to focus on" recommendations. |
| `/demo/organizer/reports` | Executive AI report card with header KPI grid. |

### 4. Exhibitor workspace (`/demo/exhibitor*`)

New file-scoped `layout.tsx` (per booth) with breadcrumb header (All exhibitors / company / event) and side nav: **Dashboard, Products, Visitors, Analytics, AI Insights, QR, Booth Preview**.

| Route | What it shows |
| --- | --- |
| `/demo/exhibitor` | Beautiful org picker (cards with company name + event slug). |
| `/demo/exhibitor/[id]` | Booth KPI dashboard (8 metrics), relationship pipeline, AI intelligence feed preview, action row. |
| `/demo/exhibitor/[id]/products` | Booth description, knowledge sources list, read-only lead form preview. |
| `/demo/exhibitor/[id]/visitors` | Pipeline KPIs, recent activity, AI-flagged attention list. |
| `/demo/exhibitor/[id]/analytics` | Booth KPIs + pipeline bars + performance summary. |
| `/demo/exhibitor/[id]/ai-insights` | AI feed KPIs, "Since you last visited" snapshot, lead scoring. |
| `/demo/exhibitor/[id]/qr` | QR token + placeholder QR + CTA to public booth. |
| `/demo/exhibitor/[id]/preview` | Read-only preview of exactly what attendees see when they open the booth — without leaving the demo. |

Legacy `documents` and `booth` sibling routes are left intact so existing links continue to work, but the persona nav now points at the richer `products` and `preview` surfaces.

### 5. Attendee: handed off to the real experience

- The Attendee tile button now opens `/hackathon` directly.
- The standalone `/demo/attendee` page was simplified and the "Read-only" copy removed; it now exists only as a fallback route inside the demo hub and is not surfaced in the persona nav.

---

## Constraint compliance

| Constraint | Status |
| --- | --- |
| Demo uses seeded data only | **Yes** — every page reads from `getPublicDemoOverview`, `getPublicDemoAnalytics`, `getPublicDemoExhibitorDashboard`, `getPublicBooth`. |
| Read-only (no CRUD) | **Yes** — zero `POST`/`PUT`/`DELETE`. All pages are static renderers of GET responses. |
| Did not touch Hackathon | **Yes** — `apps/web/src/app/hackathon/**` is unchanged. Attendee simply links to `/hackathon`. |
| Did not touch Booths | **Yes** — booth domain code untouched; only public read endpoints used. |
| Did not touch AI | **Yes** — AI insights pages are derived purely from existing dashboard + analytics API shapes. The `packages/ai` source is unchanged. |
| Did not touch Knowledge | **Yes** — public booth `resources` are read; no knowledge sources were added or mutated. |
| Did not touch Authentication | **Yes** — zero auth changes; all demo routes remain public. |

---

## Verification

- `pnpm exec tsc --noEmit` (apps/web) — passes (`exit=0`).
- `pnpm exec eslint .` (apps/web) — passes; the single pre-existing warning in `(attendee)/e/[eventSlug]/exhibitors/[exhibitorId]/page.tsx` is unrelated to this change.

Both repo-wide pipelines were also rerun via `turbo run typecheck build lint` for the affected workspaces (cache-only for unrelated packages).

---

## Files touched

```
A  PRODUCT_REPORT.md
A  apps/web/src/components/demo/shell.tsx

M  apps/web/src/app/demo/page.tsx                                    — persona picker hub
A  apps/web/src/app/demo/organizer/layout.tsx                       — Organizer chrome + side nav

M  apps/web/src/app/demo/organizer/page.tsx                         — polished dashboard
A  apps/web/src/app/demo/organizer/events/page.tsx                  — events list (new persona section)
M  apps/web/src/app/demo/organizer/event/[slug]/page.tsx            — deep-link event detail
M  apps/web/src/app/demo/organizer/analytics/page.tsx               — analytics polish + nav
A  apps/web/src/app/demo/organizer/heatmaps/page.tsx                — standalone heatmaps page
M  apps/web/src/app/demo/organizer/ai-insights/page.tsx             — AI-titled insights with exec summary
M  apps/web/src/app/demo/organizer/reports/page.tsx                 — share-ready report

M  apps/web/src/app/demo/exhibitor/page.tsx                         — org picker cards
M  apps/web/src/app/demo/exhibitor/[eventExhibitorId]/layout.tsx    — booth-scoped chrome
M  apps/web/src/app/demo/exhibitor/[eventExhibitorId]/page.tsx      — expanded KPI dashboard

A  apps/web/src/app/demo/exhibitor/[eventExhibitorId]/products/page.tsx
A  apps/web/src/app/demo/exhibitor/[eventExhibitorId]/visitors/page.tsx
A  apps/web/src/app/demo/exhibitor/[eventExhibitorId]/preview/page.tsx

M  apps/web/src/app/demo/exhibitor/[eventExhibitorId]/analytics/page.tsx
M  apps/web/src/app/demo/exhibitor/[eventExhibitorId]/ai-insights/page.tsx
M  apps/web/src/app/demo/exhibitor/[eventExhibitorId]/qr/page.tsx
```

No files outside `apps/web/src/app/demo/**` and `apps/web/src/components/demo/**` were modified. No domain packages were touched.

# Demo Experience Audit — ExAi

> **Date:** 2026-07-21
> **Deployment:** https://ex-ai-web.vercel.app
> **Scope:** All public demo routes, simulation engine, admin panel, hackathon landing, attendee experience

---

## Overall Score: 54 / 100

| Category | Score |
|---|---|
| Homepage / Marketing | 68 |
| Organizer Demo | 58 |
| Exhibitor Demo | 55 |
| Hackathon / Attendee | 62 |
| AI Insights | 45 |
| Analytics | 60 |
| Visual Polish | 50 |
| Interaction / UX | 48 |
| Performance | 70 |
| Feature Completeness | 42 |

---

## Page-by-Page Audit

### 1. Homepage (`/`)

| Aspect | Assessment |
|---|---|
| **Purpose** | Marketing landing page — sell ExAi to three personas (organizer, exhibitor, attendee) |
| **Current State** | Static HTML with hero section, persona cards, "How it works" flow, CTA |
| **Backend Status** | None — fully static |
| **Frontend Status** | Rendered server component, no loading state needed |
| **Interactive?** | Only navigation links |
| **Demo Ready?** | Partially |
| **Issues** | Organizer persona link (`/org`) goes to the real authenticated console, not the demo. Demo visitors without an account will see a sign-in wall. Exhibitor and Attendee links go to `/demo` hub, which is correct. |
| **Suggested Improvements** | Re-target organizer link to `/demo/organizer`. Add live demo stats or an embedded preview. Add a clear "Try the Demo" CTA above the fold. |
| **Priority** | High |

---

### 2. Demo Landing (`/demo`)

| Aspect | Assessment |
|---|---|
| **Purpose** | Hub page — route visitors to organizer, exhibitor, or attendee experience |
| **Current State** | Three persona cards with dynamic stats (events, booths, visits) + error state if seed data is missing |
| **Backend Status** | `GET /v1/public/demo` — returns overview with organizers, events, exhibitors |
| **Frontend Status** | Server component, error state handled |
| **Interactive?** | Links to sub-pages only |
| **Demo Ready?** | Yes |
| **Issues** | None critical. Stats are static seed data, not simulation-driven. |
| **Suggested Improvements** | Surface simulation status (running/paused/stopped). Add a link to the admin panel. Show live visitor counter. |
| **Priority** | Low |

---

### 3. Organizer Dashboard (`/demo/organizer`)

| Aspect | Assessment |
|---|---|
| **Purpose** | Show event organizer an overview of their event portfolio with live metrics |
| **Current State** | KPI grid (events, booths, visits, conversion), LiveMetricsBar (polled every 5s), event cards, insight card, quick links |
| **Backend Status** | `GET /v1/public/demo` (overview), `GET /v1/public/demo/analytics/:eventId`, `GET /v1/public/demo/live` |
| **Frontend Status** | Server component + client-side `LiveMetricsBar`, `RecentActivityFeed`, `InsightCard` |
| **Interactive?** | Navigation links, live metrics update automatically |
| **Demo Ready?** | Yes, if simulation is running |
| **Issues** | LiveMetricsBar hidden when simulation is off. Without simulation the page is static seed data. KPI grid doesn't show `organizationId` (always empty string). |
| **Suggested Improvements** | Add simulation status indicator. Show "Start Simulation" prompt when stopped. Add trend arrows to KPIs (up/down vs previous period). |
| **Priority** | Medium |

---

### 4. Organizer Analytics (`/demo/organizer/analytics`)

| Aspect | Assessment |
|---|---|
| **Purpose** | Deep analytics view — traffic, conversions, engagement, industries, topics |
| **Current State** | KPI grid (captured visits, unique attendees, leads, conversion), pipeline bar chart, popular industries table, popular topics table |
| **Backend Status** | `GET /v1/public/demo/analytics/:eventId` — returns full analytics payload |
| **Frontend Status** | Server component, fallback states for missing data |
| **Interactive?** | Read-only |
| **Demo Ready?** | Yes |
| **Issues** | Pipeline bar chart uses hardcoded 200px height. Industries and topics tables are text-only (no charts). No date range filter. No event selector (uses first event only). |
| **Suggested Improvements** | Add event selector dropdown. Add time-series charts (visits over time). Add date range picker. Visualize industries as a pie/bar chart instead of a table. |
| **Priority** | Medium |

---

### 5. Organizer Heatmaps (`/demo/organizer/heatmaps`)

| Aspect | Assessment |
|---|---|
| **Purpose** | Visual heatmap of booth traffic across the expo floor |
| **Current State** | CSS gradient progress bars per booth — NOT a spatial floor-plan heatmap |
| **Backend Status** | `booth.heat` = `(visits / maxVisits) * 100` from analytics endpoint |
| **Frontend Status** | Cards with `bg-gradient-to-r` progress bars |
| **Interactive?** | Read-only list |
| **Demo Ready?** | No |
| **Issues** | **Not a real heatmap.** This is a ranked list with color bars, not a spatial visualization. The `FloorModule` is an empty shell. No `venues`, `floor_plans`, or `booth_positions` tables exist in the database. Visitors expecting a visual floor map will be disappointed. |
| **Suggested Improvements** | **Critical:** Implement a spatial floor-plan heatmap using SVG or Canvas. For now, rename to "Booth Traffic Ranking" to set correct expectations. Add a floor plan image overlay option. |
| **Priority** | **Critical** |

---

### 6. Organizer AI Insights (`/demo/organizer/ai-insights`)

| Aspect | Assessment |
|---|---|
| **Purpose** | AI-generated executive summary and recommendations |
| **Current State** | KPI cards + "Executive Summary" block + "What to focus on" recommendations |
| **Backend Status** | No real AI call — all text is computed client-side from analytics JSON using string templates (`renderExecutiveInsight()`, `renderFocusRecommendations()`) |
| **Frontend Status** | Renders well-styled cards with AI-like content |
| **Interactive?** | Read-only |
| **Demo Ready?** | Partially |
| **Issues** | **Not real AI.** The executive summary and recommendations are JavaScript string concatenation. The code constructs sentences like `"There are {N} unique attendees visiting {N} booths."` No NVIDIA NIM call, no LLM prompt. This is a hardcoded text template. The real AI report generation exists only in the authenticated console (`/org/events/:id/reports`), not in the demo. |
| **Suggested Improvements** | Connect to the real `OrganizerReportingService` AI pipeline, or clearly label as "Generated from analytics data". Add a "Generate AI Report" button. Show model attribution (NVIDIA NIM). |
| **Priority** | High |

---

### 7. Organizer Reports (`/demo/organizer/reports`)

| Aspect | Assessment |
|---|---|
| **Purpose** | Executive report with KPI summary and AI narrative |
| **Current State** | KPI grid + AI executive report text (same client-side template as AI Insights) |
| **Backend Status** | Same as AI insights — no real AI call in demo mode |
| **Frontend Status** | Card layout with metric rows |
| **Interactive?** | Read-only. No download/export. |
| **Demo Ready?** | Partially |
| **Issues** | Same as AI Insights — fake AI text. No PDF export in demo mode. The real console has PDF download (`/v1/organizer/events/:eventId/report.pdf`) but the demo path has no equivalent. |
| **Suggested Improvements** | Wire up real AI report generation for the demo. Add PDF download. Add "Download as PDF" and "Share" buttons. |
| **Priority** | High |

---

### 8. Exhibitor Picker (`/demo/exhibitor`)

| Aspect | Assessment |
|---|---|
| **Purpose** | Choose an exhibitor to explore their demo |
| **Current State** | Card grid of 5 exhibitors from seed data |
| **Backend Status** | `GET /v1/public/demo` — extract exhibitor list |
| **Frontend Status** | Responsive card grid with company names and logos |
| **Interactive?** | Click to navigate |
| **Demo Ready?** | Yes |
| **Issues** | Only 5 exhibitors — limited selection. No search/filter. No event context. |
| **Suggested Improvements** | Add search bar. Add industry/booth number filters. Increase to 10-20 exhibitors. |
| **Priority** | Low |

---

### 9. Exhibitor Dashboard (`/demo/exhibitor/[id]`)

| Aspect | Assessment |
|---|---|
| **Purpose** | Booth-level dashboard — performance KPIs, pipeline, AI intelligence, recent activity |
| **Current State** | 8 KPI cards, pipeline stage breakdown, AI intelligence feed, recent activity list, action links sidebar |
| **Backend Status** | `GET /v1/public/demo/exhibitor/:id/dashboard` — returns performance, pipeline, recentActivity, attention, intelligenceFeed |
| **Frontend Status** | Server component, `TrackVisit` client component |
| **Interactive?** | Navigation links, no interactive controls |
| **Demo Ready?** | Mostly |
| **Issues** | `attention[]` data from backend is never displayed — flagged/blocked relationship data exists but is invisible. Pipeline stages have no drill-down. AI Intelligence feed shows enrichment events but no real AI scoring visualization. |
| **Suggested Improvements** | Surface the `attention[]` data as a "Needs Attention" section. Add clickable pipeline bars that show attendee lists. Add trend indicators to KPIs. |
| **Priority** | Medium |

---

### 10. Exhibitor Analytics (`/demo/exhibitor/[id]/analytics`)

| Aspect | Assessment |
|---|---|
| **Purpose** | Booth-level analytics — KPIs, pipeline chart, performance summary |
| **Current State** | KPI grid, pipeline bar chart, numeric summary |
| **Backend Status** | Same dashboard endpoint |
| **Frontend Status** | Server component with live metrics |
| **Interactive?** | Read-only |
| **Demo Ready?** | Yes |
| **Issues** | Duplicates information from the main dashboard. No time-series data. No comparison (vs other booths, vs yesterday). |
| **Suggested Improvements** | Add time-based trend charts. Add benchmark comparison to booth average. |
| **Priority** | Low |

---

### 11. Exhibitor AI Insights (`/demo/exhibitor/[id]/ai-insights`)

| Aspect | Assessment |
|---|---|
| **Purpose** | AI-powered attendee intelligence and lead scoring |
| **Current State** | KPI cards (profiles enriched, complete profiles, active leads, follow-up), "Since you last visited" summary, attendee intelligence list, lead scoring |
| **Backend Status** | Dashboard endpoint — data-driven metrics, not AI-generated text |
| **Frontend Status** | Well-structured cards |
| **Interactive?** | Read-only |
| **Demo Ready?** | Partially |
| **Issues** | "Profiles enriched" label suggests AI processing, but data is from SQL aggregates. No real lead intelligence scoring is shown in the demo (the real `LeadIntelligenceService` with NVIDIA exists but is not surfaced). Attendee intelligence list is from `relationship_enrichments` — useful but not AI. |
| **Suggested Improvements** | Connect to the real lead intelligence endpoint. Show per-attendee AI scores (buying intent, summary, follow-up recommendations). Surface the AI call attribution. |
| **Priority** | High |

---

### 12. Exhibitor Products / Documents / Preview / Booth

| Aspect | Assessment |
|---|---|
| **Purpose** | Booth content management: products, knowledge sources, lead form, preview |
| **Current State** | Products page shows booth description + knowledge sources list + lead form preview. Documents page shows published sources list. Preview page shows attendee-facing booth. QR page shows token (decorative SVG, not real QR). |
| **Backend Status** | `getPublicBooth()` returns resources, leadForm |
| **Frontend Status** | Multiple sub-pages with some overlap |
| **Interactive?** | Read-only preview |
| **Demo Ready?** | Partially |
| **Issues** | 4 near-identical pages (Products, Documents, Preview, Booth) with duplicated content. QR code is a decorative SVG, not a real QR. Documents page always shows empty state if no knowledge docs are published. No lead form editor in demo. |
| **Suggested Improvements** | Consolidate into fewer pages. Generate real QR code from token. Add knowledge source upload simulation. Remove redundant pages or merge them. |
| **Priority** | Medium |

---

### 13. Exhibitor Visitors (`/demo/exhibitor/[id]/visitors`)

| Aspect | Assessment |
|---|---|
| **Purpose** | Attendee visitor list with pipeline stages |
| **Current State** | Pipeline stage KPIs (new, active, returning, needs follow-up), recent activity list, "Needs attention" flagged attendees |
| **Backend Status** | Dashboard endpoint provides pipeline + attention + recentActivity |
| **Frontend Status** | KPI row + scrollable lists |
| **Interactive?** | Read-only list |
| **Demo Ready?** | Partially |
| **Issues** | No clickable attendee rows (no drill-down to individual relationship). The "Needs attention" section is always empty because the demo dashboard endpoint might not return `attention` data. List is generic — no sorting, no filtering, no search. |
| **Suggested Improvements** | Make attendee rows clickable → navigate to relationship detail. Add search/filter. Show attendee names, companies, and AI scores. |
| **Priority** | Medium |

---

### 14. Admin Panel (`/demo/admin`)

| Aspect | Assessment |
|---|---|
| **Purpose** | Simulation control center — start/stop/pause/resume, speed, scenario, stats, activity feed |
| **Current State** | Dark-themed control panel with Start/Pause/Stop/Resume/Reset buttons, speed selector (1×, 2×, 5×, 10×), scenario picker, statistics grid, system health, activity feed. Polls every 3s. |
| **Backend Status** | Full admin API: status, stats, start, stop, pause, resume, restart, reset, speed, scenario |
| **Frontend Status** | Client component with 3s polling |
| **Interactive?** | Fully interactive — all buttons work |
| **Demo Ready?** | Yes |
| **Issues** | No authentication on admin endpoints (completely open). No visualization of simulation events (only text feed). Stats show `recentActivity` as a text list with no charting. |
| **Suggested Improvements** | Add a live event chart (events/min over time). Add per-exhibitor breakdown. Add simulation scheduling (start at specific time, run for X minutes). Add auth guard (even basic). |
| **Priority** | Medium |

---

### 15. Attendee Page (`/demo/attendee`)

| Aspect | Assessment |
|---|---|
| **Purpose** | Demo attendee hub — links to event and booth visit |
| **Current State** | Informational page with event details and links to `/e/{slug}` and `/visit/{qr}` |
| **Backend Status** | `GET /v1/public/demo` overview |
| **Frontend Status** | Simple card layout |
| **Interactive?** | Navigation only |
| **Demo Ready?** | Yes |
| **Issues** | Not an actual attendee experience — just a redirect hub. The real attendee experience is at `/visit/{qr}` and `/e/{slug}`. |
| **Suggested Improvements** | Either merge this into the Demo Landing page or enhance with a simulated attendee journey preview. |
| **Priority** | Low |

---

### 16. Hackathon (`/hackathon`)

| Aspect | Assessment |
|---|---|
| **Purpose** | Hackathon event landing page with exhibitor showcase, QR, venue info, AI chat |
| **Current State** | Full landing with hero, animated counters, searchable exhibitor grid, AI chat per booth card |
| **Backend Status** | `getPublicShowcase()` returns exhibitor list |
| **Frontend Status** | Client component with skeletons, error banner, full interaction |
| **Interactive?** | Search, filter, "Ask AI" buttons, "Visit Booth" links |
| **Demo Ready?** | Mostly |
| **Issues** | "Visit Booth" link goes to `#` if exhibitor has no `publicQrToken`. "Ask AI" also disabled if no token. `Website` link generates fake URLs (`https://{company}.com`) for exhibitors without websites. The event entrance QR is decorative. |
| **Suggested Improvements** | Hide or disable buttons when dependencies are missing. Show proper QR code. Add proper error handling for missing data. |
| **Priority** | Medium |

---

### 17. Booth Visit (`/visit/[publicQrToken]`)

| Aspect | Assessment |
|---|---|
| **Purpose** | Full attendee booth experience: AI chat, resource browsing, lead capture flow |
| **Current State** | 6-step flow: landing → email (magic link) → sent → profile → lead form → success with recommendations. AI chat assistant, resource downloads. |
| **Backend Status** | Full API support: booth info, AI chat (RAG with NVIDIA), enrollment, profile update, lead submission |
| **Frontend Status** | Client component with `useTransition`, step-based flow, skeleton loading |
| **Interactive?** | Fully interactive — chat, form, navigation |
| **Demo Ready?** | Yes (this is the most polished feature) |
| **Issues** | Magic link auth requires real Supabase — works but adds friction in demo. The AI chat returns real NVIDIA responses but cold-start latency can be slow (NVIDIA API call). Enrollment flow has 6 steps — long for a quick demo tour. |
| **Suggested Improvements** | Add a "Quick Demo" mode that skips auth steps. Add connection timeout handling for slow AI responses. Show typing indicator during AI generation. |
| **Priority** | Medium |

---

### 18. Real Console (`/org/*`) vs Portal (`/exhibit/*`)

| Aspect | Assessment |
|---|---|
| **Purpose** | Authenticated organizer console and exhibitor portal for real events |
| **Current State** | Feature-rich authenticated pages with real API calls, AI report generation, lead management, document upload, QR generation |
| **Backend Status** | Full API with auth guards, organization-scoped |
| **Frontend Status** | Server components with auth session, loading states, error boundaries |
| **Interactive?** | CRUD operations, form submissions, file uploads |
| **Demo Ready?** | Not directly — requires authenticated account |
| **Issues** | These pages are production-ready but hidden behind auth. Demo visitors can't access them. The demo mode has simplified versions that don't match feature parity. |
| **Suggested Improvements** | Consider a sandbox/demo account that auto-logs in to a pre-seeded organization. Or expose key console features in the demo mode. |
| **Priority** | Medium |

---

## Feature Completeness Matrix

| Feature | Implemented? | Connected to Backend? | Uses Live Demo Data? | Uses Simulation? | Uses Real AI? | Visually Polished? | Actually Useful? |
|---|---|---|---|---|---|---|---|
| Organizer Heatmaps | Partial | Yes | Yes | No | No | No | No |
| Organizer Analytics | Yes | Yes | Yes | Partial | No | Yes | Yes |
| Organizer AI Insights | Partial | Yes | Yes | No | **No (fake)** | Yes | Partial |
| Organizer Reports | Partial | Yes | Yes | No | **No (fake)** | Yes | Partial |
| Exhibitor Dashboard | Yes | Yes | Yes | Partial | No | Yes | Yes |
| Exhibitor Analytics | Yes | Yes | Yes | Partial | No | Yes | Yes |
| Exhibitor AI Insights | Partial | Yes | Yes | No | **No (fake)** | Yes | Partial |
| Exhibitor Visitors | Partial | Yes | Yes | No | No | Yes | Partial |
| Exhibitor Products | Yes | Yes | Yes | No | No | Yes | Yes |
| Exhibitor QR | Partial | Yes | Yes | No | No | Yes | Yes |
| Booth Preview | Yes | Yes | Yes | No | No | Yes | Yes |
| Admin Panel | Yes | Yes | Yes | Yes | No | Yes | Yes |
| Live Metrics Bar | Yes | Yes | Yes | Yes | No | Yes | Yes |
| Recent Activity Feed | Yes | Yes | Yes | Yes | No | Yes | Yes |
| Booth Chat (AI RAG) | Yes | Yes | Yes | No | **Yes (NVIDIA)** | Yes | Yes |
| Lead Intelligence | Yes | Yes | Yes | No | **Yes (NVIDIA)** | Yes | Yes |
| Reports (Real Console) | Yes | Yes | No | No | **Yes (NVIDIA)** | Partial | Yes |
| Visitor Timelines | No | Yes | No | No | No | No | No |
| Save/Bookmark Exhibitors | Yes | Yes | No | No | No | Yes | Yes |
| Attendee Profile | Yes | Yes | No | No | No | Yes | Yes |
| Lead Form Submission | Yes | Yes | Yes | Partial | No | Yes | Yes |
| Meeting Scheduling | No | Yes (db schema) | No | No | No | No | No |
| Product Search | Yes | Yes | Yes | No | No | Yes | Yes |
| Exhibitor Filtering | Yes | Yes | Yes | No | No | Yes | Yes |

---

## Data Verification

### What Data Exists in the Database But Is Never Surfaced in the UI

| Data | Table/Service | Where It Should Appear |
|---|---|---|
| `exhibitor_relationships` flagged items (`has_potential_duplicate`) | `exhibitor_dashboard.repository.ts` → `attention[]` | Exhibitor Dashboard "Needs Attention" section — backend returns it, frontend ignores it |
| `topBooth` | `DemoAnalyticsStore.getLiveMetrics()` | Admin panel / Organizer dashboard — computed but never displayed |
| Per-booth live breakdown (`liveMetricsByBooth`) | `DemoAnalyticsStore` | Available from live endpoint, only `Object.keys().length` is used (active booth count) |
| `uniqueVisitors` per booth | Analytics SQL query | Backend returns it but it equals `visits` (likely bug) and is not displayed |
| `suggested_question_click` events | Simulation engine type | Tracked type but never emitted by simulation or consumed by frontend |
| `product_view` events | Simulation engine type | Emitted by simulation but no frontend counter displays them |
| Booth-level `liveBoothMetrics` (`getDemoLiveBoothMetrics`) | `public-exhibitors.service.ts` | API + api-client wrapper exist but **zero** frontend imports |
| `agenda_sessions` | Database schema `events-floor.ts` | Table exists, no frontend page queries it |
| `exhibitor_dashboard_visits` | Aggregated by repository | Used internally but not exposed in any demo endpoint |
| Attendee company/job title | `attendee_profiles` | Returned in some endpoints but not shown in exhibitor visitor list |

### Empty States / Placeholder / Static Values

| Location | What |
|---|---|
| `org/events/[eventId]/documents` | Fully placeholder — "No event documents have been published." No upload, no CRUD. |
| `exhibit/[organizationId]/team` | Shows only current user email — no team management. Heading says "Manage your booth staff" but nothing is manageable. |
| `/admin` | Fully hardcoded KPIs ("12", "3", "1,247"), static system events, static service status. No data fetching. |
| `/showcase` | Redirect only — exists but not linked from anywhere. |
| Demo AI Insights / Reports | All text is client-side string concatenation, not real AI generation. |
| Demo QR codes | Decorative SVG — not actual QR encoding. |

---

## UX Issues

| Issue | Location | Details |
|---|---|---|
| **Dead "Visit Booth" buttons** | Hackathon landing | Buttons link to `#` when `publicQrToken` is null — still visible and clickable |
| **Dead "Ask AI" buttons** | Hackathon landing | Same — visible but disabled when no token |
| **Fake website links** | Showcase exhibitor cards | Generates `https://{company}.com` when no website URL exists |
| **Misleading persona link** | Homepage | "View organizer demo" → `/org` (real console, requires auth) instead of `/demo/organizer` |
| **Silent bookmark failure** | Attendee exhibitor page | Save button silently does nothing when unauthenticated (`if (!session) return;`) |
| **Duplicate exhibitor pages** | Demo exhibitor sub-pages | Products, Documents, Preview, Booth pages overlap heavily — confusing navigation |
| **No loading skeletons** | Demo server pages | No `loading.tsx` — entire page blocks until data arrives |
| **No error boundaries** | Most pages | Errors caught with `.catch(() => null)` — component just disappears |
| **Read-only demo** | All demo pages | No way to interact, edit, or change anything (except admin panel) |
| **Simulation not auto-started** | Production | Auto-start disabled in production — demo feels dead until admin manually starts it |

---

## Backend Capabilities Hidden From Users

| Capability | Exists In | How to Surface |
|---|---|---|
| Simulation engine | `DemoSimulationService` | Start from admin panel (done), but needs public-facing indicator on all demo pages |
| Scenario switching | `DemoScenarioService` | Only in admin panel — expose on organizer dashboard as well |
| Real AI report generation | `OrganizerReportingService` (NVIDIA) | Wire up to demo reports page instead of fake text |
| Real lead intelligence scoring | `LeadIntelligenceService` (NVIDIA) | Surface AI scores per attendee in exhibitor demo |
| Per-booth live metrics | `GET /v1/public/demo/exhibitor/:id/live` | API + client exist but no frontend consumes it |
| Booth attendance data | Backend has `attention[]` | Add "Needs Attention" section to exhibitor dashboard |
| Booths by popularity/heat | Analytics endpoint | Already used as progress bars — needs spatial visualization |
| Knowledge document upload | `kb_sources` + `files` | Not exposed in demo — only in real console |
| Lead form designer | `lead_forms` + `lead_form_fields` | Not exposed in demo |
| Organizer member management | Organization roles + invitations | Not exposed in demo |
| Exhibitor team management | Organization memberships | `/exhibit/[orgId]/team` is a placeholder |

---

## Performance Issues

| Issue | Details |
|---|---|
| **No loading.tsx on demo pages** | All demo server components use `dynamic = 'force-dynamic'` but have no streaming skeleton — full page blocks on data fetch |
| **Admin panel polls every 3s** | Two separate poll loops (status + stats) fire on the same interval — could batch into one call |
| **LiveMetricsBar polls every 5s** | Runs independently of page data — adds unnecessary requests when simulation is off (hidden, but timer still runs) |
| **No image optimization** | Company logos / branding elements may not use Next.js `Image` component |
| **No bundle analysis** | `index` lambda: 1.24MB — moderate for a Next.js app but could be optimized |
| **Animation opportunities** | KPI counters could animate on scroll. Heatmap bars could animate on data change. Activity feed could use enter/exit transitions. |

---

## Top 20 Improvements by Impact

### Critical

| # | Improvement | Category | Effort |
|---|---|---|---|
| 1 | **Implement spatial floor-plan heatmap** — Replace CSS progress bars with an SVG/Canvas floor map showing actual booth positions. Requires `FloorModule` implementation + venue geometry tables. | Visual | Large |
| 2 | **Fix "View Organizer Demo" link on homepage** — Re-target from `/org` to `/demo/organizer`. Current link breaks for demo visitors. | UX | Trivial |
| 3 | **Wire real AI generation to demo reports + insights** — Replace client-side string templates with NVIDIA LLM calls using the existing `OrganizerReportingService` pipeline. | Data | Medium |

### High

| # | Improvement | Category | Effort |
|---|---|---|---|
| 4 | **Surface `attention[]` data on exhibitor dashboard** — The backend returns flagged/blocked relationships but the frontend never renders them. Simple mapping fix. | Data | Small |
| 5 | **Enable simulation auto-start in production** — Set `DEMO_SIMULATION_AUTO_START=true` env var so the demo feels alive on load. | UX | Trivial |
| 6 | **Replace fake QR SVGs with real generated QR codes** — Use the `qrcode` package (already a dependency) to encode actual `publicQrToken` values. | Visual | Small |
| 7 | **Add loading skeletons to all demo pages** — Create `loading.tsx` files for every demo route. Currently full-page blocking on data fetch. | UX | Medium |
| 8 | **Consolidate duplicate exhibitor sub-pages** — Products, Documents, Preview, Booth are 4 near-identical pages. Merge into 2. | UX | Medium |
| 9 | **Remove dead "Visit Booth" / "Ask AI" buttons** — When `publicQrToken` is null, hide or disable buttons instead of linking to `#`. | UX | Small |
| 10 | **Populate `/admin` with real data** — Replace hardcoded KPIs with actual API calls. This is the platform admin page, not the demo admin. | Data | Medium |

### Medium

| # | Improvement | Category | Effort |
|---|---|---|---|
| 11 | **Implement the orphaned per-booth live metrics endpoint** — `getDemoLiveBoothMetrics()` has API + client but no frontend page uses it. Add a live metrics card to exhibitor dashboard. | Feature | Small |
| 12 | **Add time-series charts to analytics pages** — Currently no charting library is used. Add recharts or similar for visit trends, lead trends, etc. | Visual | Medium |
| 13 | **Add event selector to organizer analytics** — Currently uses the first event only. Allow switching between events. | UX | Small |
| 14 | **Add attendee drill-down to visitor list** — Make rows clickable → relationship detail page with AI scores and interaction history. | Feature | Medium |
| 15 | **Fix marketing homepage — Organizer link** (duplicate of #2, already listed as Critical) | — | — |
| 16 | **Add date range filtering to analytics** — Allow filtering by date range. Simulation generates timestamps — use them. | Feature | Medium |
| 17 | **Add proper error boundaries** — Replace `.catch(() => null)` patterns with React error boundaries that show meaningful fallback UI. | UX | Medium |
| 18 | **Implement `/exhibit/[orgId]/team` with real team management** — Currently shows only user email with empty placeholder. | Feature | Medium |
| 19 | **Add simulation status indicator to all demo pages** — Show a small badge (Running / Paused / Stopped) on every demo page so visitors know if data is live. | UX | Small |
| 20 | **Batch admin panel polls** — Merge the two 3s-interval polls (status + stats) into a single call. | Performance | Small |

### Low

| # | Improvement | Category | Effort |
|---|---|---|---|
| — | Add search/filter to exhibitor picker | UX | Small |
| — | Add trend arrows to KPI cards (up/down arrow vs previous period) | UX | Small |
| — | Animate KPI counters on scroll/load | Visual | Small |
| — | Add keyboard shortcuts to admin panel (space to toggle play/pause) | UX | Small |
| — | Remove `/showcase` redirect or give it content | Content | Small |
| — | Implement `/org/events/[eventId]/documents` with real document management | Feature | Large |
| — | Add industry breakdown pie/bar chart to analytics | Visual | Medium |

---

## Detailed References

| File | Role |
|---|---|
| `apps/web/src/app/(marketing)/page.tsx` | Homepage (static) — Organizer link points to `/org` instead of `/demo/organizer` |
| `apps/web/src/app/demo/page.tsx` | Demo landing hub |
| `apps/web/src/app/demo/organizer/page.tsx` | Organizer dashboard |
| `apps/web/src/app/demo/organizer/analytics/page.tsx` | Static analytics page with KPI grid |
| `apps/web/src/app/demo/organizer/heatmaps/page.tsx` | CSS progress bar "heatmap" |
| `apps/web/src/app/demo/organizer/ai-insights/page.tsx` | Fake AI insight page (client-side template) |
| `apps/web/src/app/demo/organizer/reports/page.tsx` | Fake report page (client-side template) |
| `apps/web/src/app/demo/exhibitor/[eventExhibitorId]/page.tsx` | Exhibitor dashboard |
| `apps/web/src/app/demo/exhibitor/[eventExhibitorId]/analytics/page.tsx` | Exhibitor analytics |
| `apps/web/src/app/demo/exhibitor/[eventExhibitorId]/ai-insights/page.tsx` | Exhibitor AI insights (fake) |
| `apps/web/src/app/demo/exhibitor/[eventExhibitorId]/visitors/page.tsx` | Exhibitor visitor list |
| `apps/web/src/app/demo/exhibitor/[eventExhibitorId]/qr/page.tsx` | Decorative QR code page |
| `apps/web/src/app/demo/admin/page.tsx` | Full simulation control panel |
| `apps/web/src/app/demo/attendee/page.tsx` | Attendee hub |
| `apps/web/src/app/hackathon/page.tsx` | Hackathon landing |
| `apps/web/src/app/hackathon/expo/page.tsx` | Expo floor page |
| `apps/web/src/app/(attendee)/visit/[publicQrToken]/page.tsx` | Booth visit experience (most polished feature) |
| `apps/web/src/app/(console)/org/events/[eventId]/reports/page.tsx` | Real AI report page (authenticated) |
| `apps/web/src/app/(admin)/admin/page.tsx` | Hardcoded admin page |
| `apps/web/src/components/demo/live-metrics.tsx` | LiveMetricsBar (polls every 5s) |
| `apps/web/src/components/demo/shell.tsx` | Demo layout shell |
| `apps/api/src/modules/engagement/public-demo.controller.ts` | Demo overview + analytics + live endpoints |
| `apps/api/src/modules/engagement/public-exhibitors.service.ts` | Demo exhibitor dashboard + analytics SQL |
| `apps/api/src/modules/engagement/demo-simulation.service.ts` | Simulation engine |
| `apps/api/src/modules/engagement/demo-scenario.service.ts` | Scenario state machine |
| `apps/api/src/modules/engagement/demo-analytics.store.ts` | In-memory event store |
| `apps/api/src/modules/engagement/demo-admin.controller.ts` | Admin API |
| `apps/api/src/modules/engagement/lead-intelligence.service.ts` | Real AI lead scoring (NVIDIA) |
| `apps/api/src/modules/engagement/organizer-reporting.service.ts` | Real AI report generation (NVIDIA) |
| `apps/api/src/modules/engagement/platform-enrollment.service.ts` | Booth chat + enrollment + lead submission |
| `apps/api/src/modules/floor/floor.module.ts` | Empty shell — no heatmap capability |
| `packages/database/schema/engagement.ts` | Engagement tables schema |
| `packages/database/schema/events-floor.ts` | Events + agenda sessions |
| `packages/ai/src/generation/ai-generation.service.ts` | NVIDIA NIM integration |
| `packages/ai/src/retrieval/retrieval.service.ts` | Vector search for booth chat |
| `packages/api-client/src/engagement.ts` | API client wrappers |

---

## Scoring Methodology

- **Homepage/Marketing**: Static content quality, persona messaging, CTA clarity, mobile responsiveness
- **Organizer Demo**: Feature completeness, data accuracy, simulation integration, AI authenticity
- **Exhibitor Demo**: Booth management features, visitor tracking, analytics depth, AI authenticity
- **Hackathon/Attendee**: Registration flow, booth browsing, AI chat, lead capture flow
- **AI Insights**: Real AI vs fake AI, prompt quality, model attribution, usefulness of output
- **Analytics**: Charting depth, drill-down capability, time-series data, filtering
- **Visual Polish**: Layout quality, spacing, color usage, animation, consistency
- **Interaction/UX**: Dead clicks, loading states, error handling, navigation clarity, feedback
- **Performance**: Loading speed, bundle size, skeleton screens, polling efficiency
- **Feature Completeness**: What exists vs what the schema/API supports vs what's visible

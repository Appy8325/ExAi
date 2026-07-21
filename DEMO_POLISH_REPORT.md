# Demo Polish Report — ExAi

> **Date:** 2026-07-21
> **Deployment:** https://ex-ai-web.vercel.app
> **Based on:** DEMO_EXPERIENCE_AUDIT.md
> **Objective:** Classify every component, eliminate placeholders, specify data needs

---

## COMPONENT CLASSIFICATION

### TIER 1: PRODUCTION READY
*Uses real backend data, fully interactive, demonstrates complete capability*

---

#### Demo Landing — `/demo`
| Attribute | Value |
|---|---|
| **Classification** | Production Ready |
| **Backend** | `GET /v1/public/demo` — live seed data |
| **What works** | 3 persona cards, dynamic stats (events: 1, exhibitors: 5), error state when data missing |
| **Interaction** | Navigation links to sub-demos |
| **Verdict** | Solid. Only needs simulation status indicator to feel alive. |

---

#### Organizer Dashboard — `/demo/organizer`
| Attribute | Value |
|---|---|
| **Classification** | Production Ready |
| **Backend** | `GET /v1/public/demo`, `GET /v1/public/demo/live`, `getPublicDemoAnalytics()` |
| **What works** | KPI grid (events, booths, visits, conversion), LiveMetricsBar (5s polling), event cards, insight card, quick links |
| **Interaction** | Live metrics update every 5s. Simulation data flows when running. |
| **Verdict** | Complete. Only improvement: show simulation state and offer to start it. |

---

#### Organizer Events — `/demo/organizer/events`
| Attribute | Value |
|---|---|
| **Classification** | Production Ready |
| **Backend** | `getPublicDemoOverview()` + `getPublicDemoAnalytics()` per event |
| **What works** | Event list with per-event analytics: booths, visits, leads, conversion rates |
| **Interaction** | Click → event detail, analytics, heatmaps, insights, reports |
| **Verdict** | Works. Could use a "Create Event" placeholder to show the full organizer flow. |

---

#### Organizer Analytics — `/demo/organizer/analytics`
| Attribute | Value |
|---|---|
| **Classification** | Production Ready |
| **Backend** | `GET /v1/public/demo/analytics/:eventId` — full traffic, conversions, engagement, industries, topics |
| **What works** | KPI grid, pipeline bar chart, popular industries table, popular topics table |
| **Missing** | Time-series charts, event selector dropdown, date range filter |
| **Verdict** | Functional. Needs visual charts to feel impressive — currently text tables only. |

---

#### Organizer Event Detail — `/demo/organizer/event/[slug]`
| Attribute | Value |
|---|---|
| **Classification** | Production Ready |
| **Backend** | `getPublicDemoOverview()` + `getPublicDemoAnalytics()` |
| **What works** | Event header, booth list, links to analytics/heatmaps/insights/reports/public page |
| **Interaction** | Navigation hub |
| **Verdict** | Solid entry point. Works correctly. |

---

#### Exhibitor Picker — `/demo/exhibitor`
| Attribute | Value |
|---|---|
| **Classification** | Production Ready |
| **Backend** | `getPublicDemoOverview()` |
| **What works** | Card grid of 5 exhibitors, company names, industry tags |
| **Limitation** | Only 5 exhibitors. No search/filter. |
| **Verdict** | Works. Add search + more exhibitors (10–20) for better demo impact. |

---

#### Exhibitor Dashboard — `/demo/exhibitor/[id]`
| Attribute | Value |
|---|---|
| **Classification** | Production Ready |
| **Backend** | `GET /v1/public/demo/exhibitor/:id/dashboard` |
| **What works** | 8 KPI cards, pipeline stages (new/active/returning/needs follow-up), intelligence feed, recent activity, action links |
| **Hidden data** | `attention[]` (flagged relationships) — returned by API, never rendered |
| **Verdict** | One of the stronger demo pages. Surface `attention[]` for completeness. |

---

#### Exhibitor Analytics — `/demo/exhibitor/[id]/analytics`
| Attribute | Value |
|---|---|
| **Classification** | Production Ready |
| **Backend** | Same dashboard endpoint as parent |
| **What works** | KPI grid, pipeline bar, performance summary |
| **Duplication** | Heavily overlaps with exhibitor dashboard — same data, different layout |
| **Verdict** | Works but redundant. Consider hiding or merging with parent dashboard. |

---

#### Exhibitor Visitors — `/demo/exhibitor/[id]/visitors`
| Attribute | Value |
|---|---|
| **Classification** | Production Ready — but underutilized |
| **Backend** | Dashboard endpoint (pipeline, attention, recentActivity) |
| **What works** | Pipeline KPIs, activity list |
| **What could work** | Attendee drill-down with names, companies, AI scores |
| **Verdict** | Framework exists, needs richer data (actual attendee names instead of IDs) |

---

#### Exhibitor Products — `/demo/exhibitor/[id]/products`
| Attribute | Value |
|---|---|
| **Classification** | Production Ready |
| **Backend** | `getPublicBooth()` — resources, lead form preview |
| **What works** | Booth description, knowledge sources list, lead form preview |
| **Verdict** | Good for showing content management capability. |

---

#### Exhibitor Documents — `/demo/exhibitor/[id]/documents`
| Attribute | Value |
|---|---|
| **Classification** | Production Ready |
| **Backend** | `getPublicBooth()` |
| **What works** | List of published knowledge sources with View links |
| **Verdict** | Simple but functional. |

---

#### Exhibitor Booth / Preview — `/demo/exhibitor/[id]/booth`, `preview`
| Attribute | Value |
|---|---|
| **Classification** | Production Ready |
| **Backend** | `getPublicBooth()` |
| **What works** | Full booth profile, attendee-facing view |
| **Verdict** | Duplicate pages. Consolidate into one. |

---

#### Exhibitor QR — `/demo/exhibitor/[id]/qr`
| Attribute | Value |
|---|---|
| **Classification** | Production Ready (data) — but visual is a placeholder |
| **Backend** | `getPublicDemoOverview()` returns `publicQrToken` |
| **What works** | Token displayed correctly. |
| **Visual** | SVG illustration, not a real QR code. |
| **Verdict** | Data is correct. Visual replacement is a 30-min fix (see §Data Additions). |

---

#### Attendee Hub — `/demo/attendee`
| Attribute | Value |
|---|---|
| **Classification** | Production Ready |
| **Backend** | `getPublicDemoOverview()` |
| **What works** | Event details + links to real attendee flows |
| **Verdict** | Informational hub works. Acts as a signpost. |

---

#### Admin Panel — `/demo/admin`
| Attribute | Value |
|---|---|
| **Classification** | Production Ready |
| **Backend** | Full admin API: status, stats, start, stop, pause, resume, reset, speed, scenario |
| **What works** | Every button is functional. Polling every 3s. Scenario switching works. Speed control works. |
| **Verdict** | Best interactive demo feature. Add event chart (events/min over time) to make it more visual. |

---

#### Booth Visit Experience — `/visit/[publicQrToken]`
| Attribute | Value |
|---|---|
| **Classification** | Production Ready — **most polished feature** |
| **Backend** | Full pipeline: `getPublicBooth()`, `POST /booths/:token/enroll`, `POST /booths/:token/chat`, `PUT /attendee/profile`, `POST /booths/:token/submissions` |
| **What works** | 6-step flow: landing → email → sent → profile → form → success. Real AI chat (NVIDIA RAG). Real lead submission. |
| **AI integration** | Real NVIDIA NIM calls with vector search on kb_chunks |
| **Verdict** | The strongest proof-of-concept in the demo. Refine latency (add typing indicator) and skip-auth mode for quick demos. |

---

#### Hackathon Landing — `/hackathon`
| Attribute | Value |
|---|---|
| **Classification** | Production Ready — with live UX bugs |
| **Backend** | `getPublicShowcase()` — exhibitor list |
| **What works** | Searchable exhibitor grid, animated counters, AI chat buttons per card |
| **Bugs** | "Visit Booth" links to `#` when no token. "Ask AI" same. Fake website URLs when missing. |
| **Verdict** | Core UX is sound. Fix the dead buttons (hide when no token). |

---

#### Hackathon Expo — `/hackathon/expo`
| Attribute | Value |
|---|---|
| **Classification** | Production Ready — with same UX bugs |
| **Backend** | Same as hackathon landing |
| **What works** | Search + filter + exhibitor grid with product dialogs |
| **Bugs** | Same dead link issues |
| **Verdict** | Good. Same fixes as hackathon landing apply. |

---

#### E/Event Exhibitor Directory — `/e/[eventSlug]`
| Attribute | Value |
|---|---|
| **Classification** | Production Ready |
| **Backend** | `getPublicEventBySlug()`, `getEventExhibitors()` (with debounced search) |
| **What works** | Exhibitor list with search, featured section, alphabetical grouping |
| **Verdict** | Clean and functional. Works well. |

---

#### E/Exhibitor Detail — `/e/[eventSlug]/exhibitors/[id]`
| Attribute | Value |
|---|---|
| **Classification** | Production Ready |
| **Backend** | `getPublicEventBySlug()`, `getEventExhibitor()`, `getPublicShowcase()` |
| **What works** | Full exhibitor profile: gradient header, logo, description, social links, save/bookmark toggle (auth), "Ask AI" + "Booth briefing" buttons, brochure download |
| **Verdict** | Rich and complete. Bookmark requires auth (expected). |

---

#### E/Exhibitor Insights — `/e/[eventSlug]/exhibitors/[id]/insights`
| Attribute | Value |
|---|---|
| **Classification** | Production Ready |
| **Backend** | `getPublicEventBySlug()`, `getEventExhibitor()` |
| **What works** | Briefing page: "What they offer" + "Ways to connect" sections |
| **Verdict** | Clean and useful. |

---

#### E/Saved Exhibitors — `/e/[eventSlug]/saved`
| Attribute | Value |
|---|---|
| **Classification** | Production Ready |
| **Backend** | `getSavedRelationships()` with auth |
| **What works** | Saved exhibitor list, auth-gated |
| **Verdict** | Works as expected. |

---

#### Attendee Profile — `/account/profile`
| Attribute | Value |
|---|---|
| **Classification** | Production Ready |
| **Backend** | `updateAttendeeProfile()` with Supabase auth |
| **What works** | Profile form with full validation |
| **Verdict** | Functional. |

---

#### Auth Flow — `/auth`, `/auth/invitation`, `/auth/complete`
| Attribute | Value |
|---|---|
| **Classification** | Production Ready |
| **Backend** | Supabase Auth + organizer invitation acceptance API |
| **What works** | Magic link sign-in, invitation acceptance, OAuth completion |
| **Verdict** | Solid authentication UX. |

---

### TIER 2: NEEDS BETTER DESIGN
*Backend is complete, data exists, but UX/UI does not adequately showcase it*

---

#### Organizer Heatmaps — `/demo/organizer/heatmaps`

| Attribute | Value |
|---|---|
| **Backend** | `GET /v1/public/demo/analytics/:eventId` returns `booth.heat = (visits / maxVisits) * 100` |
| **Data quality** | Excellent — real visit counts from `exhibitor_relationships` |
| **Problem** | Data is rendered as **CSS gradient progress bars in a card list** — not a spatial floor map |
| **What users expect** | A visual floor plan with color-coded booth positions |
| **What they get** | A ranked list with colored bars |
| **Fix** | Either: (a) implement a real spatial SVG/Canvas floor map using `FloorModule`, OR (b) rename the page to "Booth Traffic Ranking" and add a bar chart visualization to set correct expectations |
| **Effort to fix** | Low (rename + add chart) to High (spatial floor map) |
| **Priority** | High — first impression of "heatmap" feature is underwhelming |

---

#### Organizer Analytics — `/demo/organizer/analytics`

| Attribute | Value |
|---|---|
| **Backend** | Full analytics payload: traffic, conversions, engagement, industries, topics |
| **Data quality** | Good — live from seeded DB + simulation |
| **Problem** | Industries and topics are **text tables** with no visualization. Pipeline bar chart is a single static bar. |
| **What users expect** | Bar/pie charts, trend lines, time-series data |
| **What they get** | Numbers in table cells |
| **Fix** | Add a bar chart for industries (top 8), a line/trend chart for traffic over time, event date range selector |
| **Effort** | Low — add recharts or similar charting library, wire to existing data |
| **Priority** | Medium |

---

#### Exhibitor Visitors — `/demo/exhibitor/[id]/visitors`

| Attribute | Value |
|---|---|
| **Backend** | `pipeline[]`, `attention[]`, `recentActivity[]` from dashboard endpoint |
| **Data quality** | Good structure, poor display |
| **Problem** | Attendee list shows generic rows. No names. No company names. No AI scores. No drill-down. The `attention[]` data (flagged relationships) is invisible. |
| **What users expect** | Attendee names, companies, buying intent scores, interaction history |
| **What they get** | Relationship IDs and type labels |
| **Fix** | Fetch actual attendee names from the API. Surface `attention[]` as "⚠️ Needs Attention" section. Make rows clickable → relationship detail. |
| **Effort** | Medium |
| **Priority** | High |

---

#### Exhibitor AI Insights — `/demo/exhibitor/[id]/ai-insights`

| Attribute | Value |
|---|---|
| **Backend** | Dashboard endpoint — data-driven metrics from `relationship_enrichments`, `exhibitor_dashboard_visits` |
| **Data quality** | Real metrics, but labeled as "AI Insights" when it's just SQL aggregates |
| **Problem** | "Profiles enriched" and "complete profiles" are aggregate counts — not AI-generated text. The real `LeadIntelligenceService` (NVIDIA AI) scores individual leads but this data is **not surfaced** in the demo exhibitor views. |
| **What users expect** | AI-generated buying intent scores, follow-up email suggestions, lead summaries per attendee |
| **What they get** | Metric cards saying "12 profiles enriched" |
| **Fix** | Wire the `LeadIntelligenceService` data to per-attendee display. Show buying intent score, AI summary, and follow-up recommendation per visitor. |
| **Effort** | Medium |
| **Priority** | High |

---

#### Admin Panel — `/demo/admin`

| Attribute | Value |
|---|---|
| **Backend** | Full simulation API |
| **Data quality** | Real events, real stats |
| **Problem** | Activity feed is text-only. No visual chart of simulation activity. No per-exhibitor breakdown. |
| **What users expect** | A live dashboard showing simulation events as they happen |
| **What they get** | A scrolling list of text events every few seconds |
| **Fix** | Add a live bar/line chart showing events per minute. Add a per-booth live breakdown table. |
| **Effort** | Low |
| **Priority** | Low |

---

### TIER 3: NEEDS BETTER DEMO DATA
*Component works, but data is sparse, repetitive, or uninteresting*

---

#### Exhibitor Picker — `/demo/exhibitor`

| Current state | 5 exhibitors: Northstar Cloud, Meridian AI, Apex Systems, Cascade Analytics, Vertex Innovation |
|---|---|
| **Problem** | Only 5 companies. All tech industry. No variation in booth sizes, product types, or company maturity. |
| **What would improve** | 10–15 exhibitors across multiple industries (healthcare, finance, retail, manufacturing). Varied booth numbers (A-101 to F-215). Realistic company sizes and descriptions. |
| **Effort** | Low — update `packages/database/seed/demo_seed.json` with more exhibitors |
| **Priority** | Medium |

---

#### Hackathon Landing — `/hackathon`

| Current state | Showcase with ~5 exhibitors, animated counters (200 attendees, 5 exhibitors, 50+ interactions) |
|---|---|
| **Problem** | Animated counters show hardcoded values. The "50+ live interactions" is a static counter. Event entrance QR is decorative. Venue details are minimal. |
| **What would improve** | Wire animated counters to live simulation stats. Generate event entrance QR that actually links to a registration flow. Add venue floor plan thumbnail. |
| **Effort** | Medium |
| **Priority** | Medium |

---

#### Demo Landing — `/demo`

| Current state | Stats show events: 1, exhibitors: 5, visitors: 200 |
|---|---|
| **Problem** | Numbers are static seed counts. If simulation isn't running, they never change. |
| **What would improve** | Show live counter (e.g., "1,247 interactions today") powered by `GET /v1/public/demo/live`. Add simulation status badge. |
| **Effort** | Low |
| **Priority** | Low |

---

#### Organizer Reports — `/demo/organizer/reports`

| Current state | Fake AI text using client-side string templates |
|---|---|
| **Problem** | No real data to generate a compelling report narrative |
| **What would improve** | Add time-series simulation run — let the simulation run for 10 minutes, then show a real AI-generated report with actual trends, peaks, anomalies. Add a "Generate Report" button that triggers real NVIDIA NIM call. |
| **Effort** | Medium (wire real AI) |
| **Priority** | High |

---

### TIER 4: PLACEHOLDER
*Static content, fake values, empty state, template text, generic cards*

---

#### Organizer AI Insights — `/demo/organizer/ai-insights`
| Status | **PLACEHOLDER — Replace with real backend data** |
|---|---|
| **Current** | Client-side string concatenation: `Executive summary: There are {N} unique attendees visiting {N} booths. Capture rate is {N}%.` |
| **Backend reality** | The real `OrganizerReportingService` exists in the authenticated console and generates real NVIDIA AI reports. It is NOT wired to the demo. |
| **Recommended action** | Wire `OrganizerReportingService.generate()` to demo reports page. If AI generation is too slow/costly for a demo, add a "Demo Mode" label and show a pre-generated sample report. |
| **Do NOT** | Leave fake AI text that gives visitors the wrong impression. |
| **Effort** | Medium — reuse existing service with a demo event ID |
| **Priority** | High |

---

#### Organizer Reports — `/demo/organizer/reports` (duplicate issue)
| Status | **PLACEHOLDER — Same as AI Insights** |
|---|---|
| **Current** | Same string template content as AI Insights page |
| **Recommended action** | Same as above. Reports and AI Insights should either share real AI data or clearly be labeled as "Based on sample data." |
| **Effort** | Medium |
| **Priority** | High |

---

#### Console Documents — `/org/events/[eventId]/documents`
| Status | **PLACEHOLDER — Should be hidden or completed** |
|---|---|
| **Current** | `return <div><p>No event documents have been published.</p></div>` — literally one line |
| **Backend** | Files can be uploaded via `files` table + `kb_sources`. The feature exists in the database. |
| **Recommended action** | Implement document management UI (upload, list, delete) using the existing file storage. Or hide this page from navigation until implemented. Do not show an empty white card. |
| **Effort** | Medium |
| **Priority** | Medium |

---

#### Exhibitor Team — `/exhibit/[organizationId]/team`
| Status | **PLACEHOLDER — Should be hidden or completed** |
|---|---|
| **Current** | Shows only current user's email. Heading says "Manage your booth staff and team members" — nothing is manageable. |
| **Backend** | `organization_memberships` table exists with roles. Invitation API exists. |
| **Recommended action** | Implement team member list with role management (owner, member, viewer). Add invite by email. Or hide this page. |
| **Effort** | Medium |
| **Priority** | Medium |

---

#### Admin Page — `/admin`
| Status | **PLACEHOLDER — Should be hidden or replaced** |
|---|---|
| **Current** | All hardcoded: "12 organizations, 3 active events, 1,247 users, 99.9% uptime" |
| **Backend** | Real admin stats API doesn't exist (the demo admin at `/demo/admin` is the actual simulation control) |
| **Recommended action** | Either implement real admin dashboard with actual system metrics, or remove this page. It currently serves no purpose. |
| **Effort** | Large to implement properly |
| **Priority** | Low |

---

#### Showcase Redirect — `/showcase`
| Status | **PLACEHOLDER — Should be hidden or completed** |
|---|---|
| **Current** | Single line: `redirect('/hackathon/expo')` |
| **Recommended action** | Either make it a proper showcase/marketplace page, or remove the route entirely |
| **Effort** | N/A |
| **Priority** | Low |

---

#### Demo Attendee — `/demo/attendee`
| Status | **PLACEHOLDER — Informational only** |
|---|---|
| **Current** | Event info + links to real attendee flows |
| **Recommended action** | Either merge into Demo Landing or remove. It's just a signpost. |
| **Effort** | N/A |
| **Priority** | Low |

---

## ROADMAP COMPONENTS

These components exist conceptually but have no working implementation. They should be clearly labeled.

---

### Floor Plan / Spatial Heatmap
| Attribute | Value |
|---|---|
| **Current** | CSS progress bars in a card list |
| **Backend** | `FloorModule` is an empty shell. No `venues`, `floor_plans`, or `booth_positions` tables. |
| **What to show** | An elegant "Spatial Floor Mapping — Coming in Milestone 4" empty state with: (1) brief description of the feature, (2) a placeholder SVG floor plan outline, (3) what it will show (booth traffic color-coded on actual floor layout) |
| **Never show** | The current CSS progress bars as a substitute — it misleads visitors into thinking the feature is complete |
| **Priority** | High — visitors will test this immediately |

---

### Meeting Scheduler
| Attribute | Value |
|---|---|
| **Current** | No UI. `meeting_request` events exist in the simulation engine type but are never emitted. |
| **Backend** | `agenda_sessions` table exists (schema only, no data) |
| **What to show** | "Meeting Scheduler — In Active Development" card on the attendee hub page with a description of the value: attendees book 1:1 meetings with exhibitors during scheduled time slots |
| **Never show** | A broken "Book a Meeting" button |
| **Priority** | Low |

---

### AI Recommendation Engine (Personalized Matches)
| Attribute | Value |
|---|---|
| **Current** | `AiGatewayService` and `PromptRegistry` are stubs throwing "Milestone 3" |
| **Backend** | Matchmaking module is an empty shell |
| **What to show** | On the attendee hub, "AI-Powered Matchmaking — Coming Soon" with a description of how the system will recommend exhibitors based on attendee profile, browsing history, and stated interests |
| **Priority** | Low |

---

### Visitor Journey Timeline
| Attribute | Value |
|---|---|
| **Current** | No timeline UI. `lead_intelligence` table has the data (timeline of interactions per lead), but no frontend displays it. |
| **Backend** | Data exists: which pages visited, when, what they asked the AI, what they downloaded |
| **What to show** | On the exhibitor relationship detail page: "Visitor Journey — Coming Soon" empty state describing the feature |
| **Priority** | Medium |

---

## DATA ORCHESTRATION

### Highest-ROI Data Additions (Biggest improvement, least effort)

---

#### 1. Exhibitor Visitor List — Add Real Names + Companies

| What | Why |
|---|---|
| Currently | Visitor list shows relationship IDs — no human-readable names |
| Change | Fetch `attendee_profiles.full_name`, `attendee_profiles.company`, `attendee_profiles.job_title` for each `attendee_user_id` in the relationship |
| Files | `apps/api/src/modules/engagement/public-exhibitors.service.ts` line ~79: `for (const a of seed.attendees)` already has `fullName`, `company`, `title` — surface these |
| Effort | Trivial — already in seed data, just not displayed |
| Impact | High — makes the visitor list actually useful |
| Priority | **P0** |

---

#### 2. Real QR Code Generation

| What | Why |
|---|---|
| Currently | QR page renders an SVG illustration — `publicQrToken` is displayed as text but not encoded |
| Change | Use the `qrcode` npm package (already a dependency) to generate an actual QR code from the `publicQrToken` string |
| Files | `apps/web/src/app/demo/exhibitor/[eventExhibitorId]/qr/page.tsx` |
| Effort | 30 minutes |
| Impact | Medium — makes the QR feature demonstrable |
| Priority | **P1** |

---

#### 3. Simulation Status on All Demo Pages

| What | Why |
|---|---|
| Currently | Demo pages show seed data. If simulation isn't running, everything looks frozen. |
| Change | Add a small "Simulation: Running / Stopped" badge to the demo top navigation bar |
| Files | `apps/web/src/components/demo/shell.tsx` (DemoTopBar) |
| Effort | 1 hour |
| Impact | High — visitors immediately understand the live demo concept |
| Priority | **P0** |

---

#### 4. Live Demo Counters on Homepage

| What | Why |
|---|---|
| Currently | Homepage is entirely static |
| Change | Add a ticker to the homepage hero: "Live: 1,247 demo interactions • 200 attendees • 5 exhibitors" powered by `GET /v1/public/demo/live` |
| Files | `apps/web/src/app/(marketing)/page.tsx` |
| Effort | 2 hours |
| Impact | Medium — makes homepage feel connected to the demo |
| Priority | **P1** |

---

#### 5. Fix "View Organizer Demo" Link

| What | Why |
|---|---|
| Currently | Homepage → "View organizer demo" → `/org` → auth wall → visitor gives up |
| Change | Change link to `/demo/organizer` |
| Files | `apps/web/src/app/(marketing)/page.tsx` line 186 |
| Effort | Trivial |
| Impact | High — this is the first thing a visitor clicks |
| Priority | **P0** |

---

#### 6. Per-Attendee AI Lead Scores

| What | Why |
|---|---|
| Currently | Exhibitor AI Insights shows aggregate "12 profiles enriched" — no per-attendee AI data |
| Change | Expose `lead_intelligence.buying_intent`, `lead_intelligence.ai_summary`, `lead_intelligence.follow_up_recommendation` per attendee |
| Files | `apps/api/src/modules/engagement/exhibitor-dashboard.service.ts` or new endpoint |
| Effort | Medium |
| Impact | High — this is the "wow factor" AI feature |
| Priority | **P1** |

---

#### 7. Wire Real AI to Demo Reports

| What | Why |
|---|---|
| Currently | Demo reports are client-side string templates — not real AI |
| Change | Call `OrganizerReportingService.generate()` with the demo event ID on "Generate Report" button click |
| Files | `apps/web/src/app/demo/organizer/reports/page.tsx`, `apps/api/src/modules/engagement/organizer-reporting.service.ts` |
| Effort | Medium |
| Impact | High — demo visitors will see real NVIDIA AI-generated narrative |
| Priority | **P1** |

---

#### 8. Hide or Fix Dead Buttons on Hackathon Page

| What | Why |
|---|---|
| Currently | "Visit Booth" and "Ask AI" buttons link to `#` when exhibitor has no `publicQrToken` |
| Change | Hide buttons when token is null, or show "Not available" tooltip |
| Files | `apps/web/src/app/hackathon/landing-client.tsx` lines 129-131 |
| Effort | 30 minutes |
| Impact | Medium — dead buttons create distrust |
| Priority | **P1** |

---

## HIGHEST ROI IMPROVEMENTS BEFORE HACKATHON

Ranked by impact delivered per hour of engineering effort:

| Rank | Change | Effort | Impact | Category |
|---|---|---|---|---|
| 1 | Fix "View Organizer Demo" link → `/demo/organizer` | 5 min | **Critical** | UX |
| 2 | Add "Simulation: Running" badge to demo nav bar | 1 hr | **Critical** | UX |
| 3 | Surface `attention[]` data on exhibitor dashboard | 1 hr | **High** | Data |
| 4 | Add simulation auto-start (`DEMO_SIMULATION_AUTO_START=true`) | 1 min | **High** | UX |
| 5 | Add real attendee names to visitor list | 2 hr | **High** | Data |
| 6 | Wire real AI to demo reports | 4 hr | **High** | Feature |
| 7 | Rename heatmaps page to "Booth Traffic" + add bar chart | 3 hr | **High** | Design |
| 8 | Generate real QR codes from token | 1 hr | **Medium** | Visual |
| 9 | Expose per-attendee AI lead scores | 6 hr | **High** | Feature |
| 10 | Hide dead "Visit Booth" buttons on hackathon | 30 min | **Medium** | UX |
| 11 | Add live counters to homepage | 2 hr | **Medium** | UX |
| 12 | Add event selector to organizer analytics | 2 hr | **Medium** | UX |
| 13 | Implement `/exhibit/[orgId]/team` with real member list | 4 hr | **Medium** | Feature |
| 14 | Add loading skeletons to all demo pages | 4 hr | **Medium** | UX |
| 15 | Batch admin panel polls into single call | 1 hr | **Low** | Performance |

---

## SUMMARY TABLE: EVERY PAGE

| Page | Classification | Action |
|---|---|---|
| `/` (homepage) | Tier 2 | Fix Organizer link. Add live counters. |
| `/demo` | Tier 1 | Add simulation badge. |
| `/demo/organizer` | Tier 1 | Add simulation status indicator + start prompt when stopped. |
| `/demo/organizer/events` | Tier 1 | Works. Consider adding "create event" placeholder. |
| `/demo/organizer/analytics` | Tier 2 | Add bar charts, event selector, date range. |
| `/demo/organizer/heatmaps` | Tier 2 | Rename to "Booth Traffic Ranking." Add bar chart. |
| `/demo/organizer/ai-insights` | Tier 4 (Placeholder) | Wire real AI or label as "Based on sample data." |
| `/demo/organizer/reports` | Tier 4 (Placeholder) | Wire real AI report generation. |
| `/demo/organizer/event/[slug]` | Tier 1 | Works. |
| `/demo/exhibitor` | Tier 3 | Add more exhibitors (10–20), search/filter. |
| `/demo/exhibitor/[id]` | Tier 1 | Surface `attention[]` data. |
| `/demo/exhibitor/[id]/analytics` | Tier 1 | Works. Consider hiding (duplicate of parent). |
| `/demo/exhibitor/[id]/ai-insights` | Tier 2 | Expose per-attendee AI lead scores. |
| `/demo/exhibitor/[id]/visitors` | Tier 2 | Add real names, AI scores, clickable rows. |
| `/demo/exhibitor/[id]/products` | Tier 1 | Works. |
| `/demo/exhibitor/[id]/documents` | Tier 1 | Works. |
| `/demo/exhibitor/[id]/qr` | Tier 1 (visual only) | Generate real QR code. |
| `/demo/exhibitor/[id]/preview` | Tier 1 | Merge with Booth page. |
| `/demo/exhibitor/[id]/booth` | Tier 1 | Merge with Preview page. |
| `/demo/admin` | Tier 1 | Add event chart. |
| `/demo/attendee` | Tier 4 | Merge into Demo Landing or remove. |
| `/hackathon` | Tier 1 (UX bugs) | Hide dead buttons. Add live counters. |
| `/hackathon/expo` | Tier 1 (UX bugs) | Same fixes. |
| `/visit/[qr]` | Tier 1 | Best feature. Add typing indicator. Add quick-demo skip. |
| `/e/[slug]` | Tier 1 | Works. |
| `/e/[slug]/exhibitors/[id]` | Tier 1 | Works. |
| `/e/[slug]/exhibitors/[id]/insights` | Tier 1 | Works. |
| `/e/[slug]/saved` | Tier 1 | Works. |
| `/account/profile` | Tier 1 | Works. |
| `/auth/*` | Tier 1 | Works. |
| `/org/events/[id]/documents` | Tier 4 | Hide until implemented, or build it. |
| `/exhibit/[orgId]/team` | Tier 4 | Hide until implemented, or build it. |
| `/admin` | Tier 4 | Hide until implemented, or build it. |
| `/showcase` | Tier 4 | Hide or remove. |

---

## PRODUCTION-READY COMPONENTS CHECKLIST

These features work correctly and should be showcased:

- [x] Booth visit experience with real AI chat (`/visit/[qr]`)
- [x] Lead submission flow with form and success state
- [x] Exhibitor dashboard with real KPI data
- [x] Organizer analytics with real traffic/conversion data
- [x] Admin simulation control panel (start/stop/pause/speed/scenario)
- [x] Live metrics bar (real-time polling)
- [x] AI lead intelligence scoring (real NVIDIA calls, backend-only)
- [x] Knowledge document upload + RAG retrieval (real NVIDIA calls, backend-only)
- [x] AI executive report generation (real NVIDIA calls, in authenticated console)
- [x] Magic link authentication flow
- [x] QR code token generation for booths
- [x] Search + filter on exhibitor directory
- [x] Exhibitor save/bookmark with auth
- [x] Live simulation event generation (8 event types)
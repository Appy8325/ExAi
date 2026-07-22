# Dashboard Information Architecture — Analysis

> **EPIC 3** — Information hierarchy, decision-making support, cognitive load reduction
> **Scope:** Analysis only. No implementation until approved.
> **Constraint:** Do NOT modify colors, typography, spacing, or components unless absolutely required.

---

## Executive Summary

We have **10 dashboards** across **5 user types** (Organizer, Exhibitor, Attendee, Admin, Demo). The strongest dashboards are those with a **single clear question** they answer (e.g., Admin Dashboard → "Is the platform healthy?"). The weakest try to answer **too many questions at once** (e.g., Exhibitor Dashboard with 7 KPI cards).

The core problem across all dashboards: **raw counts without context**. A number like "1,234 Visitors" means nothing without trend, target, or benchmark. Every KPI should tell the user whether they are winning or losing.

---

## 1. Organizer Dashboard (`/org`)

**Primary user:** Event operations manager
**Primary question:** *Which event needs my attention right now?*

### Current Layout

```
PageHeader ("Organizer Dashboard")
├── KPICards (4): Events (12) | Exhibitors (156) | Attendees (2,847) | Relationships (892)
└── Events Section
    ├── Header: "Events" + "View all" link
    └── List: name | status | exhibitors | relationships
```

### Analysis

| Element | Decision Value | Issue |
|---------|:--------------:|-------|
| Events KPI (12) | Low | Raw count with no trend. "Live event and relationship totals" subtext is vague. |
| Exhibitors KPI (156) | Low | Raw count. No context — is this up or down? |
| Attendees KPI (2,847) | Low | Raw count. No registration trend or capacity percentage. |
| Relationships KPI (892) | Low | Raw count. No conversion rate context. |
| Events table | Medium | Shows status + metrics per event, but missing attendee count per event. |

### Findings

1. **No alerts or action items.** The dashboard's primary question should be "what needs my attention," but there are zero alerts — no events with low registration, no overdue tasks, no expiring sponsorships.
2. **No trend data.** All 4 KPIs are absolute counts with no delta (↑↓), no comparison to last month, no target/progress indicator.
3. **Duplicate navigation.** The "View all" link in the Events section goes to `/org/events`, but the section itself already lists events. Either merge into a full events page or keep only the "View all" as a shortcut to the full page.
4. **Missing attendee count per event.** The events table shows exhibitors and relationships per event but not attendees — an odd omission.
5. **"Live event" wording.** The Events card says "Live event and relationship totals" — "Live event" is confusing when the dashboard shows all events (past, live, draft).

### Recommendations

| Change | Rationale |
|--------|-----------|
| Replace 4 raw-count KPIs with 2-3 decision-forward metrics | Reduce cognitive load. Show only metrics that drive a decision. |
| Add trend arrows to remaining KPIs | Contextualize every number. |
| Add an "Alerts" or "Needs Attention" section above the fold | Surface events requiring action directly. |
| Add a "Days to next event" or "Upcoming" mini section | Give immediate temporal context. |
| Merge Events section → show attendee count per event | Fill the gap. |
| Remove "Live" wording from Events card description | Avoid confusion. |

### Proposed Layout

```
PageHeader ("Dashboard")
├── AlertBanner (conditionally shown): "3 events have low registration — Review"
├── MetricRow (3 cards, each with trend arrow):
│   ├── Active Events (12) → (trend)
│   ├── Total Registrations (2,847) → ↑12% vs last month
│   └── Avg Exhibitor Conversion (68%) → ↑5% vs last month
├── Quick Actions: [Create Event] [View Reports]
└── Events Table
    ├── Draft (2) — name, status, deadline, action
    ├── Live (1) — name, attendees, exhibitors, relationships
    └── Past (9) — name, date, attendees (collapsible)
```

**Score:** 5/10 → target **8/10**

---

## 2. Event Dashboard (`/org/events/[eventId]`)

**Primary user:** Event manager
**Primary question:** *Is my event on track?*

### Current Layout

```
PageHeader ("Event Dashboard")
├── KPICards (3): Exhibitors (48) | Attendees (847) | Relationships (203)
└── Action buttons row: [View Exhibitors] [Event Settings] [View Report] [Publish]
```

### Analysis

| Element | Decision Value | Issue |
|---------|:--------------:|-------|
| Exhibitors KPI (48) | Medium | Useful, but no target/goal. "48 of 60 booths filled" is more informative. |
| Attendees KPI (847) | Medium | Raw count. Registration trend over time would be more useful. |
| Relationships KPI (203) | Low | Important for post-event but not for "is my event on track" during planning. |
| Action buttons row | Medium | Below the fold on mobile. Should be above or alongside KPIs. |

### Findings

1. **No temporal context.** How many days until the event? Is registration on track? Are exhibitor booth purchases accelerating or slowing?
2. **KPIs lack goals.** A number without a target is just a curiosity. "48 Exhibitors" → "48 of 60 booths sold (80%)" drives a decision.
3. **Relationships KPI is premature.** During event planning, relationship count is not a primary concern. It becomes important after/during the event.
4. **Actions are buried.** "Publish" is the single most important action, but it sits in a row of 4 buttons with no visual prominence.
5. **No pending tasks.** Is there an incomplete profile? Unpaid invoice? Missing contract? The dashboard doesn't surface this.

### Recommendations

| Change | Rationale |
|--------|-----------|
| Replace raw counts with goal-based metrics | "48 of 60 booths sold (80%)" is decision-forward. |
| Add days-until-event countdown | Instant temporal context. |
| Add registration trend (daily signups chart) | Track momentum. |
| Promote "Publish" to primary action button | Most important action gets visual weight. |
| Add a "Setup Checklist" or "Pending Tasks" section | Surface blockers. |
| Move Relationship KPI to a secondary position | Not relevant during planning phase. |

### Proposed Layout

```
PageHeader ("[Event Name]")
├── DaysUntil: "14 days until event" + PublishButton (prominent)
├── MetricRow (3 cards with progress bars):
│   ├── Registration: 847 / 1,200 target (71%) ↑12% this week
│   ├── Exhibitors: 48 / 60 booths sold (80%) ↑3 this week
│   └── Engagement: 203 relationships logged
├── Quick Actions: [View Exhibitors] [Send Reminder] [View Report] [Event Settings]
├── Registration Trend (mini sparkline)
└── Setup Checklist
    ├── ✅ Payment received
    ├── ✅ Venue confirmed
    ├── ⬜ Scan poster uploaded
    └── ⬜ Welcome email scheduled
```

**Score:** 4/10 → target **8/10**

---

## 3. Analytics (`/org/analytics`)

**Primary user:** Event organizer / analyst
**Primary question:** *How are attendees engaging with exhibitors?*

### Current Layout

```
PageHeader ("Analytics")
├── Event filter dropdown
├── Booth Heatmap (grid of exhibitors by booth, colored by visit count)
├── Industry Breakdown (bar chart — visitors per industry)
└── Topics of Interest (tag cloud / list)
```

### Analysis

| Element | Decision Value | Issue |
|---------|:--------------:|-------|
| Event filter | High | Essential. No issues. |
| Booth heatmap | High | Excellent visualization — answers "which booths are popular" at a glance. |
| Industry breakdown | Medium | Useful for understanding audience composition. |
| Topics of interest | Medium | Useful but could be more actionable (e.g., "trending up" indicators). |

### Findings

1. **No trend visualization.** All charts show static snapshots. A "visits over time" line chart would answer "is engagement growing?"
2. **No cross-event comparison.** The filter lets you pick one event at a time. Side-by-side event comparison would be valuable for organizers running multiple events.
3. **No conversion funnel.** How many visitors → scans → relationships? This is the core engagement funnel.
4. **Heatmap is the strongest element.** It should remain the primary visual. The grid approach is correct.

### Recommendations

| Change | Rationale |
|--------|-----------|
| Add a time-series chart (visits over days) | Answer "is engagement growing?" |
| Add cross-event comparison toggle | Enable A/B comparison between events. |
| Add engagement funnel (visitors → scans → relationships) | Show drop-off points. |
| Move industry/topics below the fold | Heatmap + trend + funnel tell a complete story. Topics are secondary enrichment. |

### Proposed Layout

```
PageHeader ("Analytics")
├── Event filter (multi-select, "Compare events" toggle)
├── Primary row:
│   ├── Booth Heatmap (left, 2/3 width)
│   └── Engagement Funnel (right, 1/3 width):
│       Visitors → QR Scans → Relationships
├── Visits Over Time (line chart, full width)
└── Secondary row (collapsible):
    ├── Industry Breakdown
    └── Topics of Interest
```

**Score:** 7/10 → target **9/10**

---

## 4. Reports (`/org/events/[eventId]/reports`)

**Primary user:** Event organizer
**Primary question:** *What story do the numbers tell about my event?*

### Current Layout

```
Breadcrumb ("Executive Reporting")
├── [Generate Report] button
├── MetricCards (4):
│   ├── Total Exhibitors
│   ├── Total Attendees
│   ├── Active Conversations
│   └── Relationships Created
└── AI Report Content Block
    ├── Executive Summary
    ├── Exhibitor Performance
    ├── Attendee Engagement
    └── Recommendations
```

### Analysis

| Element | Decision Value | Issue |
|---------|:--------------:|-------|
| Generate Report button | High | Clear CTA. Good placement. |
| MetricCards (4) | Low-Medium | Duplicates event dashboard KPIs. Provides context for the report below but adds repetition. |
| AI Report Content | High | Well-structured. The most valuable section. |

### Findings

1. **MetricCards duplicate the event dashboard.** They serve as "headline numbers" for the report, which is useful context, but they're not decision-driving in this context — the user came here for analysis, not raw counts.
2. **The AI report is the hero.** The executive summary, exhibitor performance, attendee engagement, and recommendations sections are excellent. This is what the page should lead with.
3. **No download/export options visible.** If this is "Executive Reporting," PDF export or share link would be expected.

### Recommendations

| Change | Rationale |
|--------|-----------|
| Keep MetricCards but collapse them under a "Summary" toggle | Preserve context without visual weight. |
| Promote AI Report to full-width hero | It's the reason users visit this page. |
| Add PDF export and share-link actions | Executive reports need distribution. |
| Add a "Report History" section | Users may want to compare reports over time. |

### Proposed Layout

```
Breadcrumb ("Reports")
├── Action row: [Generate Report] [Export PDF] [Share Link]
├── Summary (collapsible): 4 headline metrics
└── AI Report (full width, hero treatment)
    ├── Executive Summary
    ├── Exhibitor Performance
    ├── Attendee Engagement
    └── Recommendations
```

**Score:** 7/10 → target **9/10**

---

## 5. Exhibitor Dashboard (`/exhibit/[orgId]/dashboard/[eeId]`)

**Primary user:** Exhibitor booth manager
**Primary question:** *How is my booth performing and who should I follow up with?*

### Current Layout

```
PageHeader ("Exhibitor Dashboard")
├── KPICards (7):
│   ├── Today's Visitors (47)
│   ├── QR Scans (89)
│   ├── Relationships Created (34)
│   ├── Returning Visitors (12)
│   ├── Profile Completion (85%)
│   ├── Lead Quality (4.2)
│   └── Engagement Score (78)
├── Relationship Pipeline (table)
├── Recent Activity (activity feed)
└── AI Insights (mini analysis)
```

### Analysis

| Element | Decision Value | Issue |
|---------|:--------------:|-------|
| Today's Visitors (47) | Medium | Useful real-time metric, but doesn't distinguish new vs returning at a glance. |
| QR Scans (89) | Medium | Useful but similar to "Today's Visitors." Merge or differentiate clearly. |
| Relationships Created (34) | High | Core conversion metric. Keep prominent. |
| Returning Visitors (12) | Medium | Useful as a secondary metric or as a trend indicator. |
| Profile Completion (85%) | Low | Booth setup metric, not a decision-driving KPI during the event. |
| Lead Quality (4.2) | Medium | Computed from pipeline data; helpful but sits alongside pipeline. |
| Engagement Score (78) | Low | Composite score with no reference point. "78 out of what?" |

### Findings

1. **7 KPI cards is too many.** This is the single biggest cognitive load issue across all dashboards. The user cannot quickly identify the 2-3 metrics that matter.
2. **Duplicate metrics.** "Today's Visitors" and "QR Scans" measure similar things. "Engagement Score" is a composite of other metrics.
3. **Profile Completion is misplaced.** This is important during booth setup but not during a live event. Should be a secondary badge or shown conditionally.
4. **Relationship Pipeline is the most actionable section.** It shows who needs follow-up. This should be more prominent.
5. **AI Insights is valuable but small.** The mini AI insights block could be expanded to include more recommendations.
6. **Grid inconsistency.** The 7 KPI cards are in a KpiGrid, then the lower sections break into a different grid layout.

### Recommendations

| Change | Rationale |
|--------|-----------|
| Reduce to 4 KPIs: Visitors (today), Relationships, Scan→Relationship Rate, Lead Quality | Drop duplicates and non-essential metrics. |
| Convert "Engagement Score" to a small badge next to the booth name | It is a derived composite that provides directional signal but doesn't need a full card. |
| Move Profile Completion to booth settings header | It's a setup metric, not a live dashboard KPI. |
| Merge "Today's Visitors" + "QR Scans" into "Visitor Engagement" card | Show scans as a rate (scans/visitors). |
| Promote Relationship Pipeline to the primary content area | It drives the most important action: follow-up. |
| Expand AI Insights section | Make recommendations more visible. |
| Add "Returning Visitors" as a trend indicator in the Visitors KPI | "47 visitors (12 returning — 26%)" |

### Proposed Layout

```
PageHeader ("Booth Dashboard — [Company Name]") + EngagementScore badge
├── MetricRow (4 cards, each with trend):
│   ├── Today's Visitors (47) — ↑15% from yesterday (12 returning)
│   ├── Scan Rate (68%) — visitors who scanned QR
│   ├── Relationships Created (34) — ↑8% from yesterday
│   └── Lead Quality (4.2/5.0) — ↑0.3 from yesterday
├── Quick Actions: [View Visitors] [Manage Products] [Share QR] [Settings]
├── Relationship Pipeline (table, primary width) — with filter by lead quality
└── Activity + AI Insights (side by side, secondary width)
    ├── Recent Activity (scrollable feed)
    └── AI Insights & Recommendations
```

**Score:** 4/10 → target **8/10**

---

## 6. Exhibitor AI Insights (`/exhibit/[orgId]/ai-insights`)

**Primary user:** Exhibitor booth manager
**Primary question:** *Who should I talk to and what should I know about them?*

### Current Layout

```
PageHeader ("AI Insights")
├── MetricBoxes (3):
│   ├── Profiles Enriched (156)
│   ├── Complete Profiles (89)
│   └── Enrichment Events (342)
├── Intelligence Feed (list of visitor insights)
└── AiRecommendationCards (5): Matches, Interests, etc.
```

### Analysis

| Element | Decision Value | Issue |
|---------|:--------------:|-------|
| Profiles Enriched (156) | Low | Raw count. "Which profiles need enrichment?" is more valuable. |
| Complete Profiles (89) | Low | Derivative metric. No action tied to it. |
| Enrichment Events (342) | Low | Raw count of data points. Not decision-driving. |
| Intelligence Feed | High | Individual visitor insights are highly actionable. |
| AiRecommendationCards | Medium-High | Useful but some duplicate the feed. |

### Findings

1. **The 3 MetricBoxes add little value.** They show enrichment volume but don't drive a decision. "156 profiles enriched" — so what? The user needs to know which visitors are high-priority.
2. **Intelligence Feed is the hero but is below the fold.** The most actionable content (individual visitor insights) appears after 3 metrics.
3. **"Top Opportunities" shows a single name.** A list of 1 is not useful. Either show a ranked list (top 5-10) or remove the card.
4. **The page title suggests AI-generated insights, but the page leans toward enrichment statistics.** The name "AI Insights" promises recommendations and intelligence, but the layout prioritizes data processing metrics.

### Recommendations

| Change | Rationale |
|--------|-----------|
| Replace MetricBoxes with a single "Opportunities" summary | "12 high-value visitors today" is more actionable than enrichment counts. |
| Promote Intelligence Feed to hero position | Individual visitor insights are the most valuable content. |
| Enrich the Feed with priority indicators | Rank visitors by lead quality score, allowing the user to triage. |
| Turn "Top Opportunities" into a ranked top-5 list | One name is useless. Five names with context is valuable. |
| Add a "Needs Enrichment" filter to the Feed | Instead of showing enrichment as a metric, make it a filterable action. |

### Proposed Layout

```
PageHeader ("AI Insights")
├── Summary bar: "12 high-value visitors today — 8 need follow-up"
├── Visitor Intelligence Feed (full-width, primary content)
│   ├── Each item: name + company + interest match + lead quality + enrichment status
│   └── Filters: [All Visitors] [High Priority] [Needs Enrichment] [New Today]
└── Recommendations sidebar (right, secondary)
    ├── Top 5 Opportunities (ranked list)
    ├── Trending Interests
    └── Suggested Actions
```

**Score:** 5/10 → target **8/10**

---

## 7. Attendee Dashboard (`/e/[eventSlug]`)

**Primary user:** Event attendee
**Primary question:** *Which exhibitors should I visit?*

### Current Layout

```
Search bar
├── Featured Section (3 exhibitors)
├── A-Z Listing
│   ├── "A" — Acme Corp, Alpha Inc
│   ├── "B" — Beta LLC, Bravo Co
│   └── ...
```

### Analysis

| Element | Decision Value | Issue |
|---------|:--------------:|-------|
| Search bar | High | The primary interaction. Correct placement. |
| Featured Section | Medium | Useful discovery mechanism. Could be enhanced with "why featured." |
| A-Z Listing | Medium | Serves discovery but doesn't scale well beyond ~20 exhibitors. |

### Findings

1. **This is a directory, not a dashboard — and it's correctly designed as such.** The attendee-facing page answers a simple question and gets out of the way.
2. **No "recently viewed" or "saved" quick access on this page.** The user has to navigate separately to `/saved` to see saved exhibitors.
3. **No personalized recommendations.** The "Featured" section could be enhanced with AI-powered recommendations based on the attendee's industry or interests.
4. **No filtering beyond search.** Category/industry/booth-number filters would improve scalability.

### Recommendations

| Change | Rationale |
|--------|-----------|
| Add a "Your Saved Exhibitors" inline section (if any saved) | Reduce need to navigate to /saved separately. |
| Add category/industry filter pills | Improve discoverability. |
| Replace "Featured" with "Recommended for You" (if data available) | Personalize the experience. |

### Proposed Layout

```
Search bar (prominent) + Filter pills: [All] [Technology] [Healthcare] [Finance]
├── Your Saved Exhibitors (conditionally shown — horizontal scroll)
├── Recommended for You (if AI data available)
└── All Exhibitors (A-Z grid, filterable)
```

**Score:** 7/10 → target **9/10** (with minimal changes — it's already well-designed for its purpose)

---

## 8. Admin Dashboard (`/admin`)

**Primary user:** System administrator
**Primary question:** *Is the platform healthy?*

### Current Layout

```
PageHeader ("Admin Dashboard")
├── KPI Grid (statistics cards — hardcoded values)
├── Recent System Events (activity log)
├── Service Status (health indicators)
└── AI Inference (degraded status)
```

### Analysis

| Element | Decision Value | Issue |
|---------|:--------------:|-------|
| KPI Grid | High | Provides platform overview. Good at-a-glance. |
| Recent System Events | High | Essential for debugging. |
| Service Status | High | Good pairing with system events. |
| AI Inference (degraded) | Medium | Shows status but no action link to investigate/fix. |

### Findings

1. **KPIs are hardcoded mock values.** Acceptable for current state but should be noted as placeholder.
2. **"AI Inference" degraded with no action.** A degraded service should link to logs or an investigation page.
3. **No capacity/utilization metrics.** CPU, memory, API rate limits — these are standard admin concerns.
4. **No user/tenant management quick actions.** Admin dashboards typically surface user signups, active tenants, etc.

### Recommendations

| Change | Rationale |
|--------|-----------|
| Make "AI Inference" degraded status actionable | Link to investigation or logs. |
| Add capacity/utilization row (optional, below the fold) | Standard admin concern. |
| Quick action: [View Logs] [Manage Users] [System Config] | Common admin tasks. |
| No changes to layout structure | The current hierarchy is correct. |

### Proposed Layout

```
PageHeader ("Admin Dashboard")
├── KPI Grid (as-is, wire to real data when available)
├── Quick Actions: [View Logs] [Manage Users] [System Config]
├── Health Row:
│   ├── Service Status (green/yellow/red per service)
│   └── AI Inference (degraded) → [Investigate → link to logs]
└── Recent System Events (scrollable log)
```

**Score:** 6/10 → target **8/10**

---

## 9. Demo Organizer Dashboard (`/demo/organizer`)

**Primary user:** Demo/prospective customer
**Primary question:** *What can ExAi do for my events?*

### Current Layout

```
LiveMetricsBar (animated stats)
├── MetricCards (4):
│   ├── Live Events (3)
│   ├── Booths Monitored (156)
│   ├── Captured Visits (2,847)
│   └── Conversion Rate (24%)
├── ExecutiveInsight (text block with AI insight)
├── Quick Links (navigation cards)
├── Featured Event (highlighted event card)
└── Portfolio (all events grid)
```

### Analysis

| Element | Decision Value | Issue |
|---------|:--------------:|-------|
| LiveMetricsBar | High | Demo-friendly animated stats — great for first impression. |
| MetricCards (4) | Medium | Reasonable selection. "Captured Visits" vs "Conversion Rate" are related but OK. |
| ExecutiveInsight | High | Showcases AI capability. Excellent demo feature. |
| Quick Links | Low | Duplicates navigation. Takes space without demonstrating value. |
| Featured Event | Medium | Good for highlighting a specific scenario. |
| Portfolio | Medium | Shows breadth but overlaps with Featured Event. |

### Findings

1. **Quick Links section is redundant.** The user is already in the demo — navigation links are in the sidebar. These cards consume space without adding demo value.
2. **Featured Event and Portfolio overlap.** Featured is a single highlighted card, Portfolio shows all events. Either merge or make Featured a visual callout within the Portfolio.
3. **ExecutiveInsight is the strongest demo element.** It directly shows the AI value proposition. Should be more prominent.
4. **LiveMetricsBar is effective for demo.** The animated counters create a compelling first impression.

### Recommendations

| Change | Rationale |
|--------|-----------|
| Remove Quick Links section | Reduces clutter. Navigation is already in sidebar. |
| Merge Featured Event into Portfolio as a highlighted first card | Eliminate duplication. |
| Promote ExecutiveInsight to primary content position | Strongest demo element deserves more space. |

### Proposed Layout

```
LiveMetricsBar (animated stats)
├── MetricCards (4) — as-is
├── ExecutiveInsight (featured, full-width)
└── Portfolio (event grid)
    └── Featured Event (first card, visually highlighted)
```

**Score:** 7/10 → target **9/10**

---

## 10. Demo Exhibitor Dashboard (`/demo/exhibitor/[eeId]`)

**Primary user:** Demo/prospective customer (exhibitor perspective)
**Primary question:** *What can ExAi do for my booth?*

### Current Layout

```
PageHeader ("Exhibitor Dashboard")
├── MetricCards (8):
│   ├── Live Visitors
│   ├── Total Scans
│   ├── Engagement Score
│   ├── Profile Enrichments
│   ├── Returning Visitors
│   ├── Total Relationships
│   ├── Top Interest
│   └── Avg Session
├── Pipeline Section (relationship stages)
├── Attention Section (notifications)
├── AI Feed (intelligence feed)
└── Action Links (Products, Visitors, Analytics, QR)
```

### Analysis

| Element | Decision Value | Issue |
|---------|:--------------:|-------|
| MetricCards (8) | Low | Severe overload. 8 metrics competing for attention. |
| Pipeline Section | Medium | Useful demo of relationship tracking. |
| Attention Section | Medium | Shows notification capability — good for demo. |
| AI Feed | High | Showcases AI intelligence — strongest demo element. |
| Action Links | Low | At the very bottom — easy to miss. Should be elevated. |

### Findings

1. **8 MetricCards is the worst case of KPI overload.** This is the highest cognitive load of any dashboard. The user cannot quickly find the signal.
2. **Action Links are buried.** Products, Visitors, Analytics, and QR are the primary navigation actions for the exhibitor, but they're in a small row at the bottom.
3. **AI Feed is the best demo element.** It directly shows the AI value proposition. Should be more prominent.
4. **"Top Interest" card shows one interest label.** A single-interest card is not useful as a standalone KPI.
5. **"Attention Section" is useful but competes with AI Feed for attention.**

### Recommendations

| Change | Rationale |
|--------|-----------|
| Reduce MetricCards from 8 to 4: Visitors, Scans, Relationships, Engagement | Cut overload by 50%. |
| Move Action Links to below the metric row | Critical navigation should be above the fold. |
| Expand AI Feed as the primary content area | Strongest demo element. |
| Merge "Attention" into AI Feed as a notification tab | Reduce section competition. |

### Proposed Layout

```
PageHeader ("Exhibitor Dashboard — [Company Name]")
├── MetricRow (4 cards, with trend):
│   ├── Live Visitors | Total Scans | Relationships | Engagement
├── Action Links (horizontal, prominent): [Products] [Visitors] [Analytics] [QR Code]
├── AI Intelligence Feed (primary, full-width)
│   └── Tab: [Insights] [Notifications] [Pipeline]
```

**Score:** 3/10 → target **7/10**

---

## Cross-Dashboard Patterns & Systemic Issues

### Issue 1: Raw Counts Without Context
**Occurs in:** 8 of 10 dashboards
**Impact:** High — users cannot tell if a number is good or bad
**Fix:** Add trend arrows (↑↓ vs last period), goal progress bars, or benchmarks

### Issue 2: KPI Overload (6+ cards)
**Occurs in:** Exhibitor Dashboard (7), Demo Exhibitor (8)
**Impact:** High — 6+ metrics exceed working memory, reducing decision speed
**Fix:** Cap at 4-5 per dashboard; move secondary metrics to detail sections

### Issue 3: Missing Call-to-Action (above the fold)
**Occurs in:** Event Dashboard (actions below the fold), Demo Exhibitor (actions at bottom)
**Impact:** Medium — users must scroll to find the primary action
**Fix:** Place 2-3 primary actions in a consistent position (below header or alongside metrics)

### Issue 4: Duplicate Content Within Pages
**Occurs in:** Reports (MetricCards mirror event dashboard), Demo Organizer (Featured Event inside Portfolio)
**Impact:** Low-Medium — wastes space and adds confusion
**Fix:** Collapse or deduplicate

### Issue 5: No Alert/Attention System
**Occurs in:** Organizer Dashboard, Event Dashboard, Admin Dashboard (degraded service has no action)
**Impact:** Medium — proactive alerts would reduce time-to-action
**Fix:** Add conditional alert banners for actionable states

### Issue 6: Demo-Specific Overengineering
**Occurs in:** Demo Organizer (Quick Links), Demo Exhibitor (8 KPI cards)
**Impact:** Medium — demo dashboards try to show everything and end up showing nothing clearly
**Fix:** Curate demo dashboards around 2-3 key value propositions

---

## Scoring Summary

| Dashboard | Current Score | Target Score | Primary Issue |
|-----------|:------------:|:------------:|---------------|
| Organizer (`/org`) | 5/10 | 8/10 | No alerts, no trend, KPI overload |
| Event (`/event/[id]`) | 4/10 | 8/10 | Missing temporal/goal context, actions hidden |
| Analytics | 7/10 | 9/10 | Missing time-series and cross-event comparison |
| Reports | 7/10 | 9/10 | Minor — duplicate metrics, needs export |
| **Exhibitor Dashboard** | **4/10** | **8/10** | **7 KPI cards — worst overload** |
| AI Insights | 5/10 | 8/10 | Metrics are non-actionable; feed should be hero |
| Attendee Directory | 7/10 | 9/10 | Already good; minor enhancement |
| Admin | 6/10 | 8/10 | Degraded service needs action; KPIs hardcoded |
| Demo Organizer | 7/10 | 9/10 | Quick Links redundant; minor layout tweaks |
| **Demo Exhibitor** | **3/10** | **7/10** | **8 KPI cards + buried actions — worst dashboard** |

**Overall average:** 5.5/10 → target **8.3/10**

---

## Priority Order for Implementation

1. **Exhibitor Dashboard** — Highest impact: 7→4 KPI cards, promote pipeline, expand AI
2. **Demo Exhibitor Dashboard** — Highest overload: 8→4 KPI cards, elevate actions, expand AI feed
3. **Event Dashboard** — Add goal-based metrics, temporal context, checklist
4. **Organizer Dashboard** — Add alerts, trend, reduce KPIs
5. **AI Insights** — Promote feed, replace stats with opportunities
6. **Admin Dashboard** — Make degraded states actionable
7. **Demo Organizer** — Remove Quick Links, merge Featured into Portfolio
8. **Analytics** — Add time-series and comparison
9. **Reports** — Collapse duplicates, add export
10. **Attendee Directory** — Minor enhancement: inline saved exhibitors

---

## Appendix: Component Reuse Opportunities

| Need | Existing Component | New Component Required |
|------|:------------------:|:----------------------:|
| Trend arrow (↑↓) | None | Mini `TrendIndicator` |
| Goal progress bar | `ProgressBar` in `shadcn` | None required |
| Alert banner | Likely in `Alert` component | None — may need `DashboardAlert` |
| KPI card with trend | `KPICard` | Enhanced variant with trend sub-slot |
| Days-until countdown | None | Inline `Countdown` display |
| Action row / Quick actions | Various button groups | Standardized `QuickActions` bar |
| Conditional section | None | `OnboardingChecklist` composable |

---

*Analysis complete. Waiting for approval before implementing any changes.*

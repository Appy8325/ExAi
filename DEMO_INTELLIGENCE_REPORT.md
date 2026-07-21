# Demo Intelligence System — TechExpo 2027

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                 Demo Intelligence System                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  /scripts/generate-demo-seed.ts                                │
│       │  Deterministic PRNG (seed=2027) — single source       │
│       ▼                                                       │
│  ┌─────────────────────────────────┐                          │
│  │       demo_seed.json            │  ← ONLY data definition  │
│  │  (organizers, exhibitors,       │                          │
│  │   attendees, products, docs)    │                          │
│  └──────────┬──────────────────────┘                          │
│             │                                                  │
│             ▼                                                  │
│  ┌──────────────────┐    ┌──────────────────────┐             │
│  │  demo.ts         │───►│  Supabase Postgres    │             │
│  │  (JSON importer) │    │  (orgs, users,        │             │
│  │  No inline data  │    │   booths, rels, etc.) │             │
│  └──────────────────┘    └──────────┬───────────┘             │
│                                     │                          │
│  ┌──────────────────────┐           │                          │
│  │  Simulation Engine   │◄──────────┘                          │
│  │  (loads from DB,     │    reads seeded entities             │
│  │   extends live data) │                                      │
│  └──────────┬───────────┘                                      │
│             │  auto-starts if DEMO_SIMULATION_AUTO_START=true   │
│             ▼                                                   │
│  ┌──────────────────────┐                                      │
│  │  DemoAnalyticsStore  │  single in-memory store              │
│  │  (live metrics,      │  ← ALL dashboards read from here     │
│  │   activity feed)     │                                      │
│  └──────────┬───────────┘                                      │
│             │                                                  │
│  ┌──────────▼───────────┐                                      │
│  │  API Controllers     │  /v1/public/demo/*                  │
│  │  /v1/public/demo/admin/*                                    │
│  └──────────┬───────────┘                                      │
│             │                                                  │
│  ┌──────────▼───────────┐                                      │
│  │  Next.js Pages       │  /demo, /demo/organizer,            │
│  │                      │  /demo/exhibitor, /demo/admin       │
│  └──────────────────────┘                                      │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Record Counts

| Entity | Count | Notes |
|--------|-------|-------|
| Events | 1 | TechExpo 2027 @ Moscone Center |
| Organizers | 5 | Event Director, Operations, Registration, Analytics, Exhibitor Success |
| Exhibitors | 10 | Microsoft, Apple, Google, NVIDIA, Adobe, Cisco, Salesforce, IBM, Intel, Siemens |
| Products | 54 | 4–6 per exhibitor, factual public information |
| Attendees | 120 | Diverse profiles, companies, industries, countries |
| Booth Visits | 800 | ~80 per exhibitor average |
| AI Conversations | 500 | ~50 per exhibitor average |
| Qualified Leads | 250 | Scored with buying intent, stage, deal value |
| Brochure Downloads | 400 | ~40 per exhibitor average |
| Meetings | 70 | Booth-requested meetings |
| Activity Feed | 300 | Last 48 hours of distributed activity |

## Visitor Profiles & Behaviour Distributions

| Profile Type | Count | Buying Intent | Key Behaviour |
|-------------|-------|---------------|---------------|
| Technical Buyer | ~18 | 85-99 | High product interest, technical questions |
| Executive | ~15 | 70-94 | Meetings, high-value leads |
| Innovation Lead | ~13 | 60-89 | Broad exploration, AI conversations |
| Developer | ~14 | 40-69 | Deep technical questions, SDK interest |
| Procurement | ~10 | 75-94 | Lead forms, pricing interest |
| Researcher | ~11 | 30-59 | Detailed conversations, whitepaper downloads |
| Partner | ~10 | 50-79 | Meetings, relationship building |
| Student | ~10 | 10-29 | Brochure downloads, general browsing |
| Press | ~9 | 5-19 | Product views, announcements interest |
| Investor | ~10 | 40-79 | Executive conversations, meetings |

**Behaviour Distribution:**
- QR Scans: 30% of all interactions
- Booth Visits: 40% with dwell time 2-25 minutes
- AI Chats: 25% with 2-6 message exchanges
- Brochure Downloads: 15% 
- Lead Submissions: 12% with conversion rate ~30%
- Meetings: 5% with 50% confirmation rate

## Company Personalities

| Company | Traffic Share | Dwell Time | Lead Quality | AI Engagement | Brochure DLs |
|---------|--------------|------------|--------------|---------------|-------------|
| Microsoft | 16% | Medium | High | Very High | High |
| Google | 14% | Medium | High | Very High | High |
| Apple | 12% | Very High | Very High | Medium | Medium |
| NVIDIA | 13% | High | High | Very High | Medium |
| Adobe | 9% | Medium | Medium | Medium | Very High |
| Cisco | 8% | Medium | Medium | Medium | Medium |
| Salesforce | 9% | Medium | Very High | High | High |
| IBM | 7% | High | High | High | Low |
| Intel | 6% | Medium | Medium | Medium | Low |
| Siemens | 6% | Medium | Medium | Low | Low |

## Simulation Rules

1. **Deterministic Base**: All seed data generated with PRNG seed 2027 produces identical output on every run.

2. **Extend, Don't Replace**: Simulation engine only operates on seeded attendees and exhibitors. No disconnected records are generated.

3. **Scenario-driven Activity**: Each tick (20-60s interval adjusted by scenario multipliers) generates one event:
   - Picks exhibitor with scenario bias weighting
   - Picks random seed attendee
   - Weighted random event type from scenario parameters

4. **Time of Day Awareness**: Traffic changes naturally:
   - Morning (8-10am): Registration spike, high initial traffic
   - Midday (10am-1pm): Peak booth traffic
   - Lunch (1-2pm): Reduced activity
   - Afternoon (2-5pm): Meetings increase
   - Evening (5-7pm): Longer conversations

5. **Scenario Multipliers**:
   - Morning Rush: 1.8× traffic, 0.6× dwell time
   - Peak Expo Hours: 2.5× traffic, 1.5× AI usage
   - Executive Networking: 2.5× meetings, 2.0× lead quality
   - Lunch Break: 0.4× traffic, 0.3× AI usage
   - Closing Session: 1.5× traffic, 2.5× lead generation
   - Day Two: 2.0× traffic, 1.8× AI usage
   - Final Day: 2.2× traffic, 3.0× lead generation

6. **Deterministic Analytics Derivation**: Every displayed metric derives directly from the underlying event data:
   ```
   Captured Visits = COUNT(exhibitor_relationships WHERE event_id = X)
   Unique Visitors = COUNT(DISTINCT attendee_user_id FROM exhibitor_relationships)
   Conversion Rate = COUNT(lead_submissions) / COUNT(DISTINCT attendee_user_id) * 100
   Dwell Time = SUM(visit durations) / COUNT(visits)
   AI Engagement = COUNT(ai_conversations) / COUNT(booth_visits) * 100
   ```

## Analytics Derivations

All dashboards derive from a single source of truth. No fake counters.

### Organizer Dashboard
| Metric | Source |
|--------|--------|
| Live visits | `DemoAnalyticsStore.getEventMetrics().totalLiveBoothVisits` |
| Unique visitors | `PublicExhibitorsService.demoAnalytics().traffic.uniqueVisitors` |
| Conversion rate | `demoAnalytics().conversions.conversionRate` |
| Booth heatmaps | `demoAnalytics().booths[].heat` (normalized visit count) |
| Popular industries | `demoAnalytics().industries` (aggregated from attendee_profiles) |
| AI insights | `demoAnalytics().topics` (extracted from conversations) |

### Exhibitor Dashboard
| Metric | Source |
|--------|--------|
| QR scans | `demoExhibitorDashboard().performance.qrScans` |
| Relationships | `demoExhibitorDashboard().performance.relationshipsCreated` |
| Returning visitors | `demoExhibitorDashboard().performance.returningVisitors` |
| Pipeline | `demoExhibitorDashboard().pipeline` |
| Recent activity | `demoExhibitorDashboard().recentActivity` |
| Live booth metrics | `DemoAnalyticsStore.getBoothMetrics(boothId)` |

### AI Insights
- Derived from topic analysis of conversation content
- Generated from lead_intelligence table (AI-scored leads)
- Trends computed from activity distribution over time
- All insights are algorithmic, never hardcoded

## Scenarios

| Scenario | Traffic | AI | Meetings | Leads | Dwell | Best For |
|----------|---------|-----|----------|-------|-------|----------|
| Morning Rush | 1.8× | 0.7× | 0.4× | 0.8× | 0.6× | Opening hours demo |
| Peak Expo Hours | 2.5× | 1.5× | 1.2× | 1.8× | 1.0× | Mid-event showcase |
| Executive Networking | 1.0× | 0.5× | 2.5× | 2.0× | 1.8× | VIP/long conversation demo |
| Lunch Break | 0.4× | 0.3× | 0.2× | 0.3× | 0.5× | Slow period demo |
| Closing Session | 1.5× | 1.2× | 1.5× | 2.5× | 0.8× | Urgency/scarcity demo |
| Day Two | 2.0× | 1.8× | 1.5× | 1.5× | 1.3× | Continuing event demo |
| Final Day | 2.2× | 2.0× | 2.0× | 3.0× | 1.5× | Closing surge demo |

## Validation

### ID Uniqueness
- All UUIDs generated deterministically with namespace (`organizer:0`, `attendee:42`, etc.)
- No duplicate IDs across or within entity types
- SHA-256 namespace-based generation ensures global uniqueness

### Foreign Key Integrity
- All visits, conversations, leads, brochures, meetings reference valid attendee + exhibitor IDs
- Activities reference valid attendee + exhibitor IDs
- Cross-entity consistency verified at generation time

### Analytics Consistency
- Every dashboard metric derivable from base event data
- `capturedVisits >= uniqueVisitors >= returningVisitors` invariant holds
- Conversion rate always ≤ 100%
- Heat values normalized to 0-100 range
- Booth-level metrics sum to event-level metrics

### Dashboard Consistency
- Organizer dashboard: aggregated across all booths
- Exhibitor dashboard: scoped to single booth
- Both derive from same `exhibitor_relationships` and `lead_submissions` tables
- No separate "demo" data paths

## Performance

| Operation | Expected Performance |
|-----------|---------------------|
| Seed generation (JSON) | ~1 second |
| Database seed (120 attendees, 10 exhibitors) | ~10 seconds |
| Simulation event tick | <1ms (in-memory) |
| Analytics query (DB) | <100ms |
| Analytics query (in-memory) | <1ms |
| Admin panel refresh | ~3s poll interval |
| Full demo:reset  | ~30 seconds (depends on Supabase reset) |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DEMO_SIMULATION_AUTO_START` | `true` in dev, unset in prod | Auto-starts the simulation engine on API boot |
| `API_DATABASE_URL` | — | Postgres connection string (production) |
| `API_SUPABASE_URL` | — | Supabase API URL (production) |
| `API_SUPABASE_SERVICE_ROLE_KEY` | — | Supabase service role key (production) |

## Seed Pipeline

The seed pipeline has **one source of truth** — `demo_seed.json`:

```
generate-demo-seed.ts  (deterministic, seed=2027)
         │
         ▼
   demo_seed.json      (the ONLY data definition)
         │
         ▼
   demo.ts             (JSON importer — no inline data)
         │
         ▼
   Database             (Postgres via Supabase)
         │
         ▼
   Simulation Engine   (loads from DB, extends live)
         │
         ▼
   Analytics           (single DemoAnalyticsStore)
         │
         ▼
   Dashboards          (all pages read same store)
```

`demo.ts` no longer contains any inline exhibitor, attendee, or product definitions. All data originates from `demo_seed.json`. The database schema mapping is:

| JSON entity | Database table(s) |
|---|---|
| `organizers[]` | `users` + `organization_memberships` |
| `exhibitors[]` | `organizations` + `event_exhibitors` + `kb_sources` |
| `attendees[]` | `users` + `attendee_profiles` |
| `exhibitors.products` | Mapped as descriptive text in booth content |
| `exhibitors.knowledgeDocuments` | `files` + `kb_sources` |

## Remaining Limitations

1. **Embedding Generation**: Knowledge base embeddings require the worker process to be running for `kb_chunks` to be generated.

2. **Cross-session Persistence**: Live analytics (`DemoAnalyticsStore`) is in-memory and resets on API server restart. No PostgreSQL persistence for simulation events.

3. **QR Code Images**: QR code PNG generation requires the `qrcode` package and is performed during seed.

4. **Auth Bypass**: All demo endpoints are intentionally public (no auth guard). Production routes require valid JWT.

5. **No Multi-user Simulation**: The simulation engine runs as a single process within the API server. Multiple users see the same simulation state.

6. **Company Logos**: Logo paths reference `/demo/logos/{company}.svg` — actual SVG files need to be added to the public directory for full UI fidelity.

## Commands

```bash
# Generate deterministic seed data (creates demo_seed.json)
pnpm demo:seed

# Full reset: generate seed → reset DB → migrate → seed → ready
pnpm demo:reset

# Legacy direct seed (still works, now reads from demo_seed.json)
pnpm db:seed
pnpm db:seed:demo
```

## Walkthrough Verification

The following flow has been verified to produce correct, deterministic results:

1. `pnpm demo:reset` — generates seed, resets DB, migrates, seeds, triggers ingestion
2. API server starts → `DemoSimulationService.onModuleInit()` loads seeded data
3. Organizer Dashboard at `/demo/organizer` shows realistic analytics from DB
4. Simulation starts automatically (if configured) or via `/demo/admin`
5. Live Activity Feed at `/demo/organizer` updates every 5 seconds via `LiveMetricsBar`
6. User navigates `/hackathon` → scans QR → visits booth → chats with AI → downloads brochure → submits lead
7. Organizer Dashboard reflects new data immediately (polling every 5s)
8. Exhibitor Dashboard at `/demo/exhibitor/{id}` shows updated booth analytics
9. Booth Analytics at `/demo/organizer/analytics` updates with new traffic
10. Activity Feed shows the new interactions
11. AI Insights at `/demo/organizer/ai-insights` shows updated topic analysis

All data flows from a single event dataset. No fake counters. No disconnected simulation.

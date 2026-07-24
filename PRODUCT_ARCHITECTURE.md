# ExAi Product Architecture Document

> **Version:** 1.0
> **Date:** July 24, 2026
> **Author:** Product Architecture Team
> **Status:** Draft for review

---

**Table of Contents**

1. [User Personas](#1-user-personas)
2. [Workspaces](#2-workspaces)
3. [Navigation Architecture](#3-navigation-architecture)
4. [Information Architecture](#4-information-architecture)
5. [User Journeys](#5-user-journeys)
6. [AI Opportunities](#6-ai-opportunities)
7. [UX Review](#7-ux-review)
8. [Gap Analysis](#8-gap-analysis)

---

# 1. User Personas

## 1.1 Organizer

**Who they are:** Exhibition organizers, event directors, marketing managers who plan and operate trade shows, expos, and industry exhibitions.

**Primary goals:**
- Sell booth space to exhibitors
- Drive attendee registrations
- Facilitate meaningful connections between exhibitors and attendees
- Measure exhibition ROI
- Reduce operational overhead of running events

**Daily workflow (current):**
1. Log into the console to check portfolio health
2. Review which events are live, which need attention
3. Create or edit events (set dates, branding, status)
4. Manage exhibitor pipeline — invite, track confirmations
5. Review analytics — attendee counts, exhibitor counts, booth engagement
6. Generate AI reports for stakeholder updates

**Permissions:**
- `org:owner` — full control, can delete organization
- `org:admin` — can manage events, exhibitors, members
- `org:member` — read access to events, can view analytics

**Current implementation:**
The organizer experience is split across **three separate route groups**, which is a critical UX flaw:

| Route Group | Path | Status |
|---|---|---|
| **Legacy organizer** | `/organizer/*` | Older navigation, partially built |
| **Console (primary)** | `/org/*` | More complete, has sidebar nav |
| **Demo organizer** | `/demo/organizer/*` | Read-only, used for marketing |

The **Console** at `/org/*` is the most complete workspace:
- Dashboard — portfolio overview with KPI cards, event table
- Events list — create, search, filter events
- Event detail tabs — Overview, Sessions, Speakers, Exhibitors, Registrations, Reports, Settings
- Analytics — pipeline funnel, booth engagement bar chart, industry/topic breakdowns
- Settings — read-only org name display
- Report generation — AI-powered executive reports

**Missing capabilities:**
- No floor plan management (stubbed as "Milestone 4")
- No lead analytics dashboard (raw data exists but not surfaced to organizers)
- No exhibitor relationship visibility organizer-side (organizers cannot see which exhibitors are generating the most engagement)
- No attendee management beyond registration counts
- No campaigns/promotion tools
- No financial tracking (booth sales revenue, budget)
- No team management beyond member invitation
- No notification center
- No comparison view across events

---

## 1.2 Exhibitor

**Who they are:** Marketing managers, sales directors, event coordinators employed by companies that exhibit at trade shows.

**Primary goals:**
- Generate qualified leads from booth visitors
- Book meetings with high-potential prospects
- Showcase products and brochures
- Measure ROI on exhibition investment
- Follow up with leads after the event

**Daily workflow (current):**
1. Log into exhibitor portal
2. Check dashboard — visitors today, pipeline status, attention items
3. Review AI intelligence feed — new leads, profile enrichments
4. Manage booth profile — edit company info, branding
5. Configure lead capture form
6. Upload knowledge sources (brochures, product specs)
7. Download/download QR codes for booth materials
8. Review relationship workspace for hot leads
9. Add notes on attendee interactions

**Permissions:**
- `exhibitor:admin` — full booth control
- `exhibitor:rep` — limited to viewing leads, taking notes

**Current implementation:**
Exhibitor experience is split across **two implementations**:

| Route Group | Path | Status |
|---|---|---|
| **Exhibitor Portal (live)** | `/exhibit/[orgId]/*` | Full CRUD — edit booth, forms, QR codes, knowledge sources |
| **Demo exhibitor** | `/demo/exhibitor/[id]/*` | Read-only, used for marketing |

The **Exhibitor Portal** at `/exhibit/[orgId]/*` is the most complete workspace with:
- Dashboard — KPIs, pipeline grid, AI insights, attention items
- AI insights — intelligence feed, recommendation cards
- Lead forms — dynamic field editor, draft/publish workflow
- QR codes — generate and download
- Knowledge sources — upload files, add URLs, view status
- Team — view current member email
- Settings — booth profile editor, publish controls
- Attendee list — searchable, filterable relationship table
- Relationship workspace — attendee profile, AI lead intelligence, interaction timeline, notes

**Missing capabilities:**
- No meeting booking/management
- No product catalog (beyond knowledge sources)
- No marketing asset library
- No team collaboration tools (notes are present but no team assignment)
- No booth comparison with other exhibitors
- No pre-event preparation checklist
- No post-event follow-up campaign tools
- No integration with CRM (Salesforce, HubSpot)
- No real-time lead notifications

---

## 1.3 Attendee

**Who they are:** Trade show visitors, industry professionals, buyers, decision-makers attending exhibitions.

**Primary goals:**
- Discover relevant exhibitors and products
- Book meetings with exhibitors
- Save interesting companies for follow-up
- Navigate the exhibition hall effectively
- Network with peers
- Learn about new products and industry trends

**Daily workflow (current):**
1. Land on event homepage — view exhibitor directory
2. Browse exhibitors by name or industry
3. Scan QR code at a booth to access booth experience
4. Fill out lead form to share contact info
5. Chat with AI about exhibitor products
6. Save exhibitors to favorites
7. View saved exhibitors list
8. Update profile and consent preferences

**Current implementation:**
Attendee experience spans several routes:

| Route | Purpose |
|---|---|
| `/hackathon` | Event landing page with live counters, exhibitor grid |
| `/hackathon/expo` | Expo floor — full exhibitor directory |
| `/e/[eventSlug]` | Browse — searchable exhibitor list |
| `/e/[eventSlug]/saved` | Saved exhibitors |
| `/e/[eventSlug]/exhibitors/[id]` | Exhibitor profile |
| `/e/[eventSlug]/exhibitors/[id]/insights` | AI booth briefing |
| `/visit/[qrToken]` | QR-triggered booth experience (multi-step: landing → email → profile → form → success) |
| `/account/profile` | Profile management |
| `/showcase` | Redirect to hackathon/expo |

**Missing capabilities:**
- No personalized recommendations
- No meeting scheduler
- No hall navigation / floor map
- No messaging between attendee and exhibitor
- No session/agenda attendance
- No post-event follow-up tracking
- No attendee-to-attendee networking
- No event calendar/schedule view
- No push notifications for booth offers or meeting reminders
- No multi-event support (only one event can be active)

---

## 1.4 Admin (Platform)

**Who they are:** Platform operators, system administrators managing the ExAi platform itself.

**Primary goals:**
- Monitor platform health
- Manage organizations and users
- Handle subscriptions and billing
- Provide support
- Audit platform activity

**Current implementation:**
Only a single `/admin` page exists, entirely **hardcoded with mock data**:
- Health bar (Operational / Degraded)
- "Attention Required" section (degraded services)
- KPI cards (Organizations: 12, Active Events: 3, Total Users: 1247, Platform Health: 99.9%)
- Service status list (API Gateway, Database, Queue, Storage, AI Inference)
- Recent operational events
- Quick action links (mostly to placeholder routes)

**Missing capabilities:** Nearly everything. This is a skeleton.

---

# 2. Workspaces

## 2.1 Organizer Workspace

**Current path:** `/org/*` (primary), `/organizer/*` (legacy)

**Purpose:** Manage exhibition portfolio, monitor event health, drive registrations and exhibitor engagement.

**Navigation (current):**
| Label | Path | Purpose |
|---|---|---|
| Dashboard | `/org` | Portfolio KPI overview, event list with health indicators, next best actions |
| Events | `/org/events` | Create, search, filter events |
| Analytics | `/org/analytics` | Per-event analytics: pipeline, booth engagement, industries, topics |
| Settings | `/org/settings` | Organization identity (read-only) |

**Event-level sub-navigation (tabs):**
| Tab | Purpose |
|---|---|
| Overview | Event KPIs, health status, next best actions |
| Sessions | Create/edit agenda sessions |
| Speakers | Create/edit speakers |
| Exhibitors | List exhibitors, invite new ones |
| Registrations | Placeholder — "No registrations yet" |
| Reports | AI-generated executive reports |
| Settings | Edit event name, slug, dates, branding |
| Documents | Placeholder |

**Primary actions:**
- Create event
- Publish/unpublish/archive event
- Invite exhibitors
- Create/edit sessions and speakers
- Generate AI report
- View analytics

**What's missing:**
- Floor plan management
- Lead analytics (organizer-level view of all booth leads)
- Exhibitor success metrics
- Financial tracking (booth sales, budget)
- Campaign/promotion tools
- Team management UI
- Cross-event comparison
- AI copilot / assistant embedded in workspace

**Workflow assessment:**
The console layout is clean but the information hierarchy needs work. The Dashboard focuses on "what can I edit" (event list, create event) rather than "what is happening right now" (live metrics, alerts, revenue). The Legacy `/organizer/*` route should be removed entirely.

---

## 2.2 Exhibitor Workspace

**Current path:** `/exhibit/[orgId]/*`

**Purpose:** Manage booth presence, capture and nurture leads, measure exhibition performance.

**Navigation (current):**
| Section | Label | Path |
|---|---|---|
| Primary | Dashboard | `/exhibit/[orgId]` |
| Primary | AI Insights | `/exhibit/[orgId]/ai-insights` |
| Management | QR Codes | `/exhibit/[orgId]/qr` |
| Management | Forms | `/exhibit/[orgId]/forms` |
| Management | Documents | `/exhibit/[orgId]/documents` |
| Management | Team | `/exhibit/[orgId]/team` |
| Settings | Settings | `/exhibit/[orgId]/settings` |

**Plus dynamic routes:**
- `/exhibit/[orgId]/dashboard/[eeId]` — full dashboard screen with KPI grid, pipeline, AI insights
- `/exhibit/[orgId]/attendees` — attendee/relationship list with search, filter, sort
- `/exhibit/[orgId]/relationships/[relId]` — relationship workspace with profile, AI intelligence, timeline, notes

**Primary actions:**
- View dashboard metrics
- Edit booth profile (company info, branding, colors)
- Manage lead capture forms (add fields, publish)
- Generate/regenerate QR code
- Upload knowledge sources (files, URLs)
- View attendee pipeline
- Read AI recommendations
- Add/edit/archive relationship notes

**What's missing:**
- Booth analytics (dedicated page with charts)
- Meeting scheduler
- Product catalog (separate from knowledge sources)
- Marketing assets (banners, videos)
- Post-event follow-up tools
- Competitor booth insights
- Real-time notifications (new lead, new meeting request)
- Mobile app access

**Workflow assessment:**
The exhibitor workspace is the most complete of the three personas. However, the navigation structure mixes primary tools (Dashboard, AI) with management tools (QR, Forms, Documents) in a flat list. The "Attendees" and "Relationships" pages are not in the sidebar navigation — they're accessed through deep links from the dashboard. This makes them hard to discover.

The need to pass `?eeId=` (event exhibitor ID) in many URLs adds complexity. The workspace should be scoped to a single event/booth context.

---

## 2.3 Attendee Workspace

**Current paths:** `/hackathon`, `/e/[eventSlug]/*`, `/visit/[qrToken]`

**Purpose:** Discover exhibitors, engage with booths, manage connections.

**Navigation (current):**
The attendee experience is fragmented across three different interfaces:

**Interface 1: Event Landing** (`/hackathon`)
- Hero with event branding, QR code, "Enter Exhibition" CTA
- Live counters (leads, visits, AI chats)
- Journey step guide
- Exhibitor directory (searchable, filterable)
- Bottom: Browse / Saved / Profile tabs

**Interface 2: Browse & Saved** (`/e/[eventSlug]/*`)
- Exhibitor directory with search
- Saved exhibitors list
- Exhibitor profile page with save/unsave
- AI booth briefing page
- Bottom nav: Browse / Saved / Profile

**Interface 3: Booth Experience** (`/visit/[qrToken]`)
- Multi-step flow: landing → email → profile → lead form → success
- AI chat assistant
- Resource/document download
- Dwell tracking

**Primary actions:**
- Browse exhibitors by name/industry
- Save/unsave exhibitors to favorites
- View exhibitor profile
- Read AI-generated booth briefing
- Fill out lead form at booth
- Chat with AI about exhibitor
- Download brochures
- Update profile and consent preferences

**What's missing:**
- Personalized exhibitor recommendations
- Meeting booking with exhibitors
- Hall navigation / floor map
- Message/inbox with exhibitors
- Agenda/session tracking
- Post-event follow-up dashboard
- Attendee-to-attendee networking
- Push notifications

**Workflow assessment:**
The attendee experience is fragmented. There are two different attendee entry points (`/hackathon` vs `/e/[eventSlug]`) with similar but not identical interfaces. The `BoothExperience` component is well-designed as a micro-interaction but is disconnected from the broader attendee journey.

---

## 2.4 Admin Workspace

**Current path:** `/admin`

**Purpose:** Platform operations, system health, organization/user management.

**Current state:** Single page with hardcoded mock data. No real functionality.

---

## 2.5 Demo Workspace

**Current paths:** `/demo/*`

**Purpose:** Read-only product preview for prospects and marketing.

**Coverage:**
- `/demo` — Persona selection hub
- `/demo/organizer/*` — Organizer workspace (Dashboard, Events, Analytics, Heatmaps, AI Insights, Reports)
- `/demo/exhibitor/[id]/*` — Exhibitor booth workspace (Dashboard, Products, Visitors, Analytics, AI Insights, QR, Preview)
- `/demo/admin` — Simulation control panel (hidden)
- `/demo/attendee` — Redirects to `/hackathon`

**Assessment:** The demo covers all the key features but the "Event" detail page at `/demo/organizer/event/[slug]` is at a different URL pattern than the events in the live workspace, creating inconsistency.

---

# 3. Navigation Architecture

## 3.1 Current State

The navigation system has **three layers**:

### Layer 1: Global Navigation (`GlobalNav`)
Persistent top bar with branding and persona switching. Has three variants:
- **marketing** — full perspective row + Sign in
- **console** — logo only (used inside workspaces)
- **compact** — condensed perspective row (used in admin, attendee, portal)

**Perspectives offered:**
| Perspective | Label | Link |
|---|---|---|
| Experience | Experience ExAi | `/demo` |
| Organizer | Organizer | `/demo/organizer` |
| Exhibitor | Exhibitor | `/demo/exhibitor` |
| Attendee | Attendee | `/hackathon` |

**Problem:** The perspectives all point to demo/read-only routes, not the live workspaces. A logged-in organizer clicking "Organizer" in the top nav goes to the demo, not to their actual workspace at `/org`.

### Layer 2: Workspace Navigation (`WorkspaceNav`)
Left sidebar (desktop) / collapsible accordion (mobile) with sectioned navigation.

Used in:
- Console (organizer): Dashboard, Events, Analytics, Settings
- Exhibitor Portal: Dashboard, AI Insights, QR Codes, Forms, Documents, Team, Settings
- Admin: Overview

### Layer 3: Context Navigation
- **Event tabs** (`PageTabs`): Overview, Sessions, Speakers, Exhibitors, Registrations, Reports, Settings
- **Exhibitor sub-navigation** (legacy): Dashboard, Leads, Relationships, Products, Analytics, Settings

## 3.2 Key Issues

### Duplication
- **Two organizer workspaces:** `/organizer/*` (legacy) and `/org/*` (console) — same purpose, different navigation
- **Two breadcrumb implementations:** `Breadcrumbs` and `UnifiedBreadcrumbs` — confusion about which is canonical
- **Event detail at different URLs:** `/demo/organizer/event/[slug]` vs `/org/events/[eventId]` vs `/organizer/events/[eventId]`

### Missing navigational elements
- No "Floor Plan" in organizer navigation (explicitly called out in product vision)
- No "Meetings" in any persona's navigation
- No "Leads" or "Lead Analytics" in organizer navigation
- Exhibitor sidebar lacks "Visitors", "Attendees", "Relationships" (these are deep-linked only)
- Attendee has no "Recommendations" or "Messages" in navigation

### Confusing flows
- An organizer who signs in is redirected to `/organizer` (legacy) but the console is at `/org`
- The demo experience links to `/hackathon` for attendee, but the actual attendee browse is at `/e/[eventSlug]`
- Attendee has two separate browsing UIs (`/hackathon` and `/e/[eventSlug]`) with different layouts

## 3.3 Recommended Architecture

```
GLOBAL NAV (always present)
  - ExAi logo → dashboard (role-aware)
  - Role switcher: Organizer | Exhibitor | Attendee | Admin
  - Search (command palette: Cmd+K)
  - User menu (profile, settings, sign out)

ORGANIZER NAV
  Dashboard          /org              [information-first: what's happening now]
  Exhibitions        /org/exhibitions  [rename from "Events" to exhibition-first language]
  Exhibitors         /org/exhibitors   [cross-event exhibitor management]
  Attendees          /org/attendees    [cross-event audience view]
  Floor Plan         /org/floor-plan   [spatial canvas]
  Lead Analytics     /org/leads        [organizer's view of all lead data]
  Meetings           /org/meetings     [meeting oversight across all events]
  AI Copilot         /org/ai           [AI as a first-class workspace]
  Operations         /org/ops          [settings, team, billing]
  Settings           /org/settings

EXHIBITOR NAV
  Dashboard          /exhibit          [how successful is my booth today?]
  Booth              /exhibit/booth    [profile, branding, lead form]
  Leads              /exhibit/leads    [captured leads with AI scoring]
  Meetings           /exhibit/meetings [booked meetings]
  Visitors           /exhibit/visitors [all booth visitors, relationship pipeline]
  Products           /exhibit/products [product showcase catalog]
  Marketing Assets   /exhibit/assets   [brochures, videos, knowledge base]
  Analytics          /exhibit/analytics [booth performance metrics]
  Team               /exhibit/team
  Settings           /exhibit/settings

ATTENDEE NAV
  Home               /e/[slug]         [personalized dashboard]
  Explore            /e/[slug]/explore [exhibitor directory]
  Saved              /e/[slug]/saved   [bookmarked exhibitors]
  Meetings           /e/[slug]/meetings
  Recommendations    /e/[slug]/for-you [AI-powered suggestions]
  Messages           /e/[slug]/inbox   [exhibitor communications]
  AI Assistant       /e/[slug]/ai      [personal event AI]

ADMIN NAV
  Organizations      /admin/orgs
  Users              /admin/users
  Subscriptions      /admin/billing
  Support            /admin/support
  Audit              /admin/audit
  Platform Settings  /admin/settings
```

---

# 4. Information Architecture

## 4.1 Entity Model

```
Organization
  ├── kind: organizer | exhibitor
  ├── Members (organization_memberships)
  │     ├── role: owner | admin | member
  │     └── status: pending | active
  ├── Events (for organizers)
  │     ├── status: draft | published | live | completed | archived
  │     ├── Agenda Sessions
  │     ├── Speakers
  │     └── Event Exhibitors (for this event)
  │           ├── status: invited | accepted | profile_complete | ready | withdrawn | archived
  │           ├── Booth QR Credentials
  │           ├── Lead Forms → Lead Form Fields
  │           ├── Lead Submissions
  │           │     ├── Lead Submission Values
  │           │     └── Lead Intelligence (AI-enriched)
  │           ├── Exhibitor Relationships (with attendees)
  │           │     ├── Relationship Notes
  │           │     └── Relationship Enrichments
  │           ├── public_enrollments
  │           └── Knowledge Base Sources
  │                 ├── KB Documents
  │                 └── KB Chunks (with embeddings)
  └── Exhibitors (for exhibitor orgs)
        └── Event Exhibitors (booths at events)

User
  ├── Attendee Profile (1:1)
  ├── Attendee Profile Consent (1:1)
  ├── Organization Memberships
  └── Exhibitor Relationships (as attendee)
```

## 4.2 Entity Definitions

### Organization
The core tenant. Has a `kind` that determines its role — organizer runs events, exhibitor participates in events. An organization can theoretically have multiple members.

### Event (Exhibition)
An exhibition within an organizer's portfolio. Contains sessions (optional), speakers (optional), and exhibitors (required for exhibitions). Has lifecycle: draft → published → live → completed → archived.

**Current naming:** Called "events" in the codebase. Should be called "exhibitions" in the UI to match product vision.

### Event Exhibitor (Booth)
Represents an exhibitor company's presence at a specific event. Has its own status workflow (invited → accepted → profile_complete → ready). Contains the booth's branding, lead form, QR codes, knowledge sources, and all engagement data.

### Lead
Captured when an attendee submits a lead form at a booth. Contains submission values and AI-enriched intelligence (score, buying intent, summary, topics, follow-up recommendation).

### Exhibitor Relationship
Links an attendee to an exhibitor. Tracks all interactions (lead submissions, notes, enrichments). This is the core engagement entity.

### Meeting
**Missing from the data model.** There is no `meetings` table. This is a critical gap.

### Product
**Missing from the data model as a distinct entity.** Products are mixed in with knowledge sources. The `kb_sources` table has `source_type` values like `pdf`, `brochure`, `presentation` but no structured product entity.

### Campaign / Promotion
**Missing entirely.** No tables for marketing campaigns, promotions, or exhibitor packages.

## 4.3 Relationship Inconsistencies

1. **`files` table uses polymorphic ownership** (`owner_type` + `owner_id`) which is harder to query and lacks proper foreign key enforcement.

2. **`entitlements` table** is a placeholder with no FK to organizations.

3. **`help_articles` table** is a placeholder with minimal columns.

4. **`exhibitor_dashboard_visits`** is defined directly in a migration file, not in the Drizzle schema files — it won't be regenerated by `drizzle-kit`.

5. **No `meetings` table** despite Meetings being a core feature in the product vision.

6. **No `products` table** — exhibitors need a way to showcase products beyond knowledge source documents.

7. **No `registrations` table** — attendee registrations are implied through enrollment but not tracked as first-class entities.

8. **`public_enrollments`** is a lightweight table that tracks email-based enrollment but isn't linked to a full registration system.

## 4.4 Data Flow Architecture

```
Database (Postgres + pgvector)
    ↑ Drizzle ORM queries
NestJS Services (Business Logic)
    ↑ HTTP
API Client (typed functions)
    ↑ Supabase session
Next.js Server Components (data loading)
    ↓ props
React Client Components (presentation + interaction)
```

**Key observation:** Business logic lives in both backend (NestJS services) and frontend (`demo-intelligence.tsx`). The frontend has transformation logic (`computeOrganizerBriefing`, `computeExhibitorIntelligence`) that should ideally be backend-owned for consistency across surfaces.

---

# 5. User Journeys

## 5.1 Organizer Journey: Creating and Running an Exhibition

```
1. Sign in → redirected to /organizer (legacy)
   FRICTION: Should go to /org (console)
   
2. See dashboard → events table, KPI cards
   FRICTION: Dashboard shows "what can I edit" rather than "what's happening"
   
3. Create event → fill name, dates, timezone
   FRICTION: No exhibition-specific fields (hall size, capacity, booth pricing)
   
4. Configure event → settings page with name, slug, dates, branding
   FRICTION: No floor plan, no booth package configuration
   
5. Invite exhibitors → enter company name and email
   FRICTION: No bulk import, no exhibitor package selection
   
6. Add sessions/speakers (optional) → create forms
   MISSING: Exhibition-focused events don't need this; should be optional module
   
7. Publish event → make it live
   
8. Monitor → analytics dashboard, reports
   FRICTION: Lead analytics not available to organizers (only to exhibitors)
   
9. Generate AI report → review and download
   
10. Archive event → close out
```

**Complete journey gaps:**
- No pre-event exhibitor onboarding flow
- No booth assignment (floor plan integration)
- No promotional campaign creation
- No registration management
- No financial tracking
- No post-event report distribution

## 5.2 Exhibitor Journey: Setting Up and Running a Booth

```
1. Receive invitation → click link → sign in
   MISSING: Structured onboarding flow for new exhibitors
   
2. Set up booth → edit company name, description, logo, branding
   ADEQUATE: Booth profile form works
   
3. Configure lead form → add fields, publish
   ADEQUATE: Lead form editor works
   
4. Upload knowledge sources → brochures, product specs
   ADEQUATE: Knowledge source upload works
   
5. Generate QR code → download for print
   ADEQUATE: QR generation works
   
6. Publish booth → make it live
   FRICTION: Publishing flow could be clearer
   
7. During event → monitor dashboard
   ADEQUATE: Dashboard with pipeline, AI insights, activity feed
   
8. Review leads → view attendee profiles, AI intelligence
   FRICTION: Need to navigate to relationship workspace individually
   
9. Add notes → record interaction details
   ADEQUATE: Notes panel works
   
10. Post-event → follow up with leads
    MISSING: No post-event follow-up workflow, no CRM export, no campaign tools
```

**Complete journey gaps:**
- No pre-event preparation checklist
- No meeting booking (with attendees or with organizer)
- No product catalog management
- No team member roles/permissions
- No lead export to CSV/CRM
- No post-event analytics comparison

## 5.3 Attendee Journey: Discovering and Engaging

```
1. Access event → open link, scan QR
   FRICTION: Two different entry points (/hackathon vs /e/[slug])
   
2. Browse exhibitors → search by name or industry
   ADEQUATE: Searchable directory
   
3. View exhibitor profile → read about company
   ADEQUATE: Profile with description, links, AI briefing
   
4. Save exhibitor → bookmark for later
   ADEQUATE: Save/unsave works
   
5. Visit booth (QR) → scan → land on booth experience
   ADEQUATE: Multi-step booth experience
   
6. Fill lead form → share contact info
   ADEQUATE: Dynamic lead form works
   
7. Chat with AI → ask about products
   ADEQUATE: AI chat works
   
8. Download brochure → access resources
   ADEQUATE: Resource download works
   
9. View saved exhibitors → revisit saved list
   ADEQUATE: Saved exhibitors page works
   
10. Post-event → follow up with exhibitors
    MISSING: No post-event engagement dashboard
```

**Complete journey gaps:**
- No personalized recommendations
- No meeting booking
- No hall navigation / floor map
- No session/agenda attendance
- No messaging with exhibitors
- No attendee-to-attendee networking
- No event schedule view
- No post-event follow-up

---

## 5.4 Cross-Persona Journey: Lead Capture to Follow-up

```
ATTENDEE at booth
  → Scans QR
  → Lands on booth experience
  → Fills lead form
  → Submits contact info
  → AI enriches the lead (score, intent, summary)
  → Lead saved in database
      |
      ▼
EXHIBITOR
  → Dashboard updates (new relationship, pipeline change)
  → AI intelligence available
  → Can view lead in attendee list
  → Can open relationship workspace
  → Can add notes
  → Can view AI recommendations
      |
      ▼
ORGANIZER
  → Can see aggregate lead counts per event
  → Cannot see individual lead data (not implemented)
  → Cannot see cross-exhibitor lead analytics (not implemented)
```

**Gap:** The organizer has very limited visibility into the lead data flowing through their exhibitions. The data model supports it (lead_submissions have event_id), but there's no organizer-facing UI for it.

---

# 6. AI Opportunities

## 6.1 Current AI Implementation

The platform already has significant AI infrastructure:

| Feature | Location | Status |
|---|---|---|
| Lead intelligence (scoring, intent, summary) | `lead-intelligence.service.ts` | Production |
| Executive report generation | `organizer-reporting.service.ts` | Production |
| Booth AI chat (Q&A via RAG) | `platform-enrollment.service.ts` | Production |
| Knowledge base ingestion (chunking, embedding) | `@concourse/ai/knowledge` | Production |
| AI guardrails (output screening) | `@concourse/ai/guardrails` | Production |
| `AiGenerationService` (LLM orchestration) | `@concourse/ai` | Production |
| `RetrievalService` (vector search) | `@concourse/ai` | Production |
| Frontend intelligence transformations | `demo-intelligence.tsx` | Demo only |

## 6.2 Recommended AI Features

### For Organizers

| Feature | Priority | Description |
|---|---|---|
| **AI Daily Briefing** | P0 | Every morning, AI generates a summary of what happened across all active exhibitions — new registrations, top exhibitors by engagement, alerts |
| **Exhibition Health Score** | P0 | AI computes a composite health score per exhibition (registration pace, exhibitor coverage, engagement metrics) |
| **Anomaly Detection** | P1 | AI flags unusual patterns — sudden drop in registrations, exhibitor churn risk, low engagement booths |
| **Exhibitor Success Predictions** | P1 | AI predicts which exhibitors are on track for ROI based on lead volume, attendee quality, engagement |
| **Smart Booth Recommendations** | P1 | AI recommends which exhibitors to recruit based on past events, industry trends, attendee interests |
| **Report Automation** | P0 | Already implemented — expand to support scheduled reports, comparison reports, multi-event rollups |
| **Natural Language Analytics** | P1 | "How did the automotive exhibitors perform compared to tech exhibitors?" — natural language query |

### For Exhibitors

| Feature | Priority | Description |
|---|---|---|
| **Lead Scoring** | P0 | Already implemented — expand with more signals (dwell time, pages viewed, questions asked) |
| **Follow-up Email Generator** | P0 | AI drafts personalized follow-up emails based on lead intelligence, booth interaction, and topics discussed |
| **Next Best Action** | P0 | "The top 3 leads today — contact these first." Prioritized daily action list |
| **Booth Performance Benchmark** | P1 | "Your booth is in the top 20% for engagement. Here's what top performers do differently." |
| **Smart Form Recommendations** | P1 | AI suggests which form fields produce the highest-quality leads |
| **Knowledge Gap Detection** | P1 | "Attendees frequently ask about pricing, but you haven't uploaded a pricing document." |
| **Meeting Scheduling Assistant** | P1 | AI suggests meeting times with high-intent attendees, auto-sends calendar invites |
| **Competitor Intelligence** | P2 | Anonymous aggregated insight: "Attendees who visited you also visited [competitor] — here's what their booth offers" |

### For Attendees

| Feature | Priority | Description |
|---|---|---|
| **Personalized Recommendations** | P0 | "Based on your profile and saved exhibitors, here are 5 booths you shouldn't miss." |
| **Smart Search** | P0 | Natural language exhibitor search: "Find companies that make warehouse automation solutions" |
| **AI Tour Guide** | P1 | "Start at Booth A, then visit Booths B and C in Hall 2 — they're in your industry." Route optimization across the floor plan |
| **Meeting Assistant** | P1 | AI helps draft meeting requests, suggests talking points based on exhibitor knowledge sources |
| **Booth Briefing** | P0 | Already partially implemented — AI-generated summary of what each exhibitor offers |
| **Post-Event AI Summary** | P1 | "Here's a recap of everything you saved, who you met, and suggested next steps." |

### For Platform Admin

| Feature | Priority | Description |
|---|---|---|
| **System Health AI** | P1 | AI monitors platform metrics and alerts on anomalies (error rate spikes, slow queries, API degradation) |
| **Usage Insights** | P2 | AI identifies feature adoption patterns, churn risk, growth opportunities |

## 6.3 AI Workspace

Per the product vision, AI should be a **first-class workspace**, not a hidden feature.

**Recommended implementation:**
- **Dedicated "AI Copilot" page** in organizer and exhibitor workspaces
- **AI chat panel** available from any page (slide-over panel, not full-page navigation)
- **AI-generated insights** embedded contextually on each page (dashboard, analytics, leads)
- **AI notifications** (smart alerts pushed to a notification center)
- **Command palette** (Cmd+K) that supports natural language queries

---

# 7. UX Review

## 7.1 Information Hierarchy

**Issue:** The Organizer Dashboard at `/org` leads with organization name greeting ("Good morning, [Org Name]") and metric cards (Total Events, Exhibitors, Attendees, Relationships). These are organization-level aggregates that don't answer "What's happening right now?"

**Recommendation:** The dashboard should lead with:
1. Live exhibitions — count and status at a glance
2. Alerts — exhibitor cancellations, registration drops, system issues
3. Today's metrics — registrations today, leads captured today, meetings booked today
4. Quick actions — publish pending event, invite more exhibitors, view latest AI report

Then provide organizational aggregates as secondary context.

## 7.2 Screen Purpose

**Issue:** Several screens exist without clear purpose:
- `/org/events/[eventId]/registrations` — placeholder with "No registrations yet"
- `/org/events/[eventId]/documents` — placeholder with "No event documents"
- `/organizer/events/[eventId]/[section]` — catch-all coming-soon page
- Several exhibitor sub-sections (Leads, Relationships, Products, Analytics, Settings) — all coming-soon

**Recommendation:** Remove placeholder pages. Only show pages that have real functionality. Use feature flags for unreleased features.

## 7.3 Navigation Consistency

**Issue:** Three different navigation approaches exist:
- `/organizer/*` — custom `OrganizerNavigation` component (horizontal scroll / vertical sidebar)
- `/org/*` — `WorkspaceNav` component (consistent sidebar)
- `/demo/*` — `WorkspaceNav` (different set of items from live workspaces)

The `/organizer/*` layout should be removed entirely and replaced with the `(console)` layout.

## 7.4 Task Completion

**Issue:** Creating an exhibitor for an event requires a Server Action in the legacy route but doesn't exist in the Console route (only "Invite" is available, which sends an invitation rather than directly adding an exhibitor).

**Issue:** Publishing a booth in the Exhibitor Portal requires navigating through multiple pages — Settings (to edit profile), then back to Dashboard (to check status), with no guided flow.

**Issue:** The attendee journey from `/hackathon` to `/visit/[qrToken]` to lead submission involves navigating between completely different interfaces and layouts.

## 7.5 Feature Discoverability

**Issues found:**
- The "Attendees" page in the exhibitor portal (`/exhibit/[orgId]/attendees`) is not in the sidebar — only reachable from Quick Actions on the dashboard
- The relationships workspace is only reachable from the attendee list, not from any other context
- AI Insights is in the sidebar but the actual AI intelligence is also embedded on the dashboard — duplication and confusion
- The exhibitor QR code page is buried in "Management" section of the sidebar but is one of the most important features
- The `CommandPalette` only has static navigation items — it doesn't search events, exhibitors, or attendees

## 7.6 Responsive Design

**Issues found:**
- `WorkspaceNav` has mobile variant but it's hidden behind a `<details>` accordion with label "Workspace navigation" — this is not discoverable
- The attendee bottom nav works well on mobile but the exhibitor and organizer sidebars do not collapse into a bottom tab pattern on mobile
- The `BoothExperience` component works well on mobile (single-column steps)

## 7.7 Consistency

**Issues found:**
- Two breadcrumb implementations (`Breadcrumbs` and `UnifiedBreadcrumbs`) with different route patterns
- Console: `/org/events/[eventId]` uses page tabs (Overview, Sessions, Speakers...)
- Demo organizer: `/demo/organizer/event/[slug]` uses a different URL pattern
- The exhibitor portal uses `organizationId` in the URL path (`/exhibit/[orgId]`) but the actual Booth Experience uses a QR token (`/visit/[token]`)
- Metric cards are implemented differently across surfaces — `MetricCard` in design system vs `KPICard` vs inline card components

---

# 8. Gap Analysis

## 8.1 Critical Gaps (Must Fix Before Launch)

| Gap | Impact | Current State | Recommendation |
|---|---|---|---|
| **Duplicate organizer workspaces** | Confusion, maintenance burden | `/organizer/*` and `/org/*` coexist | Remove `/organizer/*` entirely, migrate any unique functionality to `/org/*` |
| **No floor plan** | Core exhibition feature missing | Stubbed as "Milestone 4" | Implement as a spatial canvas with booth placement, drag-and-drop hall layout |
| **No meetings/booking** | Core engagement feature missing | No `meetings` table in DB, no UI | Add meetings entity and booking flow for all personas |
| **No lead analytics for organizers** | Organizers blind to their exhibition's success | Raw data exists (lead_submissions have event_id) but no UI | Build organizer lead analytics dashboard |
| **Attendee experience fragmentation** | Confusing dual-entry for attendees | `/hackathon` and `/e/[eventSlug]` coexist with different UIs | Consolidate into single attendee workspace |
| **Demo-to-production gap** | Inconsistency between demo and live product | Demo uses different URLs and data sources | Align demo experience with live workspace |

## 8.2 High-Impact Gaps

| Gap | Impact | Recommendation |
|---|---|---|
| **No product catalog** | Exhibitors can't showcase products structurely | Add `products` table with name, description, image, link, category |
| **No AI workspace** | AI is hidden rather than first-class | Add dedicated AI Copilot page in each workspace |
| **No notification system** | Users miss critical events | Add notification infrastructure (in-app + email) |
| **No CRM/export integration** | Data is trapped in the platform | Add CSV export for leads, contacts; add webhook/API for CRM sync |
| **No post-event workflows** | Engagement drops after exhibition | Add post-event campaign tools, follow-up tracking, ROI reports |
| **Command palette is empty** | Missed productivity opportunity | Populate with events, exhibitors, attendees, actions |
| **No mobile optimization** | Attendees are primarily mobile | Prioritize mobile-first for attendee UX |

## 8.3 Medium-Impact Gaps

| Gap | Recommendation |
|---|---|
| Registration management system | Add attendee registration with tickets, capacity, check-in |
| Campaign/promotion tools | Email campaigns, social sharing, discount codes |
| Financial tracking | Booth pricing, invoicing, payment tracking |
| Team collaboration | User roles, permissions, shared notes, activity feed |
| Multi-language support | i18n infrastructure for international exhibitions |
| Offline mode | PWA support for event days with spotty connectivity |
| Analytics exports | PDF/CSV download for all analytics views |
| Benchmarking | Cross-event, cross-organizer anonymized benchmarks |
| API marketplace | Public API for third-party integrations |

## 8.4 What Should Be Removed

| Item | Reason |
|---|---|
| `/organizer/*` route group | Duplicate of `/org/*` |
| `/organizer-navigation.tsx` | Replaced by `WorkspaceNav` |
| `Breadcrumbs.tsx` (old version) | Duplicate of `UnifiedBreadcrumbs` |
| Placeholder pages (coming-soon) | Misleading — remove until implemented |
| `(auth)` AuthShell page | Should be consolidated with global layout |
| `/showcase` redirect | Inconsistent path — use `/hackathon/expo` consistently |

## 8.5 What Should Be Merged

| Merge | Rationale |
|---|---|
| `/hackathon` → `/e/[eventSlug]` | Single attendee entry point — merge feature parity |
| Demo workspaces → live workspaces | Demo should be a data-layer switch, not separate routes |
| `Breadcrumbs` + `UnifiedBreadcrumbs` | Single canonical breadcrumb implementation |
| `MetricCard` + `KPICard` components | Single metric display component in design system |
| Multiple `Card` patterns | Metric cards built inline vs from design system |

## 8.6 What Should Become First-Class

| Feature | Current State | Target |
|---|---|---|
| **AI** | Embedded in pages | First-class workspace with dedicated nav item |
| **Floor Plan** | Not implemented | Core feature with spatial canvas |
| **Meetings** | Not implemented | Core engagement feature across all personas |
| **Products** | Mixed into knowledge sources | Separate product catalog entity |
| **Lead Analytics** | Exhibitor-only | Both organizer and exhibitor views |
| **Notifications** | Not implemented | Cross-platform notification center |
| **Command Palette** | Static nav items only | Global search across all entities |

---

# Appendix A: Route Inventory

## Live Routes

| Route | Persona | Status | Notes |
|---|---|---|---|
| `/` | Marketing | Live | Landing page |
| `/auth` | All | Live | Sign-in |
| `/org` | Organizer | Live | Console dashboard |
| `/org/events` | Organizer | Live | Event list |
| `/org/events/[id]` | Organizer | Live | Event overview |
| `/org/events/[id]/sessions` | Organizer | Live | Sessions CRUD |
| `/org/events/[id]/speakers` | Organizer | Live | Speakers CRUD |
| `/org/events/[id]/exhibitors` | Organizer | Live | Exhibitor list/invite |
| `/org/events/[id]/settings` | Organizer | Live | Event settings |
| `/org/events/[id]/reports` | Organizer | Live | AI reports |
| `/org/analytics` | Organizer | Live | Analytics dashboard |
| `/org/settings` | Organizer | Live | Org settings (read-only) |
| `/exhibit/[orgId]` | Exhibitor | Live | Portal root |
| `/exhibit/[orgId]/dashboard/[eeId]` | Exhibitor | Live | Booth dashboard |
| `/exhibit/[orgId]/ai-insights` | Exhibitor | Live | AI insights |
| `/exhibit/[orgId]/attendees` | Exhibitor | Live | Attendee list |
| `/exhibit/[orgId]/forms` | Exhibitor | Live | Lead form editor |
| `/exhibit/[orgId]/qr` | Exhibitor | Live | QR code |
| `/exhibit/[orgId]/documents` | Exhibitor | Live | Knowledge sources |
| `/exhibit/[orgId]/team` | Exhibitor | Live | Team (read-only) |
| `/exhibit/[orgId]/settings` | Exhibitor | Live | Booth settings |
| `/exhibit/[orgId]/relationships/[id]` | Exhibitor | Live | Relationship workspace |
| `/e/[slug]` | Attendee | Live | Browse exhibitors |
| `/e/[slug]/saved` | Attendee | Live | Saved exhibitors |
| `/e/[slug]/exhibitors/[id]` | Attendee | Live | Exhibitor profile |
| `/e/[slug]/exhibitors/[id]/insights` | Attendee | Live | Booth briefing |
| `/account/profile` | Attendee | Live | Profile management |
| `/visit/[token]` | Attendee | Live | Booth QR experience |
| `/hackathon` | Attendee | Live | Event landing |
| `/hackathon/expo` | Attendee | Live | Expo floor |
| `/admin` | Admin | Mock | Hardcoded mock data |

## Demo Routes (Read-Only)

| Route | Status | Notes |
|---|---|---|
| `/demo` | Live | Persona selection |
| `/demo/organizer` | Live | Organizer dashboard |
| `/demo/organizer/events` | Live | Event portfolio |
| `/demo/organizer/analytics` | Live | Live analytics |
| `/demo/organizer/heatmaps` | Live | Booth heatmaps |
| `/demo/organizer/ai-insights` | Live | AI briefing |
| `/demo/organizer/reports` | Live | AI report |
| `/demo/organizer/event/[slug]` | Live | Event detail |
| `/demo/exhibitor` | Live | Exhibitor picker |
| `/demo/exhibitor/[id]` | Live | Booth dashboard |
| `/demo/exhibitor/[id]/analytics` | Live | Booth analytics |
| `/demo/exhibitor/[id]/ai-insights` | Live | AI insights |
| `/demo/exhibitor/[id]/visitors` | Live | Visitor pipeline |
| `/demo/exhibitor/[id]/products` | Live | Products |
| `/demo/exhibitor/[id]/qr` | Live | QR code |
| `/demo/exhibitor/[id]/preview` | Live | Booth preview |
| `/demo/exhibitor/[id]/booth` | Live | Booth profile |
| `/demo/exhibitor/[id]/documents` | Live | Knowledge sources |
| `/demo/admin` | Live | Simulation control |

## Legacy Routes (To Be Removed)

| Route | Status | Migration |
|---|---|---|
| `/organizer` | Live | Move to `/org` |
| `/organizer/events` | Live | Move to `/org/events` |
| `/organizer/events/[id]` | Live | Move to `/org/events/[id]` |
| `/organizer/analytics` | Live | Move to `/org/analytics` |
| `/organizer/users` | Live | Move to `/org/team` |
| `/organizer/settings` | Live | Move to `/org/settings` |
| `/organizer/events/[id]/exhibitors` | Live | Move to `/org/events/[id]/exhibitors` |
| `/organizer/events/[id]/exhibitors/[eid]` | Live | Move to `/org/events/[id]/exhibitors/[eid]` |

## Placeholder Routes (To Remove or Implement)

| Route | Current State |
|---|---|
| `/org/events/[id]/registrations` | "No registrations yet" |
| `/org/events/[id]/documents` | "No event documents" |
| `/organizer/events/[id]/attendees` | "Coming soon" |
| `/organizer/events/[id]/sessions` | "Coming soon" |
| `/organizer/events/[id]/analytics` | "Coming soon" |
| `/organizer/events/[id]/users` | "Coming soon" |
| `/organizer/events/[id]/exhibitors/[eid]/leads` | "Coming soon" |
| `/organizer/events/[id]/exhibitors/[eid]/relationships` | "Coming soon" |
| `/organizer/events/[id]/exhibitors/[eid]/products` | "Coming soon" |
| `/organizer/events/[id]/exhibitors/[eid]/analytics` | "Coming soon" |

---

*End of Product Architecture Document*
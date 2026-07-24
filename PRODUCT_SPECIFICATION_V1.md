# ExAi Product Specification V1

> **The AI Operating System for Exhibitions**
>
> This document is the single source of truth for the ExAi product.
>
> All product, design, and engineering decisions derive from this specification.
>
> If a feature is not in this document, it does not exist.
>
> If a feature contradicts this document, the document wins.

---

**Status:** V1 · Foundation
**Date:** July 24, 2026
**Owner:** Product Architecture

---

# 1. Product Vision

## 1.1 What is ExAi?

ExAi is an **AI Operating System for Exhibitions**.

It connects three ecosystems — Organizers, Exhibitors, and Attendees — before, during, and after an exhibition.

We do not manage events. We operate exhibitions.

## 1.2 The Problem

Exhibitions are broken in three ways:

**Before the exhibition:**
- Organizers use spreadsheets, email, and disparate tools to manage exhibitors, booths, and floor plans
- Exhibitors have no visibility into lead quality or booth performance before they arrive
- Attendees cannot plan their visit — they arrive without knowing who to meet or what to see

**During the exhibition:**
- Organizers have no real-time visibility into what's happening — booth occupancy, engagement levels, operational issues
- Exhibitors rely on manual lead capture (business cards, paper forms, badge scanners) that creates data entry work after the event
- Attendees wander aimlessly — no personalized guidance, no way to book meetings, no way to learn about exhibitors before approaching a booth

**After the exhibition:**
- Leads go cold within 48 hours
- Organizers cannot prove ROI to exhibitors or sponsors
- Attendees receive generic follow-up emails that don't reflect what they actually engaged with

The exhibition industry runs on generic event management platforms designed for conferences, not exhibitions.

## 1.3 Why ExAi?

| Problem | Incumbent Approach | ExAi Approach |
|---|---|---|
| Lead capture | Badge scanners, business cards, manual entry | QR-based lead forms with AI enrichment |
| Booth discovery | Printed floor plans, static PDFs | AI-powered recommendations, smart search |
| Meeting booking | Email back-and-forth, manual coordination | In-platform booking with AI scheduling assistant |
| Real-time visibility | None — organizers fly blind | Live dashboards for every persona |
| Post-event follow-up | Generic email blast | AI-generated personalized follow-ups |
| Floor plan management | AutoCAD, Visio, Excel | Interactive spatial canvas |
| Exhibitor management | Spreadsheets, email chains | Unified workspace with AI insights |
| ROI measurement | Survey-based, anecdotal | Data-driven analytics, AI reports |
| Attendee engagement | Passive — attendees browse alone | Active — AI guides, recommends, connects |

## 1.4 What Makes Us Unique

1. **Exhibition-first architecture.** Every feature is designed around the exhibition workflow. Not sessions. Not speakers. Booth discovery, lead capture, floor plans, meetings.

2. **Three-sided platform.** Organizers, exhibitors, and attendees each have a dedicated workspace. The platform's value grows with all three sides active.

3. **AI-native, not AI-added.** AI is not a chatbot bolted onto the side. It enriches every lead, generates every report, powers every recommendation, and briefs every user.

4. **Real-time by default.** Every dashboard shows what is happening right now. Not yesterday's data. Not last week's report.

5. **Before, during, and after.** Most platforms cover one phase. ExAi covers the full exhibition lifecycle.

## 1.5 Success Metrics

| Metric | Target (V1) |
|---|---|
| Leads captured per exhibition | 10x vs business cards / badge scanners |
| Exhibitor ROI satisfaction | >85% report measurable ROI |
| Attendee meeting bookings | >30% of attendees book ≥1 meeting |
| Organizer operational time saved | >50% reduction in pre-event setup time |
| AI adoption | >80% of users interact with AI features weekly |
| Net Promoter Score | >50 across all personas |

---

# 2. Product Principles

These are non-negotiable. Every feature, screen, and interaction must satisfy these principles.

## 2.1 Exhibition-First

We serve exhibitions, not conferences. The booth is the atomic unit. The floor plan is the canvas. Lead capture is the transaction. Everything else is secondary.

Sessions, speakers, and agendas are optional modules — not core features.

## 2.2 Information Before Actions

Every screen must answer "What is happening right now?" before offering "What can I edit?"

Dashboards are the default state. Forms live in dialogs or drawers. Editing is secondary to awareness.

## 2.3 AI Everywhere, But Never Intrusive

AI enriches every workflow but never interrupts it. Insights appear contextually. Recommendations are actionable. Chat is available but not required.

Users should never have to "find" AI features. AI should find the user.

## 2.4 Dashboards Before Forms

The default view for every workspace is a dashboard. Creating, editing, and configuring are reached through actions on the dashboard, not through navigation.

## 2.5 Mobile-First for Attendees, Desktop-First for Organizers

Attendees spend most of their time on their phones while walking the exhibition floor. Organizers spend their time at a desk or on a tablet. Exhibitors split time between both.

The attendee experience is designed mobile-first. The organizer experience is designed desktop-first. The exhibitor experience is responsive to both.

## 2.6 Real-Time by Default

Data freshness is non-negotiable. Every dashboard shows live or near-live data. Users should never wonder if what they're seeing is current.

Cached data is tagged with its freshness. Stale data is clearly marked.

## 2.7 Enterprise-Grade for Organizers

Organizers manage hundreds of exhibitors, thousands of attendees, and complex floor plans. The platform must handle scale without complexity.

Bulk operations, keyboard shortcuts, data exports, and role-based access are table stakes.

## 2.8 Every Page Has One Primary Action

A user should always know what to do next. Each page has a single primary action (button, link, or CTA). Secondary actions are grouped and de-emphasized.

## 2.9 Persist Context Across Navigation

A user should never lose their place. Filters persist. Search state persists. The selected event/exhibition context carries across pages.

Navigating away and back should feel seamless.

## 2.10 Progressive Disclosure

Don't show everything at once. Reveal complexity as the user needs it. Start with the 20% of features that deliver 80% of value. Advanced features are one click away, never hidden.

## 2.11 The Platform Survives Without AI

AI is the differentiator, but the core workflows work without it. Lead capture, booth pages, floor plans, and analytics function with or without AI enrichment. AI is always additive.

## 2.12 Privacy and Consent First

Attendees control their data. Profile sharing is opt-in. Consent is explicit, granular, and revocable. Exhibitors see only what attendees choose to share.

## 2.13 Fast by Default

Every page loads in under 2 seconds. Search returns results in under 500ms. AI responses stream to feel instant. Optimistic UI updates make every interaction feel responsive.

## 2.14 Connect the Three Ecosystems

No feature exists in isolation. Every organizer feature should help exhibitors succeed. Every exhibitor feature should improve the attendee experience. Every attendee feature should deliver value back to organizers and exhibitors.

---

# 3. User Personas

## 3.1 Organizer

### Identity
Event directors, exhibition managers, marketing directors at trade show organizers, industry associations, and conference organizers with exhibition components.

### Goals
- Sell booth space at maximum occupancy
- Drive qualified attendee registrations
- Help exhibitors generate ROI (so they return next year)
- Increase attendee engagement with exhibitors
- Reduce operational overhead (floor plans, assignments, communication)
- Measure and report exhibition ROI to stakeholders

### Success Metrics (for them)
- Booth occupancy rate (target: >90%)
- Exhibitor retention rate (target: >75% year-over-year)
- Attendee-to-exhibitor meeting rate (target: >30%)
- Leads generated per exhibitor (target: >50 per booth)
- Time spent on operations vs strategy

### Daily Workflow (ideal)
1. **Morning briefing** — AI-generated summary of all active exhibitions: new registrations, exhibitor changes, alerts, yesterday's highlights
2. **Portfolio check** — glance at all exhibitions, health status, attention items
3. **Exhibitor pipeline** — review new sign-ups, pending invitations, booths that need attention
4. **Floor plan adjustments** — spatial moves, booth reassignments, hall reconfigurations
5. **AI insights** — review recommendations, anomalies, trends
6. **Lead analytics** — cross-exhibition lead performance, top booths by engagement
7. **Report generation** — AI reports for internal and exhibitor stakeholders

### Pain Points (current)
- No real-time visibility into exhibition health
- Manual exhibitor management (spreadsheets, email)
- No cross-exhibition analytics
- Cannot prove ROI to exhibitors
- Lead data is invisible to organizers
- Floor plan management is disconnected from the platform

### AI Opportunities
- Daily exhibition health briefing
- Anomaly detection (registration drops, exhibitor churn risk)
- Exhibitor success predictions ("these 5 exhibitors are on track for 2x ROI")
- Smart recruitment recommendations
- Automated executive reports
- Revenue forecasting

---

## 3.2 Exhibitor

### Identity
Sales directors, marketing managers, event coordinators, and product marketers at companies that exhibit at trade shows.

### Goals
- Capture qualified leads efficiently
- Book meetings with decision-makers
- Showcase products to the right audience
- Measure exhibition ROI (leads, pipeline value, meetings booked)
- Follow up with leads before they go cold
- Coordinate booth staff and roles

### Success Metrics (for them)
- Number of qualified leads captured
- Lead-to-meeting conversion rate
- Leads scoring above threshold
- Post-event follow-up rate
- Booth engagement (unique visitors, dwell time, returning visitors)
- Staff efficiency (leads per staff-hour)

### Daily Workflow (ideal)
1. **Booth dashboard** — glance at today's visitors, new leads, attention items
2. **Lead review** — AI-scored leads ranked by priority, buying intent, fit
3. **Meeting prep** — review upcoming meetings, AI-generated talking points
4. **Booth management** — update products, upload new collateral, check materials
5. **Team coordination** — staff assignments, check-in/check-out, shared notes
6. **Analytics** — booth performance, comparison to benchmarks, trend analysis
7. **Follow-ups** — AI-drafted emails, send to hot leads, schedule next steps

### Pain Points (current)
- Business cards get lost, manual data entry is slow
- No lead quality signal during the event
- Cannot prioritize which leads to follow up first
- Post-event follow-up is manual and inconsistent
- No visibility into booth performance until after the event
- Cannot measure ROI effectively

### AI Opportunities
- Lead scoring and buying intent prediction
- Follow-up email drafting (personalized per lead)
- Next-best-action recommendations
- Booth performance benchmarks
- Smart meeting scheduling
- Knowledge gap detection ("attendees ask about pricing — you haven't uploaded a price sheet")
- Staff performance analytics

---

## 3.3 Attendee

### Identity
Trade show visitors — buyers, engineers, executives, consultants, and professionals attending exhibitions to discover products, network, and learn.

### Goals
- Find relevant exhibitors efficiently
- Learn about companies before approaching their booth
- Book meetings with high-priority exhibitors
- Save interesting companies for post-event follow-up
- Navigate the exhibition hall without getting lost
- Maximize ROI on their time at the event

### Success Metrics (for them)
- Time spent with relevant exhibitors
- Number of quality conversations
- Meetings booked
- Exhibitors saved/bookmarked
- Post-event follow-up initiated
- Time wasted on irrelevant exhibitors (minimized)

### Daily Workflow (ideal)
1. **Personalized dashboard** — "Good morning — here are 5 exhibitors you shouldn't miss based on your profile and interests"
2. **Exhibitor discovery** — browse by industry, search by keyword, AI recommendations
3. **Exhibitor research** — read AI-generated booth briefing, browse products, check meeting availability
4. **Meeting booking** — request meetings with exhibitors, confirm slots
5. **Booth visits** — scan QR, complete digital lead form, chat with AI, download materials
6. **Hall navigation** — interactive floor map with optimized route
7. **AI assistant** — ask questions, get recommendations, get real-time guidance
8. **Post-event** — view all saved exhibitors, AI summary of interactions, follow-up actions

### Pain Points (current)
- No personalized recommendations — walking the floor blindly
- Cannot book meetings with exhibitors in advance
- Paper forms and business cards are slow and friction-filled
- No way to research exhibitors before approaching a booth
- No way to save and organize what was discovered
- Generic post-event follow-up that doesn't reflect actual interests

### AI Opportunities
- Personalized exhibitor recommendations
- Smart search (natural language, semantic)
- AI booth briefings (already partially exists)
- Meeting scheduling assistant
- Post-event AI summary
- Navigation route optimization
- Real-time guidance ("3 booths in Hall B match your interests")
- Follow-up email drafting (for exhibitor outreach)

---

## 3.4 Admin (Platform)

### Identity
Platform operators, customer success, and system administrators managing the ExAi platform.

### Goals
- Monitor platform health and performance
- Manage organizations, users, and subscriptions
- Provide support to organizers and exhibitors
- Audit platform activity
- Ensure platform uptime and reliability

### Success Metrics
- Platform uptime (target: 99.9%)
- Mean time to resolve issues
- Customer satisfaction score
- Active organization growth
- Feature adoption rates

### Daily Workflow (ideal)
1. **Platform dashboard** — health status, active organizations, system metrics
2. **Organization management** — create, suspend, upgrade organizations
3. **User management** — handle support requests, investigate issues
4. **Subscription management** — plan changes, billing, invoices
5. **Audit log review** — platform-wide activity monitoring
6. **Support queue** — handle tickets, escalations

### Pain Points
- No admin dashboard exists currently (mock data only)
- Cannot manage organizations or users
- No subscription or billing system
- No audit logging

---

# 4. Product Modules

## 4.1 Organizer Module

### Purpose
Operate exhibitions. Manage exhibitors. Measure success.

### Responsibilities
- Create and configure exhibitions
- Manage exhibitor pipeline (recruit, invite, onboard)
- Design and manage floor plans with booth assignments
- Monitor exhibition health in real time
- Analyze cross-exhibition and per-exhibition metrics
- Generate AI-powered reports and insights
- Manage team members and roles

### Navigation

```
Dashboard       [What's happening right now across all exhibitions]
Exhibitions     [Create, configure, manage exhibitions]
Exhibitors      [Cross-exhibition exhibitor management]
Attendees       [Registration tracking, audience insights]
Floor Plan      [Spatial canvas with booth management]
Lead Analytics  [Cross-exhibition lead intelligence]
Meetings        [Meetings booked across all exhibitions]
AI Copilot      [AI briefings, insights, recommendations]
Operations      [Team, billing, settings]
```

### Primary Screens

**Dashboard**
- Active exhibitions at a glance with health scores
- Today's metrics: new registrations, leads generated, meetings booked
- Alerts: attention items requiring immediate response
- AI Daily Briefing: auto-generated summary of the day's activity
- Quick actions: publish pending exhibition, invite exhibitors, generate report

**Exhibition Detail**
- Exhibition health score (composite of registrations, exhibitor coverage, engagement)
- KPI row: registrations, exhibitors confirmed, booths sold, occupancy rate, revenue
- Exhibitor list with status (invited, confirmed, profile complete, ready)
- Booth map preview (link to floor plan)
- AI insights specific to this exhibition
- Quick actions: publish, duplicate, archive, generate report

**Floor Plan**
- Interactive spatial canvas with hall/booth grid
- Drag-and-drop booth assignment
- Booth status color coding (available, reserved, confirmed, ready)
- Booth detail popover (company, status, contact)
- PDF export for printed materials

**Lead Analytics**
- Cross-exhibition lead volume trends
- Top-performing booths by lead count, lead quality, engagement
- Industry distribution of attendees
- AI lead quality distribution (high, evaluating, browsing, not relevant)
- Export capabilities

### Primary Workflows

**Create and Launch an Exhibition**
1. Dashboard → "New Exhibition" → name, dates, hall size → draft created
2. Configure floor plan → set hall dimensions, create booth grid
3. Invite exhibitors → bulk import or individual invitations
4. Publish exhibition → open for registrations and exhibitor logins
5. Pre-event → monitor registrations, follow up on pending exhibitors
6. Live → real-time dashboard, activity monitoring
7. Post-event → AI report, exhibitor success data, close out

**Manage Exhibitor Pipeline**
1. Exhibitors section → view all exhibitors across events
2. Filter by status, exhibition, industry
3. Bulk invite, bulk message, bulk assign booths
4. Track who has completed their profile, uploaded materials
5. AI predicts which exhibitors are at risk of underperforming

---

## 4.2 Exhibitor Module

### Purpose
Manage booth presence, capture leads, measure ROI.

### Responsibilities
- Configure booth profile (branding, description, products)
- Design lead capture forms
- Upload marketing assets and knowledge sources
- Generate QR codes for booth materials
- View and manage leads with AI scoring
- Book and manage meetings
- Monitor booth analytics and performance
- Coordinate team members

### Navigation

```
Dashboard       [How successful is my booth today?]
Booth           [Profile, branding, lead form, assets]
Leads           [All captured leads with AI intelligence]
Meetings        [Booked and requested meetings]
Visitors        [Booth visitor pipeline]
Products        [Product catalog showcase]
Assets          [Brochures, videos, documents]
Analytics       [Booth performance metrics]
AI Copilot      [Insights, recommendations, follow-ups]
Team            [Staff management]
Settings        [Account, notifications, integrations]
```

### Primary Screens

**Dashboard**
- Today's visitors count, new leads, meetings today
- Lead pipeline: new → contacted → meeting booked → qualified
- AI attention items: "3 leads are actively evaluating — follow up now"
- Quick actions: view leads, manage meetings, check booth preview
- Activity feed: recent interactions, new lead submissions, meeting confirmations

**Booth Profile**
- Company name, logo, banner, primary color
- Description, website, social links
- Booth name, number, location on floor plan
- Status indicator and publish controls
- Preview button (see the booth as an attendee would)

**Leads**
- AI-scored lead list sorted by priority
- Filter by score, buying intent, date
- Lead detail: profile, AI summary, interaction timeline, notes
- Bulk actions: export, assign, tag
- Lead intelligence panel: score breakdown, buying intent, topics discussed, recommended next step

**Meetings**
- Upcoming meetings with times and attendees
- Meeting request queue (pending, confirmed, declined)
- AI meeting assistant: suggested times, talking points
- Calendar integration (Google, Outlook)

### Primary Workflows

**Set Up Booth Before Exhibition**
1. Complete booth profile (company info, branding, description)
2. Design lead capture form (add fields, customize)
3. Upload products and marketing assets
4. Upload knowledge sources for booth AI
5. Generate and print QR codes
6. Invite team members and assign roles
7. Publish booth

**Capture and Nurture Leads**
1. During exhibition: leads arrive via QR form submissions
2. AI enriches each lead (score, intent, summary) in real time
3. Dashboard updates with new leads and pipeline changes
4. Review leads by priority — hot leads get immediate attention
5. Add notes, tag, assign to team members
6. Book meetings with high-intent leads
7. AI suggests follow-up actions for each lead

---

## 4.3 Attendee Module

### Purpose
Discover exhibitors, engage meaningfully, maximize event ROI.

### Responsibilities
- Browse and search exhibitor directory
- Receive personalized AI recommendations
- Book meetings with exhibitors
- Save exhibitors for follow-up
- Interact with booth experience (QR, AI chat, lead forms)
- Navigate exhibition floor plan
- Manage profile and consent preferences

### Navigation

```
Home            [Personalized dashboard — "Who should I meet today?"]
Explore         [Exhibitor directory with smart search]
Saved           [Bookmarked exhibitors]
Meetings        [Booked and requested meetings]
Recommendations [AI-powered suggestions]
Messages        [Exhibitor communications]
AI Assistant    [Personal event AI]
Floor Map       [Interactive hall navigation]
Profile         [Personal information and consent]
```

### Primary Screens

**Home Dashboard**
- "Good morning — here are 5 exhibitors you shouldn't miss"
- Upcoming meetings
- Recently viewed exhibitors
- Today's schedule (if sessions exist)
- Quick actions: scan QR code, view floor map, browse exhibitors

**Explore**
- Searchable exhibitor grid with industry filters
- List view option for dense information
- Exhibitor cards: logo, name, booth number, brief description, industry tags
- AI search: natural language queries ("find companies making warehouse automation")

**Exhibitor Detail**
- Full company profile with logo, description, products, social links
- AI Booth Briefing: auto-generated summary of what they offer
- Meeting request button
- Save / unsave toggle
- Download brochures and resources
- "Ask AI" about this exhibitor

**Recommendations**
- AI-powered personalized list sorted by relevance
- "Based on your profile and saved exhibitors"
- "Visitors who saved similar exhibitors also saved..."
- "New exhibitors you might have missed"

### Primary Workflows

**Pre-Event Planning**
1. Register for the exhibition (or receive link)
2. Complete profile (industry, interests, company)
3. Browse exhibitors and save interesting ones
4. Book meetings with priority exhibitors
5. AI recommends exhibitors based on profile

**During Exhibition**
1. Dashboard shows personalized recommendations for today
2. Navigate to exhibitor booths via floor map
3. Scan QR at booth → digital lead form → submit
4. Chat with Booth AI to learn about products
5. Receive real-time suggestions ("3 exhibitors in Hall B match your interests")
6. Check in for scheduled meetings

**Post-Event**
1. View all saved exhibitors
2. AI summary: "Here's everyone you met and what you discussed"
3. Follow-up actions: view materials from engaged exhibitors
4. Meeting requests and follow-ups

---

## 4.4 Admin Module

### Purpose
Operate the ExAi platform.

### Navigation

```
Dashboard       [Platform health and metrics]
Organizations   [Manage organizer and exhibitor accounts]
Users           [User management and support]
Subscriptions   [Plans, billing, invoices]
Support         [Ticket management, help center]
Audit           [Platform activity log]
Settings        [Platform configuration]
```

*(Admin is Phase 2 in the roadmap. Documented here for completeness.)*

---

## 4.5 AI Copilot Module

### Purpose
AI is a first-class workspace, not a hidden feature.

The AI Copilot is available in every workspace and from every page.

### Workspace-Specific

**Organizer AI Copilot**
- Daily portfolio briefing
- "Which exhibitions need my attention today?"
- "Which exhibitors are at risk of churn?"
- "Generate a stakeholder report for [exhibition]"
- "Compare [exhibition A] and [exhibition B]"
- Natural language analytics queries

**Exhibitor AI Copilot**
- "Who should I follow up with today?"
- "Draft a follow-up email for [lead name]"
- "How does my booth compare to similar exhibitors?"
- "What are the top questions attendees are asking?"
- "Suggest talking points for my meeting with [attendee]"

**Attendee AI Assistant**
- "Which exhibitors should I visit based on my interests?"
- "Summarize this exhibitor for me"
- "What's the fastest route to Booth 42?"
- "Who should I meet next?"
- "Create a summary of everyone I met today"

### Capabilities

| Capability | Description | Availability |
|---|---|---|
| Daily Briefing | Auto-generated daily summary for each persona | All workspaces |
| Lead Intelligence | AI scoring, intent prediction, summary, follow-up suggestions | Exhibitor |
| Booth Briefing | AI-generated summary of what an exhibitor offers | Attendee |
| Follow-up Generation | Draft personalized follow-up emails | Exhibitor |
| Recommendation Engine | Personalized exhibitor/booth recommendations | Attendee, Organizer |
| Event Health | Composite health score with breakdown | Organizer |
| Natural Language Query | Ask questions about your data in plain English | All workspaces |
| Report Generation | Auto-generated executive reports | Organizer |
| Meeting Assistant | Suggested times, talking points, prep materials | All workspaces |
| Anomaly Detection | Flags unusual patterns automatically | Organizer, Admin |

---

# 5. Information Architecture

## 5.1 Canonical Entities

### Organization
The core tenant. Has a `kind`: `organizer` (runs exhibitions) or `exhibitor` (participates in exhibitions).

**Relationships:**
- Has many Members (with roles: owner, admin, member)
- Organizer has many Exhibitions
- Organizer has many Exhibitors (as invited/recurring partners)
- Exhibitor has many Booth Presences (across different Exhibitions)

### Exhibition
A named event with dates, location, halls. The anchor entity for the organizers.

**Status lifecycle:** `draft` → `published` → `pre-event` → `live` → `completed` → `archived`

**Contains:**
- Many Halls
- Many Registrations (attendees who registered)
- Many Booth Presences (exhibitors participating)
- Optional Sessions and Speakers

### Hall
A physical or virtual space within an Exhibition. Contains booths on a grid.

**Properties:** name, dimensions (rows × columns), grid layout configuration.

### Booth
A bookable unit within a Hall. Assigned to one Exhibitor per Exhibition.

**Status lifecycle:** `available` → `reserved` → `confirmed` → `ready` → `active` → `closed`

**Properties:** number, name, position (x, y, width, height on grid), size category, price tier.

### Booth Presence
An Exhibitor's participation at a specific Exhibition, tied to a specific Booth.

**Status lifecycle:** `invited` → `accepted` → `profile_complete` → `ready` → `live` → `completed`

**Contains:**
- Booth Profile (branding, description, contact, social)
- Lead Forms (one active at a time, versioned)
- Products
- Assets (brochures, videos, documents)
- Knowledge Sources (for booth AI)
- QR Credentials

### Exhibitor
A company that exhibits. Represented by an Organization with `kind: exhibitor`.

**Has many:** Booth Presences (across different exhibitions), Members (staff).

### Attendee
A person visiting an exhibition. Linked to a User account.

**Properties:** profile (name, company, title, industry, interests), consent preferences.

**Has many:** Saved Exhibitors, Lead Submissions, Relationships, Meetings.

### Registration
An attendee's intent to attend an Exhibition. May be free or paid.

**Properties:** type (free, paid, VIP, sponsor), status (pending, confirmed, cancelled, checked-in).

### Lead
A structured interaction where an attendee shares contact information with an exhibitor.

**Properties:** form responses, AI enrichment (score, buying intent, summary, topics, next steps).

### Relationship
An ongoing connection between an Attendee and a Booth Presence.

**Properties:** interaction count, first interaction, latest interaction, status (active, archived).

**Has many:** Notes, Enrichments.

### Meeting
A scheduled interaction between an Attendee and an Exhibitor (or between two Attendees).

**Properties:** time, duration, location (booth, meeting room, virtual), status (requested, confirmed, completed, cancelled).

### Product
A structured showcase item for an Exhibitor's Booth Presence.

**Properties:** name, description, image, category, link, file.

### Asset
A marketing or informational file uploaded by an Exhibitor.

**Properties:** type (brochure, video, presentation, spec sheet), file reference, status.

### Campaign
A promotional effort by an Organizer to drive registrations or an Exhibitor to drive booth visits.

**Properties:** type (email, social, paid), target audience, schedule, budget, performance metrics.

### Task
An action item assigned to a user within the platform.

**Properties:** type, due date, assignee, status, related entity.

### Notification
An alert delivered to a user about an event requiring attention.

**Properties:** type, severity, title, body, link, read status, delivered at.

### Knowledge Source
A document or URL that powers booth AI capabilities.

**Properties:** type (uploaded_document, external_url), source_type (pdf, brochure, presentation, website, faq, pricing), status.

## 5.2 Entity Relationship Model

```
Organization (kind: organizer)
  ├── Exhibition
  │     ├── Hall
  │     │     └── Booth
  │     ├── Booth Presence  [links Exhibitor → Exhibition → Booth]
  │     ├── Registration
  │     ├── Session (optional module)
  │     │     └── Speaker (optional module)
  │     └── Campaign
  │
  └── Team Member (OrganizationMembership)

Organization (kind: exhibitor)
  ├── Booth Presence
  │     ├── Booth Profile
  │     ├── Product
  │     ├── Asset
  │     ├── Lead Form
  │     ├── Knowledge Source
  │     └── QR Credential
  │
  └── Team Member (OrganizationMembership)

User
  ├── Attendee Profile
  │     └── Consent Preferences
  ├── Registration → Exhibition
  ├── Lead Submission → Booth Presence
  ├── Relationship → Booth Presence
  │     ├── Note
  │     └── Enrichment
  ├── Meeting
  │     ├── Booth Presence (if exhibitor meeting)
  │     └── Attendee (if attendee meeting)
  ├── Saved Exhibitors → Booth Presence
  └── Notification
```

## 5.3 Key Entity Rules

1. An **Exhibition** belongs to one **Organizer**. It can have zero or many **Halls**.
2. A **Hall** belongs to one **Exhibition**. It contains one or many **Booths**.
3. A **Booth** belongs to one **Hall**. It is assigned to zero or one **Booth Presence** per Exhibition.
4. A **Booth Presence** links one **Exhibitor** to one **Exhibition** via one **Booth**.
5. An **Exhibitor** can have multiple **Booth Presences** across different **Exhibitions**, but only one per **Exhibition**.
6. A **Lead Submission** belongs to one **Booth Presence** and is submitted by one **Attendee**.
7. A **Relationship** links one **Attendee** to one **Booth Presence**. There can be only one Relationship per attendee-booth pair.
8. A **Meeting** involves either (a) one Attendee and one Booth Presence, or (b) two Attendees.
9. An **Attendee** must consent before their profile is shared with Exhibitors via lead submissions.
10. A **Product** belongs to one **Booth Presence**. Products are visible in the public booth page and searchable by Attendees.

## 5.4 Naming Convention

| Canonical Name | Old Name (remove) | Reason |
|---|---|---|
| Exhibition | Event | "Event" is generic conference terminology. "Exhibition" is specific to our market. |
| Booth Presence | Event Exhibitor | "Event Exhibitor" is an implementation detail. "Booth Presence" is the business concept. |
| Attendee Profile | User + attendee_profiles | Attendees are a distinct persona with curated profile data. |
| Exhibition Hall | (not yet modeled) | Exhibitions have halls/rooms. This enables proper floor plan modeling. |
| Campaign | (not yet modeled) | Needed for promotional tools. |

---

# 6. Navigation Architecture

## 6.1 Global Navigation

Always visible, consistent across all workspaces.

```
┌─────────────────────────────────────────────────────────────────┐
│  [ExAi logo]     Organizer  │  Exhibitor  │  Attendee  │  [⌘K]  [👤] │
└─────────────────────────────────────────────────────────────────┘
```

**Left:** ExAi logo → navigates to the user's primary workspace (role-aware)
**Center:** Role switcher — switches between workspaces (only shows roles the user has access to)
**Right:** Command palette trigger (⌘K) | User menu (profile, settings, sign out)

**Authentication states:**
- **Signed out:** Logo → landing page | Sign in button | Try demo button
- **Signed in (single role):** Logo → their workspace | Role name (non-clickable) | User menu
- **Signed in (multi-role):** Logo → primary workspace | Role switcher (dropdown) | User menu

## 6.2 Workspace Navigation (Organizer)

```
┌────────────────────────────────────────────────────┐
│  ExAi              Organizer                        │
│  ───────────────────────────────────                │
│  ◉ Dashboard                                         │
│  ○ Exhibitions                                      │
│  ○ Exhibitors                                       │
│  ○ Attendees                                        │
│  ○ Floor Plan                                       │
│  ○ Lead Analytics                                   │
│  ○ Meetings                                         │
│  ○ AI Copilot                                       │
│  ───────────────────────────────────                │
│  ○ Operations                                       │
│  ○ Settings                                         │
│                                                     │
│  [👤 User Name]                                     │
│  [org: Admin badge]                                 │
└────────────────────────────────────────────────────┘
```

**Active state:** Current page is indicated with a filled icon and brand-colored bar.

**Section grouping:**
- Primary (always visible): Dashboard, Exhibitions, Exhibitors, Attendees, Floor Plan, Lead Analytics, Meetings, AI Copilot
- Secondary: Operations (team, billing), Settings

## 6.3 Workspace Navigation (Exhibitor)

```
┌────────────────────────────────────────────────────┐
│  ExAi              Exhibitor                        │
│  ───────────────────────────────────                │
│  ◉ Dashboard                                         │
│  ○ Booth                                            │
│  ○ Leads                                            │
│  ○ Meetings                                         │
│  ○ Visitors                                         │
│  ○ Products                                         │
│  ○ Assets                                           │
│  ○ Analytics                                        │
│  ○ AI Copilot                                       │
│  ───────────────────────────────────                │
│  ○ Team                                             │
│  ○ Settings                                         │
│                                                     │
│  [👤 User Name]                                     │
│  [exhibitor: Admin badge]                          │
└────────────────────────────────────────────────────┘
```

## 6.4 Workspace Navigation (Attendee)

Mobile-first bottom tab bar:

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│                   [content area]                    │
│                                                     │
│                                                     │
│                                                     │
├─────────────────────────────────────────────────────┤
│  Home  │  Explore  │  Saved  │  Meetings  │  AI     │
└─────────────────────────────────────────────────────┘
```

Desktop sidebar (for attendees who prefer it):

```
┌──────────────────────────────┬──────────────────────┐
│  ExAi          Attendee      │                      │
│  ─────────────────────       │                      │
│  ◉ Home                     │    [content area]     │
│  ○ Explore                  │                      │
│  ○ Saved                    │                      │
│  ○ Meetings                 │                      │
│  ○ Recommendations          │                      │
│  ○ Messages                 │                      │
│  ○ AI Assistant             │                      │
│  ○ Floor Map                │                      │
│  ─────────────────────       │                      │
│  ○ Profile                  │                      │
├──────────────────────────────┴──────────────────────┤
│  [event selector: TechExpo 2027  ▼]               │
└─────────────────────────────────────────────────────┘
```

## 6.5 Context Navigation (Exhibition-Level)

Sub-navigation inside an Exhibition detail page (tabs):

```
Overview  │  Floor Plan  │  Exhibitors  │  Attendees  │  Leads  │  Reports  │  Settings
```

## 6.6 Command Palette (⌘K)

Global search and actions available from any page.

**Sections:**
1. **Quick Actions** — "New Exhibition", "Invite Exhibitors", "Generate Report", "View Floor Plan"
2. **Search** — Exhibitions, Exhibitors, Attendees, Leads, Booths (results update as you type)
3. **Navigation** — Jump to any page in your workspace
4. **AI Queries** — Natural language commands ("show me exhibitions with low registrations", "who are my top 5 leads")

**Keyboard shortcuts:**
- `⌘K` — Open command palette
- `⌘N` — New (creates appropriate entity based on context)
- `⌘E` — Focus search bar
- `⌘S` — Save / submit current form
- `⌘/` — Show all keyboard shortcuts
- `Esc` — Close dialog / drawer / command palette
- `↓↑` — Navigate items in lists
- `Enter` — Open selected item

## 6.7 Search

**Global search** (available from header and command palette):
- Searches across all entities in the user's workspace
- Results grouped by entity type
- Keyboard navigable
- Debounced at 200ms
- Supports fuzzy matching

**Contextual search** (filter/search within a page):
- Embedded in the page content area
- Filters the current view without navigating away
- Persists across page reloads within a session

---

# 7. Dashboard Philosophy

Every dashboard must answer "What is happening right now?" before "What can I edit?"

## 7.1 Organizer Dashboard

**Layout (top to bottom):**

```
┌─────────────────────────────────────────────────────────────┐
│ AI Daily Briefing                                           │
│ "3 exhibitions active. 12 new registrations today.          │
│  1 exhibitor needs attention. Here's what matters now."     │
└─────────────────────────────────────────────────────────────┘

┌──────────────┬──────────────┬──────────────┬──────────────┐
│ Active Today │ Registrations│  Leads Today  │  Meetings    │
│     3        │    +12       │    +47        │    +8        │
│  exhibitions │  today       │  across booths│  booked today│
└──────────────┴──────────────┴──────────────┴──────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Exhibition Health                                            │
│                                                              │
│ ┌──────────────┬──────────────┬─────────────────────────┐   │
│ │ TechExpo '27 │ AutoMotive   │ FutureHealth Summit      │   │
│ │ ◉ Healthy    │ ◉ Watch      │ ⚠ Critical              │   │
│ │ 68% reg'd    │ 42% reg'd    │ 18% reg'd               │   │
│ │ 45 exhibitors│ 22 exhibitors│ 8 exhibitors            │   │
│ │ → Open       │ → Open       │ → Open                  │   │
│ └──────────────┴──────────────┴─────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────┬───────────────────────────┐
│ Attention Items                 │ AI Insights               │
│                                 │                           │
│ ⚠ TechExpo — low registration  │ 📊 Exhibitor engagement   │
│   pace (68% of target)          │   up 23% this week        │
│ ⚠ AutoMotive — 3 exhibitors    │ 🔥 Top booth: Booth 42   │
│   haven't completed profile     │   (42 leads captured)     │
│                                 │ 💡 AI recommendation:     │
│                                 │   "Send reminder to 5     │
│                                 │   pending exhibitors"     │
└─────────────────────────────────┴───────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Recent Activity                                              │
│ • 12:34 — New registration: Acme Corp (TechExpo)           │
│ • 12:15 — Booth confirmed: InnovateTech → Hall A, Booth 14 │
│ • 11:50 — AI report generated: AutoMotive Weekly Summary   │
│ • 11:22 — Exhibitor invited: DataFlow Inc (TechExpo)       │
└─────────────────────────────────────────────────────────────┘
```

**Primary action:** "New Exhibition" button (persistent in header)

## 7.2 Exhibitor Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│ AI Daily Briefing                                           │
│ "12 new leads since yesterday. 3 are high-intent.           │
│  1 meeting scheduled today at 2pm (Booth 42)."             │
└─────────────────────────────────────────────────────────────┘

┌──────────────┬──────────────┬──────────────┬──────────────┐
│ Visitors     │ New Leads    │  Hot Leads   │  Meetings    │
│    +18       │    +12       │    +3        │    +1        │
│  today       │  today       │  high intent │  today       │
└──────────────┴──────────────┴──────────────┴──────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Lead Pipeline                                               │
│                                                              │
│ New [12] → Contacted [8] → Meeting [3] → Qualified [2]     │
│ ●●●●●●●●●●●●●●●●●○○○○○○○○○○○○○○○○○○○○○○○○○○○○            │
│                                   62% conversion to contact │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────┬───────────────────────────┐
│ Needs Attention                 │ AI Intelligence Feed       │
│                                 │                           │
│ ⚠ Sarah Chen — high intent,    │ 🔥 Hot lead: Sarah Chen   │
│   no follow-up in 24h           │   "Evaluating — interested │
│ ⚠ 2 leads missing email        │    in Enterprise plan"     │
│                                 │ 📈 Lead quality score     │
│                                 │   up 15% this week         │
│                                 │ 💡 "Upload pricing docs   │
│                                 │    — 3 leads asked         │
│                                 │    about pricing today"    │
└─────────────────────────────────┴───────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Recent Activity                                              │
│ • 2:34 PM — New lead: Sarah Chen, Acme Corp (score: 87)    │
│ • 2:15 PM — Meeting confirmed: John Doe → 3pm, Booth 42   │
│ • 1:50 PM — Brochure downloaded: Product Spec v3.pdf       │
│ • 1:22 PM — AI chat: "What are your payment terms?"         │
└─────────────────────────────────────────────────────────────┘
```

**Primary action:** "View Leads" button (persistent in header)

## 7.3 Attendee Home Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│ Good morning, Alex!                                         │
│                                                              │
│ Here are 5 exhibitors you shouldn't miss today, based on    │
│ your interest in AI, manufacturing, and supply chain tech.  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Recommended for You                                         │
│                                                              │
│ ┌──────────┬──────────┬──────────┬──────────┬──────────┐   │
│ │ AI Corp  │ MfgTech  │ SupplyCo │ RoboInc  │ DataFlow │   │
│ │ Booth 42 │ Booth 15 │ Booth 8  │ Booth 33 │ Booth 27 │   │
│ │ ★ Save   │ ★ Saved  │ ★ Save   │ ★ Save   │ ★ Saved  │   │
│ └──────────┴──────────┴──────────┴──────────┴──────────┘   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────┬───────────────────────────┐
│ Your Schedule                   │ Quick Actions              │
│                                 │                           │
│ 📅 2:00 PM — Meeting w/ AI Corp│ 📷 Scan QR Code           │
│ 📅 3:30 PM — Workshop: AI Trends│ 🗺 View Floor Map         │
│                                 │ ⭐ Saved (12 exhibitors)  │
│                                 │ 📬 Messages (2 unread)    │
└─────────────────────────────────┴───────────────────────────┘
```

**Primary action:** "Explore Exhibitors" button

---

# 8. AI Strategy

## 8.1 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        AI WORKSPACES                            │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐   │
│  │ Organizer AI   │  │ Exhibitor AI   │  │ Attendee AI    │   │
│  │ Copilot        │  │ Copilot        │  │ Assistant      │   │
│  └───────┬────────┘  └───────┬────────┘  └───────┬────────┘   │
│          │                  │                  │               │
├──────────┴──────────────────┴──────────────────┴───────────────┤
│                       AI LAYER                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │
│  │ Lead     │ │ Report   │ │ Briefing │ │ Recommendation   │ │
│  │ Intel    │ │ Gen      │ │ Gen      │ │ Engine           │ │
│  ├──────────┤ ├──────────┤ ├──────────┤ ├──────────────────┤ │
│  │ Follow-up│ │ Anomaly  │ │ Meeting  │ │ Knowledge        │ │
│  │ Gen      │ │ Detect   │ │ Assistant│ │ Search (RAG)     │ │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘ │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ Core AI Services                                         │ │
│  │  - AiGenerationService (LLM orchestration)               │ │
│  │  - AiGuardrailService (output screening)                 │ │
│  │  - RetrievalService (vector search + RAG)                │ │
│  │  - EmbeddingService (document chunking + vectorization)  │ │
│  └──────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 8.2 AI Capabilities Detail

### Daily Briefing
Auto-generated every morning. Summarizes what happened since the user's last visit.

**Trigger:** Generated on first page load of the day, or on demand from the AI Copilot page.

**Organizer briefing content:**
- Active exhibitions and their health status
- New registrations (count + notable)
- Exhibitor changes (new confirmations, withdrawals, profile completions)
- Alerts requiring attention
- Yesterday's highlights (most engaged booth, most active attendee)
- Today's recommendations

**Exhibitor briefing content:**
- New leads since last visit (count + top 3)
- High-intent leads requiring immediate follow-up
- Meetings scheduled for today
- Changes in lead pipeline
- Knowledge gaps identified
- Recommended actions

**Attendee briefing content:**
- Recommended exhibitors for today
- Upcoming meetings
- New exhibitors since last visit
- Unread messages from exhibitors
- Event updates (schedule changes, announcements)

### Lead Intelligence
AI enrichment of every lead submission.

**Pipeline:**
1. Attendee submits lead form at booth
2. Lead intelligence processes in background
3. Generates: lead score (0-100), buying intent (high/evaluating/browsing/not_relevant), summary of interests, topics discussed, follow-up recommendation
4. Score breakdown: response completeness (25pts) + relevance signals (25pts) + buying intent (50pts)
5. Stores in `lead_intelligence` table
6. Available to exhibitor within seconds

**Score calibration:**
- 80-100: High intent — follow up within 4 hours
- 60-79: Active evaluation — follow up within 24 hours
- 40-59: Browsing — add to nurture sequence
- 0-39: Not relevant — no action required

### Follow-up Generation
AI drafts personalized follow-up emails for exhibitors.

**Trigger:** Exhibitor clicks "Generate follow-up" on a lead or from the AI Copilot.

**Output:** Draft email with:
- Personalized greeting using lead's name and company
- Reference to topics discussed during the interaction
- Relevant product or content recommendation based on interests
- Clear call to action (meeting, demo, call)
- Professional closing with exhibitor's signature

**Attendee side:** AI can also draft follow-ups for attendees who want to reach out to exhibitors they saved.

### Meeting Assistant
AI helps schedule and prepare for meetings.

**Scheduling:**
- Exhibitor AI: suggests available time slots based on calendar and booth schedule
- Attendee AI: suggests which exhibitors to meet based on profile and interests
- Smart scheduling: proposes times that work for both parties

**Preparation:**
- Meeting prep card: attendee name, company, title, lead score, interaction history, AI summary, suggested talking points
- "Last interaction" summary for context

### Event Health
Composite health score for each exhibition.

**Components:**
- Registration health (current vs target, trend over time)
- Exhibitor health (occupancy rate, profile completeness, status distribution)
- Engagement health (lead volume, meeting bookings, AI chat volume)
- Operational health (pending alerts, incomplete setups)

**Visualization:** Single score (0-100) with colored indicator and component breakdown. Trend arrow showing direction.

### Anomaly Detection
Proactive alerting for unusual patterns.

**Detected patterns:**
- Sudden drop in registration velocity
- Unusual number of exhibitor withdrawals
- Booth with zero engagement for extended period
- Lead quality trend shift (sudden drop in scores)
- Unusual spike in errors or system issues

**Delivery:** Alert appears in dashboard attention section, notification center, and AI briefing.

### Knowledge Search (RAG)
Powering the booth AI chat experience.

**Flow:**
1. Attendee asks a question via the booth chat interface
2. Question is embedded and vector-searched against all booth knowledge sources
3. Retrieved chunks are fed to LLM with the question and a system prompt
4. AI generates a contextual answer with source citations
5. Answer is screened for safety via guardrails
6. Returned to attendee in chat interface

**Knowledge sources:** Uploaded documents (PDF, PPT, DOC), website content, FAQ, product specs, pricing sheets.

---

# 9. Product Roadmap

## 9.1 Core Platform (MVP — Now)

The foundation. Everything needed for a functional exhibition platform.

**Organizer:**
- Exhibition CRUD (create, configure, publish)
- Exhibitor pipeline (invite, track status)
- Basic analytics (registrations, exhibitor counts)
- AI report generation
- Team management (invite members, roles)

**Exhibitor:**
- Booth profile (branding, description, contact)
- Lead capture forms (design, publish)
- Knowledge sources (upload documents, add URLs)
- QR code generation
- Lead viewing (list of submissions with basic data)
- Relationship notes
- AI lead intelligence (scoring, intent, summary)
- Booth AI chat (RAG-based Q&A)

**Attendee:**
- Exhibitor directory (browse, search)
- Exhibitor detail page with AI briefing
- Save/unsave exhibitors
- QR-based booth experience (lead forms, AI chat, resource downloads)
- Profile management (name, company, consent)

**AI:**
- Lead intelligence pipeline (scoring, intent, summary)
- Booth AI chat (RAG)
- Executive report generation
- AI guardrails

**Infrastructure:**
- Authentication (Supabase)
- Database (Postgres + pgvector)
- File storage (Supabase Storage)
- API (NestJS + Fastify)
- Application monitoring

**What does NOT ship in MVP:**
- Floor plan (spatial canvas)
- Meetings/booking
- Products catalog
- Campaigns/promotions
- Notifications
- Command palette with entity search
- Admin module
- Post-event workflows

## 9.2 V1

Builds on the core platform with major engagement features.

**Organizer:**
- **Floor plan canvas** — interactive hall layout with booth grid, drag-and-drop assignment, color-coded status, PDF export
- **Lead analytics** — cross-exhibition lead dashboard, top booths, industry distribution, AI intelligence trends
- **Meetings overview** — all meetings across exhibitions, status tracking
- **Exhibitor success metrics** — per-exhibitor ROI dashboard
- **Duplicate exhibition** — clone an exhibition configuration
- **Bulk operations** — bulk invite exhibitors, bulk assign booths
- **Campaigns** — basic registration campaigns (discount codes, referral)

**Exhibitor:**
- **Meetings** — request, confirm, reschedule, cancel with attendees
- **Meeting preparation** — AI-generated talking points based on attendee profile
- **Products catalog** — structured product listing with images, categories
- **Follow-up generation** — AI-drafted follow-up emails per lead
- **Booth analytics** — dedicated analytics page with charts and trends
- **Benchmarking** — compare booth performance to event averages
- **Team roles** — staff assignments, check-in/out, activity log

**Attendee:**
- **Personalized recommendations** — AI-curated exhibitor suggestions on home dashboard
- **Meeting booking** — request meetings with exhibitors from their profile page
- **Exhibitor messaging** — basic message inbox (ask questions, request info)
- **AI Assistant** — dedicated AI chat page for event-wide questions
- **Post-event dashboard** — summary of interactions, saved exhibitors, next steps

**AI:**
- **Daily Briefing** — auto-generated for all three personas
- **Meeting Assistant** — scheduling suggestions, talking points
- **Follow-up Generator** — personalized email drafts
- **Anomaly Detection** — basic pattern monitoring
- **Recommendation Engine** — attendee exhibitor suggestions

**Platform:**
- **Command palette** — global search with entities and actions
- **Keyboard shortcuts** — comprehensive shortcut system
- **Notification center** — in-app notification list with categories
- **Admin: Organizations & Users** — manage organizations and users

## 9.3 V2

Scales the platform with enterprise features and optimization.

**Organizer:**
- **Revenue management** — booth pricing tiers, invoicing, payment tracking
- **Advanced analytics** — cohort analysis, trend forecasting, custom dashboards
- **Multi-hall management** — complex exhibitions with multiple halls
- **Sponsorship management** — sponsor packages, placements, tracking
- **Matchmaking** — AI-powered attendee-to-exhibitor matching and recommendations
- **Exhibitor portal customization** — white-label the exhibitor experience

**Exhibitor:**
- **CRM integration** — Salesforce, HubSpot, Microsoft Dynamics connectors
- **Lead export** — CSV/Excel/PDF export with all intelligence data
- **Competitor insights** — anonymized benchmarking against similar booths
- **Multi-event dashboard** — compare performance across multiple exhibitions
- **Post-event campaigns** — automated nurture sequences for captured leads
- **Staff optimization** — AI schedule recommendations based on busy times

**Attendee:**
- **Networking** — attendee-to-attendee discovery and messaging
- **AI tour guide** — optimized walking route based on saved exhibitors
- **Session/agenda** — complete session scheduling (optional module)
- **Personal event feed** — activity feed of exhibitor updates, new products, meeting reminders
- **Offline mode** — PWA with offline-capable exhibitor directory

**AI:**
- **Predictive analytics** — registration and lead forecasting
- **Natural language analytics** — query your data in plain English
- **Smart notifications** — AI-prioritized notification delivery
- **Sentiment analysis** — lead interaction sentiment tracking
- **Content generation** — AI-written booth descriptions, product summaries, social posts

**Platform:**
- **Admin: Subscriptions & Billing** — plan management, invoices, usage tracking
- **Admin: Audit log** — comprehensive platform activity log
- **Admin: Support tools** — ticket system, knowledge base
- **API marketplace** — public API for third-party integrations
- **Webhooks** — event-driven webhooks for integrations

## 9.4 Future Vision

Long-term strategic direction.

**Multi-event platform:** Organizers run multiple simultaneous exhibitions. Exhibitors participate in multiple events. Attendees have a unified identity across events.

**Hybrid exhibitions:** Virtual booth experiences for remote attendees. Video meetings, virtual floor navigation, digital product demonstrations.

**Marketplace:** Exhibitors discover and book booth space directly. Organizers list available inventory. Dynamic pricing based on demand.

**Mobile app:** Native iOS and Android apps with push notifications, offline support, AR wayfinding.

**Enterprise SSO:** SAML, OIDC, SCIM provisioning for enterprise organizations.

**Globalization:** Multi-language, multi-currency, multi-timezone support for international exhibitions.

**AI evolution:**
- Autonomous exhibition operation (AI manages routine tasks)
- Predictive lead conversion (which leads will convert, at what value)
- Dynamic booth pricing (AI optimizes pricing based on demand)
- Automated post-event ROI reports for every stakeholder

---

# 10. UX Principles

## 10.1 Forms

- Forms open in **dialogs or drawers**, never full-page navigation
- Every form has a clear title and description
- The primary action button is labeled with the action ("Save", "Create", "Publish"), never "Submit"
- Secondary action is "Cancel" or "Discard"
- Validation happens inline, on blur, never after submission
- Errors are shown below the field, not in a banner
- Success is communicated with a brief toast notification
- Forms preserve state when closed accidentally (draft auto-save for complex forms)
- Required fields are marked; optional fields are not marked

## 10.2 Tables

- Tables are used for dense data, not for primary navigation
- Every table has a clear column definition with sortable headers
- Row hover state is subtle (background change only)
- Bulk selection via checkbox column
- Pagination on large datasets (default: 25 rows)
- Empty state with guidance instead of "No data"
- Column resizing for desktop users
- Export to CSV available

## 10.3 Cards

- Cards are the default content container for dashboards and lists
- Cards have consistent padding, radius, and shadow
- Card content is left-aligned, not centered
- Cards are not clickable by default — use explicit action buttons or links
- Metric cards show a single prominent number with label and optional trend
- Card grids use consistent sizing (no masonry)

## 10.4 Navigation

- Persistent navigation — never hides or collapses without user intent
- Active state is always visible with a brand-colored indicator
- Navigation items have icons + labels (icons only on mobile)
- Section headers are descriptive, not generic
- No mega-menus, no flyout navigation
- Workspace nav is collapsible on organizer/exhibitor desktops

## 10.5 Dialogs

- Dialogs for single tasks (create, edit, confirm)
- Drawers (slide-over panels) for complex tasks with multiple fields
- Drawers maintain context — the page behind is still visible
- All dialogs are dismissible via Escape key and clicking outside
- Confirmation dialogs for destructive actions (delete, archive, cancel)
- Confirmation buttons are red for destructive actions

## 10.6 Mobile

- Attendee experience is designed mobile-first
- Bottom tab bar for primary navigation
- Single-column layout on mobile
- Swipe gestures for common actions (swipe to dismiss, swipe for actions)
- Touch targets are minimum 44px
- Forms are full-width on mobile
- Tables become cards on mobile

## 10.7 Accessibility

- All interactive elements are keyboard accessible
- Focus indicators are visible (focus-visible ring, never outline: none)
- Color is never the only indicator of state (use icons, text labels)
- ARIA labels on all icon-only buttons
- Form fields have associated labels
- Error messages are announced to screen readers
- Skip-to-content link is available
- Minimum contrast ratio of 4.5:1 for text

## 10.8 Performance

- Initial page load under 2 seconds
- Subsequent navigations under 500ms (prefetching + optimistic UI)
- Search results under 500ms
- AI responses stream to feel instant
- Images are lazy-loaded
- Data tables are virtualized for large datasets
- Animations are limited to 200-300ms and respect `prefers-reduced-motion`

## 10.9 Search

- Global search available from any page (⌘K)
- Search results populated as you type (debounced 200ms)
- Results grouped by entity type (Exhibitions, Exhibitors, Leads, etc.)
- Keyboard navigable (↓↑ to select, Enter to open, Esc to close)
- Recent searches shown when search bar is focused
- Search state persists across navigation

## 10.10 Notifications

- In-app notification center with categorized list
- Real-time notifications for critical events (new lead, meeting request, system alert)
- Toast notifications for transactional feedback (save success, error)
- Notification badge on the user menu icon
- Notifications are grouped by type and sortable by time
- Mark as read, mark all as read, dismiss
- Notification preferences (per category) in settings

## 10.11 Keyboard Shortcuts

- Comprehensive shortcut system discoverable via `⌘/`
- Contextual shortcuts (different shortcuts on different pages)
- Common shortcuts:
  - `⌘K` — Command palette
  - `⌘N` — New (context-aware)
  - `⌘E` — Focus search
  - `⌘S` — Save current form
  - `⌘/` — Show all shortcuts
  - `Esc` — Close dialog/drawer/palette
  - `⌘Z` — Undo (context-aware)

---

*End of Product Specification V1*

*This document is the constitution of the ExAi product. All future design, engineering, and product decisions derive from this specification. If a feature contradicts this document, the document wins. If a feature is not in this document, it must be added through the product review process.*
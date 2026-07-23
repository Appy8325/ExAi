# Demo Script (5-7 minutes)

**Application:** ExAi v1.0.0-rc1
**URL:** https://ex-ai-web.vercel.app
**Last updated:** 2026-07-23

---

## 1. Introduction (30s)

> *Open on the ExAi landing page.*

"ExAi is an intelligent lead capture and engagement platform for in-person B2B events — trade shows, conferences, expos. We replace paper business cards and lead scanners with a unified digital experience that connects organizers, exhibitors, and attendees in real time."

**Target users:**
- **Organizers** — run events, manage exhibitors, track performance
- **Exhibitors** — capture leads, engage visitors, measure ROI
- **Attendees** — discover exhibitors, book meetings, connect

---

## 2. Organizer Experience — Dashboard & Event Overview (90s)

> *Navigate to `/org` (logged in as demo organizer).*

"This is the Organizer Dashboard. The event overview shows key metrics at a glance."

**Walkthrough:**
- **KPI cards** — Total events, active exhibitors, total leads captured, engagement rate across all events
- **Recent events list** — Quick navigation to each event
- **Quick actions** — Create event, view analytics, generate reports

> *Click into "TechExpo 2027" event → `/org/events/[eventId]`.*

"Each event has a dedicated dashboard showing its specific metrics. You can see exhibitor stats, lead volume, and a breakdown of activity by booth."

**Show:**
- Event-level KPIs (total exhibitors, total attendees, leads captured)
- Exhibitor list with booth status and lead counts
- Quick links to analytics, reports, and event settings

> *Navigate to Admin Console → `/admin`.*

**Admin Console:**
"Behind the scenes, the Admin Console gives organizers full visibility into system health and configuration."
- Service status dashboard
- System health indicators
- Environment configuration summary

---

## 3. Analytics (60s)

> *Navigate to `/org/analytics` from the organizer dashboard.*

"Analytics shows you what's happening across all your events."

**Walkthrough:**
- **Funnel visualization** — Lead capture stages: booth visits → profile views → lead submissions → follow-ups
- **Booth heatmap** — Which exhibitors are getting the most booth traffic and engagement
- **Trend metrics** — Daily visitor counts overlaid on the event timeline
- **Intent distribution** — Breakdown of captured leads by buying intent (high/medium/exploring)

"Why did metrics change? The analytics page reflects real-time data as attendees interact with exhibitors. If you see a spike in a particular exhibitor's booth traffic, it's because they've had new visitors scan their QR code. The funnel narrows from visits to leads to follow-ups — a natural drop-off that helps exhibitors prioritize."

---

## 4. Reports (60s)

> *Navigate to `/org/events/[eventId]/reports`.*

"The Reports module generates an AI-powered executive summary for any event."

**Walkthrough:**
- **Executive summary** — AI-generated narrative covering event performance, top exhibitors, lead quality, engagement trends
- **Key insights** — Data-driven observations surfaced from analytics
- **Download action** — Export the report as a PDF for sharing with stakeholders

"This report is generated using the NVIDIA AI integration. It synthesizes raw event data into actionable business intelligence — the kind of summary an event organizer would spend hours compiling manually."

> *Click "Download PDF" to demonstrate the export flow.*

---

## 5. Exhibitor Experience (90s)

> *Navigate to `/exhibit/[organizationId]/dashboard/[eventExhibitorId]`.*

**Exhibitor Dashboard:**
"This is the exhibitor's view — what a booth manager sees during a live event."

**Show:**
- **KPI grid** — Booth visits, leads captured, profile views, engagement score
- **AI Insight Cards** — Real-time intelligence: "Your booth traffic is up 40% compared to the morning session", "High-intent leads you should follow up with"
- **Activity feed** — Chronological log of visitor interactions, lead captures, and profile views
- **Recent leads** — Captured leads with contact info, company, job title, and buying intent score

> *Navigate to `/exhibit/[organizationId]/attendees`.*

**Lead Visibility:**
"Every lead captured includes AI-enriched data: buying intent classification, conversation summary topics, and contact details."

**Show:**
- Lead list with intent badges (high/medium/exploring)
- Lead detail with AI summary and engagement history

> *Navigate to `/exhibit/[organizationId]/relationships/[relationshipId]`.*

**Engagement:**
"This is where exhibitors manage relationships — notes, follow-up reminders, and interaction history for each lead."

---

## 6. Architecture Highlights (60s)

"This application is built on a modern, production-grade stack:"

| Layer | Technology | Why |
|-------|-----------|-----|
| **Frontend** | Next.js 15 (App Router) | SSR, static generation, edge-ready |
| **UI** | Custom design system (`@concourse/ui`) | Semantic tokens, Tailwind, accessible |
| **Backend** | NestJS 11 + Fastify | Modular, dependency-injected, async-first |
| **Database** | Supabase Postgres + Supavisor | Managed Postgres with IPv4 connection pooling |
| **AI** | NVIDIA API (NIM) | On-premise LLM inference for lead enrichment, intent scoring, report generation |
| **Deployment** | Vercel (api + web) | Unified serverless, zero-ops infrastructure |
| **Monorepo** | pnpm workspaces (13 packages) | Shared types, contracts, and tooling |

"The architecture is designed for serverless from day one — lazy database connections, connection pooling via Supavisor, and full separation between the API and web layers."

---

## 7. Closing (30s)

**Business value:**
- **For organizers:** Turn raw event data into measurable ROI. Know exactly which exhibitors are performing, which booths are getting traffic, and what leads look like — before the event ends.
- **For exhibitors:** Never lose a lead again. Every scan, every visit, every conversation is captured and enriched with AI.
- **For attendees:** Discover the right exhibitors without walking every aisle. Personalized recommendations, instant connections.

**Roadmap:**
- Self-serve signup with onboarding wizard
- Stripe billing and subscription management
- HubSpot/Salesforce CRM integration
- AI anomaly detection and predictive lead scoring
- Public REST API

"ExAi is live at https://ex-ai-web.vercel.app. The API is operational at https://ex-ai-api.vercel.app. Thank you."

---

## Timing Summary

| Section | Duration |
|---------|----------|
| 1. Introduction | 30s |
| 2. Organizer Experience | 90s |
| 3. Analytics | 60s |
| 4. Reports | 60s |
| 5. Exhibitor Experience | 90s |
| 6. Architecture | 60s |
| 7. Closing | 30s |
| **Total** | **~7 min** |

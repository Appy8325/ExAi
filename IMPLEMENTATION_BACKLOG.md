# ExAi Implementation Backlog

> **Version:** V1
> **Date:** July 24, 2026
> **Owner:** Engineering
>
> This document is the engineering execution plan.
>
> It derives from three immutable source documents:
> - PRODUCT_ARCHITECTURE.md (current-state analysis)
> - PRODUCT_SPECIFICATION_V1.md (future-state product spec)
> - PRODUCT_WORKFLOWS.md (workflow blueprints)
>
> Engineering must implement exactly what is described here, in this order.
> If a story is not here, do not build it yet.

---

**Table of Contents**

1. [Epics](#1-epics)
2. [User Stories](#2-user-stories)
3. [Release Plan](#3-release-plan)
4. [Technical Backlog](#4-technical-backlog)
5. [Implementation Order](#5-implementation-order)

---

# 1. Epics

## 1.1 Epic Index

| ID | Epic | Personas | Complexity | Priority | Release |
|---|---|---|---|---|---|
| E01 | Foundation Cleanup | All | XL | P0 | Alpha |
| E02 | Exhibition Core | Organizer | M | P0 | Alpha |
| E03 | Floor Plan Canvas | Organizer | XL | P1 | Beta |
| E04 | Lead Capture Engine | Exhibitor, Attendee | S | P0 | Alpha |
| E05 | Booth Workspace | Exhibitor | L | P0 | Alpha |
| E06 | Attendee Experience | Attendee | L | P0 | Beta |
| E07 | AI Intelligence | All | XL | P0 | Alpha+Beta |
| E08 | Reports & Analytics | Organizer, Exhibitor | M | P0 | Beta |
| E09 | Meetings | Exhibitor, Attendee | L | P1 | V1 |
| E10 | Notification System | All | M | P1 | Beta |
| E11 | Exhibitor Pipeline | Organizer | M | P0 | Alpha |
| E12 | Post-Event Workflows | All | M | P2 | V2 |
| E13 | Admin Platform | Admin | L | P2 | V2 |
| E14 | Enterprise Features | All | XL | P2 | V2 |

---

## 1.2 Epic E01: Foundation Cleanup

**Objective:** Remove legacy code, consolidate duplicate implementations, fix navigation architecture, and establish the canonical code patterns before building new features.

**Business value:** Reduces maintenance burden, eliminates confusion from duplicate routes, ensures new features are built on a clean foundation.

**Personas:** All

**Dependencies:** None (this is the first work to do)

**Complexity:** XL — affects routing, navigation, multiple components, and layout files across the codebase

**Priority:** P0 — must be done before any new features

**Success criteria:**
- [ ] `/organizer/*` legacy route group removed, all functionality migrated to `/org/*`
- [ ] Single canonical breadcrumb implementation (remove duplicate)
- [ ] GlobalNav perspective links point to live workspaces, not demo routes
- [ ] Placeholder "coming soon" pages removed
- [ ] Demo workspace routes aligned with live workspace patterns
- [ ] All navigation components use `WorkspaceNav` consistently
- [ ] Command palette populated with dynamic entity search

**Related workflows (from PRODUCT_WORKFLOWS.md):** None directly — this is cleanup

---

## 1.3 Epic E02: Exhibition Core

**Objective:** Implement the Exhibition CRUD workflow end-to-end with proper fields, prerequisite checking, publish/unpublish lifecycle, and exhibition detail page.

**Business value:** Organizers can create, configure, and publish exhibitions — the foundation of the entire platform.

**Personas:** Organizer

**Dependencies:** E01 (Foundation Cleanup) — must have clean navigation before building exhibition pages

**Complexity:** M — mostly exists, needs polishing and reorganization

**Priority:** P0

**Success criteria:**
- [ ] "Create Exhibition" dialog includes name, slug, timezone, dates, venue, description, logo
- [ ] Exhibition detail page (Overview tab) with health card, KPI row, next best actions, activity feed
- [ ] Publish/Unpublish with prerequisite checklist (warnings for missing setup)
- [ ] Exhibition settings with full edit capabilities
- [ ] Exhibition lifecycle: draft → published → live → completed → archived
- [ ] Exhibition list page with search, filter, status badges
- [ ] Duplicate exhibition functionality

**Related workflows:** Create an Exhibition, Publish Exhibition, Close Exhibition

**Related entities:** Exhibition (event), Organization

---

## 1.4 Epic E03: Floor Plan Canvas

**Objective:** Build the interactive floor plan tool that lets organizers configure halls, place booths, assign exhibitors, and visualize their exhibition space.

**Business value:** A core differentiator — no exhibition platform has a good floor plan tool. This is a major selling point.

**Personas:** Organizer

**Dependencies:** E02 (Exhibition Core) — floor plan belongs to an exhibition

**Complexity:** XL — involves canvas rendering, drag-and-drop, grid logic, state management, undo/redo, performance at scale

**Priority:** P1 — important but MVP can launch without it (booth assignment can be manual/text-based)

**Success criteria:**
- [ ] Create hall with configurable dimensions (rows × columns)
- [ ] Interactive booth grid rendered on canvas
- [ ] Drag-and-drop booth assignment from exhibitor list
- [ ] Color-coded booth status (available, reserved, assigned, not-for-sale)
- [ ] Booth size categories and pricing
- [ ] Landmarks (entrances, restrooms, food, stages)
- [ ] PDF export of floor plan
- [ ] Auto-numbering and snake-pattern layouts
- [ ] Performance at 500+ booths
- [ ] Undo/redo support

**Related workflows:** Configure Venue & Floor Plan, Sell Booths, Navigate Venue (attendee)

**Related entities:** Exhibition, Hall, Booth, Booth Presence

---

## 1.5 Epic E04: Lead Capture Engine

**Objective:** Ensure the lead capture pipeline is robust, complete, and production-ready — QR codes → booth experience → lead form → submission → AI enrichment → dashboard update.

**Business value:** Lead capture is the core transaction of the platform. If this doesn't work flawlessly, the product has no value.

**Personas:** Exhibitor, Attendee

**Dependencies:** None — QR-based lead capture already exists and works

**Complexity:** S — exists, needs hardening and polish

**Priority:** P0

**Success criteria:**
- [ ] QR code generation with download (PNG, SVG) and copy-link
- [ ] Booth experience loads in < 2 seconds on mobile
- [ ] Dynamic lead form renders all field types (text, email, phone, checkbox, multiline, consent)
- [ ] Form submission creates lead + relationship + triggers AI enrichment
- [ ] Idempotency prevents duplicate submissions
- [ ] AI enrichment completes in < 10 seconds on hot path
- [ ] Lead appears on exhibitor dashboard within 3 seconds of submission
- [ ] Attendee sees confirmation and post-submission options
- [ ] Booth AI chat (RAG) works with uploaded knowledge sources

**Related workflows:** Capture Leads, Qualify Leads, Scan QR Code, Exchange Contact Information

**Related entities:** Booth Presence, Lead Submission, Lead Submission Values, Lead Intelligence, Exhibitor Relationship, Booth QR Credential

---

## 1.6 Epic E05: Booth Workspace

**Objective:** Build the complete exhibitor booth management workspace — profile setup, asset uploads, lead form design, team management, and dashboard.

**Business value:** Exhibitors need a complete, self-service workspace to manage their booth presence. This is the primary surface they interact with.

**Personas:** Exhibitor

**Dependencies:** E01 (Foundation Cleanup) — exhibitor navigation must use correct patterns

**Complexity:** L — multiple screens and forms, but mostly exist in current codebase

**Priority:** P0

**Success criteria:**
- [ ] Booth profile form with file upload for logo and banner
- [ ] Real-time booth preview (attendee view)
- [ ] Lead form editor with dynamic fields, draft/publish workflow
- [ ] Asset upload (PDF, images, presentations) with processing status
- [ ] Knowledge source management (upload documents, add URLs)
- [ ] QR code generation and download
- [ ] Booth publish/unpublish workflow
- [ ] Team member invitation with roles (admin, rep)
- [ ] Welcome/onboarding state for first-time exhibitors

**Related workflows:** Build Booth Profile, Upload Marketing Assets, Invite Booth Staff, Accept Invitation

**Related entities:** Booth Presence, Lead Form, Lead Form Fields, KB Source, KB Document, Booth QR Credential

---

## 1.7 Epic E06: Attendee Experience

**Objective:** Build the complete attendee journey — registration, exhibitor discovery, exhibitor profiles, AI recommendations, saved exhibitors, and post-event summary.

**Business value:** Attendees are the demand side of the three-sided marketplace. A great attendee experience drives registrations, which drives exhibitor ROI, which drives organizer revenue.

**Personas:** Attendee

**Dependencies:** E01 (Foundation Cleanup) — attendee routes must be consolidated

**Complexity:** L — multiple pages, but browse and exhibitor profiles exist

**Priority:** P0

**Success criteria:**
- [ ] Exhibition public page with registration flow
- [ ] Attendee registration with profile creation and consent management
- [ ] Unified event landing page (merge `/hackathon` into `/e/[slug]`)
- [ ] Exhibitor directory with search, filter, AI-ranked results
- [ ] Exhibitor profile page with AI Booth Briefing
- [ ] Save/unsave exhibitors
- [ ] Exhibition dashboard with personalized recommendations
- [ ] Post-event summary page (shows saved exhibitors, meeting history)
- [ ] Post-event AI-generated recap

**Related workflows:** Register for Exhibition, Find Exhibitors, Save Products, Receive AI Recommendations, Continue Networking

**Related entities:** Attendee Profile, Attendee Profile Consent, Registration, Exhibitor Relationship, User

---

## 1.8 Epic E07: AI Intelligence

**Objective:** Implement and productionize all AI capabilities — lead intelligence, daily briefing, report generation, recommendation engine, booth chat, follow-up generation.

**Business value:** AI is the primary differentiator. Every competitor can do lead forms and QR codes. Only ExAi has AI-enriched lead intelligence, auto-generated reports, and personalized recommendations.

**Personas:** All

**Dependencies:** E04 (Lead Capture Engine) — AI enrichment depends on lead data

**Complexity:** XL — spans multiple AI services, prompt engineering, guardrails, vector search

**Priority:** P0

**Success criteria:**
- [ ] Lead intelligence pipeline: 95% of submissions enriched within 10 seconds
- [ ] Lead score 0-100 with breakdown (responses, relevance, buying intent)
- [ ] Buying intent classification (high, evaluating, browsing, not_relevant)
- [ ] Lead summary generation with topics discussed
- [ ] Daily Briefing generated for all personas on first daily login
- [ ] Executive report generation with multiple types (summary, exhibitor perf, attendee insights)
- [ ] Booth AI chat (RAG) with streaming responses
- [ ] AI guardrails on all generated content
- [ ] Recommendation engine for attendees (collaborative + content-based filtering)
- [ ] Follow-up email generation for exhibitors

**Related workflows:** Qualify Leads, Follow Up After Exhibition, Receive AI Recommendations, Generate Post-Event Reports, Monitor Exhibition Health

**Related entities:** Lead Intelligence, Organizer Report, KB Chunk, KB Document

---

## 1.9 Epic E08: Reports & Analytics

**Objective:** Build comprehensive analytics dashboards for organizers (cross-exhibition, per-exhibition, lead analytics) and exhibitors (booth performance, pipeline analytics).

**Business value:** Analytics prove ROI. Without analytics, organizers can't justify the platform to stakeholders, and exhibitors can't justify their exhibition budget.

**Personas:** Organizer, Exhibitor

**Dependencies:** E04 (Lead Capture Engine) — analytics need lead data

**Complexity:** M — basic analytics exist, need enrichment and cross-exhibition views

**Priority:** P0

**Success criteria:**
- [ ] Cross-exhibition health dashboard for organizers
- [ ] Per-exhibition analytics with pipeline funnel, booth engagement, industry/topic breakdowns
- [ ] Lead analytics showing top booths, lead quality distribution, trends
- [ ] Exhibitor booth analytics with trends, benchmarks
- [ ] AI report generation with multiple report types
- [ ] Report list with history, download (PDF), share (public link)
- [ ] CSV export for all analytics views

**Related workflows:** Monitor Exhibition Health, Generate Post-Event Reports, Measure ROI

**Related entities:** Organizer Report

---

## 1.10 Epic E09: Meetings

**Objective:** Build the meeting booking system — request, confirm, reschedule, cancel meetings between exhibitors and attendees, with calendar integration.

**Business value:** Meetings drive high-value interactions. This moves ExAi from "lead capture" to "business development platform."

**Personas:** Exhibitor, Attendee

**Dependencies:** E05 (Booth Workspace), E06 (Attendee Experience), E07 (AI Intelligence)

**Complexity:** L — two-sided scheduling is inherently complex

**Priority:** P1

**Success criteria:**
- [ ] Exhibitor can request meeting with attendee (from lead detail)
- [ ] Attendee can request meeting with exhibitor (from exhibitor profile)
- [ ] Availability management (exhibitor sets booth hours)
- [ ] Meeting request flow (request → accept/decline/reschedule)
- [ ] Meeting appears on both parties' schedules
- [ ] AI generates meeting talking points from lead intelligence
- [ ] Calendar integration (Google, Outlook) — export .ics
- [ ] Meeting reminders (15 min before)

**Related workflows:** Schedule Meetings, Book Meetings

**Related entities:** Meeting (new table needed)

---

## 1.11 Epic E10: Notification System

**Objective:** Build the in-app notification center with real-time push for critical events, batch delivery for warnings, and daily briefing delivery.

**Business value:** Without notifications, users must constantly refresh dashboards. Notifications drive engagement and ensure critical events aren't missed.

**Personas:** All

**Dependencies:** E07 (AI Intelligence) — daily briefing is a notification

**Complexity:** M — requires notification infrastructure (DB, real-time, delivery)

**Priority:** P1

**Success criteria:**
- [ ] Notification center page with categorized list
- [ ] Real-time notifications for critical events (new lead, meeting request, system alert)
- [ ] Toast notifications for transactional feedback
- [ ] Notification badge on user menu
- [ ] Mark as read, mark all as read
- [ ] Notification preferences per category
- [ ] Daily Briefing delivered as notification each morning
- [ ] Email fallback for critical notifications

**Related workflows:** All workflows produce notifications

**Related entities:** Notification (new table needed)

---

## 1.12 Epic E11: Exhibitor Pipeline

**Objective:** Build organizer-side exhibitor management — invite, track, approve, message, and manage the full exhibitor pipeline across an exhibition.

**Business value:** Managing the exhibitor pipeline is a core organizer workflow. Without it, organizers use spreadsheets.

**Personas:** Organizer

**Dependencies:** E02 (Exhibition Core) — exhibitors belong to an exhibition

**Complexity:** M — partially exists

**Priority:** P0

**Success criteria:**
- [ ] Invite exhibitors (single email, bulk CSV, past exhibitors)
- [ ] Exhibitor list with status tracking (invited → accepted → in progress → ready → withdrawn)
- [ ] Exhibitor detail with profile completeness score
- [ ] Bulk messaging to exhibitors
- [ ] Accept/decline workflow for exhibition slot assignments
- [ ] Automated reminders for incomplete exhibitors (7 days before, 3 days before, 1 day before)

**Related workflows:** Invite Exhibitors, Review Exhibitor Submissions

**Related entities:** Booth Presence, Organization (kind=exhibitor), Organization Membership, Auth Token

---

## 1.13 Epic E12: Post-Event Workflows

**Objective:** Build post-event engagement for all personas — AI follow-up generation for exhibitors, AI summary for attendees, ROI measurement, and continued networking.

**Business value:** The "after" phase is where most platforms drop the ball. Post-event engagement drives exhibitor retention and attendee return rate.

**Personas:** All

**Dependencies:** E04 (Lead Capture), E07 (AI Intelligence), E09 (Meetings)

**Complexity:** M

**Priority:** P2

**Success criteria:**
- [ ] Exhibitor follow-up generation (AI-drafted emails per lead)
- [ ] Attendee post-event summary (who they met, what they saved)
- [ ] ROI dashboard for exhibitors (pipeline value, cost input, ROI calculation)
- [ ] Post-event batch follow-up for all uncontacted leads
- [ ] Lead status tracking (followed up, meeting booked, closed won)

**Related workflows:** Follow Up After Exhibition, Measure ROI, Continue Networking After Exhibition

---

## 1.14 Epic E13: Admin Platform

**Objective:** Build the admin dashboard, organization management, user management, subscription/billing, and platform monitoring.

**Business value:** Platform ops cannot function without admin tools. Currently the admin page is mock data.

**Personas:** Admin

**Dependencies:** E01 (Foundation Cleanup) — admin layout must be correct

**Complexity:** L

**Priority:** P2

**Success criteria:**
- [ ] Platform health dashboard with live metrics
- [ ] Organization management (create, view, suspend, delete)
- [ ] User management (search, view, suspend, change role)
- [ ] Subscription plan management
- [ ] Activity audit log
- [ ] Support ticket system

**Related workflows:** All Admin workflows

---

## 1.15 Epic E14: Enterprise Features

**Objective:** CRM integration, advanced analytics, multi-hall management, sponsorship, matchmaking, API marketplace, webhooks.

**Business value:** Enterprise sales require enterprise features. CRM integration is the most commonly requested feature by exhibitors.

**Personas:** All

**Dependencies:** All prior epics

**Complexity:** XL

**Priority:** P2

**Success criteria:**
- [ ] Salesforce and HubSpot integration for lead export
- [ ] Advanced analytics with cohort analysis and forecasting
- [ ] Multi-hall management
- [ ] Sponsorship and package management
- [ ] Matchmaking (AI-powered attendee-to-exhibitor matching)
- [ ] Public API for third-party integrations
- [ ] Webhook system for event-driven integrations

---

# 2. User Stories

## 2.1 Alpha Release Stories

### Alpha Sprint 1 (Weeks 1-2): Foundation Cleanup

```
US-001: Remove legacy /organizer/ route group
  Description: Remove all routes, layouts, components under /organizer/*.
  Migrate any unique functionality to /org/* equivalent.
  Acceptance Criteria:
    - /organizer routes return 404 or redirect to /org equivalents
    - All organizer navigation uses WorkspaceNav component
    - OrganizerNavigation component deleted
    - Legacy layout.tsx at /organizer/layout.tsx removed
  Dependencies: None
  DoD: No remaining imports from legacy organizer components. All tests pass.
  Related workflows: None (cleanup)
  Related entities: None

US-002: Consolidate breadcrumb implementations
  Description: Remove duplicate Breadcrumbs.tsx. Keep UnifiedBreadcrumbs.tsx as
  single canonical implementation. Ensure all routes produce correct breadcrumbs.
  Acceptance Criteria:
    - Only one breadcrumb component exists
    - All route groups produce correct breadcrumb trails
    - No regressions in any page
  Dependencies: US-001
  DoD: Breadcrumb component import removed from old file. All pages work correctly.

US-003: Fix GlobalNav perspective links
  Description: Change GlobalNav perspective links from demo routes (/demo/organizer)
  to live workspace routes (/org, /exhibit). Only signed-in users see live links;
  signed-out users still see demo links.
  Acceptance Criteria:
    - Signed-in organizer sees "Organizer" → /org
    - Signed-in exhibitor sees "Exhibitor" → /exhibit
    - Signed-out user sees "Try Demo" → /demo
    - Admin perspective shown only for platform admins
  Dependencies: None
  DoD: GlobalNav reads auth session and renders correct links.

US-004: Remove placeholder pages
  Description: Remove all "coming soon" or "no data yet" placeholder pages that
  serve no purpose. Only pages with real workflows should exist.
  Pages to remove:
    - /org/events/[id]/registrations (empty placeholder)
    - /org/events/[id]/documents (empty placeholder)
    - /organizer/events/[id]/attendees (coming soon)
    - /organizer/events/[id]/sessions (coming soon)
    - /organizer/events/[id]/analytics (coming soon)
    - /organizer/events/[id]/users (coming soon)
    - Exhibitor sub-section placeholders (Leads, Relationships, etc.)
  Acceptance Criteria:
    - All listed placeholder pages removed
    - Navigation no longer links to removed pages
    - Related page-tab configs updated
  Dependencies: US-001
  DoD: Routes removed. Nav items pointing to them removed.

US-005: Align demo workspace routes
  Description: Restructure demo routes to match live workspace URL patterns.
  /demo/organizer/event/[slug] → /demo/organizer/events/[id] pattern alignment.
  Acceptance Criteria:
    - Demo organizer event pages use same slug pattern as live
    - Demo page navigation matches live workspace nav items
  Dependencies: US-001
  DoD: Demo routes follow same conventions as live routes.
```

### Alpha Sprint 2 (Weeks 3-4): Exhibition Core

```
US-010: Enhance Create Exhibition dialog
  Description: Update the create exhibition dialog to include venue, description,
  logo fields. Add slug auto-generation from name with collision detection.
  Acceptance Criteria:
    - Dialog has: name, slug (auto-gen), timezone, start/end date, venue, description, logo
    - Slug auto-generates from name, editable
    - Slug collision detected, auto-suggested alternative
    - Venue field is optional text input
    - Logo is file upload (image)
  Dependencies: US-001-US-005
  DoD: Form validated, submits to API, redirects to exhibition detail page.

US-011: Build Exhibition Overview page
  Description: Build the Exhibition Overview tab as specified in PRODUCT_SPECIFICATION_V1
  — health status, KPI row, next best actions, recent activity, quick actions.
  Acceptance Criteria:
    - Status badge with health indicator (On track / Needs attention / Critical)
    - KPI row: registrations, exhibitors, sessions, speakers, leads, conversion rate
    - Next Best Actions section with prioritized, contextual suggestions
    - Quick action buttons (Publish, View Floor Plan, Invite Exhibitors, Generate Report)
    - Recent activity feed
  Dependencies: US-010
  DoD: Page renders with real data. All actions link correctly.

US-012: Implement Publish with prerequisites
  Description: Publish button checks prerequisites before allowing publication.
  Missing required items block publish. Missing recommended items show warning
  with "Publish Anyway" option.
  Acceptance Criteria:
    - Prerequisites checked: name, dates (required); exhibitors, floor plan (recommended)
    - Missing required → blocked with list
    - Missing recommended → confirmation dialog
    - Published → status changes, public page live, exhibitors notified
  Dependencies: US-011
  DoD: Publish flow works end-to-end with all checking.

US-013: Build Exhibition Settings page
  Description: Full exhibition settings with name, slug, timezone, dates, branding
  (logo, primary color, privacy policy URL), archive action.
  Acceptance Criteria:
    - All fields editable
    - Primary color picker with hex input
    - Logo file upload
    - Archive with confirmation dialog
    - Save/Publish/Archive buttons
  Dependencies: US-011
  DoD: Settings page matches specification. All mutations work.

US-014: Implement Close Exhibition workflow
  Description: Move archive to proper Close workflow with data freeze, exhibitor
  notification, and AI report triggering.
  Acceptance Criteria:
    - Close Exhibition button on Overview and Settings
    - Confirmation dialog explaining consequences
    - Status → completed
    - Public page shows "concluded" notice
    - Lead forms disabled
    - AI report triggered automatically
    - Notification to exhibitors with results link
  Dependencies: US-011, US-012
  DoD: Close workflow works end-to-end.

US-015: Duplicate Exhibition
  Description: Clone an existing exhibition including its configuration (settings,
  floor plan template, exhibitor list).
  Acceptance Criteria:
    - "Duplicate" button on exhibition actions
    - New exhibition created with "Copy of [name]" and new dates
    - Settings copied from source
    - Floor plan template copied (booth grid, pricing)
    - Exhibitor list NOT copied (fresh invitations needed)
  Dependencies: US-010
  DoD: Duplication creates functional copy.
```

### Alpha Sprint 3 (Weeks 5-6): Lead Capture Engine

```
US-020: QR code generation and download
  Description: Generate QR code for a booth. Allow download as PNG, SVG. Copy
  public URL to clipboard. Regenerate option.
  Acceptance Criteria:
    - QR code renders on the QR page
    - Download PNG button works
    - Download SVG button works
    - Copy link button copies public URL
    - Regenerate creates new token, invalidates old one
  Dependencies: US-005
  DoD: QR generation works for all booth presences.

US-021: Booth experience mobile optimization
  Description: Optimize the multi-step booth experience for mobile — faster loads,
  better touch targets, smoother transitions between steps.
  Acceptance Criteria:
    - Page loads in < 2 seconds on 4G
    - Touch targets minimum 44px
    - Smooth transitions between steps (no full page reloads)
    - All form fields render correctly on mobile viewport
    - AI chat input is easily accessible
  Dependencies: None (booth experience exists)
  DoD: Lighthouse mobile score > 80 on booth experience page.

US-022: Lead form rendering — all field types
  Description: Ensure the dynamic lead form system renders all supported field
  types correctly: text, email, phone, multiline, checkbox, consent, select.
  Acceptance Criteria:
    - All field types render in the booth experience
    - Field validation works per type (email format, phone format, required)
    - Consent field includes the exhibitor's consent text
    - Fields render in the order specified by the exhibitor
  Dependencies: US-020
  DoD: All field types work. Validation works. Submission succeeds.

US-023: Lead submission idempotency hardening
  Description: Ensure duplicate submissions (same attendee, same booth, same session)
  are reliably detected and prevented.
  Acceptance Criteria:
    - Idempotency key prevents duplicate creation
    - Second submission with same key returns existing record
    - Key generation uses UUIDv7
    - Race condition handled (DB-level unique constraint)
  Dependencies: US-022
  DoD: Duplicate submissions never create duplicate records.

US-024: Real-time lead appearance on exhibitor dashboard
  Description: When an attendee submits a lead form, the lead appears on the
  exhibitor's dashboard within 3 seconds with AI enrichment visible.
  Acceptance Criteria:
    - Lead appears in dashboard within 3 seconds
    - AI enrichment status shows "processing" then "complete"
    - Dashboard KPI updates (visitors +1, new leads +1)
    - Pipeline chart updates
  Dependencies: US-022, E07 (AI Intelligence) — basic enrichment
  DoD: End-to-end latency < 3 seconds for lead appearing on dashboard.
```

### Alpha Sprint 4 (Weeks 7-8): Booth Workspace

```
US-030: Booth profile form with file upload
  Description: Booth profile edit form with file upload for logo and banner.
  Real-time preview showing attendee view.
  Acceptance Criteria:
    - Form fields: company name, booth name, description, logo upload, banner upload,
      brand color picker, website, social links, contact email, phone
    - Logo upload validates: < 5MB, PNG/JPG, auto-crop to square
    - Banner upload validates: < 10MB, PNG/JPG, recommended aspect ratio
    - Real-time preview panel updates as fields change
    - Save persists to API
  Dependencies: US-005
  DoD: Booth profile form complete with file upload and preview.

US-031: Lead form editor
  Description: Dynamic lead form builder where exhibitors add, remove, and configure
  form fields. Draft/publish workflow.
  Acceptance Criteria:
    - Add field: select type → configure label, placeholder, required, options
    - Remove field with confirmation
    - Reorder fields via drag-and-drop
    - Save draft (not visible to attendees)
    - Publish form (immediately visible to attendees)
    - Max 30 fields, min 1 field
    - Field types: text, email, phone, multiline, checkbox, select, consent
  Dependencies: US-030
  DoD: Full lead form editor implementation.

US-032: Asset upload with processing status
  Description: File upload for booth assets with processing pipeline status tracking
  (pending → processing → indexed → failed).
  Acceptance Criteria:
    - File upload via drag-and-drop or file picker
    - Accepted: PDF, PNG, JPG, PPT, DOC, MP4 (< 50MB)
    - Upload progress indicator
    - Asset appears in list with processing status
    - Failed status shows error message with retry option
    - Processed assets appear in attendee-facing booth
  Dependencies: US-030
  DoD: Asset upload pipeline works end-to-end.

US-033: Knowledge source management
  Description: Manage knowledge sources (uploaded docs and URLs) that power booth
  AI chat.
  Acceptance Criteria:
    - Add source: URL or file upload
    - Source type: PDF, brochure, presentation, website, FAQ, pricing
    - Processing status indicator (pending → processing → indexed → failed)
    - Remove source with confirmation
    - Retry failed source
    - Source appears in booth AI knowledge base when indexed
  Dependencies: US-030
  DoD: Knowledge source management fully functional.

US-034: Booth publish/unpublish workflow
  Description: After profile is complete, exhibitor publishes booth. Publishing
  makes it visible to attendees. Unpublish hides it.
  Acceptance Criteria:
    - "Publish Booth" button with prerequisite check
    - Required: name, description, at least one lead form field
    - Published → booth visible in attendee directory and QR scan
    - Unpublish → booth hidden (existing leads preserved)
    - Status badge on dashboard
  Dependencies: US-030, US-031
  DoD: Publish/unpublish flow works. Booth visibility controlled correctly.

US-035: Team member invitation
  Description: Invite team members to the booth with role-based access.
  Acceptance Criteria:
    - "Invite Team Member" form: email + role (admin, rep)
    - Invitation email sent with sign-in link
    - Pending → Active status transition
    - Admin: full access (edit booth, manage forms, view leads)
    - Rep: limited access (view leads, add notes)
  Dependencies: US-030
  DoD: Team invitation and role enforcement works.
```

### Alpha Sprint 5 (Weeks 9-10): Attendee Experience (Part 1)

```
US-040: Exhibition public page
  Description: Public exhibition landing page with event info, registration CTA,
  featured exhibitors, and live counters. Accessible without authentication.
  Acceptance Criteria:
    - Route: /e/[slug]
    - Shows: name, dates, venue, description, logo, featured exhibitors (top 6)
    - Live counters: registrations, exhibitors, (during event) leads generated
    - "Register" CTA → registration flow
    - Social share buttons
    - SEO metadata (title, description, open graph)
  Dependencies: US-012 (Publish Exhibition)
  DoD: Public page renders with event data. SEO metadata present.

US-041: Attendee registration flow
  Description: Registration flow from public page → sign-up → profile → consent.
  Acceptance Criteria:
    - Click Register → sign in or create account
    - Profile: full name, company, job title, industry
    - Consent: share profile toggle, receive recommendations toggle
    - Email verification (if new account)
    - Post-registration redirect to exhibition dashboard
  Dependencies: US-040
  DoD: Registration flow works end-to-end.

US-042: Consolidate attendee entry points
  Description: Merge /hackathon functionality into /e/[slug] unified experience.
  Remove /hackathon as separate route.
  Acceptance Criteria:
    - /e/[slug] contains all functionality from /hackathon
    - /hackathon redirects to /e/[slug]
    - Live counters, journey guide, exhibitor grid all present
    - Bottom navigation works correctly
  Dependencies: US-040, US-041
  DoD: Single attendee entry point. /hackathon deprecated.

US-043: Attendee dashboard with recommendations
  Description: Personalized exhibition dashboard showing AI recommendations,
  saved exhibitors, upcoming meetings, and quick actions.
  Acceptance Criteria:
    - "Good morning, [name]" personalized greeting
    - "Recommended for you" section (AI-curated exhibitor list)
    - Saved exhibitors count with link to Saved tab
    - Upcoming meetings list
    - Quick actions: browse exhibitors, view floor map, saved list
    - Recent activity (exhibitors viewed, meetings booked)
  Dependencies: US-042, E07 (AI Intelligence) — basic recommendations
  DoD: Attendee dashboard renders with personalized content.

US-044: Exhibitor profile page
  Description: Exhibitor detail page with AI Booth Briefing, products, meeting
  request, save/unsave, and resource downloads.
  Acceptance Criteria:
    - Company info: logo, name, description, booth number, website, social links
    - AI Booth Briefing section (auto-generated summary)
    - Product showcase (if products uploaded)
    - Downloadable resources
    - Save/unsave toggle
    - "Request Meeting" button (V1 — shows "coming soon" if not in V1)
    - "Ask AI" button → opens booth AI chat
  Dependencies: US-042, US-030, US-032
  DoD: Full exhibitor profile page. All features work.
```

---

## 2.2 Beta Release Stories

### Beta Sprint 1 (Weeks 11-12): Exhibitor Pipeline

```
US-050: Invite exhibitors — single and bulk
  Description: Invite exhibitors via single email entry or bulk CSV upload.
  Include company auto-lookup for existing exhibitor organizations.
  Acceptance Criteria:
    - Single invite: company name + email
    - Bulk invite: CSV upload with columns (company, email, booth preference)
    - CSV validation with error report
    - Past exhibitor selection (from previous exhibitions by same organizer)
    - Email sent with invitation link
    - Exhibitor appears in list with "Invited" status
  Dependencies: US-011 (Exhibition Overview)
  DoD: Invitation flow works for single, bulk, and past exhibitors.

US-051: Exhibitor pipeline dashboard
  Description: Organizer-side exhibitor management view with status tracking,
  completion scoring, and bulk actions.
  Acceptance Criteria:
    - List all exhibitors for an exhibition
    - Status badges: invited, accepted, in progress, ready, withdrawn
    - Completion score per exhibitor (profile completeness %)
    - Filter by status, search by name
    - Bulk actions: message, assign booth, remind
    - Export list (CSV)
  Dependencies: US-050
  DoD: Full exhibitor pipeline management.

US-052: Automated exhibitor reminders
  Description: Automated reminders sent to exhibitors who haven't completed their
  profile with configurable timing.
  Acceptance Criteria:
    - Reminder sent at: 7 days before, 3 days before, 1 day before
    - Content: profile completion status, missing items, link to booth workspace
    - Organizer can configure reminder timing in settings
    - Organizer can send manual reminder
  Dependencies: US-051
  DoD: Automated reminder system functional.
```

### Beta Sprint 2 (Weeks 13-14): Floor Plan Canvas

```
US-060: Floor plan data model and API
  Description: Database schema for Hall and Booth entities. CRUD endpoints for
  hall management and booth grid generation.
  Acceptance Criteria:
    - Database: halls table (id, exhibition_id, name, rows, columns, config)
    - Database: booths table (id, hall_id, position_x, position_y, width, height,
      status, price, assigned_exhibitor_id)
    - API: CREATE hall with dimensions, auto-generate booth grid
    - API: UPDATE hall, UPDATE booth, BULK UPDATE booths
    - API: GET floor plan for exhibition (halls + booths + assignments)
  Dependencies: US-011 (Exhibition Core)
  DoD: Database migrated. API endpoints created and tested.

US-061: Floor plan canvas renderer
  Description: Interactive canvas rendering hall grid with numbered booths,
  color-coded status, zoom/pan.
  Acceptance Criteria:
    - Hall rendered as grid with numbered booths
    - Color-coded: green=available, blue=assigned, yellow=reserved, gray=unavailable
    - Zoom in/out with mouse wheel and pinch
    - Pan with drag
    - Booth hover: highlight with tooltip (number, size, status)
    - Performance: 500+ booths with no lag
  Dependencies: US-060
  DoD: Floor plan canvas renders correctly at scale.

US-062: Drag-and-drop booth assignment
  Description: Drag exhibitor from sidebar onto booth to assign. Click booth to
  see assign/change options.
  Acceptance Criteria:
    - Exhibitor list panel on left side of floor plan
    - Drag exhibitor onto available booth → assignment created
    - Click assigned booth → popover with exhibitor info, change/remove options
    - Click available booth → popover with "Assign Exhibitor" search
    - Undo/redo for assignment changes
  Dependencies: US-061, US-051
  DoD: Drag-and-drop assignment works. Changes persist.

US-063: Floor plan export (PDF)
  Description: Export floor plan as PDF for printing and distribution.
  Acceptance Criteria:
    - "Export PDF" button on floor plan page
    - PDF includes: hall layout, booth numbers, company names, legend
    - Color rendering matches screen
    - Suitable for A1/A2/A3 print
  Dependencies: US-061
  DoD: PDF export produces printable floor plan.
```

### Beta Sprint 3 (Weeks 15-16): AI Intelligence (Part 1)

```
US-070: Lead intelligence pipeline productionization
  Description: Harden the lead intelligence pipeline for production — retry logic,
  timeout handling, queue management, monitoring.
  Acceptance Criteria:
    - AI enrichment queued asynchronously after submission
    - 95% of submissions enriched within 10 seconds
    - Retry logic: 3 attempts with exponential backoff
    - Timeout handling: skip enrichment if > 30 seconds
    - Failed status with error message for debugging
    - Monitoring: enrichment rate, latency, error rate tracked
  Dependencies: US-023 (Lead submission idempotency)
  DoD: Lead intelligence pipeline meets production SLAs.

US-071: AI guardrails implementation
  Description: Ensure all AI-generated content passes through guardrails before
  being shown to users. Implement content screening for safety, relevance,
  and quality.
  Acceptance Criteria:
    - Guardrails applied to: lead intelligence, report content, chat responses,
      follow-up drafts, daily briefing
    - Guardrail failure → fallback content or "not available" status
    - Monitoring: guardrail trigger rate tracked
    - Configurable guardrail strictness per content type
  Dependencies: US-070
  DoD: All AI output is guardrailed. No unsafe content reaches users.

US-072: Daily Briefing generation
  Description: Generate daily briefing for each persona on first daily login.
  Briefing summarizes what happened since last visit.
  Acceptance Criteria:
    - Briefing generated once per day per user
    - Organizer: active exhibitions, new registrations, alerts, top highlights
    - Exhibitor: new leads, pipeline changes, attention items, recommendations
    - Attendee: recommended exhibitors, new matches, meeting reminders
    - Briefing delivered via notification center
    - Briefing also available on dashboard
  Dependencies: US-070
  DoD: Daily briefings generated and delivered for all personas.

US-073: Recommendation engine (collaborative filtering)
  Description: Basic collaborative filtering recommendation engine for attendees.
  "Visitors like you also saved..." pattern.
  Acceptance Criteria:
    - Engine computes visitor similarity based on saved exhibitors
    - Recommendations shown on attendee dashboard and Recommendations tab
    - Fallback: popular exhibitors when insufficient data
    - Real-time updates as attendee saves more exhibitors
  Dependencies: US-042 (Attendee consolidated)
  DoD: Recommendation engine produces relevant suggestions.
```

### Beta Sprint 4 (Weeks 17-18): Reports & Analytics

```
US-080: Cross-exhibition health dashboard
  Description: Organizer dashboard showing all exhibitions with health scores,
  KPI comparison, and AI brief.
  Acceptance Criteria:
    - Exhibition health cards with score (0-100) and color indicator
    - Compare mode: side-by-side KPI comparison
    - AI Daily Briefing at top
    - Attention items ranked by severity
    - Trend indicators (vs yesterday, vs last week)
  Dependencies: US-011, US-070
  DoD: Health dashboard renders for organizer.

US-081: Per-exhibition analytics page
  Description: Detailed analytics for a single exhibition with pipeline funnel,
  booth engagement chart, industry/topic breakdown.
  Acceptance Criteria:
    - Pipeline funnel: visitors → leads → qualified
    - Booth engagement bar chart (ranked by traffic)
    - Attendee industry breakdown
    - Topics discussed breakdown (from lead intelligence)
    - AI-generated insights for each section
    - Date range selector
  Dependencies: US-080
  DoD: Analytics page renders with real data.

US-082: Lead analytics view
  Description: Organizer-level view of all leads across an exhibition — top booths,
  lead quality distribution, trends.
  Acceptance Criteria:
    - Cross-booth lead volume chart
    - Lead quality distribution (score histogram)
    - Top 10 booths by lead count and by average score
    - Trend: leads over time (hourly, daily)
    - Export to CSV
  Dependencies: US-081, US-070
  DoD: Lead analytics view available to organizers.

US-083: AI report generation — multiple types
  Description: Generate different types of AI reports: executive summary, exhibitor
  performance, attendee insights. Download as PDF.
  Acceptance Criteria:
    - Report type selector before generation
    - Executive summary: narrative overview of all metrics
    - Exhibitor performance: ranking, top/bottom performers
    - Attendee insights: demographics, behavior, interests
    - PDF download with proper formatting
    - Report history with regenerate option
  Dependencies: US-070, US-081
  DoD: Multiple report types work. PDF download produces formatted document.

US-084: Exhibitor booth analytics
  Description: Booth-level analytics for exhibitors — trends, comparisons, benchmarks.
  Acceptance Criteria:
    - Visitor trend: daily/hourly
    - Lead conversion rate over time
    - Resource download counts
    - AI chat volume
    - Comparison to current event averages (benchmark)
  Dependencies: US-080
  DoD: Exhibitor analytics page renders with data.
```

### Beta Sprint 5 (Weeks 19-20): Attendee Experience (Part 2) + Notifications

```
US-090: AI recommendations on attendee dashboard
  Description: Full personalized recommendation engine integration on attendee
  home dashboard with real-time updates.
  Acceptance Criteria:
    - "Recommended for You" section on dashboard
    - "Popular Right Now" section (trending booths)
    - "Based on Your Saved Exhibitors" section (similar companies)
    - Each recommendation card: company logo, name, booth number, reason tag
  Dependencies: US-073 (Recommendation engine)
  DoD: Recommendations appear and update as attendee interacts.

US-091: Post-event attendee summary
  Description: After exhibition closes, attendee sees a summary page with all
  their activity, saved exhibitors, and AI-generated recap.
  Acceptance Criteria:
    - "Your [Exhibition] Recap" page
    - Exhibitors visited (lead submissions)
    - Exhibitors saved
    - Products saved
    - Meetings attended
    - AI-generated narrative summary
    - Export connections as CSV
  Dependencies: US-014 (Close Exhibition), US-042
  DoD: Post-event summary renders for attendee.

US-092: Notification infrastructure
  Description: Database table, API, and frontend components for the notification
  system.
  Acceptance Criteria:
    - Database: notifications table (user_id, type, severity, title, body,
      link, read_at, created_at)
    - API: GET notifications, PATCH mark read, POST mark all read
    - Frontend: notification center page
    - Frontend: notification dropdown in header with count badge
    - Real-time notifications via polling (30s interval)
  Dependencies: None
  DoD: Notification infrastructure functional.

US-093: Real-time notifications for critical events
  Description: Push notifications for critical events: new lead (hot), meeting
  request, meeting confirmed, system alert.
  Acceptance Criteria:
    - New hot lead (score 80+) → notification to exhibitor within 10 seconds
    - Meeting request → notification to target within 30 seconds
    - Meeting confirmed → notification to both parties
    - System alert → notification to all affected users
  Dependencies: US-092
  DoD: Critical event notifications delivered in real-time.

US-094: Notification preferences
  Description: Per-category notification preferences in user settings.
  Acceptance Criteria:
    - Categories: leads, meetings, system, reports, reminders
    - Per-category: push, email, both, none
    - Preferences saved and respected by notification system
    - Default preferences sensible per persona
  Dependencies: US-092
  DoD: Notification preferences configurable and enforced.
```

---

## 2.3 V1 Stories

### V1 Sprint 1 (Weeks 21-22): Meetings

```
US-100: Meetings data model and API
  Description: Database table and CRUD API for meetings.
  Acceptance Criteria:
    - Database: meetings table (id, exhibition_id, booth_presence_id, attendee_user_id,
      status, requested_at, confirmed_at, start_time, end_time, notes, location,
      cancelled_at, cancel_reason)
    - API: POST create request, PATCH accept/decline/reschedule/cancel, GET list
      for exhibitor, GET list for attendee
    - Status lifecycle: requested → confirmed | declined | cancelled
  Dependencies: US-005, US-060
  DoD: Meetings table migrated. API endpoints created and tested.

US-101: Meeting request flow (exhibitor-initiated)
  Description: Exhibitor requests meeting with an attendee from lead detail.
  Acceptance Criteria:
    - "Schedule Meeting" button on lead detail
    - Time slot picker with exhibitor's available hours
    - Duration selector (15, 30, 45, 60 min)
    - Request sent → attendee notified
    - Attendee accepts/declines/reschedules
  Dependencies: US-100
  DoD: Exhibitor-initiated meeting request flow works.

US-102: Meeting request flow (attendee-initiated)
  Description: Attendee requests meeting with an exhibitor from exhibitor profile.
  Acceptance Criteria:
    - "Request Meeting" button on exhibitor profile
    - Same time slot flow as exhibitor-initiated
    - Exhibitor accepts/declines/reschedules
    - Meeting appears in both schedules
  Dependencies: US-100
  DoD: Attendee-initiated meeting request flow works.

US-103: Meeting schedule views
  Description: Meeting list and calendar views for both personas.
  Acceptance Criteria:
    - Exhibitor: "Meetings" tab → list of all meetings with status
    - Attendee: "Meetings" section → list of all meetings
    - Mini calendar view showing meeting days
    - Meeting detail: time, attendees, notes, status, actions
    - Export to .ics (Google Calendar, Outlook)
  Dependencies: US-101, US-102
  DoD: Meeting schedule views render for both personas.

US-104: AI meeting assistant
  Description: AI-generated talking points and prep materials for upcoming meetings.
  Acceptance Criteria:
    - Meeting prep card: attendee/exhibitor name, company, title, lead score
    - AI-generated talking points based on interaction history
    - "Last interaction" summary for context
    - Available from meeting detail page
  Dependencies: US-103, US-070 (AI Intelligence)
  DoD: AI meeting assistant produces useful prep content.
```

### V1 Sprint 2 (Weeks 23-24): Floor Plan + Attendee Navigation

```
US-110: Floor plan multi-hall support
  Description: Support multiple halls per exhibition in the floor plan canvas.
  Acceptance Criteria:
    - Hall tabs/switcher in floor plan view
    - Each hall configured independently
    - Booth numbering sequential but per-hall
    - Hall legend shows all booths across halls
  Dependencies: US-061
  DoD: Multi-hall floor plan renders and functions.

US-111: Attendee floor map view
  Description: Attendee-facing floor map with saved exhibitors highlighted,
  searchable, with "Find My Next" route.
  Acceptance Criteria:
    - Floor map tab in attendee navigation
    - Current hall displayed with booth grid
    - Saved exhibitors highlighted with star marker
    - Search by booth number or company name
    - Tap booth → popover with company name, "Navigate" button
    - "Find My Next" button → highlights nearest saved unvisited exhibitor
  Dependencies: US-061, US-042
  DoD: Attendee floor map renders and is usable on mobile.

US-112: Plan visit — saved exhibitors + route optimization
  Description: Pre-event planning flow where attendee saves exhibitors and gets
  an optimized visit route.
  Acceptance Criteria:
    - "Plan Your Visit" section on dashboard
    - Saved exhibitors displayed on floor map
    - "Optimize Route" button → shortest path connecting all saved exhibitors
    - Route displayed as numbered path on floor map
    - Estimated time for full route
  Dependencies: US-111
  DoD: Route optimization produces sensible paths.
```

### V1 Sprint 3 (Weeks 25-26): CRM Export + Polish

```
US-120: Lead export to CSV/Excel
  Description: Export leads in CSV or Excel format with all AI fields.
  Acceptance Criteria:
    - "Export" button on Leads tab
    - Select: current filter, all, or selected leads
    - Format: CSV or XLSX
    - Columns: name, email, company, title, phone, score, buying intent, summary,
      topics, form responses, booth name, exhibition, capture date
    - Large export (> 10,000 rows) background job with notification
  Dependencies: US-051 (Qualify Leads)
  DoD: Lead export produces correct files.

US-121: Frontend performance optimization
  Description: Optimize frontend performance — code splitting, lazy loading,
  image optimization, bundle size reduction.
  Acceptance Criteria:
    - Initial page load < 2 seconds (Lighthouse)
    - Subsequent navigations < 500ms
    - Bundle size < 200KB initial JS
    - All images lazy-loaded
    - Route-level code splitting
  Dependencies: All prior sprints
  DoD: Lighthouse performance score > 85 on all pages.

US-122: Keyboard shortcut system
  Description: Comprehensive keyboard shortcut system with discoverability.
  Acceptance Criteria:
    - ⌘K: Command palette
    - ⌘N: New (context-aware)
    - ⌘E: Focus search
    - ⌘S: Save form
    - ⌘/: Show all shortcuts
    - Esc: Close dialog/drawer
    - Shortcuts contextual (different per page)
  Dependencies: US-005 (Navigation)
  DoD: Keyboard shortcuts work across all pages.
```

---

## 2.4 V2 Stories

V2 stories are not detailed with acceptance criteria at this time. They are defined at the epic level only (see Epics E12, E13, E14).

---

# 3. Release Plan

## 3.1 Release Alpha (Weeks 1-10)

**Goal:** Replace the current implementation with the new architecture. Core workflows work. MVP functional.

| Sprint | Epics | Stories | Deliverable |
|---|---|---|---|
| 1 | E01 Foundation Cleanup | US-001 to US-005 | Clean codebase, consolidated navigation |
| 2 | E02 Exhibition Core | US-010 to US-015 | Exhibition CRUD, publish, close |
| 3 | E04 Lead Capture | US-020 to US-024 | QR codes, forms, submissions, AI enrichment |
| 4 | E05 Booth Workspace | US-030 to US-035 | Booth profile, assets, forms, team |
| 5 | E06 Attendee (Part 1) | US-040 to US-044 | Public page, registration, dashboard |

**Alpha exit criteria (Demo-able product):**
- Organizer: create, publish, close exhibition; invite exhibitors; see reports
- Exhibitor: accept invite, build booth, upload assets, capture leads, qualify leads
- Attendee: register, browse exhibitors, scan QR, submit lead form, AI chat at booth
- AI: lead intelligence active on all submissions, report generation works
- 13 MVP workflows functional
- Legacy code removed, navigation consolidated

## 3.2 Release Beta (Weeks 11-20)

**Goal:** Complete remaining MVP features. Add major V1 features.

| Sprint | Epics | Stories | Deliverable |
|---|---|---|---|
| 6 | E11 Exhibitor Pipeline | US-050 to US-052 | Bulk invite, pipeline dashboard, reminders |
| 7 | E03 Floor Plan Canvas | US-060 to US-063 | Interactive floor plan, drag-and-drop |
| 8 | E07 AI Intelligence (Part 1) | US-070 to US-073 | Production AI pipeline, guardrails, briefings |
| 9 | E08 Reports & Analytics | US-080 to US-084 | Health dashboard, analytics, multi-type reports |
| 10 | E06 Attendee (Part 2) + E10 Notifications | US-090 to US-094 | AI recommendations, post-event summary, notifications |

**Beta exit criteria (Launch-ready):**
- All MVP workflows production-quality
- Floor plan functional
- AI pipeline production-grade
- Notifications active
- Analytics dashboards comprehensive
- Attendee experience complete with recommendations

## 3.3 Release V1 (Weeks 21-26)

**Goal:** Major V1 features — meetings, attendee navigation, CRM export.

| Sprint | Epics | Stories | Deliverable |
|---|---|---|---|
| 11 | E09 Meetings | US-100 to US-104 | Meetings CRUD, request flow, schedule views |
| 12 | E03 Floor Plan (attendee) | US-110 to US-112 | Multi-hall, attendee floor map, route optimization |
| 13 | E08 Polish + CRM | US-120 to US-122 | Lead export, perf optimization, keyboard shortcuts |

**V1 exit criteria:**
- Meetings functional across all personas
- Attendee floor map with route optimization
- Lead export to CSV/Excel
- Keyboard shortcuts
- Performance targets met

## 3.4 Release V2 (Post-V1)

**Goal:** Post-event workflows, admin platform, enterprise features.

| Sprint | Epics | Stories | Deliverable |
|---|---|---|---|
| 14 | E12 Post-Event | TBD | Follow-up generation, ROI dashboard |
| 15 | E13 Admin Platform | TBD | Admin dashboard, org/user management |
| 16 | E14 Enterprise Features | TBD | CRM integration, advanced analytics |

---

# 4. Technical Backlog

## 4.1 Technical Debt to Address

| ID | Item | Epic | Sprint | Effort |
|---|---|---|---|---|
| TD-01 | Remove `/organizer/*` route group | E01 | Alpha S1 | M |
| TD-02 | Remove duplicate breadcrumb component | E01 | Alpha S1 | S |
| TD-03 | Remove placeholder "coming soon" pages | E01 | Alpha S1 | S |
| TD-04 | Fix GlobalNav perspective link logic | E01 | Alpha S1 | M |
| TD-05 | Replace OrganizerNavigation with WorkspaceNav | E01 | Alpha S1 | M |
| TD-06 | Align demo route patterns with live routes | E01 | Alpha S1 | S |

## 4.2 Legacy Code to Remove

| File/Path | Reason | Sprint |
|---|---|---|
| `src/app/organizer/` (entire directory) | Replaced by `(console)/org/` | Alpha S1 |
| `src/app/organizer/organizer-navigation.tsx` | Replaced by `WorkspaceNav` | Alpha S1 |
| `src/app/organizer/organizer-navigation.test.ts` | Replaced component | Alpha S1 |
| `src/app/organizer/events/[eventId]/event-navigation.tsx` | Replaced by `PageTabs` | Alpha S1 |
| `src/components/navigation/breadcrumbs.tsx` | Duplicate of `unified-breadcrumbs.tsx` | Alpha S1 |
| `src/app/hackathon/` | Merged into `(attendee)/e/[slug]` | Alpha S5 |
| `src/app/showcase/` | Replaced by `/hackathon/expo` | Alpha S5 |
| All placeholder "coming soon" pages | Misleading — remove until implemented | Alpha S1 |

## 4.3 Routes to Merge

| Merge | Target | Sprint |
|---|---|---|
| `/organizer/*` → `/org/*` | `/org/*` | Alpha S1 |
| `/hackathon` → `/e/[slug]` | `/e/[slug]` | Alpha S5 |
| `/showcase` → `/hackathon/expo` | `/hackathon/expo` | Alpha S5 |
| `/demo/organizer/event/[slug]` → `/demo/organizer/events/[id]` | `/demo/organizer/events/[id]` | Alpha S1 |

## 4.4 Components to Consolidate

| Components | Target | Sprint |
|---|---|---|
| `Breadcrumbs` + `UnifiedBreadcrumbs` → `UnifiedBreadcrumbs` | Single component | Alpha S1 |
| `MetricCard` + `KPICard` + inline card patterns → single `MetricCard` | Design system component | Alpha S2 |
| `OrganizerNavigation` + `WorkspaceNav` → `WorkspaceNav` | Single nav component | Alpha S1 |

## 4.5 Database Migrations Required

| ID | Migration | Epic | Sprint | Tables |
|---|---|---|---|---|
| DM-01 | Add Meetings table | E09 | V1 S1 | meetings |
| DM-02 | Add Notifications table | E10 | Beta S5 | notifications |
| DM-03 | Add Halls table | E03 | Beta S2 | halls |
| DM-04 | Add Booths table | E03 | Beta S2 | booths |
| DM-05 | Add Products table | V2 | Future | products |
| DM-06 | Add Campaigns table | V2 | Future | campaigns |
| DM-07 | Add Tasks table | V2 | Future | tasks |
| DM-08 | Add Files DB constraints | E01 | Alpha S1 | Add FK from files.owner_id |
| DM-09 | Add Entitlements FK | E13 | V2 | Add FK from entitlements.org_id |

## 4.6 API Work Required

| ID | API Work | Epic | Sprint |
|---|---|---|---|
| API-01 | Exhibition CRUD endpoints (enhance) | E02 | Alpha S2 |
| API-02 | Floor plan endpoints (halls + booths) | E03 | Beta S2 |
| API-03 | Meeting endpoints (CRUD + status) | E09 | V1 S1 |
| API-04 | Notification endpoints | E10 | Beta S5 |
| API-05 | Bulk exhibitor invite endpoint | E11 | Beta S1 |
| API-06 | Lead export endpoint (CSV generation) | E08 | V1 S3 |
| API-07 | Attendance analytics endpoint (enhance) | E08 | Beta S4 |
| API-08 | Products CRUD endpoints | V2 | Future |

## 4.7 Frontend Work Required

| ID | Frontend Work | Epic | Sprint |
|---|---|---|---|
| FE-01 | Navigation consolidation | E01 | Alpha S1 |
| FE-02 | Exhibition create/edit pages | E02 | Alpha S2 |
| FE-03 | Floor plan canvas (React + canvas) | E03 | Beta S2 |
| FE-04 | Booth workspace forms | E05 | Alpha S4 |
| FE-05 | Attendee registration flow | E06 | Alpha S5 |
| FE-06 | AI recommendation components | E07 | Beta S3 |
| FE-07 | Analytics dashboard components | E08 | Beta S4 |
| FE-08 | Meeting UI (scheduler, calendar, request) | E09 | V1 S1 |
| FE-09 | Notification center components | E10 | Beta S5 |
| FE-10 | Admin dashboard components | E13 | V2 |

## 4.8 AI Work Required

| ID | AI Work | Epic | Sprint |
|---|---|---|---|
| AI-01 | Lead intelligence productionization | E07 | Beta S3 |
| AI-02 | AI guardrail implementation | E07 | Beta S3 |
| AI-03 | Daily Briefing generation | E07 | Beta S3 |
| AI-04 | Recommendation engine | E07 | Beta S3 |
| AI-05 | Multi-type report generation | E08 | Beta S4 |
| AI-06 | Follow-up email generation | E12 | V2 |
| AI-07 | Meeting talking points generation | E09 | V1 S1 |
| AI-08 | Post-event attendee summary | E06 | Beta S5 |

## 4.9 Testing Requirements

| ID | Test Requirement | Coverage | Sprint |
|---|---|---|---|
| T-01 | Lead capture end-to-end test | All lead workflows | Alpha S3 |
| T-02 | Exhibition lifecycle test | Create → publish → live → close | Alpha S2 |
| T-03 | Booth experience flow test | QR → form → submission → enrichment | Alpha S3 |
| T-04 | Floor plan rendering test | Canvas render, drag-drop, assignment | Beta S2 |
| T-05 | Meeting booking flow test | Request → accept → reschedule → cancel | V1 S1 |
| T-06 | Notification delivery test | All notification types | Beta S5 |
| T-07 | AI enrichment pipeline test | Score accuracy, latency, error handling | Beta S3 |
| T-08 | Registration flow test | Sign-up → profile → consent → dashboard | Alpha S5 |
| T-09 | Navigation regression test | All routes, all nav states | Alpha S1 |
| T-10 | Performance benchmark test | Load time, bundle size, API latency | V1 S3 |

---

# 5. Implementation Order

## 5.1 The Order (Optimized for Minimal Rework)

```
Phase 1: CLEAN (Weeks 1-2)
  └── Foundation Cleanup (E01)
      Why first: Removing legacy code prevents building on broken foundations.
      Every new feature would need to be built twice if we don't clean first.

Phase 2: BUILD CORE (Weeks 3-6)
  ├── Exhibition Core (E02)
  └── Lead Capture Engine (E04)
      Why parallel: These are independent. Exhibition core is organizer-facing,
      lead capture is exhibitor/attendee-facing. They have no code dependencies.

Phase 3: ENABLE EXHIBITORS (Weeks 7-8)
  └── Booth Workspace (E05)
      Why now: Exhibitors need the core to exist (they need an exhibition),
      and they need lead capture to work. Both are ready by now.

Phase 4: ENABLE ATTENDEES (Weeks 9-10)
  └── Attendee Experience Part 1 (E06)
      Why now: Attendees need exhibitions to exist and booths to be published.

Phase 5: EXPAND PIPELINE (Weeks 11-12)
  └── Exhibitor Pipeline (E11)
      Why now: Organizers need to see the full exhibitor workflow. Builds on
      the booth workspace that now exists.

Phase 6: VISUALIZE SPACE (Weeks 13-14)
  └── Floor Plan Canvas (E03)
      Why now: Floor plan is V1. But we should start it as soon as possible
      because it has the longest dev time.

Phase 7: INTELLIGENCE (Weeks 15-16)
  └── AI Intelligence Part 1 (E07)
      Why now: AI is the differentiator. But it depends on lead data, which
      is flowing by now.

Phase 8: ANALYTICS (Weeks 17-18)
  └── Reports & Analytics (E08)
      Why now: Analytics need data from leads and exhibitions. Both exist now.

Phase 9: COMPLETE ATTENDEE + NOTIFY (Weeks 19-20)
  ├── Attendee Experience Part 2 (E06)
  └── Notification System (E10)
      Why now: Attendee features need AI recommendations (ready). Notifications
      depend on everything else existing.

Phase 10: CONNECT (Weeks 21-22)
  └── Meetings (E09)
      Why now: Meetings need both exhibitor workspace and attendee experience.
      Both are mature.

Phase 11: OPTIMIZE (Weeks 23-24)
  └── Floor Plan Attendee Features (E03 continuation)
  └── CRM Export (E08 continuation)

Phase 12: POLISH (Weeks 25-26)
  └── Performance optimization
  └── Keyboard shortcuts
  └── Testing and bug fixes

Phase 13: EXTEND (Post-V1)
  ├── Post-Event Workflows (E12)
  ├── Admin Platform (E13)
  └── Enterprise Features (E14)
```

## 5.2 Quick Reference: What to Build When

| Week | Build | Don't Build Yet |
|---|---|---|
| 1-2 | Clean up legacy code, navigation, routes | Any new features |
| 3-4 | Exhibition CRUD, publish workflow | Floor plan, meetings |
| 5-6 | QR codes, lead forms, submissions | Exhibitor workspace (start Sprint 7) |
| 7-8 | Booth profile, assets, team | Floor plan (start Sprint 13) |
| 9-10 | Public page, registration, dashboard | Recommendations (start Sprint 15) |
| 11-12 | Bulk invite, pipeline dashboard | Meetings |
| 13-14 | Floor plan canvas, drag-drop | Attendee floor map (start Sprint 19) |
| 15-16 | AI pipeline, guardrails, daily briefing | Multi-type reports |
| 17-18 | Cross-event health, per-event analytics | CRM export |
| 19-20 | Recommendations UI, post-event summary, notifications | Follow-up generation |
| 21-22 | Meetings CRUD, booking flows | ROI dashboard |
| 23-24 | Attendee floor map, route optimization | Admin platform |
| 25-26 | Lead export, perf optimization, keyboard shortcuts | Enterprise features |

---

*End of Implementation Backlog*

*Engineering must implement in the order specified in Section 5.
Do not skip sprints. Do not add stories that are not documented here.
If scope must change, escalate to Product Architecture.*
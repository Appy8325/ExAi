# ExAi Product Workflows

> **Version:** V1
> **Date:** July 24, 2026
> **Owner:** Product Architecture
>
> This document defines every workflow in ExAi.
>
> Engineering must implement exactly what is described here.
>
> Product and Design must use this as the single source of truth for UX decisions.
>
> If a workflow is not here, it does not exist yet. Do not build it.
> If a workflow contradicts existing code, this document wins. Delete the old code.

---

**Table of Contents**

1. [Workflow Convention](#1-workflow-convention)
2. [Organizer Workflows](#2-organizer-workflows)
3. [Exhibitor Workflows](#3-exhibitor-workflows)
4. [Attendee Workflows](#4-attendee-workflows)
5. [Admin Workflows](#5-admin-workflows)
6. [Workflow Dependency Graph](#6-workflow-dependency-graph)
7. [MVP Workflow Set](#7-mvp-workflow-set)
8. [V1 Workflow Set](#8-v1-workflow-set)
9. [V2 Workflow Set](#9-v2-workflow-set)

---

# 1. Workflow Convention

Every workflow in this document follows this structure:

```
WORKFLOW: [Name]
  Persona:     [Organizer | Exhibitor | Attendee | Admin]
  Trigger:     What starts this workflow
  Goal:        The user's desired outcome
  Steps:       Ordered list of user actions (numbered)
  Success:     How the user knows the workflow is complete
  Failures:    Things that can go wrong (lettered)
  Recovery:    How the user recovers from each failure
  AI:          Where AI reduces friction
  Notif:       Notifications generated during this workflow
  Perms:       Who can execute this workflow
  Status:      [MVP | V1 | V2 | Future]
  Current:     How it works today (if implemented)
  Missing:     What's missing from the current implementation
  Depends:     Workflows that must exist first
```

---

# 2. Organizer Workflows

## 2.1 Create an Exhibition

```
WORKFLOW: Create an Exhibition
  Persona:     Organizer
  Trigger:     Organizer clicks "New Exhibition" on dashboard or in command palette
  Goal:        Set up a new exhibition so exhibitors can be invited and attendees can register

  Steps:
    1.  Click "New Exhibition" button
    2.  Dialog opens with form fields: name, slug (auto-generated from name), timezone,
        start date, end date
    3.  Optional: venue name, city, description, logo, brand color
    4.  Click "Create Exhibition"
    5.  System creates draft exhibition → success toast: "Exhibition created"
    6.  Redirect to exhibition detail page (Overview tab)
    7.  Exhibition appears in dashboard and events list with "draft" status

  Success:     Exhibition exists in draft state. User is on the Exhibition Overview page
               with next recommended actions visible.

  Failures:
    A. Name is empty → inline validation: "Exhibition name is required"
    B. End date before start date → inline validation: "End date must be after start date"
    C. Slug collision → auto-suggest unique slug: "exhibition-name-2"
    D. Network error → toast: "Could not create exhibition. Try again."
    E. Duplicate name in same organization → warning: "You already have an exhibition with
       this name"

  Recovery:
    A-D: Fix error, retry
    E: User confirms they want a duplicate name or changes it

  AI:
    - Auto-generate slug from name (already exists)
    - Suggest timezone based on IP/account location
    - Suggest dates based on previous exhibitions
    - Recommend venue capacity based on exhibition history

  Notif:       None (success is implicit in the redirect + toast)

  Perms:       org:owner, org:admin

  Status:      MVP — mostly implemented (org/events)

  Current:     Works via CreateEventForm in console. Dialog-based. Missing some fields
               (venue, description, logo). Redirects to event settings, not overview.

  Missing:     - Exhibition Overview page doesn't exist as designed in spec
               - Venue, description, logo fields not in create dialog
               - Optional "Create from template" (copy existing exhibition)
               - AI date/venue suggestions

  Depends:     None (first workflow in the system)
```

## 2.2 Configure Venue & Floor Plan

```
WORKFLOW: Configure Venue & Floor Plan
  Persona:     Organizer
  Trigger:     Exhibition is created. Organizer clicks "Configure Floor Plan" from
               Exhibition Overview or navigates to Floor Plan tab.
  Goal:        Define the physical or virtual space so booths can be assigned to exhibitors

  Steps:
    1.  From Exhibition Overview, click "Configure Floor Plan" (or navigate to Floor Plan tab)
    2.  Floor Plan canvas opens — empty grid or template selection
    3.  Choose hall configuration:
        a. Add hall → name, dimensions (rows × columns), grid spacing
        b. Or select from template (same layout as last year's exhibition)
    4.  System generates booth grid with numbered booths
    5.  Configure booth types/sizes:
        a. Define size categories (Standard: 3×3m, Premium: 6×3m, Corner: 3×3m corner)
        b. Assign pricing per category
        c. Mark some booths as "premium" with highlighted border
    6.  Optional: Add landmarks (entrances, restrooms, food court, stages, info desks)
    7.  Save floor plan
    8.  Return to Exhibition Overview

  Success:     Floor plan configured with hall(s), booth grid, and pricing. Booths
               are now available to assign to exhibitors.

  Failures:
    A. Invalid dimensions → inline validation (min 2×2, max 50×50)
    B. Grid too large for performance → warning at 1000+ booths
    C. Pricing not set → warning: "Some booths have no price assigned"
    D. Template not found (if cloning) → fall back to empty grid

  Recovery:
    A-B: Adjust dimensions
    C: Set pricing before inviting exhibitors (blocked at publish)

  AI:
    - Suggest hall dimensions based on expected exhibitor count
    - Recommend booth mix (how many Standard vs Premium) based on past data
    - Auto-number booths in logical sequence (snake pattern)
    - Suggest pricing based on similar exhibitions

  Notif:       None

  Perms:       org:owner, org:admin

  Status:      V1 — not yet implemented

  Current:     Not implemented. Floor plan is stubbed as "Milestone 4" in the codebase.

  Missing:     Everything — this is a net-new feature.

  Depends:     Create an Exhibition
```

## 2.3 Invite Exhibitors

```
WORKFLOW: Invite Exhibitors
  Persona:     Organizer
  Trigger:     Exhibition exists and floor plan is at least minimally configured.
               Organizer clicks "Invite Exhibitors" from dashboard, exhibition overview,
               or Exhibitors tab.
  Goal:        Send invitations to companies to exhibit at the exhibition

  Steps:
    1.  Click "Invite Exhibitors" button
    2.  Dialog with options:
        a. "Invite by email" — enter company name + contact email (single or bulk CSV upload)
        b. "Select from past exhibitors" — choose from previous exhibitions
        c. "Create exhibitor organization" — for walk-ins/direct bookings
    3.  Set booth preferences per invitation (optional):
        a. Preferred booth size category
        b. Preferred hall/area
        c. Auto-assign booth (system picks best available)
    4.  Click "Send Invitations"
    5.  System creates:
        - Organization with kind=exhibitor (if new)
        - Booth Presence with status=invited
        - Invitation token (auth_tokens with kind=invite)
        - Email sent to contact email with invitation link
    6.  Invited exhibitors appear in Exhibitors tab with "Invited" status
    7.  Update dashboard metrics (pending invitations +1)

  Success:     Invitations sent. Exhibitors visible in list with "Invited" status.
               Dashboard shows pending count.

  Failures:
    A. Invalid email → skip with error report in bulk mode
    B. Company already invited to this exhibition → warning: "Already invited"
    C. Company already confirmed for this exhibition → error: "Already confirmed"
    D. Email delivery failure → system retries (up to 3 attempts)
    E. Duplicate in CSV → skip with warning in results summary

  Recovery:
    A: Fix email and re-invite individually
    B-E: Accept the state, no action needed

  AI:
    - Suggest exhibitors from past events with similar industry focus
    - Recommend booth size based on company size and past behavior
    - Auto-fill company info from past exhibitions
    - Group similar companies in same hall (clustering)

  Notif:       None to organizer (success is implicit). Email sent to invited company.

  Perms:       org:owner, org:admin

  Status:      V1 — partially implemented

  Current:     Single invite by email exists in console (org/events/[id]/exhibitors).
               Bulk CSV import not implemented. Past exhibitors not implemented.
               Booth assignment during invite not implemented.

  Missing:     - Bulk CSV import
               - Select from past exhibitors
               - Booth preference during invite
               - Auto-assign booth option
               - Invitation status tracking dashboard

  Depends:     Create an Exhibition, Configure Venue & Floor Plan
```

## 2.4 Sell Booths / Manage Booth Bookings

```
WORKFLOW: Sell Booths / Manage Booth Bookings
  Persona:     Organizer
  Trigger:     Floor plan is configured with available booths. Organizer wants to
               assign or sell booths to exhibitors.
  Goal:        Assign each exhibitor to a specific booth, track payment, and manage
               booth inventory

  Steps:
    1.  Open Floor Plan tab
    2.  View all booths with color-coded status:
        - Green: Available
        - Yellow: Reserved (intent but not paid)
        - Blue: Assigned to exhibitor (confirmed)
        - Gray: Not for sale (entrance, stage, etc.)
    3.  Click an available booth → popover with actions
    4.  Actions:
        a. "Assign Exhibitor" — search/select from invited exhibitors → assign
        b. "Reserve" — mark as reserved (hold for specific company without full assignment)
        c. "Make unavailable" — mark as not for sale
    5.  When assigning:
        a. Select exhibitor from dropdown
        b. System creates/updates Booth Presence with booth assignment
        c. Booth turns blue on floor plan
    6.  Track payment status (optional, depends on pricing feature):
        a. Mark as "Paid", "Pending", "Invoiced"
        b. Update dashboard revenue metric
    7.  Floor plan auto-saves all changes

  Success:     All booths assigned (or intentionally left available). Floor plan
               shows clear assignment of every booth.

  Failures:
    A. Booth already assigned → warning: "This booth is assigned to [Company Name]"
    B. Exhibitor already assigned a different booth → warning: "This exhibitor already
       has booth [number]. Move them?"
    C. Selected exhibitor not found → search again with different criteria

  Recovery:
    A: Choose different booth or reassign the current occupant
    B: Confirm move or assign to another booth
    C: Retry search

  AI:
    - Suggest optimal booth placement for each exhibitor (similar companies clustered,
      anchor tenants near entrances)
    - Predict which booths will sell first (premium positions near entrances/food)
    - Flag potential conflicts (competitive companies placed next to each other)
    - Auto-assign all remaining exhibitors to best available booths

  Notif:       When booth assigned → email to exhibitor: "You've been assigned Booth [X]"
               When payment confirmed → internal notification to organizer

  Perms:       org:owner, org:admin

  Status:      V2 — not yet implemented (floor plan must exist first)

  Current:     Not implemented. Booth assignment is done through exhibitor management.

  Missing:     Everything — depends on floor plan feature.

  Depends:     Configure Venue & Floor Plan, Invite Exhibitors
```

## 2.5 Review Exhibitor Submissions

```
WORKFLOW: Review Exhibitor Submissions
  Persona:     Organizer
  Trigger:     An exhibitor completes their booth profile, publishes it, or submits
               materials for review. Also triggered periodically to check the pipeline.
  Goal:        Ensure all exhibitors are ready before the exhibition opens

  Steps:
    1.  View Exhibitors tab for the exhibition
    2.  See list of all exhibitors with status badges:
        - Invited (not yet responded)
        - Accepted (responded, not yet started setup)
        - In Progress (has started but not complete)
        - Ready (profile complete, published)
        - Withdrawn (cancelled)
    3.  Filter by status, search by name
    4.  Click an exhibitor → detail view showing:
        - Booth profile completeness (checklist: logo, description, products, assets)
        - Lead form status
        - Knowledge sources
        - Team members
    5.  Approve / request changes / message the exhibitor
    6.  Track completion rate on dashboard

  Success:     All exhibitors are in "Ready" status before exhibition goes live.

  Failures:
    A. Exhibitor has critical fields missing → flagged as "needs attention"
    B. Exhibitor withdrawn → booth becomes available, notify organizer

  Recovery:
    A: Message exhibitor with specific guidance on what's missing
    B: Reassign booth or mark as available

  AI:
    - Auto-grade booth profile completeness (score out of 100)
    - Flag common missing items across all exhibitors
    - Suggest bulk messaging to all exhibitors missing the same thing
    - Predict which exhibitors are at risk of not being ready on time

  Notif:       When exhibitor completes profile → "Exhibitor [Name] is ready!"
               When exhibitor is incomplete with <7 days to event → daily reminder
               When exhibitor withdraws → alert: "Booth [X] is now available"

  Perms:       org:owner, org:admin

  Status:      V1 — partially implemented

  Current:     Exhibitor list with status exists. No completeness checklist.
               No bulk messaging. No readiness scoring.

  Missing:     - Completeness checklist per exhibitor
               - Bulk messaging
               - Readiness scoring
               - Risk prediction
               - Automated reminders

  Depends:     Invite Exhibitors, Create an Exhibition
```

## 2.6 Publish Exhibition

```
WORKFLOW: Publish Exhibition
  Persona:     Organizer
  Trigger:     Exhibition is configured, floor plan is ready, exhibitors are invited,
               and organizer decides it's time to open for attendee registration.
  Goal:        Make the exhibition public so attendees can see it, register, and browse
               exhibitors

  Steps:
    1.  From Exhibition Settings or Overview, click "Publish Exhibition"
    2.  System checks prerequisites:
        a. Exhibition has a name and dates (required)
        b. Floor plan has at least one hall configured (recommended but not required)
        c. At least one exhibitor confirmed (recommended)
    3.  If prerequisites not met:
        a. Missing required → warning: "Complete these before publishing: [list]"
        b. Missing recommended → confirmation: "You haven't set up [X]. Publish anyway?"
    4.  Click "Publish" (or "Publish Anyway")
    5.  System changes status from "draft" to "published"
    6.  Public page becomes available at /e/[slug]
    7.  Attendee registration opens (if registration feature is enabled)
    8.  Email notification to all invited exhibitors: "[Exhibition] is now open!"
    9.  Dashboard shows new status

  Success:     Exhibition is published. Public page is live. Exhibitors are notified.
               Attendees can begin registering.

  Failures:
    A. No exhibitors invited → warning (can publish, but empty)
    B. No floor plan → warning (can publish, public page shows no map)
    C. Exhibition date is in the past → error: "Cannot publish past events"
    D. Network error → toast: "Publish failed. Try again."

  Recovery:
    A-B: Publish anyway (gates are warnings, not blockers)
    C: Fix the dates
    D: Retry

  AI:
    - Suggest optimal publish date (e.g., "Publishing 3 months before gives optimal
      registration window")
    - Pre-publish checklist with AI-prioritized recommendations
    - Generate AI preview of the public page

  Notif:       All invited exhibitors → "[Exhibition] is open — complete your booth setup"

  Perms:       org:owner, org:admin

  Status:      MVP — exists but minimal

  Current:     Publish button exists in console (PublishEventButton). Prerequisite
               checking is minimal. No notification to exhibitors.

  Missing:     - Prerequisite checklist with severity levels
               - Exhibition preview before publishing
               - Automated exhibitor notification on publish
               - "Schedule publish" for future date

  Depends:     Create an Exhibition
```

## 2.7 Monitor Exhibition Health

```
WORKFLOW: Monitor Exhibition Health
  Persona:     Organizer
  Trigger:     Daily login or periodic check during active exhibitions. Also triggered
               by alert notifications.
  Goal:        Understand the health of all active exhibitions at a glance and identify
               issues requiring attention

  Steps:
    1.  Open Dashboard (home page of organizer workspace)
    2.  View AI Daily Briefing: auto-generated summary of all active exhibitions
    3.  Scan Exhibition Health cards:
        a. Each active exhibition shown as a card
        b. Health score (0-100) with color indicator
        c. Key metrics: registrations (vs target), exhibitors confirmed, leads generated
        d. Trend arrows (up/down from yesterday)
    4.  Review Attention Items:
        a. Alerts requiring action (low registration pace, pending exhibitors, issues)
        b. Each alert has severity (critical, warning, info)
        c. Each alert links directly to the relevant screen
    5.  Click on any exhibition → Exhibition Overview with detail
    6.  Drill into any section (Exhibitors, Attendees, Leads, Analytics)

  Success:     Organizer has a clear picture of all exhibitions' health and knows what
               needs attention. No critical alerts are missed.

  Failures:
    A. Health score data not yet computed (new exhibition with no data) → show neutral
       state: "Not enough data yet"
    B. Analytics API failure → show cached data with freshness indicator

  Recovery:
    A: Default to neutral state
    B: Retry on next page load, show stale data if available

  AI:
    - Generate Daily Briefing (auto-summary of what happened since last visit)
    - Compute Exhibition Health Score (composite of key metrics)
    - Detect anomalies (registration drop, engagement decline, etc.)
    - Predict which exhibitions need attention
    - Rank attention items by urgency

  Notif:       Daily Briefing pushed to notification center each morning
               Critical alerts pushed in real-time (registration crash, mass withdrawal)
               Warning alerts batched and delivered hourly

  Perms:       org:owner, org:admin, org:member

  Status:      V1 — partially implemented

  Current:     Basic KPI cards exist. No health score. No AI briefing.
               Attention items exist in console dashboard but are simple.

  Missing:     - Exhibition Health Score
               - AI Daily Briefing
               - Anomaly detection
               - Notification-driven monitoring
               - Drill-down from alert to action screen

  Depends:     Create an Exhibition, Publish Exhibition
```

## 2.8 Manage Attendee Growth

```
WORKFLOW: Manage Attendee Growth
  Persona:     Organizer
  Trigger:     Exhibition is published. Organizer checks registration progress on
               dashboard and takes action to drive registrations.
  Goal:        Maximize attendee registrations to hit target

  Steps:
    1.  View Attendees section for the exhibition
    2.  Review metrics:
        a. Total registrations vs target
        b. Registration trend (daily, weekly)
        c. Registration sources (direct, referral, campaign)
        d. Industry breakdown of registered attendees
    3.  If registrations are behind target:
        a. Create campaign: "Promote Exhibition" dialog
           i.   Choose channel (email blast, social media, discount code)
           ii.  Set target audience (industry segments, past attendees)
           iii. AI generates suggested copy and audience
        b. Launch campaign
    4.  Monitor campaign performance (opens, clicks, conversions)
    5.  Analyze registration data → adjust strategy
    6.  Export attendee list (CSV) for operational planning

  Success:     Registration target is met or exceeded. Organizer has visibility into
               attendee composition.

  Failures:
    A. No registrations → urgent alert (exhibition health critical)
    B. Registrations below target → warning with recommendations
    C. Campaign underperforming → AI suggests optimization

  Recovery:
    A: Immediately kick off promotional campaign, check event page visibility
    B-C: Adjust campaign targeting, copy, or channels

  AI:
    - Predict final registration count based on current trend
    - Suggest optimal campaign targeting (which industries to focus on)
    - Generate campaign copy and subject lines
    - Recommend discount codes or incentives based on past behavior
    - Identify registration bottlenecks in the funnel

  Notif:       Daily registration report
               Milestone alerts (25%, 50%, 75%, 100% of target)
               Campaign performance summary

  Perms:       org:owner, org:admin

  Status:      V2 — not yet implemented

  Current:     Basic registration count in overview. No campaign tools.
               No attendee segmentation. No promotion features.

  Missing:     Everything — this is a net-new feature set (campaigns, promotions,
               segmentation, referral tracking)

  Depends:     Publish Exhibition
```

## 2.9 Handle Operational Issues

```
WORKFLOW: Handle Operational Issues
  Persona:     Organizer
  Trigger:     An issue occurs during the exhibition (exhibitor no-show, technical
               problem, attendee complaint). Also triggered by system alerts.
  Goal:        Resolve operational issues quickly to minimize disruption

  Steps:
    1.  Issue detected (manual report or system alert)
    2.  Dashboard shows alert in Attention Items:
        a. "Exhibitor [Name] hasn't checked in" (during event)
        b. "Booth [X] WiFi is down" (technical)
        c. "Lead form not loading on booth [Y]" (system)
        d. "Extreme queue at entrance" (capacity)
    3.  Click alert → detail view with:
        a. Issue description
        b. Affected entity (booth, hall, exhibitor)
        c. Suggested actions (system-generated)
        d. Contact information for relevant parties
    4.  Take action:
        a. Message exhibitor directly
        b. Flag for venue staff
        c. Escalate to platform support
        d. Acknowledge and dismiss
    5.  Issue resolved → mark as resolved with notes
    6.  Issue logged in audit trail

  Success:     Issue resolved quickly. Disruption minimized. Issue logged for
               post-event review.

  Failures:
    A. Cannot resolve → escalate to next level (exhibitor → venue → support → admin)
    B. Issue is beyond platform scope → document and advise

  Recovery:
    A: Follow escalation path
    B: Provide documentation for external resolution

  AI:
    - Automatically detect anomalies (booth with zero scans for 2+ hours, etc.)
    - Suggest resolution steps based on similar past issues
    - Prioritize issues by impact (more attendees affected = higher priority)
    - Auto-route issues to the right support tier

  Notif:       Critical issues → push notification to all organizer staff
               Warning issues → notification center
               Issue resolved → notification to reporter

  Perms:       org:owner, org:admin

  Status:      V1 — not yet implemented

  Current:     Not implemented. No notification system, no alert infrastructure.

  Missing:     Everything — this is a net-new feature.

  Depends:     Monitor Exhibition Health, Invite Exhibitors
```

## 2.10 Close Exhibition

```
WORKFLOW: Close Exhibition
  Persona:     Organizer
  Trigger:     Exhibition end date has passed. Organizer decides to close it.
  Goal:        Transition exhibition from "live" to "completed" state, preserving
               all data for post-event analysis

  Steps:
    1.  Dashboard shows exhibition as past its end date
    2.  Click "Close Exhibition" from Overview or Settings
    3.  Confirmation dialog: "This will close the exhibition. Exhibitors will no longer
        be able to update their booth. Attendees will see a 'completed' notice."
    4.  Click "Close Exhibition"
    5.  System actions:
        a. Status → "completed"
        b. Public page shows "This exhibition has concluded" notice
        c. Lead forms disabled (no new submissions)
        d. AI chat disabled at booths
        e. Dashboard metrics frozen at final values
    6.  Notification sent to all exhibitors: "[Exhibition] has concluded — view your results"
    7.  AI Report generation triggered (if auto-reports enabled)
    8.  Dashboard updates to show post-completion state

  Success:     Exhibition is closed. Data frozen. AI report generated.
               Exhibitors notified with results link.

  Failures:
    A. Exhibition still active (end date not reached) → confirmation: "The exhibition
       hasn't ended yet. Close early?"
    B. Active lead submissions in progress → warning: "Some submissions are being processed"
    C. Network error → retry

  Recovery:
    A: Confirm early close
    B: Wait for processing to complete, or force close
    C: Retry

  AI:
    - Auto-detect when exhibition should close (end date + 24h buffer)
    - Generate preliminary results summary
    - Queue AI reports for all exhibitors
    - Suggest optimal close time if not explicitly set

  Notif:       All exhibitors → "Exhibition results are ready!"
               Organizer team → "Exhibition closed. Reports are available."

  Perms:       org:owner, org:admin

  Status:      V1 — partially implemented

  Current:     Archive event button exists (ArchiveEventButton). No proper "close"
               workflow. No notifications. No report triggering.

  Missing:     - Graceful close workflow
               - Exhibitor notification with results link
               - Automatic report triggering
               - Data freeze
               - Post-completion state

  Depends:     Publish Exhibition
```

## 2.11 Generate Post-Event Reports

```
WORKFLOW: Generate Post-Event Reports
  Persona:     Organizer
  Trigger:     Exhibition is completed (or organizer wants mid-event report).
               Organizer needs data-driven report for stakeholders.
  Goal:        Produce an AI-generated executive report with key metrics, insights,
               and recommendations

  Steps:
    1.  Navigate to Reports tab for the exhibition
    2.  View existing reports list (if any)
    3.  Click "Generate New Report" or "Generate AI Report"
    4.  Optional: Select report type:
        a. Executive Summary (overview of all metrics)
        b. Exhibitor Performance (rankings, best/worst performers)
        c. Attendee Insights (demographics, behavior, engagement)
        d. Financial Summary (booth revenue, ROI estimates)
    5.  Click "Generate"
    6.  System:
        a. Takes analytics snapshot at current time
        b. Calls AI generation with metrics and instruction prompt
        c. Screens output with guardrails
        d. Stores report with status
    7.  While generating → progress indicator (30-60 seconds)
    8.  Report appears with metrics, narrative insights, recommendations
    9.  Options: Download PDF, Share with stakeholders (link), Download raw data (CSV)
    10. Report stored in reports list for future access

  Success:     Report generated, visible, downloadable. Organizer can share with
               stakeholders.

  Failures:
    A. Insufficient data → AI returns report with caveats
    B. AI generation timeout → retry with smaller scope
    C. Guardrail rejection → regenerate with sanitized input
    D. Report content fails citation check → regenerate

  Recovery:
    A: Report still shows available data with noted limitations
    B-D: Retry generation

  AI:
    - Core feature — this is an AI-native workflow
    - Generate narrative executive summary from metrics
    - Identify top insights and trends automatically
    - Suggest recommendations based on data
    - Support natural language report customizations
    - Compare with previous exhibition's data

  Notif:       Report generation complete → notification center

  Perms:       org:owner, org:admin, org:member (read existing reports)

  Status:      MVP — exists for single event

  Current:     Report generation exists for single event in console (reports page).
               Only "executive summary" type. PDF download exists.

  Missing:     - Multiple report types
               - Report comparison (cross-exhibition)
               - Scheduled/auto reports
               - Stakeholder sharing (public link with access control)
               - Raw data export

  Depends:     Close Exhibition (for complete data), Monitor Exhibition Health
```

---

# 3. Exhibitor Workflows

## 3.1 Accept Invitation

```
WORKFLOW: Accept Invitation
  Persona:     Exhibitor
  Trigger:     Exhibitor receives email invitation to exhibit. They click the link.
  Goal:        Accept the invitation and set up access to the exhibitor workspace

  Steps:
    1.  Receive email: "[Organizer] has invited [Company] to exhibit at [Exhibition]"
    2.  Click "Accept Invitation" link in email
    3.  If signed in:
        a. → Accept confirmation page → click "Accept"
        b. → Redirect to exhibitor workspace
    4.  If not signed in:
        a. → Sign in or create account
        b. → Accept confirmation page → click "Accept"
        c. → Redirect to exhibitor workspace
    5.  Workspace shows welcome state: "Welcome! Let's set up your booth."

  Success:     Exhibitor has accepted, can access their booth workspace, and sees
               setup guidance.

  Failures:
    A. Invitation expired → "This invitation has expired. Contact the organizer."
    B. Invitation already accepted → redirect to workspace
    C. Invitation revoked → "This invitation is no longer valid."
    D. Email mismatch (claimed by different user) → "This invitation was sent to [email].
       Sign in with that email."

  Recovery:
    A: Contact organizer for new invitation
    B: Already done — proceed to workspace
    C: Contact organizer
    D: Sign in with correct email

  AI:          None needed (standard invitation flow)

  Notif:       Organizer → "[Company] has accepted their invitation"

  Perms:       None (public invitation token)

  Status:      MVP — mostly implemented

  Current:     Invitation flow exists. Accept via auth_tokens. Invitation page handles
               sign-in and acceptance. Works.

  Missing:     - Welcome state with guided setup (shows next steps)
               - Smooth redirect flow (current redirects to demo page)

  Depends:     Invite Exhibitors (organizer workflow)
```

## 3.2 Build Booth Profile

```
WORKFLOW: Build Booth Profile
  Persona:     Exhibitor
  Trigger:     Exhibitor has accepted invitation and lands on booth setup. Also
               triggered when they want to edit their profile later.
  Goal:        Complete the booth profile so attendees can discover the company

  Steps:
    1.  From dashboard, click "Edit Booth Profile" or navigate to Booth tab
    2.  Form with fields:
        a. Company name (pre-filled from invitation)
        b. Booth name (if different from company name)
        c. Description (what the company does, what they're showcasing)
        d. Logo (image upload)
        e. Banner image (optional, header image)
        f. Brand color (pick from palette or enter hex)
        g. Website URL
        h. Social links (LinkedIn, Twitter, YouTube)
        i. Contact email and phone (for attendee inquiries)
    3.  Real-time preview shows how booth will appear to attendees
    4.  Click "Save"
    5.  Dashboard shows updated profile completion percentage

  Success:     Booth profile is complete with logo, description, and contact info.
               Preview shows accurate attendee view.

  Failures:
    A. Logo upload fails (size > 5MB, wrong format) → validation: "Logo must be
       under 5MB, PNG or JPG"
    B. Description too short (< 50 chars) → warning: "A good description helps
       attendees find you"
    C. Brand color invalid → inline validation

  Recovery:
    A: Resize/convert image, re-upload
    B-C: Fix and re-save

  AI:
    - Suggest description based on company name and industry
    - Auto-crop and resize logos to fit booth template
    - Recommend brand colors that match existing company brand
    - Generate booth preview with different layout options

  Notif:       Organizer → "[Company] has completed their profile"

  Perms:       exhibitor:admin, exhibitor:rep

  Status:      MVP — partially implemented

  Current:     Booth profile form exists in exhibitor portal (BoothProfileForm).
               Logo/banner upload via URL only (not file upload). Preview is
               separate page.

  Missing:     - File upload for logo and banner (URL-only currently)
               - Real-time preview alongside the form
               - AI description generation
               - Completion percentage calculation

  Depends:     Accept Invitation
```

## 3.3 Upload Marketing Assets

```
WORKFLOW: Upload Marketing Assets
  Persona:     Exhibitor
  Trigger:     Exhibitor wants to make brochures, videos, or documents available
               to attendees via their booth page.
  Goal:       Provide rich media content so attendees can learn about products

  Steps:
    1.  From Booth tab or Assets tab, click "Upload Asset"
    2.  Asset type selector:
        a. Brochure/PDF
        b. Product video
        c. Presentation
        d. Product image
        e. Other
    3.  Upload file (drag-and-drop or file picker)
    4.  Title and optional description for the asset
    5.  Click "Upload"
    6.  File uploaded to Supabase Storage →
        a. If type is knowledge source: processed for AI (chunked, embedded)
        b. If type is marketing asset: stored for attendee download
    7.  Asset appears in assets list
    8.  If it's a knowledge source: shown in knowledge sources with processing status

  Success:     Asset uploaded, processed (if applicable), and visible on booth page
               for attendees to download or view.

  Failures:
    A. File too large (limit: 50MB) → validation with max size
    B. Unsupported format → list supported formats
    C. Upload interrupted → resume upload (chunked upload for large files)
    D. Virus scan failed → file quarantined, notify admin
    E. Processing failed (AI knowledge) → retry or manual fallback

  Recovery:
    A-B: Convert to supported format
    C: Resume
    D: Contact support
    E: Retry processing

  AI:
    - Auto-categorize asset type based on content
    - Generate title and description from content
    - Extract key points from PDFs for AI knowledge base
    - Suggest assets to upload based on missing content types

  Notif:       When asset processing complete → notification
               When asset fails processing → alert with error details

  Perms:       exhibitor:admin

  Status:      MVP — partially implemented

  Current:     Knowledge source creation exists (createExhibitorSource + upload).
               Marketing assets are mixed in with knowledge sources. No asset type
               separation.

  Missing:     - Separate marketing assets from knowledge sources
               - Drag-and-drop file upload
               - Asset gallery view
               - Download tracking
               - Video support

  Depends:     Build Booth Profile
```

## 3.4 Invite Booth Staff

```
WORKFLOW: Invite Booth Staff
  Persona:     Exhibitor
  Trigger:     Exhibitor needs to add team members to help manage the booth during
               the exhibition.
  Goal:        Grant team members access to the exhibitor workspace

  Steps:
    1.  Navigate to Team tab
    2.  Click "Invite Team Member"
    3.  Enter email address and select role:
        a. Admin (full access — can manage booth, view leads, configure everything)
        b. Rep (limited — can view leads, take notes, scan QR codes)
    4.  Click "Send Invitation"
    5.  System sends invitation email with sign-in link
    6.  Team member appears in list with "Pending" status
    7.  When they accept → status changes to "Active"

  Success:     Team member is added with appropriate role and can access the booth.

  Failures:
    A. Email already a team member → warning: "Already on your team"
    B. Invalid email → validation error

  Recovery:
    A: Already done
    B: Fix email, retry

  AI:          None needed

  Notif:       Organizer → no notification (internal to exhibitor)

  Perms:       exhibitor:admin (can invite), exhibitor:rep (cannot invite)

  Status:      V1 — not yet implemented

  Current:     Team page exists but only shows current user's email (read-only).
               No invitation functionality.

  Missing:     Everything.

  Depends:     Build Booth Profile
```

## 3.5 Schedule Meetings

```
WORKFLOW: Schedule Meetings
  Persona:     Exhibitor (and Attendee — two-sided)
  Trigger:     Exhibitor identifies a high-value lead and wants to schedule a meeting.
               Or attendee requests a meeting from an exhibitor's page.
  Goal:        Schedule a confirmed meeting between exhibitor and attendee

  Steps (exhibitor-initiated):
    1.  From Lead detail or dashboard, click "Schedule Meeting"
    2.  Select attendee (pre-filled if from lead)
    3.  System shows exhibitor's available time slots (based on booth schedule)
    4.  Select a slot → system suggests duration (15, 30, 45, 60 min)
    5.  Optional: Add meeting notes / agenda
    6.  Click "Send Meeting Request"
    7.  Attendee receives notification: "[Exhibitor] wants to meet"
    8.  Attendee accepts/declines/reschedules
    9.  When accepted → meeting confirmed, added to both calendars

  Steps (attendee-initiated):
    1.  From exhibitor detail page, click "Request Meeting"
    2.  Same flow → request sent to exhibitor
    3.  Exhibitor accepts/declines/reschedules

  Success:     Meeting confirmed and visible on both parties' schedules.

  Failures:
    A. No overlapping availability → propose alternatives
    B. Meeting time conflict → warning and suggest different time
    C. Attendee declines → notification to exhibitor
    D. Exhibitor declines → notification to attendee

  Recovery:
    A: AI suggests best available times
    B: Choose different time slot
    C-D: Respect decision, try again with different approach

  AI:
    - Suggest optimal meeting times based on both parties' availability
    - Generate meeting talking points from lead intelligence
    - Auto-suggest meeting duration based on lead score
    - Follow up on unconfirmed requests after 24h

  Notif:       Meeting request sent → recipient receives notification
               Meeting confirmed → both parties notified
               Meeting reminder → 15 minutes before (both parties)
               Meeting cancelled → both parties notified

  Perms:       exhibitor:admin, exhibitor:rep (view only), attendee (request)

  Status:      V1 — not yet implemented

  Current:     Not implemented. No meetings table in database. No meeting UI anywhere.

  Missing:     Everything — this is a net-new feature.

  Depends:     Capture Leads (exhibitor workflow), Discover Exhibitors (attendee workflow)
```

## 3.6 Capture Leads

```
WORKFLOW: Capture Leads
  Persona:     Exhibitor
  Trigger:     An attendee visits the booth, scans the QR code, or submits the
               lead form. This is a passive workflow — the exhibitor doesn't initiate it.
  Goal:        Capture the attendee's contact information and interaction data

  Steps (automated):
    1.  Attendee arrives at booth (QR scan or direct link)
    2.  Attendee sees booth experience → lead form
    3.  Attendee fills form fields and submits
    4.  System:
        a. Creates lead submission with form responses
        b. Creates/updates exhibitor-relationship link
        c. Queues AI enrichment (async)
        d. Updates dashboard metrics (visitors +1, new leads +1)
    5.  AI enrichment completes (seconds to minutes):
        a. Lead score computed (0-100)
        b. Buying intent determined
        c. Summary generated
        d. Topics discussed extracted
    6.  Lead appears in exhibitor's leads list with AI enrichment
    7.  Dashboard updates: pipeline shifts, attention items update

  Success:     Lead captured and enriched. Exhibitor sees it in their lead list
               with AI intelligence. No manual data entry required.

  Failures:
    A. Form submission fails (network) → retry from attendee side
    B. AI enrichment fails → lead still captured (un-enriched). Manual review available.
    C. Duplicate submission (same attendee, same booth, same session) → dedup via
       idempotency key

  Recovery:
    A: Attendee resubmits
    B: Lead available without enrichment. Can re-trigger enrichment.
    C: Automatically handled

  AI:
    - Core feature — AI enrichment is the differentiator
    - Score lead quality in real-time
    - Determine buying intent from form responses
    - Extract key topics from open-ended responses
    - Generate follow-up recommendation
    - Suggest next action for the exhibitor

  Notif:       New lead captured → real-time (dashboard + notification)
               Hot lead detected (score > 80) → priority notification

  Perms:       exhibitor:admin, exhibitor:rep (view)

  Status:      MVP — implemented

  Current:     Lead capture works. QR-based booth experience → form submission →
               lead creation → AI enrichment. The pipeline is functional.

  Missing:     - No "hot lead" priority notifications
               - No real-time streaming of new leads to dashboard
               - Dedup could be more robust

  Depends:     Build Booth Profile, Upload Marketing Assets (for knowledge sources
               that power booth AI)
```

## 3.7 Qualify Leads

```
WORKFLOW: Qualify Leads
  Persona:     Exhibitor
  Trigger:     Exhibitor opens the Leads tab to review captured leads and determine
               which ones to prioritize.
  Goal:        Identify high-quality leads for immediate follow-up and filter out
               low-priority ones

  Steps:
    1.  Navigate to Leads tab
    2.  View all leads sorted by AI score (highest first by default)
    3.  Filter by:
        a. Score range (High: 80-100, Active: 60-79, Browsing: 40-59, Low: 0-39)
        b. Buying intent (high, evaluating, browsing, not_relevant)
        c. Date range
        d. Has contact email (yes/no)
    4.  Click a lead → Lead Detail panel (slide-over):
        a. Attendee profile (name, company, title, industry)
        b. AI Intelligence: score breakdown, buying intent, summary, topics
        c. Form responses (what they filled in)
        d. Interaction history (past submissions, meetings, notes)
        e. AI recommended next step
    5.  Take action on a lead:
        a. "Mark as Contacted" — update status
        b. "Schedule Meeting" — initiate meeting booking
        c. "Add Note" — internal note
        d. "Assign to Staff" — route to a team member
        e. "Export" — add to export list
    6.  Bulk actions: select multiple leads → export, assign, tag
    7.  Leads remain in system for post-event follow-up

  Success:     Exhibitor has reviewed their leads knows which ones to act on.
               High-priority leads have a next action assigned.

  Failures:
    A. No leads yet → empty state: "No leads captured yet. Share your QR code
       with visitors."
    B. Lead missing contact info → still visible with note: "No email provided.
       Cannot follow up directly."

  Recovery:
    A: Promote QR code
    B: Can still view profile if attendee consented to share

  AI:
    - Core feature — AI scoring and intent determination
    - Prioritization: "These 3 leads need follow-up within 4 hours"
    - Pattern detection: "Attendees from [industry] score higher for your products"
    - Recommend which leads to assign to which staff member

  Notif:       None (exhibitor is actively reviewing)

  Perms:       exhibitor:admin, exhibitor:rep

  Status:      MVP — partially implemented

  Current:     Lead list exists. Basic AI enrichment. No slide-over detail panel.
               No bulk actions. No staff assignment.

  Missing:     - Slide-over lead detail panel with full AI intelligence
               - Bulk actions (export, assign, tag)
               - Staff assignment
               - Status tracking (contacted, meeting booked, qualified)
               - Advanced filters (buying intent, score range, date)

  Depends:     Capture Leads
```

## 3.8 Export Leads to CRM

```
WORKFLOW: Export Leads to CRM
  Persona:     Exhibitor
  Trigger:     Exhibitor wants to transfer captured leads to their CRM system
               (Salesforce, HubSpot, etc.) for ongoing management.
  Goal:        Get lead data out of ExAi and into the exhibitor's CRM

  Steps:
    1.  Navigate to Leads tab
    2.  Click "Export" button
    3.  Select leads to export:
        a. All leads from this exhibition
        b. Filtered list (currently active filters applied)
        c. Selected leads (checkboxes)
    4.  Select export format:
        a. CSV (universal)
        b. CSV with AI fields (includes score, intent, summary)
        c. Excel (.xlsx)
    5.  Optional: Map fields to CRM fields (if integration configured)
    6.  Click "Export"
    7.  File downloads with all lead data including:
        - Name, email, company, title, phone (if provided)
        - AI score, buying intent, summary
        - Form responses
        - Booth name, exhibition name
        - Date/time of capture
    8.  (V2) Direct CRM integration: one-click push to Salesforce/HubSpot

  Success:     CSV/XLSX file downloaded. Data is in a format ready for CRM import.
               (V2) Leads appear in CRM automatically.

  Failures:
    A. No leads to export → disabled button with tooltip
    B. Too many leads (>10,000) → warning: spawn background job
    C. (V2) CRM connection failed → error with retry option

  Recovery:
    A: Capture leads first
    B: Background export, notification when ready
    C: Retry or fall back to CSV

  AI:
    - Suggest optimal field mapping for common CRMs
    - Enrich export with AI summary suitable for CRM import
    - Predict which CRM fields are most useful

  Notif:       Export complete → notification with download link
               (V2) CRM sync complete → success notification

  Perms:       exhibitor:admin

  Status:      V1 — partially implemented

  Current:     No export functionality exists.

  Missing:     Everything — this is a net-new feature.

  Depends:     Capture Leads, Qualify Leads
```

## 3.9 Follow Up After Exhibition

```
WORKFLOW: Follow Up After Exhibition
  Persona:     Exhibitor
  Trigger:     Exhibition has concluded (or exhibitor wants to follow up with
               specific leads during or after the event).
  Goal:        Send personalized follow-up communications to leads before they go cold

  Steps:
    1.  Dashboard shows post-exhibition state: "The exhibition has concluded.
        [X] leads need follow-up."
    2.  Navigate to Leads tab or Follow-up section
    3.  View leads sorted by follow-up priority:
        a. Hot leads (score 80+, not yet contacted)
        b. Active leads (score 60-79, follow-up recommended)
        c. Other leads (bulk nurture)
    4.  Click a lead → "Generate Follow-up" button
    5.  AI generates personalized email draft:
        a. Personalized greeting using lead's name and company
        b. References topics discussed at the booth
        c. Proposes specific next step (demo, call, meeting)
        d. Professional closing with exhibitor's signature
    6.  Review and edit the draft (optional)
    7.  Send via:
        a. ExAi messaging (attendee sees in their inbox)
        b. Your email client (copy-paste the draft)
        c. (V2) Direct send via connected email
    8.  Mark lead as "Followed Up" with date

  Success:     Follow-up sent to high-priority leads. Exhibitor has documented
               follow-up activity for each lead.

  Failures:
    A. Lead has no email → cannot follow up via email. Can only send in-app message
       if attendee is active on the platform.
    B. AI draft is inaccurate → edit manually
    C. Lead already followed up → skip

  Recovery:
    A: Use in-app message or alternative contact method
    B: Edit before sending
    C: Already done

  AI:
    - Generate personalized follow-up email for each lead
    - Suggest optimal follow-up timing (hot leads: <4h, active: <24h, rest: <72h)
    - Recommend appropriate next step based on lead intelligence
    - Batch-generate for bulk nurture campaigns

  Notif:       Daily reminder: "You have [X] leads needing follow-up"
               Lead responds to follow-up → notification

  Perms:       exhibitor:admin, exhibitor:rep

  Status:      V2 — not yet implemented

  Current:     Not implemented. No follow-up generation.

  Missing:     Everything — this is a net-new feature.

  Depends:     Capture Leads, (V2) Close Exhibition
```

## 3.10 Measure ROI

```
WORKFLOW: Measure ROI
  Persona:     Exhibitor
  Trigger:     Exhibition has concluded. Exhibitor wants to understand the ROI of
               their participation.
  Goal:        Quantify the value generated from exhibiting

  Steps:
    1.  Navigate to Analytics tab after exhibition
    2.  View ROI Dashboard:
        a. Total leads captured
        b. Qualified leads (score > 60)
        c. Meetings booked and completed
        d. Estimated pipeline value (AI-estimated based on lead scores
           and company size)
        e. Cost inputs: enter booth cost, travel, staff time (optional)
        f. ROI calculation: (estimated pipeline value - cost) / cost
    3.  View comparison:
        a. vs. other exhibitions (if multiple exhibitions in account)
        b. vs. industry benchmarks (V2)
    4.  Download ROI report (PDF)
    5.  Share with internal stakeholders

  Success:     Exhibitor has a clear ROI number and supporting data to justify
               future exhibition participation.

  Failures:
    A. Too few leads to calculate meaningful ROI → show raw data with caveat
    B. Cost not entered → show pipeline value only (no ROI percentage)
    C. Pipeline value is estimated → clear labeling: "AI-estimated value"

  Recovery:
    A-B: Show available data with appropriate caveats
    C: Label clearly

  AI:
    - Estimate pipeline value from lead scores and company demographics
    - Suggest ROI target based on similar exhibitors
    - Generate ROI report narrative
    - Compare performance across multiple exhibitions
    - Predict ROI for future exhibitions based on past data

  Notif:       ROI report ready → notification with link

  Perms:       exhibitor:admin

  Status:      V2 — not yet implemented

  Current:     Not implemented. No analytics beyond basic KPIs.

  Missing:     Everything — this is a net-new feature.

  Depends:     Capture Leads, Follow Up After Exhibition
```

---

# 4. Attendee Workflows

## 4.1 Register for Exhibition

```
WORKFLOW: Register for Exhibition
  Persona:     Attendee
  Trigger:     Attendee receives link to exhibition, scans an invitation QR code,
               or discovers the exhibition through search/referral.
  Goal:        Create an account and register for the exhibition so they can access
               exhibits, book meetings, and interact with exhibitors

  Steps:
    1.  Land on exhibition public page at /e/[slug]
    2.  View exhibition info: name, dates, location, description, featured exhibitors
    3.  Click "Register" or "Get Your Pass"
    4.  Sign in or create account:
        a. If new: enter email → create password → verify email
        b. If existing: sign in
    5.  Complete profile (required for lead sharing):
        a. Full name
        b. Company
        c. Job title
        d. Industry (optional)
    6.  Set consent preferences:
        a. Share profile with exhibitors when I submit lead forms (toggle)
        b. (Future) Receive recommendations based on my interests
    7.  Click "Complete Registration"
    8.  Success page with next steps:
        a. Browse exhibitors
        b. View recommended exhibitors
        c. Explore floor map

  Success:     Attendee is registered, profile is complete, and they are on the
               exhibition dashboard ready to explore.

  Failures:
    A. Email already registered → sign in instead
    B. Required field missing → inline validation
    C. Email verification not completed → reminder to check email

  Recovery:
    A: Switch to sign-in flow
    B: Complete field
    C: Resend verification email

  AI:
    - Auto-fill profile from LinkedIn OAuth (V2)
    - Suggest industries based on company name
    - Recommend exhibitors immediately after registration

  Notif:       Welcome email with event details and next steps
               Reminder email as event approaches

  Perms:       None (public registration)

  Status:      MVP — partially implemented

  Current:     Registration flow exists via booth experience (email → magic link → profile).
               No dedicated exhibition registration page.

  Missing:     - Exhibition public page with registration
               - Dedicated registration flow (not only via QR)
               - Post-registration guided experience
               - Email verification flow

  Depends:     Publish Exhibition (organizer workflow)
```

## 4.2 Discover Exhibitions

```
WORKFLOW: Discover Exhibitions
  Persona:     Attendee
  Trigger:     Attendee wants to find exhibitions to attend. This could be via
               a public directory, search, or referral.
  Goal:        Find relevant exhibitions and decide which to register for

  Steps:
    1.  Land on ExAi public landing page
    2.  View featured/upcoming exhibitions (if public directory feature exists)
    3.  Search by industry, city, date, or name
    4.  Click an exhibition → public page details
    5.  View: description, dates, venue, featured exhibitors, attendee count
    6.  Click "Register" → Registration workflow

  Success:     Attendee finds an exhibition they want to attend and proceeds to
               register.

  Failures:
    A. No exhibitions match search criteria → "No exhibitions found. Try different
       search terms."
    B. Exhibition registration closed → "Registration for this exhibition has ended."

  Recovery:
    A: Suggest broader search or different keywords
    B: Show similar upcoming exhibitions

  AI:
    - Recommend exhibitions based on past registrations and profile
    - Suggest exhibitions in similar industries
    - Show "Popular near you" based on location

  Notif:       None (discovery phase)

  Perms:       None (public)

  Status:      Future — not yet implemented

  Current:     Not implemented. No public exhibition directory or discovery.

  Missing:     Everything — this is a net-new feature. (Current attendees receive
               a direct link to a specific event.)

  Depends:     Publish Exhibition (organizer workflow)
```

## 4.3 Plan Visit

```
WORKFLOW: Plan Visit
  Persona:     Attendee
  Trigger:     Attendee is registered for an upcoming exhibition and wants to plan
               their visit in advance.
  Goal:        Identify which exhibitors to visit, book meetings, and create a
               schedule before arriving at the venue

  Steps:
    1.  From exhibition dashboard, view AI recommendations: "Here are exhibitors
        you shouldn't miss"
    2.  Browse exhibitor directory → search by industry, keyword, or browse all
    3.  View exhibitor profiles → read AI Booth Briefings
    4.  Save interesting exhibitors (bookmark for later)
    5.  Request meetings with priority exhibitors (from their profile page)
    6.  View floor map → see where saved exhibitors are located
    7.  AI suggests optimized route: "Visit Booth 42, then 18, then 33 — they're
        all in Hall A"
    8.  View planned schedule: list of exhibitors to visit with meeting times

  Success:     Attendee has a list of saved exhibitors, scheduled meetings, and
               knows their route through the venue.

  Failures:
    A. Few exhibitors match interests → "Expand your search or browse by category"
    B. Meeting time conflicts → AI suggests alternatives
    C. No saved exhibitors yet → encouraging guidance

  Recovery:
    A: Show broader category recommendations
    B: Reschedule
    C: Guided onboarding to discover exhibitors

  AI:
    - Personalized exhibitor recommendations based on profile and interests
    - AI Booth Briefing for each exhibitor
    - Route optimization across the floor plan
    - Meeting time suggestions that avoid conflicts
    - "Visitors like you also visited..." recommendations

  Notif:       Meeting confirmed → notification
               Exhibition starts in 1 day → reminder with planned itinerary

  Perms:       attendee (authenticated)

  Status:      V1 — partially implemented

  Current:     Browse and save exhibitors work. AI Booth Briefing exists.
               No meeting booking. No route optimization. No planning dashboard.

  Missing:     - Personalized recommendation algorithm
               - Meeting booking
               - Floor map with saved exhibitors overlay
               - Route optimization
               - Planning dashboard / itinerary view
               - Pre-event reminders

  Depends:     Register for Exhibition
```

## 4.4 Navigate Venue

```
WORKFLOW: Navigate Venue
  Persona:     Attendee
  Trigger:     Attendee is at the venue and wants to find their way to specific
               exhibitors, halls, or amenities.
  Goal:        Efficiently navigate the exhibition space to find exhibitors and
               destinations

  Steps:
    1.  Open Floor Map tab on mobile
    2.  View interactive hall map with booth grid
    3.  Map features:
        a. Saved/exhibitors highlighted
        b. Current location (if GPS enabled for venue)
        c. Searchable: type booth number or company name
        d. "Find My Next" — optimized route to next best exhibitor
    4.  Tap a booth → popover with company name and "Navigate" button
    5.  Tap "Navigate" → highlighted path on map

  Success:     Attendee easily finds their way to any exhibitor or destination
               in the venue.

  Failures:
    A. Indoor positioning not available → show static map with "You are here" marker
       (manual positioning)
    B. Booth not on map → rare, show error

  Recovery:
    A: Manual location entry or use landmark references
    B: Report to organizer

  AI:
    - Suggest optimal route connecting all saved exhibitors
    - Real-time rerouting based on congestion (V2)
    - "Popular nearby" — show trending booths near current location

  Notif:       None (hands-free navigation)

  Perms:       attendee (authenticated or anonymous)

  Status:      V2 — not yet implemented

  Current:     Not implemented. No floor map for attendees.

  Missing:     Everything — depends on floor plan feature for organizers.

  Depends:     Configure Venue & Floor Plan (organizer workflow)
```

## 4.5 Find Exhibitors

```
WORKFLOW: Find Exhibitors
  Persona:     Attendee
  Trigger:     Attendee wants to discover specific exhibitors at the exhibition.
  Goal:        Find relevant exhibitors and learn about them

  Steps:
    1.  Open Explore tab
    2.  View exhibitor grid with search bar and filters
    3.  Search by:
        a. Company name (type-ahead)
        b. Keyword (semantic search: "warehouse automation")
        c. Industry category (filter buttons)
    4.  Results update in real-time as you type
    5.  Browse exhibitor cards: logo, name, booth number, industry tags, brief desc
    6.  Tap/click exhibitor → profile page with full detail
    7.  View AI Booth Briefing, products, meeting availability
    8.  Save exhibitor → appears in Saved tab
    9.  Continue exploring or move to next action

  Success:     Attendee found relevant exhibitors, read about them, and saved the
               ones they want to visit.

  Failures:
    A. No results match search → "Try a different search term or browse by category"
    B. Exhibitor not yet published → not visible until published

  Recovery:
    A: Show broader categories
    B: Not visible — attendee cannot find unpublished exhibitors

  AI:
    - Semantic search (natural language understanding)
    - Personalized ranking (exhibitors matching attendee's profile rank higher)
    - "Visitors like you also viewed..." recommendations
    - Auto-generated booth briefing

  Notif:       None (active search)

  Perms:       attendee (authenticated or anonymous for browse)

  Status:      MVP — implemented

  Current:     Exhibitor directory exists at /e/[slug] and /hackathon with search
               and industry filters. AI briefing exists.

  Missing:     - Semantic search (current is basic string matching)
               - Personalized ranking
               - "Also viewed" recommendations
               - Type-ahead search with suggestions

  Depends:     Register for Exhibition, Build Booth Profile (exhibitor workflow)
```

## 4.6 Scan QR Code

```
WORKFLOW: Scan QR Code
  Persona:     Attendee
  Trigger:     Attendee is at a booth and sees a QR code. They scan it with their
               phone camera.
  Goal:        Access the booth experience, learn about the exhibitor, and optionally
               share contact information

  Steps:
    1.  Attendee scans QR code (or taps link)
    2.  Opens /visit/[token] on mobile
    3.  Booth Experience loads in multi-step flow:
        a. Landing page: company name, logo, quick description
        b. Prerequisite: email entry (if not authenticated) or skip
        c. Profile: fill name, company, job title (if not already set)
        d. Lead form: dynamic form designed by exhibitor
        e. Confirmation: "Thanks! Here's what you can do next."
    4.  Post-submission options:
        a. Save exhibitor
        b. Ask AI about products
        c. Download brochures/resources
        d. Request meeting
        e. View related exhibitors (AI-suggested)
    5.  Analytics tracked (dwell time, submission, chat, download)

  Success:     Attendee has submitted their information, learned about the exhibitor,
               and can continue to their next action.

  Failures:
    A. QR token invalid → "This QR code is not valid. Please check with the exhibitor."
    B. Lead form submission fails → retry
    C. AI chat too slow → show fallback message
    D. Network error → "Check your connection and try again"

  Recovery:
    A: Exhibitor regenerates QR
    B: Retry
    C: Message shown without AI
    D: Retry with exponential backoff

  AI:
    - Booth chat (RAG-based Q&A about the exhibitor's products)
    - Suggest related exhibitors after submission
    - Auto-fill form fields from attendee profile

  Notif:       None (real-time interaction)

  Perms:       None (public QR token)

  Status:      MVP — implemented

  Current:     Booth experience works. QR → multi-step flow → lead submission.
               AI chat exists. Resource download exists.

  Missing:     - Post-submission recommendations (related exhibitors)
               - Meeting request from booth experience
               - Smoother flow for returning attendees (skip re-entering data)
               - Better mobile optimization

  Depends:     Build Booth Profile, Upload Marketing Assets, Capture Leads (exhibitor)
```

## 4.7 Save Products

```
WORKFLOW: Save Products
  Persona:     Attendee
  Trigger:     Attendee is viewing an exhibitor's products and wants to remember
               specific ones for later.
  Goal:        Bookmark products from exhibitors for post-event follow-up

  Steps:
    1.  From exhibitor profile page, scroll to Products section
    2.  Browse product cards (name, image, category, brief description)
    3.  Click "Save" on a product → product saved to attendee's saved list
    4.  Click a product → product detail dialog with full description, specs, links
    5.  Saved products appear in:
        a. Exhibitor profile (marked as saved)
        b. "Saved Products" section in attendee dashboard
    6.  Post-event: export saved products list or share with team

  Success:     Attendee has a list of saved products they can review after the event.

  Failures:
    A. Exhibitor has no products → empty state visible
    B. Product removed by exhibitor → removed from saved list

  Recovery:
    B: Automatic removal from saved list

  AI:
    - Recommend products based on attendee's industry and past saves
    - Auto-summarize product specs for quick comparison
    - Group saved products by category

  Notif:       None

  Perms:       attendee (authenticated)

  Status:      V2 — not yet implemented

  Current:     Not implemented. No product catalog entity exists.

  Missing:     Everything — depends on Products entity being added.

  Depends:     Register for Exhibition, (exhibitor workflow) Build Booth Profile
               with Products
```

## 4.8 Book Meetings

```
WORKFLOW: Book Meetings
  Persona:     Attendee
  Trigger:     Attendee finds an exhibitor they want to meet with and requests
               a meeting.
  Goal:        Schedule a confirmed meeting with an exhibitor during the exhibition

  Steps:       (See Exhibitor workflow 3.5 — this is the same two-sided workflow)

  Success:     Meeting confirmed. Appears in attendee's schedule.

  Depends:     Plan Visit
```

## 4.9 Exchange Contact Information

```
WORKFLOW: Exchange Contact Information
  Persona:     Attendee
  Trigger:     Attendee meets an exhibitor or another attendee and wants to exchange
               contact details digitally.
  Goal:        Share contact information without business cards

  Steps (at booth):
    1.  Attendee scans booth QR code → leads to lead form
    2.  Attendee fills form → contact info shared with exhibitor
    3.  (Future) Attendee receives exhibitor's contact info in return (digital
        business card)

  Steps (between attendees — Future):
    1.  Both attendees have ExAi app
    2.  Tap "Exchange" on their mobile
    3.  Each confirms → contacts shared
    4.  Appears in both attendee's connections list

  Success:     Contact information exchanged digitally. No business cards needed.

  Failures:    Same as QR scan

  Recovery:    Same as QR scan

  AI:          None needed (standard transaction)

  Notif:       None (real-time)

  Perms:       attendee (authenticated)

  Status:      MVP — one-way (attendee → exhibitor) via lead form

  Current:     Lead form captures attendee contact. Works.

  Missing:     - Two-way exchange (attendee gets exhibitor contact)
               - Attendee-to-attendee exchange
               - Digital business card feature

  Depends:     Register for Exhibition, Scan QR Code
```

## 4.10 Receive AI Recommendations

```
WORKFLOW: Receive AI Recommendations
  Persona:     Attendee
  Trigger:     Attendee opens their dashboard or the Recommendations tab. Also
               triggered contextually throughout the experience.
  Goal:        Discover exhibitors the attendee would not have found on their own

  Steps:
    1.  Open Home dashboard or Recommendations tab
    2.  View personalized recommendations section:
        a. "Because you saved [Exhibitor A]" → similar exhibitors
        b. "Visitors like you also saved..." → collaborative filtering
        c. "New exhibitors you might have missed" → discovery
        d. "Popular right now" → trending booths
    3.  Tap any recommendation → exhibitor profile
    4.  Save, visit, or request meeting
    5.  AI learns from interactions → improves future recommendations

  Success:     Attendee discovers relevant exhibitors they would have missed.

  Failures:
    A. Not enough data for recommendations → show popular/top-rated instead
    B. Attendee has no saved exhibitors → show category-based suggestions instead

  Recovery:
    A-B: Show fallback recommendations (popular, categories)

  AI:
    - Collaborative filtering (visitors like you also liked...)
    - Content-based filtering (matches attendee profile → exhibitor attributes)
    - Real-time adaptation (as attendee saves more, recommendations improve)
    - "Popular now" — trending booths based on recent activity

  Notif:       Push notification during event: "3 new exhibitors matched your interests"

  Perms:       attendee (authenticated)

  Status:      V1 — not yet implemented

  Current:     Not implemented. No recommendation engine exists on the attendee side.

  Missing:     Everything — this is a net-new feature.

  Depends:     Register for Exhibition, Find Exhibitors (to establish interaction data)
```

## 4.11 Continue Networking After Exhibition

```
WORKFLOW: Continue Networking After Exhibition
  Persona:     Attendee
  Trigger:     Exhibition has concluded. Attendee wants to review their connections
               and follow up.
  Goal:        Maximize the value of connections made during the exhibition

  Steps:
    1.  Post-event dashboard:
        a. "Here's who you met" — list of exhibitors you submitted leads to
        b. "Your saved exhibitors" — companies you bookmarked
        c. "Your saved products" — products you saved
        d. "Your meetings" — exhibitors you met with scheduled meetings
    2.  For each connection:
        a. View shared contact info
        b. View AI summary of interaction (topics discussed, interests)
        c. Follow-up options: message exhibitor, request meeting, download materials
    3.  Export connections list (CSV, vCard)
    4.  Receive AI-generated post-event summary email:
        "Thanks for attending TechExpo 2027! Here's a recap of your visit..."

  Success:     Attendee has a complete record of their exhibition activity and can
               take follow-up actions.

  Failures:
    A. No connections made → "It looks like you didn't interact with any exhibitors.
       Here are some tips for your next exhibition."

  Recovery:
    A: Encourage using AI recommendations and QR scanning at next event

  AI:
    - Generate post-event AI summary of all interactions
    - Suggest follow-up actions per connection
    - Draft follow-up message to exhibitor
    - Group connections by priority (hot leads for follow-up first)

  Notif:       Post-event summary email with top highlights and actionable next steps

  Perms:       attendee (authenticated)

  Status:      V2 — not yet implemented

  Current:     Not implemented. No post-event attendee dashboard.

  Missing:     Everything — this is a net-new feature.

  Depends:     Register for Exhibition, Save Products, Book Meetings, Scan QR Code
```

---

# 5. Admin Workflows

## 5.1 Create Organization

```
WORKFLOW: Create Organization
  Persona:     Admin
  Trigger:     New customer signs up. Admin needs to create their organization.
  Goal:        Provision a new organizer or exhibitor organization in the platform

  Steps:
    1.  Navigate to Organizations tab
    2.  Click "New Organization"
    3.  Select type: Organizer | Exhibitor
    4.  Enter: name, slug, billing email, verified domains
    5.  Click "Create"
    6.  Organization created with default settings
    7.  Add initial admin user (email invitation)
    8.  Organization appears in list with status

  Success:     Organization provisioned. Admin user invited. Ready for use.

  Failures:    Standard validation errors

  Recovery:    Standard form recovery

  AI:          None needed

  Notif:       None

  Perms:       platform:admin

  Status:      V2 — not yet implemented

  Current:     Not implemented (admin page is mock data).

  Missing:     Everything

  Depends:     None
```

## 5.2 Manage Subscriptions

```
WORKFLOW: Manage Subscriptions
  Persona:     Admin
  Trigger:     Organization wants to upgrade, downgrade, or has billing issues.
  Goal:        Manage organization's plan and billing

  Steps:
    1.  Navigate to organization detail
    2.  View current plan, usage stats, billing history
    3.  Change plan → select new tier → confirm
    4.  View invoices, payment status
    5.  Handle billing exceptions (credits, discounts)

  Success:     Organization's subscription is correct and up to date.

  Missing:     Everything — no subscription system exists.

  Status:      Future
```

## 5.3 Manage Users

```
WORKFLOW: Manage Users
  Persona:     Admin
  Trigger:     Support request, security issue, or account management.
  Goal:        Manage user accounts across the platform

  Steps:
    1.  Navigate to Users tab
    2.  Search user by email or name
    3.  View user detail: organizations, role, activity log
    4.  Actions: suspend, activate, change role, reset password
    5.  Activity log shows all user actions

  Success:     User account managed appropriately.

  Missing:     Everything — no user management exists.

  Status:      V2
```

## 5.4 Configure Platform

```
WORKFLOW: Configure Platform
  Persona:     Admin
  Trigger:     Platform-level settings need to be changed.
  Goal:        Manage platform configuration, feature flags, defaults

  Steps:
    1.  Navigate to Platform Settings
    2.  Manage: default values, limits, feature flags
    3.  Save configuration

  Success:     Platform configured correctly.

  Missing:     Everything.

  Status:      Future
```

## 5.5 Review Analytics

```
WORKFLOW: Review Analytics
  Persona:     Admin
  Trigger:     Periodic platform health check or specific investigation.
  Goal:        Monitor platform health, usage, and growth

  Steps:
    1.  Navigate to Analytics dashboard
    2.  View: active organizations, events, users, revenue
    3.  View: system health metrics
    4.  Drill into specific metrics

  Success:     Clear picture of platform health.

  Missing:     Everything — admin dashboard is mock data.

  Status:      V2
```

## 5.6 Handle Support Issues

```
WORKFLOW: Handle Support Issues
  Persona:     Admin
  Trigger:     User submits a support request or system generates an alert.
  Goal:        Resolve user issues and maintain platform reliability

  Steps:
    1.  Support ticket appears in queue
    2.  Review issue description, affected user, severity
    3.  Investigate: user account, organization, system logs
    4.  Resolve: change configuration, contact user, escalate
    5.  Close ticket with resolution notes

  Success:     User issue resolved, ticket closed.

  Missing:     Everything.

  Status:      Future
```

---

# 6. Workflow Dependency Graph

## 6.1 Core Platform (MVP)

```
[Create an Exhibition]
    │
    ├── [Publish Exhibition]
    │       │
    │       └── [Register for Exhibition] (attendee)
    │               │
    │               ├── [Find Exhibitors]
    │               │       │
    │               │       ├── [Scan QR Code] ──→ [Capture Leads] (exhibitor)
    │               │       │                           │
    │               │       │                           └── [Qualify Leads]
    │               │       │
    │               │       └── [Exchange Contact Info]
    │               │
    │               └── [Receive AI Recommendations] (V1)
    │
    └── [Invite Exhibitors] (V1 — single invite exists in MVP)
            │
            ├── [Accept Invitation]
            │       │
            │       ├── [Build Booth Profile]
            │       │       │
            │       │       ├── [Upload Marketing Assets]
            │       │       │
            │       │       └── [Capture Leads] ←── (triggered by attendee QR scan)
            │       │               │
            │       │               └── [Qualify Leads]
            │       │
            │       └── [Invite Booth Staff] (V1)

[Generate Post-Event Reports]
        │
        └── depends on [Close Exhibition] (V1)

[Monitor Exhibition Health]
        │
        └── feeds into [Generate Post-Event Reports]
```

## 6.2 Independent Workflows (No Dependencies)

These workflows can be built in parallel:

- [Generate Post-Event Reports] — depends on data being captured, not on specific UI
- [Monitor Exhibition Health] — computes from existing data
- [Scan QR Code] — depends only on booth being published

## 6.3 V1 Additions

```
[Configure Venue & Floor Plan]
    │
    ├── [Sell Booths / Manage Booth Bookings]
    │
    ├── [Navigate Venue] (attendee)
    │
    └── [Plan Visit] (attendee — uses floor plan)
            │
            └── [Book Meetings]
                    │
                    ├── [Schedule Meetings] (exhibitor)
                    │
                    └── [Receive AI Recommendations] (improves with meeting data)

[Review Exhibitor Submissions]

[Handle Operational Issues]
    │
    └── depends on [Monitor Exhibition Health]

[Close Exhibition]
    │
    └── [Generate Post-Event Reports] (triggered by close)

[Export Leads to CRM]
    │
    └── depends on [Qualify Leads]

[Invite Booth Staff]
    │
    └── depends on [Build Booth Profile]
```

## 6.4 V2 Additions

```
[Manage Attendee Growth]
    │
    └── depends on [Publish Exhibition]

[Follow Up After Exhibition]
    │
    ├── depends on [Capture Leads]
    └── depends on [Close Exhibition]

[Measure ROI]
    │
    └── depends on [Follow Up After Exhibition]

[Save Products]
    │
    └── depends on [Build Booth Profile] (with Products)

[Continue Networking After Exhibition]
    │
    └── depends on [Register for Exhibition], [Scan QR Code], [Book Meetings]

[Admin workflows] — independent of exhibition workflows
```

---

# 7. MVP Workflow Set

These workflows **must** exist before ExAi can launch. Everything else can come in V1 or V2.

## 7.1 Organizer MVP

| # | Workflow | Priority | Notes |
|---|---|---|---|
| 1 | Create an Exhibition | P0 | Exists (partial). Must be polished. |
| 2 | Publish Exhibition | P0 | Exists (minimal). Needs prerequisite checking. |
| 3 | Generate Post-Event Reports | P0 | Exists. Core AI differentiator. |
| 4 | Invite Exhibitors (single) | P0 | Exists. Single invite works. |
| 5 | Review Exhibitor Submissions (basic) | P1 | List exists. Needs completeness tracking. |

**Not in MVP:** Configure Venue, Sell Booths, Monitor Health (beyond basic), Manage Attendee Growth, Handle Issues, Close Exhibition (properly)

## 7.2 Exhibitor MVP

| # | Workflow | Priority | Notes |
|---|---|---|---|
| 1 | Accept Invitation | P0 | Exists. Streamline redirect. |
| 2 | Build Booth Profile | P0 | Exists. Add file upload for logo. |
| 3 | Upload Marketing Assets | P0 | Exists. Separate assets from knowledge sources. |
| 4 | Capture Leads | P0 | Exists. Core value prop. |
| 5 | Qualify Leads | P1 | Exists in basic form. Needs richer UI. |

**Not in MVP:** Invite Booth Staff, Schedule Meetings, Export to CRM, Follow Up, Measure ROI

## 7.3 Attendee MVP

| # | Workflow | Priority | Notes |
|---|---|---|---|
| 1 | Register for Exhibition | P0 | Exists (QR-triggered). Needs dedicated reg page. |
| 2 | Find Exhibitors | P0 | Exists. Search + filter. |
| 3 | Scan QR Code | P0 | Exists. Booth experience flow. |
| 4 | Exchange Contact Information | P0 | Exists (one-way via lead form). |

**Not in MVP:** Plan Visit, Navigate Venue, Save Products, Book Meetings, Receive AI Recommendations, Continue Networking

## 7.4 Admin MVP

None. Admin workflows are V2+.

## 7.5 MVP Recap

**Total workflows: 13**
- Organizer: 5 (4 P0, 1 P1)
- Exhibitor: 5 (4 P0, 1 P1)
- Attendee: 4 (all P0)
- Admin: 0

**What to remove from the current implementation:**
- Legacy `/organizer/*` route group
- Placeholder pages (registrations, documents — empty states without purpose)
- Demo-specific navigation items that reference non-existent routes
- `/showcase` redirect (use `/hackathon/expo` directly)

**What to add for MVP:**
- File upload for booth logo (currently URL-only)
- Dedicated exhibition registration page (not only via QR)
- Post-registration guided experience
- Lead detail slide-over panel
- Exhibition prerequisite checklist for publish

---

# 8. V1 Workflow Set

## 8.1 Organizer V1

| # | Workflow | Notes |
|---|---|---|
| 1 | Configure Venue & Floor Plan | Net-new. Core differentiator. |
| 2 | Monitor Exhibition Health | Requires health score computation. |
| 3 | Handle Operational Issues | Net-new. Alert + notification infrastructure. |
| 4 | Close Exhibition | Improve from basic "archive" to proper close workflow. |
| 5 | Invite Exhibitors (bulk) | Add CSV import, past exhibitors. |
| 6 | Review Exhibitor Submissions (advanced) | Completeness scoring, bulk messaging. |
| 7 | Generate Post-Event Reports (enhanced) | Multiple report types, comparison. |

## 8.2 Exhibitor V1

| # | Workflow | Notes |
|---|---|---|
| 1 | Schedule Meetings | Net-new. Meetings entity + booking UI. |
| 2 | Invite Booth Staff | Net-new. Team invitation flow. |
| 3 | Export Leads to CRM | CSV/Excel export. Direct CRM integration not required. |

## 8.3 Attendee V1

| # | Workflow | Notes |
|---|---|---|
| 1 | Plan Visit | Requires saved exhibitors + floor map. |
| 2 | Book Meetings | Shared with exhibitor workflow. |
| 3 | Receive AI Recommendations | Recommendation engine. |

## 8.4 Admin V1

None. Admin is V2.

---

# 9. V2 Workflow Set

## 9.1 Organizer V2

| # | Workflow | Notes |
|---|---|---|
| 1 | Sell Booths / Manage Booth Bookings | Requires floor plan. Adds financial tracking. |
| 2 | Manage Attendee Growth | Campaigns, promotions, segmentation. |

## 9.2 Exhibitor V2

| # | Workflow | Notes |
|---|---|---|
| 1 | Follow Up After Exhibition | AI-generated follow-up emails. |
| 2 | Measure ROI | ROI calculator, pipeline estimation. |

## 9.3 Attendee V2

| # | Workflow | Notes |
|---|---|---|
| 1 | Save Products | Requires Products entity. |
| 2 | Navigate Venue | Requires floor plan + mobile optimization. |
| 3 | Continue Networking After Exhibition | Post-event dashboard and AI summary. |

## 9.4 Admin V2

| # | Workflow | Notes |
|---|---|---|
| 1 | Create Organization | Organization provisioning UI. |
| 2 | Manage Users | User search, suspend, activate. |
| 3 | Review Analytics | Platform health dashboard. |
| 4 | Manage Subscriptions | Plan management, billing. |
| 5 | Configure Platform | Feature flags, settings. |
| 6 | Handle Support Issues | Support ticket system. |

---

*End of Product Workflows*

*This document is the implementation blueprint for engineering.*

*Build what is documented. In the order specified by the dependency graph.
Skip what is not in MVP. Everything else waits.*
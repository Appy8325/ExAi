# Demo Readiness Checklist

**Date:** 2026-07-22
**Purpose:** Ensure the six reference dashboards are ready for a live product demo.

---

## Prerequisites

- [ ] Supabase project resumed (currently paused — `/readyz` returns 503)
- [ ] `DEMO_MODE=true` env var set (enables mock data fallbacks)
- [ ] Test accounts created for each persona: Exhibitor, Organizer, Admin
- [ ] Demo event(s) created with realistic data (not "Test Event 1")

---

## Demo Flow Readiness

### Exhibitor Dashboard Demo

- [ ] Navigate: `exhibit/{orgId}/dashboard/{exhibitorId}`
- [ ] Relationship pipeline shows populated cards with fake attendee names
- [ ] AI Intelligence section shows realistic talking points
- [ ] "Requires Attention" badge shows count (0 or small number preferred for clean demo)
- [ ] Recent Activity expands/collapses on click
- [ ] "Publish booth" button works and shows success state
- [ ] Page loads in <2s on demo network

### Organizer Dashboard Demo

- [ ] Navigate: `org/`
- [ ] Next Best Actions shows 2-4 realistic action items with numbered circles
- [ ] Attention Items shows a mix of states (or empty for clean demo)
- [ ] Events list shows 2-3 events with health dots and correct status badges
- [ ] All systems operational health message displays
- [ ] Page loads in <2s

### Event Dashboard Demo

- [ ] Navigate: `org/events/{eventId}`
- [ ] Event header with name, status badge, date
- [ ] Next Best Actions numbered items present
- [ ] Event Activity stats (4 cards) display correctly
- [ ] "Publish event" button works
- [ ] Breadcrumbs navigate correctly
- [ ] Secondary action links ("Event settings", "View report") are styled and accessible

### Admin Dashboard Demo

- [ ] Navigate: `admin/`
- [ ] Health bar shows ~92% with correct color
- [ ] Service Status grid shows 4 services with status badges
- [ ] "Investigate" links have correct href
- [ ] Recent Operational Events shows 2-3 entries
- [ ] Quick Action buttons navigate correctly
- [ ] Attention Required section conditionally renders

### Analytics Demo

- [ ] Navigate: `org/analytics`
- [ ] Event selector shows demo event(s) in tabs
- [ ] Pipeline Distribution funnel shows 4+ stages with bars
- [ ] Booth Engagement heatmap shows booths with heat bars
- [ ] Demographics section shows industry/topic breakdown
- [ ] All bars have correct aria-label (progressbar semantics if fixed)
- [ ] Page loads in <2s

### Reports Demo

- [ ] Navigate: `org/events/{eventId}/reports`
- [ ] Report header shows event context line (name · status · date range)
- [ ] "Download PDF" button is styled and accessible
- [ ] AI Executive Summary section present
- [ ] Report preview cards display correctly
- [ ] "Generate new report" button works

---

## Demo Data Requirements

| Data Point | Exhibitor | Organizer | Event | Admin | Analytics | Reports |
|------------|:---------:|:---------:|:-----:|:-----:|:---------:|:-------:|
| 2+ relationships | ✅ | — | — | — | — | — |
| 2+ attention items (or 0) | ✅ | ✅ | — | — | — | — |
| 2+ events with health data | — | ✅ | — | ✅ | ✅ (event selector) | ✅ |
| 4+ funnel stages | — | — | — | — | ✅ | — |
| 3+ booths with engagement | — | — | — | — | ✅ | — |
| Realistic event name/status | — | — | ✅ | ✅ | ✅ | ✅ |
| 2+ reports (or empty state) | — | — | — | — | — | ✅ |

---

## Demo Stability Checklist

- [ ] No console errors on any page (Error boundary catches gracefully)
- [ ] No layout shift on hydration (skeleton loading prevents this once implemented)
- [ ] No network race conditions (loading states are properly shown)
- [ ] Auth redirects to login if session expires mid-demo
- [ ] "Back" navigation works correctly from each page

---

## Verbal Talking Points Per Page

### Exhibitor
> "This is your exhibitor portal — you can see your relationship pipeline tracking who you've connected with, AI-generated talking points based on their profiles, and your booth publishing status."

### Organizer
> "As an organizer, you get a command-center view of all your events. Next Best Actions surfaces what needs attention, and the health system monitors event vitals in real time."

### Event
> "Drilling into a single event, you see the event-specific dashboard with activity stats, attendee engagement metrics, and one-click publishing."

### Admin
> "The admin view gives platform-wide oversight — service health, operational events, and infrastructure status at a glance."

### Analytics
> "The analytics dashboard shows pipeline performance and booth engagement heatmaps so you can optimize floor layout and resource allocation."

### Reports
> "Executive reports are AI-generated with a configurable date range. Download as PDF or regenerate with different parameters."

---

## Known Demo Blockers

| Blocker | Severity | Workaround |
|---------|----------|------------|
| Supabase paused | 🔴 Critical | Resume project at supabase.com or bypass with DEMO_MODE mock data |
| Analytics funnel bars missing aria | ⚠️ | Won't affect demo but should fix before launch |
| Event not found (404) | ⚠️ | Ensure demo eventId exists in database |
| Reports empty state | ⚠️ | Pre-generate at least one report |
# Navigation Structure

This document defines how users move through Concourse: the navigation tree of each surface, the organization/event context switchers, breadcrumb rules, command palette (⌘K) scope, deep-linking behavior, and where notifications, settings, and account controls live. It consumes the canonical route map owned by [11-information-architecture.md](11-information-architecture.md) — no route is introduced here — and its structures render inside the shells specified in [13-application-layout.md](13-application-layout.md).

---

## 1. Principles

1. **Navigation mirrors context nesting.** The sidebar/tab bar always answers "where am I?" in the org → event → exhibitor hierarchy (doc 11 §3); switching context is one dedicated control, never a side effect of clicking a nav item.
2. **The primary object is one tap away.** Console: current event's overview. Portal: capture and leads. Attendee: home/now. Admin: tenant lookup.
3. **Labels are canonical vocabulary.** Nav labels use foundation §12 terms exactly ("Agenda", never "Sessions"; "Exhibitors", never "Vendors").
4. **Every screen is addressable.** All navigation states correspond to URLs from doc 11 §4; nothing important hides in ephemeral client state (doc 11 §4.9 covers query-param state).

## 2. Organizer Console navigation

Desktop-first sidebar navigation inside `ConsoleShell` (doc 13 §3.1). The sidebar has two modes depending on whether an event context is active.

### 2.1 Org-level sidebar (no event selected)

```
[OrgSwitcher: Acme Expo Group ▾]
├── Dashboard            /org/[orgSlug]
├── Events               /org/[orgSlug]/events
├── Team                 /org/[orgSlug]/team
└── Settings             /org/[orgSlug]/settings
      ├── General        /org/[orgSlug]/settings            (tab-style sub-nav)
      ├── Billing        /org/[orgSlug]/settings/billing
      ├── Security       /org/[orgSlug]/settings/security   (enterprise)
      ├── Developers     /org/[orgSlug]/settings/developers (enterprise)
      └── Audit log      /org/[orgSlug]/settings/audit-log
```

### 2.2 Event-context sidebar

Entering any `/org/[orgSlug]/events/[eventSlug]/…` route switches the sidebar to event mode: the org section collapses to the switcher row, an `EventSwitcher` appears beneath it, and the nav shows the event tree grouped into four labeled sections. Grouping rationale: it matches the organizer's mental phases — run the floor, engage the audience, understand the event, administer it.

```
[OrgSwitcher: Acme Expo Group ▾]
[EventSwitcher: TechExpo 2027 ▾]        ← status pill: draft/published/live/completed/archived
├── Overview             …/[eventSlug]
├── Live                 …/live          ← highlighted while event status = live
│
├─ FLOOR
│   ├── Exhibitors       …/exhibitors    (+ /invite, /[eventExhibitorId] as children)
│   ├── Floor plan       …/floor-plan
│   ├── Agenda           …/agenda        (+ /new, /[agendaSessionId])
│   ├── Attendees        …/attendees     (+ /[registrationId])
│   └── Check-in         …/check-in
│
├─ ENGAGE
│   ├── Matchmaking      …/matchmaking
│   └── Announcements    …/announcements
│
├─ INTELLIGENCE
│   ├── Analytics        …/analytics
│   ├── Pulse            …/pulse
│   └── Knowledge base   …/knowledge-base
│
└─ MANAGE
    ├── Team             …/team
    └── Settings         …/settings      (+ /registration, /exhibitor-tiers as tab sub-nav)
```

Items whose entitlement is missing (e.g., Matchmaking on `launch` plan) render **locked, not hidden**, with an upgrade affordance — discoverability sells plans; hiding them makes the product look smaller than competitors'. Items whose *permission* is missing are hidden entirely (permission gaps are not upsell moments).

### 2.3 Back to org level

The first sidebar row under the switchers, "← All events", returns to `/org/[orgSlug]/events`. The browser back button is never the only way up.

## 3. Exhibitor Portal navigation

`PortalShell` (doc 13 §3.2). Same two-level structure, but the org level is deliberately thin (doc 11 §5) and the event level is ordered by proximity to revenue.

### 3.1 Org-level nav

```
[Exhibitor: Volta Robotics ▾]
├── My events            /exhibit/[orgSlug]
├── Catalog              /exhibit/[orgSlug]/catalog   (+ /[productId])
└── Organization         /exhibit/[orgSlug]/settings
```

### 3.2 Event-participation nav (desktop sidebar)

```
[Exhibitor: Volta Robotics ▾]
[Event: TechExpo 2027 ▾]                 ← tier pill: essentials/growth/intelligence
├── Dashboard            …/[eventSlug]
├── Capture              …/capture
├── Leads                …/leads          (+ /[leadId])
├── Meetings             …/meetings       (+ /[meetingId])       🔒 growth
├── Matchmaking          …/matchmaking
├── Follow-up Studio     …/followup       (+ /[sequenceId])      🔒 intelligence
├── Analytics            …/analytics
│
├─ PRESENCE
│   ├── Profile          …/profile
│   └── Listings         …/listings
│
└─ MANAGE
    ├── Team             …/team
    ├── Upgrade          …/upgrade        ← visually distinct (accent), hidden on intelligence tier
    └── Settings         …/settings
```

🔒 = entitlement-locked state per §2.2's locked-not-hidden rule; exact gates per page in [14-page-inventory.md](14-page-inventory.md).

### 3.3 Portal mobile navigation (Jamal's view)

Below the `md` breakpoint, `PortalShell` swaps the sidebar for a bottom tab bar — booth reps work phones-in-hand:

```
[ Capture ] [ Leads ] [ Meetings ] [ Dashboard ] [ More ]
```

Capture is the leftmost (thumb-primary) tab. "More" opens a sheet listing the remaining sidebar items. Rationale: the four tabs cover >95% of at-show rep actions; profile/listings editing is an admin/desktop task.

## 4. Attendee App navigation

`AttendeeShell` (doc 13 §3.3), mobile-first, five bottom tabs:

| Tab | Icon intent | Route | Contains |
|---|---|---|---|
| **Home** | house | `/e/[eventSlug]` | Now/next feed, quick actions (badge, scan), announcements |
| **Explore** | compass | `/e/[eventSlug]/explore` | Directory search; links into `/exhibitors/[exhibitorSlug]`, `/map`, `/agenda`, `/agenda/[agendaSessionId]` |
| **Copilot** | sparkle | `/e/[eventSlug]/copilot` | Expo Copilot conversation |
| **Schedule** | calendar | `/e/[eventSlug]/schedule` | My agenda bookmarks + meetings; links into `/meetings/[meetingId]` |
| **Profile** | person | `/e/[eventSlug]/profile` | Interests, visibility, links to `/badge`, `/notifications`, `/account` |

Non-tab routes and where they attach:

- `/badge` — opened from the Home quick-action row and Profile; renders as a full-screen sheet with max screen brightness hint; cached offline (foundation principle 4).
- `/scan` — floating action available from Home and Explore; camera sheet.
- `/matches` — surfaced as the top module on Home and a filter chip in Explore; it is a destination page, not a tab, because matchmaking feeds Home rather than competing with it.
- `/notifications` — bell in the Home header.
- `/register` — entry funnel; no tabs shown until registered (doc 11 §3.3 redirect rule).
- `/map` — reachable from Explore's map toggle and every exhibitor profile's booth chip.

Detail pages (`/exhibitors/[exhibitorSlug]`, `/agenda/[agendaSessionId]`, `/meetings/[meetingId]`) keep the tab bar visible and highlight their parent tab; back returns to the originating list with scroll position restored.

## 5. Platform Admin navigation

`AdminShell` (doc 13 §3.4). Flat sidebar, no context switchers (platform scope only):

```
├── Overview             /admin
├── Organizations        /admin/organizations   (+ /[orgId])
├── Users                /admin/users           (+ /[userId])
├── Events               /admin/events          (+ /[eventId])
├── Billing              /admin/billing
├── AI ops               /admin/ai
├── Jobs                 /admin/jobs
├── Flags                /admin/flags
└── Audit log            /admin/audit-log
```

## 6. Context switchers

Three switcher components (canonical names, spec'd in [15-component-inventory.md](15-component-inventory.md)):

| Component | Surfaces | Switches | Behavior |
|---|---|---|---|
| `OrgSwitcher` | Console, Portal | The `[orgSlug]` segment | Lists the user's memberships of the surface-appropriate org kind; typeahead beyond 5 orgs; "Create organization" (Console) at the foot. Selecting swaps the slug and lands on the equivalent org-level page. |
| `EventSwitcher` | Console, Portal (event context) | The `[eventSlug]` segment | Console: org's events, `live`/`published` first, then by start date; Portal: events the exhibitor participates in. Selecting preserves the current section when it exists in the target event (e.g., `/agenda` → `/agenda`), else lands on the event root. |
| `EventPicker` | Attendee App | The whole `/e/[eventSlug]` context | Listed under Profile → "My events" for users with multiple registrations. A full context change, not a header control — multi-event attendance is rare in-session. |

Rules: switchers always render current context as text (never icon-only); the last-used context per surface is stored server-side per user and drives `/auth/select-context` defaults; switchers never cross surfaces (moving from Console to Portal is a link in the app-level account menu for users who hold both hats, e.g. an organizer who also exhibits).

## 7. Breadcrumb rules

1. Breadcrumbs appear on **Console, Portal (≥`md`), and Admin** content headers. The Attendee App never shows breadcrumbs — tab + back covers its depth of 2.
2. Breadcrumbs are derived from route segments below the context switchers: switchers already show org/event, so breadcrumbs start at the section. Example, `/org/acme/events/techexpo-2027/exhibitors/018f…`: `Exhibitors / Volta Robotics`.
3. Maximum 3 rendered levels; deeper paths collapse the middle (`Exhibitors / … / Note`). No Phase-1 route exceeds 3.
4. Leaf crumb = entity display name (fetched), never the raw id; while loading it shows a skeleton chip (doc 13 §5).
5. Every crumb is a link except the leaf.

## 8. Command palette (⌘K)

One `CommandPalette` component, scoped per surface. It combines **navigation** (jump to any nav item the user can access), **entity search** (doc 11 §6 aggregate `/v1/search`), and **actions** (verb commands that open the relevant flow). Mobile: no palette on the Attendee App (search lives in Explore; NL questions belong to Copilot — two entry points is enough); Portal mobile exposes the palette behind a search icon in the header.

| Surface | Scope of results | Entity groups | Action examples |
|---|---|---|---|
| Console (org level) | Current org | Events | "Create event", "Invite teammate" |
| Console (event context) | Current event (plus org-level nav) | Exhibitors, attendees (name/email/badge_code), agenda sessions, booths | "Invite exhibitors", "New agenda session", "Send announcement", "Open check-in" |
| Portal (event context) | Current participation | Leads, meetings, listings, catalog products | "Capture lead", "Book meeting", "Export leads" (entitlement-checked, locked style per §2.2) |
| Admin | Platform | Organizations, users (email), events | "Look up subscription", "Toggle flag" |

Rules: results are permission-filtered server-side (never rendered-then-denied); entity results show type badges and route on Enter; recent items appear before typing; palette actions are the same commands as on-page buttons — no palette-only functionality (otherwise features become undiscoverable to non-keyboard users).

## 9. Deep-linking rules

Every route in doc 11 §4 is a stable deep link. Behavior matrix for an incoming link:

| Condition | Behavior |
|---|---|
| No session | Redirect `/auth/login?next=<path>`; after auth, continue to `next` (same-origin validated, doc 11 §4.9) |
| Session, no relationship to tenant | 404 (anti-enumeration, doc 11 §3.3) |
| Session, member, missing permission | 403 page with "switch context" affordance |
| Session, permission ok, missing entitlement | Page-level locked state with upgrade path (doc 13 §5.5) — never a 404, the URL is real |
| Attendee link, not registered, event `published`/`live` | Redirect `/e/[eventSlug]/register?next=<path>`, resume after registering |
| Token links (`/auth/invite/[token]`, `/auth/magic-link/[token]`) | Single-use; expired/used tokens render a specific recovery page (re-request flow), never a generic error |
| Notification taps (push/email) | Always deep-link to the entity route (e.g., `/e/[eventSlug]/meetings/[meetingId]`), parameterized by the notification service ([33-notification-system.md](33-notification-system.md)) |

QR payloads printed on signage/badges encode full canonical URLs (e.g., booth QR → `/e/[eventSlug]/exhibitors/[exhibitorSlug]`), so any camera app becomes an entry point.

## 10. Mobile navigation behavior

| Surface | Below `lg` | Below `md` | Offline |
|---|---|---|---|
| Console | Sidebar collapses to hamburger-triggered drawer; topbar persists | Same; check-in station (`/check-in`) stays full-screen and touch-first by design | Read-only banner; check-in queues scans locally |
| Portal | Sidebar → drawer | Bottom tab bar (§3.3) | `/capture` fully offline: queued scans with sync badge (doc 13 §5.4) |
| Attendee | Mobile-first already; desktop gets centered column (doc 13 §3.3) | Native behavior | Badge, schedule, saved exhibitors served from cache; Copilot/search disabled with explanation |
| Admin | Below `md`: unsupported-viewport notice with link home. Internal tool; building a phone layout for Alex is not worth it | — | n/a |

Gesture rules (Attendee + Portal mobile): system back = up one level; sheets dismiss by swipe-down; tab re-tap scrolls to top; no horizontal-swipe page switching (conflicts with map/board panning).

## 11. Where notifications, settings, and account live

| Concern | Console | Portal | Attendee | Admin |
|---|---|---|---|---|
| Notification inbox | Bell in topbar → `NotificationPanel` popover | Same | Bell on Home header → `/e/[eventSlug]/notifications` | None (ops alerts go to the on-call tooling, not in-app) |
| Notification preferences | `/account/notifications` (global) | Same | Same, plus per-event overrides at `/e/[eventSlug]/profile` | Same |
| Tenant/context settings | Sidebar → Settings (`/org/[orgSlug]/settings…`, event `/settings…`) | Sidebar → Settings / Organization | Not applicable (no tenant to administer) | `/admin/flags`, `/admin/billing` |
| Personal account | Avatar menu (topbar, bottom-left of sidebar on collapsed mode) → `/account…` | Same | Profile tab → "Account & security" → `/account…` | Avatar menu → `/account…` |
| Sign out / switch surface | Avatar menu | Avatar menu | Profile tab foot | Avatar menu |

The avatar menu is identical across desktop shells (`AccountMenu` in [15-component-inventory.md](15-component-inventory.md)): current identity, "My account", surface-switch links the user is eligible for (per §6), theme, sign out. This is the only navigation element shared verbatim by all shells.

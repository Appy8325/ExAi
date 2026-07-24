# Event Management Architecture

**Date:** 2026-07-23
**EPIC:** 4 — Event Management
**Status:** ✅ IMPLEMENTED

---

## Implementation Status

| Scope Item | Implementation | Status |
|-----------|---------------|--------|
| Archive controller endpoint | `POST /v1/organizations/:orgId/events/:eventId/archive` added to `OrganizerManagementController` | ✅ Complete |
| Archive service exposed | `EventsService.archive()` was already exported via `EventsModule`; no change needed | ✅ Complete |
| Archive action in Event Settings | `ArchiveEventButton` added to settings page (draft + non-draft cases); archived events redirect to `/org/events` | ✅ Complete |
| CreateEventForm timezone | Replaced hardcoded `Asia/Kolkata` with browser-detected timezone via `Intl.DateTimeFormat().resolvedOptions().timeZone` + `COMMON_TIMEZONES` dropdown | ✅ Complete |

---

## Objective

Build the first production-complete organizer workflow for the event lifecycle: **Create → Edit → Publish → Archive**. Use the Dashboard Design Standard. No redesigns of existing dashboards.

---

## 1. Current State Assessment

### What Already Exists

| Component | Status | Notes |
|-----------|--------|-------|
| `POST /v1/organizations/:orgId/events` | ✅ Implemented | `OrganizerManagementController.createEvent` |
| `PATCH /v1/organizations/:orgId/events/:eventId` | ✅ Implemented | `OrganizerManagementController.updateEvent` |
| `POST /v1/organizations/:orgId/events/:eventId/publish` | ✅ Implemented | `OrganizerManagementController.publishEvent` |
| `POST /v1/organizations/:orgId/events/:eventId/archive` | ✅ **Implemented** | `OrganizerManagementController.archiveEvent` (EPIC 4) |
| `EventsService.archive()` | ✅ Implemented | Service method exists and validates |
| `EventsRepository.archive()` | ✅ Implemented | Sets `status = 'archived'` |
| `CreateEventForm` (UI) | ✅ **Fixed** | Browser-detected timezone + dropdown; no longer hardcoded (EPIC 4) |
| `EventSettingsForm` (UI) | ✅ Complete | name, slug, timezone, start/end, privacyPolicyUrl, logoUrl, primaryColor |
| `PublishEventButton` (UI) | ✅ Complete | Publishes event via API |
| `ArchiveEventButton` (UI) | ✅ **Implemented** | New component in `organizer-forms.tsx` (EPIC 4) |
| Event list page (`/org/events`) | ✅ Complete | Shows events with status badges and create form |
| Event settings page (`/org/events/:id/settings`) | ✅ **Enhanced** | Edit form + Publish + Archive actions (EPIC 4) |
| Archive action (UI) | ✅ **Implemented** | ArchiveEventButton on settings page |

### Backend Gaps

*(All gaps resolved by EPIC 4 implementation)*

### Database Schema Coverage

The existing `events` table covers all fields needed for this EPIC:

| Field | Schema | UI Form | Notes |
|-------|--------|---------|-------|
| `name` | ✅ | ✅ Create + Edit | |
| `slug` | ✅ | ✅ Edit only (auto in Create) | Validated: 3-63 lowercase-alphanumeric-hyphens |
| `timezone` | ✅ | ⚠️ Edit only; Create has hardcoded value | IANA timezone validation exists |
| `startAt` | ✅ | ✅ Both | |
| `endAt` | ✅ | ✅ Both | Must be after startAt |
| `privacyPolicyUrl` | ✅ | ✅ Edit only | Required for publish; not in Create |
| `logoUrl` | ✅ | ✅ Edit only | |
| `primaryColor` | ✅ | ✅ Edit only | Hex validation |
| `status` | ✅ | ✅ Display only | draft → published → live → completed → archived |

### Fields NOT in Schema (Out of Scope for EPIC)

> The scope requests "Description," "Venue," and "Registration settings." These fields do not exist in `packages/database/schema/events-floor.ts`. Adding them would require:
> - A database migration (schema change)
> - Updates to `EventsService`/`EventsRepository` (service change)
> - API contract changes
> - UI form additions
>
> **These are explicitly out of scope for EPIC 4.** They should be logged in the backlog for a future milestone.

---

## 2. Required Implementation

### 2.1 Archive API Endpoint (Backend)

**File:** `apps/api/src/modules/engagement/organizer-management.controller.ts`

**Add to `OrganizerManagementController`:**

```
POST /v1/organizations/:organizationId/events/:eventId/archive
Permission: organizations:update
```

```ts
@Post("events/:eventId/archive")
@RequiredOrganizationPermissions("organizations:update")
archiveEvent(
  @Param("organizationId") organizationId: string,
  @Param("eventId") eventId: string,
  @Req() request: AuthenticatedRequest,
) {
  return this.events.archive(
    organizationId,
    eventId,
    request.requestContext!.principal.userId!,
  );
}
```

**Service behavior** (`EventsService.archive` already handles):
- Event must exist and not already be archived
- Returns the archived event record
- Throws `NotFoundException` if event doesn't exist
- Throws `NotFoundException` if already archived (idempotent — could return 200 or 404)

**Archive permission:** Same as publish/update — `organizations:update`. Owner/admin can archive; members cannot.

---

### 2.2 Create Event Form — Timezone Field

**File:** `apps/web/src/app/(console)/org/organizer-forms.tsx`

**Change `CreateEventForm`:**
- Replace hardcoded `timezone: "Asia/Kolkata"` with a `<select>` or `<Input>` for IANA timezone
- Default to `Intl.DateTimeFormat().resolvedOptions().timeZone` (user's browser timezone)
- Add a helper `COMMON_TIMEZONES` array with 8-12 common options (e.g., America/New_York, Europe/London, Asia/Kolkata, Asia/Tokyo, Australia/Sydney, UTC)

**No changes to API** — backend already validates any IANA timezone string.

---

### 2.3 Archive Action — Event Settings Page

**File:** `apps/web/src/app/(console)/org/events/[eventId]/settings/page.tsx`

**Add below the Publication section (or alongside PublishEventButton):**

```
[Draft events]: Show PublishEventButton + Archive button (secondary/danger)
[Published/Live/Completed events]: Show "Open public event" link + Archive button (danger)
[Archived events]: Redirect or show "Event archived" message
```

Archive button should:
- Be a `<Button variant="danger">` or `<Button variant="secondary">` with clear label "Archive event"
- Call `organizerRequest(..., 'POST', {})` to `POST /v1/organizations/:orgId/events/:eventId/archive`
- On success: redirect to `/org/events` with `router.push('/org/events')`
- On error: display error message (same pattern as PublishEventButton)

**Draft event settings page state machine:**

| Status | Primary Action | Secondary Action |
|--------|---------------|-----------------|
| `draft` | PublishEventButton | Archive button |
| `published` | (none — event is public) | Archive button |
| `live` | (none) | Archive button |
| `completed` | (none) | Archive button |
| `archived` | Redirect to `/org/events` | — |

---

### 2.4 Archive Action — Event List

**File:** `apps/web/src/app/(console)/org/events/page.tsx`

**Add to each event card:**
- Archive icon button (danger variant) for non-archived events
- Or an "..." dropdown with Archive option (consistent with Exhibitor list patterns)
- Confirmation required before archive (use `window.confirm` or a simple confirm dialog)

---

### 2.5 Archive Action — Event Dashboard

**File:** `apps/web/src/app/(console)/org/events/[eventId]/page.tsx`

**Add to the bottom action bar:**
- Archive button (after "Public event" link, before or after existing actions)
- Show for all statuses except `archived`
- For `draft` events: place before or alongside PublishEventButton
- For `archived` events: show "Archived" badge and redirect to `/org/events`

---

## 3. Component Inventory

### New Components

| Component | Type | Purpose |
|-----------|------|---------|
| `ArchiveEventButton` | Client component | Confirms + calls archive API + redirects |
| `EventStatusBadge` | Already exists | `StatusBadge` maps status → tone (reuse) |

### Modified Components

| Component | Change |
|-----------|--------|
| `CreateEventForm` | Add timezone select with browser default |
| `EventSettingsPage` | Add Archive button for all non-archived events |
| `EventsPage` | Add archive action to event cards |
| `EventOverviewPage` | Add Archive button in action bar |

### Unchanged (already complete)

- `PublishEventButton` — no changes needed
- `EventSettingsForm` — no changes needed
- Events API (create/update/publish) — no changes needed

---

## 4. Page Layout

### Event Settings Page — Final Layout

```
PageHeader: "Event settings and branding"

EventSettingsForm (name, slug, timezone, dates, branding, privacy policy)

[Publication section — draft only]
  PublishEventButton (primary)
  [spacer]
  ArchiveEventButton (danger, secondary emphasis)

[Archived event — for non-draft]
  "Open public event" link
  [spacer]
  ArchiveEventButton (danger)
```

### Event List — Archive Integration

Each event card in the grid gains an archive action. Options:
- Small icon button (trash/archive) in the card header — accessible
- Or "..." dropdown with Archive option

Confirmation dialog: "Archive [event name]? This cannot be undone." [Cancel] [Archive]

---

## 5. Validation Rules

All validation is handled by `EventsService` — no changes needed.

| Rule | Enforced By |
|------|-------------|
| Archive only non-archived events | `EventsRepository.archive` (WHERE status != 'archived') |
| Cannot publish without privacyPolicyUrl | `EventsService.publish()` throws BadRequestException |
| Only draft events can be published | `EventsService.publish()` checks `event.status === 'draft'` |
| Slug format validation | `EventsService.validateSlug()` |
| Timezone validation | `EventsService.validateTimezone()` via `Intl.DateTimeFormat` |
| End date must be after start date | `EventsService.validateDates()` |

---

## 6. Error Handling

| Scenario | Behavior |
|----------|----------|
| Archive fails (network) | Show error message below button |
| Archive fails (event not found) | Redirect to `/org/events` with error toast |
| Archive already archived | `EventsRepository.archive` returns `undefined` → service throws `NotFoundException` |
| User not authorized | Guard returns 403 — handled by `OrganizationAuthorizationGuard` |

**UI error pattern** — reuse `ErrorMessage` component already in `organizer-forms.tsx`.

---

## 7. Permissions

All event management actions require `organizations:update` permission on the parent organization.

| Action | Permission | Roles with Permission |
|--------|-----------|----------------------|
| Create event | `organizations:update` | owner, admin |
| Edit event | `organizations:update` | owner, admin |
| Publish event | `organizations:update` | owner, admin |
| Archive event | `organizations:update` | owner, admin |
| View event | `organizations:read` | owner, admin, **member** |

The `OrganizationAuthorizationGuard` + `RequireOrganizationPermissions` decorator handles enforcement. No changes to the permission model.

---

## 8. Routes

| Method | Path | Description | Notes |
|--------|------|-------------|-------|
| POST | `/v1/organizations/:orgId/events` | Create event | Already exists |
| PATCH | `/v1/organizations/:orgId/events/:eventId` | Update event | Already exists |
| POST | `/v1/organizations/:orgId/events/:eventId/publish` | Publish event | Already exists |
| **POST** | `/v1/organizations/:orgId/events/:eventId/archive` | **Archive event** | **New — this EPIC** |

---

## 9. Database Schema

No schema changes. Existing `events` table:

```sql
events (
  id, organization_id, name, slug, timezone,
  start_at, end_at,
  privacy_policy_url, logo_url, primary_color,
  status,  -- CHECK IN ('draft','published','live','completed','archived')
  created_at, updated_at
)
```

All EPIC 4 fields are already present. Archive sets `status = 'archived'`.

---

## 10. API Response Shapes

### Archive Response

```ts
// POST /v1/organizations/:orgId/events/:eventId/archive
// Response: 200 OK
{
  id: string;
  name: string;
  status: "archived";
  // ... full event record
}

// Errors:
// 404 Not Found — event does not exist or already archived
// 403 Forbidden — user lacks organizations:update permission
```

### Update Event (no changes — already complete)

```ts
// PATCH /v1/organizations/:orgId/events/:eventId
{
  name?: string;
  slug?: string;
  timezone?: string;
  startAt?: string;      // ISO 8601
  endAt?: string;         // ISO 8601
  privacyPolicyUrl?: string | null;
  logoUrl?: string | null;
  primaryColor?: string;  // #rrggbb
}
```

### Create Event (timezone field enhancement only)

The API already accepts `timezone` in the request body. The UI change is to pass the user's selected timezone instead of the hardcoded value.

---

## 11. Out of Scope (Logged for Future Milestones)

The following scope items require schema migrations and architecture changes. They are documented here to avoid scope creep:

| Item | Reason | Follow-up |
|------|--------|-----------|
| Event description field | Not in DB schema | Future milestone with schema migration |
| Venue field | Not in DB schema | Future milestone with schema migration |
| Registration settings (capacity, visibility) | Not in DB schema | Future milestone |
| Event cover/banner image | Requires file storage + DB field | Future milestone |
| Custom registration form fields | Requires new DB entity | Future milestone |

---

## 12. Implementation Order (EPIC 4 — Completed)

| # | Step | Status |
|---|------|--------|
| 1 | Backend: Add archive controller endpoint | ✅ Complete |
| 2 | Archive service already exported via `EventsModule` | ✅ Already available |
| 3 | ArchiveEventButton: Client component with confirmation + API call | ✅ Complete |
| 4 | EventSettingsPage: Add Archive button (draft + non-draft) | ✅ Complete |
| 5 | CreateEventForm: Fix timezone field (browser detection + dropdown) | ✅ Complete |
| 6 | Verify: Full lifecycle test — create → edit → publish → archive | ⏳ Pending (live testing) |

**Note:** Events list archive action and Event Overview page archive button were explicitly out of scope ("Add Archive action to Event Settings **only**").

---

## 13. Files Changed

| File | Change | Status |
|------|--------|--------|
| `apps/api/src/modules/engagement/organizer-management.controller.ts` | Add `archiveEvent` POST method | ✅ |
| `apps/web/src/app/(console)/org/organizer-forms.tsx` | Add `ArchiveEventButton` + fix `CreateEventForm` timezone | ✅ |
| `apps/web/src/app/(console)/org/events/[eventId]/settings/page.tsx` | Import `ArchiveEventButton`; add Archive to draft + non-draft cases; `redirect` on archived | ✅ |

**Total new files:** 0
**Total modified files:** 3
**Total deleted files:** 0

---

## 14. Dashboard Design Standard Compliance

All event management pages follow the **Event Dashboard** page type taxonomy defined in `DASHBOARD_DESIGN_STANDARD.md v1.1`:

- Uses `PageHeader` with event name as title
- Breadcrumbs for navigation depth (`Events > [Event Name]`)
- Action bar at bottom with primary + secondary actions
- `StatusBadge` for event status display
- `space-y-section` between page sections
- `Card` + `SectionHeader` for grouped content
- `Button asChild` for navigation links

---

## 15. Pending Questions

| # | Question | Recommendation |
|---|----------|---------------|
| 1 | Archive confirmation UX — `window.confirm` or inline dialog component? | Use `window.confirm()` for RC-1 (simple, no new component). Post-RC-1: build a `ConfirmDialog` component. |
| 2 | Should archived events be hidden from the main events list? | Show with "archived" badge, not hidden. Allows organizer to verify archived state. |
| 3 | What happens when archiving a `live` event — is there a confirmation warning? | Yes — add "This event is currently live. Archiving will close public registration." to the confirm message. |
| 4 | Create event form timezone — should it be a free-text input (current validation accepts any IANA timezone) or a dropdown of common timezones? | Dropdown of 10-15 common IANA timezones + "Other" option with free-text. Prevents invalid values. |
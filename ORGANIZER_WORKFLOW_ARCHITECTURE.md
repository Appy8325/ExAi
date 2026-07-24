# Organizer Workflow Architecture

**Epic:** EPIC 4 — Organizer Experience
**Previous Epics:** CLOSED
**Status:** Architecture phase — implementation pending

---

## 1. User Journey

```
Onboarding
  │
  ├─ Create Organization (if none exists)
  │
  ▼
Organizer Dashboard (/org)
  │
  ├─ Create Event → Draft Event
  │   ├─ Configure Settings (name, dates, timezone, branding, policy)
  │   ├─ Add Sessions (title, time, room, capacity)
  │   ├─ Add Speakers (name, bio, photo, company)
  │   ├─ Invite Exhibitors → they accept → booth setup
  │   └─ Publish Event → Live
  │
  ├─ View Analytics (funnel, heatmap, industries, topics)
  │
  ├─ Generate Reports (AI executive summary, download PDF)
  │
  └─ Manage Team (invite members, manage roles)
```

### Event Lifecycle

```
DRAFT → PUBLISHED → LIVE → COMPLETED → ARCHIVED
  │         │         │        │           │
  │    configure     event    wrap-up   soft-delete
  │    sessions      in       &         (hide from UI)
  │    speakers      progress  report
  │    exhibitors
  │
  Can edit everything.
  Can delete.
```

### States

| Status | Description | Editable? | Visible to attendees? |
|--------|-------------|-----------|----------------------|
| `draft` | Being configured, not yet visible | Yes | No |
| `published` | Sessions & exhibitors visible, registration open | Most fields | Yes |
| `live` | Event is happening now | Limited | Yes (highlighted) |
| `completed` | Event has ended, reports available | Reports only | Archived |
| `archived` | Soft-deleted | No | No |

---

## 2. Routes

### Organizer Console (`/org/`)

| Route | Page | Purpose | Exists? |
|-------|------|---------|---------|
| `/org` | Dashboard | KPI cards, event list, quick actions | ✅ |
| `/org/events` | Events list | All events in card grid | ✅ |
| `/org/events/[eventId]` | Event overview | KPI, actions, status | ✅ |
| `/org/events/[eventId]/sessions` | Session list | Manage agenda sessions | **NEW** |
| `/org/events/[eventId]/sessions/new` | Create session | Add a session | **NEW** |
| `/org/events/[eventId]/sessions/[sessionId]` | Edit session | Update or delete | **NEW** |
| `/org/events/[eventId]/speakers` | Speaker list | Manage speakers | **NEW** |
| `/org/events/[eventId]/speakers/new` | Create speaker | Add a speaker | **NEW** |
| `/org/events/[eventId]/speakers/[speakerId]` | Edit speaker | Update or delete | **NEW** |
| `/org/events/[eventId]/exhibitors` | Exhibitor list | Manage exhibitor invitations | ✅ |
| `/org/events/[eventId]/exhibitors/[exhibitorId]` | Exhibitor detail | View exhibitor profile | ✅ |
| `/org/events/[eventId]/registrations` | Registrations | View registered attendees | **NEW** |
| `/org/events/[eventId]/reports` | Reports | AI report, download PDF | ✅ |
| `/org/events/[eventId]/settings` | Settings | Event configuration form | ✅ |
| `/org/analytics` | Analytics | Cross-event funnel, heatmap | ✅ |
| `/org/settings` | Org settings | Organization name, profile | ✅ |
| `/org/users` | Team | Member list, invitations | ✅ |

### Tab Navigation (Event Detail Layout)

Current tabs: `Overview | Exhibitors | Reports | Settings`

**New tabs:** `Overview | Sessions | Speakers | Exhibitors | Registrations | Reports | Settings`

Order reflects the natural workflow: configure timing → configure content → manage participants → view results.

---

## 3. API Endpoints

### Sessions

All under `/v1/organizations/:organizationId/events/:eventId/sessions`

| Method | Path | Permission | Purpose |
|--------|------|-----------|---------|
| `GET` | `/sessions` | `organizations:read` | List all sessions for event |
| `POST` | `/sessions` | `organizations:update` | Create a session |
| `GET` | `/sessions/:sessionId` | `organizations:read` | Get session details |
| `PATCH` | `/sessions/:sessionId` | `organizations:update` | Update session |
| `DELETE` | `/sessions/:sessionId` | `organizations:update` | Archive session |
| `POST` | `/sessions/:sessionId/publish` | `organizations:update` | Publish session |
| `POST` | `/sessions/:sessionId/unpublish` | `organizations:update` | Unpublish session |

### Speakers

All under `/v1/organizations/:organizationId/events/:eventId/speakers`

| Method | Path | Permission | Purpose |
|--------|------|-----------|---------|
| `GET` | `/speakers` | `organizations:read` | List all speakers for event |
| `POST` | `/speakers` | `organizations:update` | Create a speaker |
| `GET` | `/speakers/:speakerId` | `organizations:read` | Get speaker details |
| `PATCH` | `/speakers/:speakerId` | `organizations:update` | Update speaker |
| `DELETE` | `/speakers/:speakerId` | `organizations:update` | Delete speaker |

### Registrations

All under `/v1/organizations/:organizationId/events/:eventId/registrations`

| Method | Path | Permission | Purpose |
|--------|------|-----------|---------|
| `GET` | `/registrations` | `organizations:read` | List registered attendees |
| `GET` | `/registrations/:registrationId` | `organizations:read` | Get attendee registration details |

### Existing endpoints (no changes)

- `POST /v1/organizations/:orgId/events` — Create event
- `PATCH /v1/organizations/:orgId/events/:eventId` — Update event
- `POST /v1/organizations/:orgId/events/:eventId/publish` — Publish event
- `GET /v1/organizer/events/:eventId/analytics` — Analytics
- `GET /v1/organizer/events/:eventId/report` — Report
- `POST /v1/organizer/events/:eventId/report` — Generate report
- `GET /v1/organizer/events/:eventId/report.pdf` — Download PDF
- `GET /v1/organizations/:orgId/members` — List members
- `POST /v1/organizations/:orgId/members/invite` — Invite member
- `GET /v1/organizations/:orgId/events/:eventId/exhibitor-invitations` — List exhibitor invitations
- `POST /v1/organizations/:orgId/events/:eventId/exhibitor-invitations` — Invite exhibitor

---

## 4. Database Entities

### Existing

| Table | File | Status |
|-------|------|--------|
| `events` | `events-floor.ts` | ✅ Complete |
| `agenda_sessions` | `events-floor.ts` | ✅ Schema exists, no API/UI |
| `event_exhibitors` | `exhibitor.ts` | ✅ Complete |
| `organizations` | `identity.ts` | ✅ Complete |
| `users` | `identity.ts` | ✅ Complete |
| `organization_memberships` | `identity.ts` | ✅ Complete |
| `organizer_reports` | `engagement.ts` | ✅ Complete |
| `attendee_profiles` | `engagement.ts` | ✅ Complete |

### New: `speakers`

Created in `packages/database/schema/events-floor.ts`:

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `uuid` PK | Default `uuid_generate_v7()` |
| `event_id` | `uuid` FK → events | NOT NULL, cascade delete |
| `name` | `text` | NOT NULL |
| `bio` | `text` | Nullable |
| `photo_url` | `text` | Nullable |
| `company` | `text` | Nullable |
| `title` | `text` | Nullable (e.g., "VP of Engineering") |
| `social_links` | `jsonb` | Nullable, default `[]` |
| `sort_order` | `integer` | Nullable, for display ordering |
| `created_at` | `timestamptz` | Default now |
| `updated_at` | `timestamptz` | Default now |

Indexes:
- Unique on `(event_id, name)` — prevent duplicate speaker names per event
- Index on `(event_id)` — fast lookup by event

### New: `session_speakers` (join table)

Created in `packages/database/schema/events-floor.ts`:

| Column | Type | Constraints |
|--------|------|-------------|
| `session_id` | `uuid` FK → agenda_sessions | NOT NULL, cascade delete |
| `speaker_id` | `uuid` FK → speakers | NOT NULL, cascade delete |

Primary key: `(session_id, speaker_id)`

---

## 5. Service & Repository Layer

### SessionsService + SessionsRepository

**Pattern:** Follows `EventsService` / `EventsRepository` structure exactly.

**SessionsService** (`apps/api/src/modules/agenda/`):
- `create(input)` — Validates title, slug, dates, creates session
- `findById(eventId, sessionId)` — Single session lookup
- `listByEvent(eventId)` — Ordered by startAt
- `update(input)` — Partial update with validation
- `archive(eventId, sessionId)` — Soft delete (set status = archived)
- `publish(eventId, sessionId)` — Draft → published
- `unpublish(eventId, sessionId)` — Published → draft

**SessionsRepository** (`apps/api/src/modules/agenda/`):
- Standard CRUD with RLS context and unique violation handling
- Scoped to event ID (no cross-event access)

### SpeakersService + SpeakersRepository

**SpeakersService** (`apps/api/src/modules/events/` or new module):
- `create(input)` — Validates name, creates speaker
- `findById(eventId, speakerId)` — Single speaker lookup
- `listByEvent(eventId)` — Ordered by sort_order, then name
- `update(input)` — Partial update
- `delete(eventId, speakerId)` — Hard delete (no archive needed for simple entity)

**SpeakersRepository** (`apps/api/src/modules/events/`):
- Standard CRUD with RLS context
- Scoped to event ID

### RegistrationQueries (read-only)

- `listByEvent(eventId)` — Join `attendee_profiles` with `lead_submissions` or a dedicated registration table. For MVP, registrations are read from existing attendee interaction data.

---

## 6. Validation

### Session Validation

| Field | Rules |
|-------|-------|
| `title` | Required, trimmed, max 200 chars |
| `slug` | Auto-generated from title if not provided. 3-63 chars, lowercase alphanumeric + hyphens. Unique per event. Cannot change once created. |
| `description` | Optional, max 2000 chars |
| `startAt` / `endAt` | Required, end > start. Must fall within event date range. |
| `timezone` | Valid IANA timezone string |
| `room` | Optional, max 100 chars |
| `capacity` | Optional, must be ≥ 0 if provided |
| `status` | One of: `draft`, `published`, `archived` |

### Speaker Validation

| Field | Rules |
|-------|-------|
| `name` | Required, trimmed, max 200 chars |
| `bio` | Optional, max 2000 chars |
| `photo_url` | Optional, must be HTTP(S) URL if provided |
| `company` | Optional, max 200 chars |
| `title` | Optional, max 200 chars |
| `social_links` | Optional JSON array of `{platform, url}` objects |

---

## 7. Permissions

### Role-Based Access (existing system)

| Role | Sessions | Speakers | Registrations |
|------|----------|----------|---------------|
| `owner` | Full CRUD | Full CRUD | Read |
| `admin` | Full CRUD | Full CRUD | Read |
| `member` | Read only | Read only | Read |

### API Guard Pattern

```typescript
@Controller("v1/organizations/:organizationId/events/:eventId/sessions")
@UseGuards(SupabaseRequestContextGuard, OrganizationAuthorizationGuard)
@UseInterceptors(RequestContextInterceptor)
export class SessionsController {
  @Get()
  @RequireOrganizationPermissions("organizations:read")
  list() { /* ... */ }

  @Post()
  @RequireOrganizationPermissions("organizations:update")
  create() { /* ... */ }
}
```

Same pattern for SpeakersController.

### RLS (Row-Level Security)

Every transaction calls `setRlsContext(tx, organizationId, userId)` before any query. This ensures:
- Data is scoped to the user's organization
- The user must have an active membership in that organization
- Policies are enforced at the database level

---

## 8. Error Handling

### API Errors

| Code | HTTP | When |
|------|------|------|
| Session not found | 404 | Session ID doesn't exist for this event |
| Speaker not found | 404 | Speaker ID doesn't exist for this event |
| Slug conflict | 409 | Session slug already exists for this event |
| Validation error | 400 | Invalid dates, missing fields, bad timezone |
| Permission denied | 403 | User lacks required org permissions |

### Error response format

```json
{
  "detail": "Session already exists with this slug.",
  "status": 409
}
```

### UI Error Handling

- Forms use `ErrorMessage` component (existing) for inline error display
- API failures show the error message from the server response
- Network errors show "Something went wrong." fallback
- Loading states use existing `Skeleton` / `SkeletonCard` components

---

## 9. Loading States

### Page Structure

Every new page follows the existing pattern:

```
page.tsx         → async server component (data fetch + render)
loading.tsx      → SkeletonCard / Skeleton (reuse existing)
error.tsx        → "Something went wrong" (optional, can use default)
```

### Data Fetching Pattern

```typescript
// page.tsx — Server Component
async function Page({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const orgId = await getCurrentOrgId();  // from auth
  const sessions = await loadSessions(orgId, eventId);  // server action or fetch
  // ... render
}
```

### Client Components

Interactive elements (forms, buttons) are client components using `useTransition` for pending states (existing pattern from `organizer-forms.tsx`).

### Empty States

- Empty session list: "No sessions yet. Create your first session."
- Empty speaker list: "No speakers yet. Add a speaker."
- Empty registrations: "No attendees registered yet."

Use existing `EmptyState` component from `@concourse/ui`.

---

## 10. Implementation Phases

### Phase 1: Event CRUD (already mostly complete)
- [x] Create event form
- [x] Event settings form
- [x] Publish event button
- [x] Existing API endpoints
- [ ] Add archive event button on settings page
- [ ] Add event status transitions on overview page

### Phase 2: Sessions + Speakers (NEW)
- [ ] Speakers database schema (migration)
- [ ] SessionsService + SessionsRepository
- [ ] SpeakersService + SpeakersRepository
- [ ] SessionsController (API endpoints)
- [ ] SpeakersController (API endpoints)
- [ ] Sessions list/create/edit pages
- [ ] Speakers list/create/edit pages
- [ ] Session-speaker association
- [ ] Update event layout tabs
- [ ] Seed data update for sessions and speakers

### Phase 3: Exhibitor Management (already mostly complete)
- [x] Invite exhibitor form
- [x] Exhibitor list page
- [x] Exhibitor detail page
- [x] API endpoints

### Phase 4: Registration Management (NEW)
- [ ] Registration queries service
- [ ] RegistrationsController (read-only API)
- [ ] Registrations page listing attendees
- [ ] Registration detail view

### Phase 5: Analytics + Reports (already complete)
- [x] Analytics page with funnel, heatmap, industries, topics
- [x] Reports page with AI generation, download PDF
- [x] Full API backend

---

## 11. Files to Create/Modify

### New Files

```
apps/api/src/modules/agenda/agenda-sessions.service.ts
apps/api/src/modules/agenda/agenda-sessions.repository.ts
apps/api/src/modules/agenda/agenda-sessions.controller.ts
apps/api/src/modules/agenda/speakers.service.ts
apps/api/src/modules/agenda/speakers.repository.ts
apps/api/src/modules/agenda/speakers.controller.ts
apps/api/src/modules/agenda/registrations.service.ts
apps/api/src/modules/agenda/registrations.controller.ts

apps/web/src/app/(console)/org/events/[eventId]/sessions/page.tsx
apps/web/src/app/(console)/org/events/[eventId]/sessions/loading.tsx
apps/web/src/app/(console)/org/events/[eventId]/sessions/new/page.tsx
apps/web/src/app/(console)/org/events/[eventId]/sessions/[sessionId]/page.tsx
apps/web/src/app/(console)/org/events/[eventId]/sessions/[sessionId]/loading.tsx
apps/web/src/app/(console)/org/events/[eventId]/speakers/page.tsx
apps/web/src/app/(console)/org/events/[eventId]/speakers/loading.tsx
apps/web/src/app/(console)/org/events/[eventId]/speakers/new/page.tsx
apps/web/src/app/(console)/org/events/[eventId]/speakers/[speakerId]/page.tsx
apps/web/src/app/(console)/org/events/[eventId]/speakers/[speakerId]/loading.tsx
apps/web/src/app/(console)/org/events/[eventId]/registrations/page.tsx
apps/web/src/app/(console)/org/events/[eventId]/registrations/loading.tsx
```

### Modified Files

```
packages/database/schema/events-floor.ts        → Add speakers table, session_speakers join table
packages/database/schema/index.ts               → Export new tables
packages/database/seed/demo.ts                  → Add demo speakers + sessions
apps/api/src/modules/agenda/agenda.module.ts    → Register new providers + controllers
apps/api/src/modules/engagement/engagement.module.ts  → Import AgendaModule
apps/api/src/modules/events/events.module.ts    → Export EventsService for speakers
apps/web/src/app/(console)/org/events/[eventId]/layout.tsx  → Add tabs
apps/web/src/app/(console)/org/events/[eventId]/page.tsx    → Show session/speaker counts
```

---

## 12. Data Flow

### Session Creation Flow

```
User fills form → Client validates → Server Action / API Post
  → SessionsController.create()
    → SessionsService.create(input)
      → validate title, slug, dates, timezone
      → SessionsRepository.create(record)
        → setRlsContext(tx, orgId, userId)
        → INSERT INTO agenda_sessions
        → return created session
  → Response → UI refreshes → Session list shows new entry
```

### Speaker Addition Flow

```
User fills form → Client validates → API Post
  → SpeakersController.create()
    → SpeakersService.create(input)
      → validate name, optional fields
      → SpeakersRepository.create(record)
        → setRlsContext(tx, orgId, userId)
        → INSERT INTO speakers
        → return created speaker
  → Response → UI refreshes → Speaker list shows new entry
```

---

## 13. Dependencies

| Component | Depends On |
|-----------|-----------|
| Sessions pages | Sessions API endpoints |
| Sessions API | `agenda_sessions` table (exists) |
| Speakers pages | Speakers API endpoints |
| Speakers API | `speakers` table (NEW) |
| Session-speaker association | `session_speakers` join table (NEW) |
| Registrations page | Registration queries (read from existing tables) |
| Event layout tabs | All child routes exist |
| Seed data | Has existing demo data pattern |

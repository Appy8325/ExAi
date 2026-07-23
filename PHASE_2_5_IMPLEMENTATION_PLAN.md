# Phase 2.5 Implementation Plan — Event Persistence

**Status:** Blocked before implementation — missing approved API capability

## Intended architecture

`/organizer/events` will use the existing authenticated organizer-management controller, `EventsService`, and `EventsRepository`. The existing overview endpoint can supply the persisted event collection; create, update, and archive routes already exist. Duplicate belongs in `EventsService` and `OrganizerManagementController`.

## Blocking capability

The event workspace needs to load a persisted event by its durable ID after refresh. `EventsService.findById` and `EventsRepository.findById` already provide the correctly organization-scoped, RLS-backed domain operation, but `OrganizerManagementController` has no authenticated `GET events/:eventId` route.

Without that route, the event dashboard cannot load its persisted context through the approved organizer-management API. The requirement prohibits a parallel API, direct browser database access, mock state, or an alternate authorization path.

## Required decision

Authorize adding `GET /v1/organizations/:organizationId/events/:eventId` to the existing `OrganizerManagementController`, delegating directly to `EventsService.findById` with the existing guard and `organizations:read` permission. Then Phase 2.5 can add the approved duplicate operation and migrate the UI without new architectural surface area.

No product code has been changed.

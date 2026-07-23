# Phase 3 Prerequisite Plan — Organizer-side Exhibitor Organization Flow

**Status:** Proposed — approval required before implementation

## Existing organization flow

Organizations are durable records owned by the existing organization domain. Organizer organizations are created through `OrganizationsService`; exhibitor organizations are currently created when an exhibitor accepts an event invitation. The invitation flow creates the exhibitor organization and its event participation under the existing RLS-aware domain path.

## Missing organizer-side capability

Phase 3 lets an organizer create an exhibitor directly. `EventExhibitorsService.create` correctly requires a real exhibitor organization ID, but there is no authenticated organizer-side domain operation to create or select that organization before creating its event participation.

## Minimum API extension

Add one authenticated organizer-management operation, guarded by the existing organization authorization and `organizations:update` permission:

`POST /v1/organizations/:organizationId/exhibitor-organizations`

It delegates to the existing `OrganizationsService.create` with:

- the authenticated organizer as the owner/actor according to existing organization-domain rules;
- `kind: "exhibitor"`;
- a validated company name.

It returns the persisted exhibitor organization ID. Phase 3 then passes that ID to the existing `EventExhibitorsService.create` operation. Existing invitation behavior remains unchanged and is not duplicated.

## Ownership implications

The organizer organization owns the event; the exhibitor organization owns its company identity and event participation. The event-exhibitor record records both scopes, exactly as the existing repository requires. No synthetic IDs, shared organizer-owned exhibitor record, RLS exception, or browser-only organization exists.

## Migration impact

No schema or RLS migration is required. This exposes the existing organization model through the existing organizer-management API. Invitation-created exhibitor organizations and organizer-created exhibitor organizations share the same durable representation and downstream authorization behavior.

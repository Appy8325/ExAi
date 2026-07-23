# Phase 3 Implementation Plan — Exhibitor Management

**Status:** Blocked before implementation — durable event prerequisite

## Required scope

Implement real exhibitor persistence for an event: create, edit, archive, search/filter, company profile, booth, contact, description, logo placeholder, and the exhibitor workspace navigation.

## Existing durable path

`apps/api/src/modules/exhibitors/event-exhibitors.service.ts` and its repository provide the required RLS-protected database operations. They require a Supabase-authenticated actor, an organizer organization scope, and a distinct exhibitor organization for every event participation.

## Resolved authentication prerequisite

Phase 0.5 now uses the normal Supabase password session and claims middleware. Once the public Supabase configuration is supplied, it provides the required authenticated actor without RLS changes or browser service-role access.

## Remaining blocker

The current Phase 2 `/organizer/events` records are browser-local development state. They have no durable `events.id` values, organization ownership, or RLS scope. The real exhibitor repository requires a durable event ID belonging to an organizer organization, so an exhibitor cannot correctly be created for one of those local records.

Using browser storage would violate the explicit real-persistence requirement. Creating an API bypass or mapping a local ID to a synthetic event would violate the authorization boundary and ownership model.

## Required decision

Authorize a Phase 2 persistence correction before Phase 3:

1. Move `/organizer/events` create/edit/archive/duplicate flows onto the existing authenticated event API and durable organization-owned events; or
2. Provide a seeded durable organizer organization and event, then restrict Phase 3 to managing exhibitors for that real event until Phase 2 is migrated.

No Phase 3 functionality has begun.

# Phase 2 Implementation Plan — Event Management

**Status:** In progress

## Scope

Deliver the `/organizer/events` collection and the event workspace context: create, edit, archive, duplicate, search, filter, event cards, and an event dashboard.

## Data boundary

The existing event API requires Supabase authentication, which Phase 0 deliberately does not create. Phase 2 therefore uses browser-local development state, isolated to this temporary workspace. It does not alter authentication, bypass API authorization, or claim server persistence.

## Exclusions

Exhibitor, attendee, session, invitation, RBAC, billing, and AI workflows remain out of scope. Their event navigation destinations are intentional placeholders only.

## Validation

Run the focused event-state test, web typecheck, lint, and the canonical production build.

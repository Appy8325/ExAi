# Phase 0 Implementation Plan — Temporary Authentication

**Status:** In progress

## Objective

Provide a development-only email/password sign-in that creates an authenticated session and redirects to `/organizer`.

## Architecture

- Keep the existing Supabase authentication modules untouched for later restoration.
- Add a signed, HTTP-only development cookie scoped to the new `/organizer` workspace.
- Validate credentials in a route handler; the browser never creates or reads the session.
- Guard `/organizer` in middleware and redirect unauthenticated requests to `/auth`.

## Files

- Historical only: `apps/web/src/lib/auth/development-session.ts` was the retired signed-cookie helper.
- Historical only: `apps/web/src/app/api/auth/development-session/route.ts` was the retired sign-in/sign-out endpoint.
- `apps/web/src/app/(auth)/auth/page.tsx`: replacement email/password form.
- `apps/web/src/app/organizer/page.tsx`: authenticated Phase 0 landing target.
- Historical only: `apps/web/src/middleware.ts` formerly guarded the development-cookie session.

## Validation

1. Unit test valid/invalid credentials and session expiry.
2. Run web typecheck, lint, and build.
3. Manually verify successful sign-in redirects to `/organizer`; invalid credentials show the specified error.

## Restoration

Remove the development route, cookie helper, and `/organizer` guard; restore the prior `/auth` page. Existing Supabase auth modules remain unchanged.

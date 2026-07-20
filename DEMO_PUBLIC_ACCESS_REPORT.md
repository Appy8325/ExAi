# Demo Public Access Report

## Overview
The `/demo` experience now operates as a fully public, read-only product showcase requiring no authentication.

## What changed

| Before | After |
|---|---|
| `/demo` linked to `UserMenu`, `DemoSignInForm`, and auth-protected routes (`/org/*`, `/exhibit/*`, `/e/*/saved`) | `/demo` shows a "Read-only demo" badge and links only to public pages |
| Sign-in section with Magic Link flow (blocked — SMTP not configured) | Removed entirely |
| Organizer links pointed to `/org/dashboard`, `/org/analytics`, etc. | Organizer links point to `/demo/event/[slug]` |
| Exhibitor links pointed to `/exhibit/*/dashboard/*`, `/exhibit/*/settings`, etc. | Exhibitor links point to `/demo/exhibitor/[eventExhibitorId]` |
| Event links pointed to `/e/[slug]`, `/e/[slug]/saved` | Event links point to `/demo/event/[slug]` |
| Relationship links pointed to auth-protected workspaces | Relationship links point to `/demo/exhibitor/[..]` |
| No `/visit/[token]` page existed | New public booth page with interactive lead form |
| No event detail page | New `/demo/event/[slug]` showing exhibitors |
| No exhibitor detail page | New `/demo/exhibitor/[eventExhibitorId]` showing lead form preview |

## Public routes

| Route | Data source | Description |
|---|---|---|
| `/demo` | `GET /v1/public/demo` | Main demo overview with links to all entities |
| `/demo/event/[slug]` | `GET /v1/public/demo` (client-side filter) | Event exhibitor listing |
| `/demo/exhibitor/[eventExhibitorId]` | `GET /v1/public/demo` + `GET /v1/public/booths/[token]` | Exhibitor detail with lead form preview |
| `/visit/[token]` | `GET /v1/public/booths/[token]` | Full public booth page with live lead submission |

## Auth persistence
- `/demo` and `/visit/*` are **not** in the middleware's protected route list (`/admin`, `/exhibit`, `/org`, `/account`, `/e/*/saved`)
- Lead form submission uses `submitBoothLead()` with `publicRequest` (no auth header) hitting `POST /v1/public/booths/[token]/submissions`
- No Supabase session cookie is required for any demo or visit page

## Files created

| File | Purpose |
|---|---|
| `apps/web/src/app/demo/event/[slug]/page.tsx` | Event exhibitor listing |
| `apps/web/src/app/demo/exhibitor/[eventExhibitorId]/page.tsx` | Exhibitor detail + lead form preview |
| `apps/web/src/app/visit/[token]/page.tsx` | Public booth page |
| `apps/web/src/app/visit/[token]/booth-lead-form.tsx` | Anonymous lead submission form |

## Files modified

| File | Change |
|---|---|
| `apps/web/src/app/demo/page.tsx` | Removed `UserMenu`, `DemoSignInForm`, `/org/*`/`/exhibit/*`/`/e/*` links; replaced with read-only badge and `/demo/*`/`/visit/*` links |

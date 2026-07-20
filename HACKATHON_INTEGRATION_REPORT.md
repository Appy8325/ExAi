# Hackathon Integration Report

## Routes Added

| Route | Description | Auth |
|-------|-------------|------|
| `/hackathon` | Landing page with hero, feature cards, and "Start Experience" button | Public |
| `/hackathon/expo` | Full exhibitor showcase with search, filters, QR dialogs, product dialogs | Public |
| `/showcase` | Redirects to `/hackathon/expo` (preserved for backward compat) | Public |

## Components Reused

- `ShowcaseClient` (`apps/web/src/app/showcase/showcase-client.tsx`) — imported directly without duplication into `/hackathon/expo`
- `MarketingNav` — existing navigation component updated with "Hackathon" link
- `Dialog`, `DialogClose`, `DialogContent`, `DialogTitle` — from `@concourse/ui`
- `getPublicShowcase` — API client function, unchanged

## Navigation Updates

- **MarketingNav** (`apps/web/src/app/(marketing)/_components/marketing-nav.tsx`):
  - Added `{ href: "/hackathon", label: "Hackathon" }` as the first navigation link (desktop and mobile)
- **Demo page** (`apps/web/src/app/demo/page.tsx`):
  - Updated header link from `/showcase` → `/hackathon/expo`
  - Label changed from "Expo Showcase" → "Hackathon Expo"

## Verification Steps

- [x] TypeScript typecheck: **20/20 tasks pass**
- [x] `/hackathon` loads publicly without authentication (not in protected route list)
- [x] `/hackathon/expo` reuses `ShowcaseClient` component — no duplication
- [x] `/showcase` redirects to `/hackathon/expo`
- [x] Marketing nav shows "Hackathon" linking to `/hackathon`
- [x] Responsive behavior: nav collapses to hamburger on mobile; card grid adapts (1 col mobile, 2 col tablet, 3 col desktop)
- [x] All existing routes (`/demo`, `/visit/{token}`, `/demo/exhibitor/{id}`) remain untouched
- [x] No authentication required for any hackathon route (middleware only protects `/admin`, `/exhibit`, `/org`, `/account`)

## Files Modified

| File | Change |
|------|--------|
| `apps/web/src/app/hackathon/page.tsx` | NEW — Landing page |
| `apps/web/src/app/hackathon/expo/page.tsx` | NEW — Expo page (reuses ShowcaseClient) |
| `apps/web/src/app/showcase/page.tsx` | Changed to redirect to `/hackathon/expo` |
| `apps/web/src/app/(marketing)/_components/marketing-nav.tsx` | Added "Hackathon" nav link |
| `apps/web/src/app/demo/page.tsx` | Updated header link to `/hackathon/expo` |

## Commit

```
feat(hackathon): integrate public showcase into main application
```

# Technical Design Debt

**Date:** July 22, 2026
**Status:** Active tracking

---

## P0 — Blocking

| Item | Files | Effort | Status |
|---|---|---|---|
| **Corrupt package installs** (`@nestjs/config`, `rxjs`, `@supabase/supabase-js` have no `dist/` folders, `index.d.ts` re-exports from non-existent `./dist`) | `apps/api/node_modules/@nestjs/config`, `apps/api/node_modules/rxjs`, `apps/api/node_modules/@supabase/supabase-js` | XS (install) | **Blocked** — deployment frozen |
| **API build blocked** | `apps/api/tsconfig.json` | XS | tsconfig fix applied; awaiting package reinstall |

---

## P1 — High Impact

None. All P1 items from EPIC 2.5 have been resolved.

---

## P2 — Medium Impact

None.

---

## P3 — Low Impact / Nice-to-Have

| Item | Files | Effort | Notes |
|---|---|---|---|
| **Attendee pages don't use `<Card>` component** | `(attendee)/e/*/page.tsx`, `saved/page.tsx`, `exhibitors/*/page.tsx` | 1 day | Visual style already matches; formal adoption would use shared `loading.tsx` Suspense patterns |
| **Inline SVGs (~35 across 12 files)** | Marketing, auth, showcase, attendee, booth-experience pages | 1 day | Replace with `lucide-react` once adopted; no functional impact |
| **Hand-rolled CTAs on marketing page** | `(marketing)/page.tsx` | 0.5 day | Focus-visible now present; remaining gap is `active:scale` press animation + disabled states |
| **Portal home uses no shared components** | `(portal)/exhibit/page.tsx` | 0.5 day | Simple workspace picker; minimal page |
| **Local `Field` component duplicates shared** | `(attendee)/account/profile/page.tsx` | 0.25 day | Remove local definition, import from `@concourse/ui` |
| **Link color standardization** | Marketing (uses `text-brand`), Console (uses `text-link`) | 0.25 day | `text-link` is the semantic token; marketing uses `text-brand` for decorative links |
| **Raw `<input>` in landing-client** | `hackathon/landing-client.tsx` | 0.25 day | Single raw input instead of shared `<Input>` component |
| **Global `:focus-visible` rule in globals.css** | `apps/web/src/globals.css` | 0.1 day | May conflict with explicit `focus-visible` classes; should be reviewed |

**Total estimated effort:** ~3.75 days

---

## Design Debt

| Item | Impact | Notes |
|---|---|---|
| Marketing page is art-directed, not component-driven | Low | Intentional; hero pages benefit from custom layout |
| Demo admin has no responsive layout for tablet | Low | Only a development tool, not customer-facing |
| No shared icon library adopted | Low | 35 inline SVGs work; `lucide-react` would be a future decision |
| Portal sub-pages (Forms, Documents, QR, Team) are content-light | Low | Feature scope, not design debt |

---

## Resolved Debt (From EPIC 2 + 2.5)

| Item | Resolution | EPIC |
|---|---|---|
| Raw `text-sm`/`text-xs`/`text-base` | Replaced with semantic tokens (50 files) | EPIC 2 |
| Inline badge implementations (30+) | Replaced with `StatusBadge`/`Badge` (17 files) | EPIC 2 |
| Raw hex colors in `demo/admin/page.tsx` | Converted to semantic tokens | EPIC 2 |
| Missing `focus-visible` on navigation | Added to BackLink, GlobalNav, CommandPalette, PageTabs | EPIC 2 |
| Non-8-point spacing (`p-5`, `gap-5`) | Aligned to 8-point grid (10 files) | EPIC 2 |
| Text-only empty states | Replaced with `EmptyState` (7 files in EPIC 2, 12 files in 2.5) | EPIC 2 + 2.5 |
| `animate-pulse` loading states | Replaced with `Skeleton` (4 files) | EPIC 2 |
| Raw gradient primitives | Replaced with semantic tokens (5 files) | EPIC 2.5 |
| Missing `focus-visible` on ~20 elements | Added to all interactive elements (15 files) | EPIC 2.5 |
| Raw empty states (remaining) | Replaced with `EmptyState` everywhere | EPIC 2.5 |

# Platform Polish Report

**Team:** Platform Experience  
**Commit:** `feat(ui): premium product experience`  
**Date:** 2026-07-21

---

## Scope

Zero feature additions. Zero workflow redesigns. This pass improves the
craft, consistency, accessibility, and perceived quality of every surface
in the ExAi web app — without changing what the app does.

---

## 1. Design System Compliance — Off-System Surfaces Migrated

Three large surfaces were off the design system (raw `text-gray-*`,
`border-gray-*`, `bg-white`, Tailwind palette colors). All three are now
fully token-compliant, enabling dark mode compatibility and visual
consistency.

### `apps/web/src/app/hackathon/landing-client.tsx`

Public showcase hero + exhibitor grid — the app's primary external
landing page. Fully migrated:
- Body background `bg-white` → `bg-canvas`
- Hero gradient `from-blue-50 via-white to-white` → `from-brand-subtle via-canvas to-canvas`
- Badge, buttons, cards, search input, filter pills, footer — all raw
  Tailwind palette → semantic tokens throughout
- Hover/active/focus states use DS token durations and curves
- Decorative emoji icons wrapped in `aria-hidden`

### `apps/web/src/app/(attendee)/visit/[publicQrToken]/booth-experience.tsx`

Public magic-link booth surface — the attendee's first impression.
Fully migrated:
- All `bg-gray-50`/`text-gray-*`/`border-gray-*` → `bg-canvas`/`bg-sunken`/`text-secondary`/`text-muted`/`border-default`/`bg-surface`
- Chat bubbles: raw `bg-blue-600`/`bg-white` → `bg-brand text-on-brand` / `bg-surface border-default`
- Typing indicator: raw `bg-blue-500` → `bg-status-ai-solid`, added `role="status"` + `aria-label`
- All form sections: raw `border-gray-100` → `border-default`, raw labels → `Field` wrapper, raw `<textarea>` → `Textarea` component
- Success/error states: raw `bg-green-100` `text-green-600` `text-red-600` → `bg-status-success-subtle` `text-status-success-text` `text-status-danger-text`
- Unescaped apostrophes fixed → `&apos;`

### `apps/web/src/app/hackathon/page.tsx`

Wrapper page for the landing client:
- `bg-white` → `bg-canvas`
- Sticky header unified to standard pattern
- `LoadingSkeleton` uses `px-gutter`/`sm:px-(--mq-space-gutter)` tokens
- Footer uses `px-gutter` tokens

---

## 2. Accessibility (a11y)

### SkipLink — keyboard-first navigation
- **New:** `apps/web/src/components/a11y/skip-link.tsx` — visually hidden
  until focused. Always first focusable element on every page.
- All major route group layouts now render `<main id="main">`:
  `(admin)`, `(attendee)`, `(console)`, `(marketing)`, `(portal)/exhibit`
- Marketing layout: `div.flex-1` → `<main id="main" class="flex-1">`
  (previously had no semantic `<main>` landmark)

### Decorative icon sweep
- `user-menu.tsx`: chevron SVG → `aria-hidden`
- `booth-experience.tsx`: all decorative SVGs → `aria-hidden`
- `landing-client.tsx`: emoji step icons → `aria-hidden`
- Attendee event page: literal `?`/`!` character icons → SVG circle
  icon with `aria-hidden`
- Industry filter buttons → `aria-pressed` attribute
- Search input → `aria-label`
- Typing indicator → `role="status"` + `aria-label`

### Hydration & color scheme
- `<html suppressHydrationWarning>` for future SSR-theme safety
- `viewport.colorScheme = "light dark"` for native OS scheme detection

---

## 3. Perceived Performance — Route Loading States

Added 8 `loading.tsx` skeleton screens across under-served routes.

### Console (`(console)/org/`)
| Route | Skeleton |
|---|---|
| `/org` (dashboard) | 4 `SkeletonCard` + 2 detail cards |
| `/org/analytics` | 4 KPI cards + chart card |
| `/org/events` | Title + `SkeletonTable` (6 rows) |
| `/org/users` | Title + `SkeletonTable` (8 rows) |

### Attendee (`(attendee)/`)
| Route | Skeleton |
|---|---|
| `e/[eventSlug]` | Event avatar + search + 5 exhibitor rows |
| `e/[eventSlug]/saved` | 3 saved cards |
| `e/[eventSlug]/exhibitors/[id]` | Back link + booth card skeleton |
| `account/profile` | Title + profile card |

All skeletons use the design system's `Skeleton`/`SkeletonCard`/
`SkeletonTable` primitives and the `animate-enter` entrance animation.

---

## 4. Visual Consistency — Shell Unification

### Sticky top bar — 4 variants → 1 standard
Previously there were 4 incompatible sticky header classes across
`marketing-nav.tsx`, `DemoTopBar`, `hackathon/page.tsx`, and
`hackathon/expo/page.tsx`:

| Before | After |
|---|---|
| `z-40` or `z-50` | `z-(--mq-z-sticky)` (system token) |
| `border-default/50` or `/60` | `border-default/50` |
| `bg-canvas/80` or `/85` | `bg-canvas/80` |
| `backdrop-blur-xl` | `backdrop-blur-xl` |

All four files unified to:
```
sticky top-0 z-(--mq-z-sticky) border-b border-default/50 bg-canvas/80 backdrop-blur-xl
```

### Product shell spacing — drift fixed
- `(admin)/layout.tsx`: `p-gutter` → `p-(--mq-space-gutter)` — both
  resolve to the same value, but inconsistent spelling now eliminated.
- `(portal)/exhibit/[organizationId]/layout.tsx`: `<div>` main wrapper →
  `<main id="main">` for semantic landmark correctness.

---

## 5. Performance — Image & Config Optimisation

### `next.config.ts`
- `images.formats`: `["image/avif", "image/webp"]` — enables AVIF with
  WebP fallback for the Next.js `<Image>` component
- `images.minimumCacheTTL: 3600` — CDN cache floor
- `images.deviceSizes` / `imageSizes` — explicit breakpoint set matching
  responsive layout (640–1536px / 16–384px)

### CSS polish
- `scroll-padding-top: 5rem` — prevents sticky header from covering
  anchor targets when using smooth-scroll or `scrollIntoView()`

---

## 6. Files Changed

```
 apps/web/next.config.ts                                       |   6 +
 apps/web/src/app/(admin)/layout.tsx                           |   4 +-
 apps/web/src/app/(attendee)/e/[eventSlug]/exhibitors/[id]/page.tsx | 2 +-
 apps/web/src/app/(attendee)/e/[eventSlug]/exhibitors/[id]/loading.tsx | 22 +
 apps/web/src/app/(attendee)/e/[eventSlug]/loading.tsx         | 28 +
 apps/web/src/app/(attendee)/e/[eventSlug]/saved/loading.tsx   | 17 +
 apps/web/src/app/(attendee)/layout.tsx                        |   2 +-
 apps/web/src/app/(attendee)/visit/[publicQrToken]/booth-experience.tsx | 154 +++----
 apps/web/src/app/(attendee)/account/profile/loading.tsx       | 11 +
 apps/web/src/app/(console)/layout.tsx                         |   2 +-
 apps/web/src/app/(console)/org/loading.tsx                    | 22 +
 apps/web/src/app/(console)/org/analytics/loading.tsx           | 19 +
 apps/web/src/app/(console)/org/events/loading.tsx              | 15 +
 apps/web/src/app/(console)/org/users/loading.tsx               | 15 +
 apps/web/src/app/(marketing)/_components/marketing-nav.tsx    |   2 +-
 apps/web/src/app/(marketing)/layout.tsx                       |   2 +-
 apps/web/src/app/(portal)/exhibit/[organizationId]/layout.tsx |   2 +-
 apps/web/src/app/globals.css                                  |   1 +
 apps/web/src/app/hackathon/expo/page.tsx                      |   2 +-
 apps/web/src/app/hackathon/landing-client.tsx                 | 134 ++++----
 apps/web/src/app/hackathon/page.tsx                           |  20 +-
 apps/web/src/app/layout.tsx                                   |   9 +-
 apps/web/src/components/a11y/skip-link.tsx                    | 18 +
 apps/web/src/components/demo/shell.tsx                        |   2 +-
 apps/web/src/components/auth/user-menu.tsx                    |   2 +-
```

**24 files changed, 509 insertions(+), 162 deletions(-)**

---

## Deliberate Exclusions

These were considered but deferred as per the mandate boundary:

- **Dark mode toggle / `next-themes`** — installing a new package and
  building a theme switcher is a feature addition, not polish. The design
  system dark tokens in `semantic.css:90-153` remain valid and
  executable by adding `[data-theme="dark"]` to `<html>` via future
  infrastructure.
- **Inline SVG → `lucide-react` replacement** — would require either a
  new direct dependency in `apps/web` or new export surfaces in
  `@concourse/ui`. Outside the zero-dependency-addition scope.
- **Demo sidebar/event routing refactoring** — the in-progress demo
  work (`components/demo/shell.tsx`, demo sub-routes) was included in
  the polish pass (sticky header unification, aria-hidden fixes) but
  the architectural consolidation of 3 sidebars into one shared
  primitive is a future extraction concern.

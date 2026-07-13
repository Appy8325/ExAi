# ExAi Design System

This is the canonical implementation guide for ExAi UI. The shared
`@concourse/ui` package is the source of truth for new surfaces. This work does
not require existing pages to be rewritten.

The system favors Apple HIG's clarity, Linear's focused density, Stripe's clear
data presentation, and Notion's quiet utility: immediate, legible, mobile-first
interfaces with no decorative motion.

## Principles

- Performance is part of the interface. Render useful content first; never use
  animation to delay a result.
- Use semantic tokens rather than palette values, so dark mode and future themes
  remain a styling concern rather than a page rewrite.
- Prefer native HTML and server-rendered components. Add client state only for
  an interaction that needs it.
- Keep information dense but breathable: one clear primary action, concise
  labels, visible hierarchy, and honest empty/error states.
- WCAG 2.2 AA is baseline: keyboard operation, visible focus, text in addition
  to color, and reduced-motion support are required.

## Installation and theming

Applications import the shared stylesheet once:

```css
@import "tailwindcss";
@import "@concourse/ui/styles.css";
```

Set `data-theme="light"` or `data-theme="dark"` and, where a dense console is
appropriate, `data-density="comfortable"` or `data-density="compact"` on the
root element. The default density is comfortable. Components consume semantic
utilities such as `bg-surface`, `text-primary`, and `border-default`; they do
not use raw palette values.

## Tokens

Tokens are owned by `packages/ui/src/styles/` and exported through the single
stylesheet above.

| Area | Canonical tokens | Usage |
| --- | --- | --- |
| Color | `--mq-bg-*`, `--mq-text-*`, `--mq-border-*`, `--mq-status-*` | Semantic surfaces, text, borders, status, and AI provenance |
| Typography | `--mq-type-*`, `--mq-leading-*`, `--mq-font-*` | Display, title, body, caption, UI and mono font roles |
| Spacing | 4px base scale, `--mq-space-gutter`, `--mq-space-section`, density tokens | Page gutters, vertical sections, compact control rhythm |
| Grid | `--mq-grid-columns: 12`, `--mq-grid-gap` | Twelve columns on desktop; practical single-column layouts on mobile |
| Radius | `--mq-radius-xs` through `--mq-radius-lg`, `--mq-radius-full` | Inputs/buttons, cards, dialogs, pills |
| Elevation | `--mq-shadow-0` through `--mq-shadow-4` | Cards, menus, dialogs, toast layers |
| Motion/layers | `--mq-duration-*`, `--mq-ease-standard`, `--mq-z-*` | Short feedback and predictable overlay ordering |

Tailwind aliases include `text-body`, `text-title`, `rounded-md`, and
`shadow-1`. The font files are local, keeping loading and privacy predictable.

## Shared components

New product code imports primitives from `@concourse/ui`; it should not create
page-local versions of these patterns.

| Component | Purpose |
| --- | --- |
| `Button` | Primary, secondary, ghost, and danger actions |
| `Card` | A bordered, elevated content surface |
| `Input`, `Textarea` | Native form controls with shared focus and density behavior |
| `Table` | Semantic table structure; wrap it in a horizontal scroll region when needed on mobile |
| `Timeline`, `TimelineItem` | Chronological, immutable activity or relationship history |
| `MetricCard` | A single summary metric with optional supporting context |
| `StatusBadge` | Neutral, success, warning, danger, info, and AI status labels |
| `EmptyState` | Clear title, explanation, and optional action for no-data states |
| `Skeleton` | Layout-shaped loading placeholder; prefer it to a blocking spinner |
| `Dialog`, `DialogContent` | Accessible modal primitives built on Radix Dialog |
| `Toast` | Presentational polite live region; applications own queueing and dismissal |
| `DesktopNavigation`, `MobileNavigation` | Responsive semantic navigation containers |

Example:

```tsx
import { Card, MetricCard, StatusBadge } from "@concourse/ui";

export function RelationshipSummary() {
  return (
    <Card>
      <StatusBadge tone="success">Active</StatusBadge>
      <MetricCard label="Interactions" value={12} detail="Updated today" />
    </Card>
  );
}
```

## Component contracts

- Components are composable named exports with TypeScript props and forwarded
  native refs where applicable. Each can receive a co-located Storybook story
  later without adding a runtime Storybook dependency now.
- Interactive overlays reuse Radix behavior rather than reimplementing focus
  management or keyboard handling.
- Loading, empty, error, and disabled states are explicit product states. Do
  not fabricate zero-value metrics while data is unknown.
- Tables remain semantic HTML. On narrow screens, prioritize essential columns
  or use a card/list projection rather than forcing unreadable data.
- `Toast` is deliberately stateless so a future application-level queue does
  not couple every page to a client provider.

## Layout and responsive behavior

Use one responsive composition, not separate desktop and mobile products. Start
with a one-column mobile layout and add columns only when width improves
comprehension. Keep attendee touch targets at least 44px and do not rely on
hover for an essential action.

Use the twelve-column grid for information-dense console surfaces. Typical
metric cards span all columns on small screens, six on tablets, and three on
desktop. Content is constrained by `--mq-content-max`; attendee flows use
`--mq-attendee-content-max`.

## Accessibility and interaction

- The stylesheet supplies a high-contrast `:focus-visible` ring and honors
  `prefers-reduced-motion`.
- Use visible labels for form controls. If an icon-only control is unavoidable,
  supply an accessible name.
- Status color is supplemental: include text such as “Active” or “Needs
  attention.”
- Dialogs need a title and should return focus to their trigger.
- Announce ephemeral outcomes with `Toast`; reserve assertive announcements for
  failures requiring immediate attention.

## Performance rules

This foundation follows `PERFORMANCE_GUIDELINES.md`:

- No global client provider, polling, or animation dependency is introduced.
- Prefer server components and static primitives; keep interactive leaf
  components small.
- Avoid client-side measurement, layout effects, and full-form re-renders.
- Use layout-matched skeletons, progressive regions, and optimistic state only
  where the operation is safely reversible.
- Keep component imports named and direct so bundlers can tree-shake unused
  primitives.

## Extending the system

Before adding a component, first compose the shared primitives. Add a new
primitive only when it has at least two foreseeable product uses and cannot
remain a local composition. New components belong in
`packages/ui/src/components/`, consume semantic tokens only, export typed named
APIs, include a focused test, and can receive co-located stories. Do not alter
existing pages as part of design-system work unless a dedicated adoption ticket
asks for it.

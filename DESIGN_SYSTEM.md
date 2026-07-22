# Design System — ExAi

**Date:** July 22, 2026
**Status:** Established (refining usage guidelines)

---

## Overview

ExAi has a **well-structured design system** that is under-utilized. The tokens and components exist but are inconsistently applied. This document:

1. Documents the existing design system
2. Establishes strict usage guidelines
3. Eliminates arbitrary values in favor of systematic ones

---

## Part 1: Design Tokens

### Philosophy

**Use tokens, not values.** Every color, spacing, and typography decision should reference a design token. No `bg-blue-500` or `p-6` directly — use `bg-brand` or `p-6` (which maps to `--mq-space-6`).

### The Token Hierarchy

```
Layer 0: Primitives (raw colors — never use directly)
    ↓
Layer 1: Semantic (role-based — USE THESE)
    ↓
Layer 2: Component (component-specific — USE THESE)
```

---

## Part 2: Color System

### Semantic Color Tokens

| Token | Usage | Value (Light) |
|-------|-------|----------------|
| `--mq-bg-canvas` | Page background | Near-white |
| `--mq-bg-surface` | Cards, panels | White |
| `--mq-bg-raised` | Elevated elements | Slightly lighter |
| `--mq-bg-sunken` | Inset areas, code blocks | Slightly darker |
| `--mq-bg-brand` | Brand primary | Purple |
| `--mq-bg-brand-hover` | Brand hover state | Darker purple |
| `--mq-bg-brand-subtle` | Brand background tint | Light purple |
| `--mq-text-primary` | Main text | Near-black |
| `--mq-text-secondary` | Secondary text | Gray-600 |
| `--mq-text-muted` | Tertiary text | Gray-500 |
| `--mq-text-on-brand` | Text on brand bg | White |
| `--mq-border-default` | Default borders | Gray-200 |
| `--mq-border-strong` | Emphasized borders | Gray-300 |

### Status Colors

| Status | Subtle | Text | Solid | Border |
|--------|--------|------|-------|--------|
| Success | `--mq-bg-status-success-subtle` | `--mq-text-status-success` | `--mq-bg-status-success-solid` | `--mq-border-status-success-border` |
| Warning | `--mq-bg-status-warning-subtle` | `--mq-text-status-warning` | `--mq-bg-status-warning-solid` | `--mq-border-status-warning-border` |
| Danger | `--mq-bg-status-danger-subtle` | `--mq-text-status-danger` | `--mq-bg-status-danger-solid` | `--mq-border-status-danger-border` |
| Info | `--mq-bg-status-info-subtle` | `--mq-text-status-info` | `--mq-bg-status-info-solid` | `--mq-border-status-info-border` |
| AI | `--mq-bg-status-ai-subtle` | `--mq-text-status-ai` | `--mq-bg-status-ai-solid` | `--mq-border-status-ai-border` |

### Data Visualization Colors

| Purpose | Colors |
|---------|--------|
| Categorical (up to 8) | Use `--mq-data-viz-1` through `--mq-data-viz-8` |
| Heatmap (low → high) | Use `--mq-data-heat-1` through `--mq-data-heat-6` |

### Usage Rules

**DO:**
```tsx
// Good - uses semantic tokens
<div className="bg-surface text-primary border-default">
  <button className="bg-brand text-on-brand hover:bg-brand-hover">
```

**DON'T:**
```tsx
// Bad - uses primitives
<div className="bg-white text-gray-900 border-gray-200">
  <button className="bg-purple-600 text-white hover:bg-purple-700">
```

---

## Part 3: Typography

### The Type Scale

| Name | Size | Leading | Usage |
|------|------|---------|-------|
| `display` | 48px | 1.1 | Hero headlines only |
| `title-lg` | 32px | 1.2 | Page titles (h1) |
| `title` | 24px | 1.3 | Section titles (h2) |
| `title-sm` | 20px | 1.4 | Subsection titles (h3) |
| `body-lg` | 18px | 1.6 | Lead text, important body |
| `body` | 16px | 1.6 | Default body text |
| `body-sm` | 14px | 1.5 | Secondary text, captions |
| `caption` | 12px | 1.4 | Labels, helper text |

### Tailwind Mappings

| Tailwind Class | Maps To |
|----------------|---------|
| `text-display` | `font-size: var(--mq-font-size-display); line-height: var(--mq-leading-display)` |
| `text-title-lg` | title-lg |
| `text-title` | title |
| `text-title-sm` | title-sm |
| `text-body-lg` | body-lg |
| `text-body` | body |
| `text-body-sm` | body-sm |
| `text-caption` | caption |

### Typefaces

| Role | Font | Fallback |
|------|------|----------|
| Body | `--mq-font-sans` (Inter Variable) | system-ui, sans-serif |
| Code/Mono | `--mq-font-mono` (JetBrains Mono) | ui-monospace, monospace |

### Usage Rules

**Hierarchy:**
- Each page has ONE `title-lg` (h1)
- Sections have `title` (h2)
- Subsections have `title-sm` (h3)
- Body text is always `body` or `body-sm`
- Never skip levels (no h1 → h4)

**Font Weights:**
- Display/Title: 600 (semibold)
- Body: 400 (regular)
- Labels/Captions: 500 (medium)
- Never use 700 (bold) for text content

**DON'T:**
```tsx
// Bad - inconsistent sizing
<h1 className="text-4xl font-bold">Title</h1>
<h2 className="text-2xl font-semibold">Subtitle</h2>
<p className="text-base">Body</p>

// Good - uses design system
<h1 className="text-title-lg font-semibold">Title</h1>
<h2 className="text-title font-semibold">Subtitle</h2>
<p className="text-body">Body</p>
```

---

## Part 4: Spacing System

### The Spacing Scale (8-point grid)

| Token | Value | Pixels | Usage |
|-------|-------|--------|-------|
| `--mq-space-1` | 0.25rem | 4px | Tight gaps |
| `--mq-space-2` | 0.5rem | 8px | Icon gaps |
| `--mq-space-3` | 0.75rem | 12px | Small padding |
| `--mq-space-4` | 1rem | 16px | Default padding |
| `--mq-space-6` | 1.5rem | 24px | Section gaps |
| `--mq-space-8` | 2rem | 32px | Card padding |
| `--mq-space-12` | 3rem | 48px | Large gaps |
| `--mq-space-16` | 4rem | 64px | Section spacing |
| `--mq-space-24` | 6rem | 96px | Page sections |

### Tailwind Mappings

| Class | Maps To |
|-------|---------|
| `p-1` through `p-24` | `--mq-space-*` |
| `m-1` through `m-24` | `--mq-space-*` |
| `gap-1` through `gap-24` | `--mq-space-*` |

### Layout Spacing

| Token | Value | Usage |
|-------|-------|-------|
| `--mq-space-gutter` | Responsive (16-40px) | Page margins |
| `--mq-space-section` | 64px | Major section gaps |
| `--mq-space-section-sm` | 32px | Minor section gaps |

### Usage Rules

**No arbitrary values.** Only use values from the scale:
- No `p-5`, `m-7`, `gap-10`
- No `px-3.5` or `py-[13px]`
- No `mt-[18px]` (use `mt-4` or `mt-6`)

**Content widths:**
| Token | Max Width | Usage |
|-------|-----------|-------|
| `--mq-content-max` | 80rem (1280px) | Page content |
| `--mq-content-max-narrow` | 40rem (640px) | Forms, settings |
| `--mq-content-max-wide` | 96rem (1536px) | Full-width tables |

**DON'T:**
```tsx
// Bad - arbitrary values
<div className="p-5 gap-10 mt-[18px]">
<div className="max-w-[900px]">

// Good - systematic values
<div className="p-4 gap-6 mt-4">
<div className="max-w-(--mq-content-max)">
```

---

## Part 5: Border & Elevation

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--mq-radius-xs` | 2px | Badges, chips |
| `--mq-radius-sm` | 4px | Small buttons |
| `--mq-radius-md` | 6px | Inputs, small cards |
| `--mq-radius-lg` | 8px | Cards, panels |
| `--mq-radius-xl` | 12px | Modals, large cards |
| `--mq-radius-full` | 9999px | Pills, avatars |

### Border Usage

**Reduce borders.** Use elevation and contrast instead of outlines.

| Instead of | Use |
|------------|-----|
| Heavy borders on cards | `shadow-1` or `shadow-2` |
| Border to separate sections | `border-t border-default/50` (subtle) |
| Border on inputs | `border border-default` (only on focus) |
| Border to show depth | `shadow-sm` |

### Shadow Scale

| Name | Usage |
|------|-------|
| `shadow-0` | No shadow |
| `shadow-1` | Cards, panels (subtle lift) |
| `shadow-2` | Dropdowns, popovers |
| `shadow-3` | Modals |
| `shadow-premium` | Premium card variant |
| `shadow-card-hover` | Card hover state |
| `shadow-focus` | Focus rings |
| `shadow-inset` | Inset areas |

### Usage Rules

**DON'T:**
```tsx
// Bad - heavy borders everywhere
<div className="border border-gray-200 bg-white rounded-lg">

// Good - elevation instead
<div className="shadow-1 bg-surface rounded-lg">
```

**Exception:** Use `border border-default` for input focus states and table separators.

---

## Part 6: Buttons

### Button Variants

| Variant | Usage | Classes |
|---------|-------|---------|
| Primary | Main actions | `bg-brand text-on-brand hover:bg-brand-hover active:scale-[0.98]` |
| Secondary | Alternate actions | `border border-default bg-surface text-primary hover:bg-sunken` |
| Ghost | Tertiary actions | `text-secondary hover:text-primary hover:bg-sunken` |
| Danger | Destructive actions | `bg-status-danger-solid text-white hover:opacity-90` |

### Button Sizes

| Size | Height | Padding | Font | Usage |
|------|--------|---------|------|-------|
| `sm` | 32px | 12px horizontal | `text-body-sm` | Compact UI |
| `md` | 40px | 16px horizontal | `text-body` | Default |
| `lg` | 48px | 24px horizontal | `text-body-lg` | Primary CTAs |

### Icon Buttons

| Size | Dimensions | Usage |
|------|------------|-------|
| `sm` | 32×32px | Compact toolbars |
| `md` | 40×40px | Default icon buttons |
| `lg` | 48×48px | Feature icons |

### Usage Rules

**One primary button per section.** Never have two `bg-brand` buttons visible simultaneously.

**Button hierarchy per page:**
1. Primary action (branded, largest)
2. Secondary action(s) (outlined, medium)
3. Tertiary actions (ghost, smallest)

**DON'T:**
```tsx
// Bad - two primary buttons
<div className="flex gap-4">
  <button className="bg-brand">Save</button>
  <button className="bg-brand">Publish</button>
</div>

// Good - primary + secondary
<div className="flex gap-4">
  <button className="bg-brand">Publish</button>
  <button className="border border-default">Save draft</button>
</div>
```

---

## Part 7: Cards

### Standard Card

```tsx
// Good
<Card className="p-6">
  {content}
</Card>

// Alternative with shadow
<Card variant="premium" className="p-6">
  {content}
</Card>
```

**Card props:**
- `variant`: `"default" | "premium" | "elevated"`
- `padding`: Already handled by content padding

### Card Anatomy

```
┌────────────────────────────────────┐
│  [Optional: CardHeader]            │
│  Title or section header           │
├────────────────────────────────────┤
│                                    │
│  CardContent                       │
│  Main content                      │
│                                    │
├────────────────────────────────────┤
│  [Optional: CardFooter]            │
│  Actions                           │
└────────────────────────────────────┘
```

### Usage Rules

**One card component per purpose:**
- Use `Card` for standard content
- Use `Card variant="premium"` for featured/highlighted content
- Never use `border border-default bg-surface` directly — use `Card`

**DON'T:**
```tsx
// Bad - custom card
<div className="border border-gray-200 bg-white rounded-lg p-6 shadow-sm">

// Good - design system card
<Card className="p-6">
```

---

## Part 8: Form Elements

### Input Fields

```tsx
<Field label="Email" hint="We'll send you a magic link">
  <Input type="email" placeholder="you@company.com" />
</Field>
```

### Input States

| State | Appearance |
|-------|------------|
| Default | `border border-default` |
| Focus | `border-brand ring-2 ring-brand/20` |
| Error | `border-status-danger ring-2 ring-status-danger/20` |
| Disabled | `opacity-50 cursor-not-allowed` |

### Usage Rules

**Always wrap inputs in `Field`:**
```tsx
// Bad
<div>
  <label>Name</label>
  <input className="border" />
</div>

// Good
<Field label="Name">
  <Input />
</Field>
```

**Validation messages:**
- Show errors below input with `text-status-danger text-body-sm`
- Use `aria-describedby` to link error to input
- Clear error when user starts typing

---

## Part 9: Badges & Status

### Badge Component

```tsx
<Badge variant="subtle">Draft</Badge>
<Badge variant="solid">Live</Badge>
<Badge variant="outline">Pending</Badge>
```

### StatusBadge (Semantic)

```tsx
<StatusBadge status="success">Active</StatusBadge>
<StatusBadge status="warning">Pending</StatusBadge>
<StatusBadge status="danger">Failed</StatusBadge>
<StatusBadge status="info">New</StatusBadge>
<StatusBadge status="ai">AI Analyzed</StatusBadge>
```

### Usage Rules

**StatusBadge for status, Badge for labels:**
- StatusBadge: dynamic status (active, pending, failed)
- Badge: static labels (tag, category, role)

---

## Part 10: Empty States

### Standard Empty State

```tsx
<EmptyState
  icon={BookmarkIcon}
  title="No saved exhibitors"
  description="Bookmark exhibitors you're interested in to see them here."
  action={{ label: "Browse exhibitors", href: "/e/techexpo-2027" }}
/>
```

### Usage Rules

**Empty states must include:**
- Icon (40×40px)
- Title (what's missing)
- Description (why it matters + what to do)
- Action (primary CTA to fix)

**Never show blank space with no indication.**

---

## Part 11: Loading States

### Skeleton Patterns

```tsx
// Card skeleton
<SkeletonCard />

// Table skeleton
<SkeletonTable rows={5} />

// Custom skeleton
<div className="space-y-3">
  <Skeleton className="h-5 w-48" />
  <Skeleton className="h-4 w-72" />
</div>
```

### Loading Behavior

**Show skeleton, not spinner** for content loading.
**Show spinner only** for actions in progress (button loading state).

### Usage Rules

**Skeleton colors:**
- Background: `bg-sunken`
- Shimmer: `skeleton-shimmer` animation

---

## Part 12: Motion & Animation

### Duration Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--mq-duration-fast` | 100ms | Micro-interactions (hover, press) |
| `--mq-duration-normal` | 200ms | UI transitions (open, close) |
| `--mq-duration-slow` | 300ms | Page transitions |
| `--mq-duration-slower` | 500ms | Complex animations |

### Easing Curves

| Token | Usage |
|-------|-------|
| `--mq-ease-standard` | Default (ease-out) |
| `--mq-ease-enter` | Elements entering (ease-out) |
| `--mq-ease-exit` | Elements leaving (ease-in) |
| `--mq-ease-bounce` | Playful feedback |

### Animation Usage Rules

**Use for understanding, not decoration:**
- Fade/slide to show new content arrived
- Scale for emphasis on interactive feedback
- Shimmer for loading states
- Pulse for attention indicators

**DON'T:**
- Animate colors (use transitions for hover only)
- Animate layout shifts
- Use bounce for serious actions
- Chain multiple animations

### Key Animations

| Class | Usage |
|-------|-------|
| `animate-fade-in` | Content appearing |
| `animate-fade-up` | Content appearing from below |
| `animate-scale-in` | Modals, dropdowns |
| `animate-shimmer` | Loading skeletons |
| `animate-pulse` | Live indicators |
| `animate-enter` | Page content stagger |

---

## Part 13: Responsive Design

### Breakpoints

| Name | Value | Usage |
|------|-------|-------|
| `sm` | 640px | Large phones |
| `md` | 768px | Tablets |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Large desktop |
| `2xl` | 1536px | Wide screens |

### Density Modes

| Mode | Use Case |
|------|----------|
| `comfortable` (default) | Most users |
| `compact` | Data-dense views (tables, dashboards) |

### Mobile-First Rules

1. Design for mobile first, enhance for desktop
2. Never hide critical actions on mobile
3. Sidebar becomes drawer on mobile
4. Bottom tabs for primary navigation on mobile
5. Touch targets minimum 44×44px

---

## Part 14: Accessibility

### Focus States

**Every interactive element must have a visible focus state:**
```tsx
// Good - uses focus ring
<button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2">

// Good - uses component with built-in focus
<Button>Label</Button>  // Button has focus styles built-in
```

### Color Contrast

| Element | Minimum Ratio |
|---------|---------------|
| Body text | 4.5:1 (AA) |
| Large text | 3:1 (AA) |
| UI components | 3:1 (AA) |
| Focus indicators | 3:1 (AA) |

### ARIA Patterns

| Pattern | Implementation |
|---------|---------------|
| Buttons | `<button>` with accessible label |
| Links | `<a>` with descriptive text |
| Form fields | `<label>` + `aria-describedby` for hints/errors |
| Dialogs | `role="dialog"`, focus trap, `aria-modal` |
| Navigation | `<nav>` with `aria-label` |

---

## Part 15: Implementation Checklist

Before shipping any UI, verify:

- [ ] All colors use semantic tokens (no raw hex/rgb values)
- [ ] Typography uses type scale classes
- [ ] Spacing uses 8-point scale (no arbitrary values)
- [ ] Cards use `Card` component
- [ ] Buttons use `Button` component with correct variant
- [ ] Inputs use `Field` + `Input` components
- [ ] Badges use `Badge` or `StatusBadge`
- [ ] Empty states use `EmptyState` component
- [ ] Loading uses skeletons (not spinners)
- [ ] Focus states are visible on all interactive elements
- [ ] No `!important` in styles
- [ ] No inline styles except dynamic values
- [ ] Motion is purposeful, not decorative
- [ ] Responsive works on all breakpoints
- [ ] Touch targets ≥44×44px on mobile
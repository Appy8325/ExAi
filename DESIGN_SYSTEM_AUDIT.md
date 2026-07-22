# DESIGN_SYSTEM_AUDIT

**Date:** July 22, 2026
**Auditor:** Principal Engineer + Staff Designer
**Goal:** Find duplicates, inconsistencies, and recommend a unified component library

---

## 0. METHODOLOGY

Every UI component across `packages/ui/` and `apps/web/src/components/` was audited against:
1. Is there a duplicate implementation?
2. Does it follow the design token system?
3. Is the API consistent with other components?
4. Is it exported correctly?

---

## 1. COMPONENT INVENTORY

### 1.1 UI Component Packages

| Package | Components | Source of Truth |
|---------|-----------|-----------------|
| `packages/ui` | 40+ foundation components | `packages/ui/src/components/foundation/foundation.tsx` |
| `packages/ui` | Button | `packages/ui/src/components/button/button.tsx` |
| `apps/web/src/components/navigation/` | GlobalNav, CommandPalette, Breadcrumbs | Web-specific |
| `apps/web/src/components/demo/` | LiveMetricsBar, SimulationStatusBadge, etc. | Demo-specific |
| `apps/web/src/components/auth/` | AuthSessionProvider, UserMenu | Auth-specific |

### 1.2 Foundation Components (packages/ui)

**File:** `packages/ui/src/components/foundation/foundation.tsx` (1153 lines)

All these export from `packages/ui/src/index.ts`:

| Component | Type | Token-Driven? | Consistency |
|-----------|------|---------------|-------------|
| `Card` | Polymorphic | Yes | GOOD |
| `PremiumCard` | Card variant | Yes | GOOD |
| `Input` | HTML input | Yes | GOOD |
| `Textarea` | HTML textarea | Yes | GOOD |
| `Field` | Layout wrapper | Yes | GOOD |
| `Table` | HTML table | Yes | GOOD |
| `TableHeader` | HTML thead | Yes | GOOD |
| `TableRow` | HTML tr | Yes | GOOD |
| `TableHead` | HTML th | Yes | GOOD |
| `TableCell` | HTML td | Yes | GOOD |
| `TableBody` | HTML tbody | Yes | GOOD |
| `Timeline` | HTML ol | Yes | GOOD |
| `TimelineItem` | HTML li | Yes | GOOD |
| `MetricCard` | Card variant | Yes | GOOD |
| `KPICard` | Card variant | Yes | GOOD |
| `StatusBadge` | Span | Yes | GOOD |
| `Badge` | Span | Yes | GOOD |
| `EmptyState` | Div + icon | Yes | GOOD |
| `Skeleton` | Div + shimmer | Yes | GOOD |
| `SkeletonCard` | Skeleton variant | Yes | GOOD |
| `SkeletonTable` | Skeleton variant | Yes | GOOD |
| `LiveBadge` | Span | Yes | GOOD |
| `CelebrationEffect` | Confetti | Yes | GOOD |
| `AnimatedCounter` | Span | Yes | GOOD |
| `Dialog` | Radix Dialog | Yes | GOOD |
| `DialogTrigger` | Radix | Yes | GOOD |
| `DialogClose` | Radix | Yes | GOOD |
| `DialogTitle` | Radix | Yes | GOOD |
| `DialogDescription` | Radix | Yes | GOOD |
| `DialogContent` | Radix | Yes | GOOD |
| `Drawer` | Radix + overlay | Yes | GOOD |
| `Toast` | Div | Yes | GOOD |
| `PageHeader` | Header | Yes | GOOD |
| `SectionHeader` | Div | Yes | GOOD |
| `Breadcrumbs` | Nav + items | Yes | GOOD |
| `DesktopNavigation` | Nav | Yes | GOOD |
| `MobileNavigation` | Nav | Yes | GOOD |
| `AiTypingIndicator` | Div | Yes | GOOD |
| `AiChatBubble` | Div | Yes | GOOD |
| `AiSuggestedQuestions` | Div | Yes | GOOD |
| `AiChat` | Div + children | Yes | GOOD |

### 1.3 Duplicate Component Analysis

**DUPLICATE FOUND: Two versions of `DemoPageHeader`**

| Version | File | Lines | Quality |
|---------|------|-------|---------|
| v1 | `apps/web/src/components/demo/shell.tsx` (exported as named export) | Lines 14-46 | Uses tokens ✓ |
| v2 | `apps/web/src/components/demo/demo-page-header.tsx` | Different file | Also uses tokens ✓ |

**Neither is the problem.** Both use the token system correctly.

**The real problem:** `DemoPageHeader` is in `packages/ui` conceptually but lives in `apps/web/src/components/demo/`. If another app wanted to use it, they'd need to duplicate it.

**Fix:** Move `DemoPageHeader` to `packages/ui` if it's meant to be shared. Or create a `packages/demo` package.

### 1.4 Demo-Specific Components (Not for Production)

| Component | File | Should Exist? |
|-----------|------|---------------|
| `LiveMetricsBar` | `live-metrics.tsx` | YES — for demo |
| `RecentActivityFeed` | `live-metrics.tsx` | YES — for demo |
| `LiveDemoStats` | `live-demo-stats.tsx` | YES — for demo |
| `InsightCard` | `live-metrics.tsx` | YES — for demo |
| `SimulationStatusBadge` | `shell.tsx` | YES — for demo |
| `DemoUnavailable` | `shell.tsx` | YES — for demo |
| `RelativeTime` | `relative-time.tsx` | YES — useful utility |
| `AnimatedCounter` | `animated-counter.tsx` | MOVEME — this is also in `packages/ui` |
| `TrackVisit` | `analytics-tracker.tsx` | NO — analytics tracking should not be a component |
| `TrackEvent` | `analytics-tracker.tsx` | NO — analytics tracking should not be a component |

---

## 2. MISSING COMPONENTS

### 2.1 Components That Should Exist

| Component | Why It's Missing | Suggested API |
|-----------|-----------------|--------------|
| `Select` | No dropdown found | `<Select options={[]} value={} onChange={} />` |
| `Checkbox` | No checkbox found | `<Checkbox checked={} onChange={} label="" />` |
| `RadioGroup` | No radio found | `<RadioGroup options={[]} value={} onChange={} />` |
| `Switch` (toggle) | No toggle found | `<Switch checked={} onChange={} />` |
| `Tabs` | No tabs found | `<Tabs items={['A', 'B']} />` |
| `Tabs` not in foundation | — | — |
| `Progress` | No progress bar | `<Progress value={75} />` |
| `Tooltip` | No tooltip | `<Tooltip content="Help">?</Tooltip>` |
| `Popover` | No popover | `<Popover trigger={<Button />}>Content</Popover>` |
| `Avatar` | No avatar component | `<Avatar src={} name={} size="md" />` |
| `AvatarGroup` | No avatar group | `<AvatarGroup users={[]} max={5} />` |
| `DataTable` (with sorting/pagination) | Basic Table only | — |
| `Charts` | No charts | — |
| `Calendar` | No date picker | — |

### 2.2 Forms Are Inconsistent

**Current state:** No consistent form library. Pages mix raw inputs, Field wrappers, and custom components.

**Recommendation:** Create a `Form` package within `packages/ui`:
```
packages/ui/src/components/form/
  Field.tsx        (label + input + error)
  TextInput.tsx    (wraps Input)
  TextareaInput.tsx (wraps Textarea)
  SelectInput.tsx   (new Select component)
  CheckboxInput.tsx  (new Checkbox component)
  SwitchInput.tsx    (new Switch component)
  Form.tsx           (form wrapper with handleSubmit)
  FormField.tsx      (composable field)
```

---

## 3. TOKEN VIOLATIONS

### 3.1 Critical Violations

**Demo admin** (`apps/web/src/app/demo/admin/page.tsx`) — hardcoded hex values throughout:
```tsx
// BAD — bypasses token system
<div className="bg-[#0a0a0f] text-[#e0e0e0]">
  <div className="bg-emerald-600 text-red-400" />
</div>

// GOOD — semantic tokens
<div className="bg-canvas text-primary">
  <div className="bg-success text-danger" />
</div>
```

**This is not cosmetic.** If the dark mode theme changes, this page breaks. If the design system color values change, this page won't reflect the update.

**Fix:** Replace ALL hardcoded values with semantic tokens.

### 3.2 Other Token Violations

| File | Issue | Severity |
|------|-------|----------|
| `hackathon/page.tsx` | Some raw Tailwind classes (emerald-500) | LOW |
| Marketing page | `text-brand` used inconsistently with `text-primary` | LOW |
| Demo pages | Inline `className="p-4"` and `className="p-6"` without design tokens | MEDIUM |

---

## 4. CONSISTENCY ANALYSIS

### 4.1 Button API

**File:** `packages/ui/src/components/button/button.tsx`

```typescript
<Button
  variant="primary" | "secondary" | "ghost" | "danger"
  size="sm" | "md"
  asChild={false}  // Uses @radix-ui/slot
>
```

**Good:** Consistent variants, size support, polymorphic `asChild`.

### 4.2 Card API

```typescript
<Card
  variant="default" | "elevated" | "outline" | "interactive"
  className=""
>
```

**Good:** Clear variants, proper use.

### 4.3 Input API

```typescript
<Input
  error={boolean}
  type="text" | "email" | "password"
  className=""
  // All HTML input attributes
/>
```

**Issue:** `error` is a boolean, but there's no way to set a custom error message per field.

**Fix:** Add `errorMessage` prop:
```typescript
<Input error={hasError} errorMessage={errors.email?.message} />
```

### 4.4 Field API

```typescript
<Field
  label=""
  helper=""
  error=""
  children
/>
```

**Good:** Composable. Used correctly throughout.

### 4.5 Dialog API

Uses Radix Dialog. All sub-components exported:
- `Dialog` (root)
- `DialogTrigger` (trigger button)
- `DialogClose` (close button)
- `DialogTitle`
- `DialogDescription`
- `DialogContent` (the actual modal)

**Good:** Radix provides accessible keyboard navigation, focus management, and ARIA attributes. ✓

---

## 5. COMPONENT CONSOLIDATION RECOMMENDATIONS

### 5.1 Remove from Web, Move to UI

| Component | Reason |
|----------|--------|
| `AnimatedCounter` | Also in `packages/ui` as `AnimatedCounter`. Remove from web. |
| `RelativeTime` | Utility, could be in `packages/shared` or `packages/ui` |

### 5.2 Consolidate Demo Components

**Option A:** Move to `packages/demo` (new package)
**Option B:** Keep in `apps/web/src/components/demo/` but rename to avoid confusion with production components
**Option C:** Delete `DemoPageHeader` duplicate

**Recommendation:** Option B. Create `apps/web/src/components/demo/ui/` for demo-specific UI. Keep business-logic components separate.

### 5.3 Analytics Tracking Should Not Be Components

`TrackVisit` and `TrackEvent` are hooks/logic, not UI components. Move to `lib/analytics.ts`:
```typescript
// lib/analytics.ts
export function trackEvent(name: string, properties?: Record<string, unknown>) {
  // PostHog capture
}
export function trackPageView(url: string) {
  // PostHog pageview
}
```

---

## 6. TYPOGRAPHY & SPACING

### 6.1 Typography System

**Tokens:** Defined in `packages/ui/src/styles/foundation.css`

| Token | Value | Usage |
|-------|-------|-------|
| `--mq-type-display` | 2.25rem/2.5rem | Hero headings |
| `--mq-type-title-lg` | 1.5rem/2rem | Page titles |
| `--mq-type-title` | 1.25rem/1.75rem | Section headers |
| `--mq-type-body-lg` | 1rem/1.5rem | Body text |
| `--mq-type-body` | 0.875rem/1.25rem | Secondary text |
| `--mq-type-caption` | 0.75rem/1rem | Labels, metadata |

**Issue:** No `font-display`, `font-heading`, etc. utilities defined. Only `font-sans` and `font-mono`.

**Fix:** Add heading utility:
```css
.font-display { font-family: var(--font-inter); font-weight: 700; letter-spacing: -0.02em; }
```

### 6.2 Spacing System

**Tokens:** `mq-space-gutter`, `mq-space-section`, etc.

**Issue:** Many components use arbitrary Tailwind spacing (`p-4`, `gap-6`) instead of tokens. This makes redesigns harder.

**Recommendation:** Use Tailwind's `@apply` to create spacing utilities:
```css
@layer components {
  .section-padding { @apply py-8 md:py-12 lg:py-16; }
  .card-padding { @apply p-5; }
}
```

---

## 7. COLOR SYSTEM

### 7.1 Semantic Tokens

**Light mode (from `semantic.css`):**
```
--mq-bg-canvas   → slate-50
--mq-bg-surface  → #FFFFFF
--mq-bg-raised   → #FFFFFF
--mq-bg-sunken   → slate-100
--mq-text-primary   → slate-900
--mq-text-secondary → slate-600
--mq-text-muted     → slate-500
--mq-border-default → slate-200
--mq-border-strong  → slate-300
```

**Good:** All UI should use these tokens, not raw colors.

### 7.2 Status Colors

| Token | Usage | Hex (light) |
|-------|-------|-------------|
| `--mq-color-success` | Lead captured, complete | emerald-600 |
| `--mq-color-warning` | Needs follow-up | amber-500 |
| `--mq-color-danger` | Critical, error | red-500 |
| `--mq-color-info` | New items | sky-500 |
| `--mq-color-ai` | AI-generated | violet-600 |

**Good:** Consistent, meaningful.

---

## 8. ACCESSIBILITY

### 8.1 What Works

- Radix Dialog provides full ARIA, keyboard nav ✓
- SkipLink in root layout ✓
- `aria-expanded`, `aria-label`, `aria-current` on navigation ✓
- `role="menu"` patterns on UserMenu ✓
- Focus-visible ring throughout ✓
- `prefers-reduced-motion` support ✓

### 8.2 What's Missing

| Component | Missing | Fix |
|-----------|---------|-----|
| `Input` | No `aria-invalid` when error=true | Add `aria-invalid="true"` when error |
| `StatusBadge` | No `aria-label` on icon-only badges | Add `aria-label="High intent"` |
| `EmptyState` | No `role="status"` for assistive tech | Add `role="status"` |
| All forms | No `aria-describedby` linking error to field | Add `aria-describedby` |
| Dialog | No focus trap outside dialog | Radix handles this ✓ |

---

## 9. DENSITY MODES

### 9.1 Density System

**Defined in `packages/ui/src/styles/density.css`:**

| Mode | Control Height | Table Row | Card Padding |
|------|---------------|----------|--------------|
| Comfortable | 40px | 52px | 20px |
| Compact | 32px | 40px | 16px |

**Issue:** The application doesn't implement density switching. There's no UI control to toggle between modes.

**Recommendation:** Add a density switcher in user settings or the command palette:
```typescript
// User preference stored in Supabase
const density = user.preferences.density ?? 'comfortable';
```

---

## 10. DARK MODE

### 10.1 Current State

**Fully implemented** via `semantic.css` with dark mode overrides:
```css
@media (prefers-color-scheme: dark) {
  --mq-bg-canvas: slate-950;
  --mq-bg-surface: slate-900;
  --mq-text-primary: slate-50;
  /* etc. */
}
```

### 10.2 Verification Needed

The demo admin page (`app/demo/admin`) uses raw hex values. This almost certainly breaks in dark mode. **Verify and fix.**

### 10.3 Forced Dark Mode

No mechanism to force dark mode. Supabase auth doesn't provide a theme preference.

**Recommendation:** Add a theme toggle to user settings, stored in Supabase. Apply via `data-theme="dark"` on `<html>`.

---

## 11. ICON SYSTEM

### 11.1 Current State

**lucide-react** is used throughout. It's tree-shakeable and consistent.

**Usage:**
```tsx
import { ChevronRight, Users, Building2 } from 'lucide-react';
```

**No icon wrapper component found.** This is fine — lucide-react is standard.

### 11.2 Icon Size Consistency

| Context | Size | Icon Usage |
|---------|------|-----------|
| Navigation | 20px | `className="size-5"` |
| Buttons | 16px | Icon inside Button |
| Status | 16px | Inline status indicators |
| EmptyState | 24px | EmptyState illustrations |

**Good:** Consistent with `size-*` utility.

---

## 12. ANIMATION

### 12.1 Animation Keyframes

**16+ keyframe animations** in `foundation.css`.

Key ones:
- `fade-in` — opacity 0→1
- `slide-in-up` — translateY(8px)→0
- `shimmer` — gradient sweep for skeletons
- `pulse-ring` — live indicator animation
- `confetti` — CelebrationEffect

### 12.2 Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Good.** ✓

### 12.3 Animation Performance

No `will-change` hints found. For animated components (confetti, shimmer), consider adding:
```css
.will-change-transform { will-change: transform; }
```

---

## 13. UNIFIED COMPONENT LIBRARY RECOMMENDATION

### 13.1 Consolidate Into One Package

**Recommendation:** All production-ready components belong in `packages/ui`. Nothing in `apps/web/src/components/` should be reusable UI.

**New structure:**
```
packages/ui/
  src/
    components/
      foundation/    ← All base components (Card, Button, Input, etc.)
      form/          ← NEW: Form components (Field, Select, Checkbox, etc.)
      navigation/    ← Breadcrumbs, DesktopNav, MobileNav
      feedback/     ← Toast, Dialog, Drawer, EmptyState, Skeleton*
      data/          ← Table, MetricCard, KPI*
      ai/            ← AiChat, AiChatBubble, AiTypingIndicator, AiSuggestedQuestions*
  styles/
    tokens/         ← Design tokens (primitives, semantic, density)
```

*Already exist but could be better organized.

### 13.2 Components to Remove from Web

| Component | Location | Reason |
|-----------|----------|--------|
| `AnimatedCounter` | `apps/web/src/components/demo/animated-counter.tsx` | Duplicated in `packages/ui` |
| `DemoPageHeader` (v2) | `apps/web/src/components/demo/demo-page-header.tsx` | Duplicated |
| `TrackVisit/TrackEvent` | `apps/web/src/components/demo/analytics-tracker.tsx` | Not UI components |
| `LiveBadge`, `LiveMetricsBar`, etc. | `apps/web/src/components/demo/` | Demo-only, not for production |

### 13.3 Components to Add to UI

| Component | Priority |
|-----------|----------|
| `Select` | HIGH |
| `Checkbox` | HIGH |
| `Switch` | HIGH |
| `Tooltip` | HIGH |
| `Progress` | MEDIUM |
| `Avatar` | MEDIUM |
| `Tabs` | MEDIUM |
| `Popover` | LOW |
| `Calendar`/`DatePicker` | LOW |
| `Charts` | LOW |

---

## SCORECARD

| Dimension | Score | Notes |
|-----------|-------|-------|
| Component coverage | 6/10 | Missing form primitives (Select, Checkbox) |
| Token usage | 6/10 | Demo admin bypasses system |
| Consistency | 7/10 | Generally good, some variance |
| Duplication | 7/10 | Mostly clean, 2-3 duplicates |
| API design | 8/10 | Clean props, good polymorphism |
| Accessibility | 8/10 | Radix handles most, minor gaps |
| Documentation | 4/10 | No Storybook, no usage docs |

**Overall: 6.5/10** — Strong foundation with clean design token system. Needs consolidation, form primitives, and removal of demo-specific code.

---

## TOP 5 IMPROVEMENTS

1. **Remove raw hex in demo admin** — One page breaking dark mode
2. **Add Select, Checkbox, Switch to UI** — Forms are incomplete
3. **Add Tooltip, Popover, Tabs** — Common interaction patterns missing
4. **Deduplicate AnimatedCounter** — Keep one version in `packages/ui`
5. **Move demo-specific to `apps/web/src/components/demo/ui/`** — Clear separation of production vs demo components
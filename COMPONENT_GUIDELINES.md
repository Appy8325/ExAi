# ExAi RC3 Component Guidelines

## Shared rules

Compose shared UI from `packages/ui`; do not recreate a component in a feature. Every interactive component must have hover, focus-visible, disabled, loading where applicable, keyboard behavior, and a narrow-screen layout.

## Actions and inputs

| Component | Rules |
|---|---|
| Button | Primary: one per decision area. Secondary: supporting action. Ghost: low-emphasis navigation. Danger: destructive confirmation only. Minimum target 40px comfortable / 32px compact. |
| Input, select, date picker | Label always visible; helper text below; errors replace helper text and are connected programmatically. Required is text plus indicator, not color alone. |
| Search and filters | Search is immediate when safe; filters show selected count, clear affordance, and results impact. Preserve values on validation error. |
| Form | Group by task; 24px between groups, 12px within a field stack; place validation next to the affected field; use a review/confirmation step for destructive submission. |

## Content and navigation

| Component | Rules |
|---|---|
| Card | Use only for a bounded, independently actionable or scannable unit. Default is bordered; elevation is for interactive or raised content. |
| Badge | Short semantic state label, never a substitute for body copy. Status badges use status tokens; AI badge uses violet. |
| Tabs | Switch peer content only, preserve state in the existing routing model, and support arrows/Home/End. |
| Breadcrumbs | Show hierarchy when it aids orientation; current page is plain text with `aria-current`. |
| Sidebar/top nav | One active location, clear grouping, keyboard access, and a mobile drawer or compact navigation pattern. |
| Command palette | Fast keyboard entry, visible shortcut, semantic grouping, arrow navigation, and escape to close. |

## Data, feedback, and overlays

| Component | Rules |
|---|---|
| Table | Sticky header only when useful; 52px/40px density rows; sortable headers expose direction; mobile becomes prioritized columns or row detail, not a squeezed desktop table. |
| Metrics/charts | Maximum four primary KPI cards. Pair each value with label and contextual detail; label data directly where possible. |
| Modal/drawer | Focus moves in on open and returns on close; Escape and backdrop close when safe; drawer is preferred for contextual task work. |
| Toast | Brief, actionable, polite by default; errors persist until dismissed or resolved; never use a toast as the only validation feedback. |
| Empty/loading/error | Explain what is absent, loading, or failed; provide one relevant recovery action; skeletons match final structure and never masquerade as data. |

## Enterprise workspace components

| Component | Rules |
|---|---|
| KPI card / metric | Use a label, value, contextual detail, optional accurately sourced trend, and accessible comparison. A KPI card is decision support, not decoration. |
| Timeline / activity feed | Time-grouped, newest-first unless a workflow needs chronology; identify actor, action, target, timestamp, and source. Collapse routine noise and provide filters for high-volume histories. |
| Pagination | State the current range and total; preserve filters/sort/search; offer cursor or page navigation appropriate to the existing API without changing it. |
| Filter bar / bulk actions | Filters expose applied state, count, reset, and a compact mobile summary. Bulk actions appear only after selection, name the selection count, and require confirmation for destructive actions. |
| Combobox / multi-select | Support typing, arrows, Enter, Escape, clear selection, loading, empty result, and selected-value announcements. |
| Date picker / range | Use locale-aware display, explicit timezone context where data is event-sensitive, keyboard selection, and a clear range state. |
| Menu, popover, tooltip | Menus contain actions; popovers contain contextual controls; tooltips clarify nonessential labels and are never the sole path to information. |
| Avatar / presence | Avatar has text fallback; presence is supplemental and never used as the only availability signal. |
| File upload | Show accepted types/limits before selection, progress during transfer, recoverable failure, and accessible remove/retry actions. |
| Notification center | Group by recency and type, retain unread state, offer a clear action, and never use color alone for urgency. |
| Progress / stepper | Show label, current state, and numeric or textual progress. Steps reflect actual workflow state, not a guess. |
| Analytics chart | Include title, time range, unit, loading/empty/error states, legend, accessible data alternative, and source/compare context. |
| AI response | Mark provenance, show generation/loading/error state, make citations or source data discoverable, and never represent an inference as a verified system fact. |

## Component definition of done

Each shared component documents purpose, variants, anatomy, semantic roles, states, keyboard behavior, ARIA/native-element choice, responsive behavior, content limits, and examples. It must work in light/dark and comfortable/compact modes before adoption.

## Accessibility baseline

Use native elements before ARIA roles; name every icon-only action; preserve focus after asynchronous updates; provide keyboard equivalents for pointer behavior; never suppress the focus ring. Touch targets meet 44px where space permits, especially mobile navigation and high-frequency actions.

# SaaS UX Revamp Plan

**Date:** 2026-07-23  
**Scope:** UX/UI improvements only. Preserve existing business logic, API contracts, routes, and completed architecture.  
**Status:** Proposed — no implementation included.

## Executive assessment

**Current UX score: 7.2 / 10.** ExAi has a credible, consistent SaaS foundation: semantic tokens, a clear role model, reusable cards and status primitives, keyboard-aware navigation, skeletons on many high-traffic routes, and deliberately structured organizer dashboards. The experience is not ready for a broad visual redesign; it needs a small, disciplined polish program that makes its good patterns universal.

The reference products differ in visual style, but share useful principles:

- **Linear:** strong wayfinding, compact-but-readable information density, command access that is genuinely useful.
- **Vercel:** a restrained hierarchy and clear separation of marketing, product, and operational contexts.
- **Stripe and Clerk:** predictable forms, field-level feedback, explicit recoverable errors, and safe action states.
- **Notion and Attio:** contextual navigation and progressive disclosure that keep complex records understandable.
- **Supabase and GitHub:** dense data views that remain scannable, with obvious filtering and empty-state recovery paths.
- **Raycast:** fast, intentional interactions; commands should do real work or stay out of the way.

## Strengths to preserve

- Role separation is clear: organizer, exhibitor, attendee, and admin have distinct surfaces.
- The dashboard standard gives operational pages a useful decision hierarchy.
- Semantic color and status vocabulary are largely coherent, and accessibility basics (skip link, focus rings, reduced motion) are already present.
- Tables, cards, badges, and empty states are available as shared primitives.
- The attendee experience uses appropriately constrained reading widths; organizer and portal layouts have a familiar workspace model.
- Skeleton-based loading is already established on most organizer and demo routes.

## Audit coverage and priority

| Priority | Surface / screens | Audit finding | Target |
|---|---|---|---|
| P0 | Shared navigation, portal root, command palette | Wayfinding and workspace switching are uneven; the palette only searches static routes. | RC2 |
| P0 | All mutations and long forms: event, booth, lead-form, session, speaker, attendee-profile | Submission feedback and field validation are inconsistent; long forms lack a dependable action zone. | RC2 |
| P0 | Error, loading, and empty states across all route groups | Loading coverage is partial and there are no route-level `error.tsx` boundaries. Several empty states describe a dead end instead of the next step. | RC2 |
| P0 | Exhibitor dashboard and workspace | Orientation and action hierarchy remain weaker than the organizer dashboard; duplicate pipeline signals dilute focus. | RC2 |
| P1 | Organizer event workspace: overview, exhibitors, documents, sessions, speakers, registrations, reports | Good building blocks, but page tabs, tables, filters, bulk/detail actions, and form patterns do not yet feel like one system. | RC2 |
| P1 | Attendee directory, exhibitor detail, saved list, QR/booth flow, profile | Mobile-first intent is good, but discovery controls and form consent/input patterns need clearer feedback and small-screen treatment. | RC2 |
| P1 | Analytics, demo organizer analytics, demo admin | The production analytics taxonomy is sound; demo/operational views can still overload the first viewport and need stronger progressive disclosure. | RC2 |
| P2 | Marketing, auth, hackathon, showcase | Visually polished, but component reuse and CTA treatment drift from the product system. | Post-v1 |
| P2 | Admin | Structure is appropriate, but the useful ceiling is governed by observability data, not another visual pass. | Post-v1 |

## Recommended improvements

| Recommendation | Why it should change | Expected user benefit | Effort | Timing |
|---|---|---:|---|---|
| Establish one authenticated-page shell contract: workspace nav, contextual breadcrumb, title, optional page tabs, and one primary action. | These patterns exist but are not consistently present, especially on portal and attendee detail routes. | Faster orientation; fewer “where am I?” mistakes. | M | RC2 |
| Keep the global perspective switcher for demo/marketing only; let authenticated workspaces rely on their own sidebar and contextual controls. | Switching product personas from inside a task workspace is visually noisy and can suggest the user is changing account context. | Cleaner task focus and a more credible SaaS workspace model. | S | RC2 |
| Make the command palette either data-aware (events, exhibitors, relationships) or navigation-only with explicit labeling. | A static-route search promises more than it delivers. | Trustworthy keyboard navigation instead of a dead-end search affordance. | M | Post-v1 for data search; XS wording/positioning in RC2 |
| Add a shared page-state pattern: matching skeleton, recoverable error panel, actionable empty state, and success confirmation. | Coverage is incomplete and error treatment varies by page. | Users can recover without support and understand whether an action worked. | M | RC2 |
| Standardize mutations around pending, success, and failure states. Use an inline status near the action plus a non-blocking toast for completed work. | Several actions rely on navigation or server refresh for confirmation. | Less uncertainty after publish, save, invite, generate, and archive actions. | M | RC2 |
| Standardize `Field`-based validation: required indicators, validate on blur after first interaction, error copy beside the field, and preserved values on failure. | Forms currently communicate problems late and several native inputs bypass the shared pattern. | Fewer failed submissions and faster correction. | M | RC2 |
| Add a sticky mobile/tablet action bar only to long edit/create forms. | Bottom-only actions create unnecessary scrolling and lost context. | Faster form completion on small screens without changing backend flows. | S | RC2 |
| Give exhibitor dashboard headers explicit event + company/booth identity; promote one primary next action, normally QR sharing or follow-up work. | “Booth Dashboard” alone does not establish context and equal-weight quick actions hide the value-driving action. | Immediate orientation and clearer next step. | S | RC2 |
| Remove or reframe duplicated exhibitor pipeline metrics; explain scan-rate values above 100% in plain language. | Pipeline Health repeats stage cards; percentages can read as erroneous. | Lower cognitive load and greater metric confidence. | S | RC2 |
| Replace an empty first-visit AI panel with a concise “what appears here” state and a direct setup/action link. | AI currently looks optional when there is no historic signal. | AI value is understandable before data accumulates. | S | RC2 |
| Apply a shared table toolbar where data collections merit it: search, filter count, sort, result count, and responsive card fallback. | Tables are semantically sound but are inconsistent in discovery controls and do not scale to a dense operational workflow. | Faster finding and acting on exhibitors, relationships, and attendees. | M | RC2, starting with Exhibitors and Attendees |
| Use progressive disclosure for secondary activity, dense demo analytics, and optional configuration; keep health, attention, and the primary task visible. | Several operational/demo pages place equally weighted information in the first viewport. | Better scanning and decision-making without losing capability. | S | RC2 |
| Standardize date, number, status wording, and unavailable-state copy through small shared formatters and message conventions. | The same concepts currently use different labels/formats, which weakens cross-product polish. | A more predictable, professional product language. | S | RC2 |
| Finish the design-system adoption pass on raw controls and hand-styled links, including search/filter inputs and custom action buttons. | The shared system exists, but some surfaces bypass it. | Better consistency, focus behavior, and future maintenance. | M | Post-v1; only touch files already changed for RC2 work |

## Navigation and information architecture

1. **One hierarchy per authenticated screen.** Use `breadcrumb → page title → optional sibling tabs → content`; do not substitute a generic back link when a breadcrumb communicates the structure better.
2. **Make event context persistent.** On organizer event sub-pages, the selected event should remain visible in the header or tab context. A user should never infer the current event from a URL or prior page alone.
3. **Group sidebar destinations by job, not implementation.** Organizer: Overview, Events, Analytics; Event: Overview, Exhibitors, Content (sessions/speakers/documents), Reports, Settings. Exhibitor: Dashboard, Relationships/Visitors, Booth setup, QR, Intelligence, Settings.
4. **Do not add navigation density.** Existing sidebar item counts are close to the useful limit. Use a “More” group or page tabs before adding another primary item.
5. **Treat search as a workflow tool.** Until it searches workspace entities, present the palette as “Go to…” rather than universal search.

## Dashboard and component direction

### Dashboards

- Keep frozen organizer, event, analytics, reports, and admin hierarchies intact. The dashboard standard is the right guardrail.
- Keep analytics analytical: funnel, segments, comparisons, and drill-down. Do not reintroduce dashboard KPI duplication.
- Keep reports narrative-first. The report state machine (empty → generating → complete/failed) should be the reference for other asynchronous work.
- Make dashboards action-led, not card-led: at most four primary KPIs; attention and a next-best action should be obvious above the fold.

### Components and states

- Add only the smallest missing shared patterns: `PageState` (error/empty wrapper), `FormActions` (pending + confirmation), `DataToolbar`, and a formatter module. Do not create a large dashboard framework.
- Use existing `Button`, `Field`, `Input`, `Textarea`, `Select`, `Table`, `EmptyState`, `Skeleton`, `StatusBadge`, and `PageHeader` before creating anything new.
- Every new empty state should state what is absent, why that is normal, and what the user can do next. Only include a CTA when the user can act.
- Tables should have clear row affordance, a visible action column only where needed, and a card/list fallback below the tablet breakpoint.

## Interaction and motion

- Keep motion restrained: 150–250 ms for hover, press, menus, and success transitions; 250–350 ms only for first-load content reveals.
- Use motion to confirm changes (row added, saved state, panel open), never to decorate static dashboards.
- Honor `prefers-reduced-motion` globally; the existing override is a strong baseline.
- Use optimistic UI only where the action is reversible or the current API already provides safe confirmation. For publish/archive/generate operations, show explicit pending and final status instead.
- Provide visible focus, keyboard operation, and an accessible name for every icon-only control; use dialogs only for destructive or irrevocable actions.

## Accessibility and mobile

### Accessibility

- Add route-level recoverable error boundaries and ensure errors use `role="alert"` only when immediate announcement is needed.
- Audit all raw checkbox, select, textarea, and icon-button usages; connect labels, hints, errors, and `aria-describedby` consistently.
- Verify token contrast with automated checks and manual review for muted text, status tints, and focus rings in both themes.
- Make filtered result counts and asynchronous report/generation progress available to assistive technology.

### Mobile

- Keep attendee screens single-column and thumb-friendly; retain the existing 44 px coarse-pointer target rule.
- Collapse workspace navigation behind a labeled control on smaller breakpoints while preserving the current page title and primary action.
- Convert wide operational tables into prioritized cards on mobile rather than relying on horizontal scrolling as the primary interaction.
- Put search and filters in a compact, persistent control row; move secondary filters into a drawer only when there are more than two.
- Use sticky action bars only for long forms and ensure they do not obscure field errors or the keyboard.

## RC2 delivery sequence

1. **State and form foundation:** shared page state, error boundaries, mutation feedback, field validation conventions, and format/message rules.
2. **Workflow clarity:** authenticated shell coverage, event context, exhibitor dashboard orientation/CTA/metric cleanup, and first-visit AI state.
3. **Operational discovery:** table toolbars and responsive list behavior for exhibitors, attendees, and relationships.
4. **Density pass:** progressive disclosure on demo/analytics and remaining high-density screens, then a focused mobile and keyboard QA pass.

## Deferred to Post-v1

- Data-backed global command search.
- Real-time product state and richer admin observability, which require backend/telemetry work.
- Advanced table pagination, saved views, bulk actions, and drill-down analytics.
- A broad marketing-page or visual-brand redesign.
- New dashboard abstractions beyond the small shared patterns listed above.

## Acceptance criteria for RC2

- Every authenticated route has an intentional loading, empty, and recoverable error state.
- Every mutation gives a visible pending and outcome signal.
- Long forms are usable on a 360 px viewport without losing the primary action or field errors.
- The exhibitor dashboard identifies the current booth/event and has one clear primary action.
- Core collection screens provide search/filter/sort affordances appropriate to their data volume and become usable cards on mobile.
- No new raw controls, hand-styled button links, raw colors, or non-semantic interactive elements are introduced.
- Keyboard, focus, reduced-motion, and color-contrast checks pass for every changed screen.


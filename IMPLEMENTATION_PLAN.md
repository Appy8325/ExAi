# ExAi RC3 Implementation Plan

## Scope guardrail

This document plans visual-system adoption only. Do not alter backend, APIs, database, routing, permissions, authentication, or business logic. No implementation begins until the five RC3 deliverables are approved.

## Phase 0 — approve the system

- Review `DESIGN_SYSTEM.md`, `DESIGN_TOKENS.md`, `COMPONENT_GUIDELINES.md`, and `LAYOUT_GUIDELINES.md`.
- Confirm the token naming, density behavior, navigation model, and accessibility baseline.
- Record accepted exceptions before component changes begin.

## Phase 1 — stabilize foundations

- Audit existing `--mq-*` primitives, semantic mappings, typography, motion, and density tokens against the approved system.
- Close only documented token gaps; do not introduce a parallel token system.
- Add visual checks for light/dark, comfortable/compact, reduced motion, and keyboard focus.
- Publish a component inventory with owner, consumers, replacement target, and migration state before changing consumers.

## Phase 2 — consolidate shared components

- Inventory existing feature-local variants and map them to the shared package.
- Update foundations first: buttons, inputs/fields, cards, badges, dialogs/drawers, tabs, table primitives, feedback states, and navigation.
- Preserve existing public component APIs where possible; use adapters only when a direct replacement would alter behavior.
- Establish a documented component definition of done and visual-contract baseline before broad adoption.

## Phase 3 — update shared layouts

- Apply the approved page-header, sidebar, top-navigation, breadcrumbs, and mobile patterns.
- Convert dashboard shells to the approved hierarchy without changing data selection or actions.
- Standardize table, filter, form, and empty/error/loading layouts.

## Phase 4 — refine by page type

- Migrate operational dashboards first, then analytics/reports, then settings and supporting surfaces.
- Work in vertical slices only after shared components and layouts are ready.
- Validate each slice for role permissions, keyboard operation, narrow screens, and visual regressions.

## Migration controls

- Migrate in cohorts: shared shell and foundations, one representative dashboard per role, then remaining pages by component reuse.
- Keep one source of truth for each migrated component; do not maintain permanent “old” and “new” design systems.
- Use a replacement matrix to retire page-local CSS only after all known consumers move. Preserve behavior and API contracts through the migration.
- Require a visual-review owner and product owner for each cohort; track exceptions with expiry dates.
- Pilot a representative organizer, exhibitor, and admin workflow before expanding to the remaining surfaces. Roll back a cohort only by reverting its visual composition, never by branching backend behavior.

## Release gates

Each migrated surface passes: no raw color/token bypasses; one primary CTA per decision area; AA contrast; keyboard-visible focus; correct loading/empty/error behavior; light/dark and density checks; no routing or business-logic changes. Roll out behind existing release controls if available, then remove deprecated local styles after all consumers migrate.

The release record also includes: component API changes, visual comparison approval, affected roles/pages, exception status, and a named owner for post-release feedback.

## Success measure

ExAi should read as one product across organizer, exhibitor, attendee, and admin workspaces: consistent hierarchy, calm surfaces, predictable interaction, and no regression in existing workflows.

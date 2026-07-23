# RC3 Phase 2 — Duplicate UI Primitive Audit

## Scope

This is a read-only audit. Dashboard Stabilization remains the release gate; no Phase 2 implementation is authorized until it receives `DEMO CERTIFIED` status.

## Genuine duplicate inventory

| File path | Component | Replace with | Complexity | Replacement safety |
|---|---|---|---|---|
| `apps/web/src/components/navigation/breadcrumbs.tsx` | `Breadcrumbs` renderer | `@concourse/ui` `Breadcrumbs` | Medium | Requires feature-specific handling: retain route-to-item resolution locally, pass resolved items into the shared renderer. |
| `apps/web/src/components/navigation/unified-breadcrumbs.tsx` | `UnifiedBreadcrumbs` renderer | `@concourse/ui` `Breadcrumbs` | Medium | Requires feature-specific handling: consolidate route resolution with the legacy breadcrumb resolver first; do not change link semantics during replacement. |
| `apps/web/src/components/demo/animated-counter.tsx` | `AnimatedCounter` | `@concourse/ui` `AnimatedCounter` | Low | Safe after comparing the current formatting and duration defaults; both own display-only count-up behavior. |

## Replacement plan

1. Keep routing logic as a small feature adapter, but delete both local breadcrumb renderers in favor of the shared presentational component. Choose one resolver only; the two current route maps diverge and must not both survive.
2. Replace demo-local counter imports with the shared export only where the public props match. Preserve any dashboard-specific wrapper (`AnimatedMetricCard`) because it composes presentation rather than duplicating the primitive.
3. Run the normal typecheck, lint, and build gates after each independently reviewable replacement.

## Explicit non-duplicates

- `PageTabs` is a navigation pattern with pathname matching and count semantics; no shared tabs primitive currently exposes the required behavior.
- `CommandPalette` uses shared dialog primitives but owns route/action search, keyboard selection, and navigation behavior; it is feature-specific.
- `LiveMetricsBar`, `RecentActivityFeed`, and dashboard metric compositions are feature-specific views over live simulation data, not general primitives.
- Feature-local cards, tables, status treatments, loading states, inputs, and page headers already import their corresponding shared primitives in the reviewed surfaces.

## Risk assessment

| Risk | Control |
|---|---|
| Breadcrumb replacement loses dynamic route links | Add route-resolver tests before removing either renderer. |
| Counter replacement subtly changes the live dashboard visual cadence | Compare zero, increment, and cap states during dashboard certification. |
| Broad mechanical migration creates churn without a benefit | Restrict Phase 2 to the three entries above; do not replace feature-local behavior. |

## Estimated effort

- Breadcrumb consolidation: 0.5–1 day, including route coverage checks.
- Counter consolidation: under 0.5 day.
- Review and regression validation: 0.5 day.

**Total: 1–2 engineer-days after Dashboard Stabilization is certified and Phase 2 implementation is approved.**

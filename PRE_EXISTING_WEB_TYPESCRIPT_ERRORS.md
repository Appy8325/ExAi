# Pre-existing Web TypeScript Errors

**Date:** July 22, 2026
**Source:** Phase 0 environment validation pipeline — Step 5 (Production build)
**Type:** Application code defect (out of scope for Phase 0 — environment validation only)
**Status:** Open

---

## Summary

The web production build fails due to pre-existing TypeScript errors that existed before the Phase 0 clean reinstall. The API build passes cleanly. These errors are source code issues, not environment issues.

Phase 0 objective: **environment validation** — not product-wide bug fixing. These are tracked here for resolution in a separate effort.

---

## Errors Found

### Module Not Found (5 errors)

| File | Missing Module |
|------|---------------|
| `src/app/(portal)/exhibit/[organizationId]/ai-insights/ai-insights-screen.tsx` | `../_components/ai-insight-cards` |
| `src/app/(portal)/exhibit/[organizationId]/dashboard/[eventExhibitorId]/dashboard-screen.tsx` | `../../_components/kpi-grid` |
| `src/app/(portal)/exhibit/[organizationId]/dashboard/[eventExhibitorId]/dashboard-screen.tsx` | `../../_components/quick-actions` |
| `src/app/(portal)/exhibit/[organizationId]/dashboard/[eventExhibitorId]/dashboard-screen.tsx` | `../../_components/activity-feed` |
| `src/app/(portal)/exhibit/[organizationId]/dashboard/[eventExhibitorId]/dashboard-screen.tsx` | `../../_components/ai-insight-cards` |

### Import Conflict (1 error)

| File | Issue |
|------|-------|
| `src/app/(portal)/exhibit/[organizationId]/attendees/attendee-list-screen.tsx` | `StatusBadge` import conflicts with local declaration |

### Type Mismatches (23 errors)

| File | Errors |
|------|--------|
| `src/app/(console)/org/events/[eventId]/page.tsx` | `event` possibly undefined (8 errors), `"neutral"` not assignable to `"danger" \| "warning" \| "good"` (2 errors) |
| `src/app/(console)/org/page.tsx` | `top` possibly undefined (13 errors) |

### Component Prop Error (1 error)

| File | Error |
|------|-------|
| `src/app/(portal)/exhibit/[organizationId]/attendees/attendee-list-screen.tsx` | `children` not assignable to `StatusBadge` props |

**Total: 30 errors across 5 files.**

---

## Validation Results

| Step | Result |
|------|--------|
| Step 1: Remove node_modules | ✅ PASS |
| Step 2: Clean pnpm install | ✅ PASS |
| Step 3: Verify dependency integrity | ✅ PASS |
| Step 4: Type check — API | ✅ PASS (zero errors) |
| Step 4: Type check — Web | ❌ FAIL (30 pre-existing errors) |
| Step 5: Build — API | ✅ PASS |
| Step 5: Build — Web | ❌ FAIL (5 module-not-found errors) |

---

## Note

The API build passes cleanly after the clean reinstall. The environment fix was successful. The web errors are pre-existing code defects unrelated to the Phase 0 work. They should be resolved separately as part of normal product development.
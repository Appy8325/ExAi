# Tech Debt Review

**Date:** 2026-07-22
**Purpose:** Document architectural inconsistencies, code quality issues, and deferred decisions that don't block RC-1 but should be addressed post-launch.

---

## Architectural Debt

### T1 — No Shared Dashboard Layout Component

**Issue:** Each dashboard (`exhibitor`, `organizer`, `event`, `admin`, `analytics`, `reports`) implements its own layout structure. `PageHeader` is used inconsistently — Organizer, Event, Admin, Analytics use it; Exhibitor and Reports use custom inline headers.

**Recommendation:** Create a `DashboardLayout` component that wraps `PageHeader` + standardized section structure. Use it across all dashboard types. Update `DASHBOARD_DESIGN_STANDARD.md` to reference it.

**Effort:** 1-2 days
**Priority:** Medium

---

### T2 — No Centralized Error Boundary

**Issue:** Each page has its own `error` state render + Next.js Error Boundary. Error messages, retry behavior, and error reporting are not standardized.

**Recommendation:** Create a `DashboardErrorBoundary` component with consistent error display, retry logic, and Sentry error reporting integration.

**Effort:** 4-6h
**Priority:** Medium

---

### T3 — Inconsistent Data Fetching Patterns

**Issue:** Pages mix direct Supabase calls in server components, `useDataLoader` hooks, and `createClient` direct calls. No unified data fetching strategy.

**Current patterns observed:**
- Exhibitor: `const { data: dashboard } = await supabaseClient.rpc(...)` in server component
- Organizer: `useDataLoader` + direct `supabaseClient` calls
- Event: Server-side `fetch` with `next: { revalidate: 30 }`
- Admin: Direct `fetch` in `useEffect`
- Analytics: `createClient` + `useEffect`
- Reports: `useDataLoader`

**Recommendation:** Standardize on one pattern — prefer React Server Components for initial data, `useDataLoader` or SWR for client-side revalidation. Document in `ARCHITECTURE.md`.

**Effort:** 2-3 days
**Priority:** Low (functionally works)

---

### T4 — No Unified Toast/Notification System

**Issue:** Action completion feedback is inconsistent. Some pages use no feedback, others would benefit from `toast.success()`. The `sonner` library is likely available but not systematically used.

**Recommendation:** Add `import { toast } from 'sonner'` to action handlers and document `toast` usage in the design standard.

**Effort:** 2h
**Priority:** Medium

---

### T5 — Analytics Page Type Classification

**Issue:** DASHBOARD_DESIGN_STANDARD.md v1.1 classifies Analytics as an exception (non-standard page). However, it uses `PageHeader` and follows a `Card` + `SectionHeader` pattern — it's more compliant than Exhibitor or Reports which don't use PageHeader.

**Recommendation:** Review Analytics classification. If it follows the Dashboard pattern (sections + cards), it should be a first-class Dashboard type, not an exception.

**Effort:** 1h (doc change)
**Priority:** Low

---

## Code Quality Debt

### Q1 — Inline Styles That Should Use Design Tokens

**Issue:** Multiple pages have hardcoded Tailwind values that map to design tokens but don't use the token names.

Examples:
- `text-primary`, `text-secondary`, `text-muted` — used consistently ✅
- `bg-brand` — used but not verified against theme.css
- `space-y-6` vs `space-y-section` — inconsistent (see CRITICAL #1)

**Recommendation:** Audit all `space-y-*` usages against the design standard. Replace all `space-y-6` between page sections with `space-y-section`.

**Effort:** 2h
**Priority:** High (already identified)

---

### Q2 — Missing Type Imports

**Issue:** Some components import types implicitly via `typeof` checks rather than explicit imports.

**Recommendation:** Ensure all shared types (Dashboard, Event, Analytics, Report) are in a central `@/types` or `@/lib/types` package.

**Effort:** 4h
**Priority:** Low

---

### Q3 — Hardcoded Magic Numbers

**Issue:**
- Analytics funnel percentages use arbitrary cutoffs
- Admin health threshold of 92% is hardcoded
- Date formatting formats are duplicated across pages

**Recommendation:** Move business logic constants to a config or constants file.

**Effort:** 2h
**Priority:** Low

---

### Q4 — No Consistent Date Formatting

**Issue:** Three different patterns in use:
- `new Date().toLocaleString()`
- `Intl.DateTimeFormat(undefined, { dateStyle: 'medium' })`
- `toLocaleDateString("en-US", ...)`

**Recommendation:** Create a `formatDate(date, style)` utility from `@/lib/format` and use it consistently. Update DASHBOARD_DESIGN_STANDARD.md to specify the date format standard.

**Effort:** 2h
**Priority:** Medium

---

### Q5 — No Consistent Number Formatting

**Issue:** Large numbers (counts, percentages) use different formatting across pages — some show raw numbers, some use `Intl.NumberFormat`, some don't format at all.

**Recommendation:** Create a `formatNumber(n, decimals)` utility.

**Effort:** 1h
**Priority:** Low

---

## Testing Debt

### TST1 — No E2E Tests for Dashboard Flows

**Issue:** No Playwright or Cypress tests covering the critical user paths:
- Organizer views dashboard
- Exhibitor views dashboard
- Event dashboard publish flow
- Reports generation + download

**Recommendation:** Add Playwright tests for critical paths before next release.

**Effort:** 2 days
**Priority:** High

---

### TST2 — No Unit Tests for Utility Functions

**Issue:** `formatDate`, `formatNumber`, `healthCheck`, `getHealthColor` have no unit tests.

**Recommendation:** Add Vitest unit tests for all utility functions.

**Effort:** 4h
**Priority:** Medium

---

## Performance Debt

### P1 — No Lazy Loading for Heavy Components

**Issue:** Analytics funnel and chart components load synchronously even when below the fold.

**Recommendation:** Wrap chart sections in `React.lazy` + `Suspense` with skeleton fallback.

**Effort:** 2h
**Priority:** Low

---

### P2 — No Image Optimization Config

**Issue:** No explicit `next/image` configuration for the project. Avatar images and event thumbnails may not be optimized.

**Recommendation:** Configure `next/image` with proper `domains` whitelist and `sizes` attributes.

**Effort:** 1h
**Priority:** Low

---

### P3 — Large Bundle Size (No Code Splitting Analysis)

**Issue:** No analysis of bundle size per dashboard page.

**Recommendation:** Run `npm run build && npx @next/bundle-analyzer` to identify large dependencies per page.

**Effort:** 2h
**Priority:** Low

---

## Documentation Debt

### D1 — ARCHITECTURE.md Missing

**Issue:** No top-level `ARCHITECTURE.md` documenting system design decisions, data flow, auth model, and API conventions.

**Recommendation:** Create `ARCHITECTURE.md` covering:
- Tech stack overview
- Data fetching strategy (T3)
- Auth model (Supabase Auth + RLS)
- State management approach
- Error handling strategy

**Effort:** 4h
**Priority:** Medium

---

### D2 — Inline Comments Explain "What" Not "Why"

**Issue:** Comments like `// fetch data` or `// handle error` explain the obvious rather than the intent.

**Recommendation:** Replace "what" comments with "why" comments where the logic is non-trivial.

**Effort:** Ongoing
**Priority:** Low

---

## Post-RC-1 Roadmap

| Item | Priority | Estimated Effort |
|------|:--------:|:-----------------:|
| T4 — Toast system | Medium | 2h |
| T1 — DashboardLayout component | Medium | 1-2 days |
| TST1 — E2E tests | High | 2 days |
| Q4 — Date formatting utility | Medium | 2h |
| D1 — ARCHITECTURE.md | Medium | 4h |
| T2 — Error boundary | Medium | 4-6h |
| Q2 — Type imports centralization | Low | 4h |
| P1 — Lazy loading | Low | 2h |
| P3 — Bundle analysis | Low | 2h |
| T3 — Data fetching standardization | Low | 2-3 days |
| TST2 — Utility unit tests | Medium | 4h |
| T5 — Analytics classification | Low | 1h |
| P2 — Image optimization | Low | 1h |
| Q3 — Magic numbers | Low | 2h |
| Q5 — Number formatting | Low | 1h |
| D2 — Comment improvement | Low | Ongoing |
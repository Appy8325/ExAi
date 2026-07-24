# POST v1.0 Roadmap

**Status:** Backlog — not planned for implementation
**Rule:** No implementation in this thread. Frozen until v1.0 post-launch review.

---

## UX Improvements

- Add skeleton loading components to all 6 reference pages (replaces spinner-based loading)
- Add action completion toasts (publish, generate, download) using `sonner`
- Distinguish offline vs. API error states across all pages
- Add "0 items require attention" explicit empty message for Exhibitor attention section
- Add `lastUpdated` stale-data warning in Analytics for data older than 24h
- Add service status severity color differentiation (green/yellow/red) in Admin health bar

---

## Design System Enhancements

- Create shared `DashboardLayout` component wrapping `PageHeader` + standardized section structure
- Create shared `DashboardErrorBoundary` component with consistent retry + Sentry integration
- Standardize date formatting with a `formatDate()` utility (currently 3 different patterns)
- Standardize number formatting with a `formatNumber()` utility
- Create `EmptyState` component used consistently instead of inline conditional divs
- Review Analytics page type classification — appears more compliant than "exception" designation suggests
- Color contrast audit of `packages/ui/src/styles/theme.css` against WCAG 4.5:1 ratios

---

## Performance

- Add `React.lazy` + `Suspense` for Analytics funnel and chart components
- Configure `next/image` with proper `domains` whitelist and `sizes` attributes
- Run bundle size analysis (`npx @next/bundle-analyzer`) — no analysis currently on record
- Assess connection pool sizing: `max: 10` per Lambda instance × N concurrent instances may exceed Supabase free-tier limits

---

## Technical Debt

### High Priority
- **E2E tests** (Playwright) for critical paths: Organizer view, Exhibitor publish, Event publish, Reports generate + download
- **Toast notification system** — `import { toast } from 'sonner'` systematically across action handlers

### Medium Priority
- **ARCHITECTURE.md** — document system design, data fetching strategy, auth model, state management approach
- **Unit tests** for utility functions: `formatDate`, `formatNumber`, `healthCheck`, `getHealthColor`
- **Data fetching standardization** — currently 3+ different patterns (RSC, `useDataLoader`, `createClient` + `useEffect`); document preferred approach
- **Type imports centralization** — shared types should be in `@/lib/types`

### Low Priority
- Fix lint warnings in `api`, `ai`, `database` packages (currently 22 warnings)
- Magic numbers → constants file (health thresholds, funnel percentages)
- Replace "what" inline comments with "why" comments
- Fix Reports 404 workaround (`event.status === 404`) → real API 404 response
- Admin: "Service Status unknown" → "Status unknown — requires manual check" with warning icon
- Exhibitor: `<details>/<summary>` → `aria-expanded` JS toggle + `aria-controls`

---

## New Features

- Permission-denied states for org-scoped routing
- Real-time event log for Admin dashboard (replace hardcoded operational events)
- Historical uptime calculation (replace "99.9% placeholder" in Admin)
- Incident detection + automated alert thresholds for Admin dashboard
- User activity trends (DAU/MAU) for Admin dashboard
- Organization growth velocity for Admin dashboard
- Queue depth + processing latency for Admin dashboard
- API latency percentiles (p50/p95/p99) for Admin dashboard
- Error-rate sparkline charts per service for Admin dashboard
- `DEMO_MODE` env var → mock data fallbacks for demo environments without Supabase
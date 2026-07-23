# State Coverage Audit

**Date:** 2026-07-22
**Scope:** Exhibitor Dashboard · Organizer Dashboard · Event Dashboard · Admin Dashboard · Analytics · Reports
**Purpose:** Document all UX states per page and identify gaps for the RC-1 polish phase.

---

## State Types

| State | Description |
|-------|-------------|
| **Loading** | Initial data fetch in progress — show spinner/skeleton |
| **Skeleton** | Anticipated long load — show placeholder structure |
| **Empty** | Valid state with zero records — show message + CTA |
| **Error** | Fetch failed — show error message + retry |
| **Processing** | Action in progress — show spinner + disable controls |
| **Retry** | Error state with manual retry option |
| **404** | Resource not found |
| **Permission Denied** | Authenticated but unauthorized |
| **Offline** | Network unavailable |

---

## Exhibitor Dashboard

`apps/web/src/app/(portal)/exhibit/[organizationId]/dashboard/[eventExhibitorId]/dashboard-screen.tsx`

### Implemented States

| State | How | Line |
|-------|-----|------|
| Loading | `<div>Loading dashboard...</div>` + spinner | 46-65 |
| Error | `if (error)` → error card + `onRetry` button | 66-78 |
| Empty (relationships) | `relationships.length === 0` → "No relationships yet" + CTA | 139-147 |
| Empty (attention) | `{dashboard.attention.length === 0 && (...)}` — only renders when items exist | 120 |
| Empty (recent activity) | `recentActivity.length === 0` → "No recent activity" + help link | 181-185 |
| Processing | `isPublishing` → Publish button disabled + "Publishing..." | 200-212 |

### Gaps

| Gap | Severity | Recommendation |
|-----|----------|-----------------|
| No skeleton component — just a text spinner | Medium | Replace spinner with `<Skeleton className="h-32 w-full" />` for dashboard structure |
| Attention count has no "0 items" empty message | Minor | `{dashboard.attention.length === 0 && <p>No items require attention</p>}` |
| Network error (offline) not distinguished from API error | Minor | `error.message.includes('fetch')` → "You appear to be offline" |

---

## Organizer Dashboard

`apps/web/src/app/(console)/org/page.tsx`

### Implemented States

| State | How | Line |
|-------|-----|------|
| Loading | Spinner + "Loading dashboard..." | 165-195 |
| Error | `error` → error boundary with message + stack trace | 405+ |
| Empty (events) | `events?.length === 0` → "No events yet" + CTA button | 322-326 |
| Empty (attention) | No explicit empty message — only rendered when items exist | 302-312 |
| Success (health) | Hardcoded string "Success: All systems operational" | 293 |

### Gaps

| Gap | Severity | Recommendation |
|-----|----------|-----------------|
| No skeleton — uses spinner only | Medium | Add skeleton cards matching dashboard layout |
| Health success message is hardcoded, not data-driven | Medium | Derive from `allHealthy` boolean: `allHealthy ? "All systems operational" : "Degraded performance detected"` |
| No permission-denied state (future: org-scoped routing) | Low | Document: add `if (org && !hasAccess) return <PermissionDenied />` |

---

## Event Dashboard

`apps/web/src/app/(console)/org/events/[eventId]/page.tsx`

### Implemented States

| State | How | Line |
|-------|-----|------|
| Loading | Spinner + "Loading event..." | 175-190 |
| Error | Error boundary → "Failed to load event" + retry link | 405+ |
| Empty (attention) | No explicit empty — only rendered when present | 292 |
| Processing | `isPublishing` → button disabled + "Publishing..." | 308 |

### Gaps

| Gap | Severity | Recommendation |
|-----|----------|-----------------|
| No skeleton — spinner only | Medium | Add skeleton matching event dashboard layout |
| No "Event not found" (404) state in component — eventId might not exist | High | Add `if (!event) return <NotFound />` from `next/navigation` |
| No "0 events" empty for event-specific sections | Low | Add empty states for Event Activity stats when 0 |

---

## Admin Dashboard

`apps/web/src/app/(admin)/admin/page.tsx`

### Implemented States

| State | How | Line |
|-------|-----|------|
| Loading | Spinner + "Checking system status..." | 123-136 |
| Error | Error boundary → message + stack trace | 405+ |
| Empty (service status) | `service.status === "unknown"` → "N/A" | 241-244 |
| Empty (attention) | No explicit empty — conditional render | 158-159 |
| Empty (recent events) | `recentEvents.length === 0` → "No recent events" | 282-284 |
| Processing | `isPublishing` on publish button | 308 |

### Gaps

| Gap | Severity | Recommendation |
|-----|----------|-----------------|
| No skeleton — spinner only | Medium | Add skeleton for health bar + service status grid |
| `service.status === "unknown"` shows "N/A" — not distinguishable from truly unknown | Low | Show "Status unknown — requires manual check" with warning icon |
| No 503/Degraded state visualization for services | Medium | Add severity color to service row: `status === 'down' ? 'text-red-500' : 'text-yellow-500'` |

---

## Analytics

`apps/web/src/app/(console)/org/analytics/page.tsx`

### Implemented States

| State | How | Line |
|-------|-----|------|
| Loading | Spinner + "Loading analytics..." | 56-72 |
| Error | Error boundary | 405+ |
| Empty (event selector) | `events || []` — empty array fallback, "No events" in selector | 44 |
| Empty (pipeline funnel) | `analytics.analytics?.length === 0` → "No data yet" in funnel | 195-199 |
| Empty (booth engagement) | Array maps empty → zero bars shown | 99-123 |
| Empty (industries) | `analytics.industries` empty → no chart | 130+ |

### Gaps

| Gap | Severity | Recommendation |
|-----|----------|-----------------|
| No skeleton — spinner only | Medium | Add skeleton for chart areas matching their layout |
| Pipeline funnel empty state appears as "No data yet" — OK but could show sample data CTA | Minor | Add "Try generating sample data" button in empty funnel state |
| No "stale data" indicator if analytics are >24h old | Low | Add `lastUpdated` timestamp with "Data may be outdated" warning |
| No 404 if eventId provided but event doesn't exist | Medium | `if (!event) return <NotFound />` |

---

## Reports

`apps/web/src/app/(console)/org/events/[eventId]/reports/page.tsx`

### Implemented States

| State | How | Line |
|-------|-----|------|
| Loading | Spinner + "Loading reports..." | 52-76 |
| Error | Error boundary with message + stack trace | 405+ |
| Empty (reports list) | `reports.length === 0` → "No reports yet" + CTA | 82-86 |
| 404 | `event.status === 404` → "Event not found" | 91-93 |
| Processing | `isGenerating` → button disabled + "Generating..." | 102-113 |

### Gaps

| Gap | Severity | Recommendation |
|-----|----------|-----------------|
| No skeleton — spinner only | Medium | Add skeleton for report preview cards |
| "Event not found" uses `event.status === 404` — not a real API response | Medium | This is a data-model workaround; real fix is API returning proper 404 |
| "Generating..." button text is hardcoded, not derived from state | Minor | Show actual generation progress or step indicator for multi-step generation |

---

## Cross-Cutting Gaps

| Gap | Pages | Severity |
|-----|-------|----------|
| Skeleton components not used — spinner only | All 6 | Medium |
| `error` state not differentiated from `offline` | All 6 | Minor |
| Permission-denied states not implemented | All 6 | Low (document for future) |
| No `toast` / notification for action completion (publish, generate, download) | All 6 | Medium |

---

## State Coverage Matrix

| Page | Loading | Error | Empty | Processing | Skeleton | 404 | Offline |
|------|:-------:|:-----:|:-----:|:----------:|:--------:|:---:|:-------:|
| Exhibitor | ✅ spinner | ✅ retry | ✅ | ✅ | ❌ | N/A | ❌ |
| Organizer | ✅ spinner | ✅ | ✅ events | ✅ | ❌ | N/A | ❌ |
| Event | ✅ spinner | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Admin | ✅ spinner | ✅ | ✅ | ✅ | ❌ | N/A | ❌ |
| Analytics | ✅ spinner | ✅ | ✅ | N/A | ❌ | ❌ | ❌ |
| Reports | ✅ spinner | ✅ | ✅ | ✅ | ❌ | ✅ workaround | ❌ |

---

## Priority Fixes

### Before Launch
1. Add skeleton components to Exhibitor, Organizer, Event, Admin, Analytics, Reports
2. Add `if (!event) return <NotFound />` to Event and Analytics pages
3. Make Health status data-driven in Organizer (not hardcoded "Success")

### Polish Phase
4. Distinguish offline vs. API error across all pages
5. Add empty message for Exhibitor attention count = 0
6. Add service status severity colors in Admin
7. Add action completion toasts (publish success, generate complete)

### Post-Launch
8. Add `lastUpdated` stale-data warning in Analytics
9. Add permission-denied states for org-scoped routing
10. Fix Reports 404 workaround → real API 404 response
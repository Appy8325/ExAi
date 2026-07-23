# Admin Dashboard — Architecture Review

> EPIC 3 · Admin Dashboard · Date: 2026-07-22

---

## Executive Summary

The Admin Dashboard currently displays hardcoded mock data with no real API integration. The `AdminModule` in the API is an empty shell. All decisions in this review assume **no new backend features** — the implementation works with the existing mock data, enhanced with proper information hierarchy from the Dashboard Design Standard.

The dashboard must answer four platform-level questions (distinct from event/organizer dashboards):

| # | Question | Domain |
|:-:|----------|--------|
| 1 | Is the platform healthy? | System status, uptime, error rates |
| 2 | Are customers succeeding? | Active organizations, adoption, retention |
| 3 | Are any systems failing? | Service degradation, incidents |
| 4 | What requires operational intervention? | Alert-driven actions |

---

## Current State

### What Exists

```tsx
// 4 hardcoded KPI cards
<KPICard label="Organizations" value="12" accent="brand" />
<KPICard label="Active Events" value="3" accent="info" />
<KPICard label="Total Users" value="1,247" accent="success" />
<KPICard label="API Health" value="Healthy" detail="99.9% uptime" accent="ai" />

// Recent System Events — static list, all "success" green dots
// Service Status — static list, "AI Inference: Degraded" as warning
```

### What Doesn't Exist

| Component | Status |
|-----------|--------|
| Admin API endpoint | ❌ AdminModule is empty shell — no `/v1/admin/*` routes |
| Real platform health data | ❌ All data is hardcoded |
| System event categorization | ❌ Events are static strings, no severity/type |
| Alert/attention system | ❌ No automated alert detection |
| Operational action system | ❌ No actionable items surfaced |

---

## Information Architecture

Despite the lack of real data, the Admin Dashboard can be significantly improved by applying the Dashboard Design Standard to the existing content. The standard page hierarchy applies with admin-specific content:

```
1. Platform Identity Header
   ├── Title: "Platform Overview"
   └── Description: Platform name + global operational status

2. Platform Health Bar
   ├── Overall platform health dot (green/yellow/red)
   ├── Aggregated status label ("All systems operational" / "1 issue detected")
   └── Days-until next planned maintenance (if applicable)

3. Platform Attention Items (if degraded services exist)
   ├── Degraded services → link to investigate
   ├── Error spikes → link to logs
   └── Organizations requiring review

4. Platform KPIs (4 primary)
   ├── Organizations — count + trend (active vs. total)
   ├── Active Events — count + trend
   ├── Total Users — count + trend
   └── Platform Health — uptime % + status

5. Service Status Section (Operational Metrics)
   ├── API Gateway — Operational/Degraded/Down
   ├── Database — Operational/Degraded/Down
   ├── AI Inference — Operational/Degraded/Down
   ├── File Storage — Operational/Degraded/Down
   └── [Investigate] links for non-operational services

6. Recent System Events (Progressive Disclosure)
   └── Historical event log — errors first, expandable
```

---

## Architecture Constraints

### API Limitation

The `AdminModule` at `/v1/admin/*` is a milestone-0 empty shell. No endpoints exist to fetch:
- Platform health (uptime, error rates)
- Organization counts
- User counts
- Service status
- System events

**This means all data shown in the admin dashboard is, and will remain, hardcoded mock data until the AdminModule is implemented in a future milestone.**

### Design Response

Given the API limitation, the design approach is:

1. **Apply the Dashboard Design Standard to the mock data** — improve hierarchy, health indicators, attention items, and decision support even with static values
2. **Document the limitation clearly** — the admin dashboard's scores will reflect that it operates on mock data without real trend detection
3. **Build the UI structure so real API data can slot in later** — the component should be API-ready

---

## The Four Questions — How This Dashboard Answers Them

### Q1: Is the platform healthy?

**How:** Service Status section shows 4 services with operational/degraded status. The header's platform health dot aggregates this into a single visual signal.

**Gap:** No real uptime monitoring. The "99.9% uptime" is a hardcoded string, not a live calculation.

### Q2: Are customers succeeding?

**How:** Organizations (12) and Active Events (3) KPIs show adoption depth. Trend signals (derived from state ratios) can indicate growth or decline.

**Gap:** No customer-level success metrics (engagement, retention, feature adoption).

### Q3: Are any systems failing?

**How:** Service Status shows "AI Inference: Degraded" with a warning badge. Attention Items section surfaces this as a priority action.

**Gap:** No real-time incident detection. The degraded status is hardcoded, not triggered by an actual incident.

### Q4: What requires operational intervention?

**How:** Attention Items section surfaces the degraded service as an action item with "Investigate" link. Next Best Actions (if implemented) would prioritize by severity.

**Gap:** No automated incident workflow. All alerts are static.

---

## KPI Design for Admin Dashboard

| # | KPI | Rationale |
|:-:|-----|----------|
| 1 | **Organizations** | Primary adoption metric — shows platform growth |
| 2 | **Active Events** | Platform usage depth |
| 3 | **Total Users** | Scale metric |
| 4 | **Platform Health** | Uptime + status — the platform's primary SLA metric |

**Note:** "API Health: Healthy" as a string value (not a number) is unusual. If the API returns a status string, it should be displayed as a status badge with color coding, not as a metric card value.

---

## Service Status Design

The current Service Status shows:

| Service | Status |
|---------|:------:|
| API Gateway | Operational |
| Database | Operational |
| AI Inference | **Degraded** |
| File Storage | Operational |

The "AI Inference: Degraded" entry is the most important piece of data on the page. It should:
1. Appear at the **top** of the Service Status section
2. Trigger an **Attention Item** with a direct "Investigate" action link
3. Cause the **Platform Health** dot to show yellow/warning

Currently these things don't happen — the degraded service is styled as a warning badge but has no investigative action.

---

## Implementation Approach

Since no admin API exists, implement as a **frontend-only enhancement** of the existing hardcoded data. The structure will be API-ready so real data can replace the mock values later.

**Changes to current implementation:**
1. Add `KPICard` trend props from ratio analysis (active orgs vs. total, etc.)
2. Add a Platform Health dot to the header
3. Create Attention Items section triggered by service status (degraded = warning)
4. Enhance "AI Inference: Degraded" with action link
5. Sort System Events by severity (errors first)
6. Add Next Best Actions: "Investigate AI Inference degradation" as action #1

**Files to modify:**
- `apps/web/src/app/(admin)/admin/page.tsx` — complete redesign

---

## What Requires Backend Before This Dashboard Can Be Real

| Gap | Priority | Milestone |
|-----|:--------:|:---------:|
| AdminModule with platform health endpoint | P0 | Future milestone |
| Service status monitoring | P0 | Future milestone |
| System event log ingestion | P1 | Future milestone |
| Organization success metrics | P1 | Future milestone |
| User engagement metrics | P2 | Future milestone |

**The admin dashboard as designed will score lower than 8.5/10 until real data is available, because it cannot show true period-over-period trend data or real-time incident detection. This is an API gap, not a design gap.**

---

*Architecture review complete. Awaiting UX review and implementation plan approval.*
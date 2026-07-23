# Admin Dashboard — Backend Requirements

> Capabilities required to evolve the Admin Dashboard from ~7.0/10 to 8.5/10.
> The frontend shell is complete. This document specifies the backend telemetry needed to fill it.

---

## Overview

The Admin Dashboard is a platform operations interface. Its primary user is a platform engineer or SRE who needs to understand system health, investigate degraded services, and take operational action.

**Current ceiling:** ~7.0/10 (API gap, not design gap)
**Target ceiling:** 8.5/10 (with full backend telemetry)

---

## Platform Health

### Historical Uptime

| Requirement | Details |
|-------------|---------|
| Endpoint | `GET /v1/admin/platform/uptime` |
| Data | 30-day · 90-day · 365-day uptime percentages |
| Calculation | `(total_seconds - downtime_seconds) / total_seconds` per period |
| Response shape | `{ periods: [{ period: "30d", value: 99.9 }, ...] }` |

**What it unlocks:**
- Uptime shown as a `KPICard` value (e.g. `99.9%`) with a period selector (30d / 90d / 365d)
- Trend indicator comparing current period to previous period
- Alert if uptime drops below configurable threshold (e.g. 99.5%)

### API Latency

| Requirement | Details |
|-------------|---------|
| Endpoint | `GET /v1/admin/platform/latency` |
| Data | p50 · p95 · p99 latency per endpoint, per time window |
| Response shape | `{ endpoints: [{ path: "/v1/events", p50: 45, p95: 120, p99: 340 }] }` |

**What it unlocks:**
- Per-service latency in the Service Status section
- Sparkline trend charts for each service
- Alert when p99 exceeds threshold (e.g. > 500ms)

### Error Rates

| Requirement | Details |
|-------------|---------|
| Endpoint | `GET /v1/admin/platform/errors` |
| Data | Error rate as percentage · error count · error types per service |
| Response shape | `{ services: [{ name: "API Gateway", errorRate: 0.12, errorCount: 47 }] }` |

**What it unlocks:**
- The `note` field on degraded services populated with actual error rate data
- Color threshold: operational (<0.1%) · degraded (0.1–1%) · down (>1%)
- Trend: is error rate increasing or decreasing?

### Availability History

| Requirement | Details |
|-------------|---------|
| Endpoint | `GET /v1/admin/platform/availability` |
| Data | Daily/minute-level availability data for the past 30 days |
| Response shape | `{ history: [{ date: "2026-07-01", uptime: 99.99, incidents: 0 }] }` |

**What it unlocks:**
- Availability sparkline in the Platform Health KPICard
- Incident timeline overlaid on uptime chart

---

## Services

### Queue Depth

| Requirement | Details |
|-------------|---------|
| Endpoint | `GET /v1/admin/services/queue` |
| Data | Messages pending · processing · dead-letter per queue |
| Response shape | `{ queues: [{ name: "email", pending: 12, processing: 3, deadLetter: 0 }] }` |

**What it unlocks:**
- Queue status in the Service Status section (operational / degraded / down based on depth thresholds)
- Alert when pending messages exceed threshold (e.g. > 100)

### Background Job Status

| Requirement | Details |
|-------------|---------|
| Endpoint | `GET /v1/admin/services/jobs` |
| Data | Job type · success rate · avg duration · failed count · last run |
| Response shape | `{ jobs: [{ type: "send_email", successRate: 99.8, avgDuration: 234, failed: 2, lastRun: "2026-07-22T10:00:00Z" }] }` |

**What it unlocks:**
- Jobs section within Service Status
- Failed jobs surfaced in Attention Required

### AI Provider Health

| Requirement | Details |
|-------------|---------|
| Endpoint | `GET /v1/admin/services/ai` |
| Data | Provider · status · latency · error rate · quota remaining |
| Response shape | `{ providers: [{ name: "openai", status: "degraded", latency: 2400, errorRate: 2.1, quotaUsed: 0.87 }] }` |

**What it unlocks:**
- AI Inference service row in Service Status populated with real data
- Quota exhaustion alert before service degrades

### Database Metrics

| Requirement | Details |
|-------------|---------|
| Endpoint | `GET /v1/admin/services/database` |
| Data | Connection pool usage · query p99 latency · replication lag · storage used |
| Response shape | `{ connections: { used: 45, max: 100 }, queryP99: 34, replicationLag: 12, storageUsed: 0.65 }` |

**What it unlocks:**
- Database row in Service Status with real-time metrics
- Storage threshold alert (e.g. > 80%)

### Storage Metrics

| Requirement | Details |
|-------------|---------|
| Endpoint | `GET /v1/admin/services/storage` |
| Data | Provider · used bytes · total bytes · file count |
| Response shape | `{ used: 512000000000, total: 1000000000000, files: 2847193 }` |

**What it unlocks:**
- Storage row in Service Status
- Capacity planning signals

---

## Organizations

### Growth Metrics

| Requirement | Details |
|-------------|---------|
| Endpoint | `GET /v1/admin/organizations/growth` |
| Data | New signups (daily/weekly) · churn · net growth rate |
| Response shape | `{ newThisWeek: 3, churnedThisMonth: 0, netGrowth: 12, history: [{ date: "2026-07-01", count: 10 }] }` |

**What it unlocks:**
- Org growth sparkline in Organizations KPICard
- Trend indicator (↑ 12% vs last month)

### Active Organizations

| Requirement | Details |
|-------------|---------|
| Endpoint | `GET /v1/admin/organizations/active` |
| Data | Count of organizations with ≥1 active event or ≥1 login in past 30 days |
| Response shape | `{ active: 8, total: 12, activeRate: 0.67 }` |

**What it unlocks:**
- "Active" detail text in Organizations KPICard (e.g. `8 of 12 active`)

### Organization Health

| Requirement | Details |
|-------------|---------|
| Endpoint | `GET /v1/admin/organizations/health` |
| Data | Organizations with degraded health · top issues |
| Response shape | `{ unhealthy: 1, issues: [{ orgId: "org_123", issue: "No events in 60d" }] }` |

**What it unlocks:**
- Attention Required section shows at-risk organizations
- Quick Action links to investigate

---

## Users

### Daily Active Users

| Requirement | Details |
|-------------|---------|
| Endpoint | `GET /v1/admin/users/active` |
| Data | DAU · MAU · DAU/MAU ratio · 30-day history |
| Response shape | `{ dau: 234, mau: 1247, ratio: 0.19, history: [{ date: "2026-07-22", dau: 234 }] }` |

**What it unlocks:**
- DAU sparkline in Total Users KPICard
- Trend indicator

### Active Sessions

| Requirement | Details |
|-------------|---------|
| Endpoint | `GET /v1/admin/users/sessions` |
| Data | Current active sessions · session count over time |
| Response shape | `{ activeNow: 47, peakToday: 89 }` |

**What it unlocks:**
- Platform health signal beyond just uptime — user-facing availability

### Authentication Failures

| Requirement | Details |
|-------------|---------|
| Endpoint | `GET /v1/admin/users/auth-failures` |
| Data | Failed auth count (24h) · failure rate · top failure reasons |
| Response shape | `{ failures24h: 12, failureRate: 0.02, reasons: [{ reason: "invalid_password", count: 8 }] }` |

**What it unlocks:**
- Security events in Operational Events
- Alert on anomaly (e.g. > 10 failures/hour)

---

## Operations

### Incident Detection

| Requirement | Details |
|-------------|---------|
| Endpoint | `GET /v1/admin/incidents` |
| Data | Active incidents · severity · affected services · started at |
| Response shape | `{ incidents: [{ id: "inc_001", severity: "error", affected: ["AI Inference"], startedAt: "2026-07-22T08:00:00Z" }] }` |

**What it unlocks:**
- Attention Required populated from real incidents (not derived from service status)
- Incident timeline in Operational Events

### Alert Generation

| Requirement | Details |
|-------------|---------|
| Endpoint | `POST /v1/admin/alerts` (internal) |
| Trigger | Automated when any metric exceeds threshold |
| Alert data | Severity · metric · current value · threshold · affected service |

**What it unlocks:**
- Proactive Attention Required entries
- PagerDuty / Slack / email integration

### Audit Logs

| Requirement | Details |
|-------------|---------|
| Endpoint | `GET /v1/admin/audit-logs` |
| Data | Actor · action · resource · timestamp · IP address |
| Response shape | `{ logs: [{ actor: "admin@exai.com", action: "user.deactivate", resource: "user_456", at: "2026-07-22T10:00:00Z" }] }` |

**What it unlocks:**
- Compliance-grade audit trail accessible from admin dashboard
- Filterable by actor, action, resource, date range

### Deployment History

| Requirement | Details |
|-------------|---------|
| Endpoint | `GET /v1/admin/deployments` |
| Data | Version · deployed at · deployed by · status · changelog |
| Response shape | `{ deployments: [{ version: "v2.14.1", at: "2026-07-21T14:00:00Z", by: "ci pipeline", status: "success" }] }` |

**What it unlocks:**
- Deployment events in Operational Events
- Correlation of incidents with deployments

---

## Priority Order

| Priority | Capability | Unlocks |
|----------|-----------|---------|
| P0 | Incident Detection + Alert Generation | Real Attention Required (not derived) |
| P1 | Historical Uptime + Error Rates | Real Platform Health KPI |
| P1 | Service Health Polling | Real Service Status (not mock) |
| P2 | API Latency + Queue Depth | Deeper Service Status diagnostics |
| P2 | DAU/MAU + Active Sessions | User activity signals |
| P3 | Organization Growth + Health | Org-level health signals |
| P3 | Audit Logs + Deployment History | Compliance and incident correlation |
| P4 | Background Job Status | Job failure alerts |

---

## API Module: AdminModule

All endpoints belong to `apps/api/src/modules/admin/`.

Current state: **empty shell** — no routes, no services, no repositories.

Required implementation order:
1. Health endpoint (`GET /v1/admin/platform`) — returns aggregate health
2. Individual metric endpoints as listed above
3. Real-time event subscription (WebSocket or SSE) for live updates

---

*This document defines the backend contract for the Admin Dashboard frontend shell.
When these capabilities are implemented, the dashboard can evolve to 8.5+/10 without redesign.*
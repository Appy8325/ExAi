import Link from "next/link";
import { Button, KPICard, PageHeader, StatusBadge } from "@concourse/ui";

/**
 * Admin Dashboard — Platform Operations Shell
 *
 * This dashboard displays current platform state using available mock data.
 *
 * Future backend integrations needed for:
 * - Real-time incident detection (currently manual alert simulation)
 * - Historical uptime calculation (currently hardcoded string)
 * - Error-rate trends and sparklines
 * - Queue depth and processing latency
 * - API latency percentiles
 * - Organization growth velocity
 * - User activity trends
 * - Automated alert thresholds
 *
 * The UI structure is designed to accept real data without redesign when the
 * AdminModule API endpoints are implemented in a future milestone.
 */

type Service = {
  name: string;
  status: "operational" | "degraded" | "down";
  note?: string;
};

type EventItem = {
  severity: "error" | "warning" | "info";
  message: string;
  time: string;
};

export default function AdminPage() {
  // ─── Platform State ───────────────────────────────────────────────────────
  //
  // These values are currently hardcoded mock data.
  // Replace with API call to /v1/admin/platform once the endpoint exists.
  //
  const environment = "Production";
  const uptimeLast30Days = "99.9%"; // would be calculated from real uptime telemetry

  // ─── KPIs ────────────────────────────────────────────────────────────────
  //
  // Replace with actual counts from platform metrics API.
  // Trend signals cannot be generated without historical period data.
  //
  const orgCount = 12;
  const activeEventCount = 3;
  const totalUserCount = 1247;

  // ─── Service Status ──────────────────────────────────────────────────────
  //
  // Replace with real-time service health polling.
  // The `degraded` services should be sorted to the top.
  //
  const services: Service[] = [
    { name: "API Gateway", status: "operational" },
    { name: "Database", status: "operational" },
    { name: "Queue", status: "operational" },
    { name: "Storage", status: "operational" },
    { name: "AI Inference", status: "degraded", note: "Elevated error rate — investigation ongoing" },
  ];

  // ─── Attention Items ─────────────────────────────────────────────────────
  //
  // Replace with automated alert ingestion from incident management system.
  // Currently derived from hardcoded service status.
  //
  const degradedServices = services.filter((s) => s.status !== "operational");

  // ─── Operational Events ──────────────────────────────────────────────────
  //
  // Replace with real-time event log from platform observability pipeline.
  // Events are ordered by severity first, then recency — this is correct.
  //
  const recentEvents: EventItem[] = [
    { severity: "error", message: "AI Inference — elevated error rate detected", time: "2h ago" },
    { severity: "info", message: "Database backup completed successfully", time: "6h ago" },
    { severity: "info", message: "New organization onboarded — Northstar Cloud", time: "12h ago" },
    { severity: "info", message: "Platform deployed — v2.14.1", time: "1d ago" },
  ];

  // ─── Derived ────────────────────────────────────────────────────────────
  const hasDegradedServices = degradedServices.length > 0;
  const overallHealth: "good" | "warning" | "danger" = hasDegradedServices ? "warning" : "good";

  const healthDot = {
    good: "bg-status-success-text",
    warning: "bg-status-warning-text",
    danger: "bg-status-danger-text",
  };

  const healthLabel = {
    good: "All systems operational",
    warning: `${degradedServices.length} service${degradedServices.length !== 1 ? "s" : ""} degraded`,
    danger: "Critical — immediate attention required",
  };

  const healthColor = {
    good: "text-status-success-text",
    warning: "text-status-warning-text",
    danger: "text-status-danger-text",
  };

  const severityDot = {
    error: "bg-status-danger-text",
    warning: "bg-status-warning-text",
    info: "bg-status-muted",
  };

  return (
    <div className="space-y-section">
      {/* ─── Header ─────────────────────────────────────────────────── */}
      <PageHeader
        title="Platform Overview"
        description={environment}
      />

      {/* ─── Health Bar ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <StatusBadge
          tone={overallHealth === "good" ? "success" : "warning"}
        >
          {overallHealth === "good" ? "Operational" : "Degraded"}
        </StatusBadge>
        <span className="flex items-center gap-1.5">
          <span className={`size-2 rounded-full ${healthDot[overallHealth]}`} />
          <span className={`text-caption font-medium ${healthColor[overallHealth]}`}>
            {healthLabel[overallHealth]}
          </span>
        </span>
        <span className="ml-auto text-caption text-muted">
          Uptime (30d): {uptimeLast30Days} · placeholder
        </span>
      </div>

      {/* ─── Attention Items ────────────────────────────────────────── */}
      {degradedServices.length > 0 && (
        <section className="rounded-xl border border-default bg-surface p-6">
          <h2 className="mb-4 text-body font-semibold text-primary">Attention Required</h2>
          <ul className="space-y-2">
            {degradedServices.map((svc) => (
              <li key={svc.name} className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2">
                  <StatusBadge tone="warning" size="sm">Degraded</StatusBadge>
                  <div>
                    <p className="text-body-sm font-medium text-primary">{svc.name}</p>
                    {svc.note && <p className="text-caption text-muted">{svc.note}</p>}
                  </div>
                </div>
                <a
                  href="/admin/logs"
                  className="shrink-0 text-caption text-link hover:underline"
                >
                  Investigate
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ─── Primary KPIs ───────────────────────────────────────────── */}
      <section>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" role="list">
        <KPICard
          label="Organizations"
          value={String(orgCount)}
          detail="across all plans"
          accent="brand"
        />
        <KPICard
          label="Active Events"
          value={String(activeEventCount)}
          detail="1 live · 2 upcoming"
          accent="info"
        />
        <KPICard
          label="Total Users"
          value={String(totalUserCount)}
          detail="registered accounts"
          accent="success"
        />
        <KPICard
          label="Platform Health"
          value={uptimeLast30Days}
          detail="uptime · 30-day period"
          accent="ai"
        />
        </ul>
      </section>

      {/* ─── Service Status (Primary Operational Section) ─────────── */}
      <section className="rounded-xl border border-default bg-surface p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-body font-semibold text-primary">Service Status</h2>
          <span className="text-caption text-muted">Real-time · placeholder</span>
        </div>
        <ul className="space-y-4" role="list">
          {services
            .sort((a, b) => {
              if (a.status === "degraded" && b.status !== "degraded") return -1;
              if (b.status === "degraded" && a.status !== "degraded") return 1;
              if (a.status === "down" && b.status !== "down") return -1;
              if (b.status === "down" && a.status !== "down") return 1;
              return a.name.localeCompare(b.name);
            })
            .map((service) => (
              <li
                key={service.name}
                className="flex items-center justify-between border-b border-default pb-3 last:border-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`size-2 rounded-full ${
                      service.status === "operational"
                        ? "bg-status-success-text"
                        : service.status === "degraded"
                        ? "bg-status-warning-text"
                        : "bg-status-danger-text"
                    }`}
                  />
                  <div>
                    <p className="text-body-sm text-primary">{service.name}</p>
                    {service.note && (
                      <p className="text-caption text-muted">{service.note}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge
                    tone={
                      service.status === "operational"
                        ? "success"
                        : service.status === "degraded"
                        ? "warning"
                        : "danger"
                    }
                    size="sm"
                  >
                    {service.status === "operational"
                      ? "Operational"
                      : service.status === "degraded"
                      ? "Degraded"
                      : "Down"}
                  </StatusBadge>
                  {service.status !== "operational" && (
                    <a
                      href="/admin/logs"
                      className="text-caption text-link hover:underline"
                    >
                      Logs
                    </a>
                  )}
                </div>
              </li>
))}
        </ul>
      </section>

      {/* ─── Recent Operational Events ──────────────────────────────── */}
      <section className="rounded-xl border border-default bg-surface p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-body font-semibold text-primary">Recent Operational Events</h2>
          <a
            href="/admin/logs"
            className="text-caption text-link hover:underline"
          >
            View all logs
          </a>
        </div>
        <ul className="space-y-3" role="list">
          {recentEvents.map((event, i) => (
            <li
              key={i}
              className="flex items-start gap-3 text-body-sm"
            >
              <span className={`mt-1.5 size-1.5 shrink-0 rounded-full ${severityDot[event.severity]}`} />
              <div className="flex flex-1 items-start justify-between gap-2">
                <span className="text-primary">{event.message}</span>
                <span className="shrink-0 text-caption text-muted">{event.time}</span>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-caption text-muted">
          Note: Events are currently hardcoded placeholders. Replace with live event log
          from observability pipeline when AdminModule API is implemented.
        </p>
      </section>

      {/* ─── Quick Actions ─────────────────────────────────────────── */}
      <section className="rounded-xl border border-default bg-surface p-6">
        <h2 className="mb-4 text-body font-semibold text-primary">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" size="sm" asChild>
            <Link href="/admin/logs">View Logs</Link>
          </Button>
          <Button variant="secondary" size="sm" asChild>
            <Link href="/org">Manage Organizations</Link>
          </Button>
          <Button variant="secondary" size="sm" asChild>
            <Link href="/admin/users">User Management</Link>
          </Button>
          <Button variant="secondary" size="sm" asChild>
            <Link href="/admin/settings">System Settings</Link>
          </Button>
        </div>
      </section>

      {/* ─── Backend TODO Placeholders ─────────────────────────────── */}
      {/* The following are documented as future integration points:      */}
      {/*                                                               */}
      {/* 1. Incident detection — automate alert generation from      */}
      {/*    monitoring pipeline (PagerDuty, Datadog, etc.)             */}
      {/* 2. Historical uptime — real 30/90/365 day uptime calculation */}
      {/* 3. Error-rate trends — sparkline charts per service           */}
      {/* 4. Queue depth — message queue backlog per worker            */}
      {/* 5. API latency — p50/p95/p99 per endpoint                     */}
      {/* 6. Organization growth — week-over-week new signups          */}
      {/* 7. User activity trends — DAU/MAU ratio                       */}
      {/* 8. Automated alert thresholds — configurable via UI          */}
      {/*                                                               */}
      {/* Until these are wired, the dashboard remains a shell.        */}
    </div>
  );
}
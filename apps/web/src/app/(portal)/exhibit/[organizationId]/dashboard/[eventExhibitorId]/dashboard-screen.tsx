import type { ExhibitorDashboard } from "@concourse/api-client";
import Link from "next/link";
import { KpiGrid, KpiCard } from "../../_components/kpi-grid";
import { QuickActions } from "../../_components/quick-actions";
import { ActivityFeed } from "../../_components/activity-feed";
import { AiInsightCards } from "../../_components/ai-insight-cards";

export function DashboardScreen({ dashboard, organizationId }: { dashboard: ExhibitorDashboard; organizationId?: string }) {
  const perf = dashboard.performance;
  const pipeline = dashboard.pipeline;
  const pipelineTotal = pipeline.new + pipeline.active + pipeline.returning + pipeline.needsFollowUp;
  const leadQuality = pipelineTotal > 0 ? Math.round((pipeline.active / pipelineTotal) * 100) : 0;
  const engagementScore = Math.min(100, Math.round((perf.qrScans + perf.relationshipsCreated * 2 + perf.returningVisitors * 3) / 5));

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-caption font-medium text-secondary">Exhibitor workspace</p>
          <h1 className="mt-1 text-title font-semibold text-primary">Dashboard</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full border border-status-success-border bg-status-success-subtle px-2.5 py-1 text-caption font-medium text-status-success-text">
            <span className="inline-block size-1.5 rounded-full bg-status-success" />
            Live
          </span>
        </div>
      </div>

      <KpiGrid>
        <KpiCard label="Today's Visitors" value={pipeline.new} trend={pipeline.new > 0 ? { direction: "up", label: `${pipeline.new} new` } : undefined} />
        <KpiCard label="QR Scans" value={perf.qrScans} />
        <KpiCard label="Relationships Created" value={perf.relationshipsCreated} />
        <KpiCard label="Returning Visitors" value={perf.returningVisitors} />
        <KpiCard label="Profile Completion" value={`${perf.profileCompletion}%`} />
        <KpiCard label="Lead Quality" value={`${leadQuality}%`} />
        <KpiCard label="Engagement Score" value={engagementScore} />
      </KpiGrid>

      <QuickActions />

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-xl border border-default bg-surface p-5 lg:col-span-2">
          <h2 className="mb-4 text-body font-semibold text-primary">Recent Activity</h2>
          <ActivityFeed activities={dashboard.recentActivity} organizationId={organizationId ?? ""} />
        </section>

        <section className="rounded-xl border border-default bg-surface p-5">
          <h2 className="mb-4 text-body font-semibold text-primary">AI Insights</h2>
          <AiInsightCards dashboard={dashboard} />
          <div className="mt-4 space-y-3">
            {dashboard.intelligenceFeed.items.length > 0 && (
              <div className="rounded-lg bg-sunken p-3">
                <p className="text-caption font-medium text-primary">Recent Enrichments</p>
                <ul className="mt-2 space-y-2">
                  {dashboard.intelligenceFeed.items.slice(0, 3).map((item) => (
                    <li key={item.id} className="text-body-sm text-secondary">
                      {item.label}
                      <span className="ml-2 text-caption text-muted">{dateTime(item.at)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-default bg-surface p-5">
          <h2 className="mb-4 text-body font-semibold text-primary">Relationship Pipeline</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-lg border border-default bg-sunken p-3">
              <p className="text-caption font-medium text-secondary">New</p>
              <p className="mt-1 text-title font-semibold text-primary">{pipeline.new}</p>
            </div>
            <div className="rounded-lg border border-status-success-border bg-status-success-subtle p-3">
              <p className="text-caption font-medium text-status-success-text">Active</p>
              <p className="mt-1 text-title font-semibold text-status-success-text">{pipeline.active}</p>
            </div>
            <div className="rounded-lg border border-status-info-border bg-status-info-subtle p-3">
              <p className="text-caption font-medium text-status-info-text">Returning</p>
              <p className="mt-1 text-title font-semibold text-status-info-text">{pipeline.returning}</p>
            </div>
            <div className="rounded-lg border border-status-warning-border bg-status-warning-subtle p-3">
              <p className="text-caption font-medium text-status-warning-text">Needs Follow-up</p>
              <p className="mt-1 text-title font-semibold text-status-warning-text">{pipeline.needsFollowUp}</p>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-default bg-surface p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-body font-semibold text-primary">Requires Attention</h2>
            {dashboard.attention.length > 0 && (
              <span className="rounded-full bg-status-danger-subtle px-2 py-0.5 text-caption font-medium text-status-danger-text">{dashboard.attention.length}</span>
            )}
          </div>
          {dashboard.attention.length === 0 ? (
            <div className="mt-4 flex min-h-24 items-center justify-center rounded-lg border border-dashed border-default p-4">
              <p className="text-body-sm text-muted">No relationships need attention right now.</p>
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {dashboard.attention.map((item) => (
                <li key={item.relationshipId} className="rounded-lg border border-default p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-body-sm font-medium text-primary">{item.attendeeName ?? "Attendee"}</p>
                      <p className="mt-0.5 text-caption text-muted">{item.reasons.join(" · ")}</p>
                    </div>
                    {organizationId && (
                      <Link
                        href={`/exhibit/${organizationId}/relationships/${item.relationshipId}`}
                        className="shrink-0 text-caption text-link hover:underline"
                      >
                        Open
                      </Link>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function dateTime(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

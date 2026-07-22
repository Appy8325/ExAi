import type { ExhibitorDashboard } from "@concourse/api-client";
import Link from "next/link";
import { EmptyState, StatusBadge } from "@concourse/ui";
import { KpiGrid, KpiCard } from "../../_components/kpi-grid";
import { QuickActions } from "../../_components/quick-actions";
import { ActivityFeed } from "../../_components/activity-feed";
import { AiInsightCards } from "../../_components/ai-insight-cards";

export function DashboardScreen({ dashboard, organizationId }: { dashboard: ExhibitorDashboard; organizationId?: string }) {
  const perf = dashboard.performance;
  const pipeline = dashboard.pipeline;
  const pipelineTotal = pipeline.new + pipeline.active + pipeline.returning + pipeline.needsFollowUp;
  const scanRate = pipelineTotal > 0 ? Math.round((perf.qrScans / Math.max(pipeline.new, 1)) * 100) : 0;
  const leadQuality = pipelineTotal > 0 ? Math.round((pipeline.active / pipelineTotal) * 100) : 0;
  const hasTrend = dashboard.sinceLastVisited.since !== null;

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-caption font-medium text-secondary">Exhibitor workspace</p>
          <h1 className="mt-1 text-title font-semibold text-primary">Booth Dashboard</h1>
        </div>
        <div className="flex items-center gap-3">
          {perf.profileCompletion < 100 && (
            <span className="text-caption text-muted">Profile {perf.profileCompletion}%</span>
          )}
          <StatusBadge tone="success">Live</StatusBadge>
        </div>
      </div>

      <KpiGrid>
        <KpiCard
          label="Visitors Today"
          value={String(pipeline.new)}
          detail={`${perf.qrScans} scans · ${perf.returningVisitors} returning`}
          trend={hasTrend && dashboard.sinceLastVisited.returningVisitors > 0 ? { value: `${dashboard.sinceLastVisited.returningVisitors} returning since last visit`, positive: true } : undefined}
        />
        <KpiCard
          label="Scan Rate"
          value={`${scanRate}%`}
          detail={`${perf.qrScans} total scans`}
        />
        <KpiCard
          label="Relationships"
          value={String(perf.relationshipsCreated)}
          detail={dashboard.sinceLastVisited.newRelationships > 0 ? `${dashboard.sinceLastVisited.newRelationships} new since last visit` : undefined}
          trend={dashboard.sinceLastVisited.newRelationships > 0 ? { value: `${dashboard.sinceLastVisited.newRelationships} new`, positive: true } : undefined}
        />
        <KpiCard
          label="Pipeline Health"
          value={`${pipeline.active} active`}
          detail={`${pipeline.needsFollowUp} need follow-up`}
        />
      </KpiGrid>

      <QuickActions />

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-xl border border-default bg-surface p-6 lg:col-span-2">
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

          {dashboard.attention.length > 0 && (
            <>
              <h3 className="mb-3 mt-6 flex items-center gap-2 text-body-sm font-semibold text-primary">
                Requires Attention
                <span className="inline-flex size-5 items-center justify-center rounded-full bg-status-danger-solid text-caption font-semibold text-on-brand">
                  {dashboard.attention.length}
                </span>
              </h3>
              <ul className="space-y-3">
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
            </>
          )}

          {dashboard.attention.length === 0 && (
            <div className="mt-6">
              <EmptyState
                title="All clear"
                description="No relationships need attention right now."
              />
            </div>
          )}
        </section>

        <section className="rounded-xl border border-default bg-surface p-6">
          <h2 className="mb-4 text-body font-semibold text-primary">AI Intelligence</h2>
          <AiInsightCards dashboard={dashboard} organizationId={organizationId} />
          {dashboard.intelligenceFeed.items.length > 0 && organizationId && (
            <div className="mt-4">
              <Link
                href={`/exhibit/${organizationId}/ai-insights`}
                className="inline-flex h-9 items-center rounded-lg border border-default bg-surface px-4 text-caption font-medium text-primary transition-colors hover:bg-sunken"
              >
                View all AI insights
              </Link>
            </div>
          )}
        </section>
      </div>

      <details className="group rounded-xl border border-default bg-surface">
        <summary className="flex cursor-pointer items-center justify-between p-4 text-body font-semibold text-primary">
          Recent Activity
          <svg className="size-4 text-muted transition-transform group-open:rotate-180" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M4 6l4 4 4-4" />
          </svg>
        </summary>
        <div className="border-t border-default px-4 py-4">
          <ActivityFeed activities={dashboard.recentActivity} />
        </div>
      </details>
    </div>
  );
}

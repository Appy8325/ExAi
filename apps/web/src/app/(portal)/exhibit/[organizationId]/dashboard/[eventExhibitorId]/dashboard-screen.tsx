import type { ExhibitorDashboard } from "@concourse/api-client";
import Link from "next/link";
import { EmptyState, StatusBadge } from "@concourse/ui";
import { KpiGrid, KpiCard } from "../_components/kpi-grid";
import { QuickActions } from "../_components/quick-actions";
import { ActivityFeed } from "../_components/activity-feed";
import { AiInsightCards } from "../_components/ai-insight-cards";

type BoothInfo = {
  companyName: string;
  eventName: string;
  boothName: string;
  boothNumber: string | null;
};

export function DashboardScreen({
  dashboard,
  organizationId,
  eventExhibitorId,
  boothInfo,
}: {
  dashboard: ExhibitorDashboard;
  organizationId?: string;
  eventExhibitorId?: string;
  boothInfo: BoothInfo | null;
}) {
  const perf = dashboard.performance;
  const pipeline = dashboard.pipeline;
  const scansPerVisitor = pipeline.new > 0 ? perf.qrScans / pipeline.new : 0;

  return (
    <div className="space-y-section">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-title font-semibold text-primary">
            {boothInfo ? boothInfo.companyName : "Your Booth"}
            {boothInfo?.boothNumber && (
              <span className="ml-2 text-caption font-normal text-muted">
                · Booth {boothInfo.boothNumber}
              </span>
            )}
          </h1>
          {boothInfo && (
            <p className="mt-0.5 text-caption text-secondary">{boothInfo.eventName}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge tone="success">Live</StatusBadge>
        </div>
      </div>

      <KpiGrid>
        <KpiCard
          label="Visitors Today"
          value={String(pipeline.new)}
          detail={`${perf.qrScans} scans · ${perf.returningVisitors} returning`}
        />
        <KpiCard
          label="Scans per Visitor"
          value={scansPerVisitor > 0 ? `${scansPerVisitor.toFixed(1)}×` : "—"}
          detail={
            perf.qrScans > 0 && pipeline.new > 0
              ? `${perf.qrScans} scans across ${pipeline.new} visitors`
              : perf.qrScans > 0
              ? `${perf.qrScans} scans recorded`
              : "Waiting for first scan"
          }
        />
        <KpiCard
          label="Relationships"
          value={String(perf.relationshipsCreated)}
          detail={
            dashboard.sinceLastVisited.newRelationships > 0
              ? `${dashboard.sinceLastVisited.newRelationships} new since last visit`
              : undefined
          }
          trend={
            dashboard.sinceLastVisited.newRelationships > 0
              ? { value: `${dashboard.sinceLastVisited.newRelationships} new`, positive: true }
              : undefined
          }
        />
        <KpiCard
          label="Profile Completion"
          value={`${perf.profileCompletion}%`}
          detail={
            perf.profileCompletion < 100
              ? "Complete your profile to attract more visitors"
              : "Profile is fully complete"
          }
        />
      </KpiGrid>

      <QuickActions organizationId={organizationId} eventExhibitorId={eventExhibitorId} />

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-xl border border-default bg-surface p-6 lg:col-span-2">
          <h2 className="mb-4 text-body font-semibold text-primary">Relationship Pipeline</h2>
          <ul role="list" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <li className="rounded-lg border border-default bg-sunken p-3">
              <p className="text-caption font-medium text-secondary">New</p>
              <p className="mt-1 text-title font-semibold text-primary">{pipeline.new}</p>
            </li>
            <li className="rounded-lg border border-status-success-border bg-status-success-subtle p-3">
              <p className="text-caption font-medium text-status-success-text">Active</p>
              <p className="mt-1 text-title font-semibold text-status-success-text">{pipeline.active}</p>
            </li>
            <li className="rounded-lg border border-status-info-border bg-status-info-subtle p-3">
              <p className="text-caption font-medium text-status-info-text">Returning</p>
              <p className="mt-1 text-title font-semibold text-status-info-text">{pipeline.returning}</p>
            </li>
            <li className="rounded-lg border border-status-warning-border bg-status-warning-subtle p-3">
              <p className="text-caption font-medium text-status-warning-text">Needs Follow-up</p>
              <p className="mt-1 text-title font-semibold text-status-warning-text">{pipeline.needsFollowUp}</p>
            </li>
          </ul>

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
                        <p className="mt-0.5 text-caption text-muted">{(item.reasons ?? []).join(" · ")}</p>
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

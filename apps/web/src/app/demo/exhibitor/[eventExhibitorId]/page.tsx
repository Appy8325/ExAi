import Link from "next/link";

import { notFound } from "next/navigation";
import { Card } from "@concourse/ui";

import {
  getPublicDemoExhibitorDashboard,
  getPublicDemoOverview,
} from "@concourse/api-client";
import { getApiBaseUrl } from "@/lib/api/config";
import {
  DemoPageHeader,
  DemoUnavailable,
} from "@/components/demo/shell";
import { TrackVisit } from "@/components/demo/analytics-tracker";
import { LiveDashboardMetrics, LiveExhibitorPipeline, LiveMetricsBar, RecentActivityFeed } from "@/components/demo/live-metrics";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ExhibitorDashboardPage({
  params,
}: {
  params: Promise<{ eventExhibitorId: string }>;
}) {
  const { eventExhibitorId } = await params;
  const apiBase = getApiBaseUrl();
  const [overview, dashboard] = await Promise.all([
    getPublicDemoOverview({ baseUrl: apiBase }).catch(() => null),
    getPublicDemoExhibitorDashboard({ baseUrl: apiBase }, eventExhibitorId).catch(
      () => null,
    ),
  ]);
  if (!overview || !dashboard) return <DemoUnavailable />;

  const exhibitorOrg = overview.exhibitorOrganizations.find((eo) =>
    eo.events.some((e) => e.eventExhibitorId === eventExhibitorId),
  );
  const participation = exhibitorOrg?.events.find(
    (e) => e.eventExhibitorId === eventExhibitorId,
  );
  const event = overview.events.find((e) => e.id === participation?.eventId);
  const booth = event?.exhibitors.find((b) => b.id === eventExhibitorId);
  if (!exhibitorOrg || !booth) notFound();

  const perf = dashboard.performance;
  const pipeline = dashboard.pipeline;
  const pipelineTotal =
    pipeline.new + pipeline.active + pipeline.returning + pipeline.needsFollowUp;
  const leadQuality =
    pipelineTotal > 0 ? Math.round((pipeline.active / pipelineTotal) * 100) : 0;
  const engagementScore = Math.min(100, Math.round(
    perf.profileCompletion * 0.3 +
    perf.formCompletionRate * 0.3 +
    Math.min(perf.relationshipsCreated, 100) * 0.2 +
    Math.min(perf.returningVisitors, 50) * 0.2
  ));

  return (
    <div className="space-y-8">
      <TrackVisit boothId={eventExhibitorId} />
      <DemoPageHeader
        eyebrow="Exhibitor workspace"
        title={booth.companyName}
        description={`Booth ${booth.boothNumber ?? "—"} — ${booth.boothName}${
          event ? ` — ${event.name}` : ""
        }`}
        badge="Read-only"
      />

      <LiveMetricsBar />

      <LiveDashboardMetrics boothId={eventExhibitorId} />

        <div className="grid gap-6 lg:grid-cols-2">
          <LiveExhibitorPipeline boothId={eventExhibitorId} />
          {/*
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-title-sm font-semibold text-primary">
                Relationship pipeline
              </h2>
              <Link
                href={`/demo/exhibitor/${eventExhibitorId}/visitors`}
                className="text-caption font-medium text-status-info-text hover:underline"
              >
                View pipeline ?
              </Link>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <PipelineCard label="New" value={pipeline.new} tone="neutral" />
              <PipelineCard label="Active" value={pipeline.active} tone="success" />
              <PipelineCard
                label="Returning"
                value={pipeline.returning}
                tone="info"
              />
              <PipelineCard
                label="Follow-up"
                value={pipeline.needsFollowUp}
                tone="warning"
              />
            </div>
          </Card> */}

          {dashboard.attention.length > 0 && (
            <Card>
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-title-sm font-semibold text-primary">
                  Needs attention
                </h2>
                <Link
                  href={`/demo/exhibitor/${eventExhibitorId}/visitors`}
                  className="text-caption font-medium text-status-warning-text hover:underline"
                >
                  View all ?
                </Link>
              </div>
              <ul className="mt-4 space-y-2">
                {dashboard.attention.slice(0, 4).map((item) => (
                  <li
                    key={item.relationshipId}
                    className="rounded-lg border border-status-warning-border bg-status-warning-subtle px-3 py-2"
                  >
                    <p className="text-body font-medium text-primary">
                      {item.attendeeName}
                    </p>
                    <p className="mt-1 text-caption text-secondary">
                      {item.reasons.join(" — ")}
                    </p>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <Card>
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-title-sm font-semibold text-primary">
                AI intelligence feed
              </h2>
              <Link
                href={`/demo/exhibitor/${eventExhibitorId}/ai-insights`}
                className="text-caption font-medium text-status-ai-text hover:underline"
              >
                View AI insights ?
              </Link>
            </div>
            {dashboard.intelligenceFeed.items.length > 0 ? (
              <ul className="mt-4 space-y-2">
                {dashboard.intelligenceFeed.items.slice(0, 4).map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border border-default bg-sunken px-3 py-2"
                  >
                    <span className="truncate text-body text-secondary">
                      {item.label}
                    </span>
                    <span className="text-caption text-muted">
                      {formatTime(item.at)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-body text-muted">
                No AI intelligence activity captured yet.
              </p>
            )}
          </Card>
        </div>

        <RecentActivityFeed />

        <div className="flex flex-wrap gap-3">
          <Link
            href={`/demo/exhibitor/${eventExhibitorId}/products`}
            className="inline-flex h-10 items-center rounded-lg bg-status-success-solid px-4 text-body font-semibold text-on-brand"
          >
            Products
          </Link>
          <Link
            href={`/demo/exhibitor/${eventExhibitorId}/visitors`}
            className="inline-flex h-10 items-center rounded-lg border border-default bg-surface px-4 text-body font-semibold text-primary"
          >
            Visitors
          </Link>
          <Link
            href={`/demo/exhibitor/${eventExhibitorId}/analytics`}
            className="inline-flex h-10 items-center rounded-lg border border-default bg-surface px-4 text-body font-semibold text-primary"
          >
            Analytics
          </Link>
          <Link
            href={`/demo/exhibitor/${eventExhibitorId}/qr`}
            className="inline-flex h-10 items-center rounded-lg border border-default bg-surface px-4 text-body font-semibold text-primary"
          >
            QR
          </Link>
          {booth.publicQrToken ? (
            <Link
              href={`/visit/${booth.publicQrToken}`}
              className="inline-flex h-10 items-center rounded-lg border border-brand/30 bg-brand-subtle px-4 text-body font-semibold text-brand"
            >
              Open public booth
            </Link>
          ) : null}
      </div>
    </div>
  );
}

function PipelineCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "neutral" | "success" | "info" | "warning";
}) {
  const tones = {
    neutral: "border-default bg-sunken text-secondary",
    success:
      "border-status-success-border bg-status-success-subtle text-status-success-text",
    info: "border-status-info-border bg-status-info-subtle text-status-info-text",
    warning:
      "border-status-warning-border bg-status-warning-subtle text-status-warning-text",
  };
  return (
    <div className={`rounded-lg border p-3 ${tones[tone]}`}>
      <p className="text-caption font-medium">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums text-primary">
        {value}
      </p>
    </div>
  );
}

function formatTime(value: string) {
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

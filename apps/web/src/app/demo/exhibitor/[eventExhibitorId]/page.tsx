import Link from "next/link";

import { notFound } from "next/navigation";
import { Card, MetricCard } from "@concourse/ui";

import {
  getPublicDemoExhibitorDashboard,
  getPublicDemoOverview,
} from "@concourse/api-client";
import { getApiBaseUrl } from "@/lib/api/config";
import {
  DemoMobileNav,
  DemoPageHeader,
  DemoUnavailable,
} from "@/components/demo/shell";
import { TrackVisit } from "@/components/demo/analytics-tracker";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const SIDEBAR = (id: string) => [
  { label: "Dashboard", href: `/demo/exhibitor/${id}` },
  { label: "Products", href: `/demo/exhibitor/${id}/products` },
  { label: "Visitors", href: `/demo/exhibitor/${id}/visitors` },
  { label: "Analytics", href: `/demo/exhibitor/${id}/analytics` },
  { label: "AI Insights", href: `/demo/exhibitor/${id}/ai-insights` },
  { label: "QR", href: `/demo/exhibitor/${id}/qr` },
  { label: "Booth Preview", href: `/demo/exhibitor/${id}/preview` },
];

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
    <div className="space-y-8 px-6 py-8 sm:px-10 sm:py-10">
      <TrackVisit boothId={eventExhibitorId} />
      <DemoMobileNav items={SIDEBAR(eventExhibitorId)} currentHref={`/demo/exhibitor/${eventExhibitorId}`} />

      <DemoPageHeader
        eyebrow="Exhibitor workspace"
        title={booth.companyName}
        description={`Booth ${booth.boothNumber ?? "—"} · ${booth.boothName}${
          event ? ` · ${event.name}` : ""
        }`}
        badge="Read-only"
      />

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <MetricCard label="New visitors" value={String(pipeline.new)} />
        <MetricCard label="QR scans" value={String(perf.qrScans)} />
        <MetricCard
          label="Relationships"
          value={String(perf.relationshipsCreated)}
        />
        <MetricCard label="Returning" value={String(perf.returningVisitors)} />
        <MetricCard
          label="Profile completion"
          value={`${perf.profileCompletion}%`}
        />
        <MetricCard label="Lead quality" value={`${leadQuality}%`} />
        <MetricCard label="Engagement" value={String(engagementScore)} />
        <MetricCard
          label="Source count"
          value={String(dashboard.boothInfo.sourceCount)}
          />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-base font-semibold text-primary">
              Relationship pipeline
            </h2>
            <Link
              href={`/demo/exhibitor/${eventExhibitorId}/visitors`}
              className="text-xs font-medium text-status-info-text hover:underline"
            >
              View pipeline →
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
        </Card>

        <Card>
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-base font-semibold text-primary">
              AI intelligence feed
            </h2>
            <Link
              href={`/demo/exhibitor/${eventExhibitorId}/ai-insights`}
              className="text-xs font-medium text-status-ai-text hover:underline"
            >
              View AI insights →
            </Link>
          </div>
          {dashboard.intelligenceFeed.items.length > 0 ? (
            <ul className="mt-4 space-y-2">
              {dashboard.intelligenceFeed.items.slice(0, 4).map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border border-default bg-sunken px-3 py-2"
                >
                  <span className="truncate text-sm text-secondary">
                    {item.label}
                  </span>
                  <span className="text-xs text-muted">
                    {formatTime(item.at)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-muted">
              No AI intelligence activity captured yet.
            </p>
          )}
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href={`/demo/exhibitor/${eventExhibitorId}/products`}
          className="inline-flex h-10 items-center rounded-lg bg-status-success-solid px-4 text-sm font-semibold text-on-brand"
        >
          Products
        </Link>
        <Link
          href={`/demo/exhibitor/${eventExhibitorId}/visitors`}
          className="inline-flex h-10 items-center rounded-lg border border-default bg-surface px-4 text-sm font-semibold text-primary"
        >
          Visitors
        </Link>
        <Link
          href={`/demo/exhibitor/${eventExhibitorId}/analytics`}
          className="inline-flex h-10 items-center rounded-lg border border-default bg-surface px-4 text-sm font-semibold text-primary"
        >
          Analytics
        </Link>
        <Link
          href={`/demo/exhibitor/${eventExhibitorId}/qr`}
          className="inline-flex h-10 items-center rounded-lg border border-default bg-surface px-4 text-sm font-semibold text-primary"
        >
          QR
        </Link>
        {booth.publicQrToken ? (
          <Link
            href={`/visit/${booth.publicQrToken}`}
            className="inline-flex h-10 items-center rounded-lg border border-brand/30 bg-brand-subtle px-4 text-sm font-semibold text-brand"
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
      <p className="text-xs font-medium">{label}</p>
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

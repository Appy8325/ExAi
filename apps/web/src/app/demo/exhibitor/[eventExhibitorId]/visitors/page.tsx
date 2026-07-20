import { notFound } from "next/navigation";
import { Card, EmptyState, MetricCard } from "@concourse/ui";

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

export const dynamic = "force-dynamic";
export const revalidate = 0;

const sid = (id: string) => [
  { label: "Dashboard", href: `/demo/exhibitor/${id}` },
  { label: "Products", href: `/demo/exhibitor/${id}/products` },
  { label: "Visitors", href: `/demo/exhibitor/${id}/visitors` },
  { label: "Analytics", href: `/demo/exhibitor/${id}/analytics` },
  { label: "AI Insights", href: `/demo/exhibitor/${id}/ai-insights` },
  { label: "QR", href: `/demo/exhibitor/${id}/qr` },
  { label: "Booth Preview", href: `/demo/exhibitor/${id}/preview` },
];

export default async function ExhibitorVisitorsPage({
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

  const booth = overview.events
    .flatMap((e) => e.exhibitors)
    .find((b) => b.id === eventExhibitorId);
  if (!booth) notFound();

  const pipeline = dashboard.pipeline;
  const total =
    pipeline.new + pipeline.active + pipeline.returning + pipeline.needsFollowUp;

  return (
    <div className="space-y-8 px-6 py-8 sm:px-10 sm:py-10">
      <DemoMobileNav
        items={sid(eventExhibitorId)}
        currentHref={`/demo/exhibitor/${eventExhibitorId}/visitors`}
      />

      <DemoPageHeader
        eyebrow="Exhibitor workspace"
        title="Visitors"
        description="Relationship pipeline and AI-flagged attention — read-only demo."
        badge="Pipeline"
      />

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <MetricCard label="New" value={String(pipeline.new)} />
        <MetricCard label="Active" value={String(pipeline.active)} />
        <MetricCard label="Returning" value={String(pipeline.returning)} />
        <MetricCard label="Follow-up" value={String(pipeline.needsFollowUp)} />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-base font-semibold text-primary">
            Recent activity
          </h2>
          {dashboard.recentActivity.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {dashboard.recentActivity.slice(0, 8).map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border border-default bg-sunken px-3 py-2"
                >
                  <span className="truncate text-sm text-secondary">
                    {item.label}
                  </span>
                  <span className="ml-2 shrink-0 text-xs text-muted">
                    {formatDateTime(item.at)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              title="No recent visitors"
              description="Once attendees scan or interact with the booth, they appear here."
            />
          )}
        </Card>

        <Card>
          <h2 className="text-base font-semibold text-primary">
            Needs attention
          </h2>
          {dashboard.attention.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {dashboard.attention.map((item) => (
                <li
                  key={item.relationshipId}
                  className="rounded-lg border border-status-warning-border bg-status-warning-subtle px-3 py-2"
                >
                  <p className="text-sm font-medium text-primary">
                    {item.attendeeName}
                  </p>
                  <p className="mt-1 text-xs text-secondary">
                    {item.reasons.join(" · ")}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              title="No flagged attendees"
              description="AI will highlight attendees worth re-engaging."
            />
          )}
        </Card>
      </div>

      <p className="text-xs text-muted">
        {total} relationships captured in this pipeline during the demo event.
      </p>
    </div>
  );
}

function formatDateTime(value: string) {
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

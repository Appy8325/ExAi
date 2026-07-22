import { notFound } from "next/navigation";
import { Card, MetricCard } from "@concourse/ui";

import {
  getPublicDemoExhibitorDashboard,
  getPublicDemoOverview,
} from "@concourse/api-client";

import { getApiBaseUrl } from "@/lib/api/config";
import {
  DemoPageHeader,
  DemoUnavailable,
} from "@/components/demo/shell";
import { LiveMetricsBar } from "@/components/demo/live-metrics";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ExhibitorAnalyticsPage({
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

  const perf = dashboard.performance;
  const pipeline = dashboard.pipeline;

  return (
    <div className="space-y-8">
      <DemoPageHeader
        eyebrow="Exhibitor workspace"
        title="Booth analytics"
        description="Performance metrics and engagement tracking — read-only demo."
        badge="Read-only"
      />

      <LiveMetricsBar />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="QR scans" value={String(perf.qrScans)} />
        <MetricCard
          label="Relationships"
          value={String(perf.relationshipsCreated)}
        />
        <MetricCard label="Returning" value={String(perf.returningVisitors)} />
        <MetricCard
          label="Form completion"
          value={`${perf.formCompletionRate}%`}
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-title-sm font-semibold text-primary">
            Pipeline distribution
          </h2>
          <div className="mt-4 space-y-4">
            <Bar
              label="New"
              value={pipeline.new}
              max={Math.max(
                pipeline.new,
                pipeline.active,
                pipeline.returning,
                pipeline.needsFollowUp,
                1,
              )}
              color="bg-muted"
            />
            <Bar
              label="Active"
              value={pipeline.active}
              max={Math.max(
                pipeline.new,
                pipeline.active,
                pipeline.returning,
                pipeline.needsFollowUp,
                1,
              )}
              color="bg-status-success-solid"
            />
            <Bar
              label="Returning"
              value={pipeline.returning}
              max={Math.max(
                pipeline.new,
                pipeline.active,
                pipeline.returning,
                pipeline.needsFollowUp,
                1,
              )}
              color="bg-status-info-solid"
            />
            <Bar
              label="Follow-up"
              value={pipeline.needsFollowUp}
              max={Math.max(
                pipeline.new,
                pipeline.active,
                pipeline.returning,
                pipeline.needsFollowUp,
                1,
              )}
              color="bg-status-warning-solid"
            />
          </div>
        </Card>

        <Card>
          <h2 className="text-title-sm font-semibold text-primary">
            Performance summary
          </h2>
          <dl className="mt-4 space-y-4 text-body">
            <Stat
              label="Profile completion rate"
              value={`${perf.profileCompletion}%`}
            />
            <Stat
              label="Lead form completion"
              value={`${perf.formCompletionRate}%`}
            />
            <Stat
              label="Returning visitor rate"
              value={
                perf.relationshipsCreated > 0
                  ? `${Math.round(
                      (perf.returningVisitors / perf.relationshipsCreated) * 100,
                    )}%`
                  : "0%"
              }
            />
            <Stat
              label="Total interactions"
              value={String(perf.qrScans + perf.relationshipsCreated)}
            />
          </dl>
        </Card>
      </div>
    </div>
  );
}

function Bar({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const pct = Math.round((value / Math.max(1, max)) * 100);
  return (
    <div>
      <div className="mb-1 flex justify-between text-body">
        <span className="text-secondary">{label}</span>
        <span className="font-medium text-primary">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-subtle">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-secondary">{label}</dt>
      <dd className="font-semibold text-primary">{value}</dd>
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, MetricCard } from "@concourse/ui";

import {
  getPublicDemoExhibitorDashboard,
  getPublicDemoOverview,
} from "@concourse/api-client";
import { getApiBaseUrl } from "@/lib/api/config";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DemoExhibitorAnalyticsPage({ params }: { params: Promise<{ eventExhibitorId: string }> }) {
  const { eventExhibitorId } = await params;
  const apiBase = getApiBaseUrl();
  const [overview, dashboard] = await Promise.all([
    getPublicDemoOverview({ baseUrl: apiBase }).catch(() => null),
    getPublicDemoExhibitorDashboard({ baseUrl: apiBase }, eventExhibitorId).catch(() => null),
  ]);
  if (!overview || !dashboard) return <Unavailable />;

  const booth = overview.events
    .flatMap((e) => e.exhibitors)
    .find((b) => b.id === eventExhibitorId);
  if (!booth) notFound();

  const perf = dashboard.performance;
  const pipeline = dashboard.pipeline;

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 sm:px-10">
      <Link href={`/demo/exhibitor/${eventExhibitorId}`} className="inline-flex items-center gap-1 text-sm text-link hover:underline">
        <svg className="size-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10 12l-4-4 4-4" />
        </svg>
        Back to dashboard
      </Link>

      <header className="mt-4">
        <p className="text-caption font-semibold uppercase tracking-[0.2em] text-status-success-text">
          Booth analytics
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-primary">{booth.companyName}</h1>
        <p className="mt-1 text-sm text-secondary">
          Performance metrics and engagement tracking &mdash; read-only demo.
        </p>
      </header>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="QR Scans" value={String(perf.qrScans)} />
        <MetricCard label="Relationships" value={String(perf.relationshipsCreated)} />
        <MetricCard label="Returning" value={String(perf.returningVisitors)} />
        <MetricCard label="Form Completion" value={`${perf.formCompletionRate}%`} />
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-base font-semibold text-primary">Pipeline distribution</h2>
          <div className="mt-4 space-y-4">
            <Bar label="New" value={pipeline.new} max={Math.max(...[pipeline.new, pipeline.active, pipeline.returning, pipeline.needsFollowUp], 1)} color="bg-muted" />
            <Bar label="Active" value={pipeline.active} max={Math.max(...[pipeline.new, pipeline.active, pipeline.returning, pipeline.needsFollowUp], 1)} color="bg-status-success-solid" />
            <Bar label="Returning" value={pipeline.returning} max={Math.max(...[pipeline.new, pipeline.active, pipeline.returning, pipeline.needsFollowUp], 1)} color="bg-status-info-solid" />
            <Bar label="Needs Follow-up" value={pipeline.needsFollowUp} max={Math.max(...[pipeline.new, pipeline.active, pipeline.returning, pipeline.needsFollowUp], 1)} color="bg-status-warning-solid" />
          </div>
        </Card>

        <Card>
          <h2 className="text-base font-semibold text-primary">Performance summary</h2>
          <dl className="mt-4 space-y-4 text-sm">
            <Stat label="Profile completion rate" value={`${perf.profileCompletion}%`} />
            <Stat label="Lead form completion" value={`${perf.formCompletionRate}%`} />
            <Stat label="Returning visitor rate" value={perf.relationshipsCreated > 0 ? `${Math.round((perf.returningVisitors / perf.relationshipsCreated) * 100)}%` : "0%"} />
            <Stat label="Total interactions" value={String(perf.qrScans + perf.relationshipsCreated)} />
          </dl>
        </Card>
      </div>
    </div>
  );
}

function Bar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="text-secondary">{label}</span>
        <span className="font-medium text-primary">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-subtle">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
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

function Unavailable() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12 sm:px-10">
      <Link href="/demo" className="text-sm text-link hover:underline">Back to demo</Link>
      <p className="mt-6 rounded-xl border border-status-danger-border bg-status-danger-subtle p-6 text-sm text-status-danger-text">
        Demo data is unavailable right now.
      </p>
    </div>
  );
}

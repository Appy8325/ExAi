import Link from "next/link";
import { notFound } from "next/navigation";

import {
  getPublicDemoExhibitorDashboard,
  getPublicDemoOverview,
} from "@concourse/api-client";
import { getApiBaseUrl } from "@/lib/api/config";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DemoExhibitorDashboardPage({ params }: { params: Promise<{ eventExhibitorId: string }> }) {
  const { eventExhibitorId } = await params;
  const apiBase = getApiBaseUrl();
  const [overview, dashboard] = await Promise.all([
    getPublicDemoOverview({ baseUrl: apiBase }).catch(() => null),
    getPublicDemoExhibitorDashboard({ baseUrl: apiBase }, eventExhibitorId).catch(() => null),
  ]);
  if (!overview || !dashboard) return <Unavailable />;

  const exhibitorOrg = overview.exhibitorOrganizations.find((eo) =>
    eo.events.some((e) => e.eventExhibitorId === eventExhibitorId),
  );
  const participation = exhibitorOrg?.events.find((e) => e.eventExhibitorId === eventExhibitorId);
  const event = overview.events.find((e) => e.id === participation?.eventId);
  const booth = event?.exhibitors.find((b) => b.id === eventExhibitorId);

  if (!exhibitorOrg || !booth) notFound();

  const perf = dashboard.performance;
  const pipeline = dashboard.pipeline;
  const pipelineTotal = pipeline.new + pipeline.active + pipeline.returning + pipeline.needsFollowUp;
  const leadQuality = pipelineTotal > 0 ? Math.round((pipeline.active / pipelineTotal) * 100) : 0;
  const engagementScore = Math.min(100, Math.round((perf.qrScans + perf.relationshipsCreated * 2 + perf.returningVisitors * 3) / 5));

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-6 py-12 sm:px-10">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-caption font-semibold uppercase tracking-[0.2em] text-status-success-text">
            Exhibitor workspace
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-primary">
            {booth.companyName}
          </h1>
          <p className="text-sm text-secondary">
            Booth {booth.boothNumber ?? "\u2014"} &middot; {booth.boothName}
            {event ? ` \u00b7 ${event.name}` : ""}
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-status-success-border bg-status-success-subtle px-2.5 py-1 text-xs font-medium text-status-success-text">
          <span className="inline-block size-1.5 rounded-full bg-status-success-solid" />
          Read-only
        </span>
      </div>

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
        <KpiCard label="New Visitors" value={pipeline.new} trend={pipeline.new > 0 ? { direction: "up" as const, label: `${pipeline.new} today` } : undefined} />
        <KpiCard label="QR Scans" value={perf.qrScans} />
        <KpiCard label="Relationships" value={perf.relationshipsCreated} />
        <KpiCard label="Returning" value={perf.returningVisitors} />
        <KpiCard label="Profile Completion" value={`${perf.profileCompletion}%`} />
        <KpiCard label="Lead Quality" value={`${leadQuality}%`} />
        <KpiCard label="Engagement" value={engagementScore} />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-default bg-surface p-5">
          <h2 className="mb-4 text-base font-semibold text-primary">Relationship Pipeline</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <PipelineCard label="New" value={pipeline.new} tone="neutral" />
            <PipelineCard label="Active" value={pipeline.active} tone="success" />
            <PipelineCard label="Returning" value={pipeline.returning} tone="info" />
            <PipelineCard label="Needs Follow-up" value={pipeline.needsFollowUp} tone="warning" />
          </div>
        </section>

        <section className="rounded-xl border border-default bg-surface p-5">
          <h2 className="mb-4 text-base font-semibold text-primary">AI Insights</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-default bg-sunken p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-secondary">Enriched Profiles</p>
                <span className="inline-flex size-5 items-center justify-center rounded-full bg-status-ai-subtle text-[10px] text-status-ai-text">AI</span>
              </div>
              <p className="mt-1 text-xl font-semibold tabular-nums text-primary">{dashboard.intelligenceFeed.profilesEnriched}</p>
              <p className="mt-1 text-xs text-muted">Attendees with recent data updates</p>
            </div>
            <div className="rounded-xl border border-default bg-sunken p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-secondary">Complete Profiles</p>
                <span className="inline-flex size-5 items-center justify-center rounded-full bg-status-ai-subtle text-[10px] text-status-ai-text">AI</span>
              </div>
              <p className="mt-1 text-xl font-semibold tabular-nums text-primary">{dashboard.intelligenceFeed.completeProfiles}</p>
              <p className="mt-1 text-xs text-muted">Profiles with full contact data</p>
            </div>
          </div>
        </section>
      </div>

      <div className="flex flex-wrap gap-3">
        {booth.publicQrToken ? (
          <Link
            href={`/visit/${booth.publicQrToken}`}
            className="inline-flex h-10 items-center rounded-lg bg-status-success-solid px-4 text-sm font-semibold text-on-brand"
          >
            Open booth preview
          </Link>
        ) : null}
        <Link
          href={`/demo/exhibitor/${eventExhibitorId}/booth`}
          className="inline-flex h-10 items-center rounded-lg border border-default bg-surface px-4 text-sm font-semibold text-primary"
        >
          Booth profile
        </Link>
      </div>
    </div>
  );
}

function KpiCard({ label, value, trend }: { label: string; value: string | number; trend?: { direction: "up" | "down"; label: string } }) {
  return (
    <div className="rounded-xl border border-default bg-surface p-4">
      <p className="text-xs font-medium text-secondary">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums text-primary">{value}</p>
      {trend && (
        <p className={`mt-1 flex items-center gap-1 text-xs ${trend.direction === "up" ? "text-status-success-text" : "text-status-danger-text"}`}>
          <span>{trend.direction === "up" ? "\u2191" : "\u2193"}</span>
          <span>{trend.label}</span>
        </p>
      )}
    </div>
  );
}

function PipelineCard({ label, value, tone }: { label: string; value: number; tone: "neutral" | "success" | "info" | "warning" }) {
  const tones = {
    neutral: "border-default bg-sunken text-secondary",
    success: "border-status-success-border bg-status-success-subtle text-status-success-text",
    info: "border-status-info-border bg-status-info-subtle text-status-info-text",
    warning: "border-status-warning-border bg-status-warning-subtle text-status-warning-text",
  };
  return (
    <div className={`rounded-lg border p-3 ${tones[tone]}`}>
      <p className="text-xs font-medium">{label}</p>
      <p className="mt-1 text-xl font-semibold text-primary">{value}</p>
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

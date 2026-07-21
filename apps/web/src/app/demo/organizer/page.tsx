import Link from "next/link";
import {
  MetricCard,
  SectionHeader,
  Card,
} from "@concourse/ui";

import {
  getPublicDemoAnalytics,
  getPublicDemoOverview,
} from "@concourse/api-client";
import { getApiBaseUrl } from "@/lib/api/config";
import {
  DemoMobileNav,
  DemoPageHeader,
  DemoUnavailable,
} from "@/components/demo/shell";
import { LiveMetricsBar } from "@/components/demo/live-metrics";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const SIDEBAR = [
  { label: "Dashboard", href: "/demo/organizer" },
  { label: "Events", href: "/demo/organizer/events" },
  { label: "Analytics", href: "/demo/organizer/analytics" },
  { label: "Heatmaps", href: "/demo/organizer/heatmaps" },
  { label: "AI Insights", href: "/demo/organizer/ai-insights" },
  { label: "Reports", href: "/demo/organizer/reports" },
];

export default async function OrganizerDashboardPage() {
  const apiBase = getApiBaseUrl();
  const overview = await getPublicDemoOverview({ baseUrl: apiBase }).catch(() => null);
  if (!overview) return <DemoUnavailable />;

  const firstEvent = overview.events[0];
  const analytics = firstEvent
    ? await getPublicDemoAnalytics({ baseUrl: apiBase }, firstEvent.id).catch(
        () => null,
      )
    : null;

  const exhibitorCount = overview.events.reduce(
    (sum, e) => sum + e.exhibitors.length,
    0,
  );

  return (
    <div className="space-y-8 px-6 py-8 sm:px-10 sm:py-10">
      <DemoMobileNav items={SIDEBAR} currentHref="/demo/organizer" />

      <DemoPageHeader
        eyebrow="Organizer workspace"
        title={overview.organizers[0]?.name ?? "Organizer"}
        description="Event portfolio at a glance. Everything below is computed from seeded demo data."
        badge="Read-only"
      />

      <LiveMetricsBar />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Live events" value={String(overview.events.length)} />
        <MetricCard label="Booths monitored" value={String(exhibitorCount)} />
        <MetricCard
          label="Captured visits"
          value={String(analytics?.traffic.capturedVisits ?? 0)}
        />
        <MetricCard
          label="Conversion"
          value={`${analytics?.conversions.conversionRate ?? 0}%`}
        />
      </section>

      {analytics && analytics.traffic.capturedVisits > 0 && (
        <Card variant="elevated" className="border-l-4 border-l-status-info-solid">
          <p className="text-sm text-secondary">
            <strong className="text-primary">Insight:</strong>{" "}
            {analytics.traffic.capturedVisits} total visits across{" "}
            {overview.events.length} event{overview.events.length !== 1 ? "s" : ""}{" "}
            with a {analytics.conversions.conversionRate}% conversion rate.{" "}
            {analytics.traffic.returningVisitors > 0
              ? `${analytics.traffic.returningVisitors} returning attendee${analytics.traffic.returningVisitors !== 1 ? "s" : ""} show${analytics.traffic.returningVisitors === 1 ? "s" : ""} strong engagement.`
              : "Attendees are beginning to interact with booths."}
          </p>
        </Card>
      )}

      <section>
        <SectionHeader
          title="Quick links"
          description="Move straight into the workspaces your team uses every day."
        />
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <LinkTile
            tone="info"
            href="/demo/organizer/events"
            label="Events"
            description="Browse the showcase event portfolio."
          />
          <LinkTile
            tone="info"
            href="/demo/organizer/analytics"
            label="Analytics"
            description="Traffic, leads, and conversion live."
          />
          <LinkTile
            tone="warning"
            href="/demo/organizer/heatmaps"
            label="Heatmaps"
            description="See which booths attract attention."
          />
          <LinkTile
            tone="brand"
            href="/demo/organizer/ai-insights"
            label="AI Insights"
            description="AI-generated trends from attendee signals."
          />
          <LinkTile
            tone="success"
            href="/demo/organizer/reports"
            label="Reports"
            description="Executive-ready summary, ready to share."
          />
          <LinkTile
            tone="neutral"
            href="/demo"
            label="Switch perspective"
            description="Try the exhibitor or launch attendee."
          />
        </div>
      </section>

      <section>
        <SectionHeader
          title="Featured event"
          description={firstEvent?.name ?? "No events in showcase."}
        />
        {firstEvent ? (
          <Card className="mt-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-base font-semibold text-primary">
                  {firstEvent.name}
                </p>
                <p className="text-sm text-secondary">
                  {firstEvent.status} · {formatDate(firstEvent.startAt)} –{" "}
                  {formatDate(firstEvent.endAt)} · {firstEvent.timezone}
                </p>
                <dl className="mt-3 grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <dt className="text-xs text-muted">Booths</dt>
                    <dd className="font-semibold text-primary">
                      {firstEvent.exhibitors.length}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Visits</dt>
                    <dd className="font-semibold text-primary">
                      {analytics?.traffic.capturedVisits ?? 0}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Leads</dt>
                    <dd className="font-semibold text-primary">
                      {analytics?.conversions.leads ?? 0}
                    </dd>
                  </div>
                </dl>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href="/demo/organizer/analytics"
                  className="inline-flex h-9 items-center rounded-lg bg-status-info-solid px-3 text-xs font-semibold text-on-brand"
                >
                  Analytics
                </Link>
                <Link
                  href="/demo/organizer/reports"
                  className="inline-flex h-9 items-center rounded-lg border border-default bg-surface px-3 text-xs font-semibold text-primary"
                >
                  Report
                </Link>
              </div>
            </div>
          </Card>
        ) : null}
      </section>

      <section>
        <SectionHeader
          title="Portfolio"
          description={`${overview.events.length} events across the portfolio.`}
        />
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {overview.events.map((event) => (
            <Card key={event.id}>
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-primary">
                    {event.name}
                  </p>
                  <p className="text-xs text-muted">
                    {event.status} · {event.exhibitors.length} booths
                  </p>
                </div>
                <Link
                  href={`/demo/organizer/event/${event.slug}`}
                  className="text-xs font-medium text-status-info-text hover:underline"
                >
                  Open →
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

function LinkTile({
  label,
  description,
  href,
  tone,
}: {
  label: string;
  description: string;
  href: string;
  tone: "info" | "success" | "warning" | "brand" | "neutral";
}) {
  const tones: Record<typeof tone, string> = {
    info: "border-status-info-border bg-status-info-subtle text-status-info-text",
    success:
      "border-status-success-border bg-status-success-subtle text-status-success-text",
    warning:
      "border-status-warning-border bg-status-warning-subtle text-status-warning-text",
    brand: "border-brand/30 bg-brand-subtle text-brand",
    neutral: "border-default bg-surface text-primary",
  };
  return (
    <Link
      href={href}
      className="group flex items-start justify-between gap-3 rounded-xl border-2 border-default bg-surface p-4 transition-all hover:shadow-1 hover:ring-2 hover:ring-brand/20"
    >
      <div className="min-w-0">
        <span
          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${tones[tone]}`}
        >
          {label}
        </span>
        <p className="mt-2 text-sm text-secondary">{description}</p>
      </div>
      <svg
        className="size-4 text-muted transition-transform group-hover:translate-x-0.5"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden
      >
        <path d="M6 4l4 4-4 4" />
      </svg>
    </Link>
  );
}

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return value;
  }
}

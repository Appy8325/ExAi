import Link from "next/link";
import {
  SectionHeader,
  Card,
  StatusBadge,
} from "@concourse/ui";

import {
  getPublicDemoAnalytics,
  getPublicDemoOverview,
} from "@concourse/api-client";
import { getApiBaseUrl } from "@/lib/api/config";
import {
  DemoPageHeader,
  DemoUnavailable,
} from "@/components/demo/shell";
import { LiveDashboardMetrics, LiveEventStats, LiveMetricsBar, LiveOrganizerInsight, RecentActivityFeed } from "@/components/demo/live-metrics";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function OrganizerDashboardPage() {
  const apiBase = getApiBaseUrl();

  const overview = await getPublicDemoOverview({ baseUrl: apiBase }).catch(() => null);
  const analytics = overview?.events[0]
    ? await getPublicDemoAnalytics({ baseUrl: apiBase }, overview.events[0].id).catch(() => null)
    : null;

  if (!overview) return <DemoUnavailable />;

  const firstEvent = overview.events[0];
  return (
    <div className="space-y-8">
      <DemoPageHeader
        eyebrow="Organizer workspace"
        title={overview.organizers[0]?.name ?? "Organizer"}
        description="Event portfolio at a glance. Everything below is computed from seeded demo data."
        badge="Read-only"
      />

      <LiveMetricsBar />

      <LiveDashboardMetrics />

      <LiveOrganizerInsight />

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
                <p className="text-title-sm font-semibold text-primary">
                  {firstEvent.name}
                </p>
                <p className="text-body text-secondary">
                  {firstEvent.status} · {formatDate(firstEvent.startAt)} –{" "}
                  {formatDate(firstEvent.endAt)} · {firstEvent.timezone}
                </p>
                <LiveEventStats boothCount={firstEvent.exhibitors.length} />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href="/demo/organizer/analytics"
                  className="inline-flex h-9 items-center rounded-lg bg-status-info-solid px-3 text-caption font-semibold text-on-brand"
                >
                  Analytics
                </Link>
                <Link
                  href="/demo/organizer/reports"
                  className="inline-flex h-9 items-center rounded-lg border border-default bg-surface px-3 text-caption font-semibold text-primary"
                >
                  Report
                </Link>
              </div>
            </div>
          </Card>
        ) : null}
      </section>

      <RecentActivityFeed />

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
                  <p className="truncate text-body font-semibold text-primary">
                    {event.name}
                  </p>
                  <p className="text-caption text-muted">
                    {event.status} · {event.exhibitors.length} booths
                  </p>
                </div>
                <Link
                  href={`/demo/organizer/event/${event.slug}`}
                  className="text-caption font-medium text-status-info-text hover:underline"
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

function ExecutiveInsight({
  analytics,
  eventCount,
}: {
  analytics: {
    traffic: { capturedVisits: number; uniqueVisitors: number; returningVisitors: number };
    conversions: { leads: number; conversionRate: number };
    engagement: { repeatEngagementRate: number; averageInteractions: number };
    booths: Array<{ name: string; visits: number; leads: number; heat: number }>;
  };
  eventCount: number;
}) {
  const { traffic, conversions, engagement, booths } = analytics;
  if (traffic.capturedVisits === 0) {
    return (
      <Card variant="elevated" className="border-l-4 border-l-status-info-solid">
        <p className="text-body text-secondary">
          <strong className="text-primary">Live:</strong> Event is running. No booth visits recorded yet — start the demo simulation to generate traffic.
        </p>
      </Card>
    );
  }
  const topBooth = booths.reduce((best, b) => b.visits > (best?.visits ?? 0) ? b : best, booths[0]);
  const zeroLeadBooths = booths.filter(b => b.leads === 0 && b.visits > 0);
  const lines: string[] = [];
  if (conversions.conversionRate >= 15) {
    lines.push(`${conversions.conversionRate}% conversion rate is strong — ${conversions.leads} leads captured from ${traffic.capturedVisits} visits.`);
  } else if (conversions.conversionRate > 0) {
    lines.push(`${conversions.conversionRate}% conversion rate across ${traffic.capturedVisits} visits. ${traffic.uniqueVisitors} unique attendees.`);
  }
  if (topBooth && topBooth.heat >= 70) {
    lines.push(`"${topBooth.name}" is driving ${topBooth.heat}% of booth traffic${topBooth.leads > 0 ? ` with ${topBooth.leads} leads` : ""}.`);
  }
  if (engagement.repeatEngagementRate >= 20 && traffic.returningVisitors > 0) {
    lines.push(`${traffic.returningVisitors} returning visitors (${engagement.repeatEngagementRate}% repeat rate) signals strong booth appeal.`);
  }
  if (zeroLeadBooths.length > 0 && zeroLeadBooths.length >= booths.length * 0.4) {
    lines.push(`${zeroLeadBooths.length} booths have visits but zero leads — improve lead capture to expand the funnel.`);
  }
  if (traffic.capturedVisits >= 20 && booths.filter(b => b.leads > 0).length === 0) {
    lines.push("No leads captured despite 20+ visits — review form placement and booth engagement.");
  }
  if (lines.length === 0) {
    if (engagement.averageInteractions > 1) {
      lines.push(`${traffic.capturedVisits} visits recorded across ${booths.length} booths. Average ${engagement.averageInteractions} interactions per attendee.`);
    } else {
      lines.push(`${traffic.capturedVisits} visits captured across ${eventCount} event${eventCount !== 1 ? "s" : ""} with ${conversions.conversionRate}% conversion.`);
    }
  }
  return (
    <Card variant="elevated" className="border-l-4 border-l-status-info-solid">
      <p className="text-body text-secondary">
        <strong className="text-primary">Executive:</strong>{" "}
        {lines.join(" ")}
      </p>
    </Card>
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
  return (
    <Link
      href={href}
      className="group flex items-start justify-between gap-3 rounded-xl border-2 border-default bg-surface p-4 transition-all hover:shadow-1 hover:ring-2 hover:ring-brand/20"
    >
      <div className="min-w-0">
        <StatusBadge tone={tone === "brand" ? "brand" : tone} size="sm">{label}</StatusBadge>
        <p className="mt-2 text-body text-secondary">{description}</p>
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

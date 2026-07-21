import Link from "next/link";
import { Card, MetricCard } from "@concourse/ui";

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
  { label: "Booth Traffic", href: "/demo/organizer/heatmaps" },
  { label: "AI Insights", href: "/demo/organizer/ai-insights" },
  { label: "Reports", href: "/demo/organizer/reports" },
];

export default async function OrganizerAnalyticsPage() {
  const apiBase = getApiBaseUrl();
  const overview = await getPublicDemoOverview({ baseUrl: apiBase }).catch(() => null);
  if (!overview) return <DemoUnavailable />;

  const firstEvent = overview.events[0];
  const analytics = firstEvent
    ? await getPublicDemoAnalytics({ baseUrl: apiBase }, firstEvent.id).catch(
        () => null,
      )
    : null;

  return (
    <div className="space-y-8 px-6 py-8 sm:px-10 sm:py-10">
      <DemoMobileNav items={SIDEBAR} currentHref="/demo/organizer/analytics" />

      <DemoPageHeader
        eyebrow="Organizer workspace"
        title="Live analytics"
        description="Captured booth interactions and lead outcomes — read-only demo."
        badge="Live"
      />

      <LiveMetricsBar />

      {overview.events.length > 0 ? (
        <nav className="flex flex-wrap gap-2" aria-label="Events">
          {overview.events.map((event) => (
            <Link
              key={event.id}
              href={`/demo/organizer/event/${event.slug}`}
              className={`rounded-full border px-4 py-2 text-sm ${
                event.id === firstEvent?.id
                  ? "border-status-info-border bg-status-info-solid text-on-brand"
                  : "border-default bg-surface text-secondary hover:text-primary"
              }`}
            >
              {event.name}
            </Link>
          ))}
        </nav>
      ) : null}

      {!analytics ? (
        <Card>
          <p className="text-sm text-secondary">
            No event analytics are available yet.
          </p>
        </Card>
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              label="Captured visits"
              value={String(analytics.traffic.capturedVisits)}
            />
            <MetricCard
              label="Unique attendees"
              value={String(analytics.traffic.uniqueVisitors)}
            />
            <MetricCard
              label="Leads"
              value={String(analytics.conversions.leads)}
            />
            <MetricCard
              label="Conversion"
              value={`${analytics.conversions.conversionRate}%`}
            />
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-primary">
                    Pipeline distribution
                  </h2>
                  <p className="mt-1 text-sm text-secondary">
                    Where captured visits land on the funnel.
                  </p>
                </div>
                <Link
                  href="/demo/organizer/heatmaps"
                  className="text-xs font-medium text-status-info-text hover:underline"
                >
                  Heatmaps →
                </Link>
              </div>
              <div className="mt-5 space-y-4">
                <Bar
                  label="New"
                  value={analytics.traffic.capturedVisits}
                  max={Math.max(
                    analytics.traffic.capturedVisits,
                    analytics.traffic.uniqueVisitors,
                    analytics.conversions.leads || 1,
                  )}
                  color="bg-muted"
                />
                <Bar
                  label="Unique"
                  value={analytics.traffic.uniqueVisitors}
                  max={Math.max(
                    analytics.traffic.capturedVisits,
                    analytics.traffic.uniqueVisitors,
                    analytics.conversions.leads || 1,
                  )}
                  color="bg-status-info-solid"
                />
                <Bar
                  label="Leads"
                  value={analytics.conversions.leads}
                  max={Math.max(
                    analytics.traffic.capturedVisits,
                    analytics.traffic.uniqueVisitors,
                    analytics.conversions.leads || 1,
                  )}
                  color="bg-status-success-solid"
                />
              </div>
            </Card>

            <Card>
              <h2 className="text-lg font-semibold text-primary">Engagement</h2>
              <dl className="mt-4 space-y-3 text-sm">
                <Stat
                  label="Returning attendees"
                  value={String(analytics.traffic.returningVisitors)}
                />
                <Stat
                  label="Repeat engagement"
                  value={`${analytics.engagement.repeatEngagementRate}%`}
                />
                <Stat
                  label="Average interactions"
                  value={String(analytics.engagement.averageInteractions)}
                />
                <Stat
                  label="AI-analyzed leads"
                  value={String(analytics.engagement.analyzedLeads)}
                />
              </dl>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <h2 className="text-base font-semibold text-primary">
                Popular industries
              </h2>
              <div className="mt-4 space-y-3">
                {analytics.industries.map((item) => (
                  <Row key={item.name} label={item.name} value={item.count} />
                ))}
                {!analytics.industries.length && (
                  <p className="text-sm text-muted">Attendee industry data appears here once visitors share their profiles.</p>
                )}
              </div>
            </Card>
            <Card>
              <h2 className="text-base font-semibold text-primary">
                Popular topics
              </h2>
              <div className="mt-4 space-y-3">
                {analytics.topics.map((item) => (
                  <Row key={item.name} label={item.name} value={item.count} />
                ))}
                {!analytics.topics.length && (
                  <p className="text-sm text-muted">AI-analyzed conversation topics appear as attendees ask questions at booths.</p>
                )}
              </div>
            </Card>
          </div>

          <p className="text-xs text-muted">
            Updated {new Date(analytics.generatedAt).toLocaleString()} · Industry
            data includes only attendees who consented to profile sharing.
          </p>
        </>
      )}
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
      <div className="mb-1 flex justify-between text-sm">
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

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-secondary">{label}</span>
      <strong className="text-primary">{value}</strong>
    </div>
  );
}

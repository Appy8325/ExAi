import Link from "next/link";
import { Card, MetricCard } from "@concourse/ui";

import { loadOrganizerAnalytics, loadOrganizerOverview } from "@/lib/organizer";

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ eventId?: string }>;
}) {
  const overview = await loadOrganizerOverview();
  if (!overview) return <Unavailable>Analytics are unavailable.</Unavailable>;
  const requestedEventId = (await searchParams).eventId;
  const eventId = overview.events.some((event) => event.id === requestedEventId)
    ? requestedEventId
    : overview.events[0]?.id;
  const analytics = eventId ? await loadOrganizerAnalytics(eventId) : undefined;

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted">
          Organizer workspace
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-primary">
          Live analytics
        </h1>
        <p className="mt-1 text-sm text-secondary">
          Captured booth interactions and lead outcomes from production data.
        </p>
      </header>

      <nav className="flex flex-wrap gap-2" aria-label="Events">
        {overview.events.map((event) => (
          <Link
            key={event.id}
            href={`/org/analytics?eventId=${event.id}`}
            className={`rounded-full border px-4 py-2 text-sm ${event.id === eventId ? "border-brand bg-brand text-white" : "border-default bg-surface text-secondary"}`}
          >
            {event.name}
          </Link>
        ))}
      </nav>

      {!analytics ? (
        <Unavailable>No event analytics are available yet.</Unavailable>
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

          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <Card>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-primary">
                    Booth heatmap
                  </h2>
                  <p className="mt-1 text-sm text-secondary">
                    Relative share of captured interactions; hottest booth is
                    100%.
                  </p>
                </div>
                <Link
                  href={`/org/events/${analytics.event.id}/reports`}
                  className="text-sm font-medium text-brand"
                >
                  Executive report
                </Link>
              </div>
              <div className="mt-5 space-y-5">
                {analytics.booths.map((booth) => (
                  <div key={booth.id}>
                    <div className="mb-2 flex justify-between gap-4 text-sm">
                      <span className="font-medium text-primary">
                        {booth.name}
                        {booth.boothNumber ? ` · ${booth.boothNumber}` : ""}
                      </span>
                      <span className="text-secondary">
                        {booth.visits} visits · {booth.leads} leads
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-subtle">
                      <div
                        className="h-full rounded-full bg-brand"
                        style={{ width: `${booth.heat}%` }}
                      />
                    </div>
                  </div>
                ))}
                {!analytics.booths.length && (
                  <p className="text-sm text-muted">No published booths yet.</p>
                )}
              </div>
            </Card>

            <Card>
              <h2 className="text-lg font-semibold text-primary">Engagement</h2>
              <dl className="mt-4 space-y-4 text-sm">
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
            <Breakdown
              title="Popular industries"
              items={analytics.industries}
            />
            <Breakdown title="Popular topics" items={analytics.topics} />
          </div>
          <p className="text-xs text-muted">
            Updated {new Date(analytics.generatedAt).toLocaleString()} ·
            Industry data includes only attendees who consented to profile
            sharing.
          </p>
        </>
      )}
    </div>
  );
}

function Breakdown({
  title,
  items,
}: {
  title: string;
  items: Array<{ name: string; count: number }>;
}) {
  return (
    <Card>
      <h2 className="text-lg font-semibold text-primary">{title}</h2>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div key={item.name} className="flex justify-between text-sm">
            <span className="text-secondary">{item.name}</span>
            <strong className="text-primary">{item.count}</strong>
          </div>
        ))}
        {!items.length && (
          <p className="text-sm text-muted">No data captured yet.</p>
        )}
      </div>
    </Card>
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

function Unavailable({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl border border-default bg-surface p-6 text-secondary">
      {children}
    </p>
  );
}

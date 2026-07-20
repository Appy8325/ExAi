import Link from "next/link";
import { Card, KPICard, PageHeader, SectionHeader } from "@concourse/ui";

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
    <div className="space-y-section">
      <PageHeader
        title="Live analytics"
        description="Captured booth interactions and lead outcomes from production data."
      />

      <nav className="flex flex-wrap gap-2" aria-label="Events">
        {overview.events.map((event) => (
          <Link
            key={event.id}
            href={`/org/analytics?eventId=${event.id}`}
            className={`rounded-full border px-4 py-1.5 text-body-sm font-medium transition-all duration-[var(--mq-duration-fast)] ${
              event.id === eventId
                ? "border-brand bg-brand text-on-brand shadow-1"
                : "border-default bg-surface text-secondary hover:border-strong hover:text-primary"
            }`}
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
            <KPICard
              label="Captured visits"
              value={String(analytics.traffic.capturedVisits)}
              accent="brand"
            />
            <KPICard
              label="Unique attendees"
              value={String(analytics.traffic.uniqueVisitors)}
              accent="info"
            />
            <KPICard
              label="Leads"
              value={String(analytics.conversions.leads)}
              accent="success"
            />
            <KPICard
              label="Conversion"
              value={`${analytics.conversions.conversionRate}%`}
              accent="warning"
            />
          </section>

          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <Card variant="default">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <SectionHeader
                    title="Booth heatmap"
                    description="Relative share of captured interactions; hottest booth is 100%."
                  />
                </div>
                <Link
                  href={`/org/events/${analytics.event.id}/reports`}
                  className="inline-flex items-center gap-1 text-body-sm font-medium text-link hover:text-brand-hover transition-colors shrink-0"
                >
                  Executive report
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </Link>
              </div>
              <div className="mt-5 space-y-5">
                {analytics.booths.map((booth) => (
                  <div key={booth.id}>
                    <div className="mb-2 flex justify-between gap-4 text-body-sm">
                      <span className="font-medium text-primary">
                        {booth.name}
                        {booth.boothNumber ? ` · ${booth.boothNumber}` : ""}
                      </span>
                      <span className="text-secondary">
                        {booth.visits} visits · {booth.leads} leads
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-sunken">
                      <div
                        className="h-full rounded-full bg-brand transition-all duration-[var(--mq-duration-slow)]"
                        style={{ width: `${booth.heat}%` }}
                      />
                    </div>
                  </div>
                ))}
                {!analytics.booths.length && (
                  <p className="text-body-sm text-muted">No published booths yet.</p>
                )}
              </div>
            </Card>

            <Card variant="default">
              <SectionHeader title="Engagement" />
              <dl className="mt-4 space-y-4">
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
          <p className="text-caption text-muted">
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
    <Card variant="default">
      <SectionHeader title={title} />
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div key={item.name} className="flex justify-between text-body-sm">
            <span className="text-secondary">{item.name}</span>
            <strong className="text-primary">{item.count}</strong>
          </div>
        ))}
        {!items.length && (
          <p className="text-body-sm text-muted">No data captured yet.</p>
        )}
      </div>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 text-body-sm">
      <dt className="text-secondary">{label}</dt>
      <dd className="font-semibold tabular-nums text-primary">{value}</dd>
    </div>
  );
}

function Unavailable({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-default bg-surface p-6 text-body text-secondary">
      {children}
    </div>
  );
}

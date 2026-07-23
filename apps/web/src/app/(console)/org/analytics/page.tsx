import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, PageHeader, SectionHeader } from "@concourse/ui";

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
  if (requestedEventId && !eventId) notFound();
  const analytics = eventId ? await loadOrganizerAnalytics(eventId) : undefined;

  return (
    <div className="space-y-section">
      <PageHeader
        title="Live analytics"
        description="Booth interaction data and lead outcomes for your events."
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
          <p className="text-body-sm text-muted -mt-2">
            Showing funnel data for {analytics.event.name}
          </p>

          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <Card variant="default">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <SectionHeader
                    title="Pipeline distribution"
                    description="Where captured visits land on the funnel. Drop-off shows where attendees leave before converting."
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
              <div className="mt-5 space-y-4">
                <FunnelStage
                  label="New"
                  value={analytics.traffic.capturedVisits}
                  previousValue={null}
                  maxValue={analytics.traffic.capturedVisits}
                />
                <FunnelStage
                  label="Unique attendees"
                  value={analytics.traffic.uniqueVisitors}
                  previousValue={analytics.traffic.capturedVisits}
                  maxValue={analytics.traffic.capturedVisits}
                />
                <FunnelStage
                  label="Leads"
                  value={analytics.conversions.leads}
                  previousValue={analytics.traffic.uniqueVisitors}
                  maxValue={analytics.traffic.capturedVisits}
                />
              </div>
            </Card>

            <Card variant="default">
              <SectionHeader
                title="Booth engagement"
                description="Per-booth performance ranked by visitor traffic."
              />
              <ul className="mt-4 space-y-4" role="list">
                  {analytics.booths
                    .slice(0, 6)
                    .map((booth) => (
                      <li key={booth.id}>
                      <div className="mb-1.5 flex justify-between gap-4 text-body-sm">
                        <span className="font-medium text-primary truncate">
                          {booth.name}
                          {booth.boothNumber ? ` · ${booth.boothNumber}` : ""}
                        </span>
                        <span className="text-secondary shrink-0 tabular-nums">
                          {booth.visits} visits · {booth.leads} leads
                        </span>
                      </div>
<div className="h-2 overflow-hidden rounded-full bg-sunken">
                          <div
                            role="progressbar"
                            aria-valuenow={booth.heat}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-label={`${booth.name}: ${booth.heat}% heat`}
                            className="h-full rounded-full bg-brand transition-all duration-[var(--mq-duration-slow)]"
                            style={{ width: `${booth.heat}%` }}
                          />
                        </div>
                      </li>
                    ))}
                {!analytics.booths.length && (
                  <p className="text-body-sm text-muted">No published booths yet.</p>
                )}
              </ul>
            </Card>
          </div>

          <section className="grid gap-6 md:grid-cols-2">
            <Card variant="default">
              <SectionHeader title="Attendee industries" />
              <div className="mt-4 space-y-3">
                {analytics.industries.map((item) => (
                  <div key={item.name} className="flex items-center gap-3">
                    <span className="min-w-0 flex-1 truncate text-body-sm text-secondary">{item.name}</span>
                    <span className="text-body-sm font-semibold tabular-nums text-primary">{item.count}</span>
                  </div>
                ))}
                {!analytics.industries.length && (
                  <p className="text-body-sm text-muted">
                    Industry data appears once attendees share their profiles.
                  </p>
                )}
              </div>
              {analytics.industries.length > 0 && (
                <p className="mt-4 text-caption text-muted">
                  Includes only attendees who consented to profile sharing.
                </p>
              )}
            </Card>

            <Card variant="default">
              <SectionHeader title="Topics discussed" />
              <div className="mt-4 space-y-3">
                {analytics.topics.map((item) => (
                  <div key={item.name} className="flex items-center gap-3">
                    <span className="min-w-0 flex-1 truncate text-body-sm text-secondary">{item.name}</span>
                    <span className="text-body-sm font-semibold tabular-nums text-primary">{item.count}</span>
                  </div>
                ))}
                {!analytics.topics.length && (
                  <p className="text-body-sm text-muted">
                    AI-analyzed conversation topics appear as attendees engage at booths.
                  </p>
                )}
              </div>
            </Card>
          </section>

          <p className="text-caption text-muted">
            Updated {new Date(analytics.generatedAt).toLocaleString()}.
          </p>
        </>
      )}
    </div>
  );
}

function FunnelStage({
  label,
  value,
  previousValue,
  maxValue,
}: {
  label: string;
  value: number;
  previousValue: number | null;
  maxValue: number;
}) {
  const pct = Math.round((value / Math.max(1, maxValue)) * 100);
  const dropoffPct =
    previousValue !== null && previousValue > 0
      ? Math.round((1 - value / previousValue) * 100)
      : null;

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-body-sm text-secondary">{label}</span>
          {dropoffPct !== null && dropoffPct > 0 && (
            <span className="text-caption text-status-warning-text font-medium">
              ↓ {dropoffPct}% drop-off
            </span>
          )}
        </div>
        <span className="text-body font-semibold tabular-nums text-primary">{value}</span>
      </div>
<div className="h-3 overflow-hidden rounded-full bg-sunken">
                        <div
                          role="progressbar"
                          aria-valuenow={pct}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label={`${label}: ${value}`}
                          className="h-full rounded-full bg-brand transition-all duration-[var(--mq-duration-slow)]"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
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
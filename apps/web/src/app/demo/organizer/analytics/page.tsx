import Link from "next/link";
import { Card, MetricCard } from "@concourse/ui";

import {
  getPublicDemoAnalytics,
  getPublicDemoOverview,
} from "@concourse/api-client";
import { getApiBaseUrl } from "@/lib/api/config";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DemoOrganizerAnalyticsPage() {
  const apiBase = getApiBaseUrl();
  const overview = await getPublicDemoOverview({ baseUrl: apiBase }).catch(() => null);
  if (!overview) return <Unavailable />;

  const eventId = overview.events[0]?.id;
  const analytics = eventId
    ? await getPublicDemoAnalytics({ baseUrl: apiBase }, eventId).catch(() => null)
    : null;

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 sm:px-10">
      <Link href="/demo/organizer" className="inline-flex items-center gap-1 text-sm text-link hover:underline">
        <svg className="size-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10 12l-4-4 4-4" />
        </svg>
        Back to organizer
      </Link>

      <header className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500">
          Organizer workspace
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-primary sm:text-3xl">
          Live analytics
        </h1>
        <p className="mt-1 text-sm text-secondary">
          Captured booth interactions and lead outcomes &mdash; read-only demo.
        </p>
      </header>

      <nav className="mt-6 flex flex-wrap gap-2" aria-label="Events">
        {overview.events.map((event) => (
          <span
            key={event.id}
            className={`rounded-full border px-4 py-2 text-sm ${event.id === eventId ? "border-indigo-500 bg-indigo-500 text-white" : "border-default bg-surface text-secondary"}`}
          >
            {event.name}
          </span>
        ))}
      </nav>

      {!analytics ? (
        <p className="mt-6 rounded-xl border border-default bg-surface p-6 text-sm text-secondary">
          No event analytics are available yet.
        </p>
      ) : (
        <div className="mt-8 space-y-8">
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard label="Captured visits" value={String(analytics.traffic.capturedVisits)} />
            <MetricCard label="Unique attendees" value={String(analytics.traffic.uniqueVisitors)} />
            <MetricCard label="Leads" value={String(analytics.conversions.leads)} />
            <MetricCard label="Conversion" value={`${analytics.conversions.conversionRate}%`} />
          </section>

          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <Card>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-primary">Booth heatmap</h2>
                  <p className="mt-1 text-sm text-secondary">
                    Relative share of captured interactions; hottest booth is 100%.
                  </p>
                </div>
                <Link
                  href="/demo/organizer/reports"
                  className="text-sm font-medium text-indigo-600"
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
                        {booth.visits} visits &middot; {booth.leads} leads
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-subtle">
                      <div
                        className="h-full rounded-full bg-indigo-500"
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
                <Stat label="Returning attendees" value={String(analytics.traffic.returningVisitors)} />
                <Stat label="Repeat engagement" value={`${analytics.engagement.repeatEngagementRate}%`} />
                <Stat label="Average interactions" value={String(analytics.engagement.averageInteractions)} />
                <Stat label="AI-analyzed leads" value={String(analytics.engagement.analyzedLeads)} />
              </dl>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <h2 className="text-lg font-semibold text-primary">Popular industries</h2>
              <div className="mt-4 space-y-3">
                {analytics.industries.map((item) => (
                  <div key={item.name} className="flex justify-between text-sm">
                    <span className="text-secondary">{item.name}</span>
                    <strong className="text-primary">{item.count}</strong>
                  </div>
                ))}
                {!analytics.industries.length && (
                  <p className="text-sm text-muted">No data captured yet.</p>
                )}
              </div>
            </Card>
            <Card>
              <h2 className="text-lg font-semibold text-primary">Popular topics</h2>
              <div className="mt-4 space-y-3">
                {analytics.topics.map((item) => (
                  <div key={item.name} className="flex justify-between text-sm">
                    <span className="text-secondary">{item.name}</span>
                    <strong className="text-primary">{item.count}</strong>
                  </div>
                ))}
                {!analytics.topics.length && (
                  <p className="text-sm text-muted">No data captured yet.</p>
                )}
              </div>
            </Card>
          </div>

          <p className="text-xs text-muted">
            Updated {new Date(analytics.generatedAt).toLocaleString()} &middot;
            Industry data includes only attendees who consented to profile sharing.
          </p>
        </div>
      )}
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

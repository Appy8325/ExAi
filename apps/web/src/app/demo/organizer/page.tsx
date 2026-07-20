import Link from "next/link";
import { MetricCard } from "@concourse/ui";

import { getPublicDemoOverview } from "@concourse/api-client";
import { getApiBaseUrl } from "@/lib/api/config";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DemoOrganizerDashboardPage() {
  const apiBase = getApiBaseUrl();
  const overview = await getPublicDemoOverview({ baseUrl: apiBase }).catch(() => null);
  if (!overview) return <Unavailable />;

  const exhibitors = overview.events.flatMap((e) => e.exhibitors);
  const relationships = overview.relationships;

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 sm:px-10">
      <DemoBreadcrumb label="Organizer dashboard" />
      <header className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500">
          Organizer workspace
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-primary sm:text-3xl">
          {overview.organizers[0]?.name ?? "Organizer"}
        </h1>
        <p className="mt-1 text-sm text-secondary">
          Read-only overview of events, exhibitors, and relationships.
        </p>
      </header>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Events" value={String(overview.events.length)} />
        <MetricCard label="Exhibitors" value={String(exhibitors.length)} />
        <MetricCard label="Attendees" value={String(relationships.length)} />
        <MetricCard label="Relationships" value={String(relationships.length)} />
      </section>

      <nav className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/demo/organizer/analytics"
          className="inline-flex h-10 items-center rounded-lg bg-brand px-4 text-sm font-semibold text-on-brand"
        >
          View analytics
        </Link>
        <Link
          href="/demo/organizer/reports"
          className="inline-flex h-10 items-center rounded-lg border border-default bg-surface px-4 text-sm font-semibold text-primary"
        >
          View reports
        </Link>
      </nav>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-primary">Events</h2>
        <div className="mt-4 space-y-3">
          {overview.events.map((event) => {
            const boothCount = event.exhibitors.length;
            return (
              <Link
                key={event.id}
                href={`/demo/organizer/event/${event.slug}`}
                className="flex items-center justify-between rounded-xl border border-default bg-surface p-4 transition-colors hover:bg-sunken"
              >
                <div>
                  <p className="font-semibold text-primary">{event.name}</p>
                    <p className="text-sm text-secondary">
                      {event.status} &middot; {boothCount} exhibitor{boothCount !== 1 ? "s" : ""}
                  </p>
                </div>
                <span className="text-sm text-muted">{formatDate(event.startAt)}</span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function DemoBreadcrumb({ label }: { label: string }) {
  return (
    <Link href="/demo" className="inline-flex items-center gap-1 text-sm text-link hover:underline">
      <svg className="size-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10 12l-4-4 4-4" />
      </svg>
      Back to demo
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

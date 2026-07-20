import Link from "next/link";
import { notFound } from "next/navigation";
import { MetricCard } from "@concourse/ui";

import {
  getPublicDemoAnalytics,
  getPublicDemoOverview,
} from "@concourse/api-client";
import { getApiBaseUrl } from "@/lib/api/config";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DemoOrganizerEventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const apiBase = getApiBaseUrl();
  const overview = await getPublicDemoOverview({ baseUrl: apiBase }).catch(() => null);
  if (!overview) return <Unavailable />;

  const event = overview.events.find((e) => e.slug === slug);
  if (!event) notFound();

  const organizerName = overview.organizers.find((o) => o.id === event.organizerOrganizationId)?.name;
  const analytics = await getPublicDemoAnalytics({ baseUrl: apiBase }, event.id).catch(() => null);

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 sm:px-10">
      <Link href="/demo/organizer" className="inline-flex items-center gap-1 text-sm text-link hover:underline">
        <svg className="size-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10 12l-4-4 4-4" />
        </svg>
        Back to organizer
      </Link>

      <header className="mt-4">
        <p className="text-caption font-semibold uppercase tracking-[0.2em] text-status-info-text">
          Event overview
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-primary sm:text-3xl">{event.name}</h1>
        <p className="mt-1 text-sm text-secondary">
          {event.status} &middot; {formatDate(event.startAt)} &ndash; {formatDate(event.endAt)} &middot; {event.timezone}
        </p>
        {organizerName ? (
          <p className="mt-1 text-xs text-muted">Organized by {organizerName}</p>
        ) : null}
      </header>

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        <MetricCard label="Exhibitors" value={String(event.exhibitors.length)} />
        <MetricCard label="Visits" value={String(analytics?.traffic.capturedVisits ?? 0)} />
        <MetricCard label="Leads" value={String(analytics?.conversions.leads ?? 0)} />
      </section>

      <nav className="mt-6 flex flex-wrap gap-3">
        <Link
          href={`/demo/organizer/analytics`}
          className="inline-flex h-10 items-center rounded-lg bg-status-info-solid px-4 text-sm font-semibold text-on-brand"
        >
          View analytics
        </Link>
        <Link
          href={`/e/${event.slug}`}
          className="inline-flex h-10 items-center rounded-lg border border-default bg-surface px-4 text-sm font-semibold text-primary"
        >
          Public event page
        </Link>
      </nav>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-primary">
          Exhibitors ({event.exhibitors.length})
        </h2>
        {event.exhibitors.length > 0 ? (
          <div className="mt-4 space-y-3">
            {event.exhibitors.map((booth) => (
              <div
                key={booth.id}
                className="flex items-center justify-between rounded-xl border border-default bg-surface p-4"
              >
                <div>
                  <p className="font-semibold text-primary">{booth.companyName}</p>
                  <p className="text-sm text-muted">Booth {booth.boothNumber ?? "\u2014"} &middot; {booth.boothName}</p>
                </div>
                <div className="flex items-center gap-2">
                  {booth.publicQrToken ? (
                    <Link
                      href={`/visit/${booth.publicQrToken}`}
                      className="rounded-lg border border-brand/30 bg-brand-subtle px-3 py-1.5 text-sm font-semibold text-brand"
                    >
                      Public booth
                    </Link>
                  ) : null}
                  <Link
                    href={`/demo/exhibitor/${booth.id}`}
                    className="rounded-lg border border-default bg-surface px-3 py-1.5 text-sm font-medium text-primary"
                  >
                    Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-secondary">No exhibitors for this event.</p>
        )}
      </section>
    </div>
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

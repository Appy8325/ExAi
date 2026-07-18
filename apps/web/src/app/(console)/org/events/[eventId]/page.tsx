import Link from "next/link";
import { MetricCard, StatusBadge } from "@concourse/ui";

import { loadOrganizerOverview } from "@/lib/organizer";
import { PublishEventButton } from "../../organizer-forms";

export default async function EventOverviewPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const overview = await loadOrganizerOverview();
  const event = overview?.events.find((item) => item.id === eventId);
  if (!event || !overview)
    return (
      <p className="rounded-xl border border-default bg-surface p-6 text-secondary">
        Event unavailable.
      </p>
    );
  const isPublic = event.status === "published" || event.status === "live";
  return (
    <div className="space-y-6">
      <Link
        href="/org/events"
        className="text-sm text-secondary hover:text-primary"
      >
        ← Back to events
      </Link>
      <header>
        <h1 className="text-2xl font-semibold text-primary">{event.name}</h1>
        <div className="mt-2 flex items-center gap-3">
          <StatusBadge tone={isPublic ? "success" : "neutral"}>
            {event.status}
          </StatusBadge>
          <span className="text-sm text-secondary">
            {dateRange(event.startAt, event.endAt)} · {event.timezone}
          </span>
        </div>
      </header>
      <section className="grid gap-4 sm:grid-cols-3">
        <MetricCard label="Exhibitors" value={String(event.exhibitors)} />
        <MetricCard label="Attendees" value={String(event.attendees)} />
        <MetricCard label="Relationships" value={String(event.relationships)} />
      </section>
      <nav className="flex flex-wrap gap-3">
        <Link
          href={`/org/events/${eventId}/exhibitors`}
          className="inline-flex h-10 items-center rounded-md bg-brand px-4 text-sm font-medium text-on-brand"
        >
          View exhibitors
        </Link>
        <Link
          href={`/org/events/${eventId}/settings`}
          className="inline-flex h-10 items-center rounded-md border border-default px-4 text-sm font-medium text-primary"
        >
          Event settings
        </Link>
        <Link
          href={`/org/events/${eventId}/reports`}
          className="inline-flex h-10 items-center rounded-md border border-default px-4 text-sm font-medium text-primary"
        >
          View report
        </Link>
        {event.status === "draft" ? (
          <PublishEventButton
            organizationId={overview.organizationId}
            eventId={event.id}
          />
        ) : (
          <Link
            href={`/e/${event.slug}`}
            className="inline-flex h-10 items-center rounded-md border border-default px-4 text-sm font-medium text-primary"
          >
            Public event
          </Link>
        )}
      </nav>
    </div>
  );
}

function dateRange(start: string, end: string) {
  const format = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" });
  return `${format.format(new Date(start))} – ${format.format(new Date(end))}`;
}

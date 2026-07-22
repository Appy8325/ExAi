import Link from "next/link";
import { Breadcrumbs, EmptyState, KPICard, PageHeader } from "@concourse/ui";

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
    return <EmptyState title="Event data unavailable" description="Event details could not be loaded." />;
  const _isPublic = event.status === "published" || event.status === "live";
  return (
    <div className="space-y-section">
      <Breadcrumbs
        items={[
          { label: "Events", href: "/org/events" },
          { label: event.name },
        ]}
      />
      <div className="space-y-6">
        <PageHeader
          title={event.name}
          description={`${dateRange(event.startAt, event.endAt)} · ${event.timezone}`}
        />
        <section className="grid gap-4 sm:grid-cols-3">
          <KPICard label="Exhibitors" value={String(event.exhibitors)} accent="brand" />
          <KPICard label="Attendees" value={String(event.attendees)} accent="info" />
          <KPICard label="Relationships" value={String(event.relationships)} accent="ai" />
        </section>
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/org/events/${eventId}/exhibitors`}
            className="inline-flex h-10 items-center rounded-lg bg-brand px-4 text-body-sm font-medium text-on-brand shadow-1 hover:bg-brand-hover hover:shadow-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            View exhibitors
          </Link>
          <Link
            href={`/org/events/${eventId}/settings`}
            className="inline-flex h-10 items-center rounded-lg border border-strong bg-surface px-4 text-body-sm font-medium text-primary hover:bg-sunken transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Event settings
          </Link>
          <Link
            href={`/org/events/${eventId}/reports`}
            className="inline-flex h-10 items-center rounded-lg border border-strong bg-surface px-4 text-body-sm font-medium text-primary hover:bg-sunken transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
              className="inline-flex h-10 items-center rounded-lg border border-strong bg-surface px-4 text-body-sm font-medium text-primary hover:bg-sunken transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Public event
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function dateRange(start: string, end: string) {
  const format = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" });
  return `${format.format(new Date(start))} – ${format.format(new Date(end))}`;
}

import Link from "next/link";
import { Card, PageHeader, Badge } from "@concourse/ui";

import { loadOrganizerOverview } from "@/lib/organizer";
import { CreateEventForm } from "../organizer-forms";

export default async function EventsPage() {
  const overview = await loadOrganizerOverview();
  return (
    <div className="space-y-section">
      <PageHeader
        title="Events"
        description={`Events for ${overview?.organizationName ?? "your organization"}`}
      />
      {overview ? (
        <>
          <CreateEventForm organizationId={overview.organizationId} />
          {overview.events.length ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {overview.events.map((event) => (
                <Card key={event.id} variant="interactive" className="group space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <Link href={`/org/events/${event.id}`} className="text-title font-semibold text-primary hover:text-brand transition-colors">
                        {event.name}
                      </Link>
                      <p className="mt-0.5 text-body-sm capitalize text-muted">
                        {dateRange(event.startAt, event.endAt)}
                      </p>
                    </div>
                    <Badge variant={event.status === "published" || event.status === "live" ? "success" : "default"}>
                      {event.status}
                    </Badge>
                  </div>
                  <div className="flex gap-6 text-body-sm text-secondary">
                    <span>
                      <strong className="text-primary">{event.exhibitors}</strong> exhibitors
                    </span>
                    <span>
                      <strong className="text-primary">{event.attendees}</strong> attendees
                    </span>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Link
                      href={`/org/events/${event.id}`}
                      className="inline-flex h-9 items-center rounded-lg bg-brand px-4 text-body-sm font-medium text-on-brand shadow-1 hover:bg-brand-hover hover:shadow-2 transition-all"
                    >
                      Manage event
                    </Link>
                    <Link
                      href={`/org/events/${event.id}/reports`}
                      className="inline-flex h-9 items-center rounded-lg border border-strong bg-surface px-4 text-body-sm font-medium text-primary hover:bg-sunken transition-all"
                    >
                      Reports
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-default bg-surface p-6 text-secondary">
              No events yet. Create one above.
            </p>
          )}
        </>
      ) : (
        <p className="rounded-xl border border-default bg-surface p-6 text-secondary">
          Create an organizer organization first.
        </p>
      )}
    </div>
  );
}

function dateRange(start: string, end: string) {
  const format = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" });
  return `${format.format(new Date(start))} – ${format.format(new Date(end))}`;
}

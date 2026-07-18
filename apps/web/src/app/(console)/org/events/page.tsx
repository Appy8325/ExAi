import Link from "next/link";
import { Card } from "@concourse/ui";

import { loadOrganizerOverview } from "@/lib/organizer";
import { CreateEventForm } from "../organizer-forms";

export default async function EventsPage() {
  const overview = await loadOrganizerOverview();
  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted">
          Organizer workspace
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-primary">Events</h1>
        <p className="mt-1 text-sm text-secondary">
          Events for {overview?.organizationName ?? "your organization"}
        </p>
      </header>
      {overview ? (
        <>
          <CreateEventForm organizationId={overview.organizationId} />
          {overview.events.length ? (
            <div className="grid gap-6 sm:grid-cols-2">
              {overview.events.map((event) => (
                <Card key={event.id} className="space-y-4">
                  <div>
                    <h2 className="text-lg font-semibold text-primary">
                      {event.name}
                    </h2>
                    <p className="mt-1 text-sm capitalize text-muted">
                      {event.status} · {dateRange(event.startAt, event.endAt)}
                    </p>
                  </div>
                  <div className="flex gap-6 text-sm text-secondary">
                    <span>
                      <strong className="text-primary">
                        {event.exhibitors}
                      </strong>{" "}
                      exhibitors
                    </span>
                    <span>
                      <strong className="text-primary">
                        {event.attendees}
                      </strong>{" "}
                      attendees
                    </span>
                  </div>
                  <div className="flex gap-2 border-t border-default pt-4">
                    <Link
                      href={`/org/events/${event.id}`}
                      className="inline-flex h-9 items-center rounded-md bg-brand px-4 text-sm font-medium text-on-brand"
                    >
                      Manage event
                    </Link>
                    <Link
                      href={`/org/events/${event.id}/reports`}
                      className="inline-flex h-9 items-center rounded-md border border-default px-4 text-sm font-medium text-primary"
                    >
                      Reports
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-default bg-surface p-6 text-secondary">
              No events yet.
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

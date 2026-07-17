import Link from "next/link";
import { Card, Button } from "@concourse/ui";

const events = [
  {
    id: "evt-001",
    name: "TechExpo 2027",
    date: "May 12–14, 2027",
    venue: "San Jose Convention Center",
    status: "Published",
    exhibitors: 5,
    attendees: 200,
  },
  {
    id: "evt-002",
    name: "TechExpo 2026",
    date: "June 10–12, 2026",
    venue: "Moscone Center, San Francisco",
    status: "Completed",
    exhibitors: 4,
    attendees: 180,
  },
];

export default function EventsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted">Organizer workspace</p>
          <h1 className="text-2xl font-semibold text-primary mt-1">Events</h1>
          <p className="mt-1 text-sm text-secondary">Manage your events and exhibitors</p>
        </div>
        <Button>Create Event</Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            className="h-(--spacing-control-h) w-full rounded-md border border-default bg-surface pl-9 pr-3 text-sm text-primary outline-none placeholder:text-muted focus:border-strong"
            placeholder="Search events..."
          />
        </div>
        <select className="h-(--spacing-control-h) rounded-md border border-default bg-surface px-3 text-sm text-primary outline-none">
          <option value="">All status</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {events.map((event) => {
          const statusColor =
            event.status === "Published"
              ? "border-status-success-border bg-status-success-subtle text-status-success-text"
              : "border-status-info-border bg-status-info-subtle text-status-info-text";

          return (
            <Card key={event.id} className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-primary">{event.name}</h3>
                  <p className="mt-1 text-sm text-muted">{event.date}</p>
                </div>
                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusColor}`}>
                  {event.status}
                </span>
              </div>
              <p className="text-sm text-secondary">{event.venue}</p>
              <div className="flex gap-6 text-sm">
                <div>
                  <span className="font-semibold text-primary">{event.exhibitors}</span>
                  <span className="ml-1 text-muted">exhibitors</span>
                </div>
                <div>
                  <span className="font-semibold text-primary">{event.attendees}</span>
                  <span className="ml-1 text-muted">attendees</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 border-t border-default pt-4">
                <Link
                  href={`/org/events/${event.id}`}
                  className="inline-flex h-9 items-center rounded-md bg-brand px-4 text-sm font-medium text-on-brand transition-colors hover:bg-brand-hover"
                >
                  Manage Event
                </Link>
                <Link
                  href={`/org/events/${event.id}/exhibitors`}
                  className="inline-flex h-9 items-center rounded-md border border-default bg-surface px-4 text-sm font-medium text-primary transition-colors hover:bg-sunken"
                >
                  Exhibitors
                </Link>
                <Link
                  href="/org/analytics"
                  className="inline-flex h-9 items-center rounded-md border border-default bg-surface px-4 text-sm font-medium text-primary transition-colors hover:bg-sunken"
                >
                  Analytics
                </Link>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
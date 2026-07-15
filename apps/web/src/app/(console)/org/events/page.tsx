import Link from "next/link";
import { Button } from "@concourse/ui";

const events = [
  {
    id: "evt-001",
    name: "TechExpo 2027",
    date: "May 12–14, 2027",
    venue: "San Jose Convention Center",
    status: "Published",
    exhibitors: 5,
    attendees: 200,
    lastUpdated: "2 hours ago",
  },
  {
    id: "evt-002",
    name: "TechExpo 2026",
    date: "June 10–12, 2026",
    venue: "Moscone Center, San Francisco",
    status: "Completed",
    exhibitors: 4,
    attendees: 180,
    lastUpdated: "1 year ago",
  },
];

export default function EventsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-primary">Events</h1>
          <p className="mt-1 text-secondary">Manage your organization events and exhibitors</p>
        </div>
        <Button>Create Event</Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            className="h-(--spacing-control-h) w-full rounded-sm border border-strong bg-surface pl-9 pr-3 text-body text-primary outline-none placeholder:text-muted"
            placeholder="Search events..."
          />
        </div>
        <select className="h-(--spacing-control-h) rounded-sm border border-strong bg-surface px-3 text-body text-primary outline-none">
          <option value="">All status</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="live">Live</option>
          <option value="completed">Completed</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {events.length === 0 ? (
        <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-default p-6 text-center">
          <h2 className="text-title-sm font-semibold text-primary">No events yet</h2>
          <p className="mt-1 max-w-md text-body text-secondary">Create your first event to get started.</p>
          <div className="mt-4">
            <Button>Create Event</Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => {
            const statusColor =
              event.status === "Published" || event.status === "Live"
                ? "border-status-success-border bg-status-success-subtle text-status-success-text"
                : event.status === "Draft"
                  ? "border-status-warning-border bg-status-warning-subtle text-status-warning-text"
                  : event.status === "Completed"
                    ? "border-status-info-border bg-status-info-subtle text-status-info-text"
                    : "border-default bg-sunken text-secondary";

            return (
              <div key={event.id} className="rounded-xl border border-strong bg-surface p-5">
                <div className="flex items-start justify-between">
                  <h3 className="text-base font-semibold text-primary">{event.name}</h3>
                  <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${statusColor}`}>
                    {event.status}
                  </span>
                </div>
                <div className="mt-3 space-y-1.5 text-sm text-secondary">
                  <p>{event.date}</p>
                  <p>{event.venue}</p>
                  <p className="text-xs text-muted">Last updated {event.lastUpdated}</p>
                </div>
                <div className="mt-3 flex gap-4 text-sm">
                  <div>
                    <span className="font-semibold text-primary">{event.exhibitors}</span>
                    <span className="ml-1 text-muted">exhibitors</span>
                  </div>
                  <div>
                    <span className="font-semibold text-primary">{event.attendees}</span>
                    <span className="ml-1 text-muted">attendees</span>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 border-t border-default pt-4">
                  <Link
                    href={`/org/events/${event.id}`}
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm border border-strong bg-surface px-(--spacing-control-px) text-body font-medium text-primary transition-colors hover:bg-sunken h-(--spacing-control-h) text-body-sm"
                  >
                    Manage
                  </Link>
                  <Link
                    href={`/org/analytics`}
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm border border-strong bg-surface px-(--spacing-control-px) text-body font-medium text-primary transition-colors hover:bg-sunken h-(--spacing-control-h) text-body-sm"
                  >
                    Analytics
                  </Link>
                  <Link
                    href="#"
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm border border-strong bg-surface px-(--spacing-control-px) text-body font-medium text-primary transition-colors hover:bg-sunken h-(--spacing-control-h) text-body-sm"
                  >
                    Open
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

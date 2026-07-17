import Link from "next/link";
import { Card, MetricCard, StatusBadge } from "@concourse/ui";

export default async function EventOverviewPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;

  const activityItems = [
    { action: "Exhibitor Northstar Cloud completed booth setup", timestamp: "2 hours ago" },
    { action: "Exhibitor Vector Labs submitted collateral", timestamp: "5 hours ago" },
    { action: "12 new attendee QR scans recorded", timestamp: "1 day ago" },
  ];

  return (
    <div className="space-y-6">
      <Link href="/org/events" className="inline-flex items-center gap-1 text-sm text-secondary hover:text-primary transition-colors">
        <svg className="size-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10 4l-4 4 4 4" />
        </svg>
        Back to events
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-primary">TechExpo 2027</h1>
          <div className="mt-2 flex items-center gap-3">
            <StatusBadge tone="success">Published</StatusBadge>
            <span className="text-sm text-secondary">May 12–14, 2027 · San Jose Convention Center</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" className="inline-flex h-10 items-center gap-2 rounded-md border border-default bg-surface px-4 text-sm font-medium text-primary hover:bg-sunken transition-colors">
            Edit Event
          </button>
          <button type="button" className="inline-flex h-10 items-center gap-2 rounded-md border border-default bg-surface px-4 text-sm font-medium text-primary hover:bg-sunken transition-colors">
            Share
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Exhibitors" value={5} detail="5 active" />
        <MetricCard label="Attendees" value={200} detail="178 checked in" />
        <MetricCard label="Relationships" value={500} detail="Across 5 exhibitors" />
        <Card className="space-y-1">
          <p className="text-caption font-medium text-secondary">Event QR</p>
          <div className="mt-1 flex items-center gap-3">
            <span className="inline-flex items-center rounded-md border border-default bg-sunken px-2.5 py-1 text-xs text-secondary">
              Event directory active
            </span>
          </div>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Link
          href={`/org/events/${eventId}/exhibitors`}
          className="inline-flex h-10 items-center gap-2 rounded-md bg-brand px-4 text-sm font-medium text-on-brand hover:bg-brand-hover transition-colors"
        >
          View Exhibitors
        </Link>
        <Link
          href={`/org/events/${eventId}/documents`}
          className="inline-flex h-10 items-center gap-2 rounded-md border border-default bg-surface px-4 text-sm font-medium text-primary hover:bg-sunken transition-colors"
        >
          Documents
        </Link>
        <Link
          href={`/org/events/${eventId}/reports`}
          className="inline-flex h-10 items-center gap-2 rounded-md border border-default bg-surface px-4 text-sm font-medium text-primary hover:bg-sunken transition-colors"
        >
          Reports
        </Link>
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-primary">Recent Activity</h2>
        <div className="mt-4 space-y-4 border-l-2 border-default pl-5">
          {activityItems.map((item, i) => (
            <div key={i} className="relative">
              <span aria-hidden className="absolute -left-[1.65rem] top-1.5 flex size-3 items-center justify-center rounded-full border-2 border-surface bg-brand" />
              <p className="text-sm text-primary">{item.action}</p>
              <p className="mt-0.5 text-xs text-muted">{item.timestamp}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
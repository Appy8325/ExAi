import Link from "next/link";
import { Card, MetricCard, StatusBadge, EmptyState, Timeline, TimelineItem } from "@concourse/ui";

export default async function EventOverviewPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;

  const event = {
    name: "Tech Expo 2026",
    status: "published" as const,
    startDate: "Mar 15, 2026",
    endDate: "Mar 17, 2026",
    venue: "San Francisco Convention Center",
    exhibitorCount: 0,
    teamMembers: [{ initials: "P", name: "Priya", role: "Organizer" }],
  };

  const recentActivity: Array<{ action: string; timestamp: string }> = [];

  return (
    <div className="space-y-6">
      <div>
        <Link href="/org/events" className="text-sm text-secondary hover:text-primary">
          &larr; Back to events
        </Link>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-primary">{event.name}</h1>
          <div className="mt-2 flex items-center gap-3">
            <StatusBadge tone={event.status === "published" ? "success" : "neutral"}>
              {event.status}
            </StatusBadge>
            <span className="text-sm text-secondary">
              {event.startDate} &ndash; {event.endDate}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" className="inline-flex h-10 items-center justify-center gap-2 rounded-sm border border-strong bg-surface px-4 text-sm font-medium text-primary hover:bg-sunken">
            Edit Event
          </button>
          <button type="button" className="inline-flex h-10 items-center justify-center gap-2 rounded-sm border border-strong bg-surface px-4 text-sm font-medium text-primary hover:bg-sunken">
            Share Event
          </button>
          <button type="button" className="inline-flex h-10 items-center justify-center gap-2 rounded-sm border border-strong bg-surface px-4 text-sm font-medium text-primary hover:bg-sunken">
            Download QR
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Exhibitors" value={event.exhibitorCount} />
        <MetricCard label="Venue" value={event.venue} />
        <Card className="space-y-1">
          <p className="text-caption font-medium text-secondary">Team</p>
          <div className="flex items-center gap-2">
            {event.teamMembers.map((m) => (
              <div
                key={m.name}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-sunken text-xs font-medium text-primary"
                title={`${m.name} \u2014 ${m.role}`}
              >
                {m.initials}
              </div>
            ))}
          </div>
        </Card>
        <Card className="space-y-1">
          <p className="text-caption font-medium text-secondary">Event QR</p>
          <div className="flex items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded border border-strong bg-sunken text-xs text-muted">
              QR
            </div>
            <span className="text-xs text-secondary">Opens exhibitor directory</span>
          </div>
          <div className="flex gap-1.5">
            <button type="button" className="text-xs text-brand hover:underline">Preview</button>
            <span className="text-xs text-muted">·</span>
            <button type="button" className="text-xs text-brand hover:underline">Copy link</button>
          </div>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Link
          href={`/org/events/${eventId}/exhibitors`}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-sm bg-brand px-4 text-sm font-medium text-on-brand hover:bg-brand-hover"
        >
          View Exhibitors
        </Link>
        <button type="button" className="inline-flex h-10 items-center justify-center gap-2 rounded-sm border border-strong bg-surface px-4 text-sm font-medium text-primary hover:bg-sunken">
          Import Exhibitors
        </button>
        <button type="button" className="inline-flex h-10 items-center justify-center gap-2 rounded-sm border border-strong bg-surface px-4 text-sm font-medium text-primary hover:bg-sunken">
          Add Exhibitor
        </button>
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-primary">Recent Activity</h2>
        {recentActivity.length === 0 ? (
          <EmptyState
            title="No recent activity"
            description="Activity will appear here as exhibitors interact with the event."
          />
        ) : (
          <div className="mt-4">
            <Timeline>
              {recentActivity.map((item, i) => (
                <TimelineItem key={i} timestamp={item.timestamp}>
                  <p className="text-sm text-primary">{item.action}</p>
                </TimelineItem>
              ))}
            </Timeline>
          </div>
        )}
      </Card>
    </div>
  );
}

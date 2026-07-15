import Link from "next/link";
import { MetricCard, Timeline, TimelineItem } from "@concourse/ui";

const stats = [
  { label: "Total Events", value: "1" },
  { label: "Total Exhibitors", value: "5" },
  { label: "Total Attendees", value: "200" },
  { label: "Total Relationships", value: "500" },
  { label: "AI Insights Generated", value: "1,247" },
];

const recentActivity = [
  { action: "TechExpo 2027 published", timestamp: "2 hours ago" },
  { action: "Northstar Cloud completed booth setup", timestamp: "4 hours ago" },
  { action: "12 new attendee registrations", timestamp: "6 hours ago" },
  { action: "Vector Labs submitted booth materials", timestamp: "1 day ago" },
  { action: "AI insights generated for Signal Forge", timestamp: "2 days ago" },
];

const upcomingEvents = [
  { name: "TechExpo 2027", date: "May 12–14, 2027", venue: "San Jose Convention Center", status: "Published" },
];

const recentEvents = [
  { name: "TechExpo 2027", date: "May 12–14, 2027", exhibitors: 5, attendees: 200, status: "Published" },
  { name: "TechExpo 2026", date: "June 10–12, 2026", exhibitors: 4, attendees: 180, status: "Completed" },
];

export default function OrgDashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-primary">Dashboard</h1>
          <p className="mt-1 text-secondary">Overview of your organization</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {stats.map((stat) => (
          <MetricCard key={stat.label} label={stat.label} value={stat.value} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-strong bg-surface p-6">
          <h2 className="text-lg font-semibold text-primary">Recent Activity</h2>
          <div className="mt-4">
            <Timeline>
              {recentActivity.map((item, i) => (
                <TimelineItem key={i} timestamp={item.timestamp}>
                  <p className="text-sm text-primary">{item.action}</p>
                </TimelineItem>
              ))}
            </Timeline>
          </div>
        </section>

        <div className="space-y-6">
          <section className="rounded-xl border border-strong bg-surface p-6">
            <h2 className="text-lg font-semibold text-primary">Quick Actions</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-1">
              <Link
                href="/org/events"
                className="flex items-center gap-3 rounded-lg border border-strong bg-sunken p-4 text-sm font-medium text-primary transition-colors hover:bg-strong"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand text-xs font-bold text-on-brand">+</span>
                <span>Create Event</span>
              </Link>
              <Link
                href="/org/users"
                className="flex items-center gap-3 rounded-lg border border-strong bg-sunken p-4 text-sm font-medium text-primary transition-colors hover:bg-strong"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand text-xs font-bold text-on-brand">+</span>
                <span>Invite User</span>
              </Link>
              <Link
                href="/org/analytics"
                className="flex items-center gap-3 rounded-lg border border-strong bg-sunken p-4 text-sm font-medium text-primary transition-colors hover:bg-strong"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand text-xs font-bold text-on-brand">+</span>
                <span>Open Analytics</span>
              </Link>
            </div>
          </section>

          <section className="rounded-xl border border-strong bg-surface p-6">
            <h2 className="text-lg font-semibold text-primary">Upcoming Events</h2>
            <div className="mt-4 space-y-4">
              {upcomingEvents.map((event) => (
                <div key={event.name} className="flex items-center justify-between rounded-lg border border-default bg-sunken/50 p-4">
                  <div>
                    <p className="font-medium text-primary">{event.name}</p>
                    <p className="mt-0.5 text-sm text-muted">{event.date} &middot; {event.venue}</p>
                  </div>
                  <span className="inline-flex items-center rounded-full border border-status-success-border bg-status-success-subtle px-2 py-0.5 text-xs font-medium text-status-success-text">
                    {event.status}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <section className="rounded-xl border border-strong bg-surface p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-primary">Recent Events</h2>
          <Link href="/org/events" className="text-sm font-medium text-brand hover:underline">
            View all
          </Link>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-strong">
                <th className="px-4 py-3 font-medium text-secondary">Event Name</th>
                <th className="px-4 py-3 font-medium text-secondary">Date</th>
                <th className="px-4 py-3 font-medium text-secondary">Exhibitors</th>
                <th className="px-4 py-3 font-medium text-secondary">Attendees</th>
                <th className="px-4 py-3 font-medium text-secondary">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentEvents.map((event) => (
                <tr key={event.name} className="border-b border-strong last:border-b-0 hover:bg-sunken/50">
                  <td className="px-4 py-3 font-medium text-primary">{event.name}</td>
                  <td className="px-4 py-3 text-secondary">{event.date}</td>
                  <td className="px-4 py-3 text-secondary">{event.exhibitors}</td>
                  <td className="px-4 py-3 text-secondary">{event.attendees}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${
                      event.status === "Published"
                        ? "border-status-success-border bg-status-success-subtle text-status-success-text"
                        : "border-status-info-border bg-status-info-subtle text-status-info-text"
                    }`}>
                      {event.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

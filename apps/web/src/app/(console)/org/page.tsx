import Link from "next/link";
import { Card, MetricCard, Timeline, TimelineItem } from "@concourse/ui";

const stats = [
  { label: "Total Events", value: "2" },
  { label: "Active Exhibitors", value: "5" },
  { label: "Total Attendees", value: "200" },
  { label: "Relationships", value: "500" },
  { label: "AI Insights", value: "1,247" },
];

const recentActivity = [
  { action: "TechExpo 2027 published with 5 exhibitors", timestamp: "2 hours ago" },
  { action: "Northstar Cloud completed booth setup", timestamp: "4 hours ago" },
  { action: "12 new attendee registrations from QR scans", timestamp: "6 hours ago" },
  { action: "Vector Labs submitted booth collateral", timestamp: "1 day ago" },
  { action: "AI insights generated for Signal Forge", timestamp: "2 days ago" },
];

const events = [
  { name: "TechExpo 2027", date: "May 12–14, 2027", venue: "San Jose Convention Center", status: "Published", exhibitors: 5, attendees: 200 },
  { name: "TechExpo 2026", date: "June 10–12, 2026", venue: "Moscone Center, San Francisco", status: "Completed", exhibitors: 4, attendees: 180 },
];

export default function OrgDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted">Organizer workspace</p>
        <h1 className="text-2xl font-semibold text-primary mt-1">Dashboard</h1>
        <p className="mt-1 text-sm text-secondary">Overview of your organization and events</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {stats.map((stat) => (
          <MetricCard key={stat.label} label={stat.label} value={stat.value} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-default bg-surface p-6 shadow-1">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-primary">Recent Activity</h2>
            <span className="inline-flex size-1.5 rounded-full bg-status-success" />
          </div>
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
          <section className="rounded-xl border border-default bg-surface p-6 shadow-1">
            <h2 className="text-lg font-semibold text-primary">Quick Actions</h2>
            <div className="mt-4 grid gap-3">
              <Link
                href="/org/events"
                className="group flex items-center gap-3 rounded-lg border border-default bg-sunken/50 p-4 text-sm font-medium text-primary transition-all hover:bg-sunken hover:border-strong hover:shadow-1"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-xs font-bold text-on-brand group-hover:scale-105 transition-transform">
                  CA
                </span>
                <span>Create Event</span>
                <svg className="ml-auto size-4 text-muted group-hover:text-secondary" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 4l4 4-4 4" />
                </svg>
              </Link>
              <Link
                href="/org/users"
                className="group flex items-center gap-3 rounded-lg border border-default bg-sunken/50 p-4 text-sm font-medium text-primary transition-all hover:bg-sunken hover:border-strong hover:shadow-1"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-status-success-solid text-xs font-bold text-white group-hover:scale-105 transition-transform">
                  IU
                </span>
                <span>Invite Users</span>
                <svg className="ml-auto size-4 text-muted group-hover:text-secondary" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 4l4 4-4 4" />
                </svg>
              </Link>
              <Link
                href="/org/analytics"
                className="group flex items-center gap-3 rounded-lg border border-default bg-sunken/50 p-4 text-sm font-medium text-primary transition-all hover:bg-sunken hover:border-strong hover:shadow-1"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-status-info-solid text-xs font-bold text-white group-hover:scale-105 transition-transform">
                  AN
                </span>
                <span>Open Analytics</span>
                <svg className="ml-auto size-4 text-muted group-hover:text-secondary" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 4l4 4-4 4" />
                </svg>
              </Link>
            </div>
          </section>

          <Card>
            <h2 className="text-lg font-semibold text-primary">Upcoming Event</h2>
            <div className="mt-4 rounded-lg border border-default bg-sunken/30 p-4">
              <p className="font-medium text-primary">TechExpo 2027</p>
              <p className="mt-1 text-sm text-secondary">May 12–14, 2027 · San Jose Convention Center</p>
              <div className="mt-3 flex items-center gap-3 text-sm text-secondary">
                <span><span className="font-semibold text-primary">5</span> exhibitors</span>
                <span><span className="font-semibold text-primary">200</span> attendees</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <section className="rounded-xl border border-default bg-surface p-6 shadow-1">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-primary">Events</h2>
          <Link href="/org/events" className="text-sm font-medium text-brand hover:underline">
            View all
          </Link>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-default">
                <th className="px-4 py-3 font-medium text-secondary">Event</th>
                <th className="px-4 py-3 font-medium text-secondary">Date</th>
                <th className="px-4 py-3 font-medium text-secondary">Venue</th>
                <th className="px-4 py-3 font-medium text-secondary">Exhibitors</th>
                <th className="px-4 py-3 font-medium text-secondary">Attendees</th>
                <th className="px-4 py-3 font-medium text-secondary">Status</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.name} className="border-b border-default last:border-b-0 hover:bg-sunken/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-primary">{event.name}</td>
                  <td className="px-4 py-3 text-secondary">{event.date}</td>
                  <td className="px-4 py-3 text-secondary">{event.venue}</td>
                  <td className="px-4 py-3 text-secondary">{event.exhibitors}</td>
                  <td className="px-4 py-3 text-secondary">{event.attendees}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
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
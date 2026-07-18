import { Card, MetricCard } from "@concourse/ui";
import { loadOrganizerOverview } from "@/lib/organizer";

export default async function AnalyticsPage() {
  const overview = await loadOrganizerOverview();
  if (!overview) return <p className="rounded-xl border border-default bg-surface p-6 text-secondary">Analytics are unavailable.</p>;
  return <div className="space-y-8"><header><p className="text-sm font-medium uppercase tracking-[0.2em] text-muted">Organizer workspace</p><h1 className="mt-1 text-2xl font-semibold text-primary">Analytics</h1><p className="mt-1 text-sm text-secondary">Live engagement totals across your events</p></header><section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><MetricCard label="Events" value={String(overview.totals.events)} /><MetricCard label="Exhibitors" value={String(overview.totals.exhibitors)} /><MetricCard label="Attendees" value={String(overview.totals.attendees)} /><MetricCard label="Relationships" value={String(overview.totals.relationships)} /></section><Card><h2 className="text-lg font-semibold text-primary">Event performance</h2><div className="mt-4 divide-y divide-default">{overview.events.map((event) => <div key={event.id} className="grid grid-cols-4 gap-3 py-3 text-sm"><strong className="text-primary">{event.name}</strong><span className="text-secondary">{event.exhibitors} exhibitors</span><span className="text-secondary">{event.attendees} attendees</span><span className="text-secondary">{event.relationships} relationships</span></div>)}</div></Card></div>;
}

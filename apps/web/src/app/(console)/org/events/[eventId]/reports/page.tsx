import { MetricCard } from "@concourse/ui";

import { loadOrganizerOverview } from "@/lib/organizer";

export default async function EventReportsPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const event = (await loadOrganizerOverview())?.events.find((item) => item.id === eventId);
  if (!event) return <p className="rounded-xl border border-default bg-surface p-6 text-secondary">Event report unavailable.</p>;
  return <div className="space-y-6"><header><h1 className="text-xl font-semibold text-primary">{event.name} report</h1><p className="mt-1 text-sm text-secondary">Live engagement summary</p></header><section className="grid gap-4 sm:grid-cols-3"><MetricCard label="Exhibitors" value={String(event.exhibitors)} /><MetricCard label="Attendees" value={String(event.attendees)} /><MetricCard label="Relationships" value={String(event.relationships)} /></section></div>;
}

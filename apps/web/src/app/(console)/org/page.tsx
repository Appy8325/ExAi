import Link from "next/link";
import { MetricCard } from "@concourse/ui";

import { loadOrganizerOverview } from "@/lib/organizer";
import { CreateOrganizationForm } from "./organizer-forms";

export default async function OrgDashboardPage() {
  const overview = await loadOrganizerOverview();
  if (!overview) return <CreateOrganizationForm />;
  const stats = [
    { label: "Events", value: overview.totals.events },
    { label: "Active exhibitors", value: overview.totals.exhibitors },
    { label: "Attendees", value: overview.totals.attendees },
    { label: "Relationships", value: overview.totals.relationships },
  ];

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted">
          Organizer workspace
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-primary">
          {overview.organizationName}
        </h1>
        <p className="mt-1 text-sm text-secondary">
          Live event and relationship totals
        </p>
      </header>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <MetricCard
            key={stat.label}
            label={stat.label}
            value={String(stat.value)}
          />
        ))}
      </section>
      <section className="rounded-xl border border-default bg-surface p-6 shadow-1">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-primary">Events</h2>
          <Link
            href="/org/events"
            className="text-sm font-medium text-brand hover:underline"
          >
            View all
          </Link>
        </div>
        <div className="mt-4 space-y-3">
          {overview.events.map((event) => (
            <Link
              key={event.id}
              href={`/org/events/${event.id}`}
              className="flex items-center justify-between rounded-lg border border-default p-4 hover:bg-sunken"
            >
              <span>
                <strong className="block text-primary">{event.name}</strong>
                <span className="text-sm capitalize text-secondary">
                  {event.status} · {event.exhibitors} exhibitors
                </span>
              </span>
              <span className="text-sm text-muted">
                {event.relationships} relationships
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

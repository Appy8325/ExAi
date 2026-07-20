import Link from "next/link";
import { KPICard, PageHeader, SectionHeader } from "@concourse/ui";

import { loadOrganizerOverview } from "@/lib/organizer";
import { CreateOrganizationForm } from "./organizer-forms";

export default async function OrgDashboardPage() {
  const overview = await loadOrganizerOverview();
  if (!overview) return <CreateOrganizationForm />;
  const stats = [
    { label: "Events", value: String(overview.totals.events), accent: "brand" as const },
    { label: "Active exhibitors", value: String(overview.totals.exhibitors), accent: "info" as const },
    { label: "Attendees", value: String(overview.totals.attendees), accent: "success" as const },
    { label: "Relationships", value: String(overview.totals.relationships), accent: "ai" as const },
  ];

  return (
    <div className="space-y-section">
      <PageHeader
        title={overview.organizationName}
        description="Live event and relationship totals"
      />
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <KPICard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            accent={stat.accent}
          />
        ))}
      </section>
      <section>
        <SectionHeader
          title="Events"
          action={
            <Link
              href="/org/events"
              className="inline-flex items-center gap-1 text-body-sm font-medium text-link hover:text-brand-hover transition-colors"
            >
              View all
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </Link>
          }
        />
        <div className="mt-4 space-y-3">
          {overview.events.map((event) => (
            <Link
              key={event.id}
              href={`/org/events/${event.id}`}
              className="group flex items-center justify-between rounded-lg border border-default bg-surface p-4 shadow-1 transition-all duration-[var(--mq-duration-moderate)] hover:border-strong hover:shadow-card-hover"
            >
              <span>
                <strong className="block text-primary group-hover:text-brand transition-colors">{event.name}</strong>
                <span className="text-body-sm capitalize text-secondary">
                  {event.status} · {event.exhibitors} exhibitors
                </span>
              </span>
              <span className="text-body-sm text-muted">
                {event.relationships} relationships
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

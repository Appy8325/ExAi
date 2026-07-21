import Link from "next/link";
import { Card, EmptyState } from "@concourse/ui";

import {
  getPublicDemoAnalytics,
  getPublicDemoOverview,
} from "@concourse/api-client";
import { getApiBaseUrl } from "@/lib/api/config";
import {
  DemoMobileNav,
  DemoPageHeader,
  DemoUnavailable,
} from "@/components/demo/shell";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const SIDEBAR = [
  { label: "Dashboard", href: "/demo/organizer" },
  { label: "Events", href: "/demo/organizer/events" },
  { label: "Analytics", href: "/demo/organizer/analytics" },
  { label: "Booth Traffic", href: "/demo/organizer/heatmaps" },
  { label: "AI Insights", href: "/demo/organizer/ai-insights" },
  { label: "Reports", href: "/demo/organizer/reports" },
];

export default async function OrganizerEventsPage() {
  const apiBase = getApiBaseUrl();
  const overview = await getPublicDemoOverview({ baseUrl: apiBase }).catch(() => null);
  if (!overview) return <DemoUnavailable />;

  const events = await Promise.all(
    overview.events.map(async (event) => {
      const analytics = await getPublicDemoAnalytics(
        { baseUrl: apiBase },
        event.id,
      ).catch(() => null);
      return { event, analytics };
    }),
  );

  return (
    <div className="space-y-8 px-6 py-8 sm:px-10 sm:py-10">
      <DemoMobileNav items={SIDEBAR} currentHref="/demo/organizer/events" />

      <DemoPageHeader
        eyebrow="Organizer workspace"
        title="Events"
        description="All live and completed events in the showcase portfolio."
      />

      {events.length === 0 ? (
        <EmptyState
          title="No events yet"
          description="The seeded data set has no events configured."
        />
      ) : (
        <section className="space-y-6">
          {events.map(({ event, analytics }) => {
            const organizer = overview.organizers.find(
              (o) => o.id === event.organizerOrganizationId,
            )?.name;
            return (
              <Card key={event.id}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
                      {event.status}
                    </p>
                    <h2 className="mt-1 text-xl font-bold tracking-tight text-primary">
                      {event.name}
                    </h2>
                    <p className="mt-1 text-sm text-secondary">
                      {formatDate(event.startAt)} – {formatDate(event.endAt)} ·{" "}
                      {event.timezone}
                      {organizer ? ` · ${organizer}` : ""}
                    </p>
                  </div>
                  <Link
                    href={`/demo/organizer/event/${event.slug}`}
                    className="inline-flex h-9 items-center rounded-lg bg-status-info-solid px-3 text-xs font-semibold text-on-brand"
                  >
                    Open event
                  </Link>
                </div>

                <dl className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <Stat label="Booths" value={event.exhibitors.length} />
                  <Stat
                    label="Visits"
                    value={analytics?.traffic.capturedVisits ?? 0}
                  />
                  <Stat
                    label="Leads"
                    value={analytics?.conversions.leads ?? 0}
                  />
                  <Stat
                    label="Conversion"
                    value={`${analytics?.conversions.conversionRate ?? 0}%`}
                  />
                </dl>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href="/demo/organizer/analytics"
                    className="inline-flex h-8 items-center rounded-md border border-default bg-surface px-2.5 text-xs font-medium text-primary"
                  >
                    Analytics
                  </Link>
                  <Link
                    href="/demo/organizer/heatmaps"
                    className="inline-flex h-8 items-center rounded-md border border-default bg-surface px-2.5 text-xs font-medium text-primary"
                  >
                    Heatmap
                  </Link>
                  <Link
                    href={`/e/${event.slug}`}
                    className="inline-flex h-8 items-center rounded-md border border-default bg-surface px-2.5 text-xs font-medium text-primary"
                  >
                    Public event page
                  </Link>
                </div>
              </Card>
            );
          })}
        </section>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="text-lg font-bold tabular-nums text-primary">{value}</dd>
    </div>
  );
}

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return value;
  }
}

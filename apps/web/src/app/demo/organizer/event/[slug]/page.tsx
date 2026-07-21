import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, MetricCard } from "@concourse/ui";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(new Date(value));
}

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
  { label: "Heatmaps", href: "/demo/organizer/heatmaps" },
  { label: "AI Insights", href: "/demo/organizer/ai-insights" },
  { label: "Reports", href: "/demo/organizer/reports" },
];

export default async function OrganizerEventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const apiBase = getApiBaseUrl();
  const overview = await getPublicDemoOverview({ baseUrl: apiBase }).catch(
    () => null,
  );
  if (!overview) return <DemoUnavailable />;

  const event = overview.events.find((e) => e.slug === slug);
  if (!event) notFound();

  const organizerName = overview.organizers.find(
    (o) => o.id === event.organizerOrganizationId,
  )?.name;
  const analytics = await getPublicDemoAnalytics(
    { baseUrl: apiBase },
    event.id,
  ).catch(() => null);

  return (
    <div className="space-y-8 px-6 py-8 sm:px-10 sm:py-10">
      <DemoMobileNav items={SIDEBAR} currentHref="/demo/organizer/events" />

      <DemoPageHeader
        eyebrow="Event overview"
        title={event.name}
        description={`${event.status} · ${formatDate(event.startAt)} – ${formatDate(event.endAt)} · ${event.timezone}${
          organizerName ? ` · ${organizerName}` : ""
        }`}
      />

      <section className="grid gap-4 sm:grid-cols-3">
        <MetricCard label="Booths" value={String(event.exhibitors.length)} />
        <MetricCard
          label="Visits"
          value={String(analytics?.traffic.capturedVisits ?? 0)}
        />
        <MetricCard
          label="Leads"
          value={String(analytics?.conversions.leads ?? 0)}
        />
      </section>

      {analytics ? (
        <Card>
          <div className="flex items-center gap-2">
            <span className="inline-flex size-6 items-center justify-center rounded-full bg-status-ai-subtle text-[10px] font-semibold text-status-ai-text">
              AI
            </span>
            <h2 className="text-base font-semibold text-primary">
              Event insight
            </h2>
          </div>
          <p className="mt-3 whitespace-pre-line text-sm leading-7 text-secondary">
            {renderEventInsight(analytics, event.name)}
          </p>
        </Card>
      ) : null}

      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-primary">
              Move forward
            </h2>
            <p className="mt-1 text-sm text-secondary">
              Deep dive into the analytics & reporting tools.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/demo/organizer/analytics"
              className="inline-flex h-9 items-center rounded-lg bg-status-info-solid px-3 text-xs font-semibold text-on-brand"
            >
              Analytics
            </Link>
            <Link
              href="/demo/organizer/heatmaps"
              className="inline-flex h-9 items-center rounded-lg border border-default bg-surface px-3 text-xs font-semibold text-primary"
            >
              Heatmaps
            </Link>
            <Link
              href="/demo/organizer/ai-insights"
              className="inline-flex h-9 items-center rounded-lg border border-default bg-surface px-3 text-xs font-semibold text-primary"
            >
              AI Insights
            </Link>
            <Link
              href="/demo/organizer/reports"
              className="inline-flex h-9 items-center rounded-lg border border-default bg-surface px-3 text-xs font-semibold text-primary"
            >
              Report
            </Link>
            <Link
              href={`/e/${event.slug}`}
              className="inline-flex h-9 items-center rounded-lg border border-default bg-surface px-3 text-xs font-semibold text-primary"
            >
              Public event page
            </Link>
          </div>
        </div>
      </Card>

      <section>
        <h2 className="text-base font-semibold text-primary">
          Booths ({event.exhibitors.length})
        </h2>
        {event.exhibitors.length > 0 ? (
          <div className="mt-4 space-y-3">
            {event.exhibitors.map((booth) => (
              <div
                key={booth.id}
                className="flex items-center justify-between rounded-xl border border-default bg-surface p-4"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-primary">
                    {booth.companyName}
                  </p>
                  <p className="text-sm text-muted">
                    Booth {booth.boothNumber ?? "—"} · {booth.boothName}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {booth.publicQrToken ? (
                    <Link
                      href={`/visit/${booth.publicQrToken}`}
                      className="rounded-lg border border-brand/30 bg-brand-subtle px-3 py-1.5 text-xs font-semibold text-brand"
                    >
                      Public booth
                    </Link>
                  ) : null}
                  <Link
                    href={`/demo/exhibitor/${booth.id}`}
                    className="rounded-lg border border-default bg-surface px-3 py-1.5 text-xs font-medium text-primary"
                  >
                    Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-secondary">
            No exhibitors for this event.
          </p>
        )}
      </section>
    </div>
  );
}

function renderEventInsight(
  analytics: NonNullable<Awaited<ReturnType<typeof getPublicDemoAnalytics>>>,
  _eventName: string,
) {
  const visits = analytics.traffic.capturedVisits;
  const rate = analytics.engagement.repeatEngagementRate;
  return `${_eventName} has generated ${visits} total visits with a ${Math.round(rate * 100)}% repeat engagement rate. AI has analyzed ${analytics.engagement.analyzedLeads} leads to surface actionable intelligence for exhibitors.`;
}

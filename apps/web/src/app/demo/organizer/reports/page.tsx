import { Card, MetricCard } from "@concourse/ui";

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

export default async function OrganizerReportsPage() {
  const apiBase = getApiBaseUrl();
  const overview = await getPublicDemoOverview({ baseUrl: apiBase }).catch(() => null);
  if (!overview) return <DemoUnavailable />;

  const event = overview.events[0];
  const analytics = event?.id
    ? await getPublicDemoAnalytics({ baseUrl: apiBase }, event.id).catch(
        () => null,
      )
    : null;

  return (
    <div className="space-y-8 px-6 py-8 sm:px-10 sm:py-10">
      <DemoMobileNav items={SIDEBAR} currentHref="/demo/organizer/reports" />

      <DemoPageHeader
        eyebrow="Organizer workspace"
        title={event?.name ?? "Reports"}
        description="Live event metrics with executive reporting — read-only demo."
        badge="Report"
      />

      {!analytics ? (
        <Card>
          <p className="text-sm text-secondary">Event report unavailable.</p>
        </Card>
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              label="Captured visits"
              value={String(analytics.traffic.capturedVisits)}
            />
            <MetricCard
              label="Unique attendees"
              value={String(analytics.traffic.uniqueVisitors)}
            />
            <MetricCard
              label="Leads"
              value={String(analytics.conversions.leads)}
            />
            <MetricCard
              label="Conversion"
              value={`${analytics.conversions.conversionRate}%`}
            />
          </section>

          <Card>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-primary">
                  Executive AI report
                </h2>
                <p className="mt-1 text-sm text-secondary">
                  AI-generated summary based on aggregate event data.
                </p>
              </div>
            </div>
            <div className="mt-6 rounded-xl border border-dashed border-default bg-sunken p-8 text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-brand-subtle">
                <svg className="size-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <p className="mt-4 text-sm font-semibold text-primary">
                AI Report Generation — In Active Development
              </p>
              <p className="mt-2 text-sm text-secondary">
                Executive reports powered by real NVIDIA AI are available in the
                authenticated organizer workspace. Connect your event data to
                generate shareable AI insights.
              </p>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

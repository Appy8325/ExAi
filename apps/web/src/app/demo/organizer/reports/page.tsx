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
  { label: "Heatmaps", href: "/demo/organizer/heatmaps" },
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
        description="Deterministic event metrics with an AI-generated executive summary — read-only demo."
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
              <span className="inline-flex items-center gap-1 rounded-full border border-status-info-border bg-status-info-subtle px-3 py-1 text-xs font-semibold text-status-info-text">
                Ready to share
              </span>
            </div>
            <div className="mt-6 whitespace-pre-wrap text-sm leading-7 text-secondary">
              {renderReport(analytics, event?.name ?? "the event")}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

function renderReport(
  analytics: NonNullable<ReturnType<typeof getPublicDemoAnalytics> extends Promise<infer T> ? T : never>,
  eventName: string,
) {
  const { booths, traffic, conversions, engagement } = analytics;
  const topBooth = [...booths].sort((a, b) => b.visits - a.visits)[0];
  return [
    `Executive Summary for ${eventName}`,
    ``,
    `This report covers ${traffic.capturedVisits} total captured visits from ${traffic.uniqueVisitors} unique attendees, with ${conversions.leads} leads generated at a ${conversions.conversionRate}% conversion rate.`,
    ``,
    `Traffic & Engagement: ${traffic.returningVisitors} attendees returned for repeat visits (${engagement.repeatEngagementRate}% repeat engagement rate). On average, each visitor generated ${engagement.averageInteractions} interactions.`,
    ``,
    `Booth Performance: ${booths.length} booths participated.${
      topBooth
        ? ` The highest-traffic booth was "${topBooth.name}" with ${topBooth.visits} visits and ${topBooth.leads} leads.`
        : ""
    }`,
    ``,
    `Lead Quality: ${engagement.analyzedLeads} leads were analyzed by AI. The overall conversion rate of ${conversions.conversionRate}% indicates healthy attendee-to-lead progression.`,
    ``,
    `Recommendation: Continue optimizing booth content and knowledge sources to drive deeper attendee engagement.`,
  ].join("\n");
}

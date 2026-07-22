import { Card, MetricCard } from "@concourse/ui";

import {
  getPublicDemoAnalytics,
  getPublicDemoOverview,
} from "@concourse/api-client";
import { getApiBaseUrl } from "@/lib/api/config";
import {
  DemoPageHeader,
  DemoUnavailable,
} from "@/components/demo/shell";
import { computeOrganizerReport, DemoMobileNav } from "@/lib/demo-intelligence";

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
    ? await getPublicDemoAnalytics({ baseUrl: apiBase }, event.id).catch(() => null)
    : null;

  const report = analytics && event ? computeOrganizerReport(event.name, analytics) : null;

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
              {report?.generatedAt && (
                <span className="text-xs text-muted">
                  Generated {new Date(report.generatedAt).toLocaleString()}
                </span>
              )}
            </div>
            {report?.content ? (
              <pre className="mt-6 whitespace-pre-wrap text-sm leading-7 text-secondary font-mono">
                {report.content}
              </pre>
            ) : (
              <p className="mt-6 text-sm text-muted">
                Generating report from live analytics data...
              </p>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
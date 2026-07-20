import Link from "next/link";
import { Card, MetricCard } from "@concourse/ui";

import {
  getPublicDemoAnalytics,
  getPublicDemoOverview,
} from "@concourse/api-client";
import { getApiBaseUrl } from "@/lib/api/config";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DemoOrganizerReportsPage() {
  const apiBase = getApiBaseUrl();
  const overview = await getPublicDemoOverview({ baseUrl: apiBase }).catch(() => null);
  if (!overview) return <Unavailable />;

  const event = overview.events[0];
  const analytics = event?.id
    ? await getPublicDemoAnalytics({ baseUrl: apiBase }, event.id).catch(() => null)
    : null;

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 sm:px-10">
      <Link href="/demo/organizer" className="inline-flex items-center gap-1 text-sm text-link hover:underline">
        <svg className="size-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10 12l-4-4 4-4" />
        </svg>
        Back to organizer
      </Link>

      <header className="mt-4">
        <p className="text-caption font-semibold uppercase tracking-[0.2em] text-status-info-text">
          Executive reporting
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-primary sm:text-3xl">
          {event?.name ?? "Reports"}
        </h1>
        <p className="mt-1 text-sm text-secondary">
          Deterministic event metrics with an AI-generated executive summary &mdash; read-only demo.
        </p>
      </header>

      {!analytics ? (
        <p className="mt-6 rounded-xl border border-default bg-surface p-6 text-sm text-secondary">
          Event report unavailable.
        </p>
      ) : (
        <div className="mt-8 space-y-6">
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard label="Captured visits" value={String(analytics.traffic.capturedVisits)} />
            <MetricCard label="Unique attendees" value={String(analytics.traffic.uniqueVisitors)} />
            <MetricCard label="Leads" value={String(analytics.conversions.leads)} />
            <MetricCard label="Conversion" value={`${analytics.conversions.conversionRate}%`} />
          </section>

          <Card>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-primary">Executive AI report</h2>
                <p className="mt-1 text-sm text-secondary">
                  AI-generated summary based on aggregate event data.
                </p>
              </div>
            </div>
            <div className="mt-6 whitespace-pre-wrap text-sm leading-7 text-secondary">
              {renderReport(analytics, event?.name ?? "the event")}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function renderReport(analytics: NonNullable<ReturnType<typeof getPublicDemoAnalytics> extends Promise<infer T> ? T : never>, eventName: string) {
  const { booths, traffic, conversions, engagement } = analytics;
  const topBooth = [...booths].sort((a, b) => b.visits - a.visits)[0];
  return [
    `Executive Summary for ${eventName}`,
    ``,
    `This report covers ${traffic.capturedVisits} total captured visits from ${traffic.uniqueVisitors} unique attendees, with ${conversions.leads} leads generated at a ${conversions.conversionRate}% conversion rate.`,
    ``,
    `Traffic & Engagement: ${traffic.returningVisitors} attendees returned for repeat visits (${engagement.repeatEngagementRate}% repeat engagement rate). On average, each visitor generated ${engagement.averageInteractions} interactions.`,
    ``,
    `Booth Performance: ${booths.length} booths participated.${topBooth ? ` The highest-traffic booth was "${topBooth.name}" with ${topBooth.visits} visits and ${topBooth.leads} leads.` : ""}`,
    ``,
    `Lead Quality: ${engagement.analyzedLeads} leads were analyzed by AI. The overall conversion rate of ${conversions.conversionRate}% indicates healthy attendee-to-lead progression.`,
    ``,
    `Recommendation: Continue optimizing booth content and knowledge sources to drive deeper attendee engagement.`,
  ].join("\n");
}

function Unavailable() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12 sm:px-10">
      <Link href="/demo" className="text-sm text-link hover:underline">Back to demo</Link>
      <p className="mt-6 rounded-xl border border-status-danger-border bg-status-danger-subtle p-6 text-sm text-status-danger-text">
        Demo data is unavailable right now.
      </p>
    </div>
  );
}

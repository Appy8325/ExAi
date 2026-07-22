import { Badge, Card } from "@concourse/ui";

import {
  getPublicDemoAnalytics,
  getPublicDemoOverview,
} from "@concourse/api-client";
import { getApiBaseUrl } from "@/lib/api/config";
import {
  DemoPageHeader,
  DemoUnavailable,
} from "@/components/demo/shell";
import { computeOrganizerBriefing, DemoMobileNav } from "@/lib/demo-intelligence";

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

const PRIORITY_COLORS = {
  high: "border-l-status-danger-solid",
  medium: "border-l-status-warning-solid",
  low: "border-l-status-info-solid",
} as const;

const PRIORITY_LABEL_COLORS = {
  high: "text-status-danger-text",
  medium: "text-status-warning-text",
  low: "text-status-info-text",
} as const;

export default async function OrganizerAiInsightsPage() {
  const apiBase = getApiBaseUrl();
  const overview = await getPublicDemoOverview({ baseUrl: apiBase }).catch(() => null);
  if (!overview) return <DemoUnavailable />;

  const firstEvent = overview.events[0];
  const analytics = firstEvent
    ? await getPublicDemoAnalytics({ baseUrl: apiBase }, firstEvent.id).catch(() => null)
    : null;

  const briefing = analytics ? computeOrganizerBriefing(analytics) : null;

  return (
    <div className="space-y-8 px-6 py-8 sm:px-10 sm:py-10">
      <DemoMobileNav items={SIDEBAR} currentHref="/demo/organizer/ai-insights" />

      <DemoPageHeader
        eyebrow="Organizer workspace"
        title="AI insights"
        description="AI-generated trends synthesized from attendee signals and booth data."
        badge="AI"
      />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <InsightCard
          label="AI-analyzed leads"
          value={String(analytics?.engagement.analyzedLeads ?? 0)}
          accent="brand"
          note="Cohort scored by buying intent"
        />
        <InsightCard
          label="Returning attendees"
          value={String(analytics?.traffic.returningVisitors ?? 0)}
          accent="info"
          note="Repeat engagement momentum"
        />
        <InsightCard
          label="Avg interactions / visitor"
          value={String(analytics?.engagement.averageInteractions ?? 0)}
          accent="success"
          note="Depth of engagement"
        />
        <InsightCard
          label="Repeats"
          value={`${analytics?.engagement.repeatEngagementRate ?? 0}%`}
          accent="warning"
          note="Returning-visitor rate"
        />
      </section>

      {!briefing ? (
        <Card>
          <p className="text-body text-secondary">AI intelligence unavailable. Run the demo seed to populate data.</p>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <div className="flex items-center gap-2">
              <Badge variant="ai">AI</Badge>
              <h2 className="text-title-sm font-semibold text-primary">
                Executive briefing
              </h2>
            </div>
            <div className="mt-4 space-y-4">
              <div className="rounded-lg border border-default bg-sunken p-4">
                <p className="text-caption font-medium text-muted uppercase tracking-wide mb-1">Event Summary</p>
                <p className="text-body text-secondary">{briefing.summary}</p>
              </div>
              <div className="rounded-lg border border-default bg-sunken p-4">
                <p className="text-caption font-medium text-muted uppercase tracking-wide mb-1">Traffic Analysis</p>
                <p className="text-body text-secondary">{briefing.trafficAnalysis}</p>
              </div>
              <div className="rounded-lg border border-default bg-sunken p-4">
                <p className="text-caption font-medium text-muted uppercase tracking-wide mb-1">Conversion Performance</p>
                <p className="text-body text-secondary">{briefing.conversionAnalysis}</p>
              </div>
              <div className="rounded-lg border border-default bg-sunken p-4">
                <p className="text-caption font-medium text-muted uppercase tracking-wide mb-1">Booth Highlights</p>
                <p className="text-body text-secondary">{briefing.boothHighlights}</p>
              </div>
              <div className="rounded-lg border border-default bg-sunken p-4">
                <p className="text-caption font-medium text-muted uppercase tracking-wide mb-1">Returning Attendee Signals</p>
                <p className="text-body text-secondary">{briefing.returningAnalysis}</p>
              </div>
              <div className="rounded-lg border border-default bg-sunken p-4">
                <p className="text-caption font-medium text-muted uppercase tracking-wide mb-1">Industry & Topic Trends</p>
                <p className="text-body text-secondary">{briefing.industryInsight}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-2">
              <Badge variant="ai">AI</Badge>
              <h2 className="text-title-sm font-semibold text-primary">
                What to focus on
              </h2>
            </div>
            <ul className="mt-4 space-y-3">
              {briefing.recommendations.map((rec, i) => (
                <li key={i} className={`rounded-lg border border-default bg-sunken p-3 border-l-4 ${PRIORITY_COLORS[rec.priority]}`}>
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-body font-semibold text-primary">{rec.title}</p>
                    <span className={`shrink-0 text-[10px] font-semibold uppercase ${PRIORITY_LABEL_COLORS[rec.priority]}`}>
                      {rec.priority}
                    </span>
                  </div>
                  <p className="mt-1 text-caption text-secondary">{rec.finding}</p>
                  <p className="mt-0.5 text-[10px] text-muted font-mono">{rec.metric}</p>
                </li>
              ))}
              {briefing.recommendations.length === 0 && (
                <p className="text-body text-muted">Recommendations populate as booth interactions are recorded.</p>
              )}
            </ul>
          </Card>
        </div>
      )}
    </div>
  );
}

function InsightCard({
  label,
  value,
  note,
  accent,
}: {
  label: string;
  value: string;
  note: string;
  accent: "info" | "success" | "warning" | "brand";
}) {
  return (
    <div className="rounded-xl border border-default bg-surface p-4">
      <div className="flex items-center justify-between">
        <p className="text-caption font-medium text-secondary">{label}</p>
        <Badge variant={accent}>AI</Badge>
      </div>
      <p className="mt-1 text-xl font-semibold tabular-nums text-primary">{value}</p>
      <p className="mt-1 text-caption text-muted">{note}</p>
    </div>
  );
}
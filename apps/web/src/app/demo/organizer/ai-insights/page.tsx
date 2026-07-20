import { Card } from "@concourse/ui";

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

export default async function OrganizerAiInsightsPage() {
  const apiBase = getApiBaseUrl();
  const overview = await getPublicDemoOverview({ baseUrl: apiBase }).catch(() => null);
  if (!overview) return <DemoUnavailable />;

  const firstEvent = overview.events[0];
  const analytics = firstEvent
    ? await getPublicDemoAnalytics({ baseUrl: apiBase }, firstEvent.id).catch(
        () => null,
      )
    : null;

  const industries = analytics?.industries ?? [];
  const topics = analytics?.topics ?? [];
  const topIndustry = industries[0]?.name;
  const topTopic = topics[0]?.name;

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

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex size-6 items-center justify-center rounded-full bg-status-ai-subtle text-[10px] font-semibold text-status-ai-text">
              AI
            </span>
            <h2 className="text-base font-semibold text-primary">
              Executive summary
            </h2>
          </div>
          <p className="mt-4 whitespace-pre-line text-sm leading-7 text-secondary">
            {renderSummary(analytics, firstEvent?.name ?? "showcase event")}
          </p>
        </Card>

        <Card>
          <div className="flex items-center gap-2">
            <span className="inline-flex size-6 items-center justify-center rounded-full bg-status-ai-subtle text-[10px] font-semibold text-status-ai-text">
              AI
            </span>
            <h2 className="text-base font-semibold text-primary">
              What to focus on
            </h2>
          </div>
          <ul className="mt-4 space-y-3 text-sm">
            <Recommendation
              title="Double down on top topics"
              body={
                topTopic
                  ? `"${topTopic}" is the most discussed topic among attendees.` +
                    " Allocate stage time and booth coverage accordingly."
                  : "Once attendees ask questions, AI will surface the topics with the highest intent here."
              }
            />
            <Recommendation
              title="Target the strongest industry"
              body={
                topIndustry
                  ? `${topIndustry} attendees are most active. Engage these booths programmatically before close-of-show.`
                  : "Industry data populates as consented attendees arrive."
              }
            />
            <Recommendation
              title="Strengthen mid-funnel"
              body={`${analytics?.engagement.analyzedLeads ?? 0} leads were AI-scored. Send a follow-up sequence before the post-event window closes.`}
            />
          </ul>
        </Card>
      </div>
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
  const accents: Record<typeof accent, string> = {
    info: "bg-status-info-subtle text-status-info-text",
    success: "bg-status-success-subtle text-status-success-text",
    warning: "bg-status-warning-subtle text-status-warning-text",
    brand: "bg-brand-subtle text-brand",
  };
  return (
    <div className="rounded-xl border border-default bg-surface p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-secondary">{label}</p>
        <span
          className={`inline-flex size-5 items-center justify-center rounded-full text-[10px] font-semibold ${accents[accent]}`}
        >
          AI
        </span>
      </div>
      <p className="mt-1 text-xl font-semibold tabular-nums text-primary">{value}</p>
      <p className="mt-1 text-xs text-muted">{note}</p>
    </div>
  );
}

function Recommendation({ title, body }: { title: string; body: string }) {
  return (
    <li className="rounded-lg border border-default bg-sunken p-3">
      <p className="text-sm font-semibold text-primary">{title}</p>
      <p className="mt-1 text-xs text-secondary">{body}</p>
    </li>
  );
}

function renderSummary(
  analytics: NonNullable<ReturnType<typeof getPublicDemoAnalytics> extends Promise<infer T> ? T : never> | null,
  eventName: string,
) {
  if (!analytics) return "Insights will appear once the seed data is loaded.";
  const topBooth = [...analytics.booths].sort((a, b) => b.visits - a.visits)[0];
  const topIndustry = analytics.industries[0]?.name;
  const topTopic = analytics.topics[0]?.name;
  const lines = [
    `Executive AI summary — ${eventName}`,
    ``,
    `Across ${analytics.traffic.capturedVisits} captured visits from ${analytics.traffic.uniqueVisitors} unique attendees, ${analytics.conversions.leads} leads were generated at a ${analytics.conversions.conversionRate}% conversion rate.`,
    ``,
    topBooth
      ? `The booth "${topBooth.name}" led traffic with ${topBooth.visits} visits and ${topBooth.leads} leads.`
      : `Booth-level data is not yet captured.`,
    topTopic
      ? `The most active topic was "${topTopic}".`
      : `Topic patterns will surface as attendees engage with AI.`,
    topIndustry
      ? `${topIndustry} is the strongest industry cohort.`
      : `Industry cohorts will populate as attendees consent to share profile data.`,
    ``,
    `Recommendation: prioritize follow-ups within 48 hours while intent signals are still fresh.`,
  ];
  return lines.join("\n");
}

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
  { label: "Booth Traffic", href: "/demo/organizer/heatmaps" },
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
          <div className="mt-4 rounded-xl border border-dashed border-default bg-sunken p-6 text-center">
            <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-brand-subtle">
              <svg className="size-4 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <p className="mt-3 text-sm font-semibold text-primary">
              AI Insights — In Active Development
            </p>
            <p className="mt-2 text-xs text-secondary">
              Real NVIDIA AI-powered insights are generated in the authenticated
              organizer workspace. The metrics shown here reflect live simulation
              data available in the demo.
            </p>
          </div>
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

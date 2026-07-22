import type { ExhibitorDashboard } from "@concourse/api-client";
import { AiRecommendationCard } from "../_components/ai-insight-cards";

export function AiInsightsScreen({ dashboard, organizationId: _organizationId }: { dashboard: ExhibitorDashboard; organizationId?: string }) {
  const topOpportunity = dashboard.attention.find((item) => item.attendeeName)?.attendeeName ?? "No named attendee yet";
  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div>
        <p className="text-caption font-medium text-secondary">Exhibitor workspace</p>
        <h1 className="mt-1 text-title font-semibold text-primary">AI Insights</h1>
        <p className="mt-1 text-body-sm text-muted">Intelligence-driven recommendations and opportunities for your booth.</p>
      </div>

      <section className="rounded-xl border border-default bg-surface p-6">
        <h2 className="mb-4 text-body font-semibold text-primary">Intelligence Feed</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <MetricBox label="Profiles Enriched" value={String(dashboard.intelligenceFeed.profilesEnriched)} />
          <MetricBox label="Complete Profiles" value={String(dashboard.intelligenceFeed.completeProfiles)} />
          <MetricBox label="Enrichment Events" value={String(dashboard.intelligenceFeed.items.length)} />
        </div>
        {dashboard.intelligenceFeed.items.length > 0 && (
          <ul className="mt-4 space-y-2">
            {dashboard.intelligenceFeed.items.map((item) => (
              <li key={item.id} className="flex items-center justify-between rounded-lg bg-sunken px-4 py-3">
                <span className="text-body-sm text-primary">{item.label}</span>
                <time className="text-caption text-muted">{dateTime(item.at)}</time>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AiRecommendationCard
          title="Top Opportunities"
          value={topOpportunity}
          description={`${dashboard.attention.length} relationships currently need attention.`}
        />
        <AiRecommendationCard
          title="Buying Intent Signals"
          value={String(dashboard.pipeline.returning)}
          description="Returning booth visitors, derived from repeat interactions."
        />
        <AiRecommendationCard
          title="Recommended Follow-ups"
          value={String(dashboard.pipeline.needsFollowUp)}
          description="Active relationships without a follow-up note."
        />
        <AiRecommendationCard
          title="Profile Readiness"
          value={`${dashboard.performance.profileCompletion}%`}
          description="Average attendee profile completion across captured relationships."
        />
        <AiRecommendationCard
          title="Knowledge Updates"
          value={String(dashboard.intelligenceFeed.items.length)}
          description="Recent profile enrichment events available to your team."
        />
      </div>
    </div>
  );
}

function MetricBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-default bg-sunken p-4">
      <p className="text-caption text-muted">{label}</p>
      <p className="mt-1 text-title font-semibold tabular-nums text-primary">{value}</p>
    </div>
  );
}

function dateTime(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

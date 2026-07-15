import type { ExhibitorDashboard } from "@concourse/api-client";
import { AiPlaceholderCard } from "../_components/ai-insight-cards";

export function AiInsightsScreen({ dashboard, organizationId: _organizationId }: { dashboard: ExhibitorDashboard; organizationId?: string }) {
  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div>
        <p className="text-caption font-medium text-secondary">Exhibitor workspace</p>
        <h1 className="mt-1 text-title font-semibold text-primary">AI Insights</h1>
        <p className="mt-1 text-body-sm text-muted">Intelligence-driven recommendations and opportunities for your booth.</p>
      </div>

      <section className="rounded-xl border border-default bg-surface p-5">
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
        <AiPlaceholderCard
          title="Top Opportunities"
          description="High-value leads showing strong buying intent based on engagement patterns and profile completeness."
        />
        <AiPlaceholderCard
          title="Buying Intent Signals"
          description="Companies demonstrating purchase readiness through repeated visits and detailed profile submissions."
        />
        <AiPlaceholderCard
          title="Recommended Follow-ups"
          description="Prioritized list of attendees that need follow-up attention based on recency and engagement level."
        />
        <AiPlaceholderCard
          title="Suggested Introductions"
          description="Attendees who would benefit from being connected with your team members based on shared interests."
        />
        <AiPlaceholderCard
          title="High-Value Attendees"
          description="Premium profiles with complete data, relevant industry fit, and demonstrated engagement history."
        />
        <AiPlaceholderCard
          title="Knowledge Updates"
          description="Recent changes and enrichment events that have been applied to your relationship profiles."
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

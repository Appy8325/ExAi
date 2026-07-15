import { AiPlaceholderCard } from "../_components/ai-insight-cards";

export function AiInsightsFallback() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div>
        <p className="text-caption font-medium text-secondary">Exhibitor workspace</p>
        <h1 className="mt-1 text-title font-semibold text-primary">AI Insights</h1>
        <p className="mt-1 text-body-sm text-muted">Intelligence-driven recommendations and opportunities for your booth.</p>
      </div>

      <div className="rounded-xl border border-default bg-sunken p-4 text-body-sm text-secondary">
        Navigate from your exhibitor dashboard to see live AI insights. Placeholder insights shown below.
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AiPlaceholderCard title="Top Opportunities" description="High-value leads showing strong buying intent based on engagement patterns and profile completeness." />
        <AiPlaceholderCard title="Buying Intent Signals" description="Companies demonstrating purchase readiness through repeated visits and detailed profile submissions." />
        <AiPlaceholderCard title="Recommended Follow-ups" description="Prioritized list of attendees that need follow-up attention based on recency and engagement level." />
        <AiPlaceholderCard title="Suggested Introductions" description="Attendees who would benefit from being connected with your team members based on shared interests." />
        <AiPlaceholderCard title="High-Value Attendees" description="Premium profiles with complete data, relevant industry fit, and demonstrated engagement history." />
        <AiPlaceholderCard title="Knowledge Updates" description="Recent changes and enrichment events that have been applied to your relationship profiles." />
      </div>
    </div>
  );
}

import type { ExhibitorDashboard } from "@concourse/api-client";

export function AiInsightCards({ dashboard }: { dashboard: ExhibitorDashboard }) {
  const feed = dashboard.intelligenceFeed;
  const insights = [
    { title: "Profiles Enriched", value: String(feed.profilesEnriched), desc: "Attendees with recent data updates", tone: "info" as const },
    { title: "Complete Profiles", value: String(feed.completeProfiles), desc: "Profiles with full contact data", tone: "success" as const },
    { title: "Enrichment Events", value: String(feed.items.length), desc: "Profile updates this event", tone: "ai" as const },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {insights.map((i) => (
        <div key={i.title} className="rounded-xl border border-default bg-surface p-4">
          <div className="flex items-center justify-between">
            <p className="text-caption font-medium text-secondary">{i.title}</p>
            <AiDot />
          </div>
          <p className="mt-1 text-title font-semibold tabular-nums text-primary">{i.value}</p>
          <p className="mt-1 text-body-sm text-muted">{i.desc}</p>
        </div>
      ))}
    </div>
  );
}

export function AiRecommendationCard({ title, value, description }: { title: string; value: string; description: string }) {
  return (
    <div className="rounded-xl border border-default bg-surface p-5">
      <div className="flex items-center gap-2">
        <AiDot />
        <h3 className="text-body font-semibold text-primary">{title}</h3>
      </div>
      <p className="mt-3 text-title font-semibold tabular-nums text-primary">{value}</p>
      <p className="mt-2 text-body-sm text-muted">{description}</p>
    </div>
  );
}

function AiDot() {
  return <span className="inline-flex size-5 items-center justify-center rounded-full bg-status-ai-subtle text-[10px] text-status-ai-text">AI</span>;
}

import type { ExhibitorDashboard } from "@concourse/api-client";
import Link from "next/link";

export function AiInsightCards({ dashboard, organizationId }: { dashboard: ExhibitorDashboard; organizationId?: string }) {
  const s = dashboard.sinceLastVisited;
  const feed = dashboard.intelligenceFeed;
  const isFirstVisit = s.since === null;
  const hasSinceData = !isFirstVisit && (s.newRelationships > 0 || s.profilesEnriched > 0 || s.returningVisitors > 0 || s.notesAdded > 0);
  const hasFeedItems = feed.items.length > 0;
  const hasAnyData = hasSinceData || hasFeedItems;

  return (
    <div className="space-y-4">
      {hasSinceData && (
        <div className="rounded-lg border border-default bg-sunken p-4">
          <p className="text-caption font-semibold text-primary">Since Your Last Visit</p>
          <ul className="mt-3 space-y-1.5">
            {s.newRelationships > 0 && (
              <li className="flex items-center justify-between text-body-sm">
                <span className="text-secondary">New relationships</span>
                <span className="font-semibold text-status-success-text">+{s.newRelationships}</span>
              </li>
            )}
            {s.profilesEnriched > 0 && (
              <li className="flex items-center justify-between text-body-sm">
                <span className="text-secondary">Profiles enriched</span>
                <span className="font-semibold text-status-info-text">+{s.profilesEnriched}</span>
              </li>
            )}
            {s.returningVisitors > 0 && (
              <li className="flex items-center justify-between text-body-sm">
                <span className="text-secondary">Returning visitors</span>
                <span className="font-semibold text-status-ai-text">+{s.returningVisitors}</span>
              </li>
            )}
            {s.notesAdded > 0 && (
              <li className="flex items-center justify-between text-body-sm">
                <span className="text-secondary">Notes added</span>
                <span className="font-semibold text-status-warning-text">+{s.notesAdded}</span>
              </li>
            )}
          </ul>
        </div>
      )}

      {hasFeedItems && (
        <div>
          <p className="mb-2 text-caption font-semibold text-primary">Intelligence Feed</p>
          <ul className="space-y-2">
            {feed.items.slice(0, 5).map((item) => (
              <li key={item.id}>
                {organizationId && item.relationshipId ? (
                  <Link
                    href={`/exhibit/${organizationId}/relationships/${item.relationshipId}`}
                    className="flex items-center justify-between rounded-md border border-default bg-surface px-3 py-2 text-body-sm text-secondary transition-colors hover:bg-sunken"
                  >
                    <span className="truncate">{item.label}</span>
                    <span className="ml-2 shrink-0 text-caption text-muted">
                      {new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.at))}
                    </span>
                  </Link>
                ) : (
                  <div className="flex items-center justify-between rounded-md border border-default bg-surface px-3 py-2 text-body-sm text-secondary">
                    <span className="truncate">{item.label}</span>
                    <span className="ml-2 shrink-0 text-caption text-muted">
                      {new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.at))}
                    </span>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {!hasAnyData && (
        <div className="rounded-lg border border-dashed border-default bg-sunken p-4">
          <p className="text-caption font-semibold text-primary">How AI Insights Work</p>
          <p className="mt-1.5 text-body-sm text-secondary">
            As visitors scan your booth and you connect with them, AI surfaces the most important insights here.
          </p>
          <ul className="mt-3 space-y-1">
            <li className="flex items-start gap-2 text-caption text-muted">
              <span className="mt-0.5 text-status-success-text">●</span>
              <span>High-value leads identified automatically</span>
            </li>
            <li className="flex items-start gap-2 text-caption text-muted">
              <span className="mt-0.5 text-status-info-text">●</span>
              <span>Profile enrichment with company data</span>
            </li>
            <li className="flex items-start gap-2 text-caption text-muted">
              <span className="mt-0.5 text-status-ai-text">●</span>
              <span>Returning visitor alerts</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}

interface AiRecommendationCardProps {
  title: string;
  value: string;
  description: string;
}

export function AiRecommendationCard({ title, value, description }: AiRecommendationCardProps) {
  return (
    <div className="rounded-xl border border-default bg-surface p-4">
      <p className="text-caption font-medium text-secondary">{title}</p>
      <p className="mt-1 text-title font-semibold text-primary">{value}</p>
      <p className="mt-1 text-caption text-muted">{description}</p>
    </div>
  );
}
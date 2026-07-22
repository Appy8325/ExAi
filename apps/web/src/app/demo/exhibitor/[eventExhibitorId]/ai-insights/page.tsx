import { notFound } from "next/navigation";
import { Card } from "@concourse/ui";

import {
  getPublicDemoExhibitorDashboard,
  getPublicDemoOverview,
} from '@concourse/api-client';
import { computeExhibitorIntelligence } from '@/lib/demo-intelligence';

import { getApiBaseUrl } from "@/lib/api/config";
import {
  DemoPageHeader,
  DemoUnavailable,
} from "@/components/demo/shell";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const HEALTH_COLORS = {
  healthy: "text-status-success-text",
  watch: "text-status-warning-text",
  critical: "text-status-danger-text",
};

const HEALTH_BG = {
  healthy: "bg-status-success-subtle border-status-success-border",
  watch: "bg-status-warning-subtle border-status-warning-border",
  critical: "bg-status-danger-subtle border-status-danger-border",
};

export default async function ExhibitorAiInsightsPage({
  params,
}: {
  params: Promise<{ eventExhibitorId: string }>;
}) {
  const { eventExhibitorId } = await params;
  const apiBase = getApiBaseUrl();
  const [overview, dashboard] = await Promise.all([
    getPublicDemoOverview({ baseUrl: apiBase }).catch(() => null),
    getPublicDemoExhibitorDashboard({ baseUrl: apiBase }, eventExhibitorId).catch(() => null),
  ]);
  const intelligence = dashboard ? computeExhibitorIntelligence({
    ...dashboard,
    attention: dashboard.attention,
  }) : null;
  if (!overview || !dashboard) return <DemoUnavailable />;

  const booth = overview.events
    .flatMap((e) => e.exhibitors)
    .find((b) => b.id === eventExhibitorId);
  if (!booth) notFound();

  return (
    <div className="space-y-8">
      <DemoPageHeader
        eyebrow="Exhibitor workspace"
        title="AI insights"
        description="AI-powered attendee intelligence and recent activity — read-only demo."
        badge="AI"
      />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <p className="text-caption font-medium text-secondary">Profiles enriched</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-primary">
            {dashboard.intelligenceFeed.profilesEnriched}
          </p>
          <p className="mt-1 text-caption text-muted">With recent data updates</p>
        </Card>
        <Card>
          <p className="text-caption font-medium text-secondary">Complete profiles</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-primary">
            {dashboard.intelligenceFeed.completeProfiles}
          </p>
          <p className="mt-1 text-caption text-muted">Full contact data</p>
        </Card>
        <Card>
          <p className="text-caption font-medium text-secondary">Active leads</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-primary">
            {dashboard.pipeline.active}
          </p>
          <p className="mt-1 text-caption text-muted">In active conversations</p>
        </Card>
        <Card>
          <p className="text-caption font-medium text-secondary">Follow-up</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-primary">
            {dashboard.pipeline.needsFollowUp}
          </p>
          <p className="mt-1 text-caption text-muted">Flagged for outreach</p>
        </Card>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {intelligence ? (
          <Card className={`border-2 ${HEALTH_BG[intelligence.healthLabel]}`}>
            <div className="flex items-center gap-2">
              <span className="inline-flex size-6 items-center justify-center rounded-full bg-status-ai-subtle text-[10px] font-semibold text-status-ai-text">
                AI
              </span>
              <h2 className="text-title-sm font-semibold text-primary">
                Booth health score
              </h2>
            </div>
            <div className="mt-4 flex items-center gap-4">
              <div className="text-center">
                <p className={`text-4xl font-bold tabular-nums ${HEALTH_COLORS[intelligence.healthLabel]}`}>
                  {intelligence.healthScore}
                </p>
                <p className="text-caption text-muted mt-1">/ 100</p>
              </div>
              <div className="flex-1">
                <p className={`text-body font-semibold ${HEALTH_COLORS[intelligence.healthLabel]}`}>
                  {intelligence.healthLabel === "healthy" ? "Healthy" : intelligence.healthLabel === "watch" ? "Needs attention" : "Critical"}
                </p>
                <ul className="mt-2 space-y-1">
                  {intelligence.healthFindings.slice(0, 3).map((finding, i) => (
                    <li key={i} className="text-caption text-secondary flex items-start gap-1.5">
                      <span className="mt-0.5 size-1 rounded-full bg-muted shrink-0" />
                      {finding}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        ) : (
          <Card>
            <div className="flex items-center gap-2">
              <span className="inline-flex size-6 items-center justify-center rounded-full bg-status-ai-subtle text-[10px] font-semibold text-status-ai-text">
                AI
              </span>
              <h2 className="text-title-sm font-semibold text-primary">Booth health score</h2>
            </div>
            <p className="mt-4 text-body text-muted">Health scoring activates as relationships are captured.</p>
          </Card>
        )}

        <Card>
          <div className="flex items-center gap-2">
            <span className="inline-flex size-6 items-center justify-center rounded-full bg-status-ai-subtle text-[10px] font-semibold text-status-ai-text">
              AI
            </span>
            <h2 className="text-title-sm font-semibold text-primary">Since you last visited</h2>
          </div>
          <p className="mt-2 text-caption text-muted">
            {intelligence ? `Last checked ${intelligence.elapsed}` : "Loading..."}
          </p>
          <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Stat label="New relationships" value={String(dashboard.intelligenceFeed.sinceLastVisited.newRelationships)} />
            <Stat label="Profiles enriched" value={String(dashboard.intelligenceFeed.sinceLastVisited.profilesEnriched)} />
            <Stat label="Returning visitors" value={String(dashboard.intelligenceFeed.sinceLastVisited.returningVisitors)} />
            <Stat label="Notes added" value={String(dashboard.intelligenceFeed.sinceLastVisited.notesAdded)} />
          </dl>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <div className="flex items-center gap-2">
            <span className="inline-flex size-6 items-center justify-center rounded-full bg-status-ai-subtle text-[10px] font-semibold text-status-ai-text">
              AI
            </span>
            <h2 className="text-title-sm font-semibold text-primary">
              Buying intent signals
            </h2>
          </div>
          {intelligence && intelligence.buyingSignals.length > 0 ? (
            <ul className="mt-4 space-y-2">
              {intelligence.buyingSignals.map((signal, i) => (
                <li key={i} className="flex items-start gap-2 text-body text-secondary">
                  <span className="mt-1.5 size-1.5 rounded-full bg-status-success-text shrink-0" />
                  {signal}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-body text-muted">
              Buying signals emerge as attendees return to the booth or complete profiles with company data.
            </p>
          )}
          {intelligence && intelligence.topStrength && (
            <div className="mt-4 rounded-lg border border-default bg-sunken p-3">
              <p className="text-caption font-medium text-muted uppercase tracking-wide">Top strength</p>
              <p className="mt-1 text-body text-primary">{intelligence.topStrength}</p>
            </div>
          )}
        </Card>

        <Card>
          <div className="flex items-center gap-2">
            <span className="inline-flex size-6 items-center justify-center rounded-full bg-status-ai-subtle text-[10px] font-semibold text-status-ai-text">
              AI
            </span>
            <h2 className="text-title-sm font-semibold text-primary">
              Lead scoring
            </h2>
          </div>
          <p className="mt-3 text-body text-secondary">
            Relationships are scored on engagement depth, profile completeness, and returning behavior.
          </p>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="rounded-lg border border-default p-3 text-center">
              <p className="text-lg font-bold text-status-success-text">
                {dashboard.pipeline.active}
              </p>
              <p className="text-caption text-muted">Active</p>
            </div>
            <div className="rounded-lg border border-default p-3 text-center">
              <p className="text-lg font-bold text-status-warning-text">
                {dashboard.pipeline.needsFollowUp}
              </p>
              <p className="text-caption text-muted">Follow-up</p>
            </div>
            <div className="rounded-lg border border-default p-3 text-center">
              <p className="text-lg font-bold text-status-info-text">
                {dashboard.pipeline.returning}
              </p>
              <p className="text-caption text-muted">Returning</p>
            </div>
          </div>
          {intelligence && intelligence.topOpportunity && (
            <div className="mt-4 rounded-lg border border-default bg-sunken p-3">
              <p className="text-caption font-medium text-muted uppercase tracking-wide">Top opportunity</p>
              <p className="mt-1 text-body text-primary">{intelligence.topOpportunity}</p>
            </div>
          )}
        </Card>
      </div>

      {intelligence && intelligence.recommendedActions.length > 0 && (
        <Card>
          <div className="flex items-center gap-2">
            <span className="inline-flex size-6 items-center justify-center rounded-full bg-status-ai-subtle text-[10px] font-semibold text-status-ai-text">
              AI
            </span>
            <h2 className="text-title-sm font-semibold text-primary">Recommended actions</h2>
          </div>
          <ul className="mt-4 space-y-2">
            {intelligence.recommendedActions.map((action, i) => (
              <li key={i} className="flex items-start gap-2 text-body text-secondary">
                <span className="mt-1.5 size-1.5 rounded-full bg-brand shrink-0" />
                {action}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-caption text-muted">{label}</dt>
      <dd className="text-body-lg font-bold tabular-nums text-primary">{value}</dd>
    </div>
  );
}
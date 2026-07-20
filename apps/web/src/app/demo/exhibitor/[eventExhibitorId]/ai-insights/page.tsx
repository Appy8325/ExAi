import { notFound } from "next/navigation";
import { Card } from "@concourse/ui";

import {
  getPublicDemoExhibitorDashboard,
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

const sid = (id: string) => [
  { label: "Dashboard", href: `/demo/exhibitor/${id}` },
  { label: "Products", href: `/demo/exhibitor/${id}/products` },
  { label: "Visitors", href: `/demo/exhibitor/${id}/visitors` },
  { label: "Analytics", href: `/demo/exhibitor/${id}/analytics` },
  { label: "AI Insights", href: `/demo/exhibitor/${id}/ai-insights` },
  { label: "QR", href: `/demo/exhibitor/${id}/qr` },
  { label: "Booth Preview", href: `/demo/exhibitor/${id}/preview` },
];

export default async function ExhibitorAiInsightsPage({
  params,
}: {
  params: Promise<{ eventExhibitorId: string }>;
}) {
  const { eventExhibitorId } = await params;
  const apiBase = getApiBaseUrl();
  const [overview, dashboard] = await Promise.all([
    getPublicDemoOverview({ baseUrl: apiBase }).catch(() => null),
    getPublicDemoExhibitorDashboard({ baseUrl: apiBase }, eventExhibitorId).catch(
      () => null,
    ),
  ]);
  if (!overview || !dashboard) return <DemoUnavailable />;

  const booth = overview.events
    .flatMap((e) => e.exhibitors)
    .find((b) => b.id === eventExhibitorId);
  if (!booth) notFound();

  const since = dashboard.intelligenceFeed.sinceLastVisited;

  return (
    <div className="space-y-8 px-6 py-8 sm:px-10 sm:py-10">
      <DemoMobileNav
        items={sid(eventExhibitorId)}
        currentHref={`/demo/exhibitor/${eventExhibitorId}/ai-insights`}
      />

      <DemoPageHeader
        eyebrow="Exhibitor workspace"
        title="AI insights"
        description="AI-powered attendee intelligence and recent activity — read-only demo."
        badge="AI"
      />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <p className="text-xs font-medium text-secondary">Profiles enriched</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-primary">
            {dashboard.intelligenceFeed.profilesEnriched}
          </p>
          <p className="mt-1 text-xs text-muted">With recent data updates</p>
        </Card>
        <Card>
          <p className="text-xs font-medium text-secondary">Complete profiles</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-primary">
            {dashboard.intelligenceFeed.completeProfiles}
          </p>
          <p className="mt-1 text-xs text-muted">Full contact data</p>
        </Card>
        <Card>
          <p className="text-xs font-medium text-secondary">Active leads</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-primary">
            {dashboard.pipeline.active}
          </p>
          <p className="mt-1 text-xs text-muted">In active conversations</p>
        </Card>
        <Card>
          <p className="text-xs font-medium text-secondary">Follow-up</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-primary">
            {dashboard.pipeline.needsFollowUp}
          </p>
          <p className="mt-1 text-xs text-muted">Flagged for outreach</p>
        </Card>
      </section>

      <Card>
        <div className="flex items-center gap-2">
          <span className="inline-flex size-6 items-center justify-center rounded-full bg-status-ai-subtle text-[10px] font-semibold text-status-ai-text">
            AI
          </span>
          <h2 className="text-base font-semibold text-primary">
            Since you last visited
          </h2>
        </div>
        <p className="mt-2 text-xs text-muted">
          Last visited {formatDateTime(since.since)}
        </p>
        <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="New relationships" value={String(since.newRelationships)} />
          <Stat label="Profiles enriched" value={String(since.profilesEnriched)} />
          <Stat label="Returning visitors" value={String(since.returningVisitors)} />
          <Stat label="Notes added" value={String(since.notesAdded)} />
        </dl>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <div className="flex items-center gap-2">
            <span className="inline-flex size-6 items-center justify-center rounded-full bg-status-ai-subtle text-[10px] font-semibold text-status-ai-text">
              AI
            </span>
            <h2 className="text-base font-semibold text-primary">
              Attendee intelligence
            </h2>
          </div>
          <p className="mt-3 text-sm text-secondary">
            AI enriches attendee profiles with company data, social signals, and
            intent indicators.
          </p>
          <p className="mt-4 text-sm leading-7 text-secondary">
            Recommendation: prioritize attendees whose companies operate in
            your strongest segment to maximize conversion.
          </p>
        </Card>

        <Card>
          <div className="flex items-center gap-2">
            <span className="inline-flex size-6 items-center justify-center rounded-full bg-status-ai-subtle text-[10px] font-semibold text-status-ai-text">
              AI
            </span>
            <h2 className="text-base font-semibold text-primary">
              Lead scoring
            </h2>
          </div>
          <p className="mt-3 text-sm text-secondary">
            Each relationship is scored on buying intent, engagement level, and
            fit. Prioritize follow-ups with AI-ranked leads.
          </p>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="rounded-lg border border-default p-3 text-center">
              <p className="text-lg font-bold text-status-success-text">
                {dashboard.pipeline.active}
              </p>
              <p className="text-xs text-muted">Active</p>
            </div>
            <div className="rounded-lg border border-default p-3 text-center">
              <p className="text-lg font-bold text-status-warning-text">
                {dashboard.pipeline.needsFollowUp}
              </p>
              <p className="text-xs text-muted">Follow-up</p>
            </div>
            <div className="rounded-lg border border-default p-3 text-center">
              <p className="text-lg font-bold text-status-info-text">
                {dashboard.pipeline.returning}
              </p>
              <p className="text-xs text-muted">Returning</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="text-base font-bold tabular-nums text-primary">{value}</dd>
    </div>
  );
}

function formatDateTime(value: string) {
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

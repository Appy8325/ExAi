import { Card, EmptyState } from "@concourse/ui";

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

export default async function OrganizerHeatmapsPage() {
  const apiBase = getApiBaseUrl();
  const overview = await getPublicDemoOverview({ baseUrl: apiBase }).catch(() => null);
  if (!overview) return <DemoUnavailable />;

  const firstEvent = overview.events[0];
  const analytics = firstEvent
    ? await getPublicDemoAnalytics({ baseUrl: apiBase }, firstEvent.id).catch(
        () => null,
      )
    : null;

  return (
    <div className="space-y-8 px-6 py-8 sm:px-10 sm:py-10">
      <DemoMobileNav items={SIDEBAR} currentHref="/demo/organizer/heatmaps" />

      <DemoPageHeader
        eyebrow="Organizer workspace"
        title="Booth heatmaps"
        description="See which booths attract the most attention across the entire floor."
        badge="Visual"
      />

      {!analytics || analytics.booths.length === 0 ? (
        <EmptyState
          title="No booth data yet"
          description="Run the demo seed to populate booth interaction heatmaps."
        />
      ) : (
        <Card>
          <div className="mb-4">
            <h2 className="text-base font-semibold text-primary">
              Heatmap distribution
            </h2>
            <p className="text-sm text-secondary">
              Relative share of captured interactions across {analytics.booths.length}{" "}
              booths. Hottest booth normalized to 100%.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {analytics.booths.map((booth) => (
              <div
                key={booth.id}
                className="rounded-xl border border-default bg-surface p-4"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <p className="truncate text-sm font-semibold text-primary">
                    {booth.name}
                    {booth.boothNumber ? ` · ${booth.boothNumber}` : ""}
                  </p>
                  <span className="text-xs font-bold text-status-warning-text">
                    {booth.heat}%
                  </span>
                </div>
                <div className="mt-3 h-3 overflow-hidden rounded-full bg-subtle">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-status-info-solid via-status-warning-solid to-status-danger-solid"
                    style={{ width: `${booth.heat}%` }}
                  />
                </div>
                <dl className="mt-3 grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <dt className="text-muted">Visits</dt>
                    <dd className="font-semibold text-primary tabular-nums">
                      {booth.visits}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted">Leads</dt>
                    <dd className="font-semibold text-primary tabular-nums">
                      {booth.leads}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted">Convert</dt>
                    <dd className="font-semibold text-primary tabular-nums">
                      {booth.conversionRate}%
                    </dd>
                  </div>
                </dl>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

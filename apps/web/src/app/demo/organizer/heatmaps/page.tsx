import { Card, EmptyState } from "@concourse/ui";

import {
  getPublicDemoAnalytics,
  getPublicDemoOverview,
} from "@concourse/api-client";
import { getApiBaseUrl } from "@/lib/api/config";
import {
  DemoPageHeader,
  DemoUnavailable,
} from "@/components/demo/shell";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
    <div className="space-y-8">
      <DemoPageHeader
        eyebrow="Organizer workspace"
        title="Booth Traffic Ranking"
        description="Ranked list of booths by captured interactions — visits, leads, and conversion."
        badge="Ranking"
      />

      {!analytics || analytics.booths.length === 0 ? (
        <EmptyState
          title="No booth data yet"
          description="Run the demo seed to populate booth interaction heatmaps."
        />
      ) : (
        <>
          <Card>
            <div className="mb-4">
              <h2 className="text-title-sm font-semibold text-primary">
                Traffic breakdown
              </h2>
              <p className="text-body text-secondary">
                All {analytics.booths.length} booths ranked by heat score — a normalized index of visitor engagement.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {analytics.booths.map((booth) => (
                <div
                  key={booth.id}
                  className="rounded-xl border border-default bg-surface p-4"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate text-body font-semibold text-primary">
                      {booth.name}
                      {booth.boothNumber ? ` · ${booth.boothNumber}` : ""}
                    </p>
                    <span className="text-caption font-bold text-status-warning-text">
                      {booth.heat}%
                    </span>
                  </div>
                  <div className="mt-3 h-3 overflow-hidden rounded-full bg-subtle">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-status-info-solid via-status-warning-solid to-status-danger-solid"
                      style={{ width: `${booth.heat}%` }}
                    />
                  </div>
                  <dl className="mt-3 grid grid-cols-3 gap-2 text-caption">
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

          <Card>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-title-sm font-semibold text-primary">
                  Spatial floor map
                </h2>
                <p className="mt-1 text-body text-secondary">
                  Bird&rsquo;s-eye view of booth positions color-coded by traffic intensity.
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-status-info-border bg-status-info-subtle px-3 py-1 text-caption font-semibold text-status-info-text">
                Coming in Milestone 4
              </span>
            </div>
            <div className="mt-6 flex flex-col items-center rounded-xl border border-dashed border-default bg-sunken p-10 text-center">
              <svg
                className="size-16 text-muted opacity-40"
                viewBox="0 0 64 64"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden
              >
                <rect x="4" y="8" width="20" height="16" rx="2" />
                <rect x="28" y="8" width="14" height="10" rx="2" />
                <rect x="46" y="8" width="14" height="10" rx="2" />
                <rect x="4" y="28" width="14" height="12" rx="2" />
                <rect x="22" y="28" width="20" height="20" rx="2" />
                <rect x="46" y="22" width="14" height="26" rx="2" />
                <rect x="4" y="44" width="14" height="12" rx="2" />
                <rect x="22" y="52" width="20" height="8" rx="2" />
                <path d="M0 8h64M0 20h24M28 20h36M0 40h64M0 52h18M22 52h44" strokeDasharray="2 3" strokeWidth="0.8" opacity="0.4" />
              </svg>
              <p className="mt-4 text-body font-semibold text-primary">
                Spatial booth mapping
              </p>
              <p className="mt-1 text-caption text-secondary max-w-xs">
                Assign booths to floor positions and see visitor flow visualized as color gradients — red for high traffic, blue for low.
              </p>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

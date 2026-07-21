import Link from "next/link";
import { Card, EmptyState } from "@concourse/ui";

import { getPublicDemoOverview } from "@concourse/api-client";
import { getApiBaseUrl } from "@/lib/api/config";
import {
  DemoPageHeader,
  DemoTopBar,
  DemoUnavailable,
} from "@/components/demo/shell";
import { UnifiedBreadcrumbs, CommandPalette } from "@/components/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ExhibitorPickerPage() {
  const apiBase = getApiBaseUrl();
  const overview = await getPublicDemoOverview({ baseUrl: apiBase }).catch(
    () => null,
  );
  if (!overview) return <DemoUnavailable />;

  const orgs = overview.exhibitorOrganizations;

  return (
    <div className="min-h-screen bg-canvas">
      <DemoTopBar persona="exhibitor" />
      <div className="mx-auto max-w-7xl space-y-8 px-6 py-8 sm:px-10 sm:py-10">
        <div className="flex items-center justify-end gap-4 border-b border-default/60 pb-4">
          <UnifiedBreadcrumbs />
          <CommandPalette />
        </div>

        <DemoPageHeader
          eyebrow="Exhibitor workspace"
          title="Pick an exhibitor"
          description="Each exhibitor organization has its own booth dashboard, products, visitors, analytics, and QR credentials — all read-only."
        />

        {orgs.length === 0 ? (
          <EmptyState
            title="No exhibitors in showcase"
            description="Seed the database to populate exhibitor organizations."
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {orgs.map((org) => {
              const participation = org.events[0];
              return (
                <Card key={org.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
                        Exhibitor
                      </p>
                      <h2 className="mt-1 text-lg font-bold text-primary">
                        {org.name}
                      </h2>
                      <p className="mt-1 text-sm text-secondary">
                        {org.events.length} event
                        {org.events.length !== 1 ? "s" : ""}
                        {participation ? ` · /${participation.eventSlug}` : ""}
                      </p>
                    </div>
                    <Link
                      href={`/demo/exhibitor/${participation?.eventExhibitorId ?? ""}`}
                      className="shrink-0 inline-flex h-9 items-center rounded-lg bg-status-success-solid px-3 text-xs font-semibold text-on-brand"
                    >
                      Open booth →
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

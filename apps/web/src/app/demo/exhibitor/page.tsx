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
import { ExhibitorSearch } from "./exhibitor-search";

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
          <ExhibitorSearch orgs={orgs} />
        )}
      </div>
    </div>
  );
}

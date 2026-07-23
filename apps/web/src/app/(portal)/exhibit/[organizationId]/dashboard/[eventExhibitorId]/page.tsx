import { Suspense } from "react";
import dynamic from "next/dynamic";
import { getExhibitorDashboard } from "@concourse/api-client";
import { createClient } from "@/lib/supabase/server";
import { getApiBaseUrl } from "@/lib/api/config";
import { Skeleton } from "@concourse/ui";
import { loadExhibitorWorkspace } from "@/lib/exhibitor";

const DashboardScreen = dynamic(() => import("./dashboard-screen").then((m) => m.DashboardScreen), {
  loading: () => <DashboardLoading />,
});

export default function ExhibitorDashboardPage({ params }: { params: Promise<{ organizationId: string; eventExhibitorId: string }> }) {
  return <Suspense fallback={<DashboardLoading />}><Dashboard params={params} /></Suspense>;
}

async function Dashboard({ params }: { params: Promise<{ organizationId: string; eventExhibitorId: string }> }) {
  const { organizationId, eventExhibitorId } = await params;
  const { data: { session } } = await (await createClient()).auth.getSession();
  if (!session) return <Message title="Sign in required" detail="Sign in to view your exhibitor dashboard." />;
  const [dashboard, workspace] = await Promise.all([
    getExhibitorDashboard({ baseUrl: getApiBaseUrl(), accessToken: session.access_token, fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }) }, organizationId, eventExhibitorId),
    loadExhibitorWorkspace(organizationId, eventExhibitorId),
  ]);
  const boothInfo = workspace
    ? { companyName: workspace.organization.name, eventName: workspace.event.name, boothName: workspace.booth.boothName, boothNumber: workspace.booth.boothNumber }
    : null;
  return <DashboardScreen dashboard={dashboard} organizationId={organizationId} boothInfo={boothInfo} />;
}

function DashboardLoading() {
  return (
    <main aria-label="Loading exhibitor dashboard" className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6 animate-enter">
      <Skeleton className="h-28 w-full rounded-xl" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
      </div>
      <Skeleton className="h-72 w-full rounded-xl" />
    </main>
  );
}

function Message({ title, detail }: { title: string; detail: string }) {
  return <main className="mx-auto flex min-h-screen max-w-2xl items-center p-6"><section aria-live="polite" className="w-full rounded-xl border border-strong bg-surface p-6"><h1 className="text-xl font-semibold text-primary">{title}</h1><p className="mt-2 text-secondary">{detail}</p></section></main>;
}

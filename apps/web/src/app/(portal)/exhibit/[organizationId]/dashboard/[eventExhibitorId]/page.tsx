import { Suspense } from "react";
import { ApiError, getExhibitorDashboard } from "@concourse/api-client";
import { createClient } from "@/lib/supabase/server";
import { getApiBaseUrl } from "@/lib/api/config";
import { DashboardScreen } from "./dashboard-screen";

export default function ExhibitorDashboardPage({ params }: { params: Promise<{ organizationId: string; eventExhibitorId: string }> }) {
  return <Suspense fallback={<DashboardLoading />}><Dashboard params={params} /></Suspense>;
}

async function Dashboard({ params }: { params: Promise<{ organizationId: string; eventExhibitorId: string }> }) {
  const { organizationId, eventExhibitorId } = await params;
  const { data: { session } } = await (await createClient()).auth.getSession();
  if (!session) return <Message title="Sign in required" detail="Sign in to view your exhibitor dashboard." />;
  try {
    const dashboard = await getExhibitorDashboard({ baseUrl: getApiBaseUrl(), accessToken: session.access_token, fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }) }, organizationId, eventExhibitorId);
    return <DashboardScreen dashboard={dashboard} organizationId={organizationId} />;
  } catch (error) {
    if (error instanceof ApiError && [401, 403].includes(error.status)) return <Message title="Access denied" detail="This dashboard is unavailable for your current organization." />;
    if (error instanceof ApiError && error.status === 404) return <Message title="Exhibitor not found" detail="This exhibitor is unavailable." />;
    return <Message title="Unable to load dashboard" detail="Check your connection and try again." />;
  }
}

function DashboardLoading() { return <main aria-label="Loading exhibitor dashboard" className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6"><div className="h-28 animate-pulse rounded-xl bg-sunken" /><div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{Array.from({ length: 4 }, (_, i) => <div className="h-24 animate-pulse rounded-xl bg-sunken" key={i} />)}</div><div className="h-72 animate-pulse rounded-xl bg-sunken" /></main>; }
function Message({ title, detail }: { title: string; detail: string }) { return <main className="mx-auto flex min-h-screen max-w-2xl items-center p-6"><section aria-live="polite" className="w-full rounded-xl border border-strong bg-surface p-6"><h1 className="text-xl font-semibold text-primary">{title}</h1><p className="mt-2 text-secondary">{detail}</p></section></main>; }

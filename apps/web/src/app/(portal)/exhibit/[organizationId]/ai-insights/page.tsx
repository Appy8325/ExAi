import { Suspense } from "react";
import { getExhibitorDashboard } from "@concourse/api-client";
import { createClient } from "@/lib/supabase/server";
import { getApiBaseUrl } from "@/lib/api/config";
import { AiInsightsScreen } from "./ai-insights-screen";
import { AiInsightsFallback } from "./ai-insights-fallback";

export default function AiInsightsPage({ params, searchParams }: { params: Promise<{ organizationId: string }>; searchParams: Promise<{ eeId?: string }> }) {
  return <Suspense fallback={<InsightsLoading />}><Insights params={params} searchParams={searchParams} /></Suspense>;
}

async function Insights({ params, searchParams }: { params: Promise<{ organizationId: string }>; searchParams: Promise<{ eeId?: string }> }) {
  const { organizationId } = await params;
  const { eeId } = await searchParams;
  const { data: { session } } = await (await createClient()).auth.getSession();
  if (!session) return <Message title="Sign in required" detail="Sign in to view AI insights." />;
  if (!eeId) return <AiInsightsFallback />;
  try {
    const dashboard = await getExhibitorDashboard(
      { baseUrl: getApiBaseUrl(), accessToken: session.access_token, fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }) },
      organizationId,
      eeId
    );
    return <AiInsightsScreen dashboard={dashboard} organizationId={organizationId} />;
  } catch {
    return <AiInsightsFallback />;
  }
}

function InsightsLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div className="h-8 w-48 animate-pulse rounded bg-sunken" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => <div key={i} className="h-40 animate-pulse rounded-xl bg-sunken" />)}
      </div>
    </div>
  );
}

function Message({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="mx-auto flex min-h-screen max-w-2xl items-center p-6">
      <section className="w-full rounded-xl border border-default bg-surface p-6">
        <h1 className="text-title-sm font-semibold text-primary">{title}</h1>
        <p className="mt-2 text-body text-secondary">{detail}</p>
      </section>
    </div>
  );
}

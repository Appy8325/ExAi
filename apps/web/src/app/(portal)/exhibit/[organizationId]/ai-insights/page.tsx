import { Suspense } from "react";
import dynamic from "next/dynamic";
import { getExhibitorDashboard } from "@concourse/api-client";
import { createClient } from "@/lib/supabase/server";
import { getApiBaseUrl } from "@/lib/api/config";
import { AiInsightsFallback } from "./ai-insights-fallback";
import { Skeleton } from "@concourse/ui";

const AiInsightsScreen = dynamic(() => import("./ai-insights-screen").then((m) => m.AiInsightsScreen), {
  loading: () => <InsightsLoading />,
});

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
    <div className="mx-auto max-w-7xl space-y-6 p-6 animate-enter">
      <Skeleton className="h-8 w-48" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-40 w-full rounded-xl" />)}
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

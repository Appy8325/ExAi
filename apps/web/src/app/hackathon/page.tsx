import Link from "next/link";

import { getPublicShowcase } from "@concourse/api-client";
import { getApiBaseUrl } from "@/lib/api/config";
import { HackathonLandingClient } from "./landing-client";
import { Skeleton } from "@concourse/ui";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type LiveMetrics = {
  totalLiveBoothVisits: number;
  totalLiveLeadSubmissions: number;
  totalLiveAiConversations: number;
  totalLiveBrochureDownloads: number;
  totalLiveProductViews: number;
  totalLiveReturningVisitors: number;
  averageDwellSeconds: number;
  aiEngagementRate: number;
};

function LoadingSkeleton() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center gap-8 px-gutter py-16 sm:px-(--mq-space-gutter)">
      <div className="mx-auto w-full max-w-lg space-y-4">
        <Skeleton className="mx-auto h-10 w-48" />
        <Skeleton className="mx-auto h-6 w-full" />
        <Skeleton className="mx-auto h-6 w-3/4" />
      </div>
      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export default async function HackathonLandingPage() {
  const apiBase = getApiBaseUrl();
  const [exhibitors, liveRes] = await Promise.all([
    getPublicShowcase({ baseUrl: apiBase }).catch(() => null),
    fetch(`${apiBase}/v1/public/demo/live`).catch(() => null),
  ]);
  const count = exhibitors?.length ?? 0;
  let liveMetrics: LiveMetrics | null = null;
  if (liveRes?.ok) {
    try { liveMetrics = await liveRes.json(); } catch { /* ignore */ }
  }

  return (
    <main className="min-h-screen bg-canvas">
      <header className="sticky top-0 z-(--mq-z-sticky) border-b border-default/60 bg-canvas/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-gutter py-4 sm:px-(--mq-space-gutter)">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-sm font-bold text-on-brand shadow-1">
              E
            </span>
            <span className="text-base font-semibold text-primary">ExAi</span>
          </Link>
          <span className="rounded-full border border-brand/20 bg-brand-subtle px-3 py-1 text-xs font-semibold text-brand">
            TechExpo 2027
          </span>
        </div>
      </header>

      {!exhibitors ? <LoadingSkeleton /> : (
        <HackathonLandingClient exhibitors={exhibitors} count={count} liveMetrics={liveMetrics} />
      )}

      <footer className="border-t border-default bg-sunken py-6">
        <div className="mx-auto max-w-7xl px-gutter text-center text-xs text-muted sm:px-(--mq-space-gutter)">
          TechExpo 2027 · Powered by ExAi · No sign-up required
        </div>
      </footer>
    </main>
  );
}
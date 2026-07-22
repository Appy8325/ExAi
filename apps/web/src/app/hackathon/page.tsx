import Link from "next/link";

import { getPublicShowcase } from "@concourse/api-client";
import { getApiBaseUrl } from "@/lib/api/config";
import { HackathonLandingClient } from "./landing-client";
import { Skeleton } from "@concourse/ui";
import { GlobalNav } from "@/components/navigation/global-nav";

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
      <GlobalNav variant="compact" active="attendee" />
      <div className="border-b border-default/50 bg-brand-subtle/30">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2 sm:px-8">
          <span className="rounded-full border border-brand/20 bg-brand-subtle px-3 py-1 text-caption font-semibold text-brand">
            TechExpo 2027
          </span>
          <span className="flex items-center gap-1 text-caption text-secondary">
            <span className="size-1.5 rounded-full bg-status-success-solid animate-pulse" />
            Live event
          </span>
          <Link
            href="/hackathon/expo"
            className="ml-auto rounded-lg border border-default bg-surface px-2.5 py-1 text-caption font-medium text-secondary transition-colors hover:border-strong hover:text-primary"
          >
            Expo floor →
          </Link>
        </div>
      </div>

      {!exhibitors ? <LoadingSkeleton /> : (
        <HackathonLandingClient exhibitors={exhibitors} count={count} liveMetrics={liveMetrics} />
      )}

      <footer className="border-t border-default bg-sunken py-6">
        <div className="mx-auto max-w-7xl px-gutter text-center text-caption text-muted sm:px-(--mq-space-gutter)">
          TechExpo 2027 · Powered by ExAi · No sign-up required
        </div>
      </footer>
    </main>
  );
}
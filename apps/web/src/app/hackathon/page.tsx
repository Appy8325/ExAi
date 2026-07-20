import Link from "next/link";

import { getPublicShowcase } from "@concourse/api-client";
import { getApiBaseUrl } from "@/lib/api/config";
import { HackathonLandingClient } from "./landing-client";
import { Skeleton } from "@concourse/ui";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function LoadingSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 py-16">
      <div className="space-y-4 w-full max-w-lg mx-auto px-6">
        <Skeleton className="h-10 w-48 mx-auto" />
        <Skeleton className="h-6 w-full mx-auto" />
        <Skeleton className="h-6 w-3/4 mx-auto" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 w-full max-w-2xl px-6">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export default async function HackathonLandingPage() {
  const apiBase = getApiBaseUrl();
  const exhibitors = await getPublicShowcase({ baseUrl: apiBase }).catch(() => null);
  const count = exhibitors?.length ?? 0;

  return (
    <main className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 border-b border-default bg-surface/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
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
        <HackathonLandingClient exhibitors={exhibitors} count={count} />
      )}

      <footer className="border-t border-default bg-sunken py-6">
        <div className="mx-auto max-w-7xl px-6 text-center text-xs text-muted">
          TechExpo 2027 · Powered by ExAi · No sign-up required
        </div>
      </footer>
    </main>
  );
}
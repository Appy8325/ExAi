import Link from "next/link";

import { getPublicShowcase } from "@concourse/api-client";
import { getApiBaseUrl } from "@/lib/api/config";
import { HackathonLandingClient } from "./landing-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function LoadingSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="h-8 w-8 mx-auto rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
        <p className="mt-4 text-sm text-gray-500">Loading TechExpo 2027...</p>
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
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-900 text-sm font-bold text-white shadow-lg">
              E
            </span>
            <span className="text-base font-semibold text-gray-900">ExAi</span>
          </Link>
          <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
            TechExpo 2027
          </span>
        </div>
      </header>

      {!exhibitors ? <LoadingSkeleton /> : (
        <HackathonLandingClient exhibitors={exhibitors} count={count} />
      )}

      <footer className="border-t border-gray-200 bg-gray-50 py-6">
        <div className="mx-auto max-w-7xl px-6 text-center text-xs text-gray-500">
          TechExpo 2027 • Powered by ExAi • No sign-up required
        </div>
      </footer>
    </main>
  );
}
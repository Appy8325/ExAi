import Link from "next/link";

import { getPublicShowcase } from "@concourse/api-client";
import { getApiBaseUrl } from "@/lib/api/config";
import { HackathonLandingClient } from "./landing-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HackathonLandingPage() {
  const apiBase = getApiBaseUrl();
  const exhibitors = await getPublicShowcase({ baseUrl: apiBase }).catch(() => null);
  const count = exhibitors?.length ?? 0;
  const industries = exhibitors
    ? [...new Set(exhibitors.map((e) => e.industry))].sort()
    : [];

  return (
    <main className="min-h-screen bg-canvas text-primary">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[700px] bg-gradient-to-b from-brand/10 via-brand/5 to-transparent"
      />

      <header className="sticky top-0 z-40 border-b border-default/50 bg-canvas/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3 sm:px-10">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-sm font-bold text-on-brand shadow-1">
              E
            </span>
            <span className="text-base font-semibold tracking-tight">ExAi</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="rounded-full border border-brand/30 bg-brand-subtle px-3 py-1 text-xs font-semibold text-brand">
              TechExpo 2027
            </span>
            <Link
              href="/demo"
              className="rounded-lg border border-default bg-surface px-3 py-1.5 text-xs font-medium text-secondary transition-colors hover:bg-sunken hover:text-primary"
            >
              Demo
            </Link>
          </div>
        </div>
      </header>

      {!exhibitors ? (
        <section className="mx-auto mt-12 max-w-4xl rounded-2xl border border-status-danger-border bg-status-danger-subtle p-6 text-sm text-status-danger-text">
          The showcase endpoint is unavailable right now. Run{" "}
          <code className="rounded bg-surface px-1.5 py-0.5">pnpm db:seed</code>{" "}
          against a running Supabase project.
        </section>
      ) : (
        <HackathonLandingClient
          exhibitors={exhibitors}
          count={count}
          industries={industries}
        />
      )}

      <footer className="border-t border-default/50">
        <div className="mx-auto max-w-7xl px-6 py-8 sm:px-10">
          <div className="flex flex-col items-center gap-4 text-center text-xs text-muted sm:flex-row sm:justify-between">
            <span>TechExpo 2027 · Powered by ExAi</span>
            <span>No sign-up required. Everything is publicly accessible.</span>
          </div>
        </div>
      </footer>
    </main>
  );
}

import Link from "next/link";

import { getPublicShowcase } from "@concourse/api-client";
import { getApiBaseUrl } from "@/lib/api/config";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HackathonLandingPage() {
  const apiBase = getApiBaseUrl();
  const exhibitors = await getPublicShowcase({ baseUrl: apiBase }).catch(() => null);
  const count = exhibitors?.length ?? 0;

  return (
    <main className="min-h-screen bg-canvas text-primary">
      <div className="mx-auto max-w-4xl px-6 py-20 sm:px-10 sm:py-28">
        <div className="space-y-6 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand-subtle px-4 py-1.5 text-xs font-semibold text-brand">
            <span className="size-1.5 rounded-full bg-brand animate-pulse" />
            Hackathon Showcase
          </span>

          <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl">
            Experience{" "}
            <span className="bg-gradient-to-r from-brand to-violet-400 bg-clip-text text-transparent">
              ExAi
            </span>{" "}
            in action
          </h1>

          <p className="mx-auto max-w-2xl text-lg text-secondary leading-relaxed">
            ExAi is an AI-native trade show intelligence platform. Watch how
            exhibitors capture qualified leads, how AI surfaces buying intent,
            and how organizers see the full event in one place — all from
            a single QR scan.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-default bg-surface p-5 text-left shadow-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-subtle text-brand">
              <svg className="size-5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="10" height="10" rx="2" />
                <path d="M5 7h6M5 9h4" />
              </svg>
            </div>
            <h3 className="mt-3 text-sm font-semibold text-primary">{count} exhibitors</h3>
            <p className="mt-1 text-xs text-secondary">Browse real company profiles, products, and marketing material.</p>
          </div>
          <div className="rounded-2xl border border-default bg-surface p-5 text-left shadow-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-subtle text-brand">
              <svg className="size-5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="2" width="12" height="12" rx="2" />
                <path d="M5 5l3 6 3-6" />
              </svg>
            </div>
            <h3 className="mt-3 text-sm font-semibold text-primary">QR-led experience</h3>
            <p className="mt-1 text-xs text-secondary">Scan any booth QR on your phone or open the booth page on desktop.</p>
          </div>
          <div className="rounded-2xl border border-default bg-surface p-5 text-left shadow-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-subtle text-brand">
              <svg className="size-5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="8" cy="8" r="6" />
                <path d="M8 5v3l2 2" />
              </svg>
            </div>
            <h3 className="mt-3 text-sm font-semibold text-primary">AI intelligence</h3>
            <p className="mt-1 text-xs text-secondary">Ask questions, get answers, see lead scoring and recommendations.</p>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/hackathon/expo"
            className="inline-flex h-12 items-center gap-2 rounded-xl bg-brand px-8 text-base font-semibold text-on-brand shadow-1 transition-all hover:bg-brand-hover hover:shadow-2"
          >
            Start Experience
            <svg className="size-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 4l4 4-4 4" />
            </svg>
          </Link>
          <Link
            href="/demo"
            className="inline-flex h-12 items-center gap-2 rounded-xl border border-default bg-surface px-8 text-base font-medium text-secondary transition-colors hover:bg-sunken hover:text-primary"
          >
            View product demo
          </Link>
        </div>

        <p className="mt-6 text-center text-xs text-muted">
          No sign-up required. Everything is publicly accessible.
        </p>
      </div>
    </main>
  );
}

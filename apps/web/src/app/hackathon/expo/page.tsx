import Link from "next/link";

import { getPublicShowcase } from "@concourse/api-client";
import { getApiBaseUrl } from "@/lib/api/config";
import { ShowcaseClient } from "@/app/showcase/showcase-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function boothQrFilename(boothNumber: string): string {
  return boothNumber.replace(/[^a-z0-9]/gi, "-").toLowerCase();
}

export default async function HackathonExpoPage() {
  const apiBase = getApiBaseUrl();
  const exhibitors = await getPublicShowcase({ baseUrl: apiBase }).catch(() => null);

  return (
    <main className="min-h-screen bg-canvas text-primary">
      <header className="sticky top-0 z-40 border-b border-default/50 bg-canvas/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3 sm:px-10">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-sm font-bold text-on-brand shadow-1">
              E
            </span>
            <span className="text-base font-semibold tracking-tight">ExAi</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/hackathon"
              className="rounded-lg border border-default bg-surface px-3 py-1.5 text-xs font-medium text-secondary transition-colors hover:bg-sunken hover:text-primary"
            >
              About
            </Link>
            <Link
              href="/demo"
              className="rounded-lg border border-default bg-surface px-3 py-1.5 text-xs font-medium text-secondary transition-colors hover:bg-sunken hover:text-primary"
            >
              Demo
            </Link>
            <span className="rounded-full border border-brand/30 bg-brand-subtle px-3 py-1 text-xs font-semibold text-brand">
              Expo
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-10 sm:py-16">
        <div className="space-y-3 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand-subtle px-4 py-1.5 text-xs font-semibold text-brand">
            <span className="size-1.5 rounded-full bg-brand" />
            TechExpo 2027 — Exhibitor Showcase
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            Discover the future of technology
          </h1>
          <p className="mx-auto max-w-2xl text-base text-secondary">
            Walk the expo floor from here. Open any booth, scan the QR, and
            experience AI-powered lead intelligence in action.
          </p>
        </div>

        {!exhibitors ? (
          <section className="mt-12 rounded-2xl border border-status-danger-border bg-status-danger-subtle p-6 text-sm text-status-danger-text">
            The showcase endpoint is unavailable right now. Run{" "}
            <code className="rounded bg-surface px-1.5 py-0.5">pnpm db:seed</code>{" "}
            against a running Supabase project.
          </section>
        ) : (
          <ShowcaseClient
            exhibitors={exhibitors.map((e) => ({
              ...e,
              boothQrImage: e.boothNumber
                ? `/demo/qr/booth-${boothQrFilename(e.boothNumber)}.png`
                : null,
            }))}
          />
        )}
      </div>
    </main>
  );
}

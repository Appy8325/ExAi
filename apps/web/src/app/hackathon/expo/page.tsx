import Image from "next/image";
import Link from "next/link";

import { getPublicShowcase } from "@concourse/api-client";
import { getApiBaseUrl } from "@/lib/api/config";
import { ShowcaseClient } from "@/app/showcase/showcase-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
              Event
            </Link>
            <Link
              href="/demo"
              className="rounded-lg border border-default bg-surface px-3 py-1.5 text-xs font-medium text-secondary transition-colors hover:bg-sunken hover:text-primary"
            >
              Demo
            </Link>
            <span className="rounded-full border border-brand/30 bg-brand-subtle px-3 py-1 text-xs font-semibold text-brand">
              Expo Floor
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-10 sm:py-16">
        <div className="space-y-3 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand-subtle px-4 py-1.5 text-xs font-semibold text-brand">
            <span className="size-1.5 rounded-full bg-brand" />
            TechExpo 2027 — Expo Floor
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            Discover the future of technology
          </h1>
          <p className="mx-auto max-w-2xl text-base text-secondary">
            Browse exhibitors, open any booth, and experience AI-powered product
            intelligence — all from a single scan.
          </p>
        </div>

        <div className="mt-6 flex justify-center">
          <div className="inline-flex items-center gap-3 rounded-xl border border-default bg-surface px-4 py-3 shadow-1">
            <Image
              src="/demo/qr/event-entrance.png"
              alt="Event entrance QR code"
              width={64}
              height={64}
              className="rounded-lg border border-default"
              unoptimized
            />
            <div className="text-left text-xs">
              <p className="font-medium text-primary">Event Entrance</p>
              <p className="text-muted mt-0.5">Scan to enter TechExpo 2027</p>
            </div>
          </div>
        </div>

        {!exhibitors ? (
          <section className="mt-12 rounded-2xl border border-status-danger-border bg-status-danger-subtle p-6 text-sm text-status-danger-text">
            The showcase endpoint is unavailable right now. Run{" "}
            <code className="rounded bg-surface px-1.5 py-0.5">pnpm db:seed</code>{" "}
            against a running Supabase project.
          </section>
        ) : (
          <ShowcaseClient exhibitors={exhibitors} />
        )}
      </div>
    </main>
  );
}

import Image from "next/image";
import Link from "next/link";
import { EmptyState, StatusBadge } from "@concourse/ui";

import { getPublicShowcase } from "@concourse/api-client";
import { getApiBaseUrl } from "@/lib/api/config";
import { ShowcaseClient } from "@/app/showcase/showcase-client";
import { GlobalNav } from "@/components/navigation/global-nav";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HackathonExpoPage() {
  const apiBase = getApiBaseUrl();
  const exhibitors = await getPublicShowcase({ baseUrl: apiBase }).catch(() => null);

  return (
    <main className="min-h-screen bg-canvas text-primary">
      <GlobalNav variant="compact" active="attendee" />
      <div className="border-b border-default/50 bg-brand-subtle/30">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2 sm:px-8">
          <Link
            href="/hackathon"
            className="rounded-lg border border-default bg-surface px-2.5 py-1 text-caption font-medium text-secondary transition-colors hover:border-strong hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            ← Event
          </Link>
          <span className="rounded-full border border-brand/20 bg-brand-subtle px-3 py-1 text-caption font-semibold text-brand">
            Expo Floor
          </span>
          <span className="ml-auto text-caption text-muted">TechExpo 2027</span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-10 sm:py-16">
        <div className="space-y-3 text-center">
          <StatusBadge tone="brand">TechExpo 2027 — Expo Floor</StatusBadge>
          <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            Discover the future of technology
          </h1>
          <p className="mx-auto max-w-2xl text-body-lg text-secondary">
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
            <div className="text-left text-caption">
              <p className="font-medium text-primary">Event Entrance</p>
              <p className="text-muted mt-0.5">Scan to enter TechExpo 2027</p>
            </div>
          </div>
        </div>

        {!exhibitors ? (
          <EmptyState title="Expo unavailable" description="The expo floor could not be loaded." />
        ) : (
          <ShowcaseClient exhibitors={exhibitors} />
        )}
      </div>
    </main>
  );
}

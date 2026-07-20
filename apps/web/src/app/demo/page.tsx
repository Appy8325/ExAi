import Link from "next/link";

import {
  type PublicDemoOverview,
  getPublicDemoOverview,
} from "@concourse/api-client";

import { getApiBaseUrl } from "@/lib/api/config";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function loadDemoOverview(apiBase: string): Promise<PublicDemoOverview | null> {
  try {
    return await getPublicDemoOverview({ baseUrl: apiBase });
  } catch {
    return null;
  }
}

export default async function DemoPage() {
  const apiBase = getApiBaseUrl();
  const overview = await loadDemoOverview(apiBase);

  const firstEvent = overview?.events[0];
  const exhibitors = overview?.events.flatMap((e) => e.exhibitors) ?? [];
  const relationships = overview?.relationships ?? [];

  return (
    <main className="min-h-screen bg-canvas text-primary">
      <header className="sticky top-0 z-40 border-b border-default/50 bg-canvas/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3 sm:px-10">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-sm font-bold text-on-brand shadow-1">
              E
            </span>
            <span className="text-base font-semibold tracking-tight">
              ExAi
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/hackathon/expo"
              className="rounded-lg border border-brand/30 bg-brand-subtle px-3 py-1.5 text-xs font-semibold text-brand transition-colors hover:bg-brand hover:text-on-brand"
            >
              Hackathon Expo
            </Link>
            <span className="rounded-full border border-brand/30 bg-brand-subtle px-3 py-1 text-xs font-semibold text-brand">
              Read-only demo
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-10 sm:py-16">
        <div className="space-y-3 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            Experience ExAi
          </h1>
          <p className="mx-auto max-w-2xl text-base text-secondary">
            Explore the platform from the perspective of each user. Every page is
            read-only and requires no login.
          </p>
        </div>

        {!overview ? (
          <section className="mt-12 rounded-2xl border border-status-danger-border bg-status-danger-subtle p-6 text-sm text-status-danger-text">
            The public demo discovery endpoint is unavailable right now. Run
            <code className="mx-1 rounded bg-surface px-1.5 py-0.5">pnpm db:seed</code>
            against a Supabase project with credentials configured in Vercel.
          </section>
        ) : null}

        {overview ? (
          <div className="mt-12 space-y-8">
            <PersonaCard
              title="Organizer"
              description="Manage events, exhibitors, and gain insights from AI-powered analytics, heatmaps, and reports."
              href="/demo/organizer"
              tone="info"
              stats={[
                { label: "Events", value: overview.events.length },
                { label: "Exhibitors", value: exhibitors.length },
                { label: "Relationships", value: relationships.length },
              ]}
            />
            <PersonaCard
              title="Exhibitor"
              description="Manage your booth profile, knowledge base, lead forms, and track attendee engagement."
              href="/demo/exhibitor"
              tone="success"
              stats={[
                { label: "Organizations", value: overview.exhibitorOrganizations.length },
                { label: "Active booths", value: exhibitors.length },
                { label: "Relationships", value: relationships.length },
              ]}
            />
            <PersonaCard
              title="Attendee"
              description="Browse the exhibitor directory, search companies, visit booths, and ask the AI assistant."
              href="/demo/attendee"
              tone="brand"
              stats={
                firstEvent
                  ? [
                      { label: "Exhibitors", value: firstEvent.exhibitors.length },
                      { label: "Event", value: firstEvent.name },
                    ]
                  : undefined
              }
            />
          </div>
        ) : null}

        {overview ? (
          <p className="mt-8 text-center text-xs text-muted">
            Powered by{" "}
            <span className="font-medium text-primary">ExAi</span> &middot;
            Read-only showcase
          </p>
        ) : null}
      </div>
    </main>
  );
}

function PersonaCard({
  title,
  description,
  href,
  tone,
  stats,
}: {
  title: string;
  description: string;
  href: string;
  tone: "info" | "success" | "brand";
  stats?: Array<{ label: string; value: string | number }>;
}) {
  const border = {
    info: "border-status-info-border hover:ring-status-info-border/30",
    success: "border-status-success-border hover:ring-status-success-border/30",
    brand: "border-brand/30 hover:ring-brand/30",
  }[tone];
  const badge = {
    info: "bg-status-info-subtle text-status-info-text",
    success: "bg-status-success-subtle text-status-success-text",
    brand: "bg-brand-subtle text-brand",
  }[tone];

  return (
    <Link
      href={href}
      className={`group block rounded-2xl border-2 ${border} bg-surface p-6 shadow-1 transition-all hover:shadow-2 hover:ring-2 sm:p-8`}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${badge}`}>
              {title}
            </span>
            <svg className="size-4 text-muted transition-transform group-hover:translate-x-1" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 4l4 4-4 4" />
            </svg>
          </div>
          <p className="mt-3 text-base text-secondary">{description}</p>
        </div>
        {stats ? (
          <div className="flex gap-4 sm:gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-xl font-bold tabular-nums text-primary">{stat.value}</p>
                <p className="text-xs text-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </Link>
  );
}

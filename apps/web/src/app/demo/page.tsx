import Link from "next/link";
import { StatusBadge } from "@concourse/ui";

import {
  type PublicDemoOverview,
  getPublicDemoOverview,
} from "@concourse/api-client";

import { getApiBaseUrl } from "@/lib/api/config";
import { GlobalNav } from "@/components/navigation/global-nav";
import { DemoPageHeader } from "@/components/demo/shell";

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
    <main className="min-h-screen bg-canvas">
      <GlobalNav variant="marketing" active="experience" />
      <div className="mx-auto max-w-7xl px-6 pt-8 sm:px-10 sm:pt-12">
        <div className="mx-auto max-w-3xl space-y-4 text-center">
          <StatusBadge tone="brand">ExAi product tour</StatusBadge>
          <DemoPageHeader
            eyebrow="Read-only demo"
            title="Experience ExAi"
            description="Explore the platform from each perspective. Every page is read-only, powered by seeded demo data, and requires no login or editing."
          />
        </div>

        <div className="mx-auto mt-4 grid max-w-3xl gap-3 sm:grid-cols-3">
          <QuickStat
            label="Events in showcase"
            value={overview ? overview.events.length : "-"}
          />
          <QuickStat
            label="Exhibitors live"
            value={overview ? exhibitors.length : "-"}
          />
          <QuickStat
            label="Relationships captured"
            value={overview ? relationships.length : "-"}
          />
        </div>
      </div>

      <section className="mx-auto mt-12 max-w-7xl px-6 pb-20 sm:px-10">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-title-sm font-semibold uppercase tracking-[0.18em] text-muted">
            Choose your perspective
          </h2>
        </div>

        <div className="mt-4 grid gap-6 lg:grid-cols-3">
          <PersonaCard
            tone="info"
            eyebrow="Read-only"
            title="Organizer"
            tagline="Plan, analyze, report."
            href="/demo/organizer"
            cta="Open organizer workspace"
            capabilities={[
              "Event portfolio dashboard",
              "Live traffic & conversion analytics",
              "Booth heatmaps across the floor",
              "AI-generated executive insights",
              "Deterministic reports ready to share",
            ]}
            stats={
              overview
                ? [
                    { label: "Events", value: overview.events.length },
                    { label: "Booths", value: exhibitors.length },
                    { label: "Relationships", value: relationships.length },
                  ]
                : undefined
            }
          />

          <PersonaCard
            tone="success"
            eyebrow="Read-only"
            title="Exhibitor"
            tagline="Operate a booth with intelligence."
            href="/demo/exhibitor"
            cta="Open exhibitor workspace"
            capabilities={[
              "Booth dashboard with live KPIs",
              "Products & knowledge sources",
              "Relationship pipeline & visitors",
              "Booth-level analytics & AI insights",
              "QR credential & public booth preview",
            ]}
            stats={
              overview
                ? [
                    {
                      label: "Organizations",
                      value: overview.exhibitorOrganizations.length,
                    },
                    { label: "Active booths", value: exhibitors.length },
                    { label: "Captured leads", value: relationships.length },
                  ]
                : undefined
            }
          />

          <PersonaCard
            tone="brand"
            eyebrow="Live experience"
            title="Attendee"
            tagline="Browse exhibitors, visit booths, and connect."
            href="/hackathon"
            cta="Launch attendee experience"
            capabilities={[
              "Public exhibitor directory",
              "Booth pages with AI assistant",
              "Lead forms & downloadable brochures",
              "No sign-up, no friction",
            ]}
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

        {!overview ? (
          <div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-status-danger-border bg-status-danger-subtle p-6 text-body text-status-danger-text">
            Demo data is not available right now. Make sure your Supabase project
            is running and seeded with{" "}
            <code className="rounded bg-surface px-1.5 py-0.5">pnpm db:seed</code>.
          </div>
        ) : null}

        <footer className="mt-16 border-t border-default/60 pt-6 text-center text-caption text-muted">
          Powered by <span className="font-semibold text-primary">ExAi</span> -
          Read-only showcase - Zero auth required
        </footer>
      </section>
    </main>
  );
}

function PersonaCard({
  title,
  tagline,
  description,
  href,
  cta,
  tone,
  eyebrow,
  capabilities,
  stats,
}: {
  title: string;
  tagline: string;
  description?: string;
  href: string;
  cta: string;
  tone: "info" | "success" | "brand";
  eyebrow: string;
  capabilities: string[];
  stats?: Array<{ label: string; value: string | number }>;
}) {
  const toneClass = {
    info: {
      border: "border-status-info-border hover:ring-status-info-border/40",
      cta: "bg-status-info-solid text-on-brand",
      accent: "text-status-info-text",
    },
    success: {
      border: "border-status-success-border hover:ring-status-success-border/40",
      cta: "bg-status-success-solid text-on-brand",
      accent: "text-status-success-text",
    },
    brand: {
      border: "border-brand/30 hover:ring-brand/40",
      cta: "bg-brand text-on-brand",
      accent: "text-brand",
    },
  }[tone];

  return (
    <Link
      href={href}
      className={`group flex h-full flex-col rounded-2xl border-2 ${toneClass.border} bg-surface p-6 shadow-1 transition-all hover:shadow-2 hover:ring-2 sm:p-7`}
    >
      <div className="flex items-center justify-between gap-3">
        <StatusBadge tone={tone === "brand" ? "brand" : tone}>{tone === "brand" ? "Live experience" : `${title} workspace`}</StatusBadge>
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
          {eyebrow}
        </span>
      </div>
      <h3 className="mt-4 text-2xl font-bold tracking-tight text-primary">
        {title}
      </h3>
      <p className="mt-1 text-body text-secondary">{tagline}</p>
      {description ? (
        <p className="mt-2 text-body text-muted">{description}</p>
      ) : null}
      <ul className="mt-5 space-y-2">
        {capabilities.map((cap) => (
          <li key={cap} className="flex items-start gap-2 text-body text-secondary">
            <svg
              className={`mt-0.5 size-4 shrink-0 ${toneClass.accent}`}
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <path d="M3 8.5l3 3 7-7" />
            </svg>
            <span>{cap}</span>
          </li>
        ))}
      </ul>
      {stats && stats.length > 0 ? (
        <div className="mt-5 grid grid-cols-3 gap-3 rounded-xl border border-default bg-sunken p-3">
          {stats.map((s) => (
            <div
              key={s.label}
              className="min-w-0 text-center sm:text-left"
            >
              <p className="truncate text-body-lg font-bold tabular-nums text-primary sm:text-lg">
                {s.value}
              </p>
              <p className="truncate text-[11px] uppercase tracking-wide text-muted">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      ) : null}
      <div className="mt-6 flex items-center justify-between">
        <span
          className={`inline-flex items-center gap-1 rounded-lg ${toneClass.cta} px-3 py-1.5 text-body font-semibold`}
        >
          {cta}
          <svg className="size-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M6 4l4 4-4 4" />
          </svg>
        </span>
        <span className="text-caption text-muted">
          {href}
        </span>
      </div>
    </Link>
  );
}

function QuickStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-default bg-surface px-4 py-3 text-left">
      <p className="text-xl font-bold tabular-nums text-primary">{value}</p>
      <p className="text-caption uppercase tracking-wide text-muted">{label}</p>
    </div>
  );
}
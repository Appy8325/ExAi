"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { EmptyState, StatusBadge } from "@concourse/ui";

import type { ShowcaseExhibitor } from "@concourse/api-client";
import { getApiBaseUrl } from "@/lib/api/config";

const industryGradients: Record<string, string> = {
  Technology: "from-status-info-solid to-brand",
  "Semiconductors & AI": "from-status-success-solid to-status-ai-solid",
  "Networking & Security": "from-status-ai-text to-status-success-solid",
  "Technology & Consulting": "from-brand to-status-ai-solid",
  Semiconductors: "from-status-warning-solid to-status-danger-solid",
  "Enterprise Software": "from-status-info-text to-brand",
  Software: "from-status-danger-solid to-status-warning-solid",
  "Industrial Technology": "from-viz-cat-8 to-viz-cat-8/60",
};

function getGradient(industry: string): string {
  return industryGradients[industry] ?? "from-brand/60 to-brand-hover";
}

function LiveAnimatedCounter({ initial, suffix = "" }: { initial: number; suffix?: string }) {
  const [count, setCount] = useState(initial);
  const prevRef = useRef(initial);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const base = getApiBaseUrl();
        const res = await fetch(`${base}/v1/public/demo/live`);
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) {
          const newVal = data.totalLiveBoothVisits ?? data.totalLiveLeadSubmissions ?? initial;
          if (newVal !== prevRef.current) {
            prevRef.current = newVal;
            setCount(newVal);
          }
        }
      } catch { /* ignore */ }
    };
    load();
    const id = setInterval(load, 6000);
    return () => { cancelled = true; clearInterval(id); };
  }, [initial]);

  return (
    <span>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

const JOURNEY_STEPS = [
  { icon: "🚪", title: "Enter the Exhibition", desc: "Scan QR or tap to begin" },
  { icon: "🔍", title: "Explore an Exhibitor", desc: "Browse real companies" },
  { icon: "🤖", title: "Ask the AI Assistant", desc: "Get answers about products" },
  { icon: "📝", title: "Submit a Lead", desc: "Connect with exhibitors" },
  { icon: "✨", title: "Experience AI", desc: "See the future of events" },
];

function EventQR() {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative overflow-hidden rounded-2xl border border-default bg-surface p-3 shadow-2">
        <Image
          src="/qr/hackathon-event.png"
          alt="TechExpo 2027 Event QR Code"
          width={200}
          height={200}
          className="rounded-lg"
          unoptimized
        />
        <div className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-on-brand shadow-2">
          E
        </div>
      </div>
      <p className="mt-3 text-caption text-muted">Scan to enter TechExpo 2027</p>
    </div>
  );
}

function ExhibitorCard({ exhibitor }: { exhibitor: ShowcaseExhibitor }) {
  return (
    <Link
      href={exhibitor.publicQrToken ? `/visit/${exhibitor.publicQrToken}` : "#"}
      className="group relative block overflow-hidden rounded-2xl border border-default bg-surface transition-all duration-[var(--mq-duration-slow)] ease-[var(--mq-ease-enter)] hover:-translate-y-1 hover:shadow-card-hover"
    >
      <div className={`relative h-24 bg-gradient-to-br ${getGradient(exhibitor.industry)} p-4`}>
        <div className="flex size-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
          <span className="text-lg font-bold text-on-brand">
            {exhibitor.companyName.charAt(0)}
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-title-sm font-semibold text-primary">
              {exhibitor.companyName}
            </h3>
            <p className="mt-0.5 text-caption text-muted">
              Booth {exhibitor.boothNumber ?? "—"}
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-sunken px-2 py-0.5 text-[10px] font-medium text-secondary">
            {exhibitor.industry}
          </span>
        </div>

        <p className="mt-2 line-clamp-2 text-body leading-relaxed text-secondary">
          {exhibitor.tagline}
        </p>

        {exhibitor.products && exhibitor.products.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {exhibitor.products.slice(0, 4).map((p) => (
              <span
                key={p}
                className="rounded bg-sunken px-1.5 py-0.5 text-[10px] text-secondary"
              >
                {p}
              </span>
            ))}
          </div>
        )}

        <div className="mt-4 grid grid-cols-3 gap-2">
          {exhibitor.publicQrToken ? (
            <>
              <Link
                href={`/visit/${exhibitor.publicQrToken}`}
                className="flex items-center justify-center gap-1 rounded-lg bg-brand px-2 py-2 text-center text-caption font-semibold text-on-brand shadow-1 transition-colors hover:bg-brand-hover"
              >
                Visit Booth
              </Link>
              <Link
                href={`/visit/${exhibitor.publicQrToken}`}
                className="flex items-center justify-center gap-1 rounded-lg border border-default bg-surface px-2 py-2 text-caption font-medium text-secondary transition-colors hover:border-strong hover:text-primary"
              >
                <svg className="size-3" fill="none" stroke="currentColor" viewBox="0 0 16 16" aria-hidden>
                  <circle cx="8" cy="8" r="6" strokeWidth="1.5" />
                  <path d="M8 5v3l2 2" strokeWidth="1.5" />
                </svg>
                Ask AI
              </Link>
            </>
          ) : (
            <span className="col-span-2 flex items-center justify-center rounded-lg border border-dashed border-default bg-sunken px-2 py-2 text-caption text-muted">
              Booth not available
            </span>
          )}
          <a
            href={exhibitor.website || "#"}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-center gap-1 rounded-lg border border-default bg-surface px-2 py-2 text-caption font-medium text-secondary transition-colors hover:border-strong hover:text-primary"
          >
            <svg className="size-3" fill="none" stroke="currentColor" viewBox="0 0 16 16" aria-hidden>
              <path strokeWidth="1.5" d="M6 2h8v8M8 8l6-6M2 8v6h6" />
            </svg>
            Website
          </a>
        </div>
      </div>
    </Link>
  );
}

export function HackathonLandingClient({
  exhibitors,
  count: _count,
  liveMetrics,
}: {
  exhibitors: ShowcaseExhibitor[];
  count: number;
  liveMetrics?: {
    totalLiveBoothVisits: number;
    totalLiveLeadSubmissions: number;
    totalLiveAiConversations: number;
    totalLiveBrochureDownloads: number;
    totalLiveProductViews: number;
    totalLiveReturningVisitors: number;
  } | null;
}) {
  const [heroVisible, setHeroVisible] = useState(false);
  const exhibitionRef = useRef<HTMLDivElement | null>(null);
  const [search, setSearch] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setHeroVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const scrollToExhibition = () => {
    exhibitionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const filtered = exhibitors.filter((e) => {
    const matchSearch =
      !search ||
      e.companyName.toLowerCase().includes(search.toLowerCase()) ||
      e.industry.toLowerCase().includes(search.toLowerCase());
    const matchIndustry = !selectedIndustry || e.industry === selectedIndustry;
    return matchSearch && matchIndustry;
  });

  const industries = [...new Set(exhibitors.map((e) => e.industry))].sort();
  const isFiltered = Boolean(search || selectedIndustry);

  return (
    <div className="min-h-screen bg-canvas">
      <section
        className={`relative mb-2 flex min-h-[88vh] flex-col items-center justify-center px-gutter py-16 transition-all duration-[var(--mq-duration-slower)] ease-[var(--mq-ease-enter)] sm:px-(--mq-space-gutter) ${
          heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <div className="absolute inset-0 -z-10 bg-canvas" />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 text-primary opacity-[0.04]"
          style={{
            backgroundImage: "none",
          }}
        />

        <div className="relative z-10 flex max-w-6xl flex-col items-center">
          <div className="mb-8">
            <EventQR />
          </div>

          <StatusBadge tone="info">Live Event • September 2027</StatusBadge>

          <h1 className="text-center text-5xl font-bold tracking-tight text-primary sm:text-6xl lg:text-7xl">
            TechExpo{" "}
            <span className="text-brand">
              2027
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-center text-xl leading-relaxed text-secondary">
            Experience the Future of AI-Powered Trade Shows
          </p>

          <p className="mt-3 max-w-lg text-center text-body leading-relaxed text-muted">
            A live demonstration of AI-powered attendee engagement
          </p>

          <button
            type="button"
            onClick={scrollToExhibition}
            className="mt-10 inline-flex h-14 items-center gap-3 rounded-2xl bg-brand px-10 text-title-sm font-semibold text-on-brand shadow-2 transition-all duration-[var(--mq-duration-slow)] ease-[var(--mq-ease-enter)] hover:bg-brand-hover hover:shadow-card-hover hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Enter Exhibition
            <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 16 16" aria-hidden>
              <path strokeWidth="2" d="M8 3v10M3 8l5 5 5-5" />
            </svg>
          </button>

          <div className="mt-16 w-full max-w-3xl">
            <div className="text-center">
              <span className="text-3xl" aria-hidden>👋</span>
              <h2 className="mt-2 text-xl font-semibold text-primary">
                Welcome to TechExpo 2027
              </h2>
              <p className="mt-1 text-body text-muted">New here? Follow this journey.</p>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-5">
              {JOURNEY_STEPS.map((step, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-default bg-surface p-4 text-center shadow-1 transition-all duration-[var(--mq-duration-moderate)] ease-[var(--mq-ease-standard)] hover:border-strong hover:shadow-card-hover"
                >
                  <span className="text-2xl" aria-hidden>{step.icon}</span>
                  <p className="mt-2 text-caption font-semibold text-primary">{step.title}</p>
                  <p className="mt-1 text-caption text-muted">{step.desc}</p>
                </div>
              ))}
            </div>

            <p className="mt-6 text-center text-body text-muted">
              <span className="font-medium text-secondary">Estimated time:</span> 2–3 minutes
            </p>
          </div>

          <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-5">
            {[
              { icon: "📍", label: "Moscone Center", sub: "San Francisco" },
              { icon: "📅", label: "September 2027", sub: "" },
              { icon: "🏢", label: <><LiveAnimatedCounter initial={liveMetrics?.totalLiveLeadSubmissions ?? 0} /><span className="ml-1">Leads</span></>, sub: "" },
              { icon: "👥", label: <><LiveAnimatedCounter initial={liveMetrics?.totalLiveBoothVisits ?? 0} /><span className="ml-1">Visits</span></>, sub: "(Demo)" },
              { icon: "🤖", label: <><LiveAnimatedCounter initial={liveMetrics?.totalLiveAiConversations ?? 0} /><span className="ml-1">AI chats</span></>, sub: "(Demo)" },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center rounded-xl border border-default bg-surface p-4 shadow-1">
                <span className="text-xl" aria-hidden>{item.icon}</span>
                <p className="mt-1 text-body font-semibold text-primary">
                  {typeof item.label === 'object' ? item.label : item.label}
                </p>
                <p className="text-caption text-muted">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        ref={exhibitionRef}
        className="scroll-mt-20 border-t border-default bg-sunken py-16"
      >
        <div className="mx-auto max-w-7xl px-gutter sm:px-(--mq-space-gutter)">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-primary">Featured Exhibitors</h2>
            <p className="mt-2 text-secondary">
              Discover groundbreaking innovations from industry leaders
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <svg
                className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 16 16"
                aria-hidden
              >
                <circle cx="7" cy="7" r="5" strokeWidth="2" />
                <path strokeWidth="2" d="M11 11l4 4" />
              </svg>
              <input
                type="text"
                placeholder="Search companies..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search exhibitors"
                className="h-(--spacing-control-h) w-full rounded-md border border-strong bg-surface pl-11 pr-4 text-body text-primary outline-none transition-all duration-[var(--mq-duration-fast)] ease-[var(--mq-ease-standard)] placeholder:text-muted focus:border-strong focus:ring-2 focus:ring-ring/30"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedIndustry(null)}
                aria-pressed={!selectedIndustry}
                className={`rounded-full border px-4 py-1.5 text-caption font-medium transition-all duration-[var(--mq-duration-fast)] ease-[var(--mq-ease-standard)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  !selectedIndustry
                    ? "border-brand bg-brand text-on-brand"
                    : "border-default bg-surface text-secondary hover:border-strong hover:text-primary"
                }`}
              >
                All
              </button>
              {industries.map((ind) => (
                <button
                  key={ind}
                  type="button"
                  onClick={() => setSelectedIndustry(selectedIndustry === ind ? null : ind)}
                  aria-pressed={selectedIndustry === ind}
                  className={`rounded-full border px-4 py-1.5 text-caption font-medium transition-all duration-[var(--mq-duration-fast)] ease-[var(--mq-ease-standard)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    selectedIndustry === ind
                      ? "border-brand bg-brand text-on-brand"
                      : "border-default bg-surface text-secondary hover:border-strong hover:text-primary"
                  }`}
                >
                  {ind}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {(isFiltered ? filtered : exhibitors).map((exhibitor) => (
              <ExhibitorCard key={exhibitor.id} exhibitor={exhibitor} />
            ))}
          </div>

          {filtered.length === 0 && (
            <EmptyState title="No exhibitors found" description="Try adjusting your search or filters." />
          )}
        </div>
      </section>

      <footer className="border-t border-default bg-surface py-8">
        <div className="mx-auto max-w-7xl px-gutter text-center sm:px-(--mq-space-gutter)">
          <p className="text-body text-muted">
            TechExpo 2027 • Powered by ExAi • No sign-up required
          </p>
        </div>
      </footer>
    </div>
  );
}

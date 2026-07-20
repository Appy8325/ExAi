"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import type { ShowcaseExhibitor } from "@concourse/api-client";

const industryGradients: Record<string, string> = {
  Technology: "from-blue-600 to-indigo-600",
  "Semiconductors & AI": "from-green-600 to-emerald-600",
  "Networking & Security": "from-cyan-500 to-teal-600",
  "Technology & Consulting": "from-indigo-500 to-purple-600",
  Semiconductors: "from-amber-500 to-orange-600",
  "Enterprise Software": "from-sky-500 to-blue-600",
  Software: "from-red-500 to-rose-600",
  "Industrial Technology": "from-slate-600 to-gray-700",
};

function getGradient(industry: string): string {
  return industryGradients[industry] ?? "from-brand/60 to-brand/40";
}

function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const duration = 1500;
    const start = performance.now();
    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.floor(eased * value));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value]);

  return (
    <span ref={ref}>
      {display}{suffix}
    </span>
  );
}

const JOURNEY_STEPS = [
  { step: 1, title: "Enter the Exhibition", description: "Scan the event QR to access the exhibition hall." },
  { step: 2, title: "Explore an Exhibitor", description: "Browse booths by industry, name, or keyword search." },
  { step: 3, title: "Ask the AI Assistant", description: "Chat with the AI at any booth about products and services." },
  { step: 4, title: "Submit a Lead", description: "Share your details to receive tailored follow-ups." },
  { step: 5, title: "Experience AI", description: "Get personalized recommendations based on your interests." },
];

function ExhibitorCard({ exhibitor }: { exhibitor: ShowcaseExhibitor }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-default bg-surface shadow-1 transition-all duration-300 hover:shadow-premium hover:-translate-y-1">
      <div
        className={`h-28 bg-gradient-to-br ${getGradient(exhibitor.industry)} p-5`}
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20 text-xl font-bold text-white shadow-sm backdrop-blur-sm">
          {exhibitor.companyName.charAt(0)}
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-lg font-semibold text-primary">
              {exhibitor.companyName}
            </h3>
            <p className="mt-0.5 text-sm text-muted">
              Booth {exhibitor.boothNumber ?? "\u2014"}
            </p>
          </div>
          <span className="shrink-0 rounded-full border border-default bg-sunken/60 px-2.5 py-1 text-[11px] font-medium text-secondary">
            {exhibitor.industry}
          </span>
        </div>
        <p className="mt-3 line-clamp-2 text-sm text-secondary leading-relaxed">
          {exhibitor.tagline}
        </p>
        {exhibitor.products && exhibitor.products.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {exhibitor.products.slice(0, 3).map((product) => (
              <span key={product} className="rounded-full border border-default bg-sunken/40 px-2 py-0.5 text-[10px] text-secondary">
                {product}
              </span>
            ))}
            {exhibitor.products.length > 3 && (
              <span className="text-[10px] text-muted">+{exhibitor.products.length - 3} more</span>
            )}
          </div>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          {exhibitor.publicQrToken ? (
            <Link
              href={`/visit/${exhibitor.publicQrToken}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-brand/30 bg-brand-subtle px-3.5 py-2 text-sm font-semibold text-brand transition-colors hover:bg-brand hover:text-on-brand"
            >
              <svg className="size-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 3v10M3 8h10" />
              </svg>
              Visit Booth
            </Link>
          ) : null}

          {exhibitor.publicQrToken ? (
            <Link
              href={`/visit/${exhibitor.publicQrToken}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-default bg-surface px-3.5 py-2 text-sm font-medium text-secondary transition-colors hover:bg-sunken hover:text-primary"
            >
              <svg className="size-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="8" cy="8" r="6" />
                <path d="M8 5v3l2 2" />
              </svg>
              Ask AI
            </Link>
          ) : null}

          <a
            href={exhibitor.website || `https://${exhibitor.companyName.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-default bg-surface px-3.5 py-2 text-sm font-medium text-secondary transition-colors hover:bg-sunken hover:text-primary"
          >
            <svg className="size-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2h8v8M8 8l6-6M2 8v6h6" />
            </svg>
            Website
          </a>
        </div>
      </div>
    </div>
  );
}

export function HackathonLandingClient({
  exhibitors,
  count,
  industries,
}: {
  exhibitors: ShowcaseExhibitor[];
  count: number;
  industries: string[];
}) {
  const [search, setSearch] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const [heroVisible, setHeroVisible] = useState(false);
  const exhibitionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setHeroVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const filtered = exhibitors.filter((e) => {
    const matchSearch =
      !search ||
      e.companyName.toLowerCase().includes(search.toLowerCase()) ||
      e.industry.toLowerCase().includes(search.toLowerCase()) ||
      e.tagline.toLowerCase().includes(search.toLowerCase());
    const matchIndustry = !selectedIndustry || e.industry === selectedIndustry;
    return matchSearch && matchIndustry;
  });

  const displayList = search || selectedIndustry ? filtered : exhibitors;
  const isFiltered = Boolean(search || selectedIndustry);

  const scrollToExhibition = () => {
    exhibitionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="relative">
      <section
        className={`relative min-h-[85vh] flex flex-col items-center justify-center px-6 text-center transition-all duration-700 ${
          heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-brand/[0.07] via-brand/[0.03] to-transparent"
        />

        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 size-full opacity-[0.04]"
          width="100%"
          height="100%"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="hero-grid" width="64" height="64" patternUnits="userSpaceOnUse">
              <path d="M 64 0 L 0 0 0 64" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-grid)" />
        </svg>

        <span className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand-subtle px-4 py-1.5 text-xs font-semibold text-brand">
          <span className="size-1.5 rounded-full bg-brand animate-pulse" />
          TechExpo 2027
        </span>

        <h1 className="mt-8 text-5xl font-bold tracking-tight text-primary sm:text-6xl lg:text-7xl">
          TechExpo{" "}
          <span className="bg-gradient-to-r from-brand to-violet-400 bg-clip-text text-transparent">
            2027
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-secondary leading-relaxed sm:text-xl">
          Experience the Future of AI-Powered Trade Shows
        </p>

        <p className="mx-auto mt-4 max-w-xl text-sm text-muted leading-relaxed">
          Discover how AI transforms organizer, exhibitor and attendee engagement.
        </p>

        <button
          type="button"
          onClick={scrollToExhibition}
          className="mt-10 inline-flex h-14 items-center gap-3 rounded-2xl bg-brand px-10 text-base font-semibold text-on-brand shadow-premium transition-all duration-300 hover:bg-brand-hover hover:shadow-2 hover:scale-[1.02] active:scale-[0.98]"
        >
          Enter Exhibition
          <svg className="size-5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 3v10M3 8l5 5 5-5" />
          </svg>
        </button>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-muted">
          <span className="inline-flex items-center gap-1.5">
            <svg className="size-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M8 1C5.2 1 3 3.2 3 6c0 3.5 5 9 5 9s5-5.5 5-9c0-2.8-2.2-5-5-5z" />
              <circle cx="8" cy="6" r="2" />
            </svg>
            Moscone Center, San Francisco
          </span>
          <span className="inline-flex items-center gap-1.5">
            <svg className="size-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="1" y="2" width="14" height="12" rx="2" />
              <path d="M1 6h14" />
              <path d="M5 1v3M11 1v3" />
            </svg>
            September 2027
          </span>
          <span className="inline-flex items-center gap-1.5">
            <svg className="size-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="10" height="10" rx="2" />
              <path d="M5 7h6M5 9h4" />
            </svg>
            {count} Featured Exhibitors
          </span>
        </div>

        <div className="mt-16 w-full max-w-3xl">
          <div className="mb-6 text-center">
            <span className="text-2xl">👋</span>
            <h2 className="mt-2 text-xl font-semibold text-primary">Welcome to TechExpo 2027</h2>
            <p className="mt-1 text-sm text-secondary">New here? Follow this journey.</p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-5">
            {JOURNEY_STEPS.map((item) => (
              <div key={item.step} className="rounded-xl border border-default/50 bg-surface/60 p-4 text-center backdrop-blur-sm transition-all hover:border-brand/30 hover:shadow-sm">
                <span className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-brand text-sm font-bold text-on-brand">
                  {item.step}
                </span>
                <p className="mt-2 text-sm font-medium text-primary">{item.title}</p>
                <p className="mt-1 text-xs text-muted leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-sm text-muted">
            <span className="font-medium">Estimated time:</span> 2–3 minutes
          </p>
        </div>

        <button
          type="button"
          onClick={scrollToExhibition}
          className="mt-10 inline-flex h-14 items-center gap-3 rounded-2xl bg-brand px-10 text-base font-semibold text-on-brand shadow-premium transition-all duration-300 hover:bg-brand-hover hover:shadow-2 hover:scale-[1.02] active:scale-[0.98]"
        >
          Enter Exhibition
          <svg className="size-5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 3v10M3 8l5 5 5-5" />
          </svg>
        </button>

        <div className="mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-muted">
          <span className="inline-flex items-center gap-1.5">
            <svg className="size-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M8 1C5.2 1 3 3.2 3 6c0 3.5 5 9 5 9s5-5.5 5-9c0-2.8-2.2-5-5-5z" />
              <circle cx="8" cy="6" r="2" />
            </svg>
            Moscone Center, San Francisco
          </span>
          <span className="inline-flex items-center gap-1.5">
            <svg className="size-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="1" y="2" width="14" height="12" rx="2" />
              <path d="M1 6h14" />
              <path d="M5 1v3M11 1v3" />
            </svg>
            September 2027
          </span>
          <span className="inline-flex items-center gap-1.5">
            <svg className="size-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="10" height="10" rx="2" />
              <path d="M5 7h6M5 9h4" />
            </svg>
            {count} Featured Exhibitors
          </span>
        </div>
      </section>

      <section className="border-t border-default/50 bg-sunken/40">
        <div className="mx-auto max-w-7xl px-6 py-12 sm:px-10 sm:py-16">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            <div className="rounded-xl border border-default bg-surface p-4 text-center">
              <p className="text-2xl font-bold text-primary"><AnimatedNumber value={count} /></p>
              <p className="mt-1 text-xs text-muted">Featured Exhibitors</p>
            </div>
            <div className="rounded-xl border border-default bg-surface p-4 text-center">
              <p className="text-2xl font-bold text-primary"><AnimatedNumber value={18500} suffix="+" /></p>
              <p className="mt-1 text-xs text-muted">Attendees</p>
            </div>
            <div className="rounded-xl border border-default bg-surface p-4 text-center">
              <p className="text-2xl font-bold text-primary"><AnimatedNumber value={25} /></p>
              <p className="mt-1 text-xs text-muted">Countries Represented</p>
            </div>
            <div className="rounded-xl border border-default bg-surface p-4 text-center">
              <p className="text-2xl font-bold text-primary"><AnimatedNumber value={10} /></p>
              <p className="mt-1 text-xs text-muted">AI Assistants</p>
            </div>
            <div className="rounded-xl border border-default bg-surface p-4 text-center sm:col-span-3 lg:col-span-1">
              <p className="text-2xl font-bold text-primary"><AnimatedNumber value={80} suffix="+" /></p>
              <p className="mt-1 text-xs text-muted">Sessions</p>
            </div>
          </div>
        </div>
      </section>

      <section ref={exhibitionRef} className="scroll-mt-16">
        <div className="mx-auto max-w-7xl px-6 py-12 sm:px-10 sm:py-20">
          <div className="flex flex-col items-center text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand-subtle px-4 py-1.5 text-xs font-semibold text-brand">
              Explore the Expo
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-primary sm:text-4xl">
              Featured Technologies
            </h2>
            <p className="mt-3 max-w-xl text-sm text-secondary">
              Discover groundbreaking innovations from industry-leading
              technology companies.
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <svg
                className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="6.5" cy="6.5" r="4.5" />
                <path d="M10 10l4 4" />
              </svg>
              <input
                type="text"
                placeholder="Search exhibitors, industries, keywords..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-default bg-surface py-3 pl-10 pr-4 text-sm text-primary placeholder-muted outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {industries.map((ind) => (
                <button
                  key={ind}
                  type="button"
                  onClick={() =>
                    setSelectedIndustry(selectedIndustry === ind ? null : ind)
                  }
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all ${
                    selectedIndustry === ind
                      ? "border-brand bg-brand text-on-brand shadow-1"
                      : "border-default bg-surface text-secondary hover:border-brand/50 hover:text-brand"
                  }`}
                >
                  {ind}
                </button>
              ))}
              {isFiltered && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setSelectedIndustry(null);
                  }}
                  className="rounded-full border border-default bg-surface px-3.5 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-sunken hover:text-primary"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-primary">
              {isFiltered ? "Results" : "Today's Highlights"}
            </h3>
            {!isFiltered && (
              <Link
                href="/hackathon/expo"
                className="text-sm font-medium text-brand transition-colors hover:text-brand-hover"
              >
                View Full Exhibition &rarr;
              </Link>
            )}
          </div>

          {displayList.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-default p-12 text-center">
              <p className="text-sm text-secondary">
                No exhibitors match your search.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {displayList.map((exhibitor) => (
                <ExhibitorCard key={exhibitor.id} exhibitor={exhibitor} />
              ))}
            </div>
          )}

          {!isFiltered && (
            <div className="mt-12 text-center">
              <Link
                href="/hackathon/expo"
                className="inline-flex h-12 items-center gap-2 rounded-xl border border-default bg-surface px-8 text-sm font-medium text-secondary transition-all duration-200 hover:bg-sunken hover:text-primary hover:border-brand/30"
              >
                Explore All {count} Exhibitors
                <svg className="size-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 4l4 4-4 4" />
                </svg>
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="border-t border-default/50 bg-gradient-to-b from-transparent to-brand/[0.02]">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:px-10 sm:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand-subtle px-4 py-1.5 text-xs font-semibold text-brand">
              AI Discovery
            </span>
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-primary sm:text-3xl">
              Every Booth Has an AI Assistant
            </h2>
            <p className="mt-3 text-sm text-secondary leading-relaxed">
              Ask questions about any exhibitor&rsquo;s products, services, and
              technology. Our AI answers are grounded in factual company
              information — nothing is fabricated.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <span className="rounded-lg border border-default bg-surface px-4 py-2 text-xs text-secondary">
                What are your flagship products?
              </span>
              <span className="rounded-lg border border-default bg-surface px-4 py-2 text-xs text-secondary">
                Which industries do you serve?
              </span>
              <span className="rounded-lg border border-default bg-surface px-4 py-2 text-xs text-secondary">
                What makes your solution different?
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

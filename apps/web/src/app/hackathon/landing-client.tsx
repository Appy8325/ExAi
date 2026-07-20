"use client";

import { useState } from "react";
import Link from "next/link";

import type { ShowcaseExhibitor } from "@concourse/api-client";

const industryGradients: Record<string, string> = {
  Technology: "from-blue-600 to-indigo-600",
  "Cloud Computing": "from-orange-500 to-amber-600",
  "Semiconductors & AI": "from-green-600 to-emerald-600",
  "Enterprise Software": "from-sky-500 to-blue-600",
  Software: "from-red-500 to-rose-600",
  "Technology & Consulting": "from-indigo-500 to-purple-600",
  "Automotive & Energy": "from-red-600 to-orange-600",
};

function getGradient(industry: string): string {
  return industryGradients[industry] ?? "from-brand/60 to-brand/40";
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: "America/Los_Angeles",
    });
  } catch {
    return dateStr;
  }
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

  const featured = exhibitors.slice(0, 6);

  const filtered = exhibitors.filter((e) => {
    const matchSearch =
      !search ||
      e.companyName.toLowerCase().includes(search.toLowerCase()) ||
      e.industry.toLowerCase().includes(search.toLowerCase()) ||
      e.tagline.toLowerCase().includes(search.toLowerCase());
    const matchIndustry = !selectedIndustry || e.industry === selectedIndustry;
    return matchSearch && matchIndustry;
  });

  const displayList = search || selectedIndustry ? filtered : featured;
  const isFiltered = Boolean(search || selectedIndustry);

  return (
    <div className="mx-auto max-w-7xl px-6 sm:px-10">
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand-subtle px-4 py-1.5 text-xs font-semibold text-brand">
            <span className="size-1.5 rounded-full bg-brand animate-pulse" />
            AI Native Trade Show
          </span>

          <h1 className="mt-6 text-5xl font-bold tracking-tight text-primary sm:text-6xl lg:text-7xl">
            TechExpo{" "}
            <span className="bg-gradient-to-r from-brand to-violet-400 bg-clip-text text-transparent">
              2027
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-lg text-secondary leading-relaxed">
            The future of technology is here. Walk the expo floor, discover
            groundbreaking products, and experience AI-powered lead intelligence.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-muted">
            <span className="inline-flex items-center gap-1.5">
              <svg className="size-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="1" y="2" width="14" height="12" rx="2" />
                <path d="M1 6h14" />
                <path d="M5 1v3M11 1v3" />
              </svg>
              May 12–14, 2027
            </span>
            <span className="inline-flex items-center gap-1.5">
              <svg className="size-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M8 1C5.2 1 3 3.2 3 6c0 3.5 5 9 5 9s5-5.5 5-9c0-2.8-2.2-5-5-5z" />
                <circle cx="8" cy="6" r="2" />
              </svg>
              Los Angeles Convention Center
            </span>
            <span className="inline-flex items-center gap-1.5">
              <svg className="size-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="10" height="10" rx="2" />
                <path d="M5 7h6M5 9h4" />
              </svg>
              {count} exhibitors
            </span>
          </div>

          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/hackathon/expo"
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-brand px-8 text-base font-semibold text-on-brand shadow-premium transition-all hover:bg-brand-hover hover:shadow-2"
            >
              Browse All Exhibitors
              <svg className="size-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 4l4 4-4 4" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      <section className="pb-16 sm:pb-24">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
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
          <h2 className="text-lg font-semibold text-primary">
            {isFiltered ? "Results" : "Featured Exhibitors"}
          </h2>
          {!isFiltered && (
            <Link
              href="/hackathon/expo"
              className="text-sm font-medium text-brand transition-colors hover:text-brand-hover"
            >
              View all &rarr;
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
              <Link
                key={exhibitor.id}
                href={
                  exhibitor.publicQrToken
                    ? `/visit/${exhibitor.publicQrToken}`
                    : "#"
                }
                className="group relative overflow-hidden rounded-2xl border border-default bg-surface shadow-1 transition-all hover:shadow-premium hover:-translate-y-0.5"
              >
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
                  {exhibitor.products.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {exhibitor.products.slice(0, 3).map((p) => (
                        <span
                          key={p}
                          className="rounded-md bg-sunken/60 px-2 py-0.5 text-[11px] font-medium text-muted"
                        >
                          {p}
                        </span>
                      ))}
                      {exhibitor.products.length > 3 && (
                        <span className="rounded-md bg-sunken/60 px-2 py-0.5 text-[11px] font-medium text-muted">
                          +{exhibitor.products.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-brand">
                    Open Booth
                    <svg className="size-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 4l4 4-4 4" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!isFiltered && (
          <div className="mt-10 text-center">
            <Link
              href="/hackathon/expo"
              className="inline-flex h-12 items-center gap-2 rounded-xl border border-default bg-surface px-8 text-base font-medium text-secondary transition-colors hover:bg-sunken hover:text-primary"
            >
              Browse All {count} Exhibitors
              <svg className="size-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 4l4 4-4 4" />
              </svg>
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";

import type { ShowcaseExhibitor } from "@concourse/api-client";

const industryGradients: Record<string, string> = {
  Technology: "from-blue-600 to-indigo-700",
  "Semiconductors & AI": "from-green-600 to-emerald-700",
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

function AnimatedCounter({ end, suffix = "" }: { end: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (started) return;
    setStarted(true);
    const duration = 2000;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [end, started]);

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
      <div className="relative overflow-hidden rounded-2xl border border-default bg-white p-3 shadow-xl">
        <Image
          src="/qr/hackathon-event.png"
          alt="TechExpo 2027 Event QR Code"
          width={200}
          height={200}
          className="rounded-lg"
          unoptimized
        />
        <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-on-brand shadow-lg">
          E
        </div>
      </div>
      <p className="mt-3 text-xs text-muted">Scan to enter TechExpo 2027</p>
    </div>
  );
}

function ExhibitorCard({ exhibitor }: { exhibitor: ShowcaseExhibitor }) {
  return (
    <Link
      href={exhibitor.publicQrToken ? `/visit/${exhibitor.publicQrToken}` : "#"}
      className="group relative block overflow-hidden rounded-2xl border border-default bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className={`h-24 bg-gradient-to-br ${getGradient(exhibitor.industry)} p-4`}>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
          <span className="text-lg font-bold text-white">
            {exhibitor.companyName.charAt(0)}
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-semibold text-primary">
              {exhibitor.companyName}
            </h3>
            <p className="mt-0.5 text-xs text-gray-500">
              Booth {exhibitor.boothNumber ?? "—"}
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
            {exhibitor.industry}
          </span>
        </div>

        <p className="mt-2 line-clamp-2 text-sm text-gray-600 leading-relaxed">
          {exhibitor.tagline}
        </p>

        {exhibitor.products && exhibitor.products.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {exhibitor.products.slice(0, 4).map((p) => (
              <span
                key={p}
                className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-600"
              >
                {p}
              </span>
            ))}
          </div>
        )}

        <div className="mt-4 flex items-center gap-2">
          <span className="flex-1 rounded-lg bg-brand px-3 py-2 text-center text-xs font-semibold text-white shadow-sm transition-colors group-hover:bg-brand-hover">
            Visit Booth
          </span>
          <span className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition-colors group-hover:border-brand group-hover:text-brand">
            <svg className="size-3" fill="none" stroke="currentColor" viewBox="0 0 16 16">
              <circle cx="8" cy="8" r="6" strokeWidth="1.5" />
              <path d="M8 5v3l2 2" strokeWidth="1.5" />
            </svg>
            Ask AI
          </span>
        </div>
      </div>
    </Link>
  );
}

export function HackathonLandingClient({
  exhibitors,
  count: _count,
}: {
  exhibitors: ShowcaseExhibitor[];
  count: number;
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
    <div className="min-h-screen bg-white">
      <section
        className={`relative min-h-screen flex flex-col items-center justify-center px-6 py-16 transition-all duration-1000 ${
          heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50 via-white to-white" />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />

        <div className="relative z-10 flex max-w-6xl flex-col items-center">
          <div className="mb-8">
            <EventQR />
          </div>

          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-semibold text-blue-600">
            <span className="size-1.5 rounded-full bg-blue-500 animate-pulse" />
            Live Event • September 2027
          </span>

          <h1 className="text-center text-5xl font-bold tracking-tight text-primary sm:text-6xl lg:text-7xl">
            TechExpo{" "}
            <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
              2027
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-center text-xl text-gray-600 leading-relaxed">
            Experience the Future of AI-Powered Trade Shows
          </p>

          <p className="mt-3 max-w-lg text-center text-sm text-gray-500 leading-relaxed">
            A live demonstration of AI-powered attendee engagement
          </p>

          <button
            type="button"
            onClick={scrollToExhibition}
            className="mt-10 inline-flex h-14 items-center gap-3 rounded-2xl bg-gray-900 px-10 text-base font-semibold text-white shadow-xl transition-all duration-300 hover:bg-gray-800 hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0"
          >
            Enter Exhibition
            <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 16 16">
              <path strokeWidth="2" d="M8 3v10M3 8l5 5 5-5" />
            </svg>
          </button>

          <div className="mt-16 w-full max-w-3xl">
            <div className="text-center">
              <span className="text-3xl">👋</span>
              <h2 className="mt-2 text-xl font-semibold text-primary">
                Welcome to TechExpo 2027
              </h2>
              <p className="mt-1 text-sm text-gray-500">New here? Follow this journey.</p>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-5">
              {JOURNEY_STEPS.map((step, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm transition-all hover:border-blue-200 hover:shadow-md"
                >
                  <span className="text-2xl">{step.icon}</span>
                  <p className="mt-2 text-xs font-semibold text-primary">{step.title}</p>
                  <p className="mt-1 text-xs text-gray-500">{step.desc}</p>
                </div>
              ))}
            </div>

            <p className="mt-6 text-center text-sm text-gray-500">
              <span className="font-medium text-gray-700">Estimated time:</span> 2–3 minutes
            </p>
          </div>

          <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-5">
            {[
              { icon: "📍", label: "Moscone Center", sub: "San Francisco" },
              { icon: "📅", label: "September 2027", sub: "" },
              { icon: "🏢", label: <><AnimatedCounter end={10} /><span className="ml-1">Exhibitors</span></>, sub: "" },
              { icon: "👥", label: <><AnimatedCounter end={18500} suffix="+" /><span className="ml-1">Attendees</span></>, sub: "(Demo)" },
              { icon: "🤖", label: "AI at Every", sub: "Booth" },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <span className="text-xl">{item.icon}</span>
                <p className="mt-1 text-sm font-semibold text-primary">
                  {typeof item.label === 'object' ? item.label : item.label}
                </p>
                <p className="text-xs text-gray-500">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        ref={exhibitionRef}
        className="scroll-mt-8 border-t border-default bg-sunken py-16"
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-primary">Featured Exhibitors</h2>
            <p className="mt-2 text-gray-600">
              Discover groundbreaking innovations from industry leaders
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <svg
                className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 16 16"
              >
                <circle cx="7" cy="7" r="5" strokeWidth="2" />
                <path strokeWidth="2" d="M11 11l4 4" />
              </svg>
              <input
                type="text"
                placeholder="Search companies..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm text-primary placeholder-gray-400 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedIndustry(null)}
                className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-all ${
                  !selectedIndustry
                    ? "border-blue-500 bg-blue-500 text-white"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                }`}
              >
                All
              </button>
              {industries.map((ind) => (
                <button
                  key={ind}
                  type="button"
                  onClick={() => setSelectedIndustry(selectedIndustry === ind ? null : ind)}
                  className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-all ${
                    selectedIndustry === ind
                      ? "border-blue-500 bg-blue-500 text-white"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
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
            <div className="mt-12 text-center">
              <p className="text-gray-500">No exhibitors found matching your search.</p>
            </div>
          )}
        </div>
      </section>

      <footer className="border-t border-gray-200 bg-white py-8">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <p className="text-sm text-gray-500">
            TechExpo 2027 • Powered by ExAi • No sign-up required
          </p>
        </div>
      </footer>
    </div>
  );
}
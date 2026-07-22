"use client";

import { useRef, useState, useEffect, type ReactNode } from "react";
import Link from "next/link";
import { StatusBadge } from "@concourse/ui";
import { LiveDemoStats } from "@/components/demo/live-demo-stats";

export default function MarketingHomePage() {
  return (
    <main>
      <HeroSection />
      <PersonasSection />
      <LiveDemoStats />
      <HowExAiWorks />
      <CTASection />
    </main>
  );
}

/* ------------------------------------------------------------------ */
/*  Scroll-triggered fade-in wrapper                                  */
/* ------------------------------------------------------------------ */

function FadeIn({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -60px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="transition-all duration-700 ease-out gpu-layer"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(16px)",
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero                                                              */
/* ------------------------------------------------------------------ */

function HeroSection() {
  return (
    <section className="relative overflow-hidden px-6 pb-24 pt-20 sm:px-10 sm:pb-32 sm:pt-28">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-40 -z-10 mx-auto h-[600px] max-w-5xl rounded-full bg-gradient-to-tr from-brand/40 via-status-ai-solid/25 to-status-info-solid/25 blur-3xl"
      />
      <div className="mx-auto max-w-4xl text-center">
        <FadeIn>
          <StatusBadge tone="brand">AI-native trade show intelligence</StatusBadge>
        </FadeIn>

        <FadeIn delay={100}>
          <h1 className="mt-8 text-4xl font-bold tracking-tight text-primary sm:text-5xl lg:text-6xl">
            Trade shows that{" "}
            <span className="bg-gradient-to-br from-brand to-status-ai-solid bg-clip-text text-transparent">
              think
            </span>
          </h1>
        </FadeIn>

        <FadeIn delay={200}>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-secondary sm:text-xl">
            ExAi turns every handshake into a lasting relationship. Exhibitors
            capture leads in seconds, attendees stay in control of their data,
            and organizers see the full event in real time — all powered by AI.
          </p>
        </FadeIn>

        <FadeIn delay={300}>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/demo"
              className="btn-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 inline-flex h-12 items-center rounded-xl bg-brand px-8 text-title-sm font-semibold text-on-brand shadow-2 transition-all duration-[var(--mq-duration-fast)] ease-[var(--mq-ease-standard)] will-change-transform hover:bg-brand-hover hover:shadow-3 hover:scale-[1.02]"
            >
              Try the live demo
              <ChevronRight className="ml-2 size-4" />
            </Link>
            <Link
              href="/auth"
              className="btn-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 inline-flex h-12 items-center rounded-xl border border-strong bg-surface px-8 text-body-lg font-medium text-primary transition-all duration-[var(--mq-duration-fast)] ease-[var(--mq-ease-standard)] will-change-transform hover:bg-sunken hover:scale-[1.02]"
            >
              Sign in
            </Link>
          </div>
        </FadeIn>

        <FadeIn delay={400}>
          <div className="mx-auto mt-20 max-w-3xl">
            <HeroVisual />
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* Abstract illustration showing the four-node flow */
function HeroVisual() {
  const brand = "var(--mq-text-link, #4f46e5)";
  const surface = "var(--mq-bg-surface, #fff)";
  const subtle = "var(--mq-bg-brand-subtle, #eef2ff)";
  const secondary = "var(--mq-text-secondary, #64748b)";
  return (
    <svg viewBox="0 0 640 240" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
      {/* Nodes */}
      <circle cx="120" cy="120" r="48" stroke={brand} strokeWidth="1" fill={surface} opacity="0.5" />
      <circle cx="320" cy="60" r="48" stroke={brand} strokeWidth="1" fill={surface} opacity="0.5" />
      <circle cx="320" cy="180" r="48" stroke={brand} strokeWidth="1" fill={surface} opacity="0.5" />
      <circle cx="520" cy="120" r="48" stroke={brand} strokeWidth="1" fill={surface} opacity="0.5" />
      {/* Connecting lines */}
      <path d="M168 120 L272 60" stroke={brand} strokeWidth="1" opacity="0.15" />
      <path d="M168 120 L272 180" stroke={brand} strokeWidth="1" opacity="0.15" />
      <path d="M368 60 L472 120" stroke={brand} strokeWidth="1" opacity="0.15" />
      <path d="M368 180 L472 120" stroke={brand} strokeWidth="1" opacity="0.15" />
      {/* Node 1 - QR */}
      <g transform="translate(120, 120)">
        <rect x="-12" y="-12" width="24" height="24" rx="6" fill={subtle} stroke="none" />
        <path d="M-5-5h4v4h-4zM3-5h4v4h-4zM-5 3h4v4h-4z" stroke={brand} strokeWidth="1.2" fill="none" strokeLinejoin="round" />
        <path d="M3 3h4" stroke={brand} strokeWidth="1.2" />
      </g>
      {/* Node 2 - Brain */}
      <g transform="translate(320, 60)">
        <rect x="-12" y="-12" width="24" height="24" rx="6" fill={subtle} stroke="none" />
        <path d="M-4-4L0 0 4-4M-4 4L0 0 4 4" stroke={brand} strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="0" cy="0" r="5" stroke={brand} strokeWidth="1.2" fill="none" />
      </g>
      {/* Node 3 - Document */}
      <g transform="translate(320, 180)">
        <rect x="-12" y="-12" width="24" height="24" rx="6" fill={subtle} stroke="none" />
        <rect x="-5" y="-6" width="10" height="12" rx="1" stroke={brand} strokeWidth="1.2" fill="none" />
        <path d="M-3-2h6M-3 1h4M-3 4h2" stroke={brand} strokeWidth="1" strokeLinecap="round" />
      </g>
      {/* Node 4 - Screen */}
      <g transform="translate(520, 120)">
        <rect x="-12" y="-12" width="24" height="24" rx="6" fill={subtle} stroke="none" />
        <rect x="-6" y="-6" width="12" height="10" rx="1" stroke={brand} strokeWidth="1.2" fill="none" />
        <path d="M-4-2l2-3 2 2 2-4 2 5" stroke={brand} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M-3 6h6" stroke={brand} strokeWidth="1.2" />
      </g>
      {/* Labels */}
      <text x="120" y="190" textAnchor="middle" fill={secondary} fontSize="12" fontWeight="500">Scan QR</text>
      <text x="320" y="42" textAnchor="middle" fill={secondary} fontSize="12" fontWeight="500">AI understands</text>
      <text x="320" y="250" textAnchor="middle" fill={secondary} fontSize="12" fontWeight="500">Lead generated</text>
      <text x="520" y="190" textAnchor="middle" fill={secondary} fontSize="12" fontWeight="500">Dashboards</text>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  One Platform, Three Roles                                         */
/* ------------------------------------------------------------------ */

function PersonasSection() {
  const personas = [
    {
      role: "Organizer",
      color: "bg-brand",
      icon: OrganizerIcon,
      desc: "Full control over the event lifecycle — manage exhibitors, see real-time analytics, and generate reports from one dashboard.",
      cta: "View organizer demo",
      href: "/demo/organizer",
      illustration: OrganizerIllo,
    },
    {
      role: "Exhibitor",
      color: "bg-status-success-solid",
      icon: ExhibitorIcon,
      desc: "Live visitor pipeline, AI-powered insights, relationship workspace, notes, and follow-up tracking for your entire booth team.",
      cta: "View exhibitor demo",
      href: "/demo",
      illustration: ExhibitorIllo,
    },
    {
      role: "Attendee",
      color: "bg-status-ai-solid",
      icon: AttendeeIcon,
      desc: "Browse exhibitors, get personalized AI recommendations, scan QR codes, and manage your profile. Mobile-first and privacy-first.",
      cta: "View attendee demo",
      href: "/demo",
      illustration: AttendeeIllo,
    },
  ];

  return (
    <section className="px-6 py-20 sm:px-10 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <FadeIn>
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
              One platform, three roles
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-secondary">
              ExAi serves everyone at a trade show — each with their own
              dedicated experience powered by the same intelligence layer.
            </p>
          </div>
        </FadeIn>

        <div className="mt-16 grid gap-6 sm:grid-cols-3">
          {personas.map((p, i) => (
            <FadeIn key={p.role} delay={i * 100}>
              <div className="group relative rounded-2xl border border-default bg-surface p-6 shadow-1 transition-all duration-[var(--mq-duration-moderate)] ease-[var(--mq-ease-standard)] will-change-transform hover:-translate-y-1 hover:shadow-card-hover">
                <div className={`mb-4 flex size-12 items-center justify-center rounded-xl ${p.color}/10`}>
                  <p.icon className={`size-6 ${p.color === "bg-brand" ? "text-brand" : p.color === "bg-status-success-solid" ? "text-status-success-text" : "text-status-ai-text"}`} />
                </div>
                <h3 className="text-lg font-semibold text-primary">{p.role}</h3>
                <p className="mt-2 text-body leading-relaxed text-secondary">{p.desc}</p>
                <Link
                  href={p.href}
                  className="mt-5 inline-flex items-center gap-1 text-body font-medium text-brand transition-colors hover:text-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {p.cta}
                  <ChevronRight className="size-3.5 transition-transform duration-[var(--mq-duration-fast)] group-hover:translate-x-0.5" />
                </Link>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  How ExAi Works + What You Get — combined storytelling             */
/* ------------------------------------------------------------------ */

function HowExAiWorks() {
  const steps = [
    {
      icon: ScanQrIcon,
      title: "Scan QR",
      desc: "Attendees scan a booth QR to connect instantly — no forms, no friction.",
    },
    {
      icon: AiUnderstandIcon,
      title: "AI understands intent",
      desc: "ExAi reads profile signals to infer interests, role, and buying intent.",
    },
    {
      icon: LeadIntelIcon,
      title: "Lead intelligence",
      desc: "Summaries, talking points, and follow-up priorities appear automatically.",
    },
    {
      icon: DashboardIcon,
      title: "Dashboards update",
      desc: "Organizer and exhibitor dashboards refresh in real time with live data.",
    },
  ];

  const benefits = [
    {
      icon: QrFeatureIcon,
      title: "Instant lead capture",
      desc: "One QR scan creates a rich, AI-enriched relationship record — no business cards, no manual entry.",
    },
    {
      icon: AiFeatureIcon,
      title: "AI-powered insights",
      desc: "Auto-generated summaries, talking points, buying-intent analysis, and follow-up suggestions for every lead.",
    },
    {
      icon: EnrichmentIcon,
      title: "Progressive enrichment",
      desc: "Attendees control their profile. As they share more, dashboards update in real time.",
    },
    {
      icon: MemoryFeatureIcon,
      title: "Cross-event memory",
      desc: "ExAi remembers context across events — so relationships build year after year, not from scratch.",
    },
  ];

  return (
    <section className="border-y border-default/50 bg-sunken/30 px-6 py-20 sm:px-10 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <FadeIn>
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
              How ExAi works
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-secondary">
              From scan to insight in seconds — no manual data entry required.
            </p>
          </div>
        </FadeIn>

        <div className="relative mt-16 grid gap-8 md:grid-cols-2 md:gap-12">
          {/* Left: How it works flow */}
          <div>
            <h3 className="mb-8 text-body font-semibold uppercase tracking-widest text-muted">The flow</h3>
            <div className="space-y-8">
              {steps.map((step, i) => (
                <FadeIn key={step.title} delay={i * 80}>
                  <div className="flex items-start gap-4">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-brand/20 bg-surface shadow-1">
                      <step.icon className="size-5 text-brand" />
                    </div>
                    <div className="min-w-0 pt-1">
                      <h4 className="text-body font-semibold text-primary">{step.title}</h4>
                      <p className="mt-0.5 text-body leading-relaxed text-secondary">{step.desc}</p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>

          {/* Right: Benefits */}
          <div>
            <h3 className="mb-8 text-body font-semibold uppercase tracking-widest text-muted">What you get</h3>
            <div className="space-y-8">
              {benefits.map((b, i) => (
                <FadeIn key={b.title} delay={i * 80}>
                  <div className="flex items-start gap-4">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand-subtle text-brand">
                      <b.icon className="size-5" />
                    </div>
                    <div className="min-w-0 pt-1">
                      <h4 className="text-body font-semibold text-primary">{b.title}</h4>
                      <p className="mt-0.5 text-body leading-relaxed text-secondary">{b.desc}</p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>

        {/* Visual divider with decorative element */}
        <div aria-hidden="true" className="mx-auto mt-16 flex items-center justify-center gap-3">
          <span className="h-px w-12 bg-gradient-to-r from-transparent to-border-default" />
          <span className="flex size-2 rounded-full border border-border-default" />
          <span className="h-px w-12 bg-gradient-to-l from-transparent to-border-default" />
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Call To Action                                                    */
/* ------------------------------------------------------------------ */

function CTASection() {
  return (
    <section className="px-6 pb-28 pt-16 sm:px-10 sm:pb-36 sm:pt-24">
      <div className="mx-auto max-w-3xl text-center">
        <FadeIn>
          <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            Ready to see it in action?
          </h2>
        </FadeIn>
        <FadeIn delay={100}>
          <p className="mx-auto mt-4 max-w-xl text-lg text-secondary">
            Experience the organizer dashboard, exhibitor workspace, and
            attendee journey — all in one interactive demo.
          </p>
        </FadeIn>
        <FadeIn delay={200}>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/demo"
              className="btn-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 inline-flex h-12 items-center rounded-xl bg-brand px-8 text-title-sm font-semibold text-on-brand shadow-2 transition-all duration-[var(--mq-duration-fast)] ease-[var(--mq-ease-standard)] will-change-transform hover:bg-brand-hover hover:shadow-3 hover:scale-[1.02]"
            >
              Open demo
              <ChevronRight className="ml-2 size-4" />
            </Link>
            <Link
              href="/auth"
              className="btn-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 inline-flex h-12 items-center rounded-xl border border-strong bg-surface px-8 text-body-lg font-medium text-primary transition-all duration-[var(--mq-duration-fast)] ease-[var(--mq-ease-standard)] will-change-transform hover:bg-sunken hover:scale-[1.02]"
            >
              Sign in
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  SVG Icons — consistent visual language (32×32 viewBox, 1.5px      */
/*  stroke, rounded caps/joins)                                       */
/* ================================================================== */

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 4l4 4-4 4" />
    </svg>
  );
}

/* ---- How ExAi Works icons ---- */

function ScanQrIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="8" y="3" width="16" height="26" rx="3" />
      <rect x="10.5" y="7" width="11" height="14" rx="1.5" />
      <rect x="12" y="9" width="2" height="2" rx="0.4" fill="currentColor" stroke="none" />
      <rect x="18" y="9" width="2" height="2" rx="0.4" fill="currentColor" stroke="none" />
      <rect x="12" y="13" width="2" height="2" rx="0.4" fill="currentColor" stroke="none" />
      <rect x="18" y="17" width="2" height="2" rx="0.4" fill="currentColor" stroke="none" />
      <line x1="10.5" y1="16" x2="21.5" y2="16" strokeWidth="1" strokeDasharray="1 2" opacity="0.5" />
    </svg>
  );
}

function AiUnderstandIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 6c-3 0-5 1.8-5 4s1.5 3.5 1.5 5.5S7 18 7 20c0 2.2 2.2 4 5 4h8c2.8 0 5-1.8 5-4 0-2-1.5-3.5-1.5-5.5S23 11.8 23 10c0-2.2-2-4-5-4h-6z" />
      <path d="M12 10l3 3-3 3M17 10l3 3-3 3" strokeWidth="1.2" />
      <circle cx="16" cy="20" r="1" fill="currentColor" stroke="none" />
      <path d="M16 4v2M16 24v2" strokeWidth="1" opacity="0.5" />
    </svg>
  );
}

function LeadIntelIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="4" width="20" height="24" rx="2" />
      <rect x="9" y="9" width="14" height="2" rx="0.5" fill="currentColor" stroke="none" opacity="0.3" />
      <rect x="9" y="13" width="10" height="2" rx="0.5" fill="currentColor" stroke="none" opacity="0.3" />
      <rect x="9" y="17" width="12" height="2" rx="0.5" fill="currentColor" stroke="none" opacity="0.3" />
      <rect x="9" y="21" width="6" height="2" rx="0.5" fill="currentColor" stroke="none" opacity="0.3" />
      <path d="M24 8l2 2-2 2" strokeWidth="1.2" />
      <path d="M27 7l1 1-1 1" strokeWidth="1" />
    </svg>
  );
}

function DashboardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="24" height="18" rx="2" />
      <rect x="6" y="7" width="20" height="12" rx="1" fill="currentColor" fillOpacity="0.06" stroke="none" />
      <path d="M9 15l3-4 3 2 3-5 3 7" strokeWidth="1.2" />
      <circle cx="9" cy="15" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="12" cy="11" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="15" cy="13" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="18" cy="8" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="21" cy="15" r="0.8" fill="currentColor" stroke="none" />
      <path d="M8 24h16v2H8z" />
    </svg>
  );
}

/* ---- Persona icons — cohesive 32×32 family ---- */

function OrganizerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="7" width="24" height="21" rx="3" />
      <rect x="7" y="11" width="7" height="5" rx="1" fill="currentColor" stroke="none" opacity="0.25" />
      <rect x="18" y="11" width="7" height="5" rx="1" fill="currentColor" stroke="none" opacity="0.25" />
      <rect x="7" y="18" width="7" height="5" rx="1" fill="currentColor" stroke="none" opacity="0.25" />
      <rect x="18" y="18" width="7" height="5" rx="1" fill="currentColor" stroke="none" opacity="0.25" />
      <path d="M11 7V4a2 2 0 012-2h6a2 2 0 012 2v3" />
      <circle cx="16" cy="13" r="2" fill="currentColor" stroke="none" opacity="0.5" />
      <path d="M16 20v3M14 21h4" strokeWidth="1.2" opacity="0.5" />
    </svg>
  );
}

function ExhibitorIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="13" width="24" height="15" rx="3" />
      <rect x="7" y="16" width="18" height="4" rx="1" fill="currentColor" stroke="none" opacity="0.2" />
      <rect x="7" y="22" width="10" height="3" rx="1" fill="currentColor" stroke="none" opacity="0.2" />
      <path d="M9 13V7a2 2 0 012-2h10a2 2 0 012 2v6" />
      <circle cx="16" cy="5" r="2" fill="currentColor" stroke="none" opacity="0.4" />
      <path d="M16 8v2" strokeWidth="1.2" opacity="0.5" />
    </svg>
  );
}

function AttendeeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="16" cy="8" r="5" />
      <path d="M5 28c0-5.5 4.5-10 11-10s11 4.5 11 10" />
      <rect x="23" y="3" width="8" height="8" rx="2" opacity="0.5" />
      <path d="M25 6l2 2 3-3" strokeWidth="1.2" />
    </svg>
  );
}

/* ---- Persona illustrations — larger 48×48 decorative ---- */

function OrganizerIllo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="10" width="36" height="32" rx="4" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
      <rect x="10" y="15" width="10" height="6" rx="1.5" fill="currentColor" opacity="0.12" />
      <rect x="28" y="15" width="10" height="6" rx="1.5" fill="currentColor" opacity="0.12" />
      <rect x="10" y="24" width="10" height="6" rx="1.5" fill="currentColor" opacity="0.12" />
      <rect x="28" y="24" width="10" height="6" rx="1.5" fill="currentColor" opacity="0.12" />
      <rect x="10" y="33" width="6" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" opacity="0.4" />
      <rect x="32" y="33" width="6" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" opacity="0.4" />
      <path d="M20 10V6a2 2 0 012-2h4a2 2 0 012 2v4" stroke="currentColor" strokeWidth="1.2" opacity="0.4" />
      <circle cx="24" cy="18" r="2" fill="currentColor" opacity="0.25" />
    </svg>
  );
}

function ExhibitorIllo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="18" width="40" height="24" rx="4" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
      <rect x="8" y="22" width="32" height="6" rx="2" fill="currentColor" opacity="0.08" />
      <rect x="8" y="31" width="14" height="5" rx="1.5" fill="currentColor" opacity="0.08" />
      <rect x="26" y="31" width="14" height="5" rx="1.5" fill="currentColor" opacity="0.08" />
      <path d="M12 18V10a3 3 0 013-3h18a3 3 0 013 3v8" stroke="currentColor" strokeWidth="1.2" opacity="0.4" />
      <circle cx="24" cy="8" r="3" fill="currentColor" opacity="0.15" />
      <circle cx="24" cy="8" r="1.5" fill="currentColor" opacity="0.3" />
    </svg>
  );
}

function AttendeeIllo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
      <circle cx="24" cy="12" r="4" fill="currentColor" opacity="0.1" />
      <path d="M6 42c0-8.8 8-16 18-16s18 7.2 18 16" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
      <rect x="34" y="4" width="12" height="12" rx="3" stroke="currentColor" strokeWidth="1.2" opacity="0.4" />
      <path d="M37 9l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
      <circle cx="24" cy="34" r="2" fill="currentColor" opacity="0.15" />
    </svg>
  );
}

/* ---- Capability icons — 24×24 family ---- */

function QrFeatureIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="5" height="5" rx="1" />
      <rect x="16" y="3" width="5" height="5" rx="1" />
      <rect x="10" y="3" width="4" height="5" rx="1" />
      <rect x="3" y="10" width="5" height="5" rx="1" />
      <path d="M10 12h2v2M12 10V9M16 13h2M18 17v-1M12 17h2" />
      <rect x="3" y="17" width="5" height="5" rx="1" />
    </svg>
  );
}

function AiFeatureIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.5 4 4 1.5-4 1.5-1.5 4-1.5-4-4-1.5 4-1.5 1.5-4z" />
      <path d="M19 15l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z" />
    </svg>
  );
}

function EnrichmentIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="7" r="4" />
      <path d="M3 21c0-4.5 4-8 9-8s9 3.5 9 8" />
      <path d="M18 3l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z" opacity="0.7" />
    </svg>
  );
}

function MemoryFeatureIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M6 3v18M18 3v18M3 12h18" opacity="0.4" />
      <circle cx="12" cy="12" r="2.5" fill="currentColor" opacity="0.15" />
      <path d="M12 9.5v5M9.5 12h5" strokeWidth="1.5" opacity="0.5" />
    </svg>
  );
}

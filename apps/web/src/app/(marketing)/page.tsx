"use client";

import { useRef, useState, useEffect, type ReactNode } from "react";
import Link from "next/link";

export default function MarketingHomePage() {
  return (
    <main>
      <HeroSection />
      <HowExAiWorks />
      <PersonasSection />
      <CapabilitiesSection />
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
      className="transition-all duration-700 ease-out"
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
        className="pointer-events-none absolute inset-x-0 -top-40 -z-10 mx-auto h-[600px] max-w-5xl rounded-full bg-gradient-to-tr from-brand/40 via-violet-500/25 to-sky-400/25 blur-3xl"
      />
      <div className="mx-auto max-w-4xl text-center">
        <FadeIn>
          <span className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand-subtle px-4 py-1.5 text-xs font-semibold text-brand">
            <span className="size-1.5 rounded-full bg-brand animate-pulse" />
            AI-native trade show intelligence
          </span>
        </FadeIn>

        <FadeIn delay={100}>
          <h1 className="mt-8 text-4xl font-bold tracking-tight text-primary sm:text-5xl lg:text-6xl">
            Trade shows that{" "}
            <span className="bg-gradient-to-br from-brand to-violet-600 bg-clip-text text-transparent">
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
              className="btn-press inline-flex h-12 items-center rounded-xl bg-brand px-8 text-base font-semibold text-on-brand shadow-2 transition-all hover:bg-brand-hover hover:shadow-3"
            >
              Try the live demo
              <ChevronRight className="ml-2 size-4" />
            </Link>
            <Link
              href="/auth"
              className="btn-press inline-flex h-12 items-center rounded-xl border border-strong bg-surface px-8 text-base font-medium text-primary transition-all hover:bg-sunken"
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
/*  How ExAi Works — horizontal flow                                  */
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
      title: "Lead intelligence generated",
      desc: "Summaries, talking points, and follow-up priorities appear automatically.",
    },
    {
      icon: DashboardIcon,
      title: "Dashboards update",
      desc: "Organizer and exhibitor dashboards refresh in real time with live data.",
    },
  ];

  return (
    <section className="border-y border-default/50 bg-sunken/30 px-6 py-20 sm:px-10 sm:py-28">
      <div className="mx-auto max-w-5xl">
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

        <div className="relative mt-16 flex flex-col items-start gap-8 md:flex-row md:items-center md:justify-between">
          {steps.map((step, i) => (
            <div key={step.title} className="flex w-full items-center gap-4 md:w-auto md:flex-col md:text-center">
              <FadeIn delay={i * 100}>
                <div className="card-hover flex size-16 shrink-0 items-center justify-center rounded-2xl border border-brand/20 bg-surface shadow-1">
                  <step.icon className="size-7 text-brand" />
                </div>
              </FadeIn>
              <FadeIn delay={i * 100 + 50}>
                <div className="md:mt-3">
                  <h3 className="text-sm font-semibold text-primary">{step.title}</h3>
                  <p className="mt-1 max-w-44 text-xs leading-relaxed text-secondary">{step.desc}</p>
                </div>
              </FadeIn>
            </div>
          ))}

          {/* Connector arrows — visible on md+ */}
          <div aria-hidden className="absolute left-[68px] top-8 hidden md:block" style={{ width: "calc(100% - 136px)" }}>
            <svg className="size-full text-brand/30" viewBox="0 0 600 4" preserveAspectRatio="none">
              <line x1="0" y1="2" x2="600" y2="2" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" />
              <path d="M594 0l4 2-4 2" fill="currentColor" stroke="none" />
            </svg>
          </div>
        </div>
      </div>
    </section>
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
      desc: "Create events, manage exhibitors, see real-time analytics, and generate reports. Full control over the event lifecycle.",
      cta: "View organizer demo",
      href: "/org",
    },
    {
      role: "Exhibitor",
      color: "bg-status-success-solid",
      icon: ExhibitorIcon,
      desc: "Dashboard with live visitor pipeline, AI insights, relationship workspace, notes, and follow-up tracking. Everything your booth team needs.",
      cta: "View exhibitor demo",
      href: "/demo",
    },
    {
      role: "Attendee",
      color: "bg-status-ai-solid",
      icon: AttendeeIcon,
      desc: "Browse exhibitors, get personalized AI recommendations, scan QR codes to connect, manage your profile and consent. Mobile-first experience.",
      cta: "View attendee demo",
      href: "/demo",
    },
  ];

  return (
    <section className="px-6 py-20 sm:px-10 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <FadeIn>
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
              One platform, three roles
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-secondary">
              ExAi serves everyone at a trade show — each with their own
              dedicated experience.
            </p>
          </div>
        </FadeIn>

        <div className="mt-16 grid gap-6 sm:grid-cols-3">
          {personas.map((p, i) => (
            <FadeIn key={p.role} delay={i * 100}>
              <div className="card-hover group rounded-2xl border border-default bg-surface p-6 shadow-1">
                <div className={`mb-4 flex size-12 items-center justify-center rounded-xl ${p.color}/10`}>
                  <p.icon className={`size-6 ${p.color === "bg-brand" ? "text-brand" : p.color === "bg-status-success-solid" ? "text-status-success-text" : "text-status-ai-text"}`} />
                </div>
                <h3 className="text-lg font-semibold text-primary">{p.role}</h3>
                <p className="mt-2 text-sm leading-relaxed text-secondary">{p.desc}</p>
                <Link
                  href={p.href}
                  className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-brand transition-colors hover:text-brand-hover"
                >
                  {p.cta}
                  <ChevronRight className="size-3.5" />
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
/*  Platform Capabilities                                             */
/* ------------------------------------------------------------------ */

function CapabilitiesSection() {
  const capabilities = [
    {
      title: "Instant lead capture",
      desc: "Attendees scan a QR and connect instantly. One tap creates a rich, AI-enriched relationship record.",
      icon: QrFeatureIcon,
    },
    {
      title: "AI-powered insights",
      desc: "Every relationship gets an AI summary, talking points, follow-up suggestions, and buying-intent analysis.",
      icon: AiFeatureIcon,
    },
    {
      title: "Progressive enrichment",
      desc: "Attendees control their profile. As they share more, exhibitor dashboards update automatically.",
      icon: EnrichmentIcon,
    },
    {
      title: "Cross-event memory",
      desc: "ExAi remembers relationships across events. Full context and history carry over year after year.",
      icon: MemoryFeatureIcon,
    },
  ];

  return (
    <section className="border-y border-default/50 bg-sunken/30 px-6 py-20 sm:px-10 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <FadeIn>
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
              Platform capabilities
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-secondary">
              Purpose-built for the speed, privacy, and relationship dynamics of live events.
            </p>
          </div>
        </FadeIn>

        <div className="mt-16 grid gap-5 sm:grid-cols-2">
          {capabilities.map((c, i) => (
            <FadeIn key={c.title} delay={i * 100}>
              <div className="card-hover flex items-start gap-5 rounded-2xl border border-default bg-surface p-5 shadow-1">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-subtle text-brand">
                  <c.icon className="size-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-primary">{c.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-secondary">{c.desc}</p>
                </div>
              </div>
            </FadeIn>
          ))}
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
              className="btn-press inline-flex h-12 items-center rounded-xl bg-brand px-8 text-base font-semibold text-on-brand shadow-2 transition-all hover:bg-brand-hover hover:shadow-3"
            >
              Open demo
            </Link>
            <Link
              href="/auth"
              className="btn-press inline-flex h-12 items-center rounded-xl border border-strong bg-surface px-8 text-base font-medium text-primary transition-all hover:bg-sunken"
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

/* ---- Persona icons ---- */

function OrganizerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="8" width="22" height="20" rx="2" />
      <rect x="8" y="12" width="6" height="4" rx="0.5" fill="currentColor" stroke="none" opacity="0.3" />
      <rect x="18" y="12" width="6" height="4" rx="0.5" fill="currentColor" stroke="none" opacity="0.3" />
      <rect x="8" y="18" width="6" height="4" rx="0.5" fill="currentColor" stroke="none" opacity="0.3" />
      <rect x="18" y="18" width="6" height="4" rx="0.5" fill="currentColor" stroke="none" opacity="0.3" />
      <path d="M12 8V5a2 2 0 012-2h4a2 2 0 012 2v3" />
      <path d="M20 8V5" strokeWidth="1" />
      <path d="M12 8V5" strokeWidth="1" />
    </svg>
  );
}

function ExhibitorIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="14" width="22" height="14" rx="2" />
      <rect x="8" y="17" width="16" height="3" rx="0.5" fill="currentColor" stroke="none" opacity="0.3" />
      <rect x="8" y="22" width="10" height="3" rx="0.5" fill="currentColor" stroke="none" opacity="0.3" />
      <path d="M10 14V8a2 2 0 012-2h8a2 2 0 012 2v6" />
      <rect x="14" y="4" width="4" height="4" rx="1" fill="currentColor" stroke="none" opacity="0.4" />
      <circle cx="16" cy="6" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

function AttendeeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="16" cy="8" r="5" />
      <path d="M6 28c0-5.5 4.5-10 10-10s10 4.5 10 10" />
      <rect x="22" y="4" width="8" height="8" rx="1.5" opacity="0.5" />
      <path d="M24 7l2 2 3-3" strokeWidth="1.2" />
    </svg>
  );
}

/* ---- Capability icons ---- */

function QrFeatureIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="4" height="4" rx="1" />
      <rect x="17" y="3" width="4" height="4" rx="1" />
      <rect x="11" y="3" width="4" height="4" rx="1" />
      <rect x="3" y="11" width="4" height="4" rx="1" />
      <path d="M11 13h2v2M13 11v-1M16 14h1M17 17v-1M13 17h2" />
    </svg>
  );
}

function AiFeatureIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5z" />
      <path d="M19 16l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z" />
    </svg>
  );
}

function EnrichmentIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M3 21c0-4.5 4-8 9-8s9 3.5 9 8" />
      <path d="M18 4l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z" />
    </svg>
  );
}

function MemoryFeatureIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16v16H4z" />
      <path d="M8 4v16M16 4v16M4 12h16" />
      <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" opacity="0.4" />
    </svg>
  );
}

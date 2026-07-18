import Link from "next/link";

export default function MarketingHomePage() {
  return (
    <main>
      <HeroSection />
      <SocialProofBand />
      <FeaturesSection />
      <HowItWorksSection />
      <PersonasSection />
      <AISection />
      <StatsSection />
      <CTASection />
    </main>
  );
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden px-6 pb-28 pt-20 sm:px-10 sm:pb-36 sm:pt-28">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-40 -z-10 mx-auto h-[600px] max-w-5xl rounded-full bg-gradient-to-tr from-brand/40 via-violet-500/25 to-sky-400/25 blur-3xl"
      />
      <div className="mx-auto max-w-4xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand-subtle px-4 py-1.5 text-xs font-semibold text-brand">
          <span className="size-1.5 rounded-full bg-brand animate-pulse" />
          AI-native trade show intelligence
        </span>
        <h1 className="mt-8 text-4xl font-bold tracking-tight text-primary sm:text-5xl lg:text-6xl">
          Trade shows that{" "}
          <span className="bg-gradient-to-br from-brand to-violet-600 bg-clip-text text-transparent">
            think
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-secondary sm:text-xl">
          ExAi turns every handshake into a lasting relationship. Exhibitors
          capture leads in seconds, attendees stay in control of their data,
          and organizers see the full event in real time — all powered by AI.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/demo"
            className="inline-flex h-12 items-center rounded-xl bg-brand px-8 text-base font-semibold text-on-brand shadow-2 transition-all hover:bg-brand-hover hover:shadow-3"
          >
            Try the live demo
            <svg className="ml-2 size-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 4l4 4-4 4" />
            </svg>
          </Link>
          <Link
            href="/auth"
            className="inline-flex h-12 items-center rounded-xl border border-strong bg-surface px-8 text-base font-medium text-primary transition-all hover:bg-sunken"
          >
            Sign in
          </Link>
        </div>
      </div>
      <div
        aria-hidden="true"
        className="mx-auto mt-16 max-w-5xl rounded-2xl border border-default/50 bg-gradient-to-b from-surface to-sunken/50 p-2 shadow-3 sm:p-3"
      >
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-sunken/50 p-1 sm:grid-cols-4 sm:gap-2 sm:p-3">
          {[
            { label: "Dashboard", col: "bg-brand/10" },
            { label: "Relationships", col: "bg-status-success-subtle/60" },
            { label: "AI Insights", col: "bg-status-ai-subtle/60" },
            { label: "Pipeline", col: "bg-violet-100/40" },
          ].map((box) => (
            <div
              key={box.label}
              className="flex aspect-[4/3] items-center justify-center rounded-lg border border-default bg-surface text-sm font-semibold text-secondary shadow-1"
            >
              {box.label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SocialProofBand() {
  const triggers = [
    "Attendees checked in",
    "Relationships created",
    "AI insights generated",
    "Events powered",
  ];
  return (
    <section className="border-y border-default/50 bg-sunken/30 px-6 py-8 sm:px-10">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-10 gap-y-4 text-sm">
        {triggers.map((label) => (
          <div key={label} className="flex items-center gap-2 text-secondary">
            <span className="size-1.5 rounded-full bg-brand" />
            <span className="font-semibold text-primary">5,000+</span> {label}
          </div>
        ))}
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      title: "Instant lead capture",
      desc: "Attendees scan a QR and connect instantly. No forms to fill out, no paper business cards — one tap creates a rich, AI-enriched relationship record.",
      icon: "qr",
    },
    {
      title: "AI-powered insights",
      desc: "Every relationship gets an AI summary, talking points, follow-up suggestions, and buying-intent analysis. Turn booth traffic into qualified pipeline.",
      icon: "ai",
    },
    {
      title: "Progressive enrichment",
      desc: "Attendees control their own profile data. As they share more, exhibitor dashboards automatically update — no manual CRM entry needed.",
      icon: "profile",
    },
    {
      title: "Cross-event memory",
      desc: "ExAi remembers relationships across events. Meet someone at TechExpo, reconnect next year with full context and history already loaded.",
      icon: "memory",
    },
    {
      title: "Organizer analytics",
      desc: "See real-time engagement maps, booth heatmaps, and attendance trends across your entire event. Make data-driven decisions live.",
      icon: "analytics",
    },
    {
      title: "Privacy-first design",
      desc: "Attendees stay in full control. Share professional data, opt in, opt out anytime. No data sold, no tracking without consent.",
      icon: "privacy",
    },
  ];

  return (
    <section className="px-6 py-24 sm:px-10 sm:py-32">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            Purpose-built for trade shows
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-secondary">
            Every feature is designed for the unique dynamics of live events —
            speed, privacy, and lasting relationships.
          </p>
        </div>
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ title, desc, icon }) => (
            <div
              key={title}
              className="group rounded-2xl border border-default bg-surface p-6 shadow-1 transition-all hover:border-strong hover:shadow-2"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-subtle text-brand">
                <FeatureIcon name={icon} />
              </div>
              <h3 className="text-base font-semibold text-primary">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-secondary">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    {
      label: "Organizer creates an event",
      desc: "Set up your trade show in minutes. Add exhibitors, assign booths, configure QR codes, and invite your team.",
    },
    {
      label: "Exhibitors set up their booth",
      desc: "Upload branding, configure AI memory, share QR codes, and invite booth staff. Everything ready before doors open.",
    },
    {
      label: "Attendees scan and connect",
      desc: "Attendees scan any booth QR. One tap and they're connected. Complete a short profile to share with exhibitors.",
    },
    {
      label: "AI enriches relationships",
      desc: "Every interaction generates summaries, talking points, and insights. Exhibitor dashboards update in real time.",
    },
    {
      label: "Exhibitors follow up",
      desc: "After the event, review relationships, add notes, mark pipeline stages, and export leads. Every conversation captured.",
    },
  ];

  return (
    <section className="px-6 py-24 sm:px-10 sm:py-32 bg-sunken/30 border-y border-default/50">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            How it works
          </h2>
        </div>
        <div className="mt-16 space-y-6">
          {steps.map((step, i) => (
            <div
              key={step.label}
              className="flex items-start gap-5 rounded-2xl border border-default bg-surface p-5 shadow-1"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-on-brand">
                {i + 1}
              </div>
              <div>
                <h3 className="text-base font-semibold text-primary">{step.label}</h3>
                <p className="mt-1 text-sm text-secondary">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PersonasSection() {
  const personas = [
    {
      role: "Organizer",
      color: "bg-brand",
      desc: "Create events, manage exhibitors, see real-time analytics, and generate reports. Full control over the event lifecycle.",
      cta: "View organizer demo",
      href: "/org",
    },
    {
      role: "Exhibitor",
      color: "bg-status-success-solid",
      desc: "Dashboard with live visitor pipeline, AI insights, relationship workspace, notes, and follow-up tracking. Everything your booth team needs.",
      cta: "View exhibitor demo",
      href: "/demo",
    },
    {
      role: "Attendee",
      color: "bg-status-ai-solid",
      desc: "Browse exhibitors, get personalized AI recommendations, scan QR codes to connect, manage your profile and consent. Mobile-first experience.",
      cta: "View attendee demo",
      href: "/demo",
    },
  ];

  return (
    <section className="px-6 py-24 sm:px-10 sm:py-32">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            One platform, three roles
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-secondary">
            ExAi serves everyone at a trade show — each with their own
            dedicated experience.
          </p>
        </div>
        <div className="mt-16 grid gap-6 sm:grid-cols-3">
          {personas.map((p) => (
            <div
              key={p.role}
              className="group rounded-2xl border border-default bg-surface p-6 shadow-1 transition-all hover:border-strong hover:shadow-2"
            >
              <div className={`mb-4 h-2 w-12 rounded-full ${p.color}`} />
              <h3 className="text-lg font-semibold text-primary">{p.role}</h3>
              <p className="mt-2 text-sm leading-relaxed text-secondary">{p.desc}</p>
              <Link
                href={p.href}
                className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-brand transition-colors hover:text-brand-hover"
              >
                {p.cta}
                <svg className="size-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 4l4 4-4 4" />
                </svg>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AISection() {
  return (
    <section className="relative overflow-hidden px-6 py-24 sm:px-10 sm:py-32 bg-sunken/30 border-y border-default/50">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -top-20 -z-10 h-[400px] w-[400px] rounded-full bg-gradient-to-br from-violet-400/30 to-brand/20 blur-3xl"
      />
      <div className="mx-auto max-w-4xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-status-ai-border bg-status-ai-subtle px-4 py-1.5 text-xs font-semibold text-status-ai-text">
          <span className="size-1.5 rounded-full bg-status-ai" /> AI engine
        </span>
        <h2 className="mt-6 text-3xl font-bold tracking-tight text-primary sm:text-4xl">
          Intelligence that compounds
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-secondary">
          Every QR scan, every profile update, every note — it all feeds the
          AI. Over time, ExAi builds a uniquely rich picture of each
          relationship, without any manual CRM work.
        </p>
        <div className="mt-12 grid gap-4 text-left sm:grid-cols-3">
          {[
            "Auto-generated relationship summaries after every interaction",
            "Personalized talking points for booth staff before meetings",
            "Follow-up prioritization based on engagement signals and profile completeness",
          ].map((item, i) => (
            <div
              key={i}
              className="rounded-2xl border border-status-ai-border/50 bg-status-ai-subtle/30 p-5"
            >
              <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-status-ai-subtle text-xs font-bold text-status-ai-text">
                AI
              </div>
              <p className="text-sm leading-relaxed text-primary">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatsSection() {
  const metrics = [
    { value: "5,000+", label: "Attendees" },
    { value: "500+", label: "Relationships" },
    { value: "89%", label: "Profile completion" },
    { value: "3 sec", label: "Lead capture" },
  ];
  return (
    <section className="px-6 py-24 sm:px-10 sm:py-32">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-16 gap-y-8 text-center">
        {metrics.map((m) => (
          <div key={m.label}>
            <p className="text-4xl font-bold tracking-tight text-primary sm:text-5xl">
              {m.value}
            </p>
            <p className="mt-2 text-sm font-medium text-secondary">{m.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="px-6 pb-28 pt-16 sm:px-10 sm:pb-36 sm:pt-24">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
          Ready to see it in action?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-secondary">
          Experience the organizer dashboard, exhibitor workspace, and
          attendee journey — all in one interactive demo.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/demo"
            className="inline-flex h-12 items-center rounded-xl bg-brand px-8 text-base font-semibold text-on-brand shadow-2 transition-all hover:bg-brand-hover hover:shadow-3"
          >
            Open demo
          </Link>
          <Link
            href="/auth"
            className="inline-flex h-12 items-center rounded-xl border border-strong bg-surface px-8 text-base font-medium text-primary transition-all hover:bg-sunken"
          >
            Sign in
          </Link>
        </div>
      </div>
    </section>
  );
}

function FeatureIcon({ name }: { name: string }) {
  const cls = "size-5";
  switch (name) {
    case "qr":
      return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="4" height="4" rx="1" /><rect x="17" y="3" width="4" height="4" rx="1" /><rect x="11" y="3" width="4" height="4" rx="1" /><rect x="3" y="11" width="4" height="4" rx="1" /><path d="M11 13h2v2M13 11v-1M16 14h1M17 17v-1M13 17h2" /></svg>;
    case "ai":
      return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5z" /><path d="M19 16l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z" /></svg>;
    case "profile":
      return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="5" /><path d="M3 21c0-5 4-8 9-8s9 3 9 8" /></svg>;
    case "memory":
      return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16v16H4z" /><path d="M8 4v16M16 4v16M4 12h16" /></svg>;
    case "analytics":
      return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 20V10" /><path d="M12 20V4" /><path d="M6 20v-6" /></svg>;
    case "privacy":
      return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22c-4-2-7-5-7-10V6l7-4 7 4v6c0 5-3 8-7 10z" /></svg>;
    default:
      return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /></svg>;
  }
}

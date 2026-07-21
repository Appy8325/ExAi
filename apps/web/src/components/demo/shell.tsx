"use client";

import Link from "next/link";
import { memo, useEffect, useState } from "react";
import { getApiBaseUrl } from "@/lib/api/config";
import { WorkspaceSwitcher } from "@/components/navigation/workspace-switcher";

export type DemoPersona = "organizer" | "exhibitor" | "attendee";

type SimulationStatus = {
  running: boolean;
  eventsGenerated: number;
  scenario: string;
  speed: number;
};

const PERSONA_META: Record<DemoPersona, { label: string; tone: string; href: string; short: string }> = {
  organizer: {
    label: "Organizer",
    short: "Org",
    tone: "border-status-info-border bg-status-info-subtle text-status-info-text",
    href: "/demo/organizer",
  },
  exhibitor: {
    label: "Exhibitor",
    short: "Exh",
    tone: "border-status-success-border bg-status-success-subtle text-status-success-text",
    href: "/demo/exhibitor",
  },
  attendee: {
    label: "Attendee",
    short: "Att",
    tone: "border-status-ai-border bg-status-ai-subtle text-status-ai-text",
    href: "/hackathon",
  },
};

const HOMEPAGE_HREF = "/demo";


export const DemoTopBar = memo(function DemoTopBar({ persona }: { persona?: DemoPersona }) {
  const active = persona ? PERSONA_META[persona] : undefined;
  return (
    <header className="sticky top-0 z-(--mq-z-sticky, 50) border-b border-default/50 bg-canvas/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5 sm:px-8 sm:py-3">
        <Link href="/demo" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-sm font-bold text-on-brand shadow-1">
            E
          </span>
          <span className="text-base font-semibold tracking-tight text-primary">ExAi</span>
          <span className="ml-1 hidden text-xs font-medium text-muted sm:inline">Demo</span>
        </Link>
        <nav
          aria-label="Switch perspective"
          className="flex items-center gap-1.5"
        >
          {(["organizer", "exhibitor", "attendee"] as const).map((p) => {
            const meta = PERSONA_META[p];
            const isActive = persona === p;
            return (
              <Link
                key={p}
                href={meta.href}
                aria-current={isActive ? "page" : undefined}
                className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors sm:px-3 sm:text-xs ${
                  isActive
                    ? meta.tone
                    : "border-default bg-surface text-secondary hover:text-primary"
                }`}
              >
                <span className="hidden sm:inline">{meta.label}</span>
                <span className="sm:hidden">{meta.short}</span>
              </Link>
            );
          })}
          <span className="ml-1 hidden rounded-full border border-brand/30 bg-brand-subtle px-3 py-1 text-xs font-semibold text-brand lg:inline-flex">
            Read-only
          </span>
        </nav>
        <div className="flex items-center gap-2">
          <WorkspaceSwitcher />
          <Link
            href="/"
            aria-label="Back to homepage"
            className="hidden items-center gap-1 rounded-lg border border-default bg-surface px-2.5 py-1.5 text-xs font-medium text-secondary transition-colors hover:border-strong hover:text-primary sm:inline-flex"
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M3 8l10 0M8 3l-5 5 5 5" />
            </svg>
            Home
          </Link>
          <SimulationStatusBadge />
        </div>
      </div>
      {active ? (
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 pb-2 sm:px-8">
          <Link
            href={HOMEPAGE_HREF}
            className="inline-flex items-center gap-1 text-xs font-medium text-link hover:underline"
          >
            <svg
              className="size-3.5"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <path d="M10 12l-4-4 4-4" />
            </svg>
            Experience ExAi
          </Link>
          <Link
            href="/"
            className="sm:hidden inline-flex items-center gap-1 text-xs font-medium text-link hover:underline"
          >
            ← Home
          </Link>
        </div>
      ) : null}
    </header>
  );
});

export type PersonaNavItem = { label: string; href: string; description?: string };

export const DemoSideNav = memo(function DemoSideNav({
  title,
  items,
  currentHref,
}: {
  title: string;
  items: PersonaNavItem[];
  currentHref?: string;
}) {
  return (
    <aside className="hidden w-60 shrink-0 border-r border-default/60 bg-canvas px-4 py-8 sm:block">
      <p className="px-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
        {title}
      </p>
      <nav className="mt-3 space-y-1" aria-label={title}>
        {items.map((item) => {
          const isActive = currentHref === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                isActive
                  ? "bg-sunken font-semibold text-primary"
                  : "text-secondary hover:bg-sunken hover:text-primary"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
});

export const DemoPageHeader = memo(function DemoPageHeader({
  eyebrow,
  title,
  description,
  badge,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  badge?: string;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <p className="text-caption font-semibold uppercase tracking-[0.2em] text-brand">
          {eyebrow}
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-primary sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 max-w-2xl text-sm text-secondary">{description}</p>
        ) : null}
      </div>
      {badge ? (
        <span className="inline-flex items-center gap-1 rounded-full border border-default bg-surface px-2.5 py-1 text-xs font-medium text-secondary">
          <span className="inline-block size-1.5 rounded-full bg-status-ai-solid" />
          {badge}
        </span>
      ) : null}
    </div>
  );
});

export const DemoUnavailable = memo(function DemoUnavailable({ backHref = "/demo" }: { backHref?: string }) {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12 sm:px-10">
      <Link href={backHref} className="text-sm text-link hover:underline">
        Back to demo
      </Link>
      <p className="mt-6 rounded-xl border border-status-danger-border bg-status-danger-subtle p-6 text-sm text-status-danger-text">
        Demo data is unavailable right now. Run{" "}
        <code className="rounded bg-surface px-1.5 py-0.5 text-primary">
          pnpm db:seed
        </code>{" "}
        against a seeded Supabase project to power this showcase.
      </p>
    </div>
  );
});

export const DemoMobileNav = memo(function DemoMobileNav({
  items,
  currentHref,
}: {
  items: PersonaNavItem[];
  currentHref?: string;
}) {
  return (
    <nav
      className="flex gap-2 overflow-x-auto border-b border-default/60 bg-canvas px-6 py-2 sm:hidden"
      aria-label="Section"
    >
      {items.map((item) => {
        const isActive = currentHref === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${
              isActive
                ? "border-brand bg-brand-subtle text-brand"
                : "border-default bg-surface text-secondary"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
});

export function SimulationStatusBadge() {
  const [status, setStatus] = useState<SimulationStatus | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const base = getApiBaseUrl();
        const res = await fetch(`${base}/v1/public/demo/admin/status`);
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setStatus(data.simulation);
      } catch { /* ignore */ }
    };
    load();
    const id = setInterval(load, 8000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  if (!status) return null;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${
        status.running
          ? "border-status-success-border bg-status-success-subtle text-status-success-text"
          : "border-default bg-sunken text-muted"
      }`}
    >
      <span
        className={`size-1.5 rounded-full ${
          status.running ? "bg-status-success-text animate-pulse" : "bg-muted"
        }`}
      />
      {status.running
        ? `Live · ${status.scenario} · ${status.speed}\u00d7`
        : "Simulation stopped"}
    </span>
  );
}

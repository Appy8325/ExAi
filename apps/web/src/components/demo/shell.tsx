"use client";

import Link from "next/link";
import { memo, useEffect, useState } from "react";
import { getApiBaseUrl } from "@/lib/api/config";

type SimulationStatus = {
  running: boolean;
  eventsGenerated: number;
  scenario: string;
  speed: number;
};

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
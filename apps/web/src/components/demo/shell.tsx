"use client";

import Link from "next/link";
import { memo, useEffect, useState } from "react";
import { getApiBaseUrl } from "@/lib/api/config";
import { StatusBadge } from "@concourse/ui";

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
          <p className="mt-1 max-w-2xl text-body text-secondary">{description}</p>
        ) : null}
      </div>
      {badge ? (
        <StatusBadge tone="neutral">{badge}</StatusBadge>
      ) : null}
    </div>
  );
});

export const DemoUnavailable = memo(function DemoUnavailable({ backHref = "/demo" }: { backHref?: string }) {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12 sm:px-10">
      <Link href={backHref} className="text-body text-link hover:underline">
        Back to demo
      </Link>
      <p className="mt-6 rounded-xl border border-status-danger-border bg-status-danger-subtle p-6 text-body text-status-danger-text">
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
    <StatusBadge tone={status.running ? "success" : "neutral"}>
      {status.running
        ? `Live \u00b7 ${status.scenario} \u00b7 ${status.speed}\u00d7`
        : "Simulation stopped"}
    </StatusBadge>
  );
}
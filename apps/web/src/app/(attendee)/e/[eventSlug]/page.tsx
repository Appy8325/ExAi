"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  getPublicEventBySlug,
  getEventExhibitors,
} from "@concourse/api-client";
import type { PublicExhibitor, PublicEvent } from "@concourse/api-client";
import { Skeleton, Input } from "@concourse/ui";
import { getApiBaseUrl } from "@/lib/api/config";

export default function ExhibitorDirectoryPage({
  params,
}: {
  params: Promise<{ eventSlug: string }>;
}) {
  const { eventSlug } = use(params);
  const [event, setEvent] = useState<PublicEvent | null>(null);
  const [exhibitors, setExhibitors] = useState<PublicExhibitor[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const ev = await getPublicEventBySlug(
          { baseUrl: getApiBaseUrl() },
          eventSlug,
        );
        if (cancelled) return;
        setEvent(ev);
        const list = await getEventExhibitors(
          { baseUrl: getApiBaseUrl() },
          ev.id,
        );
        if (cancelled) return;
        setExhibitors(list);
      } catch {
        if (!cancelled) setError("Could not load exhibitors.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [eventSlug]);

  useEffect(() => {
    if (!event) return;
    const timer = setTimeout(async () => {
      try {
        const list = await getEventExhibitors(
          { baseUrl: getApiBaseUrl() },
          event.id,
          search || undefined,
        );
        setExhibitors(list);
      } catch { /* ignore */ }
    }, 200);
    return () => clearTimeout(timer);
  }, [search, event]);

  const featured = exhibitors.slice(0, 3);
  const grouped = exhibitors.reduce<Record<string, PublicExhibitor[]>>(
    (acc, e) => {
      const letter = (e.companyName[0] ?? "#").toUpperCase();
      (acc[letter] ??= []).push(e);
      return acc;
    },
    {},
  );
  const letters = Object.keys(grouped).sort();

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-title-lg font-semibold text-primary">
          {event?.name ?? "Exhibitors"}
        </h1>
        <p className="text-body text-secondary">
          Discover exhibitors and get personalized recommendations.
        </p>
      </header>

      <div className="relative">
        <Input
          placeholder="Search exhibitors..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
        <svg
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-status-danger-border bg-status-danger-subtle px-4 py-3 text-body-sm text-status-danger-text">
          {error}
        </div>
      )}

      {!loading && !error && exhibitors.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-12">
          <div className="flex size-12 items-center justify-center rounded-full bg-sunken text-muted text-xl">
            {search ? "?" : "!"}
          </div>
          <p className="text-body text-secondary">
            {search
              ? "No exhibitors match your search."
              : "No exhibitors available yet."}
          </p>
        </div>
      )}

      {!loading && !error && exhibitors.length > 0 && !search && (
        <section>
          <h2 className="mb-3 text-title font-semibold text-primary">Featured</h2>
          <div className="grid grid-cols-1 gap-3">
            {featured.map((ex) => (
              <ExhibitorCard key={ex.id} exhibitor={ex} eventSlug={eventSlug} />
            ))}
          </div>
        </section>
      )}

      {!loading && !error && exhibitors.length > 0 && (
        <section>
          <h2 className="mb-3 text-title font-semibold text-primary">
            {search ? "Results" : "All Exhibitors"}
          </h2>
          <div className="space-y-1">
            {search
              ? exhibitors.map((ex) => (
                  <ExhibitorCard key={ex.id} exhibitor={ex} eventSlug={eventSlug} compact />
                ))
              : letters.map((letter) => (
                  <div key={letter}>
                    <div className="sticky top-0 bg-canvas py-2 text-title-sm font-semibold text-muted">
                      {letter}
                    </div>
                    <div className="space-y-1">
                       {grouped[letter]!.map((ex) => (
                        <ExhibitorCard
                          key={ex.id}
                          exhibitor={ex}
                          eventSlug={eventSlug}
                          compact
                        />
                      ))}
                    </div>
                  </div>
                ))}
          </div>
        </section>
      )}
    </div>
  );
}

function ExhibitorCard({
  exhibitor,
  eventSlug,
  compact,
}: {
  exhibitor: PublicExhibitor;
  eventSlug: string;
  compact?: boolean;
}) {
  const initials = exhibitor.companyName.slice(0, 2).toUpperCase();
  return (
    <Link
      href={`/e/${eventSlug}/exhibitors/${exhibitor.id}`}
      className={`group flex items-center gap-4 rounded-xl border border-default bg-surface p-4 shadow-1 transition-all duration-[var(--mq-duration-moderate)] hover:border-strong hover:shadow-card-hover ${
        compact ? "min-h-16" : ""
      }`}
    >
      {exhibitor.logoUrl ? (
        <Image
          alt={`${exhibitor.companyName} logo`}
          className="size-12 shrink-0 rounded-lg border border-default object-contain"
          height={48}
          src={exhibitor.logoUrl}
          unoptimized
          width={48}
        />
      ) : (
        <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-brand-subtle text-title-sm font-semibold text-brand">
          {initials}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <h3 className="text-body font-semibold text-primary group-hover:text-brand transition-colors">
          {exhibitor.companyName}
        </h3>
        <p className="truncate text-body-sm text-muted">
          {exhibitor.boothName}
          {exhibitor.boothNumber ? ` · Booth ${exhibitor.boothNumber}` : ""}
        </p>
      </div>
      <svg
        className="shrink-0 text-muted group-hover:text-primary transition-colors"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <path d="M9 18l6-6-6-6" />
      </svg>
    </Link>
  );
}

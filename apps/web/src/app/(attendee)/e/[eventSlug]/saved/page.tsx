"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getPublicEventBySlug, getSavedRelationships } from "@concourse/api-client";
import type { SavedRelationship } from "@concourse/api-client";
import { Skeleton } from "@concourse/ui";
import { getApiBaseUrl } from "@/lib/api/config";
import { createClient } from "@/lib/supabase/client";

export default function SavedExhibitorsPage({
  params,
}: {
  params: Promise<{ eventSlug: string }>;
}) {
  const { eventSlug } = use(params);
  const [saved, setSaved] = useState<SavedRelationship[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const ev = await getPublicEventBySlug({ baseUrl: getApiBaseUrl() }, eventSlug);
        if (cancelled) return;
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const list = await getSavedRelationships(
            { baseUrl: getApiBaseUrl(), accessToken: session.access_token },
            ev.id,
          );
          if (!cancelled) setSaved(list);
        }
      } catch { /* ignore */ }
      if (!cancelled) setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [eventSlug]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-20 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-title-lg font-semibold text-primary">Saved</h1>
        <p className="mt-1 text-body text-secondary">
          {saved.length
            ? `${saved.length} exhibitor${saved.length === 1 ? "" : "s"} saved`
            : "Exhibitors you save will appear here"}
        </p>
      </header>

      {saved.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-12">
          <div className="flex size-12 items-center justify-center rounded-full bg-sunken text-muted">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <p className="text-body text-secondary">No saved exhibitors yet.</p>
          <Link
            href={`/e/${eventSlug}`}
            className="text-body-sm font-medium text-link hover:text-brand-hover"
          >
            Browse exhibitors
          </Link>
        </div>
      )}

      <div className="space-y-2">
        {saved.map((item) => (
          <Link
            key={item.relationshipId}
            href={`/e/${eventSlug}/exhibitors/${item.exhibitor.id}`}
            className="group flex items-center gap-4 rounded-xl border border-default bg-surface p-4 shadow-1 transition-all duration-[var(--mq-duration-moderate)] hover:border-strong hover:shadow-card-hover"
          >
            {item.exhibitor.logoUrl ? (
              <Image
                alt={`${item.exhibitor.companyName} logo`}
                className="size-12 shrink-0 rounded-lg border border-default object-contain"
                height={48}
                src={item.exhibitor.logoUrl}
                unoptimized
                width={48}
              />
            ) : (
              <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-brand-subtle text-title-sm font-semibold text-brand">
                {item.exhibitor.companyName.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="text-body font-semibold text-primary group-hover:text-brand transition-colors">
                {item.exhibitor.companyName}
              </h3>
              <p className="truncate text-body-sm text-muted">
                {item.exhibitor.boothName}
                {item.exhibitor.boothNumber ? ` · Booth ${item.exhibitor.boothNumber}` : ""}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

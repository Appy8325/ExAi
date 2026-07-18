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
        <h1 className="text-display font-semibold text-primary">Saved</h1>
        <p className="mt-1 text-body text-secondary">
          {saved.length
            ? `${saved.length} exhibitor${saved.length === 1 ? "" : "s"} saved`
            : "Exhibitors you save will appear here"}
        </p>
      </header>

      {saved.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-12">
          <div className="text-4xl text-muted">☆</div>
          <p className="text-body text-secondary">
            No saved exhibitors yet.
          </p>
          <Link
            href={`/e/${eventSlug}`}
            className="text-body-sm font-medium text-brand hover:underline"
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
            className="flex items-center gap-4 rounded-xl border border-default bg-surface p-4 transition-all hover:border-strong hover:shadow-2"
          >
            {item.exhibitor.logoUrl ? (
              <Image
                alt={`${item.exhibitor.companyName} logo`}
                className="h-12 w-12 flex-shrink-0 rounded-lg border border-default object-contain"
                height={48}
                src={item.exhibitor.logoUrl}
                unoptimized
                width={48}
              />
            ) : (
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-brand-subtle text-title-sm font-semibold text-brand">
                {item.exhibitor.companyName.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="text-body font-semibold text-primary">
                {item.exhibitor.companyName}
              </h3>
              <p className="truncate text-body-sm text-muted">
                {item.exhibitor.boothName}
                {item.exhibitor.boothNumber
                  ? ` · Booth ${item.exhibitor.boothNumber}`
                  : ""}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

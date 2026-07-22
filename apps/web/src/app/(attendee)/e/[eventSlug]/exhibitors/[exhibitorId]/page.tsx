"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  getEventExhibitor,
  getPublicEventBySlug,
  getPublicShowcase,
  saveExhibitor,
  unsaveExhibitor,
} from "@concourse/api-client";
import type { PublicExhibitor, ShowcaseExhibitor } from "@concourse/api-client";
import { Button, EmptyState, Skeleton } from "@concourse/ui";
import { getApiBaseUrl } from "@/lib/api/config";
import { createClient } from "@/lib/supabase/client";

export default function ExhibitorProfilePage({
  params,
}: {
  params: Promise<{ eventSlug: string; exhibitorId: string }>;
}) {
  const { eventSlug, exhibitorId } = use(params);
  const [exhibitor, setExhibitor] = useState<PublicExhibitor | null>(null);
  const [showcase, setShowcase] = useState<ShowcaseExhibitor | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const ev = await getPublicEventBySlug(
          { baseUrl: getApiBaseUrl() },
          eventSlug,
        );
        if (cancelled) return;
        const [ex, showcaseList] = await Promise.all([
          getEventExhibitor({ baseUrl: getApiBaseUrl() }, ev.id, exhibitorId),
          getPublicShowcase({ baseUrl: getApiBaseUrl() }),
        ]);
        if (cancelled) return;
        setExhibitor(ex);
        setShowcase(
          showcaseList.find((s) => s.id === exhibitorId) ?? null,
        );
      } catch {
        /* handled by null state */
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [eventSlug, exhibitorId]);

  const toggleSave = async () => {
    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const client = { baseUrl: getApiBaseUrl(), accessToken: session.access_token };
      if (saved) {
        await unsaveExhibitor(client, exhibitorId);
        setSaved(false);
      } else {
        await saveExhibitor(client, exhibitorId);
        setSaved(true);
      }
    } catch { /* ignore */ }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }

  if (!exhibitor) {
    return (
      <EmptyState title="Exhibitor not found" description="This exhibitor may no longer be participating." />
    );
  }

  const initials = exhibitor.companyName.slice(0, 2).toUpperCase();

  return (
    <div className="space-y-6">
      <div className="relative h-48 overflow-hidden rounded-2xl bg-gradient-to-br from-brand-subtle to-status-info-subtle">
        {exhibitor.logoUrl ? (
          <div className="absolute inset-0 flex items-center justify-center bg-overlay/10">
            <Image
              alt={`${exhibitor.companyName} logo`}
              className="size-20 rounded-2xl border-2 border-surface object-contain bg-surface shadow-3"
              height={80}
              src={exhibitor.logoUrl}
              unoptimized
              width={80}
            />
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="flex size-20 items-center justify-center rounded-2xl bg-surface/80 text-title-lg font-bold text-brand shadow-3">
              {initials}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-title-lg font-semibold text-primary">
            {exhibitor.companyName}
          </h1>
          <p className="text-body-sm text-muted">
            {exhibitor.boothName}
            {exhibitor.boothNumber ? ` · Booth ${exhibitor.boothNumber}` : ""}
          </p>
        </div>
        <button
          onClick={toggleSave}
          disabled={saving}
          className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 flex size-10 shrink-0 items-center justify-center rounded-full border transition-all duration-[var(--mq-duration-fast)] ${
            saved
              ? "border-brand bg-brand text-on-brand shadow-1"
              : "border-default text-muted hover:border-strong hover:text-primary"
          }`}
          aria-label={saved ? "Unsave exhibitor" : "Save exhibitor"}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      </div>

      {exhibitor.description && (
        <section className="space-y-2">
          <h2 className="text-title-sm font-semibold text-primary">About</h2>
          <p className="text-body text-secondary leading-relaxed">
            {exhibitor.description}
          </p>
        </section>
      )}

      {exhibitor.socialLinks && Object.keys(exhibitor.socialLinks).length > 0 && (
        <section className="space-y-2">
          <h2 className="text-title-sm font-semibold text-primary">Links</h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(exhibitor.socialLinks).map(([key, url]) => (
              <a
                key={key}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-default bg-surface px-3 py-1.5 text-body-sm text-link hover:bg-sunken transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {key}
              </a>
            ))}
          </div>
        </section>
      )}

      {exhibitor.website && (
        <a
          href={exhibitor.website}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-xl border border-default bg-surface p-3 text-body-sm text-link hover:bg-sunken transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20" />
            <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
          </svg>
          Visit website
        </a>
      )}

      <div className="space-y-3 pt-2">
        {showcase?.publicQrToken ? (
          <Link href={`/visit/${showcase.publicQrToken}`} className="block">
            <Button className="w-full">Ask AI about this exhibitor</Button>
          </Link>
        ) : (
          <Link href={`/e/${eventSlug}/exhibitors/${exhibitorId}/insights`} className="block">
            <Button className="w-full">View booth briefing</Button>
          </Link>
        )}
        <div className="flex gap-3">
          {showcase?.brochureUrl && showcase.brochureUrl !== "#" ? (
            <a className="flex-1" href={showcase.brochureUrl} rel="noreferrer" target="_blank">
              <Button className="w-full" variant="secondary">
                Download Brochure
              </Button>
            </a>
          ) : null}
          <Button
            className={showcase?.brochureUrl && showcase.brochureUrl !== "#" ? "flex-1" : "w-full"}
            variant="secondary"
            onClick={toggleSave}
            disabled={saving}
          >
            {saved ? "Saved" : "Connect"}
          </Button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  getEventExhibitor,
  getPublicEventBySlug,
  saveExhibitor,
  unsaveExhibitor,
} from "@concourse/api-client";
import type { PublicExhibitor } from "@concourse/api-client";
import { Button, Skeleton } from "@concourse/ui";
import { getApiBaseUrl } from "@/lib/api/config";
import { createClient } from "@/lib/supabase/client";

export default function ExhibitorProfilePage({
  params,
}: {
  params: Promise<{ eventSlug: string; exhibitorId: string }>;
}) {
  const { eventSlug, exhibitorId } = use(params);
  const [exhibitor, setExhibitor] = useState<PublicExhibitor | null>(null);
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
        const ex = await getEventExhibitor(
          { baseUrl: getApiBaseUrl() },
          ev.id,
          exhibitorId,
        );
        if (cancelled) return;
        setExhibitor(ex);
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
      <div className="flex flex-col items-center gap-3 py-12">
        <p className="text-body text-secondary">Exhibitor not found.</p>
        <Link
          href={`/e/${eventSlug}`}
          className="text-body-sm font-medium text-brand hover:underline"
        >
          Back to directory
        </Link>
      </div>
    );
  }

  const initials = exhibitor.companyName.slice(0, 2).toUpperCase();

  return (
    <div className="space-y-6">
      <div className="relative h-48 overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-100 to-sky-100">
        {exhibitor.logoUrl && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/5">
            <img
              alt={`${exhibitor.companyName} logo`}
              className="h-20 w-20 rounded-2xl border-2 border-white/80 object-contain bg-white shadow-3"
              src={exhibitor.logoUrl}
            />
          </div>
        )}
        {!exhibitor.logoUrl && (
          <div className="flex h-full items-center justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/80 text-display font-bold text-brand shadow-3">
              {initials}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-title-lg font-semibold text-primary">
              {exhibitor.companyName}
            </h1>
            <p className="text-body-sm text-muted">
              {exhibitor.boothName}
              {exhibitor.boothNumber
                ? ` · Booth ${exhibitor.boothNumber}`
                : ""}
            </p>
          </div>
          <button
            onClick={toggleSave}
            disabled={saving}
            className={`flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${
              saved
                ? "border-brand bg-brand text-on-brand"
                : "border-default text-muted hover:border-strong"
            }`}
          >
            {saved ? "★" : "☆"}
          </button>
        </div>
      </div>

      {exhibitor.description && (
        <section>
          <h2 className="mb-2 text-title-sm font-semibold text-primary">
            About
          </h2>
          <p className="text-body text-secondary leading-relaxed">
            {exhibitor.description}
          </p>
        </section>
      )}

      {exhibitor.socialLinks && Object.keys(exhibitor.socialLinks).length > 0 && (
        <section>
          <h2 className="mb-2 text-title-sm font-semibold text-primary">
            Links
          </h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(exhibitor.socialLinks).map(([key, url]) => (
              <a
                key={key}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-default bg-surface px-3 py-1.5 text-body-sm text-link hover:bg-sunken"
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
          className="flex items-center gap-2 rounded-xl border border-default bg-surface p-3 text-body-sm text-link transition-colors hover:bg-sunken"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20" />
            <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
          </svg>
          Visit website
        </a>
      )}

      <section className="grid grid-cols-1 gap-3">
        <div className="rounded-xl border border-default bg-surface p-4">
          <h3 className="text-body-sm font-medium text-muted">Products</h3>
          <p className="mt-1 text-body text-secondary">
            Product information coming soon.
          </p>
        </div>
        <div className="rounded-xl border border-default bg-surface p-4">
          <h3 className="text-body-sm font-medium text-muted">Services</h3>
          <p className="mt-1 text-body text-secondary">
            Service details coming soon.
          </p>
        </div>
        <div className="rounded-xl border border-default bg-surface p-4">
          <h3 className="text-body-sm font-medium text-muted">Resources</h3>
          <p className="mt-1 text-body text-secondary">
            Brochures and downloads coming soon.
          </p>
        </div>
      </section>

      <div className="space-y-3 pt-2">
        <Link href={`/e/${eventSlug}/exhibitors/${exhibitorId}/insights`}>
          <Button className="min-h-12 w-full text-body font-semibold">
            Get Personalized Insights
          </Button>
        </Link>
        <Button
          className="min-h-12 w-full text-body font-medium"
          variant="secondary"
          onClick={toggleSave}
          disabled={saving}
        >
          {saved ? "Saved" : "Connect with Exhibitor"}
        </Button>
        <Button
          className="min-h-12 w-full text-body font-medium"
          variant="ghost"
          disabled
        >
          Book Meeting (Coming Soon)
        </Button>
      </div>
    </div>
  );
}

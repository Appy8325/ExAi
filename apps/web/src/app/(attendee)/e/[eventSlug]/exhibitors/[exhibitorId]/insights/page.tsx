"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { getEventExhibitor, getPublicEventBySlug } from "@concourse/api-client";
import type { PublicExhibitor } from "@concourse/api-client";
import { EmptyState, Skeleton } from "@concourse/ui";
import { getApiBaseUrl } from "@/lib/api/config";

export default function ExhibitorBriefingPage({ params }: { params: Promise<{ eventSlug: string; exhibitorId: string }> }) {
  const { eventSlug, exhibitorId } = use(params);
  const [exhibitor, setExhibitor] = useState<PublicExhibitor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const event = await getPublicEventBySlug({ baseUrl: getApiBaseUrl() }, eventSlug);
        const result = await getEventExhibitor({ baseUrl: getApiBaseUrl() }, event.id, exhibitorId);
        if (!cancelled) setExhibitor(result);
      } catch {
        // The unavailable state below handles API and network failures.
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [eventSlug, exhibitorId]);

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-32 w-full rounded-2xl" /></div>;

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-3">
        <Link href={`/e/${eventSlug}/exhibitors/${exhibitorId}`} aria-label="Back to exhibitor" className="flex h-8 w-8 items-center justify-center rounded-full border border-default text-muted hover:border-strong hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">&larr;</Link>
        <div><p className="text-body-sm text-muted">Exhibitor briefing</p><h1 className="text-title font-semibold text-primary">{exhibitor?.companyName ?? "Unavailable"}</h1></div>
      </header>

      {exhibitor ? (
        <div className="space-y-4">
          <BriefingSection title="What they offer" items={[
            exhibitor.description ?? `${exhibitor.companyName} has not published a description.`,
            `Find them at ${exhibitor.boothName}${exhibitor.boothNumber ? `, booth ${exhibitor.boothNumber}` : ""}.`,
          ]} />
          <BriefingSection title="Ways to connect" items={[
            exhibitor.website ? `Product details: ${exhibitor.website}` : "Visit the booth for product details.",
            exhibitor.contactEmail ? `Email: ${exhibitor.contactEmail}` : "Ask the booth team for a direct contact.",
            exhibitor.contactPhone ? `Phone: ${exhibitor.contactPhone}` : "Save this exhibitor to follow up after the event.",
          ]} />
        </div>
      ) : <EmptyState title="Briefing not available" description="This exhibitor briefing could not be loaded." />}
    </div>
  );
}

function BriefingSection({ title, items }: { title: string; items: string[] }) {
  return <section className="rounded-xl border border-status-ai-border bg-gradient-to-br from-status-ai-subtle/50 to-surface p-6"><h2 className="text-body font-semibold text-primary">{title}</h2><ul className="mt-3 space-y-2">{items.map((item) => <li key={item} className="flex items-start gap-2 text-body-sm text-secondary"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-status-ai-text" />{item}</li>)}</ul></section>;
}

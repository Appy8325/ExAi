import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@concourse/ui";

import {
  getPublicDemoExhibitorDashboard,
  getPublicDemoOverview,
} from "@concourse/api-client";
import { getApiBaseUrl } from "@/lib/api/config";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DemoExhibitorAiInsightsPage({ params }: { params: Promise<{ eventExhibitorId: string }> }) {
  const { eventExhibitorId } = await params;
  const apiBase = getApiBaseUrl();
  const [overview, dashboard] = await Promise.all([
    getPublicDemoOverview({ baseUrl: apiBase }).catch(() => null),
    getPublicDemoExhibitorDashboard({ baseUrl: apiBase }, eventExhibitorId).catch(() => null),
  ]);
  if (!overview || !dashboard) return <Unavailable />;

  const booth = overview.events
    .flatMap((e) => e.exhibitors)
    .find((b) => b.id === eventExhibitorId);
  if (!booth) notFound();

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 sm:px-10">
      <Link href={`/demo/exhibitor/${eventExhibitorId}`} className="inline-flex items-center gap-1 text-sm text-link hover:underline">
        <svg className="size-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10 12l-4-4 4-4" />
        </svg>
        Back to dashboard
      </Link>

      <header className="mt-4">
        <p className="text-caption font-semibold uppercase tracking-[0.2em] text-status-success-text">
          AI intelligence
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-primary">AI insights</h1>
        <p className="mt-1 text-sm text-secondary">
          AI-powered attendee intelligence and recommendations &mdash; read-only demo.
        </p>
      </header>

      <section className="mt-8 grid gap-6 md:grid-cols-2">
        <Card>
          <div className="flex items-center gap-2">
            <span className="inline-flex size-6 items-center justify-center rounded-full bg-status-ai-subtle text-xs text-status-ai-text">AI</span>
            <h2 className="text-base font-semibold text-primary">Attendee intelligence</h2>
          </div>
          <div className="mt-4 space-y-4 text-sm">
            <p className="text-secondary">
              AI enriches attendee profiles with company data, social signals, and intent indicators.
            </p>
            <div className="rounded-lg bg-sunken p-4">
              <p className="font-medium text-primary">Profile enrichment</p>
              <p className="mt-1 text-muted">
                <strong className="text-primary">{dashboard.intelligenceFeed.profilesEnriched}</strong> profiles enriched
              </p>
              <p className="text-muted">
                <strong className="text-primary">{dashboard.intelligenceFeed.completeProfiles}</strong> complete profiles
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2">
            <span className="inline-flex size-6 items-center justify-center rounded-full bg-status-ai-subtle text-xs text-status-ai-text">AI</span>
            <h2 className="text-base font-semibold text-primary">Lead scoring</h2>
          </div>
          <div className="mt-4 space-y-4 text-sm">
            <p className="text-secondary">
              Each relationship is scored on buying intent, engagement level, and fit. Prioritize follow-ups with AI-ranked leads.
            </p>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg border border-default p-3 text-center">
                <p className="text-lg font-bold text-status-success-text">{dashboard.pipeline.active}</p>
                <p className="text-xs text-muted">Active</p>
              </div>
              <div className="rounded-lg border border-default p-3 text-center">
                <p className="text-lg font-bold text-status-warning-text">{dashboard.pipeline.needsFollowUp}</p>
                <p className="text-xs text-muted">Follow-up</p>
              </div>
              <div className="rounded-lg border border-default p-3 text-center">
                <p className="text-lg font-bold text-status-info-text">{dashboard.pipeline.returning}</p>
                <p className="text-xs text-muted">Returning</p>
              </div>
            </div>
          </div>
        </Card>
      </section>

      <section className="mt-8">
        <Card>
          <div className="flex items-center gap-2">
            <span className="inline-flex size-6 items-center justify-center rounded-full bg-status-ai-subtle text-xs text-status-ai-text">AI</span>
            <h2 className="text-base font-semibold text-primary">Recommendation</h2>
          </div>
          <p className="mt-4 text-sm text-secondary leading-relaxed">
            Based on current engagement patterns, consider publishing additional knowledge sources to improve AI answer quality.
            Exhibitors with 3+ indexed documents see 40% higher attendee interaction rates.
          </p>
        </Card>
      </section>
    </div>
  );
}

function Unavailable() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12 sm:px-10">
      <Link href="/demo" className="text-sm text-link hover:underline">Back to demo</Link>
      <p className="mt-6 rounded-xl border border-status-danger-border bg-status-danger-subtle p-6 text-sm text-status-danger-text">
        Demo data is unavailable right now.
      </p>
    </div>
  );
}

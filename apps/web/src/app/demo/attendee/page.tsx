import Link from "next/link";

import { getPublicDemoOverview } from "@concourse/api-client";
import { getApiBaseUrl } from "@/lib/api/config";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DemoAttendeePage() {
  const apiBase = getApiBaseUrl();
  const overview = await getPublicDemoOverview({ baseUrl: apiBase }).catch(() => null);

  const firstEvent = overview?.events[0];

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 sm:px-10">
      <Link href="/demo" className="inline-flex items-center gap-1 text-sm text-link hover:underline">
        <svg className="size-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10 12l-4-4 4-4" />
        </svg>
        Back to demo
      </Link>

      <header className="mt-4">
        <p className="text-caption font-semibold uppercase tracking-[0.2em] text-brand">
          Attendee experience
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-primary sm:text-3xl">
          Attendee journey
        </h1>
        <p className="mt-1 text-sm text-secondary">
          Browse exhibitors, search companies, visit booths, and ask the AI assistant &mdash; no login required.
        </p>
      </header>

      <div className="mt-10 space-y-6">
        {firstEvent ? (
          <>
            <section className="rounded-2xl border-2 border-brand/20 bg-surface p-6 shadow-1 transition-all hover:shadow-2 hover:ring-2 hover:ring-brand/30 sm:p-8">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-primary">{firstEvent.name}</h2>
                  <p className="mt-1 text-sm text-secondary">
                    {firstEvent.status} &middot; {firstEvent.exhibitors.length} exhibitors
                  </p>
                </div>
                <svg className="size-5 text-muted" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 4l4 4-4 4" />
                </svg>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <Link
                  href={`/e/${firstEvent.slug}`}
                  className="flex items-center justify-between rounded-lg border border-brand/30 bg-brand-subtle px-4 py-3 text-sm font-semibold text-brand"
                >
                  Browse exhibitor directory
                  <svg className="size-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 4l4 4-4 4" />
                  </svg>
                </Link>
                {firstEvent.exhibitors[0]?.publicQrToken ? (
                  <Link
                    href={`/visit/${firstEvent.exhibitors[0].publicQrToken}`}
                    className="flex items-center justify-between rounded-lg border border-default bg-surface px-4 py-3 text-sm font-medium text-primary"
                  >
                    Visit a booth &amp; ask AI
                    <svg className="size-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 4l4 4-4 4" />
                    </svg>
                  </Link>
                ) : null}
              </div>
            </section>
          </>
        ) : (
          <p className="rounded-xl border border-default bg-surface p-6 text-sm text-secondary">
            No events available for the attendee journey.
          </p>
        )}

        <section className="rounded-xl border border-default bg-surface p-6">
          <h2 className="text-base font-semibold text-primary">What you can do</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            <Feature icon="\uD83D\uDD0D" title="Search exhibitors" description="Find companies by name, booth, or category." />
            <Feature icon="\uD83C\uDFED" title="Company profiles" description="View descriptions, websites, and social links." />
            <Feature icon="\uD83E\uDD16" title="Ask the AI" description="Get answers from each exhibitor's published knowledge." />
            <Feature icon="\uD83D\uDCC4" title="Download brochures" description="Access published resources and documents." />
          </ul>
        </section>
      </div>
    </div>
  );
}

function Feature({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <li className="flex items-start gap-3 rounded-lg bg-sunken p-4">
      <span className="text-xl">{icon}</span>
      <div>
        <p className="text-sm font-medium text-primary">{title}</p>
        <p className="text-xs text-secondary">{description}</p>
      </div>
    </li>
  );
}

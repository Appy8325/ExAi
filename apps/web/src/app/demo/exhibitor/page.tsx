import Link from "next/link";

import { getPublicDemoOverview } from "@concourse/api-client";
import { getApiBaseUrl } from "@/lib/api/config";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DemoExhibitorLandingPage() {
  const apiBase = getApiBaseUrl();
  const overview = await getPublicDemoOverview({ baseUrl: apiBase }).catch(() => null);
  if (!overview) return <Unavailable />;

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
          Exhibitor workspace
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-primary sm:text-3xl">
          Exhibitor organizations
        </h1>
        <p className="mt-1 text-sm text-secondary">
          Select an exhibitor organization to explore their read-only workspace.
        </p>
      </header>

      {overview.exhibitorOrganizations.length > 0 ? (
        <div className="mt-8 space-y-3">
          {overview.exhibitorOrganizations.map((org) => {
            const firstEvent = org.events[0];
            return (
              <Link
                key={org.id}
                href={`/demo/exhibitor/${firstEvent?.eventExhibitorId ?? ""}`}
                className="flex items-center justify-between rounded-xl border-2 border-brand/20 bg-surface p-5 transition-all hover:shadow-2 hover:ring-2 hover:ring-brand/30"
              >
                <div>
                  <p className="text-lg font-semibold text-primary">{org.name}</p>
                  <p className="text-sm text-secondary">
                    {org.events.length} event{org.events.length !== 1 ? "s" : ""}
                    {firstEvent ? ` \u00b7 /${firstEvent.eventSlug}` : ""}
                  </p>
                </div>
                <svg className="size-5 text-muted" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 4l4 4-4 4" />
                </svg>
              </Link>
            );
          })}
        </div>
      ) : (
        <p className="mt-8 text-sm text-secondary">No exhibitor organizations available.</p>
      )}
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

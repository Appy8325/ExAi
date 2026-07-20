import Link from "next/link";
import { notFound } from "next/navigation";

import { getPublicDemoOverview } from "@concourse/api-client";
import { getApiBaseUrl } from "@/lib/api/config";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DemoEventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const apiBase = getApiBaseUrl();
  const overview = await getPublicDemoOverview({ baseUrl: apiBase }).catch(() => null);

  if (!overview) return <Unavailable />;

  const event = overview.events.find((e) => e.slug === slug);
  if (!event) notFound();

  const organizerName = overview.organizers.find(
    (o) => o.id === event.organizerOrganizationId,
  )?.name;

  return (
    <div className="mx-auto max-w-4xl px-6 py-12 sm:px-10">
      <Link href="/demo#events" className="mb-6 inline-flex items-center gap-1 text-sm text-link hover:underline">
        <svg className="size-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10 12l-4-4 4-4" />
        </svg>
        Back to demo
      </Link>

      <h1 className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">{event.name}</h1>
      <p className="mt-2 text-sm text-secondary">
        {event.status} &middot; {formatDate(event.startAt)} &ndash; {formatDate(event.endAt)} &middot; {event.timezone}
      </p>
      {organizerName ? (
        <p className="mt-1 text-xs text-muted">Organized by {organizerName}</p>
      ) : null}

      <h2 className="mt-10 mb-4 text-lg font-semibold text-primary">
        Exhibitors ({event.exhibitors.length})
      </h2>

      {event.exhibitors.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {event.exhibitors.map((booth) => (
            <div
              key={booth.id}
              className="rounded-2xl border border-default bg-surface p-5 shadow-1"
            >
              <h3 className="text-base font-semibold text-primary">{booth.companyName}</h3>
              <p className="text-sm text-muted">Booth {booth.boothNumber ?? "\u2014"}</p>
              {booth.publicQrToken ? (
                <Link
                  href={"/visit/" + booth.publicQrToken}
                  className="mt-3 inline-flex items-center gap-1 rounded-lg border border-brand/30 bg-brand-subtle px-3 py-2 text-sm font-semibold text-brand transition-colors hover:bg-brand hover:text-on-brand"
                >
                  Open public booth
                  <svg className="size-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 4l4 4-4 4" />
                  </svg>
                </Link>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-secondary">No exhibitors for this event.</p>
      )}
    </div>
  );
}

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return value;
  }
}

function Unavailable() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12 sm:px-10">
      <Link href="/demo" className="mb-6 inline-flex items-center gap-1 text-sm text-link hover:underline">Back to demo</Link>
      <p className="rounded-2xl border border-status-danger-border bg-status-danger-subtle p-6 text-sm text-status-danger-text">
        Demo data is unavailable right now.
      </p>
    </div>
  );
}
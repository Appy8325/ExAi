import Link from "next/link";
import { notFound } from "next/navigation";

import { getPublicDemoOverview } from "@concourse/api-client";
import { getApiBaseUrl } from "@/lib/api/config";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DemoExhibitorQrPage({ params }: { params: Promise<{ eventExhibitorId: string }> }) {
  const { eventExhibitorId } = await params;
  const apiBase = getApiBaseUrl();
  const overview = await getPublicDemoOverview({ baseUrl: apiBase }).catch(() => null);
  if (!overview) return <Unavailable />;

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
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
          QR management
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-primary">Booth QR code</h1>
        <p className="mt-1 text-sm text-secondary">
          Each booth has a unique QR token that attendees scan to access the public booth &mdash; read-only demo.
        </p>
      </header>

      {booth.publicQrToken ? (
        <div className="mt-8 space-y-6">
          <div className="rounded-xl border border-default bg-surface p-6">
            <p className="text-xs font-medium text-muted uppercase tracking-wide">Public QR token</p>
            <p className="mt-2 font-mono text-lg text-primary break-all">{booth.publicQrToken}</p>
          </div>

          <div className="rounded-xl border border-default bg-surface p-6 text-center">
            <div className="mx-auto flex h-40 w-40 items-center justify-center rounded-xl bg-white p-2 shadow-1">
              <div className="grid h-full w-full grid-cols-3 grid-rows-3 gap-1">
                {Array.from({ length: 9 }, (_, i) => (
                  <div
                    key={i}
                    className={`rounded ${[0, 2, 6, 8].includes(i) || (i === 4) ? "bg-black" : i % 2 === 0 ? "bg-gray-800" : "bg-gray-400"}`}
                  />
                ))}
              </div>
            </div>
            <p className="mt-4 text-xs text-muted">QR code placeholder &mdash; generation available in real workspace</p>
          </div>

          <div>
            <Link
              href={`/visit/${booth.publicQrToken}`}
              className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Open public booth page
              <svg className="size-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 4l4 4-4 4" />
              </svg>
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-8 rounded-xl border border-dashed border-default bg-surface p-8 text-center">
          <p className="text-sm text-muted">No QR credential has been generated for this booth.</p>
          <p className="mt-1 text-xs text-secondary">
            In the real workspace, exhibitors generate, download, and print QR codes for their booths.
          </p>
        </div>
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

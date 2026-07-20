import Link from "next/link";
import { notFound } from "next/navigation";

import { getPublicBooth, getPublicDemoOverview } from "@concourse/api-client";
import { getApiBaseUrl } from "@/lib/api/config";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DemoExhibitorDocumentsPage({ params }: { params: Promise<{ eventExhibitorId: string }> }) {
  const { eventExhibitorId } = await params;
  const apiBase = getApiBaseUrl();
  const overview = await getPublicDemoOverview({ baseUrl: apiBase }).catch(() => null);
  if (!overview) return <Unavailable />;

  const booth = overview.events
    .flatMap((e) => e.exhibitors)
    .find((b) => b.id === eventExhibitorId);
  if (!booth) notFound();

  const publicBooth = booth.publicQrToken
    ? await getPublicBooth({ baseUrl: apiBase }, booth.publicQrToken).catch(() => null)
    : null;

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
          Knowledge sources
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-primary">Documents</h1>
        <p className="mt-1 text-sm text-secondary">
          Published knowledge sources that power the booth AI assistant &mdash; read-only demo.
        </p>
      </header>

      {publicBooth?.resources && publicBooth.resources.length > 0 ? (
        <section className="mt-8 space-y-3">
          {publicBooth.resources.map((resource) => (
            <div key={resource.id} className="flex items-center justify-between rounded-xl border border-default bg-surface p-4">
              <div>
                <p className="font-medium text-primary">{resource.title}</p>
                <p className="text-sm text-muted capitalize">{resource.sourceType.replaceAll("_", " ")}</p>
              </div>
              <a
                href={resource.href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-default bg-sunken px-3 py-1.5 text-sm font-medium text-primary"
              >
                View
              </a>
            </div>
          ))}
        </section>
      ) : (
        <div className="mt-8 rounded-xl border border-dashed border-default bg-surface p-8 text-center">
          <p className="text-sm text-muted">No knowledge sources published yet.</p>
          <p className="mt-1 text-xs text-secondary">
            Exhibitors upload PDFs, add websites, or link documents that the AI uses to answer attendee questions.
          </p>
        </div>
      )}

      {!publicBooth && (
        <div className="mt-8 rounded-xl border border-default bg-surface p-6 text-sm text-secondary">
          This exhibitor has no published booth yet.
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

import Link from "next/link";
import { notFound } from "next/navigation";

import { getPublicBooth, getPublicDemoOverview } from "@concourse/api-client";
import { getApiBaseUrl } from "@/lib/api/config";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DemoExhibitorBoothPage({ params }: { params: Promise<{ eventExhibitorId: string }> }) {
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
          Booth profile
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-primary">{booth.companyName}</h1>
        {publicBooth && (
          <p className="mt-1 text-sm text-secondary">{publicBooth.boothName}</p>
        )}
      </header>

      {publicBooth?.description ? (
        <section className="mt-6">
          <h2 className="text-base font-semibold text-primary">Description</h2>
          <p className="mt-1 text-sm text-secondary">{publicBooth.description}</p>
        </section>
      ) : null}

      {publicBooth?.website ? (
        <p className="mt-4 text-sm">
          <span className="text-muted">Website: </span>
          <span className="text-link">{publicBooth.website}</span>
        </p>
      ) : null}

      {publicBooth?.leadForm ? (
        <section className="mt-8">
          <h2 className="text-base font-semibold text-primary">Lead form</h2>
          <p className="mt-1 text-xs text-muted">{publicBooth.leadForm.name} &mdash; read-only preview</p>
          {publicBooth.leadForm.consentText ? (
            <p className="mt-2 text-sm italic text-secondary">{publicBooth.leadForm.consentText}</p>
          ) : null}
          <ul className="mt-4 space-y-2">
            {publicBooth.leadForm.fields.map((field) => (
              <li key={field.key} className="rounded-xl border border-default bg-surface px-4 py-3">
                <span className="text-sm font-medium text-primary">
                  {field.label}
                  {field.required ? <span className="ml-1 text-red-500">*</span> : null}
                </span>
                <span className="ml-2 rounded bg-sunken px-1.5 py-0.5 text-xs text-muted">{field.type}</span>
                {field.helpText ? <p className="mt-0.5 text-xs text-muted">{field.helpText}</p> : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {publicBooth?.resources && publicBooth.resources.length > 0 ? (
        <section className="mt-8">
          <h2 className="text-base font-semibold text-primary">Published resources</h2>
          <ul className="mt-2 space-y-2">
            {publicBooth.resources.map((resource) => (
              <li key={resource.id}>
                <a
                  href={resource.href}
                  className="text-sm text-link hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {resource.title}
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {booth.publicQrToken ? (
        <div className="mt-8">
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
      ) : null}
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

import Link from "next/link";
import { notFound } from "next/navigation";

import { getPublicDemoOverview, getPublicBooth } from "@concourse/api-client";
import { getApiBaseUrl } from "@/lib/api/config";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DemoExhibitorPage({ params }: { params: Promise<{ eventExhibitorId: string }> }) {
  const { eventExhibitorId } = await params;
  const apiBase = getApiBaseUrl();
  const overview = await getPublicDemoOverview({ baseUrl: apiBase }).catch(() => null);

  if (!overview) return <Unavailable />;

  const exhibitorOrg = overview.exhibitorOrganizations.find((eo) =>
    eo.events.some((e) => e.eventExhibitorId === eventExhibitorId),
  );
  if (!exhibitorOrg) notFound();

  const participation = exhibitorOrg.events.find((e) => e.eventExhibitorId === eventExhibitorId);
  const event = overview.events.find((e) => e.id === participation?.eventId);
  const boothInEvent = event?.exhibitors.find((b) => b.id === eventExhibitorId);

  let publicBooth = null;
  if (boothInEvent?.publicQrToken) {
    publicBooth = await getPublicBooth({ baseUrl: apiBase }, boothInEvent.publicQrToken).catch(() => null);
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12 sm:px-10">
      <Link href="/demo#exhibitors" className="mb-6 inline-flex items-center gap-1 text-sm text-link hover:underline">
        <svg className="size-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10 12l-4-4 4-4" />
        </svg>
        Back to demo
      </Link>

      <h1 className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">{exhibitorOrg.name}</h1>
      {boothInEvent ? (
        <p className="mt-1 text-sm text-secondary">Booth {boothInEvent.boothNumber ?? "\u2014"} &middot; {event?.name}</p>
      ) : null}

      {publicBooth?.description ? (
        <p className="mt-4 text-sm text-secondary">{publicBooth.description}</p>
      ) : null}

      {publicBooth?.website ? (
        <p className="mt-2 text-sm">
          <span className="text-muted">Website: </span>
          <span className="text-link">{publicBooth.website}</span>
        </p>
      ) : null}

      {boothInEvent?.publicQrToken ? (
        <Link
          href={"/visit/" + boothInEvent.publicQrToken}
          className="mt-4 inline-flex items-center gap-1 rounded-lg border border-brand/30 bg-brand-subtle px-4 py-2 text-sm font-semibold text-brand transition-colors hover:bg-brand hover:text-on-brand"
        >
          Open public booth page
          <svg className="size-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 4l4 4-4 4" />
          </svg>
        </Link>
      ) : null}

      {publicBooth?.leadForm ? (
        <section className="mt-10">
          <h2 className="text-lg font-semibold text-primary">Lead form</h2>
          <p className="mt-1 text-xs text-muted">{publicBooth.leadForm.name} &mdash; read-only preview</p>
          {publicBooth.leadForm.consentText ? (
            <p className="mt-2 text-sm text-secondary italic">{publicBooth.leadForm.consentText}</p>
          ) : null}
          <ul className="mt-4 space-y-2">
            {publicBooth.leadForm.fields.map((field) => (
              <li
                key={field.key}
                className="rounded-xl border border-default bg-surface px-4 py-3"
              >
                <span className="text-sm font-medium text-primary">
                  {field.label}
                  {field.required ? <span className="ml-1 text-status-danger-text">*</span> : null}
                </span>
                <span className="ml-2 rounded bg-sunken px-1.5 py-0.5 text-xs text-muted">
                  {field.type}
                </span>
                {field.helpText ? (
                  <p className="mt-0.5 text-xs text-muted">{field.helpText}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {publicBooth?.resources && publicBooth.resources.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-lg font-semibold text-primary">Resources</h2>
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
    </div>
  );
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
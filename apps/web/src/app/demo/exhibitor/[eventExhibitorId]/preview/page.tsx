import Link from "next/link";

import { notFound } from "next/navigation";
import { Card, EmptyState } from "@concourse/ui";

import { getPublicBooth, getPublicDemoOverview } from "@concourse/api-client";

import { getApiBaseUrl } from "@/lib/api/config";
import {
  DemoPageHeader,
  DemoUnavailable,
} from "@/components/demo/shell";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ExhibitorPreviewPage({
  params,
}: {
  params: Promise<{ eventExhibitorId: string }>;
}) {
  const { eventExhibitorId } = await params;
  const apiBase = getApiBaseUrl();
  const overview = await getPublicDemoOverview({ baseUrl: apiBase }).catch(
    () => null,
  );
  if (!overview) return <DemoUnavailable />;

  const booth = overview.events
    .flatMap((e) => e.exhibitors)
    .find((b) => b.id === eventExhibitorId);
  if (!booth) notFound();

  const publicBooth = booth.publicQrToken
    ? await getPublicBooth({ baseUrl: apiBase }, booth.publicQrToken).catch(
        () => null,
      )
    : null;

  return (
    <div className="space-y-8">
      <DemoPageHeader
        eyebrow="Booth preview"
        title={booth.companyName}
        description={`Booth ${booth.boothNumber ?? "—"} · ${booth.boothName}. This is exactly what attendees see after scanning the QR.`}
        badge="Public"
      />

      {!publicBooth ? (
        <EmptyState
          title="No public booth published yet"
          description="The public booth page appears once the QR credential is generated."
        />
      ) : (
        <>
          {publicBooth.description ? (
            <Card>
              <h2 className="text-base font-semibold text-primary">Overview</h2>
              <p className="mt-2 text-sm text-secondary">
                {publicBooth.description}
              </p>
              {publicBooth.website ? (
                <p className="mt-2 text-xs">
                  <span className="text-muted">Website: </span>
                  <span className="text-link">{publicBooth.website}</span>
                </p>
              ) : null}
            </Card>
          ) : null}

          {publicBooth.resources && publicBooth.resources.length > 0 ? (
            <Card>
              <h2 className="text-base font-semibold text-primary">
                Products & brochures
              </h2>
              <ul className="mt-3 space-y-2">
                {publicBooth.resources.map((resource) => (
                  <li
                    key={resource.id}
                    className="flex items-center justify-between rounded-lg border border-default bg-surface px-3 py-2"
                  >
                    <span className="truncate text-sm font-medium text-primary">
                      {resource.title}
                    </span>
                    <a
                      href={resource.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-link hover:underline"
                    >
                      Open →
                    </a>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}

          {publicBooth.leadForm ? (
            <Card>
              <h2 className="text-base font-semibold text-primary">
                Lead form
              </h2>
              <p className="mt-1 text-xs text-muted">
                {publicBooth.leadForm.name} — preview
              </p>
              <ul className="mt-4 space-y-2">
                {publicBooth.leadForm.fields.map((field) => (
                  <li
                    key={field.key}
                    className="rounded-xl border border-default bg-sunken px-4 py-3"
                  >
                    <p className="text-sm font-medium text-primary">
                      {field.label}
                      {field.required ? (
                        <span className="ml-1 text-status-danger-text">*</span>
                      ) : null}
                    </p>
                    <p className="mt-0.5 text-xs text-muted">{field.type}</p>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <Link
              href={`/visit/${booth.publicQrToken}`}
              className="inline-flex h-10 items-center rounded-lg bg-status-success-solid px-4 text-sm font-semibold text-on-brand"
            >
              Open attendee-facing booth
            </Link>
            <Link
              href={`/demo/exhibitor/${eventExhibitorId}/qr`}
              className="inline-flex h-10 items-center rounded-lg border border-default bg-surface px-4 text-sm font-semibold text-primary"
            >
              View QR
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

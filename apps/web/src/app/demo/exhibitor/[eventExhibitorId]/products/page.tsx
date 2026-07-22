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

export default async function ExhibitorProductsPage({
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
        eyebrow="Exhibitor workspace"
        title="Products"
        description="Published products, brochures, and knowledge sources that power the booth AI assistant."
        badge="Read-only"
      />

      {publicBooth?.description ? (
        <Card>
          <h2 className="text-base font-semibold text-primary">
            About this booth
          </h2>
          <p className="mt-2 text-sm text-secondary">{publicBooth.description}</p>
          {publicBooth.website ? (
            <p className="mt-2 text-xs">
              <span className="text-muted">Website: </span>
              <span className="text-link">{publicBooth.website}</span>
            </p>
          ) : null}
        </Card>
      ) : null}

      <Card>
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-primary">
              Knowledge sources
            </h2>
            <p className="text-sm text-secondary">
              Each item is one product, brochure, or document the booth AI uses
              to answer attendee questions.
            </p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full border border-default bg-surface px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted">
            {publicBooth?.resources?.length ?? 0} sources
          </span>
        </div>

        {publicBooth?.resources && publicBooth.resources.length > 0 ? (
          <ul className="space-y-2">
            {publicBooth.resources.map((resource) => (
              <li
                key={resource.id}
                className="flex items-center justify-between rounded-xl border border-default bg-surface p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-primary">
                    {resource.title}
                  </p>
                  <p className="text-xs capitalize text-muted">
                    {resource.sourceType.replaceAll("_", " ")}
                  </p>
                </div>
                <a
                  href={resource.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-default bg-sunken px-3 py-1.5 text-xs font-medium text-primary"
                >
                  View
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            title="No knowledge sources published yet"
            description="In the real workspace, exhibitors upload PDFs, link websites, and publish brochures."
          />
        )}
      </Card>

      {publicBooth?.leadForm ? (
        <Card>
          <h2 className="text-base font-semibold text-primary">Lead form</h2>
          <p className="mt-1 text-xs text-muted">
            {publicBooth.leadForm.name} — read-only preview
          </p>
          {publicBooth.leadForm.consentText ? (
            <p className="mt-2 text-sm italic text-secondary">
              {publicBooth.leadForm.consentText}
            </p>
          ) : null}
          <ul className="mt-4 space-y-2">
            {publicBooth.leadForm.fields.map((field) => (
              <li
                key={field.key}
                className="rounded-xl border border-default bg-surface px-4 py-3"
              >
                <span className="text-sm font-medium text-primary">
                  {field.label}
                  {field.required ? (
                    <span className="ml-1 text-status-danger-text">*</span>
                  ) : null}
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
        </Card>
      ) : null}
    </div>
  );
}

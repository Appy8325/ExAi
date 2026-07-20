import Link from "next/link";

import { notFound } from "next/navigation";
import { getPublicDemoOverview } from "@concourse/api-client";

import { getApiBaseUrl } from "@/lib/api/config";
import {
  DemoSideNav,
  DemoTopBar,
} from "@/components/demo/shell";

export default async function ExhibitorLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ eventExhibitorId: string }>;
}) {
  const { eventExhibitorId } = await params;
  const apiBase = getApiBaseUrl();
  const overview = await getPublicDemoOverview({ baseUrl: apiBase }).catch(
    () => null,
  );

  const org = overview?.exhibitorOrganizations.find((eo) =>
    eo.events.some((e) => e.eventExhibitorId === eventExhibitorId),
  );
  const participation = org?.events.find(
    (e) => e.eventExhibitorId === eventExhibitorId,
  );
  const event = overview?.events.find((e) => e.id === participation?.eventId);
  const booth = event?.exhibitors.find((b) => b.id === eventExhibitorId);

  if (overview && !org) notFound();

  const items = [
    { label: "Dashboard", href: `/demo/exhibitor/${eventExhibitorId}` },
    { label: "Products", href: `/demo/exhibitor/${eventExhibitorId}/products` },
    {
      label: "Visitors",
      href: `/demo/exhibitor/${eventExhibitorId}/visitors`,
    },
    {
      label: "Analytics",
      href: `/demo/exhibitor/${eventExhibitorId}/analytics`,
    },
    {
      label: "AI Insights",
      href: `/demo/exhibitor/${eventExhibitorId}/ai-insights`,
    },
    { label: "QR", href: `/demo/exhibitor/${eventExhibitorId}/qr` },
    {
      label: "Booth Preview",
      href: booth?.publicQrToken
        ? `/visit/${booth.publicQrToken}`
        : `/demo/exhibitor/${eventExhibitorId}/preview`,
    },
  ];

  return (
    <div className="min-h-screen bg-canvas">
      <DemoTopBar persona="exhibitor" />
      <div className="mx-auto flex max-w-7xl">
        <DemoSideNav title={org?.name ?? "Exhibitor"} items={items} />
        <div className="min-w-0 flex-1">
          {org && booth ? (
            <div className="border-b border-default/60 bg-canvas px-6 py-3 sm:px-10">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs text-muted">
                    <Link
                      href="/demo/exhibitor"
                      className="text-link hover:underline"
                    >
                      All exhibitors
                    </Link>
                    <span className="mx-2">/</span>
                    <span className="text-primary">{booth.companyName}</span>
                    {event ? (
                      <>
                        <span className="mx-2">·</span>
                        <span className="text-secondary">{event.name}</span>
                      </>
                    ) : null}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full border border-status-success-border bg-status-success-subtle px-2.5 py-1 text-xs font-medium text-status-success-text">
                  <span className="inline-block size-1.5 rounded-full bg-status-success-solid" />
                  Read-only
                </span>
              </div>
            </div>
          ) : null}
          {children}
        </div>
      </div>
    </div>
  );
}

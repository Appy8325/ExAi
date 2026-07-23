import type { ReactNode } from "react";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { StatusBadge } from "@concourse/ui";
import { getPublicDemoOverview } from "@concourse/api-client";
import { getApiBaseUrl } from "@/lib/api/config";
import { Breadcrumbs, CommandPalette, GlobalNav, WorkspaceNav } from "@/components/navigation";

function buildDemoExhibitorSections(basePath: string) {
  return [
    {
      items: [
        { label: "Dashboard", href: `${basePath}`, icon: "grid" },
        { label: "Products", href: `${basePath}/products`, icon: "box" },
        { label: "Visitors", href: `${basePath}/visitors`, icon: "users" },
        { label: "Analytics", href: `${basePath}/analytics`, icon: "chart" },
        { label: "AI Insights", href: `${basePath}/ai-insights`, icon: "sparkle" },
        { label: "QR Codes", href: `${basePath}/qr`, icon: "qr" },
        { label: "Booth Preview", href: `${basePath}/preview`, icon: "eye" },
      ],
    },
  ];
}

export default async function ExhibitorLayout({
  children,
  params,
}: {
  children: ReactNode;
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

  const basePath = `/demo/exhibitor/${eventExhibitorId}`;
  const sections = buildDemoExhibitorSections(basePath);

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <GlobalNav variant="console" active="exhibitor" />
      <Suspense>
        <WorkspaceNav sections={sections} basePath={basePath} role="exhibitor" variant="mobile" />
      </Suspense>
      <div className="flex min-h-[calc(100vh-3.5rem)] flex-1">
        <div className="hidden lg:flex">
          <Suspense fallback={<aside className="w-60 border-r border-default bg-surface" />}>
            <WorkspaceNav sections={sections} basePath={basePath} role="exhibitor" />
          </Suspense>
        </div>
        <main id="main" className="flex-1 overflow-auto scrollbar-thin">
          <div className="mx-auto max-w-(--mq-content-max) p-(--mq-space-gutter) sm:p-6 lg:p-8">
            <div className="mb-6 flex items-center justify-between gap-4">
              <Breadcrumbs />
              <CommandPalette />
            </div>
            {org && booth ? (
              <div className="mb-6 border-b border-default/60 bg-canvas pb-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-caption text-muted">
                      <Link
                        href="/demo/exhibitor"
                        className="text-link hover:underline"
                      >
                        All exhibitors
                      </Link>
                      <span className="mx-2">/</span>
                      <span className="text-primary font-medium">{booth.companyName}</span>
                      {event ? (
                        <>
                          <span className="mx-2">·</span>
                          <span className="text-secondary">{event.name}</span>
                        </>
                      ) : null}
                    </p>
                  </div>
                  <StatusBadge tone="success">Read-only</StatusBadge>
                </div>
              </div>
            ) : null}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

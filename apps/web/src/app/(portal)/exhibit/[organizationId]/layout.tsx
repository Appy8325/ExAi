import { Suspense, type ReactNode } from "react";
import {
  Breadcrumbs,
  CommandPalette,
  GlobalNav,
  WorkspaceNav,
} from "@/components/navigation";

function buildExhibitorSections(basePath: string) {
  return [
    {
      items: [
        { label: "Dashboard", href: `${basePath}`, icon: "grid" },
        { label: "Visitors", href: `${basePath}/visitors`, icon: "users" },
        { label: "AI Insights", href: `${basePath}/ai-insights`, icon: "sparkle" },
      ],
    },
    {
      title: "Management",
      items: [
        { label: "QR Codes", href: `${basePath}/qr`, icon: "qr" },
        { label: "Forms", href: `${basePath}/forms`, icon: "file" },
        { label: "Documents", href: `${basePath}/documents`, icon: "file" },
        { label: "Team", href: `${basePath}/team`, icon: "users" },
      ],
    },
    {
      title: "Settings",
      items: [
        { label: "Settings", href: `${basePath}/settings`, icon: "gear" },
      ],
    },
  ];
}

export default async function ExhibitorLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ organizationId: string }>;
}) {
  const { organizationId } = await params;
  const basePath = `/exhibit/${organizationId}`;
  const sections = buildExhibitorSections(basePath);

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <GlobalNav variant="console" active="exhibitor" />
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
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

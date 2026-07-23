import type { ReactNode } from "react";
import { Suspense } from "react";
import {
  Breadcrumbs,
  CommandPalette,
  GlobalNav,
  WorkspaceNav,
} from "@/components/navigation";

const organizerSections = [
  {
    items: [
      { label: "Dashboard", href: "/demo/organizer", icon: "grid" },
      { label: "Events", href: "/demo/organizer/events", icon: "calendar" },
      { label: "Analytics", href: "/demo/organizer/analytics", icon: "chart" },
      { label: "AI Insights", href: "/demo/organizer/ai-insights", icon: "sparkle" },
      { label: "Reports", href: "/demo/organizer/reports", icon: "file" },
    ],
  },
];

export default function OrganizerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <GlobalNav variant="console" active="organizer" />
      <Suspense>
        <WorkspaceNav sections={organizerSections} basePath="/demo/organizer" role="organizer" variant="mobile" />
      </Suspense>
      <div className="flex min-h-[calc(100vh-3.5rem)] flex-1">
        <div className="hidden lg:flex">
          <Suspense fallback={<aside className="w-60 border-r border-default bg-surface" />}>
            <WorkspaceNav sections={organizerSections} basePath="/demo/organizer" role="organizer" />
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

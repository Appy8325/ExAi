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
      { label: "Dashboard", href: "/org", icon: "grid" },
      { label: "Events", href: "/org/events", icon: "calendar" },
      { label: "Analytics", href: "/org/analytics", icon: "chart" },
      { label: "Settings", href: "/org/settings", icon: "gear" },
    ],
  },
];

export default function ConsoleLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <GlobalNav variant="console" active="organizer" />
      <div className="flex min-h-[calc(100vh-3.5rem)] flex-1">
        <div className="hidden lg:flex">
          <Suspense fallback={<aside className="w-60 border-r border-default bg-surface" />}>
            <WorkspaceNav sections={organizerSections} basePath="/org" role="organizer" />
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

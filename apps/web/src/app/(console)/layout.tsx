import type { ReactNode } from "react";
import { Suspense } from "react";
import { ConsoleNav } from "./console-nav";
import {
  CommandPalette,
  GlobalNav,
  UnifiedBreadcrumbs,
} from "@/components/navigation";

export default function ConsoleLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <GlobalNav variant="console" active="organizer" />
      <div className="flex min-h-[calc(100vh-3.5rem)] flex-1">
        <div className="hidden lg:flex">
          <Suspense fallback={<aside className="w-60 border-r border-default bg-surface" />}>
            <ConsoleNav />
          </Suspense>
        </div>
        <main
          id="main"
          className="flex-1 overflow-auto scrollbar-thin"
        >
          <div className="mx-auto max-w-(--mq-content-max) p-(--mq-space-gutter) sm:p-6 lg:p-8">
            <div className="mb-6 flex items-center justify-between gap-4">
              <UnifiedBreadcrumbs />
              <div className="flex items-center gap-3">
                <span className="hidden rounded-full border border-status-info-border bg-status-info-subtle px-2.5 py-1 text-xs font-semibold text-status-info-text sm:inline-flex">
                  Organizer
                </span>
                <CommandPalette />
              </div>
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

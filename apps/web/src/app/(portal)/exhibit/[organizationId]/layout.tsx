import { Suspense, type ReactNode } from "react";
import { Sidebar } from "./_components/sidebar";
import {
  CommandPalette,
  GlobalNav,
  UnifiedBreadcrumbs,
} from "@/components/navigation";

export default function ExhibitorLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <GlobalNav variant="console" active="exhibitor" />
      <div className="flex min-h-[calc(100vh-3.5rem)] flex-1">
        <Suspense
          fallback={<aside className="hidden lg:flex w-60 border-r border-default bg-surface" />}
        >
          <Sidebar />
        </Suspense>
        <main id="main" className="flex-1 overflow-auto scrollbar-thin">
          <div className="mx-auto max-w-7xl p-6 lg:p-8">
            <div className="mb-6 flex items-center justify-between gap-4">
              <UnifiedBreadcrumbs />
              <div className="flex items-center gap-3">
                <span className="hidden rounded-full border border-status-success-border bg-status-success-subtle px-2.5 py-1 text-xs font-semibold text-status-success-text sm:inline-flex">
                  Exhibitor
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

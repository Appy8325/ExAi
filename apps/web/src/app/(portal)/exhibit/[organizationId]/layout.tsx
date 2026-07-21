import { Suspense, type ReactNode } from "react";
import { Sidebar } from "./_components/sidebar";
import { UnifiedBreadcrumbs, CommandPalette } from "@/components/navigation";

export default function ExhibitorLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-canvas">
      <Suspense
        fallback={<aside className="hidden lg:flex w-60 border-r border-default bg-surface" />}
      >
        <Sidebar />
      </Suspense>
      <main id="main" className="flex-1 overflow-auto scrollbar-thin">
        <div className="mx-auto max-w-7xl p-6 lg:p-8">
          <div className="mb-6 flex items-center justify-between">
            <UnifiedBreadcrumbs />
            <CommandPalette />
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}

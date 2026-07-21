import type { ReactNode } from "react";
import { ConsoleNav } from "./console-nav";
import { UnifiedBreadcrumbs, CommandPalette } from "@/components/navigation";

export default function ConsoleLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-canvas">
      <div className="hidden lg:flex">
        <ConsoleNav />
      </div>
      <main id="main" className="flex-1 overflow-auto scrollbar-thin">
        <div className="mx-auto max-w-(--mq-content-max) p-(--mq-space-gutter) sm:p-6 lg:p-8">
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

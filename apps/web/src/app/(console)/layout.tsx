import type { ReactNode } from "react";
import { ConsoleNav } from "./console-nav";

export default function ConsoleLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-canvas">
      <ConsoleNav />
      <main className="flex-1 overflow-auto p-(--mq-space-gutter) sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}

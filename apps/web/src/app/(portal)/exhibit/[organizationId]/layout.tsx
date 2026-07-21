import { Suspense, type ReactNode } from "react";
import { Sidebar } from "./_components/sidebar";

export default function ExhibitorLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-canvas">
      <Suspense
        fallback={<aside className="w-60 border-r border-default bg-surface" />}
      >
        <Sidebar />
      </Suspense>
      <main id="main" className="flex-1 overflow-auto scrollbar-thin">
        {children}
      </main>
    </div>
  );
}

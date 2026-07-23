import { Suspense } from "react";
import { GlobalNav, WorkspaceNav } from "@/components/navigation";

const adminSections = [
  {
    items: [
      { label: "Overview", href: "/demo/admin", icon: "grid" },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <GlobalNav variant="compact" active="admin" />
      <Suspense>
        <WorkspaceNav sections={adminSections} basePath="/demo/admin" role="admin" variant="mobile" />
      </Suspense>
      <div className="flex min-h-[calc(100vh-3.5rem)] flex-1">
        <div className="hidden lg:flex">
          <Suspense fallback={<aside className="w-60 border-r border-default bg-surface" />}>
            <WorkspaceNav sections={adminSections} basePath="/demo/admin" role="admin" />
          </Suspense>
        </div>
        <main id="main" className="flex-1 overflow-auto scrollbar-thin">
          <div className="mx-auto max-w-(--mq-content-max) p-(--mq-space-gutter) sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

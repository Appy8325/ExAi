import {
  DemoTopBar,
  DemoSideNav,
  type PersonaNavItem,
} from "@/components/demo/shell";
import { UnifiedBreadcrumbs, CommandPalette } from "@/components/navigation";

export default function OrganizerLayout({ children }: { children: React.ReactNode }) {
  const nav: PersonaNavItem[] = [
    { label: "Dashboard", href: "/demo/organizer" },
    { label: "Events", href: "/demo/organizer/events" },
    { label: "Analytics", href: "/demo/organizer/analytics" },
    { label: "Booth Traffic", href: "/demo/organizer/heatmaps" },
    { label: "AI Insights", href: "/demo/organizer/ai-insights" },
    { label: "Reports", href: "/demo/organizer/reports" },
  ];
  return (
    <div className="min-h-screen bg-canvas">
      <DemoTopBar persona="organizer" />
      <div className="mx-auto flex max-w-7xl">
        <DemoSideNav title="Organizer" items={nav} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-end gap-4 border-b border-default/60 px-6 py-3">
            <UnifiedBreadcrumbs />
            <CommandPalette />
          </div>
          <div className="p-6 lg:p-8">{children}</div>
        </div>
      </div>
    </div>
  );
}

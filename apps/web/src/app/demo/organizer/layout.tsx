import {
  DemoTopBar,
  DemoSideNav,
  type PersonaNavItem,
} from "@/components/demo/shell";

export default function OrganizerLayout({ children }: { children: React.ReactNode }) {
  const nav: PersonaNavItem[] = [
    { label: "Dashboard", href: "/demo/organizer" },
    { label: "Events", href: "/demo/organizer/events" },
    { label: "Analytics", href: "/demo/organizer/analytics" },
    { label: "Heatmaps", href: "/demo/organizer/heatmaps" },
    { label: "AI Insights", href: "/demo/organizer/ai-insights" },
    { label: "Reports", href: "/demo/organizer/reports" },
  ];
  return (
    <div className="min-h-screen bg-canvas">
      <DemoTopBar persona="organizer" />
      <div className="mx-auto flex max-w-7xl">
        <DemoSideNav title="Organizer" items={nav} />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}

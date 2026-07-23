"use client";

import { usePathname } from "next/navigation";
import { Breadcrumbs as SharedBreadcrumbs } from "@concourse/ui";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbConfig {
  items: BreadcrumbItem[];
}

const CONSOLE_BREADCRUMBS: Record<string, BreadcrumbConfig> = {
  "/org": { items: [{ label: "Organizer" }] },
  "/org/analytics": { items: [{ label: "Organizer", href: "/org" }, { label: "Analytics" }] },
  "/org/settings": { items: [{ label: "Organizer", href: "/org" }, { label: "Settings" }] },
  "/org/ai-insights": { items: [{ label: "Organizer", href: "/org" }, { label: "AI Insights" }] },
  "/org/reports": { items: [{ label: "Organizer", href: "/org" }, { label: "Reports" }] },
  "/org/events": { items: [{ label: "Organizer", href: "/org" }, { label: "Events" }] },
  "/org/events/[eventId]": {
    items: [
      { label: "Organizer", href: "/org" },
      { label: "Events", href: "/org/events" },
      { label: "Event" },
    ],
  },
};

const EXHIBIT_BREADCRUMBS: Record<string, BreadcrumbConfig> = {
  "/exhibit/[organizationId]": { items: [{ label: "Exhibitor" }] },
  "/exhibit/[organizationId]/visitors": {
    items: [{ label: "Exhibitor", href: "" }, { label: "Visitors" }],
  },
  "/exhibit/[organizationId]/analytics": {
    items: [{ label: "Exhibitor", href: "" }, { label: "Analytics" }],
  },
  "/exhibit/[organizationId]/ai-assistant": {
    items: [{ label: "Exhibitor", href: "" }, { label: "AI Assistant" }],
  },
  "/exhibit/[organizationId]/products": {
    items: [{ label: "Exhibitor", href: "" }, { label: "Products" }],
  },
  "/exhibit/[organizationId]/knowledge": {
    items: [{ label: "Exhibitor", href: "" }, { label: "Knowledge" }],
  },
  "/exhibit/[organizationId]/dashboard": {
    items: [{ label: "Exhibitor" }],
  },
  "/exhibit/[organizationId]/dashboard/[eventExhibitorId]": {
    items: [{ label: "Exhibitor" }, { label: "Booth" }],
  },
  "/exhibit/[organizationId]/settings": {
    items: [{ label: "Exhibitor", href: "" }, { label: "Settings" }],
  },
  "/exhibit/[organizationId]/team": {
    items: [{ label: "Exhibitor", href: "" }, { label: "Team" }],
  },
};

const ATTENDEE_BREADCRUMBS: Record<string, BreadcrumbConfig> = {
  "/e": { items: [{ label: "Events" }] },
  "/e/[eventSlug]": { items: [{ label: "Events", href: "/e" }, { label: "Event" }] },
  "/e/[eventSlug]/exhibitors": {
    items: [{ label: "Events", href: "/e" }, { label: "Event" }, { label: "Exhibitors" }],
  },
  "/e/[eventSlug]/exhibitors/[exhibitorId]": {
    items: [{ label: "Events", href: "/e" }, { label: "Event" }, { label: "Exhibitors", href: "" }, { label: "Exhibitor" }],
  },
  "/e/[eventSlug]/exhibitors/[exhibitorId]/insights": {
    items: [{ label: "Events", href: "/e" }, { label: "Event" }, { label: "Exhibitors", href: "" }, { label: "Exhibitor" }, { label: "Insights" }],
  },
  "/e/[eventSlug]/saved": {
    items: [{ label: "Events", href: "/e" }, { label: "Event" }, { label: "Saved" }],
  },
};

const DEMO_BREADCRUMBS: Record<string, BreadcrumbConfig> = {
  "/demo": { items: [{ label: "Experience" }] },
  "/demo/organizer": { items: [{ label: "Experience", href: "/demo" }, { label: "Organizer" }] },
  "/demo/organizer/events": {
    items: [{ label: "Experience", href: "/demo" }, { label: "Organizer", href: "/demo/organizer" }, { label: "Events" }],
  },
  "/demo/organizer/analytics": {
    items: [{ label: "Experience", href: "/demo" }, { label: "Organizer", href: "/demo/organizer" }, { label: "Analytics" }],
  },
  "/demo/organizer/heatmaps": {
    items: [{ label: "Experience", href: "/demo" }, { label: "Organizer", href: "/demo/organizer" }, { label: "Heatmaps" }],
  },
  "/demo/organizer/ai-insights": {
    items: [{ label: "Experience", href: "/demo" }, { label: "Organizer", href: "/demo/organizer" }, { label: "AI Insights" }],
  },
  "/demo/organizer/reports": {
    items: [{ label: "Experience", href: "/demo" }, { label: "Organizer", href: "/demo/organizer" }, { label: "Reports" }],
  },
  "/demo/exhibitor": { items: [{ label: "Experience", href: "/demo" }, { label: "Exhibitor" }] },
  "/demo/exhibitor/[eventExhibitorId]": {
    items: [{ label: "Experience", href: "/demo" }, { label: "Exhibitor", href: "/demo/exhibitor" }, { label: "Booth" }],
  },
};

function matchBreadcrumb(pathname: string, patterns: Record<string, BreadcrumbConfig>): BreadcrumbConfig | null {
  for (const [pattern, config] of Object.entries(patterns)) {
    const regex = pattern
      .replace(/\[([^\]]+)\]/g, "([^/]+)")
      .replace(/\//g, "\\/");
    const re = new RegExp(`^${regex}$`);
    if (re.test(pathname)) {
      return config;
    }
  }
  return null;
}

function resolveBreadcrumbItems(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split("/").filter(Boolean);

  if (pathname.startsWith("/org")) {
    const match = matchBreadcrumb(pathname, CONSOLE_BREADCRUMBS);
    if (match) {
      return match.items.map((item) => ({
        ...item,
        href: item.href ?? undefined,
      }));
    }
    if (segments.length === 2) {
      return [{ label: "Organizer" }];
    }
    if (segments.length === 3 && segments[1] === "events") {
      return [
        { label: "Organizer", href: "/org" },
        { label: "Events", href: "/org/events" },
        { label: "Event" },
      ];
    }
  }

  if (pathname.startsWith("/exhibit")) {
    const match = matchBreadcrumb(pathname, EXHIBIT_BREADCRUMBS);
    if (match) {
      const orgId = segments[1];
      return match.items.map((item) => {
        if (!item.href && item.label !== "Exhibitor" && item.label !== "Booth") {
          return { ...item, href: `/exhibit/${orgId}` };
        }
        if (item.href === "") {
          return { ...item, href: `/exhibit/${orgId}/${item.label.toLowerCase().replace(/ /g, "-")}` };
        }
        return item;
      });
    }
  }

  if (pathname.startsWith("/e")) {
    const match = matchBreadcrumb(pathname, ATTENDEE_BREADCRUMBS);
    if (match) {
      const eventSlug = segments[1];
      return match.items.map((item) => {
        if (!item.href) return item;
        if (item.label === "Events") return { ...item, href: "/e" };
        if (item.label === "Event") return { ...item, href: `/e/${eventSlug}` };
        if (item.label === "Exhibitors") return { ...item, href: `/e/${eventSlug}/exhibitors` };
        return item;
      });
    }
  }

  if (pathname.startsWith("/demo")) {
    const match = matchBreadcrumb(pathname, DEMO_BREADCRUMBS);
    if (match) {
      return match.items.map((item) => ({
        ...item,
        href: item.href ?? undefined,
      }));
    }
  }

  return [];
}

export function UnifiedBreadcrumbs({ className }: { className?: string }) {
  const pathname = usePathname();
  const items = resolveBreadcrumbItems(pathname);

  if (items.length === 0) return null;

  return <SharedBreadcrumbs items={items} className={`text-body [&_svg]:text-muted/50 ${className ?? ""}`} />;
}

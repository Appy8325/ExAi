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
  "/org": { items: [{ label: "Organizer", href: "/org" }] },
  "/org/events": { items: [{ label: "Organizer", href: "/org" }, { label: "Events" }] },
  "/org/events/[eventId]": {
    items: [
      { label: "Organizer", href: "/org" },
      { label: "Events", href: "/org/events" },
      { label: "Event" },
    ],
  },
  "/org/events/[eventId]/exhibitors": {
    items: [
      { label: "Organizer", href: "/org" },
      { label: "Events", href: "/org/events" },
      { label: "Event" },
      { label: "Exhibitors" },
    ],
  },
  "/org/events/[eventId]/reports": {
    items: [
      { label: "Organizer", href: "/org" },
      { label: "Events", href: "/org/events" },
      { label: "Event" },
      { label: "Reports" },
    ],
  },
  "/org/events/[eventId]/settings": {
    items: [
      { label: "Organizer", href: "/org" },
      { label: "Events", href: "/org/events" },
      { label: "Event" },
      { label: "Settings" },
    ],
  },
  "/org/events/[eventId]/documents": {
    items: [
      { label: "Organizer", href: "/org" },
      { label: "Events", href: "/org/events" },
      { label: "Event" },
      { label: "Documents" },
    ],
  },
  "/org/analytics": { items: [{ label: "Organizer", href: "/org" }, { label: "Analytics" }] },
  "/org/settings": { items: [{ label: "Organizer", href: "/org" }, { label: "Settings" }] },
  "/org/users": { items: [{ label: "Organizer", href: "/org" }, { label: "Team" }] },
};

const EXHIBIT_BREADCRUMBS: Record<string, BreadcrumbConfig> = {
  "/exhibit/[organizationId]": { items: [{ label: "Exhibitor", href: "" }] },
  "/exhibit/[organizationId]/dashboard": { items: [{ label: "Exhibitor", href: "" }, { label: "Dashboard" }] },
  "/exhibit/[organizationId]/dashboard/[eventExhibitorId]": {
    items: [{ label: "Exhibitor", href: "" }, { label: "Dashboard" }],
  },
  "/exhibit/[organizationId]/visitors": {
    items: [{ label: "Exhibitor", href: "" }, { label: "Visitors" }],
  },
  "/exhibit/[organizationId]/attendees": {
    items: [{ label: "Exhibitor", href: "" }, { label: "Attendees" }],
  },
  "/exhibit/[organizationId]/analytics": {
    items: [{ label: "Exhibitor", href: "" }, { label: "Analytics" }],
  },
  "/exhibit/[organizationId]/ai-insights": {
    items: [{ label: "Exhibitor", href: "" }, { label: "AI Insights" }],
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
  "/exhibit/[organizationId]/settings": {
    items: [{ label: "Exhibitor", href: "" }, { label: "Settings" }],
  },
  "/exhibit/[organizationId]/team": {
    items: [{ label: "Exhibitor", href: "" }, { label: "Team" }],
  },
  "/exhibit/[organizationId]/forms": {
    items: [{ label: "Exhibitor", href: "" }, { label: "Forms" }],
  },
  "/exhibit/[organizationId]/documents": {
    items: [{ label: "Exhibitor", href: "" }, { label: "Documents" }],
  },
  "/exhibit/[organizationId]/qr": {
    items: [{ label: "Exhibitor", href: "" }, { label: "QR Codes" }],
  },
  "/exhibit/[organizationId]/relationships/[relId]": {
    items: [{ label: "Exhibitor", href: "" }, { label: "Visitors", href: "" }, { label: "Relationship" }],
  },
};

const ATTENDEE_BREADCRUMBS: Record<string, BreadcrumbConfig> = {
  "/e/[eventSlug]": { items: [{ label: "Events", href: "/e" }, { label: "Event" }] },
  "/e/[eventSlug]/saved": {
    items: [{ label: "Events", href: "/e" }, { label: "Event" }, { label: "Saved" }],
  },
  "/e/[eventSlug]/exhibitors/[exhibitorId]": {
    items: [{ label: "Events", href: "/e" }, { label: "Event" }, { label: "Exhibitor" }],
  },
  "/e/[eventSlug]/exhibitors/[exhibitorId]/insights": {
    items: [{ label: "Events", href: "/e" }, { label: "Event" }, { label: "Exhibitor" }, { label: "Insights" }],
  },
  "/account/profile": { items: [{ label: "Profile" }] },
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
    items: [{ label: "Experience", href: "/demo" }, { label: "Exhibitor", href: "/demo/exhibitor" }, { label: "Exhibitor Booth" }],
  },
  "/demo/exhibitor/[eventExhibitorId]/products": {
    items: [{ label: "Experience", href: "/demo" }, { label: "Exhibitor", href: "/demo/exhibitor" }, { label: "Products" }],
  },
  "/demo/exhibitor/[eventExhibitorId]/visitors": {
    items: [{ label: "Experience", href: "/demo" }, { label: "Exhibitor", href: "/demo/exhibitor" }, { label: "Visitors" }],
  },
  "/demo/exhibitor/[eventExhibitorId]/analytics": {
    items: [{ label: "Experience", href: "/demo" }, { label: "Exhibitor", href: "/demo/exhibitor" }, { label: "Analytics" }],
  },
  "/demo/exhibitor/[eventExhibitorId]/ai-insights": {
    items: [{ label: "Experience", href: "/demo" }, { label: "Exhibitor", href: "/demo/exhibitor" }, { label: "AI Insights" }],
  },
  "/demo/exhibitor/[eventExhibitorId]/qr": {
    items: [{ label: "Experience", href: "/demo" }, { label: "Exhibitor", href: "/demo/exhibitor" }, { label: "QR Codes" }],
  },
  "/demo/exhibitor/[eventExhibitorId]/preview": {
    items: [{ label: "Experience", href: "/demo" }, { label: "Exhibitor", href: "/demo/exhibitor" }, { label: "Booth Preview" }],
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
      if (match.items.some((i) => i.label === "Event")) {
        const eventId = segments[2];
        return match.items.map((item) => {
          if (item.label === "Event" && eventId) {
            return { ...item, href: `/org/events/${eventId}` };
          }
          return { ...item, href: item.href ?? undefined };
        });
      }
      return match.items.map((item) => ({ ...item, href: item.href ?? undefined }));
    }
    if (segments.length === 2) {
      return [{ label: "Organizer", href: "/org" }];
    }
    if (segments.length >= 3 && segments[1] === "events") {
      const eventId = segments[2];
      const items: BreadcrumbItem[] = [
        { label: "Organizer", href: "/org" },
        { label: "Events", href: "/org/events" },
      ];
      if (eventId) items.push({ label: "Event", href: `/org/events/${eventId}` });
      return items;
    }
  }

  if (pathname.startsWith("/exhibit")) {
    const match = matchBreadcrumb(pathname, EXHIBIT_BREADCRUMBS);
    if (match) {
      const orgId = segments[1];
      return match.items.map((item) => {
        if (item.href === "") {
          if (item.label === "Exhibitor") return { ...item, href: `/exhibit/${orgId}` };
          if (item.label === "Visitors") return { ...item, href: `/exhibit/${orgId}/visitors` };
          if (item.label === "Relationship") return undefined;
          return { ...item, href: `/exhibit/${orgId}/${item.label.toLowerCase().replace(/ /g, "-")}` };
        }
        return item;
      }).filter(Boolean) as BreadcrumbItem[];
    }
  }

  if (pathname.startsWith("/e") || pathname.startsWith("/account")) {
    const match = matchBreadcrumb(pathname, ATTENDEE_BREADCRUMBS);
    if (match) {
      const eventSlug = segments[0] === "e" ? segments[1] : undefined;
      return match.items.map((item) => {
        if (!item.href) return item;
        if (item.label === "Events") return { ...item, href: "/e" };
        if (item.label === "Event" && eventSlug) return { ...item, href: `/e/${eventSlug}` };
        return item;
      });
    }
  }

  if (pathname.startsWith("/demo")) {
    const match = matchBreadcrumb(pathname, DEMO_BREADCRUMBS);
    if (match) {
      return match.items.map((item) => ({ ...item, href: item.href ?? undefined }));
    }
  }

  return [];
}

export function Breadcrumbs({ className }: { className?: string }) {
  const pathname = usePathname();
  const items = resolveBreadcrumbItems(pathname);

  if (items.length === 0) return null;

  return <SharedBreadcrumbs items={items} className={`text-body [&_svg]:text-muted/50 ${className ?? ""}`} />;
}

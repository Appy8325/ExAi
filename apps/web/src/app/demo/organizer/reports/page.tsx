import { Card } from "@concourse/ui";

import {
  getPublicDemoAnalytics,
  getPublicDemoOverview,
} from "@concourse/api-client";
import { getApiBaseUrl } from "@/lib/api/config";
import {
  DemoPageHeader,
  DemoUnavailable,
} from "@/components/demo/shell";
import { computeOrganizerReport, DemoMobileNav } from "@/lib/demo-intelligence";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const SIDEBAR = [
  { label: "Dashboard", href: "/demo/organizer" },
  { label: "Events", href: "/demo/organizer/events" },
  { label: "Analytics", href: "/demo/organizer/analytics" },
  { label: "Booth Traffic", href: "/demo/organizer/heatmaps" },
  { label: "AI Insights", href: "/demo/organizer/ai-insights" },
  { label: "Reports", href: "/demo/organizer/reports" },
];

export default async function OrganizerReportsPage() {
  const apiBase = getApiBaseUrl();
  const overview = await getPublicDemoOverview({ baseUrl: apiBase }).catch(() => null);
  if (!overview) return <DemoUnavailable />;

  const event = overview.events[0];
  const analytics = event?.id
    ? await getPublicDemoAnalytics({ baseUrl: apiBase }, event.id).catch(() => null)
    : null;

  const report = analytics && event ? computeOrganizerReport(event.name, analytics) : null;

  return (
    <div className="space-y-8 px-6 py-8 sm:px-10 sm:py-10">
      <DemoMobileNav items={SIDEBAR} currentHref="/demo/organizer/reports" />

      <DemoPageHeader
        eyebrow="Organizer workspace"
        title={event?.name ?? "Reports"}
        description="Executive event report — read-only demo."
        badge="Report"
      />

      {!analytics ? (
        <Card>
          <p className="text-body text-secondary">Event report unavailable.</p>
        </Card>
      ) : report?.content ? (
        <Card>
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-primary">
                Executive AI report
              </h2>
              <p className="mt-1 text-body-sm text-secondary">
                AI-generated summary based on aggregate event data.
              </p>
            </div>
            {report.generatedAt && (
              <span className="text-caption text-muted shrink-0">
                Generated {new Date(report.generatedAt).toLocaleString()}
              </span>
            )}
          </div>
          <pre className="whitespace-pre-wrap text-body leading-7 text-secondary font-mono">
            {report.content}
          </pre>
        </Card>
      ) : (
        <Card>
          <p className="text-body text-muted">
            Report is being generated...
          </p>
        </Card>
      )}
    </div>
  );
}
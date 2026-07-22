import { notFound } from "next/navigation";
import { Card, EmptyState, MetricCard } from "@concourse/ui";

import {
  getPublicDemoExhibitorDashboard,
  getPublicDemoExhibitorVisitors,
  getPublicDemoOverview,
} from "@concourse/api-client";

import { getApiBaseUrl } from "@/lib/api/config";
import {
  DemoPageHeader,
  DemoUnavailable,
} from "@/components/demo/shell";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ExhibitorVisitorsPage({
  params,
}: {
  params: Promise<{ eventExhibitorId: string }>;
}) {
  const { eventExhibitorId } = await params;
  const apiBase = getApiBaseUrl();
  const [overview, dashboard, visitors] = await Promise.all([
    getPublicDemoOverview({ baseUrl: apiBase }).catch(() => null),
    getPublicDemoExhibitorDashboard({ baseUrl: apiBase }, eventExhibitorId).catch(() => null),
    getPublicDemoExhibitorVisitors({ baseUrl: apiBase }, eventExhibitorId).catch(() => null),
  ]);
  if (!overview || !dashboard) return <DemoUnavailable />;

  const booth = overview.events
    .flatMap((e) => e.exhibitors)
    .find((b) => b.id === eventExhibitorId);
  if (!booth) notFound();

  const pipeline = dashboard.pipeline;
  const total =
    pipeline.new + pipeline.active + pipeline.returning + pipeline.needsFollowUp;

  return (
    <div className="space-y-8">
      <DemoPageHeader
        eyebrow="Exhibitor workspace"
        title="Visitors"
        description="Full relationship pipeline with AI-enriched attendee profiles — read-only demo."
        badge="Pipeline"
      />

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <MetricCard label="New" value={String(pipeline.new)} />
        <MetricCard label="Active" value={String(pipeline.active)} />
        <MetricCard label="Returning" value={String(pipeline.returning)} />
        <MetricCard label="Follow-up" value={String(pipeline.needsFollowUp)} />
      </section>

      {visitors && visitors.length > 0 ? (
        <Card>
          <div className="mb-4">
            <h2 className="text-base font-semibold text-primary">
              {visitors.length} attendees captured
            </h2>
            <p className="text-sm text-secondary">
              AI-enriched profiles with intent signals and engagement history.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-default text-left">
                  <th className="pb-3 pr-4 font-medium text-muted">Attendee</th>
                  <th className="pb-3 pr-4 font-medium text-muted">Company</th>
                  <th className="pb-3 pr-4 font-medium text-muted">Intent</th>
                  <th className="pb-3 pr-4 text-right font-medium text-muted">Interactions</th>
                  <th className="pb-3 pr-4 text-right font-medium text-muted">Notes</th>
                  <th className="pb-3 font-medium text-muted">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-default">
                {visitors.map((v) => (
                  <tr key={v.relationshipId} className="group">
                    <td className="py-3 pr-4">
                      <p className="font-medium text-primary">{v.attendeeName}</p>
                      {v.jobTitle && (
                        <p className="text-xs text-muted">{v.jobTitle}</p>
                      )}
                      {v.attentionReasons.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {v.attentionReasons.map((reason) => (
                            <span
                              key={reason}
                              className="inline-flex items-center rounded-full border border-status-warning-border bg-status-warning-subtle px-1.5 py-0.5 text-[10px] font-medium text-status-warning-text"
                            >
                              {reason}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-secondary">
                      {v.company ?? <span className="text-muted">—</span>}
                    </td>
                    <td className="py-3 pr-4">
                      <IntentBadge label={v.intentLabel} hasLead={v.hasLead} />
                    </td>
                    <td className="py-3 pr-4 text-right tabular-nums text-primary">
                      {v.interactionCount}
                    </td>
                    <td className="py-3 pr-4 text-right tabular-nums text-secondary">
                      {v.notesCount}
                    </td>
                    <td className="py-3">
                      <StatusBadge status={v.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card>
          <EmptyState
            title="No visitors yet"
            description="Once attendees scan or interact with the booth, they appear here."
          />
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-base font-semibold text-primary">
            Recent activity
          </h2>
          {dashboard.recentActivity.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {dashboard.recentActivity.slice(0, 8).map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border border-default bg-sunken px-3 py-2"
                >
                  <span className="truncate text-sm text-secondary">
                    <span className="font-medium text-primary">{item.attendeeName ?? ""}</span>
                    {item.label.replace(item.attendeeName ?? "", "").trim()}
                  </span>
                  <span className="ml-2 shrink-0 text-xs text-muted">
                    {formatDateTime(item.at)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              title="No recent visitors"
              description="Once attendees scan or interact with the booth, they appear here."
            />
          )}
        </Card>

        <Card>
          <h2 className="text-base font-semibold text-primary">
            Needs attention
          </h2>
          {dashboard.attention.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {dashboard.attention.map((item) => (
                <li
                  key={item.relationshipId}
                  className="rounded-lg border border-status-warning-border bg-status-warning-subtle px-3 py-2"
                >
                  <p className="text-sm font-medium text-primary">
                    {item.attendeeName}
                  </p>
                  <p className="mt-1 text-xs text-secondary">
                    {item.reasons.join(" · ")}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              title="No flagged attendees"
              description="AI will highlight attendees worth re-engaging."
            />
          )}
        </Card>
      </div>

      <p className="text-xs text-muted">
        {total} relationships captured in this pipeline during the demo event.
      </p>
    </div>
  );
}

function IntentBadge({ label, hasLead }: { label: string; hasLead: boolean }) {
  const style =
    label === "Lead" ? "bg-status-success-subtle text-status-success-text border-status-success-border" :
    label === "High intent" ? "bg-status-danger-subtle text-status-danger-text border-status-danger-border" :
    label === "Active" ? "bg-status-info-subtle text-status-info-text border-status-info-border" :
    label === "Interested" ? "bg-brand-subtle text-brand border-brand/30" :
    "bg-sunken text-secondary border-default";
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${style}`}>
      {hasLead && <span className="mr-1">●</span>}
      {label}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const style =
    status === "active" ? "text-status-success-text" :
    status === "blocked" ? "text-status-danger-text" :
    "text-muted";
  return (
    <span className={`text-xs capitalize font-medium ${style}`}>
      {status}
    </span>
  );
}

function formatDateTime(value: string) {
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

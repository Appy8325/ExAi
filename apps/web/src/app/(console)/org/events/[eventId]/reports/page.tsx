import { Button, Card, MetricCard } from "@concourse/ui";

import {
  loadOrganizerAnalytics,
  loadOrganizerReport,
  loadOrganizerOverview,
} from "@/lib/organizer";
import { generateEventReport } from "./actions";

export default async function EventReportsPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const [overview, analytics, report] = await Promise.all([
    loadOrganizerOverview(),
    loadOrganizerAnalytics(eventId),
    loadOrganizerReport(eventId),
  ]);
  const event = overview?.events.find((item) => item.id === eventId);
  if (!event || !analytics)
    return (
      <p className="rounded-xl border border-default bg-surface p-6 text-secondary">
        Event report unavailable.
      </p>
    );

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted">
            Executive reporting
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-primary">
            {event.name}
          </h1>
          <p className="mt-1 text-sm text-secondary">
            Deterministic event metrics with an AI-generated executive summary.
          </p>
        </div>
        <form action={generateEventReport}>
          <input type="hidden" name="eventId" value={eventId} />
          <Button type="submit">
            {report ? "Regenerate report" : "Generate AI report"}
          </Button>
        </form>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Captured visits"
          value={String(analytics.traffic.capturedVisits)}
        />
        <MetricCard
          label="Unique attendees"
          value={String(analytics.traffic.uniqueVisitors)}
        />
        <MetricCard label="Leads" value={String(analytics.conversions.leads)} />
        <MetricCard
          label="Conversion"
          value={`${analytics.conversions.conversionRate}%`}
        />
      </section>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-primary">
              Executive AI report
            </h2>
            <p className="mt-1 text-sm text-secondary">
              Numeric claims cite the aggregate metric snapshot used at
              generation time.
            </p>
          </div>
          {report?.status === "complete" && (
            <a
              href={`/org/events/${eventId}/reports/download`}
              className="rounded-lg border border-default px-4 py-2 text-sm font-medium text-primary"
            >
              Download PDF
            </a>
          )}
        </div>
        {report?.status === "complete" && report.content ? (
          <div className="mt-6 whitespace-pre-wrap text-sm leading-7 text-secondary">
            {report.content}
          </div>
        ) : report?.status === "failed" ? (
          <p className="mt-6 text-sm text-danger">
            The previous AI generation failed. Live metrics remain available;
            try generating again.
          </p>
        ) : (
          <p className="mt-6 text-sm text-muted">
            Generate a report to turn the current event snapshot into cited
            outcomes, trends, limitations, and recommended next actions.
          </p>
        )}
        {report?.generatedAt && (
          <p className="mt-6 text-xs text-muted">
            Generated {new Date(report.generatedAt).toLocaleString()} using{" "}
            {report.model}.
          </p>
        )}
      </Card>
    </div>
  );
}

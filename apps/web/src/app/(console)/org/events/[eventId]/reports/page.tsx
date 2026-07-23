import Link from "next/link";
import { Button, Card } from "@concourse/ui";

import {
  loadOrganizerReport,
  loadOrganizerOverview,
} from "@/lib/organizer";
import { generateEventReport } from "./actions";

function formatDateRange(startAt: string, endAt: string): string {
  const start = new Date(startAt);
  const end = new Date(endAt);
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  const startStr = start.toLocaleDateString("en-US", opts);
  const endStr = end.toLocaleDateString("en-US", { ...opts, year: "numeric" });
  return `${startStr} – ${endStr}`;
}

export default async function EventReportsPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const [overview, report] = await Promise.all([
    loadOrganizerOverview(),
    loadOrganizerReport(eventId),
  ]);
  const event = overview?.events.find((item) => item.id === eventId);
  if (!event)
    return (
      <p className="rounded-xl border border-default bg-surface p-6 text-secondary">
        Event report unavailable.
      </p>
    );

  return (
    <div className="space-y-section">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-primary">
            {event.name}
          </h1>
          <p className="mt-1 text-body text-secondary">
            AI-generated executive summary with event outcomes, trends, and recommended actions.
          </p>
        </div>
        <form action={generateEventReport}>
          <input type="hidden" name="eventId" value={eventId} />
          <Button type="submit">
            {report ? "Regenerate report" : "Generate AI report"}
          </Button>
        </form>
      </header>

      <p className="text-body-sm text-muted">
        Showing report for {event.name}
        {event.status !== "past" ? ` · ${event.status}` : ""}
        {" · "}
        {formatDateRange(event.startAt, event.endAt)}
      </p>

      <Card>
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-primary">
              Executive AI summary
            </h2>
            <p className="mt-1 text-body-sm text-secondary">
              Includes cited metrics, outcome analysis, and recommended next steps.
            </p>
          </div>
          {report?.status === "complete" && (
            <Button variant="secondary" asChild>
              <Link href={`/org/events/${eventId}/reports/download`}>
                Download PDF
              </Link>
            </Button>
          )}
        </div>

        {report?.status === "complete" && report.content ? (
          <div className="whitespace-pre-wrap text-body leading-7 text-secondary">
            {report.content}
          </div>
        ) : report?.status === "failed" ? (
          <p className="text-body text-danger">
            The previous AI generation failed. Try generating again.
          </p>
        ) : (
          <p className="text-body text-muted">
            Generate a report to receive an AI-written executive summary with
            outcomes, limitations, and recommended actions for {event.name}.
          </p>
        )}

        {report?.generatedAt && (
          <p className="mt-6 text-caption text-muted">
            Generated {new Date(report.generatedAt).toLocaleString()}
            {report.model ? ` using ${report.model}` : ""}.
            View detailed metrics in{" "}
            <a href="/org/analytics" className="text-link hover:underline">
              Live Analytics
            </a>
            .
          </p>
        )}
      </Card>
    </div>
  );
}
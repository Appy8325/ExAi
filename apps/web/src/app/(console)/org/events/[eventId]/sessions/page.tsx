import Link from "next/link";
import { Button, EmptyState, PageHeader, SectionHeader, StatusBadge } from "@concourse/ui";
import { loadEventSessions, loadOrganizerOverview } from "@/lib/organizer";

export default async function SessionsPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const overview = await loadOrganizerOverview();
  const orgId = overview?.organizationId;
  const sessions = orgId ? await loadEventSessions(orgId, eventId) : undefined;

  return (
    <div className="space-y-section">
      <PageHeader
        title="Sessions"
        description="Manage the event agenda and schedule."
      />
      {orgId ? (
        <Button variant="primary" asChild>
          <Link href={`/org/events/${eventId}/sessions/new`}>
            Create session
          </Link>
        </Button>
      ) : null}
      {sessions && sessions.length > 0 ? (
        <section>
          <SectionHeader title="Agenda" />
          <div className="mt-3 space-y-2">
            {sessions.map((session) => (
              <Link
                key={session.id}
                href={`/org/events/${eventId}/sessions/${session.id}`}
                className="flex items-center justify-between gap-4 rounded-lg border border-default bg-surface p-4 transition-all hover:border-strong"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-body font-medium text-primary">{session.title}</p>
                  <p className="text-body-sm text-secondary">
                    {new Date(session.startAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    {" – "}
                    {new Date(session.endAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    {session.room ? ` · ${session.room}` : ""}
                    {session.capacity ? ` · ${session.capacity} seats` : ""}
                  </p>
                </div>
                <StatusBadge tone={session.status === "published" ? "success" : "warning"}>
                  {session.status}
                </StatusBadge>
              </Link>
            ))}
          </div>
        </section>
      ) : (
        <EmptyState
          title="No sessions yet"
          description="Create your first session to build the event agenda."
        />
      )}
    </div>
  );
}

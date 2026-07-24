import Link from "next/link";
import { notFound } from "next/navigation";
import { loadEventSession, loadOrganizerOverview } from "@/lib/organizer";
import { SessionForm } from "../../forms";

export default async function EditSessionPage({
  params,
}: {
  params: Promise<{ eventId: string; sessionId: string }>;
}) {
  const { eventId, sessionId } = await params;
  const overview = await loadOrganizerOverview();
  const orgId = overview?.organizationId;
  const session = orgId ? await loadEventSession(orgId, eventId, sessionId) : undefined;
  if (!session) notFound();

  return (
    <div className="space-y-section">
      <Link href={`/org/events/${eventId}/sessions`} className="text-body text-secondary hover:text-primary">
        ← Back to sessions
      </Link>
      <h1 className="text-title font-semibold text-primary">Edit session</h1>
      <SessionForm
        organizationId={orgId!}
        eventId={eventId}
        mode="edit"
        session={{
          id: session.id,
          title: session.title,
          description: session.description ?? "",
          startAt: session.startAt,
          endAt: session.endAt,
          timezone: session.timezone,
          room: session.room ?? "",
          capacity: session.capacity ?? undefined,
          status: session.status,
        }}
      />
    </div>
  );
}

import { loadOrganizerOverview } from "@/lib/organizer";
import { SessionForm } from "../../forms";

export default async function NewSessionPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const overview = await loadOrganizerOverview();
  const orgId = overview?.organizationId;

  return (
    <div className="space-y-section">
      <h1 className="text-title font-semibold text-primary">Create session</h1>
      {orgId ? (
        <SessionForm organizationId={orgId} eventId={eventId} mode="create" />
      ) : (
        <p className="text-secondary">Sign in to create sessions.</p>
      )}
    </div>
  );
}

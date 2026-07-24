import { loadOrganizerOverview } from "@/lib/organizer";
import { SpeakerForm } from "../../forms";

export default async function NewSpeakerPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const overview = await loadOrganizerOverview();
  const orgId = overview?.organizationId;

  return (
    <div className="space-y-section">
      <h1 className="text-title font-semibold text-primary">Add speaker</h1>
      {orgId ? (
        <SpeakerForm organizationId={orgId} eventId={eventId} mode="create" />
      ) : (
        <p className="text-secondary">Sign in to add speakers.</p>
      )}
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { loadEventSpeaker, loadOrganizerOverview } from "@/lib/organizer";
import { SpeakerForm } from "../../forms";

export default async function EditSpeakerPage({
  params,
}: {
  params: Promise<{ eventId: string; speakerId: string }>;
}) {
  const { eventId, speakerId } = await params;
  const overview = await loadOrganizerOverview();
  const orgId = overview?.organizationId;
  const speaker = orgId ? await loadEventSpeaker(orgId, eventId, speakerId) : undefined;
  if (!speaker) notFound();

  return (
    <div className="space-y-section">
      <Link
        href={`/org/events/${eventId}/speakers`}
        className="text-body text-secondary hover:text-primary"
      >
        ← Back to speakers
      </Link>
      <h1 className="text-title font-semibold text-primary">Edit speaker</h1>
      <SpeakerForm
        organizationId={orgId!}
        eventId={eventId}
        mode="edit"
        speaker={{
          id: speaker.id,
          name: speaker.name,
          bio: speaker.bio ?? "",
          photoUrl: speaker.photoUrl ?? "",
          company: speaker.company ?? "",
          title: speaker.title ?? "",
          socialLinks: speaker.socialLinks ?? [],
        }}
      />
    </div>
  );
}

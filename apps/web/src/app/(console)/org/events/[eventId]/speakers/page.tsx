import Link from "next/link";
import { Button, EmptyState, PageHeader, SectionHeader } from "@concourse/ui";
import { loadEventSpeakers, loadOrganizerOverview } from "@/lib/organizer";

export default async function SpeakersPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const overview = await loadOrganizerOverview();
  const orgId = overview?.organizationId;
  const speakers = orgId ? await loadEventSpeakers(orgId, eventId) : undefined;

  return (
    <div className="space-y-section">
      <PageHeader
        title="Speakers"
        description="Manage speakers presenting at this event."
      />
      {orgId ? (
        <Button variant="primary" asChild>
          <Link href={`/org/events/${eventId}/speakers/new`}>
            Add speaker
          </Link>
        </Button>
      ) : null}
      {speakers && speakers.length > 0 ? (
        <section>
          <SectionHeader title="All speakers" />
          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {speakers.map((speaker) => (
              <Link
                key={speaker.id}
                href={`/org/events/${eventId}/speakers/${speaker.id}`}
                className="rounded-lg border border-default bg-surface p-4 transition-all hover:border-strong"
              >
                <div className="flex items-start gap-3">
                  {speaker.photoUrl ? (
                    <img
                      src={speaker.photoUrl}
                      alt={speaker.name}
                      className="size-12 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <div className="size-12 shrink-0 rounded-full bg-sunken flex items-center justify-center text-body text-secondary">
                      {speaker.name.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-body font-medium text-primary">{speaker.name}</p>
                    {speaker.title ? <p className="text-body-sm text-secondary">{speaker.title}</p> : null}
                    {speaker.company ? <p className="text-caption text-muted">{speaker.company}</p> : null}
                  </div>
                </div>
                {speaker.bio ? (
                  <p className="mt-3 text-body-sm text-secondary line-clamp-2">{speaker.bio}</p>
                ) : null}
              </Link>
            ))}
          </div>
        </section>
      ) : (
        <EmptyState
          title="No speakers yet"
          description="Add a speaker to appear in the event agenda."
        />
      )}
    </div>
  );
}

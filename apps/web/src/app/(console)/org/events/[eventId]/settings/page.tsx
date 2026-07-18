import { loadOrganizerOverview } from "@/lib/organizer";
import {
  EventSettingsForm,
  PublishEventButton,
} from "../../../organizer-forms";

export default async function EventSettingsPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const overview = await loadOrganizerOverview();
  const event = overview?.events.find((item) => item.id === eventId);
  if (!event || !overview)
    return <p className="text-secondary">Event unavailable.</p>;
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-semibold text-primary">
          Event settings and branding
        </h1>
        <p className="mt-1 text-sm text-secondary">
          Configure identity, schedule, policy, and public branding.
        </p>
      </header>
      <EventSettingsForm
        organizationId={overview.organizationId}
        event={event}
      />
      {event.status === "draft" ? (
        <section className="rounded-xl border border-default bg-surface p-6">
          <h2 className="font-semibold text-primary">Publication</h2>
          <p className="mb-4 mt-1 text-sm text-secondary">
            Publishing makes the event public. A privacy policy is required.
          </p>
          <PublishEventButton
            organizationId={overview.organizationId}
            eventId={event.id}
          />
        </section>
      ) : (
        <a
          href={`/e/${event.slug}`}
          className="inline-flex h-10 items-center rounded-md border border-default px-4 text-sm font-medium text-primary"
        >
          Open public event
        </a>
      )}
    </div>
  );
}

import { Card, PageHeader, SectionHeader } from "@concourse/ui";
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
    return <div className="text-secondary">Event unavailable.</div>;
  return (
    <div className="space-y-section">
      <PageHeader
        title="Event settings and branding"
        description="Configure identity, schedule, policy, and public branding."
      />
      <EventSettingsForm
        organizationId={overview.organizationId}
        event={event}
      />
      {event.status === "draft" ? (
        <Card variant="default">
          <SectionHeader
            title="Publication"
            description="Publishing makes the event public. A privacy policy is required."
          />
          <div className="mt-4">
            <PublishEventButton
              organizationId={overview.organizationId}
              eventId={event.id}
            />
          </div>
        </Card>
      ) : (
        <a
          href={`/e/${event.slug}`}
          className="inline-flex h-10 items-center rounded-lg border border-strong bg-surface px-4 text-body-sm font-medium text-primary hover:bg-sunken transition-all"
        >
          Open public event
        </a>
      )}
    </div>
  );
}

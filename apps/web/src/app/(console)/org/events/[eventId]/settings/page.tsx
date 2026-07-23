import Link from "next/link";
import { redirect } from "next/navigation";
import { Button, Card, PageHeader, SectionHeader } from "@concourse/ui";
import { loadOrganizerOverview } from "@/lib/organizer";
import {
  ArchiveEventButton,
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
  if (!event || !overview) return <div className="text-secondary">Event unavailable.</div>;
  if (event.status === "archived") redirect("/org/events");

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
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <PublishEventButton
              organizationId={overview.organizationId}
              eventId={event.id}
            />
            <ArchiveEventButton
              organizationId={overview.organizationId}
              eventId={event.id}
            />
          </div>
        </Card>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="secondary" asChild>
            <Link href={`/e/${event.slug}`}>Open public event</Link>
          </Button>
          <ArchiveEventButton
            organizationId={overview.organizationId}
            eventId={event.id}
          />
        </div>
      )}
    </div>
  );
}

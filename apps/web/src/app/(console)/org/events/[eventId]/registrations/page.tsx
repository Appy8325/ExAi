import { PageHeader, EmptyState } from "@concourse/ui";

export default async function RegistrationsPage() {
  return (
    <div className="space-y-section">
      <PageHeader
        title="Registrations"
        description="View registered attendees for this event."
      />
      <EmptyState
        title="No registrations yet"
        description="Registration data will appear here once attendees sign up."
      />
    </div>
  );
}

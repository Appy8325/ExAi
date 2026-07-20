import { Card, PageHeader } from "@concourse/ui";

import { loadOrganizerOverview } from "@/lib/organizer";

export default async function SettingsPage() {
  const overview = await loadOrganizerOverview();
  return (
    <div className="space-y-section">
      <PageHeader
        title="Organization"
        description="Current organization identity"
      />
      <Card variant="default">
        <dl className="grid gap-6 sm:grid-cols-2">
          <div>
            <dt className="text-caption font-medium text-muted">Name</dt>
            <dd className="mt-1 text-body text-primary">{overview?.organizationName ?? "Unavailable"}</dd>
          </div>
          <div>
            <dt className="text-caption font-medium text-muted">Organization ID</dt>
            <dd className="mt-1 text-body text-primary font-mono">{overview?.organizationId ?? "Unavailable"}</dd>
          </div>
        </dl>
      </Card>
    </div>
  );
}

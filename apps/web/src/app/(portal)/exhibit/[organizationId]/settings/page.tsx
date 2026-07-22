import { EmptyState, PageHeader } from "@concourse/ui";
import { BoothProfileForm, PublishBoothPanel } from "../exhibitor-forms";
import { loadExhibitorWorkspace } from "@/lib/exhibitor";

export default async function SettingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ organizationId: string }>;
  searchParams: Promise<{ eeId?: string }>;
}) {
  const [{ organizationId }, { eeId }] = await Promise.all([
    params,
    searchParams,
  ]);
  const workspace = eeId
    ? await loadExhibitorWorkspace(organizationId, eeId)
    : undefined;
  if (!workspace) return <Unavailable />;
  return (
    <main className="mx-auto max-w-(--mq-content-max-narrow) space-y-section p-6">
      <PageHeader
        parent={{ label: workspace.event.name }}
        title="Company profile and booth"
        description="Configure the event-scoped public booth and company branding."
      />
      <BoothProfileForm workspace={workspace} />
      <PublishBoothPanel workspace={workspace} />
    </main>
  );
}

function Unavailable() {
  return (
    <main className="mx-auto max-w-3xl p-6">
      <EmptyState title="Settings unavailable" description="Booth settings could not be loaded." />
    </main>
  );
}

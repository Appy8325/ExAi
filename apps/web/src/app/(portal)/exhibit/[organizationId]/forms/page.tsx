import { PageHeader } from "@concourse/ui";
import { LeadFormEditor } from "../exhibitor-forms";
import { loadExhibitorWorkspace } from "@/lib/exhibitor";

export default async function LeadFormsPage({
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
  if (!workspace)
    return (
      <main className="p-6 text-secondary">
        Exhibitor workspace unavailable.
      </main>
    );
  return (
    <main className="mx-auto max-w-(--mq-content-max-narrow) space-y-section p-6">
      <PageHeader
        parent={{ label: workspace.event.name }}
        title="Lead form"
        description="Published versions are immutable. Saving changes after publication creates a new draft version."
      />
      <LeadFormEditor workspace={workspace} />
    </main>
  );
}

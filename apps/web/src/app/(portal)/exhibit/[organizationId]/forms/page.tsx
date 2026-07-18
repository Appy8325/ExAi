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
    <main className="mx-auto max-w-5xl space-y-6 p-6">
      <header>
        <p className="text-sm font-medium text-secondary">
          {workspace.event.name}
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-primary">Lead form</h1>
        <p className="mt-2 text-sm text-secondary">
          Published versions are immutable. Saving changes after publication
          creates a new draft version.
        </p>
      </header>
      <LeadFormEditor workspace={workspace} />
    </main>
  );
}

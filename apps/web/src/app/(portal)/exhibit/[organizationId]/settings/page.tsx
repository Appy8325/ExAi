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
    <main className="mx-auto max-w-5xl space-y-6 p-6">
      <header>
        <p className="text-sm font-medium text-secondary">
          {workspace.event.name}
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-primary">
          Company profile and booth
        </h1>
        <p className="mt-2 text-sm text-secondary">
          Configure the event-scoped public booth and company branding.
        </p>
      </header>
      <BoothProfileForm workspace={workspace} />
      <PublishBoothPanel workspace={workspace} />
    </main>
  );
}

function Unavailable() {
  return (
    <main className="mx-auto max-w-3xl p-6">
      <p className="rounded-xl border border-default bg-surface p-6 text-secondary">
        Choose an accepted exhibitor event from the exhibitor home page.
      </p>
    </main>
  );
}

import { redirect } from "next/navigation";
import Link from "next/link";

import { loadExhibitorOverview } from "@/lib/exhibitor";

export default async function PortalRootPage() {
  const workspaces = await loadExhibitorOverview();
  if (workspaces?.length === 1) {
    const workspace = workspaces[0]!;
    redirect(
      `/exhibit/${workspace.organizationId}/settings?eeId=${workspace.eventExhibitorId}`,
    );
  }
  return (
    <main className="mx-auto max-w-4xl space-y-6 p-6">
      <header>
        <p className="text-sm font-medium text-secondary">
          Exhibitor workspace
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-primary">
          Your events
        </h1>
      </header>
      {!workspaces ? (
        <section className="rounded-xl border border-default bg-surface p-6">
          <h2 className="font-semibold text-primary">Sign in required</h2>
          <p className="mt-2 text-secondary">
            Use the Magic Link from your exhibitor invitation.
          </p>
        </section>
      ) : workspaces.length ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {workspaces.map((workspace) => (
            <Link
              className="rounded-xl border border-default bg-surface p-5 hover:border-strong"
              href={`/exhibit/${workspace.organizationId}/settings?eeId=${workspace.eventExhibitorId}`}
              key={workspace.eventExhibitorId}
            >
              <p className="text-sm text-secondary">{workspace.eventName}</p>
              <h2 className="mt-1 font-semibold text-primary">
                {workspace.boothName}
              </h2>
              <p className="mt-3 text-xs uppercase tracking-wide text-muted">
                {workspace.status.replaceAll("_", " ")}
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-default bg-surface p-6 text-secondary">
          No accepted exhibitor invitations were found for this account.
        </p>
      )}
    </main>
  );
}

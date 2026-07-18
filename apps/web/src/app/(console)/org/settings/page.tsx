import { loadOrganizerOverview } from "@/lib/organizer";

export default async function SettingsPage() {
  const overview = await loadOrganizerOverview();
  return <div className="space-y-6"><header><h1 className="text-2xl font-semibold text-primary">Organization</h1><p className="mt-1 text-secondary">Current organization identity</p></header><section className="rounded-xl border border-default bg-surface p-5"><dl className="grid gap-4 sm:grid-cols-2"><div><dt className="text-sm text-muted">Name</dt><dd className="mt-1 text-primary">{overview?.organizationName ?? "Unavailable"}</dd></div><div><dt className="text-sm text-muted">Organization ID</dt><dd className="mt-1 text-primary">{overview?.organizationId ?? "Unavailable"}</dd></div></dl></section></div>;
}

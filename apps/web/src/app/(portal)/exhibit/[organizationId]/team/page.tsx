import { createClient } from "@/lib/supabase/server";

export default async function TeamPage() {
  const { data: { user } } = await (await createClient()).auth.getUser();
  return <div className="mx-auto max-w-4xl space-y-6 p-6"><header><p className="text-caption font-medium text-secondary">Exhibitor workspace</p><h1 className="mt-1 text-title font-semibold text-primary">Team</h1></header><section className="rounded-xl border border-default bg-surface p-5"><h2 className="font-semibold text-primary">Current member</h2><p className="mt-2 text-secondary">{user?.email ?? "No signed-in member"}</p></section></div>;
}

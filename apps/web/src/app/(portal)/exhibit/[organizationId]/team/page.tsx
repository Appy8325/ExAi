import { Card, PageHeader } from "@concourse/ui";
import { createClient } from "@/lib/supabase/server";

export default async function TeamPage() {
  const { data: { user } } = await (await createClient()).auth.getUser();
  return (
    <div className="mx-auto max-w-(--mq-content-max-narrow) space-y-section p-6">
      <PageHeader title="Team" description="Manage your booth staff and team members." />
      <Card variant="default">
        <h2 className="text-title-sm font-semibold text-primary">Current member</h2>
        <p className="mt-2 text-body text-secondary">{user?.email ?? "No signed-in member"}</p>
      </Card>
    </div>
  );
}

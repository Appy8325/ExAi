import { EmptyState } from "@concourse/ui";

export default function ReportsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-primary">Reports</h1>
        <p className="mt-0.5 text-sm text-secondary">Event reports and analytics</p>
      </div>

      <div className="rounded-xl border border-strong bg-surface">
        <EmptyState
          title="No reports yet"
          description="Reports will appear here once generated."
        />
      </div>
    </div>
  );
}

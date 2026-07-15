import { EmptyState } from "@concourse/ui";

export default function DocumentsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-primary">Documents</h1>
        <p className="mt-0.5 text-sm text-secondary">Manage event documents and resources</p>
      </div>

      <div className="rounded-xl border border-strong bg-surface">
        <EmptyState
          title="No documents yet"
          description="Documents will appear here once uploaded."
        />
      </div>
    </div>
  );
}

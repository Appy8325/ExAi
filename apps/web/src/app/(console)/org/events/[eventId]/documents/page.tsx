import { EmptyState } from "@concourse/ui";

export default function EventDocumentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-primary">Documents</h1>
        <p className="mt-1 text-sm text-secondary">Event documents and resources</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { name: "Event Schedule.pdf", size: "1.2 MB", type: "PDF" },
          { name: "Booth Map.pdf", size: "3.5 MB", type: "PDF" },
          { name: "Exhibitor Handbook.pdf", size: "4.1 MB", type: "PDF" },
        ].map((doc) => (
          <div key={doc.name} className="flex items-center gap-4 rounded-xl border border-default bg-surface p-4 hover:border-strong transition-colors">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-status-info-subtle text-xs font-bold text-status-info-text">
              {doc.type}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-primary">{doc.name}</p>
              <p className="text-xs text-muted">{doc.size}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-dashed border-default bg-surface p-12">
        <EmptyState title="Upload documents" description="Drag and drop files here or click to browse." action={<label className="cursor-pointer rounded-md bg-brand px-4 py-2 text-sm font-medium text-on-brand hover:bg-brand-hover transition-colors">Upload<input type="file" className="sr-only" multiple /></label>} />
      </div>
    </div>
  );
}
export default function DocumentsPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div>
        <p className="text-caption font-medium text-secondary">Exhibitor workspace</p>
        <h1 className="mt-1 text-title font-semibold text-primary">Documents</h1>
        <p className="mt-1 text-body-sm text-muted">Manage brochures, pricing sheets, and booth collateral.</p>
      </div>

      <section className="rounded-xl border border-default bg-surface p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-body font-semibold text-primary">Collateral</h2>
          <label className="cursor-pointer rounded-lg bg-brand px-4 py-2 text-caption font-medium text-on-brand hover:bg-brand-hover transition-colors">
            Upload
            <input type="file" className="sr-only" multiple />
          </label>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { name: "Company Overview.pdf", size: "2.4 MB", type: "PDF" },
            { name: "Product Line Card.pdf", size: "1.1 MB", type: "PDF" },
            { name: "Booth Brochure.pdf", size: "3.8 MB", type: "PDF" },
            { name: "Pricing Guide 2027.pdf", size: "890 KB", type: "PDF" },
          ].map((doc) => (
            <div
              key={doc.name}
              className="flex items-center gap-4 rounded-lg border border-default bg-sunken/30 p-4 hover:border-strong transition-colors"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-status-info-subtle text-xs font-bold text-status-info-text">
                {doc.type}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-body-sm font-medium text-primary">{doc.name}</p>
                <p className="text-caption text-muted">{doc.size}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-default bg-surface p-6">
        <h2 className="text-body font-semibold text-primary">Marketing Assets</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="flex min-h-32 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-default bg-sunken/30 p-6">
            <p className="text-body-sm text-muted">No banners uploaded</p>
            <label className="cursor-pointer text-body-sm text-brand hover:underline">
              Upload banner
              <input type="file" className="sr-only" accept="image/*" />
            </label>
          </div>
          <div className="flex min-h-32 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-default bg-sunken/30 p-6">
            <p className="text-body-sm text-muted">No logo uploaded</p>
            <label className="cursor-pointer text-body-sm text-brand hover:underline">
              Upload logo
              <input type="file" className="sr-only" accept="image/*" />
            </label>
          </div>
        </div>
      </section>
    </div>
  );
}
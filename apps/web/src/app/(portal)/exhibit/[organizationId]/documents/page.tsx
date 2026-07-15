export default function DocumentsPage() {
  const categories = [
    { name: "Brand Assets", icon: "brand", desc: "Logos, brand guidelines, style guides", count: 0 },
    { name: "Brochures", icon: "brochure", desc: "Product and company brochures", count: 0 },
    { name: "Videos", icon: "video", desc: "Product demos, testimonials, walkthroughs", count: 0 },
    { name: "Case Studies", icon: "case", desc: "Customer success stories, ROI reports", count: 0 },
    { name: "Datasheets", icon: "data", desc: "Technical specs, feature comparisons", count: 0 },
    { name: "Sales Decks", icon: "deck", desc: "Presentation decks for prospect meetings", count: 0 },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div>
        <p className="text-caption font-medium text-secondary">Exhibitor workspace</p>
        <h1 className="mt-1 text-title font-semibold text-primary">Documents</h1>
        <p className="mt-1 text-body-sm text-muted">Manage your booth collateral and sales materials.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <div key={cat.name} className="rounded-xl border border-default bg-surface p-5">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-sunken text-primary">
                <DocIcon name={cat.icon} />
              </div>
              <div>
                <h3 className="text-body font-medium text-primary">{cat.name}</h3>
                <p className="text-caption text-muted">{cat.count} files</p>
              </div>
            </div>
            <p className="mt-3 text-body-sm text-secondary">{cat.desc}</p>
            <div className="mt-4">
              {cat.count === 0 ? (
                <div className="flex min-h-20 items-center justify-center rounded-lg border border-dashed border-default">
                  <label className="cursor-pointer text-center">
                    <span className="text-body-sm text-link hover:underline">Upload files</span>
                    <input type="file" className="sr-only" multiple />
                    <p className="mt-1 text-caption text-muted">PDF, PNG, MP4 up to 25MB</p>
                  </label>
                </div>
              ) : (
                <p className="text-body-sm text-muted">File listing placeholder</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DocIcon({ name }: { name: string }) {
  const cls = "size-5";
  switch (name) {
    case "brand":
      return <svg className={cls} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2.5" y="2.5" width="15" height="15" rx="2" /><circle cx="10" cy="7.5" r="2.5" /><path d="M5 16l3.5-5 2.5 2.5L15 9" /></svg>;
    case "brochure":
      return <svg className={cls} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 3h12v14H4z" /><path d="M7 7h6M7 10h6M7 13h4" /></svg>;
    case "video":
      return <svg className={cls} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2.5" y="4.5" width="15" height="11" rx="1.5" /><path d="M14 10l-5 3V7l5 3z" /></svg>;
    case "case":
      return <svg className={cls} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 6.5h14V16a1 1 0 01-1 1H4a1 1 0 01-1-1V6.5z" /><path d="M7 6.5V5a1 1 0 011-1h4a1 1 0 011 1v1.5" /><path d="M3 9.5h14" /></svg>;
    case "data":
      return <svg className={cls} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="14" height="4" rx="1" /><rect x="3" y="9" width="14" height="4" rx="1" /><rect x="3" y="15" width="14" height="4" rx="1" /></svg>;
    case "deck":
      return <svg className={cls} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="16" height="11" rx="1.5" /><path d="M5 16l5-2 5 2" /></svg>;
    default:
      return <svg className={cls} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 3h6l4 4v10a1 1 0 01-1 1H5a1 1 0 01-1-1V4a1 1 0 011-1z" /></svg>;
  }
}

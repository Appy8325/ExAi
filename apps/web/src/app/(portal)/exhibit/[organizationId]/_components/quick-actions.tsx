const actions = [
  { label: "Open QR", icon: "qr", desc: "Display your booth QR code" },
  { label: "Download QR", icon: "download", desc: "Save QR as image" },
  { label: "Share QR", icon: "share", desc: "Share QR via link" },
  { label: "Open Directory", icon: "dir", desc: "Browse attendee directory" },
  { label: "Invite Team", icon: "invite", desc: "Add team members" },
  { label: "Upload Collateral", icon: "upload", desc: "Add brochures & decks" },
  { label: "Company Branding", icon: "brand", desc: "Update booth branding" },
];

export function QuickActions() {
  return (
    <section className="rounded-xl border border-default bg-surface p-5">
      <h2 className="mb-4 text-body font-semibold text-primary">Quick Actions</h2>
      <div className="flex flex-wrap gap-2">
        {actions.map((a) => (
          <button
            key={a.label}
            className="inline-flex items-center gap-2 rounded-lg border border-default bg-surface px-3 py-2 text-body-sm text-secondary transition-colors hover:bg-sunken hover:text-primary"
            title={a.desc}
          >
            <ActionIcon name={a.icon} />
            {a.label}
          </button>
        ))}
      </div>
    </section>
  );
}

function ActionIcon({ name }: { name: string }) {
  const cls = "size-4 shrink-0";
  switch (name) {
    case "qr":
      return <svg className={cls} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1.5" y="1.5" width="5" height="5" rx=".5" /><rect x="9.5" y="1.5" width="5" height="5" rx=".5" /><rect x="1.5" y="9.5" width="5" height="5" rx=".5" /><path d="M9.5 11h2v2M11.5 9.5v-.5M13.5 11.5H14M14 14v-1.5M11.5 14H13" /></svg>;
    case "download":
      return <svg className={cls} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 1v9M4 6l4 4 4-4M2 12v1.5a1 1 0 001 1h10a1 1 0 001-1V12" /></svg>;
    case "share":
      return <svg className={cls} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="4" cy="8" r="2.5" /><circle cx="12" cy="4" r="2.5" /><circle cx="12" cy="12" r="2.5" /><path d="M6 9.5l4 2M6 6.5l4-2" /></svg>;
    case "dir":
      return <svg className={cls} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1.5 4.5h13V13a1 1 0 01-1 1h-11a1 1 0 01-1-1V4.5z" /><path d="M1.5 4.5L3 2h4l1.5 2.5" /><path d="M6.5 8.5h3M8 7v3" /></svg>;
    case "invite":
      return <svg className={cls} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M11 4.5A2.5 2.5 0 118.5 2 2.5 2.5 0 0111 4.5z" /><path d="M14 14c0-2.8-2.2-5-5-5S4 11.2 4 14" /><path d="M11 11l-2 2-1-1" /></svg>;
    case "upload":
      return <svg className={cls} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 1v9M4 6l4-4 4 4M2 12v1.5a1 1 0 001 1h10a1 1 0 001-1V12" /></svg>;
    case "brand":
      return <svg className={cls} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1.5" y="1.5" width="13" height="13" rx="2" /><circle cx="8" cy="6" r="2.5" /><path d="M4 13.5l3-4 2 2 3-3.5" /></svg>;
    default:
      return <svg className={cls} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="3" /></svg>;
  }
}

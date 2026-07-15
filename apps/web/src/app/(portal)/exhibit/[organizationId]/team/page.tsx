export default function TeamPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-caption font-medium text-secondary">Exhibitor workspace</p>
          <h1 className="mt-1 text-title font-semibold text-primary">Team</h1>
          <p className="mt-1 text-body-sm text-muted">Manage team members and permissions.</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-body-sm font-medium text-on-brand hover:bg-brand-hover">
          <svg className="size-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 3v10M3 8h10" /></svg>
          Invite Member
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-xl border border-default bg-surface p-5 lg:col-span-2">
          <h2 className="mb-4 text-body font-semibold text-primary">Active Members</h2>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 rounded-lg border border-default p-4">
                <div className="flex size-10 items-center justify-center rounded-full bg-sunken text-body-sm font-semibold text-primary">
                  {["JD", "SK", "MR"][i - 1]}
                </div>
                <div className="flex-1">
                  <p className="text-body-sm font-medium text-primary">{["Jamie Doe", "Sam Kim", "Morgan Ross"][i - 1]}</p>
                  <p className="text-caption text-muted">{["jamie@exhibitor.com", "sam@exhibitor.com", "morgan@exhibitor.com"][i - 1]}</p>
                </div>
                <span className="inline-flex items-center rounded-full border border-status-success-border bg-status-success-subtle px-2.5 py-0.5 text-caption font-medium text-status-success-text">Active</span>
                <select className="rounded-lg border border-default bg-surface px-2 py-1 text-caption text-primary outline-none" defaultValue="member">
                  <option value="admin">Admin</option>
                  <option value="member">Member</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div className="rounded-xl border border-default bg-surface p-5">
            <h2 className="mb-4 text-body font-semibold text-primary">Pending Invites</h2>
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg bg-sunken p-3">
                  <div className="flex size-8 items-center justify-center rounded-full border border-dashed border-default text-caption text-muted">?</div>
                  <div className="flex-1">
                    <p className="text-body-sm text-primary">{["alex@partner.com", "jordan@vendor.com"][i - 1]}</p>
                    <p className="text-caption text-muted">Invited 2 days ago</p>
                  </div>
                  <button className="text-caption text-muted hover:text-primary">Cancel</button>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-default bg-surface p-5">
            <h2 className="mb-4 text-body font-semibold text-primary">Roles</h2>
            <div className="space-y-3">
              <RoleRow label="Admin" desc="Full access to all features" />
              <RoleRow label="Member" desc="Can manage relationships and documents" />
              <RoleRow label="Viewer" desc="Read-only access" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function RoleRow({ label, desc }: { label: string; desc: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1 flex size-4 items-center justify-center rounded-full border border-default bg-sunken text-[8px] text-muted">✓</div>
      <div>
        <p className="text-body-sm font-medium text-primary">{label}</p>
        <p className="text-caption text-muted">{desc}</p>
      </div>
    </div>
  );
}

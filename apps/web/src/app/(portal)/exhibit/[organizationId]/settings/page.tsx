export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div>
        <p className="text-caption font-medium text-secondary">Exhibitor workspace</p>
        <h1 className="mt-1 text-title font-semibold text-primary">Settings</h1>
      </div>

      <section className="rounded-xl border border-default bg-surface p-6">
        <h2 className="text-body font-semibold text-primary">Company Information</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Company Name" value="Acme Exhibits Inc." />
          <Field label="Booth Number" value="B-42" />
          <Field label="Website" value="https://acme-exhibits.com" />
          <Field label="Industry" value="Technology" />
        </div>
      </section>

      <section className="rounded-xl border border-default bg-surface p-6">
        <h2 className="text-body font-semibold text-primary">Branding</h2>
        <div className="mt-4 grid gap-6 sm:grid-cols-2">
          <div>
            <p className="text-body-sm font-medium text-primary">Company Logo</p>
            <div className="mt-2 flex min-h-32 items-center justify-center rounded-lg border border-dashed border-default bg-sunken">
              <label className="cursor-pointer text-center">
                <span className="text-body-sm text-link hover:underline">Upload logo</span>
                <input type="file" className="sr-only" accept="image/*" />
                <p className="mt-1 text-caption text-muted">PNG or SVG, max 2MB</p>
              </label>
            </div>
          </div>
          <div>
            <p className="text-body-sm font-medium text-primary">Banner Image</p>
            <div className="mt-2 flex min-h-32 items-center justify-center rounded-lg border border-dashed border-default bg-sunken">
              <label className="cursor-pointer text-center">
                <span className="text-body-sm text-link hover:underline">Upload banner</span>
                <input type="file" className="sr-only" accept="image/*" />
                <p className="mt-1 text-caption text-muted">1920x400 recommended</p>
              </label>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-default bg-surface p-6">
        <h2 className="text-body font-semibold text-primary">Memory Profile</h2>
        <p className="mt-1 text-body-sm text-secondary">Configure how AI remembers and uses context about your booth.</p>
        <div className="mt-4 space-y-4">
          <ToggleRow label="Auto-summarize relationships" desc="AI generates summaries after each interaction" defaultChecked />
          <ToggleRow label="Smart follow-up reminders" desc="Get notified when follow-up is recommended" defaultChecked />
          <ToggleRow label="Cross-event memory" desc="Retain context across multiple events" />
        </div>
      </section>

      <section className="rounded-xl border border-default bg-surface p-6">
        <h2 className="text-body font-semibold text-primary">Notification Preferences</h2>
        <div className="mt-4 space-y-4">
          <ToggleRow label="New visitor alert" desc="When someone scans your QR code" defaultChecked />
          <ToggleRow label="Profile enrichment" desc="When an attendee shares or updates their profile" defaultChecked />
          <ToggleRow label="Follow-up reminders" desc="Daily digest of relationships needing attention" defaultChecked />
          <ToggleRow label="Team activity" desc="When team members add notes or update relationships" />
        </div>
      </section>

      <section className="rounded-xl border border-default bg-surface p-6">
        <h2 className="text-body font-semibold text-primary">QR Settings</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-default p-4">
            <p className="text-body-sm font-medium text-primary">QR Code</p>
            <div className="mt-2 flex items-center justify-center rounded-lg bg-surface p-4">
              <svg className="size-32" viewBox="0 0 100 100" fill="currentColor">
                <rect x="10" y="10" width="30" height="30" rx="3" /><rect x="10" y="10" width="10" height="10" /><rect x="20" y="10" width="10" height="10" /><rect x="10" y="20" width="10" height="10" /><rect x="60" y="10" width="30" height="30" rx="3" /><rect x="60" y="10" width="10" height="10" /><rect x="70" y="10" width="10" height="10" /><rect x="60" y="20" width="10" height="10" /><rect x="10" y="60" width="30" height="30" rx="3" /><rect x="10" y="60" width="10" height="10" /><rect x="20" y="60" width="10" height="10" /><rect x="10" y="70" width="10" height="10" /><rect x="60" y="60" width="10" height="10" /><rect x="80" y="60" width="10" height="10" /><rect x="60" y="80" width="10" height="10" />
              </svg>
            </div>
          </div>
          <div className="space-y-3">
            <ToggleRow label="Enabled" desc="QR code is active and scannable" defaultChecked />
            <ToggleRow label="Auto-open directory" desc="After scan, show attendee directory" />
            <ToggleRow label="Require email" desc="Attendees must provide email before access" defaultChecked />
          </div>
        </div>
      </section>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="text-body-sm text-secondary">{label}</label>
      <p className="mt-1 text-body text-primary">{value}</p>
    </div>
  );
}

function ToggleRow({ label, desc, defaultChecked }: { label: string; desc: string; defaultChecked?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-body-sm font-medium text-primary">{label}</p>
        <p className="text-caption text-muted">{desc}</p>
      </div>
      <label className="relative inline-flex h-5 w-9 cursor-pointer items-center">
        <input type="checkbox" className="peer sr-only" defaultChecked={defaultChecked} />
        <span className="absolute inset-0 rounded-full bg-sunken transition-colors peer-checked:bg-brand" />
        <span className="absolute left-0.5 top-0.5 size-4 rounded-full bg-surface transition-transform peer-checked:translate-x-4" />
      </label>
    </div>
  );
}

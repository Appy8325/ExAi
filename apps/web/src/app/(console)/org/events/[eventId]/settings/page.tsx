import { Card, Input, Button } from "@concourse/ui";

export default function EventSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-primary">Event Settings</h1>
        <p className="mt-1 text-sm text-secondary">Configure event preferences</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-4">
          <h2 className="text-base font-semibold text-primary">General</h2>
          <div className="space-y-4">
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-secondary">Event Name</span>
              <Input defaultValue="TechExpo 2027" />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-secondary">Venue</span>
              <Input defaultValue="San Jose Convention Center" />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-secondary">Slug</span>
              <Input defaultValue="techexpo-2027" />
            </label>
          </div>
        </Card>

        <Card className="space-y-4">
          <h2 className="text-base font-semibold text-primary">Dates</h2>
          <div className="space-y-4">
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-secondary">Start Date</span>
              <Input defaultValue="2027-05-12" type="date" />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-secondary">End Date</span>
              <Input defaultValue="2027-05-14" type="date" />
            </label>
          </div>
        </Card>

        <Card className="space-y-4">
          <h2 className="text-base font-semibold text-primary">Visibility</h2>
          <div className="space-y-3">
            <Toggle label="Public event directory" desc="Attendees can browse exhibitors without signing in" defaultChecked />
            <Toggle label="Allow QR enrollment" desc="Attendees can connect to exhibitors by scanning QR codes" defaultChecked />
            <Toggle label="Show event on landing page" desc="Feature this event on ExAi's public page" />
          </div>
        </Card>

        <Card className="space-y-4">
          <h2 className="text-base font-semibold text-primary">Danger zone</h2>
          <p className="text-sm text-muted">Archiving is irreversible. Data is retained but the event becomes read-only.</p>
          <Button variant="danger">Archive Event</Button>
        </Card>
      </div>
    </div>
  );
}

function Toggle({ label, desc, defaultChecked }: { label: string; desc: string; defaultChecked?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-primary">{label}</p>
        <p className="text-xs text-muted">{desc}</p>
      </div>
      <label className="relative inline-flex h-5 w-9 cursor-pointer items-center">
        <input type="checkbox" className="peer sr-only" defaultChecked={defaultChecked} />
        <span className="absolute inset-0 rounded-full bg-sunken transition-colors peer-checked:bg-brand" />
        <span className="absolute left-0.5 top-0.5 size-4 rounded-full bg-surface transition-transform peer-checked:translate-x-4" />
      </label>
    </div>
  );
}
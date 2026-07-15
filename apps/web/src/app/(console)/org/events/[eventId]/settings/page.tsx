import { Card, Input } from "@concourse/ui";

export default function EventSettingsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-primary">Event Settings</h1>
        <p className="mt-0.5 text-sm text-secondary">Configure event preferences and options</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold text-primary">General</h2>
          <div className="mt-4 grid gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-secondary">Event Name</label>
              <Input defaultValue="Tech Expo 2026" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-secondary">Venue</label>
              <Input defaultValue="San Francisco Convention Center" />
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-primary">Dates & Time</h2>
          <div className="mt-4 grid gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-secondary">Start Date</label>
              <Input defaultValue="2026-03-15" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-secondary">End Date</label>
              <Input defaultValue="2026-03-17" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

import { Card, MetricCard } from "@concourse/ui";

export default function AdminPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted">Platform admin</p>
        <h1 className="text-2xl font-semibold text-primary mt-1">Overview</h1>
        <p className="mt-1 text-sm text-secondary">Monitor platform health, organizations, and system events</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Organizations" value="12" />
        <MetricCard label="Active Events" value="3" />
        <MetricCard label="Total Users" value="1,247" />
        <MetricCard label="API Health" value="Healthy" detail="99.9% uptime" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold text-primary">Recent System Events</h2>
          <div className="mt-4 space-y-3">
            {[
              "Organization TechExpo Events upgraded to Pro plan",
              "New event TechExpo 2027 created",
              "Northstar Cloud integration webhook configured",
              "Database backup completed successfully",
            ].map((event, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg border border-default bg-sunken/30 p-3 text-sm text-primary">
                <span className="size-1.5 rounded-full bg-status-success" />
                {event}
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-primary">Service Status</h2>
          <div className="mt-4 space-y-3">
            {[
              { name: "API", status: "Operational" },
              { name: "Database", status: "Operational" },
              { name: "AI Engine", status: "Operational" },
              { name: "Worker Queue", status: "Operational" },
              { name: "Email Service", status: "Operational" },
            ].map((svc) => (
              <div key={svc.name} className="flex items-center justify-between rounded-lg border border-default bg-sunken/30 px-4 py-3">
                <span className="text-sm font-medium text-primary">{svc.name}</span>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-status-success-text">
                  <span className="size-1.5 rounded-full bg-status-success-solid" />
                  {svc.status}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

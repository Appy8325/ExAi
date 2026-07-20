import { Card, KPICard, PageHeader, SectionHeader, StatusBadge } from "@concourse/ui";

export default function AdminPage() {
  return (
    <div className="space-y-section">
      <PageHeader
        title="Overview"
        description="Monitor platform health, organizations, and system events"
      />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard label="Organizations" value="12" accent="brand" />
        <KPICard label="Active Events" value="3" accent="info" />
        <KPICard label="Total Users" value="1,247" accent="success" />
        <KPICard label="API Health" value="Healthy" detail="99.9% uptime" accent="ai" />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card variant="default">
          <SectionHeader title="Recent System Events" />
          <div className="mt-4 space-y-3">
            {[
              "Organization TechExpo Events upgraded to Pro plan",
              "New event TechExpo 2027 created",
              "Northstar Cloud integration webhook configured",
              "Database backup completed successfully",
            ].map((event, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg border border-default bg-sunken/30 p-3 text-body-sm text-primary">
                <span className="size-1.5 rounded-full bg-status-success-solid" />
                {event}
              </div>
            ))}
          </div>
        </Card>

        <Card variant="default">
          <SectionHeader title="Service Status" />
          <div className="mt-4 space-y-3">
            {[
              { name: "API Gateway", status: "Operational" },
              { name: "Database", status: "Operational" },
              { name: "AI Inference", status: "Degraded" },
              { name: "File Storage", status: "Operational" },
            ].map((service) => (
              <div key={service.name} className="flex items-center justify-between border-b border-default pb-3 last:border-0 last:pb-0">
                <span className="text-body-sm text-primary">{service.name}</span>
                <StatusBadge tone={service.status === "Operational" ? "success" : "warning"}>
                  {service.status}
                </StatusBadge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

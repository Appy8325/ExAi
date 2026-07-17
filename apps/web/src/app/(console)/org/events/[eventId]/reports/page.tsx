import { Card } from "@concourse/ui";

export default function EventReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-primary">Reports</h1>
        <p className="mt-1 text-sm text-secondary">Event reports and analytics</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          { label: "Attendance Summary", desc: "Check-in rate, peak hours, exhibitor visits" },
          { label: "Exhibitor Performance", desc: "Booth engagement, QR scans, relationship counts" },
          { label: "AI Enrichment Report", desc: "Profile completion rates, enrichment events" },
          { label: "Relationship Export", desc: "Download all relationships as CSV for CRM import" },
        ].map((report) => (
          <Card key={report.label}>
            <h3 className="font-medium text-primary">{report.label}</h3>
            <p className="mt-1 text-sm text-muted">{report.desc}</p>
            <button type="button" className="mt-3 text-sm font-medium text-brand hover:underline">
              Generate report
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
}
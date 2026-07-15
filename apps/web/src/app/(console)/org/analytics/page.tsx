import { MetricCard } from "@concourse/ui";

const metrics = [
  { label: "Total Attendance", value: "200" },
  { label: "Active Exhibitors", value: "5" },
  { label: "Relationships Formed", value: "500" },
  { label: "Engagement Score", value: "84%" },
];

const sections = [
  {
    title: "Attendance",
    description: "Track attendee registration and check-in trends across events.",
    stats: [
      { label: "Registered", value: "200" },
      { label: "Checked In", value: "178" },
      { label: "Check-in Rate", value: "89%" },
    ],
  },
  {
    title: "Exhibitors",
    description: "Monitor exhibitor participation and booth activity.",
    stats: [
      { label: "Total Exhibitors", value: "5" },
      { label: "Active Booths", value: "5" },
      { label: "Avg. Interactions per Booth", value: "100" },
    ],
  },
  {
    title: "Relationships",
    description: "Analyze connections formed between exhibitors and attendees.",
    stats: [
      { label: "Total Relationships", value: "500" },
      { label: "Avg. per Exhibitor", value: "100" },
      { label: "Notes Added", value: "25" },
    ],
  },
  {
    title: "Engagement",
    description: "Measure overall engagement across all events and touchpoints.",
    stats: [
      { label: "Total Interactions", value: "1,500" },
      { label: "Avg. per Attendee", value: "7.5" },
      { label: "Repeat Interactions", value: "320" },
    ],
  },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-primary">Analytics</h1>
        <p className="mt-1 text-secondary">Event and engagement analytics</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => (
          <MetricCard key={m.label} label={m.label} value={m.value} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {sections.map((section) => (
          <section key={section.title} className="rounded-xl border border-strong bg-surface p-6">
            <h2 className="text-lg font-semibold text-primary">{section.title}</h2>
            <p className="mt-1 text-sm text-secondary">{section.description}</p>
            <div className="mt-4 grid grid-cols-3 gap-4">
              {section.stats.map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl font-semibold text-primary">{stat.value}</p>
                  <p className="mt-0.5 text-xs text-muted">{stat.label}</p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <section className="rounded-xl border border-strong bg-surface p-6">
        <h2 className="text-lg font-semibold text-primary">Engagement Heatmap</h2>
        <p className="mt-1 text-sm text-secondary">Visual representation of engagement density across event hours and booths.</p>
        <div className="mt-4 flex h-64 items-center justify-center rounded-lg border border-dashed border-default bg-sunken/30">
          <div className="text-center">
            <svg className="mx-auto h-10 w-10 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path d="M4 4v16h16" /><path d="M4 20l4-8 4 4 4-12 4 8" />
            </svg>
            <p className="mt-2 text-sm text-muted">Heatmap visualization will appear here once sufficient data is collected.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

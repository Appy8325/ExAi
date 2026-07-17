import { Card, MetricCard } from "@concourse/ui";

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
    color: "bg-viz-cat-1",
  },
  {
    title: "Exhibitors",
    description: "Monitor exhibitor participation and booth activity.",
    stats: [
      { label: "Total Exhibitors", value: "5" },
      { label: "Active Booths", value: "5" },
      { label: "Avg. Interactions/Booth", value: "100" },
    ],
    color: "bg-viz-cat-3",
  },
  {
    title: "Relationships",
    description: "Analyze connections formed between exhibitors and attendees.",
    stats: [
      { label: "Total Relationships", value: "500" },
      { label: "Avg. per Exhibitor", value: "100" },
      { label: "Notes Added", value: "25" },
    ],
    color: "bg-viz-cat-4",
  },
  {
    title: "Engagement",
    description: "Measure engagement across all events and touchpoints.",
    stats: [
      { label: "Total Interactions", value: "1,500" },
      { label: "Avg. per Attendee", value: "7.5" },
      { label: "Repeat Interactions", value: "320" },
    ],
    color: "bg-viz-cat-2",
  },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted">Organizer workspace</p>
        <h1 className="text-2xl font-semibold text-primary mt-1">Analytics</h1>
        <p className="mt-1 text-sm text-secondary">Event and engagement analytics</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => (
          <MetricCard key={m.label} label={m.label} value={m.value} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {sections.map((section) => (
          <Card key={section.title}>
            <div className="flex items-center gap-3">
              <div className={`h-3 w-3 rounded-full ${section.color}`} />
              <h2 className="text-lg font-semibold text-primary">{section.title}</h2>
            </div>
            <p className="mt-2 text-sm text-secondary">{section.description}</p>
            <div className="mt-5 grid grid-cols-3 gap-4">
              {section.stats.map((stat) => (
                <div key={stat.label} className="rounded-lg border border-default bg-sunken/30 p-3">
                  <p className="text-2xl font-semibold tabular-nums text-primary">{stat.value}</p>
                  <p className="mt-1 text-xs text-muted">{stat.label}</p>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-primary">Engagement Timeline</h2>
        <p className="mt-1 text-sm text-secondary">Engagement density across event hours and booths.</p>
        <div className="mt-6 grid grid-cols-7 gap-2">
          {Array.from({ length: 7 }, (_, i) => (
            <div key={i} className="space-y-1.5">
              <p className="text-center text-xs text-muted">Day {i + 1}</p>
              {Array.from({ length: 5 }, (_, j) => {
                const h = 20 + Math.sin(i * 1.2 + j * 0.7) * 12 + (Math.random() * 8);
                const colors = ["bg-viz-heat-1", "bg-viz-heat-2", "bg-viz-heat-3", "bg-viz-heat-4", "bg-viz-heat-5"];
                const ci = Math.min(4, Math.floor((h - 20) / 12));
                return (
                  <div
                    key={j}
                    className={`h-10 rounded ${colors[ci]}`}
                    title={`${Math.round(h)} engagements`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
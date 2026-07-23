import Link from "next/link";
import { KPICard, PageHeader, SectionHeader, StatusBadge } from "@concourse/ui";
import { loadOrganizerOverview } from "@/lib/organizer";
import { CreateOrganizationForm } from "./organizer-forms";

export default async function OrgDashboardPage() {
  const overview = await loadOrganizerOverview();
  if (!overview) return <CreateOrganizationForm />;

  const events = overview.events;
  const pastEvents = events.filter((e) => e.status === "past" || new Date(e.endAt) < new Date());
  const draftEvents = events.filter((e) => e.status === "draft");
  const liveEvents = events.filter((e) => e.status === "live");
  const publishedEvents = events.filter((e) => e.status === "published");
  const activeNonPastEvents = events.filter((e) => e.status !== "past");

  const upcomingEvents = activeNonPastEvents
    .filter((e) => e.status === "draft" || e.status === "published")
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());

  const lowExhibitorEvents = activeNonPastEvents.filter(
    (e) => e.exhibitors < 3 && e.status !== "live",
  );
  const zeroAttendeeEvents = activeNonPastEvents.filter(
    (e) => e.attendees === 0 && e.status !== "past",
  );

  const nextEvent = upcomingEvents[0];
  const daysUntilNext = nextEvent
    ? Math.ceil((new Date(nextEvent.startAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const allHealthy = draftEvents.length === 0 && lowExhibitorEvents.length === 0 && zeroAttendeeEvents.length === 0 && liveEvents.length > 0;
  const needsAttention = draftEvents.length + lowExhibitorEvents.length + zeroAttendeeEvents.length;

  const avgExhibitorsPerActive = activeNonPastEvents.length > 0
    ? Math.round(overview.totals.exhibitors / activeNonPastEvents.length)
    : 0;
  const avgAttendeesPerEvent = overview.totals.events > 0
    ? Math.round(overview.totals.attendees / overview.totals.events)
    : 0;

  const stats = [
    {
      label: "Total Events",
      value: String(overview.totals.events),
      detail: `${liveEvents.length} live · ${publishedEvents.length} upcoming · ${pastEvents.length} past`,
      accent: "brand" as const,
      trend: liveEvents.length > 0
        ? { value: `${liveEvents.length} live now`, positive: true }
        : draftEvents.length > 0
        ? { value: `${draftEvents.length} awaiting publish`, positive: false }
        : undefined,
    },
    {
      label: "Exhibitors",
      value: String(overview.totals.exhibitors),
      detail: `${avgExhibitorsPerActive} average per active event`,
      accent: "info" as const,
      trend: avgExhibitorsPerActive >= 10
        ? { value: "Strong booth coverage", positive: true }
        : avgExhibitorsPerActive >= 5
        ? { value: "Healthy exhibitor count", positive: true }
        : { value: "Below recommended average", positive: false },
    },
    {
      label: "Attendees",
      value: String(overview.totals.attendees),
      detail: `${avgAttendeesPerEvent} average per event`,
      accent: "success" as const,
      trend: avgAttendeesPerEvent >= 100
        ? { value: "Strong registration pace", positive: true }
        : avgAttendeesPerEvent >= 20
        ? { value: "Moderate registration", positive: true }
        : { value: "Registration may need boost", positive: false },
    },
    {
      label: "Relationships",
      value: String(overview.totals.relationships),
      detail: `across ${overview.totals.events} events`,
      accent: "ai" as const,
      trend: overview.totals.relationships > 0
        ? { value: "Connections being captured", positive: true }
        : undefined,
    },
  ];

  const attentionItems: Array<{
    label: string;
    description: string;
    severity: "danger" | "warning";
    href: string;
    eventId?: string;
  }> = [];

  zeroAttendeeEvents.forEach((event) => {
    attentionItems.push({
      label: `${event.name} — zero registrations`,
      description: `No attendees registered yet. Registration may need promotion.`,
      severity: "danger",
      href: `/org/events/${event.id}`,
      eventId: event.id,
    });
  });

  draftEvents.forEach((event) => {
    const daysUntil = Math.ceil(
      (new Date(event.startAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    );
    attentionItems.push({
      label: `${event.name} — not published`,
      description: daysUntil > 0
        ? `Starts in ${daysUntil} day${daysUntil !== 1 ? "s" : ""} — publish to open registration`
        : "Registration is closed until published",
      severity: "warning",
      href: `/org/events/${event.id}`,
      eventId: event.id,
    });
  });

  lowExhibitorEvents.forEach((event) => {
    attentionItems.push({
      label: `${event.name} — exhibitor recruitment needed`,
      description: `Only ${event.exhibitors} exhibitor${event.exhibitors !== 1 ? "s" : ""} confirmed of typical target`,
      severity: "warning",
      href: `/org/events/${event.id}/exhibitors`,
      eventId: event.id,
    });
  });

  const nextBestActions: Array<{ label: string; description: string; href: string; priority: number }> = [];

  if (zeroAttendeeEvents.length > 0) {
    const top = zeroAttendeeEvents[0]!;
    nextBestActions.push({
      label: `Promote ${top.name}`,
      description: zeroAttendeeEvents.length > 1
        ? `${zeroAttendeeEvents.length} events need registrations — start with ${top.name}`
        : "No attendees registered yet",
      href: `/org/events/${top.id}`,
      priority: 1,
    });
  }

  if (draftEvents.length > 0) {
    const top = draftEvents.sort((a, b) =>
      new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
    )[0]!;
    const daysUntil = Math.ceil(
      (new Date(top.startAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    );
    nextBestActions.push({
      label: draftEvents.length > 1
        ? `Publish ${draftEvents.length} draft events`
        : `Publish "${top.name}"`,
      description: daysUntil > 0
        ? daysUntil === 1
          ? `"${top.name}" starts tomorrow — publish today`
          : `"${top.name}" starts in ${daysUntil} days`
        : `"${top.name}" is ready to go live`,
      href: `/org/events/${top.id}`,
      priority: 2,
    });
  }

  if (lowExhibitorEvents.length > 0) {
    const top = lowExhibitorEvents.sort((a, b) => a.exhibitors - b.exhibitors)[0]!;
    nextBestActions.push({
      label: `Grow exhibitor roster for ${top.name}`,
      description: `Only ${top.exhibitors} of target exhibitor count`,
      href: `/org/events/${top.id}/exhibitors`,
      priority: 3,
    });
  }

  if (nextEvent && daysUntilNext !== null && daysUntilNext <= 3 && daysUntilNext >= 0) {
    nextBestActions.push({
      label: daysUntilNext === 0
        ? `"${nextEvent.name}" is today`
        : daysUntilNext === 1
        ? `"${nextEvent.name}" is tomorrow`
        : `Prepare ${nextEvent.name} for launch`,
      description: `${nextEvent.exhibitors} exhibitors · ${nextEvent.attendees} registered`,
      href: `/org/events/${nextEvent.id}`,
      priority: 4,
    });
  }

  const sortedActions = nextBestActions.sort((a, b) => a.priority - b.priority).slice(0, 5);

  function getEventHealth(event: (typeof events)[0]): "good" | "warning" | "danger" | "neutral" {
    if (event.status === "past") return "neutral";
    if (event.status === "live") {
      if (event.attendees === 0) return "danger";
      if (event.exhibitors === 0) return "danger";
      return "good";
    }
    if (event.status === "draft") return "warning";
    if (event.status === "published") {
      if (event.attendees === 0) return "danger";
      if (event.exhibitors < 3) return "warning";
      return "good";
    }
    return "neutral";
  }

  const healthColorMap = {
    good: "bg-status-success-text",
    warning: "bg-status-warning-text",
    danger: "bg-status-danger-text",
    neutral: "bg-muted",
  } as const;

  return (
    <div className="space-y-section">
      <PageHeader
        title={overview.organizationName}
        description={
          allHealthy
            ? liveEvents.length > 0
              ? `${liveEvents.length} event${liveEvents.length !== 1 ? "s" : ""} live · Everything running smoothly`
              : `${overview.totals.events} events · Portfolio ready`
            : needsAttention > 0
            ? `${needsAttention} item${needsAttention !== 1 ? "s" : ""} need${needsAttention === 1 ? "s" : ""} your attention`
            : daysUntilNext !== null && daysUntilNext >= 0 && daysUntilNext <= 30
            ? daysUntilNext === 0
              ? `${overview.totals.events} events · Next event is today`
              : `${overview.totals.events} events · Next event in ${daysUntilNext} day${daysUntilNext !== 1 ? "s" : ""}`
            : `${overview.totals.events} events · ${overview.totals.attendees} total attendees`
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <KPICard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            detail={stat.detail}
            trend={stat.trend}
            accent={stat.accent}
          />
        ))}
      </section>

      {sortedActions.length > 0 && (
        <section className="rounded-xl border border-default bg-surface p-6">
          <h2 className="mb-1 text-body font-semibold text-primary">Next Best Actions</h2>
          <p className="mb-4 text-caption text-muted">Prioritized by urgency — handle these first</p>
          <ul className="space-y-2">
            {sortedActions.map((action, i) => (
              <li key={i}>
                <Link
                  href={action.href}
                  aria-label={`Action ${i + 1}: ${action.label}`}
                  className="group flex items-center justify-between rounded-lg border border-default bg-surface p-4 transition-all hover:border-strong hover:bg-sunken hover:shadow-1"
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-caption font-semibold text-on-brand">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-body font-medium text-primary">{action.label}</p>
                      <p className="mt-0.5 text-caption text-secondary">{action.description}</p>
                    </div>
                  </div>
                  <svg
                    className="size-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path d="M6 4l4 4-4 4" />
                  </svg>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="rounded-xl border border-default bg-surface p-6">
        <h2 className="mb-1 text-body font-semibold text-primary">Attention Items</h2>
        <p className="mb-4 text-caption text-muted">
          {attentionItems.length === 0
            ? "No issues detected — all events on track"
            : `${attentionItems.length} item${attentionItems.length !== 1 ? "s" : ""} requiring action`}
        </p>

        {attentionItems.length === 0 ? (
          <div className="flex items-center gap-3 rounded-lg border border-status-success-border bg-status-success-subtle p-4">
            <svg className="size-5 shrink-0 text-status-success-text" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M8 1a7 7 0 110 14A7 7 0 018 1zm3.72 5.97l-.92.92L6 12.5l-1.8-1.8.92-.92L6 9.84l4.72-4.72z" />
            </svg>
            <div>
              <p className="text-body-sm font-semibold text-status-success-text">All clear</p>
              <p className="text-caption text-status-success-text">No events require immediate action.</p>
            </div>
          </div>
        ) : (
          <ul className="space-y-2">
            {attentionItems.map((item, i) => (
              <li key={i}>
                <Link
                  href={item.href}
                  className="group flex items-start justify-between gap-3 rounded-lg border border-default p-3 transition-colors hover:border-strong hover:bg-sunken"
                >
                  <div className="flex items-start gap-2.5">
                    <StatusBadge
                      tone={item.severity === "danger" ? "danger" : "warning"}
                      size="sm"
                    >
                      {item.severity === "danger" ? "Alert" : "Warning"}
                    </StatusBadge>
                    <div>
                      <p className="text-body-sm font-medium text-primary">{item.label}</p>
                      <p className="text-caption text-muted">{item.description}</p>
                    </div>
                  </div>
                  <svg
                    className="size-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path d="M6 4l4 4-4 4" />
                  </svg>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <SectionHeader title="Events" />
        <div className="mt-4 space-y-2">
          {events.map((event) => {
            const daysUntil = Math.ceil(
              (new Date(event.startAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
            );
            const isPast = event.status === "past" || new Date(event.endAt) < new Date();
            const health = getEventHealth(event);
            return (
              <Link
                key={event.id}
                href={`/org/events/${event.id}`}
                className="group flex items-center justify-between rounded-lg border border-default bg-surface p-4 shadow-1 transition-all hover:border-strong hover:shadow-card-hover"
              >
                <div className="flex items-center gap-3">
                  <div className={`size-2 shrink-0 rounded-full ${healthColorMap[health]}`} title={`Status: ${event.status} · Health: ${health}`} />
                  <div>
                    <strong className="block text-primary group-hover:text-brand">{event.name}</strong>
                    <span className="text-body-sm text-secondary">
                      {event.exhibitors} exhibitors · {event.attendees} attendees
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <StatusBadge
                    tone={
                      event.status === "live"
                        ? "success"
                        : event.status === "draft"
                        ? "warning"
                        : isPast
                        ? "neutral"
                        : "info"
                    }
                    size="sm"
                  >
                    {event.status}
                  </StatusBadge>
                  {daysUntil >= 0 && !isPast && (
                    <span className="text-caption text-muted">
                      {daysUntil === 0 ? "Today" : daysUntil === 1 ? "Tomorrow" : `${daysUntil}d`}
                    </span>
                  )}
                  <span className="text-body-sm text-muted">{event.relationships} connections</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
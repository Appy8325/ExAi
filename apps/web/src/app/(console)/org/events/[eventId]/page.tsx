import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs, Button, KPICard, PageHeader, StatusBadge } from "@concourse/ui";
import { loadEventSessions, loadEventSpeakers, loadOrganizerAnalytics, loadOrganizerOverview } from "@/lib/organizer";
import { PublishEventButton } from "../../organizer-forms";

export default async function EventOverviewPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const overview = await loadOrganizerOverview();
  const orgId = overview?.organizationId;
  const [analytics, sessions, speakers] = await Promise.all([
    loadOrganizerAnalytics(eventId),
    orgId ? loadEventSessions(orgId, eventId) : undefined,
    orgId ? loadEventSpeakers(orgId, eventId) : undefined,
  ]);
  const event = overview?.events.find((item) => item.id === eventId);
  if (!event || !overview)
    notFound();

  const now = Date.now();
  const startMs = new Date(event.startAt).getTime();
  const endMs = new Date(event.endAt).getTime();
  const daysUntil = Math.ceil((startMs - now) / (1000 * 60 * 60 * 24));
  const isPast = event.status === "past" || endMs < now;
  const isLive = event.status === "live";
  const sessionCount = sessions?.length ?? 0;
  const speakerCount = speakers?.length ?? 0;

  function getEventHealth(): "good" | "warning" | "danger" | "neutral" {
    if (isPast) return "neutral";
    if (isLive) {
      if (event!.attendees === 0 && event!.exhibitors === 0) return "danger";
      return "good";
    }
    if (event!.status === "draft") return "warning";
    if (event!.status === "published") {
      if (event!.attendees === 0) return "danger";
      if (event!.exhibitors < 3) return "warning";
      return "good";
    }
    return "neutral";
  }
  const health = getEventHealth();

  function getPrimaryCTALabel(): string {
    if (event!.status === "draft") return "Publish event";
    if (event!.status === "published") return "View exhibitors";
    if (isLive) return "View analytics";
    if (isPast) return "View report";
    return "View details";
  }

  function getPrimaryCTAHref(): string {
    if (event!.status === "draft") return "";
    if (event!.status === "published") return `/org/events/${eventId}/exhibitors`;
    if (isLive) return `/org/analytics?eventId=${eventId}`;
    if (isPast) return `/org/events/${eventId}/reports`;
    return `/org/events/${eventId}`;
  }

  const nextBestActions: Array<{ label: string; description: string; href: string }> = [];

  if (event.status === "draft") {
    nextBestActions.push({
      label: "Publish your event",
      description: daysUntil > 0
        ? daysUntil === 1
          ? "Starts tomorrow — publish now to open registration"
          : `Starts in ${daysUntil} days — publish now to start promoting`
        : "Ready to go live",
      href: `/org/events/${eventId}`,
    });
    if (sessionCount === 0) {
      nextBestActions.push({
        label: "Add sessions",
        description: "No sessions scheduled — build the event agenda",
        href: `/org/events/${eventId}/sessions`,
      });
    }
    if (speakerCount === 0) {
      nextBestActions.push({
        label: "Add speakers",
        description: "No speakers confirmed — invite presenters",
        href: `/org/events/${eventId}/speakers`,
      });
    }
    if (event.exhibitors < 3) {
      nextBestActions.push({
        label: "Recruit exhibitors",
        description: `Only ${event.exhibitors} exhibitor${event.exhibitors !== 1 ? "s" : ""} confirmed — add more before publishing`,
        href: `/org/events/${eventId}/exhibitors`,
      });
    }
    if (event.attendees === 0 && analytics?.conversions.leads === 0) {
      nextBestActions.push({
        label: "Start promoting",
        description: "No registrations yet — begin marketing to drive signups",
        href: `/org/events/${eventId}/settings`,
      });
    }
  } else if (event.status === "published") {
    nextBestActions.push({
      label: `View ${event.exhibitors} exhibitor${event.exhibitors !== 1 ? "s" : ""}`,
      description: "Review booth setup and exhibitor readiness",
      href: `/org/events/${eventId}/exhibitors`,
    });
    if (analytics) {
      nextBestActions.push({
        label: `View live analytics — ${analytics.traffic.uniqueVisitors} attendees`,
        description: analytics.conversions.conversionRate > 30
          ? "Strong conversion rate — keep engaging visitors"
          : "Track visitor engagement and lead capture",
        href: `/org/analytics?eventId=${eventId}`,
      });
    }
  } else if (isLive) {
    if (analytics) {
      nextBestActions.push({
        label: `${analytics.traffic.capturedVisits} captured visits — view booth heatmap`,
        description: "See which booths are driving the most engagement",
        href: `/org/analytics?eventId=${eventId}`,
      });
    }
    nextBestActions.push({
      label: "Monitor exhibitor activity",
      description: "Track real-time booth interactions and lead capture",
      href: `/org/events/${eventId}/exhibitors`,
    });
  } else if (isPast) {
    nextBestActions.push({
      label: "Generate post-event report",
      description: "Review outcomes, ROI, and exhibitor performance",
      href: `/org/events/${eventId}/reports`,
    });
    nextBestActions.push({
      label: "Review analytics",
      description: "See visitor engagement and lead conversion data",
      href: `/org/analytics?eventId=${eventId}`,
    });
  }

  const healthLabel = {
    good: "On track",
    warning: "Needs attention",
    danger: "Critical",
    neutral: "Past event",
  } as const;

  const healthColor = {
    good: "text-status-success-text",
    warning: "text-status-warning-text",
    danger: "text-status-danger-text",
    neutral: "text-muted",
  } as const;

  const healthDot = {
    good: "bg-status-success-text",
    warning: "bg-status-warning-text",
    danger: "bg-status-danger-text",
    neutral: "bg-muted",
  } as const;

  const primaryKPIs = [
    {
      label: "Attendees",
      value: String(event.attendees),
      accent: "info" as const,
      detail: analytics
        ? `${analytics.traffic.uniqueVisitors} unique visitors`
        : "registered",
    },
    {
      label: "Exhibitors",
      value: String(event.exhibitors),
      accent: "brand" as const,
      detail: analytics
        ? `${analytics.booths.filter((b) => b.leads > 0).length} with leads captured`
        : "confirmed",
    },
    {
      label: "Sessions",
      value: String(sessionCount),
      accent: "info" as const,
      detail: sessionCount === 1 ? "session scheduled" : `${sessionCount} sessions scheduled`,
    },
    {
      label: "Speakers",
      value: String(speakerCount),
      accent: "ai" as const,
      detail: speakerCount === 1 ? "speaker confirmed" : `${speakerCount} speakers confirmed`,
    },
    {
      label: "Leads",
      value: String(analytics?.conversions.leads ?? event.relationships),
      accent: "success" as const,
      detail: analytics
        ? `${analytics.engagement.analyzedLeads} AI-analyzed`
        : "connections",
    },
    {
      label: "Conversion",
      value: analytics ? `${analytics.conversions.conversionRate}%` : "—",
      accent: "ai" as const,
      detail: analytics
        ? `${analytics.conversions.leads} leads from ${analytics.traffic.uniqueVisitors} visitors`
        : "visitor-to-lead rate",
    },
  ];

  const secondaryMetrics = analytics
    ? [
        { label: "Captured visits", value: String(analytics.traffic.capturedVisits) },
        { label: "Returning visitors", value: String(analytics.traffic.returningVisitors) },
        { label: "Avg. interactions", value: String(analytics.engagement.averageInteractions) },
        { label: "Repeat engagement", value: `${analytics.engagement.repeatEngagementRate}%` },
      ]
    : [];

  const primaryCTAHref = getPrimaryCTAHref();
  const hasPrimaryCTA = event.status !== "draft";

  return (
    <div className="space-y-section">
      <Breadcrumbs
        items={[
          { label: "Events", href: "/org/events" },
          { label: event.name },
        ]}
      />

      <div className="space-y-6">
        <PageHeader
          title={event.name}
          description={`${dateRange(event.startAt, event.endAt)} · ${event.timezone}`}
        />

        <div className="flex items-center gap-3">
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
          >
            {event.status}
          </StatusBadge>
          {daysUntil >= 0 && !isPast && (
            <span className="text-caption text-muted">
              {daysUntil === 0
                ? "Today"
                : daysUntil === 1
                ? "Tomorrow"
                : `Starts in ${daysUntil} days`}
            </span>
          )}
          {health !== "neutral" && (
            <span className="ml-auto flex items-center gap-1.5">
              <span className={`size-2 rounded-full ${healthDot[health]}`} />
              <span className={`text-caption font-medium ${healthColor[health]}`}>
                {healthLabel[health]}
              </span>
            </span>
          )}
        </div>
      </div>

      {nextBestActions.length > 0 && (
        <section className="rounded-xl border border-default bg-surface p-6">
          <h2 className="mb-1 text-body font-semibold text-primary">Next Best Actions</h2>
          <p className="mb-4 text-caption text-muted">Prioritized by urgency</p>
          <ul className="space-y-2">
            {nextBestActions.slice(0, 3).map((action, i) => (
              <li key={i}>
                <Link
                  href={action.href}
                  className="group flex items-center justify-between rounded-lg border border-default bg-surface p-4 transition-all hover:border-strong hover:bg-sunken"
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-caption font-semibold text-on-brand">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-body-sm font-medium text-primary">{action.label}</p>
                      <p className="mt-0.5 text-caption text-muted">{action.description}</p>
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

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {primaryKPIs.map((kpi) => (
          <KPICard
            key={kpi.label}
            label={kpi.label}
            value={kpi.value}
            detail={kpi.detail}
            accent={kpi.accent}
          />
        ))}
      </section>

      {secondaryMetrics.length > 0 && (
        <section className="rounded-xl border border-default bg-surface p-6">
          <h2 className="mb-4 text-body font-semibold text-primary">Event Activity</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {secondaryMetrics.map((metric) => (
              <div key={metric.label} className="space-y-1">
                <p className="text-caption text-secondary">{metric.label}</p>
                <p className="text-title font-semibold text-primary">{metric.value}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="flex flex-wrap gap-3">
        {event.status === "draft" ? (
          <PublishEventButton
            organizationId={overview.organizationId}
            eventId={event.id}
          />
        ) : (
          hasPrimaryCTA && (
            <Button variant="primary" asChild>
              <Link href={primaryCTAHref}>
                {getPrimaryCTALabel()}
              </Link>
            </Button>
          )
        )}
        <Button variant="secondary" asChild>
          <Link href={`/org/events/${eventId}/settings`}>
            Event settings
          </Link>
        </Button>
        <Button variant="secondary" asChild>
          <Link href={`/org/events/${eventId}/reports`}>
            View report
          </Link>
        </Button>
        {!isPast && (
          <Button variant="secondary" asChild>
            <Link href={`/e/${event.slug}`}>
              Public event
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}

function dateRange(start: string, end: string) {
  const fmt = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" });
  return `${fmt.format(new Date(start))} – ${fmt.format(new Date(end))}`;
}
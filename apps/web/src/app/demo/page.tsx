import Link from "next/link";

import {
  type PublicDemoOverview,
  getPublicDemoOverview,
} from "@concourse/api-client";

import { getApiBaseUrl } from "@/lib/api/config";
import { UserMenu } from "@/components/auth/user-menu";
import { CopyButton } from "./copy-button";
import { DemoSignInForm } from "./demo-sign-in-form";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function loadDemoOverview(apiBase: string): Promise<PublicDemoOverview | null> {
  try {
    return await getPublicDemoOverview({ baseUrl: apiBase });
  } catch {
    return null;
  }
}

export default async function DemoPage() {
  const apiBase = getApiBaseUrl();
  const overview = await loadDemoOverview(apiBase);

  return (
    <main className="min-h-screen bg-canvas text-primary">
      <header className="sticky top-0 z-40 border-b border-default/50 bg-canvas/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3 sm:px-10">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-sm font-bold text-on-brand shadow-1">
              E
            </span>
            <span className="text-base font-semibold tracking-tight">
              ExAi
            </span>
          </Link>
          <UserMenu />
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-10 sm:py-16">
        <div className="space-y-3 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand-subtle px-4 py-1.5 text-xs font-semibold text-brand">
            <span className="size-1.5 rounded-full bg-brand animate-pulse" />
            Hackathon single entry point
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            Experience ExAi
          </h1>
          <p className="mx-auto max-w-2xl text-base text-secondary">
            Every entity in the demo environment is discoverable below. Judges
            never need to copy a UUID — open any link directly.
          </p>
        </div>

        {!overview ? (
          <section className="mt-12 rounded-2xl border border-status-danger-border bg-status-danger-subtle p-6 text-sm text-status-danger-text">
            The public demo discovery endpoint is unavailable right now. The
            repository seed runs through{" "}
            <code className="rounded bg-surface px-1.5 py-0.5">pnpm db:seed</code>{" "}
            against a Supabase project whose{" "}
            <code className="rounded bg-surface px-1.5 py-0.5">
              API_DATABASE_URL
            </code>{" "}
            and service role key are configured in the Vercel environment.
          </section>
        ) : null}

        {overview ? <RoleBoard overview={overview} /> : null}
      </div>
    </main>
  );
}

function RoleBoard({ overview }: { overview: PublicDemoOverview }) {
  const firstOrganizer = overview.organizers[0];
  const firstEvent = overview.events[0];
  const firstBooth =
    overview.events
      .flatMap((event) => event.exhibitors.map((booth) => ({ event, booth })))
      .find(({ booth }) => booth.publicQrToken) ?? null;

  return (
    <div className="mt-12 space-y-10">
      <section>
        <SectionHeader
          eyebrow="Step 1 — Organizer"
          title="Pick the organizer organization"
          description="Start with the tenant that owns the event. The organizer dashboard, analytics, and reporting live behind the published event."
        />
        {firstOrganizer ? (
          <div className="grid gap-4 md:grid-cols-2">
            {overview.organizers.map((organizer) => (
              <DataCard
                key={organizer.id}
                title={organizer.name}
                subtitle={`/${organizer.slug}`}
                tone="indigo"
                links={
                  firstEvent
                    ? [
                        {
                          label: "Open organizer dashboard",
                          href: `/org`,
                          primary: true,
                        },
                        {
                          label: "Open events list",
                          href: `/org/events`,
                        },
                        {
                          label: "Open analytics",
                          href: `/org/analytics`,
                        },
                        {
                          label: "Users & invitations",
                          href: `/org/users`,
                        },
                        {
                          label: "Open settings",
                          href: `/org/settings`,
                        },
                        ...overview.events
                          .filter(
                            (event) =>
                              event.organizerOrganizationId === organizer.id,
                          )
                          .map((event) => ({
                            label: `Event reports — ${event.name}`,
                            href: `/org/events/${event.id}/reports`,
                          })),
                      ]
                    : [
                        {
                          label: "Open organizer dashboard",
                          href: `/org`,
                          primary: true,
                        },
                      ]
                }
              />
            ))}
          </div>
        ) : (
          <EmptyHint>
            No published organizers are seeded. Run{" "}
            <code className="rounded bg-sunken px-1.5 py-0.5">
              pnpm db:seed:demo
            </code>{" "}
            to create TechExpo Events.
          </EmptyHint>
        )}
      </section>

      <section>
        <SectionHeader
          eyebrow="Step 2 — Event"
          title="Open the live event"
          description="Events belong to one organizer organization and surface everything attendees see — exhibitor directory, AI answers, and lead capture."
        />
        {overview.events.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {overview.events.map((event) => (
              <DataCard
                key={event.id}
                title={event.name}
                subtitle={
                  <span className="flex flex-wrap gap-2">
                    <span className="rounded bg-sunken px-2 py-0.5 font-mono text-xs">
                      {event.status}
                    </span>
                    <span>{formatRange(event.startAt, event.timezone)}</span>
                  </span>
                }
                tone="sky"
                links={[
                  {
                    label: "Public event directory",
                    href: `/e/${event.slug}`,
                    primary: true,
                  },
                  {
                    label: "Saved exhibitors",
                    href: `/e/${event.slug}/saved`,
                  },
                  {
                    label: "Organizer event console",
                    href: event.id ? `/org/events/${event.id}` : `/org/events`,
                  },
                  {
                    label: "Event settings",
                    href: event.id ? `/org/events/${event.id}/settings` : `/org/events`,
                  },
                  {
                    label: "Event reports",
                    href: event.id ? `/org/events/${event.id}/reports` : `/org/events`,
                  },
                ]}
              />
            ))}
          </div>
        ) : (
          <EmptyHint>No published event is available yet.</EmptyHint>
        )}
      </section>

      <section>
        <SectionHeader
          eyebrow="Step 3 — Exhibitors"
          title="Open any exhibitor organization"
          description="Each exhibitor org spans one published booth experience per event. Their dashboard, documents, lead forms, and QR live here."
        />
        {overview.exhibitorOrganizations.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {overview.exhibitorOrganizations.map((exhibitor) => {
              const firstParticipation = exhibitor.events[0];
              return (
                <DataCard
                  key={exhibitor.id}
                  title={exhibitor.name}
                  subtitle={
                    firstParticipation ? (
                      <span>
                        Booth at{" "}
                        <code className="rounded bg-sunken px-1.5 py-0.5">
                          /{firstParticipation.eventSlug}
                        </code>
                      </span>
                    ) : (
                      <span>No active booth</span>
                    )
                  }
                  tone="emerald"
                  links={
                    firstParticipation
                      ? [
                          {
                            label: "Open exhibitor dashboard",
                            href: `/exhibit/${exhibitor.id}/dashboard/${firstParticipation.eventExhibitorId}`,
                            primary: true,
                          },
                          {
                            label: "Booth settings",
                            href: `/exhibit/${exhibitor.id}/settings?eeId=${firstParticipation.eventExhibitorId}`,
                          },
                          {
                            label: "Documents (knowledge)",
                            href: `/exhibit/${exhibitor.id}/documents?eeId=${firstParticipation.eventExhibitorId}`,
                          },
                          {
                            label: "Lead form",
                            href: `/exhibit/${exhibitor.id}/forms?eeId=${firstParticipation.eventExhibitorId}`,
                          },
                          {
                            label: "QR credential",
                            href: `/exhibit/${exhibitor.id}/qr?eeId=${firstParticipation.eventExhibitorId}`,
                          },
                          {
                            label: "Attendees pipeline",
                            href: `/exhibit/${exhibitor.id}/attendees?eeId=${firstParticipation.eventExhibitorId}`,
                          },
                          {
                            label: "AI insights",
                            href: `/exhibit/${exhibitor.id}/ai-insights?eeId=${firstParticipation.eventExhibitorId}`,
                          },
                          {
                            label: "Team",
                            href: `/exhibit/${exhibitor.id}/team`,
                          },
                        ]
                      : []
                  }
                />
              );
            })}
          </div>
        ) : (
          <EmptyHint>
            No exhibitor organizations have joined an event yet.
          </EmptyHint>
        )}
      </section>

      <section>
        <SectionHeader
          eyebrow="Step 4 — Booth QR & public booth"
          title="Scan a booth QR (or open the page directly)"
          description="Each booth has its own opaque public token. Use these on a phone to point the camera at any token."
        />
        {overview.events.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {overview.events.flatMap((event) =>
              event.exhibitors.map((booth) => (
                <DataCard
                  key={`${event.id}-${booth.id}`}
                  title={`${booth.companyName} · Booth ${booth.boothNumber ?? "—"}`}
                  subtitle={`${event.name} → ${booth.boothName}`}
                  tone="violet"
                  links={
                    booth.publicQrToken
                      ? [
                          {
                            label: "Open public booth page",
                            href: `/visit/${booth.publicQrToken}`,
                            primary: true,
                          },
                          {
                            label: "Open booth entry on event page",
                            href: `/e/${event.slug}/exhibitors/${booth.id}`,
                          },
                        ]
                      : [
                          {
                            label: "Open booth entry on event page",
                            href: `/e/${event.slug}/exhibitors/${booth.id}`,
                          },
                        ]
                  }
                  token={booth.publicQrToken}
                  tokenPrefix="/visit/"
                />
              )),
            )}
          </div>
        ) : (
          <EmptyHint>No booths are ready.</EmptyHint>
        )}
      </section>

      <section>
        <SectionHeader
          eyebrow="Step 5 — Relationship workspace"
          title="Open a live exhibitor–attendee relationship"
          description="Each scan plus lead submission creates a durable relationship. Open one to see the full workspace: timeline, notes, AI intelligence."
        />
        {overview.relationships.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {overview.relationships.slice(0, 10).map((relationship) => (
              <DataCard
                key={relationship.id}
                title={`Relationship ${relationship.id.slice(0, 8)}…`}
                subtitle={
                  relationship.attendeeEmail
                    ? `Attendee ${relationship.attendeeEmail}`
                    : "Anonymous attendee"
                }
                tone="amber"
                links={[
                  {
                    label: "Open relationship workspace",
                    href: `/exhibit/${relationship.organizationId}/relationships/${relationship.id}`,
                    primary: true,
                  },
                  {
                    label: "Exhibitor dashboard",
                    href: `/exhibit/${relationship.organizationId}/dashboard/${relationship.eventExhibitorId}`,
                  },
                ]}
              />
            ))}
          </div>
        ) : (
          <EmptyHint>
            No relationships are seeded. Run{" "}
            <code className="rounded bg-sunken px-1.5 py-0.5">
              pnpm db:seed:demo
            </code>{" "}
            to create them.
          </EmptyHint>
        )}
      </section>

      <section>
        <SectionHeader
          eyebrow="Sign in"
          title="Demo accounts"
          description="Enter any email below to receive a Magic Link. The link lands you in the role-specific workspace."
        />
        <DemoSignInForm accounts={overview.demoAccounts} />
      </section>

      {firstBooth ? (
        <p className="text-center text-xs text-muted">
          Quick start shortcut — open the demo booth at{" "}
          <Link
            className="text-link underline"
            href={`/visit/${firstBooth.booth.publicQrToken ?? ""}`}
          >
            /visit/{firstBooth.booth.publicQrToken?.slice(0, 12) ?? ""}…
          </Link>
        </p>
      ) : null}
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-5">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
        {eyebrow}
      </p>
      <h2 className="mt-1 text-xl font-semibold text-primary sm:text-2xl">
        {title}
      </h2>
      <p className="mt-1 max-w-3xl text-sm text-secondary">{description}</p>
    </div>
  );
}

function DataCard({
  title,
  subtitle,
  links,
  tone,
  token,
  tokenPrefix,
}: {
  title: string;
  subtitle: React.ReactNode;
  links: Array<{ label: string; href: string; primary?: boolean }>;
  tone: "indigo" | "emerald" | "violet" | "amber" | "sky";
  token?: string | null;
  tokenPrefix?: string;
}) {
  const accent = toneRing(tone);
  return (
    <div
      className={`group rounded-2xl border border-default bg-surface p-5 shadow-1 transition-all hover:shadow-2 hover:ring-2 ${accent}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-primary">
            {title}
          </h3>
          <div className="mt-1 text-sm text-secondary">{subtitle}</div>
        </div>
        {token ? (
          <div className="flex items-center gap-2 rounded-lg border border-default bg-sunken/60 px-3 py-1.5 font-mono text-xs text-secondary">
            <span className="truncate">{tokenPrefix ?? ""}{token}</span>
            <CopyButton className="h-7 px-2 text-[11px] font-medium text-secondary hover:text-primary" text={token} />
          </div>
        ) : null}
      </div>
      <ul className="mt-4 space-y-2">
        {links.map((link) => (
          <li key={`${link.label}-${link.href}`}>
            <Link
              href={link.href}
              className={
                link.primary
                  ? "flex items-center justify-between rounded-lg border border-brand/30 bg-brand-subtle px-3 py-2 text-sm font-semibold text-brand transition-colors hover:bg-brand hover:text-on-brand"
                  : "flex items-center justify-between rounded-lg border border-default bg-sunken/50 px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-sunken hover:text-brand"
              }
            >
              {link.label}
              <svg
                className="size-3.5 text-muted"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M6 4l4 4-4 4" />
              </svg>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function EmptyHint({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-default bg-surface p-6 text-sm text-secondary">
      {children}
    </div>
  );
}

function toneRing(tone: "indigo" | "emerald" | "violet" | "amber" | "sky") {
  switch (tone) {
    case "indigo":
      return "ring-indigo-500/20";
    case "emerald":
      return "ring-emerald-500/20";
    case "violet":
      return "ring-violet-500/20";
    case "amber":
      return "ring-amber-500/20";
    case "sky":
      return "ring-sky-500/20";
  }
}

function formatRange(value: string, timezone: string) {
  try {
    const date = new Date(value);
    return `${date.toLocaleDateString()} · ${timezone}`;
  } catch {
    return `${value} · ${timezone}`;
  }
}

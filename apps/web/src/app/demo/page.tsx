import Link from "next/link";

import { getApiBaseUrl } from "@/lib/api/config";
import {
  getDemoBoothQr,
  getPublicEventBySlug,
  getEventExhibitors,
} from "@concourse/api-client";

import { UserMenu } from "@/components/auth/user-menu";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type DemoIds = {
  organizationId?: string;
  eventExhibitorId?: string;
  publicQrToken?: string;
};

async function resolveDemoIds(apiBase: string): Promise<DemoIds> {
  try {
    const event = await getPublicEventBySlug(
      { baseUrl: apiBase },
      "techexpo-2027",
    );
    const exhibitors = await getEventExhibitors({ baseUrl: apiBase }, event.id);
    const northstar = exhibitors.find((e) => /northstar/i.test(e.companyName));
    const qr = northstar
      ? await getDemoBoothQr({ baseUrl: apiBase }, event.id, northstar.id)
      : undefined;
    return {
      organizationId: northstar?.organizationId,
      eventExhibitorId: northstar?.id,
      publicQrToken: qr?.publicQrToken,
    };
  } catch {
    return {};
  }
}

export default async function DemoPage() {
  const apiBase = getApiBaseUrl();
  const { organizationId, eventExhibitorId, publicQrToken } =
    await resolveDemoIds(apiBase);

  const dashboardParams =
    organizationId && eventExhibitorId
      ? `/exhibit/${organizationId}/dashboard/${eventExhibitorId}`
      : null;
  const attendeesQs = eventExhibitorId ? `?eeId=${eventExhibitorId}` : "";
  const aiInsightsQs = eventExhibitorId ? `?eeId=${eventExhibitorId}` : "";
  const documentsQs = eventExhibitorId ? `?eeId=${eventExhibitorId}` : "";

  return (
    <main className="min-h-screen bg-canvas text-primary">
      <header className="sticky top-0 z-40 border-b border-default/50 bg-canvas/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3 sm:px-10">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-sm font-bold text-on-brand shadow-1">
              E
            </span>
            <span className="text-base font-semibold tracking-tight">ExAi</span>
          </Link>
          <UserMenu />
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-16 sm:px-10 sm:py-24">
        <div className="space-y-3 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand-subtle px-4 py-1.5 text-xs font-semibold text-brand">
            <span className="size-1.5 rounded-full bg-brand animate-pulse" />
            Interactive demo
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            Experience ExAi
          </h1>
          <p className="mx-auto max-w-lg text-base text-secondary">
            Choose a role below to explore the platform from every angle. No
            sign-in required to browse the organizer dashboard or exhibitor
            directory.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          <RoleCard
            role="Organizer"
            description="Create events, manage exhibitors, see analytics, and run the trade show from one dashboard."
            color="from-indigo-600 to-indigo-500"
            ring="ring-indigo-500/20"
            links={[
              { label: "Dashboard", href: "/org" },
              { label: "Events", href: "/org/events" },
              { label: "Analytics", href: "/org/analytics" },
              { label: "Users", href: "/org/users" },
              { label: "Settings", href: "/org/settings" },
            ]}
            primaryHref="/org"
            primaryLabel="Open organizer dashboard"
          />

          <RoleCard
            role="Exhibitor"
            description="Track booth visitors, see relationship pipeline, get AI insights, and follow up with enriched profiles."
            color="from-emerald-600 to-emerald-500"
            ring="ring-emerald-500/20"
            links={[
              { label: "Dashboard", href: dashboardParams ?? "/org/events" },
              ...(organizationId && eventExhibitorId
                ? [
                    {
                      label: "Attendees",
                      href: `/exhibit/${organizationId}/attendees${attendeesQs}`,
                    },
                    {
                      label: "AI Insights",
                      href: `/exhibit/${organizationId}/ai-insights${aiInsightsQs}`,
                    },
                    {
                      label: "Documents",
                      href: `/exhibit/${organizationId}/documents${documentsQs}`,
                    },
                  ]
                : [{ label: "Events", href: "/org/events" }]),
            ]}
            primaryHref={dashboardParams ?? "/org/events"}
            primaryLabel="Open exhibitor dashboard"
          />

          <RoleCard
            role="Attendee"
            description="Browse exhibitors, scan QR codes, get AI recommendations, and manage your profile — all mobile-first."
            color="from-violet-600 to-violet-500"
            ring="ring-violet-500/20"
            links={[
              { label: "Browse exhibitors", href: "/e/techexpo-2027" },
              ...(publicQrToken
                ? [{ label: "QR booth", href: `/visit/${publicQrToken}` }]
                : []),
              { label: "Saved exhibitors", href: "/e/techexpo-2027/saved" },
              { label: "Profile", href: "/account/profile" },
            ]}
            primaryHref="/e/techexpo-2027"
            primaryLabel="Open attendee directory"
          />
        </div>

        <div className="mt-16 text-center">
          <p className="text-sm text-muted">
            Best experienced when signed in.{" "}
            <Link href="/auth" className="text-brand hover:underline">
              Sign in
            </Link>{" "}
            to connect with exhibitors and build real relationships.
          </p>
        </div>
      </div>
    </main>
  );
}

function RoleCard({
  role,
  description,
  color,
  ring,
  links,
  primaryHref,
  primaryLabel,
}: {
  role: string;
  description: string;
  color: string;
  ring: string;
  links: Array<{ label: string; href: string }>;
  primaryHref: string;
  primaryLabel: string;
}) {
  return (
    <div
      className={`group rounded-2xl border border-default bg-surface p-6 shadow-1 transition-all hover:shadow-2 hover:ring-2 ${ring}`}
    >
      <div className={`mb-4 h-2 w-16 rounded-full bg-gradient-to-r ${color}`} />
      <h2 className="text-xl font-semibold text-primary">{role}</h2>
      <p className="mt-2 text-sm leading-relaxed text-secondary">
        {description}
      </p>
      <ul className="mt-5 space-y-2">
        {links.map(({ label, href }) => (
          <li key={label}>
            <Link
              href={href}
              className="flex items-center justify-between rounded-lg border border-default bg-sunken/50 px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-sunken hover:text-brand"
            >
              {label}
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
      <Link
        href={primaryHref}
        className={`mt-5 inline-flex w-full h-11 items-center justify-center rounded-xl bg-gradient-to-r ${color} text-sm font-semibold text-white shadow-1 transition-all hover:shadow-2`}
      >
        {primaryLabel}
      </Link>
    </div>
  );
}

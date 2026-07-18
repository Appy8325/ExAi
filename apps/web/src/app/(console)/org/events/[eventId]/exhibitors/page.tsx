import Link from "next/link";
import { StatusBadge } from "@concourse/ui";
import { getEventExhibitors } from "@concourse/api-client";

import { getApiBaseUrl } from "@/lib/api/config";
import {
  loadExhibitorInvitations,
  loadOrganizerOverview,
} from "@/lib/organizer";
import { InviteExhibitorForm } from "../../../organizer-forms";

export default async function ExhibitorsPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const overview = await loadOrganizerOverview();
  let exhibitors = [] as Awaited<ReturnType<typeof getEventExhibitors>>;
  try {
    exhibitors = await getEventExhibitors(
      {
        baseUrl: getApiBaseUrl(),
        fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
      },
      eventId,
    );
  } catch {
    /* empty state below */
  }
  const invitations = overview
    ? await loadExhibitorInvitations(overview.organizationId, eventId)
    : undefined;
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-semibold text-primary">Exhibitors</h1>
        <p className="mt-1 text-sm text-secondary">
          Invite companies and monitor accepted exhibitor profiles.
        </p>
      </header>
      {overview ? (
        <InviteExhibitorForm
          organizationId={overview.organizationId}
          eventId={eventId}
        />
      ) : null}
      {invitations?.length ? (
        <section className="rounded-xl border border-default bg-surface p-5">
          <h2 className="font-semibold text-primary">Invitations</h2>
          <div className="mt-3 divide-y divide-default">
            {invitations.map((invitation) => (
              <div
                key={invitation.id}
                className="flex items-center justify-between gap-4 py-3 text-sm"
              >
                <span>
                  <strong className="block text-primary">
                    {invitation.companyName}
                  </strong>
                  <span className="text-secondary">{invitation.email}</span>
                </span>
                <StatusBadge
                  tone={
                    invitation.status === "accepted" ? "success" : "neutral"
                  }
                >
                  {invitation.status}
                </StatusBadge>
              </div>
            ))}
          </div>
        </section>
      ) : null}
      {exhibitors.length ? (
        <div className="overflow-x-auto rounded-xl border border-default bg-surface">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-default">
                <th className="px-4 py-3 text-secondary">Company</th>
                <th className="px-4 py-3 text-secondary">Booth</th>
                <th className="px-4 py-3 text-secondary">Contact</th>
              </tr>
            </thead>
            <tbody>
              {exhibitors.map((exhibitor) => (
                <tr
                  key={exhibitor.id}
                  className="border-b border-default last:border-0"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/org/events/${eventId}/exhibitors/${exhibitor.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {exhibitor.companyName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-secondary">
                    {exhibitor.boothNumber ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-secondary">
                    {exhibitor.contactEmail ??
                      exhibitor.website ??
                      "At the booth"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="rounded-xl border border-default bg-surface p-6 text-secondary">
          No exhibitors have accepted yet.
        </p>
      )}
    </div>
  );
}

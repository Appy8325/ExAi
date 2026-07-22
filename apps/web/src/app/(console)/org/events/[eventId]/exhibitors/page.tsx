import Link from "next/link";
import { EmptyState, PageHeader, SectionHeader, StatusBadge, Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@concourse/ui";
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
    <div className="space-y-section">
      <PageHeader
        title="Exhibitors"
        description="Invite companies and monitor accepted exhibitor profiles."
      />
      {overview ? (
        <InviteExhibitorForm
          organizationId={overview.organizationId}
          eventId={eventId}
        />
      ) : null}
      {invitations?.length ? (
        <section>
          <SectionHeader title="Invitations" />
          <div className="mt-3 space-y-2">
            {invitations.map((invitation) => (
              <div
                key={invitation.id}
                className="flex items-center justify-between gap-4 rounded-lg border border-default bg-surface p-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-body font-medium text-primary">
                    {invitation.companyName}
                  </p>
                  <p className="text-body-sm text-secondary">{invitation.email}</p>
                </div>
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Booth</TableHead>
              <TableHead>Contact</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {exhibitors.map((exhibitor) => (
              <TableRow key={exhibitor.id}>
                <TableCell>
                  <Link
                    href={`/org/events/${eventId}/exhibitors/${exhibitor.id}`}
                    className="font-medium text-link hover:text-brand-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {exhibitor.companyName}
                  </Link>
                </TableCell>
                <TableCell className="text-secondary">
                  {exhibitor.boothNumber ?? "—"}
                </TableCell>
                <TableCell className="text-secondary">
                  {exhibitor.contactEmail ??
                    exhibitor.website ??
                    "At the booth"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <EmptyState title="No exhibitors yet" description="No exhibitors have accepted yet." />
      )}
    </div>
  );
}

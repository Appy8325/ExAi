import { EmptyState, PageHeader, StatusBadge, Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@concourse/ui";

import {
  loadOrganizationMembers,
  loadOrganizerOverview,
} from "@/lib/organizer";
import { InviteMemberForm } from "../organizer-forms";

export default async function UsersPage() {
  const overview = await loadOrganizerOverview();
  if (!overview)
    return (
      <div className="rounded-xl border border-default bg-surface p-6 text-secondary">
        Organization unavailable.
      </div>
    );
  const members = await loadOrganizationMembers(overview.organizationId);
  return (
    <div className="space-y-section">
      <PageHeader
        title="Team"
        description={`Manage access to ${overview.organizationName}.`}
      />
      <InviteMemberForm organizationId={overview.organizationId} />
      {members?.length ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <p className="font-medium text-primary">{member.fullName}</p>
                  <p className="text-body-sm text-secondary">{member.email}</p>
                </TableCell>
                <TableCell className="capitalize text-secondary">
                  {member.role}
                </TableCell>
                <TableCell>
                  <StatusBadge
                    tone={member.status === "active" ? "success" : "neutral"}
                  >
                    {member.status}
                  </StatusBadge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <EmptyState title="No members found" description="Invite members to get started." />
      )}
    </div>
  );
}

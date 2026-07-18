import { StatusBadge } from "@concourse/ui";

import {
  loadOrganizationMembers,
  loadOrganizerOverview,
} from "@/lib/organizer";
import { InviteMemberForm } from "../organizer-forms";

export default async function UsersPage() {
  const overview = await loadOrganizerOverview();
  if (!overview)
    return (
      <p className="rounded-xl border border-default bg-surface p-6 text-secondary">
        Organization unavailable.
      </p>
    );
  const members = await loadOrganizationMembers(overview.organizationId);
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-primary">Team</h1>
        <p className="mt-1 text-secondary">
          Manage access to {overview.organizationName}.
        </p>
      </header>
      <InviteMemberForm organizationId={overview.organizationId} />
      <div className="overflow-x-auto rounded-xl border border-default bg-surface">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-default">
              <th className="px-4 py-3 text-secondary">Member</th>
              <th className="px-4 py-3 text-secondary">Role</th>
              <th className="px-4 py-3 text-secondary">Status</th>
            </tr>
          </thead>
          <tbody>
            {members?.map((member) => (
              <tr
                key={member.id}
                className="border-b border-default last:border-0"
              >
                <td className="px-4 py-3">
                  <strong className="block text-primary">
                    {member.fullName}
                  </strong>
                  <span className="text-secondary">{member.email}</span>
                </td>
                <td className="px-4 py-3 capitalize text-secondary">
                  {member.role}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge
                    tone={member.status === "active" ? "success" : "neutral"}
                  >
                    {member.status}
                  </StatusBadge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!members?.length ? (
          <p className="p-6 text-secondary">No members were found.</p>
        ) : null}
      </div>
    </div>
  );
}

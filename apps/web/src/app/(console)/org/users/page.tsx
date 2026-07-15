"use client";

import { useState } from "react";
import { Button, StatusBadge, Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogClose } from "@concourse/ui";

type UserRole = "Owner" | "Admin" | "Manager" | "Viewer";
type UserStatus = "Active" | "Pending" | "Inactive";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
}

const initialUsers: User[] = [
  { id: "u1", name: "Olivia Grant", email: "olivia@techexpo.local", role: "Owner", status: "Active" },
  { id: "u2", name: "Priya Sharma", email: "priya@techexpo.local", role: "Admin", status: "Active" },
  { id: "u3", name: "Marcus Johnson", email: "marcus@techexpo.local", role: "Manager", status: "Active" },
  { id: "u4", name: "Alex Kim", email: "alex@techexpo.local", role: "Viewer", status: "Pending" },
  { id: "u5", name: "Jordan Lee", email: "jordan@techexpo.local", role: "Manager", status: "Inactive" },
];

const roles: UserRole[] = ["Owner", "Admin", "Manager", "Viewer"];

const PAGE_SIZE = 4;

export default function UsersPage() {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  function handleRoleChange(id: string, role: UserRole) {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
  }

  function handleToggleStatus(id: string) {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? { ...u, status: u.status === "Active" ? "Inactive" : "Active" }
          : u,
      ),
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-primary">Users</h1>
          <p className="mt-1 text-secondary">Manage organization users and permissions</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Invite Team Member</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle className="text-lg font-semibold text-primary">Invite Team Member</DialogTitle>
            <DialogDescription className="mt-1 text-sm text-secondary">
              Send an invitation to join your organization.
            </DialogDescription>
            <div className="mt-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-primary">Email address</label>
                <input
                  className="mt-1 h-(--spacing-control-h) w-full rounded-sm border border-strong bg-surface px-(--spacing-control-px) text-body text-primary outline-none placeholder:text-muted"
                  placeholder="colleague@company.com"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-primary">Role</label>
                <select className="mt-1 h-(--spacing-control-h) w-full rounded-sm border border-strong bg-surface px-(--spacing-control-px) text-body text-primary outline-none">
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <DialogClose asChild>
                  <Button variant="secondary">Cancel</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button>Send Invite</Button>
                </DialogClose>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
        <input
          className="h-(--spacing-control-h) w-full rounded-sm border border-strong bg-surface pl-9 pr-3 text-body text-primary outline-none placeholder:text-muted"
          placeholder="Search users..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
        />
      </div>

      <div className="rounded-xl border border-strong bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-strong">
                <th className="px-4 py-3 font-medium text-secondary">Name</th>
                <th className="px-4 py-3 font-medium text-secondary">Email</th>
                <th className="px-4 py-3 font-medium text-secondary">Role</th>
                <th className="px-4 py-3 font-medium text-secondary">Status</th>
                <th className="px-4 py-3 font-medium text-secondary" />
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td className="px-4 py-12 text-center text-secondary" colSpan={5}>
                    No users found.
                  </td>
                </tr>
              ) : (
                paginated.map((user) => (
                  <tr key={user.id} className="border-b border-strong last:border-b-0 hover:bg-sunken/50">
                    <td className="px-4 py-3 font-medium text-primary">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sunken text-xs font-medium text-primary">
                          {user.name.split(" ").map((n) => n[0]).join("")}
                        </div>
                        {user.name}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-secondary">{user.email}</td>
                    <td className="px-4 py-3">
                      <select
                        className="rounded-sm border border-strong bg-surface px-2 py-1 text-sm text-primary outline-none"
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                        disabled={user.role === "Owner"}
                      >
                        {roles.map((r) => (
                          <option key={r} value={r} disabled={r === "Owner" && user.role !== "Owner"}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge tone={user.status === "Active" ? "success" : user.status === "Pending" ? "warning" : "neutral"}>
                        {user.status}
                      </StatusBadge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {user.role !== "Owner" && (
                          <button
                            onClick={() => handleToggleStatus(user.id)}
                            className="rounded-sm border border-strong bg-surface px-3 py-1.5 text-xs font-medium text-primary hover:bg-sunken"
                          >
                            {user.status === "Active" ? "Deactivate" : "Activate"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-secondary">
            Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="rounded-sm border border-strong bg-surface px-3 py-1.5 text-sm font-medium text-primary hover:bg-sunken disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="rounded-sm border border-strong bg-surface px-3 py-1.5 text-sm font-medium text-primary hover:bg-sunken disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

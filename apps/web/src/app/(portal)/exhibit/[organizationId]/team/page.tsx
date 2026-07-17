"use client";

import { useState } from "react";
import { Button, Input } from "@concourse/ui";

export default function TeamPage() {
  const [members] = useState([
    { id: "t1", name: "Elena Torres", email: "elena@northstarcloud.com", role: "Booth Lead", initials: "ET" },
    { id: "t2", name: "Jamal Carter", email: "jamal@northstarcloud.com", role: "Sales", initials: "JC" },
    { id: "t3", name: "Sam Rivera", email: "sam@northstarcloud.com", role: "Technical", initials: "SR" },
  ]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div>
        <p className="text-caption font-medium text-secondary">Exhibitor workspace</p>
        <h1 className="mt-1 text-title font-semibold text-primary">Team</h1>
        <p className="mt-1 text-body-sm text-muted">{members.length} team members</p>
      </div>

      <section className="rounded-xl border border-default bg-surface">
        <div className="divide-y divide-default">
          {members.map((m) => (
            <div key={m.id} className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-4">
                <div className="flex size-10 items-center justify-center rounded-full bg-sunken text-body-sm font-semibold text-primary">
                  {m.initials}
                </div>
                <div>
                  <p className="text-body-sm font-medium text-primary">{m.name}</p>
                  <p className="text-caption text-muted">{m.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="inline-flex items-center rounded-full border border-status-info-border bg-status-info-subtle px-2.5 py-0.5 text-caption font-medium text-status-info-text">
                  {m.role}
                </span>
                <button type="button" className="text-caption text-secondary hover:text-primary">
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-default bg-surface p-6">
        <h2 className="text-body font-semibold text-primary">Invite team member</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Input className="max-w-sm" placeholder="colleague@company.com" type="email" />
          <select className="h-(--spacing-control-h) rounded-lg border border-default bg-surface px-3 text-body text-primary outline-none">
            <option value="sales">Sales</option>
            <option value="booth-lead">Booth Lead</option>
            <option value="technical">Technical</option>
            <option value="manager">Manager</option>
          </select>
          <Button>Send Invite</Button>
        </div>
      </section>
    </div>
  );
}
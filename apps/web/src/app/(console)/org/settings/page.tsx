"use client";

import { useState } from "react";
import { Button, Input, Card, StatusBadge } from "@concourse/ui";

const tabs = [
  { id: "profile", label: "Organization Profile" },
  { id: "branding", label: "Branding" },
  { id: "members", label: "Members" },
  { id: "general", label: "General Settings" },
];

const members = [
  { id: "m1", name: "Olivia Grant", email: "olivia@techexpo.local", role: "Owner" },
  { id: "m2", name: "Priya Sharma", email: "priya@techexpo.local", role: "Admin" },
  { id: "m3", name: "Marcus Johnson", email: "marcus@techexpo.local", role: "Manager" },
  { id: "m4", name: "Alex Kim", email: "alex@techexpo.local", role: "Viewer" },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-primary">Settings</h1>
        <p className="mt-1 text-secondary">Organization settings and preferences</p>
      </div>

      <div className="flex gap-1 border-b border-default">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "border-b-2 border-brand text-brand"
                : "text-secondary hover:text-primary"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "profile" && (
        <div className="space-y-6 max-w-2xl">
          <Card className="space-y-4">
            <h2 className="text-base font-semibold text-primary">Organization Profile</h2>
            <div>
              <label className="text-sm font-medium text-primary">Organization Name</label>
              <Input className="mt-1" defaultValue="TechExpo Events" />
            </div>
            <div>
              <label className="text-sm font-medium text-primary">Website</label>
              <Input className="mt-1" defaultValue="https://techexpo.com" />
            </div>
            <div>
              <label className="text-sm font-medium text-primary">Billing Email</label>
              <Input className="mt-1" defaultValue="billing@techexpo.com" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary">Cancel</Button>
              <Button>Save Changes</Button>
            </div>
          </Card>
        </div>
      )}

      {activeTab === "branding" && (
        <div className="space-y-6 max-w-2xl">
          <Card className="space-y-4">
            <h2 className="text-base font-semibold text-primary">Branding</h2>
            <div>
              <label className="text-sm font-medium text-primary">Organization Logo</label>
              <div className="mt-2 flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-dashed border-default bg-sunken text-sm text-muted">
                  Logo
                </div>
                <Button variant="secondary">Upload</Button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-primary">Primary Color</label>
              <div className="mt-1 flex items-center gap-2">
                <div className="h-8 w-8 rounded-md border border-strong" style={{ backgroundColor: "var(--color-bg-brand, #2563eb)" }} />
                <Input className="flex-1" defaultValue="#2563eb" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary">Cancel</Button>
              <Button>Save Changes</Button>
            </div>
          </Card>
        </div>
      )}

      {activeTab === "members" && (
        <div className="space-y-6 max-w-2xl">
          <Card className="space-y-4">
            <h2 className="text-base font-semibold text-primary">Team Members</h2>
            <div className="divide-y divide-default">
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-primary">{member.name}</p>
                    <p className="text-xs text-muted">{member.email}</p>
                  </div>
                  <StatusBadge tone={member.role === "Owner" ? "info" : member.role === "Admin" ? "success" : "neutral"}>
                    {member.role}
                  </StatusBadge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {activeTab === "general" && (
        <div className="space-y-6 max-w-2xl">
          <Card className="space-y-4">
            <h2 className="text-base font-semibold text-primary">General Settings</h2>
            <div>
              <label className="text-sm font-medium text-primary">Default Timezone</label>
              <select className="mt-1 h-(--spacing-control-h) w-full rounded-sm border border-strong bg-surface px-(--spacing-control-px) text-body text-primary outline-none">
                <option>America/Los_Angeles</option>
                <option>America/New_York</option>
                <option>America/Chicago</option>
                <option>Europe/London</option>
                <option>Asia/Tokyo</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-primary">Date Format</label>
              <select className="mt-1 h-(--spacing-control-h) w-full rounded-sm border border-strong bg-surface px-(--spacing-control-px) text-body text-primary outline-none">
                <option>MM/DD/YYYY</option>
                <option>DD/MM/YYYY</option>
                <option>YYYY-MM-DD</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary">Cancel</Button>
              <Button>Save Changes</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

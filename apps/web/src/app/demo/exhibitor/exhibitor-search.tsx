"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@concourse/ui";

type OrgEvent = {
  eventId: string;
  eventSlug: string;
  eventExhibitorId: string;
};

type ExhibitorOrg = {
  id: string;
  name: string;
  events: OrgEvent[];
};

export function ExhibitorSearch({ orgs }: { orgs: ExhibitorOrg[] }) {
  const [search, setSearch] = useState("");

  const filtered = orgs.filter(
    (org) =>
      !search ||
      org.name.toLowerCase().includes(search.toLowerCase()) ||
      org.events.some((e) => e.eventSlug.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <svg
          className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 16 16"
          aria-hidden
        >
          <circle cx="7" cy="7" r="5" strokeWidth="2" />
          <path strokeWidth="2" d="M11 11l4 4" />
        </svg>
        <input
          type="text"
          placeholder="Search exhibitors..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search exhibitors"
          className="h-(--spacing-control-h) w-full rounded-md border border-strong bg-surface pl-11 pr-4 text-body text-primary outline-none transition-all placeholder:text-muted focus:border-strong"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-body text-muted">No exhibitors match &ldquo;{search}&rdquo;.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((org) => {
            const participation = org.events[0];
            return (
              <Card key={org.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-caption font-semibold uppercase tracking-[0.2em] text-brand">
                      Exhibitor
                    </p>
                    <h2 className="mt-1 text-lg font-bold text-primary">
                      {org.name}
                    </h2>
                    <p className="mt-1 text-body text-secondary">
                      {org.events.length} event
                      {org.events.length !== 1 ? "s" : ""}
                      {participation ? ` · ${participation.eventSlug}` : ""}
                    </p>
                  </div>
                  <Link
                    href={`/demo/exhibitor/${participation?.eventExhibitorId ?? ""}`}
                    className="shrink-0 inline-flex h-9 items-center rounded-lg bg-status-success-solid px-3 text-caption font-semibold text-on-brand"
                  >
                    Open booth →
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {filtered.length > 0 && (
        <p className="text-caption text-muted">
          Showing {filtered.length} of {orgs.length} exhibitor{orgs.length !== 1 ? "s" : ""}
          {search ? ` matching "${search}"` : ""}
        </p>
      )}
    </div>
  );
}
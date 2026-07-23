"use client";

import { useState, useMemo } from "react";
import type { ExhibitorDashboard } from "@concourse/api-client";
import Link from "next/link";
import { Button, Card, EmptyState, Input, StatusBadge } from "@concourse/ui";

export function AttendeeListScreen({ dashboard, organizationId }: { dashboard: ExhibitorDashboard; organizationId: string }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [sort, setSort] = useState<string>("name");

  const items = useMemo(() => {
    const attention = dashboard.attention.map((a) => ({
      id: a.relationshipId,
      relationshipId: a.relationshipId,
      name: a.attendeeName ?? "Unknown",
      status: a.reasons.includes("no notes") ? "needs-followup" : a.reasons.includes("new") ? "new" : "active",
      reasons: a.reasons,
      score: computeScore(a.reasons),
      lastInteraction: dashboard.recentActivity.find((ra) => ra.relationshipId === a.relationshipId)?.at ?? null,
    }));

    const pipelineItems = [
      { id: "pipeline-new", relationshipId: undefined, name: "New Visitors", status: "new" as const, reasons: ["Recently engaged"], score: 30, lastInteraction: null },
      { id: "pipeline-active", relationshipId: undefined, name: "Active Relationships", status: "active" as const, reasons: ["Ongoing engagement"], score: 70, lastInteraction: null },
      { id: "pipeline-returning", relationshipId: undefined, name: "Returning Visitors", status: "returning" as const, reasons: ["Multiple visits"], score: 80, lastInteraction: null },
    ];

    const all = [...attention, ...pipelineItems.filter((p) => !attention.some((a) => a.name === p.name))];

    let filtered = all;
    if (filter !== "all") {
      filtered = all.filter((item) => item.status === filter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter((item) => item.name.toLowerCase().includes(q) || item.reasons.some((r) => r.toLowerCase().includes(q)));
    }

    filtered.sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "score") return b.score - a.score;
      if (sort === "lastInteraction") {
        if (!a.lastInteraction) return 1;
        if (!b.lastInteraction) return -1;
        return new Date(b.lastInteraction).getTime() - new Date(a.lastInteraction).getTime();
      }
      return 0;
    });

    return filtered;
  }, [dashboard, search, filter, sort]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div>
        <p className="text-caption font-medium text-secondary">Exhibitor workspace</p>
        <h1 className="mt-1 text-title font-semibold text-primary">Attendees</h1>
        <p className="mt-1 text-body-sm text-muted">{dashboard.performance.relationshipsCreated} total relationships</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 sm:max-w-xs">
          <svg className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="7" cy="7" r="4.5" /><path d="M10.5 10.5L14 14" />
          </svg>
          <Input
            aria-label="Search attendees"
            className="pl-9"
            placeholder="Search attendees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          aria-label="Filter attendees by status"
          className="h-(--spacing-control-h) rounded-lg border border-default bg-surface px-3 text-body text-primary outline-none"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="new">New</option>
          <option value="active">Active</option>
          <option value="returning">Returning</option>
          <option value="needs-followup">Needs Follow-up</option>
        </select>
        <select
          aria-label="Sort attendees"
          className="h-(--spacing-control-h) rounded-lg border border-default bg-surface px-3 text-body text-primary outline-none"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="name">Name</option>
          <option value="score">Score</option>
          <option value="lastInteraction">Last Interaction</option>
        </select>
      </div>

      <div className="space-y-3 md:hidden">
        {items.length === 0 ? (
          <EmptyState
            action={<Button variant="ghost" onClick={() => { setSearch(""); setFilter("all"); setSort("name"); }}>Clear filters</Button>}
            description="Try a different search or filter."
            title="No attendees found"
          />
        ) : items.map((item) => (
          <Card key={item.id} className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-body-sm font-medium text-primary">{item.name}</p>
                <p className="mt-1 text-caption text-muted">{item.reasons.join(" · ")}</p>
              </div>
              <AttendeeStatusBadge status={item.status} />
            </div>
            <div className="flex items-center justify-between text-caption text-muted">
              <span>Score {item.score}</span>
              <span>{item.lastInteraction ? dateTime(item.lastInteraction) : "No recent interaction"}</span>
            </div>
            {item.relationshipId ? (
              <Button asChild className="w-full" size="sm" variant="secondary">
                <Link href={`/exhibit/${organizationId}/relationships/${item.relationshipId}`}>Open relationship</Link>
              </Button>
            ) : null}
          </Card>
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-xl border border-default md:block">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-default bg-sunken">
              <th className="px-4 py-3 text-caption font-medium text-secondary">Attendee</th>
              <th className="px-4 py-3 text-caption font-medium text-secondary">Status</th>
              <th className="px-4 py-3 text-caption font-medium text-secondary">Score</th>
              <th className="px-4 py-3 text-caption font-medium text-secondary">Last Interaction</th>
              <th className="px-4 py-3 text-caption font-medium text-secondary" />
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center">
                  <p className="text-body-sm text-muted">No attendees match these filters.</p>
                  <Button
                    className="mt-3"
                    onClick={() => {
                      setSearch("");
                      setFilter("all");
                      setSort("name");
                    }}
                    size="sm"
                    type="button"
                    variant="ghost"
                  >
                    Clear filters
                  </Button>
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="border-b border-default last:border-0 hover:bg-sunken/50">
                  <td className="px-4 py-3">
                    <p className="text-body-sm font-medium text-primary">{item.name}</p>
                    <p className="text-caption text-muted">{item.reasons.join(" · ")}</p>
                  </td>
                  <td className="px-4 py-3"><AttendeeStatusBadge status={item.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        aria-label={`Lead score ${item.score} out of 100`}
                        aria-valuemax={100}
                        aria-valuemin={0}
                        aria-valuenow={item.score}
                        className="h-1.5 w-12 rounded-full bg-sunken"
                        role="progressbar"
                      >
                        <div className={`h-full rounded-full ${item.score >= 70 ? "bg-status-success" : item.score >= 40 ? "bg-status-warning" : "bg-status-danger"}`} style={{ width: `${item.score}%` }} />
                      </div>
                      <span className="text-body-sm tabular-nums text-primary">{item.score}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-body-sm text-muted">{item.lastInteraction ? dateTime(item.lastInteraction) : "—"}</td>
                  <td className="px-4 py-3 text-right">
                    {item.relationshipId ? (
                      <Link
                        href={`/exhibit/${organizationId}/relationships/${item.relationshipId}`}
                        className="text-body-sm text-link hover:underline"
                      >
                        Open
                      </Link>
                    ) : null}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AttendeeStatusBadge({ status }: { status: string }) {
  const map: Record<string, { tone: "info" | "success" | "ai" | "warning" | "neutral"; label: string }> = {
    new: { tone: "info", label: "New" },
    active: { tone: "success", label: "Active" },
    returning: { tone: "ai", label: "Returning" },
    "needs-followup": { tone: "warning", label: "Needs Follow-up" },
  };
  const s = map[status] ?? { tone: "neutral", label: status };
  return <StatusBadge tone={s.tone}>{s.label}</StatusBadge>;
}

function computeScore(reasons: string[]) {
  let score = 40;
  if (reasons.some((r) => r.includes("returning") || r.includes("multiple"))) score += 20;
  if (reasons.some((r) => r.includes("active") || r.includes("engaged"))) score += 15;
  if (reasons.some((r) => r.includes("profile"))) score += 15;
  if (reasons.some((r) => r.includes("new"))) score -= 10;
  if (reasons.some((r) => r.includes("no notes"))) score -= 10;
  return Math.max(10, Math.min(100, score));
}

function dateTime(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(value));
}

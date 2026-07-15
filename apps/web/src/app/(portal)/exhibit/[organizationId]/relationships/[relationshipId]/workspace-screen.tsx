import type { RelationshipWorkspace } from "@concourse/api-client";
import { NotesPanel } from "./notes-panel";
import Link from "next/link";

export function WorkspaceScreen({ workspace, organizationId }: { workspace: RelationshipWorkspace; organizationId: string }) {
  const shared = workspace.attendee.consentStatus === "shared";
  const attendee = workspace.attendee;
  const rel = workspace.relationship;
  const score = computeScore(workspace);

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div className="flex items-center gap-2 text-body-sm text-muted">
        <Link href={`/exhibit/${organizationId}/attendees`} className="text-link hover:underline">Attendees</Link>
        <span>/</span>
        <span className="text-primary">{attendee.name ?? "Attendee"}</span>
      </div>

      <header className="rounded-xl border border-default bg-surface p-6">
        <div className="flex items-start gap-5">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-sunken text-title font-semibold text-primary">
            {initials(attendee.name)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="truncate text-title font-semibold text-primary">{attendee.name ?? "Attendee profile"}</h1>
              <StatusBadge tone={shared ? "success" : "neutral"}>
                {shared ? "Profile shared" : "Not shared"}
              </StatusBadge>
              <StatusBadge tone={rel.status === "active" ? "success" : rel.status === "new" ? "info" : "neutral"}>
                {rel.status}
              </StatusBadge>
            </div>
            <p className="mt-1 text-body text-secondary">
              {shared
                ? [attendee.title, attendee.company].filter(Boolean).join(" · ") || "Details not provided"
                : "Contact details hidden until shared"}
            </p>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-body-sm text-secondary">
              <span>{shared ? attendee.industry ?? "—" : "—"}</span>
              <span>{shared ? attendee.contact.email ?? "—" : "—"}</span>
              <span>Profile {attendee.profileCompleteness}% complete</span>
              <span>{rel.interactionCount} interactions</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <p className="text-caption text-muted">Relationship Score</p>
            <p className="text-title font-semibold tabular-nums text-primary">{score}/100</p>
            <div className="h-1.5 w-20 rounded-full bg-sunken">
              <div className={`h-full rounded-full ${score >= 70 ? "bg-status-success" : score >= 40 ? "bg-status-warning" : "bg-status-danger"}`} style={{ width: `${score}%` }} />
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric label="Interactions" value={String(workspace.summary.interactionCount)} />
        <Metric label="Notes" value={String(workspace.summary.noteCount)} />
        <Metric label="First interaction" value={dateTime(rel.firstInteractionAt)} />
        <Metric label="Latest interaction" value={dateTime(workspace.summary.lastActivityAt)} />
      </div>

      <div className="rounded-xl border border-default bg-sunken p-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex size-5 items-center justify-center rounded-full bg-status-ai-subtle text-[10px] text-status-ai-text">AI</span>
          <p className="text-body-sm font-medium text-primary">AI Summary</p>
        </div>
        <p className="mt-2 text-body-sm text-secondary">
          {shared
            ? `${attendee.name ?? "This attendee"} has ${rel.interactionCount} interaction(s), ${workspace.summary.noteCount} note(s), and a ${attendee.profileCompleteness}% complete profile. ${attendee.industry ? `Industry: ${attendee.industry}.` : ""} ${rel.status === "active" ? "Relationship is active." : rel.status === "new" ? "Recently engaged." : ""}`
            : "Profile consent not yet provided. AI summary available once attendee shares their profile."}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <section className="rounded-xl border border-default bg-surface p-5">
          <h2 className="text-body font-semibold text-primary">Interaction Timeline</h2>
          {workspace.timeline.length === 0 ? (
            <div className="mt-5 flex min-h-32 items-center justify-center rounded-lg border border-dashed border-default">
              <p className="text-body-sm text-muted">Submissions and interactions will appear here.</p>
            </div>
          ) : (
            <ol className="mt-5 space-y-5 border-l border-default pl-5">
              {workspace.timeline.map((entry) => (
                <li className="relative" key={entry.id}>
                  <span aria-hidden className="absolute -left-[1.65rem] top-1.5 flex size-3 items-center justify-center rounded-full border-2 border-surface bg-brand" />
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="text-body-sm font-medium text-primary">{entry.form.name}</h3>
                    <time className="text-caption text-muted">{dateTime(entry.submittedAt)}</time>
                  </div>
                  <p className="mt-0.5 text-body-sm text-secondary">{source(entry.interactionSource)}</p>
                  <dl className="mt-3 space-y-2">
                    {entry.values.map((v) => (
                      <div className="grid gap-1 sm:grid-cols-3" key={v.fieldId}>
                        <dt className="text-body-sm text-muted">{String(v.field.label ?? v.field.key ?? "Response")}</dt>
                        <dd className="text-body-sm text-primary sm:col-span-2">{display(v.value)}</dd>
                      </div>
                    ))}
                  </dl>
                </li>
              ))}
            </ol>
          )}
        </section>
        <NotesPanel initialNotes={workspace.notes} organizationId={organizationId} relationshipId={rel.id} />
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-default bg-surface p-4">
      <p className="text-caption text-muted">{label}</p>
      <p className="mt-1 text-body font-medium text-primary">{value}</p>
    </div>
  );
}

function StatusBadge({ tone, children }: { tone: "success" | "neutral" | "info"; children: string }) {
  const colors = {
    success: "border-status-success-border bg-status-success-subtle text-status-success-text",
    neutral: "border-default bg-sunken text-secondary",
    info: "border-status-info-border bg-status-info-subtle text-status-info-text",
  };
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-caption font-medium ${colors[tone]}`}>{children}</span>;
}

function computeScore(w: RelationshipWorkspace) {
  let score = 0;
  if (w.attendee.profileCompleteness > 50) score += 20;
  if (w.attendee.consentStatus === "shared") score += 15;
  if (w.relationship.interactionCount >= 3) score += 20;
  else if (w.relationship.interactionCount >= 1) score += 10;
  if (w.summary.noteCount > 0) score += 10;
  if (w.relationship.status === "active") score += 15;
  if (w.attendee.industry) score += 10;
  if (w.attendee.contact.email) score += 10;
  return Math.min(100, score);
}

function initials(name: string | null) {
  return name?.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase() || "?";
}

function source(value: string) {
  if (value === "visitor_qr") return "Visitor QR scan";
  if (value === "exhibitor_device") return "Exhibitor device entry";
  return value;
}

function dateTime(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function display(value: unknown) {
  if (value === null || value === undefined || value === "") return "—";
  return typeof value === "string" ? value : JSON.stringify(value);
}

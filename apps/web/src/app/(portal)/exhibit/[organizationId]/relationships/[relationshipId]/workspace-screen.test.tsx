import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { RelationshipWorkspace } from "@concourse/api-client";

vi.mock("./notes-panel", () => ({ NotesPanel: () => <section aria-label="Notes">Notes</section> }));

import { WorkspaceScreen } from "./workspace-screen";
import { WorkspaceLoading, WorkspaceMessage } from "./workspace-state";

const workspace: RelationshipWorkspace = {
  attendee: { id: "attendee", name: "Ada Lovelace", company: "ExAi", title: "Engineer", industry: "Technology", contact: { email: "ada@example.com", linkedInUrl: null }, profileCompleteness: 80, consentStatus: "shared" },
  relationship: { id: "relationship", eventExhibitorId: "exhibitor", status: "active", firstInteractionAt: "2026-01-01T10:00:00.000Z", latestInteractionAt: "2026-01-02T10:00:00.000Z", interactionCount: 1, hasPotentialDuplicate: false, updatedAt: "2026-01-02T10:00:00.000Z" },
  timeline: [{ id: "submission", submittedAt: "2026-01-02T10:00:00.000Z", interactionSource: "visitor_qr", potentialDuplicate: false, form: { id: "form", name: "Demo", description: null }, values: [{ fieldId: "field", value: "Interested", field: { label: "Interest" } }] }],
  notes: [], summary: { interactionCount: 1, lastActivityAt: "2026-01-02T10:00:00.000Z", noteCount: 0, profileCompleteness: 80 },
};

describe("WorkspaceScreen", () => {
  it("renders the projection, timeline, and accessible summary", () => {
    const html = renderToStaticMarkup(<WorkspaceScreen organizationId="organization" workspace={workspace} />);
    expect(html).toContain("Ada Lovelace"); expect(html).toContain("Visitor QR"); expect(html).toContain("Relationship summary"); expect(html).toContain("Interest");
  });
  it("masks profile fields without consent", () => {
    const html = renderToStaticMarkup(<WorkspaceScreen organizationId="organization" workspace={{ ...workspace, attendee: { ...workspace.attendee, consentStatus: "not_shared" } }} />);
    expect(html).toContain("Consent required"); expect(html).not.toContain("ExAi"); expect(html).not.toContain("Engineer");
  });
  it("renders loading and error states accessibly", () => {
    expect(renderToStaticMarkup(<WorkspaceLoading />)).toContain("Loading relationship workspace");
    expect(renderToStaticMarkup(<WorkspaceMessage title="Access denied" detail="No access" />)).toContain("aria-live=\"polite\"");
  });
});

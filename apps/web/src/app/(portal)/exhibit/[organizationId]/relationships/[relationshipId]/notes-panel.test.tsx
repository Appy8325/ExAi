import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const { createNote } = vi.hoisted(() => ({ createNote: vi.fn() }));
vi.mock("@concourse/api-client", () => ({ createRelationshipNote: createNote, updateRelationshipNote: vi.fn(), archiveRelationshipNote: vi.fn() }));
vi.mock("@/lib/api/config", () => ({ getApiBaseUrl: () => "http://api.test" }));
vi.mock("@/lib/supabase/client", () => ({ createClient: () => ({ auth: { getSession: async () => ({ data: { session: { access_token: "token" } } }) } }) }));

import { NotesPanel } from "./notes-panel";

describe("NotesPanel", () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot>;
  afterEach(async () => { if (root) await act(async () => root.unmount()); container?.remove(); vi.clearAllMocks(); });

  it("creates a note through the typed API client", async () => {
    createNote.mockResolvedValue({ id: "note", body: "Follow up", createdByUserId: "user", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" });
    container = document.createElement("div"); document.body.append(container); root = createRoot(container);
    await act(async () => { root.render(<NotesPanel initialNotes={[]} organizationId="organization" relationshipId="relationship" />); });
    const textarea = container.querySelector("textarea")!; textarea.value = "Follow up";
    await act(async () => { textarea.dispatchEvent(new Event("input", { bubbles: true })); container.querySelector("form")!.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })); });
    expect(createNote).toHaveBeenCalledWith(expect.objectContaining({ accessToken: "token" }), "organization", "relationship", "Follow up");
    expect(container.textContent).toContain("Follow up");
    expect(container.querySelector("label[for='new-note']")?.textContent).toBe("Add a note");
  });
});

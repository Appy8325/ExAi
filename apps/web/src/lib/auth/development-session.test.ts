import { describe, expect, it, vi } from "vitest";

import { createDevelopmentSession, hasValidDevelopmentCredentials, hasValidDevelopmentSession } from "./development-session";

describe("development session", () => {
  it("accepts only the configured credentials and a current signed session", async () => {
    expect(hasValidDevelopmentCredentials("apoorv@sessionguide.live", "Apoorv@8325")).toBe(true);
    expect(hasValidDevelopmentCredentials("other@example.com", "Apoorv@8325")).toBe(false);
    expect(await hasValidDevelopmentSession(await createDevelopmentSession())).toBe(true);
  });

  it("rejects an expired session", async () => {
    const now = vi.spyOn(Date, "now").mockReturnValue(0);
    const session = await createDevelopmentSession();
    now.mockReturnValue(8 * 60 * 60 * 1000 + 1);
    expect(await hasValidDevelopmentSession(session)).toBe(false);
    now.mockRestore();
  });
});

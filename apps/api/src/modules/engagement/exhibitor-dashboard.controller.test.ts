import { describe, expect, it, vi } from "vitest";

vi.mock("@concourse/database", () => ({}));
import { ExhibitorDashboardController } from "./exhibitor-dashboard.controller";

describe("Exhibitor dashboard transport", () => {
  it("uses only the authenticated request context", () => {
    const find = (...args: unknown[]) => args;
    const controller = new ExhibitorDashboardController({ find } as never);
    expect(controller.find("exhibitor", { requestContext: { orgId: "organization", principal: { userId: "user" } } } as never)).toEqual(["organization", "exhibitor", "user"]);
  });
});

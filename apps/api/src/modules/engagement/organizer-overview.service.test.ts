import { NotFoundException, UnauthorizedException } from "@nestjs/common";
import { describe, expect, it, vi } from "vitest";

import { OrganizerOverviewService } from "./organizer-overview.service";

const overview = {
  organizationId: "organizer-id",
  organizationName: "ExAi Events",
  totals: { events: 1, exhibitors: 5, attendees: 200, relationships: 500 },
  events: [],
};

describe("OrganizerOverviewService", () => {
  it("returns live organizer data for the authenticated member", async () => {
    const database = { execute: vi.fn().mockResolvedValue([{ overview }]) };
    const auth = { identity: vi.fn().mockResolvedValue({ id: "user-id" }) };
    const service = new OrganizerOverviewService(database as never, auth as never);

    await expect(service.find("access-token")).resolves.toEqual(overview);
    expect(database.execute).toHaveBeenCalledOnce();
  });

  it("rejects unauthenticated requests before querying", async () => {
    const database = { execute: vi.fn() };
    const auth = { identity: vi.fn().mockResolvedValue(null) };
    const service = new OrganizerOverviewService(database as never, auth as never);

    await expect(service.find("invalid-token")).rejects.toBeInstanceOf(UnauthorizedException);
    expect(database.execute).not.toHaveBeenCalled();
  });

  it("reports when the user has no organizer membership", async () => {
    const database = { execute: vi.fn().mockResolvedValue([]) };
    const auth = { identity: vi.fn().mockResolvedValue({ id: "user-id" }) };
    const service = new OrganizerOverviewService(database as never, auth as never);

    await expect(service.find("access-token")).rejects.toBeInstanceOf(NotFoundException);
  });
});

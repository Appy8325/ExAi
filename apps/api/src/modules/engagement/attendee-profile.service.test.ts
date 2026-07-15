import { BadRequestException } from "@nestjs/common";
import { describe, expect, it, vi } from "vitest";

vi.mock("@concourse/database", () => ({ setRlsContext: vi.fn() }));

import { AttendeeProfileService } from "./attendee-profile.service";

describe("AttendeeProfileService", () => {
  it("updates only the authenticated attendee profile and consent in one transaction", async () => {
    const update = vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([{ id: "attendee" }]) }),
      }),
    });
    const insert = vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({ onConflictDoUpdate: vi.fn().mockResolvedValue(undefined) }),
    });
    const database = {
      transaction: (callback: (tx: unknown) => unknown) => callback({ execute: vi.fn(), update, insert }),
    };
    const service = new AttendeeProfileService(database as never);

    await expect(
      service.update("attendee", {
        fullName: " Ada Lovelace ",
        company: " ExAi ",
        jobTitle: " Engineer ",
        shareProfileWithExhibitors: true,
      }),
    ).resolves.toEqual({
      fullName: "Ada Lovelace",
      company: "ExAi",
      jobTitle: "Engineer",
      shareProfileWithExhibitors: true,
    });
    expect(update).toHaveBeenCalledOnce();
    expect(insert).toHaveBeenCalledTimes(2);
  });

  it("rejects an incomplete profile before writing", async () => {
    const service = new AttendeeProfileService({ transaction: vi.fn() } as never);

    await expect(
      service.update("attendee", {
        fullName: "",
        company: "ExAi",
        jobTitle: "Engineer",
        shareProfileWithExhibitors: false,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});

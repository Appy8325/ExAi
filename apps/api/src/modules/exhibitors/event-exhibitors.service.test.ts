import { BadRequestException, NotFoundException } from "@nestjs/common";
import { describe, expect, it, vi } from "vitest";

vi.mock("./event-exhibitors.repository", () => ({
  EventExhibitorsRepository: class EventExhibitorsRepository {},
}));

import { EventExhibitorsService } from "./event-exhibitors.service";

const validInput = {
  organizationId: "exhibitor-organization-id",
  organizerOrganizationId: "organizer-organization-id",
  actorUserId: "user-id",
  eventId: "event-id",
  boothName: " Acme Booth ",
  boothNumber: " A-01 ",
  website: "https://acme.example",
  contactEmail: " SALES@ACME.EXAMPLE ",
  socialLinks: { linkedin: "https://linkedin.com/company/acme" },
};

describe("EventExhibitorsService", () => {
  it("creates a validated exhibitor booth profile", async () => {
    const repository = { create: vi.fn().mockResolvedValue({ id: "exhibitor-id" }) };
    const service = new EventExhibitorsService(repository as never);
    await expect(service.create(validInput)).resolves.toEqual({ id: "exhibitor-id" });
    expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({
      boothName: "Acme Booth", boothNumber: "A-01", contactEmail: "sales@acme.example",
    }));
  });

  it("rejects invalid profile values", () => {
    const service = new EventExhibitorsService({} as never);
    expect(() => service.create({ ...validInput, boothName: " " })).toThrow(BadRequestException);
    expect(() => service.create({ ...validInput, website: "mailto:bad@example.com" })).toThrow(BadRequestException);
    expect(() => service.create({ ...validInput, contactEmail: "invalid" })).toThrow(BadRequestException);
  });

  it("looks up, updates, and archives within the supplied tenant scope", async () => {
    const repository = {
      findById: vi.fn().mockResolvedValue({ id: "exhibitor-id" }),
      update: vi.fn().mockResolvedValue({ id: "exhibitor-id" }),
      archive: vi.fn().mockResolvedValue({ id: "exhibitor-id", status: "archived" }),
    };
    const service = new EventExhibitorsService(repository as never);
    await expect(service.findById("exhibitor-id", "organization-id", "user-id")).resolves.toEqual({ id: "exhibitor-id" });
    await expect(service.update({ exhibitorId: "exhibitor-id", eventId: "event-id", scopeOrganizationId: "organization-id", actorUserId: "user-id", boothName: "Updated" })).resolves.toEqual({ id: "exhibitor-id" });
    await expect(service.archive("exhibitor-id", "event-id", "organization-id", "user-id")).resolves.toEqual({ id: "exhibitor-id", status: "archived" });
    expect(repository.update).toHaveBeenCalledWith(expect.objectContaining({ eventId: "event-id", boothName: "Updated" }));
  });

  it("does not reveal unavailable exhibitors", async () => {
    const service = new EventExhibitorsService({ update: vi.fn().mockResolvedValue(undefined), archive: vi.fn().mockResolvedValue(undefined) } as never);
    await expect(service.update({ exhibitorId: "exhibitor-id", eventId: "event-id", scopeOrganizationId: "organization-id", actorUserId: "user-id", boothName: "Updated" })).rejects.toThrow(NotFoundException);
    await expect(service.archive("exhibitor-id", "event-id", "organization-id", "user-id")).rejects.toThrow(NotFoundException);
  });
});

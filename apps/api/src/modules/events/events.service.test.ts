import { BadRequestException, NotFoundException } from "@nestjs/common";
import { describe, expect, it, vi } from "vitest";

vi.mock("./events.repository", () => ({
  EventsRepository: class EventsRepository {},
}));

import { EventsService } from "./events.service";

const validInput = {
  organizationId: "organization-id",
  actorUserId: "user-id",
  name: " Expo 2026 ",
  timezone: "Asia/Kolkata",
  startAt: "2026-08-01T09:00:00.000Z",
  endAt: "2026-08-01T17:00:00.000Z",
};

describe("EventsService", () => {
  it("creates a validated event with a generated slug", async () => {
    const repository = { create: vi.fn().mockResolvedValue({ id: "event-id" }) };
    const service = new EventsService(repository as never);

    await expect(service.create(validInput)).resolves.toEqual({ id: "event-id" });
    expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({
      name: "Expo 2026", slug: "expo-2026", startAt: expect.any(Date), endAt: expect.any(Date),
    }));
  });

  it("rejects invalid event values", () => {
    const service = new EventsService({} as never);
    expect(() => service.create({ ...validInput, timezone: "not/a-timezone" })).toThrow(BadRequestException);
    expect(() => service.create({ ...validInput, endAt: validInput.startAt })).toThrow(BadRequestException);
    expect(() => service.create({ ...validInput, name: " " })).toThrow(BadRequestException);
  });

  it("updates and archives through the organization-scoped repository methods", async () => {
    const repository = {
      update: vi.fn().mockResolvedValue({ id: "event-id" }),
      archive: vi.fn().mockResolvedValue({ id: "event-id", status: "archived" }),
    };
    const service = new EventsService(repository as never);

    await expect(service.update({ organizationId: "organization-id", actorUserId: "user-id", eventId: "event-id", name: "Updated" })).resolves.toEqual({ id: "event-id" });
    await expect(service.archive("organization-id", "event-id", "user-id")).resolves.toEqual({ id: "event-id", status: "archived" });
    expect(repository.update).toHaveBeenCalledWith(expect.objectContaining({ organizationId: "organization-id", eventId: "event-id", name: "Updated" }));
    expect(repository.archive).toHaveBeenCalledWith("organization-id", "event-id", "user-id");
  });

  it("treats an unavailable scoped event as not found", async () => {
    const service = new EventsService({ update: vi.fn().mockResolvedValue(undefined), archive: vi.fn().mockResolvedValue(undefined) } as never);
    await expect(service.update({ organizationId: "organization-id", actorUserId: "user-id", eventId: "event-id", name: "Updated" })).rejects.toThrow(NotFoundException);
    await expect(service.archive("organization-id", "event-id", "user-id")).rejects.toThrow(NotFoundException);
  });
});

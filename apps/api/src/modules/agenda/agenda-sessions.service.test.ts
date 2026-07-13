import { BadRequestException, NotFoundException } from "@nestjs/common";
import { describe, expect, it, vi } from "vitest";

vi.mock("./agenda-sessions.repository", () => ({
  AgendaSessionsRepository: class AgendaSessionsRepository {},
}));

import { AgendaSessionsService } from "./agenda-sessions.service";

const validInput = {
  organizationId: "organization-id",
  actorUserId: "user-id",
  eventId: "event-id",
  title: " Opening Session ",
  timezone: "Asia/Kolkata",
  startAt: "2026-08-01T09:00:00.000Z",
  endAt: "2026-08-01T10:00:00.000Z",
};

describe("AgendaSessionsService", () => {
  it("creates a validated session with an event-local slug", async () => {
    const repository = { create: vi.fn().mockResolvedValue({ id: "session-id" }) };
    const service = new AgendaSessionsService(repository as never);
    await expect(service.create(validInput)).resolves.toEqual({ id: "session-id" });
    expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({
      eventId: "event-id", title: "Opening Session", slug: "opening-session",
      startAt: expect.any(Date), endAt: expect.any(Date),
    }));
  });

  it("rejects invalid session values", () => {
    const service = new AgendaSessionsService({} as never);
    expect(() => service.create({ ...validInput, timezone: "not/a-timezone" })).toThrow(BadRequestException);
    expect(() => service.create({ ...validInput, capacity: -1 })).toThrow(BadRequestException);
    expect(() => service.create({ ...validInput, endAt: validInput.startAt })).toThrow(BadRequestException);
  });

  it("updates and archives in the supplied organization and event scope", async () => {
    const repository = {
      update: vi.fn().mockResolvedValue({ id: "session-id" }),
      archive: vi.fn().mockResolvedValue({ id: "session-id", status: "archived" }),
    };
    const service = new AgendaSessionsService(repository as never);
    await expect(service.update({ organizationId: "organization-id", actorUserId: "user-id", eventId: "event-id", sessionId: "session-id", title: "Updated" })).resolves.toEqual({ id: "session-id" });
    await expect(service.archive("organization-id", "event-id", "session-id", "user-id")).resolves.toEqual({ id: "session-id", status: "archived" });
    expect(repository.update).toHaveBeenCalledWith(expect.objectContaining({ eventId: "event-id", sessionId: "session-id", title: "Updated" }));
    expect(repository.archive).toHaveBeenCalledWith("organization-id", "event-id", "session-id", "user-id");
  });

  it("looks up a session within the supplied event scope", async () => {
    const repository = { findById: vi.fn().mockResolvedValue({ id: "session-id" }) };
    const service = new AgendaSessionsService(repository as never);
    await expect(service.findById("organization-id", "event-id", "session-id", "user-id")).resolves.toEqual({ id: "session-id" });
    expect(repository.findById).toHaveBeenCalledWith("organization-id", "event-id", "session-id", "user-id");
  });

  it("does not reveal unavailable sessions", async () => {
    const service = new AgendaSessionsService({ update: vi.fn().mockResolvedValue(undefined), archive: vi.fn().mockResolvedValue(undefined) } as never);
    await expect(service.update({ organizationId: "organization-id", actorUserId: "user-id", eventId: "event-id", sessionId: "session-id", title: "Updated" })).rejects.toThrow(NotFoundException);
    await expect(service.archive("organization-id", "event-id", "session-id", "user-id")).rejects.toThrow(NotFoundException);
  });
});

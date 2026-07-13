import { BadRequestException } from "@nestjs/common";
import { describe, expect, it, vi } from "vitest";
import { LeadSubmissionsService } from "./lead-submissions.service";

describe("LeadSubmissionsService", () => {
  it("accepts the two supported sources and rejects future sources", () => {
    const repository = { create: vi.fn(), prefill: vi.fn() };
    const service = new LeadSubmissionsService(repository as never);
    service.create({ organizationId: "o", actorUserId: "u", eventId: "e", eventExhibitorId: "x", leadFormId: "f", idempotencyKey: "k", interactionSource: "visitor_qr", responses: {} });
    expect(repository.create).toHaveBeenCalled();
    expect(() => service.create({ organizationId: "o", actorUserId: "u", eventId: "e", eventExhibitorId: "x", leadFormId: "f", idempotencyKey: "k", interactionSource: "api" as never, responses: {} })).toThrow(BadRequestException);
  });
});

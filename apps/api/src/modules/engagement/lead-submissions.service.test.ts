import { BadRequestException } from "@nestjs/common";
import { describe, expect, it, vi } from "vitest";
import { LeadSubmissionsService } from "./lead-submissions.service";

describe("LeadSubmissionsService", () => {
  it("accepts the two supported sources and rejects future sources", async () => {
    const repository = { create: vi.fn().mockResolvedValue({ id: "submission" }), prefill: vi.fn() };
    const intelligence = { enrich: vi.fn() };
    const service = new LeadSubmissionsService(repository as never, intelligence as never);
    await service.create({ organizationId: "o", actorUserId: "u", eventId: "e", eventExhibitorId: "x", leadFormId: "f", idempotencyKey: "k", interactionSource: "visitor_qr", responses: {} });
    expect(repository.create).toHaveBeenCalled();
    await expect(service.create({ organizationId: "o", actorUserId: "u", eventId: "e", eventExhibitorId: "x", leadFormId: "f", idempotencyKey: "k", interactionSource: "api" as never, responses: {} })).rejects.toThrow(BadRequestException);
  });
});

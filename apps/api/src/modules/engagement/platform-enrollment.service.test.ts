import { describe, expect, it, vi } from "vitest";

import { PlatformEnrollmentService } from "./platform-enrollment.service";

describe("PlatformEnrollmentService public booth projection", () => {
  it("returns only the public booth fields for a live booth", async () => {
    const database = {
      execute: vi
        .fn()
        .mockResolvedValueOnce([
          {
            id: "booth-id",
            company_name: "Acme",
            booth_name: "Acme Pavilion",
            booth_number: "A-01",
            logo_url: "https://assets.example/logo.png",
            description: "Relationship intelligence",
            website: "https://acme.example",
            event_slug: "techexpo-2027",
            privacy_policy_url: "https://acme.example/privacy",
          },
        ])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]),
    };
    const service = new PlatformEnrollmentService(
      database as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
    );

    await expect(service.findPublicBooth("booth-id")).resolves.toEqual({
      id: "booth-id",
      companyName: "Acme",
      boothName: "Acme Pavilion",
      boothNumber: "A-01",
      logoUrl: "https://assets.example/logo.png",
      description: "Relationship intelligence",
      website: "https://acme.example",
      eventSlug: "techexpo-2027",
      privacyPolicyUrl: "https://acme.example/privacy",
      resources: [],
      leadForm: null,
    });
  });

  it("does not expose unavailable booths", async () => {
    const service = new PlatformEnrollmentService(
      { execute: vi.fn().mockResolvedValue([]) } as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
    );

    await expect(service.findPublicBooth("missing")).rejects.toThrow(
      "Booth not found",
    );
  });
});

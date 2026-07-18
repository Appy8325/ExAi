import { describe, expect, it, vi } from "vitest";

import { PublicExhibitorsService } from "./public-exhibitors.service";

describe("PublicExhibitorsService", () => {
  it("keeps the booth and organization identifiers distinct", async () => {
    const service = new PublicExhibitorsService({ execute: vi.fn().mockResolvedValue([{
      id: "booth-id",
      organization_id: "organization-id",
      company_name: "Northstar Cloud",
      booth_name: "Northstar Cloud",
      booth_number: "A-101",
      logo_url: null,
      description: "Cloud infrastructure",
      website: null,
      social_links: null,
      contact_email: null,
      contact_phone: null,
    }]) } as never);

    await expect(service.listExhibitors("event-id")).resolves.toEqual([expect.objectContaining({
      id: "booth-id",
      organizationId: "organization-id",
    })]);
  });
});

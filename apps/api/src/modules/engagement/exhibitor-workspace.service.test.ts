import { BadRequestException } from "@nestjs/common";
import { describe, expect, it, vi } from "vitest";

import { ExhibitorWorkspaceService } from "./exhibitor-workspace.service";

function service(repository: Record<string, unknown> = {}) {
  return new ExhibitorWorkspaceService(
    repository as never,
    {
      get: vi.fn((key: string) =>
        key === "supabase.publicWebOrigin" ? "https://app.example.com" : undefined,
      ),
    } as never,
    { execute: vi.fn() } as never,
  );
}

describe("ExhibitorWorkspaceService", () => {
  it("rejects unsafe website sources before persistence", async () => {
    const createWebsiteSource = vi.fn();
    await expect(
      service({ createWebsiteSource }).createSource({
        organizationId: "organization-id",
        eventExhibitorId: "booth-id",
        actorUserId: "user-id",
        sourceType: "website",
        title: "Private service",
        sourceUrl: "http://127.0.0.1/admin",
      }),
    ).rejects.toThrow(BadRequestException);
    expect(createWebsiteSource).not.toHaveBeenCalled();
  });

  it("requires a complete profile and published form before booth publication", async () => {
    const publishBooth = vi.fn();
    await expect(
      service({
        find: vi.fn().mockResolvedValue({
          booth: { description: "", website: null, contactEmail: null },
        }),
        publishBooth,
      }).publishBooth("organization-id", "booth-id", "user-id"),
    ).rejects.toThrow("Complete the booth profile");
    expect(publishBooth).not.toHaveBeenCalled();
  });

  it("generates an opaque public QR URL after publication", async () => {
    const qr = vi.fn().mockResolvedValue({
      publicToken: "opaque-token",
      createdAt: new Date("2026-07-18T00:00:00Z"),
    });
    const result = await service({ qr }).generateQr(
      "organization-id",
      "booth-id",
      "user-id",
    );
    expect(qr).toHaveBeenCalledWith(
      "organization-id",
      "booth-id",
      "user-id",
      expect.stringMatching(/^[A-Za-z0-9_-]{43}$/),
    );
    expect(result.publicUrl).toBe("https://app.example.com/visit/opaque-token");
    expect(result.imageDataUrl).toMatch(/^data:image\/png;base64,/);
  });
});

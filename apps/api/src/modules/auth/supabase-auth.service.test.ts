import { describe, expect, it, vi } from "vitest";

const supabase = vi.hoisted(() => ({ signInWithOtp: vi.fn() }));
vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({ auth: { signInWithOtp: supabase.signInWithOtp } }),
}));

import { SupabaseAuthService } from "./supabase-auth.service";

describe("SupabaseAuthService", () => {
  it("sends booth Magic Links through the web callback", async () => {
    supabase.signInWithOtp.mockResolvedValue({ error: null });
    const values: Record<string, string> = {
      "supabase.url": "https://project.supabase.co",
      "supabase.serviceRoleKey": "test-key",
      "supabase.publicWebOrigin": "https://demo.exai.app/",
    };
    const service = new SupabaseAuthService({
      get: (key: string) => values[key],
    } as never);

    await service.sendMagicLink("attendee@example.com");

    expect(supabase.signInWithOtp).toHaveBeenCalledWith({
      email: "attendee@example.com",
      options: { emailRedirectTo: "https://demo.exai.app/auth/callback" },
    });
  });

  it("allows a local invitation callback without allowing an external redirect", async () => {
    supabase.signInWithOtp.mockResolvedValue({ error: null });
    const service = new SupabaseAuthService({
      get: (key: string) =>
        ({
          "supabase.url": "https://project.supabase.co",
          "supabase.serviceRoleKey": "test-key",
          "supabase.publicWebOrigin": "https://demo.exai.app",
        })[key],
    } as never);

    await service.sendMagicLink(
      "member@example.com",
      "/auth/callback?invitation=token",
    );
    expect(supabase.signInWithOtp).toHaveBeenLastCalledWith({
      email: "member@example.com",
      options: {
        emailRedirectTo: "https://demo.exai.app/auth/callback?invitation=token",
      },
    });
    await expect(
      service.sendMagicLink("member@example.com", "//evil.example"),
    ).rejects.toThrow("local path");
  });
});

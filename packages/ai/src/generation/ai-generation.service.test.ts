import { afterEach, describe, expect, it, vi } from "vitest";

import { AiGenerationService } from "./ai-generation.service";

describe("AiGenerationService", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.NVIDIA_API_KEY;
    delete process.env.NVIDIA_BASE_URL;
    delete process.env.NVIDIA_CHAT_MODEL;
  });

  it("sends an authenticated NVIDIA chat completion", async () => {
    process.env.NVIDIA_API_KEY = "test-key";
    process.env.NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1/";
    process.env.NVIDIA_CHAT_MODEL = "deepseek-ai/deepseek-v4-flash";
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          choices: [{ message: { content: "connected" } }],
          usage: { prompt_tokens: 12, completion_tokens: 3 },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await new AiGenerationService().generate({
      promptId: "provider.check",
      organizationId: "org-1",
      input: { message: "Reply with connected" },
    });

    expect(result).toEqual({
      text: "connected",
      usage: { tokensIn: 12, tokensOut: 3, tokensCached: 0 },
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://integrate.api.nvidia.com/v1/chat/completions",
      expect.objectContaining({
        method: "POST",
        headers: {
          Authorization: "Bearer test-key",
          "Content-Type": "application/json",
        },
      }),
    );
  });
});

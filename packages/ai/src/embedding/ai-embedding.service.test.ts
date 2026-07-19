import { afterEach, describe, expect, it, vi } from "vitest";

import { AiEmbeddingService } from "./ai-embedding.service";

describe("AiEmbeddingService", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.NVIDIA_API_KEY;
    delete process.env.NVIDIA_EMBEDDING_MODEL;
  });

  it("uses NVIDIA passage embeddings and validates vector dimensions", async () => {
    process.env.NVIDIA_API_KEY = "test-key";
    process.env.NVIDIA_EMBEDDING_MODEL = "nvidia/nv-embedqa-e5-v5";
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({ data: [{ index: 0, embedding: Array(1024).fill(0.5) }] }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const [result] = await new AiEmbeddingService().embedDocuments(["booth"]);

    expect(result?.values).toHaveLength(1024);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://integrate.api.nvidia.com/v1/embeddings",
      expect.objectContaining({
        body: expect.stringContaining('"input_type":"passage"'),
      }),
    );
  });
});

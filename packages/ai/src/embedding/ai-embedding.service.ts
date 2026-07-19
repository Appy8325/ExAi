/** NVIDIA NIM embedding boundary used by ingestion and retrieval. */

export interface EmbeddingVector {
  values: number[];
  model: string;
}

export class AiEmbeddingService {
  async embedDocuments(texts: string[]): Promise<EmbeddingVector[]> {
    return this.embed(texts, "passage");
  }

  async embedQuery(text: string): Promise<EmbeddingVector> {
    const [embedding] = await this.embed([text], "query");
    if (!embedding) throw new Error("NVIDIA returned no query embedding");
    return embedding;
  }

  private async embed(texts: string[], inputType: "passage" | "query") {
    if (!texts.length) return [];
    const apiKey = process.env.NVIDIA_API_KEY;
    if (!apiKey) throw new Error("NVIDIA_API_KEY is required");
    const model =
      process.env.NVIDIA_EMBEDDING_MODEL ?? "nvidia/nv-embedqa-e5-v5";
    const baseUrl = (
      process.env.NVIDIA_BASE_URL ?? "https://integrate.api.nvidia.com/v1"
    ).replace(/\/+$/, "");
    const response = await fetch(`${baseUrl}/embeddings`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        input: texts,
        input_type: inputType,
        encoding_format: "float",
        truncate: "END",
      }),
      signal: AbortSignal.timeout(120_000),
    });
    const payload = (await response.json()) as {
      data?: Array<{ index: number; embedding: number[] }>;
      error?: { message?: string };
    };
    if (!response.ok) {
      throw new Error(
        `NVIDIA embedding request failed (${response.status}): ${payload.error?.message ?? response.statusText}`,
      );
    }
    const ordered = [...(payload.data ?? [])].sort((a, b) => a.index - b.index);
    if (
      ordered.length !== texts.length ||
      ordered.some((item) => item.embedding.length !== 1024)
    ) {
      throw new Error("NVIDIA returned an unexpected embedding shape");
    }
    return ordered.map(({ embedding }) => ({ values: embedding, model }));
  }
}

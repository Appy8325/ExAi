/**
 * AiGenerationService — public port for long-form/structured generation
 * through the configured NVIDIA NIM chat model.
 *
 * Used for user-visible prose and multi-step reasoning/tool-use tasks:
 * Expo Copilot grounded answers, Lead Intelligence summaries, Follow-up
 * Studio drafting, Organizer Pulse narratives.
 *
 * Provider credentials remain server-side and are never exposed by this port.
 */

export interface AiGenerationRequest {
  promptId: string;
  organizationId: string;
  eventId?: string;
  input: Record<string, unknown>;
}

export interface AiGenerationResult {
  text: string;
  citations?: Array<{ marker: string; documentId: string }>;
  usage: {
    tokensIn: number;
    tokensOut: number;
    tokensCached: number;
  };
}

export interface AiGenerationStreamChunk {
  type: "text" | "citation" | "done";
  data: unknown;
}

interface NvidiaChatCompletion {
  choices?: Array<{ message?: { content?: string } }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    prompt_tokens_details?: { cached_tokens?: number };
  };
  error?: { message?: string };
}

export class AiGenerationService {
  async generate(req: AiGenerationRequest): Promise<AiGenerationResult> {
    const apiKey = process.env.NVIDIA_API_KEY;
    const model = process.env.NVIDIA_CHAT_MODEL;

    if (!apiKey) throw new Error("NVIDIA_API_KEY is required");
    if (!model) throw new Error("NVIDIA_CHAT_MODEL is required");

    const baseUrl = (
      process.env.NVIDIA_BASE_URL ?? "https://integrate.api.nvidia.com/v1"
    ).replace(/\/+$/, "");
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: `You are ExAi. Complete the internal task named ${req.promptId} using only the supplied input.`,
          },
          { role: "user", content: JSON.stringify(req.input) },
        ],
        temperature: 0.2,
        max_tokens: 2048,
      }),
      signal: AbortSignal.timeout(30_000),
    });
    const payload = (await response.json()) as NvidiaChatCompletion;

    if (!response.ok) {
      throw new Error(
        `NVIDIA request failed (${response.status}): ${payload.error?.message ?? response.statusText}`,
      );
    }

    const text = payload.choices?.[0]?.message?.content;
    if (!text) throw new Error("NVIDIA returned no completion text");

    return {
      text,
      usage: {
        tokensIn: payload.usage?.prompt_tokens ?? 0,
        tokensOut: payload.usage?.completion_tokens ?? 0,
        tokensCached: payload.usage?.prompt_tokens_details?.cached_tokens ?? 0,
      },
    };
  }

  async *stream(
    req: AiGenerationRequest,
  ): AsyncGenerator<AiGenerationStreamChunk> {
    // ponytail: buffered stream; switch to SSE parsing when a live streaming caller exists.
    const result = await this.generate(req);
    yield { type: "text", data: result.text };
    yield { type: "done", data: result.usage };
  }
}

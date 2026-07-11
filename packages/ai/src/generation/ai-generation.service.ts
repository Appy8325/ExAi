/**
 * AiGenerationService — public port for long-form/structured generation on
 * `claude-fable-5` (docs/21-ai-architecture.md §1, §2).
 *
 * Used for user-visible prose and multi-step reasoning/tool-use tasks:
 * Expo Copilot grounded answers, Lead Intelligence summaries, Follow-up
 * Studio drafting, Organizer Pulse narratives.
 *
 * Every call is funneled through the private AiGatewayService (budget ->
 * prompts -> guardrails -> call -> meter -> telemetry). This class does not
 * call the Anthropic SDK directly -- Milestone 3 wires it to the gateway.
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

export class AiGenerationService {
  async generate(req: AiGenerationRequest): Promise<AiGenerationResult> {
    throw new Error("not implemented -- Milestone 3");
  }

  async *stream(
    req: AiGenerationRequest,
  ): AsyncGenerator<AiGenerationStreamChunk> {
    throw new Error("not implemented -- Milestone 3");
  }
}

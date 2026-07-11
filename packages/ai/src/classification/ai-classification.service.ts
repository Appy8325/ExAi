/**
 * AiClassificationService — public port for high-volume structured tasks on
 * `claude-haiku-4-5` (docs/21-ai-architecture.md §1, §2).
 *
 * Used for query rewrite/intent classification (Copilot), match reason
 * snippets (Matchmaking), note intent/entity extraction and sentiment class
 * (Lead Intelligence), question triage (Organizer Pulse).
 *
 * Every call is funneled through the private AiGatewayService (budget ->
 * prompts -> guardrails -> call -> meter -> telemetry). This class does not
 * call the Anthropic SDK directly -- Milestone 3 wires it to the gateway.
 */

export interface AiClassificationRequest {
  promptId: string;
  organizationId: string;
  eventId?: string;
  input: Record<string, unknown>;
}

export interface AiClassificationResult<T = unknown> {
  label: T;
  confidence?: number;
  usage: {
    tokensIn: number;
    tokensOut: number;
    tokensCached: number;
  };
}

export interface AiExtractionRequest {
  promptId: string;
  organizationId: string;
  eventId?: string;
  input: Record<string, unknown>;
}

export interface AiExtractionResult<T = unknown> {
  fields: T;
  usage: {
    tokensIn: number;
    tokensOut: number;
    tokensCached: number;
  };
}

export class AiClassificationService {
  async classify<T = unknown>(
    req: AiClassificationRequest,
  ): Promise<AiClassificationResult<T>> {
    throw new Error("not implemented -- Milestone 3");
  }

  async extract<T = unknown>(
    req: AiExtractionRequest,
  ): Promise<AiExtractionResult<T>> {
    throw new Error("not implemented -- Milestone 3");
  }
}

/**
 * AiGatewayService — PRIVATE orchestrator (docs/21-ai-architecture.md §1).
 * Not exported from packages/ai/src/index.ts: features may only reach the
 * model providers through the public ports (AiGenerationService,
 * AiClassificationService, AiEmbeddingService, RetrievalService), which
 * internally delegate to this gateway. Stages are not individually
 * injectable, so a feature cannot skip one.
 *
 * Every call funnels through, in order (doc 21 §1, §8):
 *   1. budget reservation      -- AiBudgetService.checkAndReserve
 *   2. prompt resolution       -- PromptRegistry.resolve
 *   3. input guardrails        -- AiGuardrailService.screenInput
 *   4. provider call           -- Claude / Voyage, with retry + circuit
 *                                  breaker policy (doc 21 §8.1)
 *   5. output guardrails       -- AiGuardrailService.screenOutput
 *   6. usage metering          -- AiBudgetService.record
 *   7. telemetry emit          -- OTel span + ai_usage_events row
 *
 * Not implemented until Milestone 3.
 */

export interface AiGatewayExecuteRequest {
  promptId: string;
  organizationId: string;
  eventId?: string;
  input: Record<string, unknown>;
}

export interface AiGatewayExecuteResult {
  output: unknown;
  usage: {
    tokensIn: number;
    tokensOut: number;
    tokensCached: number;
    costCents: number;
    latencyMs: number;
  };
}

export class AiGatewayService {
  async execute(
    req: AiGatewayExecuteRequest,
  ): Promise<AiGatewayExecuteResult> {
    // budget -> prompts -> guardrails -> call -> meter -> telemetry
    throw new Error("not implemented -- Milestone 3");
  }
}

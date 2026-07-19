/**
 * @concourse/ai — public barrel.
 *
 * Only the public ports from docs/21-ai-architecture.md §1 are exported.
 * The private orchestrator, AiGatewayService (src/gateway), is
 * intentionally NOT exported here -- features must go through a port, never
 * the gateway directly (doc 21 §1).
 */

export { AiGenerationService } from "./generation/ai-generation.service";
export type {
  AiGenerationRequest,
  AiGenerationResult,
  AiGenerationStreamChunk,
} from "./generation/ai-generation.service";

export { AiClassificationService } from "./classification/ai-classification.service";
export type {
  AiClassificationRequest,
  AiClassificationResult,
  AiExtractionRequest,
  AiExtractionResult,
} from "./classification/ai-classification.service";

export { AiEmbeddingService } from "./embedding/ai-embedding.service";
export type {
  EmbeddingVector,
} from "./embedding/ai-embedding.service";

export { RetrievalService } from "./retrieval/retrieval.service";
export type {
  RetrievalPrincipal,
  RetrievalOptions,
  RetrievedChunk,
} from "./retrieval/retrieval.service";

export { AiBudgetService } from "./budget/ai-budget.service";
export type {
  AiBudgetScope,
  AiFeature,
  BudgetReservation,
  AiUsageRecord,
} from "./budget/ai-budget.service";

export { AiGuardrailService } from "./guardrails/ai-guardrail.service";
export type {
  GuardrailScreenResult,
  ScreenInputRequest,
  ScreenOutputRequest,
  ScreenDocumentRequest,
} from "./guardrails/ai-guardrail.service";

export { PromptRegistry } from "./prompts/prompt-registry";
export type { PromptDefinition } from "./prompts/prompt-registry";

export { MATCHMAKING_WEIGHTS } from "./matchmaking/weights";
export type { MatchmakingWeights } from "./matchmaking/weights";

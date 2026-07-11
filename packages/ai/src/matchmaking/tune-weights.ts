/**
 * Offline tuning entry point for MatchmakingWeights (docs/21-ai-architecture.md
 * §3.2, docs/24-matchmaking-and-scoring.md §9). Runs against the labeled
 * golden set (`evals/matchmaking/golden.jsonl`) to produce tuned constants
 * for `weights.ts`. Not implemented until Milestone 3.
 */

import type { MatchmakingWeights } from "./weights";

export interface TuneWeightsOptions {
  goldenSetPath: string;
}

export async function tuneWeights(
  options: TuneWeightsOptions,
): Promise<MatchmakingWeights> {
  throw new Error("not implemented -- Milestone 3");
}

/**
 * Matchmaking scoring weights — versioned constants for the deterministic
 * weighted linear combination of the four factors defined in
 * docs/21-ai-architecture.md §3.2 / docs/24-matchmaking-and-scoring.md:
 *
 *   1. embeddingSimilarity — cosine similarity between attendee
 *      interest-profile embedding and exhibitor/product embeddings
 *   2. categoryOverlap      — declared-interest <-> exhibitor category overlap
 *   3. behavioralSignal     — booth visits to similar exhibitors, agenda
 *      session topic overlap
 *   4. reciprocalFit        — exhibitor target-buyer criteria match
 *
 * No LLM sets a score (doc 21 §3.2) -- these weights alone determine rank.
 * Real tuned values land in Milestone 3, offline-tuned against the golden
 * set (`evals/matchmaking/golden.jsonl`, doc 21 §5); this is a placeholder
 * shape only, not a scoring implementation.
 */

export interface MatchmakingWeights {
  embeddingSimilarity: number;
  categoryOverlap: number;
  behavioralSignal: number;
  reciprocalFit: number;
}

// Placeholder shape -- NOT tuned. Do not use for real scoring.
export const MATCHMAKING_WEIGHTS: MatchmakingWeights = {
  embeddingSimilarity: 0,
  categoryOverlap: 0,
  behavioralSignal: 0,
  reciprocalFit: 0,
};

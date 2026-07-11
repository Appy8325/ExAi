/**
 * The flag registry — "Flags are declared in code, not created ad hoc in the
 * PostHog dashboard" (docs/34-feature-flags-and-experimentation.md §9). "A
 * build step compiles every `defineFlag` call in
 * `packages/flags/src/registry.ts` into a manifest and idempotently upserts
 * it into PostHog via CI" (doc 34 §9) — that build step is out of scope for
 * this scaffold; this file is the source the manifest compiler will read.
 *
 * The five `ai-*` kill-switch flags below are the canonical, already-locked
 * registry from doc 34 §2 (itself consolidating docs/21-ai-architecture.md
 * §8.2) — real flag keys, not placeholders.
 */

/** Flag category prefixes fixed by doc 34 §1. */
export type FlagType = 'kill-switch' | 'rollout' | 'experiment';

/** Rollout unit a flag is bucketed/allowlisted against (doc 34 §5). */
export type RolloutUnit = 'event' | 'organization' | 'user';

interface BaseFlagDefinition {
  /** kebab-case, prefix-scoped key (doc 34 §1): `ai-`, `ops-`, or `exp-`. */
  key: string;
  type: FlagType;
  rolloutUnit: RolloutUnit;
  /** Team/pod accountable for the flag, surfaced in `/admin/flags` (doc 34 §10). */
  owner: string;
}

interface PermanentFlagDefinition extends BaseFlagDefinition {
  type: 'kill-switch';
  /** Kill-switches never carry a `sunsetBy` (doc 34 §9). */
  permanent: true;
  sunsetBy?: undefined;
}

interface TransientFlagDefinition extends BaseFlagDefinition {
  type: 'rollout' | 'experiment';
  permanent: false;
  /** Required for every non-permanent flag (doc 34 §9); CI fails a PR that omits it. */
  sunsetBy: string;
}

export type FlagDefinition = PermanentFlagDefinition | TransientFlagDefinition;

/** All `defineFlag` calls registered so far, keyed by `key` for the manifest compiler. */
const registry = new Map<string, FlagDefinition>();

/**
 * Registers a flag definition. Mirrors the shape fixed in doc 34 §9 — this is
 * the one call site every flag in the codebase must go through so the CI
 * manifest step (doc 34 §9) and the `/admin/flags` surface (doc 34 §10) have
 * a single source of truth.
 */
export function defineFlag(def: FlagDefinition): FlagDefinition {
  if (registry.has(def.key)) {
    throw new Error(`Flag "${def.key}" is already registered — one flag, one definition (doc 34 §1 rule 1).`);
  }
  registry.set(def.key, def);
  return def;
}

/** Returns every flag registered via `defineFlag`, for the manifest build step (doc 34 §9). */
export function getRegisteredFlags(): FlagDefinition[] {
  return Array.from(registry.values());
}

// ---------------------------------------------------------------------------
// Kill-Switch Registry — AI Features (doc 34 §2, doc 21 §8.2)
// ---------------------------------------------------------------------------
// All five are `permanent: true`, `rolloutUnit: 'event'` — "the natural
// blast-radius unit for an AI incident is one live event, not one
// organizer's entire portfolio" (doc 34 §2).

export const AI_EXPO_COPILOT = defineFlag({
  key: 'ai-expo-copilot',
  type: 'kill-switch',
  rolloutUnit: 'event',
  owner: 'ai-platform-pod',
  permanent: true,
});

export const AI_SMART_MATCHMAKING = defineFlag({
  key: 'ai-smart-matchmaking',
  type: 'kill-switch',
  rolloutUnit: 'event',
  owner: 'ai-platform-pod',
  permanent: true,
});

export const AI_LEAD_INTELLIGENCE = defineFlag({
  key: 'ai-lead-intelligence',
  type: 'kill-switch',
  rolloutUnit: 'event',
  owner: 'ai-platform-pod',
  permanent: true,
});

export const AI_FOLLOWUP_STUDIO = defineFlag({
  key: 'ai-followup-studio',
  type: 'kill-switch',
  rolloutUnit: 'event',
  owner: 'ai-platform-pod',
  permanent: true,
});

export const AI_ORGANIZER_PULSE = defineFlag({
  key: 'ai-organizer-pulse',
  type: 'kill-switch',
  rolloutUnit: 'event',
  owner: 'ai-platform-pod',
  permanent: true,
});

/** Union of every flag key currently registered — grows as `ops-`/`exp-` flags are added. */
export type FlagKey =
  | typeof AI_EXPO_COPILOT.key
  | typeof AI_SMART_MATCHMAKING.key
  | typeof AI_LEAD_INTELLIGENCE.key
  | typeof AI_FOLLOWUP_STUDIO.key
  | typeof AI_ORGANIZER_PULSE.key;

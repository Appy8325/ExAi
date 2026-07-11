import { PostHog } from 'posthog-node';

import type { FlagKey } from './registry';

/**
 * Context a flag is evaluated against — mirrors `FlagContext` in
 * docs/34-feature-flags-and-experimentation.md §3. `eventId` is the primary
 * rollout unit for every `ai-*` flag (doc 34 §2, §5).
 */
export interface FlagContext {
  organizationId?: string;
  eventId?: string;
  eventExhibitorId?: string;
  userId?: string; // reserved, doc 34 §13
}

/**
 * `FeatureFlagService` — the public port every feature module calls instead
 * of touching the PostHog Node SDK directly ("a feature module reaching
 * around the port could bypass the cache, the audit hook, or the fail-safe
 * default", doc 34 §3). This scaffold stub does not implement the Redis
 * cache/staleness layer of doc 34 §3/§12 — real evaluation logic (cache
 * lookup, `/decide` call, stale-while-revalidate, fail-safe default) lands
 * when `apps/api`/`apps/worker` actually mount this service.
 *
 * Chosen stub behavior: `isEnabled` returns `false` unconditionally. This is
 * deliberately the same value doc 34 §12 mandates as every `ai-*` flag's
 * hardcoded fail-safe default ("when the flag system itself cannot be
 * reached, the platform runs the deterministic path") — so a caller wired
 * against this stub during scaffolding sees exactly the behavior it would
 * see in a real PostHog outage, never a false "flag is on."
 */
export class FeatureFlagService {
  private readonly client: PostHog;

  constructor(apiKey: string, host?: string) {
    this.client = new PostHog(apiKey, host ? { host } : undefined);
  }

  /**
   * Stub: always resolves `false` (fail-safe default, doc 34 §12). Replace
   * with the real cache → `/decide` → fail-safe pipeline (doc 34 §3) when
   * this package is wired up.
   */
  async isEnabled(_flagKey: FlagKey, _context: FlagContext): Promise<boolean> {
    return false;
  }

  /** Stub — experiment/rollout payloads are not yet implemented (doc 34 §3). */
  async getPayload<T>(_flagKey: FlagKey, _context: FlagContext): Promise<T | null> {
    return null;
  }

  /** Stub — experiment variant resolution is not yet implemented (doc 34 §3, §8). */
  async getVariant(_flagKey: FlagKey, _context: FlagContext): Promise<string | null> {
    return null;
  }

  /** Flushes and closes the underlying PostHog client (call on process shutdown). */
  async shutdown(): Promise<void> {
    await this.client.shutdown();
  }
}

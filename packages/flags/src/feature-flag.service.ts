import { PostHog } from 'posthog-node';

import type { FlagKey } from './registry';

export interface FlagContext {
  organizationId?: string;
  eventId?: string;
  eventExhibitorId?: string;
  userId?: string;
}

/** PostHog-backed feature flag port with deterministic outage defaults. */
export class FeatureFlagService {
  private readonly client: PostHog;

  constructor(apiKey: string, host?: string) {
    this.client = new PostHog(apiKey, host ? { host } : undefined);
  }

  async isEnabled(flagKey: FlagKey, context: FlagContext): Promise<boolean> {
    const evaluation = this.evaluation(context);
    if (!evaluation) return false;
    try {
      return (await this.client.isFeatureEnabled(flagKey, evaluation.distinctId, {
        groups: evaluation.groups,
      })) === true;
    } catch {
      return false;
    }
  }

  async getPayload<T>(flagKey: FlagKey, context: FlagContext): Promise<T | null> {
    const evaluation = this.evaluation(context);
    if (!evaluation) return null;
    try {
      const value = await this.client.getFeatureFlag(flagKey, evaluation.distinctId, {
        groups: evaluation.groups,
      });
      const payload = await this.client.getFeatureFlagPayload(
        flagKey,
        evaluation.distinctId,
        value,
        { groups: evaluation.groups },
      );
      return payload === undefined ? null : payload as T;
    } catch {
      return null;
    }
  }

  async getVariant(flagKey: FlagKey, context: FlagContext): Promise<string | null> {
    const evaluation = this.evaluation(context);
    if (!evaluation) return null;
    try {
      const value = await this.client.getFeatureFlag(flagKey, evaluation.distinctId, {
        groups: evaluation.groups,
      });
      return typeof value === 'string' ? value : null;
    } catch {
      return null;
    }
  }

  async shutdown(): Promise<void> {
    await this.client.shutdown();
  }

  private evaluation(context: FlagContext): {
    distinctId: string;
    groups: Record<string, string>;
  } | null {
    const distinctId = context.userId ?? context.eventExhibitorId ?? context.eventId ?? context.organizationId;
    if (!distinctId) return null;
    const groups: Record<string, string> = {};
    if (context.organizationId) groups.organization = context.organizationId;
    if (context.eventId) groups.event = context.eventId;
    if (context.eventExhibitorId) groups.event_exhibitor = context.eventExhibitorId;
    return { distinctId, groups };
  }
}

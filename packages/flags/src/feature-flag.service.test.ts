import { beforeEach, describe, expect, it, vi } from 'vitest';

const client = {
  getFeatureFlag: vi.fn(),
  getFeatureFlagPayload: vi.fn(),
  isFeatureEnabled: vi.fn(),
  shutdown: vi.fn(),
};

vi.mock('posthog-node', () => ({ PostHog: vi.fn(() => client) }));

import { FeatureFlagService } from './feature-flag.service';

describe('FeatureFlagService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('evaluates flags using event and organization groups', async () => {
    client.isFeatureEnabled.mockResolvedValue(true);
    const service = new FeatureFlagService('project-key');

    await expect(service.isEnabled('ai-expo-copilot', {
      organizationId: 'org-id',
      eventId: 'event-id',
    })).resolves.toBe(true);
    expect(client.isFeatureEnabled).toHaveBeenCalledWith('ai-expo-copilot', 'event-id', {
      groups: { organization: 'org-id', event: 'event-id' },
    });
  });

  it('returns the safe default when PostHog is unavailable', async () => {
    client.isFeatureEnabled.mockRejectedValue(new Error('network'));
    const service = new FeatureFlagService('project-key');

    await expect(service.isEnabled('ai-expo-copilot', { eventId: 'event-id' })).resolves.toBe(false);
  });
});

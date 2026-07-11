/**
 * AiBudgetService — public port for pre-flight budget checks and usage
 * metering (docs/21-ai-architecture.md §1, §6).
 *
 * Real-time enforcement counters live in Redis (per-event and per-tenant
 * token buckets); usage records are buffered in-process and flushed to
 * `ai_usage_events` (doc 21 §6.1). Not implemented until Milestone 3.
 */

export interface AiBudgetScope {
  organizationId: string;
  eventId?: string;
  eventExhibitorId?: string;
  registrationId?: string;
}

export type AiFeature =
  | "expo_copilot"
  | "smart_matchmaking"
  | "lead_intelligence"
  | "followup_studio"
  | "organizer_pulse"
  | "guardrails";

export interface BudgetReservation {
  allowed: boolean;
  reservationId?: string;
  reason?: string;
}

export interface AiUsageRecord {
  organizationId: string;
  eventId?: string;
  feature: AiFeature;
  model: string;
  promptId: string;
  tokensIn: number;
  tokensOut: number;
  tokensCached: number;
  costCents: number;
  latencyMs: number;
}

export class AiBudgetService {
  async checkAndReserve(
    scope: AiBudgetScope,
    feature: AiFeature,
  ): Promise<BudgetReservation> {
    throw new Error("not implemented -- Milestone 3");
  }

  async record(usage: AiUsageRecord): Promise<void> {
    throw new Error("not implemented -- Milestone 3");
  }
}

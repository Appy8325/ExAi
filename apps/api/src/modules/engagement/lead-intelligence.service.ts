import { Inject, Injectable } from "@nestjs/common";
import { AiGenerationService, AiGuardrailService } from "@concourse/ai";
import { setRlsContext } from "@concourse/database";
import { sql } from "drizzle-orm";

import {
  DATABASE_CLIENT,
  type DatabaseClient,
} from "../../common/database-client";

type IntelligenceOutput = {
  buyingIntent: "high" | "evaluating" | "browsing" | "not_relevant";
  summary: string;
  topicsDiscussed: string[];
  followUpRecommendation: string;
  suggestedEmail: string;
  confidence: number;
};
type Evidence = { id: string; key: string; label: string; type: string; value: unknown };

@Injectable()
export class LeadIntelligenceService {
  constructor(
    @Inject(DATABASE_CLIENT) private readonly database: DatabaseClient,
    private readonly generation: AiGenerationService,
    private readonly guardrails: AiGuardrailService,
  ) {}

  async enrich(input: {
    submissionId: string;
    organizationId: string;
    actorUserId: string;
    eventId: string;
    eventExhibitorId: string;
  }) {
    const rows = await this.database.transaction(async (tx) => {
      await setRlsContext(tx, input.organizationId, input.actorUserId);
      const claimed = await tx.execute(sql`
        INSERT INTO lead_intelligence(lead_submission_id,event_exhibitor_id,status)
        VALUES (${input.submissionId},${input.eventExhibitorId},'processing')
        ON CONFLICT (lead_submission_id) DO NOTHING RETURNING id
      `);
      if (!claimed.length) return null;
      return tx.execute(sql<Evidence>`
        SELECT value.id, value.field_snapshot->>'key' AS key, value.field_snapshot->>'label' AS label,
          value.field_snapshot->>'type' AS type, value.value
        FROM lead_submission_values value
        WHERE value.lead_submission_id=${input.submissionId}
        ORDER BY value.created_at, value.id
      `);
    });
    if (!rows) return;
    const evidence = rows as unknown as Evidence[];

    try {
      const safeEvidence = evidence
        .filter((item) => !["email", "phone"].includes(item.type) && !/email|phone|name|linkedin/i.test(item.key))
        .map((item) => ({ id: item.id, label: item.label, value: item.value }));
      const result = await this.generation.generate({
        promptId: "lead.intelligence.v1",
        organizationId: input.organizationId,
        eventId: input.eventId,
        input: {
          instruction:
            "Analyze only the supplied lead-form evidence. Return only JSON with buyingIntent (high|evaluating|browsing|not_relevant), summary, topicsDiscussed (string array), followUpRecommendation, suggestedEmail, and confidence (integer 0-100). Do not invent facts. The suggested email must be a draft for human review and must not include unsupported claims.",
          evidence: safeEvidence,
        },
      });
      const output = parseOutput(result.text);
      const verdict = await this.guardrails.screenOutput({
        organizationId: input.organizationId,
        eventId: input.eventId,
        text: [
          output.summary,
          output.followUpRecommendation,
          output.suggestedEmail,
        ].join("\n"),
      });
      if (!verdict.allowed)
        throw new Error("AI output failed safety validation");
      const score = deterministicScore(output.buyingIntent, evidence);
      await this.update(
        input,
        sql`
        status='complete', lead_score=${score}, buying_intent=${output.buyingIntent},
        summary=${output.summary}, topics_discussed=${JSON.stringify(output.topicsDiscussed)}::jsonb,
        follow_up_recommendation=${output.followUpRecommendation}, suggested_email=${output.suggestedEmail},
        evidence_ids=${JSON.stringify(evidence.map((item) => item.id))}::jsonb,
        confidence=${output.confidence}, model=${process.env.NVIDIA_CHAT_MODEL ?? "unknown"},
        error_message=NULL, completed_at=now(), updated_at=now()
      `,
      );
    } catch (error) {
      await this.update(
        input,
        sql`status='failed', error_message=${error instanceof Error ? error.message.slice(0, 1000) : "Unknown AI error"}, updated_at=now()`,
      );
    }
  }

  private async update(
    input: {
      submissionId: string;
      organizationId: string;
      actorUserId: string;
    },
    values: ReturnType<typeof sql>,
  ) {
    await this.database.transaction(async (tx) => {
      await setRlsContext(tx, input.organizationId, input.actorUserId);
      await tx.execute(
        sql`UPDATE lead_intelligence SET ${values} WHERE lead_submission_id=${input.submissionId}`,
      );
    });
  }
}

function parseOutput(text: string): IntelligenceOutput {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("NVIDIA returned invalid lead intelligence JSON");
  const value = JSON.parse(match[0]) as Partial<IntelligenceOutput>;
  const intents = new Set(["high", "evaluating", "browsing", "not_relevant"]);
  if (
    !value.buyingIntent ||
    !intents.has(value.buyingIntent) ||
    !value.summary?.trim() ||
    !Array.isArray(value.topicsDiscussed) ||
    !value.followUpRecommendation?.trim() ||
    !value.suggestedEmail?.trim() ||
    !Number.isInteger(value.confidence)
  )
    throw new Error("NVIDIA returned incomplete lead intelligence");
  return {
    ...value,
    confidence: Math.max(0, Math.min(100, value.confidence!)),
    topicsDiscussed: value.topicsDiscussed
      .filter((topic): topic is string => typeof topic === "string")
      .slice(0, 10),
  } as IntelligenceOutput;
}

function deterministicScore(
  intent: IntelligenceOutput["buyingIntent"],
  evidence: Array<{ value: unknown }>,
) {
  const answered = evidence.filter(
    (item) =>
      item.value !== null && item.value !== undefined && item.value !== "",
  ).length;
  return Math.min(
    100,
    25 +
      Math.min(25, answered * 5) +
      { high: 50, evaluating: 35, browsing: 15, not_relevant: 0 }[intent],
  );
}

export const leadIntelligenceInternals = { parseOutput, deterministicScore };

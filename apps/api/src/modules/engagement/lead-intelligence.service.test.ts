import { describe, expect, it, vi } from "vitest";
vi.mock("@concourse/database", () => ({ setRlsContext: vi.fn() }));
import { leadIntelligenceInternals } from "./lead-intelligence.service";

describe("lead intelligence", () => {
  it("parses bounded structured NVIDIA output and scores deterministically", () => {
    const output = leadIntelligenceInternals.parseOutput(
      '```json\n{"buyingIntent":"high","summary":"Ready to evaluate.","topicsDiscussed":["Cloud"],"followUpRecommendation":"Book a demo.","suggestedEmail":"Thanks for visiting.","confidence":110}\n```',
    );
    expect(output.confidence).toBe(100);
    expect(
      leadIntelligenceInternals.deterministicScore(output.buyingIntent, [
        { value: "a" },
        { value: "b" },
      ]),
    ).toBe(85);
  });
});

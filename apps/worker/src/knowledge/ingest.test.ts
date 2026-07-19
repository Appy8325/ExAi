import { describe, expect, it } from "vitest";
import { chunkText, robotsAllows } from "./ingest";

describe("chunkText", () => {
  it("preserves overlap without producing empty chunks", () => {
    const chunks = chunkText("A".repeat(1_000) + "\n" + "B".repeat(1_000), 1_200, 100);
    expect(chunks).toHaveLength(2);
    expect(chunks.every(Boolean)).toBe(true);
    expect(chunks[1]?.startsWith("A".repeat(99))).toBe(true);
  });
});

describe("robotsAllows", () => {
  it("uses the most specific applicable rule", () => {
    const robots = "User-agent: *\nDisallow: /private\nAllow: /private/catalog";
    expect(robotsAllows(robots, "/private/pricing")).toBe(false);
    expect(robotsAllows(robots, "/private/catalog/widget")).toBe(true);
  });

  it("prefers rules for the ExAi crawler", () => {
    const robots = "User-agent: *\nDisallow: /\n\nUser-agent: ExAiKnowledgeBot\nAllow: /public";
    expect(robotsAllows(robots, "/public/faq")).toBe(true);
  });
});

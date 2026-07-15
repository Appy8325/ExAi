import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("database migration journal", () => {
  it("tracks the dashboard, enrichment, and public enrollment migrations", () => {
    const journalPath = resolve(__dirname, "../migrations/meta/_journal.json");
    const journal = JSON.parse(readFileSync(journalPath, "utf8")) as {
      entries: Array<{ tag?: string }>;
    };

    const tags = journal.entries.map((entry) => entry.tag).filter(Boolean);

    expect(tags).toEqual(
      expect.arrayContaining([
        "0011_relationship_workspace",
      ]),
    );
  });
});

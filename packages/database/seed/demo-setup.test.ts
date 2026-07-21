import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("demo setup", () => {
  it("defines the complete local reset sequence", async () => {
    const source = await readFile(
      resolve(process.cwd(), "../../scripts/demo-reset.ts"),
      "utf8",
    );
    expect(source).toContain(
      'execFileSync("supabase", ["db", "reset", "--local"]',
    );
    expect(source).toContain('run(["db:migrate"])');
    expect(source).toContain('run(["db:seed:demo"])');
  });

  it("loads seed data from deterministic JSON and creates the required TechExpo entities", async () => {
    const source = await readFile(
      resolve(process.cwd(), "seed/demo.ts"),
      "utf8",
    );
    expect(source).toContain("readFile(seedPath, \"utf8\")");
    expect(source).toContain("JSON.parse(seedJson)");
    expect(source).toContain("for (const exhibitor of seed.exhibitors)");
    expect(source).toContain("for (const a of seed.attendees)");
  });
});

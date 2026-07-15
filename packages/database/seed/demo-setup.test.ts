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

  it("ships a deterministic seed with the required TechExpo scale", async () => {
    const source = await readFile(
      resolve(process.cwd(), "seed/demo.ts"),
      "utf8",
    );
    expect(source).toContain("for (let index = 0; index < 200; index += 1)");
    expect(source).toContain("for (let index = 0; index < 100; index += 1)");
    expect(source).toContain("TechExpo 2027");
  });
});

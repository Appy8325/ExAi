import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { generateDemoQrCodes } from "./demo-qr";

const folders: string[] = [];

afterEach(async () => {
  await Promise.all(
    folders
      .splice(0)
      .map((folder) => rm(folder, { force: true, recursive: true })),
  );
});

describe("demo QR generation", () => {
  it("writes deterministic booth assets and a manifest", async () => {
    const root = await mkdtemp(join(tmpdir(), "exai-demo-"));
    folders.push(root);
    await generateDemoQrCodes(
      [
        {
          id: "booth-1",
          publicToken: "public-token-1",
          name: "Northstar Cloud",
          number: "A-101",
          organizationId: "org-1",
        },
      ],
      root,
    );

    await expect(
      readFile(join(root, "demo", "qr", "booth-a-101.png")),
    ).resolves.toBeInstanceOf(Buffer);
    await expect(
      readFile(join(root, "demo", "qr", "manifest.json"), "utf8"),
    ).resolves.toContain('"id": "booth-1"');
    await expect(
      readFile(join(root, "demo", "qr", "manifest.json"), "utf8"),
    ).resolves.toContain('"publicToken": "public-token-1"');
  }, 15_000);
});

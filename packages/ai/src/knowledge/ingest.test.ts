import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import type * as UploadSecurityModule from "./upload-security";

let module: typeof UploadSecurityModule;

beforeAll(async () => {
  process.env.API_DATABASE_URL = "postgresql://localhost/exai-test";
  module = await import("./upload-security");
});

afterAll(() => delete process.env.API_DATABASE_URL);

afterEach(() => {
  delete process.env.MVP_VERCEL_MODE;
  delete process.env.VERCEL;
});

describe("knowledge upload security", () => {
  it("requires matching size, MIME, extension, and signature", () => {
    expect(() => module.validateKnowledgeUpload({ sourceType: "pdf", filename: "guide.exe",
      contentType: "application/pdf", byteSize: 100 })).toThrow("extension");
    expect(() => module.validateKnowledgeUpload({ sourceType: "pdf", filename: "guide.pdf",
      contentType: "application/pdf", byteSize: 25 * 1024 * 1024 + 1 })).toThrow("25 MB");
    expect(() => module.validateFileSignature(Buffer.from("not a pdf"), "application/pdf")).toThrow("signature");
    expect(() => module.validateFileSignature(Buffer.from("%PDF-1.7"), "application/pdf")).not.toThrow();
  });

  it("uses the waiver only in explicitly enabled MVP mode", () => {
    expect(module.malwareScanner()).toBeInstanceOf(module.ClamAvMalwareScanner);
    process.env.MVP_VERCEL_MODE = "true";
    expect(module.malwareScanner()).toBeInstanceOf(module.MvpWaivedMalwareScanner);
  });
});

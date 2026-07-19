import { connect } from "node:net";
import { unzipSync } from "fflate";

export const MAX_KNOWLEDGE_UPLOAD_BYTES = 25 * 1024 * 1024;

const UPLOAD_TYPES: Record<string, Readonly<Record<string, readonly string[]>>> = {
  pdf: { "application/pdf": [".pdf"] },
  brochure: { "application/pdf": [".pdf"] },
  presentation: {
    "application/pdf": [".pdf"],
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"],
  },
  faq: { "application/pdf": [".pdf"], "text/plain": [".txt"] },
  pricing: { "application/pdf": [".pdf"], "text/plain": [".txt"] },
};

export function validateKnowledgeUpload(input: {
  sourceType: string; filename: string; contentType: string; byteSize: number;
}) {
  if (!Number.isInteger(input.byteSize) || input.byteSize <= 0 ||
      input.byteSize > MAX_KNOWLEDGE_UPLOAD_BYTES) {
    throw new Error("File size must be between 1 byte and 25 MB.");
  }
  const extensions = UPLOAD_TYPES[input.sourceType]?.[input.contentType];
  if (!extensions) throw new Error("File type is not supported for this source.");
  const filename = input.filename.toLowerCase();
  if (!extensions.some((extension) => filename.endsWith(extension))) {
    throw new Error("File extension does not match the selected source and MIME type.");
  }
}

export function validateFileSignature(bytes: Buffer, contentType: string) {
  if (contentType === "application/pdf" && !bytes.subarray(0, 5).equals(Buffer.from("%PDF-")))
    throw new Error("File signature does not match PDF.");
  if (contentType === "application/vnd.openxmlformats-officedocument.presentationml.presentation") {
    if (!bytes.subarray(0, 4).equals(Buffer.from([0x50, 0x4b, 0x03, 0x04])))
      throw new Error("File signature does not match PPTX.");
    const archive = unzipSync(new Uint8Array(bytes));
    if (!archive["[Content_Types].xml"] || !Object.keys(archive).some((name) => name.startsWith("ppt/")))
      throw new Error("File signature does not match PPTX.");
  }
  if (contentType === "text/plain") {
    if (bytes.includes(0)) throw new Error("Text upload contains binary data.");
    new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  }
}

export interface MalwareScanner {
  scan(bytes: Buffer): Promise<void>;
}

export class ClamAvMalwareScanner implements MalwareScanner {
  async scan(bytes: Buffer) {
    const host = process.env.WORKER_CLAMAV_HOST;
    if (!host) throw new Error("WORKER_CLAMAV_HOST is required for uploaded documents.");
    const port = Number(process.env.WORKER_CLAMAV_PORT ?? 3310);
    const verdict = await new Promise<string>((resolve, reject) => {
      const socket = connect({ host, port });
      let response = "";
      socket.setTimeout(60_000, () => socket.destroy(new Error("ClamAV scan timed out.")));
      socket.on("error", reject);
      socket.on("data", (data) => { response += data.toString(); });
      socket.on("close", () => resolve(response.replace(/\0/g, "").trim()));
      socket.on("connect", () => {
        socket.write("zINSTREAM\0");
        for (let offset = 0; offset < bytes.length; offset += 64 * 1024) {
          const chunk = bytes.subarray(offset, offset + 64 * 1024);
          const length = Buffer.alloc(4); length.writeUInt32BE(chunk.length);
          socket.write(length); socket.write(chunk);
        }
        socket.end(Buffer.alloc(4));
      });
    });
    if (verdict.endsWith(" OK")) return;
    if (verdict.includes(" FOUND"))
      throw new Error(`Malware detected: ${verdict.split(":").pop()?.trim()}`);
    throw new Error(`ClamAV scan failed: ${verdict || "no verdict"}`);
  }
}

export class MvpWaivedMalwareScanner implements MalwareScanner {
  async scan() {
    // TODO(security): demonstration/pilot waiver only; restore ClamAV before public production release.
  }
}

export function malwareScanner(): MalwareScanner {
  if (process.env.MVP_VERCEL_MODE !== "true") return new ClamAvMalwareScanner();
  if (process.env.NODE_ENV === "production" && process.env.VERCEL !== "1")
    throw new Error("MVP_VERCEL_MODE may only bypass malware scanning on Vercel.");
  return new MvpWaivedMalwareScanner();
}

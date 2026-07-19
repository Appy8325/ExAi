import { createHash } from "node:crypto";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { connect } from "node:net";

import { AiEmbeddingService, AiGuardrailService } from "@concourse/ai";
import { db } from "@concourse/database";
import { sql } from "drizzle-orm";
import { unzipSync } from "fflate";
import { PDFParse } from "pdf-parse";

type Source = {
  id: string; event_id: string; organizer_organization_id: string;
  owner_organization_id: string; title: string;
  kind: "uploaded_document" | "external_url"; source_url: string | null;
  file_id: string | null; storage_key: string | null; content_type: string | null;
};

export async function pendingSourceIds() {
  return (await db.execute(sql<{ id: string }>`
    SELECT id FROM kb_sources WHERE status = 'pending' ORDER BY created_at LIMIT 100
  `)) as unknown as Array<{ id: string }>;
}

export async function ingestSource(sourceId: string) {
  const claimed = (await db.execute(sql<{ id: string }>`
    UPDATE kb_sources SET status = 'processing', attempt_count = attempt_count + 1,
      processing_started_at = now(), error_message = NULL, updated_at = now()
    WHERE id = ${sourceId} AND status IN ('pending','failed') AND attempt_count < 3
    RETURNING id
  `)) as unknown as Array<{ id: string }>;
  if (!claimed[0]) return;

  let source: Source | undefined;
  try {
    const current = await loadSource(sourceId);
    source = current;
    const extracted = await extractSource(current);
    const normalized = normalizeText(extracted.text);
    if (normalized.length < 40) throw new Error("The source contains too little extractable text.");
    const chunks = chunkText(normalized);
    const contentHash = createHash("sha256").update(extracted.hashInput).digest("hex");
    const screen = await new AiGuardrailService().screenDocument({
      organizationId: current.owner_organization_id,
      eventId: current.event_id,
      documentId: current.id,
      text: normalized,
    });
    if (screen.flagged) {
      await quarantineDocument(current, normalized, contentHash, screen.reasons ?? []);
      return;
    }
    const embeddings = await new AiEmbeddingService().embedDocuments(chunks);

    await db.transaction(async (tx) => {
      await tx.execute(sql`DELETE FROM kb_documents WHERE kb_source_id = ${current.id}`);
      const documents = (await tx.execute(sql<{ id: string }>`
        INSERT INTO kb_documents (kb_source_id, event_id, organizer_organization_id,
          owner_organization_id, title, raw_text, status, indexed_at)
        VALUES (${current.id}, ${current.event_id}, ${current.organizer_organization_id},
          ${current.owner_organization_id}, ${current.title}, ${normalized}, 'indexed', now())
        RETURNING id
      `)) as unknown as Array<{ id: string }>;
      const documentId = documents[0]?.id;
      if (!documentId) throw new Error("Document insert returned no id.");
      for (let index = 0; index < chunks.length; index += 1) {
        const embedding = embeddings[index];
        if (!embedding) throw new Error("Embedding count does not match chunk count.");
        const vector = `[${embedding.values.join(",")}]`;
        await tx.execute(sql`
          INSERT INTO kb_chunks (kb_document_id, event_id, organizer_organization_id,
            owner_organization_id, chunk_index, content, embedding, token_count, visibility, metadata)
          VALUES (${documentId}, ${current.event_id}, ${current.organizer_organization_id},
            ${current.owner_organization_id}, ${index}, ${chunks[index]!}, ${vector}::vector,
            ${Math.ceil(chunks[index]!.length / 4)}, 'public', ${JSON.stringify(extracted.metadata)}::jsonb)
        `);
      }
      if (current.file_id) {
        await tx.execute(sql`UPDATE files SET status = 'clean', checksum_sha256 = ${contentHash},
          updated_at = now() WHERE id = ${current.file_id}`);
      }
      await tx.execute(sql`UPDATE kb_sources SET status = 'indexed', content_hash = ${contentHash},
        last_ingested_at = now(), processing_started_at = NULL, error_message = NULL,
        updated_at = now() WHERE id = ${current.id}`);
    });
  } catch (cause) {
    const message = cause instanceof Error ? cause.message.slice(0, 1_000) : "Knowledge ingestion failed.";
    const malware = message.startsWith("Malware detected:");
    if (malware && source?.file_id) {
      await db.execute(sql`UPDATE files SET status = 'infected', updated_at = now() WHERE id = ${source.file_id}`);
    }
    await db.execute(sql`UPDATE kb_sources SET status = ${malware ? "quarantined" : "failed"}, error_message = ${message},
      processing_started_at = NULL, updated_at = now() WHERE id = ${sourceId}`);
    throw cause;
  }
}

async function quarantineDocument(source: Source, text: string, contentHash: string, reasons: string[]) {
  const reason = reasons.join(", ") || "content_policy";
  await db.transaction(async (tx) => {
    await tx.execute(sql`DELETE FROM kb_documents WHERE kb_source_id = ${source.id}`);
    await tx.execute(sql`INSERT INTO kb_documents (kb_source_id, event_id,
      organizer_organization_id, owner_organization_id, title, raw_text, status, quarantine_reason)
      VALUES (${source.id}, ${source.event_id}, ${source.organizer_organization_id},
        ${source.owner_organization_id}, ${source.title}, ${text}, 'quarantined', ${reason})`);
    if (source.file_id) await tx.execute(sql`UPDATE files SET status = 'clean',
      checksum_sha256 = ${contentHash}, updated_at = now() WHERE id = ${source.file_id}`);
    await tx.execute(sql`UPDATE kb_sources SET status = 'quarantined', content_hash = ${contentHash},
      error_message = ${reason}, processing_started_at = NULL, updated_at = now() WHERE id = ${source.id}`);
  });
}

async function loadSource(sourceId: string) {
  const rows = (await db.execute(sql<Source>`
    SELECT source.id, source.event_id, source.organizer_organization_id,
      source.owner_organization_id, source.title, source.kind, source.source_url,
      source.file_id, file.storage_key, file.content_type
    FROM kb_sources source LEFT JOIN files file ON file.id = source.file_id
    WHERE source.id = ${sourceId}
  `)) as unknown as Source[];
  if (!rows[0]) throw new Error("Knowledge source no longer exists.");
  return rows[0];
}

async function extractSource(source: Source) {
  if (source.kind === "external_url") {
    if (!source.source_url) throw new Error("Website source URL is missing.");
    const html = await fetchPublicHtml(source.source_url);
    return { text: htmlToText(html), hashInput: html,
      metadata: { url: source.source_url, scrapedAt: new Date().toISOString() } };
  }
  if (!source.storage_key || !source.content_type) throw new Error("Uploaded file metadata is missing.");
  const bytes = await downloadObject(source.storage_key);
  await scanWithClamAv(bytes);
  return { text: await extractFileText(bytes, source.content_type), hashInput: bytes,
    metadata: { fileId: source.file_id } };
}

async function downloadObject(path: string) {
  const url = process.env.WORKER_SUPABASE_URL;
  const key = process.env.WORKER_SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Worker Supabase storage configuration is missing.");
  const encodedPath = path.split("/").map(encodeURIComponent).join("/");
  const response = await fetch(`${url.replace(/\/+$/, "")}/storage/v1/object/authenticated/uploads/${encodedPath}`, {
    headers: { Authorization: `Bearer ${key}`, apikey: key }, signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) throw new Error(`Stored file download failed (${response.status}).`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length > 25 * 1024 * 1024) throw new Error("Stored file exceeds the 25 MB ingestion limit.");
  return bytes;
}

async function extractFileText(bytes: Buffer, contentType: string) {
  if (contentType === "application/pdf") {
    if (!bytes.subarray(0, 5).equals(Buffer.from("%PDF-"))) throw new Error("File signature does not match PDF.");
    const parser = new PDFParse({ data: new Uint8Array(bytes) });
    try { return (await parser.getText()).text; } finally { await parser.destroy(); }
  }
  if (contentType === "application/vnd.openxmlformats-officedocument.presentationml.presentation") {
    if (bytes[0] !== 0x50 || bytes[1] !== 0x4b) throw new Error("File signature does not match PPTX.");
    return Object.entries(unzipSync(new Uint8Array(bytes)))
      .filter(([name]) => /^ppt\/slides\/slide\d+\.xml$/.test(name))
      .sort(([left], [right]) => left.localeCompare(right, undefined, { numeric: true }))
      .map(([, value]) => decodeEntities(new TextDecoder().decode(value).replace(/<[^>]+>/g, " ")))
      .join("\n\n");
  }
  if (contentType === "text/plain") {
    if (bytes.includes(0)) throw new Error("Text upload contains binary data.");
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  }
  throw new Error(`Extraction is not supported for ${contentType}.`);
}

export function chunkText(text: string, maxCharacters = 1_600, overlap = 200) {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    let end = Math.min(start + maxCharacters, text.length);
    if (end < text.length) {
      const boundary = text.lastIndexOf("\n", end);
      if (boundary > start + maxCharacters / 2) end = boundary;
    }
    const chunk = text.slice(start, end).trim();
    if (chunk) chunks.push(chunk);
    if (end >= text.length) break;
    start = Math.max(start + 1, end - overlap);
  }
  return chunks;
}

function normalizeText(value: string) {
  return value.normalize("NFC").replace(/\r/g, "").replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n").trim();
}

async function fetchPublicHtml(input: string) {
  let url = new URL(input);
  await assertRobotsAllowed(url);
  for (let redirects = 0; redirects <= 3; redirects += 1) {
    await assertPublicUrl(url);
    const response = await fetch(url, { redirect: "manual", headers: { "User-Agent": "ExAiKnowledgeBot/1.0" },
      signal: AbortSignal.timeout(10_000) });
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location || redirects === 3) throw new Error("Website redirect limit exceeded.");
      url = new URL(location, url); continue;
    }
    if (!response.ok) throw new Error(`Website fetch failed (${response.status}).`);
    if (!response.headers.get("content-type")?.toLowerCase().includes("text/html"))
      throw new Error("Website source did not return HTML.");
    if (Number(response.headers.get("content-length") ?? 0) > 5 * 1024 * 1024)
      throw new Error("Website response exceeds 5 MB.");
    const html = await response.text();
    if (Buffer.byteLength(html) > 5 * 1024 * 1024) throw new Error("Website response exceeds 5 MB.");
    return html;
  }
  throw new Error("Website fetch failed.");
}

async function assertRobotsAllowed(pageUrl: URL) {
  let robotsUrl = new URL("/robots.txt", pageUrl);
  for (let redirects = 0; redirects <= 2; redirects += 1) {
    await assertPublicUrl(robotsUrl);
    const response = await fetch(robotsUrl, {
      redirect: "manual",
      headers: { "User-Agent": "ExAiKnowledgeBot/1.0" },
      signal: AbortSignal.timeout(10_000),
    });
    if (response.status === 404 || response.status === 410) return;
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location || redirects === 2) throw new Error("robots.txt redirect limit exceeded.");
      robotsUrl = new URL(location, robotsUrl);
      continue;
    }
    if (!response.ok) throw new Error(`robots.txt fetch failed (${response.status}).`);
    const text = await response.text();
    if (!robotsAllows(text, pageUrl.pathname || "/")) {
      throw new Error("Website source is blocked by robots.txt.");
    }
    return;
  }
}

export function robotsAllows(text: string, path: string) {
  const groups: Array<{ agents: string[]; rules: Array<{ allow: boolean; path: string }> }> = [];
  let group = { agents: [] as string[], rules: [] as Array<{ allow: boolean; path: string }> };
  const flush = () => {
    if (group.agents.length) groups.push(group);
    group = { agents: [], rules: [] };
  };
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*$/, "").trim();
    if (!line) continue;
    const separator = line.indexOf(":");
    if (separator < 0) continue;
    const field = line.slice(0, separator).trim().toLowerCase();
    const value = line.slice(separator + 1).trim();
    if (field === "user-agent") {
      if (group.rules.length) flush();
      group.agents.push(value.toLowerCase());
    } else if ((field === "allow" || field === "disallow") && group.agents.length && value) {
      group.rules.push({ allow: field === "allow", path: value });
    }
  }
  flush();
  const exact = groups.filter(({ agents }) => agents.some((agent) => agent === "exaiknowledgebot"));
  const applicable = exact.length ? exact : groups.filter(({ agents }) => agents.includes("*"));
  const matches = applicable.flatMap(({ rules }) => rules).filter((rule) => path.startsWith(rule.path));
  matches.sort((left, right) => right.path.length - left.path.length || Number(right.allow) - Number(left.allow));
  return matches[0]?.allow ?? true;
}

async function assertPublicUrl(url: URL) {
  if (url.protocol !== "https:") throw new Error("Website source must use HTTPS.");
  const addresses = await lookup(url.hostname, { all: true, verbatim: true });
  if (!addresses.length || addresses.some(({ address }) => privateAddress(address)))
    throw new Error("Website source resolves to a private or reserved address.");
}

function privateAddress(address: string) {
  if (!isIP(address)) return true;
  return address === "::1" || address.startsWith("fc") || address.startsWith("fd") ||
    address.startsWith("fe80:") || /^10\./.test(address) || /^127\./.test(address) ||
    /^169\.254\./.test(address) || /^192\.168\./.test(address) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(address);
}

function htmlToText(html: string) {
  return decodeEntities(html.replace(/<(script|style|nav|footer|noscript)[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<br\s*\/?>|<\/p>|<\/h[1-6]>/gi, "\n").replace(/<[^>]+>/g, " "));
}

function decodeEntities(value: string) {
  return value.replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">").replace(/&quot;/gi, '"').replace(/&#39;/gi, "'");
}

async function scanWithClamAv(bytes: Buffer) {
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
  if (verdict.includes(" FOUND")) throw new Error(`Malware detected: ${verdict.split(":").pop()?.trim()}`);
  throw new Error(`ClamAV scan failed: ${verdict || "no verdict"}`);
}

import { randomBytes } from "node:crypto";
import { isIP } from "node:net";
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createClient } from "@supabase/supabase-js";
import QRCode from "qrcode";
import { validateKnowledgeUpload } from "@concourse/ai/knowledge/security";
import { TaskExecutor } from "../../common/task-executor";

import {
  ExhibitorWorkspaceRepository,
  type LeadFieldInput,
} from "./exhibitor-workspace.repository";

const SOURCE_TYPES = new Set([
  "pdf",
  "brochure",
  "presentation",
  "website",
  "faq",
  "pricing",
]);
const FIELD_TYPES = new Set([
  "text",
  "multiline_text",
  "email",
  "phone",
  "company",
  "job_title",
  "dropdown",
  "checkbox",
  "consent_checkbox",
]);
@Injectable()
export class ExhibitorWorkspaceService {
  constructor(
    private readonly repository: ExhibitorWorkspaceRepository,
    private readonly config: ConfigService,
    private readonly taskExecutor: TaskExecutor,
  ) {}

  async overview(userId: string) {
    return (await this.repository.overview(userId)).map((row) => ({
      organizationId: row.organization_id,
      organizationName: row.organization_name,
      eventExhibitorId: row.event_exhibitor_id,
      eventName: row.event_name,
      boothName: row.booth_name,
      status: row.status,
    }));
  }

  async find(
    organizationId: string,
    eventExhibitorId: string,
    actorUserId: string,
  ) {
    const workspace = await this.repository.find(
      organizationId,
      eventExhibitorId,
      actorUserId,
    );
    if (!workspace)
      throw new NotFoundException("Exhibitor workspace not found.");
    return {
      ...workspace,
      qr: workspace.qr
        ? await this.qrView(workspace.qr.publicToken, workspace.qr.createdAt)
        : null,
    };
  }

  async updateProfile(input: {
    organizationId: string;
    eventExhibitorId: string;
    actorUserId: string;
    companyName?: string;
    boothName?: string;
    boothNumber?: string | null;
    logoUrl?: string | null;
    bannerUrl?: string | null;
    primaryColor?: string;
    description?: string;
    website?: string;
    contactEmail?: string;
    contactPhone?: string | null;
  }) {
    const primaryColor = input.primaryColor?.trim() ?? "";
    if (!/^#[0-9a-fA-F]{6}$/.test(primaryColor)) {
      throw new BadRequestException(
        "Primary color must be a six-digit hex color.",
      );
    }
    const booth = await this.repository.updateProfile({
      organizationId: input.organizationId,
      eventExhibitorId: input.eventExhibitorId,
      actorUserId: input.actorUserId,
      companyName: requiredText(input.companyName, "Company name", 160),
      boothName: requiredText(input.boothName, "Booth name", 160),
      boothNumber: optionalText(input.boothNumber, 40),
      logoUrl: optionalUrl(input.logoUrl, "Logo URL"),
      bannerUrl: optionalUrl(input.bannerUrl, "Banner URL"),
      primaryColor: primaryColor.toLowerCase(),
      description: requiredText(input.description, "Booth description", 4_000),
      website: requiredUrl(input.website, "Website"),
      contactEmail: requiredEmail(input.contactEmail),
      contactPhone: optionalText(input.contactPhone, 80),
    });
    if (!booth) throw new NotFoundException("Exhibitor workspace not found.");
    return booth;
  }

  async createSource(input: {
    organizationId: string;
    eventExhibitorId: string;
    actorUserId: string;
    sourceType?: string;
    title?: string;
    sourceUrl?: string;
    filename?: string;
    contentType?: string;
    byteSize?: number;
  }) {
    const sourceType = input.sourceType?.trim().toLowerCase() ?? "";
    if (!SOURCE_TYPES.has(sourceType))
      throw new BadRequestException("Unsupported source type.");
    const title = requiredText(input.title, "Source title", 200);
    if (sourceType === "website") {
      const source = await this.repository.createWebsiteSource({
        organizationId: input.organizationId,
        eventExhibitorId: input.eventExhibitorId,
        actorUserId: input.actorUserId,
        title,
        sourceUrl: safeWebsiteUrl(input.sourceUrl),
      });
      if (!source)
        throw new NotFoundException("Exhibitor workspace not found.");
      await this.taskExecutor.execute({ type: "knowledge.ingest", sourceId: source.id });
      return { source, upload: null };
    }

    const filename = safeFilename(input.filename);
    const contentType = input.contentType?.trim().toLowerCase() ?? "";
    try {
      validateKnowledgeUpload({ sourceType, filename, contentType, byteSize: input.byteSize ?? 0 });
    } catch (cause) {
      throw new BadRequestException(cause instanceof Error ? cause.message : "Invalid upload.");
    }
    const created = await this.repository.createFileSource({
      organizationId: input.organizationId,
      eventExhibitorId: input.eventExhibitorId,
      actorUserId: input.actorUserId,
      sourceType,
      title,
      filename,
      contentType,
      byteSize: input.byteSize!,
    });
    if (!created?.source || !created.file)
      throw new NotFoundException("Exhibitor workspace not found.");
    const { data, error } = await this.storage()
      .storage.from("uploads")
      .createSignedUploadUrl(created.file.storageKey);
    if (error || !data?.signedUrl) {
      await this.repository.removeSource(
        input.organizationId,
        created.source.id,
        input.actorUserId,
      );
      throw new BadRequestException("Upload could not be prepared.");
    }
    return {
      source: created.source,
      upload: { url: data.signedUrl, path: created.file.storageKey },
    };
  }

  async completeSource(
    organizationId: string,
    eventExhibitorId: string,
    sourceId: string,
    actorUserId: string,
  ) {
    const source = await this.repository.findFileSource(
      organizationId,
      eventExhibitorId,
      sourceId,
      actorUserId,
    );
    if (!source) throw new NotFoundException("Uploaded source not found.");
    const separator = source.storageKey.lastIndexOf("/");
    const directory = source.storageKey.slice(0, separator);
    const filename = source.storageKey.slice(separator + 1);
    const { data, error } = await this.storage()
      .storage.from("uploads")
      .list(directory, { search: filename, limit: 10 });
    const object = data?.find((entry) => entry.name === filename);
    const metadata = object?.metadata as
      { size?: number; mimetype?: string } | undefined;
    if (error || !object || Number(metadata?.size) !== source.byteSize) {
      throw new BadRequestException(
        "Uploaded file is missing or has the wrong size.",
      );
    }
    if (
      metadata?.mimetype &&
      metadata.mimetype.toLowerCase() !== source.contentType
    ) {
      throw new BadRequestException(
        "Uploaded file content type does not match.",
      );
    }
    const completed = await this.repository.completeFileSource(
      organizationId,
      sourceId,
      source.fileId,
      actorUserId,
    );
    await this.taskExecutor.execute({ type: "knowledge.ingest", sourceId });
    return completed;
  }

  async removeSource(
    organizationId: string,
    eventExhibitorId: string,
    sourceId: string,
    actorUserId: string,
  ) {
    const file = await this.repository.findFileSource(
      organizationId,
      eventExhibitorId,
      sourceId,
      actorUserId,
    );
    if (file) {
      const { error } = await this.storage()
        .storage.from("uploads")
        .remove([file.storageKey]);
      if (error)
        throw new BadRequestException("Stored file could not be removed.");
    }
    const removed = await this.repository.removeSource(
      organizationId,
      sourceId,
      actorUserId,
    );
    if (!removed) throw new NotFoundException("Source not found.");
    return { removed: true };
  }

  async retrySource(
    organizationId: string,
    eventExhibitorId: string,
    sourceId: string,
    actorUserId: string,
  ) {
    const source = await this.repository.retrySource(
      organizationId,
      eventExhibitorId,
      sourceId,
      actorUserId,
    );
    if (!source) throw new NotFoundException("Failed source not found.");
    await this.taskExecutor.execute({ type: "knowledge.ingest", sourceId: source.id });
    return source;
  }

  async saveLeadForm(input: {
    organizationId: string;
    eventExhibitorId: string;
    actorUserId: string;
    name?: string;
    description?: string | null;
    consentText?: string;
    fields?: LeadFieldInput[];
  }) {
    const fields = input.fields ?? [];
    if (!fields.length || fields.length > 30)
      throw new BadRequestException("Lead form must contain 1-30 fields.");
    const keys = new Set<string>();
    const normalized = fields.map((field, index) => {
      const key = requiredText(field.key, "Field key", 64)
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, "_");
      if (keys.has(key))
        throw new BadRequestException("Lead form field keys must be unique.");
      keys.add(key);
      if (!FIELD_TYPES.has(field.type))
        throw new BadRequestException("Unsupported lead form field type.");
      return {
        key,
        label: requiredText(field.label, "Field label", 120),
        type: field.type,
        required: Boolean(field.required),
        placeholder: optionalText(field.placeholder, 160) ?? undefined,
        sortOrder: index,
      };
    });
    const form = await this.repository.saveLeadForm({
      organizationId: input.organizationId,
      eventExhibitorId: input.eventExhibitorId,
      actorUserId: input.actorUserId,
      name: requiredText(input.name, "Form name", 160),
      description: optionalText(input.description, 1_000),
      consentText: requiredText(input.consentText, "Consent text", 1_000),
      fields: normalized,
    });
    if (!form) throw new NotFoundException("Exhibitor workspace not found.");
    return form;
  }

  async publishLeadForm(
    organizationId: string,
    eventExhibitorId: string,
    actorUserId: string,
  ) {
    const result = await this.repository.publishLeadForm(
      organizationId,
      eventExhibitorId,
      actorUserId,
    );
    if (!result) throw new NotFoundException("Draft lead form not found.");
    if (!result.ready) {
      throw new BadRequestException(
        "Lead form requires consent text, an email field, and a consent checkbox.",
      );
    }
    return result.form;
  }

  async publishBooth(
    organizationId: string,
    eventExhibitorId: string,
    actorUserId: string,
  ) {
    const workspace = await this.repository.find(
      organizationId,
      eventExhibitorId,
      actorUserId,
    );
    if (!workspace)
      throw new NotFoundException("Exhibitor workspace not found.");
    if (
      !workspace.booth.description ||
      !workspace.booth.website ||
      !workspace.booth.contactEmail
    ) {
      throw new BadRequestException(
        "Complete the booth profile before publishing.",
      );
    }
    const result = await this.repository.publishBooth(
      organizationId,
      eventExhibitorId,
      actorUserId,
    );
    if (!result?.ready)
      throw new BadRequestException(
        "Publish the lead form before publishing the booth.",
      );
    return result.booth;
  }

  async generateQr(
    organizationId: string,
    eventExhibitorId: string,
    actorUserId: string,
  ) {
    const credential = await this.repository.qr(
      organizationId,
      eventExhibitorId,
      actorUserId,
      randomBytes(32).toString("base64url"),
    );
    if (!credential)
      throw new BadRequestException(
        "Publish the booth before generating its QR code.",
      );
    return this.qrView(
      credential.publicToken,
      credential.createdAt.toISOString(),
    );
  }

  private async qrView(publicToken: string, createdAt: string) {
    const origin = this.config.get<string>("supabase.publicWebOrigin");
    if (!origin) throw new Error("API_PUBLIC_WEB_ORIGIN is missing.");
    const publicUrl = `${origin.replace(/\/$/, "")}/visit/${encodeURIComponent(publicToken)}`;
    return {
      publicToken,
      publicUrl,
      imageDataUrl: await QRCode.toDataURL(publicUrl, {
        margin: 2,
        width: 320,
      }),
      createdAt,
    };
  }

  private storage() {
    const url = this.config.get<string>("supabase.url");
    const key = this.config.get<string>("supabase.serviceRoleKey");
    if (!url || !key) throw new Error("Supabase configuration is missing.");
    return createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
}

function requiredText(
  value: string | null | undefined,
  label: string,
  maxLength: number,
) {
  const normalized = value?.trim() ?? "";
  if (!normalized) throw new BadRequestException(`${label} is required.`);
  if (normalized.length > maxLength)
    throw new BadRequestException(`${label} is too long.`);
  return normalized;
}

function optionalText(value: string | null | undefined, maxLength: number) {
  const normalized = value?.trim() || null;
  if (normalized && normalized.length > maxLength)
    throw new BadRequestException("Value is too long.");
  return normalized;
}

function requiredEmail(value: string | undefined) {
  const email = value?.trim().toLowerCase() ?? "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw new BadRequestException("Contact email is invalid.");
  return email;
}

function requiredUrl(value: string | undefined, label: string) {
  const url = optionalUrl(value, label);
  if (!url) throw new BadRequestException(`${label} is required.`);
  return url;
}

function optionalUrl(value: string | null | undefined, label: string) {
  if (!value?.trim()) return null;
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:" && url.protocol !== "http:")
      throw new Error();
    return url.toString();
  } catch {
    throw new BadRequestException(`${label} must be an HTTP(S) URL.`);
  }
}

function safeWebsiteUrl(value: string | undefined) {
  let url: URL;
  try {
    url = new URL(value?.trim() ?? "");
  } catch {
    throw new BadRequestException("Website URL is invalid.");
  }
  const host = url.hostname.toLowerCase();
  if (
    url.protocol !== "https:" ||
    host === "localhost" ||
    host.endsWith(".localhost") ||
    privateAddress(host)
  ) {
    throw new BadRequestException(
      "Website URL must be a public HTTPS address.",
    );
  }
  return url.toString();
}

function privateAddress(host: string) {
  if (!isIP(host)) return false;
  return (
    host === "::1" ||
    host.startsWith("fc") ||
    host.startsWith("fd") ||
    host.startsWith("fe80:") ||
    /^10\./.test(host) ||
    /^127\./.test(host) ||
    /^169\.254\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(host)
  );
}

function safeFilename(value: string | undefined) {
  const normalized = value
    ?.normalize("NFKC")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[.-]+|[.-]+$/g, "")
    .slice(0, 120);
  return normalized || "file";
}

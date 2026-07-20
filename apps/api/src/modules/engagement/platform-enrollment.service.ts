import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  AiGenerationService,
  AiGuardrailService,
  RetrievalService,
} from "@concourse/ai";
import { createClient } from "@supabase/supabase-js";
import { sql } from "drizzle-orm";

import {
  DATABASE_CLIENT,
  type DatabaseClient,
} from "../../common/database-client";
import { SupabaseAuthService } from "../auth/supabase-auth.service";
import { LeadSubmissionsService } from "./lead-submissions.service";

type BoothScope = {
  id: string;
  event_id: string;
  organization_id: string;
  public_token: string;
};

@Injectable()
export class PlatformEnrollmentService {
  constructor(
    @Inject(DATABASE_CLIENT) private readonly database: DatabaseClient,
    private readonly auth: SupabaseAuthService,
    private readonly relationships: LeadSubmissionsService,
    private readonly config: ConfigService,
    private readonly generation: AiGenerationService,
    private readonly guardrails: AiGuardrailService,
    private readonly retrieval: RetrievalService,
  ) {}

  async findPublicBooth(publicQrToken: string) {
    const rows = await this.database.execute(sql<{
      id: string;
      company_name: string;
      booth_name: string;
      booth_number: string | null;
      logo_url: string | null;
      description: string | null;
      website: string | null;
      event_slug: string;
      privacy_policy_url: string | null;
    }>`
      SELECT booth.id, organization.name AS company_name, booth.booth_name,
        booth.booth_number, booth.logo_url, booth.description, booth.website,
        event.slug AS event_slug, event.privacy_policy_url
      FROM booth_qr_credentials credential
      JOIN event_exhibitors booth ON booth.id = credential.event_exhibitor_id
      JOIN organizations organization ON organization.id = booth.organization_id
      JOIN events event ON event.id = booth.event_id
      WHERE credential.public_token = ${publicQrToken} AND credential.active
        AND booth.status = 'ready' AND event.status IN ('published','live')
      LIMIT 1
    `);
    const booth = (
      rows as unknown as Array<{
        id: string;
        company_name: string;
        booth_name: string;
        booth_number: string | null;
        logo_url: string | null;
        description: string | null;
        website: string | null;
        event_slug: string;
        privacy_policy_url: string | null;
      }>
    )[0];
    if (!booth) throw new NotFoundException("Booth not found.");

    const [resourceRows, formRows] = await Promise.all([
      this.database.execute(sql<{
        id: string;
        title: string;
        source_type: string;
        source_url: string | null;
        file_id: string | null;
      }>`
        SELECT id, title, source_type, source_url, file_id
        FROM kb_sources
        WHERE event_exhibitor_id = ${booth.id} AND status = 'indexed'
        ORDER BY created_at DESC
      `),
      this.database.execute(sql<{
        name: string;
        description: string | null;
        consent_text: string | null;
        key: string | null;
        label: string | null;
        type: string | null;
        required: boolean | null;
        placeholder: string | null;
        help_text: string | null;
        validation: unknown;
      }>`
        SELECT form.name, form.description, form.consent_text, field.key, field.label,
          field.type, field.required, field.placeholder, field.help_text, field.validation
        FROM lead_forms form
        LEFT JOIN lead_form_fields field ON field.lead_form_id = form.id AND field.status = 'active'
        WHERE form.event_exhibitor_id = ${booth.id} AND form.status = 'published'
        ORDER BY form.published_at DESC, field.sort_order ASC
      `),
    ]);
    const resources = (
      resourceRows as unknown as Array<{
        id: string;
        title: string;
        source_type: string;
        source_url: string | null;
        file_id: string | null;
      }>
    ).map((resource) => ({
      id: resource.id,
      title: resource.title,
      sourceType: resource.source_type,
      href:
        resource.source_url ??
        `/v1/public/booths/${encodeURIComponent(publicQrToken)}/resources/${resource.id}`,
      external: Boolean(resource.source_url),
    }));
    const forms = formRows as unknown as Array<{
      name: string;
      description: string | null;
      consent_text: string | null;
      key: string | null;
      label: string | null;
      type: string | null;
      required: boolean | null;
      placeholder: string | null;
      help_text: string | null;
      validation: unknown;
    }>;
    const form = forms[0]
      ? {
          name: forms[0].name,
          description: forms[0].description,
          consentText: forms[0].consent_text,
          fields: forms
            .filter((field) => field.key)
            .map((field) => ({
              key: field.key!,
              label: field.label!,
              type: field.type!,
              required: Boolean(field.required),
              placeholder: field.placeholder,
              helpText: field.help_text,
              validation: field.validation,
            })),
        }
      : null;
    return {
      id: booth.id,
      companyName: booth.company_name,
      boothName: booth.booth_name,
      boothNumber: booth.booth_number,
      logoUrl: booth.logo_url,
      description: booth.description,
      website: booth.website,
      eventSlug: booth.event_slug,
      privacyPolicyUrl: booth.privacy_policy_url,
      resources,
      leadForm: form,
    };
  }

  async resourceUrl(publicQrToken: string, sourceId: string) {
    const booth = await this.scope(publicQrToken);
    const rows = await this.database.execute(sql<{ storage_key: string }>`
      SELECT file.storage_key
      FROM kb_sources source JOIN files file ON file.id = source.file_id
      WHERE source.id = ${sourceId} AND source.event_exhibitor_id = ${booth.id}
        AND source.status = 'indexed' AND file.status = 'clean'
      LIMIT 1
    `);
    const storageKey = (rows as unknown as Array<{ storage_key: string }>)[0]
      ?.storage_key;
    if (!storageKey) throw new NotFoundException("Resource not found.");
    const { data, error } = await this.storage()
      .storage.from("uploads")
      .createSignedUrl(storageKey, 300);
    if (error || !data?.signedUrl)
      throw new NotFoundException("Resource not found.");
    return data.signedUrl;
  }

  async chat(publicQrToken: string, question: unknown) {
    const text = typeof question === "string" ? question.trim() : "";
    const booth = await this.scope(publicQrToken);
    const inputVerdict = await this.guardrails.screenInput({
      organizationId: booth.organization_id,
      eventId: booth.event_id,
      text,
    });
    if (!inputVerdict.allowed)
      throw new BadRequestException("That question cannot be processed.");
    const chunks = await this.retrieval.search(
      { kind: "session", organizationId: booth.organization_id },
      booth.event_id,
      text,
      { topK: 6, eventExhibitorId: booth.id },
    );
    if (!chunks.length) {
      const boothData = await this.findPublicBooth(publicQrToken);
      const fallbackParts: string[] = [];
      if (boothData.description) fallbackParts.push(boothData.description);
      if (boothData.website) fallbackParts.push(`Website: ${boothData.website}`);
      if (boothData.resources.length) {
        fallbackParts.push(
          `Published resources: ${boothData.resources.map((r) => r.title).join(", ")}`,
        );
      }
      if (!fallbackParts.length)
        return {
          answer:
            "I do not have enough published company information to answer that yet.",
          citations: [],
        };
      const fallbackResult = await this.generation
        .generate({
          promptId: "attendee.booth_chat.v1",
          organizationId: booth.organization_id,
          eventId: booth.event_id,
          input: {
            instruction:
              "Answer the attendee's question using only the published company information below. If the information is insufficient to answer, say so. Do not invent details.",
            question: text,
            evidence: fallbackParts.map((part, index) => ({
              marker: `[${index + 1}]`,
              text: part,
            })),
          },
        })
        .catch(() => null);
      if (!fallbackResult)
        return {
          answer:
            "I could not produce an answer right now. Please review the published resources instead.",
          citations: [],
        };
      return { answer: fallbackResult.text, citations: [] };
    }
    const result = await this.generation.generate({
      promptId: "attendee.booth_chat.v1",
      organizationId: booth.organization_id,
      eventId: booth.event_id,
      input: {
        instruction:
          "Answer the attendee's question using only the evidence. Cite supporting statements with [1], [2], and so on. If evidence is insufficient, say so.",
        question: text,
        evidence: chunks.map((chunk, index) => ({
          marker: `[${index + 1}]`,
          text: chunk.text,
        })),
      },
    });
    const citations = chunks
      .map((chunk, index) => ({
        marker: `[${index + 1}]`,
        documentId: chunk.documentId,
        title: chunk.title,
        href: chunk.deepLink,
      }))
      .filter((citation) => result.text.includes(citation.marker));
    const outputVerdict = await this.guardrails.screenOutput({
      organizationId: booth.organization_id,
      eventId: booth.event_id,
      text: result.text,
      citations,
      evidenceIds: chunks.map((chunk) => chunk.documentId),
    });
    if (!outputVerdict.allowed)
      return {
        answer:
          "I could not produce a safely grounded answer. Please review the published resources instead.",
        citations: [],
      };
    return { answer: result.text, citations };
  }

  async submit(
    publicQrToken: string,
    accessToken: string,
    idempotencyKey: string,
    responses: unknown,
  ) {
    const user = await this.auth.identity(accessToken);
    if (!user) throw new UnauthorizedException("Authentication required.");
    if (!idempotencyKey?.trim())
      throw new BadRequestException("Idempotency-Key is required.");
    if (!responses || typeof responses !== "object" || Array.isArray(responses))
      throw new BadRequestException("Lead form responses are required.");
    const booth = await this.scope(publicQrToken);
    const formRows = await this.database.execute(sql<{ id: string }>`
      SELECT id FROM lead_forms
      WHERE event_exhibitor_id = ${booth.id} AND status = 'published'
      ORDER BY published_at DESC LIMIT 1
    `);
    const leadFormId = (formRows as unknown as Array<{ id: string }>)[0]?.id;
    if (!leadFormId)
      throw new NotFoundException("Published lead form not found.");
    const submission = await this.relationships.create({
      organizationId: booth.organization_id,
      actorUserId: user.id,
      eventId: booth.event_id,
      eventExhibitorId: booth.id,
      attendeeUserId: user.id,
      leadFormId,
      idempotencyKey: idempotencyKey.trim(),
      interactionSource: "visitor_qr",
      responses: responses as Record<string, unknown>,
    });
    const resourceRows = await this.database.execute(sql<{
      title: string;
      source_type: string;
    }>`
      SELECT title, source_type FROM kb_sources
      WHERE event_exhibitor_id = ${booth.id} AND status = 'indexed'
      ORDER BY created_at DESC LIMIT 3
    `);
    const recommendations = (
      resourceRows as unknown as Array<{ title: string; source_type: string }>
    ).map((resource) => ({
      title: resource.title,
      reason: `Recommended from this exhibitor's published ${resource.source_type.replaceAll("_", " ")} content.`,
    }));
    return { submissionId: submission.id, accepted: true, recommendations };
  }

  async enroll(publicQrToken: string, email: unknown) {
    const normalized =
      typeof email === "string" ? email.trim().toLowerCase() : "";
    if (!/^\S+@\S+\.\S+$/.test(normalized))
      throw new BadRequestException("A valid email is required.");
    const booth = await this.scope(publicQrToken);
    await this.database.execute(sql`
      INSERT INTO public_enrollments(event_exhibitor_id,email) VALUES (${booth.id},${normalized})
      ON CONFLICT (event_exhibitor_id,email) WHERE status='pending' DO UPDATE SET created_at=now()
    `);
    try {
      await this.auth.sendMagicLink(normalized, "/auth/complete");
    } catch {
      throw new BadRequestException("Unable to send magic link.");
    }
    return { accepted: true };
  }

  async complete(accessToken: string) {
    const user = await this.auth.identity(accessToken);
    if (!user) throw new UnauthorizedException("Authentication required.");
    const rows = await this.database.execute(sql<{
      event_exhibitor_id: string;
      organization_id: string;
      public_token: string;
    }>`
      SELECT enrollment.event_exhibitor_id, booth.organization_id, credential.public_token
      FROM public_enrollments enrollment
      JOIN event_exhibitors booth ON booth.id = enrollment.event_exhibitor_id
      JOIN booth_qr_credentials credential ON credential.event_exhibitor_id = booth.id AND credential.active
      JOIN users attendee ON attendee.id = ${user.id} AND attendee.email = enrollment.email
      WHERE enrollment.status = 'pending' ORDER BY enrollment.created_at DESC LIMIT 1
    `);
    const enrollment = (
      rows as unknown as Array<{
        event_exhibitor_id: string;
        organization_id: string;
        public_token: string;
      }>
    )[0];
    if (!enrollment)
      throw new NotFoundException("Pending enrollment not found.");
    const relationship = await this.relationships.ensureRelationship({
      organizationId: enrollment.organization_id,
      actorUserId: user.id,
      eventExhibitorId: enrollment.event_exhibitor_id,
      attendeeUserId: user.id,
    });
    await this.database.execute(sql`
      UPDATE public_enrollments SET status='completed',completed_at=now()
      WHERE event_exhibitor_id=${enrollment.event_exhibitor_id} AND email=${user.email} AND status='pending'
    `);
    return {
      ...relationship,
      eventExhibitorId: enrollment.event_exhibitor_id,
      publicQrToken: enrollment.public_token,
    };
  }

  private async scope(publicQrToken: string): Promise<BoothScope> {
    const rows = await this.database.execute(sql<BoothScope>`
      SELECT booth.id, booth.event_id, booth.organization_id, credential.public_token
      FROM booth_qr_credentials credential
      JOIN event_exhibitors booth ON booth.id = credential.event_exhibitor_id
      JOIN events event ON event.id = booth.event_id
      WHERE credential.public_token = ${publicQrToken} AND credential.active
        AND booth.status = 'ready' AND event.status IN ('published','live') LIMIT 1
    `);
    const booth = (rows as unknown as BoothScope[])[0];
    if (!booth) throw new NotFoundException("Booth not found.");
    return booth;
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

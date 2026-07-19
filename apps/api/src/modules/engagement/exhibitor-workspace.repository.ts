import { Inject, Injectable } from "@nestjs/common";
import { and, desc, eq, max, sql } from "drizzle-orm";
import { setRlsContext } from "@concourse/database";
import {
  boothQrCredentials,
  eventExhibitors,
  files,
  kbSources,
  leadFormFields,
  leadForms,
  organizations,
} from "@concourse/database/schema";

import {
  DATABASE_CLIENT,
  type DatabaseClient,
} from "../../common/database-client";

export type LeadFieldInput = {
  key: string;
  label: string;
  type: string;
  required: boolean;
  placeholder?: string;
  sortOrder: number;
};

export type ExhibitorWorkspace = {
  organization: { id: string; name: string; websiteUrl: string | null };
  event: { id: string; name: string; status: string };
  booth: {
    id: string;
    boothName: string;
    boothNumber: string | null;
    logoUrl: string | null;
    bannerUrl: string | null;
    primaryColor: string;
    description: string | null;
    website: string | null;
    contactEmail: string | null;
    contactPhone: string | null;
    status: string;
    publishedAt: string | null;
  };
  sources: Array<{
    id: string;
    sourceType: string;
    title: string;
    sourceUrl: string | null;
    status: string;
    fileStatus: string | null;
    contentType: string | null;
    byteSize: number | null;
    errorMessage: string | null;
    attemptCount: number;
  }>;
  leadForm: {
    id: string;
    name: string;
    description: string | null;
    consentText: string | null;
    version: number;
    status: string;
    fields: LeadFieldInput[];
  } | null;
  qr: { publicToken: string; createdAt: string } | null;
};

@Injectable()
export class ExhibitorWorkspaceRepository {
  constructor(
    @Inject(DATABASE_CLIENT) private readonly database: DatabaseClient,
  ) {}

  async overview(userId: string) {
    const rows = await this.database.execute(sql<{
      organization_id: string;
      organization_name: string;
      event_exhibitor_id: string;
      event_name: string;
      booth_name: string;
      status: string;
    }>`
      SELECT organization.id AS organization_id, organization.name AS organization_name,
        booth.id AS event_exhibitor_id, event.name AS event_name,
        booth.booth_name, booth.status
      FROM organization_memberships membership
      JOIN organizations organization ON organization.id = membership.organization_id
      JOIN event_exhibitors booth ON booth.organization_id = organization.id
      JOIN events event ON event.id = booth.event_id
      WHERE membership.user_id = ${userId}
        AND membership.status = 'active'
        AND organization.kind = 'exhibitor'
        AND booth.status NOT IN ('archived','withdrawn')
      ORDER BY booth.updated_at DESC
    `);
    return rows as unknown as Array<{
      organization_id: string;
      organization_name: string;
      event_exhibitor_id: string;
      event_name: string;
      booth_name: string;
      status: string;
    }>;
  }

  async find(
    organizationId: string,
    eventExhibitorId: string,
    actorUserId: string,
  ) {
    return this.database.transaction(async (tx) => {
      await setRlsContext(tx, organizationId, actorUserId);
      const rows = await tx.execute(sql<{ workspace: ExhibitorWorkspace }>`
        SELECT jsonb_build_object(
          'organization', jsonb_build_object('id', organization.id, 'name', organization.name, 'websiteUrl', organization.website_url),
          'event', jsonb_build_object('id', event.id, 'name', event.name, 'status', event.status),
          'booth', jsonb_build_object(
            'id', booth.id, 'boothName', booth.booth_name, 'boothNumber', booth.booth_number,
            'logoUrl', booth.logo_url, 'bannerUrl', booth.banner_url, 'primaryColor', booth.primary_color,
            'description', booth.description, 'website', booth.website,
            'contactEmail', booth.contact_email, 'contactPhone', booth.contact_phone,
            'status', booth.status, 'publishedAt', booth.published_at
          ),
          'sources', COALESCE((
            SELECT jsonb_agg(jsonb_build_object(
              'id', source.id, 'sourceType', source.source_type, 'title', source.title,
              'sourceUrl', source.source_url, 'status', source.status,
              'fileStatus', file.status, 'contentType', file.content_type, 'byteSize', file.byte_size,
              'errorMessage', source.error_message, 'attemptCount', source.attempt_count
            ) ORDER BY source.created_at DESC)
            FROM kb_sources source LEFT JOIN files file ON file.id = source.file_id
            WHERE source.event_exhibitor_id = booth.id
          ), '[]'::jsonb),
          'leadForm', (
            SELECT jsonb_build_object(
              'id', form.id, 'name', form.name, 'description', form.description,
              'consentText', form.consent_text, 'version', form.version, 'status', form.status,
              'fields', COALESCE((
                SELECT jsonb_agg(jsonb_build_object(
                  'key', field.key, 'label', field.label, 'type', field.type,
                  'required', field.required, 'placeholder', field.placeholder,
                  'sortOrder', field.sort_order
                ) ORDER BY field.sort_order)
                FROM lead_form_fields field WHERE field.lead_form_id = form.id AND field.status = 'active'
              ), '[]'::jsonb)
            )
            FROM lead_forms form
            WHERE form.event_exhibitor_id = booth.id AND form.status IN ('draft','published')
            ORDER BY CASE form.status WHEN 'draft' THEN 0 ELSE 1 END, form.version DESC
            LIMIT 1
          ),
          'qr', (
            SELECT jsonb_build_object('publicToken', credential.public_token, 'createdAt', credential.created_at)
            FROM booth_qr_credentials credential
            WHERE credential.event_exhibitor_id = booth.id AND credential.active
            LIMIT 1
          )
        ) AS workspace
        FROM event_exhibitors booth
        JOIN organizations organization ON organization.id = booth.organization_id
        JOIN events event ON event.id = booth.event_id
        WHERE booth.id = ${eventExhibitorId} AND booth.organization_id = ${organizationId}
          AND booth.status NOT IN ('archived','withdrawn')
        LIMIT 1
      `);
      return (rows as unknown as Array<{ workspace: ExhibitorWorkspace }>)[0]
        ?.workspace;
    });
  }

  async updateProfile(input: {
    organizationId: string;
    eventExhibitorId: string;
    actorUserId: string;
    companyName: string;
    boothName: string;
    boothNumber: string | null;
    logoUrl: string | null;
    bannerUrl: string | null;
    primaryColor: string;
    description: string;
    website: string;
    contactEmail: string;
    contactPhone: string | null;
  }) {
    return this.database.transaction(async (tx) => {
      await setRlsContext(tx, input.organizationId, input.actorUserId);
      await tx
        .update(organizations)
        .set({
          name: input.companyName,
          websiteUrl: input.website,
          updatedAt: new Date(),
        })
        .where(eq(organizations.id, input.organizationId));
      const [booth] = await tx
        .update(eventExhibitors)
        .set({
          boothName: input.boothName,
          boothNumber: input.boothNumber,
          logoUrl: input.logoUrl,
          bannerUrl: input.bannerUrl,
          primaryColor: input.primaryColor,
          description: input.description,
          website: input.website,
          contactEmail: input.contactEmail,
          contactPhone: input.contactPhone,
          status: sql`CASE WHEN ${eventExhibitors.status} = 'ready' THEN 'ready' ELSE 'profile_complete' END`,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(eventExhibitors.id, input.eventExhibitorId),
            eq(eventExhibitors.organizationId, input.organizationId),
          ),
        )
        .returning();
      return booth;
    });
  }

  async createFileSource(input: {
    organizationId: string;
    eventExhibitorId: string;
    actorUserId: string;
    sourceType: string;
    title: string;
    filename: string;
    contentType: string;
    byteSize: number;
  }) {
    return this.database.transaction(async (tx) => {
      await setRlsContext(tx, input.organizationId, input.actorUserId);
      const [booth] = await tx
        .select({
          eventId: eventExhibitors.eventId,
          organizerOrganizationId: eventExhibitors.organizerOrganizationId,
        })
        .from(eventExhibitors)
        .where(
          and(
            eq(eventExhibitors.id, input.eventExhibitorId),
            eq(eventExhibitors.organizationId, input.organizationId),
          ),
        );
      if (!booth) return undefined;
      const [generated] = await tx.execute<{ id: string }>(
        sql`SELECT concourse.uuid_generate_v7() AS id`,
      );
      if (!generated) throw new Error("File ID generation returned no row.");
      const storageKey = `org/${input.organizationId}/kb_document/${generated.id}/${input.filename}`;
      const [file] = await tx
        .insert(files)
        .values({
          id: generated.id,
          organizationId: input.organizationId,
          uploadedByUserId: input.actorUserId,
          purpose: "kb_document",
          storageKey,
          contentType: input.contentType,
          byteSize: input.byteSize,
        })
        .returning();
      const [source] = await tx
        .insert(kbSources)
        .values({
          eventId: booth.eventId,
          eventExhibitorId: input.eventExhibitorId,
          organizerOrganizationId: booth.organizerOrganizationId,
          ownerOrganizationId: input.organizationId,
          kind: "uploaded_document",
          sourceType: input.sourceType,
          title: input.title,
          fileId: file!.id,
        })
        .returning();
      return { source, file };
    });
  }

  async createWebsiteSource(input: {
    organizationId: string;
    eventExhibitorId: string;
    actorUserId: string;
    title: string;
    sourceUrl: string;
  }) {
    return this.database.transaction(async (tx) => {
      await setRlsContext(tx, input.organizationId, input.actorUserId);
      const [booth] = await tx
        .select({
          eventId: eventExhibitors.eventId,
          organizerOrganizationId: eventExhibitors.organizerOrganizationId,
        })
        .from(eventExhibitors)
        .where(
          and(
            eq(eventExhibitors.id, input.eventExhibitorId),
            eq(eventExhibitors.organizationId, input.organizationId),
          ),
        );
      if (!booth) return undefined;
      const [source] = await tx
        .insert(kbSources)
        .values({
          eventId: booth.eventId,
          eventExhibitorId: input.eventExhibitorId,
          organizerOrganizationId: booth.organizerOrganizationId,
          ownerOrganizationId: input.organizationId,
          kind: "external_url",
          sourceType: "website",
          title: input.title,
          sourceUrl: input.sourceUrl,
        })
        .returning();
      return source;
    });
  }

  async findFileSource(
    organizationId: string,
    eventExhibitorId: string,
    sourceId: string,
    actorUserId: string,
  ) {
    return this.database.transaction(async (tx) => {
      await setRlsContext(tx, organizationId, actorUserId);
      const [source] = await tx
        .select({
          id: kbSources.id,
          fileId: files.id,
          storageKey: files.storageKey,
          contentType: files.contentType,
          byteSize: files.byteSize,
        })
        .from(kbSources)
        .innerJoin(files, eq(files.id, kbSources.fileId))
        .where(
          and(
            eq(kbSources.id, sourceId),
            eq(kbSources.eventExhibitorId, eventExhibitorId),
            eq(kbSources.ownerOrganizationId, organizationId),
          ),
        );
      return source;
    });
  }

  async completeFileSource(
    organizationId: string,
    sourceId: string,
    fileId: string,
    actorUserId: string,
  ) {
    return this.database.transaction(async (tx) => {
      await setRlsContext(tx, organizationId, actorUserId);
      await tx
        .update(files)
        .set({ status: "scanning", updatedAt: new Date() })
        .where(eq(files.id, fileId));
      const [source] = await tx
        .update(kbSources)
        .set({ status: "pending", updatedAt: new Date() })
        .where(eq(kbSources.id, sourceId))
        .returning();
      return source;
    });
  }

  async removeSource(
    organizationId: string,
    sourceId: string,
    actorUserId: string,
  ) {
    return this.database.transaction(async (tx) => {
      await setRlsContext(tx, organizationId, actorUserId);
      const [source] = await tx
        .delete(kbSources)
        .where(
          and(
            eq(kbSources.id, sourceId),
            eq(kbSources.ownerOrganizationId, organizationId),
          ),
        )
        .returning({ fileId: kbSources.fileId });
      if (source?.fileId)
        await tx.delete(files).where(eq(files.id, source.fileId));
      return source;
    });
  }

  async retrySource(
    organizationId: string,
    eventExhibitorId: string,
    sourceId: string,
    actorUserId: string,
  ) {
    return this.database.transaction(async (tx) => {
      await setRlsContext(tx, organizationId, actorUserId);
      const [source] = await tx
        .update(kbSources)
        .set({ status: "pending", errorMessage: null, attemptCount: 0, updatedAt: new Date() })
        .where(and(
          eq(kbSources.id, sourceId),
          eq(kbSources.eventExhibitorId, eventExhibitorId),
          eq(kbSources.ownerOrganizationId, organizationId),
          eq(kbSources.status, "failed"),
        ))
        .returning();
      return source;
    });
  }

  async saveLeadForm(input: {
    organizationId: string;
    eventExhibitorId: string;
    actorUserId: string;
    name: string;
    description: string | null;
    consentText: string;
    fields: LeadFieldInput[];
  }) {
    return this.database.transaction(async (tx) => {
      await setRlsContext(tx, input.organizationId, input.actorUserId);
      const [booth] = await tx
        .select({ id: eventExhibitors.id })
        .from(eventExhibitors)
        .where(
          and(
            eq(eventExhibitors.id, input.eventExhibitorId),
            eq(eventExhibitors.organizationId, input.organizationId),
          ),
        );
      if (!booth) return undefined;
      let [form] = await tx
        .select()
        .from(leadForms)
        .where(
          and(
            eq(leadForms.eventExhibitorId, input.eventExhibitorId),
            eq(leadForms.status, "draft"),
          ),
        )
        .orderBy(desc(leadForms.version))
        .limit(1);
      if (!form) {
        const [latest] = await tx
          .select({ version: max(leadForms.version) })
          .from(leadForms)
          .where(eq(leadForms.eventExhibitorId, input.eventExhibitorId));
        [form] = await tx
          .insert(leadForms)
          .values({
            eventExhibitorId: input.eventExhibitorId,
            name: input.name,
            description: input.description,
            consentText: input.consentText,
            version: (latest?.version ?? 0) + 1,
            isDefault: true,
            status: "draft",
          })
          .returning();
      } else {
        [form] = await tx
          .update(leadForms)
          .set({
            name: input.name,
            description: input.description,
            consentText: input.consentText,
            updatedAt: new Date(),
          })
          .where(eq(leadForms.id, form.id))
          .returning();
        await tx
          .delete(leadFormFields)
          .where(eq(leadFormFields.leadFormId, form!.id));
      }
      await tx.insert(leadFormFields).values(
        input.fields.map((field) => ({
          leadFormId: form!.id,
          key: field.key,
          label: field.label,
          type: field.type,
          required: field.required,
          placeholder: field.placeholder,
          sortOrder: field.sortOrder,
        })),
      );
      return form;
    });
  }

  async publishLeadForm(
    organizationId: string,
    eventExhibitorId: string,
    actorUserId: string,
  ) {
    return this.database.transaction(async (tx) => {
      await setRlsContext(tx, organizationId, actorUserId);
      const [form] = await tx
        .select()
        .from(leadForms)
        .where(
          and(
            eq(leadForms.eventExhibitorId, eventExhibitorId),
            eq(leadForms.status, "draft"),
          ),
        )
        .orderBy(desc(leadForms.version))
        .limit(1);
      if (!form) return undefined;
      const fields = await tx
        .select()
        .from(leadFormFields)
        .where(eq(leadFormFields.leadFormId, form.id));
      if (
        !form.consentText?.trim() ||
        !fields.some((field) => field.type === "email") ||
        !fields.some((field) => field.type === "consent_checkbox")
      ) {
        return { form, ready: false as const };
      }
      await tx
        .update(leadForms)
        .set({ status: "archived", isDefault: false, updatedAt: new Date() })
        .where(
          and(
            eq(leadForms.eventExhibitorId, eventExhibitorId),
            eq(leadForms.status, "published"),
          ),
        );
      const [published] = await tx
        .update(leadForms)
        .set({
          status: "published",
          isDefault: true,
          publishedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(leadForms.id, form.id))
        .returning();
      return { form: published!, ready: true as const };
    });
  }

  async publishBooth(
    organizationId: string,
    eventExhibitorId: string,
    actorUserId: string,
  ) {
    return this.database.transaction(async (tx) => {
      await setRlsContext(tx, organizationId, actorUserId);
      const [booth] = await tx
        .select()
        .from(eventExhibitors)
        .where(
          and(
            eq(eventExhibitors.id, eventExhibitorId),
            eq(eventExhibitors.organizationId, organizationId),
          ),
        );
      if (!booth) return undefined;
      const [form] = await tx
        .select({ id: leadForms.id })
        .from(leadForms)
        .where(
          and(
            eq(leadForms.eventExhibitorId, eventExhibitorId),
            eq(leadForms.status, "published"),
            eq(leadForms.isDefault, true),
          ),
        );
      if (!form) return { booth, ready: false as const };
      const [published] = await tx
        .update(eventExhibitors)
        .set({
          status: "ready",
          publishedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(eventExhibitors.id, eventExhibitorId))
        .returning();
      return { booth: published!, ready: true as const };
    });
  }

  async qr(
    organizationId: string,
    eventExhibitorId: string,
    actorUserId: string,
    publicToken?: string,
  ) {
    return this.database.transaction(async (tx) => {
      await setRlsContext(tx, organizationId, actorUserId);
      const [booth] = await tx
        .select({ id: eventExhibitors.id, status: eventExhibitors.status })
        .from(eventExhibitors)
        .where(
          and(
            eq(eventExhibitors.id, eventExhibitorId),
            eq(eventExhibitors.organizationId, organizationId),
          ),
        );
      if (!booth || booth.status !== "ready") return undefined;
      const [current] = await tx
        .select()
        .from(boothQrCredentials)
        .where(
          and(
            eq(boothQrCredentials.eventExhibitorId, eventExhibitorId),
            eq(boothQrCredentials.active, true),
          ),
        );
      if (current) return current;
      if (!publicToken) return undefined;
      const [created] = await tx
        .insert(boothQrCredentials)
        .values({ eventExhibitorId, publicToken })
        .returning();
      return created;
    });
  }
}

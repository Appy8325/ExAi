import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
  UnauthorizedException,
} from "@nestjs/common";
import { AiGenerationService, AiGuardrailService } from "@concourse/ai";
import { sql } from "drizzle-orm";
import {
  DATABASE_CLIENT,
  type DatabaseClient,
} from "../../common/database-client";
import { SupabaseAuthService } from "../auth/supabase-auth.service";

export type OrganizerAnalytics = {
  organizationId: string;
  event: { id: string; name: string; status: string; timezone: string };
  generatedAt: string;
  traffic: {
    capturedVisits: number;
    uniqueVisitors: number;
    returningVisitors: number;
  };
  conversions: { leads: number; conversionRate: number };
  engagement: {
    repeatEngagementRate: number;
    averageInteractions: number;
    analyzedLeads: number;
  };
  booths: Array<{
    id: string;
    name: string;
    boothNumber: string | null;
    visits: number;
    leads: number;
    uniqueVisitors: number;
    conversionRate: number;
    heat: number;
  }>;
  industries: Array<{ name: string; count: number }>;
  topics: Array<{ name: string; count: number }>;
};

export type OrganizerReport = {
  id: string;
  eventId: string;
  status: string;
  content: string | null;
  generatedAt: string | null;
  model: string | null;
  metricsSnapshot: OrganizerAnalytics;
};

@Injectable()
export class OrganizerReportingService {
  constructor(
    @Inject(DATABASE_CLIENT) private readonly database: DatabaseClient,
    private readonly auth: SupabaseAuthService,
    private readonly generation: AiGenerationService,
    private readonly guardrails: AiGuardrailService,
  ) {}

  async analytics(
    accessToken: string,
    eventId: string,
  ): Promise<OrganizerAnalytics> {
    const user = await this.auth.identity(accessToken);
    if (!user) throw new UnauthorizedException("Authentication required.");
    const rows = await this.database.execute(sql<{
      analytics: OrganizerAnalytics;
    }>`
      WITH authorized_event AS (
        SELECT event.id,event.name,event.status,event.timezone,event.organization_id
        FROM events event JOIN organization_memberships membership ON membership.organization_id=event.organization_id
        WHERE event.id=${eventId} AND membership.user_id=${user.id} AND membership.status='active' LIMIT 1
      ), booth_metrics AS (
        SELECT booth.id,booth.booth_name,booth.booth_number,
          COALESCE((SELECT sum(relationship.interaction_count)::int FROM exhibitor_relationships relationship WHERE relationship.event_exhibitor_id=booth.id),0) visits,
          (SELECT count(*)::int FROM lead_submissions submission WHERE submission.event_exhibitor_id=booth.id) leads,
          (SELECT count(DISTINCT relationship.attendee_user_id)::int FROM exhibitor_relationships relationship WHERE relationship.event_exhibitor_id=booth.id) unique_visitors
        FROM event_exhibitors booth JOIN authorized_event event ON event.id=booth.event_id
        WHERE booth.status NOT IN ('archived','withdrawn')
      ), totals AS (
        SELECT COALESCE(sum(visits),0)::int visits,COALESCE(sum(leads),0)::int leads,COALESCE(max(visits),0)::int max_visits FROM booth_metrics
      ), event_metrics AS (
        SELECT count(DISTINCT relationship.attendee_user_id)::int unique_visitors,
          count(DISTINCT relationship.attendee_user_id) FILTER (WHERE relationship.interaction_count>1)::int returning_visitors
        FROM authorized_event event
        LEFT JOIN event_exhibitors booth ON booth.event_id=event.id
        LEFT JOIN exhibitor_relationships relationship ON relationship.event_exhibitor_id=booth.id
      )
      SELECT jsonb_build_object(
        'organizationId',event.organization_id,'event',jsonb_build_object('id',event.id,'name',event.name,'status',event.status,'timezone',event.timezone),'generatedAt',now(),
        'traffic',jsonb_build_object('capturedVisits',totals.visits,'uniqueVisitors',event_metrics.unique_visitors,'returningVisitors',event_metrics.returning_visitors),
        'conversions',jsonb_build_object('leads',totals.leads,'conversionRate',CASE WHEN totals.visits=0 THEN 0 ELSE round(100.0*totals.leads/totals.visits,1) END),
        'engagement',jsonb_build_object('repeatEngagementRate',CASE WHEN event_metrics.unique_visitors=0 THEN 0 ELSE round(100.0*event_metrics.returning_visitors/event_metrics.unique_visitors,1) END,'averageInteractions',CASE WHEN event_metrics.unique_visitors=0 THEN 0 ELSE round(1.0*totals.visits/event_metrics.unique_visitors,1) END,'analyzedLeads',(SELECT count(*)::int FROM lead_intelligence intelligence JOIN lead_submissions submission ON submission.id=intelligence.lead_submission_id WHERE submission.event_id=event.id AND intelligence.status='complete')),
        'booths',COALESCE((SELECT jsonb_agg(jsonb_build_object('id',booth.id,'name',booth.booth_name,'boothNumber',booth.booth_number,'visits',booth.visits,'leads',booth.leads,'uniqueVisitors',booth.unique_visitors,'conversionRate',CASE WHEN booth.visits=0 THEN 0 ELSE round(100.0*booth.leads/booth.visits,1) END,'heat',CASE WHEN totals.max_visits=0 THEN 0 ELSE round(100.0*booth.visits/totals.max_visits) END) ORDER BY booth.visits DESC,booth.booth_name) FROM booth_metrics booth),'[]'::jsonb),
        'industries',COALESCE((SELECT jsonb_agg(jsonb_build_object('name',industry,'count',count) ORDER BY count DESC,industry) FROM (SELECT profile.industry,count(DISTINCT relationship.attendee_user_id)::int count FROM attendee_profiles profile JOIN attendee_profile_consents consent ON consent.user_id=profile.user_id AND consent.share_profile_with_exhibitors JOIN exhibitor_relationships relationship ON relationship.attendee_user_id=profile.user_id JOIN event_exhibitors booth ON booth.id=relationship.event_exhibitor_id WHERE booth.event_id=event.id AND profile.industry IS NOT NULL GROUP BY profile.industry LIMIT 10) grouped),'[]'::jsonb),
        'topics',COALESCE((SELECT jsonb_agg(jsonb_build_object('name',topic,'count',count) ORDER BY count DESC,topic) FROM (SELECT topic,count(*)::int count FROM lead_intelligence intelligence JOIN lead_submissions submission ON submission.id=intelligence.lead_submission_id CROSS JOIN LATERAL jsonb_array_elements_text(intelligence.topics_discussed) topic WHERE submission.event_id=event.id AND intelligence.status='complete' GROUP BY topic LIMIT 10) grouped),'[]'::jsonb)
      ) analytics FROM authorized_event event CROSS JOIN totals CROSS JOIN event_metrics
    `);
    const analytics = (
      rows as unknown as Array<{ analytics: OrganizerAnalytics }>
    )[0]?.analytics;
    if (!analytics)
      throw new NotFoundException("Event not found for organizer.");
    return analytics;
  }

  async latest(accessToken: string, eventId: string) {
    const analytics = await this.analytics(accessToken, eventId);
    const rows = await this.database.execute(
      sql<OrganizerReport>`SELECT id,event_id "eventId",status,content,generated_at "generatedAt",model,metrics_snapshot "metricsSnapshot" FROM organizer_reports WHERE event_id=${eventId} AND organizer_organization_id=${analytics.organizationId} ORDER BY created_at DESC LIMIT 1`,
    );
    return (rows as unknown as OrganizerReport[])[0] ?? null;
  }

  async generate(accessToken: string, eventId: string, idempotencyKey: string) {
    if (!idempotencyKey.trim())
      throw new BadRequestException("Idempotency-Key is required.");
    const user = await this.auth.identity(accessToken);
    if (!user) throw new UnauthorizedException("Authentication required.");
    const analytics = await this.analytics(accessToken, eventId);
    const inserted = await this.database.execute(
      sql<{
        id: string;
      }>`INSERT INTO organizer_reports(event_id,organizer_organization_id,generated_by_user_id,idempotency_key,metrics_snapshot) VALUES (${eventId},${analytics.organizationId},${user.id},${idempotencyKey.trim()},${JSON.stringify(analytics)}::jsonb) ON CONFLICT (event_id,idempotency_key) DO NOTHING RETURNING id`,
    );
    if (!inserted.length)
      return this.byKey(
        analytics.organizationId,
        eventId,
        idempotencyKey.trim(),
      );
    const id = (inserted as unknown as Array<{ id: string }>)[0]!.id;
    try {
      const result = await this.generation.generate({
        promptId: "organizer.executive_report.v1",
        organizationId: analytics.organizationId,
        eventId,
        input: {
          instruction:
            "Write a concise executive event report using only these aggregate metrics. Cite every numeric claim with its metric path in square brackets, for example [traffic.capturedVisits]. Include outcomes, booth performance, engagement, industry/topic trends, limitations, and recommended next actions. Never infer attendee-level facts.",
          metrics: analytics,
        },
      });
      const verdict = await this.guardrails.screenOutput({
        organizationId: analytics.organizationId,
        eventId,
        text: result.text,
      });
      if (!verdict.allowed)
        throw new Error("AI report failed safety validation");
      if (!/\[[a-z][a-zA-Z.]+\]/.test(result.text))
        throw new Error("AI report did not cite its aggregate metrics");
      await this.database.execute(
        sql`UPDATE organizer_reports SET status='complete',content=${result.text},model=${process.env.NVIDIA_CHAT_MODEL ?? "unknown"},generated_at=now(),updated_at=now() WHERE id=${id}`,
      );
    } catch (error) {
      await this.database.execute(
        sql`UPDATE organizer_reports SET status='failed',error_message=${error instanceof Error ? error.message.slice(0, 1000) : "Unknown AI error"},updated_at=now() WHERE id=${id}`,
      );
      throw new ServiceUnavailableException(
        "AI report generation is temporarily unavailable. Live analytics remain available.",
      );
    }
    return this.byKey(analytics.organizationId, eventId, idempotencyKey.trim());
  }

  async pdf(accessToken: string, eventId: string) {
    const report = await this.latest(accessToken, eventId);
    if (!report?.content || report.status !== "complete")
      throw new NotFoundException("Completed event report not found.");
    return textPdf(
      `ExAi Executive Event Report\nGenerated ${report.generatedAt ?? ""}\n\n${report.content}`,
    );
  }

  private async byKey(
    organizationId: string,
    eventId: string,
    idempotencyKey: string,
  ) {
    const rows = await this.database.execute(
      sql<OrganizerReport>`SELECT id,event_id "eventId",status,content,generated_at "generatedAt",model,metrics_snapshot "metricsSnapshot" FROM organizer_reports WHERE event_id=${eventId} AND organizer_organization_id=${organizationId} AND idempotency_key=${idempotencyKey} LIMIT 1`,
    );
    return (rows as unknown as OrganizerReport[])[0] ?? null;
  }
}

export function textPdf(text: string) {
  const lines = text
    .replaceAll(/[^\x20-\x7E\n]/g, "-")
    .split("\n")
    .flatMap((line) => line.match(/.{1,88}(?:\s|$)|.{1,88}/g) ?? [""]);
  const pages = Array.from(
    { length: Math.max(1, Math.ceil(lines.length / 48)) },
    (_, page) => lines.slice(page * 48, (page + 1) * 48),
  );
  const fontId = 3 + pages.length * 2;
  const pageIds = pages.map((_, index) => 3 + index * 2);
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pages.length} >>`,
    ...pages.flatMap((pageLines, index) => {
      const contentId = pageIds[index]! + 1;
      const stream = [
        "BT",
        "/F1 10 Tf",
        "50 760 Td",
        ...pageLines
          .flatMap((line, lineIndex) => [
            `${lineIndex ? "0 -14 Td" : ""}`,
            `(${line.replaceAll(/([\\()])/g, "\\$1")}) Tj`,
          ])
          .filter(Boolean),
        "ET",
      ].join("\n");
      return [
        `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents ${contentId} 0 R >>`,
        `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`,
      ];
    }),
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];
  let body = "%PDF-1.4\n";
  const offsets = [0];
  for (let i = 0; i < objects.length; i++) {
    offsets.push(Buffer.byteLength(body));
    body += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
  }
  const xref = Buffer.byteLength(body);
  body += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets
    .slice(1)
    .map((offset) => String(offset).padStart(10, "0") + " 00000 n ")
    .join(
      "\n",
    )}\ntrailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return Buffer.from(body);
}

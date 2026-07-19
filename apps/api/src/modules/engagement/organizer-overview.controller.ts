import { Controller, Get, Headers, Param, Post, Res } from "@nestjs/common";
import type { FastifyReply } from "fastify";

import { OrganizerOverviewService } from "./organizer-overview.service";
import { OrganizerReportingService } from "./organizer-reporting.service";

@Controller("v1/organizer")
export class OrganizerOverviewController {
  constructor(
    private readonly overview: OrganizerOverviewService,
    private readonly reporting: OrganizerReportingService,
  ) {}

  @Get("overview")
  find(@Headers("authorization") authorization?: string) {
    return this.overview.find(bearerToken(authorization));
  }

  @Get("events/:eventId/analytics")
  analytics(
    @Param("eventId") eventId: string,
    @Headers("authorization") authorization?: string,
  ) {
    return this.reporting.analytics(bearerToken(authorization), eventId);
  }

  @Get("events/:eventId/report")
  report(
    @Param("eventId") eventId: string,
    @Headers("authorization") authorization?: string,
  ) {
    return this.reporting.latest(bearerToken(authorization), eventId);
  }

  @Post("events/:eventId/report")
  generateReport(
    @Param("eventId") eventId: string,
    @Headers("authorization") authorization?: string,
    @Headers("idempotency-key") idempotencyKey?: string,
  ) {
    return this.reporting.generate(
      bearerToken(authorization),
      eventId,
      idempotencyKey ?? "",
    );
  }

  @Get("events/:eventId/report.pdf")
  async downloadReport(
    @Param("eventId") eventId: string,
    @Headers("authorization") authorization: string | undefined,
    @Res() response: FastifyReply,
  ) {
    const pdf = await this.reporting.pdf(bearerToken(authorization), eventId);
    response
      .header("content-type", "application/pdf")
      .header(
        "content-disposition",
        `attachment; filename="event-${eventId}-executive-report.pdf"`,
      )
      .send(pdf);
  }
}

function bearerToken(authorization?: string) {
  const [scheme, token] = authorization?.split(" ") ?? [];
  return scheme === "Bearer" ? (token ?? "") : "";
}

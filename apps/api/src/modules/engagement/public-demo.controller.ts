import { Controller, Get, Param, Post } from "@nestjs/common";

import { PublicExhibitorsService } from "./public-exhibitors.service";

@Controller("v1/public/demo")
export class PublicDemoController {
  constructor(private readonly exhibitors: PublicExhibitorsService) {}

  @Get()
  overview() {
    return this.exhibitors.demoOverview();
  }

  @Get("analytics/:eventId")
  analytics(@Param("eventId") eventId: string) {
    return this.exhibitors.demoAnalytics(eventId);
  }

  @Get("exhibitor/:eventExhibitorId/dashboard")
  exhibitorDashboard(@Param("eventExhibitorId") eventExhibitorId: string) {
    return this.exhibitors.demoExhibitorDashboard(eventExhibitorId);
  }

  @Post("ingest")
  async ingest() {
    return this.exhibitors.ingestDemoKnowledge();
  }
}

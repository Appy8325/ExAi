import { Body, Controller, Get, Param, Post } from "@nestjs/common";

import { PublicExhibitorsService } from "./public-exhibitors.service";
import { DemoAnalyticsStore, type TrackEvent } from "./demo-analytics.store";

@Controller("v1/public/demo")
export class PublicDemoController {
  constructor(
    private readonly exhibitors: PublicExhibitorsService,
    private readonly demoStore: DemoAnalyticsStore,
  ) {}

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

  @Get("exhibitor/:eventExhibitorId/live")
  exhibitorLiveMetrics(@Param("eventExhibitorId") eventExhibitorId: string) {
    return this.demoStore.getBoothMetrics(eventExhibitorId);
  }

  @Get("live")
  eventLiveMetrics() {
    return this.demoStore.getEventMetrics();
  }

  @Post("track")
  track(@Body() event: TrackEvent) {
    this.demoStore.track(event);
    return { tracked: true };
  }

  @Post("ingest")
  async ingest() {
    return this.exhibitors.ingestDemoKnowledge();
  }
}

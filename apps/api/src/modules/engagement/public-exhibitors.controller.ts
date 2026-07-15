import { Controller, Get, Param, Query } from "@nestjs/common";

import { PublicExhibitorsService } from "./public-exhibitors.service";

@Controller("v1/public")
export class PublicExhibitorsController {
  constructor(private readonly exhibitors: PublicExhibitorsService) {}

  @Get("events/slug/:slug")
  findEventBySlug(@Param("slug") slug: string) {
    return this.exhibitors.findEventBySlug(slug);
  }

  @Get("events/:eventId/exhibitors")
  listExhibitors(@Param("eventId") eventId: string, @Query("search") search?: string) {
    return this.exhibitors.listExhibitors(eventId, search);
  }

  @Get("events/:eventId/exhibitors/:exhibitorId")
  findExhibitor(@Param("eventId") eventId: string, @Param("exhibitorId") exhibitorId: string) {
    return this.exhibitors.findExhibitor(eventId, exhibitorId);
  }
}

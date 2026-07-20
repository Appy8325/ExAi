import { Controller, Get } from "@nestjs/common";

import { PublicExhibitorsService } from "./public-exhibitors.service";

@Controller("v1/public/showcase")
export class PublicShowcaseController {
  constructor(private readonly exhibitors: PublicExhibitorsService) {}

  @Get()
  list() {
    return this.exhibitors.listShowcase();
  }
}

import { Controller, Get } from "@nestjs/common";

import { PublicExhibitorsService } from "./public-exhibitors.service";

@Controller("v1/public/demo")
export class PublicDemoController {
  constructor(private readonly exhibitors: PublicExhibitorsService) {}

  @Get()
  overview() {
    return this.exhibitors.demoOverview();
  }
}

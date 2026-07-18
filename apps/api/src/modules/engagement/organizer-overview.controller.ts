import { Controller, Get, Headers } from "@nestjs/common";

import { OrganizerOverviewService } from "./organizer-overview.service";

@Controller("v1/organizer")
export class OrganizerOverviewController {
  constructor(private readonly overview: OrganizerOverviewService) {}

  @Get("overview")
  find(@Headers("authorization") authorization?: string) {
    const [scheme, token] = authorization?.split(" ") ?? [];
    return this.overview.find(scheme === "Bearer" ? token ?? "" : "");
  }
}

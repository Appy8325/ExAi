import { Controller, Get, Param } from "@nestjs/common";

import type { PlatformEnrollmentService } from "./platform-enrollment.service";

@Controller("v1/public/booths")
export class PublicBoothController {
  constructor(private readonly enrollment: PlatformEnrollmentService) {}

  @Get(":publicQrToken")
  find(@Param("publicQrToken") publicQrToken: string) {
    return this.enrollment.findPublicBooth(publicQrToken);
  }
}

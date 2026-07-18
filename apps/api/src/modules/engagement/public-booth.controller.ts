import { Body, Controller, Get, Param, Post } from "@nestjs/common";

import { PlatformEnrollmentService } from "./platform-enrollment.service";

@Controller("v1/public/booths")
export class PublicBoothController {
  constructor(private readonly enrollment: PlatformEnrollmentService) {}

  @Get(":publicQrToken")
  find(@Param("publicQrToken") publicQrToken: string) {
    return this.enrollment.findPublicBooth(publicQrToken);
  }

  @Post(":publicQrToken/enroll")
  enroll(@Param("publicQrToken") publicQrToken: string, @Body() body?: { email?: unknown }) {
    return this.enrollment.enroll(publicQrToken, body?.email);
  }
}

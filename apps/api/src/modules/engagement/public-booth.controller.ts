import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Res,
} from "@nestjs/common";
import type { FastifyReply } from "fastify";

import { PlatformEnrollmentService } from "./platform-enrollment.service";

@Controller("v1/public/booths")
export class PublicBoothController {
  constructor(private readonly enrollment: PlatformEnrollmentService) {}

  @Get(":publicQrToken")
  find(@Param("publicQrToken") publicQrToken: string) {
    return this.enrollment.findPublicBooth(publicQrToken);
  }

  @Post(":publicQrToken/enroll")
  enroll(
    @Param("publicQrToken") publicQrToken: string,
    @Body() body?: { email?: unknown },
  ) {
    return this.enrollment.enroll(publicQrToken, body?.email);
  }

  @Get(":publicQrToken/resources/:sourceId")
  async resource(
    @Param("publicQrToken") publicQrToken: string,
    @Param("sourceId") sourceId: string,
    @Res() response: FastifyReply,
  ) {
    response.redirect(
      await this.enrollment.resourceUrl(publicQrToken, sourceId),
    );
  }

  @Post(":publicQrToken/chat")
  chat(
    @Param("publicQrToken") publicQrToken: string,
    @Body() body?: { question?: unknown },
  ) {
    return this.enrollment.chat(publicQrToken, body?.question);
  }

  @Post(":publicQrToken/submissions")
  submit(
    @Param("publicQrToken") publicQrToken: string,
    @Headers("authorization") authorization?: string,
    @Headers("idempotency-key") idempotencyKey?: string,
    @Body() body?: { responses?: unknown },
  ) {
    return this.enrollment.submit(
      publicQrToken,
      authorization?.split(" ")[1] ?? "",
      idempotencyKey ?? "",
      body?.responses,
    );
  }
}

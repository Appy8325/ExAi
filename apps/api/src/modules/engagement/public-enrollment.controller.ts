import { Body, Controller, Headers, Post } from "@nestjs/common";
import { PlatformEnrollmentService } from "./platform-enrollment.service";
@Controller("v1/public/enroll")
export class PublicEnrollmentController { constructor(private readonly enrollment: PlatformEnrollmentService) {}
  @Post() enroll(@Body() body?:{eventExhibitorId?:string;email?:unknown}) { return this.enrollment.enroll(body?.eventExhibitorId ?? "",body?.email); }
  @Post("complete") complete(@Headers("authorization") authorization?:string) { const token=authorization?.split(" ")[1]; return this.enrollment.complete(token ?? ""); }
}

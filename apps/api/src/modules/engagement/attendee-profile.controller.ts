import { Body, Controller, Headers, Put, UnauthorizedException } from "@nestjs/common";

import type { SupabaseAuthService } from "../auth/supabase-auth.service";
import type { AttendeeProfileService} from "./attendee-profile.service";
import { type UpdateAttendeeProfileInput } from "./attendee-profile.service";

@Controller("v1/attendee/profile")
export class AttendeeProfileController {
  constructor(
    private readonly auth: SupabaseAuthService,
    private readonly profiles: AttendeeProfileService,
  ) {}

  @Put()
  async update(
    @Headers("authorization") authorization: string | undefined,
    @Body() body: UpdateAttendeeProfileInput,
  ) {
    const identity = await this.auth.identity(bearerToken(authorization));
    if (!identity) throw new UnauthorizedException("Authentication required.");
    return this.profiles.update(identity.id, body);
  }
}

function bearerToken(authorization: string | undefined) {
  const [scheme, token] = authorization?.split(" ") ?? [];
  return scheme === "Bearer" && token ? token : "";
}

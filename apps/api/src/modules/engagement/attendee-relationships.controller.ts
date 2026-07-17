import { Controller, Delete, Get, Headers, Param, Post, Query } from "@nestjs/common";

import { AttendeeRelationshipsService } from "./attendee-relationships.service";

@Controller("v1/attendee/relationships")
export class AttendeeRelationshipsController {
  constructor(private readonly relationships: AttendeeRelationshipsService) {}

  @Get()
  listSaved(@Query("eventId") eventId: string, @Headers("authorization") authorization?: string) {
    const token = bearerToken(authorization);
    return this.relationships.listSaved(eventId, token);
  }

  @Post(":exhibitorId")
  save(@Param("exhibitorId") exhibitorId: string, @Headers("authorization") authorization?: string) {
    return this.relationships.save(exhibitorId, bearerToken(authorization));
  }

  @Delete(":exhibitorId")
  unsave(@Param("exhibitorId") exhibitorId: string, @Headers("authorization") authorization?: string) {
    return this.relationships.unsave(exhibitorId, bearerToken(authorization));
  }
}

function bearerToken(authorization: string | undefined) {
  const [scheme, token] = authorization?.split(" ") ?? [];
  return scheme === "Bearer" && token ? token : "";
}

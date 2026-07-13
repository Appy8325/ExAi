import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { sql } from "drizzle-orm";
import { DATABASE_CLIENT, type DatabaseClient } from "../../common/database-client";
import { Inject } from "@nestjs/common";
import { SupabaseAuthService } from "../auth/supabase-auth.service";
import { LeadSubmissionsService } from "./lead-submissions.service";

@Injectable()
export class PlatformEnrollmentService {
  constructor(@Inject(DATABASE_CLIENT) private readonly database: DatabaseClient, private readonly auth: SupabaseAuthService, private readonly relationships: LeadSubmissionsService) {}
  async enroll(eventExhibitorId: string, email: string) {
    const normalized = email.trim().toLowerCase(); if (!/^\S+@\S+\.\S+$/.test(normalized)) throw new BadRequestException("A valid email is required.");
    const booth = await this.database.execute(sql<{ organization_id:string }>`SELECT organization_id FROM event_exhibitors WHERE id=${eventExhibitorId} AND status NOT IN ('archived','withdrawn')`);
    if (!(booth as unknown as { organization_id:string }[])[0]) throw new NotFoundException("Booth not found.");
    await this.database.execute(sql`INSERT INTO public_enrollments(event_exhibitor_id,email) VALUES (${eventExhibitorId},${normalized}) ON CONFLICT (event_exhibitor_id,email) WHERE status='pending' DO UPDATE SET created_at=now()`);
    try { await this.auth.sendMagicLink(normalized); } catch { throw new BadRequestException("Unable to send magic link."); } return { accepted:true };
  }
  async complete(accessToken: string) {
    const user=await this.auth.identity(accessToken); if(!user) throw new UnauthorizedException("Authentication required.");
    const rows=await this.database.execute(sql<{ event_exhibitor_id:string; organization_id:string }>`SELECT enrollment.event_exhibitor_id, booth.organization_id FROM public_enrollments enrollment JOIN event_exhibitors booth ON booth.id=enrollment.event_exhibitor_id JOIN users attendee ON attendee.id=${user.id} AND attendee.email=enrollment.email WHERE enrollment.status='pending' ORDER BY enrollment.created_at DESC LIMIT 1`);
    const enrollment=(rows as unknown as {event_exhibitor_id:string;organization_id:string}[])[0]; if(!enrollment) throw new NotFoundException("Pending enrollment not found.");
    const relationship=await this.relationships.ensureRelationship({organizationId:enrollment.organization_id,actorUserId:user.id,eventExhibitorId:enrollment.event_exhibitor_id,attendeeUserId:user.id});
    await this.database.execute(sql`UPDATE public_enrollments SET status='completed',completed_at=now() WHERE event_exhibitor_id=${enrollment.event_exhibitor_id} AND email=${user.email} AND status='pending'`);
    return relationship;
  }
}

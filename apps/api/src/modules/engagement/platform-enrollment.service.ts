import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { sql } from "drizzle-orm";
import { DATABASE_CLIENT, type DatabaseClient } from "../../common/database-client";
import { Inject } from "@nestjs/common";
import { SupabaseAuthService } from "../auth/supabase-auth.service";
import { LeadSubmissionsService } from "./lead-submissions.service";

@Injectable()
export class PlatformEnrollmentService {
  constructor(@Inject(DATABASE_CLIENT) private readonly database: DatabaseClient, private readonly auth: SupabaseAuthService, private readonly relationships: LeadSubmissionsService) {}
  async findPublicBooth(publicQrToken: string) {
    const rows = await this.database.execute(sql<{ id:string; company_name:string; booth_name:string; booth_number:string|null; logo_url:string|null; description:string|null; website:string|null; event_slug:string }>`SELECT booth.id, organization.name AS company_name, booth.booth_name, booth.booth_number, booth.logo_url, booth.description, booth.website, events.slug AS event_slug FROM event_exhibitors booth JOIN organizations organization ON organization.id=booth.organization_id JOIN events events ON events.id=booth.event_id WHERE booth.id=${publicQrToken} AND booth.status NOT IN ('archived','withdrawn') LIMIT 1`);
    const booth = (rows as unknown as { id:string; company_name:string; booth_name:string; booth_number:string|null; logo_url:string|null; description:string|null; website:string|null; event_slug:string }[])[0];
    if (!booth) throw new NotFoundException("Booth not found.");
    return { id: booth.id, companyName: booth.company_name, boothName: booth.booth_name, boothNumber: booth.booth_number, logoUrl: booth.logo_url, description: booth.description, website: booth.website, eventSlug: booth.event_slug };
  }
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

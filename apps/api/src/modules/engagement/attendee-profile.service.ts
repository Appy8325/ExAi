import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { setRlsContext } from "@concourse/database";
import { attendeeProfileConsents, attendeeProfiles, users } from "@concourse/database/schema";
import { eq } from "drizzle-orm";

import { DATABASE_CLIENT, type DatabaseClient } from "../../common/database-client";

export type UpdateAttendeeProfileInput = {
  fullName: string;
  company: string;
  jobTitle: string;
  shareProfileWithExhibitors: boolean;
};

@Injectable()
export class AttendeeProfileService {
  constructor(@Inject(DATABASE_CLIENT) private readonly database: DatabaseClient) {}

  async update(userId: string, input: UpdateAttendeeProfileInput) {
    const profile = {
      fullName: requiredText(input.fullName, "Name"),
      company: requiredText(input.company, "Company"),
      jobTitle: requiredText(input.jobTitle, "Job title"),
      shareProfileWithExhibitors: input.shareProfileWithExhibitors === true,
    };

    return this.database.transaction(async (tx) => {
      await setRlsContext(tx, "", userId);
      const [user] = await tx
        .update(users)
        .set({ fullName: profile.fullName, updatedAt: new Date() })
        .where(eq(users.id, userId))
        .returning({ id: users.id });
      if (!user) throw new NotFoundException("Attendee not found.");

      await tx
        .insert(attendeeProfiles)
        .values({ userId, company: profile.company, jobTitle: profile.jobTitle })
        .onConflictDoUpdate({
          target: attendeeProfiles.userId,
          set: { company: profile.company, jobTitle: profile.jobTitle, updatedAt: new Date() },
        });
      await tx
        .insert(attendeeProfileConsents)
        .values({ userId, shareProfileWithExhibitors: profile.shareProfileWithExhibitors })
        .onConflictDoUpdate({
          target: attendeeProfileConsents.userId,
          set: { shareProfileWithExhibitors: profile.shareProfileWithExhibitors, updatedAt: new Date() },
        });

      return profile;
    });
  }
}

function requiredText(value: string, label: string) {
  const normalized = value?.trim();
  if (!normalized) throw new BadRequestException(`${label} is required.`);
  return normalized;
}

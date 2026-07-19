"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";

import { generateOrganizerReport } from "@/lib/organizer";

export async function generateEventReport(formData: FormData) {
  const eventId = formData.get("eventId");
  if (typeof eventId !== "string" || !eventId) return;
  await generateOrganizerReport(eventId, randomUUID());
  revalidatePath(`/org/events/${eventId}/reports`);
}

export type RelationshipWorkspace = {
  attendee: { id: string; name: string | null; company: string | null; title: string | null; industry: string | null; contact: { email: string | null; linkedInUrl: string | null }; profileCompleteness: number; consentStatus: "shared" | "not_shared" };
  relationship: { id: string; eventExhibitorId: string; status: string; firstInteractionAt: string; latestInteractionAt: string; interactionCount: number; hasPotentialDuplicate: boolean; updatedAt: string };
  timeline: Array<{ id: string; submittedAt: string; interactionSource: string; potentialDuplicate: boolean; form: { id: string; name: string; description: string | null }; values: Array<{ fieldId: string; value: unknown; field: Record<string, unknown> }> }>;
  notes: Array<{ id: string; body: string; createdByUserId: string; createdAt: string; updatedAt: string }>;
  summary: { interactionCount: number; lastActivityAt: string; noteCount: number; profileCompleteness: number };
};

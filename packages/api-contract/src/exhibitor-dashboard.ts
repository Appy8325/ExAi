export type ExhibitorDashboard = {
  intelligenceFeed: { profilesEnriched: number; completeProfiles: number; items: Array<{ id: string; at: string; relationshipId: string; label: string }> };
  sinceLastVisited: { since: string | null; newRelationships: number; profilesEnriched: number; returningVisitors: number; notesAdded: number; completeProfiles: number };
  pipeline: { new: number; active: number; returning: number; needsFollowUp: number };
  recentActivity: Array<{ id: string; at: string; type: "submission" | "note" | "profile"; relationshipId: string; label: string }>;
  attention: Array<{ relationshipId: string; attendeeName: string | null; reasons: string[] }>;
  performance: { qrScans: number; relationshipsCreated: number; returningVisitors: number; profileCompletion: number; formCompletionRate: number };
};

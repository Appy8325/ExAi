import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AttendeeListScreen } from "./attendee-list-screen";

const dashboard = {
  attention: [{ relationshipId: "relationship-1", attendeeName: "Avery", reasons: ["new"] }],
  intelligenceFeed: { profilesEnriched: 0, completeProfiles: 0, items: [] },
  performance: { qrScans: 0, relationshipsCreated: 1, returningVisitors: 0, profileCompletion: 0, formCompletionRate: 0 },
  pipeline: { new: 0, active: 0, returning: 0, needsFollowUp: 0 },
  recentActivity: [],
  sinceLastVisited: { since: null, newRelationships: 0, profilesEnriched: 0, returningVisitors: 0, notesAdded: 0, completeProfiles: 0 },
};

describe("AttendeeListScreen", () => {
  it("links only real relationships", () => {
    const html = renderToStaticMarkup(<AttendeeListScreen dashboard={dashboard} organizationId="org" />);
    expect(html).toContain('/exhibit/org/relationships/relationship-1');
    expect(html).not.toContain('/exhibit/org/relationships/pipeline-new');
  });
});

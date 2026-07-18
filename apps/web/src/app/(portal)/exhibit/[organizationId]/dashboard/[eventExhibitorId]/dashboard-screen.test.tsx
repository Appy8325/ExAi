import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { ExhibitorDashboard } from "@concourse/api-client";
import { DashboardScreen } from "./dashboard-screen";

vi.mock("next/navigation", () => ({
  useParams: () => ({ organizationId: "organization" }),
  usePathname: () => "/exhibit/organization/dashboard/event-exhibitor",
}));

const dashboard: ExhibitorDashboard = { intelligenceFeed: { profilesEnriched: 1, completeProfiles: 1, items: [] }, sinceLastVisited: { since: null, newRelationships: 2, profilesEnriched: 1, returningVisitors: 1, notesAdded: 1, completeProfiles: 1 }, pipeline: { new: 1, active: 2, returning: 1, needsFollowUp: 1 }, recentActivity: [], attention: [], performance: { qrScans: 2, relationshipsCreated: 2, returningVisitors: 1, profileCompletion: 50, formCompletionRate: 100 } };
describe("DashboardScreen", () => {
  it("renders action-focused sections and useful empty states", () => { const html = renderToStaticMarkup(<DashboardScreen dashboard={dashboard} />); expect(html).toContain("AI Insights"); expect(html).toContain("No relationships need attention right now"); expect(html).toContain("Recent Activity"); });
});

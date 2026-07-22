import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { ExhibitorDashboard } from "@concourse/api-client";
import { DashboardScreen } from "./dashboard-screen";

vi.mock("next/navigation", () => ({
  useParams: () => ({ organizationId: "organization" }),
  usePathname: () => "/exhibit/organization/dashboard/event-exhibitor",
}));

const dashboard: ExhibitorDashboard = {
  intelligenceFeed: { profilesEnriched: 1, completeProfiles: 1, items: [] },
  sinceLastVisited: { since: null, newRelationships: 2, profilesEnriched: 1, returningVisitors: 1, notesAdded: 1, completeProfiles: 1 },
  pipeline: { new: 1, active: 2, returning: 1, needsFollowUp: 1 },
  recentActivity: [],
  attention: [],
  performance: { qrScans: 2, relationshipsCreated: 2, returningVisitors: 1, profileCompletion: 50, formCompletionRate: 100 },
};

describe("DashboardScreen", () => {
  it("renders decision-focused layout with 4 KPIs and key sections", () => {
    const html = renderToStaticMarkup(<DashboardScreen dashboard={dashboard} />);
    expect(html).toContain("Booth Dashboard");
    expect(html).toContain("Visitors Today");
    expect(html).toContain("Scan Rate");
    expect(html).toContain("Relationships");
    expect(html).toContain("Pipeline Health");
    expect(html).toContain("Relationship Pipeline");
    expect(html).toContain("AI Intelligence");
    expect(html).toContain("Recent Activity");
  });

  it("renders empty states and action-focused content", () => {
    const html = renderToStaticMarkup(<DashboardScreen dashboard={dashboard} />);
    expect(html).toContain("No relationships need attention right now");
    expect(html).toContain("View Visitors");
    expect(html).toContain("Share QR Code");
  });

  it("renders attention items when present", () => {
    const withAttention: ExhibitorDashboard = {
      ...dashboard,
      attention: [{ relationshipId: "r1", attendeeName: "Jane Smith", reasons: ["No response in 3 days"] }],
    };
    const html = renderToStaticMarkup(<DashboardScreen dashboard={withAttention} />);
    expect(html).toContain("Requires Attention");
    expect(html).toContain("Jane Smith");
    expect(html).toContain("Open");
  });

  it("renders since-last-visit trend when data available", () => {
    const withTrend: ExhibitorDashboard = {
      ...dashboard,
      sinceLastVisited: { since: new Date().toISOString(), newRelationships: 3, profilesEnriched: 2, returningVisitors: 5, notesAdded: 1, completeProfiles: 1 },
    };
    const html = renderToStaticMarkup(<DashboardScreen dashboard={withTrend} />);
    expect(html).toContain("Since Your Last Visit");
    expect(html).toContain("+3");
    expect(html).toContain("returning since last visit");
  });
});
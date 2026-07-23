import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { ExhibitorDashboard } from "@concourse/api-client";
import { DashboardScreen } from "./dashboard-screen";

vi.mock("next/navigation", () => ({
  useParams: () => ({ organizationId: "organization" }),
  usePathname: () => "/exhibit/organization/dashboard/event-exhibitor",
}));

const defaultBoothInfo = {
  companyName: "Acme Corp",
  eventName: "TechExpo 2026",
  boothName: "Main Pavilion",
  boothNumber: "A-01",
};

const dashboard: ExhibitorDashboard = {
  intelligenceFeed: { profilesEnriched: 1, completeProfiles: 1, items: [] },
  sinceLastVisited: { since: null, newRelationships: 2, profilesEnriched: 1, returningVisitors: 1, notesAdded: 1, completeProfiles: 1 },
  pipeline: { new: 1, active: 2, returning: 1, needsFollowUp: 1 },
  recentActivity: [],
  attention: [],
  performance: { qrScans: 2, relationshipsCreated: 2, returningVisitors: 1, profileCompletion: 50, formCompletionRate: 100 },
};

describe("DashboardScreen", () => {
  it("renders booth identity in header", () => {
    const html = renderToStaticMarkup(<DashboardScreen dashboard={dashboard} boothInfo={defaultBoothInfo} />);
    expect(html).toContain("Acme Corp");
    expect(html).toContain("Booth A-01");
    expect(html).toContain("TechExpo 2026");
  });

  it("renders four decision-focused KPIs", () => {
    const html = renderToStaticMarkup(<DashboardScreen dashboard={dashboard} boothInfo={defaultBoothInfo} />);
    expect(html).toContain("Visitors Today");
    expect(html).toContain("Scans per Visitor");
    expect(html).toContain("Relationships");
    expect(html).toContain("Profile Completion");
    expect(html).not.toContain("Pipeline Health");
  });

  it("renders primary CTA and secondary actions", () => {
    const html = renderToStaticMarkup(<DashboardScreen dashboard={dashboard} boothInfo={defaultBoothInfo} />);
    expect(html).toContain("Share QR Code");
    expect(html).toContain("View Visitors");
    expect(html).toContain("Booth Settings");
  });

  it("renders relationship pipeline and attention sections", () => {
    const html = renderToStaticMarkup(<DashboardScreen dashboard={dashboard} boothInfo={defaultBoothInfo} />);
    expect(html).toContain("Relationship Pipeline");
    expect(html).toContain("All clear");
  });

  it("renders AI intelligence with first-run empty state", () => {
    const html = renderToStaticMarkup(<DashboardScreen dashboard={dashboard} boothInfo={defaultBoothInfo} />);
    expect(html).toContain("AI Intelligence");
    expect(html).toContain("How AI Insights Work");
    expect(html).toContain("High-value leads identified automatically");
  });

  it("renders attention items with open links when present", () => {
    const withAttention: ExhibitorDashboard = {
      ...dashboard,
      attention: [{ relationshipId: "r1", attendeeName: "Jane Smith", reasons: ["No response in 3 days"] }],
    };
    const html = renderToStaticMarkup(<DashboardScreen dashboard={withAttention} organizationId="organization" boothInfo={defaultBoothInfo} />);
    expect(html).toContain("Requires Attention");
    expect(html).toContain("Jane Smith");
    expect(html).toContain("Open");
  });

  it("renders since-last-visit data when available", () => {
    const withVisit: ExhibitorDashboard = {
      ...dashboard,
      sinceLastVisited: {
        since: new Date().toISOString(),
        newRelationships: 3,
        profilesEnriched: 2,
        returningVisitors: 5,
        notesAdded: 1,
        completeProfiles: 1,
      },
      intelligenceFeed: { profilesEnriched: 0, completeProfiles: 0, items: [] },
    };
    const html = renderToStaticMarkup(<DashboardScreen dashboard={withVisit} boothInfo={defaultBoothInfo} />);
    expect(html).toContain("Since Your Last Visit");
    expect(html).toContain("+3");
    expect(html).toContain("+5");
  });

  it("renders intelligence feed items when available", () => {
    const withFeed: ExhibitorDashboard = {
      ...dashboard,
      intelligenceFeed: {
        profilesEnriched: 5,
        completeProfiles: 3,
        items: [
          { id: "i1", at: new Date().toISOString(), relationshipId: "r1", label: "Profile enriched for Acme Inc" },
        ],
      },
    };
    const html = renderToStaticMarkup(<DashboardScreen dashboard={withFeed} boothInfo={defaultBoothInfo} />);
    expect(html).toContain("Intelligence Feed");
    expect(html).toContain("Profile enriched for Acme Inc");
  });

  it("renders progressive disclosure for recent activity", () => {
    const withActivity: ExhibitorDashboard = {
      ...dashboard,
      recentActivity: [
        { id: "a1", at: new Date().toISOString(), type: "note" as const, relationshipId: "r1", label: "Added a note" },
      ],
    };
    const html = renderToStaticMarkup(<DashboardScreen dashboard={withActivity} boothInfo={defaultBoothInfo} />);
    expect(html).toContain("Recent Activity");
  });
});

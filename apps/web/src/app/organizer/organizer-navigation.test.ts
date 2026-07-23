import { describe, expect, it } from "vitest";

import { isOrganizationNavItemActive } from "./organizer-navigation";

describe("organization navigation", () => {
  it("keeps the dashboard exact and highlights nested organization routes", () => {
    expect(isOrganizationNavItemActive("/organizer/events", "/organizer")).toBe(false);
    expect(isOrganizationNavItemActive("/organizer/events", "/organizer/events")).toBe(true);
    expect(isOrganizationNavItemActive("/organizer/events/event-1", "/organizer/events")).toBe(true);
  });
});

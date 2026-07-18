import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { BoothExperience } from "./booth-experience";

const booth = {
  id: "booth-id",
  companyName: "Acme",
  boothName: "Acme Pavilion",
  boothNumber: "A-01",
  logoUrl: null,
  description: "Relationship intelligence",
  website: null,
  eventSlug: "techexpo-2027",
};

describe("BoothExperience", () => {
  it("renders the mobile-first public booth and connect action", () => {
    const html = renderToStaticMarkup(<BoothExperience booth={booth} publicQrToken="qr-token" connected={false} />);

    expect(html).toContain("Acme");
    expect(html).toContain("Products &amp; services");
    expect(html).toContain("Connect with this exhibitor");
  });

  it("shows the accessible profile and consent step after enrollment", () => {
    const html = renderToStaticMarkup(<BoothExperience booth={booth} publicQrToken="qr-token" connected />);

    expect(html).toContain("Complete your profile");
    expect(html).toContain('name="shareProfileWithExhibitors"');
    expect(html).toContain("Share my professional profile with Acme");
  });
});

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { BoothExperience } from "./booth-experience";

process.env.NEXT_PUBLIC_API_BASE_URL = "http://127.0.0.1:3001";

const booth = {
  id: "booth-id",
  companyName: "Acme",
  boothName: "Acme Pavilion",
  boothNumber: "A-01",
  logoUrl: null,
  description: "Relationship intelligence",
  website: null,
  eventSlug: "techexpo-2027",
  privacyPolicyUrl: "https://acme.example/privacy",
  resources: [
    {
      id: "resource-id",
      title: "Product guide",
      sourceType: "brochure",
      href: "/resource",
      external: false,
    },
  ],
  leadForm: {
    name: "Stay in touch",
    description: "Tell us what interests you.",
    consentText: "I agree to share these details with Acme.",
    fields: [
      {
        key: "email",
        label: "Email",
        type: "email",
        required: true,
        placeholder: null,
        helpText: null,
        validation: {},
      },
    ],
  },
};

describe("BoothExperience", () => {
  it("renders the mobile-first public booth and connect action", () => {
    const html = renderToStaticMarkup(
      <BoothExperience
        booth={booth}
        publicQrToken="qr-token"
        connected={false}
      />,
    );

    expect(html).toContain("Acme");
    expect(html).toContain("Products &amp; services");
    expect(html).toContain("Connect with this exhibitor");
    expect(html).toContain("Published resources");
    expect(html).toContain("Ask the company AI");
  });

  it("shows the accessible profile and consent step after enrollment", () => {
    const html = renderToStaticMarkup(
      <BoothExperience booth={booth} publicQrToken="qr-token" connected />,
    );

    expect(html).toContain("Complete your profile");
    expect(html).toContain('name="shareProfileWithExhibitors"');
    expect(html).toContain("Share my professional profile with Acme");
  });
});

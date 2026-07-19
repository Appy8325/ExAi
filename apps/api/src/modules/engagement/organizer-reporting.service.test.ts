import { describe, expect, it } from "vitest";

import { textPdf } from "./organizer-reporting.service";

describe("organizer reporting", () => {
  it("creates a valid downloadable PDF from report text", () => {
    const report = [
      "Executive summary (verified)",
      ...Array.from({ length: 49 }, (_, index) => `Report line ${index}`),
    ].join("\n");
    const pdf = textPdf(report);

    expect(pdf.subarray(0, 8).toString()).toBe("%PDF-1.4");
    expect(pdf.toString()).toContain("xref");
    expect(pdf.toString()).toContain("Executive summary \\(verified\\)");
    expect(pdf.toString()).toContain("/Count 2");
    expect(pdf.toString()).toContain("Report line 48");
  });
});

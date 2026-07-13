import { BadRequestException } from "@nestjs/common";
import { describe, expect, it } from "vitest";
import { profilePrefill, validateSubmission } from "./lead-submissions.validation";

const fields = [{ id: "email", key: "email", label: "Email", type: "email", required: true, validation: {} }, { id: "choice", key: "choice", label: "Choice", type: "dropdown", required: false, validation: { options: ["a", "b"] } }];
describe("validateSubmission", () => {
  it("accepts valid required responses", () => expect(() => validateSubmission(fields, { email: "a@example.com", choice: "a" })).not.toThrow());
  it("rejects missing required, malformed, and unknown responses", () => {
    expect(() => validateSubmission(fields, {})).toThrow(BadRequestException);
    expect(() => validateSubmission(fields, { email: "invalid" })).toThrow(BadRequestException);
    expect(() => validateSubmission(fields, { email: "a@example.com", extra: "x" })).toThrow(BadRequestException);
    expect(() => validateSubmission(fields, { email: "a@example.com", choice: "c" })).toThrow(BadRequestException);
  });
  it("prefills only fields backed by the global attendee identity", () => expect(profilePrefill([{ key: "email", type: "email" }, { key: "full_name", type: "text" }, { key: "notes", type: "text" }], { email: "a@example.com", fullName: "Attendee" })).toEqual({ email: "a@example.com", full_name: "Attendee" }));
});

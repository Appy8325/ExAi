import { BadRequestException } from "@nestjs/common";

export type SubmissionField = { id: string; key: string; label: string; type: string; required: boolean; validation: unknown };

export function validateSubmission(fields: SubmissionField[], responses: Record<string, unknown>) {
  const known = new Set(fields.map((field) => field.key));
  for (const key of Object.keys(responses)) if (!known.has(key)) throw new BadRequestException(`Unknown lead form field: ${key}.`);
  for (const field of fields) {
    const value = responses[field.key];
    if (field.required && empty(value)) throw new BadRequestException(`${field.label} is required.`);
    if (!empty(value)) validateValue(field, value);
  }
}

export function profilePrefill(fields: Array<{ key: string; type: string }>, profile: { email: string; fullName: string }) {
  return Object.fromEntries(fields.flatMap((field) => field.type === "email" || field.key === "email" ? [[field.key, profile.email]] : ["name", "full_name", "fullName"].includes(field.key) ? [[field.key, profile.fullName]] : []));
}

function empty(value: unknown) { return value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0); }
function validateValue(field: SubmissionField, value: unknown) {
  if (["text", "multiline_text", "phone", "company", "job_title", "hidden", "file_upload_reference"].includes(field.type) && typeof value !== "string") throw new BadRequestException(`${field.label} must be text.`);
  if (field.type === "number" && (typeof value !== "number" || !Number.isFinite(value))) throw new BadRequestException(`${field.label} must be a number.`);
  if (field.type === "email" && (typeof value !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))) throw new BadRequestException(`${field.label} must be an email address.`);
  if (field.type === "url" && (typeof value !== "string" || !/^https?:\/\//.test(value))) throw new BadRequestException(`${field.label} must be an HTTP(S) URL.`);
  if (field.type === "date" && (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))) throw new BadRequestException(`${field.label} must be an ISO date.`);
  if (["checkbox", "consent_checkbox"].includes(field.type) && typeof value !== "boolean") throw new BadRequestException(`${field.label} must be true or false.`);
  if (field.type === "rating" && (typeof value !== "number" || !Number.isFinite(value))) throw new BadRequestException(`${field.label} must be a rating.`);
  if (field.type === "multi_select" && !Array.isArray(value)) throw new BadRequestException(`${field.label} must be a list.`);
  const options = optionValues(field.validation);
  if (options && (["dropdown", "radio"].includes(field.type) ? !options.includes(value as string) : field.type === "multi_select" && (value as unknown[]).some((item) => !options.includes(item as string)))) throw new BadRequestException(`${field.label} has an invalid option.`);
}
function optionValues(validation: unknown): string[] | undefined { if (!validation || typeof validation !== "object" || !Array.isArray((validation as { options?: unknown }).options)) return undefined; return (validation as { options: unknown[] }).options.filter((option): option is string => typeof option === "string"); }

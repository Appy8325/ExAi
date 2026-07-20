"use client";

import { useState } from "react";

import { submitBoothLead } from "@concourse/api-client";
import { getApiBaseUrl } from "@/lib/api/config";

type Field = {
  key: string;
  label: string;
  type: string;
  required: boolean;
  placeholder: string | null;
  helpText: string | null;
};

export function BoothLeadForm({ fields, token }: { fields: Field[]; token: string }) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");

    const formData = new FormData(e.currentTarget);
    const responses: Record<string, unknown> = {};
    for (const field of fields) {
      responses[field.key] = formData.get(field.key) ?? "";
    }

    const apiBase = getApiBaseUrl();
    const idempotencyKey = crypto.randomUUID();

    try {
      const result = await submitBoothLead(
        { baseUrl: apiBase, accessToken: "", fetch: fetch },
        token,
        idempotencyKey,
        responses,
      );
      if (result.accepted) {
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="mt-4 rounded-2xl border border-status-success-border bg-status-success-subtle p-5 text-sm text-status-success-text">
        Your information has been submitted successfully!
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="mt-4">
        <div className="rounded-2xl border border-status-danger-border bg-status-danger-subtle p-5 text-sm text-status-danger-text">
          Something went wrong. Please try again.
        </div>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-2 rounded-lg border border-default bg-surface px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-sunken"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      {fields.map((field) => (
        <div key={field.key}>
          <label className="mb-1 block text-sm font-medium text-primary">
            {field.label}
            {field.required ? <span className="ml-1 text-status-danger-text">*</span> : null}
          </label>
          {field.type === "textarea" ? (
            <textarea
              name={field.key}
              required={field.required}
              placeholder={field.placeholder ?? ""}
              className="w-full rounded-xl border border-default bg-surface px-4 py-2.5 text-sm text-primary placeholder-muted outline-none focus:border-brand"
              rows={3}
            />
          ) : (
            <input
              type={field.type === "email" ? "email" : "text"}
              name={field.key}
              required={field.required}
              placeholder={field.placeholder ?? ""}
              className="w-full rounded-xl border border-default bg-surface px-4 py-2.5 text-sm text-primary placeholder-muted outline-none focus:border-brand"
            />
          )}
          {field.helpText ? (
            <p className="mt-1 text-xs text-muted">{field.helpText}</p>
          ) : null}
        </div>
      ))}
      <button
        type="submit"
        disabled={status === "submitting"}
        className="rounded-xl bg-brand px-6 py-2.5 text-sm font-semibold text-on-brand transition-colors hover:bg-brand-hover disabled:opacity-50"
      >
        {status === "submitting" ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}
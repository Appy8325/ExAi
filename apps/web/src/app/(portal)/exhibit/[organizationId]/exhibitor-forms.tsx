"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  completeExhibitorSource,
  createExhibitorSource,
  generateExhibitorQr,
  publishExhibitorBooth,
  publishExhibitorLeadForm,
  removeExhibitorSource,
  retryExhibitorSource,
  saveExhibitorLeadForm,
  updateExhibitorBooth,
  type ExhibitorLeadField,
  type ExhibitorQr,
  type ExhibitorWorkspace,
} from "@concourse/api-client";

import { getApiBaseUrl } from "@/lib/api/config";
import { createClient } from "@/lib/supabase/client";

export function BoothProfileForm({
  workspace,
}: {
  workspace: ExhibitorWorkspace;
}) {
  const router = useRouter();
  const [notice, setNotice] = useState("");
  const [pending, startTransition] = useTransition();
  const { booth, organization } = workspace;
  return (
    <form
      className="grid gap-4 rounded-xl border border-default bg-surface p-6 sm:grid-cols-2"
      onSubmit={(event) => {
        event.preventDefault();
        const form = event.currentTarget;
        startTransition(async () => {
          setNotice("");
          try {
            const data = new FormData(form);
            await updateExhibitorBooth(
              await apiClient(),
              organization.id,
              booth.id,
              {
                companyName: String(data.get("companyName") ?? ""),
                boothName: String(data.get("boothName") ?? ""),
                boothNumber: nullable(data.get("boothNumber")),
                description: String(data.get("description") ?? ""),
                website: String(data.get("website") ?? ""),
                contactEmail: String(data.get("contactEmail") ?? ""),
                contactPhone: nullable(data.get("contactPhone")),
                logoUrl: nullable(data.get("logoUrl")),
                bannerUrl: nullable(data.get("bannerUrl")),
                primaryColor: String(data.get("primaryColor") ?? ""),
              },
            );
            setNotice("Booth profile saved.");
            router.refresh();
          } catch (cause) {
            setNotice(errorMessage(cause));
          }
        });
      }}
    >
      <Field
        label="Company name"
        name="companyName"
        defaultValue={organization.name}
        required
      />
      <Field
        label="Booth name"
        name="boothName"
        defaultValue={booth.boothName}
        required
      />
      <Field
        label="Booth number"
        name="boothNumber"
        defaultValue={booth.boothNumber ?? ""}
      />
      <Field
        label="Website"
        name="website"
        type="url"
        defaultValue={booth.website ?? organization.websiteUrl ?? ""}
        required
      />
      <Field
        label="Contact email"
        name="contactEmail"
        type="email"
        defaultValue={booth.contactEmail ?? ""}
        required
      />
      <Field
        label="Contact phone"
        name="contactPhone"
        type="tel"
        defaultValue={booth.contactPhone ?? ""}
      />
      <Field
        label="Logo URL"
        name="logoUrl"
        type="url"
        defaultValue={booth.logoUrl ?? ""}
      />
      <Field
        label="Banner URL"
        name="bannerUrl"
        type="url"
        defaultValue={booth.bannerUrl ?? ""}
      />
      <Field
        label="Brand color"
        name="primaryColor"
        type="color"
        defaultValue={booth.primaryColor}
        required
      />
      <label className="grid gap-1 text-sm text-secondary sm:col-span-2">
        Public booth description
        <textarea
          className="min-h-32 rounded-md border border-default bg-surface p-3 text-primary"
          defaultValue={booth.description ?? ""}
          maxLength={4000}
          name="description"
          required
        />
      </label>
      <div className="flex items-center gap-3 sm:col-span-2">
        <Submit pending={pending}>Save booth</Submit>
        <Notice value={notice} />
      </div>
    </form>
  );
}

export function PublishBoothPanel({
  workspace,
}: {
  workspace: ExhibitorWorkspace;
}) {
  const router = useRouter();
  const [notice, setNotice] = useState("");
  const [pending, startTransition] = useTransition();
  const published = workspace.booth.status === "ready";
  return (
    <section className="rounded-xl border border-default bg-surface p-6">
      <h2 className="font-semibold text-primary">Publication</h2>
      <p className="mt-2 text-sm text-secondary">
        {published
          ? "This booth is published and available to attendees."
          : "A complete profile and published lead form are required."}
      </p>
      <div className="mt-4 flex items-center gap-3">
        <button
          className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-on-brand disabled:opacity-60"
          disabled={pending || published}
          onClick={() =>
            startTransition(async () => {
              setNotice("");
              try {
                await publishExhibitorBooth(
                  await apiClient(),
                  workspace.organization.id,
                  workspace.booth.id,
                );
                setNotice("Booth published.");
                router.refresh();
              } catch (cause) {
                setNotice(errorMessage(cause));
              }
            })
          }
          type="button"
        >
          {published ? "Published" : pending ? "Publishing…" : "Publish booth"}
        </button>
        <Notice value={notice} />
      </div>
    </section>
  );
}

export function KnowledgeSources({
  workspace,
}: {
  workspace: ExhibitorWorkspace;
}) {
  const router = useRouter();
  const [sourceType, setSourceType] = useState("pdf");
  const [notice, setNotice] = useState("");
  const [pending, startTransition] = useTransition();
  return (
    <div className="space-y-6">
      <form
        className="grid gap-4 rounded-xl border border-default bg-surface p-6 sm:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          const form = event.currentTarget;
          startTransition(async () => {
            setNotice("");
            try {
              const data = new FormData(form);
              const client = await apiClient();
              const file = data.get("file");
              const created = await createExhibitorSource(
                client,
                workspace.organization.id,
                workspace.booth.id,
                sourceType === "website"
                  ? {
                      sourceType,
                      title: String(data.get("title") ?? ""),
                      sourceUrl: String(data.get("sourceUrl") ?? ""),
                    }
                  : {
                      sourceType,
                      title: String(data.get("title") ?? ""),
                      filename: file instanceof File ? file.name : "",
                      contentType: file instanceof File ? file.type : "",
                      byteSize: file instanceof File ? file.size : 0,
                    },
              );
              if (created.upload) {
                if (!(file instanceof File))
                  throw new Error("Choose a file to upload.");
                const upload = await fetch(created.upload.url, {
                  method: "PUT",
                  headers: { "content-type": file.type },
                  body: file,
                });
                if (!upload.ok) throw new Error("File upload failed.");
                await completeExhibitorSource(
                  client,
                  workspace.organization.id,
                  workspace.booth.id,
                  created.source.id,
                );
              }
              form.reset();
              setSourceType("pdf");
              setNotice(
                sourceType === "website"
                  ? "Website source registered."
                  : "Upload stored and awaiting security scan.",
              );
              router.refresh();
            } catch (cause) {
              setNotice(errorMessage(cause));
            }
          });
        }}
      >
        <label className="grid gap-1 text-sm text-secondary">
          Source type
          <select
            className="h-10 rounded-md border border-default bg-surface px-3 text-primary"
            name="sourceType"
            onChange={(event) => setSourceType(event.target.value)}
            value={sourceType}
          >
            <option value="pdf">PDF</option>
            <option value="brochure">Brochure</option>
            <option value="presentation">Presentation</option>
            <option value="website">Website</option>
            <option value="faq">FAQ</option>
            <option value="pricing">Pricing</option>
          </select>
        </label>
        <Field label="Display title" name="title" required />
        {sourceType === "website" ? (
          <Field
            label="Public HTTPS URL"
            name="sourceUrl"
            type="url"
            required
          />
        ) : (
          <label className="grid gap-1 text-sm text-secondary sm:col-span-2">
            File
            <input
              className="rounded-md border border-default bg-surface p-2 text-primary"
              name="file"
              type="file"
              accept={
                sourceType === "presentation" ? ".pdf,.pptx" : ".pdf,.txt"
              }
              required
            />
          </label>
        )}
        <div className="flex items-center gap-3 sm:col-span-2">
          <Submit pending={pending}>
            {sourceType === "website" ? "Add website" : "Upload source"}
          </Submit>
          <Notice value={notice} />
        </div>
      </form>
      <section className="rounded-xl border border-default bg-surface">
        <h2 className="border-b border-default px-5 py-4 font-semibold text-primary">
          Company knowledge
        </h2>
        {workspace.sources.length ? (
          <ul className="divide-y divide-default">
            {workspace.sources.map((source) => (
              <li
                className="flex items-center justify-between gap-4 px-5 py-4"
                key={source.id}
              >
                <div>
                  <p className="font-medium text-primary">{source.title}</p>
                  <p className="mt-1 text-xs text-secondary">
                    {source.sourceType} ·{" "}
                    {source.fileStatus === "scanning"
                      ? "security scan pending"
                      : source.status.replaceAll("_", " ")}
                  </p>
                  {source.errorMessage ? (
                    <p className="mt-1 max-w-xl text-xs text-status-danger-text">
                      {source.errorMessage}
                    </p>
                  ) : null}
                </div>
                <div className="flex gap-3">
                  {source.status === "failed" ? (
                    <button className="text-sm text-brand hover:underline" disabled={pending}
                      onClick={() => startTransition(async () => {
                        try {
                          await retryExhibitorSource(await apiClient(), workspace.organization.id,
                            workspace.booth.id, source.id);
                          router.refresh();
                        } catch (cause) { setNotice(errorMessage(cause)); }
                      })} type="button">Retry</button>
                  ) : null}
                  <button
                    className="text-sm text-status-danger-text hover:underline"
                    disabled={pending}
                    onClick={() => startTransition(async () => {
                      try {
                        await removeExhibitorSource(await apiClient(), workspace.organization.id,
                          workspace.booth.id, source.id);
                        router.refresh();
                      } catch (cause) { setNotice(errorMessage(cause)); }
                    })}
                    type="button"
                  >Remove</button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="p-6 text-secondary">
            No knowledge sources uploaded yet.
          </p>
        )}
      </section>
    </div>
  );
}

type EditableField = ExhibitorLeadField & { id: string };

export function LeadFormEditor({
  workspace,
}: {
  workspace: ExhibitorWorkspace;
}) {
  const router = useRouter();
  const initial = workspace.leadForm?.fields.length
    ? workspace.leadForm.fields
    : [
        {
          key: "email",
          label: "Work email",
          type: "email",
          required: true,
          sortOrder: 0,
        },
        {
          key: "company",
          label: "Company",
          type: "company",
          required: false,
          sortOrder: 1,
        },
        {
          key: "consent",
          label: "I agree to be contacted",
          type: "consent_checkbox",
          required: true,
          sortOrder: 2,
        },
      ];
  const [fields, setFields] = useState<EditableField[]>(
    initial.map((field, index) => ({ ...field, id: `${field.key}-${index}` })),
  );
  const [notice, setNotice] = useState("");
  const [pending, startTransition] = useTransition();

  const update = (id: string, values: Partial<EditableField>) =>
    setFields((current) =>
      current.map((field) =>
        field.id === id ? { ...field, ...values } : field,
      ),
    );

  return (
    <form
      className="space-y-5 rounded-xl border border-default bg-surface p-6"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        startTransition(async () => {
          setNotice("");
          try {
            await saveExhibitorLeadForm(
              await apiClient(),
              workspace.organization.id,
              workspace.booth.id,
              {
                name: String(data.get("name") ?? ""),
                description: String(data.get("description") ?? ""),
                consentText: String(data.get("consentText") ?? ""),
                fields: fields.map(({ id: _id, ...field }, sortOrder) => ({
                  ...field,
                  sortOrder,
                })),
              },
            );
            setNotice("Draft lead form saved.");
            router.refresh();
          } catch (cause) {
            setNotice(errorMessage(cause));
          }
        });
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Form name"
          name="name"
          defaultValue={workspace.leadForm?.name ?? "Connect with us"}
          required
        />
        <Field
          label="Description"
          name="description"
          defaultValue={
            workspace.leadForm?.description ?? "Tell us how we can help."
          }
        />
      </div>
      <label className="grid gap-1 text-sm text-secondary">
        Consent text
        <textarea
          className="min-h-20 rounded-md border border-default bg-surface p-3 text-primary"
          defaultValue={
            workspace.leadForm?.consentText ??
            "I agree to share these details with the exhibitor for follow-up."
          }
          name="consentText"
          required
        />
      </label>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-primary">Fields</h2>
          <button
            className="rounded-md border border-default px-3 py-2 text-sm text-primary"
            onClick={() =>
              setFields((current) => [
                ...current,
                {
                  id: crypto.randomUUID(),
                  key: `field_${current.length + 1}`,
                  label: "New field",
                  type: "text",
                  required: false,
                  sortOrder: current.length,
                },
              ])
            }
            type="button"
          >
            Add field
          </button>
        </div>
        {fields.map((field) => (
          <div
            className="grid gap-3 rounded-lg border border-default p-4 sm:grid-cols-4"
            key={field.id}
          >
            <label className="grid gap-1 text-xs text-secondary">
              Key
              <input
                className="h-9 rounded-md border border-default bg-surface px-2 text-sm text-primary"
                value={field.key}
                onChange={(event) =>
                  update(field.id, { key: event.target.value })
                }
              />
            </label>
            <label className="grid gap-1 text-xs text-secondary">
              Label
              <input
                className="h-9 rounded-md border border-default bg-surface px-2 text-sm text-primary"
                value={field.label}
                onChange={(event) =>
                  update(field.id, { label: event.target.value })
                }
              />
            </label>
            <label className="grid gap-1 text-xs text-secondary">
              Type
              <select
                className="h-9 rounded-md border border-default bg-surface px-2 text-sm text-primary"
                value={field.type}
                onChange={(event) =>
                  update(field.id, { type: event.target.value })
                }
              >
                <option value="text">Text</option>
                <option value="multiline_text">Long text</option>
                <option value="email">Email</option>
                <option value="phone">Phone</option>
                <option value="company">Company</option>
                <option value="job_title">Job title</option>
                <option value="checkbox">Checkbox</option>
                <option value="consent_checkbox">Consent</option>
              </select>
            </label>
            <div className="flex items-end justify-between gap-2">
              <label className="flex h-9 items-center gap-2 text-sm text-secondary">
                <input
                  checked={field.required}
                  onChange={(event) =>
                    update(field.id, { required: event.target.checked })
                  }
                  type="checkbox"
                />{" "}
                Required
              </label>
              <button
                className="h-9 text-sm text-status-danger-text"
                disabled={fields.length === 1}
                onClick={() =>
                  setFields((current) =>
                    current.filter((item) => item.id !== field.id),
                  )
                }
                type="button"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Submit pending={pending}>Save draft</Submit>
        <button
          className="rounded-md border border-brand px-4 py-2 text-sm font-medium text-brand disabled:opacity-60"
          disabled={pending || workspace.leadForm?.status === "published"}
          onClick={() =>
            startTransition(async () => {
              setNotice("");
              try {
                await publishExhibitorLeadForm(
                  await apiClient(),
                  workspace.organization.id,
                  workspace.booth.id,
                );
                setNotice("Lead form published.");
                router.refresh();
              } catch (cause) {
                setNotice(errorMessage(cause));
              }
            })
          }
          type="button"
        >
          {workspace.leadForm?.status === "published"
            ? "Published"
            : "Publish form"}
        </button>
        <Notice value={notice} />
      </div>
    </form>
  );
}

export function QrPanel({ workspace }: { workspace: ExhibitorWorkspace }) {
  const [qr, setQr] = useState<ExhibitorQr | null>(workspace.qr);
  const [notice, setNotice] = useState("");
  const [pending, startTransition] = useTransition();
  return (
    <section className="rounded-xl border border-default bg-surface p-6">
      {qr ? (
        <div className="grid items-center gap-6 sm:grid-cols-[320px_1fr]">
          <Image
            alt={`QR code for ${workspace.booth.boothName}`}
            height={320}
            src={qr.imageDataUrl}
            width={320}
          />
          <div>
            <h2 className="text-xl font-semibold text-primary">
              Booth QR is active
            </h2>
            <p className="mt-2 break-all text-sm text-secondary">
              {qr.publicUrl}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <a
                className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-on-brand"
                href={qr.publicUrl}
                target="_blank"
                rel="noreferrer"
              >
                Test QR
              </a>
              <a
                className="rounded-md border border-default px-4 py-2 text-sm text-primary"
                download="booth-qr.png"
                href={qr.imageDataUrl}
              >
                Download PNG
              </a>
              <button
                className="rounded-md border border-default px-4 py-2 text-sm text-primary"
                onClick={async () => {
                  await navigator.clipboard.writeText(qr.publicUrl);
                  setNotice("Link copied.");
                }}
                type="button"
              >
                Copy link
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <h2 className="text-xl font-semibold text-primary">
            Generate booth QR
          </h2>
          <p className="mt-2 text-sm text-secondary">
            Publish the booth first. The generated credential is opaque and
            revocable.
          </p>
          <button
            className="mt-4 rounded-md bg-brand px-4 py-2 text-sm font-medium text-on-brand disabled:opacity-60"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                setNotice("");
                try {
                  setQr(
                    await generateExhibitorQr(
                      await apiClient(),
                      workspace.organization.id,
                      workspace.booth.id,
                    ),
                  );
                  setNotice("QR generated.");
                } catch (cause) {
                  setNotice(errorMessage(cause));
                }
              })
            }
            type="button"
          >
            {pending ? "Generating…" : "Generate QR"}
          </button>
        </div>
      )}
      <div className="mt-3">
        <Notice value={notice} />
      </div>
    </section>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  required = false,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-1 text-sm text-secondary">
      {label}
      <input
        className="h-10 rounded-md border border-default bg-surface px-3 text-primary"
        defaultValue={defaultValue}
        name={name}
        required={required}
        type={type}
      />
    </label>
  );
}

function Submit({
  pending,
  children,
}: {
  pending: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-on-brand disabled:opacity-60"
      disabled={pending}
      type="submit"
    >
      {pending ? "Working…" : children}
    </button>
  );
}

function Notice({ value }: { value: string }) {
  return value ? (
    <p aria-live="polite" className="text-sm text-secondary">
      {value}
    </p>
  ) : null;
}

async function apiClient() {
  const { data } = await createClient().auth.getSession();
  const accessToken = data.session?.access_token;
  if (!accessToken) throw new Error("Sign in again to continue.");
  return { baseUrl: getApiBaseUrl(), accessToken };
}

function nullable(value: FormDataEntryValue | null) {
  const normalized = String(value ?? "").trim();
  return normalized || null;
}

function errorMessage(cause: unknown) {
  return cause instanceof Error ? cause.message : "Something went wrong.";
}

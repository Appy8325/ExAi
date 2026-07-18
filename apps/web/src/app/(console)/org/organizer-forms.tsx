"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { getApiBaseUrl } from "@/lib/api/config";
import { createClient } from "@/lib/supabase/client";

export function CreateOrganizationForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  return (
    <form
      className="space-y-4 rounded-xl border border-default bg-surface p-6"
      onSubmit={(event) => {
        event.preventDefault();
        const form = event.currentTarget;
        startTransition(async () => {
          setError("");
          try {
            await organizerRequest("/v1/organizer/organizations", "POST", {
              name: new FormData(form).get("name"),
            });
            form.reset();
            router.refresh();
          } catch (cause) {
            setError(message(cause));
          }
        });
      }}
    >
      <div>
        <h2 className="text-lg font-semibold text-primary">
          Create your organization
        </h2>
        <p className="mt-1 text-sm text-secondary">
          This account becomes the organization owner.
        </p>
      </div>
      <Field label="Organization name" name="name" required />
      <Submit pending={pending}>Create organization</Submit>
      <ErrorMessage error={error} />
    </form>
  );
}

export function CreateEventForm({
  organizationId,
}: {
  organizationId: string;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  return (
    <form
      className="grid gap-4 rounded-xl border border-default bg-surface p-6 sm:grid-cols-2"
      onSubmit={(event) => {
        event.preventDefault();
        const form = event.currentTarget;
        startTransition(async () => {
          setError("");
          try {
            const data = new FormData(form);
            const created = await organizerRequest<{ id: string }>(
              `/v1/organizations/${organizationId}/events`,
              "POST",
              {
                name: data.get("name"),
                timezone: data.get("timezone"),
                startAt: localIso(data.get("startAt")),
                endAt: localIso(data.get("endAt")),
              },
            );
            router.push(`/org/events/${created.id}/settings`);
          } catch (cause) {
            setError(message(cause));
          }
        });
      }}
    >
      <div className="sm:col-span-2">
        <h2 className="text-lg font-semibold text-primary">Create event</h2>
        <p className="mt-1 text-sm text-secondary">
          Start as a draft, then configure policy and branding.
        </p>
      </div>
      <Field label="Event name" name="name" required />
      <Field
        label="IANA timezone"
        name="timezone"
        defaultValue="Asia/Kolkata"
        required
      />
      <Field label="Starts" name="startAt" type="datetime-local" required />
      <Field label="Ends" name="endAt" type="datetime-local" required />
      <div className="sm:col-span-2">
        <Submit pending={pending}>Create draft event</Submit>
      </div>
      <div className="sm:col-span-2">
        <ErrorMessage error={error} />
      </div>
    </form>
  );
}

export function EventSettingsForm({
  organizationId,
  event,
}: {
  organizationId: string;
  event: {
    id: string;
    name: string;
    slug: string;
    timezone: string;
    startAt: string;
    endAt: string;
    privacyPolicyUrl: string | null;
    logoUrl: string | null;
    primaryColor: string;
  };
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();
  return (
    <form
      className="grid gap-4 rounded-xl border border-default bg-surface p-6 sm:grid-cols-2"
      onSubmit={(submitEvent) => {
        submitEvent.preventDefault();
        const form = submitEvent.currentTarget;
        startTransition(async () => {
          setError("");
          setSaved(false);
          try {
            const data = new FormData(form);
            await organizerRequest(
              `/v1/organizations/${organizationId}/events/${event.id}`,
              "PATCH",
              {
                name: data.get("name"),
                slug: data.get("slug"),
                timezone: data.get("timezone"),
                startAt: localIso(data.get("startAt")),
                endAt: localIso(data.get("endAt")),
                privacyPolicyUrl: data.get("privacyPolicyUrl"),
                logoUrl: data.get("logoUrl"),
                primaryColor: data.get("primaryColor"),
              },
            );
            setSaved(true);
            router.refresh();
          } catch (cause) {
            setError(message(cause));
          }
        });
      }}
    >
      <Field
        label="Event name"
        name="name"
        defaultValue={event.name}
        required
      />
      <Field label="Slug" name="slug" defaultValue={event.slug} required />
      <Field
        label="IANA timezone"
        name="timezone"
        defaultValue={event.timezone}
        required
      />
      <Field
        label="Primary color"
        name="primaryColor"
        type="color"
        defaultValue={event.primaryColor}
        required
      />
      <Field
        label="Starts"
        name="startAt"
        type="datetime-local"
        defaultValue={localValue(event.startAt)}
        required
      />
      <Field
        label="Ends"
        name="endAt"
        type="datetime-local"
        defaultValue={localValue(event.endAt)}
        required
      />
      <Field
        label="Privacy policy URL"
        name="privacyPolicyUrl"
        type="url"
        defaultValue={event.privacyPolicyUrl ?? ""}
        required
      />
      <Field
        label="Event logo URL"
        name="logoUrl"
        type="url"
        defaultValue={event.logoUrl ?? ""}
      />
      <div className="sm:col-span-2 flex items-center gap-3">
        <Submit pending={pending}>Save settings</Submit>
        {saved ? (
          <span className="text-sm text-status-success-text">Saved</span>
        ) : null}
      </div>
      <div className="sm:col-span-2">
        <ErrorMessage error={error} />
      </div>
    </form>
  );
}

export function PublishEventButton({
  organizationId,
  eventId,
}: {
  organizationId: string;
  eventId: string;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={pending}
        className="inline-flex h-10 items-center rounded-md bg-brand px-4 text-sm font-medium text-on-brand disabled:opacity-60"
        onClick={() =>
          startTransition(async () => {
            setError("");
            try {
              await organizerRequest(
                `/v1/organizations/${organizationId}/events/${eventId}/publish`,
                "POST",
              );
              router.refresh();
            } catch (cause) {
              setError(message(cause));
            }
          })
        }
      >
        {pending ? "Publishing…" : "Publish event"}
      </button>
      <ErrorMessage error={error} />
    </div>
  );
}

export function InviteMemberForm({
  organizationId,
}: {
  organizationId: string;
}) {
  return (
    <InvitationForm
      title="Invite team member"
      description="Send a secure Magic Link to an administrator or member."
      fields={
        <>
          <Field label="Email" name="email" type="email" required />
          <label className="grid gap-1 text-sm text-secondary">
            Role
            <select
              name="role"
              className="h-10 rounded-md border border-default bg-surface px-3 text-primary"
            >
              <option value="member">Member</option>
              <option value="admin">Administrator</option>
            </select>
          </label>
        </>
      }
      path={`/v1/organizations/${organizationId}/members/invite`}
    />
  );
}

export function InviteExhibitorForm({
  organizationId,
  eventId,
}: {
  organizationId: string;
  eventId: string;
}) {
  return (
    <InvitationForm
      title="Invite exhibitor"
      description="Send an event-scoped, expiring Magic Link."
      fields={
        <>
          <Field label="Company name" name="companyName" required />
          <Field label="Contact email" name="email" type="email" required />
        </>
      }
      path={`/v1/organizations/${organizationId}/events/${eventId}/exhibitor-invitations`}
    />
  );
}

function InvitationForm({
  title,
  description,
  fields,
  path,
}: {
  title: string;
  description: string;
  fields: React.ReactNode;
  path: string;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [pending, startTransition] = useTransition();
  return (
    <form
      className="space-y-4 rounded-xl border border-default bg-surface p-6"
      onSubmit={(event) => {
        event.preventDefault();
        const form = event.currentTarget;
        startTransition(async () => {
          setError("");
          setSent(false);
          try {
            await organizerRequest(
              path,
              "POST",
              Object.fromEntries(new FormData(form)),
            );
            form.reset();
            setSent(true);
            router.refresh();
          } catch (cause) {
            setError(message(cause));
          }
        });
      }}
    >
      <div>
        <h2 className="text-lg font-semibold text-primary">{title}</h2>
        <p className="mt-1 text-sm text-secondary">{description}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">{fields}</div>
      <Submit pending={pending}>Send invitation</Submit>
      {sent ? (
        <p className="text-sm text-status-success-text">Invitation sent.</p>
      ) : null}
      <ErrorMessage error={error} />
    </form>
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
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
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
      className="inline-flex h-10 items-center rounded-md bg-brand px-4 text-sm font-medium text-on-brand disabled:opacity-60"
      disabled={pending}
      type="submit"
    >
      {pending ? "Working…" : children}
    </button>
  );
}

function ErrorMessage({ error }: { error: string }) {
  return error ? (
    <p className="text-sm text-status-danger-text" role="alert">
      {error}
    </p>
  ) : null;
}

async function organizerRequest<T = unknown>(
  path: string,
  method: string,
  body?: unknown,
): Promise<T> {
  const { data } = await createClient().auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Sign in again to continue.");
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method,
    headers: {
      authorization: `Bearer ${token}`,
      ...(body === undefined ? {} : { "content-type": "application/json" }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.ok) {
    const problem = (await response.json().catch(() => ({}))) as {
      detail?: string;
      message?: string;
    };
    throw new Error(
      problem.detail ??
        problem.message ??
        `Request failed (${response.status}).`,
    );
  }
  return response.json() as Promise<T>;
}

function localIso(value: FormDataEntryValue | null) {
  const date = new Date(String(value ?? ""));
  if (Number.isNaN(date.getTime())) throw new Error("Enter valid event dates.");
  return date.toISOString();
}

function localValue(value: string) {
  const date = new Date(value);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function message(cause: unknown) {
  return cause instanceof Error ? cause.message : "Something went wrong.";
}

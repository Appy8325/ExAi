"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@concourse/ui";

import { getApiBaseUrl } from "@/lib/api/config";
import { createClient } from "@/lib/supabase/client";

type SessionFormProps = {
  organizationId: string;
  eventId: string;
  mode: "create" | "edit";
  session?: {
    id: string;
    title: string;
    description: string;
    startAt: string;
    endAt: string;
    timezone: string;
    room: string;
    capacity: number | undefined;
    status: string;
  };
};

export function SessionForm({ organizationId, eventId, mode, session }: SessionFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="grid gap-6 rounded-xl border border-default bg-surface p-6 shadow-1 sm:grid-cols-2"
      onSubmit={(event) => {
        event.preventDefault();
        const form = event.currentTarget;
        startTransition(async () => {
          setError("");
          try {
            const data = new FormData(form);
            const path = `/v1/organizations/${encodeURIComponent(organizationId)}/events/${encodeURIComponent(eventId)}/sessions${mode === "edit" ? `/${session!.id}` : ""}`;
            const method = mode === "create" ? "POST" : "PATCH";
            const body: Record<string, unknown> = {
              title: data.get("title"),
              description: data.get("description"),
              startAt: localIso(data.get("startAt")),
              endAt: localIso(data.get("endAt")),
              timezone: data.get("timezone"),
              room: data.get("room"),
              capacity: data.get("capacity") ? Number(data.get("capacity")) : undefined,
            };
            await organizerRequest(path, method, body);
            router.push(`/org/events/${eventId}/sessions`);
          } catch (cause) {
            setError(message(cause));
          }
        });
      }}
    >
      <div className="sm:col-span-2">
        <h2 className="text-title font-semibold text-primary">
          {mode === "create" ? "New session" : "Edit session"}
        </h2>
      </div>
      <Field label="Title" name="title" defaultValue={session?.title} required />
      <Field
        label="IANA timezone"
        name="timezone"
        defaultValue={session?.timezone ?? "Asia/Kolkata"}
        required
      />
      <Field
        label="Start"
        name="startAt"
        type="datetime-local"
        defaultValue={session?.startAt ? localValue(session.startAt) : ""}
        required
      />
      <Field
        label="End"
        name="endAt"
        type="datetime-local"
        defaultValue={session?.endAt ? localValue(session.endAt) : ""}
        required
      />
      <Field label="Room" name="room" defaultValue={session?.room} />
      <Field label="Capacity" name="capacity" type="number" defaultValue={session?.capacity?.toString()} />
      <div className="sm:col-span-2">
        <label htmlFor="description" className="text-body-sm font-medium text-primary">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          defaultValue={session?.description ?? ""}
          className="mt-1.5 h-24 w-full rounded-md border border-strong bg-surface px-(--spacing-control-px) py-2 text-body text-primary outline-none focus:border-strong focus:ring-2 focus:ring-ring/30"
        />
      </div>
      <div className="sm:col-span-2 flex items-center gap-3">
        <Button disabled={pending} type="submit">
          {pending ? "Working…" : mode === "create" ? "Create session" : "Save changes"}
        </Button>
        <ErrorMessage error={error} />
      </div>
    </form>
  );
}

type SpeakerFormProps = {
  organizationId: string;
  eventId: string;
  mode: "create" | "edit";
  speaker?: {
    id: string;
    name: string;
    bio: string;
    photoUrl: string;
    company: string;
    title: string;
    socialLinks: Array<{ platform: string; url: string }>;
  };
};

export function SpeakerForm({ organizationId, eventId, mode, speaker }: SpeakerFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="grid gap-6 rounded-xl border border-default bg-surface p-6 shadow-1 sm:grid-cols-2"
      onSubmit={(event) => {
        event.preventDefault();
        const form = event.currentTarget;
        startTransition(async () => {
          setError("");
          try {
            const data = new FormData(form);
            const path = `/v1/organizations/${encodeURIComponent(organizationId)}/events/${encodeURIComponent(eventId)}/speakers${mode === "edit" ? `/${speaker!.id}` : ""}`;
            const method = mode === "create" ? "POST" : "PATCH";
            const body: Record<string, unknown> = {
              name: data.get("name"),
              bio: data.get("bio") || null,
              photoUrl: data.get("photoUrl") || null,
              company: data.get("company") || null,
              title: data.get("title") || null,
            };
            await organizerRequest(path, method, body);
            router.push(`/org/events/${eventId}/speakers`);
          } catch (cause) {
            setError(message(cause));
          }
        });
      }}
    >
      <div className="sm:col-span-2">
        <h2 className="text-title font-semibold text-primary">
          {mode === "create" ? "Add speaker" : "Edit speaker"}
        </h2>
      </div>
      <Field label="Name" name="name" defaultValue={speaker?.name} required />
      <Field label="Title" name="title" defaultValue={speaker?.title} />
      <Field label="Company" name="company" defaultValue={speaker?.company} />
      <Field label="Photo URL" name="photoUrl" type="url" defaultValue={speaker?.photoUrl} />
      <div className="sm:col-span-2">
        <label htmlFor="bio" className="text-body-sm font-medium text-primary">Bio</label>
        <textarea
          id="bio"
          name="bio"
          defaultValue={speaker?.bio ?? ""}
          className="mt-1.5 h-32 w-full rounded-md border border-strong bg-surface px-(--spacing-control-px) py-2 text-body text-primary outline-none focus:border-strong focus:ring-2 focus:ring-ring/30"
        />
      </div>
      <div className="sm:col-span-2 flex items-center gap-3">
        <Button disabled={pending} type="submit">
          {pending ? "Working…" : mode === "create" ? "Add speaker" : "Save changes"}
        </Button>
        <ErrorMessage error={error} />
      </div>
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
    <div className="space-y-1.5">
      <label htmlFor={name} className="text-body-sm font-medium text-primary">{label}</label>
      <Input id={name} name={name} type={type} defaultValue={defaultValue} required={required} />
    </div>
  );
}

function ErrorMessage({ error }: { error: string }) {
  return error ? (
    <p className="text-body-sm text-status-danger-text" role="alert">{error}</p>
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
    const problem = (await response.json().catch(() => ({}))) as { detail?: string; message?: string };
    throw new Error(problem.detail ?? problem.message ?? `Request failed (${response.status}).`);
  }
  return response.json() as Promise<T>;
}

function localIso(value: FormDataEntryValue | null) {
  const date = new Date(String(value ?? ""));
  if (Number.isNaN(date.getTime())) throw new Error("Enter valid dates.");
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

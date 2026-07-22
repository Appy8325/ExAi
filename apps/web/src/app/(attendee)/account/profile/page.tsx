"use client";

import { useEffect, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { updateAttendeeProfile } from "@concourse/api-client";
import { Button, EmptyState, Input, Card, Skeleton } from "@concourse/ui";
import { getApiBaseUrl } from "@/lib/api/config";
import { createClient } from "@/lib/supabase/client";

export default function AttendeeProfilePage() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string>();
  const [hasSession, setHasSession] = useState<boolean | null>(null);

  useEffect(() => {
    createClient().auth.getSession().then(({ data: { session } }) => {
      setHasSession(Boolean(session));
    });
  }, []);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError(undefined);
    setSaved(false);
    startTransition(async () => {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("Not authenticated");
        await updateAttendeeProfile(
          { baseUrl: getApiBaseUrl(), accessToken: session.access_token },
          {
            fullName: String(form.get("fullName") ?? ""),
            company: String(form.get("company") ?? ""),
            jobTitle: String(form.get("jobTitle") ?? ""),
            shareProfileWithExhibitors: form.get("shareProfileWithExhibitors") === "on",
          },
        );
        setSaved(true);
      } catch {
        setError("Could not save profile. Please try again.");
      }
    });
  };

  if (hasSession === null) {
    return (
      <div className="space-y-4 px-4 py-8">
        <Skeleton className="h-5 w-32" />
        <div className="rounded-xl border border-default bg-surface p-(--spacing-card-p) space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-6 w-48" />
        </div>
      </div>
    );
  }

  if (!hasSession) {
    return <EmptyState title="Sign in required" description="Sign in to manage your profile." />;
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-title-lg font-semibold text-primary">Profile</h1>
        <p className="mt-1 text-body text-secondary">
          Manage your attendee profile and preferences.
        </p>
      </header>

      <form className="space-y-5">
        <Card variant="default" className="space-y-4">
          <Field label="Full name">
            <Input name="fullName" required />
          </Field>
          <Field label="Company">
            <Input name="company" required />
          </Field>
          <Field label="Job title">
            <Input name="jobTitle" required />
          </Field>
        </Card>

        <Card variant="default">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              className="mt-1 size-4 accent-(--mq-bg-brand) rounded"
              defaultChecked
              name="shareProfileWithExhibitors"
              type="checkbox"
            />
            <span className="text-body-sm text-secondary">
              Share my professional profile with exhibitors. You stay in control of what you share.
            </span>
          </label>
        </Card>

        {error && (
          <p className="text-body-sm text-status-danger-text" role="alert">
            {error}
          </p>
        )}

        {saved && (
          <p className="text-body-sm text-status-success-text font-medium" role="status">
            Profile saved successfully.
          </p>
        )}

        <Button
          className="w-full"
          disabled={pending}
          type="submit"
          onClick={(e) => {
            e.preventDefault();
            submit(e as unknown as FormEvent<HTMLFormElement>);
          }}
        >
          {pending ? "Saving..." : "Save Profile"}
        </Button>
      </form>

      <Card variant="default">
        <h2 className="text-title-sm font-semibold text-primary">Consent</h2>
        <p className="mt-1 text-body-sm text-secondary">
          You control how your data is shared. Update your consent preferences above at any time.
        </p>
      </Card>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-body-sm font-medium text-primary">{label}</label>
      {children}
    </div>
  );
}

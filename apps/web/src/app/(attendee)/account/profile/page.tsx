"use client";

import { useEffect, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { updateAttendeeProfile } from "@concourse/api-client";
import { Button, Input } from "@concourse/ui";
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
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-default border-t-brand" />
      </div>
    );
  }

  if (!hasSession) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16">
        <p className="text-body text-secondary">Sign in to manage your profile.</p>
        <Button onClick={() => router.push("/auth")}>Sign In</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-display font-semibold text-primary">Profile</h1>
        <p className="mt-1 text-body text-secondary">
          Manage your attendee profile and preferences.
        </p>
      </header>

      <form className="space-y-4" onSubmit={submit}>
        <div className="space-y-3">
          <label className="block space-y-1 text-body font-medium text-primary">
            Full name
            <Input name="fullName" required />
          </label>
          <label className="block space-y-1 text-body font-medium text-primary">
            Company
            <Input name="company" required />
          </label>
          <label className="block space-y-1 text-body font-medium text-primary">
            Job title
            <Input name="jobTitle" required />
          </label>
        </div>

        <label className="flex items-start gap-3 rounded-xl border border-default bg-surface p-4 text-body text-secondary">
          <input
            className="mt-1 h-4 w-4 accent-(--mq-bg-brand)"
            defaultChecked
            name="shareProfileWithExhibitors"
            type="checkbox"
          />
          <span>
            Share my professional profile with exhibitors. You stay in control
            of what you share.
          </span>
        </label>

        {error && (
          <p className="text-body-sm text-status-danger-text" role="alert">
            {error}
          </p>
        )}

        {saved && (
          <p className="text-body-sm text-status-success-text" role="status">
            Profile saved successfully.
          </p>
        )}

        <Button
          className="min-h-12 w-full text-body font-semibold"
          disabled={pending}
          type="submit"
        >
          {pending ? "Saving..." : "Save Profile"}
        </Button>
      </form>

      <section className="rounded-xl border border-default bg-surface p-4">
        <h2 className="text-title-sm font-semibold text-primary">Consent</h2>
        <p className="mt-1 text-body-sm text-secondary">
          You control how your data is shared. Update your consent preferences
          above at any time.
        </p>
      </section>

      <section className="rounded-xl border border-default bg-surface p-4">
        <h2 className="text-title-sm font-semibold text-primary">Preferences</h2>
        <p className="mt-1 text-body-sm text-secondary">
          Notification and communication preferences coming soon.
        </p>
      </section>
    </div>
  );
}

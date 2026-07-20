"use client";

import { useState } from "react";
import { Button, Input } from "@concourse/ui";

import { createClient } from "@/lib/supabase/client";

type DemoAccount = {
  role: "organizer" | "exhibitor" | "attendee";
  email: string;
  fullName: string;
};

export function DemoSignInForm({ accounts }: { accounts: DemoAccount[] }) {
  const [pending, setPending] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    tone: "info" | "danger";
    message: string;
  } | null>(null);
  const [customEmail, setCustomEmail] = useState("");

  async function sendMagicLink(email: string, nextPath: string) {
    setPending(email);
    setFeedback(null);
    try {
      const supabase = createClient();
      const response = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
          shouldCreateUser: false,
        },
      });
      if (response.error) throw response.error;
      setFeedback({
        tone: "info",
        message: `Magic Link sent to ${email}. Use your Supabase inbox to view it.`,
      });
    } catch (cause) {
      const message =
        cause instanceof Error
          ? cause.message
          : `Could not send the link to ${email}.`;
      setFeedback({ tone: "danger", message });
    } finally {
      setPending(null);
    }
  }

  async function submitCustom(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = customEmail.trim();
    if (!email) return;
    await sendMagicLink(email, "/org");
  }

  const roleConfig = {
    organizer: {
      nextPath: "/org",
      label: "Organizer",
      tone: "ring-indigo-500/30",
    },
    exhibitor: {
      nextPath: "/exhibit",
      label: "Exhibitor",
      tone: "ring-emerald-500/30",
    },
    attendee: {
      nextPath: "/account/profile",
      label: "Attendee",
      tone: "ring-violet-500/30",
    },
  } as const;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        {accounts.length ? (
          accounts.map((account) => {
            const config = roleConfig[account.role];
            return (
              <div
                key={`${account.role}-${account.email}`}
                className={`rounded-2xl border border-default bg-surface p-5 shadow-1 ring-1 ${config.tone}`}
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                  {config.label}
                </p>
                <p className="mt-2 text-base font-semibold text-primary">
                  {account.fullName}
                </p>
                <p className="text-sm text-secondary">{account.email}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    className="min-h-10"
                    disabled={pending === account.email}
                    onClick={() =>
                      sendMagicLink(account.email, config.nextPath)
                    }
                    size="sm"
                    type="button"
                  >
                    {pending === account.email
                      ? "Sending…"
                      : "Send Magic Link"}
                  </Button>
                </div>
              </div>
            );
          })
        ) : (
          <p className="rounded-2xl border border-default bg-surface p-5 text-sm text-secondary">
            Demo accounts are unavailable. Run{" "}
            <code className="rounded bg-sunken px-1.5 py-0.5">
              pnpm db:seed:demo
            </code>{" "}
            to populate them.
          </p>
        )}
      </div>

      <form
        className="rounded-2xl border border-default bg-surface p-5 shadow-1"
        onSubmit={submitCustom}
      >
        <p className="text-sm font-semibold text-primary">
          Sign in with a different email
        </p>
        <p className="mt-1 text-sm text-secondary">
          Need-based session for any account that already exists in this
          Supabase project.
        </p>
        <label className="mt-4 block space-y-1 text-sm font-medium">
          Email
          <Input
            autoComplete="email"
            inputMode="email"
            name="email"
            onChange={(event) => setCustomEmail(event.target.value)}
            placeholder="you@example.com"
            required
            type="email"
            value={customEmail}
          />
        </label>
        <Button
          className="mt-3"
          disabled={pending === customEmail || !customEmail}
          type="submit"
        >
          {pending === customEmail ? "Sending…" : "Send Magic Link"}
        </Button>
      </form>

      {feedback ? (
        <p
          className={
            feedback.tone === "danger"
              ? "rounded-xl border border-status-danger-border bg-status-danger-subtle px-4 py-3 text-sm text-status-danger-text"
              : "rounded-xl border border-status-success-border bg-status-success-subtle px-4 py-3 text-sm text-status-success-text"
          }
          role="status"
        >
          {feedback.message}
        </p>
      ) : null}
    </div>
  );
}

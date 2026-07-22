"use client";

import { Suspense, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button, Input, Skeleton, StatusBadge } from "@concourse/ui";

import { createClient } from "@/lib/supabase/client";

type Phase = "request" | "sent" | "signed-in";

function AuthForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/demo";
  const errorParam = params.get("error_description");

  const [phase, setPhase] = useState<Phase>("request");
  const [email, setEmail] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(errorParam);
  const [signedInEmail, setSignedInEmail] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  function redirectTo(path: string) {
    router.push(path);
    router.refresh();
  }

  if (phase === "signed-in" || signedInEmail) {
    return (
      <SignedInCard
        email={signedInEmail ?? ""}
        signingOut={signingOut}
        onContinue={() => redirectTo(next)}
        onSignOut={async () => {
          setSigningOut(true);
          await createClient().auth.signOut();
          setSignedInEmail(null);
          setPhase("request");
          setSigningOut(false);
          router.refresh();
        }}
      />
    );
  }

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Please enter your email address.");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        const supabase = createClient();
        const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
        const { error: otpError } = await supabase.auth.signInWithOtp({
          email: trimmedEmail,
          options: {
            emailRedirectTo: redirectTo,
            shouldCreateUser: true,
          },
        });
        if (otpError) throw otpError;
        setPhase("sent");
      } catch (cause) {
        const message =
          cause instanceof Error
            ? cause.message
            : "We could not send your Magic Link. Please try again.";
        setError(message);
      }
    });
  };

  return (
    <div className="w-full space-y-8">
      <div className="space-y-3 text-center">
        <StatusBadge tone="brand">Secure Magic Link</StatusBadge>
        <h1 className="text-3xl font-semibold tracking-tight text-primary sm:text-4xl">
          Sign in to ExAi
        </h1>
        <p className="mx-auto max-w-sm text-body text-secondary">
          Enter your email and we&apos;ll send a secure one-time link to sign
          you in. No password required.
        </p>
      </div>

      {phase === "request" && (
        <form
          noValidate
          className="space-y-4 rounded-2xl border border-default bg-surface p-6 shadow-1"
          onSubmit={submit}
        >
          <label className="block space-y-2 text-body font-medium text-primary">
            Email address
            <Input
              autoComplete="email"
              inputMode="email"
              name="email"
              onChange={(event) => {
                setEmail(event.target.value);
                if (error) setError(null);
              }}
              placeholder="you@company.com"
              required
              type="email"
              value={email}
            />
          </label>

          {error && (
            <p className="rounded-lg border border-status-danger-border bg-status-danger-subtle px-3 py-2 text-body text-status-danger-text" role="alert">
              {error}
            </p>
          )}

          <Button className="w-full" disabled={pending} size="md" type="submit">
            {pending ? "Sending link…" : "Send Magic Link"}
          </Button>

          <p className="text-center text-caption text-muted">
            By continuing you agree to ExAi&apos;s terms and privacy notice.
          </p>
        </form>
      )}

      {phase === "sent" && (
        <div className="space-y-5 rounded-2xl border border-status-success-border bg-surface p-6 shadow-1">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-status-success-subtle text-status-success-text">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6l8 6 8-6" />
              <rect x="3" y="5" width="18" height="14" rx="2" />
            </svg>
          </div>
          <div className="space-y-2 text-center">
            <h2 className="text-lg font-semibold text-primary">Check your inbox</h2>
            <p className="text-body text-secondary">
              We&apos;ve sent a Magic Link to{" "}
              <span className="font-medium text-primary">{email}</span>.
            </p>
            <p className="text-body text-secondary">
              Click the link to sign in. You can close this tab once you&apos;re
              signed in.
            </p>
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setPhase("request");
                setError(null);
              }}
              className="text-body font-medium text-brand hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Use a different email
            </button>
            <Link
              href="/"
              className="text-caption text-secondary transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Return to home
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function AuthFallback() {
  return (
    <div className="w-full space-y-8">
      <div className="space-y-3 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-primary sm:text-4xl">
          Sign in to ExAi
        </h1>
      </div>
      <div className="rounded-2xl border border-default bg-surface p-6 shadow-1">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="mt-4 h-3 w-3/4" />
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<AuthFallback />}>
      <AuthForm />
    </Suspense>
  );
}

function SignedInCard({
  email,
  signingOut,
  onContinue,
  onSignOut,
}: {
  email: string;
  signingOut: boolean;
  onContinue: () => void;
  onSignOut: () => void;
}) {
  return (
    <div className="w-full space-y-6 rounded-2xl border border-status-success-border bg-surface p-6 shadow-1">
      <div className="space-y-3 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-status-success-subtle text-status-success-text">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12l4 4 10-10" />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-primary">
          You&apos;re signed in
        </h1>
        <p className="text-body text-secondary">
          Signed in as <span className="font-medium text-primary">{email || "you"}</span>
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <Button className="w-full" onClick={onContinue}>
          Continue
        </Button>
        <Button
          className="w-full"
          disabled={signingOut}
          onClick={onSignOut}
          variant="secondary"
        >
          {signingOut ? "Signing out…" : "Sign out"}
        </Button>
      </div>
    </div>
  );
}

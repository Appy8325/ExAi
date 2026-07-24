"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, StatusBadge } from "@concourse/ui";
import { createClient } from "@/lib/supabase/client";

export default function AuthPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const { error } = await createClient().auth.signInWithPassword({ email: email.trim(), password });
      if (error) return setError("Invalid email or password.");
      router.replace("/org");
      router.refresh();
    });
  }

  return <div className="w-full space-y-8"><div className="space-y-3 text-center"><StatusBadge tone="brand">Development access</StatusBadge><h1 className="text-3xl font-semibold tracking-tight text-primary sm:text-4xl">Sign in to ExAi</h1><p className="mx-auto max-w-sm text-body text-secondary">Use your development credentials to access the organization workspace.</p></div><form className="space-y-4 rounded-2xl border border-default bg-surface p-6 shadow-1" onSubmit={submit}><label className="block space-y-2 text-body font-medium text-primary">Email<Input autoComplete="email" name="email" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} /></label><label className="block space-y-2 text-body font-medium text-primary">Password<Input autoComplete="current-password" name="password" onChange={(event) => setPassword(event.target.value)} required type="password" value={password} /></label>{error ? <p className="rounded-lg border border-status-danger-border bg-status-danger-subtle px-3 py-2 text-body text-status-danger-text" role="alert">{error}</p> : null}<Button className="w-full" disabled={pending} type="submit">{pending ? "Signing in…" : "Sign in"}</Button></form></div>;
}

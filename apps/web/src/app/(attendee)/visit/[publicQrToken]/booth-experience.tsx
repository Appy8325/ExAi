"use client";

import { useState, useTransition } from "react";
import type { FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { ApiError, enrollAtBooth, updateAttendeeProfile } from "@concourse/api-client";
import type { PublicBooth } from "@concourse/api-client";
import { Button, Card, Input, StatusBadge } from "@concourse/ui";

import { getApiBaseUrl } from "@/lib/api/config";
import { createClient } from "@/lib/supabase/client";

type Step = "landing" | "email" | "sent" | "profile" | "success";

export function BoothExperience({ booth, publicQrToken, connected }: { booth: PublicBooth & { eventSlug?: string }; publicQrToken: string; connected: boolean }) {
  const [step, setStep] = useState<Step>(connected ? "profile" : "landing");
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const eventSlug = booth.eventSlug ?? "techexpo-2027";

  const submitEmail = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get("email") ?? "");
    setError(undefined);
    startTransition(async () => {
      try {
        await enrollAtBooth({ baseUrl: getApiBaseUrl() }, publicQrToken, email);
        setStep("sent");
      } catch (cause) {
        setError(cause instanceof ApiError && cause.status === 404 ? "This booth is no longer available." : "We could not send your Magic Link. Please try again.");
      }
    });
  };

  const submitProfile = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError(undefined);
    startTransition(async () => {
      try {
        const { data: { session } } = await createClient().auth.getSession();
        if (!session) throw new Error("Authentication required");
        await updateAttendeeProfile(
          { baseUrl: getApiBaseUrl(), accessToken: session.access_token },
          {
            fullName: String(form.get("fullName") ?? ""),
            company: String(form.get("company") ?? ""),
            jobTitle: String(form.get("jobTitle") ?? ""),
            shareProfileWithExhibitors: form.get("shareProfileWithExhibitors") === "on",
          },
        );
        setStep("success");
      } catch {
        setError("We could not save your profile. Please try again.");
      }
    });
  };

  return (
    <main className="mx-auto min-h-screen max-w-(--mq-attendee-content-max) bg-canvas px-gutter py-section text-primary">
      <Card className="space-y-6">
        <BoothHeader booth={booth} />
        {step === "landing" ? (
          <section className="space-y-4">
            <p className="text-body-lg text-secondary">{booth.description ?? "Connect with this exhibitor to start a conversation."}</p>
            <Button className="min-h-11 w-full" onClick={() => setStep("email")}>Connect with this exhibitor</Button>
          </section>
        ) : null}
        {step === "email" ? <EmailStep pending={pending} error={error} onSubmit={submitEmail} /> : null}
        {step === "sent" ? <MagicLinkSent emailError={error} onBack={() => setStep("email")} /> : null}
        {step === "profile" ? <ProfileStep companyName={booth.companyName} error={error} pending={pending} onSubmit={submitProfile} /> : null}
        {step === "success" ? <Success companyName={booth.companyName} eventSlug={eventSlug} /> : null}
      </Card>
    </main>
  );
}

function BoothHeader({ booth }: { booth: PublicBooth }) {
  const initials = booth.companyName.slice(0, 2).toUpperCase();
  return (
    <header className="space-y-4">
      {booth.logoUrl ? (
        <Image
          alt={`${booth.companyName} logo`}
          className="h-16 w-16 rounded-md border border-default object-contain"
          height={64}
          priority
          src={booth.logoUrl}
          unoptimized
          width={64}
        />
      ) : (
        <div aria-hidden="true" className="flex h-16 w-16 items-center justify-center rounded-md bg-brand text-title font-semibold text-on-brand">{initials}</div>
      )}
      <div className="space-y-2">
        <StatusBadge tone="info">Booth {booth.boothNumber ?? ""}</StatusBadge>
        <h1 className="text-title-lg font-semibold text-primary">{booth.companyName}</h1>
        <p className="text-body text-secondary">{booth.boothName}</p>
      </div>
      {booth.description ? <section aria-labelledby="products-heading"><h2 className="text-title-sm font-semibold text-primary" id="products-heading">Products &amp; services</h2><p className="mt-1 text-body text-secondary">{booth.description}</p></section> : null}
    </header>
  );
}

function EmailStep({ error, onSubmit, pending }: { error?: string; onSubmit: (event: FormEvent<HTMLFormElement>) => void; pending: boolean }) {
  return <section aria-labelledby="connect-heading" className="space-y-4"><div><h2 className="text-title font-semibold text-primary" id="connect-heading">Connect with this exhibitor</h2><p className="mt-1 text-body text-secondary">Enter your email and we&rsquo;ll send a secure Magic Link.</p></div><form className="space-y-3" onSubmit={onSubmit}><label className="block space-y-1 text-body font-medium text-primary" htmlFor="email">Email<Input autoComplete="email" id="email" name="email" required type="email" /></label>{error ? <p className="text-body-sm text-status-danger-text" role="alert">{error}</p> : null}<Button className="min-h-11 w-full" disabled={pending} type="submit">{pending ? "Sending…" : "Send Magic Link"}</Button></form></section>;
}

function MagicLinkSent({ emailError, onBack }: { emailError?: string; onBack: () => void }) {
  return <section aria-live="polite" className="space-y-4"><h2 className="text-title font-semibold text-primary">Check your email</h2><p className="text-body text-secondary">Open the Magic Link to securely connect with this exhibitor.</p>{emailError ? <p className="text-body-sm text-status-danger-text" role="alert">{emailError}</p> : null}<Button onClick={onBack} variant="ghost">Use a different email</Button></section>;
}

function ProfileStep({ companyName, error, onSubmit, pending }: { companyName: string; error?: string; onSubmit: (event: FormEvent<HTMLFormElement>) => void; pending: boolean }) {
  return <section aria-labelledby="profile-heading" className="space-y-4"><div><h2 className="text-title font-semibold text-primary" id="profile-heading">Complete your profile</h2><p className="mt-1 text-body text-secondary">Completing your profile helps exhibitors personalize conversations.</p></div><form className="space-y-3" onSubmit={onSubmit}><ProfileField label="Name" name="fullName" /><ProfileField label="Company" name="company" /><ProfileField label="Job title" name="jobTitle" /> <label className="flex items-start gap-3 rounded-sm border border-default p-3 text-body text-secondary"><input className="mt-1 h-4 w-4 accent-(--mq-bg-brand)" name="shareProfileWithExhibitors" type="checkbox" /><span>Share my professional profile with {companyName}. You stay in control of what you share.</span></label>{error ? <p className="text-body-sm text-status-danger-text" role="alert">{error}</p> : null}<Button className="min-h-11 w-full" disabled={pending} type="submit">{pending ? "Saving…" : "Continue"}</Button></form></section>;
}

function ProfileField({ label, name }: { label: string; name: string }) {
  return <label className="block space-y-1 text-body font-medium text-primary">{label}<Input name={name} required /></label>;
}

function Success({ companyName, eventSlug }: { companyName: string; eventSlug: string }) {
  return (
    <section aria-live="polite" className="space-y-4">
      <StatusBadge tone="success">Connected</StatusBadge>
      <h2 className="text-title font-semibold text-primary">You&rsquo;re connected!</h2>
      <p className="text-body text-secondary">Your relationship with {companyName} has been created.</p>
      <Link href={`/e/${eventSlug}`}>
        <Button className="min-h-11 w-full">Browse All Exhibitors</Button>
      </Link>
    </section>
  );
}

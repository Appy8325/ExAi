"use client";

import { useState, useTransition } from "react";
import type { FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ApiError,
  chatAtBooth,
  enrollAtBooth,
  submitBoothLead,
  updateAttendeeProfile,
} from "@concourse/api-client";
import type { BoothChatResponse, PublicBooth } from "@concourse/api-client";
import { Button, Card, Input, StatusBadge } from "@concourse/ui";

import { getApiBaseUrl } from "@/lib/api/config";
import { createClient } from "@/lib/supabase/client";

type Step = "landing" | "email" | "sent" | "profile" | "form" | "success";
type Recommendation = { title: string; reason: string };

export function BoothExperience({
  booth,
  publicQrToken,
  connected,
}: {
  booth: PublicBooth;
  publicQrToken: string;
  connected: boolean;
}) {
  const [step, setStep] = useState<Step>(connected ? "profile" : "landing");
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  const submitEmail = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get("email") ?? "");
    run(async () => {
      await enrollAtBooth({ baseUrl: getApiBaseUrl() }, publicQrToken, email);
      setStep("sent");
    }, "We could not send your Magic Link. Please try again.");
  };

  const submitProfile = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    run(async () => {
      const session = await authenticatedSession();
      await updateAttendeeProfile(
        { baseUrl: getApiBaseUrl(), accessToken: session.access_token },
        {
          fullName: String(form.get("fullName") ?? ""),
          company: String(form.get("company") ?? ""),
          jobTitle: String(form.get("jobTitle") ?? ""),
          shareProfileWithExhibitors:
            form.get("shareProfileWithExhibitors") === "on",
        },
      );
      setStep(booth.leadForm ? "form" : "success");
    }, "We could not save your profile. Please try again.");
  };

  const submitLead = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const responses = Object.fromEntries(
      (booth.leadForm?.fields ?? []).map((field) => [
        field.key,
        ["checkbox", "consent_checkbox"].includes(field.type)
          ? data.get(field.key) === "on"
          : String(data.get(field.key) ?? ""),
      ]),
    );
    run(async () => {
      const session = await authenticatedSession();
      const result = await submitBoothLead(
        { baseUrl: getApiBaseUrl(), accessToken: session.access_token },
        publicQrToken,
        crypto.randomUUID(),
        responses,
      );
      setRecommendations(result.recommendations);
      setStep("success");
    }, "We could not submit your information. Nothing was lost; please try again.");
  };

  function run(work: () => Promise<void>, message: string) {
    setError(undefined);
    startTransition(async () => {
      try {
        await work();
      } catch (cause) {
        setError(
          cause instanceof ApiError && cause.status === 404
            ? "This booth is no longer available."
            : message,
        );
      }
    });
  }

  return (
    <main className="mx-auto min-h-screen max-w-(--mq-attendee-content-max) bg-canvas px-gutter py-section text-primary">
      <Card className="space-y-6">
        <BoothHeader booth={booth} />
        <BoothChat publicQrToken={publicQrToken} companyName={booth.companyName} />
        <Resources booth={booth} />
        {step === "landing" ? (
          <Landing booth={booth} onConnect={() => setStep("email")} />
        ) : null}
        {step === "email" ? (
          <EmailStep pending={pending} error={error} onSubmit={submitEmail} />
        ) : null}
        {step === "sent" ? (
          <MagicLinkSent onBack={() => setStep("email")} />
        ) : null}
        {step === "profile" ? (
          <ProfileStep
            companyName={booth.companyName}
            error={error}
            pending={pending}
            onSubmit={submitProfile}
          />
        ) : null}
        {step === "form" && booth.leadForm ? (
          <LeadFormStep
            booth={booth}
            error={error}
            pending={pending}
            onSubmit={submitLead}
          />
        ) : null}
        {step === "success" ? (
          <Success booth={booth} recommendations={recommendations} />
        ) : null}
      </Card>
    </main>
  );
}

async function authenticatedSession() {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("Authentication required");
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Authentication required");
  return session;
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
        <div
          aria-hidden="true"
          className="flex h-16 w-16 items-center justify-center rounded-md bg-brand text-title font-semibold text-on-brand"
        >
          {initials}
        </div>
      )}
      <div className="space-y-2">
        <StatusBadge tone="info">Booth {booth.boothNumber ?? ""}</StatusBadge>
        <h1 className="text-title-lg font-semibold text-primary">
          {booth.companyName}
        </h1>
        <p className="text-body text-secondary">{booth.boothName}</p>
      </div>
      <section aria-labelledby="products-heading">
        <h2
          className="text-title-sm font-semibold text-primary"
          id="products-heading"
        >
          Products &amp; services
        </h2>
        <p className="mt-1 text-body text-secondary">
          {booth.description ??
            "Explore this exhibitor's published resources and ask their AI assistant a question."}
        </p>
        {booth.website ? (
          <a
            className="mt-2 inline-block text-body text-link underline"
            href={booth.website}
            rel="noreferrer"
            target="_blank"
          >
            Visit company website
          </a>
        ) : null}
      </section>
    </header>
  );
}

function Resources({ booth }: { booth: PublicBooth }) {
  if (!booth.resources.length) return null;
  const apiBase = getApiBaseUrl();
  return (
    <section aria-labelledby="resources-heading" className="space-y-2">
      <h2 className="text-title-sm font-semibold" id="resources-heading">
        Published resources
      </h2>
      <ul className="space-y-2">
        {booth.resources.map((resource) => (
          <li key={resource.id}>
            <a
              className="text-body text-link underline"
              href={
                resource.external ? resource.href : `${apiBase}${resource.href}`
              }
              rel="noreferrer"
              target="_blank"
            >
              {resource.title}
            </a>{" "}
            <span className="text-body-sm text-secondary">
              ({resource.sourceType.replaceAll("_", " ")})
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

const COMPANY_QUESTIONS: Record<string, string[]> = {
  Microsoft: [
    "What is Microsoft Copilot and how does it work?",
    "How does Azure compare to other cloud platforms?",
    "What's included in Microsoft 365 for enterprise?",
    "How can developers use GitHub Copilot?",
  ],
  Apple: [
    "What's new in the latest iPhone?",
    "How does Apple Vision Pro work for developers?",
    "What are Apple's privacy features?",
    "How does Apple Silicon performance compare?",
  ],
  Google: [
    "What is Google Gemini and how does it work?",
    "How does Google Cloud Platform differentiate?",
    "What's new in Android for developers?",
    "How does Google Workspace AI help productivity?",
  ],
  NVIDIA: [
    "What are the latest GeForce GPUs for gaming?",
    "How does CUDA enable AI acceleration?",
    "What is NVIDIA Omniverse for digital twins?",
    "How do DGX systems support AI training?",
  ],
  Cisco: [
    "What is Cisco Meraki cloud networking?",
    "How does Cisco Secure Firewall protect networks?",
    "What's new in Webex for collaboration?",
    "How does ThousandEyes monitor internet performance?",
  ],
  IBM: [
    "What is watsonx and how does it help enterprises?",
    "How does IBM Quantum compute work?",
    "What are IBM Granite foundation models?",
    "How does Red Hat OpenShift integrate with IBM Cloud?",
  ],
  Intel: [
    "What's new in Intel Core Ultra processors?",
    "How do Gaudi AI accelerators compare to GPUs?",
    "What is Intel vPro for enterprise devices?",
    "How does Intel Foundry Services work?",
  ],
  Salesforce: [
    "What is Salesforce Einstein AI?",
    "How does Data Cloud unify customer data?",
    "What's the difference between Sales and Service Cloud?",
    "How does Slack integrate with Salesforce?",
  ],
  Adobe: [
    "What is Adobe Firefly generative AI?",
    "How does Adobe Experience Cloud help marketers?",
    "What's new in Creative Cloud apps?",
    "How does Adobe Acrobat AI Assistant work?",
  ],
  Siemens: [
    "What is the Siemens Xcelerator platform?",
    "How does Teamcenter PLM manage product data?",
    "What is Siemens Industrial Edge computing?",
    "How does Siemens support sustainable manufacturing?",
  ],
};

function getCompanyQuestions(companyName: string): string[] {
  return COMPANY_QUESTIONS[companyName] ?? [
    "What are your flagship products?",
    "Which industries do you serve?",
    "What makes your solution different?",
    "How can I contact your sales team?",
  ];
}

function BoothChat({ publicQrToken, companyName }: { publicQrToken: string; companyName: string }) {
  const [answer, setAnswer] = useState<BoothChatResponse>();
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const [question, setQuestion] = useState("");
  const suggestions = getCompanyQuestions(companyName);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const q = question.trim();
    if (!q) return;
    setError(undefined);
    startTransition(async () => {
      try {
        setAnswer(
          await chatAtBooth(
            { baseUrl: getApiBaseUrl() },
            publicQrToken,
            q,
          ),
        );
      } catch {
        setError(
          "The AI assistant could not answer right now. You can still review the published resources.",
        );
      }
    });
  };
  const askQuestion = (q: string) => {
    setQuestion(q);
    setError(undefined);
    startTransition(async () => {
      try {
        setAnswer(
          await chatAtBooth(
            { baseUrl: getApiBaseUrl() },
            publicQrToken,
            q,
          ),
        );
      } catch {
        setError(
          "The AI assistant could not answer right now. You can still review the published resources.",
        );
      }
    });
  };
  return (
    <section
      aria-labelledby="assistant-heading"
      className="space-y-4 rounded-xl bg-brand-subtle p-5"
    >
      <div>
        <h2 className="text-title font-semibold text-primary" id="assistant-heading">
          {companyName} AI Assistant
        </h2>
        <p className="mt-1 text-body text-secondary">
          Ask anything about this exhibitor&rsquo;s products, services, and booth details.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((s) => (
          <button
            key={s}
            type="button"
            disabled={pending}
            onClick={() => askQuestion(s)}
            className="rounded-lg border border-brand/20 bg-white px-3 py-1.5 text-body-sm text-brand transition-colors hover:bg-brand hover:text-on-brand disabled:opacity-50"
          >
            {s}
          </button>
        ))}
      </div>
      <form className="flex gap-2" onSubmit={submit}>
        <Input
          aria-label="Question for the company AI"
          maxLength={1000}
          name="question"
          placeholder="Ask a question..."
          required
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <Button disabled={pending} type="submit">
          {pending ? "Asking\u2026" : "Ask"}
        </Button>
      </form>
      {error ? (
        <p className="text-body-sm text-status-danger-text" role="alert">
          {error}
        </p>
      ) : null}
      {answer ? (
        <div
          aria-live="polite"
          className="rounded-sm border border-default bg-surface p-4"
        >
          <p className="whitespace-pre-wrap text-body text-primary">
            {answer.answer}
          </p>
          {answer.citations.length ? (
            <ul className="mt-3 space-y-1 border-t border-default pt-3 text-body-sm text-muted">
              {answer.citations.map((citation) => (
                <li key={`${citation.marker}-${citation.documentId}`}>
                  {citation.marker} \u2014 {citation.title}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function Landing({
  booth,
  onConnect,
}: {
  booth: PublicBooth;
  onConnect: () => void;
}) {
  return (
    <section className="space-y-4">
      <p className="text-body-lg text-secondary">
        Connect to share your details and receive recommendations from{" "}
        {booth.companyName}.
      </p>
      <Button className="min-h-11 w-full" onClick={onConnect}>
        Connect with this exhibitor
      </Button>
    </section>
  );
}

function EmailStep({
  error,
  onSubmit,
  pending,
}: {
  error?: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  pending: boolean;
}) {
  return (
    <section aria-labelledby="connect-heading" className="space-y-4">
      <div>
        <h2 className="text-title font-semibold" id="connect-heading">
          Connect with this exhibitor
        </h2>
        <p className="mt-1 text-body text-secondary">
          Enter your email and we&rsquo;ll send a secure Magic Link.
        </p>
      </div>
      <form className="space-y-3" onSubmit={onSubmit}>
        <label
          className="block space-y-1 text-body font-medium"
          htmlFor="email"
        >
          Email
          <Input
            autoComplete="email"
            id="email"
            name="email"
            required
            type="email"
          />
        </label>
        {error ? (
          <p className="text-body-sm text-status-danger-text" role="alert">
            {error}
          </p>
        ) : null}
        <Button className="min-h-11 w-full" disabled={pending} type="submit">
          {pending ? "Sending…" : "Send Magic Link"}
        </Button>
      </form>
    </section>
  );
}

function MagicLinkSent({ onBack }: { onBack: () => void }) {
  return (
    <section aria-live="polite" className="space-y-4">
      <h2 className="text-title font-semibold">Check your email</h2>
      <p className="text-body text-secondary">
        Open the Magic Link to securely connect with this exhibitor.
      </p>
      <Button onClick={onBack} variant="ghost">
        Use a different email
      </Button>
    </section>
  );
}

function ProfileStep({
  companyName,
  error,
  onSubmit,
  pending,
}: {
  companyName: string;
  error?: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  pending: boolean;
}) {
  return (
    <section aria-labelledby="profile-heading" className="space-y-4">
      <div>
        <h2 className="text-title font-semibold" id="profile-heading">
          Complete your profile
        </h2>
        <p className="mt-1 text-body text-secondary">
          Review what you want to share before continuing.
        </p>
      </div>
      <form className="space-y-3" onSubmit={onSubmit}>
        <ProfileField label="Name" name="fullName" />
        <ProfileField label="Company" name="company" />
        <ProfileField label="Job title" name="jobTitle" />
        <label className="flex items-start gap-3 rounded-sm border border-default p-3 text-body text-secondary">
          <input
            className="mt-1 h-4 w-4"
            name="shareProfileWithExhibitors"
            type="checkbox"
          />
          <span>
            Share my professional profile with {companyName}. You stay in
            control of what you share.
          </span>
        </label>
        {error ? (
          <p className="text-body-sm text-status-danger-text" role="alert">
            {error}
          </p>
        ) : null}
        <Button className="min-h-11 w-full" disabled={pending} type="submit">
          {pending ? "Saving…" : "Continue"}
        </Button>
      </form>
    </section>
  );
}

function ProfileField({ label, name }: { label: string; name: string }) {
  return (
    <label className="block space-y-1 text-body font-medium">
      {label}
      <Input name={name} required />
    </label>
  );
}

function LeadFormStep({
  booth,
  error,
  onSubmit,
  pending,
}: {
  booth: PublicBooth;
  error?: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  pending: boolean;
}) {
  const form = booth.leadForm!;
  return (
    <section aria-labelledby="lead-form-heading" className="space-y-4">
      <div>
        <h2 className="text-title font-semibold" id="lead-form-heading">
          {form.name}
        </h2>
        {form.description ? (
          <p className="mt-1 text-body text-secondary">{form.description}</p>
        ) : null}
      </div>
      <form className="space-y-3" onSubmit={onSubmit}>
        {form.fields.map((field) => (
          <LeadField field={field} key={field.key} />
        ))}
        {form.consentText ? (
          <p className="text-body-sm text-secondary">{form.consentText}</p>
        ) : null}
        {booth.privacyPolicyUrl ? (
          <a
            className="text-body-sm text-link underline"
            href={booth.privacyPolicyUrl}
            rel="noreferrer"
            target="_blank"
          >
            Privacy policy
          </a>
        ) : null}
        {error ? (
          <p className="text-body-sm text-status-danger-text" role="alert">
            {error}
          </p>
        ) : null}
        <Button className="min-h-11 w-full" disabled={pending} type="submit">
          {pending ? "Submitting…" : "Submit information"}
        </Button>
      </form>
    </section>
  );
}

function LeadField({
  field,
}: {
  field: NonNullable<PublicBooth["leadForm"]>["fields"][number];
}) {
  if (["checkbox", "consent_checkbox"].includes(field.type))
    return (
      <label className="flex items-start gap-3 rounded-sm border border-default p-3 text-body text-secondary">
        <input
          className="mt-1 h-4 w-4"
          name={field.key}
          required={field.required}
          type="checkbox"
        />
        <span>
          {field.label}
          {field.required ? " *" : ""}
          {field.helpText ? (
            <small className="block">{field.helpText}</small>
          ) : null}
        </span>
      </label>
    );
  const inputType =
    field.type === "email" ? "email" : field.type === "phone" ? "tel" : "text";
  return (
    <label className="block space-y-1 text-body font-medium">
      {field.label}
      {field.required ? " *" : ""}
      {field.type === "multiline_text" ? (
        <textarea
          className="min-h-24 w-full rounded-sm border border-default bg-surface p-3"
          maxLength={2000}
          name={field.key}
          placeholder={field.placeholder ?? undefined}
          required={field.required}
        />
      ) : (
        <Input
          name={field.key}
          placeholder={field.placeholder ?? undefined}
          required={field.required}
          type={inputType}
        />
      )}
      {field.helpText ? (
        <small className="block text-secondary">{field.helpText}</small>
      ) : null}
    </label>
  );
}

function Success({
  booth,
  recommendations,
}: {
  booth: PublicBooth;
  recommendations: Recommendation[];
}) {
  return (
    <section aria-live="polite" className="space-y-4">
      <StatusBadge tone="success">Submitted</StatusBadge>
      <h2 className="text-title font-semibold">You&rsquo;re connected!</h2>
      <p className="text-body text-secondary">
        Your information was received by {booth.companyName}.
      </p>
      {recommendations.length ? (
        <div>
          <h3 className="text-title-sm font-semibold">Recommended next</h3>
          <ul className="mt-2 space-y-2">
            {recommendations.map((item) => (
              <li
                className="rounded-sm border border-default p-3"
                key={item.title}
              >
                <p className="font-medium">{item.title}</p>
                <p className="text-body-sm text-secondary">{item.reason}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <Link href={`/e/${booth.eventSlug}`}>
        <Button className="min-h-11 w-full">Browse all exhibitors</Button>
      </Link>
    </section>
  );
}

"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import {
  ApiError,
  chatAtBooth,
  enrollAtBooth,
  submitBoothLead,
  trackDemoEvent,
  updateAttendeeProfile,
} from "@concourse/api-client";
import type { BoothChatResponse, PublicBooth } from "@concourse/api-client";
import { Button, Card, Field, Input, StatusBadge, Textarea } from "@concourse/ui";

import { getApiBaseUrl } from "@/lib/api/config";
import { createClient } from "@/lib/supabase/client";

import { TrackEvent } from "@/components/demo/analytics-tracker";

type Step = "landing" | "email" | "sent" | "profile" | "form" | "success";
type Recommendation = { title: string; reason: string };

const COMPANY_QUESTIONS: Record<string, string[]> = {
  Microsoft: [
    "What is Microsoft Copilot and how does it work?",
    "How does Microsoft Azure support AI workloads?",
    "What are the key features of Microsoft 365?",
    "How can GitHub Copilot help developers?",
  ],
  Apple: [
    "What makes iPhone different from other smartphones?",
    "How does Apple Vision Pro work?",
    "What enterprise solutions does Apple offer?",
    "How does Apple Pay ensure payment security?",
  ],
  Google: [
    "What AI models are available on Google Cloud?",
    "How does Google Workspace improve team collaboration?",
    "What is Google Gemini and what can it do?",
    "How does Google Cloud ensure data security?",
  ],
  NVIDIA: [
    "What are the latest GPU architectures for AI?",
    "How does NVIDIA AI Enterprise help businesses?",
    "What is CUDA and why is it important?",
    "How does NVIDIA DRIVE enable autonomous vehicles?",
  ],
  Cisco: [
    "What networking solutions does Cisco offer for enterprises?",
    "How does Cisco Secure Firewall protect networks?",
    "What is Webex and its collaboration features?",
    "How does Cisco Meraki simplify IT management?",
  ],
  IBM: [
    "What is IBM watsonx and its AI capabilities?",
    "How does Red Hat OpenShift support cloud-native apps?",
    "What is IBM Qiskit for quantum computing?",
    "How does IBM Cloud differ from other cloud providers?",
  ],
  Intel: [
    "What are the latest Intel Core processor features?",
    "How does Intel Gaudi accelerate AI training?",
    "What enterprise solutions does Intel vPro offer?",
    "How does Intel Arc compare to other discrete GPUs?",
  ],
  Salesforce: [
    "What is Einstein AI and how does it work?",
    "How does Sales Cloud help sales teams?",
    "What is Tableau and its data analytics capabilities?",
    "How does Salesforce CDP unify customer data?",
  ],
  Adobe: [
    "What is Adobe Firefly and its generative AI features?",
    "How does Adobe Experience Cloud help marketers?",
    "What are the key features of Adobe Photoshop?",
    "How does Adobe Acrobat simplify document management?",
  ],
  Siemens: [
    "What is Siemens Xcelerator and its benefits?",
    "How does SIMATIC automation work?",
    "What industrial solutions does Siemens offer?",
    "How does Siemens Mobility improve transportation?",
  ],
};

function getCompanyQuestions(companyName: string): string[] {
  return COMPANY_QUESTIONS[companyName] ?? [
    "What products and services do you offer?",
    "What industries do you primarily serve?",
    "How does your platform differentiate from competitors?",
    "What support resources are available?",
  ];
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1" aria-label="AI is thinking" role="status">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-1.5 rounded-full bg-status-ai-solid"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </div>
  );
}

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
    }, "Could not send magic link. Please try again.");
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
          shareProfileWithExhibitors: form.get("shareProfileWithExhibitors") === "on",
        },
      );
      setStep(booth.leadForm ? "form" : "success");
    }, "Could not save profile. Please try again.");
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
      trackDemoEvent({ baseUrl: getApiBaseUrl() }, { type: "lead_submission", boothId: publicQrToken }).catch(() => {});
      setStep("success");
    }, "Could not submit. Please try again.");
  };

  function run(work: () => Promise<void>, message: string) {
    setError(undefined);
    startTransition(async () => {
      try {
        await work();
      } catch (cause) {
        setError(cause instanceof ApiError && cause.status === 404
          ? "This booth is no longer available."
          : message);
      }
    });
  }

  const dwellInterval = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  useEffect(() => {
    dwellInterval.current = setInterval(() => {
      trackDemoEvent({ baseUrl: getApiBaseUrl() }, { type: "dwell", boothId: publicQrToken, seconds: 30 }).catch(() => {});
    }, 30000);
    return () => { if (dwellInterval.current) clearInterval(dwellInterval.current); };
  }, [publicQrToken]);

  return (
    <main className="min-h-screen bg-canvas px-gutter py-8 sm:px-(--mq-space-gutter)">
      <TrackEvent event={{ type: "booth_visit", boothId: publicQrToken }} />
      <div className="mx-auto max-w-(--mq-attendee-content-max)">
        <Link href="/hackathon" className="mb-6 inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-primary">
          <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 16 16" aria-hidden>
            <path strokeWidth="2" d="M10 12l-4-4 4-4" />
          </svg>
          Back to Exhibition
        </Link>

        <Card className="space-y-6">
          <BoothHeader booth={booth} />
          <BoothChat publicQrToken={publicQrToken} companyName={booth.companyName} />
          <Resources booth={booth} publicQrToken={publicQrToken} />

          {step === "landing" && (
            <Landing booth={booth} onConnect={() => setStep("email")} />
          )}
          {step === "email" && (
            <EmailStep pending={pending} error={error} onSubmit={submitEmail} />
          )}
          {step === "sent" && (
            <MagicLinkSent onBack={() => setStep("email")} />
          )}
          {step === "profile" && (
            <ProfileStep companyName={booth.companyName} error={error} pending={pending} onSubmit={submitProfile} />
          )}
          {step === "form" && booth.leadForm && (
            <LeadFormStep booth={booth} error={error} pending={pending} onSubmit={submitLead} />
          )}
          {step === "success" && (
            <Success booth={booth} recommendations={recommendations} />
          )}
        </Card>
      </div>
    </main>
  );
}

async function authenticatedSession() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Authentication required");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Authentication required");
  return session;
}

function BoothHeader({ booth }: { booth: PublicBooth }) {
  const initials = booth.companyName.slice(0, 2).toUpperCase();
  return (
    <header className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex size-14 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-status-ai-solid text-lg font-bold text-on-brand">
          {initials}
        </div>
        <div>
          <StatusBadge tone="info">Booth {booth.boothNumber ?? ""}</StatusBadge>
          <h1 className="mt-1 text-title-lg font-bold text-primary">{booth.companyName}</h1>
          <p className="text-sm text-muted">{booth.boothName}</p>
        </div>
      </div>
      <p className="text-sm leading-relaxed text-secondary">
        {booth.description ?? "Learn more about this exhibitor's products and services."}
      </p>
      {booth.website && (
        <a
          href={booth.website}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-link transition-colors hover:text-brand"
        >
          <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 16 16" aria-hidden>
            <path strokeWidth="1.5" d="M6 2h8v8M8 8l6-6M2 8v6h6" />
          </svg>
          Visit Official Website
        </a>
      )}
    </header>
  );
}

function Resources({ booth, publicQrToken }: { booth: PublicBooth; publicQrToken: string }) {
  if (!booth.resources.length) return null;
  return (
    <section className="space-y-2 border-t border-default pt-4">
      <h3 className="text-sm font-semibold text-primary">Published Resources</h3>
      <ul className="space-y-1">
        {booth.resources.map((resource) => (
          <li key={resource.id}>
            <a
              href={resource.external ? resource.href : `${getApiBaseUrl()}${resource.href}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                trackDemoEvent({ baseUrl: getApiBaseUrl() }, { type: "brochure_download", boothId: publicQrToken }).catch(() => {});
              }}
              className="flex items-center gap-2 text-sm text-link transition-colors hover:text-brand"
            >
              <svg className="size-3" fill="none" stroke="currentColor" viewBox="0 0 16 16" aria-hidden>
                <path strokeWidth="1.5" d="M6 2h8v8M8 8l6-6M2 8v6h6" />
              </svg>
              {resource.title}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

function BoothChat({ publicQrToken, companyName }: { publicQrToken: string; companyName: string }) {
  const [answer, setAnswer] = useState<BoothChatResponse>();
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const [question, setQuestion] = useState("");
  const [history, setHistory] = useState<Array<{ q: string; a?: string }>>([]);
  const suggestions = getCompanyQuestions(companyName);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, answer]);

  const submit = (q: string) => {
    if (!q.trim()) return;
    const userQuestion = q;
    setQuestion("");
    setError(undefined);

    setHistory((prev) => [...prev, { q: userQuestion }]);

    startTransition(async () => {
      try {
        const result = await chatAtBooth({ baseUrl: getApiBaseUrl() }, publicQrToken, userQuestion);
        setAnswer(result);
        setHistory((prev) =>
          prev.map((item, i) => (i === prev.length - 1 ? { ...item, a: result.answer } : item))
        );
        trackDemoEvent({ baseUrl: getApiBaseUrl() }, { type: "ai_chat", boothId: publicQrToken, messageCount: 1 }).catch(() => {});
      } catch {
        setError("The AI could not answer. Please try again or check the resources above.");
        setHistory((prev) =>
          prev.map((item, i) => (i === prev.length - 1 ? { ...item, a: "Sorry, I couldn't answer that question. Please try again or browse the published resources." } : item))
        );
      }
    });
  };

  return (
    <section className="space-y-4 rounded-xl border border-default bg-sunken p-4">
      <div>
        <h3 className="text-sm font-semibold text-primary">AI Assistant</h3>
        <p className="text-xs text-muted">Ask about {companyName}&apos;s products and services</p>
      </div>

      <div className="max-h-64 space-y-3 overflow-y-auto">
        {history.length === 0 && (
          <div className="py-4 text-center">
            <p className="text-xs text-muted">Try one of these questions:</p>
          </div>
        )}
        {history.map((item, i) => (
          <div key={i} className="space-y-2">
            <div className="flex justify-end">
              <span className="rounded-lg bg-brand px-3 py-1.5 text-xs text-on-brand">
                {item.q}
              </span>
            </div>
            {item.a && (
              <div className="flex justify-start">
                <span className="whitespace-pre-wrap rounded-lg border border-default bg-surface px-3 py-1.5 text-xs text-primary shadow-1">
                  {item.a}
                </span>
              </div>
            )}
          </div>
        ))}
        {pending && (
          <div className="flex justify-start">
            <span className="rounded-lg border border-default bg-surface px-3 py-2 shadow-1">
              <TypingIndicator />
            </span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {suggestions.map((s) => (
          <button
            key={s}
            type="button"
            disabled={pending}
            onClick={() => submit(s)}
            className="rounded-full border border-default bg-surface px-3 py-1 text-xs text-secondary transition-colors duration-[var(--mq-duration-fast)] ease-[var(--mq-ease-standard)] hover:border-strong hover:text-primary hover:shadow-1 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {s}
          </button>
        ))}
      </div>

      <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); submit(question); }}>
        <Input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question..."
          className="flex-1"
          disabled={pending}
          aria-label="Ask the AI assistant"
        />
        <Button type="submit" disabled={pending || !question.trim()}>
          {pending ? <TypingIndicator /> : "Ask"}
        </Button>
      </form>

      {error && (
        <p className="text-xs text-status-danger-text" role="alert">{error}</p>
      )}
    </section>
  );
}

function Landing({ booth, onConnect }: { booth: PublicBooth; onConnect: () => void }) {
  return (
    <section className="space-y-4 border-t border-default pt-4">
      <p className="text-sm text-secondary">
        Connect with <strong className="text-primary">{booth.companyName}</strong> to receive personalized information and follow-ups.
      </p>
      <Button onClick={onConnect} className="w-full">
        Connect with Exhibitor
      </Button>
    </section>
  );
}

function EmailStep({ error, onSubmit, pending }: { error?: string; onSubmit: (e: FormEvent<HTMLFormElement>) => void; pending: boolean }) {
  return (
    <section className="space-y-4 border-t border-default pt-4">
      <div>
        <h3 className="text-sm font-semibold text-primary">Connect with this exhibitor</h3>
        <p className="text-xs text-muted">Enter your email for a secure magic link</p>
      </div>
      <form className="space-y-3" onSubmit={onSubmit}>
        <Field label="Work email">
          <Input type="email" name="email" required autoComplete="email" />
        </Field>
        {error && <p className="text-xs text-status-danger-text" role="alert">{error}</p>}
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Sending..." : "Send Magic Link"}
        </Button>
      </form>
    </section>
  );
}

function MagicLinkSent({ onBack }: { onBack: () => void }) {
  return (
    <section className="space-y-4 border-t border-default pt-4 text-center">
      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-status-success-subtle">
        <svg className="size-6 text-status-success-text" fill="none" stroke="currentColor" viewBox="0 0 16 16" aria-hidden>
          <path strokeWidth="2" d="M3 8l3 3 7-7" />
        </svg>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-primary">Check your email</h3>
        <p className="mt-1 text-xs text-muted">Open the magic link to securely connect</p>
      </div>
      <Button variant="ghost" onClick={onBack} className="w-full">
        Use a different email
      </Button>
    </section>
  );
}

function ProfileStep({ companyName, error, onSubmit, pending }: { companyName: string; error?: string; onSubmit: (e: FormEvent<HTMLFormElement>) => void; pending: boolean }) {
  return (
    <section className="space-y-4 border-t border-default pt-4">
      <div>
        <h3 className="text-sm font-semibold text-primary">Complete your profile</h3>
        <p className="text-xs text-muted">Review what you share before connecting</p>
      </div>
      <form className="space-y-3" onSubmit={onSubmit}>
        <Field label="Full name">
          <Input name="fullName" required />
        </Field>
        <Field label="Company">
          <Input name="company" required />
        </Field>
        <Field label="Job title">
          <Input name="jobTitle" required />
        </Field>
        <label className="flex items-start gap-2 text-xs text-secondary">
          <input type="checkbox" name="shareProfileWithExhibitors" defaultChecked className="mt-0.5" />
          <span>Share my profile with {companyName}</span>
        </label>
        {error && <p className="text-xs text-status-danger-text" role="alert">{error}</p>}
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Saving..." : "Continue"}
        </Button>
      </form>
    </section>
  );
}

function LeadFormStep({ booth, error, onSubmit, pending }: { booth: PublicBooth; error?: string; onSubmit: (e: FormEvent<HTMLFormElement>) => void; pending: boolean }) {
  const form = booth.leadForm!;
  return (
    <section className="space-y-4 border-t border-default pt-4">
      <div>
        <h3 className="text-sm font-semibold text-primary">{form.name}</h3>
        {form.description && <p className="text-xs text-muted">{form.description}</p>}
      </div>
      <form className="space-y-3" onSubmit={onSubmit}>
        {form.fields.map((field) => (
          <Field key={field.key} label={`${field.label}${field.required ? " *" : ""}`}>
            {field.type === "multiline_text" ? (
              <Textarea name={field.key} required={field.required} rows={3} placeholder={field.placeholder ?? undefined} />
            ) : (
              <Input name={field.key} type={field.type === "email" ? "email" : "text"} required={field.required} placeholder={field.placeholder ?? undefined} />
            )}
          </Field>
        ))}
        {form.consentText && <p className="text-xs text-muted">{form.consentText}</p>}
        {error && <p className="text-xs text-status-danger-text" role="alert">{error}</p>}
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Submitting..." : "Submit"}
        </Button>
      </form>
    </section>
  );
}

function Success({ booth, recommendations }: { booth: PublicBooth; recommendations: Recommendation[] }) {
  return (
    <section className="space-y-4 border-t border-default pt-4 text-center">
      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-status-success-subtle animate-[mq-scale-in_200ms_ease-out]">
        <svg className="size-6 text-status-success-text" fill="none" stroke="currentColor" viewBox="0 0 16 16" aria-hidden>
          <path strokeWidth="2" d="M3 8l3 3 7-7" />
        </svg>
      </div>
      <div className="animate-[mq-fade-up_300ms_ease-out]">
        <h3 className="text-sm font-semibold text-primary">You&apos;re connected!</h3>
        <p className="mt-1 text-xs text-muted">Your information was sent to {booth.companyName}</p>
      </div>
      {recommendations.length > 0 && (
        <div className="rounded-lg border border-default bg-sunken p-3 text-left animate-[mq-fade-up_400ms_ease-out]">
          <p className="text-xs font-medium text-primary">Recommended next</p>
          <ul className="mt-2 space-y-1">
            {recommendations.map((r) => (
              <li key={r.title} className="text-xs text-secondary">
                • {r.title}
              </li>
            ))}
          </ul>
        </div>
      )}
      <Link href="/hackathon" className="block">
        <Button variant="secondary" className="w-full">
          Back to Exhibition
        </Button>
      </Link>
    </section>
  );
}
"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { getEventExhibitor, getPublicEventBySlug } from "@concourse/api-client";
import type { PublicExhibitor } from "@concourse/api-client";
import { Button, Skeleton } from "@concourse/ui";
import { getApiBaseUrl } from "@/lib/api/config";

export default function InsightsPage({
  params,
}: {
  params: Promise<{ eventSlug: string; exhibitorId: string }>;
}) {
  const { eventSlug, exhibitorId } = use(params);
  const [exhibitor, setExhibitor] = useState<PublicExhibitor | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [insights, setInsights] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const ev = await getPublicEventBySlug({ baseUrl: getApiBaseUrl() }, eventSlug);
        if (cancelled) return;
        const ex = await getEventExhibitor({ baseUrl: getApiBaseUrl() }, ev.id, exhibitorId);
        if (cancelled) return;
        setExhibitor(ex);
      } catch { /* ignore */ }
      if (!cancelled) setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [eventSlug, exhibitorId]);

  const generate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setInsights(true);
    }, 1500);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/e/${eventSlug}/exhibitors/${exhibitorId}`}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-default text-muted transition-colors hover:border-strong hover:text-primary"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <p className="text-body-sm text-muted">AI Insights</p>
          <h1 className="text-title font-semibold text-primary">
            {exhibitor?.companyName ?? "Exhibitor"}
          </h1>
        </div>
      </div>

      {!insights && !generating && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-status-ai-border bg-gradient-to-br from-status-ai-subtle to-white p-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-status-ai-subtle">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-status-ai-text">
                <path d="M12 2a4 4 0 014 4v2a4 4 0 01-8 0V6a4 4 0 014-4z" />
                <path d="M4 16c0-4 8-4 8-4s8 0 8 4" />
                <path d="M20 16v2a4 4 0 01-4 4H8a4 4 0 01-4-4v-2" />
              </svg>
            </div>
            <h2 className="text-title font-semibold text-primary">
              Personalized Insights
            </h2>
            <p className="mt-2 text-body text-secondary">
              Discover why this exhibitor matches your profile, what to ask,
              and recommended next steps.
            </p>
            <Button
              className="mt-6 min-h-12 w-full text-body font-semibold"
              onClick={generate}
            >
              Generate My Insights
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <PlaceholderCard
              title="Match Score"
              description="Your profile match will appear here"
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 20V10M18 20V4M6 20v-4" />
                </svg>
              }
            />
            <PlaceholderCard
              title="Recommended Conversations"
              description="Topics tailored to your interests"
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                </svg>
              }
            />
          </div>
        </div>
      )}

      {generating && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="mb-6 h-12 w-12 animate-spin rounded-full border-4 border-status-ai-border border-t-status-ai-text" />
          <p className="text-body text-secondary">Generating your personalized insights...</p>
          <div className="mt-8 grid w-full grid-cols-2 gap-3">
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
          </div>
        </div>
      )}

      {insights && (
        <div className="space-y-4">
          <InsightSection
            title="Why this exhibitor matches you"
            icon="🎯"
            items={[
              "Your interest in cloud infrastructure aligns with their product suite",
              "Your industry experience in technology matches their target market",
              "Recent attendees with similar profiles found high value conversations",
            ]}
          />
          <InsightSection
            title="Recommended conversations"
            icon="💬"
            items={[
              "Ask about their approach to enterprise scalability",
              "Discuss integration patterns with existing tech stacks",
              "Explore their roadmap for AI-powered features",
            ]}
          />
          <InsightSection
            title="Products likely to interest you"
            icon="🛠️"
            items={[
              "Core platform — scalable infrastructure management",
              "Analytics suite — real-time business intelligence",
              "Developer APIs — extensible integration framework",
            ]}
          />
          <InsightSection
            title="Questions you should ask"
            icon="❓"
            items={[
              "What's your typical implementation timeline?",
              "How do you handle data residency requirements?",
              "Can you share a relevant customer success story?",
            ]}
          />
          <InsightSection
            title="Relevant case studies"
            icon="📊"
            items={[
              "How CompanyX reduced infrastructure costs by 40%",
              "Migration story: legacy to modern cloud architecture",
              "Security compliance framework for regulated industries",
            ]}
          />
          <InsightSection
            title="Suggested next steps"
            icon="🚀"
            items={[
              "Visit their booth for a personalized demo",
              "Save this exhibitor to your shortlist",
              "Prepare your questions before the meeting",
            ]}
          />
          <PlaceholderSection
            title="Recent company news"
            description="Latest news and updates will appear here once available."
            icon="📰"
          />
          <PlaceholderSection
            title="Recommended people to meet"
            description="People from your network visiting this exhibitor will appear here."
            icon="👥"
          />
        </div>
      )}
    </div>
  );
}

function InsightSection({
  title,
  icon,
  items,
}: {
  title: string;
  icon: string;
  items: string[];
}) {
  return (
    <div className="rounded-xl border border-status-ai-border bg-gradient-to-br from-status-ai-subtle/50 to-surface p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <h3 className="text-title-sm font-semibold text-primary">{title}</h3>
      </div>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-body-sm text-secondary">
            <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-status-ai-text" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function PlaceholderCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-default bg-surface p-4">
      <div className="mb-2 text-muted">{icon}</div>
      <h3 className="text-body-sm font-semibold text-primary">{title}</h3>
      <p className="mt-1 text-caption text-muted">{description}</p>
    </div>
  );
}

function PlaceholderSection({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-default bg-surface/50 p-4 text-center">
      <span className="text-2xl">{icon}</span>
      <h3 className="mt-2 text-title-sm font-semibold text-muted">{title}</h3>
      <p className="mt-1 text-caption text-muted">{description}</p>
    </div>
  );
}

"use client";

import { useEffect, useState, memo } from "react";
import {
  getDemoLiveEventMetrics,
  type DemoLiveEventMetrics,
} from "@concourse/api-client";
import { getApiBaseUrl } from "@/lib/api/config";
import { RelativeTime } from "./relative-time";
import { AnimatedCounter } from "./animated-counter";
import { AnimatedMetricCard } from "./animated-counter";

export function LiveDashboardMetrics({ boothId }: { boothId?: string }) {
  const [metrics, setMetrics] = useState<DemoLiveEventMetrics | null>(null);
  useEffect(() => {
    const load = async () => {
      try { setMetrics(await getDemoLiveEventMetrics({ baseUrl: getApiBaseUrl() })); } catch { /* demo API unavailable */ }
    };
    load();
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, []);
  const booth = boothId ? metrics?.liveMetricsByBooth[boothId] : undefined;
  const cards = booth
    ? [["Booth visitors", booth.visits], ["QR scans", booth.scans], ["Leads captured", booth.leads], ["Product views", booth.productViews], ["Resource downloads", booth.downloads], ["Messages", booth.chats]] as const
    : [["Booth visits", metrics?.totalLiveBoothVisits ?? 0], ["Leads generated", metrics?.totalLiveLeadSubmissions ?? 0], ["AI summaries", metrics?.totalLiveAiConversations ?? 0], ["Product views", metrics?.totalLiveProductViews ?? 0]] as const;
  return <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{cards.map(([label, value]) => <AnimatedMetricCard key={label} label={label} value={value} />)}</section>;
}

export function LiveOrganizerInsight() {
  const metrics = useLiveMetrics();
  const visits = metrics?.totalLiveBoothVisits ?? 0;
  const leads = metrics?.totalLiveLeadSubmissions ?? 0;
  const rate = visits > 0 ? Math.round((leads / visits) * 100) : 0;
  return <div className="rounded-lg border border-status-info-border border-l-4 border-l-status-info-solid bg-surface p-4 shadow-2"><p className="text-body text-secondary"><strong className="text-primary">Live:</strong>{" "}{visits === 0 ? "The simulation is running; activity will appear here as attendees engage." : `${visits} visits and ${leads} leads recorded so far (${rate}% conversion).`}</p></div>;
}

export function LiveEventStats({ boothCount }: { boothCount: number }) {
  const metrics = useLiveMetrics();
  return <dl className="mt-3 grid grid-cols-3 gap-4 text-body"><div><dt className="text-caption text-muted">Booths</dt><dd className="font-semibold text-primary">{boothCount}</dd></div><div><dt className="text-caption text-muted">Visits</dt><dd className="font-semibold text-primary"><AnimatedCounter value={metrics?.totalLiveBoothVisits ?? 0} /></dd></div><div><dt className="text-caption text-muted">Leads</dt><dd className="font-semibold text-primary"><AnimatedCounter value={metrics?.totalLiveLeadSubmissions ?? 0} /></dd></div></dl>;
}

export function LiveExhibitorPipeline({ boothId }: { boothId: string }) {
  const booth = useLiveMetrics()?.liveMetricsByBooth[boothId];
  const cards = [["Visitors", booth?.visits ?? 0, "text-secondary"], ["QR scans", booth?.scans ?? 0, "text-status-info-text"], ["Leads", booth?.leads ?? 0, "text-status-success-text"], ["AI chats", booth?.chats ?? 0, "text-status-ai-text"]] as const;
  return <div className="rounded-lg border border-default bg-surface p-5 shadow-1"><h2 className="text-title-sm font-semibold text-primary">Live booth performance</h2><div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">{cards.map(([label, value, tone]) => <div key={label} className="rounded-lg border border-default bg-sunken p-3"><p className={`text-caption font-medium ${tone}`}>{label}</p><p className="mt-1 text-xl font-semibold tabular-nums text-primary"><AnimatedCounter value={value} /></p></div>)}</div></div>;
}

export function LiveMetricsBar() {
  const metrics = useLiveMetrics();
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    if (metrics) setIsLive(true);
  }, [metrics]);

  if (!isLive) return null;

  const activeBooths = metrics
    ? Object.keys(metrics.liveMetricsByBooth).length
    : 0;

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-lg border border-status-success-border bg-status-success-subtle/50 px-4 py-2 text-caption">
      <span className="flex items-center gap-1.5 font-medium text-status-success-text">
        <span className="size-1.5 rounded-full bg-status-success-text animate-pulse" />
        Live
      </span>
      <span className="text-secondary">
        <strong className="text-primary">
          <AnimatedCounter
            value={metrics?.totalLiveBoothVisits ?? 0}
            duration={900}
          />
        </strong>{" "}
        visits
      </span>
      <span className="text-secondary">
        <strong className="text-primary">
          <AnimatedCounter
            value={metrics?.totalLiveAiConversations ?? 0}
            duration={900}
          />
        </strong>{" "}
        AI chats
      </span>
      <span className="text-secondary">
        <strong className="text-primary">
          <AnimatedCounter value={activeBooths} duration={900} />
        </strong>{" "}
        active booths
      </span>
      <span className="text-secondary">
        <strong className="text-primary">
          <AnimatedCounter
            value={metrics?.totalLiveLeadSubmissions ?? 0}
            duration={900}
          />
        </strong>{" "}
        leads
      </span>
      {metrics && metrics.averageDwellSeconds > 0 && (
        <span className="text-secondary">
          ~{metrics.averageDwellSeconds}s avg. dwell
        </span>
      )}
      {metrics && metrics.aiEngagementRate > 0 && (
        <span className="text-secondary">
          {metrics.aiEngagementRate}% AI engagement
        </span>
      )}
    </div>
  );
}

const ACTIVITY_TYPE_ICONS: Record<string, string> = {
  visit: "👋",
  ai_chat: "🤖",
  lead: "📋",
  download: "📄",
  qr_scan: "📷",
  product_view: "🔍",
};

export function RecentActivityFeed({ className }: { className?: string }) {
  const activities = useLiveMetrics()?.recentActivity ?? [];

  if (activities.length === 0) return null;

  return (
    <div className={className}>
      <h3 className="mb-3 text-body font-semibold text-primary">
        Live Activity Feed
      </h3>
      <div className="space-y-1.5">
        {activities.slice(0, 10).map((a, i) => (
          <div
            key={`${a.at}-${i}`}
            className="flex items-center gap-2 text-caption text-secondary"
          >
            <span>{ACTIVITY_TYPE_ICONS[a.type] ?? "•"}</span>
            <span className="flex-1 truncate">{a.detail}</span>
            <RelativeTime timestamp={a.at} />
          </div>
        ))}
      </div>
    </div>
  );
}

function useLiveMetrics() {
  const [metrics, setMetrics] = useState<DemoLiveEventMetrics | null>(null);
  useEffect(() => {
    const load = async () => {
      try { setMetrics(await getDemoLiveEventMetrics({ baseUrl: getApiBaseUrl() })); } catch { /* demo API unavailable */ }
    };
    load();
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, []);
  return metrics;
}

export const InsightCard = memo(function InsightCard({
  title,
  value,
  detail,
  accent = "info",
}: {
  title: string;
  value: string;
  detail?: string;
  accent?: "brand" | "success" | "warning" | "danger" | "info" | "ai";
}) {
  const accentBorders: Record<string, string> = {
    brand: "border-l-brand",
    success: "border-l-status-success-solid",
    warning: "border-l-status-warning-solid",
    danger: "border-l-status-danger-solid",
    info: "border-l-status-info-solid",
    ai: "border-l-status-ai-solid",
  };
  return (
    <div
      className={`border-l-4 ${accentBorders[accent]} rounded-lg border border-default bg-surface p-4 shadow-1`}
    >
      <p className="text-caption font-medium text-secondary">{title}</p>
      <p className="text-title-lg font-semibold tabular-nums text-primary mt-1">
        {value}
      </p>
      {detail && <p className="text-body-sm text-muted mt-0.5">{detail}</p>}
    </div>
  );
});

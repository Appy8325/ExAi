"use client";

import { useEffect, useState, memo } from "react";
import { getDemoLiveEventMetrics, type DemoLiveEventMetrics } from "@concourse/api-client";
import { getApiBaseUrl } from "@/lib/api/config";
import { RelativeTime } from "./relative-time";

export function LiveMetricsBar() {
  const [metrics, setMetrics] = useState<DemoLiveEventMetrics | null>(null);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getDemoLiveEventMetrics({ baseUrl: getApiBaseUrl() });
        setMetrics(data);
        setIsLive(true);
      } catch { /* ignore */ }
    };
    fetch();
    const interval = setInterval(fetch, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!isLive) return null;

  const activeBooths = metrics ? Object.keys(metrics.liveMetricsByBooth).length : 0;

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-lg border border-status-success-border bg-status-success-subtle/50 px-4 py-2 text-caption">
      <span className="flex items-center gap-1.5 font-medium text-status-success-text">
        <span className="size-1.5 rounded-full bg-status-success-text animate-pulse" />
        Live
      </span>
      <span className="text-secondary">
        <strong className="text-primary">{metrics?.totalLiveBoothVisits ?? 0}</strong> visits
      </span>
      <span className="text-secondary">
        <strong className="text-primary">{metrics?.totalLiveAiConversations ?? 0}</strong> AI chats
      </span>
      <span className="text-secondary">
        <strong className="text-primary">{activeBooths}</strong> active booths
      </span>
      <span className="text-secondary">
        <strong className="text-primary">{metrics?.totalLiveLeadSubmissions ?? 0}</strong> leads
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

export const LiveBadge = memo(function LiveBadge({ count, label }: { count: number; label: string }) {
  if (count === 0) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-status-success-subtle px-2 py-0.5 text-caption font-medium text-status-success-text">
      <span className="size-1.5 rounded-full bg-status-success-text animate-pulse" />
      {count} {label}
    </span>
  );
});

const ACTIVITY_TYPE_ICONS: Record<string, string> = {
  visit: "👋",
  ai_chat: "🤖",
  lead: "📋",
  download: "📄",
  qr_scan: "📷",
  product_view: "🔍",
};

export function RecentActivityFeed({ className }: { className?: string }) {
  const [activities, setActivities] = useState<DemoLiveEventMetrics["recentActivity"]>([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getDemoLiveEventMetrics({ baseUrl: getApiBaseUrl() });
        setActivities(data.recentActivity);
      } catch { /* ignore */ }
    };
    fetch();
    const interval = setInterval(fetch, 5000);
    return () => clearInterval(interval);
  }, []);

  if (activities.length === 0) return null;

  return (
    <div className={className}>
      <h3 className="mb-3 text-body font-semibold text-primary">Live Activity Feed</h3>
      <div className="space-y-1.5">
        {activities.slice(0, 10).map((a, i) => (
          <div key={`${a.at}-${i}`} className="flex items-center gap-2 text-caption text-secondary">
            <span>{ACTIVITY_TYPE_ICONS[a.type] ?? "•"}</span>
            <span className="flex-1 truncate">{a.detail}</span>
            <RelativeTime timestamp={a.at} />
          </div>
        ))}
      </div>
    </div>
  );
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
    <div className={`border-l-4 ${accentBorders[accent]} rounded-lg border border-default bg-surface p-4 shadow-1`}>
      <p className="text-caption font-medium text-secondary">{title}</p>
      <p className="text-title-lg font-semibold tabular-nums text-primary mt-1">{value}</p>
      {detail && <p className="text-body-sm text-muted mt-0.5">{detail}</p>}
    </div>
  );
});

"use client";

import { useEffect, useState } from "react";
import { getApiBaseUrl } from "@/lib/api/config";

type LiveMetrics = {
  totalLiveBoothVisits: number;
  totalLiveLeadSubmissions: number;
  totalLiveAiConversations: number;
  totalLiveBrochureDownloads: number;
  totalLiveProductViews: number;
  totalLiveReturningVisitors: number;
  averageDwellSeconds: number;
  aiEngagementRate: number;
  topBooth: { boothId: string; visits: number } | null;
  recentActivity: Array<{ at: string; type: string; detail: string }>;
  liveMetricsByBooth: Record<string, {
    visits: number; dwell: number; chats: number;
    downloads: number; productViews: number; leads: number;
  }>;
};

type SimulationStatus = {
  running: boolean;
  eventsGenerated: number;
  scenario: string;
  speed: number;
};

type AdminStatus = {
  simulation: SimulationStatus;
};

export function LiveDemoStats() {
  const [metrics, setMetrics] = useState<LiveMetrics | null>(null);
  const [simStatus, setSimStatus] = useState<SimulationStatus | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const base = getApiBaseUrl();
        const [liveRes, adminRes] = await Promise.all([
          fetch(`${base}/v1/public/demo/live`),
          fetch(`${base}/v1/public/demo/admin/status`),
        ]);
        if (liveRes.ok) {
          const data = await liveRes.json();
          setMetrics(data);
        }
        if (adminRes.ok) {
          const data: AdminStatus = await adminRes.json();
          setSimStatus(data.simulation);
        }
        setVisible(true);
      } catch { /* ignore */ }
    };
    load();
    const id = setInterval(load, 6000);
    return () => clearInterval(id);
  }, []);

  if (!visible) return null;

  return (
    <div className="mx-auto mt-12 max-w-3xl">
      <div className="rounded-2xl border border-brand/20 bg-brand-subtle/50 p-4 backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-center">
          {simStatus?.running ? (
            <span className="inline-flex items-center gap-1.5 text-caption font-semibold text-brand">
              <span className="size-1.5 rounded-full bg-brand animate-pulse" />
              Live simulation · {simStatus.scenario} · {simStatus.speed}×
            </span>
          ) : (
            <span className="text-caption font-medium text-muted">Simulation stopped</span>
          )}
          <span className="hidden text-muted">|</span>
          {metrics ? (
            <>
              <Stat label="Visits" value={metrics.totalLiveBoothVisits} />
              <span className="text-border-default">·</span>
              <Stat label="Leads" value={metrics.totalLiveLeadSubmissions} />
              <span className="text-border-default">·</span>
              <Stat label="AI chats" value={metrics.totalLiveAiConversations} />
              <span className="text-border-default">·</span>
              <Stat label="Products viewed" value={metrics.totalLiveProductViews} />
            </>
          ) : (
            <span className="text-caption text-muted">Loading live metrics…</span>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <span className="text-caption">
      <span className="font-semibold tabular-nums text-primary">{value.toLocaleString()}</span>
      <span className="ml-1 text-muted">{label}</span>
    </span>
  );
}
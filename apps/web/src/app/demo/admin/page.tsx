"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { getApiBaseUrl } from "@/lib/api/config";

type SimulationStatus = {
  running: boolean;
  speed: number;
  scenario: string;
  startedAt: string | null;
  eventsGenerated: number;
  lastEventAt: string | null;
  uptimeSeconds: number;
};

type ScenarioConfig = {
  id: string;
  label: string;
  description: string;
  trafficMultiplier: number;
  aiUsageMultiplier: number;
  meetingFrequencyMultiplier: number;
  leadGenerationMultiplier: number;
  dwellTimeMultiplier: number;
};

type AdminStatus = {
  simulation: SimulationStatus;
  scenarios: ScenarioConfig[];
};

type EventMetrics = {
  totalLiveBoothVisits: number;
  totalLiveAiConversations: number;
  totalLiveBrochureDownloads: number;
  totalLiveProductViews: number;
  totalLiveLeadSubmissions: number;
  totalLiveReturningVisitors: number;
  averageDwellSeconds: number;
  aiEngagementRate: number;
  recentActivity: Array<{ at: string; type: string; detail: string }>;
};

const MAX_EVENTS_HISTORY = 20;

const API_BASE = typeof window !== "undefined" ? getApiBaseUrl() : "";

async function api(path: string, method = "GET") {
  const res = await fetch(`${API_BASE}${path}`, { method });
  return res.json();
}

export default function DemoAdminPage() {
  const [status, setStatus] = useState<AdminStatus | null>(null);
  const [metrics, setMetrics] = useState<EventMetrics | null>(null);
  const [speed, setSpeedState] = useState(1);
  const [scenario, setScenarioState] = useState("peak_expo");
  const [eventsHistory, setEventsHistory] = useState<number[]>([]);
  const prevEventsGeneratedRef = useRef(0);

  const refresh = useCallback(async () => {
    try {
      const [s, m] = await Promise.all([
        api("/v1/public/demo/admin/status"),
        api("/v1/public/demo/admin/stats"),
      ]);
      setStatus(s);
      setMetrics(m.eventMetrics);
      setSpeedState(s.simulation.speed);
      setScenarioState(s.simulation.scenario);
      const newCount = s.simulation.eventsGenerated ?? 0;
      const delta = Math.max(0, newCount - prevEventsGeneratedRef.current);
      prevEventsGeneratedRef.current = newCount;
      setEventsHistory((prev) => {
        const next = [...prev, delta];
        return next.slice(-MAX_EVENTS_HISTORY);
      });
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 3000);
    return () => clearInterval(interval);
  }, [refresh]);

  const start = async () => { await api("/v1/public/demo/admin/start", "POST"); refresh(); };
  const pause = async () => { await api("/v1/public/demo/admin/pause", "POST"); refresh(); };
  const resume = async () => { await api("/v1/public/demo/admin/resume", "POST"); refresh(); };
  const stop = async () => { await api("/v1/public/demo/admin/stop", "POST"); refresh(); };
  const reset = async () => { await api("/v1/public/demo/admin/reset", "POST"); refresh(); };
  const setSpeed = async (s: number) => { await api(`/v1/public/demo/admin/speed?multiplier=${s}`, "POST"); refresh(); };
  const setScenario = async (s: string) => { await api(`/v1/public/demo/admin/scenario?id=${s}`, "POST"); refresh(); };

  const sim = status?.simulation;

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-[#e0e0e0]">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Demo Admin Panel</h1>
            <p className="mt-1 text-sm text-[#888]">Simulation control center — hidden from production</p>
          </div>
          <span className="rounded-full border border-[#333] bg-[#111] px-3 py-1 text-xs font-mono text-[#666]">
            DEMO MODE
          </span>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Simulation Controls */}
          <section className="rounded-xl border border-[#222] bg-[#111] p-5">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#888]">Simulation Controls</h2>
            <div className="flex flex-wrap gap-2">
              {!sim?.running ? (
                <button onClick={start} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500">Start</button>
              ) : (
                <>
                  <button onClick={pause} className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-500">Pause</button>
                  <button onClick={stop} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500">Stop</button>
                </>
              )}
              <button onClick={resume} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500">Resume</button>
              <button onClick={reset} className="rounded-lg border border-red-800 bg-transparent px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-950">Reset All</button>
            </div>

            <div className="mt-4">
              <label className="text-xs text-[#666]">Simulation Speed</label>
              <div className="mt-1 flex gap-2">
                {[1, 2, 5, 10].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSpeed(s)}
                    className={`rounded px-3 py-1 text-sm font-mono ${speed === s ? "bg-brand text-white" : "bg-[#1a1a2e] text-[#888] hover:text-white"}`}
                  >
                    {s}×
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Scenario Selector */}
          <section className="rounded-xl border border-[#222] bg-[#111] p-5">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#888]">Scenario</h2>
            <div className="grid grid-cols-2 gap-2">
              {status?.scenarios.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setScenario(s.id)}
                  className={`rounded-lg border p-3 text-left transition-colors ${scenario === s.id ? "border-brand bg-brand/10" : "border-[#222] bg-[#0a0a0f] hover:border-[#444]"}`}
                >
                  <p className="text-sm font-medium text-white">{s.label}</p>
                  <p className="mt-0.5 text-[10px] text-[#666]">{s.description.slice(0, 60)}...</p>
                </button>
              ))}
            </div>
          </section>

          {/* Current Statistics */}
          <section className="rounded-xl border border-[#222] bg-[#111] p-5">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#888]">Current Statistics</h2>
            <div className="grid grid-cols-3 gap-3">
              <Stat label="Attendees" value={metrics?.totalLiveBoothVisits ?? 0} />
              <Stat label="Visits" value={metrics?.totalLiveBoothVisits ?? 0} />
              <Stat label="Leads" value={metrics?.totalLiveLeadSubmissions ?? 0} />
              <Stat label="AI Chats" value={metrics?.totalLiveAiConversations ?? 0} />
              <Stat label="Meetings" value={metrics?.totalLiveLeadSubmissions ?? 0} />
              <Stat label="Brochures" value={metrics?.totalLiveBrochureDownloads ?? 0} />
            </div>
          </section>

          {/* System Health */}
          <section className="rounded-xl border border-[#222] bg-[#111] p-5">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#888]">System Health</h2>
            <div className="space-y-2 text-sm">
              <HealthRow label="Status" value={sim?.running ? "RUNNING" : "STOPPED"} good={sim?.running} />
              <HealthRow label="Events Generated" value={String(sim?.eventsGenerated ?? 0)} />
              <HealthRow label="Uptime" value={sim?.uptimeSeconds ? `${Math.floor(sim.uptimeSeconds / 60)}m ${sim.uptimeSeconds % 60}s` : "0s"} />
              <HealthRow label="Speed" value={`${sim?.speed ?? 1}×`} />
              <HealthRow label="Scenario" value={scenario} />
              <HealthRow label="Avg Dwell" value={`${metrics?.averageDwellSeconds ?? 0}s`} />
              <HealthRow label="AI Engagement" value={`${metrics?.aiEngagementRate ?? 0}%`} />
            </div>
          </section>

          {/* Events Per Minute Chart */}
          <section className="rounded-xl border border-[#222] bg-[#111] p-5">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#888]">Events / Poll</h2>
            {eventsHistory.length > 0 ? (
              <div className="flex items-end gap-1" style={{ height: 60 }}>
                {eventsHistory.map((count, i) => {
                  const max = Math.max(...eventsHistory, 1);
                  return (
                    <div
                      key={i}
                      className="flex-1 rounded-sm bg-brand transition-all duration-300"
                      style={{ height: `${Math.max(4, (count / max) * 100)}%` }}
                      title={`${count} events`}
                    />
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-[#555]">Start the simulation to see event generation.</p>
            )}
            <div className="mt-2 flex items-center justify-between text-xs text-[#555]">
              <span>oldest</span>
              <span className="text-[#888]">{eventsHistory.length > 0 ? `${eventsHistory[eventsHistory.length - 1]} now` : ""}</span>
              <span>newest</span>
            </div>
          </section>
        </div>

        {/* Activity Feed */}
        <section className="mt-6 rounded-xl border border-[#222] bg-[#111] p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#888]">Latest Activity</h2>
          <div className="max-h-60 space-y-1 overflow-y-auto">
            {(metrics?.recentActivity ?? []).slice(0, 20).map((a, i) => (
              <div key={i} className="flex items-center gap-2 text-xs font-mono text-[#888]">
                <span className="shrink-0 text-[#555]">{new Date(a.at).toLocaleTimeString()}</span>
                <span className="capitalize text-cyan-500">{a.type}</span>
                <span className="truncate">{a.detail}</span>
              </div>
            ))}
            {(!metrics?.recentActivity || metrics.recentActivity.length === 0) && (
              <p className="text-xs text-[#555]">No recent activity. Start the simulation to see live events.</p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-[#222] bg-[#0a0a0f] p-3">
      <p className="text-xs text-[#666]">{label}</p>
      <p className="mt-1 text-lg font-bold font-mono text-white">{value}</p>
    </div>
  );
}

function HealthRow({ label, value, good }: { label: string; value: string; good?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[#666]">{label}</span>
      <span className={`font-mono text-xs ${good === undefined ? "text-[#888]" : good ? "text-emerald-400" : "text-red-400"}`}>
        {good !== undefined && (
          <span className={`inline-block size-1.5 rounded-full mr-1.5 ${good ? "bg-emerald-400" : "bg-red-400"}`} />
        )}
        {value}
      </span>
    </div>
  );
}

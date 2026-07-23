"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { getApiBaseUrl } from "@/lib/api/config";
import { Button, PageHeader, StatusBadge } from "@concourse/ui";

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
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 3000);
    return () => clearInterval(interval);
  }, [refresh]);

  const start = async () => {
    await api("/v1/public/demo/admin/start", "POST");
    refresh();
  };
  const pause = async () => {
    await api("/v1/public/demo/admin/pause", "POST");
    refresh();
  };
  const resume = async () => {
    await api("/v1/public/demo/admin/resume", "POST");
    refresh();
  };
  const stop = async () => {
    await api("/v1/public/demo/admin/stop", "POST");
    refresh();
  };
  const reset = async () => {
    await api("/v1/public/demo/admin/reset", "POST");
    refresh();
  };
  const setSpeed = async (s: number) => {
    await api(`/v1/public/demo/admin/speed?multiplier=${s}`, "POST");
    refresh();
  };
  const setScenario = async (s: string) => {
    await api(`/v1/public/demo/admin/scenario?id=${s}`, "POST");
    refresh();
  };

  const sim = status?.simulation;

  return (
    <main className="min-h-screen bg-canvas text-primary">
      <div className="mx-auto max-w-6xl space-y-section px-6 py-8">
        <PageHeader
          title="Demo Admin Panel"
          description="Simulation control center — hidden from production"
          actions={<StatusBadge tone="neutral" className="font-mono">DEMO MODE</StatusBadge>}
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-xl border border-default bg-surface p-6">
            <h2 className="mb-4 text-body font-semibold uppercase tracking-wider text-muted">
              Simulation Controls
            </h2>
            <div className="flex flex-wrap gap-2">
              {!sim?.running ? (
                <Button
                  onClick={start}
                >
                  Start
                </Button>
              ) : (
                <>
                  <Button
                    onClick={pause}
                    variant="secondary"
                  >
                    Pause
                  </Button>
                  <Button
                    onClick={stop}
                    variant="danger"
                  >
                    Stop
                  </Button>
                </>
              )}
              <Button
                onClick={resume}
              >
                Resume
              </Button>
              <Button
                onClick={reset}
                variant="danger"
              >
                Reset All
              </Button>
            </div>

            <div className="mt-4">
              <label className="text-caption text-secondary">
                Simulation Speed
              </label>
              <div className="mt-1 flex gap-2">
                {[1, 2, 5, 10].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSpeed(s)}
                    aria-pressed={speed === s}
                    className={`rounded-lg px-3 py-1.5 text-body font-mono transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${speed === s ? "bg-brand text-on-brand" : "bg-sunken text-muted hover:text-primary"}`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-default bg-surface p-6">
            <h2 className="mb-4 text-body font-semibold uppercase tracking-wider text-muted">
              Scenario
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {status?.scenarios.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setScenario(s.id)}
                  aria-pressed={scenario === s.id}
                  className={`rounded-lg border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${scenario === s.id ? "border-brand bg-brand-subtle" : "border-default bg-canvas hover:border-strong hover:bg-sunken"}`}
                >
                  <p className="text-body font-medium text-primary">
                    {s.label}
                  </p>
                  <p className="mt-0.5 text-[10px] text-secondary">
                    {s.description.slice(0, 60)}...
                  </p>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-default bg-surface p-6">
            <h2 className="mb-4 text-body font-semibold uppercase tracking-wider text-muted">
              Current Statistics
            </h2>
            <div className="grid grid-cols-3 gap-3">
              <Stat
                label="Returning visitors"
                value={metrics?.totalLiveReturningVisitors ?? 0}
              />
              <Stat label="Visits" value={metrics?.totalLiveBoothVisits ?? 0} />
              <Stat
                label="Leads"
                value={metrics?.totalLiveLeadSubmissions ?? 0}
              />
              <Stat
                label="AI Chats"
                value={metrics?.totalLiveAiConversations ?? 0}
              />
              <Stat
                label="Product views"
                value={metrics?.totalLiveProductViews ?? 0}
              />
              <Stat
                label="Brochures"
                value={metrics?.totalLiveBrochureDownloads ?? 0}
              />
            </div>
          </section>

          <section className="rounded-xl border border-default bg-surface p-6">
            <h2 className="mb-4 text-body font-semibold uppercase tracking-wider text-muted">
              System Health
            </h2>
            <div className="space-y-2 text-body">
              <HealthRow
                label="Status"
                value={sim?.running ? "RUNNING" : "STOPPED"}
                good={sim?.running}
              />
              <HealthRow
                label="Events Generated"
                value={String(sim?.eventsGenerated ?? 0)}
              />
              <HealthRow
                label="Uptime"
                value={
                  sim?.uptimeSeconds
                    ? `${Math.floor(sim.uptimeSeconds / 60)}m ${sim.uptimeSeconds % 60}s`
                    : "0s"
                }
              />
              <HealthRow label="Speed" value={`${sim?.speed ?? 1}x`} />
              <HealthRow label="Scenario" value={scenario} />
              <HealthRow
                label="Avg Dwell"
                value={`${metrics?.averageDwellSeconds ?? 0}s`}
              />
              <HealthRow
                label="AI Engagement"
                value={`${metrics?.aiEngagementRate ?? 0}%`}
              />
            </div>
          </section>

          <section className="rounded-xl border border-default bg-surface p-6">
            <h2 className="mb-4 text-body font-semibold uppercase tracking-wider text-muted">
              Events / Poll
            </h2>
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
              <p className="text-caption text-muted">
                Start the simulation to see event generation.
              </p>
            )}
            <div className="mt-2 flex items-center justify-between text-caption text-muted">
              <span>oldest</span>
              <span className="text-muted">
                {eventsHistory.length > 0
                  ? `${eventsHistory[eventsHistory.length - 1]} now`
                  : ""}
              </span>
              <span>newest</span>
            </div>
          </section>
        </div>

        <section className="mt-6 rounded-xl border border-default bg-surface p-6">
          <h2 className="mb-4 text-body font-semibold uppercase tracking-wider text-muted">
            Latest Activity
          </h2>
          <div className="max-h-60 space-y-1 overflow-y-auto">
            {(metrics?.recentActivity ?? []).slice(0, 20).map((a, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-caption font-mono text-muted"
              >
                <span className="shrink-0 text-secondary">
                  {new Date(a.at).toLocaleTimeString()}
                </span>
                <span className="capitalize text-brand">{a.type}</span>
                <span className="truncate">{a.detail}</span>
              </div>
            ))}
            {(!metrics?.recentActivity ||
              metrics.recentActivity.length === 0) && (
              <p className="text-caption text-muted">
                No recent activity. Start the simulation to see live events.
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-default bg-sunken p-3">
      <p className="text-caption text-secondary">{label}</p>
      <p className="mt-1 text-lg font-bold font-mono text-primary">{value}</p>
    </div>
  );
}

function HealthRow({
  label,
  value,
  good,
}: {
  label: string;
  value: string;
  good?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-secondary">{label}</span>
      <span
        className={`font-mono text-caption ${good === undefined ? "text-muted" : good ? "text-status-success-text" : "text-status-danger-text"}`}
      >
        {good !== undefined && (
          <span
            className={`inline-block size-1.5 rounded-full mr-1.5 ${good ? "bg-status-success-text" : "bg-status-danger-text"}`}
          />
        )}
        {value}
      </span>
    </div>
  );
}

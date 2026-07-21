import { Injectable } from "@nestjs/common";

export type ScenarioId = "morning_rush" | "peak_expo" | "executive_networking" | "lunch_break" | "closing_session" | "day_two" | "final_day";

export interface ScenarioConfig {
  id: ScenarioId;
  label: string;
  description: string;
  trafficMultiplier: number;
  aiUsageMultiplier: number;
  meetingFrequencyMultiplier: number;
  leadGenerationMultiplier: number;
  dwellTimeMultiplier: number;
  boothPopularityBias: Record<string, number>;
  visitorBehavior: {
    technicalBuyers: number;
    executives: number;
    general: number;
  };
}

const SCENARIOS: Record<ScenarioId, ScenarioConfig> = {
  morning_rush: {
    id: "morning_rush",
    label: "Morning Rush",
    description: "Registration spike with high initial booth traffic as attendees arrive.",
    trafficMultiplier: 1.8,
    aiUsageMultiplier: 0.7,
    meetingFrequencyMultiplier: 0.4,
    leadGenerationMultiplier: 0.8,
    dwellTimeMultiplier: 0.6,
    boothPopularityBias: { Microsoft: 1.3, Google: 1.2, Apple: 1.1 },
    visitorBehavior: { technicalBuyers: 35, executives: 25, general: 40 },
  },
  peak_expo: {
    id: "peak_expo",
    label: "Peak Expo Hours",
    description: "Maximum traffic across all booths with high engagement.",
    trafficMultiplier: 2.5,
    aiUsageMultiplier: 1.5,
    meetingFrequencyMultiplier: 1.2,
    leadGenerationMultiplier: 1.8,
    dwellTimeMultiplier: 1.0,
    boothPopularityBias: { NVIDIA: 1.4, Microsoft: 1.3, Google: 1.2, Apple: 1.1 },
    visitorBehavior: { technicalBuyers: 40, executives: 30, general: 30 },
  },
  executive_networking: {
    id: "executive_networking",
    label: "Executive Networking",
    description: "VIP and executive attendees, longer conversations, higher quality leads.",
    trafficMultiplier: 1.0,
    aiUsageMultiplier: 0.5,
    meetingFrequencyMultiplier: 2.5,
    leadGenerationMultiplier: 2.0,
    dwellTimeMultiplier: 1.8,
    boothPopularityBias: { IBM: 1.5, Salesforce: 1.4, Cisco: 1.3, Microsoft: 1.2 },
    visitorBehavior: { technicalBuyers: 20, executives: 60, general: 20 },
  },
  lunch_break: {
    id: "lunch_break",
    label: "Lunch Break",
    description: "Reduced traffic, lighter conversations, more brochure browsing.",
    trafficMultiplier: 0.4,
    aiUsageMultiplier: 0.3,
    meetingFrequencyMultiplier: 0.2,
    leadGenerationMultiplier: 0.3,
    dwellTimeMultiplier: 0.5,
    boothPopularityBias: { Adobe: 1.3, Apple: 1.2, Google: 1.1 },
    visitorBehavior: { technicalBuyers: 30, executives: 20, general: 50 },
  },
  closing_session: {
    id: "closing_session",
    label: "Closing Session",
    description: "End-of-day surge, final meetings, last-minute lead submissions.",
    trafficMultiplier: 1.5,
    aiUsageMultiplier: 1.2,
    meetingFrequencyMultiplier: 1.5,
    leadGenerationMultiplier: 2.5,
    dwellTimeMultiplier: 0.8,
    boothPopularityBias: { Microsoft: 1.2, Salesforce: 1.3, Adobe: 1.2 },
    visitorBehavior: { technicalBuyers: 30, executives: 35, general: 35 },
  },
  day_two: {
    id: "day_two",
    label: "Day Two",
    description: "Full second day with returning visitors and deeper engagements.",
    trafficMultiplier: 2.0,
    aiUsageMultiplier: 1.8,
    meetingFrequencyMultiplier: 1.5,
    leadGenerationMultiplier: 1.5,
    dwellTimeMultiplier: 1.3,
    boothPopularityBias: { NVIDIA: 1.3, Microsoft: 1.2, Google: 1.2, Apple: 1.1, Intel: 1.1 },
    visitorBehavior: { technicalBuyers: 35, executives: 30, general: 35 },
  },
  final_day: {
    id: "final_day",
    label: "Final Day",
    description: "Last chance for meetings, closing deals, maximum urgency.",
    trafficMultiplier: 2.2,
    aiUsageMultiplier: 2.0,
    meetingFrequencyMultiplier: 2.0,
    leadGenerationMultiplier: 3.0,
    dwellTimeMultiplier: 1.5,
    boothPopularityBias: { Salesforce: 1.5, IBM: 1.4, Cisco: 1.3, Microsoft: 1.2 },
    visitorBehavior: { technicalBuyers: 30, executives: 40, general: 30 },
  },
};

export interface SimulationStatus {
  running: boolean;
  speed: number;
  scenario: ScenarioId;
  startedAt: string | null;
  eventsGenerated: number;
  lastEventAt: string | null;
  uptimeSeconds: number;
}

@Injectable()
export class DemoScenarioService {
  private currentScenario: ScenarioConfig = SCENARIOS.peak_expo;
  private speed = 1;
  private running = false;
  private startedAt: Date | null = null;
  private lastEventAt: Date | null = null;
  private eventsGenerated = 0;

  getScenario(id: ScenarioId): ScenarioConfig {
    return SCENARIOS[id];
  }

  getCurrentScenario(): ScenarioConfig {
    return this.currentScenario;
  }

  setScenario(id: ScenarioId): ScenarioConfig {
    this.currentScenario = SCENARIOS[id];
    return this.currentScenario;
  }

  getAllScenarios(): ScenarioConfig[] {
    return Object.values(SCENARIOS);
  }

  setSpeed(multiplier: number): void {
    this.speed = Math.max(1, Math.min(10, multiplier));
  }

  getSpeed(): number {
    return this.speed;
  }

  start(): void {
    this.running = true;
    this.startedAt = new Date();
  }

  pause(): void {
    this.running = false;
  }

  resume(): void {
    this.running = true;
  }

  isRunning(): boolean {
    return this.running;
  }

  recordEvent(): void {
    this.eventsGenerated++;
    this.lastEventAt = new Date();
  }

  getStatus(): SimulationStatus {
    return {
      running: this.running,
      speed: this.speed,
      scenario: this.currentScenario.id,
      startedAt: this.startedAt?.toISOString() ?? null,
      eventsGenerated: this.eventsGenerated,
      lastEventAt: this.lastEventAt?.toISOString() ?? null,
      uptimeSeconds: this.startedAt
        ? Math.floor((Date.now() - this.startedAt.getTime()) / 1000)
        : 0,
    };
  }

  reset(): void {
    this.running = false;
    this.speed = 1;
    this.currentScenario = SCENARIOS.peak_expo;
    this.startedAt = null;
    this.lastEventAt = null;
    this.eventsGenerated = 0;
  }
}

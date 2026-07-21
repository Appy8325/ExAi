import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { sql } from "drizzle-orm";

import { DATABASE_CLIENT, type DatabaseClient } from "../../common/database-client";
import { DemoAnalyticsStore, type TrackEvent } from "./demo-analytics.store";
import { DemoScenarioService } from "./demo-scenario.service";

interface SeededAttendee {
  id: string;
  fullName: string;
  company: string;
  title: string;
  interests: string[];
  profileType: string;
}

interface SeededExhibitor {
  id: string;
  name: string;
  booth: string;
  industry: string;
  products: Array<{ name: string; description: string }>;
  contacts: Array<{ name: string }>;
  brochures: Array<{ title: string }>;
}

interface SeededData {
  attendees: SeededAttendee[];
  exhibitors: SeededExhibitor[];
  event: { startAt: string; endAt: string };
}

@Injectable()
export class DemoSimulationService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DemoSimulationService.name);
  private timer: ReturnType<typeof setInterval> | null = null;
  private seededData: SeededData | null = null;

  private readonly questionPool: Record<string, string[]> = {
    Microsoft: [
      "How does Copilot integrate with Microsoft 365?",
      "What is Azure AI's RAG architecture?",
      "Can you show me Microsoft Fabric?",
    ],
    Google: [
      "How does Gemini compare to GPT-4?",
      "What's new in Vertex AI?",
      "How does Google Cloud handle multi-cloud?",
    ],
    Apple: [
      "How does Apple Intelligence protect privacy?",
      "What's the developer story for Vision Pro?",
      "How are M-series chips optimized?",
    ],
    NVIDIA: [
      "How does CUDA accelerate AI training?",
      "What's new in the DGX product line?",
      "Can you demo Omniverse?",
    ],
    Adobe: [
      "How does Firefly handle commercial licensing?",
      "What's the roadmap for AI in Creative Cloud?",
      "How does Experience Cloud unify data?",
    ],
    Cisco: [
      "How does Meraki simplify network management?",
      "What's the zero trust architecture?",
      "How does AppDynamics integrate?",
    ],
    Salesforce: [
      "How is Einstein AI embedded in Sales Cloud?",
      "How does Data Cloud unify profiles?",
      "What's the Tableau AI roadmap?",
    ],
    IBM: [
      "How does watsonx compare to other AI platforms?",
      "What's the roadmap for IBM Quantum?",
      "How does OpenShift simplify hybrid cloud?",
    ],
    Intel: [
      "How does the NPU in Core Ultra enable AI PCs?",
      "What's the performance story for Gaudi?",
      "How does vPro improve security?",
    ],
    Siemens: [
      "How does Xcelerator connect OT and IT?",
      "What's new in SIMATIC automation?",
      "How does digital twin work?",
    ],
  };

  constructor(
    @Inject(DATABASE_CLIENT) private readonly database: DatabaseClient,
    private readonly analyticsStore: DemoAnalyticsStore,
    private readonly scenarioService: DemoScenarioService,
  ) {}

  async onModuleInit() {
    await this.loadSeededData();
    this.logger.log("Demo simulation service initialized with seeded data.");
  }

  onModuleDestroy() {
    this.stopSimulation();
  }

  private async loadSeededData() {
    try {
      const exhibitorRows = await this.database.execute(sql<{
        id: string; name: string; booth_number: string; industry: string;
        products_json: string; contacts_json: string; brochures_json: string;
      }>`
        SELECT booth.id, org.name, booth.booth_number,
          COALESCE(booth.description, '') AS industry,
          '[]'::text AS products_json,
          '[]'::text AS contacts_json,
          '[]'::text AS brochures_json
        FROM event_exhibitors booth
        JOIN organizations org ON org.id = booth.organization_id
        WHERE booth.status = 'ready'
        ORDER BY org.name ASC
      `);

      const attendeeRows = await this.database.execute(sql<{
        id: string; full_name: string; company: string; job_title: string;
      }>`
        SELECT u.id, u.full_name, COALESCE(ap.company, '') AS company,
          COALESCE(ap.job_title, '') AS job_title
        FROM users u
        LEFT JOIN attendee_profiles ap ON ap.user_id = u.id
        WHERE u.email LIKE '%@techexpo.local'
        ORDER BY u.email ASC
        LIMIT 200
      `);

      const exhibitors: SeededExhibitor[] = (exhibitorRows as unknown as Array<{
        id: string; name: string; booth_number: string; industry: string;
        products_json: string; contacts_json: string; brochures_json: string;
      }>).map(r => ({
        id: r.id,
        name: r.name,
        booth: r.booth_number ?? "",
        industry: r.industry,
        products: [],
        contacts: [],
        brochures: [],
      }));

      const attendees: SeededAttendee[] = (attendeeRows as unknown as Array<{
        id: string; full_name: string; company: string; job_title: string;
      }>).map(r => ({
        id: r.id,
        fullName: r.full_name ?? "",
        company: r.company ?? "",
        title: r.job_title ?? "",
        interests: ["AI/ML", "Cloud", "Security", "Data Analytics", "Innovation"],
        profileType: "General",
      }));

      this.seededData = {
        attendees,
        exhibitors,
        event: {
          startAt: "2027-05-12T16:00:00Z",
          endAt: "2027-05-15T01:00:00Z",
        },
      };

      this.logger.log(`Loaded ${attendees.length} attendees and ${exhibitors.length} exhibitors for simulation.`);
    } catch (err) {
      this.logger.error("Failed to load seeded data for simulation:", err);
    }
  }

  startSimulation(): void {
    if (this.timer) return;
    this.scenarioService.start();
    this.scheduleTick();
    this.logger.log("Simulation started.");
  }

  stopSimulation(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.scenarioService.pause();
    this.logger.log("Simulation stopped.");
  }

  pauseSimulation(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.scenarioService.pause();
    this.logger.log("Simulation paused.");
  }

  resumeSimulation(): void {
    if (this.timer) return;
    this.scenarioService.resume();
    this.scheduleTick();
    this.logger.log("Simulation resumed.");
  }

  restartSimulation(): void {
    this.stopSimulation();
    this.analyticsStore.reset();
    this.scenarioService.reset();
    this.startSimulation();
  }

  private scheduleTick(): void {
    if (!this.scenarioService.isRunning()) return;
    const scenario = this.scenarioService.getCurrentScenario();
    const speed = this.scenarioService.getSpeed();
    const baseInterval = 20000 + Math.random() * 40000;
    const adjustedInterval = Math.max(2000, baseInterval / (speed * scenario.trafficMultiplier));

    this.timer = setTimeout(() => {
      this.tick(scenario);
      this.scenarioService.recordEvent();
      this.scheduleTick();
    }, adjustedInterval);
  }

  private tick(scenario: ReturnType<typeof this.scenarioService.getCurrentScenario>): void {
    if (!this.seededData) return;
    const { attendees, exhibitors } = this.seededData;
    if (attendees.length === 0 || exhibitors.length === 0) return;

    const rand = Math.random;
    const isBiasMatch = (name: string): boolean => {
      for (const biased of Object.keys(scenario.boothPopularityBias)) {
        if (name.includes(biased)) return true;
      }
      return false;
    };

    const biasedExhibitors = exhibitors.filter(e => isBiasMatch(e.name));
    const normalExhibitors = exhibitors.filter(e => !isBiasMatch(e.name));

    let chosenExhibitor: SeededExhibitor;
    if (biasedExhibitors.length > 0 && rand() < 0.6) {
      chosenExhibitor = biasedExhibitors[Math.floor(rand() * biasedExhibitors.length)]!;
    } else if (normalExhibitors.length > 0) {
      chosenExhibitor = normalExhibitors[Math.floor(rand() * normalExhibitors.length)]!;
    } else {
      chosenExhibitor = exhibitors[Math.floor(rand() * exhibitors.length)]!;
    }

    const chosenAttendee = attendees[Math.floor(rand() * attendees.length)]!;

    const eventType = this.weightedRandom(rand, [
      { item: "booth_visit" as const, weight: 25 * scenario.trafficMultiplier },
      { item: "qr_scan" as const, weight: 15 * scenario.trafficMultiplier },
      { item: "ai_chat" as const, weight: 15 * scenario.aiUsageMultiplier },
      { item: "product_view" as const, weight: 20 },
      { item: "brochure_download" as const, weight: 10 },
      { item: "lead_submission" as const, weight: 8 * scenario.leadGenerationMultiplier },
      { item: "meeting_request" as const, weight: 5 * scenario.meetingFrequencyMultiplier },
      { item: "returning_visitor" as const, weight: 7 },
    ]);

    const baseEvent = {
      boothId: chosenExhibitor.id,
      attendeeId: chosenAttendee.id,
    };

    if (eventType === "ai_chat") {
      const messageCount = 2 + Math.floor(rand() * 4);
      this.analyticsStore.track({ ...baseEvent, type: "ai_chat", messageCount });
    } else if (eventType === "booth_visit" || eventType === "dwell") {
      const dwellSeconds = 60 + Math.floor(rand() * 900 * scenario.dwellTimeMultiplier);
      this.analyticsStore.track({ ...baseEvent, type: "booth_visit" });
      this.analyticsStore.track({ ...baseEvent, type: "dwell", seconds: Math.min(dwellSeconds, 3600) });
    } else {
      const typeMap: Record<string, TrackEvent["type"]> = {
        qr_scan: "qr_scan",
        lead_submission: "lead_submission",
        meeting_request: "lead_submission",
        returning_visitor: "booth_visit",
        product_view: "product_view",
        brochure_download: "brochure_download",
      };
      this.analyticsStore.track({ ...baseEvent, type: typeMap[eventType] ?? "booth_visit" });
    }

    this.logger.debug(`[Sim] ${eventType} @ ${chosenExhibitor.name} by ${chosenAttendee.fullName}`);
  }

  private weightedRandom<T>(rand: () => number, items: Array<{ item: T; weight: number }>): T {
    const total = items.reduce((s, i) => s + i.weight, 0);
    let r = rand() * total;
    for (const { item, weight } of items) {
      r -= weight;
      if (r <= 0) return item;
    }
    return items[items.length - 1]!.item;
  }
}

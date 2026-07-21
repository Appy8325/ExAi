import { Controller, Get, Post, Query } from "@nestjs/common";
import { DemoSimulationService } from "./demo-simulation.service";
import { DemoScenarioService, type ScenarioId } from "./demo-scenario.service";
import { DemoAnalyticsStore } from "./demo-analytics.store";

@Controller("v1/public/demo/admin")
export class DemoAdminController {
  constructor(
    private readonly simulation: DemoSimulationService,
    private readonly scenarioService: DemoScenarioService,
    private readonly analyticsStore: DemoAnalyticsStore,
  ) {}

  @Get("status")
  status() {
    return {
      simulation: this.scenarioService.getStatus(),
      scenarios: this.scenarioService.getAllScenarios(),
    };
  }

  @Post("start")
  start() {
    this.simulation.startSimulation();
    return { started: true };
  }

  @Post("stop")
  stop() {
    this.simulation.stopSimulation();
    return { stopped: true };
  }

  @Post("pause")
  pause() {
    this.simulation.pauseSimulation();
    return { paused: true };
  }

  @Post("resume")
  resume() {
    this.simulation.resumeSimulation();
    return { resumed: true };
  }

  @Post("restart")
  restart() {
    this.simulation.restartSimulation();
    return { restarted: true };
  }

  @Post("speed")
  setSpeed(@Query("multiplier") multiplier?: string) {
    const speed = multiplier ? parseInt(multiplier, 10) : 1;
    this.scenarioService.setSpeed(Math.max(1, Math.min(10, speed)));
    return { speed: this.scenarioService.getSpeed() };
  }

  @Post("scenario")
  setScenario(@Query("id") id?: string) {
    const scenario = this.scenarioService.setScenario((id as ScenarioId) ?? "peak_expo");
    return { scenario };
  }

  @Post("reset")
  reset() {
    this.analyticsStore.reset();
    this.simulation.restartSimulation();
    return { reset: true };
  }

  @Get("stats")
  stats() {
    return {
      eventMetrics: this.analyticsStore.getEventMetrics(),
      simulation: this.scenarioService.getStatus(),
    };
  }
}

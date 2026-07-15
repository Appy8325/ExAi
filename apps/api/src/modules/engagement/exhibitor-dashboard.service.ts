import { Injectable } from "@nestjs/common";
import type { ExhibitorDashboardRepository } from "./exhibitor-dashboard.repository";

@Injectable()
export class ExhibitorDashboardService {
  constructor(private readonly repository: ExhibitorDashboardRepository) {}
  find(organizationId: string, eventExhibitorId: string, actorUserId: string) { return this.repository.find({ organizationId, eventExhibitorId, actorUserId }); }
}

import { Injectable } from "@nestjs/common";
import { RelationshipWorkspaceRepository } from "./relationship-workspace.repository";

@Injectable()
export class RelationshipWorkspaceService {
  constructor(private readonly repository: RelationshipWorkspaceRepository) {}
  find(organizationId: string, relationshipId: string, actorUserId: string) {
    return this.repository.find({ organizationId, relationshipId, actorUserId });
  }
}

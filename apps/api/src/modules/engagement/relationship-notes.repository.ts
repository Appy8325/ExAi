import { Inject, Injectable } from "@nestjs/common";
import { and, eq } from "drizzle-orm";
import { setRlsContext } from "@concourse/database";
import { DATABASE_CLIENT, type DatabaseClient } from "../../common/database-client";
import { exhibitorRelationshipNotes } from "@concourse/database/schema";

@Injectable()
export class RelationshipNotesRepository {
  constructor(@Inject(DATABASE_CLIENT) private readonly database: DatabaseClient) {}
  create(input: { organizationId:string; actorUserId:string; relationshipId:string; body:string }) { return this.database.transaction(async tx=>{ await setRlsContext(tx,input.organizationId,input.actorUserId); return (await tx.insert(exhibitorRelationshipNotes).values({relationshipId:input.relationshipId,body:input.body,createdByUserId:input.actorUserId}).returning())[0]; }); }
  update(input: { organizationId:string; actorUserId:string; noteId:string; body:string }) { return this.database.transaction(async tx=>{ await setRlsContext(tx,input.organizationId,input.actorUserId); return (await tx.update(exhibitorRelationshipNotes).set({body:input.body,updatedAt:new Date()}).where(and(eq(exhibitorRelationshipNotes.id,input.noteId),eq(exhibitorRelationshipNotes.status,"active"))).returning())[0]; }); }
  archive(input: { organizationId:string; actorUserId:string; noteId:string }) { return this.database.transaction(async tx=>{ await setRlsContext(tx,input.organizationId,input.actorUserId); return (await tx.update(exhibitorRelationshipNotes).set({status:"archived",updatedAt:new Date()}).where(and(eq(exhibitorRelationshipNotes.id,input.noteId),eq(exhibitorRelationshipNotes.status,"active"))).returning())[0]; }); }
}

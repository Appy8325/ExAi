import { Injectable } from "@nestjs/common";
import { db, setRlsContext } from "@concourse/database";
import { eventExhibitors, leadFormFields, leadForms } from "@concourse/database/schema";
import { and, eq, ne } from "drizzle-orm";

@Injectable()
export class LeadFormsRepository {
  private async tx<T>(org: string, user: string, work: Parameters<typeof db.transaction>[0]) { return db.transaction(async tx => { await setRlsContext(tx, org, user); return work(tx) as Promise<T>; }); }
  create(i: { eventExhibitorId: string; organizationId: string; actorUserId: string; name: string; description?: string }) { return this.tx(i.organizationId, i.actorUserId, async tx => { await owned(tx, i.eventExhibitorId, i.organizationId); const [x] = await tx.insert(leadForms).values({ eventExhibitorId: i.eventExhibitorId, name: i.name, description: i.description }).returning(); return x; }); }
  update(i: { id: string; organizationId: string; actorUserId: string; name?: string; description?: string | null }) { return this.tx(i.organizationId, i.actorUserId, async tx => { const [x] = await tx.update(leadForms).set({ name: i.name, description: i.description, updatedAt: new Date() }).where(and(eq(leadForms.id, i.id), ne(leadForms.status, "archived"))).returning(); return x; }); }
  find(id: string, org: string, user: string) { return this.tx(org, user, async tx => (await tx.select().from(leadForms).where(eq(leadForms.id, id)))[0]); }
  archive(id: string, org: string, user: string) { return this.tx(org, user, async tx => (await tx.update(leadForms).set({ status: "archived", updatedAt: new Date() }).where(and(eq(leadForms.id, id), ne(leadForms.status, "archived"))).returning())[0]); }
  addField(i: any) { return this.tx(i.organizationId, i.actorUserId, async tx => (await tx.insert(leadFormFields).values({ leadFormId: i.leadFormId, key: i.key, label: i.label, type: i.type, required: i.required, placeholder: i.placeholder, defaultValue: i.defaultValue, validation: i.validation, sortOrder: i.sortOrder, helpText: i.helpText, visibilityCondition: i.visibilityCondition }).returning())[0]); }
  updateField(i: any) { return this.tx(i.organizationId, i.actorUserId, async tx => { const { id, organizationId, actorUserId, ...values } = i; return (await tx.update(leadFormFields).set({ ...values, updatedAt: new Date() }).where(and(eq(leadFormFields.id, id), ne(leadFormFields.status, "archived"))).returning())[0]; }); }
  archiveField(id: string, org: string, user: string) { return this.tx(org, user, async tx => (await tx.update(leadFormFields).set({ status: "archived", updatedAt: new Date() }).where(and(eq(leadFormFields.id, id), ne(leadFormFields.status, "archived"))).returning())[0]); }
}
async function owned(tx: Parameters<Parameters<typeof db.transaction>[0]>[0], id: string, org: string) { if (!(await tx.select({ id: eventExhibitors.id }).from(eventExhibitors).where(and(eq(eventExhibitors.id, id), eq(eventExhibitors.organizationId, org))))[0]) throw new Error("Event exhibitor not found in organization scope."); }

import { BadRequestException } from "@nestjs/common";
import { describe, expect, it, vi } from "vitest";
import { LeadFormsService } from "./lead-forms.service";
describe("LeadFormsService", () => { const repo = () => ({ create: vi.fn(), update: vi.fn(), addField: vi.fn(), archive: vi.fn(), archiveField: vi.fn() });
  it("validates forms and all supported field definitions", () => { const r=repo(); const s=new LeadFormsService(r as never); expect(()=>s.create({name:" ",eventExhibitorId:"x"})).toThrow(BadRequestException); s.addField({leadFormId:"x",organizationId:"o",actorUserId:"u",key:"email",label:"Email",type:"email",sortOrder:0}); expect(r.addField).toHaveBeenCalled(); expect(()=>s.addField({leadFormId:"x",key:"x",label:"X",type:"bad",sortOrder:0})).toThrow(BadRequestException); expect(()=>s.addField({leadFormId:"x",key:"x",label:"X",type:"text",sortOrder:-1})).toThrow(BadRequestException); });
  it("delegates updates and soft archives", () => { const r=repo(); const s=new LeadFormsService(r as never); s.update({id:"f",organizationId:"o",actorUserId:"u",name:" Form "}); s.archive("f","o","u"); s.archiveField("x","o","u"); expect(r.update).toHaveBeenCalledWith(expect.objectContaining({name:"Form"})); expect(r.archive).toHaveBeenCalled(); expect(r.archiveField).toHaveBeenCalled(); });
});

import { Injectable } from "@nestjs/common";

export type TrackEvent =
  | { type: "booth_visit"; boothId: string; attendeeId?: string }
  | { type: "product_view"; boothId: string; productName?: string }
  | { type: "brochure_download"; boothId: string }
  | { type: "ai_chat"; boothId: string; messageCount: number }
  | { type: "qr_scan"; boothId: string }
  | { type: "lead_submission"; boothId: string }
  | { type: "dwell"; boothId: string; seconds: number }
  | { type: "suggested_question_click"; boothId: string };

export interface LiveBoothMetrics {
  liveVisits: number;
  liveProductViews: number;
  liveBrochureDownloads: number;
  liveAiChats: number;
  liveAiChatMessages: number;
  liveQrScans: number;
  liveReturningVisitors: number;
  liveDwellSeconds: number;
  liveSuggestedQuestionClicks: number;
}

export interface LiveEventMetrics {
  totalLiveAiConversations: number;
  totalLiveBrochureDownloads: number;
  totalLiveProductViews: number;
  totalLiveBoothVisits: number;
  totalLiveDwellSeconds: number;
  liveMetricsByBooth: Record<string, {
    visits: number;
    dwell: number;
    chats: number;
    downloads: number;
    productViews: number;
  }>;
}

@Injectable()
export class DemoAnalyticsStore {
  private boothVisits = new Map<string, Set<string>>();
  private boothProductViews = new Map<string, number>();
  private boothBrochureDownloads = new Map<string, number>();
  private boothAiChats = new Map<string, { sessions: number; messages: number }>();
  private boothQrScans = new Map<string, number>();
  private boothLeadSubmissions = new Map<string, number>();
  private boothDwellSeconds = new Map<string, number>();
  private boothSuggestedQuestionClicks = new Map<string, number>();
  private totalBoothVisits = 0;

  track(event: TrackEvent): void {
    switch (event.type) {
      case "booth_visit": {
        let visitors = this.boothVisits.get(event.boothId);
        if (!visitors) {
          visitors = new Set();
          this.boothVisits.set(event.boothId, visitors);
        }
        visitors.add(event.attendeeId ?? `anon-${Date.now()}`);
        this.totalBoothVisits++;
        break;
      }
      case "product_view":
        this.boothProductViews.set(event.boothId, (this.boothProductViews.get(event.boothId) ?? 0) + 1);
        break;
      case "brochure_download":
        this.boothBrochureDownloads.set(event.boothId, (this.boothBrochureDownloads.get(event.boothId) ?? 0) + 1);
        break;
      case "ai_chat": {
        const current = this.boothAiChats.get(event.boothId) ?? { sessions: 0, messages: 0 };
        current.sessions++;
        current.messages += event.messageCount;
        this.boothAiChats.set(event.boothId, current);
        break;
      }
      case "qr_scan":
        this.boothQrScans.set(event.boothId, (this.boothQrScans.get(event.boothId) ?? 0) + 1);
        break;
      case "lead_submission":
        this.boothLeadSubmissions.set(event.boothId, (this.boothLeadSubmissions.get(event.boothId) ?? 0) + 1);
        break;
      case "dwell":
        this.boothDwellSeconds.set(event.boothId, (this.boothDwellSeconds.get(event.boothId) ?? 0) + event.seconds);
        break;
      case "suggested_question_click":
        this.boothSuggestedQuestionClicks.set(event.boothId, (this.boothSuggestedQuestionClicks.get(event.boothId) ?? 0) + 1);
        break;
    }
  }

  getBoothMetrics(boothId: string): LiveBoothMetrics {
    return {
      liveVisits: this.boothVisits.get(boothId)?.size ?? 0,
      liveProductViews: this.boothProductViews.get(boothId) ?? 0,
      liveBrochureDownloads: this.boothBrochureDownloads.get(boothId) ?? 0,
      liveAiChats: this.boothAiChats.get(boothId)?.sessions ?? 0,
      liveAiChatMessages: this.boothAiChats.get(boothId)?.messages ?? 0,
      liveQrScans: this.boothQrScans.get(boothId) ?? 0,
      liveReturningVisitors: Math.round((this.boothVisits.get(boothId)?.size ?? 0) * 0.3),
      liveDwellSeconds: this.boothDwellSeconds.get(boothId) ?? 0,
      liveSuggestedQuestionClicks: this.boothSuggestedQuestionClicks.get(boothId) ?? 0,
    };
  }

  getEventMetrics(): LiveEventMetrics {
    const boothIds = new Set([
      ...this.boothVisits.keys(),
      ...this.boothDwellSeconds.keys(),
      ...this.boothAiChats.keys(),
      ...this.boothBrochureDownloads.keys(),
      ...this.boothProductViews.keys(),
    ]);
    const liveMetricsByBooth: Record<string, { visits: number; dwell: number; chats: number; downloads: number; productViews: number }> = {};
    let chats = 0;
    let productViews = 0;
    let downloads = 0;
    let dwell = 0;
    for (const boothId of boothIds) {
      const bv = this.boothVisits.get(boothId)?.size ?? 0;
      const dw = this.boothDwellSeconds.get(boothId) ?? 0;
      const ch = this.boothAiChats.get(boothId)?.sessions ?? 0;
      const dl = this.boothBrochureDownloads.get(boothId) ?? 0;
      const pv = this.boothProductViews.get(boothId) ?? 0;
      liveMetricsByBooth[boothId] = { visits: bv, dwell: dw, chats: ch, downloads: dl, productViews: pv };
      chats += ch;
      productViews += pv;
      downloads += dl;
      dwell += dw;
    }
    return {
      totalLiveAiConversations: chats,
      totalLiveBrochureDownloads: downloads,
      totalLiveProductViews: productViews,
      totalLiveBoothVisits: this.totalBoothVisits,
      totalLiveDwellSeconds: dwell,
      liveMetricsByBooth,
    };
  }
}

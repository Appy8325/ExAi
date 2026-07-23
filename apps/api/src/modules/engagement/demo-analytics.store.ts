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
  liveLeadSubmissions: number;
  averageDwellSeconds: number;
  aiEngagementRate: number;
}

interface ActivityEntry {
  at: string;
  type: string;
  boothId: string;
  detail: string;
}

export interface LiveEventMetrics {
  totalLiveAiConversations: number;
  totalLiveBrochureDownloads: number;
  totalLiveProductViews: number;
  totalLiveBoothVisits: number;
  totalLiveDwellSeconds: number;
  totalLiveLeadSubmissions: number;
  totalLiveReturningVisitors: number;
  averageDwellSeconds: number;
  aiEngagementRate: number;
  topBooth: { boothId: string; visits: number } | null;
  recentActivity: ActivityEntry[];
  liveMetricsByBooth: Record<
    string,
    {
      visits: number;
      dwell: number;
      chats: number;
      downloads: number;
      productViews: number;
      leads: number;
      scans: number;
    }
  >;
}

@Injectable()
export class DemoAnalyticsStore {
  private boothVisits = new Map<string, Map<string, number>>();
  private boothProductViews = new Map<string, number>();
  private boothBrochureDownloads = new Map<string, number>();
  private boothAiChats = new Map<
    string,
    { sessions: number; messages: number }
  >();
  private boothQrScans = new Map<string, number>();
  private boothLeadSubmissions = new Map<string, number>();
  private boothDwellSeconds = new Map<string, number>();
  private boothSuggestedQuestionClicks = new Map<string, number>();
  private totalBoothVisits = 0;
  private recentActivity: ActivityEntry[] = [];

  reset(): void {
    this.boothVisits.clear();
    this.boothProductViews.clear();
    this.boothBrochureDownloads.clear();
    this.boothAiChats.clear();
    this.boothQrScans.clear();
    this.boothLeadSubmissions.clear();
    this.boothDwellSeconds.clear();
    this.boothSuggestedQuestionClicks.clear();
    this.totalBoothVisits = 0;
    this.recentActivity = [];
  }

  track(event: TrackEvent): void {
    const now = new Date().toISOString();
    switch (event.type) {
      case "booth_visit": {
        let visitors = this.boothVisits.get(event.boothId);
        if (!visitors) {
          visitors = new Map();
          this.boothVisits.set(event.boothId, visitors);
        }
        const visitorId = event.attendeeId ?? `anon-${Date.now()}`;
        visitors.set(visitorId, (visitors.get(visitorId) ?? 0) + 1);
        this.totalBoothVisits++;
        this.recentActivity.unshift({
          at: now,
          type: "visit",
          boothId: event.boothId,
          detail: "Booth visit",
        });
        break;
      }
      case "product_view":
        this.boothProductViews.set(
          event.boothId,
          (this.boothProductViews.get(event.boothId) ?? 0) + 1,
        );
        this.recentActivity.unshift({
          at: now,
          type: "product_view",
          boothId: event.boothId,
          detail: event.productName
            ? `Viewed ${event.productName}`
            : "Product view",
        });
        break;
      case "brochure_download":
        this.boothBrochureDownloads.set(
          event.boothId,
          (this.boothBrochureDownloads.get(event.boothId) ?? 0) + 1,
        );
        this.recentActivity.unshift({
          at: now,
          type: "download",
          boothId: event.boothId,
          detail: "Brochure download",
        });
        break;
      case "ai_chat": {
        const current = this.boothAiChats.get(event.boothId) ?? {
          sessions: 0,
          messages: 0,
        };
        current.sessions++;
        current.messages += event.messageCount;
        this.boothAiChats.set(event.boothId, current);
        this.recentActivity.unshift({
          at: now,
          type: "ai_chat",
          boothId: event.boothId,
          detail: "AI conversation",
        });
        break;
      }
      case "qr_scan":
        this.boothQrScans.set(
          event.boothId,
          (this.boothQrScans.get(event.boothId) ?? 0) + 1,
        );
        this.recentActivity.unshift({
          at: now,
          type: "qr_scan",
          boothId: event.boothId,
          detail: "QR scan",
        });
        break;
      case "lead_submission":
        this.boothLeadSubmissions.set(
          event.boothId,
          (this.boothLeadSubmissions.get(event.boothId) ?? 0) + 1,
        );
        this.recentActivity.unshift({
          at: now,
          type: "lead",
          boothId: event.boothId,
          detail: "Lead submitted",
        });
        break;
      case "dwell":
        this.boothDwellSeconds.set(
          event.boothId,
          (this.boothDwellSeconds.get(event.boothId) ?? 0) + event.seconds,
        );
        break;
      case "suggested_question_click":
        this.boothSuggestedQuestionClicks.set(
          event.boothId,
          (this.boothSuggestedQuestionClicks.get(event.boothId) ?? 0) + 1,
        );
        break;
    }
    if (this.recentActivity.length > 50) this.recentActivity.length = 50;
  }

  getBoothMetrics(boothId: string): LiveBoothMetrics {
    const visits = this.boothVisits.get(boothId)?.size ?? 0;
    const dwell = this.boothDwellSeconds.get(boothId) ?? 0;
    const aiChats = this.boothAiChats.get(boothId)?.sessions ?? 0;
    return {
      liveVisits: visits,
      liveProductViews: this.boothProductViews.get(boothId) ?? 0,
      liveBrochureDownloads: this.boothBrochureDownloads.get(boothId) ?? 0,
      liveAiChats: aiChats,
      liveAiChatMessages: this.boothAiChats.get(boothId)?.messages ?? 0,
      liveQrScans: this.boothQrScans.get(boothId) ?? 0,
      liveReturningVisitors: Array.from(
        this.boothVisits.get(boothId)?.values() ?? [],
      ).filter((c) => c > 1).length,
      liveDwellSeconds: dwell,
      liveSuggestedQuestionClicks:
        this.boothSuggestedQuestionClicks.get(boothId) ?? 0,
      liveLeadSubmissions: this.boothLeadSubmissions.get(boothId) ?? 0,
      averageDwellSeconds: visits > 0 ? Math.round(dwell / visits) : 0,
      aiEngagementRate: visits > 0 ? Math.round((aiChats / visits) * 100) : 0,
    };
  }

  getEventMetrics(): LiveEventMetrics {
    const boothIds = new Set([
      ...this.boothVisits.keys(),
      ...this.boothDwellSeconds.keys(),
      ...this.boothAiChats.keys(),
      ...this.boothQrScans.keys(),
      ...this.boothBrochureDownloads.keys(),
      ...this.boothProductViews.keys(),
    ]);
    const liveMetricsByBooth: Record<
      string,
      {
        visits: number;
        dwell: number;
        chats: number;
        downloads: number;
        productViews: number;
        leads: number;
        scans: number;
      }
    > = {};
    let chats = 0;
    let productViews = 0;
    let downloads = 0;
    let dwell = 0;
    let totalLeads = 0;
    let totalReturning = 0;
    let topBoothId = "";
    let topVisits = 0;
    for (const boothId of boothIds) {
      const bv = this.boothVisits.get(boothId)?.size ?? 0;
      const dw = this.boothDwellSeconds.get(boothId) ?? 0;
      const ch = this.boothAiChats.get(boothId)?.sessions ?? 0;
      const dl = this.boothBrochureDownloads.get(boothId) ?? 0;
      const pv = this.boothProductViews.get(boothId) ?? 0;
      const ld = this.boothLeadSubmissions.get(boothId) ?? 0;
      const scans = this.boothQrScans.get(boothId) ?? 0;
      const rt = Array.from(
        this.boothVisits.get(boothId)?.values() ?? [],
      ).filter((c) => c > 1).length;
      liveMetricsByBooth[boothId] = {
        visits: bv,
        dwell: dw,
        chats: ch,
        downloads: dl,
        productViews: pv,
        leads: ld,
        scans,
      };
      chats += ch;
      productViews += pv;
      downloads += dl;
      dwell += dw;
      totalLeads += ld;
      totalReturning += rt;
      if (bv > topVisits) {
        topVisits = bv;
        topBoothId = boothId;
      }
    }
    const totalVisits =
      this.totalBoothVisits > 0
        ? this.totalBoothVisits
        : Array.from(Object.values(liveMetricsByBooth)).reduce(
            (s, b) => s + b.visits,
            0,
          );
    return {
      totalLiveAiConversations: chats,
      totalLiveBrochureDownloads: downloads,
      totalLiveProductViews: productViews,
      totalLiveBoothVisits: totalVisits,
      totalLiveDwellSeconds: dwell,
      totalLiveLeadSubmissions: totalLeads,
      totalLiveReturningVisitors: totalReturning,
      averageDwellSeconds:
        totalVisits > 0 ? Math.round(dwell / totalVisits) : 0,
      aiEngagementRate:
        totalVisits > 0 ? Math.round((chats / totalVisits) * 100) : 0,
      topBooth: topBoothId ? { boothId: topBoothId, visits: topVisits } : null,
      recentActivity: this.recentActivity.slice(0, 20),
      liveMetricsByBooth,
    };
  }
}

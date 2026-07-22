import Link from 'next/link';

export type OrganizerBriefing = {
  summary: string;
  trafficAnalysis: string;
  conversionAnalysis: string;
  boothHighlights: string;
  returningAnalysis: string;
  industryInsight: string;
  recommendations: Array<{
    priority: 'high' | 'medium' | 'low';
    title: string;
    finding: string;
    metric: string;
  }>;
};

export type OrganizerReport = {
  id: string;
  eventId: string;
  content: string;
  generatedAt: string;
};

export type ExhibitorIntelligence = {
  elapsed: string;
  healthScore: number;
  healthLabel: 'healthy' | 'watch' | 'critical';
  healthFindings: string[];
  topStrength: string;
  topOpportunity: string;
  buyingSignals: string[];
  recommendedActions: string[];
};

export function computeOrganizerBriefing(analytics: {
  traffic: { capturedVisits: number; uniqueVisitors: number; returningVisitors: number };
  conversions: { leads: number; conversionRate: number };
  engagement: { repeatEngagementRate: number; averageInteractions: number; analyzedLeads: number };
  booths: Array<{ name: string; visits: number; leads: number; conversionRate: number; heat: number }>;
  industries: Array<{ name: string; count: number }>;
  topics: Array<{ name: string; count: number }>;
}): OrganizerBriefing {
  const { traffic, conversions, engagement, booths, industries, topics } = analytics;
  const topBooth = booths.reduce((best, b) => b.visits > (best?.visits ?? 0) ? b : best, booths[0]);
  const topIndustry = industries[0];
  const topTopic = topics[0];
  const recommendations: OrganizerBriefing['recommendations'] = [];
  if (topBooth && topBooth.visits > 0) {
    recommendations.push({ priority: topBooth.heat >= 80 ? 'high' : topBooth.heat >= 50 ? 'medium' : 'low', title: 'Top booth performance', finding: '"' + topBooth.name + '" is leading with ' + topBooth.visits + ' visits' + (topBooth.leads > 0 ? ' and ' + topBooth.leads + ' leads' : '') + '.', metric: 'Heat index: ' + topBooth.heat + '%' });
  }
  if (conversions.conversionRate >= 10) {
    recommendations.push({ priority: 'high', title: 'Strong conversion rate', finding: conversions.conversionRate + '% of visitors converted to leads - above industry average.', metric: conversions.leads + ' total leads' });
  } else if (conversions.conversionRate > 0) {
    recommendations.push({ priority: 'medium', title: 'Conversion opportunity', finding: conversions.conversionRate + '% conversion rate. Optimize booth engagement to increase lead capture.', metric: conversions.leads + ' leads from ' + traffic.capturedVisits + ' visits' });
  }
  if (traffic.returningVisitors > 0 && engagement.repeatEngagementRate >= 20) {
    recommendations.push({ priority: 'medium', title: 'High returning-visitor interest', finding: traffic.returningVisitors + ' returning visitors (' + engagement.repeatEngagementRate + '% repeat rate) signal strong booth appeal.', metric: engagement.repeatEngagementRate + '% repeat engagement' });
  }
  if (topIndustry) {
    recommendations.push({ priority: 'medium', title: 'Leading industry vertical', finding: topIndustry.name + ' attendees represent the largest recorded segment.', metric: topIndustry.count + ' attendees' });
  }
  if (topTopic) {
    recommendations.push({ priority: 'low', title: 'Top conversation topic', finding: '"' + topTopic.name + '" is the most discussed topic across AI-analyzed conversations.', metric: topTopic.count + ' mentions' });
  }
  const convertedBooths = booths.filter(b => b.conversionRate > 0).length;
  if (booths.length > 3 && convertedBooths < booths.length * 0.3) {
    const zeroLead = booths.filter(b => b.leads === 0 && b.visits > 0).length;
    recommendations.push({ priority: 'high', title: 'Expanding lead funnel', finding: 'Only ' + convertedBooths + ' of ' + booths.length + ' booths have captured leads.', metric: zeroLead + ' booths with zero leads' });
  }
  const visitorVelocity = traffic.uniqueVisitors > 0 ? Math.round((traffic.capturedVisits / traffic.uniqueVisitors) * 10) / 10 : 0;
  const summary = traffic.capturedVisits > 0 ? traffic.capturedVisits + ' visits across ' + booths.length + ' booths. ' + conversions.leads + ' leads at ' + conversions.conversionRate + '% conversion.' : 'Event is live. No visits recorded yet.';
  const trafficAnalysis = traffic.capturedVisits > 0 ? 'Avg ' + visitorVelocity + ' interactions per unique attendee. ' + traffic.uniqueVisitors + ' distinct visitors.' : 'Awaiting first visitor interactions.';
  const conversionAnalysis = conversions.conversionRate > 0 ? conversions.conversionRate + '% conversion. ' + engagement.analyzedLeads + ' leads scored by AI.' : 'No conversions yet.';
  const boothHighlights = topBooth && topBooth.visits > 0 ? '"' + topBooth.name + '" leads with ' + topBooth.heat + '% heat score' + (topBooth.leads > 0 ? ' (' + topBooth.leads + ' leads)' : '') + '.' : 'No booth data.';
  const returningAnalysis = traffic.returningVisitors > 0 ? traffic.returningVisitors + ' returning visitors (' + engagement.repeatEngagementRate + '% repeat).' : engagement.averageInteractions > 1 ? 'Avg ' + engagement.averageInteractions + ' interactions per visitor.' : 'First-visit only.';
  const industryInsight = topIndustry ? topIndustry.name + ' dominant (' + topIndustry.count + ').' + (topTopic ? ' "' + topTopic.name + '" is top topic.' : '') : topics.length > 0 ? 'Topics: ' + topics.slice(0, 3).map(t => t.name).join(', ') + '.' : 'Industry/topic data pending profile sharing.';
  return {
    summary, trafficAnalysis, conversionAnalysis, boothHighlights, returningAnalysis, industryInsight,
    recommendations: recommendations.sort((a, b) => { const order: Record<string, number> = { high: 0, medium: 1, low: 2 }; return (order[a.priority] ?? 0) - (order[b.priority] ?? 0); }),
  };
}

export function computeOrganizerReport(eventName: string, analytics: {
  traffic: { capturedVisits: number; uniqueVisitors: number; returningVisitors: number };
  conversions: { leads: number; conversionRate: number };
  engagement: { repeatEngagementRate: number; averageInteractions: number; analyzedLeads: number };
  booths: Array<{ name: string; visits: number; leads: number; conversionRate: number; heat: number }>;
  industries: Array<{ name: string; count: number }>;
  topics: Array<{ name: string; count: number }>;
}): OrganizerReport {
  const b = computeOrganizerBriefing(analytics);
  const lines: string[] = [];
  lines.push('# Executive Event Report - ' + eventName);
  lines.push('Generated: ' + new Date().toLocaleString());
  lines.push('');
  lines.push('## Event Summary'); lines.push(b.summary);
  lines.push(''); lines.push('## Traffic Analysis'); lines.push(b.trafficAnalysis);
  lines.push(''); lines.push('## Conversion Performance'); lines.push(b.conversionAnalysis);
  lines.push(''); lines.push('## Booth Highlights'); lines.push(b.boothHighlights);
  lines.push(''); lines.push('## Returning Attendee Signals'); lines.push(b.returningAnalysis);
  lines.push(''); lines.push('## Industry & Topic Trends'); lines.push(b.industryInsight);
  lines.push(''); lines.push('## Priority Recommendations');
  if (b.recommendations.length === 0) { lines.push('No recommendations yet.'); }
  else { for (const r of b.recommendations) { lines.push('- [' + r.priority.toUpperCase() + '] ' + r.title + ': ' + r.finding + ' (' + r.metric + ')'); } }
  lines.push(''); lines.push('---');
  lines.push('[traffic.capturedVisits]: ' + analytics.traffic.capturedVisits);
  lines.push('[conversions.conversionRate]: ' + analytics.conversions.conversionRate + '%');
  lines.push('[engagement.analyzedLeads]: ' + analytics.engagement.analyzedLeads);
  return { id: 'demo-' + Date.now(), eventId: eventName, content: lines.join('\n'), generatedAt: new Date().toISOString() };
}

function computeElapsedTime(then: string | null | undefined): string {
  if (!then) return 'first visit';
  const ms = Date.now() - new Date(then).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return mins + 'm ago';
  const hours = Math.floor(mins / 60);
  if (hours < 24) return hours + 'h ago';
  return Math.floor(hours / 24) + 'd ago';
}

export function computeExhibitorIntelligence(dashboard: {
  performance: { qrScans: number; relationshipsCreated: number; returningVisitors: number; profileCompletion: number; formCompletionRate: number };
  pipeline: { new: number; active: number; returning: number; needsFollowUp: number };
  intelligenceFeed: { profilesEnriched: number; completeProfiles: number; items: Array<{ id: string; at: string; label: string }>; sinceLastVisited: { since: string } };
  attention: Array<{ relationshipId: string; attendeeName: string | null; reasons: string[] }>;
}): ExhibitorIntelligence {
  const { performance: perf, pipeline, intelligenceFeed, attention } = dashboard;
  const total = pipeline.new + pipeline.active + pipeline.returning + pipeline.needsFollowUp;
  const engRate = total > 0 ? Math.round(((pipeline.active + pipeline.returning) / total) * 100) : 0;
  const healthScore = Math.min(100, Math.round(engRate * 0.3 + perf.profileCompletion * 0.25 + perf.formCompletionRate * 0.2 + (perf.returningVisitors > 0 ? 15 : 0) + (perf.qrScans > 0 ? 10 : 0)));
  const healthLabel: ExhibitorIntelligence['healthLabel'] = healthScore >= 70 ? 'healthy' : healthScore >= 40 ? 'watch' : 'critical';
  const findings: string[] = [];
  if (perf.profileCompletion >= 60) findings.push(perf.profileCompletion + '% avg profile completion');
  else if (perf.profileCompletion > 0) findings.push(perf.profileCompletion + '% profile completion - incomplete data limits AI');
  if (pipeline.returning > 0) findings.push(pipeline.returning + ' returning visitors indicate booth appeal');
  if (pipeline.needsFollowUp > 0) findings.push(pipeline.needsFollowUp + ' relationships need follow-up notes');
  if (perf.qrScans > 0) findings.push(perf.qrScans + ' QR scans');
  if (pipeline.active === 0 && total > 0) findings.push('No active conversations - prioritize outreach');
  const topStrength = pipeline.returning > 0 ? pipeline.returning + ' returning visitors' : perf.qrScans > 0 ? perf.qrScans + ' QR scans' : perf.profileCompletion >= 50 ? perf.profileCompletion + '% profile completion' : 'Early-stage booth';
  const topOpportunity = pipeline.needsFollowUp > 0 ? pipeline.needsFollowUp + ' without follow-up notes' : pipeline.active > 0 && perf.profileCompletion < 50 ? 'Incomplete profiles' : intelligenceFeed.profilesEnriched > 0 ? intelligenceFeed.profilesEnriched + ' enriched profiles' : total === 0 ? 'No relationships yet' : pipeline.active + ' active conversations';
  const signals: string[] = [];
  if (pipeline.returning > 0) signals.push(pipeline.returning + ' returning visitors - repeat interest');
  if (perf.returningVisitors > 0) signals.push(perf.returningVisitors + ' from ' + perf.relationshipsCreated + ' total relationships');
  if (pipeline.active > 0 && pipeline.returning > 0) signals.push((pipeline.active + pipeline.returning) + ' warm leads');
  const actions: string[] = [];
  if (pipeline.needsFollowUp > 0) actions.push('Add follow-up notes to ' + pipeline.needsFollowUp + ' relationships');
  if (perf.qrScans === 0) actions.push('Promote booth QR code');
  if (pipeline.new > pipeline.active) actions.push('Move ' + pipeline.new + ' new visitors into active conversations');
  if (perf.profileCompletion < 50) actions.push('Encourage full profile completion');
  if (intelligenceFeed.profilesEnriched > 0 && pipeline.active > 0) actions.push('Review ' + intelligenceFeed.profilesEnriched + ' enriched profiles');
  if (actions.length === 0 && total > 0) actions.push('Continue booth engagement - AI is actively scoring relationships');
  return { elapsed: computeElapsedTime(intelligenceFeed.sinceLastVisited?.since), healthScore, healthLabel, healthFindings: findings, topStrength, topOpportunity, buyingSignals: signals, recommendedActions: actions };
}

type NavItem = { label: string; href: string };
export function DemoMobileNav({ items, currentHref }: { items: NavItem[]; currentHref: string }) {
  return (
    <nav className="flex gap-1 overflow-x-auto pb-1 text-body" aria-label="Demo navigation">
      {items.map((item) => {
        const active = currentHref === item.href;
        return (
          <Link key={item.href} href={item.href} className={'shrink-0 rounded-full px-3 py-1.5 font-medium transition-all ' + (active ? 'bg-brand text-on-brand' : 'text-secondary hover:text-primary hover:bg-sunken')}>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
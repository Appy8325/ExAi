# Dashboard Redesign — ExAi

**Date:** July 22, 2026
**Status:** Proposed

---

## Current Problems

Every dashboard currently suffers from **data overload**. The philosophy seems to be "show everything" rather than "show what matters." This creates dashboards that are:

1. **Busy rather than focused** — Users can't find what matters because everything is prominent
2. **Cognitively exhausting** — Every metric competes for attention equally
3. **Lacking hierarchy** — A new user sees 7+ KPI cards with no guidance on priority
4. **Missing AI integration** — AI insights are shown in a separate panel rather than woven throughout

---

## Dashboard Philosophy

### The 5-Second Rule

A user should be able to understand the state of their business **within 5 seconds** of landing on any dashboard. This means:

1. **One headline metric** that answers "How are we doing?"
2. **One alert** if anything needs immediate attention
3. **One suggested action** to take next

### The Hierarchy of Information

```
┌─────────────────────────────────────────────────────┐
│  HEADLINE METRIC (the one number that matters most) │
├─────────────────────────────────────────────────────┤
│  STATUS INDICATOR (green/yellow/red + context)      │
├─────────────────────────────────────────────────────┤
│  AI SUMMARY (what the AI observes about this data) │
├─────────────────────────────────────────────────────┤
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐  │
│  │ KEY MET │ │ KEY MET │ │ KEY MET │ │ KEY MET │  │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘  │
│         (secondary metrics grid, if needed)         │
├─────────────────────────────────────────────────────┤
│  SUGGESTED ACTIONS (1-3 buttons)                    │
├─────────────────────────────────────────────────────┤
│  RECENT ACTIVITY (scrollable, not paginated)        │
├─────────────────────────────────────────────────────┤
│  DETAILED ANALYTICS (expandable sections)          │
└─────────────────────────────────────────────────────┘
```

### Key Principles

1. **Progressive disclosure** — Show summary first, details on demand
2. **Context over data** — Explain what numbers mean, not just what they are
3. **AI as analyst** — AI observes patterns and surfaces insights, not raw data
4. **Action-oriented** — Every dashboard leads to a clear next action
5. **Calm, not busy** — White space is a design choice, not wasted space

---

## Organizer Dashboard Redesign

### `/org` — Portfolio Overview

**User goal:** Understand how the entire portfolio is performing.

**Current state:** 4 KPI cards + event list, no hierarchy.

**Redesigned hierarchy:**

#### 1. Headline Metric
```
┌─────────────────────────────────────────────────────┐
│  Relationships Generated                            │
│  12,847                                           │
│  ↑ 23% vs last event                               │
│                                                     │
│  This is the ONE metric that matters most.         │
│  Lead with it.                                      │
└─────────────────────────────────────────────────────┘
```

#### 2. Event Health Indicator
```
┌─────────────────────────────────────────────────────┐
│  ● 3 events active, 1 needs attention              │
│    TechExpo 2027: 847 relationships (on track)      │
│    AutoShow 2027: 12 relationships (low traffic)   │
└─────────────────────────────────────────────────────┘
```

#### 3. AI Summary
```
┌─────────────────────────────────────────────────────┐
│  🤖 AI: Booth 42B (医疗器械) showing 3×avg visits  │
│     but only 12% conversion. Consider repositioning │
│     or adding AI-powered lead qualification.        │
│                                    [View分析 →]      │
└─────────────────────────────────────────────────────┘
```

#### 4. Key Metrics Grid (2×2, not 7 cards)
- Total Visitors (across all events)
- Active Exhibitors
- Avg. Conversion Rate
- Pipeline Value (if applicable)

#### 5. Suggested Actions
```
[Schedule AI Report] [Review Low Traffic Events] [View All Events]
```

#### 6. Recent Activity Feed
```
• Acme Corp connected with 5 exhibitors — 2m ago
• TechExpo 2027 hit 500 relationship milestone — 1h ago
• New exhibitor registered: Velocity Health — 3h ago
```

#### 7. Detailed Analytics (Collapsed by Default)
```
[▼ Event Breakdown] [▼ Exhibitor Leaderboard] [▼ Trend Analysis]
```

**Why this works:**
- User sees the headline metric immediately
- Health status tells them if anything is wrong
- AI provides insight, not just data
- Actions are clear and limited to 3
- Detailed data is available but doesn't overwhelm

---

### `/org/events/[eventId]` — Event Overview

**User goal:** Understand this specific event's performance.

**Redesigned hierarchy:**

#### 1. Event Status Banner
```
┌─────────────────────────────────────────────────────┐
│  🟢 Live • TechExpo 2027 • Day 2 of 4               │
│  [View Public Page →] [Pause Event] [Event Settings]│
└─────────────────────────────────────────────────────┘
```

#### 2. Headline Metrics (3 cards, not 7)
- **Relationships Today:** 234 (vs 187 yesterday ↑)
- **Active Exhibitors:** 42/45 booths staffed
- **Traffic Hotspot:** Hall B (peak 2:30pm)

#### 3. AI Summary
```
┌─────────────────────────────────────────────────────┐
│  🤖 Peak hours are 2-4pm. Consider adding staff     │
│     at Hall B during this window. Conversion drops   │
│     40% after 5pm — consider closing early.         │
└─────────────────────────────────────────────────────┘
```

#### 4. Exhibitor Health Overview
```
┌─────────────────────────────────────────────────────┐
│  38/45 booths: healthy    5/45: needs attention     │
│  2/45: critical (0 relationships)                    │
│                                                     │
│  [View All Exhibitors →]                           │
└─────────────────────────────────────────────────────┘
```

#### 5. Quick Actions
```
[View Heatmap] [Send Announcement] [Generate Report]
```

#### 6. Recent Activity
```
• Sarah Chen scanned booth 42A — 5m ago
• New relationship: Johnson Medical + Apex Robotics — 12m ago
• Booth 38 (TechGiant) flagged for low traffic — 1h ago
```

#### 7. Detailed Sections (Collapsed)
```
[▼ Top Performers] [▼ At-Risk Exhibitors] [▼ Traffic by Hour]
```

---

### `/org/analytics` — Cross-Event Analytics

**User goal:** Compare performance across events.

**Redesign:**

#### 1. Event Selector (Prominent, not buried)
```
Event: [All Events ▼]  or select specific event
```

#### 2. Headline Comparison
```
┌─────────────────────────────────────────────────────┐
│  Avg. Relationships per Event: 847                 │
│  Best: TechExpo 2027 (1,247)  Worst: AutoShow (234) │
└─────────────────────────────────────────────────────┘
```

#### 3. Trend Chart (spans full width)
```
    ▲
    │          ╭──────╮
  1.2K│    ╭────╯      ╰────╮
    │────╯                    ╰──►
  800 │
    │
    └──────────────────────────────►
      Week 1   Week 2   Week 3   Week 4
```

#### 4. AI Insights
```
┌─────────────────────────────────────────────────────┐
│  🤖 Events with AI-enabled booths generate 47%     │
│     more relationships. Consider expanding AI to    │
│     underperforming exhibitors.                     │
└─────────────────────────────────────────────────────┘
```

#### 5. Comparison Grid
| Event | Visitors | Relationships | Conv. Rate | AI Score |
|-------|----------|---------------|------------|----------|
| TechExpo | 5,234 | 1,247 | 23.8% | 87 |
| AutoShow | 1,102 | 234 | 21.2% | 62 |

#### 6. Detailed Breakdown (Collapsed)
```
[▼ By Industry] [▼ By Booth Size] [▼ By Geography]
```

---

## Exhibitor Dashboard Redesign

### `/exhibit/[orgId]/dashboard/[eeId]`

**User goal:** Understand booth performance and identify leads to follow up.

**Redesigned hierarchy:**

#### 1. Today's Focus
```
┌─────────────────────────────────────────────────────┐
│  Today: 47 visitors • 12 new relationships • 3 hot  │
│                                                     │
│  [View Hot Leads →]                                │
└─────────────────────────────────────────────────────┘
```

#### 2. Relationship Pipeline (Primary)
```
┌─────────────────────────────────────────────────────┐
│  ┌───────┐ ┌───────┐ ┌───────┐ ┌───────────┐        │
│  │ New   │ │Active │ │Warm   │ │Needs F/U  │        │
│  │  12   │ │  28   │ │  15   │ │    8     │        │
│  └───────┘ └───────┘ └───────┘ └───────────┘        │
│                                                     │
│  Pipeline view: show stage distribution             │
└─────────────────────────────────────────────────────┘
```

#### 3. AI-Leaded Hot List
```
┌─────────────────────────────────────────────────────┐
│  🤖 Hot Leads (AI-scored)                          │
│                                                     │
│  1. Sarah Chen (TechCorp)        Score: 94          │
│     Visited 3 booths, high intent. [Open →]        │
│                                                     │
│  2. Michael Zhang (Velocity)     Score: 89        │
│     Returned visitor, met at your booth. [Open →]  │
│                                                     │
│  [View All Leads →]                                │
└─────────────────────────────────────────────────────┘
```

#### 4. Key Metrics (4 cards)
- QR Scans (today)
- New Connections
- Return Rate
- Profile Completeness (of your leads)

#### 5. Recent Activity
```
• Sarah Chen opened your profile — 5m ago
• New scan: Anonymous visitor (no profile) — 12m ago
• Michael Zhang added you to their network — 1h ago
```

#### 6. Booth Performance
```
┌─────────────────────────────────────────────────────┐
│  AI Booth Score: 78/100                            │
│  Above average for your industry (65)               │
│                                                     │
│  [View Detailed Analytics →]                       │
└─────────────────────────────────────────────────────┘
```

#### 7. Quick Actions
```
[Scan QR] [Add Note] [Send Follow-up]
```

**Why this works:**
- Pipeline is front and center (the exhibitor's primary job)
- AI surfaces hot leads (the exhibitor's primary concern)
- Metrics are secondary, supporting the main story
- Activity feed provides context

---

### `/exhibit/[orgId]/attendees` — Visitor List

**User goal:** Find and follow up with specific visitors.

**Current state:** Table with 5 columns + filter + sort + search. No hierarchy.

**Redesigned:**

#### 1. Quick Filters (Horizontal tabs, prominent)
```
All (47) | New (12) | Active (28) | Warm (15) | Needs Follow-up (8)
```

#### 2. AI Recommendations (Top of list)
```
┌─────────────────────────────────────────────────────┐
│  🤖 Recommended to follow up today:                │
│  • Sarah Chen — last contact 2h ago, high intent   │
│  • Michael Zhang — returned visitor, engaged       │
└─────────────────────────────────────────────────────┘
```

#### 3. Visitor Cards (Not table)
```
┌─────────────────────────────────────────────────────┐
│  ┌────┐ Sarah Chen                          ┌────┐ │
│  │ SC │ VP Engineering @ TechCorp           │ 94 │ │
│  └────┘ Last: 2h ago • 3 booth visits       └────┘ │
│                                                     │
│  [Open Profile]  [Add Note]  [Mark Follow-up]     │
└─────────────────────────────────────────────────────┘
```

#### 4. Search + Sort
```
[🔍 Search visitors...]  Sort: [Recent ↓]
```

**Why this works:**
- Filters are prominent (tab-based, not dropdown)
- AI recommendations surface the most valuable leads first
- Cards show more context than a table row
- Score is visible without clicking

---

## Attendee Dashboard Redesign

### `/e/[eventSlug]` — Event Directory

**User goal:** Find exhibitors relevant to my interests.

**Current state:** Alphabetical list with featured section. Overwhelming.

**Redesigned:**

#### 1. Event Context
```
┌─────────────────────────────────────────────────────┐
│  TechExpo 2027 • Day 2 • 42 exhibitors             │
│  Your Pass: Full Access                             │
└─────────────────────────────────────────────────────┘
```

#### 2. AI Recommendations (if signed in)
```
┌─────────────────────────────────────────────────────┐
│  🤖 Recommended for you (based on your profile):   │
│                                                     │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐              │
│  │  Booth  │  │  Booth  │  │  Booth  │              │
│  │  42A    │  │  15C    │  │  38B    │              │
│  │ Health  │  │  AI     │  │Robotics │              │
│  └─────────┘  └─────────┘  └─────────┘              │
│                                                     │
│  [View All Recommendations →]                      │
└─────────────────────────────────────────────────────┘
```

#### 3. Category Quick Filters
```
All | Health | AI/ML | Robotics | Cloud | Security | ...
```

#### 4. Search
```
[🔍 Search exhibitors or keywords...]
```

#### 5. Exhibitor Grid
```
┌─────────────────────────────────────────────────────┐
│  Featured (your matches)                           │
│  ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐            │
│  │       │ │       │ │       │ │       │            │
│  └───────┘ └───────┘ └───────┘ └───────┘            │
│                                                     │
│  All Exhibitors                                     │
│  ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐            │
│  ...                                                │
└─────────────────────────────────────────────────────┘
```

---

## Component Specifications

### MetricCard (Simplified)

```tsx
interface MetricCardProps {
  label: string;           // e.g., "Relationships Today"
  value: string | number;  // e.g., "234"
  trend?: {
    direction: "up" | "down" | "neutral";
    value: string;        // e.g., "+12%"
    context: string;      // e.g., "vs yesterday"
  };
  emphasis?: "primary" | "secondary"; // primary is larger
}
```

### AISummaryCard (New)

```tsx
interface AISummaryCardProps {
  insight: string;         // The AI observation
  recommendation?: string; // What to do about it
  action?: {
    label: string;        // e.g., "View Analysis"
    href: string;
  };
}
```

### ActionCard (New)

```tsx
interface ActionCardProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  actions: ButtonProps[];  // 1-3 buttons max
}
```

### ActivityFeed (New)

```tsx
interface ActivityFeedProps {
  items: {
    id: string;
    actor: string;
    action: string;
    target?: string;
    timestamp: Date;
    type: "connection" | "scan" | "note" | "system";
  }[];
  maxVisible?: number;  // default 10
  onExpand?: () => void;
}
```

---

## Implementation Notes

### Progressive Disclosure Pattern

```tsx
// Section that can collapse
<CollapsibleSection
  title="Detailed Analytics"
  defaultOpen={false}
>
  {detailedContent}
</CollapsibleSection>
```

### Dashboard Layout Template

```tsx
export default function Dashboard() {
  return (
    <div className="space-y-section">
      {/* 1. Headline metric — full width, large */}
      <MetricCard emphasis="primary" />

      {/* 2. Status/AI summary — full width */}
      <AISummaryCard />
      <StatusIndicator />

      {/* 3. Key metrics — 4-column grid */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard />
        <MetricCard />
        <MetricCard />
        <MetricCard />
      </div>

      {/* 4. Main content — 2-column on desktop */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Primary content (pipeline, leads, etc.) */}
        </div>
        <div>
          {/* Secondary (activity, quick actions) */}
        </div>
      </div>

      {/* 5. Detailed sections — collapsed by default */}
      <CollapsibleSection title="Detailed Breakdown">
        {detailedContent}
      </CollapsibleSection>
    </div>
  );
}
```

### Loading State

While data loads, show skeletons in the exact layout the content will occupy. This prevents layout shift and sets correct expectations.

### Empty State

If no data exists yet, don't show empty dashboard. Show onboarding state:
```
┌─────────────────────────────────────────────────────┐
│  Welcome to ExAi! 👋                               │
│                                                     │
│  To get started:                                   │
│  1. [Add your first event]                         │
│  2. [Invite exhibitors]                            │
│  3. [Set up your booth]                           │
└─────────────────────────────────────────────────────┘
```

---

## Verification Checklist

After implementation, verify:

- [ ] Headline metric is visible within 5 seconds
- [ ] AI provides insight, not just data
- [ ] No more than 4 KPIs visible without scrolling
- [ ] Actions are clear and limited to 3
- [ ] Detailed data is collapsed by default
- [ ] Activity feed doesn't dominate the page
- [ ] Empty states show onboarding, not empty dashboards
- [ ] Loading states match the final layout
- [ ] Mobile experience is complete (no horizontal scroll)
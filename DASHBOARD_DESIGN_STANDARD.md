# Dashboard Design Standard

> Canonical design specification for all ExAi dashboards
> Built from: Exhibitor (8.5/10), Organizer (8.5/10), Event (8.5/10)
> All future dashboards must conform to this standard unless a documented architectural reason exists otherwise.

---

## 1. Dashboard Philosophy

A dashboard is a **decision-support workspace**, not a monitoring screen.

Every dashboard must be able to answer four questions within 5 seconds of opening:

1. **Is my thing on track?** — health indicator, status badge, countdown
2. **What needs my attention?** — attention items section with severity
3. **What should I do next?** — next best actions with urgency context
4. **Are we improving?** — trend signals where data exists; API gap acknowledgment where it doesn't

A dashboard should surface the most important information first and progressively disclose secondary detail. It should reduce cognitive load, not increase it. If a user must scroll to understand whether their thing is healthy, the dashboard has failed.

---

## 2. Standard Page Hierarchy

Every dashboard uses this vertical hierarchy. The sequence matters — it follows the decision-making order.

```
┌─────────────────────────────────────────────────────────────┐
│ 1. IDENTITY HEADER                                          │
│    Entity name · Type identifier · Time/breadcrumb context   │
│    Example: "Acme Corp · Booth A-01 · TechExpo 2026"        │
├─────────────────────────────────────────────────────────────┤
│ 2. STATUS BAR (conditional)                                  │
│    Health dot + health label + status badge + days-until     │
│    Only shown when entity is not "neutral" health            │
├─────────────────────────────────────────────────────────────┤
│ 3. NEXT BEST ACTIONS (when action required)                   │
│    Numbered list (1-3), each a link with description          │
│    Shown only when actions are genuinely required            │
│    Empty when entity is fully healthy — see Empty State §9   │
├─────────────────────────────────────────────────────────────┤
│ 4. PRIMARY KPIs (maximum 4)                                   │
│    KPICards with: label · value · detail · trend (optional) │
│    Decision-driving metrics only                              │
├─────────────────────────────────────────────────────────────┤
│ 5. OPERATIONAL METRICS / SECONDARY SECTION (optional)         │
│    4-stat grid, visually distinct from primary               │
│    Labeled as "Activity" or "Engagement" — not another KPI row │
├─────────────────────────────────────────────────────────────┤
│ 6. QUICK ACTIONS                                             │
│    Primary CTA (filled) + secondary links (outline/ghost)     │
│    Primary CTA varies by entity state/status                 │
├─────────────────────────────────────────────────────────────┤
│ 7. PROGRESSIVE DISCLOSURE (optional)                         │
│    <details>/<summary> for historical logs, demographics      │
│    Never above the fold; always below primary content        │
└─────────────────────────────────────────────────────────────┘
```

**Rules:**
- Never place Operational Metrics above Primary KPIs
- Never skip the Health indicator if the entity has a health state
- Never show Next Best Actions if the entity is fully healthy — use Empty State instead
- Progressive disclosure is for secondary detail only — never for primary content

---

## 3. Health Indicator System

Every entity-facing dashboard shows a health state. The health indicator is the 1-second answer to "is my thing on track?"

### Health States

| State | Dot Color | Label | Used When |
|-------|:---------:|-------|-----------|
| **Good** | 🟢 Green | "On track" | Entity is performing acceptably |
| **Warning** | 🟡 Yellow | "Needs attention" | Entity has a risk or incomplete setup |
| **Danger** | 🔴 Red | "Critical" | Entity has a failure condition requiring immediate action |
| **Neutral** | ⚪ Gray | (hidden) | Entity is past/completed — no action relevant |

### Implementation Pattern

```tsx
function getHealth(entity): "good" | "warning" | "danger" | "neutral" {
  if (entity.isPast) return "neutral";
  if (entity.status === "draft") return "warning";
  if (entity.attendees === 0) return "danger";
  if (entity.exhibitors < TARGET) return "warning";
  return "good";
}

const healthDot = {
  good: "bg-status-success-text",
  warning: "bg-status-warning-text",
  danger: "bg-status-danger-text",
  neutral: "bg-muted",
};

const healthLabel = {
  good: "On track",
  warning: "Needs attention",
  danger: "Critical",
  neutral: undefined, // hidden
};

// In JSX:
<span className="ml-auto flex items-center gap-1.5">
  <span className={`size-2 rounded-full ${healthDot[health]}`} />
  {healthLabel[health] && (
    <span className={`text-caption font-medium ${healthColor[health]}`}>
      {healthLabel[health]}
    </span>
  )}
</span>
```

### Rules

- Health is computed deterministically from entity data — never from external thresholds unless explicitly modeled
- A neutral entity (past/completed) shows no health indicator at all
- Health state changes should be reflected immediately when data updates
- Do not invent health states — good/warning/danger/neutral covers all cases

---

## 4. Next Best Actions

Next Best Actions are the primary decision-support output of every dashboard. They answer "what should I do next?" with urgency context.

### Structure

Each action is a numbered link (1, 2, 3…) with:
- **Label** — the action (verb + noun)
- **Description** — *why* this action matters *now* (countdown, severity, count)
- **Href** — destination link

### Rules

| Rule | Rationale |
|------|-----------|
| Maximum 5 actions | Exceeds working memory — cap at 5 |
| Minimum 0 actions | If all healthy, show Empty State instead |
| Numbered 1–N | Priority order — #1 is the most urgent |
| Description includes urgency signal | Countdown ("starts tomorrow"), count ("3 events need..."), or severity |
| Each action has one destination | Links to the most relevant page, not a general section |
| Actions are status-driven | Different entity states produce different action lists |

### Status-Driven Action Examples

| Entity Status | Example Actions |
|---------------|-----------------|
| Draft | 1. Publish event (countdown) 2. Recruit exhibitors 3. Promote registration |
| Published | 1. View exhibitors 2. Monitor analytics |
| Live | 1. View real-time analytics 2. Check booth activity |
| Past | 1. Generate post-event report 2. Review analytics |

### Empty State (All Healthy)

If there are no attention items and no urgent actions, **do not render the Next Best Actions section**. Instead, render a positive Empty State:

```tsx
{nextBestActions.length === 0 && (
  <div className="flex items-center gap-3 rounded-lg border border-status-success-border bg-status-success-subtle p-4">
    <svg className="size-5 text-status-success-text" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 1a7 7 0 110 14A7 7 0 018 1zm3.72 5.97l-.92.92L6 12.5l-1.8-1.8.92-.92L6 9.84l4.72-4.72z"/>
    </svg>
    <div>
      <p className="text-body-sm font-semibold text-status-success-text">All clear</p>
      <p className="text-caption text-status-success-text">No actions required.</p>
    </div>
  </div>
)}
```

---

## 5. KPI Prioritization

### Maximum 4 Primary KPIs

A dashboard shows **no more than 4 primary KPIs**. This is a cognitive load constraint based on Miller's Law (7±2 items, reduced to 4 for decision quality).

Each primary KPI has:
- **Label** — what is measured
- **Value** — the number or state
- **Detail** — contextual information that answers "so what?"
- **Trend** (optional) — a quality signal: `"Strong coverage"` / `"Needs boost"`

### KPI Detail Text — Answer "So What?"

Raw counts are meaningless without context. Every detail text should answer "so what?" for the value shown:

| Before | After |
|--------|-------|
| "47" | "47 visitors today · 12 returning" |
| "189%" | "189% · 89 scans across 47 visitors" |
| "48" | "48 exhibitors · 12 confirmed" |
| "2,847" | "2,847 attendees · 320 avg per event" |

### KPI Trend — Quality Signal Without Period Data

When true period-over-period data is unavailable (no historical API), derive trend from ratios and entity state:

| Metric | Positive Signal | Negative Signal |
|--------|---------------|----------------|
| Events | "N live now" | "N awaiting publish" |
| Exhibitors | "Strong booth coverage" | "Below recommended average" |
| Attendees | "Strong registration pace" | "Registration may need boost" |
| Relationships | "Connections being captured" | (no negative — relationships are always positive) |

### Operational Metrics Section (Secondary)

Secondary metrics are placed in a visually distinct section labeled **"Activity"**, **"Engagement"**, or **"Health"** — not another "KPIs" section. This section is:
- 4-stat grid (2×2 on mobile, 4×1 on desktop)
- Plain text labels, no card chrome
- Used for depth/complement data, not decision-driving metrics

### Rules

- Never show more than 4 primary KPIs in card format
- Primary KPIs answer "am I winning or losing?"
- Secondary metrics answer "how are users engaging with detail?"
- If there are more than 4 decision-driving metrics, identify the 4 most important and move the rest to secondary
- Never use "Trend" to claim period-over-period comparison unless the data is actually from a comparison

---

## 6. CTA Hierarchy

Every dashboard has exactly **one primary CTA** (visually dominant) and **N secondary actions** (lower visual weight).

### Visual Hierarchy

| Type | Style | When to Use |
|------|-------|-------------|
| **Primary CTA** | Filled (`bg-brand text-on-brand`) | The single most important action for this entity at this state |
| **Secondary** | Outline (`border bg-surface`) | Supporting navigation |
| **Tertiary** | Ghost (`text-link` or `hover:bg-sunken`) | Less important links |
| **System action** | Filled (e.g., Publish button component) | Non-linkable actions requiring server round-trip |

### Primary CTA Selection by Entity Status

| Entity State | Primary CTA |
|--------------|-------------|
| Draft | Publish (system button — non-linkable) |
| Published | View exhibitors or View analytics |
| Live | View analytics or View real-time |
| Past | View report |
| Healthy / Default | Highest-value next action |

### Rules

- Only one primary CTA per dashboard
- All other actions are secondary (same visual weight unless explicitly deprioritized)
- Do not use primary CTA style for secondary navigation
- If the primary action is a link, use filled brand button
- If the primary action is a system operation (e.g., publish), use the appropriate system button component

---

## 7. Empty State Patterns

An empty state is shown when there is no data to display or when everything is healthy and no action is required.

### Positive Empty State (All Healthy)

Used when the entity has no issues. Answers "is everything OK?" immediately.

```tsx
<div className="flex items-center gap-3 rounded-lg border border-status-success-border bg-status-success-subtle p-4">
  <svg className="size-5 text-status-success-text" viewBox="0 0 16 16" fill="currentColor">
    <path d="M8 1a7 7 0 110 14A7 7 0 018 1zm3.72 5.97l-.92.92L6 12.5l-1.8-1.8.92-.92L6 9.84l4.72-4.72z"/>
  </svg>
  <div>
    <p className="text-body-sm font-semibold text-status-success-text">All clear</p>
    <p className="text-caption text-status-success-text">No items require immediate action.</p>
  </div>
</div>
```

### Informational Empty State

Used when a section has no data yet but data is expected to arrive.

```tsx
<p className="text-body-sm text-muted">
  No [data type] yet. [Context about when data will appear].
</p>
```

### Rules

- Never show a blank section when there is no data — always provide context
- Positive empty state is used for Attention Items when healthy
- Do not use warning/danger colors for positive states
- Empty state copy should be specific: "No relationships need attention right now" — not just "No data"

---

## 8. Progressive Disclosure

Secondary content is hidden behind a `<details>`/`<summary>` element. This reduces initial cognitive load while keeping data accessible.

### What Goes Behind Progressive Disclosure

- Historical activity logs
- Demographics breakdowns (industries, topics)
- Debug logs or technical detail
- Non-urgent supplementary data

### What Never Goes Behind Progressive Disclosure

- Primary KPIs
- Health indicators
- Next Best Actions
- Attention items
- Quick Actions

### Pattern

```tsx
<details className="group rounded-xl border border-default bg-surface">
  <summary className="flex cursor-pointer items-center justify-between p-4 text-body font-semibold text-primary">
    <span>Section title</span>
    <svg className="size-4 text-muted transition-transform group-open:rotate-180" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M4 6l4 4 4-4" />
    </svg>
  </summary>
  <div className="border-t border-default px-4 py-4">
    {/* content */}
  </div>
</details>
```

### Rules

- Progressive disclosure is always below the fold — never in the top half of the viewport
- A section header with toggle chevron is sufficient — do not add extra messaging like "Click to expand"
- Only one `<details>` element should be open at a time by default if multiple exist

---

## 9. UX Acceptance Criteria

Every dashboard must meet these criteria before deployment. The minimum passing score is **8.5/10**.

### Scoring Dimensions

| Dimension | Weight | What It Measures |
|-----------|:------:|-----------------|
| Orientation | 20% | Can the user identify where they are and the entity's status within 5 seconds? |
| KPI clarity | 20% | Does each KPI answer "am I winning or losing?" with context? |
| CTA visibility | 15% | Is the primary action immediately obvious? |
| Decision support | 20% | Does the dashboard answer "what should I do next?" |
| Cognitive load | 15% | Can the user parse the page without feeling overwhelmed? |
| Information hierarchy | 10% | Is content in the correct priority order? |

### Minimum Requirements to Score

| Requirement | Minimum Score | Dimension |
|-------------|:------------:|:---------:|
| Health indicator visible | 8/10 | Orientation |
| 4 or fewer primary KPIs | 8/10 | Cognitive load |
| Primary CTA visually dominant | 8/10 | CTA visibility |
| Next Best Actions or positive empty state | 8/10 | Decision support |
| All KPIs have meaningful detail text | 8/10 | KPI clarity |

### Quality Gate

- **Below 8.0 in any dimension**: Dashboard fails — fix the lowest dimension first
- **8.0–8.4 overall**: Conditional pass — document remaining gaps
- **8.5+ overall**: Approved for deployment

### Period-Over-Period Trend Data

If true historical comparison data is not available from the API, trend signals may be derived from entity state ratios. This is an acceptable approach but must be labeled accurately — do not claim "↑18% vs. last week" unless the data genuinely supports a period comparison.

---

## 10. Pattern Reference

### KPICard — Primary KPI

```tsx
<KPICard
  label="Visitors Today"
  value="47"
  detail="12 scans · 5 returning"
  trend={{ value: "Strong traffic", positive: true }}
  accent="brand"
/>
```

### KPICard — Secondary Metric (in Operational section)

```tsx
<div className="space-y-1">
  <p className="text-caption text-secondary">Captured visits</p>
  <p className="text-title font-semibold text-primary">1,234</p>
</div>
```

### Next Best Actions

```tsx
<Link href={action.href} className="group flex items-center justify-between rounded-lg border border-default bg-surface p-4 hover:border-strong hover:bg-sunken">
  <div className="flex items-start gap-3">
    <span className="mt-0.5 flex size-5 items-center justify-center rounded-full bg-primary text-caption font-semibold text-on-brand">
      {i + 1}
    </span>
    <div>
      <p className="text-body-sm font-medium text-primary">{action.label}</p>
      <p className="text-caption text-muted">{action.description}</p>
    </div>
  </div>
  <svg className="size-4 text-muted group-hover:translate-x-0.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 4l4 4-4 4" />
  </svg>
</Link>
```

### Health Dot

```tsx
<span className="ml-auto flex items-center gap-1.5">
  <span className={`size-2 rounded-full ${healthDot[health]}`} />
  <span className={`text-caption font-medium ${healthColor[health]}`}>
    {healthLabel[health]}
  </span>
</span>
```

### Positive Empty State

```tsx
<div className="flex items-center gap-3 rounded-lg border border-status-success-border bg-status-success-subtle p-4">
  <svg className="size-5 text-status-success-text" viewBox="0 0 16 16" fill="currentColor">
    <path d="M8 1a7 7 0 110 14A7 7 0 018 1zm3.72 5.97l-.92.92L6 12.5l-1.8-1.8.92-.92L6 9.84l4.72-4.72z"/>
  </svg>
  <div>
    <p className="text-body-sm font-semibold text-status-success-text">All clear</p>
    <p className="text-caption text-status-success-text">No items require immediate action.</p>
  </div>
</div>
```

### Progressive Disclosure

```tsx
<details className="group rounded-xl border border-default bg-surface">
  <summary className="flex cursor-pointer items-center justify-between p-4 text-body font-semibold text-primary">
    <span>Section title</span>
    <svg className="size-4 text-muted transition-transform group-open:rotate-180" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M4 6l4 4 4-4" />
    </svg>
  </summary>
  <div className="border-t border-default px-4 py-4">
    {/* content */}
  </div>
</details>
```

---

## 11. Page Type Taxonomy

This standard applies to **operational dashboards**. Other page types follow different patterns:

| Page Type | Primary Question | Characteristics |
|-----------|-----------------|-----------------|
| **Operational Dashboard** | "Is my thing on track?" | Health indicator, KPIs, attention items, next actions |
| **Analytical Workspace** | "Why did it happen? Where is drop-off?" | Funnels, trends, segmentation, comparisons |
| **AI Narrative Report** | "What happened and what does it mean?" | AI-generated prose with cited metrics, no KPIs |
| **Real-time Monitoring** | "Is the system healthy?" | Health as header, service status as primary content |
| **Settings / Task** | "Configure this thing" | Out of scope for this standard |

---

## 12. Exceptions

These are the only documented reasons to deviate from this standard:

| Exception | Reason | Requires |
|-----------|--------|----------|
| **Analytics page** (`/org/analytics`) | Analytical workspace — funnel and segmentation are primary content, not KPIs | Explicit documentation; no KPI duplication from Event Dashboard |
| **Reports page** (`/org/events/[eventId]/reports`) | AI-generated narrative — content IS the executive summary, not operational metrics | Explicit documentation; narrative-first, no KPI cards |
| **Real-time monitoring dashboard** (Admin) | Health metrics are the primary content — health indicator may be the header itself | Explicit documentation |
| **Customer-facing public pages** | Different user context — may use simplified hierarchy | Design lead approval |
| **Demo/sandbox pages** | Show all features — cognitive load is intentionally deprioritized | Product manager approval |
| **Settings pages** | Task-oriented, not decision-oriented — standard hierarchy does not apply | None — settings are out of scope |
| **No API support for trend data** | Trend derived from ratios/state is acceptable when no period data exists | Document the limitation |

Any deviation must be documented in the page's review file with rationale.

---

*Standard version 1.1 — established from Exhibitor, Organizer, Event, Admin, Analytics, and Reports reference implementations.*
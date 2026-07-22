# Product Design Vision — ExAi

**Date:** July 22, 2026
**Status:** Vision Document

---

## The Product

ExAi is an **AI-native trade show intelligence platform**. The AI isn't a feature — it's the core of how the product understands relationships and surfaces insights.

### Our Users

**Organizers** run trade shows and need to understand what's happening across hundreds of exhibitors and thousands of attendees in real-time.

**Exhibitors** need to capture leads efficiently and follow up with the right people after the event.

**Attendees** need to discover relevant exhibitors and make meaningful connections.

### The Problem

Trade shows are chaos:
- Exhibitors can't manually track every conversation
- Attendees can't visit every booth that might be relevant
- Organizers can't see what's actually happening until days after the event

### The Solution

ExAi uses AI to:
1. **Capture** relationships automatically (QR scans, profile views)
2. **Understand** who's interested in what (AI-analyzed profiles and behavior)
3. **Connect** the right people and companies (intelligent recommendations)
4. **Summarize** what's happening (AI-generated insights for every role)

---

## Design Principles

### 1. Calm Technology

The best interface is one that disappears. Users should focus on **accomplishing tasks**, not on **understanding the interface**.

Reference: Mark Weiser's calm computing, Linear's minimal UI

**Implications:**
- No flashy animations except where they aid understanding
- White space is a design choice, not wasted space
- Typography and hierarchy do the heavy lifting
- Color is used sparingly and purposefully

### 2. AI as Analyst, Not Database

The AI doesn't just store data — it **observes patterns, identifies anomalies, and suggests actions**.

**AI should appear as:**
- "I noticed this is unusual..."
- "You might want to follow up with..."
- "Your conversion drops on day 3..."

**AI should NOT appear as:**
- Raw metrics dumps
- "AI-detected sentiment: 73%"
- Charts without interpretation

### 3. Role-Based Views

Every user sees a **curated view** optimized for their role's goals, not a generic dashboard with all features.

Organizers see: Portfolio health, event performance, exhibitor wellness
Exhibitors see: Lead pipeline, hot prospects, booth performance
Attendees see: Recommended exhibitors, saved connections, event schedule

### 4. Progressive Disclosure

Don't overwhelm. Show the **essential** information first; let users **drill down** when they want more.

**Default view:** Summary + top 3 items
**Drill-down:** Full lists, filters, comparisons
**Deep analysis:** Custom queries, exports, reports

### 5. Trust Through Transparency

Users should understand **why** the AI makes recommendations. Explain the reasoning.

**Good:** "We recommend Sarah because she visited 3 booths in your category and her profile indicates interest in robotics."

**Bad:** "Recommended: Sarah Chen (Score: 94)"

---

## The Visual Language

### Aesthetic Direction

**Premium Minimal** — Think Linear, Raycast, Arc Browser

Clean, spacious, typography-driven. The design should feel like a high-end SaaS tool that serious professionals use, not a consumer app trying to be flashy.

### Color Philosophy

**Neutral base with single accent**

- Canvas: Near-white (#FAFAFA)
- Surface: White (#FFFFFF)
- Text: Near-black (#111111)
- Borders: Subtle (#EAEAEA)
- Accent: Purple (#8B5CF6) — used sparingly for brand moments and active states

**Why purple?** It's associated with intelligence (AI) and premium quality, without being as cliché as blue.

### Status Colors (Semantic)

| Status | Meaning | Usage |
|--------|---------|-------|
| Green | Healthy, on track | Active, success |
| Yellow | Caution, needs attention | Pending, warning |
| Red | Critical, action required | Failed, danger |
| Blue | Informational | New, info |
| Purple | AI-related | AI insights, recommendations |

### Typography

**Inter** for UI (highly legible, professional)
**JetBrains Mono** for code/metrics

Typography carries hierarchy through scale and weight, not decoration.

### Motion

**Purposeful, not decorative**

| Animation | When to Use |
|-----------|-------------|
| Fade in | Content appearing |
| Slide up | New items entering list |
| Scale | Modals, dropdowns opening |
| Shimmer | Loading skeletons |
| Pulse | Live indicators (subtle) |

**Never:**
- Animate color transitions (except hover states)
- Bounce serious UI elements
- Chain multiple animations
- Use animation to draw attention (use color instead)

---

## Interaction Patterns

### Primary Actions

Every screen has **one primary action**. Everything else supports it.

If you can't identify the primary action, the screen needs redesign.

### Command-First

Power users expect keyboard shortcuts. Implement:
- `Ctrl+K` / `Cmd+K` — Command palette
- `Esc` — Close modal/drawer
- `G then D` — Go to Dashboard
- `?` — Show keyboard shortcuts

### No Unnecessary Confirmation

If an action can be undone, don't ask for confirmation. If it can't, confirm once and make undo available.

**Good:** Click "Delete" → item removed → toast says "Undo"
**Bad:** Click "Delete" → modal "Are you sure?" → confirm → item removed

### Inline Feedback

Show errors and success states inline, not in modals.

**Good:** Error message appears below the input field
**Bad:** Modal says "There was an error"

---

## The Three Experiences

### Organizer: Mission Control

A command center for running successful events. The organizer sees:
- Portfolio health at a glance
- Event-by-event performance
- Exhibitor wellness (who needs help)
- AI-generated recommendations

The feeling: "I have complete visibility and control."

### Exhibitor: Lead Machine

A focused tool for capturing and following up on leads. The exhibitor sees:
- Today's pipeline
- Hot leads (AI-scored)
- Quick actions (scan, note, follow-up)
- Activity feed

The feeling: "I know exactly who to talk to next."

### Attendee: Discovery Engine

A personal guide to the event. The attendee sees:
- AI recommendations
- Saved exhibitors
- Event schedule (if applicable)
- Their connections

The feeling: "I'm finding exactly what I need."

---

## Accessibility Philosophy

### Inclusive by Default

Every UI decision considers users with:
- Visual impairments (color contrast, screen readers)
- Motor impairments (touch targets, keyboard navigation)
- Cognitive differences (clear labels, consistent patterns)

### Performance

The app should feel **instant**. Under 200ms response time for any action.

- Skeleton loading prevents layout shift
- Optimistic UI updates feel immediate
- Lazy loading keeps initial bundle small

---

## Competitive Positioning

### Reference Products

**Linear** — Issue tracking that's actually enjoyable to use. Minimal UI, keyboard-first, calm.

**Vercel** — Developer experience that sets the standard. Clean dashboard, instant deploys.

**Attio** — CRM that's beautifully simple. No legacy complexity.

**Raycast** — Spotlight replacement that power users love. Command palette, keyboard shortcuts.

### What ExAi Is NOT

- Not a bloated enterprise CRM
- Not a generic event management platform
- Not a hackathon demo with pretty screenshots

### ExAi's Differentiation

1. **AI-native** — AI is baked into every view, not a separate "AI Insights" tab
2. **Role-specific** — Three curated experiences, not one-size-fits-all
3. **Trade show focused** — Built specifically for this use case, not generic

---

## Success Metrics

When this vision is realized, users will say:

- "This feels like it was designed by one team"
- "I always know where to go"
- "The AI actually helps me"
- "This is the only trade show tool that doesn't feel like a chore"
- "It just works"

---

## Design Principles Summary

| Principle | What It Means |
|-----------|---------------|
| Calm | No visual noise, minimal decoration |
| Spacious | White space is a choice, not absence |
| Typography-driven | Hierarchy through scale, not ornament |
| Role-specific | Curated views for each persona |
| AI as analyst | Insights, not just data |
| Trust | Transparency in recommendations |
| Progressive | Essential first, detail on demand |
| Accessible | Works for everyone |
| Fast | Under 200ms, everywhere |
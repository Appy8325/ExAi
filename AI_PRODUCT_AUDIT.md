# AI_PRODUCT_AUDIT

**Date:** July 22, 2026
**Auditor:** Principal Engineer
**Perspective:** Staff Engineer + AI Product Designer

---

## 0. EXECUTIVE SUMMARY

ExAi's AI is technically capable but **feels bolted on rather than native**. The AI exists in isolated moments — a briefing here, a report there, a buying intent badge — but it doesn't feel like an intelligent layer woven through the entire experience.

**What works:** Lead enrichment, AI-generated reports, contextual booth briefings.
**What doesn't:** The AI disappears when it should help, appears when it shouldn't, and cannot yet replace the dashboards it's supposed to augment.

**The verdict:** The foundation is strong. The UX integration is weak. The path to AI-native requires rethinking every workflow from "show data, add AI" to "AI-first, data on demand."

---

## 1. AI FEATURE INVENTORY

### 1.1 Where AI Lives Today

| Feature | Location | Type | Quality |
|---------|----------|------|---------|
| **Lead Intelligence** | Exhibitor workspace → lead submission | Buying intent + summary + topics | **GOOD** — actually useful |
| **Organizer Briefing** | `/demo/organizer/ai-insights` | Summary + recommendations | **GOOD** — real insights from data |
| **Executive Report** | `/demo/organizer/reports` | Full markdown report | **GOOD** — comprehensive |
| **Attendee Booth Briefing** | `/e/[slug]/exhibitors/[id]/insights` | What they offer + ways to connect | **OK** — feels like template |
| **Exhibitor Health Score** | `/demo/exhibitor/[id]/ai-insights` | Booth health 0-100 + signals | **OK** — needs more context |
| **AI Chat at Booth** | Public booth chat (`/visit/[qr]`) | Conversational Q&A | **OK** — works but not differentiated |
| **Matchmaking** | Not built | — | N/A |
| **AI Budget Service** | Stub | — | N/A |

### 1.2 AI Feature Quality Assessment

**Lead Intelligence** (highest quality)
- Buying intent: high/evaluating/browsing/not_relevant
- Summary: 1-2 sentence company overview
- Topics discussed: extracted from form submission
- Follow-up recommendation: action-oriented
- Suggested email: templated but personalized

This is the most valuable AI feature. It's contextual, actionable, and directly tied to the sales workflow.

**Organizer Briefings** (good quality)
- Traffic analysis, conversion analysis, booth highlights
- Priority-ranked recommendations (high/medium/low)
- Computed from live analytics data

Good because it summarizes real data. Weak because it only fires when analytics exist.

**Executive Reports** (good quality)
- Full markdown document with sections
- Generated on demand
- Includes all metrics

Good because it's comprehensive. Weak because generation takes time and there's no progress indicator.

---

## 2. WHERE AI FEELS NATIVE

### 2.1 Lead Enrichment (Best Example)

**Workflow:** Attendee submits lead form → AI processes → Sales rep sees enriched lead in seconds

**What makes it feel native:**
- It's invisible — happens automatically after form submission
- Output is contextual — company size, industry, buying intent
- Delivery is integrated — appears in the relationship workspace without being asked

**This is the right model.** The AI should work in the background, enhancing data, then surface when relevant.

### 2.2 Organizer Real-Time Recommendations

The `computeOrganizerBriefing()` function analyzes traffic and suggests:
- "Expanding lead funnel: Only 2 of 8 booths have captured leads"
- "Top booth performance: 'NVIDIA' is leading with 156 visits"
- "Strong conversion rate: 12% of visitors converted to leads"

**This is contextual intelligence.** It appears when there's something actionable to say. This is the right pattern.

---

## 3. WHERE AI FEELS DISCONNECTED

### 3.1 AI Insights Pages Are Isolated

**Problem:** There's an `/ai-insights` page for exhibitors and one for organizers, but AI doesn't appear in the main workflow.

**Example:** A sales rep opens their exhibitor dashboard. They see a list of leads. They don't see AI insights until they click `/ai-insights`. The AI should surface in the lead list itself.

**Compare to:** Crystal Knows shows personality/communication tips directly on the LinkedIn profile. Attio shows buying signals on the lead card. ExAi hides AI behind a separate page.

### 3.2 AI Reports Are Ask-Once

**Problem:** You request a report, wait for generation, get a static document. If the data changes 10 minutes later, the report is stale.

**Compare to:** Linear's progress tracking is always current. Notion's AI summaries refresh. ExAi's reports are snapshots.

**What should happen:** Reports should be regeneratable, with a "last updated" timestamp, and a "data has changed" indicator if metrics have shifted.

### 3.3 AI Doesn't Proactively Alert

**Problem:** The AI generates insights after events or on-demand. It never proactively says "you should know this right now."

**Examples that should exist:**
- "Lead quality is declining — 3 of your last 5 submissions are 'not relevant'"
- "A high-intent lead visited your booth 20 minutes ago and hasn't been contacted"
- "Your competitor just had 5 new visits — consider adjusting your booth presentation"

**This is the biggest opportunity.** AI in ExAi should be a proactive intelligence layer, not a passive reporting tool.

---

## 4. WHERE AI IS UNNECESSARY

### 4.1 AI Chat at Public Booths

**Current state:** `POST /v1/public/booths/:token/chat` — AI answers questions about the exhibitor

**The problem:** The exhibitor's knowledge base is incomplete. If a visitor asks "What's your pricing for enterprise?" and the KB doesn't have that info, the AI will either hallucinate or say "I don't know."

**Is this valuable?** Maybe, but only if the knowledge base is comprehensive and the AI is explicitly told what it doesn't know.

**What would be better:** A simple FAQ section with structured answers, no AI needed. AI chat only adds value when the KB is rich and visitors ask complex questions.

**Recommendation:** Keep it but make the knowledge base a prerequisite. Don't show the AI chat button until KB has 10+ documents.

### 4.2 "AI-powered" as a Label

**The word "AI" appears in:**
- `AI insights` page titles
- `AI-generated report` descriptions
- `AI Briefing` section headers

**Problem:** Labeling AI features as "AI-powered" feels dated. Users don't want AI — they want outcomes.

**Compare to:** Notion AI doesn't say "AI Write" everywhere. It says "Continue writing," "Summarize," "Fix spelling." The action is the value, not the technology.

**Recommendation:** Rename:
- `AI Insights` → `Booth Intelligence` or just remove the "AI" prefix
- `AI Briefing` → `Event Summary`
- `AI-generated` → `Generated insights` (or just remove the label)

### 4.3 Buying Intent on Every Lead

**Current state:** Every lead gets a buying intent score (high/evaluating/browsing/not_relevant)

**Problem:** Not every lead form captures enough signal to justify a buying intent score. If the form only has name + email, the AI is guessing.

**What should happen:** Show the intent score only when there's sufficient data. If form fields are minimal, show "Insufficient data for scoring" instead of a potentially wrong score.

---

## 5. WHERE AI SHOULD HELP BUT DOESN'T

### 5.1 Lead Prioritization

**Currently:** Sales reps see a list of leads, sorted by time.

**What AI should do:** Rank leads by a combination of:
- Buying intent score
- Visit frequency
- Profile completeness
- Interaction depth (did they visit competitor booths?)

**This is the highest-value AI feature that doesn't exist yet.** A sales rep should open their app and see "Follow up with these 5 leads today" ranked by conversion probability.

### 5.2 Anomaly Detection

**What should exist:**
- "Unusual traffic spike at booth #12 — 3x normal volume"
- "Lead quality dropped 40% compared to yesterday"
- "This attendee has visited 8 booths today — high interest"

**This makes AI feel alive and monitoring, not just reporting.**

### 5.3 Personalized Attendee Recommendations

**Currently:** Attendees browse a list of exhibitors by industry filter.

**What AI should do:** "Based on your profile (company, interests, goals), you should visit these 5 booths."

**This is the matchmaking feature, but it should come first — not as a separate feature, but as the default attendee experience.

### 5.4 Cross-Event Intelligence

**What should exist:** "This lead visited your booth at TechExpo Chicago 2026 and downloaded your brochure. They've now visited your booth at TechExpo NYC. High interest."

**This is the cross-event memory that makes ExAi sticky. The AI should surface this automatically when a lead is captured.**

### 5.5 Pre-Meeting Briefings

**Before a sales rep meets a lead (or right after scanning their badge):**
- "Company: NVIDIA. Recent: Announced new GPU architecture. Talking points: AI infrastructure, data center expansion."
- "This person has visited 4 booths today. Most visited: AI infrastructure companies."

**This is the "AI-native" moment that would make ExAi indispensable.**

---

## 6. SHOULD AN AI AGENT REPLACE DASHBOARDS?

### 6.1 The Argument For

Dashboards show historical data. An AI agent could answer questions about that data:
- "How many leads did we capture today compared to yesterday?"
- "What's our conversion rate by booth?"
- "Show me leads with high buying intent"

**This is already partially implemented** via the executive report and briefings. The natural next step is a conversational interface.

### 6.2 The Argument Against

**Dashboards are faster for known questions.** A sales rep who wants to see their lead pipeline doesn't want to ask an AI — they want to see a kanban board.

**AI is better for unknown unknowns.** "Are there any anomalies I should know about?" is a question an AI agent can answer that a dashboard can't.

**Recommendation:** Keep dashboards + add a conversational AI layer. Not replacing — augmenting.

### 6.3 The Hybrid Model

```
┌─────────────────────────────────────────────────────┐
│  Natural language: "Give me a daily briefing"       │
│  ↓                                                  │
│  AI generates verbal report (not a dashboard page)  │
│  ↓                                                  │
│  "You captured 47 leads today, 3x yesterday.     │
│   Top booth: NVIDIA with 156 visits.               │
│   Anomaly: Red has 0 leads despite 89 visits."     │
└─────────────────────────────────────────────────────┘
```

This is already partially implemented in the Organizer Briefing. Make it the default, make dashboards secondary.

---

## 7. AI TRUST & TRANSPARENCY

### 7.1 When AI Makes Mistakes

**Current state:** If AI fails, the error is caught in the `try/catch` and a deterministic fallback score is used. The user doesn't know the AI failed.

**What should happen:** Show a subtle indicator: "AI enrichment unavailable — showing basic profile." Don't silently substitute.

### 7.2 Confidence Indicators

**Current state:** Buying intent has levels (high/evaluating/browsing/not_relevant) but no confidence score.

**What should happen:** "High intent (87% confidence)" or "Medium intent — limited profile data (42% confidence)." This manages expectations and helps sales reps know when to trust the score.

### 7.3 Source Attribution

**Current state:** The AI generates summaries and talking points. It's unclear where the information comes from.

**What should happen:** When showing company info, cite the source: "Based on: LinkedIn, company website, TechCrunch article from March 2026." This builds trust and helps sales reps verify.

---

## 8. AI EVOLUTION — NEXT 12 MONTHS

### Phase 1 (0-3 months): Make AI Actionable

**Goal:** AI should surface at the right moment, not hidden in pages.

| Feature | Why |
|---------|-----|
| Lead score on lead list | Reps see priority without clicking |
| "Top 5 leads today" card | Daily briefing without asking |
| Anomaly alerts | Proactive intelligence |

### Phase 2 (3-6 months): Conversational AI

**Goal:** Natural language queries replace some dashboard interactions.

| Feature | Why |
|---------|-----|
| "Summarize today's leads" | Replaces manual report checking |
| "What's different about today?" | Anomaly detection via chat |
| "Draft email to top 5 leads" | Next-action automation |

### Phase 3 (6-12 months): Predictive Intelligence

**Goal:** AI predicts outcomes, not just describes them.

| Feature | Why |
|---------|-----|
| "This lead will convert (78% probability)" | Prioritization signal |
| "You're on track to hit QCE target" | Confidence without dashboards |
| "Competitor X just got 10 visits" | Market intelligence |

### Phase 4 (12+ months): Autonomous Actions

**Goal:** AI takes actions on behalf of users with explicit permission.

| Feature | Why |
|---------|-----|
| Auto-email follow-up 2h after badge scan | No lead goes cold |
| Auto-create CRM task for high-intent leads | Workflow automation |
| Auto-notify rep when lead returns | Real-time alerting |

---

## 9. THE ONE THING

If I could add one AI feature that would demonstrate AI-native thinking:

**Pre-meeting briefing cards on the lead list.**

Every lead card shows a 3-line AI-generated summary:
```
NVIDIA · Senior Director of AI Infrastructure
High intent · Visited 3x · Last visit 2h ago
Talking points: GPU scarcity, data center expansion,
  competitor comparison
```

This is the "from first scan to first call in 30 seconds" moment. It turns a list of names into a conversation starter.

This alone would justify the product to a sales leader.

---

## SCORECARD

| Dimension | Score | Notes |
|-----------|-------|-------|
| Lead enrichment | 8/10 | Best AI feature — contextual + actionable |
| Reporting | 7/10 | Good but stale after generation |
| Proactive intelligence | 3/10 | No alerting, no anomalies surfaced |
| Conversational interface | 2/10 | No chat interface — just form submits |
| Trust/transparency | 4/10 | Silent failures, no confidence indicators |
| Integration depth | 5/10 | AI feels like an add-on, not core |
| Recommendation quality | 6/10 | Good when data exists, guessing when it doesn't |
| Native feel | 4/10 | Feels bolted on, not woven through |
| Evolution roadmap | 7/10 | Clear phases, right priorities |

**Overall: 5/10** — Technical foundation is strong, UX integration is weak. The AI works but doesn't feel essential.

---

## TOP 5 RECOMMENDATIONS

1. **Add AI summaries directly to the lead list** — 3 lines per lead, generated from enrichment data. This is the highest-impact, lowest-effort change.

2. **Add "Top 5 leads to follow up today" card** — On the exhibitor dashboard, as the first thing they see each morning. Make it a daily briefing.

3. **Rename "AI Insights" pages** — Remove "AI" from the label. Call it "Intelligence" or "Briefing" — the action matters, not the technology.

4. **Add confidence indicators to buying intent** — "High intent (87% confidence)" vs "High intent (42% confidence)" changes how a sales rep uses the signal.

5. **Add anomaly alerts** — Surface one proactive insight per day per exhibitor. "Anomaly: Booth visits up 3x today." Make the AI feel alive.
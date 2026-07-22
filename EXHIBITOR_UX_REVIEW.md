# Exhibitor Dashboard — UX Review

> Post-implementation evaluation · EPIC 3
> Reviewer: UX analysis · Date: 2026-07-22

---

## 1. Can a first-time exhibitor understand the page in under five seconds?

**Partially.**

The "Booth Dashboard" header answers "where am I" but not *which booth*. There is no company name, booth number, or event context visible in the header. A first-time exhibitor lands on "Booth Dashboard" with no confirmation this is their booth.

The eyebrow text "Exhibitor workspace" is redundant — the user is already inside the Exhibitor section. It occupies visual space without adding information.

The four KPI cards communicate clearly once parsed, but there are comprehension issues:
- "Scan Rate: 189%" — a percentage over 100% is immediately confusing. First-time users will interpret this as an error or misread it. The detail text ("89 total scans") doesn't resolve the confusion.
- "Pipeline Health" — ambiguous phrasing. Does "health" mean volume? Quality? Both?

**Verdict:** Understandable with caveats. The page needs a booth/company identifier and the Scan Rate needs a contextual explanation.

---

## 2. Are the four KPIs the correct four?

**No. Two are right, one is redundant, one is ambiguous.**

| KPI | Correct? | Issue |
|-----|:--------:|-------|
| Visitors Today | ✅ | Clear primary metric |
| Scan Rate | ⚠️ | Ambiguous at >100%; useful when understood but needs an interpretation guide |
| Relationships | ✅ | Clear conversion metric |
| Pipeline Health | ❌ | Redundant with the 4 pipeline stage cards below it. The 4 cards below show the same data with more breakdown. |

**The deeper issue:** The 4 pipeline stage cards (New, Active, Returning, Follow-up) that appear below the KPI row are actually more useful than the "Pipeline Health" KPI card. Having both creates redundancy and the user has to parse two representations of the same data.

**Suggested refinement:** Replace "Pipeline Health" KPI with something that is *not* represented elsewhere on the page, such as:
- **Avg. Time to First Follow-up** (if available)
- **Profile Enrichment Rate** (perf.profileCompletion or a computed rate)
- **Today's Rate of New Relationships** (daily new relationships / total visitors today)

Or, remove the 4 pipeline stage cards below and instead make "Pipeline Health" a dashboard-level summary that drives the user to the pipeline detail view.

---

## 3. Is the primary CTA obvious?

**No. There is no primary CTA.**

The QuickActions row contains four items:
- View Visitors — navigation
- Share QR Code — possibly an action, but styled identically to navigation links
- Manage Products — navigation
- Event Settings — navigation

All four look the same. None stands out as *the* primary action. In a dashboard, the primary CTA should be the one action that most drives value — for an exhibitor, that is likely "Share QR Code" (to increase visitor flow) or "View Visitors" (to act on current visitors).

Currently, all four are styled identically as secondary gray-bordered buttons. None is a prominent primary action.

**Suggested refinement:** Elevate "Share QR Code" as a primary button (filled, brand color) and demote the others to a secondary row below.

---

## 4. Does every section help the user make a decision?

**Mostly, with one exception.**

| Section | Decision Supported? | Notes |
|---------|:------------------:|-------|
| KPI row | ✅ | Traffic, engagement rate, conversion, pipeline state |
| QuickActions | ❌ | Pure navigation — no decision content |
| Relationship Pipeline | ✅ | "Where are my relationships?" with stage breakdown |
| Requires Attention | ✅ | "Who needs follow-up?" — highest-value action section |
| AI Intelligence | ⚠️ | Informational but not clearly actionable |
| Recent Activity | ⚠️ | Historical log — low decision value, correctly collapsed |
| Profile Completion | ✅ (partial) | Present but only when < 100% — signals setup incomplete |

**The AI Intelligence section** does not clearly answer "what should I do?" It shows enrichment data and a feed of items, but does not synthesize this into a recommendation. For example, it could say "3 high-quality leads from today's visitors — view them" but instead shows a raw feed.

---

## 5. Is anything still visually competing for attention?

**Yes. Three conflicts:**

1. **"Pipeline Health" KPI card** vs. **4 pipeline stage cards below** — both show pipeline data. The cards below are more granular. Having both means two visual elements competing to answer "what is my pipeline state?" The KPI card should be removed or made distinct (e.g., a trend sparkline instead of a count).

2. **Profile Completion in header** — "Profile 50%" in muted gray text competes with the "Live" badge. It is small and easily missed, yet it signals something important (setup incomplete). It needs either more prominence or removal from the header entirely and placement into an onboarding checklist instead.

3. **"View all AI insights" link** — this secondary link at the bottom of the AI section pulls attention away from the content itself.

---

## 6. Does the AI section feel indispensable or optional?

**It feels optional.**

The section is titled "AI Intelligence" but its most useful content — "Since Your Last Visit" — only appears when `sinceLastVisited.since !== null`, meaning **first-time exhibitors see no AI summary at all**. For someone visiting for the first time, the entire 1/3 column is either empty or shows a sparse feed. This makes the AI section feel like a secondary enrichment rather than core information.

The Intelligence Feed also does not synthesize findings into recommendations. It presents labels like "enriched profile" without explaining the significance or the recommended action.

**Suggested refinement:**
- For first-time visitors, show a "Getting started with AI" prompt explaining what will appear as data accumulates
- Make the AI section's value proposition explicit: "AI identifies your best leads — here's what's new"
- Consider surfacing the top recommendation from the AI insights as a prominent call-to-action instead of a feed

---

## 7. Is there any remaining information that belongs behind progressive disclosure?

**No. Recent Activity is correctly collapsed.**

All other content is either:
- At-the-moment decision data (KPI row, Pipeline, Attention) — correctly visible
- Secondary enrichment (AI Intelligence) — borderline, but acceptable at 1/3 width
- Historical log (Recent Activity) — correctly in `<details>` collapsible

One candidate for progressive disclosure: the **4 pipeline stage cards**. These are a detail view of the "Pipeline Health" KPI. If the KPI card is removed or replaced with a sparkline, the stage cards could become the primary pipeline view — in which case they should stay visible. If "Pipeline Health" stays, the stage cards could move to a "View pipeline details" expandable section to reduce visual load.

---

## Remaining Friction Points

| # | Issue | Severity | Type |
|:-:|-------|:--------:|------|
| 1 | No booth/company name in header — user cannot confirm which booth they are viewing | High | Orientation |
| 2 | Scan Rate 189% is confusing without explanation of multi-scanning | High | Comprehension |
| 3 | "Pipeline Health" KPI duplicates the 4 stage cards below | High | Redundancy |
| 4 | No primary CTA — all QuickActions styled identically as secondary | High | Action |
| 5 | AI Intelligence section empty for first-time visitors | Medium | Content gap |
| 6 | Profile Completion in header is too subtle | Medium | Visibility |
| 7 | "View all AI insights" link competes with section content | Low | Layout |
| 8 | "Exhibitor workspace" eyebrow is redundant | Low | Noise |

---

## Suggested Refinements (Priority Order)

### P0 — Must Fix

1. **Add booth/company identifier to header.** Change "Booth Dashboard" to "{Company Name} — Booth {N}". If company name is not available from the dashboard data, show at minimum the booth number or event name.

2. **Replace "Pipeline Health" KPI.** Remove it or replace with a metric not duplicated elsewhere on the page. Recommended: **Avg. Follow-up Time** or **Enrichment Rate** (if data available). This eliminates the most significant visual redundancy.

3. **Elevate "Share QR Code" as primary CTA.** Make it a filled brand-colored button. Demote others to ghost/outline style.

### P1 — Should Fix

4. **Add Scan Rate interpretation hint.** Change detail text from "89 total scans" to "189 scans per 100 visitors" or add a tooltip explaining that >100% means multiple scans per visitor.

5. **Show AI value proposition for first-time visitors.** When `sinceLastVisited.since === null`, display a brief "How AI Insights work" placeholder instead of an empty-looking section.

6. **Move Profile Completion to a Setup Checklist** in the header area — or remove it from the dashboard entirely and surface it as a setup prompt in a dedicated onboarding flow.

### P2 — Nice to Have

7. **Synthesize AI recommendations.** Instead of a raw feed, show "3 high-priority leads identified today" with a direct link to act on them. This would make the AI section feel indispensable.

8. **Remove "Exhibitor workspace" eyebrow.** It is redundant with the navigation context.

---

## Estimated Usability Score

| Dimension | Score | Notes |
|-----------|:-----:|-------|
| Orientation (where am I?) | 6/10 | Title is generic; no company/booth identifier |
| KPI clarity | 7/10 | 2 of 4 are excellent; 1 is confusing; 1 is redundant |
| CTA visibility | 4/10 | No primary CTA — all actions look the same |
| Decision support | 7/10 | Pipeline + Attention sections are excellent |
| Cognitive load | 7/10 | Reduced from 7→4 KPIs; minor redundancy remains |
| AI section value | 5/10 | Useful for returning users; empty for first-timers |
| **Overall** | **6/10** | Improved from 4/10; 4 points still to gain |

**Previous score:** 4/10
**Current score:** 6/10
**Target:** 8.5/10
**Remaining gap:** ~2.5 points

---

## Decision Confidence Score

**7/10**

We have high confidence in:
- Reducing from 7 to 4 KPIs — correct direction
- Promoting AI Intelligence to primary grid — correct direction
- Merging Requires Attention inline with Pipeline — correct direction
- Progressive disclosure for Recent Activity — correct direction

We have moderate confidence in:
- Whether "Pipeline Health" is the right 4th KPI (vs. a different metric)
- Whether Scan Rate's percentage format is right for first-time users
- Whether the AI section should be promoted further or given more synthesis

We need **user research** to confirm:
- Whether first-time exhibitors understand "Scan Rate: 189%"
- Whether "Share QR Code" is indeed the most important CTA
- What metrics first-time exhibitors say they care about most

---

## Conclusion

The redesigned Exhibitor Dashboard is meaningfully improved from 4/10 to 6/10. The most important wins — reduced KPI overload, promoted AI, inline attention items — are real. The remaining gap to 8.5/10 is bridgeable with three P0 fixes: add a booth identifier, eliminate the pipeline redundancy, and elevate the primary CTA. The AI section needs either more synthesis or a better first-time-visitor experience.

**The design is on the right track. The three P0 fixes are low-effort, high-impact.**

---

*UX review complete. Awaiting approval to implement P0 refinements.*
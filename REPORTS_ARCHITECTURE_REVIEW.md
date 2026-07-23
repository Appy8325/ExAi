# Reports — Architecture Review

**Date:** 2026-07-22
**Author:** EPIC 3 Implementation
**Status:** Draft — awaiting UX Review

---

## 1. What Reports Is Supposed to Be

Reports is not a dashboard. It is an **AI-generated narrative** that synthesizes event data into an executive summary with cited metrics.

The user's definition of Analytics ("what happened, why, where to investigate") actually describes what a good Report should do — but in narrative form rather than as a dashboard.

**Key distinction:**
- **Event Dashboard:** "Is my event on track?" → status + health + next actions
- **Analytics:** "Where is drop-off? Who attended?" → funnel + segmentation
- **Reports:** "What happened and what does it mean?" → AI-written executive narrative with cited data

---

## 2. Current Implementation Assessment

### Production `/org/events/[eventId]/reports`

The production Reports page is clean and purpose-built:

| Element | Status | Notes |
|---------|--------|-------|
| Page title + description | ✅ | "Executive reporting" + AI summary description |
| Generate button | ✅ | Form action → server action → AI generation |
| Empty state | ✅ | "Generate a report to receive an AI-written executive summary..." |
| Failure state | ✅ | "The previous AI generation failed. Try generating again." |
| Complete state | ✅ | Shows report content (AI-generated text) |
| Generated timestamp + model | ✅ | "Generated {date} using {model}." |
| Download PDF link | ✅ | Only when report status === "complete" |
| Live Analytics link | ✅ | "View detailed metrics in Live Analytics" |
| Event context | ⚠️ | Page title shows event name, but description is generic |

**Backend is fully implemented:** `OrganizerReportingService.generate()` uses:
- `AiGenerationService` with `promptId: "organizer.executive_report.v1"`
- `AiGuardrailService` to validate output
- Metric citations in the output (e.g., `[traffic.capturedVisits]`)
- PDF generation via `textPdf()`

### Demo `/demo/organizer/reports`

**Problem: Demo still has 4 MetricCard KPI duplication** — same issue that Analytics had.

```tsx
<section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
  <MetricCard label="Captured visits" value={...} />  // ← DUPLICATE
  <MetricCard label="Unique attendees" value={...} /> // ← DUPLICATE
  <MetricCard label="Leads" value={...} />            // ← DUPLICATE
  <MetricCard label="Conversion" value={...} />       // ← DUPLICATE
</section>
```

These appear in Analytics, Event Dashboard, and now Reports demo. This is the same KPI duplication anti-pattern.

The demo's compute-generated report (using `computeOrganizerReport`) is actually interesting — it produces a structured briefing with recommendations ranked by priority. This is closer to what the production AI report should feel like.

---

## 3. What Reports Gets Right

1. **Single purpose.** One button: generate. One output: report text. No dashboard clutter.

2. **Proper status lifecycle.** Handles: empty (not generated) → generating → failed → complete — with appropriate messaging at each stage.

3. **AI quality is backend-controlled.** The `OrganizerReportingService` uses:
   - Guardrails to validate output
   - Metric citations to prevent fabricated numbers
   - Idempotency key to prevent duplicate generation

4. **No KPI duplication in production.** The production Reports page doesn't show any KPI cards — it's purely the AI-generated narrative.

5. **"View in Live Analytics" link.** Correctly directs users to Analytics for raw data.

---

## 4. What's Missing or Could Be Improved

### Critical: Demo KPI duplication

The demo at `/demo/organizer/reports` has 4 MetricCards that duplicate Analytics and Event Dashboard. This should be removed. The demo should show only the AI report (via `computeOrganizerReport`) without KPI cards.

### Important: Missing status indicator during generation

When the user clicks "Generate AI report", the button becomes a loading state but the user sees no explicit feedback. The report content area remains showing whatever was there before (or an empty state).

**Better approach:**
- Show an explicit "Generating report..." state with context
- Show the report's `status === 'processing'` state (if exposed by the API)
- If not exposed: add a loading skeleton or "Generation in progress — this may take a minute" message

### Important: Event context line

The page title shows `{event.name}` which is good. But the description ("AI-generated executive summary with event outcomes, trends, and recommended actions") is generic and doesn't say which event.

Add: "Showing report for {event.name}" as a context line (similar to Analytics's "Showing funnel data for {event.name}").

### Nice to have: Report metadata

The production report includes:
- `generatedAt` (timestamp)
- `model` (AI model used)
- `metricsSnapshot` (the raw analytics data used)

The page shows `generatedAt` and `model`, but doesn't expose `metricsSnapshot`. This could be shown in a collapsible "Report data" section for users who want to see the underlying numbers.

### Nice to have: Report history

Currently the page only shows the most recent report. For past events, there might be multiple reports. A report history section (collapsible) would let users compare reports across regenerations.

---

## 5. Scoring — Why the Dashboard Design Standard Doesn't Apply

Reports is not a dashboard. Scoring it on "KPI clarity" or "health indicator" is meaningless — it doesn't have those things.

**Alternative scoring framework for AI Report pages:**

| Dimension | Score | Evidence |
|-----------|:-----:|----------|
| Purpose clarity | 9/10 | "Executive reporting" label + description + single generate CTA |
| Generate flow | 8/10 | Form → server action → revalidation; status handled |
| Status communication | 7/10 | Empty/error/complete states handled; generating state implicit |
| Output quality | backend | AI quality is backend-controlled, not a frontend concern |
| CTAs visible | 8/10 | Generate button prominent; PDF download when available |
| Event context | 6/10 | Title has event name; description doesn't |
| Error handling | 8/10 | Failed state shown with retry message |
| **Overall** | **~7.5/10** | |

---

## 6. The DASHBOARD_DESIGN_STANDARD Exception

Reports should be documented in `DASHBOARD_DESIGN_STANDARD.md` as a **document-style page** — distinct from dashboards and analytics.

Document-style pages have:
- A single generative purpose (not a monitoring workspace)
- No KPIs (content is AI-generated narrative)
- No health indicators
- No "next best actions" — the AI-generated content IS the action guidance
- Status communication for generation state

---

## 7. Open Questions

1. **Does the production page need changes beyond the demo fix?** The production implementation is quite clean. The main improvements are cosmetic (event context line, generating state).

2. **Should the demo show a generating state?** The demo uses `computeOrganizerReport` which is synchronous. It doesn't model the async generation flow.

3. **Should report metadata (metricsSnapshot) be exposed in the UI?** Could be a collapsible "Underlying data" section for transparency.

---

## 8. Files Reviewed

| File | Purpose |
|------|---------|
| `apps/web/src/app/(console)/org/events/[eventId]/reports/page.tsx` | Production reports page |
| `apps/web/src/app/(console)/org/events/[eventId]/reports/actions.ts` | Server action for report generation |
| `apps/web/src/app/(console)/org/events/[eventId]/reports/download/route.ts` | PDF download endpoint |
| `apps/web/src/app/demo/organizer/reports/page.tsx` | Demo reports page — **has KPI duplication** |
| `apps/api/src/modules/engagement/organizer-reporting.service.ts` | Backend: AI generation + PDF |
| `apps/web/src/lib/demo-intelligence.tsx` | Demo: `computeOrganizerReport` + `computeOrganizerBriefing` |
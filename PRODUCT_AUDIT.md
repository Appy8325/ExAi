# PRODUCT_AUDIT

**Date:** July 22, 2026
**Auditor:** Principal Engineer / CTO
**Perspective:** Enterprise customer & investor

---

## 0. EXECUTIVE SUMMARY

ExAi is an **AI-native trade show intelligence platform** serving three personas: Organizers, Exhibitors, and Attendees. The core value proposition is compelling — QR scan lead capture + AI-enriched relationship intelligence + real-time event analytics.

**The problem is real.** Trade show lead capture is broken. Business cards are lost, forms are ignored, follow-up is chaotic, and ROI is invisible. ExAi solves this.

**The product is not ready for commercial launch.** The architecture is enterprise-grade but critical revenue infrastructure — billing, email delivery, pricing, help center, and public API — are scaffolding only. An enterprise customer signing today would have no way to pay, no documentation to self-serve, and no integration pathway.

**The platform has no moat yet.** Without a public API, CRM integrations, or switching costs baked into the data, a competitor could replicate the core workflow within months.

**The next 90 days determine whether this is a product or a proof of concept.**

---

## 1. PROBLEM & VALUE PROPOSITION

### 1.1 The Problem

Trade shows are a $15B+ annual market in the US alone. The lead capture process is:

1. **Attendee visits booth** → exchanges business card or fills form
2. **Card goes in stack** → 200+ cards per show per exhibitor
3. **Post-show data entry** → sales team spends 2-3 weeks manually inputting leads
4. **Follow-up chaos** → no context about what was discussed, who's ready to buy
5. **ROI unknown** → no connection between booth activity and closed revenue

**Result:** 80% of leads never get followed up. Event ROI is invisible.

### 1.2 ExAi's Value Proposition

**Claim:** "ExAi turns every handshake into a lasting relationship"

**Mechanism:**
- QR scan → instant lead capture (no forms)
- AI enrichment → talking points, company context, buying intent score
- Cross-event memory → relationships persist across shows
- Real-time analytics → organizers see traffic/conversion live
- Actionable insights → exhibitors know who to follow up with first

### 1.3 Is This Compelling?

**Yes, for exhibitors.** The QR scan + AI enrichment is genuinely differentiated. A sales rep scanning a badge and getting an instant company profile + talking points + intent score is valuable.

**Yes, for organizers.** Live traffic visualization and conversion analytics are compelling for event directors who currently track this with spreadsheets.

**Maybe, for attendees.** The "control your data" and "AI recommendations" angle is decent but weaker. Most attendees don't think about data sharing at trade shows — they just want to find interesting booths.

**The QR mechanic is the key differentiator.** It removes friction from lead capture. Everything else (AI enrichment, analytics, cross-event memory) compounds on top of that.

---

## 2. PERSONA ANALYSIS

### 2.1 The Three Personas

| Persona | Job-to-be-Done | Primary Pain |
|---------|---------------|--------------|
| **Organizer** (Event Director) | Run successful trade shows that exhibitors pay to attend | Prove ROI to stakeholders, sell booth space, keep exhibitors happy |
| **Exhibitor** (Booth Sales Rep) | Capture quality leads and close deals post-event | Stand out at crowded events, remember everyone, follow up effectively |
| **Attendee** (Conference Participant) | Discover relevant exhibitors and connect with people | Information overload, can't visit 300 booths, forget what was discussed |

### 2.2 Are All Three Needed?

**Controversial take: No.**

The product should commit to **one primary persona** and build outward. Resources are finite. Here's the analysis:

**Option A: Lead with Exhibitors**
- They pay (directly or via organizer bundle)
- They have the most acute pain (lead capture friction)
- AI differentiation is strongest here
- Risk: Organizers control the platform choice

**Option B: Lead with Organizers**
- They sign the contract
- Analytics/portfolio management is compelling
- Risk: Analytics is the table stakes, not the differentiator

**Option C: Lead with Attendees** (weakest)
- No one pays for attendee experience alone
- Data sharing consent is a friction, not a value
- Risk: Attendee acquisition is a different business

**Recommendation: Lead with Exhibitors.** They pay, they have the most pain, and the QR mechanic solves their core problem. Organizer analytics should be positioned as "exhibitor ROI proof" not as a standalone value prop.

### 2.3 User Stories — What's Missing

The hackathon page gives us a glimpse of the attendee experience. But for paying customers:

**Exhibitor:**
- "I want to see my top 10 leads ranked by buying intent so I can prioritize follow-up" → NOT BUILT (no "top leads" ranking in exhibitor workspace)
- "I want to export my leads to Salesforce before I leave the event" → NOT BUILT (no CRM export)
- "I want my team to have shared notes on each lead" → PARTIAL (relationship notes exist)
- "I want to know if a lead visited my competitor's booth" → NOT BUILT (no cross-booth visibility)

**Organizer:**
- "I want to see which exhibitors are getting the most qualified leads" → PARTIAL (booth-level analytics exist)
- "I want to send a push notification to all attendees" → NOT BUILT (no push notification system)
- "I want to compare this event's performance to last year" → NOT BUILT (no historical comparison)

---

## 3. FEATURE ANALYSIS

### 3.1 Features That Create Value

| Feature | Value | Notes |
|---------|-------|-------|
| **QR Lead Capture** | HIGH | Removes all friction. This is the foundation. |
| **AI Lead Enrichment** | HIGH | Company context + talking points + intent scoring. This is the differentiator. |
| **Real-time Booth Analytics** | MEDIUM | Live traffic is compelling for organizers but not unique |
| **Relationship Persistence** | HIGH | Cross-event memory is a real switching cost |
| **AI Briefings (Organizer)** | MEDIUM | Executive summaries are useful if accurate |
| **Attendee Discovery** | LOW | Search/browse exhibitors is table stakes |

### 3.2 Features That Create Complexity (Without Proportionate Value)

| Feature | Complexity Cost | Should Be |
|---------|----------------|-----------|
| **Matchmaking** | HIGH | All weights are 0. Should be removed from roadmap until lead scoring is proven |
| **Voice Transcription** | MEDIUM | Stub consumer exists. Not MVP. Remove for now. |
| **Wallet Passes** | MEDIUM | Apple/Google wallet integration. Nice-to-have. |
| **Meeting Scheduling** | HIGH | Calendar integration is complex. Not MVP. |
| **Floor Maps (spatial)** | MEDIUM | "Coming in Milestone 4" in demo — this is a facade, not a feature |
| **Help Center** | MEDIUM | Schema exists but UI doesn't. Don't build until billing is wired. |
| **Admin Panel** | LOW | Useful but not critical for launch |

### 3.3 Features That Should Be Removed

| Feature | Reason |
|---------|--------|
| **Matchmaking** | All weights are 0. Not built. Won't be built in next 12 months. Remove from docs/roadmap. |
| **Floor Maps** | "Spatial floor map" is a facade — shows placeholder in demo. Remove or actually build. |
| **Webhook delivery system** | Stub consumer. Not MVP. |
| **Lead voice transcription** | Stub consumer. Not MVP. |
| **Admin simulation panel** | Should not be in production at all — exposes simulation controls to anyone |
| **Demo admin page** | No auth. Controls exposed publicly. Remove from production build. |

### 3.4 Features Missing for Paying Customers

| Feature | Priority | Why It Blocks Launch |
|---------|----------|----------------------|
| **Pricing page** | CRITICAL | No conversion funnel |
| **Stripe integration** | CRITICAL | Cannot charge |
| **Multi-seat pricing** | CRITICAL | Teams need 3-10 users per exhibitor org |
| **CRM export (Salesforce/HubSpot)** | HIGH | Sales teams need this to justify purchase |
| **Role-based access (UI)** | HIGH | Can't give a teammate read-only access |
| **Onboarding wizard** | HIGH | First-time users don't know what to do |
| **Help center** | MEDIUM | No self-service support |
| **Email notifications** | MEDIUM | Users need to know when they have new leads |
| **Cookie consent banner** | MEDIUM | GDPR exposure |
| **Public API** | MEDIUM | Enterprise integration impossible |

---

## 4. WORKFLOW ANALYSIS

### 4.1 Happy Path

```
Organizer creates event
  → Invites exhibitors (email)
  → Exhibitors set up booth (logo, description, lead form)
  → Event goes live
  → Attendees browse /e/techexpo-2027
  → Attendee scans booth QR
  → Lead captured instantly (no form)
  → AI enriches lead (company, talking points, intent)
  → Exhibitor sees lead in real-time
  → Event ends
  → AI generates executive report
  → Organizer reviews ROI
```

This workflow is **solid**. The QR mechanic eliminates the form. AI enrichment happens automatically. The report generates itself.

### 4.2 Where the Workflow Breaks

**Break 1: Organizer can't create an event without reading docs**
- `/org/events` shows a form but there's no guided onboarding
- First-time user lands at `/org` with no events → sees an empty state with a form that isn't explained
- **Fix: Add a getting-started checklist for first-time organizers**

**Break 2: Exhibitor onboarding is unclear**
- After getting access, exhibitor lands at `/exhibit` with no guidance
- No checklist for "complete your profile before the event"
- QR code exists at `/exhibit/[org]/qr` but exhibitor might not find it
- **Fix: Add an exhibitor onboarding wizard with 3-5 steps**

**Break 3: Attendee discovery has no AI**
- `/e/techexpo-2027` is a searchable list of exhibitors
- AI recommendations exist only on the exhibitor detail page (`/insights`)
- Why not show "You might like these booths" on the main page?
- **Fix: Add AI recommendation carousel to the attendee directory**

**Break 4: Follow-up is manual**
- After the event, exhibitor has a list of leads
- No built-in email sequence suggestions
- No CRM sync
- No task creation
- **Fix: Add "Top 5 leads to follow up today" + one-click email draft**

### 4.3 Workflow Gaps

| Gap | Severity | Fix |
|-----|----------|-----|
| No "event countdown" for exhibitors | MEDIUM | Dashboard shows days until event |
| No lead quality indicator during event | MEDIUM | Color-coded lead pipeline |
| No post-event satisfaction survey | LOW | Simple NPS for exhibitors |
| No "top traffic day" insight | MEDIUM | AI-generated event recap |

---

## 5. COMPETITIVE ANALYSIS

### 5.1 Direct Competitors

| Competitor | Strengths | Weaknesses |
|------------|-----------|------------|
| **Grip** | Real networking, matchmaking | No AI, enterprise UX |
| **SpotMe** | Enterprise-grade, events + content | Expensive, complex |
| **Whova** | Good attendee app, hybrid events | Lead capture weak |
| **HeySummit** | Content-focused | Not for large trade shows |
| **RunTheWorld** | Virtual events focus | Not physical |

### 5.2 Indirect Competitors

| Competitor | Threat |
|------------|--------|
| **LinkedIn** | People exchange cards and connect post-event |
| **Google Forms** | Free lead capture (low quality) |
| **Cvent** | Enterprise, expensive, legacy UX |

### 5.3 ExAi's Positioning

**Current:** "AI-native trade show intelligence"

**Issue:** "AI-native" is a claim, not a differentiator. Every event tech startup says this.

**Better positioning:** Something around "from first scan to first call in 30 seconds" or "the only platform that turns booth traffic into closed deals."

**The QR mechanic is the wedge.** Lead capture is the moment of maximum value. If that moment is frictionless and the AI enrichment is demonstrably better than competitors, the platform earns its place.

---

## 6. PRICING & MONETIZATION

### 6.1 Current State

- No pricing page
- No Stripe integration
- No concept of plan limits

### 6.2 What Should Be Priced

**Option A: Per-Event (simplest)**
- $X per event + $Y per exhibitor booth
- Aligns value with customer pain (events = ROI)
- Risk: Hard to upsell mid-event

**Option B: Per-Seat (recurring)**
- $X per exhibitor team member/month
- Aligns with team growth
- Risk: Organizers resist per-seat pricing

**Option C: Hybrid (recommended)**
- Base: $X/month for organizer portfolio management
- Add-on: $Y per event
- Add-on: $Z per exhibitor (with bundle discounts)
- Aligns all stakeholders

### 6.3 Feature Gating

| Feature | Free | Starter | Pro | Enterprise |
|---------|------|--------|-----|------------|
| Lead capture (QR) | ✓ | ✓ | ✓ | ✓ |
| AI enrichment | 10/day | 100/day | Unlimited | Unlimited |
| Analytics | Basic | Full | Full + export | Full + export |
| Team members | 1 | 3 | 10 | Unlimited |
| CRM export | ✗ | ✗ | ✓ | ✓ |
| Custom branding | ✗ | ✗ | ✓ | ✓ |
| SSO/SAML | ✗ | ✗ | ✗ | ✓ |
| SLA | ✗ | ✗ | ✗ | ✓ |

---

## 7. PRODUCT-MARKET FIT ASSESSMENT

### 7.1 What Works

- The QR mechanic genuinely solves a real pain
- The lead enrichment is demonstrably impressive
- The real-time aspect is compelling in demos
- The hackathon page shows what's possible

### 7.2 What Doesn't Work (Yet)

- No paying customer to validate pricing
- No self-serve signup flow (magic link requires existing account)
- No onboarding — users land and don't know what to do
- No mobile experience beyond QR scanning (attendee directory is desktop-first)
- No visible social proof (no case studies, no logos, no testimonials)

### 7.3 Shortest Path to PMF

1. **Get one paying exhibitor** at a real event (not the hackathon)
2. **Get their feedback on lead quality** — is the AI enrichment actually useful?
3. **Iterate on the enrichment** based on real usage
4. **Then scale to organizer portfolio management**

**The KPI that matters:** % of scanned leads that result in a follow-up meeting. If that number is > 20%, the product works.

---

## 8. RECOMMENDATIONS

### 8.1 What to Remove

1. **Matchmaking** — Not built. Won't be built soon. Remove from roadmap.
2. **Floor maps** — Facade. Remove or build properly.
3. **Webhook consumer** — Not built. Remove stub.
4. **Voice transcription** — Not built. Remove stub.
5. **Demo admin page from production** — Security risk, not appropriate for production.

### 8.2 What to Delay

1. **Multi-language/i18n** — Don't need until international events
2. **SSO/SAML** — Don't need until enterprise deals
3. **Mobile app** — Focus on PWA first
4. **Calendar integration** — Don't need until meeting scheduling is a feature
5. **Help center** — Build only after billing is wired

### 8.3 What to Build Before Next Customer

1. **Pricing page** — Non-negotiable
2. **Stripe integration** — Non-negotiable
3. **Onboarding wizard** (3-5 steps) — Critical for conversion
4. **Lead export to CSV/HubSpot** — Critical for exhibitor retention
5. **Cookie consent banner** — GDPR exposure

### 8.4 What to Improve Now

1. **Organizer first-time experience** — Add getting-started checklist
2. **Exhibitor onboarding** — Add 5-step setup wizard with QR preview
3. **Attendee directory AI** — Add "Recommended for you" section
4. **Top leads ranking** — Add "Follow up with these first" to exhibitor dashboard

### 8.5 The One Thing

If I could only fix one thing before the next demo: **Add an AI-powered "top 5 leads to follow up today" card to the exhibitor dashboard.**

This is the highest-value moment in the product. A sales rep opens the app, sees "Here are your 5 hottest leads from today's show" with company summaries and talking points, and immediately knows what to do. Everything else is secondary.

---

## SCORECARD

| Dimension | Score | Notes |
|-----------|-------|-------|
| Problem clarity | 9/10 | Real, acute, relatable |
| Value proposition | 7/10 | Compelling but not unique |
| Workflow completeness | 6/10 | Happy path works, edges break |
| Feature fit | 5/10 | Some features create complexity, some value missing |
| Competitive positioning | 5/10 | "AI-native" claim is generic |
| Pricing/monetization | 2/10 | Nothing built |
| PMF indicators | 3/10 | No paying customers, no social proof |
| Onboarding | 2/10 | No guided first-time experience |
| Go-to-market | 3/10 | No pricing page, no case studies, no API |

**Overall: 5/10** — A compelling prototype that needs significant product and business infrastructure before it can justify enterprise pricing.
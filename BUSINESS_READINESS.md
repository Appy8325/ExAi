# BUSINESS_READINESS

**Date:** July 22, 2026
**Auditor:** Principal Engineer / CTO perspective
**For:** Enterprise customers, investors, co-founders

---

## 0. EXECUTIVE SUMMARY

**Could someone pay for this today?** Technically yes, operationally no. The product demo works, the value prop is clear, and the architecture supports multi-tenancy. But there is no pricing, no billing, no self-serve signup, no onboarding, and no documentation. A sales team could not close an enterprise deal today because there's no contract to sign and no way to operationalize the product.

**Could an investor deploy this?** No. Without a public API, CRM integration, and billing, an investor cannot justify a significant valuation. They're buying a proof of concept.

**Could a customer adopt this for their next trade show?** Yes, if someone manually onboards them and handles payments informally. But that's a services engagement, not a product.

**The next 90 days determine whether this is a venture-scale business or a really impressive hackathon project.**

---

## 1. REVENUE READINESS

### 1.1 Can You Charge Today?

**Answer: No.**

| Revenue Mechanism | Status |
|-------------------|--------|
| Pricing page | DOES NOT EXIST |
| Stripe integration | STUB (empty module) |
| Subscription management | NOT BUILT |
| Invoice generation | NOT BUILT |
| Payment capture | NOT BUILT |
| Refund handling | NOT BUILT |
| Plan-gated features | STUB (PostHog flags exist but not wired) |

### 1.2 Shortest Path to First Dollar

1. **Week 1-2:** Build a simple pricing page (`/pricing`) with 3 tiers:
   - Starter: $499/event + $99/booth
   - Professional: $1,499/event + $249/booth (includes AI)
   - Enterprise: custom (contact sales)
2. **Week 2-3:** Wire Stripe checkout (one-time event payment + per-booth add-ons)
3. **Week 3-4:** Manually onboard first paying customer
4. **Week 4+:** Add recurring subscription + per-seat billing

**Alternative (faster):** Use Stripe Payment Links + Google Forms for intake. Skip the billing integration entirely for the first few customers. This is embarrassing but gets revenue flowing.

### 1.3 What Features Justify Pricing

**Minimum viable billing:**
- Event creation with defined date range
- Booth count = number of exhibitor workspaces
- AI enrichment tier-gated

**What exhibitors actually pay for:**
- Lead capture speed (QR > forms)
- Lead quality (AI enrichment)
- Follow-up efficiency (summaries, scoring)

**What organizers actually pay for:**
- Analytics dashboard
- Real-time visibility
- Cross-event portfolio management

**Do not charge for:**
- Attendee directory (commodity)
- Basic QR codes (table stakes)

---

## 2. IDEAL CUSTOMER PROFILE

### 2.1 Who Is the Buyer?

**Primary:** VP Sales or Marketing at mid-size companies that exhibit at trade shows.

**Profile:**
- Company runs 3-10 trade shows/year
- 5-20 sales reps at each show
- Currently using spreadsheets or pen/paper for lead tracking
- Willing to pay $500-$2,000/event for ROI visibility

**Secondary:** Event directors at trade show organizers.

**Profile:**
- Company organizes 10+ events/year
- Wants to offer ExAi to exhibitors as a value-add
- Needs portfolio analytics
- Could become a reseller (white-label)

### 2.2 Who Is the User (Not the Buyer)

**Exhibitor sales rep:**
- Uses the product at the event
- Primary action: scan badge → see lead → take notes
- Willing to use a new tool if it saves time
- Doesn't care about billing/infrastructure

**Attendee:**
- Uses the directory to find booths
- May scan a QR code
- Has no purchasing power

### 2.3 ICP Fit Check

| ICP Requirement | ExAi Fit | Notes |
|----------------|---------|-------|
| Trade shows | ✓ | Core use case |
| Lead capture | ✓ | QR mechanic works |
| AI enrichment | ✓ | Differentiator |
| CRM integration | ✗ | Not built — blocks enterprise |
| Multi-event management | ✓ | Architecture supports |
| Team collaboration | ~ | Basic — needs role management polish |

**Gap:** CRM integration is the #1 blocker for enterprise deals. HubSpot/Salesforce sync must exist before a VP Sales will deploy this to their team.

---

## 3. ENTERPRISE READINESS

### 3.1 What Prevents Enterprise Adoption

| Blocker | Severity | Fix Effort |
|---------|----------|------------|
| **No CRM integration** | CRITICAL | 2-3 weeks |
| **No SSO/SAML** | CRITICAL | 1 week (Supabase supports it) |
| **No role-based access UI** | HIGH | 1 week |
| **No SLA/Security docs** | HIGH | 1 week |
| **No public API** | HIGH | 2 weeks |
| **No audit log** | MEDIUM | 1 week |
| **Cookie consent missing** | MEDIUM | 2 days |
| **No data export** | MEDIUM | 1 week |

### 3.2 CRM Integration (HubSpot/Salesforce)

**Why it matters:** Enterprise sales teams live in HubSpot. If ExAi leads don't appear in their CRM, the product doesn't exist for them.

**Minimum viable integration:**
1. Export leads to CSV (exists — `/v1/organizer/events/:id/leads.csv`)
2. Zapier trigger on lead submission
3. Webhook to HubSpot/Salesforce on lead creation

**Better:** Native integration with field mapping.

**Recommendation:** Build the webhook first. It's a 1-week fix that enables the entire Zapier ecosystem.

### 3.3 SSO/SAML

**Supabase Auth supports:**
- Google Workspace SSO
- SAML (via enterprise SSO add-on)
- Microsoft Entra ID

**What's missing:** No UI for configuring SSO. No "Sign in with Google" button on the auth page.

**Fix:** Add Google Workspace SSO button. This alone unlocks 50% of enterprise orgs.

### 3.4 Security Documentation

**Required for enterprise deals:**
- [ ] Security whitepaper
- [ ] SOC 2 Type I readiness (not certification yet)
- [ ] Data processing agreement (DPA)
- [ ] Sub-processor list
- [ ] Penetration test (internal or third-party)

**Existing:** GDPR/CCPA documentation in `docs/38-data-retention-privacy-compliance.md`. Good foundation.

---

## 4. COMPETITIVE VULNERABILITIES

### 4.1 What Investors Would Criticize

**"You have no moat."**
- QR lead capture is not proprietary
- Any competitor can add a QR code to their app
- AI enrichment is calling an external API (NVIDIA)
- The unique value is the integration, not a unique algorithm

**Counter:** The data network effect. Every event creates more training data for lead scoring. Every exhibitor adds to the relationship graph. This is real but not yet visible in the product.

**"You have no pricing."**
- No conversion funnel exists
- No idea what customers would pay
- No LT/ARR metrics

**Counter:** Build pricing page. Start charging.

**"You're a feature, not a product."**
- Trade show lead capture is one part of the sales workflow
- CRM is the system of record — ExAi should integrate into it

**"Your go-to-market is unclear."**
- Selling to organizers vs exhibitors requires different motions
- Event organizers are slow procurement cycles (3-6 months)
- Exhibitors are faster but have lower ACVs

### 4.2 What Customers Would Criticize

**"It's too complicated to set up."**
- No onboarding wizard
- Event creation has 8+ required fields
- QR codes need to be printed and distributed

**"The AI insights aren't actionable enough."**
- "High intent" doesn't tell the rep what to do
- Reports are too long (5 pages of generated text)
- No suggested next actions

**"My leads aren't in my CRM."**
- Manual CSV export is the only option
- Real-time sync doesn't exist

**"I don't know if it's working."**
- No ROI dashboard
- No connection between lead capture and revenue

---

## 5. COMPLIANCE

### 5.1 What's Documented

**From `docs/38-data-retention-privacy-compliance.md`:**
- GDPR lawful bases (contract, consent, legitimate interest)
- CCPA as Service Provider
- Data retention by type
- Audit log retention (7 years)

### 5.2 What's Missing

| Requirement | Status | Gap |
|-------------|--------|-----|
| Cookie consent banner | NOT BUILT | No opt-in UI |
| Privacy policy page | NOT BUILT | No /privacy page |
| Terms of service | NOT BUILT | No /terms page |
| DPA (data processing agreement) | EXISTS (doc) | Not signed with any customer |
| Sub-processor list | NOT CREATED | Required for GDPR |
| Data export (right to portability) | NOT BUILT | Users can't export their data |
| Data deletion (right to erasure) | PARTIAL | Supabase handles auth deletion, app data unclear |

### 5.3 Cookie Consent

**No consent banner found anywhere in the codebase.**

**This is a GDPR exposure.** Any EU user must explicitly consent to non-essential cookies before they fire.

**Minimum fix:**
```tsx
// app/layout.tsx
<CookieConsent />
```

Build a simple banner: "We use cookies to improve your experience. [Accept] [Manage preferences]."

---

## 6. METRICS & ANALYTICS

### 6.1 What ExAi Can Measure Today

**Product analytics (PostHog):**
- DAU/WAU/MAU (if PostHog wired)
- Funnel: QR scan → lead capture → AI enrichment → follow-up
- Feature usage: which AI features are used most
- Drop-off: where users abandon the flow

**Business metrics (database):**
- Leads captured per event/exhibitor/day
- QR scans per booth
- AI enrichment rate (leads enriched / leads captured)
- Conversion rate (leads / visits)

### 6.2 What ExAi Should Measure

| Metric | Why | Current Status |
|--------|-----|---------------|
| **CAC by channel** | Know if marketing is working | NOT TRACKED |
| **LT/ARR per customer** | Know if pricing works | NOT TRACKED |
| **Lead-to-meeting rate** | Core value prop | NOT TRACKED (needs CRM) |
| **Event ROI** | Sales enablement story | PARTIAL (analytics exist) |
| **NPS/CSAT** | Customer satisfaction | NOT TRACKED |
| **Churn rate** | Retention | NOT TRACKED |
| **AI enrichment accuracy** | Product quality | NOT TRACKED |

### 6.3 North Star Metric

**QCE (Qualified Connections per Event)** — from `docs/32-analytics-architecture.md`.

**Formula:** `QCE = leads.captured_count × leads.qualification_rate`

**This is the right north star.** It measures:
- Lead capture volume (quantity)
- Lead quality (quality)

**Target:** Track QCE per event, per exhibitor, over time.

---

## 7. INTEGRATION ECOSYSTEM

### 7.1 Expected Integrations (by ICP)

| Integration | Priority | Who Asks |
|-------------|----------|----------|
| HubSpot | HIGH | VP Sales |
| Salesforce | HIGH | Enterprise |
| Zapier | HIGH | SMB |
| Google Calendar | MEDIUM | Attendees |
| Apple/Google Wallet | MEDIUM | Attendees |
| Marketo | LOW | Enterprise |
| Outreach/Salesloft | LOW | Sales teams |

### 7.2 Integration Architecture

**Current state:** Nothing integrated.

**Architecture exists:**
- Webhook consumer stub (`webhook-deliver.consumer.ts`)
- API endpoints for lead export
- Database schema ready for integration tracking

**What to build first:**

**Week 1:** Lead export webhook
```typescript
// When lead is created:
await fetch(customer.webhookUrl, {
  method: 'POST',
  body: JSON.stringify({ lead, event, timestamp }),
});
```

**Week 2-3:** Zapier integration (via webhook URL)
- User provides Zapier webhook URL
- ExAi sends lead data on submission

**Week 3-4:** HubSpot integration
- OAuth flow
- Field mapping (lead → contact + custom fields)

### 7.3 Public API

**No public API exists.** This is a critical gap for enterprise.

**Minimum viable API:**
```
GET  /v1/events
GET  /v1/events/:id/exhibitors
GET  /v1/events/:id/analytics
GET  /v1/leads?eventId=&exhibitorId=
POST /v1/leads (for lead form submission)
```

**Recommendation:** Build a minimal public API using the existing `PublicExhibitorsController` as a model. Add authentication via API keys (already in schema).

---

## 8. SHORTEST PATH TO PMF

### 8.1 The PMF Hypothesis

**Hypothesis:** Exhibitors at trade shows will pay to capture more leads with less friction and see higher-quality follow-up.

**Test:** Get one exhibitor at a real trade show to use ExAi for the full event.

### 8.2 Minimum Viable Experiment

**Week 1-2:**
1. Add pricing page (3 tiers, simple Stripe checkout)
2. Add a "Start free trial" → gets 1 event + 5 booths for free
3. Add a manual onboarding call (30 min)
4. Get 1 paying customer

**Week 3-4:**
1. Add CSV export to HubSpot (via webhook)
2. Send NPS survey after first event
3. Iterate on AI enrichment based on feedback

### 8.3 What "Good" Looks Like

| Metric | Target (3 months) |
|--------|------------------|
| Paying exhibitors | 10 |
| Events with ExAi | 5 |
| Leads captured | 1,000 |
| Lead-to-meeting rate | >10% |
| NPS | >40 |
| CRM sync users | 3 |

---

## SCORECARD

| Dimension | Score | Blocker |
|-----------|-------|---------|
| Revenue infrastructure | 1/10 | No billing, no pricing |
| Customer acquisition | 2/10 | No pricing page, no self-serve |
| ICP clarity | 7/10 | Clear personas, clear value prop |
| Enterprise readiness | 3/10 | No CRM, no SSO, no API |
| Compliance | 4/10 | GDPR docs exist, cookie consent missing |
| Metrics | 2/10 | No tracking infrastructure |
| Integration ecosystem | 2/10 | Nothing integrated |
| Go-to-market | 2/10 | No pricing, no case studies |

**Overall: 2.6/10** — Pre-revenue. Architecture supports billing, nothing else is wired.

---

## THE ONE THING

If I could only do one thing before the next customer call:

**Build a pricing page and add Stripe.**

It doesn't have to be perfect. It doesn't have to handle enterprise contracts. It just needs to show that this is a product you pay for, not a demo you get for free.

Even a simple $499/event + $99/booth pricing with a Stripe checkout starts the revenue conversation.

Everything else on this list can wait. Without a way to charge, there's no business.

---

## TOP 10 BLOCKERS FOR COMMERCIAL LAUNCH

1. **No pricing page** — Cannot convert inbound interest
2. **No Stripe integration** — Cannot charge
3. **No self-serve signup** — Cannot acquire without a human
4. **No onboarding wizard** — First-time users don't know what to do
5. **No cookie consent** — GDPR exposure in EU
6. **No CRM export** — Enterprise deals blocked
7. **No public API** — Integration ecosystem impossible
8. **No SSO** — Enterprise SSO required
9. **No help center** — No self-service support
10. **No role-based access UI** — Team management impossible
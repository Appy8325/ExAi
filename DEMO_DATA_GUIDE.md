# Demo Data Guide

**Application:** ExAi v1.0.0-rc1
**Purpose:** Define the ideal demo dataset so every screen tells a coherent story.

---

## Overview

The demo dataset simulates a technology trade show called **TechExpo 2027** — a 3-day B2B event with 10 exhibitors, 120 registered attendees, and ~1,200 lead submissions. The dataset is designed to showcase every product feature without fabricating unrealistic scenarios.

---

## 1. Organizer

| Field | Value | Notes |
|-------|-------|-------|
| Name | TechExpo Corp | The organizing entity |
| Slug | `techexpo-corp` | |
| Email | demo-org@exai.app | Demo login account |
| Role | organizer | |

**Story:** TechExpo Corp is a B2B conference organizer running their flagship annual event. They use ExAi to manage exhibitors, track leads, and measure event ROI.

---

## 2. Event

| Field | Value | Notes |
|-------|-------|-------|
| Name | TechExpo 2027 | |
| Slug | `techexpo-2027` | |
| Status | `published` | Visible to attendees and exhibitors |
| Start date | 2026-07-21 | 3-day event (Jul 21-23) |
| Location | Tokyo, Japan | In-person event |
| Timezone | Asia/Tokyo | |

**Story:** A large-scale B2B expo focused on enterprise technology — cloud infrastructure, AI/ML, cybersecurity, and developer tools.

**Demo goal:** This should be the ONLY event visible. If multiple events exist, the demo should default to this one or provide clear navigation.

---

## 3. Event Sessions

| Name | Day | Type |
|------|-----|------|
| Keynote: Future of Enterprise AI | Day 1 | keynote |
| Building Secure Cloud Architectures | Day 1 | talk |
| Panel: Scaling AI from Pilot to Production | Day 2 | panel |
| Workshop: Hands-on with NVIDIA NIM | Day 2 | workshop |
| Fireside Chat: Raising Capital in 2026 | Day 3 | fireside |

**Story:** A curated agenda that draws attendees to the event. The keynote and AI panel drive the highest engagement.

**Demo goal:** Show that the event has a structured agenda visible to attendees. Sessions create natural context for why attendees are at the event.

---

## 4. Exhibitors (Minimum 5)

Each exhibitor represents a real company with a profile, booth, and lead activity. At least 5 exhibitors are needed to make the heatmap and analytics meaningful.

| Exhibitor | Industry | Booth Type | Lead Volume | AI Story |
|-----------|----------|------------|-------------|----------|
| **Northstar Cloud** | Cloud Infrastructure | Premium | High | Market leader — most booth traffic, highest intent leads. Flagship exhibitor. |
| **Pulse Analytics** | Data/Analytics | Standard | Medium | Strong interest from data teams. Mid-tier traffic but high conversion to follow-ups. |
| **Synthex AI** | AI/ML | Premium | High | New entrant with buzz. Highest number of booth visits. Leads are mostly "exploring" intent. |
| **ShieldCore** | Cybersecurity | Standard | Medium | Niche interest but very high intent. Fewer leads, but most are "high intent." |
| **DevStream** | Developer Tools | Economy | Low | Low traffic but engaged visitors. Example of a smaller exhibitor getting value from the platform. |

### Demo Goals

- **Premium booths** (Northstar Cloud, Synthex AI) should dominate the heatmap — they have more space, more staff, more visitors.
- **Standard booths** (Pulse Analytics, ShieldCore) should show in the middle of the pack.
- **Economy booth** (DevStream) should show that smaller exhibitors still benefit — they see fewer leads but those leads are high quality.
- **Lead intent distribution** varies: ShieldCore has high intent but few leads; Synthex AI has many leads but most are exploring. This creates a natural conversation about lead quality vs. quantity.

---

## 5. Attendees (Minimum 120)

Attendees represent real B2B buyer profiles:

| Role | % of Attendees | Example Titles |
|------|----------------|----------------|
 | Executive | 15% | VP of Engineering, CTO, Head of AI |
| Director/Manager | 35% | Engineering Director, Product Manager, IT Director |
| Practitioner | 40% | Software Engineer, Data Scientist, Security Analyst |
| Other | 10% | Consultant, Analyst, Press |

### Key attendee profiles for demo storytelling:

| Name | Company | Role | Narrative |
|------|---------|------|-----------|
| Sarah Chen | NVIDIA | Director AI Infrastructure | High-value lead. Visits Northstar Cloud and Synthex AI. High buying intent. |
| Marcus Johnson | Google Cloud | Sr. Product Manager | Evaluating solutions. Visits multiple booths. Medium intent. |
| Priya Sharma | AWS | Security Engineer | Focused on ShieldCore booth. Very high intent, specific requirements. |
| Takeshi Yamamoto | Sony | VP Engineering | Executive decision-maker. Visits Synthex AI and DevStream. |
| Emily Rodriguez | Meta | Data Scientist | Multiple visits to Pulse Analytics. Exploring options. |

**Demo goal:** When clicking into an exhibitor's lead list, these names should appear with recognizable companies. The intent scores and AI summaries should feel accurate given the attendee's profile.

---

## 6. Lead Submissions (Minimum 200)

Each lead submission records an attendee scanning a booth QR code or filling out a contact form.

### Distribution

| Exhibitor | Lead Count | Intent Mix |
|-----------|------------|------------|
| Northstar Cloud | 45 | 40% high, 35% medium, 25% exploring |
| Pulse Analytics | 35 | 30% high, 40% medium, 30% exploring |
| Synthex AI | 55 | 20% high, 30% medium, 50% exploring |
| ShieldCore | 25 | 60% high, 25% medium, 15% exploring |
| DevStream | 15 | 35% high, 40% medium, 25% exploring |
| Other 5 exhibitors | ~45 combined | Varied mix |

### Intent Classification

| Intent | Meaning | Example |
|--------|---------|---------|
| **High** | Active buyer — has budget, timeline, specific requirements | "Looking to migrate 500 workloads within 6 months" |
| **Medium** | Evaluating — researching options, may buy in 6-12 months | "Comparing three vendors for Q1 evaluation" |
| **Exploring** | Early stage — gathering information, no active purchase | "Seeing what's available in the market" |

### AI Enrichment

Each lead submission should include an AI-enriched summary:

```
Exhibitor: Northstar Cloud
Attendee: Sarah Chen (NVIDIA — Director AI Infrastructure)
Intent: High
Summary: "Interested in GPU cluster management for large-scale AI training workloads.
           Evaluating scalability options for expanding from 1,024 to 10,000+ GPU nodes.
           Has budget approval for Q4 2026 deployment."
Topics: ["GPU cluster", "AI infrastructure", "scalability", "enterprise deployment"]
```

**Demo goal:** The AI enrichment makes leads immediately actionable — no manual follow-up research needed.

---

## 7. Relationships (Minimum 1,000)

Relationships represent the connections between attendees and exhibitors beyond lead capture — meeting scheduling, follow-ups, engagement tracking.

| Type | Count | Purpose |
|------|-------|---------|
| Booth visits | ~600 | Each attendee visits 5 booths on average |
| Profile views | ~300 | Attendees view exhibitor profiles before/after visits |
| Follow-ups | ~100 | Exhibitors mark leads for follow-up |
| Notes taken | ~150 | Exhibitor notes on conversations |

### Relationship Workspace Demo Data

For the demo, the relationship workspace should show:

- **Active connections** — leads that the exhibitor is currently pursuing
- **Recent notes** — at least 3 notes on different leads with different statuses
- **Follow-up reminders** — at least 1 upcoming follow-up task

---

## 8. Analytics Data

Analytics are computed from the lead and relationship data above.

### Funnel Metrics (Day-over-Day)

| Stage | Day 1 | Day 2 | Day 3 | Total |
|-------|-------|-------|-------|-------|
| Booth visits | 150 | 280 | 170 | 600 |
| Profile views | 80 | 140 | 80 | 300 |
| Lead submissions | 60 | 100 | 50 | 210 |
| Follow-ups booked | 25 | 50 | 25 | 100 |

**Demo goal:** Day 2 should be the peak (typical event pattern). This creates a natural "why did metrics change?" conversation — "Day 2 is the main expo day with the most attendees."

### Booth Heatmap Data

| Exhibitor | Booth Traffic | Lead Count | Engagement Rate |
|-----------|---------------|------------|-----------------|
| Synthex AI | 180 visits | 55 leads | 31% |
| Northstar Cloud | 150 visits | 45 leads | 30% |
| Pulse Analytics | 100 visits | 35 leads | 35% |
| ShieldCore | 70 visits | 25 leads | 36% |
| DevStream | 40 visits | 15 leads | 38% |
| (others) | ~60 total | ~45 leads | (varies) |

**Demo goal:** Synthex AI has highest traffic (new AI company = buzz) but lower engagement rate. DevStream has lowest traffic but highest engagement rate — great talking point about lead quality vs. quantity.

### Intent Distribution

| Intent | Leads | % |
|--------|-------|---|
| High | 65 | 31% |
| Medium | 75 | 36% |
| Exploring | 70 | 33% |

---

## 9. AI Executive Report

The AI executive report for TechExpo 2027 should contain:

**Executive Summary:**
"TechExpo 2027 concluded as a strong event with 120 registered attendees and over 600 booth visits across 3 days. Lead quality was high, with 31% of leads classified as high-intent buyers. The top-performing exhibitors by lead volume were Synthex AI (55 leads) and Northstar Cloud (45 leads)."

**Key Insights:**
- Synthex AI generated the most booth traffic (180 visits) driven by interest in their new LLM deployment platform
- ShieldCore leads had the highest intent percentage (60% of their 25 leads were high-intent)
- Lead quality improved on Day 2 as attendees became more targeted in their booth visits
- The Northstar Cloud + Synthex AI combination accounted for 48% of all captured leads

**Recommendations:**
- Schedule Synthex AI for keynote slot at next event — their attendee pull is exceptional
- Consider upgrading ShieldCore to a premium booth — high-intent leads justify the investment
- DevStream's high engagement rate (38%) suggests economy booths are effective for targeted audiences

**Demo goal:** The report should feel genuinely useful — not a generic template. It should reference specific exhibitors and data points shown in the demo.

---

## 10. Demo Data Lifecycle

### Initial Load (Seed)

The demo dataset is seeded using `pnpm db:seed` which populates the entire dataset described above.

```bash
API_DATABASE_URL="postgresql://..." pnpm db:seed
```

### Reset

If the demo environment needs to be reset:
```bash
# Drop and recreate schema
API_DATABASE_URL="postgresql://..." pnpm db:migrate

# Re-seed demo data
API_DATABASE_URL="postgresql://..." pnpm db:seed
```

### Simulation Mode

The Demo Admin panel (`/demo/admin`) provides simulation controls that can:
- Generate new leads in real time to simulate live event activity
- Trigger AI enrichment for newly captured leads
- Update analytics and heatmap data

Use simulation for live demos to show real-time data flowing in. For pre-recorded demos, use the seeded static dataset.

---

## Summary: Coherent Story

The demo data tells one coherent story:

1. **TechExpo 2027** is a 3-day enterprise tech conference in Tokyo
2. **120 attendees** from top tech companies (NVIDIA, Google, AWS, Sony, Meta)
3. **10 exhibitors** ranging from premium (Northstar Cloud) to economy (DevStream)
4. **210 leads captured** with AI-enriched intent scores and summaries
5. **Day 2 was the peak** — the main expo day with highest traffic
6. **Synthex AI won the popularity contest** (buzz) but **ShieldCore won on quality**
7. **AI report** synthesizes everything into actionable recommendations for next year

Every screen references the same data, the same names, the same story.

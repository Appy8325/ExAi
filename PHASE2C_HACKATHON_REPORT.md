# Phase 2C — Hackathon Showcase Enrichment Report

## Event QR Flow

```
Scan Event QR
     │
     ▼
/hackathon    ← Event Welcome Page (hero, stats, CTA)
     │
     │  [Enter Exhibition]
     │
     ▼
     │  Featured Technologies grid
     │  Search + Industry filters
     │  AI Discovery section
     │
     ├──→ /hackathon/expo  (Full Exhibition — all exhibitors)
     │
     └──→ /visit/{token}   (Individual Booth)
               │
               ├── Booth info + products
               ├── Suggested Questions
               ├── AI Assistant (RAG-based)
               └── Lead submission
```

## Companies

| # | Company | Booth | Industry | Products |
|---|---------|-------|----------|----------|
| 1 | Microsoft | A-101 | Technology | 9 |
| 2 | Apple | A-102 | Technology | 10 |
| 3 | Google | A-103 | Technology | 10 |
| 4 | NVIDIA | A-104 | Semiconductors & AI | 9 |
| 5 | Cisco | B-101 | Networking & Security | 9 |
| 6 | IBM | B-102 | Technology & Consulting | 9 |
| 7 | Intel | B-103 | Semiconductors | 9 |
| 8 | Salesforce | C-101 | Enterprise Software | 9 |
| 9 | Adobe | C-102 | Software | 9 |
| 10 | Siemens | D-101 | Industrial Technology | 9 |

**Replaced:**
- Amazon Web Services → Cisco
- Meta → Intel
- Tesla → Siemens

All information sourced from publicly available company websites. No pricing, confidential data, or fabricated content.

## Knowledge Sources

Each exhibitor has 3 seeded knowledge sources (30 total):

| Source Type | Content |
|-------------|---------|
| Company Overview (faq) | Company name, industry, booth, tagline, description, product list, official website |
| FAQ & Integrations (faq) | Product information, industry, company description |
| Product Brochure (brochure) | Product list, description, social links, website |

## AI Verification

- **RAG pipeline**: Questions → Guardrail → Vector search (topK=6) → Generation → Output guardrail → Response
- **Fallback**: If no vector matches, uses booth description + website + resources
- **Unknown answers**: AI states "information not available" rather than hallucinating
- **Citations**: All answers include `[1]`, `[2]` markers linked to specific knowledge sources

## Suggested Questions

Added company-aware suggested questions to every booth:

1. "What are your flagship products?"
2. "Which industries do you serve?"
3. "What makes your solution different?"
4. "How can I contact your sales team?"

Clicking a question immediately submits it to the AI. Questions are generic and work across all exhibitors.

## Landing Page Redesign

The `/hackathon` page is now a true event welcome page:

**Above the fold:**
- Full-viewport hero with gradient background
- "AI Native Trade Show" badge
- Large "TechExpo 2027" title with gradient accent
- "Experience the Future of AI-Powered Trade Shows" tagline
- Venue: Moscone Center, San Francisco
- Date: September 2027
- Exhibitor count
- **Primary CTA: "Enter Exhibition"** (smooth scrolls to exhibitor section)

**Stats section:**
- Featured Exhibitors: 10
- Attendees: 18,500+
- Countries Represented: 25
- AI Assistants: 10
- Sessions: 80+

**Below the fold:**
- "Explore the Expo" section with:
  - Search input
  - Industry filter pills
  - Premium exhibitor cards with "Visit Booth" hover CTA
  - "View Full Exhibition" link
- "AI Discovery" section explaining the AI assistant feature with example questions

**Language used:**
- "Featured Technologies"
- "Explore the Expo"
- "Today's Highlights"
- "Innovation Zone" / "AI Discovery"
- "Visit Booth" (not "Open Booth")
- No IDs, no internal routes, no developer terminology

**Animations:**
- Hero fade-in on mount (CSS transition)
- Card hover elevation with `hover:-translate-y-1`
- Button hover scale animation (`hover:scale-[1.02]`)
- Smooth scroll for "Enter Exhibition" CTA

## Event QR

- Single entrance QR: `/demo/qr/event-entrance.png`
- Encodes: `http://localhost:3000/hackathon`
- No per-exhibitor QR codes on landing page

## Files Changed

| File | Change |
|------|--------|
| `packages/database/seed/demo.ts` | Replaced AWS/Meta/Tesla with Cisco/Intel/Siemens. Updated booth numbers and factual descriptions. Added new industries. |
| `apps/web/src/app/hackathon/page.tsx` | Removed server-side gradient overlay. Cleaned up layout. |
| `apps/web/src/app/hackathon/landing-client.tsx` | **Complete redesign** — Pure event welcome page with hero, Enter Exhibition CTA, stats section, featured exhibitors below fold, AI Discovery section, micro-animations, event-appropriate language. |
| `apps/web/src/app/showcase/showcase-client.tsx` | Updated industry colors/gradients to match new company roster. |
| `apps/web/src/app/(attendee)/visit/[publicQrToken]/booth-experience.tsx` | Added suggested questions to BoothChat (4 generic questions as clickable chips). Updated chat input to be controlled for question prefill. |
| `PHASE2C_HACKATHON_REPORT.md` | This report. |

## Success Criteria

A first-time visitor can:
1. Scan the single event QR code landing on `/hackathon`
2. Understand the event within 10 seconds (hero + stats)
3. Click "Enter Exhibition" to browse exhibitors
4. Click any exhibitor to enter their booth
5. Click suggested questions or type their own to ask the AI
6. Submit a lead via the multi-step form
7. Leave with the impression of a real AI-powered trade show

# Hackathon Showcase Enrichment Report

## Event QR Flow

```
Scan Event QR (demo/qr/event-entrance.png)
       |
       v
  /hackathon  (Event Landing Page)
       |
       |-- Hero: TechExpo 2027, AI Native Trade Show
       |-- Date: May 12–14, 2027 · Los Angeles Convention Center
       |-- Exhibitor count
       |-- Search bar
       |-- Industry category filters
       |-- Featured exhibitors (first 6)
       |
       v
  /hackathon/expo  (Full Expo Floor)
       |
       |-- Search + Industry filters
       |-- Full exhibitor grid (3-column responsive)
       |-- Per-exhibitor: Open Booth → Products
       |
       v
  /visit/{publicQrToken}  (Booth Page)
       |
       |-- Company info & products
       |-- AI Assistant (RAG-based Q&A)
       |-- Published resources
       |-- Lead submission
```

No individual QR codes are shown on the landing page or expo floor. The single event entrance QR code (`/demo/qr/event-entrance.png`) encodes `http://localhost:3000/hackathon`.

## Companies Added

All 10 companies were already seeded with factual, publicly available information:

| Company | Industry | Booth | Products (count) |
|---------|----------|-------|-----------------|
| Microsoft | Technology | A-101 | 9 |
| Apple | Technology | A-102 | 10 |
| Google | Technology | A-103 | 10 |
| Amazon Web Services | Cloud Computing | B-101 | 9 |
| NVIDIA | Semiconductors & AI | B-102 | 9 |
| Meta | Technology | B-103 | 9 |
| Salesforce | Enterprise Software | C-101 | 9 |
| Adobe | Software | C-102 | 9 |
| IBM | Technology & Consulting | C-103 | 9 |
| Tesla | Automotive & Energy | D-101 | 10 |

**Note:** No companies were added or fabricated. The existing seed data uses factual, publicly available information sourced from official company websites.

## Knowledge Sources

Each exhibitor has 3 knowledge sources automatically seeded (total 30 across all booths):

1. **Company overview** (`faq` type) — Company name, industry, tagline, description, and product list
2. **FAQ & integrations** (`faq` type) — Product listings, industry, description, and website reference
3. **Product brochure** (`brochure` type) — Product list, description, social links, and website

All content is derived from factual public information. Nothing is fabricated.

## AI Verification

- **RAG-based answers:** The AI assistant retrieves content from the knowledge base chunks (pgvector embeddings) filtered by `eventExhibitorId`
- **Guardrails:** Input screening, output screening, and citation enforcement
- **Fallback:** If no knowledge chunks are found, the booth description, website, and resources are used
- **Unknown answers:** If information is not in the seeded documents, the AI states that rather than inventing
- **Citations:** Answers include `[1]`, `[2]` markers linked to specific sources

## Files Modified

| File | Change |
|------|--------|
| `apps/web/src/app/hackathon/page.tsx` | **Rewritten** — Event landing page with hero, stats, search bar, industry filters, and featured exhibitor cards. Server component wrapping `HackathonLandingClient`. |
| `apps/web/src/app/hackathon/landing-client.tsx` | **New** — Client component for interactive search, filter, and featured exhibitor display on the event landing page. |
| `apps/web/src/app/hackathon/expo/page.tsx` | **Updated** — Removed per-exhibitor QR image generation and passing. Added event entrance QR code display. Updated navigation header. |
| `apps/web/src/app/showcase/showcase-client.tsx` | **Updated** — Removed `boothQrImage` type field, "Show QR" button, and QR code dialog from exhibitor cards. Kept "Open Booth" and "Products" buttons. Enhanced card hover animations. |
| `packages/database/seed/event-qr.ts` | **New** — Standalone script to generate the single event entrance QR code pointing to `/hackathon`. |
| `demo/qr/event-entrance.png` | **New** — Generated QR code image (640x640, encodes `http://localhost:3000/hackathon`) |
| `HACKATHON_ENRICHMENT_REPORT.md` | **New** — This report. |

## Attendee Experience Summary

- **Browse:** Full exhibitor grid with beautiful gradient cards
- **Search:** Real-time filtering by company name, industry, or tagline
- **Filter:** Industry category pills with multi-select + clear
- **Open Booth:** Navigate to per-booth experience with AI assistant
- **Products:** Inline product list dialog per exhibitor
- **AI Questions:** RAG-based Q&A grounded in factual seeded knowledge
- **Lead Submit:** Multi-step email → profile → lead form → success with recommendations
- **Design:** Premium event application with large hero, excellent spacing, premium typography, responsive layout

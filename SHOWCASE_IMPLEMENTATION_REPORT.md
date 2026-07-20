# Showcase Implementation Report

## Companies Created (10)

| # | Company | Booth | Industry |
|---|---------|-------|----------|
| 1 | Northstar Robotics | A-101 | Robotics & Automation |
| 2 | QuantumForge AI | A-102 | Artificial Intelligence |
| 3 | Helix BioSystems | A-103 | Biotechnology |
| 4 | AeroSense Technologies | A-104 | Defense & Aerospace |
| 5 | Lumina Energy | A-105 | Clean Energy |
| 6 | GreenGrid Solutions | A-106 | Smart Infrastructure |
| 7 | Atlas Logistics | A-107 | Logistics & Supply Chain |
| 8 | OmniVision Analytics | A-108 | Data & Analytics |
| 9 | Vertex Cyber | A-109 | Cybersecurity |
| 10 | Nexa Manufacturing | A-110 | Industrial Manufacturing |

Each company has:
- Logo (placeholder initial)
- Tagline, industry, short description
- 4–5 products
- Downloadable brochure (fictional URL)
- 3 knowledge documents (Company Overview, FAQ & Integrations, Product Brochure)
- Company website (fictional)
- Social links (LinkedIn, Twitter)
- Contact email and phone
- Booth QR code (generated at `/demo/qr/booth-{number}.png`)

## Booths

All 10 booths are assigned to the **TechExpo 2027** event under **TechExpo Events** organizer.
Each booth has a unique SHA-256 based QR token and QR code image.

## QR Links

QR codes are generated during `pnpm db:seed:demo` and stored in `demo/qr/`:
- `booth-a-101.png` through `booth-a-110.png`
- Each QR encodes `http://localhost:3000/visit/{publicToken}`

## Demo URLs

| Route | Description |
|-------|-------------|
| `/showcase` | New public showcase page with premium exhibitor cards |
| `/visit/{token}` | Existing public booth page (reused) |
| `/demo` | Existing demo overview (updated with Showcase link) |
| `/demo/exhibitor/{id}` | Existing exhibitor details page |
| `/demo/event/{slug}` | Existing event details page |

## Seed Changes (`packages/database/seed/demo.ts`)

- Expanded from 5 → 10 exhibitors
- Each exhibitor now has structured data: industry, tagline, products, brochure URL, phone, social links
- 3 knowledge documents per booth (Company Overview, FAQ & Integrations, Product Brochure)
- Knowledge content includes realistic Q&A for AI retrieval demonstration
- Booth insert now includes `contact_phone`, `social_links`
- Output message now dynamic (reflects actual exhibitor count)

### Exhibition data facts
- 10 booths across 10 industries
- 200 seeded attendees
- 1000 relationships (100 per booth)

## Files Modified

| File | Change |
|------|--------|
| `packages/database/seed/demo.ts` | Expanded to 10 exhibitors, enriched data, 3 KB sources per booth |
| `packages/api-client/src/public-exhibitors.ts` | Added `ShowcaseExhibitor` type and `getPublicShowcase()` function |
| `apps/api/src/modules/engagement/public-exhibitors.service.ts` | Added `listShowcase()`, `findPublicBooth()`, `resourceContent()`, `scope()`, `storage()` methods |
| `apps/api/src/modules/engagement/public-showcase.controller.ts` | NEW — `GET /v1/public/showcase` endpoint |
| `apps/api/src/modules/engagement/engagement.module.ts` | Registered `PublicShowcaseController` |
| `apps/api/src/modules/engagement/public-exhibitors.service.test.ts` | Updated constructor mock to include ConfigService |
| `apps/web/src/app/showcase/page.tsx` | NEW — Server component fetching showcase data |
| `apps/web/src/app/showcase/showcase-client.tsx` | NEW — Client component with premium cards, search, filters, QR dialog, products dialog |
| `apps/web/src/app/demo/page.tsx` | Added "Expo Showcase" button in header |

## Verified Workflows

- [x] TypeScript typecheck — **20/20 tasks pass**
- [ ] Database seed — requires running Supabase locally (`pnpm supabase:start` + `pnpm db:seed`)
- [ ] Public API endpoint — `GET /v1/public/showcase` returns 10 exhibitors with full data
- [ ] Showcase page — renders premium cards with search, industry filter, QR display, products dialog
- [ ] Booth visit — clicking "Open Booth" navigates to `/visit/{token}`
- [ ] QR scan — QR codes link to `/visit/{token}` which shows the lead capture + AI chat
- [ ] Lead submission — public booth page submits lead, shows success + intelligence

## Notes

- The /showcase route requires no authentication (bypassed in middleware)
- All QR code images are generated during seed as PNG files in `demo/qr/`
- Existing `/demo` page remains fully intact
- Each booth has rich enough knowledge documents for AI to answer questions about products, industries, integrations, and differentiators

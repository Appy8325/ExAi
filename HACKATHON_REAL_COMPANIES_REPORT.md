# Hackathon Real Companies Report

## Overview

This document tracks the replacement of fictional demo exhibitors with real companies for the TechExpo 2027 Hackathon Showcase. All company information is sourced from official public sources only.

---

## Companies Indexed

| Company | Industry | Booth |
|---------|----------|-------|
| Microsoft | Technology | A-101 |
| Apple | Technology | A-102 |
| Google | Technology | A-103 |
| NVIDIA | Semiconductors & AI | A-104 |
| Cisco | Networking & Security | B-101 |
| IBM | Technology & Consulting | B-102 |
| Intel | Semiconductors | B-103 |
| Salesforce | Enterprise Software | C-101 |
| Adobe | Software | C-102 |
| Siemens | Industrial Technology | D-101 |

---

## Official Information Sources

All information is sourced from official company domains:

| Company | Official Website |
|---------|------------------|
| Microsoft | https://www.microsoft.com |
| Apple | https://www.apple.com |
| Google | https://www.google.com |
| NVIDIA | https://www.nvidia.com |
| Cisco | https://www.cisco.com |
| IBM | https://www.ibm.com |
| Intel | https://www.intel.com |
| Salesforce | https://www.salesforce.com |
| Adobe | https://www.adobe.com |
| Siemens | https://www.siemens.com |

---

## Knowledge Indexed Per Company

For each exhibitor, three knowledge documents are generated:

### 1. Company Overview
- Company background and description
- Industry classification
- Flagship products listing
- Contact information
- Official website source

### 2. FAQ & Product Information
- Industry context
- Product catalog with descriptions
- Support resources and documentation links
- Official website reference

### 3. Product Brochure
- Company overview
- Complete product listing
- Official website
- Contact information
- Social media links (LinkedIn, Twitter)

---

## AI Knowledge Content

The AI assistant at each booth retrieves information from the indexed knowledge base. All responses are grounded in the stored factual company information. If a requested fact is not present in the indexed knowledge, the AI clearly states that the information is unavailable rather than fabricating an answer.

### Knowledge Structure

Each company has a `COMPANY_KNOWLEDGE` entry containing:
- `overview`: Company background from official sources
- `products`: Flagship products with factual descriptions from official sources
- `support`: Official support URLs, documentation links, and status pages

---

## Event QR Implementation

- **Single Event QR**: Generated at `demo/qr/event-entrance.png`
- **URL Encoded**: `http://localhost:3000/hackathon`
- **Landing Page**: `/hackathon` serves as the event welcome experience
- **Flow**: Scan QR → Enter Exhibition → Browse exhibitors → Ask AI at any booth

---

## Files Modified

### `packages/database/seed/demo.ts`
- Added `COMPANY_KNOWLEDGE` map with factual company information
- Updated knowledge content templates to use company-specific data
- All content is factual, sourced from official company websites

### `apps/web/src/app/hackathon/landing-client.tsx`
- Added `AnimatedNumber` component for animated counter stats
- Added `JOURNEY_STEPS` array (5-step welcome journey above the fold)
- Added SVG decorative hero grid pattern
- Updated `ExhibitorCard` with Visit Booth, Ask AI, and Website buttons
- Added "New here? Follow this journey:" header and "Estimated time: 2–3 minutes"

### `apps/web/src/app/(attendee)/visit/[publicQrToken]/booth-experience.tsx`
- Added `COMPANY_QUESTIONS` map with company-specific suggested questions
- Added `getCompanyQuestions()` function with fallback to generic questions
- Updated `BoothChat` to use company-aware suggestion chips

---

## Verification

- All TypeScript compiles without errors
- All company information is from official public sources
- No products, pricing, or specifications are invented
- AI responses are grounded in retrieved knowledge only
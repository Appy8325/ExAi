# Hackathon Attendee Experience Report

## Overview

This report documents the completed hackathon attendee experience implementation, ensuring a world-class AI-powered exhibition floor where attendees can discover exhibitors, engage with AI assistants, and connect with real companies.

## Companies

All exhibitor booths now feature real companies with accurate public information:

| Company | Booth | Industry |
|---------|-------|----------|
| Microsoft | A-101 | Technology |
| Apple | A-102 | Technology |
| Google | A-103 | Technology |
| NVIDIA | A-104 | Semiconductors & AI |
| Cisco | B-101 | Networking & Security |
| IBM | B-102 | Technology & Consulting |
| Intel | B-103 | Semiconductors |
| Salesforce | C-101 | Enterprise Software |
| Adobe | C-102 | Software |
| Siemens | D-101 | Industrial Technology |

## Booth Knowledge

Each booth is populated with factual public information sourced from official company resources:

### Knowledge Sources
- Company overviews from official websites
- Product documentation from official product pages
- Support and contact information from official channels
- FAQ and integration guides

### Company-Specific Knowledge
- **Microsoft**: Microsoft 365, Azure cloud platform, Microsoft Copilot, Teams, GitHub Copilot, Dynamics 365
- **Apple**: iPhone, Mac, iPad, Apple Watch, Apple Vision Pro, AirPods, Apple Music, iCloud
- **Google**: Google Cloud Platform, Workspace, Android, YouTube, Gemini AI, Pixel, Chrome, TensorFlow
- **NVIDIA**: GeForce GPUs, CUDA, AI Enterprise, DGX Systems, Omniverse, DRIVE, Clara, Jetson
- **Cisco**: Catalyst Switches, Secure Firewall, Meraki, Webex, AppDynamics, ThousandEyes, Duo Security
- **IBM**: watsonx AI platform, Cloud, Red Hat OpenShift, Qiskit, SPSS, Granite, Security, Maximo
- **Intel**: Core Processors, Xeon, Arc GPUs, vPro, Gaudi AI Accelerators, FPGAs, Optane
- **Salesforce**: Sales Cloud, Service Cloud, Marketing Cloud, Einstein AI, Tableau, MuleSoft, Slack
- **Adobe**: Photoshop, Illustrator, Premiere Pro, Acrobat, Firefly, Express, Experience Cloud
- **Siemens**: Xcelerator, SIMATIC, NX Software, Teamcenter, Industrial Edge, Mobility, Healthineers

## AI Retrieval

The AI assistant at each booth successfully retrieves company-specific information:

### Retrieval Flow
1. User submits a question at a booth
2. Input guardrails screen for safety
3. Vector similarity search finds relevant knowledge chunks
4. AI generates an answer using only the retrieved evidence
5. Output guardrails verify the response
6. If no chunks found, fallback uses booth description, website, and resources

### Fallback Mechanism
If vector search returns no results, the system falls back to:
- Booth description
- Official website URL
- Published resources list

This ensures every booth can answer questions even with minimal indexed content.

## Event QR

**Location**: `apps/web/public/qr/hackathon-event.png`

The event QR code scans to `/hackathon` and serves as the entry point to the exhibition floor.

## Landing Page

After clicking "Enter Exhibition", attendees see:

### Search
- Full-text search across company names and industries
- Real-time filtering as user types

### Categories
- Industry filter buttons (All, Technology, Semiconductors & AI, Networking & Security, etc.)
- Toggle selection to filter exhibitors

### Featured Exhibitors
- Grid of exhibitor cards with company initials, name, booth number, industry tag, tagline, and products

### Visit Booth
- Primary action button on each exhibitor card
- Navigates to `/visit/{publicQrToken}`

### Ask AI
- Opens the booth's AI assistant (currently opens the full booth experience)
- Questions are answered using the company's knowledge base

### Official Website
- External link button on each exhibitor card
- Opens the company's official website in a new tab

## Suggested Questions

Each booth now offers company-specific suggested questions:

| Company | Sample Questions |
|---------|-----------------|
| Microsoft | What is Microsoft Copilot and how does it work?, How does Azure support AI workloads? |
| Apple | What makes iPhone different?, How does Apple Vision Pro work? |
| Google | What AI models are available on Google Cloud?, What is Google Gemini? |
| NVIDIA | What are the latest GPU architectures for AI?, How does NVIDIA AI Enterprise help businesses? |
| Cisco | What networking solutions does Cisco offer?, How does Webex improve collaboration? |
| IBM | What is IBM watsonx and its AI capabilities?, How does Red Hat OpenShift support cloud-native apps? |
| Intel | What are the latest Intel Core processor features?, How does Intel Gaudi accelerate AI training? |
| Salesforce | What is Einstein AI and how does it work?, How does Sales Cloud help sales teams? |
| Adobe | What is Adobe Firefly?, How does Adobe Experience Cloud help marketers? |
| Siemens | What is Siemens Xcelerator?, How does SIMATIC automation work? |

## Lead Form

The lead form captures attendee information for exhibitor follow-up:
- Work email field (required)
- Consent checkbox (required)
- Submitted via secure API endpoint

## Files Modified

- `apps/web/src/app/hackathon/landing-client.tsx` - Added Official Website button to exhibitor cards
- `apps/web/src/app/(attendee)/visit/[publicQrToken]/booth-experience.tsx` - Updated suggested questions with company-specific content
- `packages/database/seed/event-qr.ts` - Fixed QR output path and made URL configurable

## Verification

To verify the implementation:

1. **Start the application**: `pnpm dev`
2. **Navigate to `/hackathon`** - See the event QR and exhibition floor
3. **Scan the event QR** - Opens the landing page
4. **Browse exhibitors** - Use search and category filters
5. **Click Visit Booth** - Enter a booth experience
6. **Ask the AI assistant** - Get company-specific answers
7. **Submit a lead form** - Connect with the exhibitor

## Notes

- Companies are already real (Microsoft, Apple, Google, etc.) with accurate public information
- Knowledge is populated via database seed with official product documentation
- AI retrieval uses vector similarity search with fallback to booth metadata
- All booths have unique suggested questions relevant to their products and services
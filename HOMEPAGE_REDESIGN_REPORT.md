# Homepage Redesign Report

## Overview

Complete rewrite of the public landing page (`apps/web/src/app/(marketing)/page.tsx`) to improve storytelling, remove low-value metrics, and communicate ExAi's value proposition in under 30 seconds.

## What Changed

### Removed (4 sections)

| Section | Reason |
|---|---|
| **SocialProofBand** (5,000+ metrics band) | Inflated metrics reduce credibility; no meaningful product value |
| **StatsSection** (5,000+ Attendees, 500+ Relationships, etc.) | Same as above — repetitive social proof |
| **AISection** ("Intelligence that compounds") | Content merged into Platform Capabilities; dedicated section was redundant |
| **Dashboard mock cards** (Dashboard, Relationships, AI Insights, Pipeline) | Empty cards with no content; added visual noise without communicating value |

### New Structure (5 sections)

```
Hero
↓
How ExAi Works
↓
One Platform, Three Roles
↓
Platform Capabilities
↓
Call To Action
```

### Section Details

**Hero**
- Retained: tagline, subtitle, CTA buttons, gradient background
- Removed: 4 empty mock dashboard cards
- Added: abstract 4-node flow illustration showing QR → AI → Lead → Dashboard

**How ExAi Works** (new)
- Horizontal journey with 4 connected steps
- Each step: custom SVG icon, short title, one-sentence description
- Dashed connector line with arrow between steps on desktop
- Responsive: stacks vertically on mobile, horizontal on `md+`
- Fade-in on scroll with staggered delays

**One Platform, Three Roles** (moved up)
- Moved from near-bottom to directly below How ExAi Works
- Added custom SVG icons for each role (Organizer, Exhibitor, Attendee)
- Colored icon backgrounds instead of bare colored bars
- Card hover lift effect (200ms)

**Platform Capabilities** (consolidated)
- Merged old FeaturesSection + AISection into 4 focused capabilities
- Horizontal card layout (icon + text side by side)
- Hover lift effect (200ms)
- Two-column grid on desktop, stacks on mobile

**Call To Action**
- Unchanged from original, retains both CTA buttons

### Custom SVG Icons (12 total)

All custom-designed, consistent visual language:
- 32×32 viewBox, 1.5px stroke, rounded linecaps and joins
- Uses `currentColor` for theme compatibility
- No emojis, no stock illustrations

| Icon | Used In |
|---|---|
| ScanQrIcon | How ExAi Works step 1, HeroVisual |
| AiUnderstandIcon | How ExAi Works step 2 |
| LeadIntelIcon | How ExAi Works step 3 |
| DashboardIcon | How ExAi Works step 4 |
| OrganizerIcon | One Platform card |
| ExhibitorIcon | One Platform card |
| AttendeeIcon | One Platform card |
| QrFeatureIcon | Platform Capabilities card |
| AiFeatureIcon | Platform Capabilities card |
| EnrichmentIcon | Platform Capabilities card |
| MemoryFeatureIcon | Platform Capabilities card |
| ChevronRight | CTA links throughout |

### Animations

| Effect | Timing | Implementation |
|---|---|---|
| Fade-in on scroll | 700ms ease-out | IntersectionObserver + CSS transition |
| Card hover lift | 200ms ease | `card-hover` class (translateY(-2px) + shadow) |
| Button press | 100ms | `btn-press` class (scale(0.97)) |
| Pulse badge dot | continuous | `animate-pulse` |

### Responsive Behavior

| Breakpoint | Layout |
|---|---|
| Mobile (< 768px) | All sections stack vertically; How ExAi steps in column with gap |
| Tablet (768px+) | 2-column capabilities; horizontal flow starts |
| Desktop (1024px+) | 3-column personas; full horizontal flow with connector arrows |

### File Size

- Old: 397 lines, 8 sections
- New: ~560 lines, 5 sections, 12 custom SVG icon components
- Removed ~200 lines of repetitive sections, replaced with focused content

## Verification

- TypeScript compiles clean (no errors in this file)
- Pre-existing errors in `demo/organizer/event/[slug]/page.tsx:58` are unrelated
- Uses existing design system tokens (`bg-surface`, `text-secondary`, `border-default`, etc.)
- Uses existing CSS utilities (`card-hover`, `btn-press`)
- Respects `prefers-reduced-motion` via global CSS

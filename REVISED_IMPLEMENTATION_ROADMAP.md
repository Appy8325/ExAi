# Revised Implementation Roadmap — ExAi

**Date:** July 22, 2026
**Status:** Proposed (replacing IMPLEMENTATION_ROADMAP.md)
**Philosophy:** Ship user-visible improvements every 2 weeks. Parallel workstreams. Learn from real usage.

---

## Why This Changes

The original 12-week sequential roadmap assumes:
- We know everything upfront (we don't)
- Users can wait 6 weeks for visible change (they can't)
- Foundation must precede everything (it doesn't — quick wins coexist with foundations)

This revision prioritizes by **user impact**, not implementation order. Every sprint delivers something a user can see and react to.

---

## Structural Changes

### Waterfall → Parallel Tracks

```
Sprint     Quick Wins Track          Deep Work Track          Platform Track
──────────────────────────────────────────────────────────────────────────────
Sprint 1   Fix dead links           Design system tokens      ESLint rules
           Exhibitor dashboard v1   Dark mode design          Token audit
           Active-state fix         
Sprint 2   Nav cleanup              Component migration       Accessibility fix
           Breadcrumb unification   Layout standardization    Performance audit
Sprint 3   Exhibitor dashboard v2   Organizer dashboard       Loading states
                                   AI failure states         Error boundaries
Sprint 4   Attendee experience      Analytics redesign        Empty state unification
                                   Onboarding design         Mobile responsive
Sprint 5   Polish + consistency     Motion system             Cross-page audit
Sprint 6   Production readiness     Performance optimization   Documentation
```

**Key change:** Quick Wins track ships user-visible improvement every sprint, starting in Sprint 1. Deep Work track builds the foundation in parallel. Platform track ensures quality.

---

## Sprint 1: Quick Wins (Weeks 1-2)

### Goal: Fix the most painful problems immediately. Establish credibility.

### Quick Wins Track

| Task | Effort | Impact | Details |
|------|--------|--------|---------|
| Fix dead nav links | 2h | Critical | Remove or redirect 6 dead links in sidebar + nav |
| Exhibitor Dashboard: reduce to 3 KPIs | 4h | Critical | Hide 4 of 7 KPI cards; keep headline metrics |
| Exhibitor Dashboard: fix today's focus | 4h | High | Surface primary metric, remove duplicates |
| Unified active-state indicator | 6h | High | Apply consistent style across all nav levels |
| Remove emoji from dashboards | 2h | Medium | Replace 🤖 with SVG icons |

**User-visible outcome:** Exhibitor Dashboard loads with 60% less visual noise. No more clicking dead nav links. Navigation feels coherent.

### Deep Work Track

| Task | Effort | Details |
|------|--------|---------|
| Design system token audit | 8h | Map existing tokens vs DESIGN_SYSTEM.md |
| Dark mode token design | 8h | Create dark variant for every semantic token |
| AI failure state design | 4h | Spec loading/error/low-confidence states |
| Voice & tone guide | 4h | Define ExAi's language personality |

### Platform Track

| Task | Effort | Details |
|------|--------|---------|
| ESLint rules for design tokens | 6h | Prevent raw colors/spacing in PRs |
| Accessibility quick-fix pass | 6h | Focus states, ARIA labels on nav |

### Sprint 1 Definition of Done
- [ ] Zero dead navigation links
- [ ] Exhibitor dashboard shows max 4 KPIs
- [ ] Active states consistent across all nav levels
- [ ] ESLint rules prevent new token violations
- [ ] Dark mode tokens designed (not implemented)
- [ ] AI failure states specced

---

## Sprint 2: Navigation & Layout (Weeks 3-4)

### Goal: Unified navigation. Consistent layouts. Visible progress.

### Quick Wins Track

| Task | Effort | Impact | Details |
|------|--------|--------|---------|
| Breadcrumb consolidation | 8h | High | Single breadcrumb component everywhere |
| Remove sidebar "Quick Actions" duplicate | 4h | High | Actions were duplicating sidebar links |
| PageHeader standardization | 8h | High | Replace inline headers with PageHeader |
| Fix silent auth failures | 4h | Critical | Show toast on auth errors (save, connect) |
| BackLink component | 6h | Medium | Consistent back navigation everywhere |

**User-visible outcome:** Navigation feels unified. No more duplicate breadcrumb+sidebar+tab confusion. Auth errors are visible.

### Deep Work Track

| Task | Effort | Details |
|------|--------|---------|
| WorkspaceNav component | 16h | Build unified sidebar (replaces ConsoleNav + sidebar) |
| Dark mode CSS implementation | 12h | Add dark mode to design system CSS |
| Component migration: Buttons | 8h | Replace all raw buttons with Button component |
| Component migration: Cards | 8h | Replace all raw card divs with Card component |

### Platform Track

| Task | Effort | Details |
|------|--------|---------|
| Content width standardization | 6h | Audit and fix all pages |
| Responsive nav testing | 4h | Test all nav components on mobile/tablet |

### Sprint 2 Definition of Done
- [ ] One breadcrumb component used everywhere
- [ ] All page headers use PageHeader
- [ ] BackLink replaces all inline back patterns
- [ ] WorkspaceNav component built (applied in Sprint 3)
- [ ] Dark mode CSS ready (not deployed)
- [ ] Auth errors visible to users

---

## Sprint 3: Exhibitor & Organizer Dashboards (Weeks 5-6)

### Goal: Transform the two highest-impact dashboards.

### Quick Wins Track

| Task | Effort | Impact | Details |
|------|--------|--------|---------|
| Exhibitor Dashboard: pipeline focus | 12h | Critical | Implement DASHBOARD_REDESIGN hierarchy |
| Exhibitor Dashboard: AI hot list | 8h | High | AI-scored lead recommendations |
| Organizer Dashboard: headline metric | 8h | Critical | Single prominent metric, remove overload |
| Organizer Dashboard: event health | 6h | High | Status indicator for all events |
| Fix scoring fragmentation | 8h | High | Unify computeScore functions |

**User-visible outcome:** Both dashboards follow the 5-second rule. Clear priority. AI insights integrated.

### Deep Work Track

| Task | Effort | Details |
|------|--------|---------|
| AISummaryCard component | 4h | Build with proper loading/error states |
| CollapsibleSection component | 4h | For progressive disclosure |
| MetricCard emphasis variant | 4h | Primary (headline) vs secondary |
| Organizer: event status banner | 6h | Live/upcoming/past + controls |
| Onboarding flow design | 8h | First-run experience for each role |

### Platform Track

| Task | Effort | Details |
|------|--------|---------|
| Empty state unification | 6h | Replace all inline empty states |
| Loading skeleton audit | 6h | Ensure skeleton everywhere, not spinner |
| WorkspaceNav deployment | 8h | Replace sidebar on all workspace pages |

### Sprint 3 Definition of Done
- [ ] Exhibitor dashboard: pipeline first, AI hot list, 4 KPIs max
- [ ] Organizer dashboard: headline metric, event health, AI summary
- [ ] Scoring is unified across views
- [ ] Progressive disclosure works (collapsed sections)
- [ ] Onboarding flows designed (not implemented)

---

## Sprint 4: Attendee & AI (Weeks 7-8)

### Goal: Fix the attendee experience. Make AI feel integrated, not bolted on.

### Quick Wins Track

| Task | Effort | Impact | Details |
|------|--------|--------|---------|
| Attendee: AI recommendations | 8h | High | Surface recommendations prominently |
| Attendee: exhibitor grid | 6h | High | Simplify to search + filter + grid |
| Attendee: fix empty states | 4h | Medium | Replace blank screens with EmptyState |
| Attendee: navigation shells | 8h | High | Unify 3 different nav shells |
| Fix gradient color maps | 4h | Medium | Single source of truth for industry colors |

**User-visible outcome:** Attendee experience feels like one product. AI helps discovery. No more jarring nav transitions.

### Deep Work Track

| Task | Effort | Details |
|------|--------|---------|
| AI insight integration (not separate cards) | 12h | Weave AI into data sections, not branded cards |
| AI loading/error states deployment | 4h | Implement all AI states |
| Analytics page redesign | 16h | Event comparison, trends, AI insights |
| Mobile: bottom tab navigation | 8h | Implement for attendee experience |

### Platform Track

| Task | Effort | Details |
|------|--------|---------|
| Form component unification | 8h | Field + Input everywhere |
| Badge/StatusBadge audit | 4h | Replace inline badges |
| Search unification | 4h | Single search component |
| Dead pages: remove or implement | 4h | Fix remaining placeholder pages |

### Sprint 4 Definition of Done
- [ ] Attendee experience has unified navigation
- [ ] AI recommendations visible on attendee home
- [ ] AI insights woven into data sections (not separate cards)
- [ ] Analytics page redesigned
- [ ] All forms use Field + Input
- [ ] All empty states use EmptyState component

---

## Sprint 5: Motion, Responsive & Consistency (Weeks 9-10)

### Goal: Make the product feel polished and premium.

### Quick Wins Track

| Task | Effort | Impact | Details |
|------|--------|--------|---------|
| Motion audit & fix | 8h | Medium | Consistent duration/easing, no decorative anims |
| Focus states audit | 6h | High | Every interactive element has focus ring |
| Keyboard navigation | 6h | High | Tab order, shortcut consistency |
| Micro-interactions: button press, card hover | 6h | Medium | Scale, shadow transitions |

**User-visible outcome:** Interactions feel responsive and intentional. Keyboard users can navigate efficiently.

### Deep Work Track

| Task | Effort | Details |
|------|--------|---------|
| Mobile responsive pass | 12h | Test and fix all pages at all breakpoints |
| Dark mode deployment | 8h | Ship dark mode with system preference |
| Remaining component migration | 12h | Select, Textarea, Dialog, Drawer audit |
| Voice & tone implementation | 4h | Update error messages, empty states, labels |

### Platform Track

| Task | Effort | Details |
|------|--------|---------|
| Cross-page consistency audit | 8h | Review every page against DESIGN_SYSTEM.md |
| ESLint rule expansion | 4h | Add more anti-pattern checks |
| Accessibility checker run | 4h | Automated + manual screen reader test |

### Sprint 5 Definition of Done
- [ ] Motion is consistent and purposeful
- [ ] Every interactive element has focus state
- [ ] Keyboard navigation works throughout
- [ ] Dark mode deployed
- [ ] All pages work on mobile
- [ ] No design system violations in audited pages

---

## Sprint 6: Production Quality (Weeks 11-12)

### Goal: Performance, error handling, launch readiness.

### Quick Wins Track

| Task | Effort | Impact | Details |
|------|--------|--------|---------|
| Bundle optimization | 8h | High | Code splitting, lazy loading |
| Image optimization | 4h | Medium | Next.js Image component, lazy loading |
| Error boundary implementation | 6h | High | Global + route-level error boundaries |
| Error message improvement | 4h | Medium | Actionable guidance in every error |

**User-visible outcome:** Faster loads. No white screens. Clear error messages.

### Deep Work Track

| Task | Effort | Details |
|------|--------|---------|
| Performance audit & fix | 12h | Lighthouse, Core Web Vitals, bundle analysis |
| SEO metadata | 4h | Page titles, meta descriptions, OG images |
| Sentry/error tracking | 4h | Setup and integration |
| Font loading optimization | 2h | font-display, preload |

### Platform Track

| Task | Effort | Details |
|------|--------|---------|
| Documentation update | 8h | Keyboard shortcuts, design system, README |
| Component Storybook | optional | If team uses Storybook |
| Final consistency pass | 8h | Last pass before launch |

### Sprint 6 Definition of Done
- [ ] Lighthouse score ≥90
- [ ] Zero console errors in production
- [ ] Error boundaries on all route groups
- [ ] Performance budget established
- [ ] Documentation updated
- [ ] Production deploy ready

---

## Quick Wins Summary (Visible by Week 2)

| Improvement | Expected Impact | Effort |
|-------------|-----------------|--------|
| Fix dead nav links | Eliminates 404 confusion immediately | 2h |
| Reduce exhibitor KPIs from 7 to 3 | 60% less cognitive load | 4h |
| Unified active-state indicator | Navigation feels coherent | 6h |
| Fix silent auth failures | Users know when actions fail | 4h |
| Remove emoji from dashboards | Professional appearance | 2h |

**Total Sprint 1 effort:** ~18-20 engineering hours for dramatic visible improvement.

---

## Risk & Mitigation

| Risk | Mitigation |
|------|------------|
| New nav layout confuses existing users | Ship alongside old layout initially; user toggle |
| Dashboard reduction hides useful data | Progressive disclosure: collapsed but accessible |
| Dark mode introduces visual bugs | Feature flag; opt-in beta first |
| Component migration breaks existing pages | Per-component testing; visual regression |
| Performance regression from new components | Lighthouse CI in pipeline |

---

## How This Differs From Original Roadmap

| Aspect | Original | Revised |
|--------|----------|---------|
| Duration | 12 weeks sequential | 6 sprints × 2 weeks, parallel tracks |
| First user impact | Week 6-8 (Phase 5) | Week 1 (Sprint 1) |
| User testing | None specified | Implicit: ship → observe → iterate |
| AI integration | Phase 5 (week 6-8) | Sprint 3-4 (weeks 5-8) |
| Mobile | Phase 6 (week 8-9) | Sprint 4-5 (weeks 7-10) |
| Dark mode | Not mentioned | Sprint 2-5 |
| Onboarding | Not mentioned | Sprint 3 (design), Sprint 5 (impl) |
| AI failure states | Not mentioned | Sprint 1 (design), Sprint 4 (impl) |
| ESLint enforcement | Phase 1 | Sprint 1 |
| Verification | Manual checklist per phase | Automated (ESLint, Lighthouse, CI) |
| Parallelism | Sequential | 3 tracks always active |

---

## Verification Cadence

**Daily:**
- ESLint passes (token enforcement)

**Weekly:**
- Sprint demo (show working software)
- User impact checkpoint (are we making things better?)

**Per Sprint:**
- Lighthouse score check (target: ≥85, growing to ≥90)
- Accessibility spot-check
- No regression on previously fixed issues

**Per Deploy:**
- Visual regression test on key pages
- Zero console errors
- All nav links verified

---

## Appendix: Track Ownership

| Track | Owner | Focus |
|-------|-------|-------|
| Quick Wins | Designer + FE Dev | User-visible improvements every sprint |
| Deep Work | Senior FE Dev | Foundations, components, architecture |
| Platform | DevOps + QA | Quality, automation, infrastructure |

Tracks run in parallel. Quick Wins is the default priority — if conflict, Quick Wins ships first. Deep Work fills remaining capacity. Platform is ongoing.

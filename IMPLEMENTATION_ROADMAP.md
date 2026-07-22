# Implementation Roadmap — ExAi

**Date:** July 22, 2026
**Status:** Proposed

---

## Overview

This roadmap defines the phased implementation of the redesign. Each phase is independent and deliverable. The goal is to improve the product incrementally without breaking existing functionality.

---

## Phase 1: Foundation (Week 1-2)

### Goal: Establish the infrastructure for consistent design

### Tasks

#### 1.1 Design System Documentation
- [x] Create DESIGN_SYSTEM.md
- [x] Document all semantic tokens
- [x] Document type scale and spacing scale
- [ ] Audit all existing CSS variables against DESIGN_SYSTEM.md
- [ ] Identify gaps in current implementation

#### 1.2 Token Enforcement
- [ ] Create ESLint rules to prevent raw color/spacing values
- [ ] Add `允许no-restricted-syntax` for anti-patterns
- [ ] Create design system Storybook (optional but recommended)

#### 1.3 Component Audit
- [ ] Audit all components against COMPONENT_INVENTORY.md
- [ ] Identify components that need updating
- [ ] Create unified imports (single source of truth for @concourse/ui)

**Deliverables:**
- ESLint rules enforcing design system usage
- Audit report of components needing updates

**Verification:**
- `pnpm lint` passes with new rules
- All components use design system

---

## Phase 2: Navigation (Week 2-3)

### Goal: Implement unified navigation architecture

### Tasks

#### 2.1 GlobalNav Refinement
- [ ] Review GlobalNav against NAVIGATION_ARCHITECTURE.md
- [ ] Consolidate variants (marketing/authenticated/compact)
- [ ] Implement consistent active-state indicator
- [ ] Add tooltips to perspective names

#### 2.2 WorkspaceNav Implementation
- [ ] Create new `WorkspaceNav` component (replace `ConsoleNav` + sidebar)
- [ ] Implement responsive behavior (collapsed/expanded/drawer)
- [ ] Update all workspace layouts to use WorkspaceNav
- [ ] Fix dead navigation links

#### 2.3 Breadcrumb Consolidation
- [ ] Ensure UnifiedBreadcrumbs is used everywhere
- [ ] Standardize format: `Perspective > Section > Page`
- [ ] Remove inline breadcrumb implementations

#### 2.4 PageTabs Component
- [ ] Create new PageTabs component
- [ ] Replace all horizontal tab navigations (EventNav, etc.)
- [ ] Implement consistent active-state indicator

#### 2.5 BackLink Component
- [ ] Create new BackLink component
- [ ] Replace all inline back navigation implementations
- [ ] Ensure consistent behavior

**Deliverables:**
- Unified navigation components
- All navigation links pointing to existing pages
- Consistent active-state indicator across all levels

**Verification:**
- No page has more than one "where am I" indicator
- All links point to working pages
- Active states use single consistent style

---

## Phase 3: Layout (Week 3-4)

### Goal: Establish consistent page layouts

### Tasks

#### 3.1 Content Width Standardization
- [ ] Audit all pages for content width
- [ ] Standardize on `max-w-(--mq-content-max)` for most pages
- [ ] Standardize on `max-w-(--mq-content-max-narrow)` for forms
- [ ] Remove arbitrary max-width values

#### 3.2 PageHeader Usage
- [ ] Audit all page headers
- [ ] Replace inline styled headers with PageHeader component
- [ ] Ensure consistent structure (title, description, action)

#### 3.3 Section Structure
- [ ] Define standard page structure templates
- [ ] Ensure spacing between sections follows scale
- [ ] Implement consistent footer behavior

**Deliverables:**
- All pages using consistent content width
- All pages using PageHeader component
- Consistent section spacing

**Verification:**
- Pages render without layout shifts
- Consistent visual rhythm across all pages

---

## Phase 4: Components (Week 4-6)

### Goal: Unify all UI components

### Tasks

#### 4.1 Button Unification
- [ ] Audit all buttons
- [ ] Replace all with Button component
- [ ] Enforce one primary button per section
- [ ] Remove duplicate action buttons

#### 4.2 Card Unification
- [ ] Audit all card implementations
- [ ] Replace with Card component
- [ ] Remove direct border/shadow styling

#### 4.3 Form Component Unification
- [ ] Audit all form implementations
- [ ] Replace with Field + Input components
- [ ] Remove raw `<input>`, `<select>`, `<textarea>`
- [ ] Fix native color picker

#### 4.4 Badge/Badges Unification
- [ ] Audit all badge implementations
- [ ] Replace with Badge or StatusBadge
- [ ] Fix status color inconsistencies

#### 4.5 Empty State Unification
- [ ] Audit all empty states
- [ ] Replace with EmptyState component
- [ ] Ensure all have action if applicable

#### 4.6 Loading State Unification
- [ ] Audit all loading states
- [ ] Implement Skeleton consistently
- [ ] Remove inline loading implementations
- [ ] Create loading.tsx files where missing

**Deliverables:**
- All pages using design system components
- No anti-patterns remaining
- Consistent component styling

**Verification:**
- All pages use Button, Card, Field, EmptyState, Skeleton
- No raw HTML form elements remain
- Design system compliance 100%

---

## Phase 5: Dashboard Hierarchy (Week 6-8)

### Goal: Implement redesigned dashboard layouts

### Tasks

#### 5.1 Organizer Dashboard
- [ ] Implement new hierarchy per DASHBOARD_REDESIGN.md
- [ ] Create MetricCard with headline prominence
- [ ] Create AISummaryCard component
- [ ] Implement progressive disclosure for details
- [ ] Remove dashboard cognitive overload

#### 5.2 Exhibitor Dashboard
- [ ] Refocus on pipeline view
- [ ] Implement AI-led hot list
- [ ] Create visitor cards (not table)
- [ ] Simplify metrics to 4 visible at once

#### 5.3 Attendee Experience
- [ ] Implement AI recommendations prominently
- [ ] Simplify exhibitor grid
- [ ] Improve category filters
- [ ] Fix empty states

#### 5.4 Analytics Pages
- [ ] Implement trend visualization
- [ ] Create comparison views
- [ ] Improve data density without overload

**Deliverables:**
- All dashboards follow hierarchy: Metric → AI → Actions → Details
- No dashboard shows more than 4 KPIs without hierarchy
- Progressive disclosure implemented

**Verification:**
- 5-second test passes for each dashboard
- Clear primary action identifiable on each page
- Detailed data collapsed by default

---

## Phase 6: Motion & Polish (Week 8-9)

### Goal: Implement consistent motion and polish

### Tasks

#### 6.1 Animation Audit
- [ ] Audit all animations
- [ ] Remove decorative animations
- [ ] Implement purposeful animations only
- [ ] Ensure consistent duration/easing

#### 6.2 Focus States
- [ ] Audit focus states on all interactive elements
- [ ] Implement visible focus rings
- [ ] Test keyboard navigation

#### 6.3 Responsive Behavior
- [ ] Test all pages on mobile
- [ ] Fix sidebar behavior on tablet
- [ ] Ensure touch targets ≥44px

#### 6.4 Loading & Error States
- [ ] Audit all loading states
- [ ] Implement consistent skeleton patterns
- [ ] Improve error messages with actionable guidance
- [ ] Add offline handling (if applicable)

**Deliverables:**
- Consistent animation usage
- All interactive elements keyboard accessible
- Responsive design complete

**Verification:**
- No decorative animations
- Keyboard navigation works throughout
- Mobile experience complete

---

## Phase 7: Consistency Audit (Week 9-10)

### Goal: Find and fix remaining inconsistencies

### Tasks

#### 7.1 Cross-Page Audit
- [ ] Review every page against DESIGN_SYSTEM.md
- [ ] Check for missed anti-patterns
- [ ] Verify token usage throughout

#### 7.2 Navigation Audit
- [ ] Verify all links work
- [ ] Verify back navigation works
- [ ] Verify breadcrumb accuracy

#### 7.3 Component Audit
- [ ] Verify all instances of each component
- [ ] Check for prop inconsistencies
- [ ] Ensure variant usage is correct

#### 7.4 Accessibility Audit
- [ ] Run accessibility checker
- [ ] Fix contrast issues
- [ ] Test with screen reader
- [ ] Verify ARIA labels

**Deliverables:**
- Complete consistency audit report
- Fixed accessibility issues
- Design system compliance verified

**Verification:**
- Zero design system violations
- Accessibility score ≥90
- All pages consistent

---

## Phase 8: Production Quality (Week 10-12)

### Goal: Polish and prepare for launch

### Tasks

#### 8.1 Performance
- [ ] Optimize bundle size
- [ ] Implement code splitting
- [ ] Optimize images
- [ ] Test load times

#### 8.2 SEO & Metadata
- [ ] Audit page titles
- [ ] Ensure meta descriptions
- [ ] Implement OG images

#### 8.3 Error Handling
- [ ] Implement global error boundary
- [ ] Improve error messages
- [ ] Add error tracking (Sentry)

#### 8.4 Documentation
- [ ] Update README
- [ ] Document keyboard shortcuts
- [ ] Create onboarding guide

**Deliverables:**
- Performance optimized
- Error tracking implemented
- Documentation complete

**Verification:**
- Lighthouse score ≥90
- Zero console errors in production
- Documentation accurate

---

## Success Criteria

At the end of this roadmap:

- [ ] Every screen feels like the same product
- [ ] Navigation is intuitive and never duplicated
- [ ] Users always know where they are
- [ ] The interface is calm rather than busy
- [ ] AI feels integrated into workflows
- [ ] Components are reusable and consistent
- [ ] Design quality reflects the sophistication of the engineering
- [ ] No design system violations in codebase

---

## Parallel Tracks

### Track A: Design System Enforcement
**Owner:** ESLint + Code Review
- Automated checks prevent violations
- PR cannot merge with violations

### Track B: Component Migration
**Owner:** Developer
- Migrate component by component
- Each migration verified before moving on

### Track C: Page Redesign
**Owner:** Designer + Developer
- Redesign page by page
- Maintain functionality throughout

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Scope creep | Delayed delivery | Strict phase boundaries |
| Breaking existing features | User trust | Comprehensive testing per phase |
| Inconsistent implementation | Worse than before | ESLint enforcement |
| Performance regression | User experience | Measure before/after |

---

## Dependencies

- Phase 1 must complete before Phase 2
- Phase 2 must complete before Phase 3
- Phase 3-4 can run in parallel with Phase 5 (components vs pages)
- Phase 6 depends on Phase 4 (components ready)
- Phase 7 depends on all previous phases
- Phase 8 is final polish

---

## Timeline Summary

| Phase | Duration | Focus |
|-------|----------|-------|
| Phase 1 | Week 1-2 | Foundation |
| Phase 2 | Week 2-3 | Navigation |
| Phase 3 | Week 3-4 | Layout |
| Phase 4 | Week 4-6 | Components |
| Phase 5 | Week 6-8 | Dashboards |
| Phase 6 | Week 8-9 | Motion |
| Phase 7 | Week 9-10 | Consistency Audit |
| Phase 8 | Week 10-12 | Production Quality |

**Total:** ~12 weeks (3 months)
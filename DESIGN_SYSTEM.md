# ExAi RC3 Design System

## Purpose

ExAi is one calm, information-first SaaS product for organizers, exhibitors, attendees, and administrators. This system modernizes its presentation without changing product behavior, routing, permissions, authentication, APIs, or data contracts.

## Principles

1. **Decisions before decoration.** Put the current state, the most important metric, and the next action first.
2. **Whitespace is structure.** Use the spacing scale rather than extra dividers, color, or card chrome.
3. **Type creates hierarchy.** Weight, size, and placement distinguish information; color communicates meaning only.
4. **One action leads.** A screen has one visually dominant primary action. Supporting actions are secondary or ghost.
5. **Calm by default.** Use neutral surfaces, restrained elevation, short transitions, and status color only for status.
6. **Accessible by default.** Keyboard focus, semantic HTML, AA contrast, touch targets, and reduced motion are requirements.

## System architecture

Use the existing three-layer CSS model:

1. primitives (`packages/ui/src/styles/primitives.css`) define palette steps;
2. semantic tokens (`semantic.css`) express roles and theme variants;
3. foundation, density, and `theme.css` map those roles to component use.

Feature code consumes semantic tokens or their mapped utilities only. No new raw colors, arbitrary radii, or ad-hoc spacing values.

## Visual character

Inter is the UI face; JetBrains Mono is limited to identifiers, codes, and technical data. Slate is the neutral foundation, indigo is the product action color, and violet identifies AI-derived content only. Surfaces are mostly flat: borders establish grouping and elevation is reserved for overlays, menus, and genuinely interactive cards.

The signature is **quiet operational clarity**: precise typography, intentional density, and AI that is visibly attributable rather than decorative. It avoids both fashionable excess (gradients, glass, novelty motion) and generic enterprise heaviness (dense borders and competing status colors). This gives ExAi a durable identity across event operations without borrowing another product's visual language.

## Product-wide rules

- Use one persistent workspace navigation model and the same page-header composition throughout the app.
- Prefer a page canvas with grouped content over a grid of decorative cards.
- Use status labels with text; never rely on color, an icon, or a dot alone.
- Treat loading, empty, error, and disabled states as component states, not afterthoughts.
- Keep AI provenance explicit with the AI token family and plain-language copy.
- Validate all visual changes in light, dark, comfortable, compact, keyboard, reduced-motion, and narrow-screen contexts.

## Governance

The shared UI package owns primitives, semantic roles, density, and reusable foundations. App code composes those components. Any exception requires a documented product need, an accessible state model, and reuse consideration before adding a new primitive.

The design-system owner approves new tokens and component APIs; component owners maintain their accessibility and visual-contract checks. Deprecate variants with a documented replacement and removal release. A component is not “shared” until it has documented states, responsive behavior, and at least two consumers or a clear cross-product contract.

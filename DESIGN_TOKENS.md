# ExAi RC3 Design Tokens

All values below are implemented by the existing `--mq-*` token layers. Components must use semantic roles, never palette steps or raw values.

## Typography

| Role | Size / line height | Use |
|---|---:|---|
| display | 36 / 40 | rare hero or major dashboard value |
| title-lg | 24 / 32 | page title |
| title | 20 / 28 | section heading |
| title-sm | 16 / 24 | card heading, strong label |
| body-lg | 16 / 24 | lead copy |
| body | 14 / 20 | default UI copy |
| body-sm | 13 / 18 | dense UI copy |
| caption | 12 / 16 | metadata and helper text |

Use Inter at 400/500/600. Use tabular figures for metrics. JetBrains Mono is only for machine-readable values.

## Spacing and layout

Use the 8-point rhythm: 4, 8, 12, 16, 24, 32, 48, 64px. The 4px value is only for tight internal alignment. Default page gutters are responsive (16/24/32/40px); standard section spacing is 32px; the standard desktop grid is 12 columns with a 24px gap.

## Shape, elevation, and borders

| Token family | Values | Rule |
|---|---|---|
| radius | 0, 4, 6, 8, 12, 16, 24, full | controls use 6–8; cards 8; overlays 12 |
| elevation | shadow-0 to shadow-5 | default content is 0–1; overlays 4; avoid decorative shadow |
| border | default / strong | default groups; strong indicates interactive focus or selected context |
| icon | 16, 20, 24px | 16 inline, 20 controls, 24 navigation or empty states |

## Semantic colors

| Role | Light / dark intent | Use |
|---|---|---|
| canvas, surface, raised, sunken | theme-aware slate surfaces | page, grouped content, overlay, inset |
| primary, secondary, muted, disabled | theme-aware text | hierarchy, not decorative color |
| brand, brand-hover, brand-subtle | indigo | primary action and selected state |
| success, warning, danger, info | semantic families | explicit status only |
| AI | violet family | AI source/provenance only |
| viz-cat-1…8, viz-heat-1…6 | theme-aware data palette | charts; do not reuse as UI decoration |

Status needs text plus an icon or label. Contrast must meet WCAG AA; charts must add labels, tooltips, patterns, or direct values where color alone would carry meaning.

## Interaction

| State | Token / behavior |
|---|---|
| hover | background or border shift; never meaning-only color change |
| focus | 2px ring using `--mq-ring`, visible against every surface |
| pressed | subtle scale or surface response, 100ms |
| disabled | disabled text/opacity plus non-interactive cursor and semantics |
| motion | 100ms fast, 150ms base, 200ms moderate, 300ms slow |

Use the existing standard easing. Respect `prefers-reduced-motion`: no looping decorative animation, and instant/near-instant transitions.

## Density and layering

Comfortable is the default: 40px controls, 52px table rows, 20px card padding. Compact uses 32px controls, 40px rows, and 16px padding without shrinking type. Maintain the existing z-index order: sticky 10, dropdown 20, overlay 30, modal 40, toast 50, tooltip 60.

## Responsive, state, and content tokens

| Family | Values / contract |
|---|---|
| breakpoints | 480, 768, 1024, 1280, 1440px. Design mobile first; use breakpoints to change composition, not merely shrink desktop UI. |
| target size | 44px minimum for mobile/high-frequency touch controls; compact desktop controls may be 32px when an equivalent keyboard path exists. |
| focus | 2px ring plus 1px separation from the component edge; never replace focus with shadow alone. |
| opacity | disabled 50%; overlay is the semantic overlay token; do not invent opacity scales for status meaning. |
| truncation | one-line labels truncate with a tooltip only when the full value is otherwise unavailable; metric values never silently truncate. |
| iconography | one consistent outlined icon family; stroke, optical size, and semantic label are part of the component contract. |

## Token completeness rules

Token categories cover color, typography, spacing, layout, shape, border, elevation, icon size, motion, density, breakpoints, focus, opacity, and layering. New component needs must map to one of these categories; create a semantic role only when the need is cross-product and cannot be expressed through composition. Never encode a product, page, or state-machine decision in a visual token.

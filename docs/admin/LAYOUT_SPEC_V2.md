# Soloist OS — Layout Spec v2 (Draft / Sandbox)

This document is a **draft** created during a parallel v2 shell experiment.
It is **not authoritative** unless it matches `docs/admin/DESIGN_INTENT.md`.

Use it only as a sandbox reference until the planned design is captured and approved.

## Relationship to other docs

- **Design language / components / interaction rules**: `docs/DESIGN_SYSTEM.md` (authoritative)
- **Product intent**: `docs/PRD.md`
- **Legacy extraction (non-authoritative)**: `docs/admin/FIGMA_DESIGN_SPEC.md`

If measurements or patterns conflict, the resolution order is:
1) `DESIGN_SYSTEM.md`
2) This document (`LAYOUT_SPEC_V2.md`)
3) `PRD.md`
4) legacy docs

## Layout goals (the new requirements)

1. **Framework-first**: A stable shell that stays constant while modules swap in/out.
2. **Responsive and proportionate**: Use clamped widths/heights instead of fixed pixel “poster sizes”.
3. **No inline layout styles**: Layout is expressed through CSS utilities/classes so agents can’t accidentally drift.
4. **Token-driven visuals**: Colors, borders, shadows come from Tailwind semantic tokens.

## Canonical app shell

The UI is a 3×3 grid:

- Header row
- Middle row: Left rail / Main content / Right panel
- Footer row

### CSS implementation

Use the existing CSS utilities defined in `ui-src/src/index.css`:

- `.soloist-app-grid`
- `.soloist-app-grid--railExpanded`
- `.soloist-app-grid--railCollapsed`

> These utilities encode the “strong trunk” and should be the only way the shell layout is expressed.

## Regions and responsibilities

### Header

- Provides global navigation context + lightweight global controls.
- Must remain visually quiet (glass + subtle borders).

### Left rail

- Primary tool navigation.
- Collapsed state must be icon-only; expanded state may show labels.

### Main content

- Renders the active domain module.
- Must be scrollable via `.custom-scrollbar` when needed.

### Right panel

- Assistant/Inspector surface.
- May collapse fully to reclaim space.

### Footer

- Status / tasks / export / context.
- Must not fight the main module; treat as a “dock”.

## Sizing strategy (avoid obsolete fixed px)

- Prefer **clamp()**-based widths and heights.
- Favor relative sizing to viewport because Figma plugin viewports vary.

### Recommended rail/panel sizing

- Left rail collapsed: `clamp(72px, 7vw, 108px)`
- Left rail expanded: `clamp(240px, 18vw, 360px)`
- Right panel: `clamp(300px, 24vw, 360px)`

(These already exist in `.soloist-app-grid--railExpanded` / `--railCollapsed`.)

## Visual system mapping

All layout surfaces must use the semantic Tailwind tokens:

- Backgrounds: `bg-bg-void`, `bg-bg-surface`, `bg-bg-raised`
- Borders: `border-glass-stroke`
- Hover surfaces: `bg-glass-highlight`
- Shadows: `shadow-monolith`, `shadow-monolith-hover`

## Interaction constraints (foundation rules)

- No `cursor-not-allowed` on disabled controls.
- Icon buttons must have `title` + `aria-label`.
- Toast durations and copy must come from `src/constants.ts`.
- Organize/drag interactions: pointer-based; drop zones visible only when mode-gated.

## Acceptance criteria

A foundation implementation is compliant when:

- The shell uses `.soloist-app-grid` (no inline layout).
- Rail expansion/collapse works without reflow bugs.
- New UI elements are built from primitives that encode design-system rules.
- ESLint/a11y rules catch violations early.

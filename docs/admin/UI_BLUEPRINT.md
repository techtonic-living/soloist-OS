# Soloist OS — UI Blueprint (Foundation-First)

This document defines the **human + agent readable** UI architecture for Soloist OS.
It is intentionally strict: the goal is a stable trunk (design system + layout) that lets us restore previously-built features safely later.

## North Star

- **Cinematic Technical**: IDE precision + creative software elegance.
- **Design-system first**: the design system is the API. UI code consumes tokens and primitives; it does not invent its own language.
- **Restorable features**: finished/legacy modules should be reintroduced by adapting them to the new primitives, not by copying old UI.

## Source of truth

- Visual language + interaction rules: `docs/DESIGN_SYSTEM.md`
- Planned design intent (authoritative): `docs/admin/DESIGN_INTENT.md`
- Product intent: `docs/PRD.md`

### Legacy references

- `docs/admin/FIGMA_DESIGN_SPEC.md` is a historical extraction from a prior Figma layout.
	It is **not** authoritative for current goals/requirements.
	Use it only as an archaeological reference when restoring old UI behavior.

### Draft artifacts

- `docs/admin/LAYOUT_SPEC_V2.md` is a **draft** layout spec created as a safe sandbox for experimenting with a v2 shell.
	It is not authoritative until it matches `DESIGN_INTENT.md`.

If two docs conflict, resolve by updating the docs first (don’t “paper over” in code).

## Layout Framework (3×3 Master Grid)

We do **not** assume a specific layout grid until it is documented in `DESIGN_INTENT.md`.
If the planned design uses a 3×3 grid, document it there first.

- Header row
- Middle row: Left rail / Main / Right panel
- Footer row

### Implementation rule

- **No layout inline styles**. Use the existing CSS utilities in `ui-src/src/index.css` (e.g. `.soloist-app-grid`, rail modifiers).
- Build the framework as **layout primitives** so modules can be swapped without rewriting the shell.

## Design System API (What engineers & agents may use)

### 1) Tokens (Tailwind)

Use semantic tokens from `ui-src/tailwind.config.js`:

- Backgrounds: `bg-bg-void`, `bg-bg-surface`, `bg-bg-raised`
- Glass: `bg-glass-subtle`, `border-glass-stroke`, `bg-glass-highlight`
- Accents: `text-primary`, `text-accent-cyan`, `text-accent-violet`

### 2) Primitives

Primitives are the only allowed building blocks for new UI:

- `Button` (glass / ghost / icon)
- `IconButton`
- `Input` / `TextArea`
- `Slider` (use `.soloist-range`)
- `Card` (`.depth-card`)
- `Tabs` / `TabButton`
- `Toast` (via `ToastContext`, durations from `src/constants.ts`)

> A “primitive” must encode design-system rules (hover, disabled, cursor policy, a11y labels).

### 3) Patterns

Patterns compose primitives:

- Library headers and tab bars
- Organize mode (pointer-based drag)
- Inspector panels
- Empty states / drop zones

Patterns should live next to their domain module, but must only use primitives.

## Module boundaries (for safe restoration)

### Domain modules

- Tokens Engine (colors/typography/sizing)
- Knowledge Base
- Export Terminal
- AI Assistant

Each module should expose:

- `state` (serializable)
- `view` (pure UI)
- `adapters` (Figma plugin messages, storage, AI calls)

### Adapters

Keep integrations behind adapters so we can swap implementations:

- Figma plugin messaging
- Persistence (clientStorage / local)
- AI providers (Gemini now, others later)

## “No regrets” rules (agent-safe)

- Do not hardcode hex colors (use semantic tokens).
- Do not use `cursor-not-allowed` for disabled.
- Do not add new inline styles for layout.
- All icon buttons must have `title` and `aria-label`.
- Toast strings and durations must come from `src/constants.ts`.

## Restoration strategy (bringing back ‘finished’ features)

When reintroducing an older feature:

1. Wrap it with current layout primitives (grid/rails/panels).
2. Replace ad-hoc styles with semantic tokens.
3. Replace bespoke buttons/inputs with primitives.
4. Keep old domain logic if it’s correct; only refit the shell.

## Acceptance criteria for the new foundation

- Shell layout matches the 3×3 grid and rail behaviors.
- A small set of primitives exists and is used everywhere new.
- ESLint/a11y/design system rules catch violations early.
- Modules can be mounted/unmounted without layout rewrite.

# Soloist OS — Handoff (Design System refactor)

**Last updated:** 2026-01-05  
**Working branch:** `figmaDS-refactor`

This repo is running a **drift-killer loop** between Figma and code. The goal is that “truth” lives in:

1) exported contracts/snapshots under `design/contracts/`  
2) deterministic seed/checklist in `plugin/code.tsx`  
3) UI implementations that follow contracts (starting with **Button**)

## What’s true (do not regress)

Authoritative variables snapshot (ground truth used to align the starter kit):

- `design/contracts/variables/variables-snapshot_Soloist_OS_no-fileKey_2026-01-04T11-23-23-294Z.json`

Key invariants:

- **Tool colors are aliases**: `color/tool/*` are `VARIABLE_ALIAS` → `color/accent/*` (no duplicated hex “tool” values).
- **Stroke widths** use this exact ladder:
  - `stroke/hairline = 0.5`
  - `stroke/thin = 1`
  - `stroke/medium = 1.5`
  - `stroke/bold = 2`
- **Typography governance**:
  - Typography *Variables* store **font family only** (`font/ui`, `font/mono`, `font/brand`, `font/display`).
  - **Text Styles** govern size/line-height, with lowercase naming ladders:
    - `ui/01..12`, `mono/01..12`, `brand/01..06`, `display/01..06`
- **Icon + tool identity rule (Option A)**:
  - Tool identity belongs to the **button surface** (tool-colored surfaces)
  - Icons remain tone-based (no “tool-color icon variants”).

## How to run (dev + build)

Build everything:

```bash
npm run build
```

Recommended plugin dev loop (dist-based, matches shipping plugin):

```bash
npm run dev:plugin
```

Fastest UI iteration (serve UI via Vite; requires importing `manifest.dev.json` in Figma):

```bash
npm run dev:plugin:live
```

## Where the “contracts” live

- `design/contracts/variables/` — exported variables snapshots
- `design/contracts/primitives/` — (next) primitive contracts, e.g. Button

See `design/contracts/README.md` for the loop.

## Next step (thin slice): Button

Target workflow:

1) In Figma: finalize a **Button** component set (variants + bindings).
2) Export `design/contracts/primitives/Button.contract.json`.
3) Implement the Button in code against the contract.
4) Re-export and drift-check (contract ↔ Figma ↔ code).

What to decide up front for the Button contract:

- Variant schema (e.g. `kind`, `size`, `state`, `icon`, `tone`)
- Token bindings for:
  - bg / stroke / text
  - hover/press/focus states
- Motion policy:
  - use named states/variants and respect reduced-motion preferences.

---

# Soloist OS Roadmap Status

**Phase:** 2 (Core Modules)

**Functional:**
✅ 3D Color Matrix (UI + Math)
✅ Knowledge Base (Local Storage)
✅ Figma Variable Sync (Plugin Backend)
✅ AI Mode Logic (Teacher/Guide/Silent)
✅ Git Repository Initialized
✅ Build System (Vite + React + Tailwind)
✅ Color Studio (Harmonies + Presets)
✅ Robust Clipboard (Cross-Environment)
✅ Input Validation (Groups/Inspector)
✅ Design System Refinements (Cursors/States)
✅ Design System Compliance (Dec 19, 2025)
  - Removed all inline styles (replaced with SVG fills)
  - Standardized tooltips (Title Case, no punctuation)
  - Standardized validators (Sentence case with punctuation)
  - Added accessibility labels (titles, aria-labels)
  - Input field styling aligned with design system
  - ESLint v9 configuration with TypeScript support
✅ Color Studio Refinements (Dec 20, 2025)
  - Hex validation: 6-character only, no # symbol, live preview
  - Dynamic color updates during inline editing (pre-save)
  - Heart toggle contrast: Text-color-based pattern (white on dark, black/80 on light)
  - RGB/HSL/HSB spacing optimization (gap-1 labels, gap-3 values)
  - Palette preview dividers (consistent bg-white/20 separators)
  - Primary card button alignment (size 14px, consistent with secondary/tertiary)
  - Clean error UX (visual feedback only, no inline text)

✅ Saved Palettes + Palette Inspector Parity (Dec 20, 2025)
  - Saved Palettes library brought to parity with Saved Colors (ordering, grouping, empty states, density + sorting wiring)
  - Ordering respects persisted group ID lists (e.g., `paletteGroups[].paletteIds`) for deterministic rendering
  - Organize interactions migrated to pointer-based dragging (more stable than native HTML5 drag behavior)
  - Organize controls visible but disabled under computed sorts (prevents writing manual order while sorted)
  - Palette Inspector redesigned to match Color Inspector capabilities (palette actions + per-color actions, favorites, inline edits, copy feedback)
  - Visual accuracy: removed scrims/gradients on color surfaces in inspector for reliable color analysis
  - Copy semantics: palette-level copy copies comma-separated hex values (toast shows actual copied value)
  - Metadata model update: palette preset metadata migrated from `tags` to `meaning` / `usage` (generation updated accordingly)
  - Behavior fixes:
    - Unfavoriting a grouped palette clears its group association so re-favoriting returns to Global
    - “Create New Group” flow resets fields to avoid leaking canceled edit state
  - Session persistence: inspected Color/Palette selection persists when switching tools/tabs
  - Hover tool reliability: refined event propagation to prevent click-through without disabling controls

**Missing/Todo:**
🔴 Export Terminal is hardcoded (Needs state link verification)
🔴 Connect "Sync" button to Plugin API payload (Full E2E test)

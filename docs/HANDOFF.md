# Soloist OS — Handoff (Design System refactor)

**Last updated:** 2026-01-07
**Working branch:** `figmaDS-refactor`

This repo is running a **drift-killer loop** between Figma and code. The goal is that "truth" lives in:

1) exported contracts/snapshots under `design/contracts/`
2) deterministic seed/checklist in `plugin/code.tsx`
3) UI implementations that follow contracts

## Current status

**Completed primitives:**
- ✅ **Icon** contract exported (9 variants: sm/md/lg × primary/secondary/muted, zero issues)
- ✅ **Icon** component implemented against contract ([Icon.tsx](../ui-src/src/v2/primitives/Icon.tsx))
- ✅ **Button** contract exported (12 variants: glass/ghost × sm/md/lg × default/disabled, zero issues)
- ✅ **Button** component implemented against contract ([Button.tsx](../ui-src/src/v2/primitives/Button.tsx))

**Icon glyph inventory: ✅ Operational**

13 glyphs exported and synchronized (2026-01-07). Systematic workflow established to prevent drift:

**Figma structure:**
- `Icon` component set (node 2002:498) with instance swap property `name#2002:3`
- `IconGlyph/*` frame (node 2002:217) containing 13 glyph component sets
- Each glyph: `IconGlyph/{name}` (COMPONENT_SET) → stroke variants (thin/hairline/medium)
- Current glyphs: home, brand-safari, settings-2, affiliate, device-desktop-analytics, book, writing-sign, slash, minus, minus-vertical, chevron-right, circle-chevron-right, circle-chevrons-right

**To add new icons:**
1. Add IconGlyph/{name} component sets to Figma (with stroke variants)
2. Export from plugin → "EXPORT ICON GLYPHS"
3. Update `FIGMA_TO_TABLER` mapping in `scripts/generate-icon-component.mjs`
4. Run `npm run generate:icons`
5. Commit Icon.glyphs.json + Icon.tsx

See [design/contracts/README.md](../design/contracts/README.md#icon-glyphs-add-new-icons) for full workflow.

**Next primitive: TextField**

Workflow pattern established:
1. Agent generates component-specific instructions
2. Agent pastes into `designAssistant` component (node 2002:712) in Figma
3. Designer builds component in Figma following instructions
4. Designer exports contract JSON via plugin
5. Agent implements code against contract
6. Re-export to verify zero drift

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
- `design/contracts/primitives/` — primitive contracts (Icon, Button) + glyph inventories
- `design/contracts/spec/` — (future) component specs

See `design/contracts/README.md` for workflows.

## Contracts-first loop workflow (established)

## Contracts-first loop workflow (established)

**General primitive workflow:**

1) In Figma: finalize a component set (variants + token bindings).
2) Export `design/contracts/primitives/[Component].contract.json`.
3) Implement the component in code against the contract.
4) Re-export and drift-check (contract ↔ Figma ↔ code).

**Icon-specific workflow (glyph inventory):**

When icon glyphs are added/changed:

1) Export glyph inventory from Figma.
2) Update Figma→Tabler mapping in generator script.
3) Run `npm run generate:icons` to auto-generate Icon.tsx.
4) Commit inventory + generated component.

This prevents manual Icon.tsx edits and ensures Figma is the source of truth.

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

✅ Design System Primitives (Jan 7, 2026)
  - Established contracts-first workflow (Figma → contract JSON → code implementation)
  - Exported Icon.contract.json (9 variants, zero issues)
  - Exported Button.contract.json (12 variants, zero issues)
  - Implemented Icon.tsx against contract (size/tone props, correct token bindings)
  - Implemented Button.tsx against contract (variant/size/state props, glass/ghost variants)
  - Built systematic Icon glyph inventory workflow (export → map → generate → commit)
  - Exported Icon.glyphs.json with 13 glyphs from Figma (COMPONENT_SET with stroke variants)
  - Populated FIGMA_TO_TABLER mapping with all 13 icons
  - Generated Icon.tsx via `npm run generate:icons` (auto-generated with Tabler imports)
  - Fixed generator to quote object keys for IconGlyph/* names
  - Current glyphs: home, brand-safari, settings-2, affiliate, device-desktop-analytics, book, writing-sign, slash, minus, minus-vertical, chevron-right, circle-chevron-right, circle-chevrons-right

**Missing/Todo:**
🔴 Export Terminal is hardcoded (Needs state link verification)
🔴 Connect "Sync" button to Plugin API payload (Full E2E test)
🟡 Test Icon component in UI (verify size/tone/glyph rendering)
🟡 Button primitive thin slice (export Button.glyphs.json → implement against contract)

# Design Contracts (drift-killer artifacts)

These files are the **mechanical bridge** between Figma and code.

Instead of treating mockups as screenshots or vibes, we export **structured facts** from selected Figma nodes and store them here.

## What belongs here

- `primitives/*.contract.json`
  - Example: `design/contracts/primitives/Button.contract.json`
  - Contains: component name, variant property schema, variant values, token bindings (variables), styles used (text/effect), and structural hints (auto-layout / constraints).

- `primitives/*.glyphs.json`
  - Example: `design/contracts/primitives/Icon.glyphs.json`
  - Contains: inventory of available icon glyph component names from instance swap library.
  - **Systematic workflow**: Export from Figma → commit → run `npm run generate:icons` → Icon.tsx auto-generated.

- `shell/*.contract.json`
  - Example: `design/contracts/shell/ShellDefault.contract.json`
  - Contains: canonical shell layout structure + bindings.

- `tokens/*.tokens.json`
  - Example: `design/contracts/tokens/color.tokens.json`
  - Contains: exported variables snapshot(s) reduced to a scrape-friendly token map.

## Live co-design loop (the drift-killer)

1. Design/update a node in Figma (`01_PRIMITIVES`, `02_COMPONENTS`, or `03_SHELL`).
2. Select the node.
3. Export a contract JSON.
4. Commit contract JSON.
5. Update code to match the contract.
6. Validate drift (Figma ↔ contract ↔ code).

## Systematic workflows

### Icon glyphs (add new icons)

When new icons are added to the Figma glyph library:

1. **Export from Figma**: Select Icon component set → Connect → Export → "Icon glyph inventory" → EXPORT ICON GLYPHS
2. **Save inventory**: Overwrite `design/contracts/primitives/Icon.glyphs.json` with exported file
3. **Update mapping**: Edit `scripts/generate-icon-component.mjs` → add Figma→Tabler mappings in `FIGMA_TO_TABLER`
4. **Generate code**: Run `npm run generate:icons`
5. **Verify**: Icon.tsx is auto-generated with new glyphs
6. **Commit**: Commit both Icon.glyphs.json and Icon.tsx

This ensures Icon.tsx stays in sync with Figma's glyph library without manual editing.

**Stroke weight variants**: Individual icon glyphs in Figma (e.g., `IconGlyph/home`) are COMPONENT_SET nodes with stroke weight variant components (`stroke=thin`, `stroke=hairline`, `stroke=medium`, `stroke=bold`). The export captures this structure in `Icon.glyphs.json` with `nodeType: "COMPONENT_SET"` and a `strokeVariants` array. The generator script logs which glyphs have stroke variants but currently uses a fixed stroke weight (stroke/thin = 1px) in code. Supporting multiple stroke weights per icon would require adding a `stroke` prop to the Icon component.

## Notes

- These artifacts are intentionally small and reviewable.
- Contracts should be stable across time; when a contract changes, it should reflect an intentional design evolution.
- **Never manually edit auto-generated files** (Icon.tsx) — edit the source contract/inventory and regenerate.

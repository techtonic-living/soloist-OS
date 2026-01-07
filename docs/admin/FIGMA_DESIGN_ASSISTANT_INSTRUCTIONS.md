# Figma Design Assistant Instructions — Soloist OS Primitives

**Purpose:** Guide AI design assistant (Figma AI) through creating new primitive components that align with the contracts-first drift-killer workflow.

## Workflow: How These Instructions Are Used

**When starting a new component:**

1. Agent identifies next component to build (e.g., "TextField")
2. **Agent uses the Soloist OS plugin to send instructions:**
   - Plugin has pre-built instructions for each component (stored in `plugin/code.tsx`)
   - In plugin UI → Connect tab → "Write instructions: designAssistant" section
   - Click the component button (e.g., "TextField Instructions")
   - Instructions automatically written to `designAssistant` component (node 2002:712)
3. Designer opens Figma and views instructions in designAssistant component
4. Designer creates the component following the instructions
5. Designer exports the contract via plugin and reports back
6. Agent implements code against the contract

**Current Implementation:**
- Instructions stored as constants in `plugin/code.tsx`:
  - `BUTTON_BUILD_NOTES_V1`
  - `TEXTFIELD_BUILD_NOTES_V1`
- Plugin message types:
  - `apply-button-build-notes-to-node`
  - `apply-textfield-build-notes-to-node`
- UI buttons in ConnectView component

**Future Optimization:**
- Move instructions to `design/contracts/templates/*.md` files
- Plugin reads templates at runtime (no rebuild needed)
- Agent just creates/updates markdown files
- UI auto-generates buttons from available templates

**Why this pattern:**
- Keeps design + code instructions synchronized
- Designer sees the exact constraints while building in Figma
- Prevents drift before it starts (design against known tokens/rules)
- Creates a single source of truth for each component's requirements
- No manual copy/paste needed

## Context

This project uses a **contracts-first workflow** to prevent drift between Figma and code:

1. Design component in Figma (with proper bindings)
2. Export contract JSON via plugin
3. Implement code against contract
4. Re-export to verify zero drift

**Key principle:** Figma is the source of truth for visual design. Code implements exactly what the contract describes.

## Design System Constraints (Never Regress)

### Color Tokens
- **Tool colors are aliases**: `color/tool/*` → `color/accent/*` (no duplicated hex values)
- **Glass morphism**: `color/glass/subtle`, `color/glass/stroke`, `color/glass/highlight`
- **Text colors**: `color/text/primary`, `color/text/secondary`, `color/text/muted`

### Stroke Widths (Fixed Ladder)
- `stroke/hairline = 0.5`
- `stroke/thin = 1`
- `stroke/medium = 1.5`
- `stroke/bold = 2`

### Typography Governance
- **Variables store font family ONLY**: `font/ui`, `font/mono`, `font/brand`, `font/display`
- **Text Styles govern size/line-height** with lowercase naming:
  - `ui/01..12` (Interface text)
  - `mono/01..12` (Monospace text)
  - `brand/01..06` (Brand headlines)
  - `display/01..06` (Display headlines)

### Spacing
- Use `space/*` variables: space/1 (4px), space/2 (8px), space/3 (12px), space/4 (16px), etc.

### Border Radius
- Use `radius/*` variables: radius/sm, radius/md, radius/lg, radius/xl

### Icon + Tool Identity Rule
- Tool identity belongs to **button surfaces** (tool-colored backgrounds)
- Icons remain **tone-based** (use `color/text/*`, never tool colors)

## Component Design Checklist

### 1. Structure Setup
- [ ] Create component set (not individual components)
- [ ] Define variant properties (variant, size, state, etc.)
- [ ] Use clear, lowercase naming: `variant=glass, size=md, state=default`

### 2. Variable Bindings (Critical)
- [ ] Bind ALL colors to variables (never use hard-coded hex values)
- [ ] Bind spacing to `space/*` variables (auto-layout gaps, padding)
- [ ] Bind border radius to `radius/*` variables
- [ ] Bind stroke widths to `stroke/*` variables

### 3. Text Style Bindings (Critical)
- [ ] Bind text layers to Text Styles (mono/07, mono/09, mono/10, etc.)
- [ ] **Never use local text overrides** (fontSize, fontWeight, italic)
- [ ] Verify text styles match variant sizes:
  - sm → smaller text style (e.g., mono/07)
  - md → medium text style (e.g., mono/09)
  - lg → larger text style (e.g., mono/10)

### 4. Icon Integration
- [ ] Use instance swap properties for icons (property type: `Instance swap`)
- [ ] Set preferred values to IconGlyph/* components
- [ ] Icons should use `color/text/primary` (never tool colors)
- [ ] Size icons appropriately per variant (16px sm, 20px md, 24px lg)

### 5. Component Properties
- [ ] Add boolean properties for visibility toggles (showLabel, showIcon, etc.)
- [ ] Add text properties for editable content (label, placeholder, etc.)
- [ ] Keep property names lowercase with camelCase

### 6. Variant Coverage
Create variants for:
- [ ] All visual styles (glass, ghost, solid, outline, etc.)
- [ ] All sizes (sm, md, lg)
- [ ] All states (default, disabled, and any others needed)

### 7. Auto-Layout Best Practices
- [ ] Use auto-layout for all containers
- [ ] Set proper constraints (hug content vs fixed width)
- [ ] Define consistent gaps between elements
- [ ] Use `space/*` variables for padding/gaps

## Button Component Example (Reference)

**What worked well:**

### Variant Properties
```
variant: glass | ghost
size: sm | md | lg
state: default | disabled
```

### Component Properties
```
label (text)
showIconLeft (boolean)
showIconRight (boolean)
showLabel (boolean)
iconLeft (instance swap → IconGlyph/*)
iconRight (instance swap → IconGlyph/*)
```

### Variable Bindings (Glass Variant)
- Fill: `color/glass/subtle`
- Stroke: `color/glass/stroke`
- Label text color: `color/text/primary`
- Icon color: `color/text/primary`
- Border radius: `radius/lg`
- Stroke width: `stroke/thin`
- Padding: `space/2` (sm), `space/3` (md), `space/4` (lg)
- Gap between elements: matches padding

### Text Style Bindings
- sm: `mono/07` (16px, JetBrains Mono weight 100, uppercase)
- md: `mono/09` (20px, JetBrains Mono weight 100, uppercase)
- lg: `mono/10` (24px, JetBrains Mono weight 100, uppercase)

### Size Specifications
- sm: 70×32 (width can vary based on content)
- md: 91×44
- lg: 113×56

## Common Pitfalls to Avoid

### ❌ Don't:
- Use hard-coded color values (always bind to variables)
- Apply local text style overrides (bind to Text Styles instead)
- Create individual components (use component sets)
- Use uppercase in variant property names
- Duplicate token values (use aliases)
- Apply tool colors to icons (icons are tone-based)
- Mix variable types (e.g., don't use color/text/* for backgrounds)

### ✅ Do:
- Bind everything to variables/styles
- Use component sets with clear variant properties
- Follow naming conventions (lowercase, descriptive)
- Test all variant combinations before export
- Verify text styles are correctly applied
- Use instance swap for icons
- Keep component properties minimal and purposeful

## Pre-Export Validation

Before exporting a new component contract, verify:

1. **Selection test**: Select any variant → verify all bindings in right panel
2. **Text style check**: Inspect text layers → should show bound text style name, not local overrides
3. **Variable check**: All colors/spacing/radius show variable names in right panel
4. **Variant coverage**: All size×state×variant combinations exist
5. **Property test**: Toggle component properties → verify conditional visibility works
6. **Icon test**: Swap icons via instance swap property → verify sizing/color

## Export Workflow

1. Select the component set (not individual variants)
2. Open plugin → "EXPORT COMPONENT CONTRACT"
3. Save to `design/contracts/primitives/[ComponentName].contract.json`
4. Review exported JSON for:
   - Zero issues: `"issues": []`
   - Correct variant count
   - All expected variables detected
   - All text styles detected
5. Commit contract to git

## Next Steps After Export

1. Implement component in `ui-src/src/v2/primitives/[ComponentName].tsx`
2. Match contract exactly (size, colors, spacing, typography)
3. Create component variants matching Figma variant properties
4. Add hover/focus/active states (interactive pseudo-states not in Figma)
5. Test in primitives demo
6. Re-export contract to verify no drift

## Design Assistant Prompt Template

When starting a new primitive:

```
Create a [ComponentName] component set following Soloist OS design system rules:

1. Variant properties: [list properties like variant, size, state]
2. Component properties: [list instance swap, boolean, text properties]
3. Variable bindings:
   - Colors: color/[category]/[name]
   - Spacing: space/[1-8]
   - Radius: radius/[sm|md|lg|xl]
   - Stroke: stroke/[hairline|thin|medium|bold]
4. Text styles: [specify which styles for each size]
5. Size specs: [dimensions for sm/md/lg]
6. Visual style: [glass/ghost/solid/etc.]

Reference Button component for structure/binding patterns.
Validate all bindings before completion.
```

## Examples of Next Components

### TextField/Input
- Variants: `variant=glass|ghost`, `size=sm|md|lg`, `state=default|disabled|error`
- Properties: `placeholder`, `label`, `showLabel`, `value`
- Text styles: mono/07 (sm), mono/09 (md), mono/10 (lg)
- Error state: use `color/signal/error`

### Toggle/Checkbox
- Variants: `size=sm|md|lg`, `state=default|disabled`, `checked=true|false`
- Colors: `color/accent/blue` (active), `color/glass/subtle` (inactive)
- Consider animation-friendly structure

### Dropdown/Select
- Variants: `size=sm|md|lg`, `state=default|disabled|open`
- Properties: `placeholder`, `selectedValue`, `showArrow`
- Include dropdown menu as nested component

---

**Remember:** The goal is zero drift. If the contract export shows issues or missing bindings, fix in Figma before proceeding to code.

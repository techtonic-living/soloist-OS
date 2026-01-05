# Soloist OS Design System

> **Note**: This is a living document. As new patterns emerge, they should be documented here to maintain consistency.

## 1. Brand Identity

The Soloist OS visual language is "Cinematic Technical" – combining the precision of developer tools with the elegance of high-end creative software.

### Typography

We use a specific font stack to differentiate content types:

| Role        | Font Family    | Tailwind Class | Usage                                        |
| ----------- | -------------- | -------------- | -------------------------------------------- |
| **Brand**   | Hubballi       | `font-brand`   | Headings, Logos, "Cinematic" labeling        |
| **UI**      | Inter          | `font-sans`    | General UI text, labels, readable content    |
| **Display** | Satoshi (web) / Acier BAT (Figma) | `font-display` | Large key numbers, stats, feature highlights |
| **Code**    | JetBrains Mono | `font-mono`    | Code snippets, hex values, technical data    |

#### Figma typography governance (important)

In Figma, **Variables and Text Styles have separate responsibilities**:

- Typography *Variables* store **font family only** (`font/ui`, `font/mono`, `font/brand`, `font/display`).
- **Text Styles** govern size + line-height.

Text style naming is intentionally mechanical and sortable:

- `ui/01..12`, `mono/01..12`
- `brand/01..06`, `display/01..06`

### Color Palette (Semantic)

Avoid hardcoding hex values. Use semantic Tailwind classes defined in `tailwind.config.js`.

#### Backgrounds

-   `bg-bg-void`: Main app background (Deepest black/blue).
-   `bg-bg-surface`: Cards, panels, elevated areas.
-   `bg-bg-raised`: Modals, popovers, highest elevation.

#### Glass (Utility)

-   `bg-glass-subtle`: Very faint overlay (2% opacity).
-   `bg-glass-stroke`: Borders/Dividers (8% opacity).
-   `bg-glass-highlight`: Hover states (15% opacity).

#### Accents

-   `text-primary` / `bg-primary`: Core action color (Blue #3D8BFF).
-   `text-accent-cyan`: Tech/Data emphasis (Cyan #3FE3F2).
-   `text-accent-violet`: Creative/Magic emphasis (Violet #9466FF).

#### Figma tool colors

In Figma Variables, `color/tool/*` tokens are **aliases** to the accent tokens (`color/accent/*`).
This avoids duplicated hex values and keeps “tool identity” as a semantic alias layer.

## 0. Contracts-first loop (drift killer)

We treat exported artifacts under `design/contracts/` as the bridge between Figma and code.

- Variables snapshots: `design/contracts/variables/`
- Primitive contracts (next): `design/contracts/primitives/`

See `design/contracts/README.md` for the workflow.

### Authoritative token truths

From the current ground-truth snapshot:

- `stroke/hairline = 0.5`, `stroke/thin = 1`, `stroke/medium = 1.5`, `stroke/bold = 2`
- `color/tool/*` are `VARIABLE_ALIAS` → `color/accent/*`

## 2. UI Patterns & Effects

### Glassmorphism

We avoid heavy solid borders. Instead, we use "Glass Strokes" – semi-transparent white borders that look like etched glass.

```css
/* Standard Card Style */
.depth-card {
	@apply bg-bg-surface rounded-2xl border border-glass-stroke shadow-monolith;
	transition: all 0.5s ease-out;
}
```

### Shadows

-   `shadow-monolith`: Deep, heavy shadow for floating panels.
-   `shadow-monolith-hover`: Expanded shadow for active/hover states.
-   `shadow-neon-glow`: Cyan glow for "active" high-tech elements.

### Scrollbars

Use `.custom-scrollbar` on scrollable containers for a consistent, minimal interface across all tools (Color Library, Color Studio, etc.).

**Specifications:**

-   **Width**: 6px (compact, minimal footprint)
-   **Thumb Style**: Semi-transparent white (`bg-white/20`) with glass aesthetic
-   **Track**: Transparent (inherits container background)
-   **Hover State**: Increases opacity to `bg-white/30` for visibility feedback
-   **Rounded**: Fully rounded corners (`rounded-full`) for refined appearance

**Implementation**: Defined in `index.css` with webkit scrollbar pseudo-elements for cross-browser compatibility.

## 3. Component Library Guidelines

### Buttons

Buttons generally follow these styles (though currently implemented as ad-hoc classes, they should standardize to):

-   **Glass Button** (Standard): `bg-white/5 hover:bg-white/10 text-white border border-white/5`
-   **Ghost Button** (Secondary): `text-gray-500 hover:text-white`
-   **Icon Button**: `p-2 rounded-full hover:bg-white/10`

> [!CAUTION] > **Disabled State Cursor**: Do NOT use `cursor-not-allowed` on disabled buttons. Users find the cursor style change on hover aesthetically displeasing. Maintain the standard cursor (or `cursor-default`) but indicate disabled state via opacity (e.g., `opacity-50`) and removing pointer events or hover styles.

### Inputs

Inputs typically use transparent backgrounds with glass borders to blend into the "Void".

-   **Standard**: `bg-black/20 border border-white/10 rounded-lg focus:border-accent-cyan`

### Sliders

Standard "Cinematic Technical" slider style for precision adjustments.

-   **Track**: Thin (`h-1` or `w-1`), `bg-white/20`, rounded.
-   **Thumb**: Native or custom div (`size-4`), `bg-accent-cyan`, `border-2 border-accent-cyan`, `shadow-[0_0_10px_rgba(63,227,242,0.5)]`.
-   **Interaction**: Thumb scales or glows on hover/active. Avoid complex gradients on tracks unless representing a color ramp.

### Text & Messaging Conventions

Consistent text casing and punctuation improves clarity and polish.

-   **Tooltips**: Title Case, no end-of-line punctuation.
    -   Examples: `Move Up`, `Edit Group Name and Description`
-   **Validator error messages**: Sentence case with end-of-line punctuation.
    -   Examples: `Color name must be unique.`, `Group name must be unique.`

### Library Navigation Bar

Standard header for tool-specific navigation and state controls (Density, Sorting, Filter).

-   **Structure**: `flex` container with `border-b border-glass-stroke px-2 mb-6`.
-   **Tabs**: `text-xs font-mono tracking-wider` buttons with an absolute-positioned underline (`h-0.5 bg-accent-cyan shadow-neon-glow`) for the active state.
-   **Density Control**: Minimal range input (`accent-accent-cyan h-1 bg-white/20`) labeled in `uppercase font-mono 10px`.

### Library Section Layout

Standardized container for library categories (Global, Custom Groups).

-   **Rendering Order**: "Global" (Unassigned) section must ALWAYS render **first**, followed by custom groups. New groups are prepended to the group list (immediately below Global).

-   **Structure**: `div` with `space-y-1`.
-   **Header**: `flex items-center justify-between` between title/count and action buttons.
-   **Icons**: Standard `size={14}` for all library management icons (Folders, Arrows, Hearts).
-   **Description**: `text-xs text-white/80 leading-relaxed border-b border-glass-stroke pb-2`.
-   **Requirement**: The description border serves as the primary visual divider between the header and the grid content.

### Library Parity & Ordering (Colors + Palettes)

Saved Colors and Saved Palettes must behave as siblings.

-   **Parity Rule**: Any affordance present in one library should exist in the other unless there is a clear, documented reason (density, sorting, grouping, empty states, organize/edit, dropdown behaviors).
-   **Stable Order**: In manual mode, item order must be deterministic and persisted.
    -   Group membership and ordering must respect the stored ID lists (e.g., `colorGroups[].colorIds`, `paletteGroups[].paletteIds`).
    -   Avoid “implicit” ordering derived from map iteration or creation time.
-   **Global Always First**: Global/Unassigned section always renders first (above groups), even when empty.
-   **Group Creation Placement**: New groups are prepended (immediately below Global).
-   **Unfavorite Clears Group Memory**: If a palette (or color) is unfavorited while assigned to a custom group, its group association must be cleared. Re-favoriting returns it to Global by default.

### Empty State / Drop Zones

Used when a category or search result is empty, serving as both a message and a landing target.

-   **Contextual Visibility**: Interactive drop zones (e.g., "Drop Palettes Here") should ONLY be visible when the relevant "Organize" or "Edit" mode is active to reduce visual clutter in View mode.

-   **Style**: `border-2 border-dashed border-white/10 p-6 rounded-lg bg-black/5`.
-   **Hover State**: `hover:border-accent-cyan/30 hover:text-accent-cyan/70` (indicates interactivity).
-   **Content**: Large icon (`size={24}` or `32`), `opacity-30/50`, followed by `text-xs font-mono uppercase tracking-wider`.

### Organize / Edit Mode (Libraries)

Organize mode is a _precision interaction mode_.

-   **Pointer-Based Dragging**: Prefer pointer-driven dragging logic over native HTML5 drag-and-drop for library reordering and cross-section moves.
    -   Rationale: avoids browser drag previews/cursors and inconsistent click/drag thresholds.
-   **Mode-Gated Drop Zones**: Drop zones and “Drop here” affordances only appear when Organize/Edit is active.
-   **Sort Compatibility**:
    -   Organize controls may remain visible for discoverability, but must be **disabled** (opacity + no hover affordance) when a non-manual sort is active.
    -   Never allow reorder writes while the view is in a computed sort (e.g., by size/saturation/date).

### Micro-Interactions

> [!IMPORTANT]
> Consistency in micro-interactions is critical for the "premium" feel.

#### Heart Toggle (Favorites)

Must handle asynchronous API latency (metadata generation) gracefully.

-   **State 1 (Default)**: Outline icon (`lucide-heart`).
-   **State 2 (Pending)**: Animate scale/pulse while awaiting API response.
-   **State 3 (Active)**: Filled icon (`fill-red-500`) with "pop" animation.
-   **Rule**: Never snap instantly without feedback; use the animation to bridge the API delay.
-   **Contrast Pattern (Swatches)**: Heart toggles appearing on/within color swatches must follow the text color of their labels:
    -   **Dark swatches**: `text-white hover:bg-white/20`
    -   **Light swatches**: `text-black/80 hover:bg-black/10`
    -   Applies to: Color Studio cards, Color Library cards, palette previews

#### Persistent vs. Hover Actions

-   **Container Headers**: Management tools (Rename, Delete, Visibility) on container headers (e.g., Group Headers) must be **Always Visible**. Do NOT use `group-hover:opacity-100` for these primary structure controls, as it hurts discoverability.
-   **Item Cards**: Actions on individual items (e.g., Palette Cards) may use hover-reveal patterns to maintain a clean interface, provided the card itself is clickable for details.

#### Group Management Tools

Standardized action cluster for managing collections (Color Groups, Palette Groups).

-   **Order (Left to Right)**: `[Reorder]` -> `[Visibility]` -> `[Rename]` -> `[Delete]` -> `[Unfavorite]`
-   **Icons & Styles**:
    1.  **Reorder** (`ChevronUp/Down`): `text-gray-500 hover:text-white`
    2.  **Visibility** (`Eye/EyeOff`):
        -   _Visible_: `text-gray-500 hover:text-white`
        -   _Hidden_: `text-accent-cyan hover:text-accent-cyan/80` (Active indicator)
    3.  **Rename** (`Edit3`): `text-gray-500 hover:text-accent-cyan` (Indicates input mode)
    4.  **Delete** (`Trash2`): `text-gray-500 hover:text-red-500` (Destructive warning)
    5.  **Unfavorite** (`Heart`):
        -   _Default_: `text-gray-500 hover:text-red-400`
        -   _Disabled_ (Empty): `opacity-30` (Do NOT use `cursor-not-allowed`)

#### Copy Actions

All copy buttons must use a standardized feedback loop.

-   **Icon Swap**: `Copy` -> `Check` (`text-green-500`).
-   **Duration**: Return to default state after 2000ms.
-   **Animation**: Smooth fade/scale transition (aligns with `transition-all duration-300`).

-   **Palette Copy Semantics**: Copying a palette should copy its color hex values as a comma-separated list (e.g., `#111111, #222222, #333333`) rather than copying the palette name.

#### Toasts & Feedback

> [!IMPORTANT] > **Single Source of Truth**: All toast durations and copy must be imported from `src/constants.ts`. Do not hardcode values.

Feedback messages must be explicit.

#### Toast Durations

-   **Standard (Default)**: `TOAST.DURATION.STANDARD` (3000ms). Use for general status updates.
-   **Transient**: `TOAST.DURATION.TRANSIENT` (2000ms). Use for quick feedback loops (e.g., "Copied").
-   **Error**: `TOAST.DURATION.ERROR` (5000ms). Use for critical failures.

#### Instant Dismissal (`toast.clear()`)

-   **Pattern**: When a user performs an action that resolves the condition of a toast (e.g., deleting an item to fix a "Full" state), the toast must be **instantly dismissed** using `toast.clear()`.
-   **Rule**: Never allow a "nagging" state to persist after compliance.

#### Content Guidelines

-   **Requirement**: Display the _actual value_ acted upon.

    -   _Incorrect_: "Copied to clipboard"
    -   _Correct_: "Copied **#3D8BFF** to clipboard"

-   **Palette Toasts**: If copying multiple values (palette), show the actual string being copied (or a clearly truncated representation) rather than a label like the palette name.
-   **Highlight Keywords**: Key values or nouns in the message must be highlighted using the Brand/Tailwind Blue color (`text-primary` / `#3D8BFF`) to draw attention to the subject of the action.
    -   Example: "Added **Cosmic Blue** to favorites" (where _Cosmic Blue_ is blue).

#### Nested Click Targets (Preventing “Click-Through”)

Many UI surfaces are both _selectable_ (card/stripe click selects) and contain _buttons_ (copy, favorite, actions).

-   **Rule**: Buttons inside a clickable/selectable container must not trigger the parent selection.
-   **Propagation Guidance**:
    -   Prefer stopping propagation in the **bubble phase** on the button (and/or its immediate wrapper) to prevent click-through.
    -   Avoid capture-phase “blanket” handlers (`onClickCapture`, `onPointerDownCapture`) that can inadvertently suppress the button’s own events.
    -   Use `preventDefault()` only when you are intentionally preventing a default browser behavior (e.g., text selection, focus quirks), not as a general click-through fix.

#### Swatch / Stripe Accuracy (Color Analysis)

When the UI is used to judge color/contrast, do not add visual manipulation to the swatch surface.

-   **No Scrims/Gradients**: Avoid gradients, overlays, or scrims on the actual color fill area in inspectors.
-   **Readable Labels Without Distortion**: If labels must sit on top of swatches, prefer contrast-preserving techniques that don’t change the underlying color (e.g., `mix-blend-difference`, subtle text shadow) rather than overlay tints.

#### Palette Inspector “Stripe Card” Standard

The inspected palette card uses a stripe-based layout (mirrors mini-cards while scaling up):

-   **Stripes**: Full-height vertical stripes for each palette color.
-   **Hover Expand**:
    -   A stripe may expand on hover to reveal per-stripe tools.
    -   Non-hovered stripes compress but must keep the hex label visible.
-   **Hex Label Placement**:
    -   Always visible at the bottom-left of each stripe.
    -   Truncate with overflow hidden in the collapsed state; reveal on hover/expand.
    -   Use `font-mono` for hex.
-   **Palette Name Placement**: Align the palette name at the bottom-left of the card above the stripe hex labels (mini-card alignment).
-   **Tool Placement**:
    -   Per-stripe tool row is vertically centered and right-justified within the stripe.
    -   Ensure a minimum hover-expanded width sufficient for the full tool cluster (avoid wrapping/overlap).

#### Inline Edits

Inline editing should prioritize quick confirmation without navigation friction.

-   **Enter**: Submits the current field if valid (e.g., Group Name), applies changes, and exits edit mode.
-   **Escape**: Cancels edits, restores previous values, and exits edit mode.
-   **Validation**: Prevent submission if invalid and surface a validator message following the conventions above.

#### Hex Value Editing (Color Studio)

Specialized inline editing for hex color values with live preview.

-   **Format**: 6-character hex values only (no # symbol during editing)
-   **Validation**: Dual validation using regex (`/^[A-Fa-f0-9]{6}$/`) and `colord.isValid()`
-   **Live Preview**: Color card updates in real-time as user types valid hex values
-   **Normalization**: Auto-strip # on input, auto-add # on commit
-   **Error Feedback**: Visual only (red border on invalid), no inline error text
-   **Save State**: Disabled when invalid, prevents commit of malformed values
-   **Cancel Behavior**: Restores initial hex value from edit start

## 3.5 Inspector State & Navigation

Selection in the right-side inspector should feel persistent and “workspace-like.”

-   **Session Persistence**: Switching tools/tabs (e.g., Explore sections) should not clear the inspected Color/Palette selection by default.
-   **Explicit Reset Only**: Only clear inspector selection via an explicit user action (e.g., close/deselect) or when the underlying item is deleted.

## 4. Layout & Spacing

### The Grid

-   **Base Unit**: 4px.
-   **Common Padding**: `p-4` (16px) for panels, `p-6` (24px) for main views.
-   **Gap**: `gap-4` is the standard rhythm between related elements.

#### Color Studio Specific Spacing

-   **RGB/HSL/HSB Values**:
    -   Label-to-values gap: `gap-1` (4px) – tight grouping
    -   Inter-value spacing: `gap-3` (12px) – breathing room for readability
-   **Button Groups**: `gap-0.5` (2px) for compact icon button clusters
-   **Color Cards**: `gap-3` (12px) between primary/secondary/tertiary cards

### Structure

-   **Sidebar**: Fixed width (typically `w-[320px]`), `border-r` or `border-l` with `border-glass-stroke`.
-   **Main View**: `flex-1`, often `relative` to contain absolute positioned elements.

## 5. Motion

Classes referencing `transition-all duration-300` are common. We use a custom "Cinematic Easing" curve in `index.css`:
`cubic-bezier(0.32, 0.12, 0.0, 1)`

-   **Hover Effects**: Subtle scale (`hover:scale-105`) or brightness boosts.
-   **Entrance**: `animate-in fade-in slide-in-from-bottom-4` (using `tailwindcss-animate` utilities).

## 6. Developer Experience

### File Structure

-   `ui-src/src/components`: React components (PascalCase).
-   `ui-src/src/hooks`: Custom hooks.
-   `ui-src/src/utils`: Helper functions (camelCase).

### Iconography

-   Use **Lucide React** for all system icons.
-   **Toolbar Icons**: Standard size is `size={16}` for primary toolbars and `size={14}` for secondary/management clusters.
-   **Stroke Weight**: Default (2px). Revert any ad-hoc weight increases (e.g., 2.5px) to maintain the "Technical Cinematic" baseline.

## 7. The Studio Workbench

The Color Studio is a specialized high-fidelity environment. It adheres to specific "Workbench Parity" rules.

### Toolbar Parity

-   **Height**: All main toolbars (Harmony, PickerMode, Docked) must be exactly **42px** (`h-[42px]`) to maintain visual rhythm.
-   **Glass Effect**: Use `backdrop-blur-xl` for deeper depth separation.
-   **Active State Overlays**: Use `bg-white/10`, `ring-1 ring-white/20`, and `scale-110`. Buttons must be strictly circular (e.g., `w-8 h-8` with `gap-2`).

### Hierarchical Precision

-   **Z-Index Layering**: Interactive handles (e.g., Harmony circles) sit at **z-40** to pass _in front_ of docked toolbars (**z-30**).
-   **Hex Display Pill**:
    -   **Sizing**: Must be exactly **50% of the parent toolbar height** (e.g., 21px height).
    -   **Dynamics**: Must show **real-time hover values** when a picking instrument is active.

### Interaction Model

-   **Unified Cursors**:
    -   **Instruments**: Use `cursor-crosshair` for precision instrument interaction.
    -   **Feedback**: Color picker instrumentos should provide a magnifier/ring feedback loop centered on the pick point.
-   **Pointer Event Decoupling**: Large absolute containers for pickers should use `pointer-events-none` on the container, with `pointer-events-auto` strictly on the interactive nodes. This ensures toolbars behind the handles remain clickable.

### Motion / Fluid Mode

The "Fluid" picker introduces a dynamic, generative interactions layer:

-   **Visuals**: Uses a "Bloom" layout with multi-ring gradients and orbiting particles.
-   **Feedback**: Cursor interaction triggers a localized "gravity well" effect, expanding particles and changing their opacity based on proximity (`150px` radius).
-   **Controls**: Slider inputs map to generative parameters (`Density` = Particle Count, `Size` = Particle Radius) rather than direct color values.

---

## 8. Interaction Zones & Sampling

Specialized rules for the `SharedSampler` and its interaction with the UI workspace.

### Zone Isolation

To prevent accidental data capture, the UI is divided into strict interaction zones:

-   **Safe Zones (Toolbars)**: All control surfaces (Harmony Toolbar, Mode Selectors, Docked Sliders, Bottom Utility Bar) must use `e.stopPropagation()` to prevent clicks from bubbling to the canvas/sampler layer.
-   **Active Zones (Canvas)**: Only the dedicated instrument area (Wheel, Fluid field, Image Canvas) should trigger sampling events.

### Programmatic vs. User Intent

When updating state via UI controls (sliders, reset buttons) while a Sampler is active:

-   **Rule**: Programmatic value changes (e.g., sliding a saturation slider) must be flagged with `{ skipRecording: true }` to prevent flooding the sampler history with intermediate values.
-   **Intent**: Only explicit clicks on the canvas or specific "color commits" should be recorded as samples.

### Manual Mode Persistence

User preferences for advanced modes must be respected across sessions:

-   **Visibility**: If a user collapses UI sections (e.g., Manual Mode color cards), this state is persisted in `SoloistContext` to maintain their preferred workspace density.
-   **Scope**: Hidden states apply strictly to Manual Mode; other modes (Complementary, Triadic) force full visibility to ensure all generated colors are accessible.

---

---

## 9. Protected Patterns (Anti-Regression)

Features in this section have been tuned to a high degree of polish. **Do not refactor** these patterns without explicit justification, as simplifications often break the intended "Cinematic" experience.

### SharedSampler "Satellite" Physics

-   **Structure**: Must use a dual-motion system (Parent rotates CW, Child rotates CCW) to keep the particle upright while orbiting.
-   **Anti-Pattern**: Replacing this with a simple CSS `rotate` spin, which causes the inner content (like delete badges) to rotate improperly.
-   **Iconography**: The sampler icon is **Target** (`lucide-target`), not `Orbit`.

### Global State vs. Local State

-   **Context**: `SoloistContext` is the source of truth for global session state (e.g., Image Zoom, Manual Mode Visibility, Sampler History).
-   **Rule**: Do not move this state back into local components (`ColorCreator`, `ColorControlPanel`) as it breaks persistence between tab switches (e.g., losing your work when switching to "Explore").

### Component & Type Integrity

-   **Strict Typing**: Use shared interfaces like `UserLibrary` (from `types.ts`) instead of loose ad-hoc types (`LibraryData`). Ad-hoc typing leads to build failures during integration.
-   **Restoration**: If a file is found to be empty or missing during a refactor, it must be **restored** from the most complex known state, not recreated as a stub.

---

_Generated by Antigravity_

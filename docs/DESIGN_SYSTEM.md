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
| **Display** | Satoshi        | `font-display` | Large key numbers, stats, feature highlights |
| **Code**    | JetBrains Mono | `font-mono`    | Code snippets, hex values, technical data    |

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

Use `.custom-scrollbar` on scrollable containers for a consistent, minimal interface (6px width, glass thumb).

## 3. Component Library Guidelines

### Buttons

Buttons generally follow these styles (though currently implemented as ad-hoc classes, they should standardize to):

-   **Glass Button** (Standard): `bg-white/5 hover:bg-white/10 text-white border border-white/5`
-   **Ghost Button** (Secondary): `text-gray-500 hover:text-white`
-   **Icon Button**: `p-2 rounded-full hover:bg-white/10`
    75:
    76: > [!CAUTION]
    77: > **Disabled State Cursor**: Do NOT use `cursor-not-allowed` on disabled buttons. Users find the cursor style change on hover aesthetically displeasing. Maintain the standard cursor (or `cursor-default`) but indicate disabled state via opacity (e.g., `opacity-50`) and removing pointer events or hover styles.

### Inputs

Inputs typically use transparent backgrounds with glass borders to blend into the "Void".

-   **Standard**: `bg-black/20 border border-white/10 rounded-lg focus:border-accent-cyan`

### Text & Messaging Conventions

Consistent text casing and punctuation improves clarity and polish.

-   **Tooltips**: Title Case, no end-of-line punctuation.
    -   Examples: `Move Up`, `Edit Group Name and Description`
-   **Validator error messages**: Sentence case with end-of-line punctuation.
    -   Examples: `Color name must be unique.`, `Group name must be unique.`

### Micro-Interactions

> [!IMPORTANT]
> Consistency in micro-interactions is critical for the "premium" feel.

#### Heart Toggle (Favorites)

Must handle asynchronous API latency (metadata generation) gracefully.

-   **State 1 (Default)**: Outline icon (`lucide-heart`).
-   **State 2 (Pending)**: Animate scale/pulse while awaiting API response.
-   **State 3 (Active)**: Filled icon (`fill-red-500`) with "pop" animation.
-   **Rule**: Never snap instantly without feedback; use the animation to bridge the API delay.

#### Copy Actions

All copy buttons must use a standardized feedback loop.

-   **Icon Swap**: `Copy` -> `Check` (`text-green-500`).
-   **Duration**: Return to default state after 2000ms.
-   **Animation**: Smooth fade/scale transition (aligns with `transition-all duration-300`).

#### Toasts & Feedback

Feedback messages must be explicit.

-   **Requirement**: Display the _actual value_ acted upon.
    -   _Incorrect_: "Copied to clipboard"
    -   _Correct_: "Copied **#3D8BFF** to clipboard"

#### Inline Edits

Inline editing should prioritize quick confirmation without navigation friction.

-   **Enter**: Submits the current field if valid (e.g., Group Name), applies changes, and exits edit mode.
-   **Escape**: Cancels edits, restores previous values, and exits edit mode.
-   **Validation**: Prevent submission if invalid and surface a validator message following the conventions above.

## 4. Layout & Spacing

### The Grid

-   **Base Unit**: 4px.
-   **Common Padding**: `p-4` (16px) for panels, `p-6` (24px) for main views.
-   **Gap**: `gap-4` is the standard rhythm between related elements.

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
-   Standard size is `size={16}` or `size={18}` for UI controls.
-   Stroke width: Default (2px).

---

_Generated by Antigravity_

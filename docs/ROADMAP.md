# Soloist OS — Development Roadmap

**Current Version:** v0.9 (Alpha)
**Last Updated:** Dec 19, 2025
**Focus:** Infrastructure & "The Void" Aesthetic

---

## ✅ Phase 1: The "Void" Foundation (Completed)

-   [x] **Design Language:** Implemented "Void" theme, Hubballi font, and Z-Axis depth shadows in Tailwind.
-   [x] **Navigation:** Sidebar routing between Tokens, Knowledge, and Export views.
-   [x] **AI Slider:** UI for toggling between Silent/Guide/Teacher modes.

## 🚧 Phase 2: Core Modules (Current Status)

### 🎨 Color Token Engine

-   [x] **Visualizer:** 3D "Monolith" columns for color ramps. **\[FUNCTIONAL\]**
-   [x] **Contrast Math:** Local logic to check contrast ratios. **\[FUNCTIONAL\]**
-   [x] **Figma Sync:** `code.tsx` backend to create Variables from Hex codes. **\[FUNCTIONAL\]**
-   [x] **Ramp Generation:** Logic to auto-generate lighter/darker shades based on a seed color. **\[FUNCTIONAL\]**
-   [x] **Locking:** Ability to lock a color and randomize the rest. **\[FUNCTIONAL\]**

### 🧠 Knowledge Base

-   [x] **UI Layout:** Journal/Cheatsheet tabs and search bar. **\[FUNCTIONAL\]**
-   [x] **Local Storage:** `useSoloistSystem` hook persists data to browser `localStorage`. **\[FUNCTIONAL\]**
-   [ ] **GitHub Sync:** Logic to push/pull from Gists. **\[STUBBED\]**
-   [ ] **Rich Text Editor:** Ability to write actual content (currently readonly/mock data). **\[MOCKUP\]**

### 💻 Export Terminal

-   [x] **UI Layout:** IDE-style window with syntax highlighting. **\[UI ONLY\]**
-   [x] **Code Generation:** Switch between CSS/JSON/Swift. **\[FUNCTIONAL\]**
-   [x] **Live State Connection:** Connect Export view to the actual `ramp` state from the Token Engine. **\[FUNCTIONAL\]**

---

## 📅 Phase 3: Intelligence & Expansion (Current Status)

-   [x] **State Management:** Lift color state to `App.tsx` so Export Terminal sees live changes.
-   [x] **Real-time Color Logic:** Connect visualizer to `colord` library.
-   [x] **Typography Module:** Build the Font Scale visualizer.
-   [x] **Sizing Module:** Build the Spacing/Radius visualizer.
-   [x] **Lab Consolidation:** Integrated "The Lab" tools (Generator, Contrast, Mixer) into domain-specific Ateliers.
-   [x] **Color Studio:** Unified creation, harmony, and preset library.
-   [x] **Robust Clipboard:** Cross-environment copy support (Figma/Web).
-   [x] **Presets Library:** "Explore" tab with selectable color sets.
-   [x] **Input Validation:** Inline validation for Group Renaming and Color Inspector (Duplicate/Empty checks).
-   [x] **Design System Polish:** Refined cursor behaviors and disabled states (No `cursor-not-allowed`).
-   [x] **Design System Compliance (Dec 19, 2025):**
    -   Removed all inline `style` props across components (ColorLibrary, AssistantPanel, TheLab, ColorControlPanel, ColorMixer, TypeSandbox, OrganizeView)
    -   Replaced inline `backgroundColor` with SVG `<rect fill={color} />` elements
    -   Replaced inline `color` and `fontFamily` styles with CSS variable classes
    -   Standardized all tooltips to Title Case without end punctuation
    -   Standardized all validator messages to Sentence case with end punctuation
    -   Added accessible labels (`title`, `aria-label`, `placeholder`) to all form elements and icon buttons
    -   Updated inline edit behavior: Enter key submits, Escape cancels
    -   ESLint v9 flat config with TypeScript support and design system rules
    -   VS Code workspace settings for proper error flagging/ignoring
-   [x] **Color Studio UX Refinements (Dec 20, 2025):**
    -   Hex validation with live preview (6-char only, no # symbol)
    -   Text-color-based heart toggle contrast pattern across all swatches
    -   Optimized RGB/HSL/HSB spacing (gap-1 labels, gap-3 values)
    -   Consistent palette preview dividers (bg-white/20)
    -   Primary card button alignment with secondary/tertiary (14px icons)
    -   Clean error UX (visual feedback only, no inline messages)

---

## 🧷 The drift-killer: a live co-design loop (human + agent, same page)

Goal: eliminate “working independently on co-dependent components.”

### 1) Pick a single source-of-truth surface in Figma

Not “the whole file.” One canonical frame and a small set of primitives.

- `01_PRIMITIVES`: `Button`, `IconButton`, `Card`, `Input`, `Slider`, `Tabs`
- `03_SHELL`: `Shell / Default` (one canonical layout frame)

Everything else can evolve later.

### 2) Turn selections into structured, scrapeable facts (not vibes)

When you select a node (e.g. `Button`), we extract:

- component name + variant properties
- layout signals (auto-layout / constraints)
- token usage (variable bindings for color/spacing/radius/typography)
- styles used (text/effect)
- (optional) screenshot for quick review

This becomes a machine-readable **contract** that lives in the repo.

### 3) Map design nodes to code components (one-time wiring)

Once a Figma component is mapped to a code component, the agent can:

- inspect the selected node
- jump to the exact React primitive source file
- confirm props/variants match the design
- propose a patch that moves code toward design (not vice versa)

No handoff. No interpretation layer. No drift.

### 4) Add design snapshots/contracts to the repo

Example artifact paths:

- `design/contracts/primitives/Button.contract.json`
- `design/contracts/shell/ShellDefault.contract.json`
- `design/contracts/tokens/color.tokens.json`

Then we can validate continuously (locally and later in CI):

- do code props match design properties?
- do required variables/styles exist and are they referenced?
- did someone add a new variant in code without adding it in Figma (or vice versa)?

This makes drift detectable immediately.

### 5) Work in thin slices

Instead of rebuilding everything, iterate like:

Token (variable exists) → Primitive → Composition → Shell

Each slice ends with:

- updated contract file(s)
- checks passing

### What Soloist can automate

The plugin should own the “airlock eliminator” actions:

- Export selected component contract
- Export shell contract
- Validate current file against repo contracts
- Show drift report (what changed: props/tokens/layout)

### 🔎 Bulk Edit Safety (Proposed refinement)

-   [ ] **Rendered Preview for Bulk Changes ("sandbox")**
    -   Goal: before any destructive or wide-impact operation, show a *visual*, side-by-side preview ("Before" vs "After") inside the Figma canvas.
    -   Why: table-style diffs reduce errors, but a rendered preview is the highest-confidence UX for bulk edits.
    -   Feasible approach (non-destructive):
        1. Duplicate a user-selected frame/component set into a `99_PREVIEW` page.
        2. Create `Soloist / Preview/*` variable collections mirroring the starter-kit collections.
        3. Rebind variable usages on the duplicated nodes to the preview variables.
        4. Apply the proposed bulk change *only* to preview variables (or preview styles), so the original document remains unchanged.
        5. Provide explicit actions: **Apply for real** (run the actual operation), **Discard preview** (delete the preview page/collections).
    -   Phase 1 (lighter-weight): show a structured diff + counts + sampled impacted items (already partially supported via dry-run).
    -   Phase 2 (full gift): rendered preview sandbox for value-affecting edits (color/spacing/typography/shadows).

---

## 🔮 Phase 4: The "Soul" (Future)

-   [ ] **OpenAI Integration:** Replace local "Teacher" logic with LLM-based design critiques.
-   [ ] **Cloud Sync:** Multi-user collaboration via Supabase.
-   [ ] **VS Code Extension:** Companion extension to read the synced JSON.

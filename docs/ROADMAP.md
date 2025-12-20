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

## 🔮 Phase 4: The "Soul" (Future)

-   [ ] **OpenAI Integration:** Replace local "Teacher" logic with LLM-based design critiques.
-   [ ] **Cloud Sync:** Multi-user collaboration via Supabase.
-   [ ] **VS Code Extension:** Companion extension to read the synced JSON.

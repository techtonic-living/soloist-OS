# Soloist OS — Development Roadmap

**Current Version:** v0.9 (Alpha)
**Last Updated:** Dec 10, 2025
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

---

## 🔮 Phase 4: The "Soul" (Future)

-   [ ] **OpenAI Integration:** Replace local "Teacher" logic with LLM-based design critiques.
-   [ ] **Cloud Sync:** Multi-user collaboration via Supabase.
-   [ ] **VS Code Extension:** Companion extension to read the synced JSON.

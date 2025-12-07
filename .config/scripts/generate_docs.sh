#!/bin/bash

# ==========================================
# SOLOIST OS - Documentation Generator
# ==========================================

echo "Initializing Documentation for Soloist OS..."

# 1. GENERATE PRD.md
cat << 'EOF' > PRD.md
# Soloist OS — Product Requirements Document

## 1. Product Vision
**Soloist OS** is an elite, ultramodern "Operating System" for Design System Architects and Full-Stack Developers. Unlike traditional plugin tools that feel like widgets, Soloist acts as an immersive IDE within Figma. It bridges the gap between **Visual Design** (Figma), **Documentation** (Knowledge Base), and **Code** (VS Code/GitHub).

## 2. Aesthetic Direction & UX
*   **Theme:** "The Void" & "Monolith". Deepest blacks (`#050505`), cinematic top-down lighting, Z-axis depth, and neon accents.
*   **Typography:** *Hubballi* (Brand/Headings) for a futuristic, organic feel; *Inter* (UI) for legibility; *JetBrains Mono* (Code).
*   **Motion:** Slow, cinematic easing (`cubic-bezier(0.32, 0.12, 0.0, 1)`). Parallax effects on hover to denote "physicality" of digital objects.
*   **AI Persona:** "The Architect." Adjustable personality from Silent -> Co-Pilot (Guide) -> Professor (Teacher).

## 3. Core Functional Pillars

### A. The Token Engine (Foundations)
*   **Color Monoliths:** 3D visualization of color ramps.
*   **Logic:** Local calculation of WCAG Contrast.
*   **Sync:** Direct binding to Figma Local Variables.
*   **Generative:** Ability to lock specific colors and roll gradients for the rest (Future).

### B. The Knowledge Base (Second Brain)
*   **Dual Mode:** "Journal" (Process notes) vs. "Cheatsheets" (Syntax/Reference).
*   **Storage Strategy:**
    1.  *Tier 1:* LocalStorage (Browser/Figma Client) - MVP.
    2.  *Tier 2:* GitHub Gist Sync (User's Personal Repo).
    3.  *Tier 3:* Supabase/Cloud (Team Sync - Future).
*   **Visuals:** Card-based UI with metadata and search.

### C. The Dev Terminal (Export)
*   **Syntax Highlighting:** Real-time code preview.
*   **Multi-Language:** CSS Variables, JSON (Design Tokens format), Swift/SwiftUI.
*   **Clipboard Action:** One-click export.

### D. The AI Layer
*   **Context Awareness:** Analyzes currently selected tokens/contrast.
*   **Education:** "Teacher Mode" explains *why* a design choice is accessible or aesthetic.
*   **Efficiency:** Local logic preferred over API calls to reduce cost/latency.

## 4. Technical Stack
*   **Framework:** React 19 + Vite.
*   **Styling:** Tailwind CSS (Custom Config).
*   **Animation:** Framer Motion.
*   **Host:** Figma Plugin API (Sandbox).
*   **Icons:** Lucide React.
EOF

# 2. GENERATE README.md
cat << 'EOF' > README.md
# Soloist OS

> *And then there was one.*

**Soloist OS** is a cinematic, high-utility Figma plugin for orchestrating design systems. It combines token management, developer documentation, and AI-assisted design education into a single "Monolith" interface.

![Soloist Banner](https://via.placeholder.com/1200x600/050505/333333?text=SOLOIST+OS)

## ⚡ Quick Start

### Prerequisites
*   Node.js 18+
*   Figma Desktop App

### Installation
1.  **Clone** the repository.
2.  **Install dependencies**:
    ```bash
    npm install
    cd ui-src && npm install
    ```
3.  **Build the Plugin Backend**:
    ```bash
    npm run build:plugin
    ```
4.  **Start the UI Server** (Keep this terminal running):
    ```bash
    npm run dev:ui
    ```

### Running in Figma
1.  Open Figma.
2.  `Right Click` > `Plugins` > `Development` > `Import plugin from manifest...`
3.  Select `plugin/manifest.json`.

## 🏗 Architecture

*   **`ui-src/`**: The React Frontend.
    *   `src/components/`: Monolith UI components.
    *   `src/hooks/`: State logic (Storage, AI).
    *   `tailwind.config.js`: The "Void" theme configuration.
*   **`plugin/`**: The Figma Backend.
    *   `code.tsx`: Handles Variable creation and node manipulation.

## 🎨 Design System
*   **Font:** Hubballi (Display), Inter (UI).
*   **Key Color:** `#0B0D12` (Void).
*   **Interaction:** Z-Axis parallax on all interactive elements.

## 🤝 Contributing
Built for the **Aura Design System** ecosystem.
Repo: https://github.com/techtonic-living/soloist-os
EOF

# 3. GENERATE ROADMAP.md
cat << 'EOF' > ROADMAP.md
# Soloist OS — Development Roadmap

**Current Version:** v0.9 (Alpha)
**Last Updated:** Dec 07, 2025
**Focus:** Infrastructure & "The Void" Aesthetic

---

## ✅ Phase 1: The "Void" Foundation (Completed)
*   [x] **Design Language:** Implemented "Void" theme, Hubballi font, and Z-Axis depth shadows in Tailwind.
*   [x] **Navigation:** Sidebar routing between Tokens, Knowledge, and Export views.
*   [x] **AI Slider:** UI for toggling between Silent/Guide/Teacher modes.

## 🚧 Phase 2: Core Modules (Current Status)

### 🎨 Color Token Engine
*   [x] **Visualizer:** 3D "Monolith" columns for color ramps. **[FUNCTIONAL]**
*   [x] **Contrast Math:** Local logic to check contrast ratios. **[FUNCTIONAL]**
*   [x] **Figma Sync:** `code.tsx` backend to create Variables from Hex codes. **[FUNCTIONAL]**
*   [ ] **Ramp Generation:** Logic to auto-generate lighter/darker shades based on a seed color. **[MOCKUP - Hardcoded Data]**
*   [ ] **Locking:** Ability to lock a color and randomize the rest. **[UI ONLY]**

### 🧠 Knowledge Base
*   [x] **UI Layout:** Journal/Cheatsheet tabs and search bar. **[FUNCTIONAL]**
*   [x] **Local Storage:** `useSoloistSystem` hook persists data to browser `localStorage`. **[FUNCTIONAL]**
*   [ ] **GitHub Sync:** Logic to push/pull from Gists. **[STUBBED]**
*   [ ] **Rich Text Editor:** Ability to write actual content (currently readonly/mock data). **[MOCKUP]**

### 💻 Export Terminal
*   [x] **UI Layout:** IDE-style window with syntax highlighting. **[UI ONLY]**
*   [x] **Code Generation:** Switch between CSS/JSON/Swift. **[MOCKUP - Hardcoded Strings]**
*   [ ] **Live State Connection:** Connect Export view to the actual `ramp` state from the Token Engine. **[CRITICAL DISCONNECT]**

---

## 📅 Phase 3: Intelligence & Expansion (Next Up)
*   [ ] **State Management:** Lift color state to `App.tsx` so Export Terminal sees live changes.
*   [ ] **Real-time Color Logic:** Connect visualizer to `colord` library.
*   [ ] **Typography Module:** Build the Font Scale visualizer.
*   [ ] **Sizing Module:** Build the Spacing/Radius visualizer.

---

## 🔮 Phase 4: The "Soul" (Future)
*   [ ] **OpenAI Integration:** Replace local "Teacher" logic with LLM-based design critiques.
*   [ ] **Cloud Sync:** Multi-user collaboration via Supabase.
*   [ ] **VS Code Extension:** Companion extension to read the synced JSON.
EOF

echo "✅ Documentation successfully generated."
echo "   - PRD.md"
echo "   - README.md"
echo "   - ROADMAP.md"
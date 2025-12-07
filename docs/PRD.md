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

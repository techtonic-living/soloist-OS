# Soloist OS

> _And then there was one._

**Soloist OS** is a cinematic, high-utility Figma plugin for orchestrating design systems. It combines token management, developer documentation, and AI-assisted design education into a single "Monolith" interface.

![Soloist Banner](https://via.placeholder.com/1200x600/050505/333333?text=SOLOIST+OS)

## 🌟 Key Features (v0.9)

-   **Color Studio**: Unified creator with harmony generation, presets, and accessibility checks.
-   **The Monolith**: 3D token visualization engine.
-   **Assistant**: "Teacher Mode" AI that explains design theory as you work.
-   **Figma Native**: Runs directly as a plugin with robust variable syncing and clipboard support.

## ⚡ Quick Start

### Prerequisites

-   Node.js 18+
-   Figma Desktop App

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
3.  Select `manifest.json`.

## 🏗 Architecture

-   **`ui-src/`**: The React Frontend.
    -   `src/components/`: Monolith UI components.
    -   `src/hooks/`: State logic (Storage, AI).
    -   `tailwind.config.js`: The "Void" theme configuration.
-   **`plugin/`**: The Figma Backend.
    -   `code.tsx`: Handles Variable creation and node manipulation.

## 🎨 Design System

-   **Font:** Hubballi (Display), Inter (UI).
-   **Key Color:** `#0B0D12` (Void).
-   **Interaction:** Z-Axis parallax on all interactive elements.

## 🤝 Contributing

Built for the **Aura Design System** ecosystem.
Repo: https://github.com/techtonic-living/soloist-os

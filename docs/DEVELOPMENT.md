# Soloist OS Development Guide

This document tracks technical "gotchas," setup requirements, and troubleshooting steps to maintain development velocity.

## 🔑 Environment Setup

### Gemini AI API

The Assistant and metadata features require a Google Gemini API Key.

1. Create a `.env` file in `ui-src/`.
2. Add the following key:
    ```env
    VITE_GEMINI_API_KEY=your_key_here
    ```
3. **Note on Models**: Use `gemini-2.5-flash-lite` for optimal speed and reliability with the current internal configuration. Do not use `-latest` suffixes unless confirmed via terminal testing.

## 🛠 Troubleshooting

### Stale Plugin UI

If changes in the React code (`ui-src`) are not appearing in Figma:

1. **Use the correct plugin dev loop** (recommended):
        - **Dist-based (matches shipping plugin)**: run `npm run dev:plugin`.
            This continuously rebuilds:
            - `ui-src/dist/` (what the plugin UI loads)
            - `dist/code.js` (the plugin backend)
        - **Live UI (fastest iteration)**: import `manifest.dev.json` in Figma and run `npm run dev:plugin:live`.
            This serves the UI from Vite (`http://localhost:5173`) while still watching the plugin backend.

2. **Force a Clean Build**:
    ```bash
    npm run build
    ```
3. **The "Watch" Trap**: Running `npm run watch` starts a Vite dev server at `localhost:5173`, but `manifest.json` points to `ui-src/dist/index.html`. Figma will **not** see your live changes unless you run the dist watcher (`npm run dev:plugin`) or switch to the live manifest (`manifest.dev.json`).
4. **Live Dev Mode (Optional)**: To see changes instantly without rebuilding, either import `manifest.dev.json` *or* temporarily change `manifest.json`:
    ```json
    "ui": "http://localhost:5173"
    ```
    _Note: Remember to revert this before sharing the plugin!_
5. **Figma Cache**: Use `Cmd + Opt + P` to re-run the last plugin, which usually forces a refresh.

### Gemini API 403/404 Errors

-   **403 (Forbidden)**: Usually means the `VITE_GEMINI_API_KEY` is missing or invalid. Check the console for "API Key present: false".
-   **404 (Not Found)**: Usually means the **Model Name** is incorrect. Verify the model exists using:
    ```bash
    curl "https://generativelanguage.googleapis.com/v1beta/models?key=$YOUR_KEY"
    ```

## 🏗 Build Architecture

-   **Backend (`plugin/code.tsx`)**: Bundled via `esbuild` into `dist/code.js`.
-   **Frontend (`ui-src/`)**: Built via `Vite` into `ui-src/dist/index.html`.
-   **Note**: `manifest.json` points to `ui-src/dist/index.html`. Any change in build paths must be reflected in the manifest you imported into Figma.

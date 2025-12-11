---
description: How to build and import the plugin into Figma
---

1. **Build the Plugin**:
   Run the following command in your terminal to build both the plugin logic and the UI:

    ```bash
    npm run build
    ```

2. **Import into Figma**:

    - Open the **Figma Desktop App**.
    - Open any design file.
    - Go to **Main Menu** (Figma logo) > **Plugins** > **Development** > **Import plugin from manifest...**
    - Navigate to your project folder: `/Users/jessesmith/Library/Mobile Documents/com~apple~CloudDocs/Developer/soloist-OS`
    - Select the `manifest.json` file.

3. **Run the Plugin**:
    - Right-click on the canvas > **Plugins** > **Development** > **Soloist OS**.

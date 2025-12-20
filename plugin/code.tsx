console.log("PLUGIN: initializing...");
figma.showUI(__html__, { width: 1000, height: 700, themeColors: true });

// --- Types ---

type PluginMessage =
  | {
      type: "create-variables";
      payload: { colors: { name: string; hex: string }[] };
    }
  | {
      type: "create-text-styles";
      payload: {
        styles: {
          name: string;
          fontSize: number;
          lineHeight: number;
          fontFamily: string;
          fontWeight: string;
        }[];
      };
    }
  | {
      type: "create-spacing-variables";
      payload: { variables: { name: string; value: number }[] };
    }
  | {
      type: "create-semantic-variables";
      payload: {
        tokens: {
          name: string;
          values: { light: string; dark: string };
        }[];
      };
    }
  | {
      type: "sync-everything";
      payload: {
        colors: { name: string; hex: string }[];
        spacing: { name: string; value: number }[];
        textStyles: {
          name: string;
          fontSize: number;
          lineHeight: number;
          fontFamily: string;
          fontWeight: string;
        }[];
        semantics: {
          name: string;
          values: { light: string; dark: string };
        }[];
      };
    }
  | { type: "save-storage"; payload: { key: string; data: any } }
  | { type: "load-storage"; payload: { key: string } }
  | { type: "resize-ui"; payload: { width: number; height: number } };

// --- Helpers ---

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i.exec(
    hex
  );
  if (!result) return { r: 0, g: 0, b: 0 };
  return {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255,
    a: result[4] ? parseInt(result[4], 16) / 255 : 1,
  };
}

// --- Sync Functions ---

async function syncColors(colors: { name: string; hex: string }[]) {
  // Get or create collection
  const localCollections =
    await figma.variables.getLocalVariableCollectionsAsync();
  let collection = localCollections.find(
    (c) => c.name === "Soloist Primitives"
  );
  if (!collection) {
    collection = figma.variables.createVariableCollection("Soloist Primitives");
    collection.renameMode(collection.defaultModeId, "Value");
  }

  let count = 0;
  // Bulk fetch variables to optimize
  const existingVars = await figma.variables.getLocalVariablesAsync();

  for (const color of colors) {
    let variable = existingVars.find(
      (v) => v.name === color.name && v.variableCollectionId === collection?.id
    );

    if (!variable) {
      variable = figma.variables.createVariable(
        color.name,
        collection,
        "COLOR"
      );
    }

    const rgb = hexToRgb(color.hex);
    // Note: variable.setValueForMode expects r,g,b (0-1). If alpha is needed it might be different, but figma API handles RGBA objects usually?
    // Actually setValueForMode takes RGB or RGBA.
    // My hexToRgb returns {r,g,b, a}.
    variable.setValueForMode(collection.defaultModeId, rgb);
    count++;
  }
  return count;
}

async function syncSpacing(variables: { name: string; value: number }[]) {
  const localCollections =
    await figma.variables.getLocalVariableCollectionsAsync();
  let collection = localCollections.find(
    (c) => c.name === "Soloist Primitives"
  );
  if (!collection) {
    collection = figma.variables.createVariableCollection("Soloist Primitives");
  }

  const existingVars = await figma.variables.getLocalVariablesAsync();

  let count = 0;
  for (const v of variables) {
    const varName = `spacing/${v.name}`;
    let variable = existingVars.find(
      (existing) =>
        existing.name === varName &&
        existing.variableCollectionId === collection?.id
    );

    if (!variable) {
      variable = figma.variables.createVariable(varName, collection, "FLOAT");
    }

    variable.setValueForMode(collection.defaultModeId, v.value);
    count++;
  }
  return count;
}

async function syncTextStyles(
  styles: {
    name: string;
    fontSize: number;
    lineHeight: number;
    fontFamily: string;
    fontWeight: string;
  }[]
) {
  // Load fonts
  // Retrieve unique fonts to load
  const fontsToLoad = new Set<string>();
  styles.forEach((s) => fontsToLoad.add(`${s.fontFamily}-${s.fontWeight}`));
  // Also load defaults
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  await figma.loadFontAsync({ family: "Inter", style: "Bold" });
  await figma.loadFontAsync({ family: "Outfit", style: "Regular" }); // Likely used
  await figma.loadFontAsync({ family: "Outfit", style: "Bold" });

  let count = 0;
  const localStyles = await figma.getLocalTextStylesAsync();

  for (const style of styles) {
    let textStyle = localStyles.find((s) => s.name === style.name);

    if (!textStyle) {
      textStyle = figma.createTextStyle();
      textStyle.name = style.name;
    }

    textStyle.fontSize = style.fontSize;
    textStyle.fontName = {
      family: style.fontFamily || "Inter",
      style: style.fontWeight || "Regular",
    };

    // Line Height
    textStyle.lineHeight = { value: style.lineHeight * 100, unit: "PERCENT" };

    count++;
  }
  return count;
}

async function syncSemantics(
  tokens: { name: string; values: { light: string; dark: string } }[]
) {
  // 1. Get Primitives Collection (for Aliases)
  const localCollections =
    await figma.variables.getLocalVariableCollectionsAsync();
  const primCollection = localCollections.find(
    (c) => c.name === "Soloist Primitives"
  );
  if (!primCollection)
    throw new Error("Primitives collection not found. Sync primitives first.");

  const primVars = await figma.variables.getLocalVariablesAsync();

  // 2. Get/Create Tokens Collection
  let tokenCollection = localCollections.find(
    (c) => c.name === "Soloist Tokens"
  );
  if (!tokenCollection) {
    tokenCollection =
      figma.variables.createVariableCollection("Soloist Tokens");
    tokenCollection.renameMode(tokenCollection.defaultModeId, "Light");
    tokenCollection.addMode("Dark");
  }

  const lightModeId = tokenCollection.modes.find(
    (m) => m.name === "Light"
  )?.modeId;
  const darkModeId = tokenCollection.modes.find(
    (m) => m.name === "Dark"
  )?.modeId;

  if (!lightModeId || !darkModeId)
    throw new Error("Could not find Light/Dark modes.");

  let count = 0;
  for (const token of tokens) {
    // Find/Create Variable
    const vars = await figma.variables.getLocalVariablesAsync();
    let variable = vars.find(
      (v) =>
        v.name === token.name && v.variableCollectionId === tokenCollection?.id
    );

    if (!variable) {
      variable = figma.variables.createVariable(
        token.name,
        tokenCollection,
        "COLOR"
      );
    }

    // Resolve Aliases
    // Light Value
    const lightPrimName = token.values.light;
    const lightTarget = primVars.find(
      (v) =>
        v.name === lightPrimName && v.variableCollectionId === primCollection.id
    );

    if (lightTarget) {
      variable.setValueForMode(lightModeId, {
        type: "VARIABLE_ALIAS",
        id: lightTarget.id,
      });
    } else {
      // Fallback if primitive not found? Use hex? For now skip or error.
      // We could pass explicit hex fallback in payload if needed.
      // Assuming primitive exists if creation succeeded.
    }

    // Dark Value
    const darkPrimName = token.values.dark;
    const darkTarget = primVars.find(
      (v) =>
        v.name === darkPrimName && v.variableCollectionId === primCollection.id
    );

    if (darkTarget) {
      variable.setValueForMode(darkModeId, {
        type: "VARIABLE_ALIAS",
        id: darkTarget.id,
      });
    }

    count++;
  }
  return count;
}

// --- Main Handler ---

figma.ui.onmessage = async (msg: PluginMessage) => {
  // Individual handlers
  if (msg.type === "create-variables") {
    try {
      const count = await syncColors(msg.payload.colors);
      figma.notify(`Synced ${count} color variables.`);
    } catch (e: any) {
      console.error("PLUGIN: Error syncing colors", e);
      figma.notify("Error: " + e.message, { error: true });
    }
  }

  if (msg.type === "create-text-styles") {
    try {
      const count = await syncTextStyles(msg.payload.styles);
      figma.notify(`Synced ${count} text styles.`);
    } catch (e: any) {
      console.error("PLUGIN: Error syncing text styles", e);
      figma.notify("Error: " + e.message, { error: true });
    }
  }

  if (msg.type === "create-spacing-variables") {
    try {
      const count = await syncSpacing(msg.payload.variables);
      figma.notify(`Synced ${count} spacing variables.`);
    } catch (e: any) {
      console.error("PLUGIN: Error syncing spacing", e);
      figma.notify("Error: " + e.message, { error: true });
    }
  }

  if (msg.type === "create-semantic-variables") {
    try {
      const count = await syncSemantics(msg.payload.tokens);
      figma.notify(`Synced ${count} semantic tokens.`);
    } catch (e: any) {
      console.error("PLUGIN: Error syncing semantics", e);
      figma.notify("Error: " + e.message, { error: true });
    }
  }

  // Sync Everything Handler
  if (msg.type === "sync-everything") {
    try {
      figma.notify("Starting Sync...");

      // 1. Primitives (Colors & Spacing)
      const colorCount = await syncColors(msg.payload.colors);
      const spacingCount = await syncSpacing(msg.payload.spacing);

      // 2. Styles
      const textCount = await syncTextStyles(msg.payload.textStyles);

      // 3. Semantics (Dependent on Primitives)
      const semanticCount = await syncSemantics(msg.payload.semantics);

      figma.notify(
        `Sync Complete: ${colorCount} Colors, ${spacingCount} Spacing, ${textCount} Styles, ${semanticCount} Semantics.`
      );

      // Optional: send success message back to UI
      figma.ui.postMessage({ type: "sync-complete" });
    } catch (e: any) {
      console.error("PLUGIN: Sync Everything Error", e);
      figma.notify("Sync Error: " + e.message, { error: true });
      figma.ui.postMessage({ type: "sync-error", message: e.message });
    }
  }

  if (msg.type === "save-storage") {
    const { key, data } = msg.payload;
    await figma.clientStorage.setAsync(key, data);
  }

  if (msg.type === "load-storage") {
    const { key } = msg.payload;
    const data = await figma.clientStorage.getAsync(key);
    figma.ui.postMessage({
      type: "storage-loaded",
      payload: { key, data },
    });
  }

  if (msg.type === "resize-ui") {
    const { width, height } = msg.payload;
    figma.ui.resize(width, height);
  }
};

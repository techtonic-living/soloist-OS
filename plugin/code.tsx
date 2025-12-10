console.log("PLUGIN: initializing...");
figma.showUI(__html__, { width: 1000, height: 700, themeColors: true });

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
	| { type: "save-storage"; payload: { key: string; data: any } }
	| { type: "load-storage"; payload: { key: string } };

figma.ui.onmessage = async (msg: PluginMessage) => {
	if (msg.type === "create-variables") {
		try {
			const { colors } = msg.payload;
			// Get or create collection
			const localCollections =
				await figma.variables.getLocalVariableCollectionsAsync();
			let collection = localCollections.find(
				(c) => c.name === "Soloist Primitives"
			);
			if (!collection) {
				collection =
					figma.variables.createVariableCollection(
						"Soloist Primitives"
					);
				collection.renameMode(collection.defaultModeId, "Value");
			}

			let count = 0;
			for (const color of colors) {
				const vars = await figma.variables.getLocalVariablesAsync();
				let variable = vars.find(
					(v) =>
						v.name === color.name &&
						v.variableCollectionId === collection?.id
				);

				if (!variable) {
					variable = figma.variables.createVariable(
						color.name,
						collection,
						"COLOR"
					);
				}

				const rgb = hexToRgb(color.hex);
				variable.setValueForMode(collection.defaultModeId, rgb);
				count++;
			}
			figma.notify(`Synced ${count} color variables.`);
		} catch (e: any) {
			console.error("PLUGIN: Error syncing colors", e);
			figma.notify("Error: " + e.message, { error: true });
		}
	}

	if (msg.type === "create-text-styles") {
		try {
			const { styles } = msg.payload;
			// Load base font - assuming Inter for now as it's standard.
			// In a real app we'd pass the font family as well.
			await figma.loadFontAsync({ family: "Inter", style: "Regular" });
			await figma.loadFontAsync({ family: "Inter", style: "Bold" });

			let count = 0;
			for (const style of styles) {
				const localStyles = await figma.getLocalTextStylesAsync();
				let textStyle = localStyles.find((s) => s.name === style.name);

				if (!textStyle) {
					textStyle = figma.createTextStyle();
					textStyle.name = style.name;
				}

				textStyle.fontSize = style.fontSize;
				// Figma API requires fontName to be set before other properties
				textStyle.fontName = {
					family: "Inter",
					style:
						style.name.includes("Display") ||
						style.name.includes("Heading")
							? "Bold"
							: "Regular",
				};

				// Line Height - simple heuristic
				textStyle.lineHeight = { value: 120, unit: "PERCENT" };

				count++;
			}
			figma.notify(`Synced ${count} text styles.`);
		} catch (e: any) {
			console.error("PLUGIN: Error syncing text styles", e);
			figma.notify("Error syncing text: " + e.message, { error: true });
		}
	}

	if (msg.type === "create-spacing-variables") {
		try {
			const { variables } = msg.payload;
			// Reuse collection or create new? Let's use the same "Soloist Primitives"
			const localCollections =
				await figma.variables.getLocalVariableCollectionsAsync();
			let collection = localCollections.find(
				(c) => c.name === "Soloist Primitives"
			);
			if (!collection) {
				collection =
					figma.variables.createVariableCollection(
						"Soloist Primitives"
					);
			}

			let count = 0;
			for (const v of variables) {
				const vars = await figma.variables.getLocalVariablesAsync();
				const varName = `spacing/${v.name}`;
				let variable = vars.find(
					(existing) =>
						existing.name === varName &&
						existing.variableCollectionId === collection?.id
				);

				if (!variable) {
					variable = figma.variables.createVariable(
						varName,
						collection,
						"FLOAT"
					);
				}

				variable.setValueForMode(collection.defaultModeId, v.value);
				count++;
			}
			figma.notify(`Synced ${count} spacing variables.`);
		} catch (e: any) {
			console.error("PLUGIN: Error syncing spacing", e);
			figma.notify("Error syncing spacing: " + e.message, {
				error: true,
			});
		}
	}

	if (msg.type === "create-semantic-variables") {
		try {
			const { tokens } = msg.payload;

			// 1. Get Primitives Collection (for Aliases)
			const localCollections =
				await figma.variables.getLocalVariableCollectionsAsync();
			const primCollection = localCollections.find(
				(c) => c.name === "Soloist Primitives"
			);
			if (!primCollection)
				throw new Error(
					"Primitives collection not found. Sync primitives first."
				);

			const primVars = await figma.variables.getLocalVariablesAsync(); // Get all to search

			// 2. Get/Create Tokens Collection
			let tokenCollection = localCollections.find(
				(c) => c.name === "Soloist Tokens"
			);
			if (!tokenCollection) {
				tokenCollection =
					figma.variables.createVariableCollection("Soloist Tokens");
				tokenCollection.renameMode(
					tokenCollection.defaultModeId,
					"Light"
				); // Rename default
				tokenCollection.addMode("Dark"); // Add Dark mode
			}

			// Ensure we have Light and Dark mode IDs
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
				const vars = await figma.variables.getLocalVariablesAsync(); // Refresh
				let variable = vars.find(
					(v) =>
						v.name === token.name &&
						v.variableCollectionId === tokenCollection?.id
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
						v.name === lightPrimName &&
						v.variableCollectionId === primCollection.id
				);

				if (lightTarget) {
					variable.setValueForMode(lightModeId, {
						type: "VARIABLE_ALIAS",
						id: lightTarget.id,
					});
				}

				// Dark Value
				const darkPrimName = token.values.dark;
				const darkTarget = primVars.find(
					(v) =>
						v.name === darkPrimName &&
						v.variableCollectionId === primCollection.id
				);

				if (darkTarget) {
					variable.setValueForMode(darkModeId, {
						type: "VARIABLE_ALIAS",
						id: darkTarget.id,
					});
				}

				count++;
			}
			figma.notify(`Synced ${count} semantic tokens with Modes.`);
		} catch (e: any) {
			console.error("PLUGIN: Error syncing semantics", e);
			figma.notify("Error syncing semantics: " + e.message, {
				error: true,
			});
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
};

function hexToRgb(hex: string) {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result
		? {
				r: parseInt(result[1], 16) / 255,
				g: parseInt(result[2], 16) / 255,
				b: parseInt(result[3], 16) / 255,
		  }
		: { r: 0, g: 0, b: 0 };
}

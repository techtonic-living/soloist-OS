console.log("PLUGIN: initializing...");
figma.showUI(__html__, { width: 1000, height: 700, themeColors: true });

type PluginMessage =
	| {
			type: "create-variables";
			payload: { colors: { name: string; hex: string }[] };
	  }
	| { type: "save-storage"; payload: { key: string; data: any } }
	| { type: "load-storage"; payload: { key: string } };

figma.ui.onmessage = async (msg: PluginMessage) => {
	if (msg.type === "create-variables") {
		try {
			const { colors } = msg.payload;
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
			for (const color of colors) {
				const vars = await figma.variables.getLocalVariablesAsync();
				let variable = vars.find(
					(v) =>
						v.name === color.name &&
						v.variableCollectionId === collection?.id
				);

				if (!variable) {
					// Pass the collection object solely, not the ID
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
			figma.notify(`Synced ${count} variables.`);
		} catch (e: any) {
			console.error("PLUGIN: Error syncing variables", e);
			figma.notify("Error syncing variables: " + e.message, {
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

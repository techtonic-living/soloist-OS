import { colord } from "colord";
import {
	findOrGenerateMetadata,
	generatePaletteMetadata,
} from "../services/colorMetadata";
import { PresetColor } from "../data/colorPresets";
import { SystemSettings, UserLibrary } from "../hooks/useSoloistSystem";

export interface ToggleFavoriteParams {
	color: string;
	settings: SystemSettings;
	updateSettings: (
		settings:
			| Partial<SystemSettings>
			| ((prev: SystemSettings) => SystemSettings)
	) => void;
	existingMetadata?: PresetColor;
}

export interface SavePaletteParams {
	colors: string[];
	name?: string;
	settings: SystemSettings;
	updateSettings: (
		settings:
			| Partial<SystemSettings>
			| ((prev: SystemSettings) => SystemSettings)
	) => void;
}

export interface ToggleFavoriteResult {
	action: "added" | "removed";
	color?: any;
}

// --- Helpers ---

export const ensureLibrary = (settings: SystemSettings): UserLibrary => {
	if (settings.library) return settings.library;
	return {
		colors: [],
		fonts: [],
		palettes: [],
		paletteGroups: [],
		collections: [],
		projects: [],
	};
};

export const getUniqueLabel = (
	baseName: string,
	existingNames: string[]
): string => {
	let uniqueName = baseName;
	let counter = 1;
	const names = existingNames.map((n) => n.toLowerCase());

	while (names.includes(uniqueName.toLowerCase())) {
		uniqueName = `${baseName} ${counter}`;
		counter++;
	}
	return uniqueName;
};

// --- Main Functions ---

export const toggleFavoriteWithMetadata = async ({
	color,
	settings: initialSettings,
	updateSettings,
	existingMetadata,
}: ToggleFavoriteParams): Promise<ToggleFavoriteResult | null> => {
	const initialLibrary = ensureLibrary(initialSettings);
	const targetColor = colord(color);

	// 1. Synchronous check for REMOVAL (Fast)
	const existingIndex = initialLibrary.colors.findIndex((c) => {
		const storedHex = typeof c === "string" ? c : c.value;
		return colord(storedHex).isEqual(targetColor);
	});

	if (existingIndex !== -1) {
		const removedColor = initialLibrary.colors[existingIndex];

		// Perform Atomic REMOVE
		updateSettings((prev) => {
			const library = ensureLibrary(prev);

			// Re-verify uniqueness in case list changed
			const newColors = library.colors.filter((c) => {
				const storedHex = typeof c === "string" ? c : c.value;
				return !colord(storedHex).isEqual(targetColor);
			});

			const updatedGroups = (library.colorGroups || []).map(
				(group: any) => ({
					...group,
					colorIds: group.colorIds.filter(
						(id: string) => !colord(id).isEqual(targetColor)
					),
				})
			);

			return {
				...prev,
				library: {
					...library,
					colors: newColors,
					colorGroups: updatedGroups,
				},
			};
		});
		return { action: "removed", color: removedColor };
	}

	// 2. Asynchronous ADD Logic (Slow - could involve Gemini)
	let colorWithMetadata: PresetColor;

	try {
		if (existingMetadata) {
			colorWithMetadata = { ...existingMetadata };
		} else {
			// findOrGenerateMetadata handles library colors vs new colors internally
			colorWithMetadata = await findOrGenerateMetadata(
				color,
				initialLibrary.colorCache || [],
				{ avoidNames: [] }
			);
		}

		// 3. Functional Update for adding (Ensures we don't overwrite interim changes)
		updateSettings((prev) => {
			const library = ensureLibrary(prev);

			// Re-verify uniqueness based on LATEST state
			if (
				library.colors.some((c) =>
					colord(typeof c === "string" ? c : c.value).isEqual(
						targetColor
					)
				)
			) {
				return prev; // Already added while we were waiting
			}

			const existingNames = library.colors.map((c) =>
				typeof c === "string" ? c : (c as PresetColor).name
			);
			const uniqueName = getUniqueLabel(
				colorWithMetadata.name,
				existingNames
			);

			if (uniqueName !== colorWithMetadata.name) {
				colorWithMetadata.name = uniqueName;
				colorWithMetadata.isAutoRenamed = true;
			}

			const cached = (library.colorCache || []).some((c) =>
				colord(c.value).isEqual(targetColor)
			);
			const updatedCache = cached
				? library.colorCache || []
				: [...(library.colorCache || []), colorWithMetadata];

			return {
				...prev,
				library: {
					...library,
					colors: [...library.colors, colorWithMetadata],
					colorCache: updatedCache,
				},
			};
		});

		return { action: "added", color: colorWithMetadata };
	} catch (error) {
		console.error("Failed to get color metadata:", error);
		// Fallback without metadata
		updateSettings((prev) => {
			const library = ensureLibrary(prev);
			if (
				library.colors.some((c) =>
					colord(typeof c === "string" ? c : c.value).isEqual(
						targetColor
					)
				)
			) {
				return prev;
			}
			return {
				...prev,
				library: {
					...library,
					colors: [...library.colors, color],
				},
			};
		});
		return { action: "added", color: { value: color, name: "Color" } };
	}
};

export const togglePaletteWithMetadata = async ({
	colors,
	name,
	settings: initialSettings,
	updateSettings,
}: SavePaletteParams): Promise<ToggleFavoriteResult> => {
	const initialLibrary = ensureLibrary(initialSettings);

	// 1. Synchronous check for REMOVAL (Fast)
	const existingIndex = initialLibrary.palettes.findIndex((p: any) => {
		if (p.colors.length !== colors.length) return false;
		return p.colors.every(
			(c: string, i: number) =>
				c.toUpperCase() === colors[i].toUpperCase()
		);
	});

	if (existingIndex !== -1) {
		updateSettings((prev) => {
			const library = ensureLibrary(prev);
			const newPalettes = [...library.palettes];

			// Re-find in case index shifted
			const realIndex = newPalettes.findIndex((p: any) => {
				if (p.colors.length !== colors.length) return false;
				return p.colors.every(
					(c: string, i: number) =>
						c.toUpperCase() === colors[i].toUpperCase()
				);
			});

			if (realIndex === -1) return prev; // already removed

			const removed = newPalettes.splice(realIndex, 1)[0];
			const removedName = String(removed?.name ?? "");
			const updatedPaletteGroups = (library.paletteGroups || []).map(
				(g: any) => ({
					...g,
					paletteIds: (g.paletteIds || []).filter(
						(id: string) => String(id) !== removedName
					),
				})
			);

			return {
				...prev,
				library: {
					...library,
					palettes: newPalettes,
					paletteGroups: updatedPaletteGroups,
				},
			};
		});
		return { action: "removed", color: colors };
	}

	// 2. Asynchronous ADD Logic (Slow - could involve Gemini)
	try {
		let metadata: any;
		if (name) {
			metadata = await generatePaletteMetadata(colors, {
				avoidNames: [],
			});
			metadata.name = name;
		} else {
			const existingNames = initialLibrary.palettes.map(
				(p: any) => p.name
			);
			metadata = await generatePaletteMetadata(colors, {
				avoidNames: existingNames,
			});
		}

		// 3. Functional Update for adding
		updateSettings((prev) => {
			const library = ensureLibrary(prev);

			// Re-re-check existence based on LATEST
			if (
				library.palettes.some((p: any) => {
					if (p.colors.length !== colors.length) return false;
					return p.colors.every(
						(c: string, i: number) =>
							c.toUpperCase() === colors[i].toUpperCase()
					);
				})
			) {
				return prev; // Added while waiting
			}

			return {
				...prev,
				library: {
					...library,
					palettes: [...library.palettes, metadata],
				},
			};
		});
		return { action: "added", color: metadata };
	} catch (error) {
		console.error("Failed to get palette metadata:", error);
		updateSettings((prev) => {
			const library = ensureLibrary(prev);
			const newPalette = {
				name: `Palette ${library.palettes.length + 1}`,
				description: "Custom palette",
				colors,
				meaning: "",
				usage: "",
				createdAt: new Date().toISOString(),
			};
			return {
				...prev,
				library: {
					...library,
					palettes: [...library.palettes, newPalette],
				},
			};
		});
		return { action: "added", color: colors };
	}
};

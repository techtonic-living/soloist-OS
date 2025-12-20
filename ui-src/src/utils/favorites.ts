import { colord } from "colord";
import { PresetColor } from "../data/colorPresets";
import {
	findOrGenerateMetadata,
	generatePaletteMetadata,
} from "../services/colorMetadata";
import { SystemSettings } from "../hooks/useSoloistSystem";

interface ToggleFavoriteParams {
	color: string;
	existingMetadata?: PresetColor;
	settings: SystemSettings;
	updateSettings: (settings: Partial<SystemSettings>) => void;
}

interface SavePaletteParams {
	colors: string[];
	settings: SystemSettings;
	updateSettings: (settings: Partial<SystemSettings>) => void;
}

// Default library shape to avoid undefined branches
const ensureLibrary = (settings: SystemSettings) => {
	const fallback = {
		colors: [] as (string | PresetColor)[],
		fonts: [],
		palettes: [],
		collections: [],
		projects: [],
		colorGroups: [],
		colorCache: [] as PresetColor[],
	};

	const base = settings.library
		? { ...fallback, ...settings.library }
		: fallback;

	// Guarantee colorCache is always an array
	return {
		...base,
		colorCache: base.colorCache ?? [],
	};
};

// Helper for unique naming on save
const getUniqueLabel = (baseName: string, existingNames: string[]): string => {
	const key = baseName.toLowerCase();
	// Count how many existing names start with this base name (rough check)
	// A more precise check is to iterate variants till one is free.

	// Case-insensitive set for fast lookup
	const occupied = new Set(existingNames.map((n) => n.toLowerCase()));

	if (!occupied.has(key)) return baseName;

	// Creative / Natural Variants
	const variants = [
		`Astral ${baseName}`,
		`Cosmic ${baseName}`,
		`Eternal ${baseName}`,
		`Phantom ${baseName}`,
		`Velvet ${baseName}`,
		`Electric ${baseName}`,
		`Neon ${baseName}`,
		`Mystic ${baseName}`,
		`Radiant ${baseName}`,
		`Deep ${baseName}`,
	];

	// Try variants first
	for (const variant of variants) {
		if (!occupied.has(variant.toLowerCase())) return variant;
	}

	// Fallback to numbering
	let i = 2;
	while (true) {
		const numbered = `${baseName} (${i})`;
		if (!occupied.has(numbered.toLowerCase())) return numbered;
		i++;
	}
};

export interface ToggleFavoriteResult {
	action: "added" | "removed";
	color: PresetColor | string;
}

export const toggleFavoriteWithMetadata = async ({
	color,
	existingMetadata,
	settings,
	updateSettings,
}: ToggleFavoriteParams): Promise<ToggleFavoriteResult> => {
	const library = ensureLibrary(settings);
	const targetColor = colord(color);

	// Determine if color already exists (Robust Check)
	const exists = library.colors.some((c) => {
		const storedHex = typeof c === "string" ? c : c.value;
		return colord(storedHex).isEqual(targetColor);
	});

	if (exists) {
		// REMOVE Logic
		// Preserve metadata in cache before removal
		const currentEntry = library.colors.find((c) => {
			const storedHex = typeof c === "string" ? c : c.value;
			return colord(storedHex).isEqual(targetColor);
		});

		let colorCache = library.colorCache || [];
		if (
			currentEntry &&
			typeof currentEntry !== "string" &&
			!colorCache.some((c) => colord(c.value).isEqual(targetColor))
		) {
			colorCache = [...colorCache, currentEntry];
		}

		const newColors = library.colors.filter((c) => {
			const storedHex = typeof c === "string" ? c : c.value;
			return !colord(storedHex).isEqual(targetColor);
		});

		// Remove from all groups (Robust Check to ensure Group Reset)
		const updatedGroups = (library.colorGroups || []).map((group: any) => ({
			...group,
			colorIds: group.colorIds.filter(
				(id: string) => !colord(id).isEqual(targetColor)
			),
		}));

		updateSettings({
			library: {
				...library,
				colors: newColors,
				colorCache,
				colorGroups: updatedGroups,
			},
		});
		return { action: "removed", color: currentEntry || color };
	}

	// ADD Logic
	let colorWithMetadata: PresetColor;

	try {
		if (existingMetadata) {
			colorWithMetadata = { ...existingMetadata };
		} else {
			// We pass empty avoidNames here because we handle renaming explicitly below
			colorWithMetadata = await findOrGenerateMetadata(
				color,
				library.colorCache || [],
				{ avoidNames: [] }
			);
		}

		// --- UNIQUE NAME ENFORCEMENT ---
		const existingNames = library.colors.map((c) =>
			typeof c === "string" ? c : c.name
		);
		const uniqueName = getUniqueLabel(
			colorWithMetadata.name,
			existingNames
		);

		if (uniqueName !== colorWithMetadata.name) {
			colorWithMetadata.name = uniqueName;
			colorWithMetadata.isAutoRenamed = true;
		}
		// -------------------------------

		const cached = (library.colorCache || []).some((c) =>
			colord(c.value).isEqual(targetColor)
		);
		const updatedCache = cached
			? library.colorCache || []
			: [...(library.colorCache || []), colorWithMetadata];

		updateSettings({
			library: {
				...library,
				colors: [...library.colors, colorWithMetadata],
				colorCache: updatedCache,
			},
		});

		return { action: "added", color: colorWithMetadata };
	} catch (error) {
		console.error("Failed to get color metadata:", error);
		// Fallback: save as string to keep UX responsive
		updateSettings({
			library: {
				...library,
				colors: [...library.colors, color],
			},
		});
		return { action: "added", color };
	}
};

export const savePaletteWithMetadata = async ({
	colors,
	settings,
	updateSettings,
}: SavePaletteParams): Promise<void> => {
	const library = ensureLibrary(settings);

	// Check if this EXACT palette already exists (simple stringified check)
	// We might want to allow duplicates if the user wants multiple versions, but let's prevent accidental double-clicks.
	const exists = library.palettes.some(
		(p: any) => JSON.stringify(p.colors) === JSON.stringify(colors)
	);

	if (exists) {
		console.log("Palette already exists in library.");
		return;
	}

	try {
		const existingNames = library.palettes.map((p: any) => p.name);
		const metadata = await generatePaletteMetadata(colors, {
			avoidNames: existingNames,
		});

		updateSettings({
			library: {
				...library,
				palettes: [...library.palettes, metadata],
			},
		});
	} catch (error) {
		console.error("Failed to get palette metadata:", error);
		// Fallback
		const newPalette = {
			name: `Palette ${library.palettes.length + 1}`,
			description: "Custom palette",
			colors,
			tags: [],
		};
		updateSettings({
			library: {
				...library,
				palettes: [...library.palettes, newPalette],
			},
		});
	}
};

import { PresetColor } from "../data/colorPresets";
import { findOrGenerateMetadata } from "../services/colorMetadata";
import { SystemSettings } from "../hooks/useSoloistSystem";

interface ToggleFavoriteParams {
	color: string;
	existingMetadata?: PresetColor;
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

export const toggleFavoriteWithMetadata = async ({
	color,
	existingMetadata,
	settings,
	updateSettings,
}: ToggleFavoriteParams): Promise<void> => {
	const library = ensureLibrary(settings);
	const normalizedHex = color.toUpperCase();

	// Determine if color already exists
	const exists = library.colors.some((c) => {
		const storedHex = typeof c === "string" ? c : c.value;
		return storedHex.toUpperCase() === normalizedHex;
	});

	if (exists) {
		// Preserve metadata in cache before removal
		const currentEntry = library.colors.find((c) => {
			const storedHex = typeof c === "string" ? c : c.value;
			return storedHex.toUpperCase() === normalizedHex;
		});

		let colorCache = library.colorCache || [];
		if (
			currentEntry &&
			typeof currentEntry !== "string" &&
			!colorCache.some((c) => c.value.toUpperCase() === normalizedHex)
		) {
			colorCache = [...colorCache, currentEntry];
		}

		const newColors = library.colors.filter((c) => {
			const storedHex = typeof c === "string" ? c : c.value;
			return storedHex.toUpperCase() !== normalizedHex;
		});
		updateSettings({
			library: { ...library, colors: newColors, colorCache },
		});
		return;
	}

	let colorWithMetadata: PresetColor;

	try {
		if (existingMetadata) {
			colorWithMetadata = existingMetadata;
		} else {
			const avoidNames = (library.colors || [])
				.map((c) => (typeof c === "string" ? c : c.name))
				.filter(Boolean);

			colorWithMetadata = await findOrGenerateMetadata(
				color,
				library.colorCache || [],
				{ avoidNames }
			);
		}

		const cached = (library.colorCache || []).some(
			(c) => c.value.toUpperCase() === normalizedHex
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
	} catch (error) {
		console.error("Failed to get color metadata:", error);
		// Fallback: save as string to keep UX responsive
		updateSettings({
			library: {
				...library,
				colors: [...library.colors, color],
			},
		});
	}
};

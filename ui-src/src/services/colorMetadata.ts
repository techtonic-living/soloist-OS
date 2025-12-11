import { generateText } from "./gemini";
import { PresetColor, PRESET_LIBRARIES } from "../data/colorPresets";
import { colord } from "colord";

export interface MetadataOptions {
	avoidNames?: string[];
	maxAttempts?: number;
}

/**
 * Search all preset libraries for a color with matching hex value
 * @param hexValue The hex color to search for
 * @returns PresetColor if found, null otherwise
 */
export const findColorInPresets = (hexValue: string): PresetColor | null => {
	const normalizedHex = hexValue.toUpperCase();

	// Search through all libraries
	for (const library of PRESET_LIBRARIES) {
		const found = library.colors.find(
			(c: PresetColor) => c.value.toUpperCase() === normalizedHex
		);
		if (found) return found;
	}

	return null;
};

/**
 * Find existing metadata or generate new with AI
 * Searches: (1) Preset libraries, (2) User cache, (3) Generate with AI
 * @param hexValue The hex color value
 * @param cache Optional user's metadata cache
 * @returns Promise<PresetColor> with metadata
 */
export const findOrGenerateMetadata = async (
	hexValue: string,
	cache?: PresetColor[],
	options: MetadataOptions = {}
): Promise<PresetColor> => {
	const normalizedHex = hexValue.toUpperCase();
	const avoid = new Set(
		(options.avoidNames || []).map((n) => n.toUpperCase())
	);
	const maxAttempts = options.maxAttempts ?? 3;

	// Step 1: Check preset libraries
	const presetMatch = findColorInPresets(normalizedHex);
	if (presetMatch) {
		console.log(`Found metadata in preset libraries for ${normalizedHex}`);
		return presetMatch;
	}

	// Step 2: Check user cache
	if (cache && cache.length > 0) {
		const cacheMatch = cache.find(
			(c) => c.value.toUpperCase() === normalizedHex
		);
		if (cacheMatch) {
			console.log(`Found metadata in user cache for ${normalizedHex}`);
			return cacheMatch;
		}
	}

	// Step 3: Generate with AI, ensuring unique name vs avoid list
	console.log(`Generating new metadata for ${normalizedHex}`);
	let lastMetadata = await generateColorMetadata(hexValue, options);
	let attempts = 1;

	while (
		attempts < maxAttempts &&
		lastMetadata.name &&
		avoid.has(lastMetadata.name.toUpperCase())
	) {
		avoid.add(lastMetadata.name.toUpperCase());
		lastMetadata = await generateColorMetadata(hexValue, {
			...options,
			avoidNames: Array.from(avoid),
		});
		attempts += 1;
	}

	// Final safety: if still duplicated, append hex to make unique
	if (lastMetadata.name && avoid.has(lastMetadata.name.toUpperCase())) {
		lastMetadata = {
			...lastMetadata,
			name: `${lastMetadata.name} ${normalizedHex}`,
		};
	}

	return lastMetadata;
};

/**
 * Generate AI-powered metadata for a color
 * @param hexColor The hex color value (e.g., "#FF0099")
 * @returns Promise<PresetColor> with generated metadata
 */
export const generateColorMetadata = async (
	hexColor: string,
	options: MetadataOptions = {}
): Promise<PresetColor> => {
	try {
		// Parse color for basic info
		const color = colord(hexColor);
		const hsl = color.toHsl();
		const isDark = color.isDark();
		const avoidNames = options.avoidNames || [];

		// Create prompt for Gemini
		const prompt = `Analyze this color: ${hexColor}

HSL: H=${Math.round(hsl.h)}° S=${Math.round(hsl.s)}% L=${Math.round(hsl.l)}%
Brightness: ${isDark ? "Dark" : "Light"}

Existing favorite names to avoid (case-insensitive): ${
			avoidNames.length > 0 ? avoidNames.join(", ") : "None"
		}

Generate creative metadata in this EXACT JSON format (no markdown, just raw JSON):
{
  "name": "A creative 1-3 word name (e.g., 'Ocean Depth', 'Cyber Magenta')",
  "description": "One concise sentence describing the color's character and emotional impact",
  "meaning": "3-5 words about psychological/cultural associations (e.g., 'Trust, Intelligence, Calm')",
  "usage": "Practical UI usage in 3-6 words (e.g., 'Primary Buttons, Links, Headers')"
}`;

		// Call Gemini API
		const response = await generateText(prompt);

		// Parse JSON response
		const metadata = JSON.parse(response);

		return {
			name: metadata.name || "Custom Color",
			value: hexColor,
			description:
				metadata.description || "A custom color from your palette.",
			meaning: metadata.meaning || "Unique, Personal",
			usage: metadata.usage || "Custom UI Elements",
		};
	} catch (error) {
		console.error("Error generating color metadata:", error);

		// Fallback metadata if AI fails
		return {
			name: "Custom Color",
			value: hexColor,
			description: `A ${
				colord(hexColor).isDark() ? "dark" : "light"
			} custom color.`,
			meaning: "Custom, Unique",
			usage: "Custom UI Elements",
		};
	}
};

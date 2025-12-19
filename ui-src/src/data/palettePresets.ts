export interface PresetPalette {
	name: string;
	description: string;
	colors: string[];
	tags?: string[];
	id?: string;
}

export interface PaletteLibrary {
	id: string;
	name: string;
	description: string;
	palettes: PresetPalette[];
}

export const PALETTE_LIBRARIES: PaletteLibrary[] = [
	{
		id: "soloist-hero",
		name: "Soloist Hero",
		description: "Flagship themes defining the Soloist aesthetic.",
		palettes: [
			{
				name: "Soloist Dark",
				description: "The signature deep void and cyan accents.",
				colors: ["#000000", "#111111", "#22D3EE", "#0EA5E9", "#6366F1"],
				tags: ["Dark", "Brand", "Cyan"],
			},
			{
				name: "Glass OS",
				description: "Clean, transparency-ready neutrals.",
				colors: ["#FFFFFF", "#F3F4F6", "#E5E7EB", "#9CA3AF", "#1F2937"],
				tags: ["Light", "Minimal", "Glass"],
			},
			{
				name: "Electric Dreams",
				description: "High energy gradient ramp.",
				colors: ["#7000FF", "#A900FF", "#E600FF", "#FF00AA", "#FF0055"],
				tags: ["Vibrant", "Purple", "Pink"],
			},
			{
				name: "Void Drifter",
				description: "Subtle dark greys for focus.",
				colors: ["#09090B", "#18181B", "#27272A", "#3F3F46", "#52525B"],
				tags: ["Dark", "Mono", "Focus"],
			},
			{
				name: "Hyper Beam",
				description: "Blindingly bright neons.",
				colors: ["#E0F2FE", "#BAE6FD", "#7DD3FC", "#38BDF8", "#0EA5E9"],
				tags: ["Blue", "Neon", "Bright"],
			},
		],
	},
	{
		id: "modern-ui",
		name: "Modern UI",
		description: "Trending color combinations for 2025 interfaces.",
		palettes: [
			{
				name: "Neo-Brutalism",
				description: "Bold, unashamed contrast.",
				colors: ["#FFD600", "#FF4D4D", "#2C3E50", "#ECF0F1", "#000000"],
				tags: ["Bold", "Contrast", "Geometrical"],
			},
			{
				name: "Bento Grids",
				description: "Soft pastels for card-based layouts.",
				colors: ["#FFD1DC", "#E2F0CB", "#C1E1C1", "#AEC6CF", "#B39EB5"],
				tags: ["Pastel", "Soft", "Cards"],
			},
			{
				name: "Linear Light",
				description: "Subtle gradients for light mode SaaS.",
				colors: ["#FDFBF7", "#EFEFEF", "#D6D6D6", "#686868", "#1A1A1A"],
				tags: ["SaaS", "Clean", "Professional"],
			},
			{
				name: "Deep Focus",
				description: "Dark mode productivity suite.",
				colors: ["#0F172A", "#1E293B", "#334155", "#64748B", "#38BDF8"],
				tags: ["Dark", "Blue", "Productivity"],
			},
			{
				name: "Swiss Style",
				description: "International typographic style colors.",
				colors: ["#F4F4F4", "#E50914", "#221F1F", "#FFFFFF", "#0055aa"],
				tags: ["Clean", "Bold", "Swiss"],
			},
			{
				name: "Notion Like",
				description: "Minimalist productivity tools.",
				colors: ["#FFFFFF", "#F7F6F3", "#E3E2E0", "#37352F", "#EB5757"],
				tags: ["Clean", "Minimal", "Light"],
			},
			{
				name: "Linear Dark",
				description: "Premium dark mode interface.",
				colors: ["#050505", "#141414", "#222222", "#444444", "#DDDDDD"],
				tags: ["Dark", "Premium", "SaaS"],
			},
		],
	},
	{
		id: "nature-organic",
		name: "Nature & Organic",
		description: "Inspired by the natural world.",
		palettes: [
			{
				name: "Forest Floor",
				description: "Deep greens and moss accents.",
				colors: ["#1A2F1A", "#2F4F2F", "#5F8F5F", "#8FBF8F", "#D8E6D8"],
				tags: ["Green", "Earth", "Calm"],
			},
			{
				name: "Oceanic Depth",
				description: "From surface teal to abyss blue.",
				colors: ["#E0F7FA", "#80DEEA", "#26C6DA", "#00838F", "#006064"],
				tags: ["Blue", "Water", "Fresh"],
			},
			{
				name: "Autumn Harvest",
				description: "Warm oranges, reds and browns.",
				colors: ["#3E2723", "#BF360C", "#E64A19", "#FF7043", "#FFCCBC"],
				tags: ["Warm", "Orange", "Seasonal"],
			},
			{
				name: "Desert Sands",
				description: "Warm neutrals and baked earth tones.",
				colors: ["#5D4037", "#8D6E63", "#D7CCC8", "#EFEBE9", "#FFAB91"],
				tags: ["Brown", "Neutral", "Warm"],
			},
			{
				name: "Succulent Garden",
				description: "Muted greens and soft purples.",
				colors: ["#9AAD91", "#78866B", "#BBC8BA", "#D9C6C1", "#A69299"],
				tags: ["Muted", "Green", "Soft"],
			},
			{
				name: "Cherry Blossom",
				description: "Springtime pinks and whites.",
				colors: ["#FFF0F5", "#FFD7E6", "#FFB7D5", "#FF8FB1", "#5C3A42"],
				tags: ["Pink", "Spring", "Floral"],
			},
			{
				name: "Northern Lights",
				description: "Aurora borealis gradients.",
				colors: ["#0B1026", "#2B32B2", "#1488CC", "#2B32B2", "#00FF99"],
				tags: ["Dark", "Green", "Blue"],
			},
		],
	},
	{
		id: "cyber-neon",
		name: "Cyber & Neon",
		description: "High-voltage palettes for digital impact.",
		palettes: [
			{
				name: "Cyberpunk City",
				description: "Neon pinks and blues against night black.",
				colors: ["#050505", "#1A1A1A", "#00FFF5", "#FF00FF", "#7000FF"],
				tags: ["Neon", "Dark", "Future"],
			},
			{
				name: "Matrix Code",
				description: "Descending shades of terminal green.",
				colors: ["#000000", "#003300", "#006600", "#009900", "#00FF00"],
				tags: ["Green", "Hacker", "Code"],
			},
			{
				name: "Vaporwave",
				description: "Nostalgic 80s pinks and teals.",
				colors: ["#FF71CE", "#01CDFE", "#05FFA1", "#B967FF", "#FFFB96"],
				tags: ["Retro", "80s", "Pastel"],
			},
			{
				name: "Laser Grid",
				description: "Sharp reds and purples.",
				colors: ["#240046", "#3C096C", "#5A189A", "#7B2CBF", "#E0AAFF"],
				tags: ["Purple", "Neon", "Glow"],
			},
			{
				name: "Synthwave Sunset",
				description: "Orange to purple gradient.",
				colors: ["#F9C80E", "#F86624", "#EA3546", "#662E9B", "#43BCCD"],
				tags: ["Sunset", "Gradient", "Retro"],
			},
			{
				name: "Glitch Art",
				description: "Distorted RGB values.",
				colors: ["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#00FFFF"],
				tags: ["RGB", "Chaotic", "Glitch"],
			},
			{
				name: "Neon Noir",
				description: "Moody shadows with bright highlights.",
				colors: ["#0D0D0D", "#212121", "#F44336", "#00E676", "#2979FF"],
				tags: ["Dark", "High Contrast"],
			},
		],
	},
	{
		id: "corporate-trust",
		name: "Corporate Trust",
		description: "Reliable, accessible palettes for enterprise.",
		palettes: [
			{
				name: "Bank Vault",
				description: "Secure blues and greys.",
				colors: ["#0B2B47", "#1E4B75", "#4B7C9E", "#8EB3CC", "#D1E3ED"],
				tags: ["Blue", "Trust", "Finance"],
			},
			{
				name: "Medical Clean",
				description: "Sterile teals and whites.",
				colors: ["#F0FDF4", "#DCFCE7", "#4ADE80", "#16A34A", "#14532D"],
				tags: ["Green", "Health", "Clean"],
			},
			{
				name: "Legal Gray",
				description: "Sophisticated monochromes.",
				colors: ["#000000", "#333333", "#666666", "#999999", "#CCCCCC"],
				tags: ["Mono", "Serious", "Legal"],
			},
			{
				name: "Tech Giant",
				description: "Friendly but authoritative blue.",
				colors: ["#FFFFFF", "#F1F5F9", "#CBD5E1", "#475569", "#1E3A8A"],
				tags: ["Blue", "Tech", "Safe"],
			},
			{
				name: "Consultant",
				description: "Deep navy and gold accents.",
				colors: ["#0F172A", "#1E293B", "#334155", "#FFD700", "#FDE047"],
				tags: ["Navy", "Gold", "Premium"],
			},
		],
	},
	{
		id: "art-history",
		name: "Art History",
		description: "Palettes extracted from famous masterpieces.",
		palettes: [
			{
				name: "Starry Night",
				description: "Van Gogh's swirling blues and yellows.",
				colors: ["#1C3775", "#304D8C", "#6E86B8", "#D9C955", "#F2E88D"],
				tags: ["Art", "Blue", "Yellow"],
			},
			{
				name: "Mona Lisa",
				description: "Da Vinci's sfumato tones.",
				colors: ["#2B2418", "#594E3C", "#8C7A5E", "#BFAD88", "#D9CDB8"],
				tags: ["Art", "Brown", "Muted"],
			},
			{
				name: "The Scream",
				description: "Munch's dramatic sunset.",
				colors: ["#261C15", "#402E2A", "#8C4830", "#D98032", "#F2B705"],
				tags: ["Art", "Orange", "Dramatic"],
			},
			{
				name: "Water Lilies",
				description: "Monet's impressionist garden.",
				colors: ["#4B5842", "#6D835B", "#8FA67F", "#B0C4A9", "#D9A8CA"],
				tags: ["Art", "Green", "Impressionist"],
			},
		],
	},
	{
		id: "cinematic",
		name: "Cinematic",
		description: "Color grades from popular film genres.",
		palettes: [
			{
				name: "Teal and Orange",
				description: "The blockbuster standard.",
				colors: ["#004D40", "#00796B", "#FF6F00", "#FFB300", "#FFE082"],
				tags: ["Movie", "Contrast", "Popular"],
			},
			{
				name: "Sci-Fi Blue",
				description: "Cold, futuristic atmosphere.",
				colors: ["#02040F", "#002642", "#025983", "#0781D1", "#EBF5EE"],
				tags: ["Movie", "Cold", "Future"],
			},
			{
				name: "Wes Anderson",
				description: "Symmetrical pastel whimsy.",
				colors: ["#F25244", "#F28C81", "#F2E8DC", "#FFD580", "#00A388"],
				tags: ["Movie", "Pastel", "Quirky"],
			},
			{
				name: "Noir",
				description: "High contrast black and white.",
				colors: ["#000000", "#222222", "#666666", "#AAAAAA", "#FFFFFF"],
				tags: ["Movie", "B&W", "Dramatic"],
			},
		],
	},
];

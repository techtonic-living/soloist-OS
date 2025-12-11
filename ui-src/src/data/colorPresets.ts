export interface PresetColor {
	name: string;
	value: string;
	description?: string;
	meaning?: string;
	usage?: string;
}

export interface PresetLibrary {
	name: string;
	description: string;
	colors: PresetColor[];
}

export const PRESET_LIBRARIES: PresetLibrary[] = [
	{
		name: "Soloist Essentials",
		description:
			"A curated set of vibrant, modern colors strictly for winners.",
		colors: [
			{
				name: "Obsidian",
				value: "#050505",
				description:
					"Absolute darkness. The absence of light, used to create depth.",
				meaning: "Mystery, Power, Elegance",
				usage: "Backgrounds, High Contrast Text",
			},
			{
				name: "Charcoal",
				value: "#2C303B",
				description:
					"A deep, cool charcoal often used for card backgrounds in dark mode.",
				meaning: "Stability, Professionalism",
				usage: "Cards, Sidebars, Modals",
			},
			{
				name: "Cyan",
				value: "#00E0FF",
				description:
					"Electric and energetic. A cyber-aesthetic staple.",
				meaning: "Future, Technology, Clarity",
				usage: "Primary Actions, Highlights, Glows",
			},
			{
				name: "Purple",
				value: "#9D00FF",
				description:
					"Royal and creative. Associated with imagination and luxury.",
				meaning: "Creativity, wisdom, ambition",
				usage: "Accents, Gradients, Creative Brands",
			},
			{
				name: "Pink",
				value: "#FF0099",
				description: "Bold and playful. Impossible to ignore.",
				meaning: "Passion, Energy, Youth",
				usage: "CTAs, Alerts, Marketing Highlights",
			},
			{
				name: "Acid",
				value: "#CCFF00",
				description: "High-visibility lime yellow. Toxic and trendy.",
				meaning: "Caution, Energy, Edgy",
				usage: "Unique Accents, Selection States",
			},
			{
				name: "Orange",
				value: "#FF4D00",
				description:
					"Warm and inviting but aggressive. Demands attention.",
				meaning: "Enthusiasm, Success, Determination",
				usage: "Warnings, Important Notifications",
			},
		],
	},
	{
		name: "Tailwind CSS",
		description:
			"The utility-first standard. A comprehensive 500-level palette for rapid development.",
		colors: [
			{
				name: "Slate",
				value: "#64748b",
				description:
					"A cool gray with blue undertones. Professional and sleek.",
				meaning: "Balance, Neutrality, Tech",
				usage: "Text, Borders, Subtle Backgrounds",
			},
			{
				name: "Blue",
				value: "#3b82f6",
				description:
					"The standard for trust and communication on the web.",
				meaning: "Trust, Intelligence, Faith",
				usage: "Links, Primary Buttons, Info States",
			},
			{
				name: "Emerald",
				value: "#10b981",
				description:
					"A vivid, natural green associated with wealth and growth.",
				meaning: "Growth, Harmony, Freshness",
				usage: "Success States, Financial Indicators",
			},
			{
				name: "Red",
				value: "#ef4444",
				description:
					"A warning signal. Use sparingly for destructive actions.",
				meaning: "Danger, Passion, Urgency",
				usage: "Error States, Delete Actions",
			},
			{
				name: "Amber",
				value: "#f59e0b",
				description: "A warm, golden yellow often used for caution.",
				meaning: "Warmth, Caution, Optimism",
				usage: "Warning States, Stars/Reviews",
			},
			{
				name: "Indigo",
				value: "#6366f1",
				description:
					"Deep and mystical. A bridge between blue and violet.",
				meaning: "Intuition, Perception, Higher Mind",
				usage: "Brand Colors, Dark Mode Accents",
			},
			{
				name: "Rose",
				value: "#f43f5e",
				description: "Softer than red, romantic and compassionate.",
				meaning: "Love, compassion, style",
				usage: "Lifestyle Apps, Feminine Brands",
			},
		],
	},
	{
		name: "Material Design",
		description:
			"The iconic, bold spectrum that defined modern Android interfaces.",
		colors: [
			{
				name: "Blue",
				value: "#2196F3",
				description:
					"The iconic Material Design blue. Reliable and standard.",
				meaning: "Dependability, Logic",
				usage: "App Bars, Floating Action Buttons",
			},
			{
				name: "Teal",
				value: "#009688",
				description: "A dark cyan. Reserved and sophisticated.",
				meaning: "Rest, Renewal, Balance",
				usage: "Secondary Actions, Android System UI",
			},
			{
				name: "Deep Orange",
				value: "#FF5722",
				description:
					"Intense and fiery. Good for high-emphasis calls to action.",
				meaning: "Energy, Excitement",
				usage: "Alerts, Notifications",
			},
			{
				name: "Green",
				value: "#4CAF50",
				description: "Natural and fresh. Indicates success and growth.",
				meaning: "Nature, Success, Health",
				usage: "Success Messages, Confirmations",
			},
			{
				name: "Yellow",
				value: "#FFEB3B",
				description:
					"Bright and energetic. Use with dark text for readability.",
				meaning: "Optimism, Light, Caution",
				usage: "Highlights, Attention Grabbers",
			},
			{
				name: "Amber",
				value: "#FFC107",
				description: "Warm and inviting. Less aggressive than yellow.",
				meaning: "Warmth, Warning, Gold",
				usage: "Stars, Warnings, Primary Actions",
			},
			{
				name: "Purple",
				value: "#9C27B0",
				description: "Rich and creative. Associated with luxury.",
				meaning: "Royalty, Ambition, creativity",
				usage: "Accents, Floating Action Buttons",
			},
		],
	},
	{
		name: "Nord Theme",
		description:
			"An arctic, north-bluish color palette offering a clean and elegant look.",
		colors: [
			{
				name: "Polar Night",
				value: "#2E3440",
				description:
					"Deep, dark blue-grey. The foundation of the Nord theme.",
				meaning: "Depth, Focus, Stability",
				usage: "Editor Backgrounds, Dark Panels",
			},
			{
				name: "Snow Storm",
				value: "#D8DEE9",
				description:
					"Bright, icy white. Used for main text and UI elements.",
				meaning: "Clarity, Cleanliness, Light",
				usage: "Text, Highlights, Light Mode Backgrounds",
			},
			{
				name: "Frost Blue",
				value: "#88C0D0",
				description:
					"A cool, glacial blue. The signature accent of Nord.",
				meaning: "Freshness, Calm, Technology",
				usage: "Primary Buttons, Links, Info States",
			},
			{
				name: "Aurora Red",
				value: "#BF616A",
				description:
					"A soft, muted red inspired by the northern lights.",
				meaning: "Passion, Alert, Warmth",
				usage: "Errors, Deletions, Negative States",
			},
			{
				name: "Aurora Green",
				value: "#A3BE8C",
				description: "A natural, forest green. Gentle on the eyes.",
				meaning: "Growth, Success, Harmony",
				usage: "Success States, Additions",
			},
		],
	},
	{
		name: "Cyberpunk Neon",
		description:
			"High-octane, saturated colors for futuristic and aggressive interfaces.",
		colors: [
			{
				name: "Laser Green",
				value: "#39ff14",
				description:
					"Radioactive green. Maximum visibility and energy.",
				meaning: "Digital, Toxic, High Energy",
				usage: "Terminal Text, Glitch Effects, Highlights",
			},
			{
				name: "Neon Pink",
				value: "#ff00ff",
				description: "Pure magenta. The color of retro-future sunsets.",
				meaning: "Fantasy, Rebellion, Artificiality",
				usage: "Glows, Primary Accents, Headlines",
			},
			{
				name: "Cyber Yellow",
				value: "#ffd300",
				description:
					"Industrial caution yellow. Unapologetic and loud.",
				meaning: "Warning, Attention, Speed",
				usage: "Borders, Critical Alerts, CTAs",
			},
			{
				name: "Electric Blue",
				value: "#00f3ff",
				description: "High-voltage cyan. Cool but intense.",
				meaning: "Data, Future, Connectivity",
				usage: "Holograms, Links, Tech Accents",
			},
		],
	},
	{
		name: "Organic Earth",
		description:
			"Grounded, natural tones for sustainable and calm designs.",
		colors: [
			{
				name: "Terracotta",
				value: "#E2725B",
				description:
					"Warm, baked earth tone. Inviting and traditional.",
				meaning: "Warmth, Stability, Heritage",
				usage: "Primary Brand, Warm Accents",
			},
			{
				name: "Sage",
				value: "#BCB88A",
				description: "Desaturated green. Soothing and sophisticated.",
				meaning: "Wisdom, Nature, Calm",
				usage: "Backgrounds, Secondary Buttons",
			},
			{
				name: "Clay",
				value: "#A0785A",
				description: "Rich brown soil. Use for grounding elements.",
				meaning: "Reliability, Support, Foundation",
				usage: "Footers, Text, Dividers",
			},
			{
				name: "Moss",
				value: "#4A5D23",
				description: "Deep forest green. Serious and organic.",
				meaning: "Growth, Resilience, Environment",
				usage: "Strong Accents, Eco-branding",
			},
			{
				name: "Sand",
				value: "#F4A460",
				description: "Soft, golden beige. Neutral welcoming.",
				meaning: "Simplicity, Comfort, Neutrality",
				usage: "Backgrounds, Cards, Warm Neutrals",
			},
		],
	},
	{
		name: "Pastel Dreams",
		description:
			"Soft, desaturated, high-lightness colors for modern, friendly UIs.",
		colors: [
			{
				name: "Mint",
				value: "#98FF98",
				description: "A soft, refreshing green.",
				meaning: "Freshness, Youth, Calm",
				usage: "Backgrounds, Soft Accents",
			},
			{
				name: "Lavender",
				value: "#E6E6FA",
				description: "A gentle, floral purple.",
				meaning: "Grace, Calm, Femininity",
				usage: "Cards, Gentle Highlights",
			},
			{
				name: "Peach",
				value: "#FFDAB9",
				description: "A warm, soft orange.",
				meaning: "Comfort, Warmth, Friendliness",
				usage: "Notifications, Warm Backgrounds",
			},
			{
				name: "Sky",
				value: "#87CEEB",
				description: "A bright, airy blue.",
				meaning: "Freedom, Openness, Light",
				usage: "Backgrounds, Info Boxes",
			},
			{
				name: "Banana",
				value: "#FFE135",
				description: "A happy, soft yellow.",
				meaning: "Happiness, Sunshine, Energy",
				usage: "Highlights, Friendly Warnings",
			},
		],
	},
	{
		name: "Retro Wave",
		description: "Nostalgic 80s/90s aesthetic colors.",
		colors: [
			{
				name: "Miami Pink",
				value: "#FF69B4",
				description: "Hot pink from the boardwalks of Vice City.",
				meaning: "Fun, Bold, Nostalgia",
				usage: "Accents, Neon Effects",
			},
			{
				name: "Arcade Purple",
				value: "#B026FF",
				description: "Deep, digital purple from the arcade era.",
				meaning: "Mystery, Cyber, Night",
				usage: "Backgrounds, Shadows",
			},
			{
				name: "VHS Blue",
				value: "#4169E1",
				description: "Static blue from old tape recordings.",
				meaning: "Tech, Retro, Memory",
				usage: "Primary Elements, Links",
			},
			{
				name: "Sunset Orange",
				value: "#FF4500",
				description: "Burning orange from an endless sunset.",
				meaning: "Energy, Heat, Action",
				usage: "Gradients, Call to Actions",
			},
		],
	},
	{
		name: "Dark Mode Staples",
		description: "Rich, deep colors optimized for dark interfaces.",
		colors: [
			{
				name: "Midnight Blue",
				value: "#191970",
				description: "A very dark blue, almost black. Excellent depth.",
				meaning: "Depth, Night, Space",
				usage: "App Backgrounds, Headers",
			},
			{
				name: "Deep Forest",
				value: "#004B49",
				description: "A dark, lush green. Calming and rich.",
				meaning: "Nature, Stability, Finance",
				usage: "Background Sections, Success States",
			},
			{
				name: "Charred Plum",
				value: "#36013F",
				description: "A deep, almost black purple.",
				meaning: "Luxury, Mystery, Magic",
				usage: "Footers, Special Sections",
			},
		],
	},
];

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
				meaning: "Creativity, Wisdom, Ambition",
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
			{
				name: "Ice",
				value: "#F0F8FF",
				description: "Pristine white with the faintest blue tint.",
				meaning: "Clarity, Precision, Purity",
				usage: "Text on Dark Backgrounds, Highlights",
			},
			{
				name: "Steel",
				value: "#708090",
				description:
					"Industrial gray with a hint of blue. Modern and sleek.",
				meaning: "Industry, Strength, Technology",
				usage: "Borders, Disabled States, Secondary Text",
			},
		],
	},
	{
		name: "Tailwind CSS",
		description:
			"The utility-first standard. A comprehensive palette for rapid development.",
		colors: [
			{
				name: "Slate",
				value: "#64748B",
				description:
					"A cool gray with blue undertones. Professional and sleek.",
				meaning: "Balance, Neutrality, Tech",
				usage: "Text, Borders, Subtle Backgrounds",
			},
			{
				name: "Blue",
				value: "#3B82F6",
				description:
					"The standard for trust and communication on the web.",
				meaning: "Trust, Intelligence, Faith",
				usage: "Links, Primary Buttons, Info States",
			},
			{
				name: "Emerald",
				value: "#10B981",
				description:
					"A vivid, natural green associated with wealth and growth.",
				meaning: "Growth, Harmony, Freshness",
				usage: "Success States, Financial Indicators",
			},
			{
				name: "Red",
				value: "#EF4444",
				description:
					"A warning signal. Use sparingly for destructive actions.",
				meaning: "Danger, Passion, Urgency",
				usage: "Error States, Delete Actions",
			},
			{
				name: "Amber",
				value: "#F59E0B",
				description: "A warm, golden yellow often used for caution.",
				meaning: "Warmth, Caution, Optimism",
				usage: "Warning States, Stars/Reviews",
			},
			{
				name: "Indigo",
				value: "#6366F1",
				description:
					"Deep and mystical. A bridge between blue and violet.",
				meaning: "Intuition, Perception, Higher Mind",
				usage: "Brand Colors, Dark Mode Accents",
			},
			{
				name: "Rose",
				value: "#F43F5E",
				description: "Softer than red, romantic and compassionate.",
				meaning: "Love, Compassion, Style",
				usage: "Lifestyle Apps, Feminine Brands",
			},
			{
				name: "Violet",
				value: "#8B5CF6",
				description: "Bright purple with personality and presence.",
				meaning: "Creativity, Magic, Innovation",
				usage: "Premium Features, Badges, Creative Tools",
			},
			{
				name: "Sky",
				value: "#0EA5E9",
				description: "Light, airy blue reminiscent of clear skies.",
				meaning: "Freedom, Clarity, Communication",
				usage: "Secondary Actions, Social Features",
			},
			{
				name: "Teal",
				value: "#14B8A6",
				description: "Balanced blue-green with sophistication.",
				meaning: "Balance, Healing, Clarity",
				usage: "Health Apps, Meditation Features",
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
				meaning: "Royalty, Ambition, Creativity",
				usage: "Accents, Floating Action Buttons",
			},
			{
				name: "Lime",
				value: "#CDDC39",
				description: "Fresh yellow-green. Youthful and vibrant.",
				meaning: "Youth, Energy, Nature",
				usage: "Fresh Content, New Features",
			},
			{
				name: "Pink",
				value: "#E91E63",
				description: "Bold and confident. Material's signature pink.",
				meaning: "Playfulness, Romance, Energy",
				usage: "Social Features, Favorites",
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
			{
				name: "Aurora Yellow",
				value: "#EBCB8B",
				description: "Muted gold reminiscent of aurora borealis.",
				meaning: "Warning, Attention, Warmth",
				usage: "Warnings, Modified States",
			},
			{
				name: "Aurora Purple",
				value: "#B48EAD",
				description: "Soft lavender from the northern lights.",
				meaning: "Magic, Keywords, Special States",
				usage: "Syntax Highlighting, Special Tags",
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
				value: "#39FF14",
				description:
					"Radioactive green. Maximum visibility and energy.",
				meaning: "Digital, Toxic, High Energy",
				usage: "Terminal Text, Glitch Effects, Highlights",
			},
			{
				name: "Neon Pink",
				value: "#FF00FF",
				description: "Pure magenta. The color of retro-future sunsets.",
				meaning: "Fantasy, Rebellion, Artificiality",
				usage: "Glows, Primary Accents, Headlines",
			},
			{
				name: "Cyber Yellow",
				value: "#FFD300",
				description:
					"Industrial caution yellow. Unapologetic and loud.",
				meaning: "Warning, Attention, Speed",
				usage: "Borders, Critical Alerts, CTAs",
			},
			{
				name: "Electric Blue",
				value: "#00F3FF",
				description: "High-voltage cyan. Cool but intense.",
				meaning: "Data, Future, Connectivity",
				usage: "Holograms, Links, Tech Accents",
			},
			{
				name: "Neon Orange",
				value: "#FF3C00",
				description: "Burning hot orange with maximum saturation.",
				meaning: "Heat, Danger, Urgency",
				usage: "Alerts, Destructive Actions",
			},
			{
				name: "Digital Purple",
				value: "#BF00FF",
				description: "Intense violet with a digital edge.",
				meaning: "Virtual Reality, AI, Synthetic",
				usage: "AI Features, Premium Elements",
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
			{
				name: "Stone",
				value: "#918E85",
				description: "Cool gray-brown like river rocks.",
				meaning: "Permanence, Strength, Nature",
				usage: "Dividers, Secondary Text, Borders",
			},
			{
				name: "Olive",
				value: "#808000",
				description: "Muted yellow-green. Earthy and mature.",
				meaning: "Peace, Wisdom, Organic",
				usage: "Natural Product Labels, Eco Icons",
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
			{
				name: "Coral",
				value: "#FFB6C1",
				description: "Soft pink-orange. Welcoming and gentle.",
				meaning: "Warmth, Friendliness, Approachability",
				usage: "Social Features, Avatars",
			},
			{
				name: "Periwinkle",
				value: "#CCCCFF",
				description: "Dreamy blue-violet. Calming and creative.",
				meaning: "Dreams, Imagination, Serenity",
				usage: "Creative Tools, Meditation Apps",
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
			{
				name: "Synthwave Teal",
				value: "#00FFFF",
				description: "Pure cyan from retro computer graphics.",
				meaning: "Digital, Futuristic, Retro",
				usage: "Grid Lines, Scan Effects",
			},
			{
				name: "Vaporwave Pink",
				value: "#FF6EC7",
				description: "Soft neon pink with 90s internet vibes.",
				meaning: "Aesthetic, Dreams, Nostalgia",
				usage: "Backgrounds, Overlays",
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
			{
				name: "Ink Black",
				value: "#0A0A0A",
				description: "Pure darkness with the faintest hint of warmth.",
				meaning: "Void, Focus, Minimalism",
				usage: "OLED Backgrounds, True Black Themes",
			},
			{
				name: "Gunmetal",
				value: "#2A3439",
				description: "Dark gray with cool undertones. Professional.",
				meaning: "Industry, Precision, Tech",
				usage: "Card Backgrounds, Panels",
			},
			{
				name: "Deep Burgundy",
				value: "#3D0C02",
				description: "Almost black red. Rich and sophisticated.",
				meaning: "Luxury, Passion, Depth",
				usage: "Premium Sections, Dark Accents",
			},
		],
	},
	{
		name: "Corporate Professional",
		description:
			"Conservative, trustworthy colors for business applications.",
		colors: [
			{
				name: "Navy",
				value: "#001F3F",
				description: "Deep, authoritative blue. The color of trust.",
				meaning: "Authority, Trust, Stability",
				usage: "Headers, Primary Buttons, Corporate Brands",
			},
			{
				name: "Forest Green",
				value: "#228B22",
				description: "Rich, natural green. Professional and grounded.",
				meaning: "Growth, Finance, Stability",
				usage: "Financial Apps, Success Indicators",
			},
			{
				name: "Burgundy",
				value: "#800020",
				description: "Deep wine red. Sophisticated and refined.",
				meaning: "Prestige, Seriousness, Tradition",
				usage: "Luxury Brands, Premium Features",
			},
			{
				name: "Charcoal Gray",
				value: "#36454F",
				description: "Professional gray with subtle blue undertones.",
				meaning: "Professionalism, Neutrality, Strength",
				usage: "Text, Backgrounds, Business UI",
			},
			{
				name: "Gold",
				value: "#FFD700",
				description: "Metallic gold. Premium and valuable.",
				meaning: "Wealth, Success, Achievement",
				usage: "Premium Badges, VIP Features, Achievements",
			},
			{
				name: "Platinum",
				value: "#E5E4E2",
				description: "Cool silver-white. Prestigious and modern.",
				meaning: "Premium, Modern, Excellence",
				usage: "Highlights, Premium Tiers",
			},
		],
	},
	{
		name: "Health & Wellness",
		description:
			"Calming, natural colors for health and wellness applications.",
		colors: [
			{
				name: "Mint Green",
				value: "#3EB489",
				description: "Fresh, clean green. Soothing and healthy.",
				meaning: "Health, Freshness, Healing",
				usage: "Health Apps, Success States",
			},
			{
				name: "Ocean Blue",
				value: "#4682B4",
				description: "Calm, deep blue like peaceful waters.",
				meaning: "Calm, Trust, Clarity",
				usage: "Meditation Apps, Backgrounds",
			},
			{
				name: "Soft Coral",
				value: "#F88379",
				description: "Warm but not aggressive. Nurturing.",
				meaning: "Care, Warmth, Vitality",
				usage: "Wellness Features, Heart Rate Displays",
			},
			{
				name: "Bamboo",
				value: "#6B8E23",
				description: "Natural olive green. Grounded and organic.",
				meaning: "Growth, Natural, Balance",
				usage: "Eco-wellness, Natural Products",
			},
			{
				name: "Cloud White",
				value: "#F5F5F5",
				description: "Soft off-white. Clean and peaceful.",
				meaning: "Purity, Peace, Clarity",
				usage: "Backgrounds, Clean Spaces",
			},
			{
				name: "Sunset Peach",
				value: "#FFCBA4",
				description: "Warm peachy tone. Comforting and gentle.",
				meaning: "Comfort, Gentle Energy, Care",
				usage: "Evening Modes, Warm Notifications",
			},
		],
	},
	{
		name: "Adrenaline Junkie",
		description: "High-energy, competitive colors for gaming interfaces.",
		colors: [
			{
				name: "Victory Gold",
				value: "#FFA500",
				description: "Bright orange-gold. The color of achievement.",
				meaning: "Victory, Achievement, Glory",
				usage: "Achievement Unlocks, Leaderboards",
			},
			{
				name: "Critical Red",
				value: "#DC143C",
				description:
					"Intense crimson. Health warnings and critical hits.",
				meaning: "Danger, Critical, Intensity",
				usage: "Health Bars, Critical Alerts",
			},
			{
				name: "Mana Blue",
				value: "#1E90FF",
				description: "Bright dodger blue. Energy and magic.",
				meaning: "Energy, Magic, Resources",
				usage: "Mana Bars, Ability Indicators",
			},
			{
				name: "Legendary Purple",
				value: "#A020F0",
				description: "Rich purple for rare items and achievements.",
				meaning: "Rare, Legendary, Elite",
				usage: "Rare Items, Premium Content",
			},
			{
				name: "XP Green",
				value: "#00FF00",
				description: "Bright lime green. Growth and progression.",
				meaning: "Progress, Growth, Success",
				usage: "XP Bars, Level Ups",
			},
			{
				name: "Team Red",
				value: "#E74C3C",
				description: "Bold team color. Competitive and energetic.",
				meaning: "Competition, Team, Energy",
				usage: "Team Indicators, PvP Elements",
			},
			{
				name: "Team Blue",
				value: "#3498DB",
				description: "Cool team color. Strategic and calm.",
				meaning: "Strategy, Team, Cool",
				usage: "Team Indicators, PvP Elements",
			},
		],
	},
	{
		name: "Accessible Contrast",
		description: "WCAG AAA compliant colors for maximum accessibility.",
		colors: [
			{
				name: "Pure Black",
				value: "#000000",
				description: "True black. Maximum contrast.",
				meaning: "Clarity, Focus, Contrast",
				usage: "Text on White, High Contrast Mode",
			},
			{
				name: "Pure White",
				value: "#FFFFFF",
				description: "True white. Clean and clear.",
				meaning: "Purity, Clarity, Space",
				usage: "Text on Dark, Backgrounds",
			},
			{
				name: "Accessible Blue",
				value: "#0000EE",
				description: "Standard link blue. Maximum readability.",
				meaning: "Links, Trust, Navigation",
				usage: "Hyperlinks, Accessible Links",
			},
			{
				name: "Safe Red",
				value: "#CC0000",
				description: "Dark red that meets contrast requirements.",
				meaning: "Error, Stop, Alert",
				usage: "Error Messages, Required Fields",
			},
			{
				name: "Safe Green",
				value: "#008000",
				description: "Dark green for accessibility compliance.",
				meaning: "Success, Safe, Go",
				usage: "Success Messages, Confirmations",
			},
			{
				name: "Dark Gray",
				value: "#595959",
				description: "Accessible gray for body text.",
				meaning: "Text, Information, Neutral",
				usage: "Body Text, Secondary Information",
			},
		],
	},
	{
		name: "Luxury Brand",
		description: "Sophisticated, high-end colors for premium brands.",
		colors: [
			{
				name: "Champagne",
				value: "#F7E7CE",
				description: "Soft gold with elegance. Subtle luxury.",
				meaning: "Celebration, Luxury, Refinement",
				usage: "Luxury Backgrounds, Premium Sections",
			},
			{
				name: "Deep Emerald",
				value: "#046307",
				description: "Rich, dark green. Opulent and exclusive.",
				meaning: "Wealth, Prestige, Exclusivity",
				usage: "Luxury Brands, VIP Sections",
			},
			{
				name: "Royal Purple",
				value: "#7851A9",
				description: "Regal purple. The color of royalty.",
				meaning: "Royalty, Luxury, Exclusivity",
				usage: "Premium Features, Royal Branding",
			},
			{
				name: "Onyx",
				value: "#0F0F0F",
				description: "Deep black with richness. Sophisticated.",
				meaning: "Mystery, Luxury, Power",
				usage: "Luxury Dark Modes, Premium UI",
			},
			{
				name: "Rose Gold",
				value: "#B76E79",
				description: "Modern luxury metallic. Elegant and trendy.",
				meaning: "Modern Luxury, Elegance, Style",
				usage: "Premium Accents, Luxury Icons",
			},
			{
				name: "Ivory",
				value: "#FFFFF0",
				description: "Warm off-white. Classic and refined.",
				meaning: "Purity, Classic, Timeless",
				usage: "Luxury Backgrounds, Classic Brands",
			},
		],
	},
];

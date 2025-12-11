import { Lightbulb, BookOpen, Ghost, Cpu, Zap } from "lucide-react";
import { ColorControlPanel } from "./lab/ColorControlPanel";
import { colord } from "colord";
import { findOrGenerateMetadata } from "../services/colorMetadata";
import { PresetColor } from "../data/colorPresets";

import { useSoloist } from "../context/SoloistContext";

interface AssistantPanelProps {
	// Context Props
	activeColorStep?: string;
	activeColorTab?: string;
	activeTypeTab?: string;
	activeTokensModule?: string;
	activeExploreTab?: string;
	selectedInsightColor?: any;
}

export const AssistantPanel = ({
	activeColorStep,
	activeColorTab,
	activeTypeTab,
	activeTokensModule,
	activeExploreTab,
	selectedInsightColor,
}: AssistantPanelProps) => {
	// --- Context Consumption ---
	const {
		activeView,
		settings,
		updateSettings,
		seedColor,
		setSeedColor,
		secondaryRamp,
		tertiaryRamp,
		harmonyMode,
	} = useSoloist();

	const aiLevel = settings.aiLevel;
	const secondaryColor = secondaryRamp[5]?.hex || "#000000";
	const tertiaryColor = tertiaryRamp[5]?.hex || "#000000";

	// Toggle Favorite with AI metadata generation
	const toggleFavoriteColor = async (color: string) => {
		const library = settings.library || {
			colors: [],
			fonts: [],
			palettes: [],
			colorCache: [],
		};

		// Check if color exists (handle both string and PresetColor)
		const exists = library.colors.some((c: any) =>
			typeof c === "string" ? c === color : c.value === color
		);

		if (exists) {
			// Remove color
			const newColors = library.colors.filter((c: any) =>
				typeof c === "string" ? c !== color : c.value !== color
			);
			updateSettings({ library: { ...library, colors: newColors } });
		} else {
			// Add color with metadata
			try {
				// Smart lookup: presets → cache → AI generation
				const colorWithMetadata = await findOrGenerateMetadata(
					color,
					library.colorCache || []
				);

				// Update cache if this was a new AI generation
				const wasGenerated = !library.colorCache?.some(
					(c: PresetColor) =>
						c.value.toUpperCase() === color.toUpperCase()
				);
				if (wasGenerated) {
					const newCache = [
						...(library.colorCache || []),
						colorWithMetadata,
					];
					// Update cache for future use
					updateSettings({
						library: { ...library, colorCache: newCache },
					});
				}

				const newColors = [...library.colors, colorWithMetadata];
				updateSettings({ library: { ...library, colors: newColors } });
			} catch (error) {
				console.error("Failed to get color metadata:", error);
				// Fallback: save as string if everything fails
				const newColors = [...library.colors, color];
				updateSettings({ library: { ...library, colors: newColors } });
			}
		}
	};

	// Content Mapping
	const content = getContentForView(
		activeView,
		activeColorStep,
		activeColorTab,
		activeTypeTab,
		activeTokensModule,
		activeExploreTab,
		selectedInsightColor
	);

	// Check if we should show the Color Control Panel (Essential Content for 'Studio')
	const showColorControls =
		activeView === "explore" && activeExploreTab === "studio";

	// Determine Visibility based on AI Level
	// Standby (silent): Title, Description, Essential Content
	// Wingman (guide): + Suggestions
	// Guru (teacher): + Concepts

	const showSuggestions = aiLevel === "guide" || aiLevel === "teacher";
	const showConcepts = aiLevel === "teacher";

	return (
		<div className="h-full w-[320px] border-l border-glass-stroke bg-bg-void/50 backdrop-blur-md flex flex-col overflow-hidden relative z-40">
			{/* Header / Mode Indicator */}
			<div className="flex-shrink-0 p-4 border-b border-glass-stroke flex items-center justify-between bg-accent-cyan/5 h-16">
				<div className="flex items-center gap-3">
					<div
						className={`p-2 rounded-lg ${
							aiLevel === "silent"
								? "text-gray-500 bg-white/5"
								: "text-accent-cyan bg-accent-cyan/10"
						}`}
					>
						{aiLevel === "teacher" && <Zap size={18} />}
						{aiLevel === "guide" && <Cpu size={18} />}
						{aiLevel === "silent" && <Ghost size={18} />}
					</div>
					<div>
						<h3 className="text-white font-brand text-sm tracking-wide">
							{aiLevel === "teacher"
								? "Guru Mode"
								: aiLevel === "guide"
								? "Wingman Mode"
								: "Standby Mode"}
						</h3>
					</div>
				</div>
			</div>

			{/* Content Scroll Area */}
			<div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
				{/* 1. HEADER (Always Visible) */}
				<div>
					<span className="text-accent-cyan text-xs font-mono mb-2 block uppercase tracking-wider opacity-60">
						Active Tool
					</span>
					<h2 className="text-2xl text-white font-brand mb-2 leading-tight">
						{content.title}
					</h2>
					<p className="text-gray-400 text-sm leading-relaxed">
						{content.description}
					</p>
				</div>

				{/* 2. INSPECTED COLOR CARD (Libraries) */}
				{selectedInsightColor && (
					<div className="pt-4 border-t border-white/5">
						<InspectedColorCard color={selectedInsightColor} />
					</div>
				)}

				{/* 3. ESSENTIAL CONTENT (Controls) */}
				{showColorControls && seedColor && setSeedColor && (
					<div className="pt-4 border-t border-white/5">
						<ColorControlPanel
							seedColor={seedColor}
							setSeedColor={setSeedColor}
							secondaryColor={secondaryColor || "#000000"}
							tertiaryColor={tertiaryColor || "#000000"}
							harmonyMode={harmonyMode}
							settings={settings}
							updateSettings={updateSettings}
							toggleFavorite={toggleFavoriteColor}
						/>
					</div>
				)}

				{/* 4. SUGGESTIONS (Wingman & Guru Only) */}
				{showSuggestions &&
					content.suggestions &&
					content.suggestions.length > 0 && (
						<div className="pt-4 border-t border-white/5 space-y-4">
							<h4 className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-widest">
								<Lightbulb
									size={14}
									className="text-yellow-400"
								/>
								{aiLevel === "teacher"
									? "Expert Tips"
									: "Suggestions"}
							</h4>
							{content.suggestions.map(
								(suggestion: any, i: number) => (
									<div
										key={i}
										className="p-4 rounded-xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 hover:border-accent-cyan/30 transition-colors group cursor-default"
									>
										<div className="flex justify-between items-start mb-2">
											<h5 className="text-sm text-white font-medium group-hover:text-accent-cyan transition-colors">
												{suggestion.title}
											</h5>
										</div>
										<p className="text-xs text-gray-400 leading-relaxed">
											{suggestion.text}
										</p>
									</div>
								)
							)}
						</div>
					)}

				{/* 5. CONCEPTS (Guru Only) */}
				{showConcepts &&
					content.concepts &&
					content.concepts.length > 0 && (
						<div className="pt-4 border-t border-white/5 space-y-4">
							<h4 className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-widest">
								<BookOpen
									size={14}
									className="text-accent-cyan"
								/>
								Key Concepts
							</h4>
							<div className="bg-bg-raised/50 rounded-xl p-4 border border-glass-stroke space-y-3">
								{content.concepts.map(
									(concept: string, i: number) => (
										<div
											key={i}
											className="flex gap-3 items-start"
										>
											<span className="text-accent-cyan font-bold text-sm">
												{i + 1}.
											</span>
											<p className="text-sm text-gray-300">
												{concept}
											</p>
										</div>
									)
								)}
							</div>
						</div>
					)}
			</div>
		</div>
	);
};

// --- Educational Content Mapping ---
const getContentForView = (
	view: string,
	_colorStep?: string,
	_colorTab?: string,
	_typeTab?: string,
	_tokensModule?: string,
	exploreTab?: string,
	_selectedColor?: any
) => {
	// Handle Explore View
	if (view === "explore") {
		if (exploreTab === "colors") {
			return {
				lessonId: "00.1",
				title: "Color Library",
				description:
					"This is your collection of saved colors. Think of it as your palette box.",
				concepts: [
					"Star colors to save them here.",
					"Click a color to set it as your active seed.",
					"Building a library helps maintain consistency across projects.",
				],
				suggestions: [
					{
						title: "Clean Up",
						text: "Remove colors you no longer need to keep your library focused.",
					},
				],
			};
		}
		if (exploreTab === "palettes") {
			return {
				lessonId: "00.2",
				title: "Saved Palettes",
				description:
					"Groups of colors that work well together. Keep your best combinations here.",
				concepts: [
					"Save entire generated palettes for later use.",
					"Name your palettes descriptively (e.g., 'Dark Mode Details', 'Brand Primary').",
				],
				suggestions: [
					{
						title: "Create a Palette",
						text: "Use the Remix tool to create a new palette and save it.",
					},
				],
			};
		}
		if (exploreTab === "studio") {
			// NOTE: This title aligns with 'Color Studio' controls
			return {
				lessonId: "00.6",
				title: "Color Studio",
				description: "Create custom colors with precision controls.",
				concepts: [
					"Use Hue, Saturation, and Lightness for intuitive mixing.",
					"See real-time harmony suggestions on the wheel.",
				],
				suggestions: [
					{
						title: "Harmony Handles",
						text: "Drag the main handle and watch the smaller harmony handles follow automatically.",
					},
				],
			};
		}
		if (exploreTab === "remix") {
			return {
				lessonId: "00.5",
				title: "Palette Remix",
				description: "Let algorithms find the perfect colors for you.",
				concepts: [
					"Lock colors you like to keep them while regenerating others.",
					"Iterate quickly to find unexpected combinations.",
				],
				suggestions: [
					{
						title: "Lock and Roll",
						text: "Lock a nice accent color and generate options around it.",
					},
				],
			};
		}
	}

	// Default Fallback
	return {
		lessonId: "00.0",
		title: "Soloist Assistant",
		description: "Select a tool to see context and controls.",
		concepts: [],
		suggestions: [],
	};
};

// --- Subcomponents ---

const InspectedColorCard = ({ color }: { color: any }) => {
	const isDark = colord(color.value).isDark();

	return (
		<div className="space-y-3">
			{/* Color Swatch */}
			<div
				className={`relative rounded-xl overflow-hidden aspect-[4/3] shadow-sm border ${
					isDark ? "border-white/40" : "border-black/20"
				}`}
			>
				<div
					className="absolute inset-0"
					style={{ backgroundColor: color.value }}
				/>
				{/* Static Label */}
				<div
					className={`absolute inset-0 p-3 flex flex-col justify-end pointer-events-none ${
						isDark ? "text-white/90" : "text-black/80"
					}`}
				>
					<span className="text-xs font-bold uppercase opacity-70 tracking-wider mb-0.5">
						{color.name}
					</span>
					<span className="text-[10px] font-mono opacity-75">
						{color.value.toUpperCase()}
					</span>
				</div>
			</div>

			{/* Color Details */}
			<div className="space-y-2 text-sm">
				{color.description && (
					<div>
						<span className="text-xs font-mono text-accent-cyan uppercase tracking-wider block mb-1 opacity-60">
							Description
						</span>
						<p className="text-gray-300 text-xs leading-relaxed">
							{color.description}
						</p>
					</div>
				)}
				{color.meaning && (
					<div>
						<span className="text-xs font-mono text-accent-cyan uppercase tracking-wider block mb-1 opacity-60">
							Meaning
						</span>
						<p className="text-gray-300 text-xs leading-relaxed">
							{color.meaning}
						</p>
					</div>
				)}
				{color.usage && (
					<div>
						<span className="text-xs font-mono text-accent-cyan uppercase tracking-wider block mb-1 opacity-60">
							Usage
						</span>
						<p className="text-gray-300 text-xs leading-relaxed">
							{color.usage}
						</p>
					</div>
				)}
			</div>
		</div>
	);
};

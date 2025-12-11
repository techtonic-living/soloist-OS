import { Palette, Pipette, Grid, Wand2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { ColorCreator } from "./lab/ColorCreator";
import { PaletteGenerator } from "./lab/PaletteGenerator";
import { ColorLibrary } from "./lab/ColorLibrary";
import { PresetColor } from "../data/colorPresets";
import { findOrGenerateMetadata } from "../services/colorMetadata";

import { useSoloist } from "../context/SoloistContext";

interface ExploreViewProps {
	activeTab: "colors" | "palettes" | "studio" | "remix";
	setActiveTab: (tab: "colors" | "palettes" | "studio" | "remix") => void;
	onInspectColor?: (color: PresetColor | null) => void;
}

export const ExploreView = ({
	activeTab,
	setActiveTab,
	onInspectColor = () => {},
}: ExploreViewProps) => {
	const {
		seedColor,
		setSeedColor,
		secondaryRamp,
		tertiaryRamp,
		harmonyMode,
		setHarmonyMode,
		setSecondaryColor,
		setTertiaryColor,
		settings,
		updateSettings,
	} = useSoloist();

	// Derived colors for ColorCreator
	const secondaryColor = secondaryRamp[5]?.hex || "#000000";
	const tertiaryColor = tertiaryRamp[5]?.hex || "#000000";

	// Favorites Logic with Smart Metadata Sourcing
	const toggleFavoriteColor = async (
		color: string,
		existingMetadata?: PresetColor
	) => {
		const library = settings.library || {
			colors: [],
			fonts: [],
			palettes: [],
			colorCache: [],
		};

		// Check if color exists (handle both string and PresetColor)
		const exists = library.colors.some((c) =>
			typeof c === "string" ? c === color : c.value === color
		);

		if (exists) {
			// Remove color
			const newColors = library.colors.filter((c) =>
				typeof c === "string" ? c !== color : c.value !== color
			);
			updateSettings({ library: { ...library, colors: newColors } });
		} else {
			// Add color with metadata
			try {
				let colorWithMetadata: PresetColor;

				if (existingMetadata) {
					// Use provided metadata (from Library colors)
					console.log(
						`Using existing metadata for ${color}: ${existingMetadata.name}`
					);
					colorWithMetadata = existingMetadata;
				} else {
					// Smart lookup: presets → cache → AI generation
					colorWithMetadata = await findOrGenerateMetadata(
						color,
						library.colorCache || []
					);

					// Update cache if this was a new AI generation
					const wasGenerated = !library.colorCache?.some(
						(c) => c.value.toUpperCase() === color.toUpperCase()
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

	const savePalette = (colors: string[]) => {
		const library = settings.library || {
			colors: [],
			fonts: [],
			palettes: [],
		};
		const newPalette = {
			name: `Palette ${library.palettes.length + 1}`,
			colors,
		};
		updateSettings({
			library: {
				...library,
				palettes: [...library.palettes, newPalette],
			},
		});
	};

	const removePalette = (index: number) => {
		const library = settings.library || {
			colors: [],
			fonts: [],
			palettes: [],
		};
		const newPalettes = [...library.palettes];
		newPalettes.splice(index, 1);
		updateSettings({ library: { ...library, palettes: newPalettes } });
	};

	return (
		<div className="h-full flex flex-col gap-4 relative overflow-hidden py-4 px-6">
			{/* Tabs */}
			<div className="flex-shrink-0 mb-2 flex justify-center">
				<div className="inline-flex bg-bg-surface p-1 rounded-lg border border-glass-stroke">
					<TabButton
						active={activeTab === "colors"}
						onClick={() => setActiveTab("colors")}
						icon={Palette}
						label="Colors"
					/>
					<TabButton
						active={activeTab === "palettes"}
						onClick={() => setActiveTab("palettes")}
						icon={Grid}
						label="Palettes"
					/>
					<TabButton
						active={activeTab === "studio"}
						onClick={() => setActiveTab("studio")}
						icon={Pipette}
						label="Studio"
					/>
					<TabButton
						active={activeTab === "remix"}
						onClick={() => setActiveTab("remix")}
						icon={Wand2}
						label="Remix"
					/>
				</div>
			</div>

			<div className="flex-1 relative overflow-hidden rounded-2xl border border-glass-stroke bg-bg-void/30 backdrop-blur-sm">
				<AnimatePresence mode="wait">
					{/* COLORS TAB */}
					{activeTab === "colors" && (
						<motion.div
							key="colors"
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -10 }}
							transition={{ duration: 0.2 }}
							className="h-full p-6"
						>
							<ColorLibrary
								view="colors"
								library={
									settings.library || {
										colors: [],
										palettes: [],
									}
								}
								onLoadColor={setSeedColor}
								onInspectColor={onInspectColor}
								onRemoveColor={toggleFavoriteColor}
								onRemovePalette={() => {}}
							/>
						</motion.div>
					)}

					{/* PALETTES TAB */}
					{activeTab === "palettes" && (
						<motion.div
							key="palettes"
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -10 }}
							transition={{ duration: 0.2 }}
							className="h-full p-6"
						>
							<ColorLibrary
								view="palettes"
								library={
									settings.library || {
										colors: [],
										palettes: [],
									}
								}
								onLoadColor={setSeedColor}
								onRemovePalette={removePalette}
								onRemoveColor={() => {}}
							/>
						</motion.div>
					)}

					{/* STUDIO TAB (Unified Wheel + Picker) */}
					{activeTab === "studio" && (
						<motion.div
							key="studio"
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -10 }}
							transition={{ duration: 0.2 }}
							className="h-full"
						>
							<ColorCreator
								seedColor={seedColor}
								setSeedColor={setSeedColor}
								secondaryColor={secondaryColor}
								setSecondaryColor={setSecondaryColor}
								tertiaryColor={tertiaryColor}
								setTertiaryColor={setTertiaryColor}
								harmonyMode={harmonyMode}
								setHarmonyMode={setHarmonyMode}
							/>
						</motion.div>
					)}

					{/* REMIX TAB */}
					{activeTab === "remix" && (
						<motion.div
							key="remix"
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -10 }}
							transition={{ duration: 0.2 }}
							className="h-full p-6"
						>
							<PaletteGenerator onSavePalette={savePalette} />
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
};

// --- Subcomponents ---

const TabButton = ({ active, onClick, icon: Icon, label }: any) => (
	<button
		onClick={onClick}
		className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-mono transition-all ${
			active
				? "bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20 shadow-glow"
				: "text-gray-500 hover:text-white hover:bg-white/5 border border-transparent"
		}`}
	>
		<Icon size={14} />
		<span>{label}</span>
	</button>
);

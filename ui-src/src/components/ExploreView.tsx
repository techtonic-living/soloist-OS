import { Palette, Pipette, Grid, Wand2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { ColorCreator } from "./lab/ColorCreator";
import { PaletteGenerator } from "./lab/PaletteGenerator";
import { ColorLibrary } from "./lab/ColorLibrary";
import { PresetColor } from "../data/colorPresets";
import { toggleFavoriteWithMetadata } from "../utils/favorites";

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

	// Favorites Logic with shared helper (handles presets, cache, AI)
	const toggleFavoriteColor = (
		color: string,
		existingMetadata?: PresetColor
	) =>
		toggleFavoriteWithMetadata({
			color,
			existingMetadata,
			settings,
			updateSettings,
		});

	// Bulk add colors to library
	const bulkAddColors = (colors: PresetColor[]) => {
		const library = settings.library || {
			colors: [],
			fonts: [],
			palettes: [],
		};

		// Merge new colors with existing ones
		const updatedColors = [...library.colors, ...colors];

		updateSettings({
			library: {
				...library,
				colors: updatedColors,
			},
		});
	};

	// Bulk remove colors from library
	const bulkRemoveColors = (colorsToRemove: PresetColor[]) => {
		const library = settings.library || {
			colors: [],
			fonts: [],
			palettes: [],
		};

		// Create set of hex values to remove for O(1) lookup
		const hexesToRemove = new Set(
			colorsToRemove.map((c) => c.value.toUpperCase())
		);

		const updatedColors = library.colors.filter(
			(c: string | PresetColor) => {
				const hex = typeof c === "string" ? c : c.value;
				return !hexesToRemove.has(hex.toUpperCase());
			}
		);

		updateSettings({
			library: {
				...library,
				colors: updatedColors,
			},
		});
	};

	// Group Management
	const createGroup = (name: string, description: string) => {
		const library = settings.library || {
			colors: [],
			colorGroups: [],
			fonts: [],
			palettes: [],
		};
		const newGroup = {
			id: `group-${Date.now()}-${Math.random()
				.toString(36)
				.substr(2, 9)}`,
			name,
			description,
			colorIds: [],
			isActive: true,
			isHidden: false,
		};
		updateSettings({
			library: {
				...library,
				colorGroups: [...(library.colorGroups || []), newGroup],
			},
		});
	};

	const updateGroup = (id: string, updates: Partial<any>) => {
		const library = settings.library;
		if (!library || !library.colorGroups) return;
		const updatedGroups = library.colorGroups.map((g) =>
			g.id === id ? { ...g, ...updates } : g
		);
		updateSettings({
			library: { ...library, colorGroups: updatedGroups },
		});
	};

	const deleteGroup = (id: string) => {
		const library = settings.library;
		if (!library || !library.colorGroups) return;
		// Colors are just removed from the group, they logically fall back to "My Favorites" (unassigned)
		// No need to explicitly "move" them as they exist in library.colors
		const updatedGroups = library.colorGroups.filter((g) => g.id !== id);
		updateSettings({
			library: { ...library, colorGroups: updatedGroups },
		});
	};

	const moveColor = (colorHex: string, targetGroupId: string | null) => {
		const library = settings.library;
		if (!library || !library.colorGroups) return;

		// 1. Remove from all groups first (disjoint ownership)
		let updatedGroups = library.colorGroups.map((g) => ({
			...g,
			colorIds: g.colorIds.filter(
				(c) => c.toUpperCase() !== colorHex.toUpperCase()
			),
		}));

		// 2. Add to target group if specified
		if (targetGroupId) {
			updatedGroups = updatedGroups.map((g) => {
				if (g.id === targetGroupId) {
					return {
						...g,
						colorIds: [...g.colorIds, colorHex],
					};
				}
				return g;
			});
		}

		updateSettings({
			library: { ...library, colorGroups: updatedGroups },
		});
	};

	const reorderGroups = (newOrder: any[]) => {
		const library = settings.library;
		if (!library) return;
		updateSettings({
			library: { ...library, colorGroups: newOrder },
		});
	};

	// Save Palette
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
								onAddColors={bulkAddColors}
								onRemoveColors={bulkRemoveColors}
								onCreateGroup={createGroup}
								onUpdateGroup={updateGroup}
								onDeleteGroup={deleteGroup}
								onMoveColor={moveColor}
								onReorderGroups={reorderGroups}
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

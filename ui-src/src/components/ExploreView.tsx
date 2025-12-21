import { Palette, SlidersHorizontal, Grid, Wand2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { ColorCreator } from "./lab/ColorCreator";
import { PaletteGenerator } from "./lab/PaletteGenerator";
import { ColorLibrary } from "./lab/ColorLibrary";
import { PaletteLibrary } from "./lab/PaletteLibrary";
import { PresetColor } from "../data/colorPresets";
import {
	toggleFavoriteWithMetadata,
	togglePaletteWithMetadata,
} from "../utils/favorites";

import { useSoloist } from "../context/SoloistContext";
import { useToast } from "../context/ToastContext";

interface ExploreViewProps {
	activeTab: "colors" | "palettes" | "studio" | "remix";
	setActiveTab: (tab: "colors" | "palettes" | "studio" | "remix") => void;
	onInspectColor?: (color: PresetColor | null) => void;
	onInspectPalette?: (palette: any | null) => void;
	generatorColors: string[];
	setGeneratorColors: (
		colors: string[] | ((prev: string[]) => string[])
	) => void;
	inspectedRemixIndex?: number | null;
	onInspectRemixColor?: (index: number | null) => void;
	activeColorSlot?: "primary" | "secondary" | "tertiary";
	setActiveColorSlot?: (slot: "primary" | "secondary" | "tertiary") => void;
}

export const ExploreView = ({
	activeTab,
	setActiveTab,
	onInspectColor = () => {},
	onInspectPalette = () => {},
	generatorColors,
	setGeneratorColors,
	inspectedRemixIndex,
	onInspectRemixColor,
	activeColorSlot,
}: // Note: setActiveColorSlot is defined in interface but not used in this component
ExploreViewProps) => {
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

	const { showToast } = useToast();

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
				.slice(2, 11)}`,
			name,
			description,
			colorIds: [],
			isActive: true,
			isHidden: false,
		};
		updateSettings({
			library: {
				...library,
				colorGroups: [newGroup, ...(library.colorGroups || [])],
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

	// Palette Group Management
	const createPaletteGroup = (name: string, description: string) => {
		const library = settings.library || {
			colors: [],
			fonts: [],
			palettes: [],
			paletteGroups: [],
		};
		const newGroup = {
			id: `pgroup-${Date.now()}-${Math.random()
				.toString(36)
				.slice(2, 11)}`,
			name,
			description,
			paletteIds: [],
			isActive: true,
			isHidden: false,
		};
		updateSettings({
			library: {
				...library,
				paletteGroups: [newGroup, ...(library.paletteGroups || [])],
			},
		});
	};

	const updatePaletteGroup = (id: string, updates: Partial<any>) => {
		const library = settings.library;
		if (!library || !library.paletteGroups) return;
		const updatedGroups = library.paletteGroups.map((g) =>
			g.id === id ? { ...g, ...updates } : g
		);
		updateSettings({
			library: { ...library, paletteGroups: updatedGroups },
		});
	};

	const deletePaletteGroup = (id: string) => {
		const library = settings.library;
		if (!library || !library.paletteGroups) return;
		const updatedGroups = library.paletteGroups.filter((g) => g.id !== id);
		updateSettings({
			library: { ...library, paletteGroups: updatedGroups },
		});
	};

	const movePaletteToGroup = (
		paletteName: string,
		targetGroupId: string | null
	) => {
		const library = settings.library;
		if (!library || !library.paletteGroups) return;

		// 1. Remove from all groups first
		let updatedGroups = library.paletteGroups.map((g) => ({
			...g,
			paletteIds: g.paletteIds.filter((p) => p !== paletteName),
		}));

		// 2. Add to target group if specified
		if (targetGroupId) {
			updatedGroups = updatedGroups.map((g) => {
				if (g.id === targetGroupId) {
					return {
						...g,
						paletteIds: [...g.paletteIds, paletteName],
					};
				}
				return g;
			});
		}

		updateSettings({
			library: { ...library, paletteGroups: updatedGroups },
		});
	};

	const reorderPaletteGroups = (newOrder: any[]) => {
		const library = settings.library;
		if (!library) return;
		updateSettings({
			library: { ...library, paletteGroups: newOrder },
		});
	};

	// Save Palette
	const savePalette = (colors: string[]) => {
		togglePaletteWithMetadata({
			colors,
			settings,
			updateSettings,
		});
	};

	const removePalette = (index: number) => {
		const library = settings.library || {
			colors: [],
			fonts: [],
			palettes: [],
		};
		const palette = library.palettes[index];
		const newPalettes = [...library.palettes];
		newPalettes.splice(index, 1);

		// Also remove from any palette groups
		const updatedPaletteGroups = (library.paletteGroups || []).map((g) => ({
			...g,
			paletteIds: g.paletteIds.filter((id) => id !== palette.name),
		}));

		updateSettings({
			library: {
				...library,
				palettes: newPalettes,
				paletteGroups: updatedPaletteGroups,
			},
		});

		if (palette) {
			showToast(
				<>
					Removed{" "}
					<span className="text-accent-cyan">{palette.name}</span>{" "}
					from favorites
				</>
			);
		}
	};

	const removePalettes = (palettesToRemove: any[]) => {
		const library = settings.library;
		if (!library || !library.palettes) return;

		const namesToRemove = new Set(palettesToRemove.map((p) => p.name));
		const newPalettes = library.palettes.filter(
			(p: any) => !namesToRemove.has(p.name)
		);

		// Also remove from any palette groups
		const updatedPaletteGroups = (library.paletteGroups || []).map((g) => ({
			...g,
			paletteIds: g.paletteIds.filter((id) => !namesToRemove.has(id)),
		}));

		updateSettings({
			library: {
				...library,
				palettes: newPalettes,
				paletteGroups: updatedPaletteGroups,
			},
		});

		showToast(
			<>
				Removed{" "}
				<span className="text-accent-cyan">
					{palettesToRemove.length}
				</span>{" "}
				palettes from favorites
			</>
		);
	};

	// Bulk add palettes to library
	const bulkAddPalettes = (palettes: any[]) => {
		const library = settings.library || {
			colors: [],
			fonts: [],
			palettes: [],
		};

		// Filter out potential duplicates based on name/colors
		// For now, simpler check by name
		const existingNames = new Set(library.palettes.map((p: any) => p.name));
		const newPalettes = palettes.filter((p) => !existingNames.has(p.name));

		if (newPalettes.length === 0) return;

		updateSettings({
			library: {
				...library,
				palettes: [...library.palettes, ...newPalettes],
			},
		});

		showToast(
			<>
				Added{" "}
				<span className="text-accent-cyan">{newPalettes.length}</span>{" "}
				palettes to favorites
			</>
		);
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
						icon={SlidersHorizontal}
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
								onToggleFavorite={toggleFavoriteColor}
								onRemovePalette={() => {}}
								onAddColors={bulkAddColors}
								onRemoveColors={bulkRemoveColors}
								onCreateGroup={createGroup}
								onUpdateGroup={updateGroup}
								onDeleteGroup={deleteGroup}
								onMoveColor={moveColor}
								onReorderGroups={reorderGroups}
								onReorderColors={(newColors) => {
									updateSettings({
										library: {
											...settings.library,
											colors: newColors,
										},
									});
								}}
								uiPreferences={settings.uiPreferences}
								onUpdateUiPreferences={(prefs) => {
									updateSettings({
										uiPreferences: {
											...(settings.uiPreferences || {
												colorGridDensity: {
													favorites: 2,
													presets: 2,
												},
											}),
											...prefs,
										},
									});
								}}
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
							<PaletteLibrary
								library={
									settings.library || {
										colors: [],
										palettes: [],
										paletteGroups: [],
									}
								}
								onInspectPalette={onInspectPalette}
								onRemovePalette={removePalette}
								onRemovePalettes={removePalettes}
								onAddPalettes={bulkAddPalettes}
								onCreateGroup={createPaletteGroup}
								onUpdateGroup={updatePaletteGroup}
								onDeleteGroup={deletePaletteGroup}
								onMovePalette={movePaletteToGroup}
								onReorderGroups={reorderPaletteGroups}
								onReorderPalettes={(newOrder) => {
									updateSettings({
										library: {
											...settings.library,
											palettes: newOrder,
										},
									});
								}}
								uiPreferences={settings.uiPreferences}
								onUpdateUiPreferences={(prefs) => {
									updateSettings({
										uiPreferences: {
											...(settings.uiPreferences || {
												paletteGridDensity: {
													favorites: 2,
													presets: 2,
												},
											}),
											...prefs,
										},
									});
								}}
								onToggleFavorite={(colors, name) =>
									togglePaletteWithMetadata({
										colors,
										name,
										settings,
										updateSettings,
									})
								}
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
								activeColorSlot={activeColorSlot}
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
							<PaletteGenerator
								onSavePalette={savePalette}
								colors={generatorColors}
								setColors={setGeneratorColors}
								inspectedIndex={inspectedRemixIndex}
								onInspectColor={onInspectRemixColor}
								favoriteColors={
									settings.library?.colors.map((c: any) =>
										typeof c === "string" ? c : c.value
									) || []
								}
								onToggleFavoriteColor={toggleFavoriteColor}
							/>
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

import { Palette, Pipette, Grid, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { ColorCreator } from "./lab/ColorCreator";
import { PaletteGenerator } from "./lab/PaletteGenerator";
import { ColorLibrary } from "./lab/ColorLibrary";
import { PresetColor } from "../data/colorPresets";

interface ExploreViewProps {
	seedColor?: string;
	setSeedColor?: (color: string) => void;
	// Harmony props (optional for now, can be local if not syncing yet)
	secondaryColor?: string;
	setSecondaryColor?: (color: string) => void;
	tertiaryColor?: string;
	setTertiaryColor?: (color: string) => void;

	settings?: any;
	updateSettings?: (s: any) => void;
	onInspectColor?: (color: PresetColor | null) => void;
}

export const ExploreView = ({
	seedColor = "#3D8BFF",
	setSeedColor = () => {},
	secondaryColor = "#000000",
	setSecondaryColor = () => {},
	tertiaryColor = "#000000",
	setTertiaryColor = () => {},
	activeTab = "colors",
	setActiveTab = () => {},
	settings = {},
	updateSettings = () => {},
	onInspectColor = () => {},
	harmonyMode = "complementary",
	setHarmonyMode = () => {},
}: ExploreViewProps & {
	activeTab?: "colors" | "palettes" | "create" | "generator";
	setActiveTab?: (
		tab: "colors" | "palettes" | "create" | "generator"
	) => void;
	harmonyMode?: "complementary" | "analogous" | "triadic" | "manual";
	setHarmonyMode?: (
		mode: "complementary" | "analogous" | "triadic" | "manual"
	) => void;
}) => {
	// Favorites Logic
	const toggleFavoriteColor = (color: string) => {
		const library = settings.library || {
			colors: [],
			fonts: [],
			palettes: [],
		};
		const exists = library.colors.includes(color);
		const newColors = exists
			? library.colors.filter((c: string) => c !== color)
			: [...library.colors, color];
		updateSettings({ library: { ...library, colors: newColors } });
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
						active={activeTab === "create"}
						onClick={() => setActiveTab("create")}
						icon={Pipette}
						label="Create"
					/>
					<TabButton
						active={activeTab === "generator"}
						onClick={() => setActiveTab("generator")}
						icon={Sparkles}
						label="Generator"
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

					{/* CREATE TAB (Unified Wheel + Picker) */}
					{activeTab === "create" && (
						<motion.div
							key="create"
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

					{/* GENERATOR TAB */}
					{activeTab === "generator" && (
						<motion.div
							key="generator"
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

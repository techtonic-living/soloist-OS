import { useState, useEffect, useRef } from "react";
import { colord } from "colord";
import {
	RefreshCw,
	ArrowRight,
	Lock,
	Unlock,
	Sparkles,
	FlaskConical,
	GitMerge,
	Palette,
	BookOpen,
} from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { PaletteGenerator } from "./lab/PaletteGenerator";
import { ContrastLab } from "./lab/ContrastLab";
import { ColorMixer } from "./lab/ColorMixer";
import { ColorLibrary } from "./lab/ColorLibrary";
import { toggleFavoriteWithMetadata } from "../utils/favorites";
import { PresetColor } from "../data/colorPresets";

interface ColorAtelierProps {
	seedColor: string;
	setSeedColor: (color: string) => void;
	secondaryColor: string;
	setSecondaryColor: (color: string) => void;
	tertiaryColor: string;
	setTertiaryColor: (color: string) => void;
	onComplete: () => void;
	settings: any;
	updateSettings: (newSettings: any) => void;
	activeTab: "atelier" | "generator" | "contrast" | "mixer" | "library";
	setActiveTab: (
		tab: "atelier" | "generator" | "contrast" | "mixer" | "library"
	) => void;
}

export const ColorAtelier = ({
	seedColor,
	setSeedColor,
	secondaryColor,
	setSecondaryColor,
	tertiaryColor,
	setTertiaryColor,
	onComplete,
	settings,
	updateSettings,
	activeTab,
	setActiveTab,
}: ColorAtelierProps) => {
	const [harmonyMode, setHarmonyMode] = useState<
		"complementary" | "analogous" | "triadic" | "manual"
	>("complementary");
	const [locked, setLocked] = useState({ secondary: false, tertiary: false });

	// Auto-update harmonies if not manual/locked
	useEffect(() => {
		if (harmonyMode === "manual") return;

		const c = colord(seedColor);
		let sec, tert;

		if (harmonyMode === "complementary") {
			sec = c.rotate(180).toHex();
			tert = c.rotate(-30).toHex(); // Accent
		} else if (harmonyMode === "analogous") {
			sec = c.rotate(-30).toHex();
			tert = c.rotate(30).toHex();
		} else if (harmonyMode === "triadic") {
			sec = c.rotate(120).toHex();
			tert = c.rotate(240).toHex();
		}

		if (!locked.secondary && sec) setSecondaryColor(sec);
		if (!locked.tertiary && tert) setTertiaryColor(tert);
	}, [seedColor, harmonyMode]);

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

	const createGroup = (name: string, description?: string) => {
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
		const updatedGroups = library.colorGroups.map((g: any) =>
			g.id === id ? { ...g, ...updates } : g
		);
		updateSettings({
			library: { ...library, colorGroups: updatedGroups },
		});
	};

	const deleteGroup = (id: string) => {
		const library = settings.library;
		if (!library || !library.colorGroups) return;
		const updatedGroups = library.colorGroups.filter(
			(g: any) => g.id !== id
		);
		updateSettings({
			library: { ...library, colorGroups: updatedGroups },
		});
	};

	const moveColor = (colorHex: string, targetGroupId: string | null) => {
		const library = settings.library;
		if (!library || !library.colorGroups) return;

		// 1. Remove from all groups first (disjoint ownership)
		let updatedGroups = library.colorGroups.map((g: any) => ({
			...g,
			colorIds: g.colorIds.filter(
				(c: string) => c.toUpperCase() !== colorHex.toUpperCase()
			),
		}));

		// 2. Add to target group if specified
		if (targetGroupId) {
			updatedGroups = updatedGroups.map((g: any) => {
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

	const backgroundRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		if (backgroundRef.current && activeTab === "atelier") {
			backgroundRef.current.style.background = `radial-gradient(circle at 50% 50%, ${seedColor}, transparent 70%)`;
		}
	}, [activeTab, seedColor]);

	return (
		<div className="h-full flex flex-col gap-6 relative overflow-hidden">
			{/* Background Ambience (Only in Atelier Mode) */}
			{activeTab === "atelier" && (
				<div
					ref={backgroundRef}
					className="absolute inset-0 opacity-20 blur-[100px] transition-colors duration-1000 pointer-events-none"
				/>
			)}

			{/* Header / Tabs */}
			<div className="flex items-center justify-between p-1 bg-bg-surface/50 rounded-xl border border-glass-stroke backdrop-blur-md w-fit mx-auto relative z-20 mt-4">
				<TabButton
					active={activeTab === "atelier"}
					onClick={() => setActiveTab("atelier")}
					icon={Palette}
					label="Atelier"
				/>
				<TabButton
					active={activeTab === "generator"}
					onClick={() => setActiveTab("generator")}
					icon={Sparkles}
					label="Generator"
				/>
				<TabButton
					active={activeTab === "contrast"}
					onClick={() => setActiveTab("contrast")}
					icon={FlaskConical}
					label="Contrast"
				/>
				<TabButton
					active={activeTab === "mixer"}
					onClick={() => setActiveTab("mixer")}
					icon={GitMerge}
					label="Mixer"
				/>
				<div className="w-px h-4 bg-glass-stroke mx-1" />
				<TabButton
					active={activeTab === "library"}
					onClick={() => setActiveTab("library")}
					icon={BookOpen}
					label="Library"
				/>
			</div>

			<div className="flex-1 rounded-2xl p-0 relative overflow-hidden backdrop-blur-sm z-10 w-full max-w-6xl mx-auto">
				<AnimatePresence mode="wait">
					{activeTab === "atelier" && (
						<div
							key="atelier"
							className="h-full flex flex-col items-center justify-center"
						>
							{/* Original Atelier Content */}
							<div className="flex flex-col items-center gap-12 w-full max-w-4xl">
								<div className="text-center space-y-2">
									<h2 className="text-3xl font-brand text-white tracking-tight">
										The Atelier
									</h2>
									<p className="text-gray-400 font-mono text-sm">
										Craft your palette's DNA before building
										the system.
									</p>
								</div>

								{/* Harmony Selector */}
								<div className="flex gap-2 p-1 bg-black/20 backdrop-blur-md rounded-full border border-white/5">
									{[
										"complementary",
										"analogous",
										"triadic",
										"manual",
									].map((m) => (
										<button
											key={m}
											onClick={() =>
												setHarmonyMode(m as any)
											}
											className={`px-4 py-1.5 rounded-full text-xs font-mono transition-all uppercase ${
												harmonyMode === m
													? "bg-white text-black font-bold shadow-lg"
													: "text-gray-500 hover:text-white"
											}`}
										>
											{m}
										</button>
									))}
								</div>

								{/* The Orbs */}
								<div className="flex items-center gap-16">
									{/* Secondary */}
									<Orb
										color={secondaryColor}
										setColor={(c: string) => {
											setHarmonyMode("manual");
											setSecondaryColor(c);
										}}
										label="Secondary"
										size="md"
										locked={locked.secondary}
										toggleLock={() =>
											setLocked((prev) => ({
												...prev,
												secondary: !prev.secondary,
											}))
										}
									/>

									{/* Primary (Center, Large) */}
									<Orb
										color={seedColor}
										setColor={setSeedColor}
										label="Primary"
										size="lg"
										isPrimary
									/>

									{/* Tertiary */}
									<Orb
										color={tertiaryColor}
										setColor={(c: string) => {
											setHarmonyMode("manual");
											setTertiaryColor(c);
										}}
										label="Tertiary"
										size="md"
										locked={locked.tertiary}
										toggleLock={() =>
											setLocked((prev) => ({
												...prev,
												tertiary: !prev.tertiary,
											}))
										}
									/>
								</div>

								{/* Action */}
								<button
									onClick={onComplete}
									className="group flex items-center gap-3 px-8 py-3 bg-white text-black rounded-full font-mono text-sm hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]"
								>
									<span>CRYSTALLIZE SYSTEM</span>
									<ArrowRight
										size={16}
										className="group-hover:translate-x-1 transition-transform"
									/>
								</button>
							</div>
						</div>
					)}

					{activeTab === "generator" && (
						<PaletteGenerator
							key="generator"
							onSavePalette={savePalette}
						/>
					)}

					{activeTab === "contrast" && (
						<div className="p-8 h-full">
							<ContrastLab key="contrast" />
						</div>
					)}

					{activeTab === "mixer" && (
						<div className="p-8 h-full">
							<ColorMixer
								key="mixer"
								onFavorite={toggleFavoriteColor}
								favorites={settings.library?.colors || []}
							/>
						</div>
					)}

					{activeTab === "library" && (
						<div className="p-8 h-full">
							<ColorLibrary
								key="library"
								library={
									settings.library || {
										colors: [],
										fonts: [],
										palettes: [],
									}
								}
								onLoadColor={setSeedColor}
								onRemoveColor={toggleFavoriteColor}
								onRemovePalette={removePalette}
								onAddColors={bulkAddColors}
								onRemoveColors={bulkRemoveColors}
								onCreateGroup={createGroup}
								onUpdateGroup={updateGroup}
								onDeleteGroup={deleteGroup}
								onMoveColor={moveColor}
								onReorderGroups={reorderGroups}
							/>
						</div>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
};

const TabButton = ({ active, onClick, icon: Icon, label }: any) => (
	<button
		onClick={onClick}
		className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono transition-all ${
			active
				? "bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20 shadow-[0_0_10px_rgba(63,227,242,0.2)]"
				: "text-gray-500 hover:text-white hover:bg-white/5 border border-transparent"
		}`}
	>
		<Icon size={14} />
		<span>{label}</span>
	</button>
);

const Orb = ({
	color,
	setColor,
	label,
	size = "md",
	isPrimary,
	locked,
	toggleLock,
}: any) => {
	const sizeClass = size === "lg" ? "w-48 h-48" : "w-32 h-32";
	const orbRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		if (orbRef.current) {
			orbRef.current.style.backgroundColor = color;
			orbRef.current.style.boxShadow = `0 0 30px ${color}40, inset 0 0 20px rgba(0,0,0,0.2)`;
		}
	}, [color]);

	return (
		<div className="flex flex-col items-center gap-4 group relative">
			{/* Lock Control (for non-primary) */}
			{!isPrimary && (
				<button
					onClick={toggleLock}
					className={`absolute -top-8 text-gray-500 hover:text-white transition-colors ${
						locked ? "text-accent-cyan" : ""
					}`}
				>
					{locked ? <Lock size={14} /> : <Unlock size={14} />}
				</button>
			)}

			<div
				className={`${sizeClass} rounded-full relative shadow-2xl transition-transform duration-500 hover:scale-105 ${
					isPrimary
						? "z-10 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
						: "opacity-90 hover:opacity-100"
				}`}
				ref={orbRef}
			>
				{/* Invisible Inputs covering the orb */}
				<input
					type="color"
					value={color}
					onChange={(e) => setColor(e.target.value)}
					className="absolute inset-0 w-full h-full opacity-0 cursor-pointer rounded-full"
					disabled={locked}
					title={`Set ${label} color`}
				/>

				{/* Hover Icon */}
				{!locked && (
					<div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
						<RefreshCw className="text-white drop-shadow-md" />
					</div>
				)}
			</div>

			<div className="text-center">
				<h3
					className={`font-brand ${
						isPrimary
							? "text-lg text-white"
							: "text-sm text-gray-300"
					}`}
				>
					{label}
				</h3>
				<span className="font-mono text-[10px] text-gray-500 uppercase">
					{color}
				</span>
			</div>
		</div>
	);
};

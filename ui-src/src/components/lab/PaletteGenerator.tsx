import { useState } from "react";
import { Shuffle, Lock, Unlock, Save, Trash2 } from "lucide-react";
import { colord } from "colord";
import { SharedSampler } from "../common/SharedSampler";
import { PaletteCanvas } from "./PaletteCanvas";

interface PaletteGeneratorProps {
	colors: string[];
	setColors: (colors: string[]) => void;
	onSavePalette: () => void;
	favoriteColors?: string[];
	onToggleFavoriteColor?: (color: string) => void;
	inspectedIndex?: number;
	onInspectColor?: (index: number) => void;
}

export const PaletteGenerator = ({
	colors = [],
	setColors,
	onSavePalette,
	onInspectColor,
}: PaletteGeneratorProps) => {
	// Local State
	const [activeSlotIndex, setActiveSlotIndex] = useState<number | null>(0);
	const [locked, setLocked] = useState<boolean[]>(new Array(12).fill(false));

	// Helper to get active color
	const activeColor =
		activeSlotIndex !== null && colors[activeSlotIndex]
			? colors[activeSlotIndex]
			: colors[0] || "#000000";

	// Handle Slot Selection
	const handleSlotSelect = (index: number) => {
		setActiveSlotIndex(index);
		onInspectColor?.(index);
	};

	// Handle Color Update (from Dock or Sampler)
	const handleUpdateActiveColor = (newColor: string) => {
		if (activeSlotIndex === null) return;
		const nextColors = [...colors];
		nextColors[activeSlotIndex] = newColor;
		setColors(nextColors);
	};

	// Handle Randomize (Respect Locks)
	const handleRandomize = () => {
		// Generate random colors for unlocked slots
		const nextColors = colors.map((c, i) => {
			if (locked[i]) return c;
			// Simple random generation for now. AI generation comes later.
			return colord({
				h: Math.random() * 360,
				s: Math.random() * 100,
				l: Math.random() * 100,
			}).toHex();
		});
		setColors(nextColors);
	};

	// Handle Add Slot
	const handleAddSlot = () => {
		if (colors.length >= 12) return;
		// Generate a new color (maybe complementary to last?)
		const newColor = colord(colors[colors.length - 1] || "#000000")
			.rotate(30)
			.toHex();
		setColors([...colors, newColor]);
		setActiveSlotIndex(colors.length); // Select new
	};

	// Toggle Lock
	const handleToggleLock = (index: number) => {
		const next = [...locked];
		next[index] = !next[index];
		setLocked(next);
	};

	// Harmony Mode State
	const [activeMode, setActiveMode] = useState<
		"shuffle" | "harmony" | "gradient" | "mono"
	>("shuffle");

	// Generate Shuffle (Random) - respects locks
	const generateShuffle = () => {
		const nextColors = colors.map((c, i) => {
			if (locked[i]) return c;
			return colord({
				h: Math.random() * 360,
				s: 40 + Math.random() * 40, // 40-80% saturation
				l: 30 + Math.random() * 40, // 30-70% lightness
			}).toHex();
		});
		setColors(nextColors);
	};

	// Generate Harmony (Analogous from first unlocked color)
	const generateHarmony = () => {
		const baseColor = colors.find((_, i) => !locked[i]) || colors[0];
		const baseHue = colord(baseColor).toHsl().h;
		let hueOffset = 0;

		const nextColors = colors.map((c, i) => {
			if (locked[i]) return c;
			const newHue = (baseHue + hueOffset) % 360;
			hueOffset += 30; // 30° steps for analogous
			return colord({
				h: newHue,
				s: 60 + Math.random() * 20,
				l: 45 + Math.random() * 20,
			}).toHex();
		});
		setColors(nextColors);
	};

	// Generate Gradient (smooth transition between first and last)
	const generateGradient = () => {
		const firstUnlocked = colors.findIndex((_, i) => !locked[i]);
		const lastUnlocked =
			colors.length -
			1 -
			[...colors]
				.reverse()
				.findIndex((_, i) => !locked[colors.length - 1 - i]);

		if (firstUnlocked === -1) return; // All locked

		const startColor = colord(colors[firstUnlocked]);
		const endColor = colord(
			colors[lastUnlocked] || colors[firstUnlocked]
		).rotate(180);

		const unlockedCount = colors.filter((_, i) => !locked[i]).length;
		let step = 0;

		const nextColors = colors.map((c, i) => {
			if (locked[i]) return c;
			const ratio = unlockedCount > 1 ? step / (unlockedCount - 1) : 0;
			step++;
			return startColor.mix(endColor, ratio).toHex();
		});
		setColors(nextColors);
	};

	// Generate Mono (variations of first color)
	const generateMono = () => {
		const baseColor = colors.find((_, i) => !locked[i]) || colors[0];
		const baseHsl = colord(baseColor).toHsl();
		let lightStep = 0;

		const nextColors = colors.map((c, i) => {
			if (locked[i]) return c;
			// Vary lightness from 20% to 80%
			const newLight =
				20 +
				(lightStep * 60) /
					Math.max(1, colors.filter((_, j) => !locked[j]).length - 1);
			lightStep++;
			return colord({
				h: baseHsl.h,
				s: baseHsl.s,
				l: Math.min(80, Math.max(20, newLight)),
			}).toHex();
		});
		setColors(nextColors);
	};

	// Handle Mode Selection
	const handleModeSelect = (
		mode: "shuffle" | "harmony" | "gradient" | "mono"
	) => {
		setActiveMode(mode);
		switch (mode) {
			case "shuffle":
				generateShuffle();
				break;
			case "harmony":
				generateHarmony();
				break;
			case "gradient":
				generateGradient();
				break;
			case "mono":
				generateMono();
				break;
		}
	};

	// Delete Slot
	const handleDeleteSlot = () => {
		if (activeSlotIndex === null || colors.length <= 1) return;
		const nextColors = colors.filter((_, i) => i !== activeSlotIndex);
		const nextLocked = locked.filter((_, i) => i !== activeSlotIndex);
		setColors(nextColors);
		setLocked(nextLocked);
		setActiveSlotIndex(Math.max(0, activeSlotIndex - 1));
	};

	return (
		<div
			className="flex-1 h-full relative flex flex-col items-center justify-center p-8 overflow-y-auto overflow-x-hidden custom-scrollbar bg-bg-void"
			style={{ scrollbarGutter: "stable" }}
		>
			{/* Ambient Background Glow */}
			<div
				className="absolute inset-0 pointer-events-none opacity-20 transition-colors duration-700 ease-cinematic"
				style={{
					background: `radial-gradient(circle at 50% 50%, ${activeColor}, transparent 70%)`,
				}}
			/>

			<div className="absolute inset-0 bg-blueprint-grid opacity-10 pointer-events-none" />

			{/* Main Layout Container */}
			<div className="relative w-full max-w-[800px] aspect-video flex items-center justify-between z-10">
				{/* Left Toolbar (Slots 1-6) */}
				<div className="w-12 flex flex-col gap-2">
					{Array.from({ length: 6 }).map((_, i) => {
						const index = i;
						const color = colors[index];
						if (!color)
							return (
								<div
									key={i}
									className="w-10 h-10 rounded-full border border-white/5 bg-white/5 flex items-center justify-center opacity-30"
								>
									<span className="text-[9px] font-mono text-white/50">
										{index + 1}
									</span>
								</div>
							);

						const isSelected = activeSlotIndex === index;
						return (
							<button
								key={index}
								onClick={() => handleSlotSelect(index)}
								className={`w-10 h-10 rounded-full border transition-all duration-200 relative group flex-shrink-0 ${
									isSelected
										? "border-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.3)]"
										: "border-white/10 hover:border-white/50"
								}`}
								style={{ backgroundColor: color }}
							>
								{locked[index] && (
									<div className="absolute inset-0 flex items-center justify-center text-black/50">
										<Lock size={12} />
									</div>
								)}
							</button>
						);
					})}
				</div>

				{/* Center Canvas */}
				<div className="relative w-[320px] h-[320px] flex-shrink-0">
					<PaletteCanvas
						colors={colors}
						activeIndex={activeSlotIndex}
						locked={locked}
						onSelectSlot={handleSlotSelect}
						onAddSlot={handleAddSlot}
					/>
				</div>

				{/* Right Toolbar (Slots 7-12 + Sampler) */}
				<div className="w-12 flex flex-col gap-2 items-center">
					{/* Integrated Shared Sampler */}
					<div className="mb-2">
						<SharedSampler
							onSelectColor={handleUpdateActiveColor}
						/>
					</div>

					{Array.from({ length: 6 }).map((_, i) => {
						const index = i + 6;
						const color = colors[index];
						if (!color)
							return (
								<div
									key={index}
									className="w-10 h-10 rounded-full border border-white/5 bg-white/5 flex items-center justify-center opacity-30"
								>
									<span className="text-[9px] font-mono text-white/50">
										{index + 1}
									</span>
								</div>
							);

						const isSelected = activeSlotIndex === index;
						return (
							<button
								key={index}
								onClick={() => handleSlotSelect(index)}
								className={`w-10 h-10 rounded-full border transition-all duration-200 relative group flex-shrink-0 ${
									isSelected
										? "border-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.3)]"
										: "border-white/10 hover:border-white/50"
								}`}
								style={{ backgroundColor: color }}
							>
								{locked[index] && (
									<div className="absolute inset-0 flex items-center justify-center text-black/50">
										<Lock size={12} />
									</div>
								)}
							</button>
						);
					})}
				</div>
			</div>

			{/* Docked Control Bar */}
			<div className="absolute bottom-6 left-1/2 -translate-x-1/2 h-14 bg-bg-surface/90 backdrop-blur-xl border border-glass-stroke rounded-full px-6 flex items-center gap-6 shadow-2xl z-50">
				{/* Randomize Button */}
				<button
					onClick={handleRandomize}
					className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors group relative"
					title="Randomize Unlocked Colors"
				>
					<Shuffle
						size={18}
						className="group-hover:rotate-180 transition-transform duration-500"
					/>
				</button>

				{/* Save Button */}
				<button
					onClick={onSavePalette}
					className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors hover:text-accent-cyan"
					title="Save Palette"
				>
					<Save size={18} />
				</button>

				<div className="w-px h-8 bg-white/10" />

				{/* Active Color Controls */}
				<div className="flex items-center gap-4">
					{activeSlotIndex !== null ? (
						<>
							{/* Functional Sat/Light Sliders */}
							<div className="flex flex-col gap-1.5 w-28">
								{/* Saturation Slider */}
								<div className="flex items-center gap-2">
									<span className="text-[8px] text-white/40 w-3">
										S
									</span>
									<input
										type="range"
										min="0"
										max="100"
										value={colord(activeColor).toHsl().s}
										onChange={(e) => {
											const hsl =
												colord(activeColor).toHsl();
											handleUpdateActiveColor(
												colord({
													h: hsl.h,
													s: Number(e.target.value),
													l: hsl.l,
												}).toHex()
											);
										}}
										className="w-full h-1 appearance-none bg-gradient-to-r from-gray-500 to-white rounded-full cursor-pointer"
									/>
								</div>
								{/* Lightness Slider */}
								<div className="flex items-center gap-2">
									<span className="text-[8px] text-white/40 w-3">
										L
									</span>
									<input
										type="range"
										min="0"
										max="100"
										value={colord(activeColor).toHsl().l}
										onChange={(e) => {
											const hsl =
												colord(activeColor).toHsl();
											handleUpdateActiveColor(
												colord({
													h: hsl.h,
													s: hsl.s,
													l: Number(e.target.value),
												}).toHex()
											);
										}}
										className="w-full h-1 appearance-none bg-gradient-to-r from-black via-gray-500 to-white rounded-full cursor-pointer"
									/>
								</div>
							</div>

							{/* Hex Display */}
							<div className="font-mono text-xs text-white/90 font-bold bg-black/20 px-2 py-1 rounded">
								{activeColor.toUpperCase()}
							</div>

							{/* Lock Toggle */}
							<button
								onClick={() =>
									handleToggleLock(activeSlotIndex)
								}
								className={`p-1.5 rounded-full transition-colors ${
									locked[activeSlotIndex]
										? "bg-accent-cyan/20 text-accent-cyan"
										: "text-white/40 hover:text-white"
								}`}
							>
								{locked[activeSlotIndex] ? (
									<Lock size={14} />
								) : (
									<Unlock size={14} />
								)}
							</button>
							{/* Delete Slot Button */}
							{colors.length > 1 && (
								<button
									onClick={handleDeleteSlot}
									className="p-1.5 rounded-full text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"
									title="Delete Slot"
								>
									<Trash2 size={14} />
								</button>
							)}
						</>
					) : (
						<span className="text-white/30 text-xs tracking-wider uppercase font-mono">
							Select a Slot
						</span>
					)}
				</div>
			</div>

			{/* Top Toolbar (Harmony Modes) */}
			<div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-2 p-1 bg-black/20 backdrop-blur-md rounded-full border border-white/5">
				{(["shuffle", "harmony", "gradient", "mono"] as const).map(
					(mode) => (
						<button
							key={mode}
							onClick={() => handleModeSelect(mode)}
							className={`px-3 py-1 rounded-full text-[10px] transition-all font-mono uppercase tracking-wider ${
								activeMode === mode
									? "bg-white/20 text-white"
									: "text-white/50 hover:bg-white/10 hover:text-white"
							}`}
						>
							{mode}
						</button>
					)
				)}
			</div>
		</div>
	);
};

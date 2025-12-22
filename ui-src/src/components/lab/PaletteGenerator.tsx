import { useState } from "react";
import { Shuffle, Lock, Unlock, Save } from "lucide-react";
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

	return (
		<div className="flex-1 h-full relative flex flex-col items-center justify-center p-8 overflow-hidden bg-bg-void">
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
							{/* Mock Sliders for Sat/Light - Visual Only for Phase 1/3 */}
							<div className="flex flex-col gap-1 w-24">
								<div className="h-1 bg-white/10 rounded-full overflow-hidden">
									<div className="h-full bg-gradient-to-r from-gray-500 to-white w-1/2" />
								</div>
								<div className="h-1 bg-white/10 rounded-full overflow-hidden">
									<div className="h-full bg-gradient-to-r from-black to-white w-3/4" />
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
						</>
					) : (
						<span className="text-white/30 text-xs tracking-wider uppercase font-mono">
							Select a Slot
						</span>
					)}
				</div>
			</div>

			{/* Top Toolbar (Harmony Placeholder) */}
			<div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-2 p-1 bg-black/20 backdrop-blur-md rounded-full border border-white/5">
				{["Shuffle", "Harmony", "Gradient", "Mono"].map((mode) => (
					<button
						key={mode}
						className="px-3 py-1 rounded-full text-[10px] text-white/50 hover:bg-white/10 hover:text-white transition-all font-mono uppercase tracking-wider"
					>
						{mode}
					</button>
				))}
			</div>
		</div>
	);
};

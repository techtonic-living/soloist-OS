import { useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Lock } from "lucide-react";
import { colord } from "colord";

interface PaletteCanvasProps {
	colors: string[];
	activeIndex: number | null;
	locked: boolean[];
	onSelectSlot: (index: number) => void;
	onAddSlot?: () => void;
}

export const PaletteCanvas = ({
	colors,
	activeIndex,
	locked,
	onSelectSlot,
	onAddSlot,
}: PaletteCanvasProps) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const size = 320;
	const center = size / 2;

	// Calculate positions based on count
	const nodes = useMemo(() => {
		const count = colors.length;
		// Layout Strategy:
		// If <= 1: Center
		// If 2-6: Single Ring
		// If 7+: Inner Ring (6) + Outer Ring (rest)
		// Or simpler: Just distribution.

		const layout = [];
		const radius = size * 0.35; // 35% radius

		if (count === 1) {
			layout.push({ x: center, y: center, color: colors[0], index: 0 });
		} else {
			// For Remix, typically we want a ring visualization.
			// If count > 8, maybe 2 rings?
			// Let's stick to single ring for consistency with "Orbital" feel,
			// unless it gets too crowded. Max 12 slots.
			// 12 slots on a ring of radius ~110px (320px * 0.35) -> Circumference ~690px.
			// Node size ~40px. 12 * 40 = 480. Fits easily.

			// Start angle: -90 (Top)
			const step = 360 / count;
			for (let i = 0; i < count; i++) {
				const angle = (i * step - 90) * (Math.PI / 180);
				const x = center + radius * Math.cos(angle);
				const y = center + radius * Math.sin(angle);
				layout.push({ x, y, color: colors[i], index: i });
			}
		}
		return layout;
	}, [colors, size]);

	// Add Button Position (Center? Or at end of ring?)
	// If ring is full, maybe center?
	// User requested (+) button.
	// If I put it in the center, it acts as the "Source" or "Add New".
	const showAddButton = onAddSlot && colors.length < 12;

	return (
		<div
			ref={containerRef}
			className="w-full h-full relative"
			style={{ width: size, height: size }}
		>
			{/* Ambient Connections (SVG) */}
			<svg className="absolute inset-0 pointer-events-none opacity-20">
				<circle
					cx={center}
					cy={center}
					r={size * 0.35}
					fill="none"
					stroke="currentColor"
					strokeWidth="1"
					className="text-white"
				/>
				{/* Connecting lines from center to nodes? */}
				{nodes.map((node, i) => (
					<line
						key={`line-${i}`}
						x1={center}
						y1={center}
						x2={node.x}
						y2={node.y}
						stroke="currentColor"
						strokeWidth="1"
						className="text-white/50"
					/>
				))}
			</svg>

			{/* Central Add Button (if meaningful) or Decoration */}
			<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0">
				{showAddButton ? (
					<button
						onClick={onAddSlot}
						className="w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all backdrop-blur-sm group"
						title="Add Color Slot"
					>
						<Plus
							size={24}
							className="group-hover:scale-110 transition-transform"
						/>
					</button>
				) : (
					<div className="w-4 h-4 rounded-full bg-white/10 blur-sm" />
				)}
			</div>

			{/* Color Nodes */}
			<AnimatePresence mode="popLayout">
				{nodes.map((node) => {
					const isSelected = activeIndex === node.index;
					const isLocked = locked[node.index];
					const isDark = colord(node.color).isDark();

					return (
						<motion.button
							key={node.index} // Use index as key if order is stable, or color if distinct? Index is better for remix slots.
							layout
							initial={{ scale: 0, opacity: 0 }}
							animate={{
								scale: 1,
								opacity: 1,
								x: node.x - 24,
								y: node.y - 24,
							}} // 24 is half of w-12 (48px)
							exit={{ scale: 0, opacity: 0 }}
							transition={{
								type: "spring",
								stiffness: 300,
								damping: 25,
							}}
							className={`absolute w-12 h-12 rounded-full shadow-lg border-2 flex items-center justify-center z-10 group ${
								isSelected
									? "border-white ring-2 ring-accent-cyan/50 scale-110 z-20"
									: "border-white/20 hover:border-white/50 hover:scale-105"
							}`}
							style={{
								backgroundColor: node.color,
								boxShadow: isSelected
									? `0 0 20px ${node.color}`
									: "none",
							}}
							onClick={() => onSelectSlot(node.index)}
						>
							{/* Lock Icon Overlay */}
							{isLocked && (
								<Lock
									size={14}
									className={`${
										isDark
											? "text-white/80"
											: "text-black/60"
									}`}
								/>
							)}

							{/* Hover Active Indicator */}
							{!isLocked && isSelected && (
								<div
									className={`w-1.5 h-1.5 rounded-full ${
										isDark ? "bg-white" : "bg-black"
									}`}
								/>
							)}
						</motion.button>
					);
				})}
			</AnimatePresence>
		</div>
	);
};

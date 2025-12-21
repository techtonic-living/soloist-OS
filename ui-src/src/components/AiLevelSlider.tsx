import { motion } from "framer-motion";
import { Zap, Cpu, Ghost } from "lucide-react";
import { AILevel } from "../hooks/useSoloistSystem";

interface AiLevelSliderProps {
	value: AILevel;
	onChange: (level: AILevel) => void;
	orientation?: "horizontal" | "vertical";
}

export const AiLevelSlider = ({
	value,
	onChange,
	orientation = "horizontal",
}: AiLevelSliderProps) => {
	const levels: AILevel[] = ["silent", "guide", "teacher"]; // Bottom to Top for vertical, Left to Right for horizontal

	const getIndex = (val: AILevel) => levels.indexOf(val);

	const getIcon = (level: AILevel) => {
		switch (level) {
			case "silent":
				return Ghost;
			case "guide":
				return Cpu;
			case "teacher":
				return Zap;
		}
	};

	const CurrentIcon = getIcon(value);
	const isVertical = orientation === "vertical";

	// Styles based on orientation
	const containerClasses = isVertical
		? "flex flex-col items-center gap-2 bg-black/60 p-1 pb-4 rounded-full border border-white/20 relative group w-12 shadow-lg backdrop-blur-sm"
		: "flex items-center gap-3 bg-black/60 p-1 pr-4 rounded-full border border-white/20 relative group shadow-lg backdrop-blur-sm";

	const trackContainerClasses = isVertical
		? "relative w-8 h-32 bg-white/10 rounded-full flex flex-col items-center p-1 cursor-pointer border border-white/20 shadow-inner"
		: "relative h-8 w-32 bg-white/10 rounded-full flex items-center p-1 cursor-pointer border border-white/20 shadow-inner";

	const trackLineClasses = isVertical
		? "absolute inset-y-2 w-1 bg-white/20 rounded-full"
		: "absolute inset-x-2 h-1 bg-white/20 rounded-full";

	// Thumb Position Logic
	const thumbPos = getIndex(value) / 2; // 0, 0.5, 1
	// Vertical: 0 at bottom (Silent), 1 at top (Teacher)? Or Top to Bottom?
	// Usually sliders are Bottom (min) to Top (max).
	// Let's assume Silent is Min, Teacher is Max.
	// So Silent at Bottom.
	// thumbPos 0 (Silent) -> Bottom. thumbPos 1 (Teacher) -> Top.
	// Because CSS `top` or `bottom`. Let's use `bottom` for vertical?
	// Wait, array order is silent, guide, teacher.
	// If I want silent at bottom, index 0 is bottom.

	const thumbStyle = isVertical
		? { bottom: `${thumbPos * 80 + 4}px` }
		: { left: `${thumbPos * 80 + 4}px` };

	return (
		<div className={containerClasses}>
			<div className={trackContainerClasses}>
				{/* Track Background */}
				<div className={trackLineClasses} />

				{/* Active Thumb */}
				<motion.div
					layout
					transition={{ type: "spring", stiffness: 500, damping: 30 }}
					className="absolute h-6 w-6 rounded-full bg-accent-cyan shadow-[0_0_10px_rgba(34,211,238,0.6)] z-10 flex items-center justify-center text-black"
					style={thumbStyle}
				>
					<CurrentIcon size={14} strokeWidth={2.5} />
				</motion.div>

				{/* Clickable Areas */}
				<div
					className={`absolute inset-0 flex ${
						isVertical ? "flex-col-reverse" : ""
					}`}
				>
					{/* flex-col-reverse makes first item (silent) at bottom */}
					{levels.map((level) => (
						<div
							key={level}
							onClick={() => onChange(level)}
							className="flex-1 z-20 cursor-pointer"
							title={
								level.charAt(0).toUpperCase() + level.slice(1)
							}
						/>
					))}
				</div>
			</div>
			{!isVertical && (
				<span className="text-xs font-mono text-accent-cyan uppercase tracking-wider w-16 text-right">
					{value}
				</span>
			)}
		</div>
	);
};

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Unlock } from "lucide-react";
import { generateColorAdvice, AILevel } from "../utils/aiLogic";

const INITIAL_RAMP = [
	{ id: 1, hex: "#0B0D12", name: "void.900", locked: true },
	{ id: 2, hex: "#1A1D24", name: "void.800", locked: false },
	{ id: 3, hex: "#2C3038", name: "void.700", locked: false },
	{
		id: 4,
		hex: "#3D8BFF",
		name: "primary.500",
		locked: true,
		isAccent: true,
	},
	{ id: 5, hex: "#6AA4FF", name: "primary.300", locked: false },
];

export const ColorMatrix = ({ aiLevel }: { aiLevel: AILevel }) => {
	const [ramp, setRamp] = useState(INITIAL_RAMP);
	const [hoveredColor, setHoveredColor] = useState<number | null>(null);

	const advice = hoveredColor
		? generateColorAdvice(
				"#FFFFFF",
				ramp.find((c) => c.id === hoveredColor)?.hex || "#000",
				aiLevel
		  )
		: null;

	const toggleLock = (id: number) => {
		setRamp((prev) =>
			prev.map((c) => (c.id === id ? { ...c, locked: !c.locked } : c))
		);
	};

	return (
		<div className="flex flex-col h-full gap-6">
			<AnimatePresence>
				{advice && (
					<motion.div
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: "auto" }}
						exit={{ opacity: 0, height: 0 }}
						className={`rounded-lg border-l-2 p-4 backdrop-blur-md ${
							advice.status === "error"
								? "bg-accent-error/10 border-accent-error"
								: advice.status === "success"
								? "bg-accent-success/10 border-accent-success"
								: "bg-accent-cyan/10 border-accent-cyan"
						}`}
					>
						<p
							className={`font-mono text-xs ${
								advice.status === "error"
									? "text-accent-error"
									: advice.status === "success"
									? "text-accent-success"
									: "text-accent-cyan"
							}`}
						>
							<span className="font-bold uppercase tracking-widest mr-2">
								{aiLevel === "teacher"
									? "Professor:"
									: "System:"}
							</span>
							{advice.message}
						</p>
					</motion.div>
				)}
			</AnimatePresence>

			<div className="flex-1 flex gap-4 items-end justify-center perspective-1000 min-h-[300px]">
				{ramp.map((color, index) => (
					<MonolithColumn
						key={color.id}
						color={color}
						index={index}
						onHover={setHoveredColor}
						onLeave={() => setHoveredColor(null)}
						onToggleLock={() => toggleLock(color.id)}
					/>
				))}
			</div>
		</div>
	);
};

const MonolithColumn = ({
	color,
	index,
	onHover,
	onLeave,
	onToggleLock,
}: any) => {
	return (
		<motion.div
			layout
			onMouseEnter={() => onHover(color.id)}
			onMouseLeave={onLeave}
			initial={{ opacity: 0, y: 50 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
			className="relative group flex flex-col items-center gap-3 w-20"
		>
			<div
				className="w-full relative rounded-xl transition-all duration-300 group-hover:-translate-y-4 cursor-pointer"
				style={{
					height: color.isAccent ? "280px" : "220px",
					backgroundColor: color.hex,
					boxShadow: `0 20px 40px -10px ${color.hex}40`,
				}}
			>
				<div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent rounded-xl pointer-events-none" />
				<div className="absolute inset-0 border border-white/10 rounded-xl" />
				<div className="absolute bottom-4 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
					<button
						onClick={(e) => {
							e.stopPropagation();
							onToggleLock();
						}}
						className="p-2 bg-black/20 backdrop-blur-sm rounded-full text-white/70 hover:text-white"
					>
						{color.locked ? (
							<Lock size={12} />
						) : (
							<Unlock size={12} />
						)}
					</button>
				</div>
			</div>
			<div className="text-center space-y-1">
				<p className="font-brand text-lg text-white tracking-wide">
					{color.name.split(".")[1]}
				</p>
				<p className="font-mono text-[10px] text-gray-500 uppercase tracking-wider">
					{color.hex}
				</p>
			</div>
		</motion.div>
	);
};

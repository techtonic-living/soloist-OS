import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Unlock, Eye, Sparkles } from "lucide-react";
import { generateColorAdvice } from "../utils/aiLogic";

// Mocking a fixed context background for now (e.g., the app background)
const CONTEXT_BG = "#050510";

export const ColorMatrix = ({
	ramp,
	setRamp,
	setSeedColor,
	onSync,
	aiLevel = "guide",
}: {
	ramp: any[];
	setRamp: any;
	setSeedColor: (color: string) => void;
	onSync?: () => void;
	aiLevel?: "silent" | "guide" | "teacher";
}) => {
	const [showAudit, setShowAudit] = useState(false);

	const toggleLock = (id: number) => {
		setRamp((prev: any[]) =>
			prev.map((c) => (c.id === id ? { ...c, locked: !c.locked } : c))
		);
	};

	return (
		<div className="flex flex-col h-full gap-6">
			<div className="flex justify-between items-center px-2">
				<span className="text-xs font-mono text-gray-500">
					RAMP VISUALIZATION
				</span>
				<div className="flex gap-2">
					{onSync && (
						<button
							onClick={onSync}
							className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-glass-stroke text-xs text-gray-400 hover:text-white hover:border-gray-500 transition-all bg-transparent"
						>
							<Sparkles size={12} />
							<span>SYNC VARIABLES</span>
						</button>
					)}
					<button
						onClick={() => setShowAudit(!showAudit)}
						className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs transition-all ${
							showAudit
								? "bg-accent-cyan/10 border-accent-cyan text-accent-cyan shadow-[0_0_15px_rgba(63,227,242,0.3)]"
								: "bg-transparent border-glass-stroke text-gray-400 hover:text-white"
						}`}
					>
						<Eye size={12} />
						<span>AI AUDIT: {showAudit ? "ON" : "OFF"}</span>
					</button>
				</div>
			</div>

			<div className="flex-1 flex gap-4 items-end justify-center perspective-1000 min-h-[300px]">
				{ramp.map((color, index) => (
					<MonolithColumn
						key={color.id}
						color={color}
						index={index}
						onToggleLock={() => toggleLock(color.id)}
						isSeed={color.isAccent}
						setSeedColor={setSeedColor}
						showAudit={showAudit}
						aiLevel={aiLevel}
					/>
				))}
			</div>
		</div>
	);
};

const MonolithColumn = ({
	color,
	index,
	onToggleLock,
	isSeed,
	setSeedColor,
	showAudit,
	aiLevel,
}: any) => {
	// Audit this color against the dark void background
	const advice = generateColorAdvice(color.hex, CONTEXT_BG, aiLevel);

	return (
		<motion.div
			layout
			initial={{ opacity: 0, y: 50 }}
			animate={{ opacity: 1, y: 0 }}
			whileHover={{
				y: -16,
				transition: { type: "spring", stiffness: 300, damping: 20 },
			}}
			transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
			className="relative group flex flex-col items-center gap-3 w-16"
		>
			<div
				className="w-full relative rounded-xl cursor-pointer transition-all duration-500"
				style={{
					height: color.isAccent ? "280px" : "220px",
					backgroundColor: color.hex,
					boxShadow: `0 20px 40px -10px ${color.hex}40`,
					filter:
						showAudit && advice?.status === "error"
							? "grayscale(0.8) opacity(0.5)"
							: "none",
				}}
			>
				{isSeed && (
					<input
						type="color"
						value={color.hex}
						onChange={(e) => setSeedColor(e.target.value)}
						className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-20"
					/>
				)}
				<div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent rounded-xl pointer-events-none" />
				<div className="absolute inset-0 border border-white/10 rounded-xl" />

				{/* Lock Button */}
				<div className="absolute bottom-4 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity z-30">
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

				{/* Audit Badge */}
				<AnimatePresence>
					{showAudit && advice && (
						<motion.div
							initial={{ scale: 0, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							exit={{ scale: 0, opacity: 0 }}
							className={`absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center border-2 border-[#050510] shadow-lg z-40 ${
								advice.status === "success"
									? "bg-accent-success text-[#050510]"
									: advice.status === "warning"
									? "bg-yellow-400 text-[#050510]"
									: "bg-red-500 text-white"
							}`}
						>
							<span className="text-[10px] font-bold font-mono">
								{advice.rating}
							</span>
						</motion.div>
					)}
				</AnimatePresence>
			</div>

			{/* Label Area */}
			<div className="text-center space-y-1">
				<p className="font-brand text-lg text-white tracking-wide">
					{color.name
						? color.name.split("/")[1] || color.name.split(".")[1]
						: "???"}
				</p>
				{/* Show Hex or Ratio based on mode */}
				<p
					key={showAudit ? "ratio" : "hex"}
					className="font-mono text-[10px] text-gray-500 uppercase tracking-wider"
				>
					{showAudit
						? advice
							? `R: ${advice.ratio.toFixed(2)}`
							: "N/A"
						: color.hex}
				</p>
			</div>
		</motion.div>
	);
};

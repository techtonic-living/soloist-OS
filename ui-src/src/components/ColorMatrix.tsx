import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Unlock, Eye, Sparkles, Copy, Check } from "lucide-react";
import { generateColorAdvice } from "../utils/aiLogic";

// Mocking a fixed context background for now (e.g., the app background)
const CONTEXT_BG = "#050510";

// --- Helper for Clipboard ---
const copyToClipboard = async (text: string) => {
	try {
		if (navigator.clipboard) {
			await navigator.clipboard.writeText(text);
		} else {
			// Fallback
			const textArea = document.createElement("textarea");
			textArea.value = text;
			document.body.appendChild(textArea);
			textArea.select();
			document.execCommand("copy");
			document.body.removeChild(textArea);
		}
		return true;
	} catch (err) {
		console.error("Failed to copy", err);
		return false;
	}
};

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
	const [toast, setToast] = useState<{
		message: string;
		visible: boolean;
	} | null>(null);

	const showToast = (message: string) => {
		setToast({ message, visible: true });
		setTimeout(() => setToast(null), 2000);
	};

	const toggleLock = (id: number) => {
		setRamp((prev: any[]) =>
			prev.map((c) => (c.id === id ? { ...c, locked: !c.locked } : c))
		);
	};

	return (
		<div className="flex flex-col h-full gap-6 relative">
			{/* TOAST OVERLAY */}
			<AnimatePresence>
				{toast && (
					<motion.div
						initial={{ opacity: 0, y: 20, scale: 0.9 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: 20, scale: 0.9 }}
						className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 bg-zinc-900/90 backdrop-blur-md border border-white/20 rounded-full shadow-2xl"
					>
						<Check size={14} className="text-accent-success" />
						<span className="text-xs font-bold text-white">
							{toast.message}
						</span>
					</motion.div>
				)}
			</AnimatePresence>

			<div className="flex justify-between items-center px-2">
				<span className="text-xs font-mono text-gray-500">
					RAMP VISUALIZATION
				</span>
				<div className="flex gap-2">
					{onSync && (
						<button
							onClick={onSync}
							className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-glass-stroke text-xs text-gray-400 hover:text-white hover:border-gray-500 transition-all bg-transparent group"
						>
							<Sparkles
								size={12}
								className="group-hover:text-accent-cyan transition-colors"
							/>
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

			<div className="flex-1 flex gap-3 items-end justify-center perspective-1000 min-h-[300px] pb-8 overflow-x-auto custom-scrollbar px-4">
				<AnimatePresence mode="popLayout">
					{ramp.map((color, index) => (
						<MonolithColumn
							key={color.hex + index} // Force re-render on hex change/shuffle for animation
							color={color}
							index={index}
							onToggleLock={() => toggleLock(color.id)}
							isSeed={color.isAccent}
							setSeedColor={setSeedColor}
							showAudit={showAudit}
							aiLevel={aiLevel}
							onCopy={() => {
								copyToClipboard(color.hex);
								showToast(`Copied ${color.hex.toUpperCase()}`);
							}}
						/>
					))}
				</AnimatePresence>
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
	onCopy,
}: any) => {
	// Audit this color against the dark void background
	const advice = generateColorAdvice(color.hex, CONTEXT_BG, aiLevel);
	const [hovered, setHovered] = useState(false);

	// Calculate height curve (bell curve-ish for visual interest)
	// Or just step up/down. Let's stick to the previous step logic but refined.
	// Accent is usually in the middle.
	// let heightBase = 200;
	// if (isSeed) heightBase = 280;

	return (
		<motion.div
			layout
			initial={{ opacity: 0, y: 100, scale: 0.8 }}
			animate={{
				opacity: 1,
				y: 0,
				scale: 1,
				transition: {
					type: "spring",
					stiffness: 120, // Bouncy
					damping: 15,
					delay: index * 0.04, // Stagger
				},
			}}
			exit={{ opacity: 0, scale: 0, y: 20 }}
			onHoverStart={() => setHovered(true)}
			onHoverEnd={() => setHovered(false)}
			className="relative group flex flex-col items-center gap-3 w-14 flex-shrink-0"
		>
			<div
				className="w-full relative rounded-xl cursor-pointer transition-all duration-300 transform-gpu"
				onClick={onCopy}
				style={{
					height: color.isAccent ? "280px" : "220px", // Fixed heights for now, could be dynamic
					backgroundColor: color.hex,
					boxShadow:
						hovered || isSeed
							? `0 0 30px -5px ${color.hex}80`
							: `0 10px 20px -10px ${color.hex}40`,
					filter:
						showAudit && advice?.status === "error"
							? "grayscale(0.8) opacity(0.5)"
							: "none",
					transform:
						hovered || isSeed
							? "translateY(-10px) scale(1.05)"
							: "none",
					zIndex: hovered ? 50 : 1,
				}}
			>
				{/* Hidden Seed Input for "Use Base" or just editing */}
				{isSeed && (
					<input
						type="color"
						value={color.hex}
						onChange={(e) => setSeedColor(e.target.value)}
						onClick={(e) => e.stopPropagation()} // Prevent copy
						className="absolute inset-x-0 bottom-0 h-8 opacity-0 cursor-pointer w-full z-20"
						title="Change Seed Color"
					/>
				)}

				{/* Glassy Overlays */}
				<div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-50 pointer-events-none rounded-xl" />
				<div className="absolute inset-0 border border-white/20 rounded-xl pointer-events-none" />

				{/* Copy Icon Overlay on Hover */}
				<div
					className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${
						hovered ? "opacity-100" : "opacity-0"
					}`}
				>
					<div className="bg-black/30 backdrop-blur-sm p-2 rounded-full text-white shadow-lg">
						<Copy size={16} />
					</div>
				</div>

				{/* Lock Button */}
				<div className="absolute bottom-4 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity z-30 pointer-events-none">
					{/* Pointer events none on container so click goes through to copy, ENABLE on button */}
					<button
						onClick={(e) => {
							e.stopPropagation();
							onToggleLock();
						}}
						className="p-1.5 bg-black/40 backdrop-blur-md rounded-full text-white/70 hover:text-white hover:bg-black/60 transition-colors pointer-events-auto shadow-lg border border-white/10"
						title={color.locked ? "Unlock" : "Lock"}
					>
						{color.locked ? (
							<Lock size={12} />
						) : (
							<Unlock size={12} />
						)}
					</button>
				</div>

				{/* Locked Indicator (Always visible if locked) */}
				{color.locked && !hovered && (
					<div className="absolute bottom-4 left-0 right-0 flex justify-center z-20">
						<div className="p-1 bg-black/20 rounded-full">
							<Lock size={10} className="text-white/50" />
						</div>
					</div>
				)}

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
			<div className="text-center space-y-0.5">
				<p className="font-brand text-sm text-gray-300 tracking-wide font-medium">
					{color.name
						? color.name.split("/")[1] || color.name.split(".")[1]
						: "???"}
				</p>
				{/* Show Hex or Ratio based on mode */}
				<p
					key={showAudit ? "ratio" : "hex"}
					className="font-mono text-[9px] text-gray-500 uppercase tracking-wider transition-colors group-hover:text-accent-cyan"
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

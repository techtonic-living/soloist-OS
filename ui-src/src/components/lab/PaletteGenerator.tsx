import { useState, useCallback, useEffect } from "react";
import { colord } from "colord";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Unlock, Copy, Save } from "lucide-react";

export const PaletteGenerator = ({
	onSavePalette,
}: {
	onSavePalette: (colors: string[]) => void;
}) => {
	const [colors, setColors] = useState<string[]>([
		"#3D8BFF",
		"#00C2FF",
		"#9D4EDD",
		"#FF006E",
		"#FFBE0B",
	]);
	const [locked, setLocked] = useState<boolean[]>([
		false,
		false,
		false,
		false,
		false,
	]);

	const generate = useCallback(() => {
		setColors((prev) =>
			prev.map((c, i) => {
				if (locked[i]) return c;
				return colord({
					h: Math.floor(Math.random() * 360),
					s: 50 + Math.random() * 50,
					l: 30 + Math.random() * 60,
				}).toHex();
			})
		);
	}, [locked]);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.code === "Space") {
				e.preventDefault();
				generate();
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [generate]);

	const toggleLock = (index: number) => {
		const newLocked = [...locked];
		newLocked[index] = !newLocked[index];
		setLocked(newLocked);
	};

	const updateColor = (index: number, newColor: string) => {
		const newColors = [...colors];
		newColors[index] = newColor;
		setColors(newColors);
	};

	return (
		<div className="h-full w-full flex flex-col relative group/container">
			{/* Hint Overlay */}
			<div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-xl px-4 py-2 rounded-full text-xs text-white/50 font-mono pointer-events-none opacity-0 group-hover/container:opacity-100 transition-opacity z-20">
				Press Spacebar to Generate
			</div>

			<div className="absolute bottom-4 right-4 z-20">
				<button
					onClick={() => onSavePalette(colors)}
					className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-full font-mono text-xs shadow-lg hover:scale-105 transition-transform"
				>
					<Save size={14} /> Save Palette
				</button>
			</div>

			<div className="flex-1 flex w-full">
				<AnimatePresence initial={false}>
					{colors.map((color, i) => (
						<motion.div
							key={i}
							layout
							className="flex-1 h-full relative group flex flex-col items-center justify-center border-r border-white/5 last:border-0 hover:flex-[1.2] transition-all duration-300"
							style={{ backgroundColor: color }}
						>
							<div className="bg-black/20 backdrop-blur-md p-4 rounded-xl flex flex-col items-center gap-4 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
								{/* Hex Input (Editable) */}
								<div className="relative">
									<input
										type="text"
										value={color}
										onChange={(e) =>
											updateColor(i, e.target.value)
										}
										className="bg-transparent text-white font-mono text-lg font-bold text-center w-24 focus:outline-none uppercase"
									/>
									<input
										type="color"
										value={color}
										onChange={(e) =>
											updateColor(i, e.target.value)
										}
										className="absolute inset-0 opacity-0 cursor-pointer"
									/>
								</div>

								<div className="flex gap-2">
									<button
										onClick={() => toggleLock(i)}
										className={`p-2 rounded-lg ${
											locked[i]
												? "text-red-400 bg-red-400/10"
												: "text-white/60 hover:text-white"
										}`}
									>
										{locked[i] ? (
											<Lock size={16} />
										) : (
											<Unlock size={16} />
										)}
									</button>
									<button
										onClick={() => {
											navigator.clipboard.writeText(
												color
											);
										}}
										className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg"
										title="Copy Hex"
									>
										<Copy size={16} />
									</button>
								</div>
							</div>
							{/* Always visible Label if locked */}
							{locked[i] && (
								<div className="absolute top-4 text-xs font-mono text-black/40 bg-white/20 px-2 py-1 rounded backdrop-blur-sm">
									LOCKED
								</div>
							)}
						</motion.div>
					))}
				</AnimatePresence>
			</div>
		</div>
	);
};

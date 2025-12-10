import { useState, useEffect, useCallback } from "react";
import { colord } from "colord";
import { motion, AnimatePresence } from "framer-motion";
import {
	FlaskConical,
	Sparkles,
	GitMerge,
	Copy,
	Heart,
	Type,
	BookOpen,
	Lock,
	Unlock,
	Save,
	Trash,
} from "lucide-react";

interface TheLabProps {
	settings: any;
	updateSettings: (newSettings: any) => void;
	setSeedColor: (color: string) => void;
	activeTab: "generator" | "contrast" | "mixer" | "type" | "library";
	setActiveTab: (
		tab: "generator" | "contrast" | "mixer" | "type" | "library"
	) => void;
}

export const TheLab = ({
	settings,
	updateSettings,
	setSeedColor,
	activeTab,
	setActiveTab,
}: TheLabProps) => {
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
		// Check for dupes? Simplistic for now.
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

	const toggleFavoritePairing = (pairing: string) => {
		const library = settings.library || {
			colors: [],
			fonts: [],
			palettes: [],
		};
		const exists = library.fonts.includes(pairing);
		const newFonts = exists
			? library.fonts.filter((f: string) => f !== pairing)
			: [...library.fonts, pairing];
		updateSettings({ library: { ...library, fonts: newFonts } });
	};

	// Remove Palette
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
		<div className="h-full flex flex-col gap-6">
			{/* Header / Tabs */}
			<div className="flex items-center justify-between p-1 bg-bg-surface/50 rounded-xl border border-glass-stroke backdrop-blur-md w-fit mx-auto relative z-20">
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
				<TabButton
					active={activeTab === "type"}
					onClick={() => setActiveTab("type")}
					icon={Type}
					label="Type Lab"
				/>
				<div className="w-px h-4 bg-glass-stroke mx-1" />
				<TabButton
					active={activeTab === "library"}
					onClick={() => setActiveTab("library")}
					icon={BookOpen}
					label="Library"
				/>
			</div>

			<div className="flex-1 bg-bg-surface/30 rounded-2xl border border-glass-stroke p-0 relative overflow-hidden backdrop-blur-sm shadow-monolith">
				{/* Note: Removed padding p-8 to allow generator to fill space, sub-components add their own padding if needed */}
				<AnimatePresence mode="wait">
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
					{activeTab === "type" && (
						<div className="p-8 h-full">
							<TypeSandbox
								key="type"
								onFavorite={toggleFavoritePairing}
								favorites={settings.library?.fonts || []}
							/>
						</div>
					)}
					{activeTab === "library" && (
						<div className="p-8 h-full">
							<Library
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
								onRemoveFont={toggleFavoritePairing}
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

// --- Palette Generator (Coolors Style) ---

const PaletteGenerator = ({
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
				// Generate random aesthetically pleasing color
				// const hue = Math.floor(Math.random() * 360);
				// const sat = 60 + Math.floor(Math.random() * 40); // 60-100
				// const b = 40 + Math.floor(Math.random() * 50); // 40-90
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

// --- Other Components (Updated with Props) ---

const ContrastLab = () => {
	const [fg, setFg] = useState("#FFFFFF");
	const [bg, setBg] = useState("#3D8BFF");

	const contrast = colord(bg).contrast(fg);
	const score =
		contrast >= 7
			? "AAA"
			: contrast >= 4.5
			? "AA"
			: contrast >= 3
			? "AA Large"
			: "Fail";
	const isPass = contrast >= 4.5;

	return (
		<div className="h-full flex flex-row gap-8">
			{/* Controls */}
			<div className="w-1/3 flex flex-col gap-6 p-6 bg-black/20 rounded-xl border border-glass-stroke">
				<h3 className="text-white font-brand text-lg mb-2">
					Parameters
				</h3>
				<ColorControl label="TEXT COLOR" color={fg} onChange={setFg} />
				<ColorControl label="BACKGROUND" color={bg} onChange={setBg} />

				<div className="mt-auto pt-6 border-t border-glass-stroke">
					<div className="flex justify-between items-end">
						<span className="text-gray-400 text-sm">Ratio</span>
						<span className="text-4xl font-mono text-white font-bold">
							{contrast.toFixed(2)}
						</span>
					</div>
					<div
						className={`mt-2 flex items-center justify-center py-2 rounded-lg font-bold text-sm ${
							isPass
								? "bg-accent-success/20 text-accent-success"
								: "bg-red-500/20 text-red-500"
						}`}
					>
						{score}
					</div>
				</div>
			</div>

			{/* Preview */}
			<div
				className="flex-1 rounded-2xl flex flex-col items-center justify-center p-12 transition-colors duration-200 shadow-inner"
				style={{ backgroundColor: bg }}
			>
				<div className="space-y-8 text-center" style={{ color: fg }}>
					<h1 className="text-6xl font-brand">Heading</h1>
					<p className="text-lg max-w-md leading-relaxed">
						The quick brown fox jumps over the lazy dog.
					</p>
					<div className="flex gap-4 justify-center">
						<span className="font-bold">Bold</span>
						<span className="opacity-60">Regular</span>
						<span className="font-light">Light</span>
					</div>
				</div>
			</div>
		</div>
	);
};

const ColorMixer = ({ onFavorite, favorites }: any) => {
	const [colorA, setColorA] = useState("#3D8BFF");
	const [colorB, setColorB] = useState("#FFFFFF");
	const [steps, setSteps] = useState(5);

	const mix = [];
	for (let i = 0; i <= steps; i++) {
		const ratio = i / steps;
		mix.push(colord(colorA).mix(colorB, ratio).toHex());
	}

	return (
		<div className="h-full flex flex-col items-center justify-center gap-12">
			<div className="flex items-center gap-8 w-full max-w-2xl px-8">
				<ColorInput color={colorA} onChange={setColorA} label="Start" />
				<div className="flex-1 flex flex-col items-center gap-2">
					<span className="text-xs text-gray-500 font-mono">
						STEPS: {steps}
					</span>
					<input
						type="range"
						min="3"
						max="20"
						value={steps}
						onChange={(e) => setSteps(Number(e.target.value))}
						className="w-full accent-accent-cyan"
					/>
				</div>
				<ColorInput color={colorB} onChange={setColorB} label="End" />
			</div>

			<div className="w-full h-32 flex rounded-2xl overflow-hidden shadow-2xl border border-white/10">
				{mix.map((hex, i) => (
					<div key={i} className="flex-1 h-full relative group">
						<div
							className="w-full h-full"
							style={{ backgroundColor: hex }}
						/>
						<div className="absolute bottom-2 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
							<button
								onClick={() => onFavorite(hex)}
								className="p-1.5 rounded-full bg-black/30 hover:bg-black/50 text-white backdrop-blur-md"
							>
								<Heart
									size={12}
									className={
										favorites.includes(hex)
											? "fill-current text-red-500"
											: ""
									}
								/>
							</button>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

const TypeSandbox = ({ onFavorite, favorites }: any) => {
	const [headerFont, setHeaderFont] = useState("Playfair Display");
	const [bodyFont, setBodyFont] = useState("Inter");
	const pairingKey = `${headerFont}:${bodyFont}`;
	const isFavorite = favorites.includes(pairingKey);

	const FONTS = [
		"Inter",
		"Roboto",
		"Outfit",
		"Space Grotesk",
		"Playfair Display",
		"Lora",
		"Merriweather",
	];

	const randomize = () => {
		setHeaderFont(FONTS[Math.floor(Math.random() * FONTS.length)]);
		setBodyFont(FONTS[Math.floor(Math.random() * FONTS.length)]);
	};

	return (
		<div className="h-full flex flex-row gap-8">
			<div className="w-1/3 flex flex-col gap-6 p-6 bg-black/20 rounded-xl border border-glass-stroke">
				<h3 className="text-white font-brand text-lg mb-2">Controls</h3>
				<div className="space-y-4">
					<div>
						<label className="text-xs text-gray-500 font-mono block mb-2">
							HEADER FONT
						</label>
						<select
							value={headerFont}
							onChange={(e) => setHeaderFont(e.target.value)}
							className="w-full bg-bg-void border border-glass-stroke rounded-lg p-2 text-white font-mono text-xs"
						>
							{FONTS.map((f) => (
								<option key={f} value={f}>
									{f}
								</option>
							))}
						</select>
					</div>
					<div>
						<label className="text-xs text-gray-500 font-mono block mb-2">
							BODY FONT
						</label>
						<select
							value={bodyFont}
							onChange={(e) => setBodyFont(e.target.value)}
							className="w-full bg-bg-void border border-glass-stroke rounded-lg p-2 text-white font-mono text-xs"
						>
							{FONTS.map((f) => (
								<option key={f} value={f}>
									{f}
								</option>
							))}
						</select>
					</div>
				</div>

				<div className="flex gap-4 mt-auto">
					<button
						onClick={randomize}
						className="flex-1 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white font-mono text-xs transition-colors"
					>
						Randomize
					</button>
					<button
						onClick={() => onFavorite(pairingKey)}
						className={`p-2 rounded-lg border transition-all ${
							isFavorite
								? "bg-red-500 text-white border-red-500"
								: "bg-transparent text-gray-400 border-glass-stroke hover:text-white"
						}`}
					>
						<Heart
							size={16}
							className={isFavorite ? "fill-current" : ""}
						/>
					</button>
				</div>
			</div>

			<div className="flex-1 bg-white p-12 rounded-2xl flex flex-col justify-center gap-6 shadow-monolith text-black">
				<h1
					className="text-5xl leading-tight"
					style={{ fontFamily: headerFont }}
				>
					The quick brown fox jumps over the lazy dog.
				</h1>
				<div className="space-y-4" style={{ fontFamily: bodyFont }}>
					<p className="text-lg leading-relaxed opacity-80 max-w-xl">
						Good typography is invisible. It allows the reader to
						focus on the content, not the formatting.
					</p>
					<p className="text-sm opacity-60 max-w-lg">
						Use modular scales to ensure harmony between your
						headings and body text. A well-chosen pair can define
						your entire brand aesthetic.
					</p>
				</div>
			</div>
		</div>
	);
};

const Library = ({
	library,
	onLoadColor,
	onRemoveColor,
	onRemovePalette,
	onRemoveFont,
}: any) => {
	return (
		<div className="h-full overflow-y-auto pr-2 pb-20">
			<div className="space-y-12">
				{/* Palettes */}
				<div className="space-y-4">
					<h3 className="text-sm font-mono text-gray-400 uppercase tracking-widest border-b border-glass-stroke pb-2">
						Saved Palettes
					</h3>
					{library.palettes.length === 0 ? (
						<p className="text-gray-600 text-xs italic">
							No saved palettes.
						</p>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							{library.palettes.map((p: any, i: number) => (
								<div
									key={i}
									className="bg-bg-raised border border-glass-stroke p-4 rounded-xl space-y-3 group"
								>
									<div className="flex items-center justify-between">
										<span className="text-xs font-mono text-white">
											{p.name}
										</span>
										<button
											onClick={() => onRemovePalette(i)}
											className="text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
										>
											<Trash size={12} />
										</button>
									</div>
									<div className="h-12 flex rounded-lg overflow-hidden w-full">
										{p.colors.map(
											(c: string, ci: number) => (
												<div
													key={ci}
													className="flex-1 h-full"
													style={{
														backgroundColor: c,
													}}
												/>
											)
										)}
									</div>
									<div className="flex justify-end">
										<button
											onClick={() =>
												onLoadColor(p.colors[0])
											} // Just load first color for now as seed?
											className="text-[10px] text-accent-cyan hover:underline"
										>
											Use Base
										</button>
									</div>
								</div>
							))}
						</div>
					)}
				</div>

				{/* Font Pairings */}
				<div className="space-y-4">
					<h3 className="text-sm font-mono text-gray-400 uppercase tracking-widest border-b border-glass-stroke pb-2">
						Saved Type Pairings
					</h3>
					{library.fonts.length === 0 ? (
						<p className="text-gray-600 text-xs italic">
							No saved pairings.
						</p>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							{library.fonts.map((f: string) => {
								const [header, body] = f.split(":");
								return (
									<div
										key={f}
										className="bg-white p-4 rounded-xl text-black relative group border border-transparent hover:border-accent-cyan/50 transition-all"
									>
										<button
											onClick={() => onRemoveFont(f)}
											className="absolute top-2 right-2 text-gray-300 hover:text-red-500"
										>
											<Trash size={12} />
										</button>
										<h4
											className="text-xl mb-1 truncate"
											style={{ fontFamily: header }}
										>
											{header}
										</h4>
										<p
											className="text-sm opacity-60 truncate"
											style={{ fontFamily: body }}
										>
											{body}
										</p>
									</div>
								);
							})}
						</div>
					)}
				</div>

				{/* Saved Colors */}
				<div className="space-y-4">
					<h3 className="text-sm font-mono text-gray-400 uppercase tracking-widest border-b border-glass-stroke pb-2">
						Saved Colors
					</h3>
					{library.colors.length === 0 ? (
						<p className="text-gray-600 italic text-sm">
							No saved colors yet.
						</p>
					) : (
						<div className="grid grid-cols-6 gap-4">
							{library.colors.map((color: string) => (
								<div
									key={color}
									className="group relative aspect-square rounded-xl overflow-hidden border border-white/10 shadow-lg"
								>
									<div
										className="w-full h-full cursor-pointer"
										style={{ backgroundColor: color }}
										onClick={() => onLoadColor(color)}
										title="Click to load as seed"
									/>
									<button
										onClick={() => onRemoveColor(color)}
										className="absolute top-1 right-1 p-1 rounded-full bg-black/20 hover:bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-all"
									>
										<Heart
											size={12}
											className="fill-current text-white"
										/>
									</button>
									<div className="absolute bottom-0 inset-x-0 bg-black/40 backdrop-blur-sm p-1 text-center">
										<span className="text-[8px] font-mono text-white">
											{color}
										</span>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

// Utilities
const ColorControl = ({ label, color, onChange }: any) => (
	<div className="space-y-2">
		<label className="text-xs text-gray-400 font-mono">{label}</label>
		<div className="flex items-center gap-3">
			<input
				type="color"
				value={color}
				onChange={(e) => onChange(e.target.value)}
				className="w-10 h-10 rounded-lg border border-glass-stroke bg-transparent cursor-pointer"
			/>
			<input
				type="text"
				value={color}
				onChange={(e) => onChange(e.target.value)}
				className="flex-1 bg-transparent border-b border-glass-stroke text-white font-mono text-sm focus:outline-none focus:border-accent-cyan"
			/>
		</div>
	</div>
);

const ColorInput = ({ color, onChange, label }: any) => (
	<div className="flex flex-col items-center gap-2">
		<label className="text-[10px] font-mono text-gray-500 uppercase">
			{label}
		</label>
		<div
			className="w-16 h-16 rounded-2xl shadow-lg border-2 border-white/10 relative overflow-hidden"
			style={{ backgroundColor: color }}
		>
			<input
				type="color"
				value={color}
				onChange={(e) => onChange(e.target.value)}
				className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
			/>
		</div>
	</div>
);

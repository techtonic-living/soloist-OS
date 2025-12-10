import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	ArrowRight,
	Type,
	MoveVertical,
	RefreshCw,
	BookOpen,
	Layers,
} from "lucide-react";
import { TypeSandbox } from "./lab/TypeSandbox";
import { TypeLibrary } from "./lab/TypeLibrary";

export const TYPE_SCALES = [
	{ name: "Minor Second", ratio: 1.067 },
	{ name: "Major Second", ratio: 1.125 },
	{ name: "Minor Third", ratio: 1.2 },
	{ name: "Major Third", ratio: 1.25 },
	{ name: "Perfect Fourth", ratio: 1.333 },
	{ name: "Augmented Fourth", ratio: 1.414 },
	{ name: "Perfect Fifth", ratio: 1.5 },
	{ name: "Golden Ratio", ratio: 1.618 },
];

interface TypographyAtelierProps {
	baseSize: number;
	setBaseSize: (size: number) => void;
	scale: { name: string; ratio: number };
	setScale: (scale: { name: string; ratio: number }) => void;
	onComplete: () => void;
	settings: any;
	updateSettings: (newSettings: any) => void;
	activeTab: "scale" | "pairing" | "library";
	setActiveTab: (tab: "scale" | "pairing" | "library") => void;
}

export const TypographyAtelier = ({
	baseSize,
	setBaseSize,
	scale,
	setScale,
	onComplete,
	settings,
	updateSettings,
	activeTab,
	setActiveTab,
}: TypographyAtelierProps) => {
	// Local Font Selection State (Simulated for now, could be real Google Fonts later)
	const [fontFamily, setFontFamily] = useState("Inter");
	const FONT_OPTIONS = [
		"Inter",
		"Roboto",
		"Outfit",
		"Space Grotesk",
		"Playfair Display",
	];

	// Generate a preview line height based on scale
	const previewSize = baseSize * Math.pow(scale.ratio, 3); // Heading L approx

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

	return (
		<div className="h-full flex flex-col gap-6 relative overflow-hidden">
			{/* Background Ambience */}
			{activeTab === "scale" && (
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.03),transparent_70%)] pointer-events-none" />
			)}

			{/* Header / Tabs */}
			<div className="flex items-center justify-between p-1 bg-bg-surface/50 rounded-xl border border-glass-stroke backdrop-blur-md w-fit mx-auto relative z-20 mt-4">
				<TabButton
					active={activeTab === "scale"}
					onClick={() => setActiveTab("scale")}
					icon={Layers}
					label="Scale & Hierarchy"
				/>
				<TabButton
					active={activeTab === "pairing"}
					onClick={() => setActiveTab("pairing")}
					icon={Type}
					label="Pairing Sandbox"
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
					{activeTab === "scale" && (
						<div
							key="scale"
							className="h-full flex flex-col items-center justify-center relative"
						>
							{/* Original Scale Content */}
							<div className="z-10 flex flex-col items-center gap-12 w-full max-w-4xl px-8">
								<div className="text-center space-y-2">
									<h2 className="text-3xl font-brand text-white tracking-tight">
										Type Lab
									</h2>
									<p className="text-gray-400 font-mono text-sm">
										Sculpt your typographic hierarchy.
									</p>
								</div>

								{/* Main Preview */}
								<div className="w-full h-64 flex items-center justify-center border-y border-white/5 bg-white/2 relative group">
									<div className="absolute top-4 left-4 text-xs font-mono text-gray-600">
										PREVIEW
									</div>
									<motion.h1
										layout
										className="text-center text-white font-brand leading-tight"
										style={{
											fontSize: `${previewSize}px`,
											fontFamily: fontFamily,
										}}
									>
										The quick brown fox
										<br />
										<span className="opacity-50">
											jumps over the lazy dog.
										</span>
									</motion.h1>
								</div>

								{/* Controls */}
								<div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
									{/* Font Family */}
									<div className="space-y-4">
										<label className="text-xs font-mono text-gray-500 uppercase tracking-widest flex items-center gap-2">
											<Type size={12} /> Font Family
										</label>
										<div className="flex flex-col gap-2">
											{FONT_OPTIONS.map((font) => (
												<button
													key={font}
													onClick={() =>
														setFontFamily(font)
													}
													className={`text-left px-4 py-3 rounded-lg text-sm transition-all border ${
														fontFamily === font
															? "bg-white text-black border-white"
															: "bg-transparent text-gray-400 border-white/10 hover:border-white/30"
													}`}
													style={{ fontFamily: font }}
												>
													{font}
												</button>
											))}
										</div>
									</div>

									{/* Base Size */}
									<div className="space-y-4">
										<label className="text-xs font-mono text-gray-500 uppercase tracking-widest flex items-center gap-2">
											<MoveVertical size={12} /> Base Size
											(px)
										</label>
										<div className="h-full flex flex-col justify-center">
											<input
												type="range"
												min="12"
												max="24"
												step="1"
												value={baseSize}
												onChange={(e) =>
													setBaseSize(
														Number(e.target.value)
													)
												}
												className="w-full accent-white mb-4 cursor-pointer"
											/>
											<div className="text-center font-mono text-4xl text-white">
												{baseSize}px
											</div>
										</div>
									</div>

									{/* Scale Ratio */}
									<div className="space-y-4">
										<label className="text-xs font-mono text-gray-500 uppercase tracking-widest flex items-center gap-2">
											<RefreshCw size={12} /> Scale Ratio
										</label>
										<div className="grid grid-cols-2 gap-2">
											{TYPE_SCALES.map((s) => (
												<button
													key={s.name}
													onClick={() => setScale(s)}
													className={`p-2 rounded text-xs font-mono transition-colors text-center ${
														scale.name === s.name
															? "bg-accent-cyan text-black"
															: "bg-white/5 text-gray-500 hover:bg-white/10"
													}`}
												>
													{s.ratio}
													<span className="block text-[8px] opacity-60">
														{s.name}
													</span>
												</button>
											))}
										</div>
									</div>
								</div>

								{/* Action */}
								<button
									onClick={onComplete}
									className="group flex items-center gap-3 px-8 py-3 bg-white text-black rounded-full font-mono text-sm hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]"
								>
									<span>CRYSTALLIZE TYPE SYSTEM</span>
									<ArrowRight
										size={16}
										className="group-hover:translate-x-1 transition-transform"
									/>
								</button>
							</div>
						</div>
					)}

					{activeTab === "pairing" && (
						<div className="p-8 h-full">
							<TypeSandbox
								key="pairing"
								onFavorite={toggleFavoritePairing}
								favorites={settings.library?.fonts || []}
							/>
						</div>
					)}

					{activeTab === "library" && (
						<div className="p-8 h-full">
							<TypeLibrary
								key="library"
								library={
									settings.library || {
										colors: [],
										fonts: [],
										palettes: [],
									}
								}
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

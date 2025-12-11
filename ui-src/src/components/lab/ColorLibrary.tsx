import { useState } from "react";
import { Trash, Heart, Book, Copy, Check } from "lucide-react";
import { PRESET_LIBRARIES, PresetColor } from "../../data/colorPresets";
import { colord } from "colord";

// --- Helper Functions ---
const fallbackCopy = (text: string) => {
	const textArea = document.createElement("textarea");
	textArea.value = text;
	textArea.style.position = "fixed";
	textArea.style.left = "-9999px";
	textArea.style.top = "0";
	document.body.appendChild(textArea);
	textArea.focus();
	textArea.select();
	try {
		document.execCommand("copy");
	} catch (err) {
		console.error("Fallback copy failed", err);
	}
	document.body.removeChild(textArea);
};

const performCopy = (text: string) => {
	if (navigator.clipboard && navigator.clipboard.writeText) {
		navigator.clipboard.writeText(text).catch(() => {
			fallbackCopy(text);
		});
	} else {
		fallbackCopy(text);
	}
};

export const ColorLibrary = ({
	library,
	onLoadColor,
	onRemoveColor,
	onRemovePalette,
	onInspectColor,
	view = "all",
}: {
	library: any;
	onLoadColor: (c: string) => void;
	onRemoveColor: (c: string, metadata?: PresetColor) => void;
	onRemovePalette: (i: number) => void;
	onInspectColor?: (c: PresetColor) => void;
	view?: "all" | "colors" | "palettes";
}) => {
	const [activeSubTab, setActiveSubTab] = useState<"favorites" | "presets">(
		"favorites"
	);

	// Toggling favorite checks if it exists in the library prop
	const isFavorite = (color: string) => {
		// Case insensitive check
		if (!library || !library.colors) return false;
		return library.colors.some((c: string | PresetColor) => {
			const hexValue = typeof c === "string" ? c : c.value;
			return hexValue.toUpperCase() === color.toUpperCase();
		});
	};

	return (
		<div className="h-full flex flex-col overflow-hidden">
			{/* Sub-Navigation for Colors View */}
			{view === "colors" && (
				<div className="flex gap-4 mb-6 border-b border-glass-stroke px-2">
					<button
						onClick={() => setActiveSubTab("favorites")}
						className={`pb-2 text-xs font-mono uppercase tracking-wider transition-colors border-b-2 ${
							activeSubTab === "favorites"
								? "border-accent-cyan text-white"
								: "border-transparent text-gray-500 hover:text-gray-300"
						}`}
					>
						Favorites
					</button>
					<button
						onClick={() => setActiveSubTab("presets")}
						className={`pb-2 text-xs font-mono uppercase tracking-wider transition-colors border-b-2 ${
							activeSubTab === "presets"
								? "border-accent-cyan text-white"
								: "border-transparent text-gray-500 hover:text-gray-300"
						}`}
					>
						Libraries
					</button>
				</div>
			)}

			<div className="flex-1 overflow-y-auto pr-2 pb-20 custom-scrollbar">
				<div className="space-y-12">
					{/* Palettes */}
					{(view === "all" || view === "palettes") && (
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
									{library.palettes.map(
										(p: any, i: number) => (
											<div
												key={i}
												className="bg-bg-raised border border-glass-stroke p-4 rounded-xl space-y-3 group"
											>
												<div className="flex items-center justify-between">
													<span className="text-xs font-mono text-white">
														{p.name}
													</span>
													<button
														onClick={() =>
															onRemovePalette(i)
														}
														className="text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
													>
														<Trash size={12} />
													</button>
												</div>
												<div className="h-12 flex rounded-lg overflow-hidden w-full">
													{p.colors.map(
														(
															c: string,
															ci: number
														) => (
															<div
																key={ci}
																className="flex-1 h-full"
																style={{
																	backgroundColor:
																		c,
																}}
															/>
														)
													)}
												</div>
												<div className="flex justify-end">
													<button
														onClick={() =>
															onLoadColor(
																p.colors[0]
															)
														}
														className="text-[10px] text-accent-cyan hover:underline"
													>
														Use Base
													</button>
												</div>
											</div>
										)
									)}
								</div>
							)}
						</div>
					)}

					{/* Colors: Favorites View */}
					{(view === "all" ||
						(view === "colors" &&
							activeSubTab === "favorites")) && (
						<div className="space-y-4">
							<h3 className="text-sm font-mono text-gray-400 uppercase tracking-widest border-b border-glass-stroke pb-2">
								Saved Colors
							</h3>
							{library.colors.length === 0 ? (
								<p className="text-gray-600 italic text-sm">
									No saved colors yet.
								</p>
							) : (
								<div className="grid grid-cols-2 gap-3">
									{library.colors.map(
										(colorItem: string | PresetColor) => {
											// Handle both legacy strings and new PresetColor objects
											const hexValue =
												typeof colorItem === "string"
													? colorItem
													: colorItem.value;
											const displayLabel =
												typeof colorItem === "string"
													? colorItem.toUpperCase()
													: colorItem.name;
											const colorObject: PresetColor =
												typeof colorItem === "string"
													? {
															name: hexValue.toUpperCase(),
															value: hexValue,
													  }
													: colorItem;

											return (
												<SmartColorCard
													key={hexValue}
													color={hexValue}
													label={displayLabel}
													isFavorite={true}
													onClick={() => {
														onLoadColor(hexValue);
														// Pass full color object for inspection
														if (onInspectColor) {
															onInspectColor(
																colorObject
															);
														}
													}}
													onToggleFavorite={() =>
														onRemoveColor(hexValue)
													}
												/>
											);
										}
									)}
								</div>
							)}
						</div>
					)}

					{/* Colors: Presets View */}
					{view === "colors" && activeSubTab === "presets" && (
						<div className="space-y-8">
							{!PRESET_LIBRARIES ||
							PRESET_LIBRARIES.length === 0 ? (
								<p className="text-gray-500 italic">
									No preset libraries found.
								</p>
							) : (
								PRESET_LIBRARIES.map((preset) => (
									<div
										key={preset.name}
										className="space-y-4"
									>
										<div className="space-y-1">
											<div className="flex items-center gap-2 border-b border-glass-stroke pb-2">
												<Book
													size={14}
													className="text-accent-cyan"
												/>
												<h3 className="text-sm font-brand text-white">
													{preset.name}
												</h3>
												<span className="text-xs text-gray-500 ml-auto">
													{preset.colors.length}{" "}
													colors
												</span>
											</div>
											<p className="text-xs text-gray-500 italic pb-2">
												{preset.description}
											</p>
										</div>
										<div className="grid grid-cols-2 gap-3">
											{preset.colors.map((c) => (
												<SmartColorCard
													key={c.value}
													color={c.value}
													label={c.name}
													isFavorite={isFavorite(
														c.value
													)}
													onClick={() => {
														onLoadColor(c.value);
														if (onInspectColor)
															onInspectColor(c);
													}}
													onToggleFavorite={() =>
														onRemoveColor(
															c.value,
															c
														)
													}
												/>
											))}
										</div>
									</div>
								))
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

// --- Subcomponents ---

const SmartColorCard = ({
	color,
	label,
	name,
	isFavorite,
	onClick,
	onToggleFavorite,
}: {
	color: string;
	label: string;
	name?: string;
	isFavorite: boolean;
	onClick: () => void;
	onToggleFavorite: () => void;
}) => {
	const [copied, setCopied] = useState(false);
	const isDark = colord(color).isDark();

	const handleCopy = (e: React.MouseEvent) => {
		e.stopPropagation();
		performCopy(color.toUpperCase());
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<div
			className={`relative rounded-xl overflow-hidden aspect-[4/3] shadow-sm transition-all hover:shadow-lg group/minicard ${
				isDark ? "border border-white/40" : "border border-black/20"
			}`}
		>
			{/* Interactive Color Body */}
			<div
				className="absolute inset-0 cursor-pointer"
				onClick={onClick}
				title={`Click to load ${name}`}
			>
				<div
					className="absolute inset-0 z-0"
					style={{ backgroundColor: color }}
				/>

				{/* Actions Row (Top Right) - No Swap Button */}
				<div
					className={`absolute top-1 right-1 flex items-center gap-0.5 z-10 ${
						isDark ? "text-white" : "text-black/60"
					}`}
				>
					<button
						onClick={handleCopy}
						className="p-1.5 rounded-full hover:bg-black/10 transition-colors"
						title="Copy Hex"
					>
						{copied ? (
							<Check size={14} className="text-green-500" />
						) : (
							<Copy size={14} />
						)}
					</button>
					<button
						onClick={(e) => {
							e.stopPropagation();
							onToggleFavorite();
						}}
						className="p-1.5 rounded-full hover:bg-black/10 transition-colors"
						title={
							isFavorite
								? "Remove from Favorites"
								: "Save to Favorites"
						}
					>
						<Heart
							size={14}
							className={
								isFavorite ? "fill-red-500 scale-110" : ""
							}
						/>
					</button>
				</div>
			</div>

			{/* Static Label (Always Visible) */}
			<div
				className={`absolute inset-0 p-2 flex flex-col justify-end pointer-events-none ${
					isDark ? "text-white/90" : "text-black/80"
				}`}
			>
				<span className="text-[10px] font-bold uppercase opacity-60 tracking-wider mb-0.5">
					{label}
				</span>
				{name && (
					<span className="text-[10px] font-mono opacity-90 truncate font-medium">
						{name}
					</span>
				)}
				<span className="text-[9px] font-mono opacity-75">
					{color.toUpperCase()}
				</span>
			</div>
		</div>
	);
};

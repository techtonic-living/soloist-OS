import { useState, useEffect } from "react";
import { colord } from "colord";
import { Copy, Check, Heart, ArrowUpDown, X } from "lucide-react";

interface ColorControlPanelProps {
	seedColor: string;
	setSeedColor: (color: string) => void;
	secondaryColor: string;
	tertiaryColor: string;
	harmonyMode?: string;
	settings?: any; // Todo: Import proper type
	updateSettings?: (settings: any) => void;
	toggleFavorite?: (color: string) => Promise<void>;
}

// --- Shared Helpers ---

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
	// Try modern API first
	if (navigator.clipboard && navigator.clipboard.writeText) {
		navigator.clipboard.writeText(text).catch(() => {
			fallbackCopy(text);
		});
	} else {
		fallbackCopy(text);
	}
};

export const ColorControlPanel = ({
	seedColor,
	setSeedColor,
	secondaryColor,
	tertiaryColor,
	harmonyMode,
	settings = { library: { colors: [], palettes: [] } },
	updateSettings = () => {},
	toggleFavorite: toggleFavoriteProp,
}: ColorControlPanelProps) => {
	const [copiedHex, setCopiedHex] = useState(false);
	const [copiedRgb, setCopiedRgb] = useState(false);
	const [copiedHsl, setCopiedHsl] = useState(false);
	const [copiedHsb, setCopiedHsb] = useState(false);
	const [activeEditorId, setActiveEditorId] = useState<string | null>(null);

	// Toast State
	const [toast, setToast] = useState<{
		message: string;
		visible: boolean;
	} | null>(null);

	// Parse Colors
	const color = colord(seedColor);
	const isDark = color.isDark();
	const rgba = color.toRgb();
	const hsla = color.toHsl();
	const hsva = color.toHsv(); // HSB is essentially HSV

	// Helpers
	const copyToClipboard = (text: string, setCopied: (v: boolean) => void) => {
		showToast("Copied to clipboard");
		performCopy(text);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	const showToast = (message: string) => {
		setToast({ message, visible: true });
		setTimeout(() => setToast(null), 3000);
	};

	const toggleFavorite = async (colorHex: string) => {
		// Use the prop function if provided (with AI metadata), fallback to simple toggle
		if (toggleFavoriteProp) {
			await toggleFavoriteProp(colorHex);
			return;
		}

		// Fallback for when prop not provided
		const currentLib = settings.library || { colors: [], palettes: [] };
		const isFav = currentLib.colors.some((c: any) =>
			typeof c === "string" ? c === colorHex : c.value === colorHex
		);

		if (isFav) {
			// Remove
			updateSettings({
				library: {
					...currentLib,
					colors: currentLib.colors.filter((c: any) =>
						typeof c === "string"
							? c !== colorHex
							: c.value !== colorHex
					),
				},
			});
			showToast("Removed from Favorites");
		} else {
			// Add as simple string (no metadata generation in fallback)
			updateSettings({
				library: {
					...currentLib,
					colors: [...currentLib.colors, colorHex],
				},
			});
			showToast("Saved to Favorites");
		}
	};

	const handleManualInput = (val: string, type: string) => {
		let newColor;
		if (type === "rgb") {
			newColor = colord(`rgb(${val})`);
		} else if (type === "hsl") {
			newColor = colord(`hsl(${val})`);
		} else if (type === "hsb") {
			// Colord reads hsv as hsb
			const parts = val
				.split(",")
				.map((p) => parseFloat(p.trim().replace("%", "")));
			newColor = colord({ h: parts[0], s: parts[1], v: parts[2] });
		} else {
			newColor = colord(val);
		}

		if (newColor.isValid()) {
			setSeedColor(newColor.toHex());
		}
	};

	// Check if current palette exists
	const currentColors = [
		seedColor.toUpperCase(),
		secondaryColor.toUpperCase(),
		tertiaryColor.toUpperCase(),
	];
	const isPaletteFavorite = settings.library?.palettes.some(
		(p: any) =>
			p.colors.length === 3 &&
			p.colors[0].toUpperCase() === currentColors[0] &&
			p.colors[1].toUpperCase() === currentColors[1] &&
			p.colors[2].toUpperCase() === currentColors[2]
	);

	const savePalette = () => {
		const currentLib = settings.library || { colors: [], palettes: [] };

		if (isPaletteFavorite) {
			// Remove
			updateSettings({
				library: {
					...currentLib,
					palettes: currentLib.palettes.filter(
						(p: any) =>
							!(
								p.colors.length === 3 &&
								p.colors[0].toUpperCase() ===
									currentColors[0] &&
								p.colors[1].toUpperCase() ===
									currentColors[1] &&
								p.colors[2].toUpperCase() === currentColors[2]
							)
					),
				},
			});
			showToast("Removed from Favorites");
		} else {
			// Add
			const palette = {
				name: `Palette ${currentLib.palettes.length + 1}`,
				colors: currentColors,
				createdAt: new Date().toISOString(),
			};
			updateSettings({
				library: {
					...currentLib,
					palettes: [...currentLib.palettes, palette],
				},
			});
			showToast("Saved to Favorites");
		}
	};

	// Helper to check if a color is in favorites (handles both strings and objects)
	const checkIsFavorite = (colorHex: string) => {
		return settings.library?.colors.some((c: any) => {
			const storedHex = typeof c === "string" ? c : c.value;
			return storedHex.toUpperCase() === colorHex.toUpperCase();
		});
	};

	const isPrimaryFavorite = checkIsFavorite(seedColor);
	const isSecondaryFavorite = checkIsFavorite(secondaryColor);
	const isTertiaryFavorite = checkIsFavorite(tertiaryColor);

	return (
		<div className="flex flex-col gap-4 relative">
			{/* Centralized Interaction Locks */}
			{activeEditorId !== null && (
				<>
					{/* Global Lock (Main App) */}
					<div className="fixed inset-0 z-[50] bg-black/20 cursor-default" />
					{/* Local Lock (Panel Content) */}
					<div className="absolute inset-0 z-[90] bg-transparent cursor-default" />
				</>
			)}

			{/* Toast */}
			{toast?.visible && (
				<div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[1000] px-3 py-1.5 bg-black/80 backdrop-blur-md text-white/90 text-[10px] font-bold tracking-wider uppercase rounded-full border border-white/10 animate-in fade-in slide-in-from-bottom-2">
					{toast.message}
				</div>
			)}

			{/* PRIMARY COLOR CONTROLS */}
			<div className="relative">
				{/* PRIMARY SWATCH CONTAINER */}
				<div
					className={`relative group w-full aspect-[4/3] rounded-2xl shadow-2xl overflow-hidden transition-transform active:scale-[0.98] ${
						isDark
							? "border border-white/40"
							: "border border-black/20"
					} ${activeEditorId ? "z-[100]" : ""}`}
				>
					{/* Background */}
					<div
						className="absolute inset-0 z-0 bg-transparent"
						style={{ backgroundColor: seedColor }}
					/>

					{/* Overlay Content */}
					<div
						className={`absolute inset-0 z-10 p-4 flex flex-col justify-between pointer-events-none ${
							isDark ? "text-white" : "text-black/80"
						}`}
					>
						<div
							className={`flex justify-between items-start transition-opacity duration-300 ${
								activeEditorId
									? "pointer-events-none opacity-20"
									: "pointer-events-auto"
							}`}
						>
							<span className="text-[10px] font-bold tracking-widest uppercase opacity-60">
								Primary
							</span>
							<div className="flex items-center gap-1 -mr-2 -mt-2">
								<button
									onClick={(e) => {
										e.stopPropagation();
										copyToClipboard(
											seedColor.toUpperCase(),
											setCopiedHex
										);
									}}
									className="p-2 hover:bg-black/10 rounded-full transition-colors group/copy"
									title="Copy Hex"
								>
									{copiedHex ? (
										<Check
											size={16}
											className="text-green-500"
										/>
									) : (
										<Copy size={16} />
									)}
								</button>
								<button
									onClick={(e) => {
										e.stopPropagation();
										toggleFavorite(seedColor.toUpperCase());
									}}
									className="p-2 hover:bg-black/10 rounded-full transition-colors group/heart"
									title={
										isPrimaryFavorite
											? "Remove from Favorites"
											: "Save to Favorites"
									}
								>
									<Heart
										size={16}
										className={`transition-all ${
											isPrimaryFavorite
												? "fill-red-500 scale-110"
												: "group-hover/heart:scale-110"
										}`}
									/>
								</button>
							</div>
						</div>

						{/* Center: Stacked Editable Inputs */}
						<div
							className={`space-y-1 w-full flex flex-col items-center relative pointer-events-auto transition-all ${
								activeEditorId ? "z-[100]" : "z-20"
							}`}
						>
							{/* HEX Input */}
							<SmartColorInput
								id="hex"
								value={seedColor.toUpperCase()}
								type="hex"
								editable={true}
								disabled={
									activeEditorId !== null &&
									activeEditorId !== "hex"
								}
								onEditStart={(id) => setActiveEditorId(id)}
								onEditEnd={() => setActiveEditorId(null)}
								onCommit={(val) => {
									if (colord(val).isValid())
										setSeedColor(val);
								}}
								onCopy={() =>
									copyToClipboard(
										seedColor.toUpperCase(),
										setCopiedHex
									)
								}
								isCopied={copiedHex}
								hideCopy={true}
							/>

							{/* RGB Input */}
							<SmartColorInput
								id="rgb"
								value={`${rgba.r}, ${rgba.g}, ${rgba.b}`}
								type="rgb"
								label="RGB"
								editable={true}
								disabled={
									activeEditorId !== null &&
									activeEditorId !== "rgb"
								}
								onEditStart={(id) => setActiveEditorId(id)}
								onEditEnd={() => setActiveEditorId(null)}
								onCommit={(val) =>
									handleManualInput(val, "rgb")
								}
								onCopy={() =>
									copyToClipboard(
										`rgb(${rgba.r}, ${rgba.g}, ${rgba.b})`,
										setCopiedRgb
									)
								}
								isCopied={copiedRgb}
							/>

							{/* HSL Input */}
							<SmartColorInput
								id="hsl"
								value={`${Math.round(hsla.h)}, ${Math.round(
									hsla.s
								)}%, ${Math.round(hsla.l)}%`}
								type="hsl"
								label="HSL"
								editable={true}
								disabled={
									activeEditorId !== null &&
									activeEditorId !== "hsl"
								}
								onEditStart={(id) => setActiveEditorId(id)}
								onEditEnd={() => setActiveEditorId(null)}
								onCommit={(val) =>
									handleManualInput(val, "hsl")
								}
								onCopy={() =>
									copyToClipboard(
										`hsl(${Math.round(
											hsla.h
										)}, ${Math.round(
											hsla.s
										)}%, ${Math.round(hsla.l)}%)`,
										setCopiedHsl
									)
								}
								isCopied={copiedHsl}
							/>

							{/* HSB Input (New) */}
							<SmartColorInput
								id="hsb"
								value={`${Math.round(hsva.h)}, ${Math.round(
									hsva.s
								)}%, ${Math.round(hsva.v)}%`}
								type="hsb"
								label="HSB"
								editable={true}
								disabled={
									activeEditorId !== null &&
									activeEditorId !== "hsb"
								}
								onEditStart={(id) => setActiveEditorId(id)}
								onEditEnd={() => setActiveEditorId(null)}
								onCommit={(val) =>
									handleManualInput(val, "hsb")
								}
								onCopy={() => {
									showToast("Copied to clipboard");
									navigator.clipboard.writeText(
										`hsb(${Math.round(
											hsva.h
										)}, ${Math.round(
											hsva.s
										)}%, ${Math.round(hsva.v)}%)`
									);
									setCopiedHsb(true);
									setTimeout(() => setCopiedHsb(false), 2000);
								}}
								isCopied={copiedHsb}
							/>
						</div>

						{/* Spacer to balance layout since we removed footer */}
						<div className="h-4"></div>
					</div>

					{/* Invisible Color Input Trigger */}
					<input
						type="color"
						value={seedColor}
						onChange={(e) => setSeedColor(e.target.value)}
						className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-0"
					/>
				</div>
			</div>

			{/* SECONDARY & TERTIARY CARDS */}
			{harmonyMode !== "manual" && (
				<div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-4 duration-500 delay-75">
					<MiniColorCard
						label="Secondary"
						color={secondaryColor}
						isFavorite={isSecondaryFavorite}
						onMakePrimary={() => setSeedColor(secondaryColor)}
						onToggleFavorite={() =>
							toggleFavorite(secondaryColor.toUpperCase())
						}
						onCopy={() => showToast("Copied to clipboard")}
					/>
					<MiniColorCard
						label="Tertiary"
						color={tertiaryColor}
						isFavorite={isTertiaryFavorite}
						onMakePrimary={() => setSeedColor(tertiaryColor)}
						onToggleFavorite={() =>
							toggleFavorite(tertiaryColor.toUpperCase())
						}
						onCopy={() => showToast("Copied to clipboard")}
					/>
				</div>
			)}

			{/* PALETTE ACTION */}
			{harmonyMode !== "manual" && (
				<div className="pt-2 animate-in fade-in slide-in-from-top-4 duration-500 delay-100">
					<div className="w-full relative aspect-[8/3] rounded-xl overflow-hidden border border-white/30 shadow-sm transition-all hover:shadow-lg group">
						{/* Color Bars */}
						<div className="absolute inset-0 flex">
							{[
								{ color: seedColor, label: "Primary" },
								{
									color: secondaryColor,
									label: "Secondary",
								},
								{ color: tertiaryColor, label: "Tertiary" },
							].map((item, idx) => {
								const isItemDark = colord(item.color).isDark();
								return (
									<div
										key={idx}
										className="flex-1 h-full relative"
										style={{
											backgroundColor: item.color,
										}}
									>
										<div
											className={`absolute inset-0 p-2 flex flex-col justify-end ${
												isItemDark
													? "text-white/90"
													: "text-black/80"
											}`}
										>
											<span className="text-[10px] font-bold uppercase opacity-60 tracking-wider mb-0.5">
												{item.label}
											</span>
											<span className="text-[10px] font-mono opacity-90">
												{item.color.toUpperCase()}
											</span>
										</div>
									</div>
								);
							})}
						</div>

						{/* Save Toggle */}
						<button
							onClick={(e) => {
								e.stopPropagation();
								savePalette();
							}}
							className={`absolute top-1 right-1 p-2 rounded-full hover:bg-black/10 transition-colors ${
								colord(tertiaryColor).isDark()
									? "text-white"
									: "text-black/60"
							}`}
							title={
								isPaletteFavorite
									? "Remove Palette"
									: "Save Palette"
							}
						>
							<Heart
								size={14}
								className={
									isPaletteFavorite
										? "fill-red-500"
										: "fill-transparent"
								}
							/>
						</button>
					</div>
				</div>
			)}
		</div>
	);
};

// --- Subcomponents ---

const MiniColorCard = ({
	label,
	color,
	isFavorite,
	onMakePrimary,
	onToggleFavorite,
	onCopy,
}: {
	label: string;
	color: string;
	isFavorite?: boolean;
	onMakePrimary: () => void;
	onToggleFavorite: () => void;
	onCopy?: () => void;
}) => {
	const [copied, setCopied] = useState(false);
	const isDark = colord(color).isDark();

	const handleCopy = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (onCopy) onCopy(); // Trigger toast immediately
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
			{/* Interactive Color Area */}
			<div className="absolute inset-0 cursor-pointer">
				<div
					className="absolute inset-0 z-0"
					style={{ backgroundColor: color }}
				/>

				{/* Actions Row (Top Right, Always Visible) */}
				<div
					className={`absolute top-1 right-1 flex items-center gap-0.5 z-10 ${
						isDark ? "text-white" : "text-black/60"
					}`}
				>
					<button
						onClick={onMakePrimary}
						className="p-1.5 rounded-full hover:bg-black/10 transition-colors"
						title="Swap to Primary"
					>
						<ArrowUpDown size={14} />
					</button>
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
						onClick={onToggleFavorite}
						className="p-1.5 rounded-full hover:bg-black/10 transition-colors"
						title="Toggle Favorite"
					>
						<Heart
							size={14}
							className={isFavorite ? "fill-red-500" : ""}
						/>
					</button>
				</div>
			</div>

			{/* Static Label (Always Visible, blocks hover) */}
			{/* Static Label (Always Visible) */}
			<div
				className={`absolute inset-0 p-2 flex flex-col justify-end pointer-events-none ${
					isDark ? "text-white/90" : "text-black/80"
				}`}
			>
				<span className="text-[10px] font-bold uppercase opacity-60 tracking-wider mb-0.5">
					{label}
				</span>
				<span className="text-[10px] font-mono opacity-90">
					{color.toUpperCase()}
				</span>
			</div>
		</div>
	);
};

const SmartColorInput = ({
	id,
	value,
	type,
	label,
	onCommit,
	onCopy,
	isCopied,
	editable = false,
	disabled = false,
	onEditStart,
	onEditEnd,
	hideCopy = false,
}: {
	id: string;
	value: string;
	type: "hex" | "rgb" | "hsl" | "hsb";
	label?: string;
	onCommit?: (val: string) => void;
	onCopy: () => void;
	isCopied: boolean;
	editable?: boolean;
	disabled?: boolean;
	onEditStart: (id: string) => void;
	onEditEnd: () => void;
	hideCopy?: boolean;
}) => {
	// Local state
	const [localValue, setLocalValue] = useState(value);
	const [isEditing, setIsEditing] = useState(false);

	// Slider State
	const [activeComponent, setActiveComponent] = useState<number | null>(null);
	const [initialValue, setInitialValue] = useState<string | null>(null);

	// Sync local value when prop changes (if not editing)
	useEffect(() => {
		if (!isEditing && activeComponent === null) {
			setLocalValue(value);
		}
	}, [value, isEditing, activeComponent]);

	// ---------------------------
	// Slider Logic
	// ---------------------------
	const getComponentValues = () => {
		if (type === "hex") return [];
		return localValue
			.replace(/%/g, "")
			.split(",")
			.map((p) => parseInt(p.trim()));
	};

	const componentValues = getComponentValues();

	const getSliderConfig = (index: number) => {
		if (type === "rgb") return { min: 0, max: 255 };
		if (type === "hsl" || type === "hsb")
			return { min: 0, max: index === 0 ? 360 : 100 };
		return { min: 0, max: 100 };
	};

	const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (activeComponent === null) return;
		const newVal = parseInt(e.target.value);
		const newComponents = [...componentValues];
		newComponents[activeComponent] = newVal;

		let formattedString = "";
		if (type === "rgb") {
			formattedString = newComponents.join(", ");
		} else {
			formattedString = `${newComponents[0]}, ${newComponents[1]}%, ${newComponents[2]}%`;
		}

		setLocalValue(formattedString);
		// Real-time update
		if (onCommit) onCommit(formattedString);
	};

	const startSlider = (idx: number) => {
		if (disabled) return;
		setInitialValue(value);
		setActiveComponent(idx);
		onEditStart(id);
	};

	const commitSlider = () => {
		setActiveComponent(null);
		setInitialValue(null);
		onEditEnd();
	};

	const revertSlider = () => {
		if (initialValue && onCommit) {
			onCommit(initialValue);
			setLocalValue(initialValue);
		}
		setActiveComponent(null);
		setInitialValue(null);
		onEditEnd();
	};

	// ---------------------------
	// Text Input Logic (Hex)
	// ---------------------------
	const handleSave = () => {
		if (onCommit) {
			onCommit(localValue);
		}
		setIsEditing(false);
		onEditEnd();
	};

	const handleCancel = () => {
		setLocalValue(value);
		setIsEditing(false);
		onEditEnd();
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			e.preventDefault();
			handleSave();
		} else if (e.key === "Escape") {
			e.preventDefault();
			handleCancel();
		}
	};

	// ---------------------------
	// Render
	// ---------------------------
	const renderContent = () => {
		// HEX Mode: Text Input (Keep the unified style for Hex)
		if (type === "hex") {
			if (isEditing) {
				return (
					<div className="relative z-[100] flex items-center gap-2 flex-1 min-w-0">
						<input
							autoFocus
							type="text"
							value={localValue.toUpperCase()}
							onChange={(e) => setLocalValue(e.target.value)}
							onKeyDown={handleKeyDown}
							className="flex-1 min-w-0 bg-black/40 backdrop-blur-md border border-white/20 rounded px-2 py-1 text-xs font-bold font-mono text-white text-center focus:outline-none focus:border-accent-cyan"
						/>
						<div className="flex items-center gap-1 shrink-0">
							<button
								onClick={handleCancel}
								className="p-1.5 rounded-full bg-red-500/80 hover:bg-red-500 text-white transition-colors backdrop-blur-sm"
								title="Cancel"
							>
								<X size={12} />
							</button>
							<button
								onClick={handleSave}
								className="p-1.5 rounded-full bg-green-500/80 hover:bg-green-500 text-white transition-colors backdrop-blur-sm"
								title="Save"
							>
								<Check size={12} />
							</button>
						</div>
					</div>
				);
			} else {
				return (
					<button
						onClick={() => {
							if (editable && !disabled) {
								setIsEditing(true);
								onEditStart(id);
							}
						}}
						disabled={!editable || disabled}
						className={`
                            flex-1 text-center transition-all duration-300 font-bold text-3xl font-brand
                            ${
								editable && !disabled
									? "cursor-text hover:text-white"
									: "cursor-default select-none"
							}
                            ${
								disabled
									? "opacity-30 blur-[1px]"
									: "opacity-80 text-white/90"
							}
                        `}
					>
						{value.toUpperCase()}
					</button>
				);
			}
		}

		// SLIDER Mode (Active)
		if (activeComponent !== null) {
			const config = getSliderConfig(activeComponent);
			return (
				<div className="relative z-[100] flex items-center gap-2 flex-1 min-w-0">
					<div
						className="flex items-center gap-1.5 w-[120px] bg-black/40 rounded px-2 py-0.5 animate-in fade-in zoom-in-95 duration-200 border border-accent-cyan backdrop-blur-md"
						onClick={(e) => e.stopPropagation()}
					>
						{/* Component Label */}
						<span className="text-[10px] font-mono opacity-60 w-3 text-right shrink-0">
							{activeComponent === 0
								? type === "rgb"
									? "R"
									: "H"
								: activeComponent === 1
								? type === "rgb"
									? "G"
									: "S"
								: type === "rgb"
								? "B"
								: type === "hsl"
								? "L"
								: "B"}
						</span>

						{/* Slider */}
						<input
							type="range"
							min={config.min}
							max={config.max}
							value={componentValues[activeComponent]}
							onChange={handleSliderChange}
							autoFocus
							className="flex-1 h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-accent-cyan hover:accent-accent-cyan/80 min-w-0"
						/>

						{/* Value Readout */}
						<span className="text-[10px] font-mono font-bold w-6 text-left shrink-0">
							{componentValues[activeComponent]}
						</span>
					</div>

					{/* Actions: Revert & Commit (Outside, aligned with Hex) */}
					<div className="flex items-center gap-1 shrink-0">
						<button
							onClick={(e) => {
								e.stopPropagation();
								revertSlider();
							}}
							className="p-1.5 rounded-full bg-red-500/80 hover:bg-red-500 text-white transition-colors backdrop-blur-sm"
							title="Cancel"
						>
							<X size={12} />
						</button>
						<button
							onClick={(e) => {
								e.stopPropagation();
								commitSlider();
							}}
							className="p-1.5 rounded-full bg-green-500/80 hover:bg-green-500 text-white transition-colors backdrop-blur-sm"
							title="Commit"
						>
							<Check size={12} />
						</button>
					</div>
				</div>
			);
		}

		// COMPONENT Mode (Read-only view with clickable parts)
		return (
			<div
				className={`grid grid-cols-3 gap-2 flex-1 text-xs font-mono transition-all duration-300 ${
					disabled
						? "opacity-30 blur-[1px] pointer-events-none"
						: "opacity-80 cursor-default"
				}`}
			>
				{componentValues.map((val, idx) => (
					<button
						key={idx}
						onClick={(e) => {
							e.stopPropagation();
							startSlider(idx);
						}}
						className="hover:bg-white/10 hover:text-white px-0.5 rounded transition-colors text-right w-full"
						title={`Adjust ${type.toUpperCase()} value`}
						disabled={disabled}
					>
						{val}
						{type !== "rgb" && idx > 0 ? "%" : ""}
						<span className="opacity-30 ml-px">
							{idx < 2 ? "," : ""}
						</span>
					</button>
				))}
			</div>
		);
	};

	return (
		<div
			className={`flex items-center ${
				type === "hex" || isEditing || activeComponent !== null
					? "justify-center"
					: "justify-between"
			} px-12 gap-2 group/field w-full relative h-7 ${
				disabled ? "pointer-events-none" : ""
			} ${isEditing || activeComponent !== null ? "z-[100]" : "z-auto"}`}
		>
			{label && (
				<span
					className={`text-[9px] font-mono w-8 text-left transition-all duration-300 ${
						disabled ? "opacity-10" : "opacity-40"
					} ${
						isEditing || activeComponent !== null
							? "absolute left-2"
							: ""
					}`}
				>
					{label}
				</span>
			)}

			{renderContent()}

			{/* Copy Button (Only if NOT active slider/editing AND not hidden) */}
			{!isEditing && activeComponent === null && !hideCopy && (
				<button
					onClick={(e) => {
						e.stopPropagation();
						if (!disabled) onCopy();
					}}
					disabled={disabled}
					className={`
                        p-1.5 rounded-lg transition-all absolute right-2
                        ${
							isCopied
								? "opacity-100"
								: "opacity-0 group-hover/field:opacity-100 hover:bg-black/10"
						}
                        ${disabled ? "hidden" : ""}
                    `}
					title={`Copy ${type.toUpperCase()}`}
				>
					{isCopied ? (
						<Check
							size={type === "hex" ? 14 : 12}
							className="text-green-500"
						/>
					) : (
						<Copy size={type === "hex" ? 14 : 12} />
					)}
				</button>
			)}
		</div>
	);
};

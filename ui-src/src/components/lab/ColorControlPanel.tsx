import { useState } from "react";
import { colord } from "colord";
import {
	Copy,
	ArrowLeftRight,
	Check,
	Eye,
	EyeOff,
	ArrowUpDown,
	Wand2,
} from "lucide-react";
import { SmartColorInput } from "../common";
import { HeartToggle } from "../common/HeartToggle";
import { useCopyFeedback } from "../../hooks/useCopyFeedback";
import { SystemSettings } from "../../hooks/useSoloistSystem";
import { useAsyncToggle } from "../../hooks/useAsyncToggle";
import { useToast } from "../../context/ToastContext";

interface ColorControlPanelProps {
	seedColor: string;
	setSeedColor: (color: string) => void;
	secondaryColor: string;
	setSecondaryColor?: (color: string) => void;
	tertiaryColor: string;
	setTertiaryColor?: (color: string) => void;
	harmonyMode?: string;
	activeColorSlot?: "primary" | "secondary" | "tertiary";
	setActiveColorSlot?: (slot: "primary" | "secondary" | "tertiary") => void;
	settings: SystemSettings;
	updateSettings: (
		settings:
			| Partial<SystemSettings>
			| ((prev: SystemSettings) => SystemSettings)
	) => void;
	toggleFavorite?: (color: string) => Promise<void>;
	togglePalette?: (colors: string[]) => Promise<void>;
	onAddToRemix?: (color: string) => void;
	onLoadPalette?: (colors: string[]) => void;
}

export const ColorControlPanel = ({
	seedColor,
	setSeedColor,
	secondaryColor,
	setSecondaryColor,
	tertiaryColor,
	setTertiaryColor,
	harmonyMode,
	activeColorSlot,
	setActiveColorSlot,
	settings,
	updateSettings,
	toggleFavorite: toggleFavoriteProp,
	togglePalette: togglePaletteProp,
	onAddToRemix,
	onLoadPalette,
}: ColorControlPanelProps) => {
	const [activeEditorId, setActiveEditorId] = useState<string | null>(null);
	const [visibleCount, setVisibleCount] = useState<1 | 2 | 3>(3);

	// Hooks
	const { isCopied: isHexCopied, copy: copyHex } = useCopyFeedback();
	const { isCopied: isRgbCopied, copy: copyRgb } = useCopyFeedback();
	const { isCopied: isHslCopied, copy: copyHsl } = useCopyFeedback();
	const { isCopied: isHsbCopied, copy: copyHsb } = useCopyFeedback();
	const { isCopied: isPaletteCopied, copy: copyPalette } = useCopyFeedback();

	// Global Toast
	const toast = useToast();

	// Async Toggle for Favorites
	const { status: primaryStatus, toggle: togglePrimary } = useAsyncToggle();
	const { status: paletteStatus, toggle: togglePaletteAsync } =
		useAsyncToggle();

	// Parse Colors
	const color = colord(seedColor);
	const isDark = color.isDark();
	const rgba = color.toRgb();
	const hsla = color.toHsl();
	const hsva = color.toHsv(); // HSB is essentially HSV

	// Toggle Favorite With Async Feedback
	const handleFavoriteToggle = async (colorHex: string) => {
		await togglePrimary(async () => {
			// Use the prop function if provided (with AI metadata), fallback to simple toggle
			if (toggleFavoriteProp) {
				await toggleFavoriteProp(colorHex);
				return;
			}

			// Fallback for when prop not provided
			const currentLib = settings.library || {
				colors: [],
				fonts: [],
				palettes: [],
				paletteGroups: [],
				collections: [],
				projects: [],
			};
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
				toast.standard("Removed from Favorites");
			} else {
				// Add as simple string (no metadata generation in fallback)
				updateSettings({
					library: {
						...currentLib,
						colors: [...currentLib.colors, colorHex],
					},
				});
				toast.standard("Saved to Favorites");
			}
		});
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

	// Swap Logic for Manual Mode
	const handleSwap = (
		slotA: "primary" | "secondary" | "tertiary",
		slotB: "primary" | "secondary" | "tertiary"
	) => {
		// Only allow if we have setters
		if (!setSecondaryColor || !setTertiaryColor) return;

		const colors = {
			primary: seedColor,
			secondary: secondaryColor,
			tertiary: tertiaryColor,
		};

		const setters = {
			primary: setSeedColor,
			secondary: setSecondaryColor,
			tertiary: setTertiaryColor,
		};

		// Swap values
		const valA = colors[slotA];
		const valB = colors[slotB];

		// Apply
		setters[slotA](valB);
		setters[slotB](valA);
	};

	// Check if current palette exists (respecting visible count)
	const currentColors = [
		seedColor.toUpperCase(),
		secondaryColor.toUpperCase(),
		tertiaryColor.toUpperCase(),
	].slice(0, visibleCount);

	const isPaletteFavorite = settings.library?.palettes.some(
		(p: any) =>
			p.colors.length === currentColors.length &&
			p.colors.every(
				(c: string, i: number) => c.toUpperCase() === currentColors[i]
			)
	);

	const savePalette = async () => {
		// If prop provided (with AI logic), use it
		if (togglePaletteProp) {
			await togglePaletteAsync(async () => {
				await togglePaletteProp(currentColors);
			});
			return;
		}

		// Fallback Local Logic
		const currentLib = settings.library || { colors: [], palettes: [] };

		if (isPaletteFavorite) {
			// Remove
			updateSettings({
				library: {
					...currentLib,
					palettes: currentLib.palettes.filter(
						(p: any) =>
							!(
								p.colors.length === currentColors.length &&
								p.colors.every(
									(c: string, i: number) =>
										c.toUpperCase() === currentColors[i]
								)
							)
					),
				},
			});
			toast.standard("Removed from Favorites");
		} else {
			// Add
			const palette = {
				name: `Palette ${currentLib.palettes.length + 1}`,
				description: "Custom palette",
				colors: currentColors,
				createdAt: new Date().toISOString(),
			};
			updateSettings({
				library: {
					...currentLib,
					palettes: [...currentLib.palettes, palette],
				},
			});
			toast.standard("Saved to Favorites");
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
		<div className="flex flex-col gap-3 relative">
			{/* Centralized Interaction Locks */}
			{activeEditorId !== null && (
				<>
					{/* Global Lock (Main App) */}
					<div className="fixed inset-0 z-[50] bg-black/20 cursor-default" />
					{/* Local Lock (Panel Content) */}
					<div className="absolute inset-0 z-[90] bg-transparent cursor-default" />
				</>
			)}

			{/* Toast moved to Global Context */}

			{/* PRIMARY COLOR CONTROLS */}
			<div className="relative">
				{/* PRIMARY SWATCH CONTAINER */}
				<div
					className={`relative group w-full aspect-[4/3] rounded-xl shadow-sm overflow-hidden transition-all active:scale-[0.98] ${
						isDark
							? "border border-white/40"
							: "border border-black/20"
					} ${activeEditorId ? "z-[100]" : ""} ${
						harmonyMode === "manual" &&
						activeColorSlot === "primary"
							? "outline outline-1 outline-accent-cyan outline-offset-[3px] shadow-neon-glow scale-[1.02] z-10"
							: ""
					}`}
				>
					{/* Background */}
					<svg className="absolute inset-0 z-0 w-full h-full">
						<rect width="100%" height="100%" fill={seedColor} />
					</svg>
					{/* Overlay Content */}
					<div
						className={`absolute inset-0 z-10 p-3 flex flex-col justify-between pointer-events-none ${
							isDark ? "text-white" : "text-black/80"
						} ${harmonyMode === "manual" ? "cursor-pointer" : ""}`}
						onClick={
							harmonyMode === "manual" && setActiveColorSlot
								? () => {
										setActiveColorSlot("primary");
								  }
								: undefined
						}
						style={{
							pointerEvents:
								harmonyMode === "manual" ? "auto" : "none",
						}}
					>
						<div
							className={`flex justify-between items-start transition-opacity duration-300 pointer-events-auto ${
								activeEditorId
									? "pointer-events-none opacity-20"
									: "pointer-events-auto"
							}`}
						>
							<span className="text-[10px] font-bold tracking-widest uppercase opacity-60">
								Primary
							</span>
							<div className="absolute top-2 right-2 flex items-center gap-1 z-10 pointer-events-auto">
								{onAddToRemix && (
									<button
										onClick={(e) => {
											e.stopPropagation();
											onAddToRemix(
												seedColor.toUpperCase()
											);
										}}
										className="p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors backdrop-blur-sm"
										title="Send to Remix"
									>
										<Wand2 size={12} />
									</button>
								)}
								<button
									onClick={(e) => {
										e.stopPropagation();
										copyHex(
											seedColor.toUpperCase(),
											seedColor.toUpperCase()
										);
									}}
									className="p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors backdrop-blur-sm"
									title="Copy Hex"
								>
									{isHexCopied ? (
										<Check
											size={12}
											className="text-green-500"
										/>
									) : (
										<Copy size={12} />
									)}
								</button>
								<HeartToggle
									isFavorite={!!isPrimaryFavorite}
									onToggle={() =>
										handleFavoriteToggle(
											seedColor.toUpperCase()
										)
									}
									showPending={primaryStatus === "pending"}
									size={12}
									className="bg-black/20 hover:bg-black/40 backdrop-blur-sm"
								/>
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
									copyHex(
										seedColor.toUpperCase(),
										seedColor.toUpperCase()
									)
								}
								isCopied={isHexCopied}
								hideCopy={true}
								isDark={isDark}
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
									copyRgb(
										`rgb(${rgba.r}, ${rgba.g}, ${rgba.b})`,
										`rgb(${rgba.r}, ${rgba.g}, ${rgba.b})`
									)
								}
								isCopied={isRgbCopied}
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
									copyHsl(
										`hsl(${Math.round(
											hsla.h
										)}, ${Math.round(
											hsla.s
										)}%, ${Math.round(hsla.l)}%)`,
										`hsl(${Math.round(
											hsla.h
										)}, ${Math.round(
											hsla.s
										)}%, ${Math.round(hsla.l)}%)`
									)
								}
								isCopied={isHslCopied}
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
								onCopy={() =>
									copyHsb(
										`hsb(${Math.round(
											hsva.h
										)}, ${Math.round(
											hsva.s
										)}%, ${Math.round(hsva.v)}%)`,
										`hsb(${Math.round(
											hsva.h
										)}, ${Math.round(
											hsva.s
										)}%, ${Math.round(hsva.v)}%)`
									)
								}
								isCopied={isHsbCopied}
							/>
						</div>

						{/* Spacer to balance layout since we removed footer */}
						<div className="h-4"></div>
					</div>
				</div>
			</div>

			{/* SECONDARY & TERTIARY CARDS (Rendered Always, Editable if Manual) */}
			<div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-4 duration-500 delay-75">
				<MiniColorCard
					label="Secondary"
					color={secondaryColor}
					isFavorite={isSecondaryFavorite}
					isActive={
						harmonyMode === "manual" &&
						activeColorSlot === "secondary"
					}
					onMakePrimary={
						harmonyMode === "manual"
							? () => handleSwap("secondary", "primary")
							: () => setSeedColor(secondaryColor)
					}
					onAction={
						harmonyMode === "manual"
							? () => {
									if (visibleCount === 3)
										handleSwap("secondary", "tertiary");
									else if (visibleCount === 2)
										setVisibleCount(1);
									else setVisibleCount(2);
							  }
							: undefined
					}
					ActionIcon={
						visibleCount === 3
							? ArrowLeftRight
							: visibleCount === 2
							? Eye
							: EyeOff
					}
					actionTitle={
						visibleCount === 3
							? "Swap with Tertiary"
							: visibleCount === 2
							? "Hide"
							: "Show"
					}
					isHidden={visibleCount === 1}
					onToggleFavorite={() =>
						handleFavoriteToggle(secondaryColor.toUpperCase())
					}
					onClick={
						harmonyMode === "manual" && setActiveColorSlot
							? () => setActiveColorSlot("secondary")
							: undefined
					}
					isHoverEnabled={harmonyMode === "manual"}
				/>
				<MiniColorCard
					label="Tertiary"
					color={tertiaryColor}
					isFavorite={isTertiaryFavorite}
					isActive={
						harmonyMode === "manual" &&
						activeColorSlot === "tertiary"
					}
					onMakePrimary={
						harmonyMode === "manual"
							? () => handleSwap("tertiary", "primary")
							: () => setSeedColor(tertiaryColor)
					}
					onAction={
						harmonyMode === "manual"
							? () => {
									if (visibleCount === 3) setVisibleCount(2);
									else setVisibleCount(3);
							  }
							: undefined
					}
					ActionIcon={visibleCount === 3 ? Eye : EyeOff}
					actionTitle={visibleCount === 3 ? "Hide" : "Show"}
					actionDisabled={visibleCount === 1}
					isHidden={visibleCount < 3}
					onToggleFavorite={() =>
						handleFavoriteToggle(tertiaryColor.toUpperCase())
					}
					onClick={
						harmonyMode === "manual" && setActiveColorSlot
							? () => setActiveColorSlot("tertiary")
							: undefined
					}
					isHoverEnabled={harmonyMode === "manual"}
				/>
			</div>

			{/* PALETTE ACTION - Only show if > 1 color visible */}
			{visibleCount > 1 && (
				<div className="animate-in fade-in slide-in-from-top-4 duration-500 delay-100">
					<div className="w-full relative aspect-[8/3] rounded-xl overflow-hidden border border-white/10 shadow-sm transition-all hover:shadow-lg group">
						{/* Color Bars */}
						<div className="absolute inset-0 flex">
							{[
								{ color: seedColor, label: "Primary" },
								{
									color: secondaryColor,
									label: "Secondary",
								},
								{ color: tertiaryColor, label: "Tertiary" },
							]
								.slice(0, visibleCount)
								.map((item, idx) => {
									const isItemDark = colord(
										item.color
									).isDark();
									return (
										<div
											key={idx}
											className="flex-1 h-full relative overflow-hidden"
										>
											<svg className="absolute inset-0 w-full h-full">
												<rect
													width="100%"
													height="100%"
													fill={item.color}
												/>
											</svg>
											{/* Divider (except after last item) */}
											{idx < 2 && (
												<div className="absolute right-0 top-0 bottom-0 w-[1px] bg-white/20 z-10" />
											)}
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

						{/* Palette Tools */}
						<div className="absolute top-2 right-2 z-10 flex items-center gap-1">
							{onLoadPalette && (
								<button
									onClick={(e) => {
										e.stopPropagation();
										onLoadPalette(
											[
												seedColor,
												secondaryColor,
												tertiaryColor,
											].slice(0, visibleCount)
										);
									}}
									className="p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors backdrop-blur-sm"
									title="Send to Remix"
								>
									<Wand2 size={12} />
								</button>
							)}
							<button
								onClick={(e) => {
									e.stopPropagation();
									const hexes = [
										seedColor,
										secondaryColor,
										tertiaryColor,
									]
										.slice(0, visibleCount)
										.map((c) => c.toUpperCase())
										.join(", ");
									copyPalette(hexes, hexes);
								}}
								className="p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors backdrop-blur-sm"
								title="Copy All Hex Values"
							>
								{isPaletteCopied ? (
									<Check
										size={12}
										className="text-green-500"
									/>
								) : (
									<Copy size={12} />
								)}
							</button>
							<HeartToggle
								isFavorite={!!isPaletteFavorite}
								onToggle={() => savePalette()}
								showPending={paletteStatus === "pending"}
								className="bg-black/20 hover:bg-black/40 backdrop-blur-sm"
								size={12}
							/>
						</div>
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
	onColorChange,
	onClick,
	isActive,
	ActionIcon,
	onAction,
	actionTitle,
	actionDisabled = false,
	isHidden = false,
	isHoverEnabled = true,
}: {
	label: string;
	color: string;
	isFavorite?: boolean;
	isActive?: boolean;
	onMakePrimary: () => void;
	onToggleFavorite: () => void;
	onColorChange?: (color: string) => void;
	onClick?: () => void;
	ActionIcon?: React.ElementType;
	onAction?: () => void;
	actionTitle?: string;
	actionDisabled?: boolean;
	isHidden?: boolean;
	isHoverEnabled?: boolean;
}) => {
	const { isCopied, copy } = useCopyFeedback();
	const isDark = colord(color).isDark();

	const handleCopy = (e: React.MouseEvent) => {
		e.stopPropagation();
		copy(color.toUpperCase(), color.toUpperCase());
	};

	return (
		<div
			onClick={onClick}
			className={`relative rounded-xl overflow-hidden aspect-[4/3] shadow-sm transition-all group/minicard ${
				isActive
					? "outline outline-1 outline-accent-cyan outline-offset-[3px] shadow-neon-glow transform scale-[1.02] z-10"
					: isHoverEnabled && !isHidden
					? "hover:shadow-lg hover:scale-[1.02]"
					: ""
			} ${isDark ? "border border-white/40" : "border border-black/20"} ${
				onClick ? "cursor-pointer" : ""
			} ${isHidden ? "opacity-40 grayscale" : ""}`}
		>
			{/* Interactive Color Area */}
			<div
				className={`absolute inset-0 ${
					onClick ? "cursor-pointer" : ""
				}`}
			>
				<svg className="absolute inset-0 z-0 w-full h-full">
					<rect width="100%" height="100%" fill={color} />
				</svg>

				<div className="absolute top-2 right-2 flex items-center gap-1 z-10">
					{onAction && ActionIcon && (
						<button
							onClick={(e) => {
								e.stopPropagation();
								if (!actionDisabled) onAction();
							}}
							className={`p-1.5 rounded-full transition-colors backdrop-blur-sm ${
								actionDisabled
									? "opacity-50 cursor-default bg-black/10"
									: "bg-black/20 hover:bg-black/40 text-white"
							}`}
							title={actionTitle}
							disabled={actionDisabled}
						>
							<ActionIcon size={12} />
						</button>
					)}
					<button
						onClick={(e) => {
							e.stopPropagation();
							onMakePrimary();
						}}
						className="p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors backdrop-blur-sm"
						title={onAction ? "Swap with Primary" : "Make Primary"}
					>
						<ArrowUpDown size={12} />
					</button>
					<button
						onClick={handleCopy}
						className="p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors backdrop-blur-sm"
						title="Copy Hex"
					>
						{isCopied ? (
							<Check size={12} className="text-green-500" />
						) : (
							<Copy size={12} />
						)}
					</button>
					<HeartToggle
						isFavorite={!!isFavorite}
						onToggle={onToggleFavorite}
						size={12}
						className="bg-black/20 hover:bg-black/40 backdrop-blur-sm"
					/>
				</div>

				{/* Manual Color Input Trigger (Only if onColorChange provided) */}
				{onColorChange && (
					<input
						type="color"
						value={color}
						onChange={(e) => onColorChange(e.target.value)}
						className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-0"
						title="Change Color"
					/>
				)}
			</div>

			{/* Static Label (Always Visible) */}
			<div
				className={`absolute inset-0 p-2 flex flex-col justify-end pointer-events-none ${
					isDark ? "text-white/90" : "text-black/80"
				}`}
			>
				<span className="text-[10px] font-bold uppercase opacity-60 tracking-wider mb-0.5 flex items-center gap-1">
					{label}
					{onColorChange && (
						<span className="opacity-50 text-[8px]">(Edit)</span>
					)}
				</span>
				<span className="text-[10px] font-mono opacity-90">
					{color.toUpperCase()}
				</span>
			</div>
		</div>
	);
};

// SmartColorInput moved to src/components/common/SmartColorInput.tsx

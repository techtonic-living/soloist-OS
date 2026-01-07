import {
	Lightbulb,
	BookOpen,
	Ghost,
	Cpu,
	Zap,
	Copy,
	Pencil,
	Wand2,
	SlidersHorizontal,
	Check,
	X,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { HeartToggle } from "./common/HeartToggle";
import { useCopyFeedback } from "../hooks/useCopyFeedback";
import { ColorControlPanel } from "./lab/ColorControlPanel";
import { RemixStagingView } from "./lab/RemixStagingView";
import { MagicBadge } from "./common/MagicBadge";
import { SmartColorInput } from "./common";
import { colord } from "colord";
import {
	toggleFavoriteWithMetadata,
	togglePaletteWithMetadata,
	ToggleFavoriteResult,
} from "../utils/favorites";
import { PresetColor } from "../data/colorPresets";

import { useSoloist } from "../context/SoloistContext";
import { useToast } from "../context/ToastContext";

interface AssistantPanelProps {
	// Context Props
	activeColorStep?: string;
	activeColorTab?: string;
	activeTypeTab?: string;
	activeTokensModule?: string;
	activeExploreTab?: string;
	selectedInsightColor?: any;
	selectedInsightPalette?: any;
	// Updated to match implementation
	onToggleFavorite?: (color: string) => Promise<ToggleFavoriteResult | void>;
	onLoadPalette?: (colors: string[]) => void;
	onAddToRemix?: (color: string) => void;
	onLoadStudio?: (color: string) => void;
	activeColorSlot?: "primary" | "secondary" | "tertiary";
	setActiveColorSlot?: (slot: "primary" | "secondary" | "tertiary") => void;
	inspectedRemixIndex?: number | null;
	generatorColors?: string[];
	onUpdateRemixColor?: (index: number, color: string) => void;
	onCommitToRemix?: (color: string) => void;
}

// --- Sub-components for Palette Inspection ---

function PaletteInspectorHeader({
	isEditing,
	isFavorite,
	isPaletteCopied,
	palette,
	paletteHexes,
	onLoad,
	onToggleFavoritePalette,
	setIsEditing,
	handleCopyAll,
}: any) {
	return (
		<div className="absolute top-2 right-2 flex gap-1 z-[100]">
			{!isEditing && isFavorite && (
				<button
					onClick={() => setIsEditing(true)}
					className="p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
					title="Edit Details"
				>
					<Pencil size={12} />
				</button>
			)}

			<button
				onClick={() => onLoad(paletteHexes)}
				className="p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
				title="Send to Remix"
			>
				<Wand2 size={12} />
			</button>

			<button
				onClick={handleCopyAll}
				className="p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
				title="Copy Palette Hex"
			>
				{isPaletteCopied ? (
					<Check size={12} className="text-green-500" />
				) : (
					<Copy size={12} />
				)}
			</button>

			<HeartToggle
				isFavorite={isFavorite}
				onToggle={() =>
					onToggleFavoritePalette(
						paletteHexes,
						String(palette?.name || "")
					)
				}
				size={12}
				className="bg-black/20 hover:bg-black/40"
			/>
		</div>
	);
}

function ColorInspectorHeader({
	isEditing,
	isFavorite,
	isCopied,
	color,
	onLoadStudio,
	onLoadRemix,
	onToggleFavorite,
	setIsEditing,
	handleCopy,
}: any) {
	return (
		<div className="absolute top-2 right-2 flex gap-1 z-[100]">
			{!isEditing && isFavorite && (
				<button
					onClick={() => setIsEditing(true)}
					className="p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors backdrop-blur-sm"
					title="Edit Details"
				>
					<Pencil size={12} />
				</button>
			)}

			{onLoadStudio && (
				<button
					onClick={() => onLoadStudio(color.value)}
					className="p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors backdrop-blur-sm"
					title="Send to Studio"
				>
					<SlidersHorizontal size={12} />
				</button>
			)}

			{onLoadRemix && (
				<button
					onClick={onLoadRemix}
					className="p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors backdrop-blur-sm"
					title="Send to Remix"
				>
					<Wand2 size={12} />
				</button>
			)}

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
				isFavorite={isFavorite}
				onToggle={() => onToggleFavorite()}
				size={12}
				className="bg-black/20 hover:bg-black/40 backdrop-blur-sm"
			/>
		</div>
	);
}

function PaletteColorCell({
	hex,
	onLoadStudio,
	onAddToRemix,
	onToggleFavoriteColor,
	settings,
}: Readonly<{
	hex: string;
	onLoadStudio?: (hex: string) => void;
	onAddToRemix?: (hex: string) => void;
	onToggleFavoriteColor: (hex: string) => Promise<any>;
	settings: any;
}>) {
	const isDark = colord(hex).isDark();
	const { isCopied, copy } = useCopyFeedback();
	const isColorFavorite = settings.library?.colors?.some((c: any) => {
		const storedHex = typeof c === "string" ? c : c.value;
		return String(storedHex).toUpperCase() === String(hex).toUpperCase();
	});

	const stopEvent = (e: React.SyntheticEvent) => {
		e.stopPropagation();
	};

	const handleCopy = (e: React.MouseEvent<HTMLButtonElement>) => {
		stopEvent(e);
		copy(String(hex).toUpperCase(), String(hex).toUpperCase());
	};

	return (
		<div className="group relative flex-1 basis-0 hover:flex-[4] transition-[flex] duration-200 min-w-0 hover:min-w-[152px] overflow-hidden">
			{/* SVG for the color fill */}
			<svg className="absolute inset-0 w-full h-full" aria-hidden="true">
				<rect width="100%" height="100%" fill={hex} />
			</svg>

			{/* Always-visible hex label (bottom-left) */}
			<div className="absolute bottom-2 left-3 text-white mix-blend-difference min-w-0 max-w-full pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity duration-150">
				<span className="text-[10px] font-mono truncate block">
					{String(hex).toUpperCase()}
				</span>
			</div>

			{/* Hover reveal: tools */}
			<div className="absolute inset-0 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-150">
				<div className="absolute inset-0 flex items-center justify-end pr-2">
					<div
						className="flex items-center gap-1 text-white mix-blend-difference"
						onPointerDown={stopEvent}
					>
						{onLoadStudio && (
							<button
								type="button"
								onClick={(e) => {
									stopEvent(e);
									onLoadStudio(hex);
								}}
								className="p-1.5 rounded-full hover:opacity-80 transition-opacity"
								title="Send to Studio"
							>
								<SlidersHorizontal size={12} />
							</button>
						)}
						{onAddToRemix && (
							<button
								type="button"
								onClick={(e) => {
									stopEvent(e);
									onAddToRemix(hex);
								}}
								className="p-1.5 rounded-full hover:opacity-80 transition-opacity"
								title="Send to Remix"
							>
								<Wand2 size={12} />
							</button>
						)}
						<button
							type="button"
							onClick={handleCopy}
							className="p-1.5 rounded-full hover:opacity-80 transition-opacity"
							title="Copy Hex"
						>
							{isCopied ? (
								<Check size={12} className="text-green-500" />
							) : (
								<Copy size={12} />
							)}
						</button>
						<button
							type="button"
							onPointerDown={stopEvent}
							onClick={stopEvent}
							onKeyDown={(e) => {
								if (e.key === "Enter" || e.key === " ") {
									stopEvent(e);
								}
							}}
							className="inline-flex items-center justify-center p-0 m-0 border-none bg-transparent cursor-pointer"
						>
							<HeartToggle
								isFavorite={Boolean(isColorFavorite)}
								onToggle={() => onToggleFavoriteColor(hex)}
								size={12}
								className="mix-blend-difference"
							/>
						</button>
					</div>
				</div>
			</div>

			{/* Divider between stripes */}
			<div
				className={`absolute right-0 top-0 bottom-0 w-px ${
					isDark ? "bg-white/10" : "bg-black/10"
				}`}
				aria-hidden="true"
			/>
		</div>
	);
}

function InspectedPaletteCard({
	palette,
	onLoad,
	onLoadStudio,
	onAddToRemix,
	onToggleFavoritePalette,
	onToggleFavoriteColor,
	isEditing,
	setIsEditing,
}: Readonly<{
	palette: any;
	onLoad: (colors: string[]) => void;
	onLoadStudio?: (color: string) => void;
	onAddToRemix?: (color: string) => void;
	onToggleFavoritePalette: (colors: string[], name?: string) => void;
	onToggleFavoriteColor: (
		color: string
	) => Promise<ToggleFavoriteResult | void>;
	isEditing: boolean;
	setIsEditing: (v: boolean) => void;
}>) {
	const { settings, updateSettings } = useSoloist();
	const toast = useToast();
	const library = settings.library || { palettes: [], colors: [] };

	const normalizeHex = (v: any) => {
		if (!v) return "";
		if (typeof v === "string") return v;
		return v.value || v.hex || "";
	};

	const paletteHexes: string[] = Array.isArray(palette?.colors)
		? palette.colors.map(normalizeHex).filter(Boolean)
		: [];

	const isDark =
		paletteHexes.length > 0 ? colord(paletteHexes[0]).isDark() : true;

	const isSamePaletteByColors = (a: any, bHexes: string[]) => {
		const aHexes: string[] = Array.isArray(a?.colors)
			? a.colors.map(normalizeHex).filter(Boolean)
			: [];
		if (aHexes.length !== bHexes.length) return false;
		return aHexes.every(
			(c, i) =>
				String(c).toUpperCase() === String(bHexes[i]).toUpperCase()
		);
	};

	const savedPalette = (library.palettes || []).find((p: any) =>
		isSamePaletteByColors(p, paletteHexes)
	);
	const isFavorite = Boolean(savedPalette);

	const displayName = String(
		(savedPalette || palette)?.name || "Untitled Palette"
	);
	const displayDescription = String(
		(savedPalette || palette)?.description || ""
	);
	// Legacy support: some saved palettes may still have `tags: string[]`
	const legacyTags: string[] = Array.isArray((savedPalette || palette)?.tags)
		? (savedPalette || palette).tags
		: [];
	const displayMeaning = String(
		(savedPalette || palette)?.meaning ||
			(legacyTags.length ? legacyTags.join(", ") : "")
	);
	const displayUsage = String((savedPalette || palette)?.usage || "");

	// Local state for editing
	const [localName, setLocalName] = useState(displayName);
	const [localDesc, setLocalDesc] = useState(displayDescription);
	const [editMeaning, setEditMeaning] = useState(displayMeaning);
	const [editUsage, setEditUsage] = useState(displayUsage);

	const { isCopied: isPaletteCopied, copy: copyPalette } = useCopyFeedback();
	const nameInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (!isEditing) {
			setLocalName(displayName);
			setLocalDesc(displayDescription);
			setEditMeaning(displayMeaning);
			setEditUsage(displayUsage);
		}
	}, [
		displayName,
		displayDescription,
		displayMeaning,
		displayUsage,
		isEditing,
	]);

	const isDuplicateName = (library.palettes || []).some((p: any) => {
		const pName = String(p?.name || "");
		if (!pName.trim()) return false;
		// Skip self by exact colors match
		if (isSamePaletteByColors(p, paletteHexes)) return false;
		return (
			pName.trim().toLowerCase() ===
			(localName || "").trim().toLowerCase()
		);
	});
	const isValidName = (localName || "").trim().length > 0 && !isDuplicateName;

	const handleCancel = () => {
		setLocalName(displayName);
		setLocalDesc(displayDescription);
		setEditMeaning(displayMeaning);
		setEditUsage(displayUsage);
		setIsEditing(false);
	};

	const handleSave = () => {
		if (!isValidName) return;

		if (!isFavorite || !savedPalette) {
			// Only saved palettes can be edited (mirrors Color Inspector behavior)
			setIsEditing(false);
			return;
		}

		const nextName = localName.trim();
		const nextDesc = localDesc.trim();
		const nextMeaning = (editMeaning || "").trim();
		const nextUsage = (editUsage || "").trim();

		const palettesNext = (library.palettes || []).map((p: any) => {
			if (!isSamePaletteByColors(p, paletteHexes)) return p;
			return {
				...p,
				name: nextName,
				description: nextDesc,
				meaning: nextMeaning,
				usage: nextUsage,
			};
		});

		updateSettings({
			library: {
				...library,
				palettes: palettesNext,
			},
		});
		toast.standard("Palette updated");
		setIsEditing(false);
	};

	const handleCopyAll = () => {
		const text = paletteHexes
			.map((h) => String(h).toUpperCase())
			.join(", ");
		// Match mini-card behavior: copy hex values and show those as the toast label.
		copyPalette(text, text);
	};

	return (
		<div className="space-y-3">
			{/* Palette Card (same primary dimensions as Color Inspector) */}
			<div className="relative rounded-xl overflow-hidden aspect-[4/3] shadow-sm border border-white/10">
				{/* Palette colors: full-height vertical stripes, hover-expand */}
				<div className="absolute inset-0 flex items-stretch">
					{paletteHexes.map((hex, i) => (
						<PaletteColorCell
							key={`${hex}-${i}`}
							hex={hex}
							onLoadStudio={onLoadStudio}
							onAddToRemix={onAddToRemix}
							onToggleFavoriteColor={onToggleFavoriteColor}
							settings={settings}
						/>
					))}
				</div>

				<div
					className={`absolute inset-0 p-3 flex flex-col justify-end pointer-events-none ${
						isDark ? "text-white/90" : "text-black/80"
					}`}
				>
					{isEditing ? (
						<div className="pointer-events-auto mb-1 relative z-[100] flex items-center gap-2 w-full">
							<div className="relative flex-1 min-w-0">
								<input
									ref={nameInputRef}
									value={localName}
									onChange={(e) =>
										setLocalName(e.target.value)
									}
									onKeyDown={(e) => {
										if (e.key === "Enter") {
											e.preventDefault();
											if (isValidName) handleSave();
										} else if (e.key === "Escape") {
											handleCancel();
										}
									}}
									className={`bg-black/40 backdrop-blur-md text-white text-sm font-bold font-brand border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 shadow-lg transition-colors placeholder-white/50 w-full min-w-0 ${
										isDuplicateName
											? "border-red-500 focus:border-red-500 focus:ring-red-500/30"
											: "border-white/20 focus:border-accent-cyan focus:ring-accent-cyan/20"
									}`}
									placeholder="Palette Name"
									autoFocus
									title="Palette Name"
								/>
								{isDuplicateName && (
									<div className="absolute -top-6 left-0 right-0 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded shadow-lg animate-in fade-in slide-in-from-bottom-1">
										Palette name must be unique.
									</div>
								)}
							</div>
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
									disabled={!isValidName}
									className={`p-1.5 rounded-full text-white transition-colors backdrop-blur-sm ${
										!isValidName
											? "bg-gray-500 opacity-50"
											: "bg-green-500/80 hover:bg-green-500"
									}`}
									title="Save"
								>
									<Check size={12} />
								</button>
							</div>
						</div>
					) : (
						<span className="text-xs font-bold uppercase opacity-70 tracking-wider mb-0.5 flex items-center gap-1">
							{displayName}
						</span>
					)}
					<span
						className="text-[10px] font-mono opacity-0 select-none"
						aria-hidden="true"
					>
						&nbsp;
					</span>
				</div>

				{/* Header Actions */}
				<PaletteInspectorHeader
					isEditing={isEditing}
					isFavorite={isFavorite}
					isValidName={isValidName}
					isDuplicateName={isDuplicateName}
					isPaletteCopied={isPaletteCopied}
					palette={palette}
					paletteHexes={paletteHexes}
					onLoad={onLoad}
					onToggleFavoritePalette={onToggleFavoritePalette}
					setIsEditing={setIsEditing}
					handleSave={handleSave}
					handleCancel={handleCancel}
					handleCopyAll={handleCopyAll}
				/>
			</div>

			{/* Palette details / editing (mirrors Color Inspector layout) */}
			<div className="space-y-2 text-sm relative z-[100]">
				{isEditing ? (
					<div>
						<span className="text-xs font-mono text-accent-cyan uppercase tracking-wider block mb-1 opacity-60">
							Description
						</span>
						<textarea
							value={localDesc}
							onChange={(e) => setLocalDesc(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter" && !e.shiftKey) {
									e.preventDefault();
									handleSave();
								} else if (e.key === "Escape") {
									handleCancel();
								}
							}}
							className="w-full bg-bg-void/50 border border-glass-stroke rounded-lg p-2 text-xs text-gray-300 resize-none h-20 focus:outline-none focus:border-accent-cyan"
							placeholder="Add a description..."
						/>
					</div>
				) : (
					<>
						{displayDescription && (
							<div>
								<span className="text-xs font-mono text-accent-cyan uppercase tracking-wider block mb-1 opacity-60">
									Description
								</span>
								<p className="text-gray-300 text-xs leading-relaxed">
									{displayDescription}
								</p>
							</div>
						)}
					</>
				)}

				<div className="pt-2 border-t border-white/5 space-y-4">
					<TagDisplayEdit
						label="Meaning"
						value={editMeaning}
						onChange={setEditMeaning}
						isEditing={isEditing}
						suggestions={[
							"Warmth",
							"Energy",
							"Trust",
							"Calm",
							"Nature",
							"Luxury",
							"Focus",
							"Playful",
							"Bold",
							"Modern",
							"Traditional",
							"Clean",
						]}
					/>
					<TagDisplayEdit
						label="Usage"
						value={editUsage}
						onChange={setEditUsage}
						isEditing={isEditing}
						suggestions={[
							"Backgrounds",
							"Text",
							"Buttons",
							"Borders",
							"Accents",
							"Cards",
							"Charts",
							"Navigation",
							"Headers",
							"Brand",
							"Dark Mode",
							"Light Mode",
						]}
					/>
				</div>
			</div>
		</div>
	);
}

function InspectedColorCard({
	color,
	onUpdate,
	onToggleFavorite,
	isFavorite,
	isEditing,
	setIsEditing,
	onLoadStudio,
	onLoadRemix,
}: Readonly<{
	color: any;
	onUpdate: (
		color: string,
		name: string,
		desc: string,
		meaning?: string,
		usage?: string
	) => void;
	onToggleFavorite: () => void;
	isFavorite: boolean;
	isEditing: boolean;
	setIsEditing: (v: boolean) => void;
	onLoadStudio?: (color: string) => void;
	onLoadRemix?: () => void;
}>) {
	const { settings } = useSoloist();
	const library = settings.library || { colors: [] };
	const isDark = colord(color.value).isDark();

	// Local state for editing
	const [localName, setLocalName] = useState(color.name);
	const [localDesc, setLocalDesc] = useState(color.description || "");
	const [editMeaning, setEditMeaning] = useState(color.meaning || "");
	const [editUsage, setEditUsage] = useState(color.usage || "");

	const { isCopied, copy } = useCopyFeedback();
	const nameInputRef = useRef<HTMLInputElement>(null);

	// Sync local state when color changes or mode toggles
	useEffect(() => {
		if (!isEditing) {
			setLocalName(color.name);
			setLocalDesc(color.description || "");
			setEditMeaning(color.meaning || "");
			setEditUsage(color.usage || "");
		}
	}, [color, isEditing]);

	// Validation Logic
	const isDuplicate = library.colors.some((c: any) => {
		const cName = typeof c === "string" ? c : c.name;
		const cVal = typeof c === "string" ? c : c.value;
		// Skip self
		if (cVal.toUpperCase() === color.value.toUpperCase()) return false;
		return (
			cName.trim().toLowerCase() ===
			(localName || "").trim().toLowerCase()
		);
	});
	const isValid = (localName || "").trim().length > 0 && !isDuplicate;

	const handleSave = () => {
		if (!isValid) return;

		// Only update if changes were made
		if (
			localName !== color.name ||
			localDesc !== color.description ||
			editMeaning !== color.meaning ||
			editUsage !== color.usage
		) {
			onUpdate(
				color.value,
				localName.trim(),
				localDesc.trim(),
				editMeaning,
				editUsage
			);
		}
		setIsEditing(false);
	};

	const handleCancel = () => {
		setLocalName(color.name);
		setLocalDesc(color.description || "");
		setEditMeaning(color.meaning || "");
		setEditUsage(color.usage || "");
		setIsEditing(false);
	};

	const handleCopy = () => {
		copy(color.value.toUpperCase(), color.value.toUpperCase());
	};

	return (
		<div className="space-y-3">
			{/* Color Swatch */}
			<div
				className={`relative rounded-xl overflow-hidden aspect-[4/3] shadow-sm border ${
					isDark ? "border-white/40" : "border-black/20"
				}`}
			>
				<svg className="absolute inset-0 w-full h-full">
					<rect width="100%" height="100%" fill={color.value} />
				</svg>
				{/* Header Actions */}
				<ColorInspectorHeader
					isEditing={isEditing}
					isFavorite={isFavorite}
					isValid={isValid}
					isDuplicate={isDuplicate}
					isCopied={isCopied}
					color={color}
					onLoadStudio={onLoadStudio}
					onLoadRemix={onLoadRemix}
					onToggleFavorite={onToggleFavorite}
					setIsEditing={setIsEditing}
					handleSave={handleSave}
					handleCancel={handleCancel}
					handleCopy={handleCopy}
				/>

				<div
					className={`absolute inset-0 p-3 flex flex-col justify-end pointer-events-none ${
						isDark ? "text-white/90" : "text-black/80"
					}`}
				>
					{isEditing ? (
						<div className="pointer-events-auto mb-1 relative z-[100] flex items-center gap-2 w-full">
							<div className="relative flex-1 min-w-0">
								<input
									ref={nameInputRef}
									value={localName}
									onChange={(e) =>
										setLocalName(e.target.value)
									}
									onKeyDown={(e) => {
										if (e.key === "Enter") {
											e.preventDefault();
											if (isValid) handleSave();
										} else if (e.key === "Escape") {
											handleCancel();
										}
									}}
									className={`bg-black/40 backdrop-blur-md border rounded-lg px-3 py-1.5 text-sm font-bold font-brand text-white w-full focus:outline-none focus:ring-2 shadow-lg transition-colors placeholder-white/50 min-w-0 ${
										isDuplicate
											? "border-red-500 focus:border-red-500 focus:ring-red-500/30"
											: "border-white/20 focus:border-accent-cyan focus:ring-accent-cyan/20"
									}`}
									placeholder="Color Name"
									autoFocus
								/>
								{isDuplicate && (
									<div className="absolute -top-6 left-0 right-0 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded shadow-lg animate-in fade-in slide-in-from-bottom-1">
										Color name must be unique.
									</div>
								)}
							</div>
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
									disabled={!isValid}
									className={`p-1.5 rounded-full text-white transition-colors backdrop-blur-sm ${
										!isValid
											? "bg-gray-500 opacity-50"
											: "bg-green-500/80 hover:bg-green-500"
									}`}
									title="Save"
								>
									<Check size={12} />
								</button>
							</div>
						</div>
					) : (
						<span className="text-xs font-bold uppercase opacity-70 tracking-wider mb-0.5 flex items-center gap-1">
							{color.name}
							{color.isAutoRenamed && (
								<MagicBadge className="w-3 h-3 text-accent-cyan animate-pulse" />
							)}
						</span>
					)}
					<span className="text-[10px] font-mono opacity-75">
						{color.value.toUpperCase()}
					</span>
				</div>
			</div>

			{/* Color Details / Description Edit */}
			<div className="space-y-2 text-sm relative z-[100]">
				{isEditing ? (
					<div>
						<span className="text-xs font-mono text-accent-cyan uppercase tracking-wider block mb-1 opacity-60">
							Description
						</span>
						<textarea
							value={localDesc}
							onChange={(e) => setLocalDesc(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter" && !e.shiftKey) {
									e.preventDefault();
									handleSave();
								} else if (e.key === "Escape") {
									handleCancel();
								}
							}}
							className="w-full bg-bg-void/50 border border-glass-stroke rounded-lg p-2 text-xs text-gray-300 resize-none h-20 focus:outline-none focus:border-accent-cyan"
							placeholder="Add a description..."
						/>
					</div>
				) : (
					<>
						{color.description && (
							<div>
								<span className="text-xs font-mono text-accent-cyan uppercase tracking-wider block mb-1 opacity-60">
									Description
								</span>
								<p className="text-gray-300 text-xs leading-relaxed">
									{color.description}
								</p>
							</div>
						)}
					</>
				)}
				<div className="pt-2 border-t border-white/5 space-y-4">
					<TagDisplayEdit
						label="Meaning"
						value={editMeaning}
						onChange={setEditMeaning}
						isEditing={isEditing}
						suggestions={[
							"Warmth",
							"Energy",
							"Trust",
							"Calm",
							"Nature",
							"Luxury",
							"Focus",
							"Playful",
							"Bold",
							"Modern",
							"Traditional",
							"Clean",
						]}
					/>
					<TagDisplayEdit
						label="Usage"
						value={editUsage}
						onChange={setEditUsage}
						isEditing={isEditing}
						suggestions={[
							"Backgrounds",
							"Text",
							"Buttons",
							"Borders",
							"Accents",
							"Cards",
							"Charts",
							"Navigation",
							"Headers",
							"Brand",
							"Dark Mode",
							"Light Mode",
						]}
					/>
				</div>
			</div>
		</div>
	);
}

function TagDisplayEdit({
	label,
	value,
	onChange,
	isEditing,
	suggestions = [],
}: Readonly<{
	label: string;
	value: string;
	onChange: (val: string) => void;
	isEditing: boolean;
	suggestions?: string[];
}>) {
	const tags = value
		? value
				.split(",")
				.map((t) => t.trim())
				.filter(Boolean)
		: [];
	const [inputValue, setInputValue] = useState("");
	const [isCreating, setIsCreating] = useState(false);

	const addTag = (tag: string) => {
		if (!tags.includes(tag)) {
			const newTags = [...tags, tag];
			onChange(newTags.join(", "));
		}
		setInputValue("");
		setIsCreating(false);
	};

	const removeTag = (tagToRemove: string) => {
		const newTags = tags.filter((t) => t !== tagToRemove);
		onChange(newTags.join(", "));
	};

	// Filter suggestions to find ones NOT currently selected
	const unselectedSuggestions = suggestions.filter((s) => !tags.includes(s));

	if (!isEditing) {
		if (tags.length === 0) return null;
		return (
			<div>
				<span className="text-xs font-mono text-accent-cyan uppercase tracking-wider block mb-1 opacity-60">
					{label}
				</span>
				<p className="text-gray-300 text-xs leading-relaxed capitalize">
					{tags.join(", ")}
				</p>
			</div>
		);
	}

	return (
		<div className="relative">
			<span className="text-xs font-mono text-accent-cyan uppercase tracking-wider block mb-1 opacity-60">
				{label}
			</span>
			<div className="flex flex-wrap gap-1.5 mb-2">
				{/* Selected Tags (Active) */}
				{tags.map((tag) => (
					<button
						key={tag}
						type="button"
						className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent-cyan/20 text-[10px] text-accent-cyan border border-accent-cyan/30 group cursor-pointer hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 transition-colors capitalize"
						onClick={() => removeTag(tag)}
					>
						{tag}
						<X size={8} className="opacity-50" />
					</button>
				))}

				{/* Ghost Pills (Suggestions) */}
				{unselectedSuggestions.length > 0 && (
					<>
						{unselectedSuggestions.slice(0, 3).map((tag) => (
							<button
								key={`ghost-${tag}`}
								type="button"
								onClick={() => addTag(tag)}
								className="flex items-center gap-1 px-2 py-0.5 rounded-full border border-white/5 text-[10px] text-gray-500 hover:border-accent-cyan/30 hover:text-accent-cyan hover:bg-accent-cyan/5 transition-colors cursor-pointer capitalize border-dashed opacity-60 hover:opacity-100"
							>
								+ {tag}
							</button>
						))}
					</>
				)}

				{/* Add Custom Tag Input */}
				{isCreating ? (
					<input
						autoFocus
						type="text"
						value={inputValue}
						onChange={(e) => setInputValue(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								e.preventDefault();
								if (inputValue.trim()) {
									addTag(inputValue.trim());
								}
							} else if (e.key === "Escape") {
								setIsCreating(false);
							}
						}}
						onBlur={() => {
							if (inputValue.trim()) {
								addTag(inputValue.trim());
							}
							setIsCreating(false);
						}}
						className="bg-black/40 text-white text-sm font-brand font-bold px-3 py-1.5 rounded-lg border border-white/20 focus:border-accent-cyan focus:outline-none focus:ring-2 focus:ring-accent-cyan/20 w-full shadow-lg transition-colors placeholder-white/50"
						placeholder="Add tag..."
					/>
				) : (
					<button
						onClick={() => setIsCreating(true)}
						className="px-2 py-0.5 rounded-full bg-white/5 hover:bg-white/10 text-[10px] text-gray-400 hover:text-white transition-colors flex items-center gap-1"
					>
						<Wand2 size={8} />
						Add Custom
					</button>
				)}
			</div>
		</div>
	);
}

// ---------------------------
// Remix Individual Color Inspector Card
// ---------------------------

function RemixColorInspectorCard({
	index,
	color: colorHex,
	onUpdate,
	onToggleFavorite,
	isFavorite,
}: Readonly<{
	index: number;
	color: string;
	onUpdate: (color: string) => void;
	onToggleFavorite: (color: string) => void;
	isFavorite: boolean;
}>) {
	const [activeEditorId, setActiveEditorId] = useState<string | null>(null);

	// Hooks
	const { isCopied: isHexCopied, copy: copyHex } = useCopyFeedback();
	const { isCopied: isRgbCopied, copy: copyRgb } = useCopyFeedback();
	const { isCopied: isHslCopied, copy: copyHsl } = useCopyFeedback();
	const { isCopied: isHsbCopied, copy: copyHsb } = useCopyFeedback();

	const color = colord(colorHex);
	const hsla = color.toHsl();
	const rgba = color.toRgb();
	const hsva = color.toHsv();
	const isDark = color.isDark();

	const handleColorChange = (h: number, s: number, l?: number) => {
		const newColor = colord({
			h,
			s,
			l: l ?? hsla.l,
		}).toHex();
		onUpdate(newColor);
	};

	const handleManualInput = (val: string, type: string) => {
		let newColor;
		if (type === "rgb") {
			newColor = colord(`rgb(${val})`);
		} else if (type === "hsl") {
			newColor = colord(`hsl(${val})`);
		} else if (type === "hsb") {
			const parts = val
				.split(",")
				.map((p) => Number.parseFloat(p.trim().split("%").join("")));
			newColor = colord({ h: parts[0], s: parts[1], v: parts[2] });
		} else {
			newColor = colord(val);
		}

		if (newColor.isValid()) {
			onUpdate(newColor.toHex());
		}
	};

	return (
		<div className="space-y-6">
			{/* Precision Card (Match ColorControlPanel Style) */}
			<div
				className={`relative group w-full aspect-[4/3] rounded-2xl shadow-2xl overflow-hidden transition-all ${
					isDark ? "border border-white/40" : "border border-black/20"
				} ${activeEditorId ? "z-[100]" : ""}`}
			>
				{/* Swatch Background */}
				<div
					className="absolute inset-0 z-0"
					style={{ backgroundColor: colorHex }}
				/>

				{/* Interactive Overlay */}
				<div className="absolute inset-0 z-10 p-2 flex flex-col justify-between pointer-events-auto">
					{/* Interaction Lock for other elements if editing */}
					{activeEditorId !== null && (
						<div className="absolute inset-0 z-[90] bg-transparent cursor-default" />
					)}

					<div
						className={`flex justify-between items-start transition-opacity duration-300 ${
							activeEditorId
								? "opacity-20 pointer-events-none"
								: "opacity-100"
						}`}
					>
						<span
							className={`text-[10px] font-bold tracking-widest uppercase opacity-60 ${
								isDark ? "text-white" : "text-black"
							}`}
						>
							Slot {index + 1}
						</span>
						<div className="flex items-center gap-1">
							<button
								onClick={() =>
									copyHex(
										colorHex.toUpperCase(),
										colorHex.toUpperCase()
									)
								}
								className={`p-1.5 rounded-full hover:bg-black/10 transition-colors ${
									isDark ? "text-white" : "text-black/80"
								}`}
							>
								{isHexCopied ? (
									<Check
										size={14}
										className="text-green-500"
									/>
								) : (
									<Copy size={14} />
								)}
							</button>
							<HeartToggle
								isFavorite={isFavorite}
								onToggle={() => onToggleFavorite(colorHex)}
								size={14}
								className={
									isDark ? "text-white" : "text-black/80"
								}
							/>
						</div>
					</div>

					{/* Center: Stacked Editable Inputs (Ported from ColorControlPanel) */}
					<div
						className={`space-y-1 w-full flex flex-col items-center relative transition-all ${
							activeEditorId ? "z-[100]" : "z-20"
						}`}
					>
						{/* HEX Input */}
						<SmartColorInput
							id="hex"
							value={colorHex.toUpperCase()}
							type="hex"
							editable={true}
							disabled={
								activeEditorId !== null &&
								activeEditorId !== "hex"
							}
							onEditStart={(id) => setActiveEditorId(id)}
							onEditEnd={() => setActiveEditorId(null)}
							onCommit={(val) => {
								if (colord(val).isValid()) onUpdate(val);
							}}
							onCopy={() =>
								copyHex(
									colorHex.toUpperCase(),
									colorHex.toUpperCase()
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
							onCommit={(val) => handleManualInput(val, "rgb")}
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
							onCommit={(val) => handleManualInput(val, "hsl")}
							onCopy={() =>
								copyHsl(
									`hsl(${Math.round(hsla.h)}, ${Math.round(
										hsla.s
									)}%, ${Math.round(hsla.l)}%)`,
									`hsl(${Math.round(hsla.h)}, ${Math.round(
										hsla.s
									)}%, ${Math.round(hsla.l)}%)`
								)
							}
							isCopied={isHslCopied}
						/>

						{/* HSB Input */}
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
							onCommit={(val) => handleManualInput(val, "hsb")}
							onCopy={() =>
								copyHsb(
									`hsb(${Math.round(hsva.h)}, ${Math.round(
										hsva.s
									)}%, ${Math.round(hsva.v)}%)`,
									`hsb(${Math.round(hsva.h)}, ${Math.round(
										hsva.s
									)}%, ${Math.round(hsva.v)}%)`
								)
							}
							isCopied={isHsbCopied}
						/>
					</div>

					<div className="h-4" />
				</div>
			</div>

			{/* The Wheel (Below Swatch) */}
			<div className="flex flex-col items-center justify-center py-4 bg-black/20 rounded-2xl border border-white/5 shadow-inner">
				<div className="scale-90">
					<LocalColorWheel
						size={240}
						hue={hsla.h}
						saturation={hsla.s}
						onChange={(h, s) => handleColorChange(h, s)}
						lightness={hsla.l}
					/>
				</div>
			</div>

			{/* Lightness Control Pill */}
			<div className="relative z-20 flex items-center gap-3 p-1 pr-4 bg-black/60 backdrop-blur-xl rounded-full border border-white/10 shadow-2xl w-full">
				<div className="px-3 py-1.5 rounded-full bg-white/5 text-[10px] uppercase font-bold tracking-wider text-gray-400 pointer-events-none select-none">
					Lightness
				</div>

				<div className="relative flex-1 h-3 rounded-full overflow-hidden shadow-inner border border-white/10 group cursor-pointer">
					<div
						className="absolute inset-0 z-0 opacity-80"
						style={{
							background: `linear-gradient(to right, #000 0%, ${colord(
								{
									h: hsla.h,
									s: hsla.s,
									l: 50,
								}
							).toHex()} 50%, #fff 100%)`,
						}}
					/>
					<input
						type="range"
						min="0"
						max="100"
						value={hsla.l}
						onChange={(e) =>
							handleColorChange(
								hsla.h,
								hsla.s,
								Number.parseInt(e.target.value)
							)
						}
						className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
					/>
					<div
						className="absolute top-0 bottom-0 w-1.5 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)] pointer-events-none transition-transform duration-75"
						style={{
							left: `${hsla.l}%`,
							transform: "translateX(-50%)",
						}}
					/>
				</div>

				<div className="w-8 text-right text-[10px] uppercase font-bold tracking-wider text-white select-none">
					{Math.round(hsla.l)}%
				</div>
			</div>
		</div>
	);
}

// ---------------------------
// Local Color Wheel (Ported from ColorCreator)
// ---------------------------

const LocalColorWheel = ({
	size,
	hue,
	saturation,
	onChange,
	lightness = 50,
}: {
	size: number;
	hue: number;
	saturation: number;
	onChange: (h: number, s: number) => void;
	lightness?: number;
}) => {
	const wheelRef = useRef<HTMLDivElement>(null);
	const [isDragging, setIsDragging] = useState(false);
	const radius = size / 2;

	const getPosition = (h: number, s: number) => {
		const angleRad = (h - 90) * (Math.PI / 180);
		const dist = (s / 100) * radius;
		const x = radius + Math.cos(angleRad) * dist;
		const y = radius + Math.sin(angleRad) * dist;
		return { x, y };
	};

	const mainPos = getPosition(hue, saturation);

	const handleMove = (clientX: number, clientY: number) => {
		if (!wheelRef.current) return;
		const rect = wheelRef.current.getBoundingClientRect();
		const cx = rect.left + radius;
		const cy = rect.top + radius;
		const dx = clientX - cx;
		const dy = clientY - cy;

		let angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
		if (angle < 0) angle += 360;
		const dist = Math.hypot(dx, dy);
		const s = Math.min(100, (dist / radius) * 100);
		onChange(angle, s);
	};

	useEffect(() => {
		if (!isDragging) return;
		const onMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
		const onMouseUp = () => setIsDragging(false);
		globalThis.addEventListener("mousemove", onMouseMove);
		globalThis.addEventListener("mouseup", onMouseUp);
		return () => {
			globalThis.removeEventListener("mousemove", onMouseMove);
			globalThis.removeEventListener("mouseup", onMouseUp);
		};
	}, [isDragging]);

	return (
		<div
			ref={wheelRef}
			role="slider"
			aria-label="Color Wheel"
			aria-valuetext={`Hue: ${Math.round(
				hue
			)} degrees, Saturation: ${Math.round(saturation)}%`}
			aria-valuenow={Math.round(hue)}
			aria-valuemin={0}
			aria-valuemax={360}
			tabIndex={0}
			className="relative cursor-pointer active:cursor-grabbing focus:outline-none focus:ring-2 focus:ring-accent-cyan rounded-full"
			style={{ width: size, height: size }}
			onMouseDown={(e) => {
				setIsDragging(true);
				handleMove(e.clientX, e.clientY);
			}}
			onKeyDown={(e) => {
				const step = e.shiftKey ? 10 : 2;
				if (e.key === "ArrowLeft")
					onChange((hue - step + 360) % 360, saturation);
				if (e.key === "ArrowRight")
					onChange((hue + step) % 360, saturation);
				if (e.key === "ArrowUp")
					onChange(hue, Math.min(100, saturation + step));
				if (e.key === "ArrowDown")
					onChange(hue, Math.max(0, saturation - step));
			}}
		>
			<div className="absolute inset-0 rounded-full border border-white/20 shadow-2xl overflow-hidden">
				<div
					className="absolute inset-0 opacity-80"
					style={{
						background: `conic-gradient(from 0deg, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)`,
						filter: `brightness(${lightness}%)`,
					}}
				/>
				<div className="absolute inset-0 bg-[radial-gradient(circle,#fff,transparent_70%)]" />
			</div>

			{/* Main Handle */}
			<div
				className="absolute w-6 h-6 -ml-3 -mt-3 rounded-full border-2 border-white shadow-lg z-30 transition-all hover:scale-110 cursor-grab active:cursor-grabbing group-active:shadow-2xl"
				style={{
					left: mainPos.x,
					top: mainPos.y,
					backgroundColor: colord({
						h: hue,
						s: saturation,
						l: lightness,
					}).toHex(),
				}}
			/>
		</div>
	);
};

// ---------------------------
// Smart Color Input (Ported from ColorControlPanel)
// ---------------------------

// SmartColorInput moved to ./common/SmartColorInput.tsx
export function AssistantPanel({
	activeColorStep,
	activeColorTab,
	activeTypeTab,
	activeTokensModule,
	activeExploreTab,
	selectedInsightColor,
	selectedInsightPalette,
	onLoadPalette,
	onAddToRemix,
	onLoadStudio,
	activeColorSlot,
	setActiveColorSlot,
	inspectedRemixIndex,
	generatorColors = [],
	onUpdateRemixColor,
	onCommitToRemix,
	onToggleFavorite: _onToggleFavorite,
}: Readonly<AssistantPanelProps>) {
	// --- Context Consumption ---
	const {
		activeView,
		settings,
		updateSettings,
		seedColor,
		setSeedColor,
		secondaryRamp,
		tertiaryRamp,
		harmonyMode,
		setSecondaryColor,
		setTertiaryColor,
		stagedRemixColors,
		setStagedRemixColors,
		stagedRemixPalettes,
		setStagedRemixPalettes,
	} = useSoloist();

	const aiLevel = settings.aiLevel;
	const secondaryColor = secondaryRamp[5]?.hex || "#000000";
	const tertiaryColor = tertiaryRamp[5]?.hex || "#000000";

	// Lifted State for Interaction Lock
	const [isEditing, setIsEditing] = useState(false);

	// Reset isEditing when selection changes or tab switches
	useEffect(() => {
		setIsEditing(false);
	}, [
		selectedInsightColor?.value,
		selectedInsightPalette?.name,
		inspectedRemixIndex,
		activeExploreTab,
	]);

	const toast = useToast();

	// Staging Handlers
	const handleRemoveStagedColor = (index: number) => {
		setStagedRemixColors((prev: string[]) =>
			prev.filter((_: string, i: number) => i !== index)
		);
	};
	const handleRemoveStagedPalette = (index: number) => {
		setStagedRemixPalettes((prev: any[]) =>
			prev.filter((_: any, i: number) => i !== index)
		);
	};
	const handleSwapStagedPrimary = (index: number) => {
		setStagedRemixColors((prev: string[]) => {
			const next = [...prev];
			const primary = next[0];
			next[0] = next[index];
			next[index] = primary;
			return next;
		});
	};
	// useSoloistSystem doesn't expose onUpdateColor directly, we might need to implement it here or usage was wrong.
	// Checking the hook file, it returns { settings, updateSettings, updateData, dataStore }.
	// Assuming onUpdateColor is NOT in the hook, we will implement the updater manually using updateSettings.

	const updateColorInLibrary = (colorVal: string, updates: any) => {
		const library = settings.library || {
			colors: [],
			fonts: [],
			palettes: [],
		};
		const updatedColors = library.colors.map((c: any) => {
			const cVal = typeof c === "string" ? c : c.value;
			if (cVal.toUpperCase() === colorVal.toUpperCase()) {
				if (typeof c === "string") {
					return { value: c, ...updates };
				}
				return { ...c, ...updates };
			}
			return c;
		});

		updateSettings({
			library: { ...library, colors: updatedColors },
		});
	};

	const toggleFavoriteColor = async (color: string) => {
		console.log("[AssistantPanel] toggleFavoriteColor called for:", color);
		const result = await toggleFavoriteWithMetadata({
			color,
			settings,
			updateSettings,
		});

		if (result?.action === "added" && result.color?.isAutoRenamed) {
			toast.standard(
				<>
					Saved as{" "}
					<span className="text-accent-cyan">
						{result.color.name}
					</span>
				</>
			);
		}
	};

	const handleUpdateColor = (
		colorVal: string,
		newName: string,
		newDesc: string,
		newMeaning?: string,
		newUsage?: string
	) => {
		updateColorInLibrary(colorVal, {
			name: newName,
			description: newDesc,
			meaning: newMeaning,
			usage: newUsage,
		});
		toast.standard("Color updated");
	};

	// Toggle Palette with AI Metadata
	const handleTogglePalette = async (colors: string[], name?: string) => {
		const result = await togglePaletteWithMetadata({
			colors,
			name,
			settings,
			updateSettings,
		});

		if (result.action === "added") {
			toast.standard("Palette saved to Favorites");
		} else {
			toast.standard("Palette removed from Favorites");
		}
	};

	// Content Mapping
	const content = getContentForView({
		view: activeView,
		colorStep: activeColorStep,
		colorTab: activeColorTab,
		typeTab: activeTypeTab,
		tokensModule: activeTokensModule,
		exploreTab: activeExploreTab,
		selectedColor: selectedInsightColor,
		selectedPalette: selectedInsightPalette,
		inspectedRemixIndex,
	});
	// Check if we should show the Color Control Panel (Essential Content for 'Studio')
	const showColorControls =
		activeView === "explore" && activeExploreTab === "studio";

	// Determine Visibility based on AI Level
	// Standby (silent): Title, Description, Essential Content
	// Wingman (guide): + Suggestions
	// Guru (teacher): + Concepts

	const showSuggestions = aiLevel === "guide" || aiLevel === "teacher";
	const showConcepts = aiLevel === "teacher";

	// Helper to check if a color is in favorites (handles both strings and objects)
	const checkIsFavorite = (colorHex: string) => {
		return settings.library?.colors.some((c: any) => {
			const storedHex = typeof c === "string" ? c : c.value;
			return storedHex.toUpperCase() === colorHex.toUpperCase();
		});
	};

	// --- Sub-renderers to reduce complexity ---
	const renderRemixInspectorSection = () => {
		if (
			activeExploreTab !== "remix" ||
			inspectedRemixIndex === null ||
			inspectedRemixIndex === undefined ||
			!generatorColors[inspectedRemixIndex]
		) {
			return null;
		}

		return (
			<div className="pt-4 border-t border-white/5">
				<RemixColorInspectorCard
					index={inspectedRemixIndex}
					color={generatorColors[inspectedRemixIndex]}
					onUpdate={(newColor) =>
						onUpdateRemixColor?.(inspectedRemixIndex, newColor)
					}
					onToggleFavorite={toggleFavoriteColor}
					isFavorite={checkIsFavorite(
						generatorColors[inspectedRemixIndex]
					)}
				/>
			</div>
		);
	};

	const renderInspectedColorSection = () => {
		if (activeExploreTab !== "colors" || !selectedInsightColor) {
			return null;
		}

		const colorInLibrary = settings.library?.colors?.find(
			(c: string | PresetColor) => {
				const hex = typeof c === "string" ? c : c.value;
				return (
					hex.toUpperCase() ===
					selectedInsightColor.value.toUpperCase()
				);
			}
		);

		const isFavorite = settings.library?.colors?.some(
			(c: string | PresetColor) => {
				const hex = typeof c === "string" ? c : c.value;
				return (
					hex.toUpperCase() ===
					selectedInsightColor.value.toUpperCase()
				);
			}
		);

		return (
			<div className="pt-4 border-t border-white/5">
				<InspectedColorCard
					color={colorInLibrary || selectedInsightColor}
					onUpdate={handleUpdateColor}
					onToggleFavorite={() =>
						toggleFavoriteColor(selectedInsightColor.value)
					}
					isFavorite={Boolean(isFavorite)}
					isEditing={isEditing}
					setIsEditing={setIsEditing}
					onLoadStudio={onLoadStudio}
					onLoadRemix={() =>
						onAddToRemix?.(selectedInsightColor.value)
					}
				/>
			</div>
		);
	};

	const renderInspectedPaletteSection = () => {
		if (activeExploreTab !== "palettes" || !selectedInsightPalette) {
			return null;
		}

		return (
			<div className="pt-4 border-t border-white/5">
				<InspectedPaletteCard
					palette={selectedInsightPalette}
					onLoad={onLoadPalette || (() => {})}
					onLoadStudio={onLoadStudio}
					onAddToRemix={onAddToRemix}
					onToggleFavoritePalette={handleTogglePalette}
					onToggleFavoriteColor={toggleFavoriteColor}
					isEditing={isEditing}
					setIsEditing={setIsEditing}
				/>
			</div>
		);
	};

	const renderSuggestionsSection = () => {
		if (
			!showSuggestions ||
			!content.suggestions ||
			content.suggestions.length === 0
		) {
			return null;
		}

		const sectionTitle =
			aiLevel === "teacher" ? "Expert Tips" : "Suggestions";

		return (
			<div className="pt-4 border-t border-white/5 space-y-4">
				<h4 className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-widest">
					<Lightbulb size={14} className="text-yellow-400" />
					{sectionTitle}
				</h4>
				{content.suggestions.map((suggestion: any) => (
					<div
						key={suggestion.title}
						className="p-4 rounded-xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 hover:border-accent-cyan/30 transition-colors group cursor-default"
					>
						<div className="flex justify-between items-start mb-2">
							<h5 className="text-sm text-white font-medium group-hover:text-accent-cyan transition-colors">
								{suggestion.title}
							</h5>
						</div>
						<p className="text-xs text-gray-400 leading-relaxed">
							{suggestion.text}
						</p>
					</div>
				))}
			</div>
		);
	};

	const renderConceptsSection = () => {
		if (
			!showConcepts ||
			!content.concepts ||
			content.concepts.length === 0
		) {
			return null;
		}

		return (
			<div className="pt-4 border-t border-white/5 space-y-4">
				<h4 className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-widest">
					<BookOpen size={14} className="text-accent-cyan" />
					Key Concepts
				</h4>
				<div className="bg-bg-raised/50 rounded-xl p-4 border border-glass-stroke space-y-3">
					{content.concepts.map((concept: string, i: number) => (
						<div key={concept} className="flex gap-3 items-start">
							<span className="text-accent-cyan font-bold text-sm">
								{i + 1}.
							</span>
							<p className="text-sm text-gray-300">{concept}</p>
						</div>
					))}
				</div>
			</div>
		);
	};

	const modeTitle = (function () {
		if (aiLevel === "teacher") return "Guru Mode";
		if (aiLevel === "guide") return "Wingman Mode";
		return "Standby Mode";
	})();

	return (
		<div
			className={`h-full w-[320px] border-l border-glass-stroke flex flex-col overflow-hidden relative transition-all duration-200 ${
				isEditing ? "z-[100]" : "z-40"
			}`}
		>
			<div className="absolute inset-0 bg-bg-void/50 backdrop-blur-md -z-10" />

			{isEditing && (
				<>
					<div className="fixed inset-0 z-[50] bg-black/20 cursor-default" />
					<div className="absolute inset-0 z-[90] bg-transparent cursor-default" />
				</>
			)}

			<div className="flex-shrink-0 p-4 border-b border-glass-stroke flex items-center justify-between bg-accent-cyan/5 h-16 relative z-0">
				<div className="flex items-center gap-3">
					<div
						className={`p-2 rounded-lg ${
							aiLevel === "silent"
								? "text-gray-500 bg-white/5"
								: "text-accent-cyan bg-accent-cyan/10"
						}`}
					>
						{aiLevel === "teacher" && <Zap size={18} />}
						{aiLevel === "guide" && <Cpu size={18} />}
						{aiLevel === "silent" && <Ghost size={18} />}
					</div>
					<div>
						<h3 className="text-white font-brand text-sm tracking-wide">
							{modeTitle}
						</h3>
					</div>
				</div>
			</div>

			{activeExploreTab === "remix" && inspectedRemixIndex === null ? (
				<div className="flex-1 overflow-hidden relative">
					<RemixStagingView
						colors={stagedRemixColors}
						palettes={stagedRemixPalettes}
						onRemoveColor={handleRemoveStagedColor}
						onRemovePalette={handleRemoveStagedPalette}
						onCommitColor={(c: string) => onCommitToRemix?.(c)}
						onCommitPalette={() => {}}
						onSwapPrimary={handleSwapStagedPrimary}
						onToggleFavoriteColor={_onToggleFavorite}
					/>
				</div>
			) : (
				<div
					className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar"
					style={{ scrollbarGutter: "stable" }}
				>
					<div>
						<span className="text-accent-cyan text-xs font-mono mb-2 block uppercase tracking-wider opacity-60">
							Active Tool
						</span>
						<h2 className="text-2xl text-white font-brand mb-2 leading-tight">
							{content.title}
						</h2>
						<p className="text-gray-400 text-sm leading-relaxed">
							{content.description}
						</p>
					</div>

					{renderRemixInspectorSection()}
					{renderInspectedColorSection()}
					{renderInspectedPaletteSection()}

					{showColorControls && seedColor && setSeedColor && (
						<div className="pt-4 border-t border-white/5">
							<ColorControlPanel
								seedColor={seedColor}
								setSeedColor={setSeedColor}
								secondaryColor={secondaryColor || "#000000"}
								setSecondaryColor={setSecondaryColor}
								tertiaryColor={tertiaryColor || "#000000"}
								setTertiaryColor={setTertiaryColor}
								harmonyMode={harmonyMode}
								activeColorSlot={activeColorSlot}
								setActiveColorSlot={setActiveColorSlot}
								settings={settings}
								updateSettings={updateSettings}
								toggleFavorite={toggleFavoriteColor}
								togglePalette={handleTogglePalette}
								onAddToRemix={onAddToRemix}
								onLoadPalette={onLoadPalette}
							/>
						</div>
					)}

					{renderSuggestionsSection()}
					{renderConceptsSection()}
				</div>
			)}
		</div>
	);
}

// --- Educational Content Mapping ---
function getExploreViewContent(
	exploreTab?: string,
	selectedColor?: any,
	selectedPalette?: any,
	inspectedRemixIndex?: number | null
) {
	// Priority: Specific inspection descriptions GATED BY TAB
	if (exploreTab === "palettes" && selectedPalette) {
		return {
			lessonId: "00.2a",
			title: "Palette Inspector",
			description: "Detailed view of the selected palette.",
			concepts: [],
			suggestions: [],
		};
	}

	if (
		(exploreTab === "colors" && selectedColor) ||
		(exploreTab === "remix" && inspectedRemixIndex !== null)
	) {
		return {
			lessonId: "00.1a",
			title: "Color Inspector",
			description: "Detailed view of the selected color.",
			concepts: [],
			suggestions: [],
		};
	}

	if (exploreTab === "colors") {
		return {
			lessonId: "00.1",
			title: "Saved Colors",
			description:
				"This is your collection of saved colors. Think of it as your palette playground.",
			concepts: [
				"Star colors to save them here.",
				"Click a color to set it as your active seed.",
				"Building a library helps maintain consistency across projects.",
			],
			suggestions: [
				{
					title: "Clean Up",
					text: "Remove colors you no longer need to keep your library focused.",
				},
			],
		};
	}
	if (exploreTab === "palettes") {
		return {
			lessonId: "00.2",
			title: "Saved Palettes",
			description:
				"Groups of colors that work well together. Keep your best combinations here.",
			concepts: [
				"Save entire generated palettes for later use.",
				"Name your palettes descriptively (e.g., 'Dark Mode Details', 'Brand Primary').",
			],
			suggestions: [
				{
					title: "Create a Palette",
					text: "Use the Remix tool to create a new palette and save it.",
				},
			],
		};
	}
	if (exploreTab === "studio") {
		return {
			lessonId: "00.6",
			title: "Color Studio",
			description: "Create custom colors with precision.",
			concepts: [
				"Use Hue, Saturation, and Lightness for intuitive mixing.",
				"See real-time harmony suggestions on the wheel.",
			],
			suggestions: [
				{
					title: "Mixing Harmonies",
					text: "Try switching between Complementary and Analogous modes.",
				},
			],
		};
	}
	if (exploreTab === "remix") {
		return {
			lessonId: "00.7",
			title: "Palette Remix",
			description: "Generate and refine palettes with magic.",
			concepts: [
				"Lock colors you like to keep them while randomizing others.",
				"Save your favorite remixes to your Palette Library.",
			],
			suggestions: [
				{
					title: "Dynamic Evolution",
					text: "Randomize often to discover unexpected but beautiful pairings.",
				},
			],
		};
	}

	return null;
}

// --- Educational Content Mapping ---
function getContentForView(params: {
	view: string;
	colorStep?: string;
	colorTab?: string;
	typeTab?: string;
	tokensModule?: string;
	exploreTab?: string;
	selectedColor?: any;
	selectedPalette?: any;
	inspectedRemixIndex?: number | null;
}) {
	const {
		view,
		exploreTab,
		selectedColor,
		selectedPalette,
		inspectedRemixIndex,
	} = params;

	if (view === "explore") {
		const exploreContent = getExploreViewContent(
			exploreTab,
			selectedColor,
			selectedPalette,
			inspectedRemixIndex
		);
		if (exploreContent) return exploreContent;
	}

	return {
		lessonId: "00",
		title: "Design Assistant",
		description:
			"I'm here to help you build a consistent and accessible design system.",
		concepts: [],
		suggestions: [],
	};
}

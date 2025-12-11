import { Lightbulb, BookOpen, Ghost, Cpu, Zap } from "lucide-react";
import { ColorControlPanel } from "./lab/ColorControlPanel";
import { colord } from "colord";
import { toggleFavoriteWithMetadata } from "../utils/favorites";
import { PresetColor } from "../data/colorPresets";
import { useState, useEffect } from "react";
import { Check, X, Pencil, Copy, Heart } from "lucide-react";

import { useSoloist } from "../context/SoloistContext";

interface AssistantPanelProps {
	// Context Props
	activeColorStep?: string;
	activeColorTab?: string;
	activeTypeTab?: string;
	activeTokensModule?: string;
	activeExploreTab?: string;
	selectedInsightColor?: any;
}

export const AssistantPanel = ({
	activeColorStep,
	activeColorTab,
	activeTypeTab,
	activeTokensModule,
	activeExploreTab,
	selectedInsightColor,
}: AssistantPanelProps) => {
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
	} = useSoloist();

	const aiLevel = settings.aiLevel;
	const secondaryColor = secondaryRamp[5]?.hex || "#000000";
	const tertiaryColor = tertiaryRamp[5]?.hex || "#000000";

	// Lifted State for Interaction Lock
	const [isEditing, setIsEditing] = useState(false);

	// Toggle Favorite with shared metadata-aware helper
	const toggleFavoriteColor = async (color: string) =>
		toggleFavoriteWithMetadata({
			color,
			settings,
			updateSettings,
		});

	// Update Favorite Color Logic (Name & Description)
	const updateFavoriteColor = (
		color: string,
		newName: string,
		newDescription: string,
		newMeaning?: string,
		newUsage?: string
	) => {
		const library = settings.library || {
			colors: [],
			fonts: [],
			palettes: [],
		};

		const updatedColors = library.colors.map((c: string | PresetColor) => {
			const hexValue = typeof c === "string" ? c : c.value;
			if (hexValue.toUpperCase() === color.toUpperCase()) {
				if (typeof c === "string") {
					return {
						name: newName,
						value: c, // Original value
						description: newDescription,
						meaning: newMeaning,
						usage: newUsage,
					};
				} else {
					return {
						...c,
						name: newName,
						description: newDescription,
						meaning: newMeaning,
						usage: newUsage,
					};
				}
			}
			return c;
		});

		updateSettings({
			library: {
				...library,
				colors: updatedColors,
			},
		});
	};

	// Content Mapping
	const content = getContentForView(
		activeView,
		activeColorStep,
		activeColorTab,
		activeTypeTab,
		activeTokensModule,
		activeExploreTab,
		selectedInsightColor
	);

	// Check if we should show the Color Control Panel (Essential Content for 'Studio')
	const showColorControls =
		activeView === "explore" && activeExploreTab === "studio";

	// Determine Visibility based on AI Level
	// Standby (silent): Title, Description, Essential Content
	// Wingman (guide): + Suggestions
	// Guru (teacher): + Concepts

	const showSuggestions = aiLevel === "guide" || aiLevel === "teacher";
	const showConcepts = aiLevel === "teacher";

	return (
		<div
			className={`h-full w-[320px] border-l border-glass-stroke flex flex-col overflow-hidden relative transition-all duration-200 ${
				isEditing ? "z-[100]" : "z-40"
			}`}
		>
			{/* Detached Background Layer (avoids trapping fixed children) */}
			<div className="absolute inset-0 bg-bg-void/50 backdrop-blur-md -z-10" />

			{/* Global Interaction Lock (Covers Main App) - Escapes to Viewport */}
			{isEditing && (
				<div className="fixed inset-0 z-[50] bg-black/20 cursor-default" />
			)}

			{/* Local Interaction Lock (Covers Inactive Sidebar) */}
			{isEditing && (
				<div className="absolute inset-0 z-[90] bg-transparent cursor-default" />
			)}

			{/* Header / Mode Indicator */}
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
							{aiLevel === "teacher"
								? "Guru Mode"
								: aiLevel === "guide"
								? "Wingman Mode"
								: "Standby Mode"}
						</h3>
					</div>
				</div>
			</div>

			{/* Content Scroll Area */}
			<div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
				{/* 1. HEADER (Always Visible) */}
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

				{/* 2. INSPECTED COLOR CARD (Libraries) */}
				{selectedInsightColor && (
					<div className="pt-4 border-t border-white/5">
						<div className="pt-4 border-t border-white/5">
							<InspectedColorCard
								color={
									settings.library?.colors?.find(
										(c: string | PresetColor) => {
											const hex =
												typeof c === "string"
													? c
													: c.value;
											return (
												hex.toUpperCase() ===
												selectedInsightColor.value.toUpperCase()
											);
										}
									) || selectedInsightColor
								}
								onUpdate={updateFavoriteColor}
								onToggleFavorite={() =>
									toggleFavoriteColor(
										selectedInsightColor.value
									)
								}
								isFavorite={
									settings.library?.colors?.some(
										(c: string | PresetColor) => {
											const hex =
												typeof c === "string"
													? c
													: c.value;
											return (
												hex.toUpperCase() ===
												selectedInsightColor.value.toUpperCase()
											);
										}
									) || false
								}
								isEditing={isEditing}
								setIsEditing={setIsEditing}
							/>
						</div>
					</div>
				)}

				{/* 3. ESSENTIAL CONTENT (Controls) */}
				{showColorControls && seedColor && setSeedColor && (
					<div className="pt-4 border-t border-white/5">
						<ColorControlPanel
							seedColor={seedColor}
							setSeedColor={setSeedColor}
							secondaryColor={secondaryColor || "#000000"}
							tertiaryColor={tertiaryColor || "#000000"}
							harmonyMode={harmonyMode}
							settings={settings}
							updateSettings={updateSettings}
							toggleFavorite={toggleFavoriteColor}
						/>
					</div>
				)}

				{/* 4. SUGGESTIONS (Wingman & Guru Only) */}
				{showSuggestions &&
					content.suggestions &&
					content.suggestions.length > 0 && (
						<div className="pt-4 border-t border-white/5 space-y-4">
							<h4 className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-widest">
								<Lightbulb
									size={14}
									className="text-yellow-400"
								/>
								{aiLevel === "teacher"
									? "Expert Tips"
									: "Suggestions"}
							</h4>
							{content.suggestions.map(
								(suggestion: any, i: number) => (
									<div
										key={i}
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
								)
							)}
						</div>
					)}

				{/* 5. CONCEPTS (Guru Only) */}
				{showConcepts &&
					content.concepts &&
					content.concepts.length > 0 && (
						<div className="pt-4 border-t border-white/5 space-y-4">
							<h4 className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-widest">
								<BookOpen
									size={14}
									className="text-accent-cyan"
								/>
								Key Concepts
							</h4>
							<div className="bg-bg-raised/50 rounded-xl p-4 border border-glass-stroke space-y-3">
								{content.concepts.map(
									(concept: string, i: number) => (
										<div
											key={i}
											className="flex gap-3 items-start"
										>
											<span className="text-accent-cyan font-bold text-sm">
												{i + 1}.
											</span>
											<p className="text-sm text-gray-300">
												{concept}
											</p>
										</div>
									)
								)}
							</div>
						</div>
					)}
			</div>
		</div>
	);
};

// --- Educational Content Mapping ---
const getContentForView = (
	view: string,
	_colorStep?: string,
	_colorTab?: string,
	_typeTab?: string,
	_tokensModule?: string,
	exploreTab?: string,
	_selectedColor?: any
) => {
	// Handle Explore View
	if (view === "explore") {
		if (exploreTab === "colors") {
			return {
				lessonId: "00.1",
				title: "Color Library",
				description:
					"This is your collection of saved colors. Think of it as your palette box.",
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
			// NOTE: This title aligns with 'Color Studio' controls
			return {
				lessonId: "00.6",
				title: "Color Studio",
				description: "Create custom colors with precision controls.",
				concepts: [
					"Use Hue, Saturation, and Lightness for intuitive mixing.",
					"See real-time harmony suggestions on the wheel.",
				],
				suggestions: [
					{
						title: "Harmony Handles",
						text: "Drag the main handle and watch the smaller harmony handles follow automatically.",
					},
				],
			};
		}
		if (exploreTab === "remix") {
			return {
				lessonId: "00.5",
				title: "Palette Remix",
				description: "Let algorithms find the perfect colors for you.",
				concepts: [
					"Lock colors you like to keep them while regenerating others.",
					"Iterate quickly to find unexpected combinations.",
				],
				suggestions: [
					{
						title: "Lock and Roll",
						text: "Lock a nice accent color and generate options around it.",
					},
				],
			};
		}
	}

	// Default Fallback
	return {
		lessonId: "00.0",
		title: "Soloist Assistant",
		description: "Select a tool to see context and controls.",
		concepts: [],
		suggestions: [],
	};
};

// --- Subcomponents ---

const InspectedColorCard = ({
	color,
	onUpdate,
	onToggleFavorite,
	isFavorite,
	isEditing,
	setIsEditing,
}: {
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
}) => {
	const isDark = colord(color.value).isDark();
	// Lifted isEditing state
	const [editName, setEditName] = useState(color.name);
	const [editDesc, setEditDesc] = useState(color.description || "");
	const [editMeaning, setEditMeaning] = useState(color.meaning || "");
	const [editUsage, setEditUsage] = useState(color.usage || "");
	const [copied, setCopied] = useState(false);

	// Sync local state when selected color changes
	useEffect(() => {
		setEditName(color.name);
		setEditDesc(color.description || "");
		setEditMeaning(color.meaning || "");
		setEditUsage(color.usage || "");
		setIsEditing(false); // Reset edit mode on color switch
	}, [color]);

	const handleSave = () => {
		onUpdate(color.value, editName, editDesc, editMeaning, editUsage);
		setIsEditing(false);
	};

	const handleCancel = () => {
		setEditName(color.name);
		setEditDesc(color.description || "");
		setEditMeaning(color.meaning || "");
		setEditUsage(color.usage || "");
		setIsEditing(false);
	};

	const handleCopy = () => {
		navigator.clipboard.writeText(color.value.toUpperCase());
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<div className="space-y-3">
			{/* Color Swatch */}
			<div
				className={`relative rounded-xl overflow-hidden aspect-[4/3] shadow-sm border ${
					isDark ? "border-white/40" : "border-black/20"
				}`}
			>
				<div
					className="absolute inset-0"
					style={{ backgroundColor: color.value }}
				/>
				{/* Static Label (Hidden in Edit Mode if overlay covers it, but here we overlay inputs later or below) */}
				{/* Let's keep the swatch clean and put edit controls below? Or overlay?
		    The previous design had overlay. Let's stick to overlay for the swatch part if we edit name there,
		    BUT the component splits Name into the swatch overlay and Description below.
		    Let's make the WHOLE container editable or just the fields.

		    Actually, the user asked to move inline editing to right sidebar where name and description are displayed.
		    Currently InspectedColorCard displays name over the swatch and description below.

		    Let's make the Name and Description fields turn into inputs when "Edit" is clicked.
		*/}

				{/* Header Actions */}
				{/* Header Actions */}
				<div className="absolute top-2 right-2 flex gap-1 z-[100]">
					{!isEditing ? (
						<>
							{isFavorite && (
								<button
									onClick={() => setIsEditing(true)}
									className="p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors backdrop-blur-sm"
									title="Edit Details"
								>
									<Pencil size={12} />
								</button>
							)}

							<button
								onClick={handleCopy}
								className="p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors backdrop-blur-sm"
								title="Copy Hex"
							>
								{copied ? (
									<Check
										size={12}
										className="text-green-500"
									/>
								) : (
									<Copy size={12} />
								)}
							</button>

							<button
								onClick={onToggleFavorite}
								className="p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors backdrop-blur-sm"
								title={
									isFavorite
										? "Remove from Favorites"
										: "Save to Favorites"
								}
							>
								<Heart
									size={12}
									className={isFavorite ? "fill-red-500" : ""}
								/>
							</button>
						</>
					) : (
						<>
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
						</>
					)}
				</div>

				<div
					className={`absolute inset-0 p-3 flex flex-col justify-end pointer-events-none ${
						isDark ? "text-white/90" : "text-black/80"
					}`}
				>
					{isEditing ? (
						<div className="pointer-events-auto mb-1 relative z-[100]">
							<input
								type="text"
								value={editName}
								onChange={(e) => setEditName(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										e.preventDefault();
										// Move focus to description
										const descInput =
											e.currentTarget.parentElement?.parentElement?.parentElement?.querySelector(
												"textarea"
											) as HTMLTextAreaElement;
										if (descInput) descInput.focus();
									} else if (e.key === "Escape") {
										handleCancel();
									}
								}}
								className="bg-black/40 backdrop-blur-md border border-white/20 rounded px-2 py-1 text-xs font-bold font-brand text-white w-full focus:outline-none focus:border-accent-cyan placeholder-white/50"
								placeholder="Color Name"
								autoFocus
							/>
						</div>
					) : (
						<span className="text-xs font-bold uppercase opacity-70 tracking-wider mb-0.5">
							{color.name}
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
							value={editDesc}
							onChange={(e) => setEditDesc(e.target.value)}
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
							"Power",
							"Mystery",
							"Action",
							"Caution",
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
							"Highlights",
							"Alerts",
							"Success States",
							"Error States",
							"Accents",
							"Cards",
						]}
					/>
				</div>
			</div>
		</div>
	);
};

const TagDisplayEdit = ({
	label,
	value,
	onChange,
	isEditing,
	suggestions = [],
}: {
	label: string;
	value: string;
	onChange: (val: string) => void;
	isEditing: boolean;
	suggestions?: string[];
}) => {
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
				{tags.map((tag, i) => (
					<span
						key={i}
						className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent-cyan/20 text-[10px] text-accent-cyan border border-accent-cyan/30 group cursor-pointer hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 transition-colors"
						onClick={() => removeTag(tag)}
					>
						{tag}
						<X size={8} className="opacity-50" />
					</span>
				))}

				{/* Ghost Pills (Suggestions) */}
				{unselectedSuggestions.map((tag, i) => (
					<button
						key={`ghost-${i}`}
						onClick={() => addTag(tag)}
						className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] text-gray-500 border border-white/5 hover:bg-white/10 hover:text-gray-300 hover:border-white/10 transition-colors"
					>
						+ {tag}
					</button>
				))}

				{/* Create New Pill / Input */}
				{isCreating ? (
					<div className="relative flex items-center min-w-[60px]">
						<input
							type="text"
							value={inputValue}
							onChange={(e) => setInputValue(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter" && inputValue.trim()) {
									e.preventDefault();
									addTag(inputValue.trim());
								} else if (e.key === "Escape") {
									setIsCreating(false);
									setInputValue("");
								}
							}}
							onBlur={() => {
								if (inputValue.trim()) {
									addTag(inputValue.trim());
								} else {
									setIsCreating(false);
								}
							}}
							autoFocus
							placeholder="Type tag..."
							className="bg-transparent border-b border-accent-cyan text-[10px] text-white focus:outline-none w-20 px-1 pb-0.5 placeholder-white/30"
						/>
					</div>
				) : (
					<button
						onClick={() => setIsCreating(true)}
						className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] text-gray-500 border border-white/5 hover:bg-white/10 hover:text-gray-300 hover:border-white/10 transition-colors"
					>
						+ Create New
					</button>
				)}
			</div>
		</div>
	);
};
